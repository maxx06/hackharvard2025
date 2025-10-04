import json
from typing import Dict, Any
import google.generativeai as genai
from app.core.config import settings
from app.schemas.graph import CurrentGraph, GraphCommandsResponse

SYSTEM_PROMPT = """You are an assistant that updates a music collaboration diagram.
You receive:
- The current graph JSON (nodes and edges)
- A new natural language instruction

You must output ONLY structured JSON commands, never prose.

Supported commands:
- createNode: add a new node with id, label, type, and position
  - Node types: "section", "drum", "bassline", "melody", "chord", "synth", "vocal", "fx", "genre"
  - Position: { "x": number, "y": number } - distribute nodes spatially to avoid overlap
  - Additional optional fields: key (musical key like "C", "Am"), bpm (tempo), section (for structure mode)

- connectNodes: link nodes with a relation (creates directed edges)
  - Relations: "next" (sequence), "after" (temporal order), "plays-in" (belongs to), "has-mood" (mood association), "blends-with" (harmonic), "influences" (genre)
  - Use relation field to describe the connection type
  - Direction matters: source → target shows the flow/order

- deleteById: remove a node or edge by ID
  - Provide the exact id of the node or edge to delete

- updateNode: modify an existing node's properties (IMPORTANT: Use deleteById + createNode pattern)
  - When user edits a node label/type/key/bpm, delete the old node and create a new one with same ID
  - This ensures all edges remain connected
  - Example: To rename "Drums" to "Kick", do deleteById("drums-1") then createNode with id="drums-1" and label="Kick"

Return format:
{"commands": [
  {
    "action": "createNode",
    "params": {
      "id": "unique-id",
      "label": "Display Name",
      "type": "section",
      "position": {"x": 400, "y": 100},
      "key": "C",
      "bpm": 120
    }
  },
  {
    "action": "connectNodes",
    "params": {
      "source": "node-id-1",
      "target": "node-id-2",
      "relation": "next"
    }
  }
]}

CRITICAL EDGE CREATION RULES:

1. Create edges in these scenarios:

   A) SONG STRUCTURE (sections: intro, verse, chorus, bridge, outro)
      - Connect sections in sequence with "next" relation
      - Example: intro → verse → chorus → bridge → outro

   B) SECTION-TO-INSTRUMENT relationships
      - When user says "intro with pads" or "verse has drums"
      - Use "has" relation: intro → pads, verse → drums
      - Section points to its instruments/elements

   C) EXPLICIT CONNECTIONS
      - When user says "connect X to Y" or "X goes with Y"
      - Choose appropriate relation type

2. Edge Relation Types (choose the right one):
   - "next": Sequential flow between sections (intro→verse→chorus)
   - "has": Section contains instruments (intro→pads, verse→drums, chorus→synth)
   - "blends-with": Harmonic relationship (melody↔chords, synth↔pads)
   - "supports": Rhythm section supporting other elements (bass→drums)
   - "influences": Genre or mood affecting elements (house→synth, dark→pads)

3. When NOT to create edges:
   ❌ User just lists instruments: "drums bass melody" → NO edges between them
   ❌ User adds standalone element: "add a synth" → NO edge (unless they say where)
   ❌ Generic additions without context

4. Edge Direction Rules:
   - Sections: Always left-to-right (intro → verse → chorus)
   - Section to instruments: Section → Instrument (intro → pads, verse → drums)
   - Harmonic blends: Bidirectional implied, choose source → target logically
   - Rhythm support: Supporting element → Main element (bass → drums)

5. Examples:

   "Intro with pads, verse with drums and bass, then chorus"
   → Nodes: intro (section), pads, verse (section), drums, bass, chorus (section)
   → Edges:
     * intro → verse (relation: "next")
     * verse → chorus (relation: "next")
     * intro → pads (relation: "has")
     * verse → drums (relation: "has")
     * verse → bass (relation: "has")

   "Add chorus after verse"
   → Node: chorus (section)
   → Edge: verse → chorus (relation: "next")

   "Add synth that plays in the chorus"
   → Node: synth
   → Edge: chorus → synth (relation: "has")

   "Add drums and bass" (no context)
   → Nodes: drums, bass
   → Edges: NONE (no relationship specified)

   "Connect the melody to the chorus"
   → Edge: chorus → melody (relation: "has")

   "Bass supports the drums"
   → Edge: bass → drums (relation: "supports")

Important rules:
1. Generate unique IDs for new nodes (use descriptive names like "intro", "chorus", "bass-1", "pad-1", "piano-1", etc.)
2. Calculate positions to distribute nodes spatially - spread them out (increment x by 200-400, y by 150-200)
3. ONLY connect section nodes, NEVER connect instrument/element nodes
4. When adding instruments, position them below or around section nodes but DON'T connect them
5. For incremental updates, only create/modify what's mentioned in the instruction
6. Preserve existing graph structure unless explicitly asked to change it
7. TEMPORAL/SEQUENTIAL KEYWORDS for SECTIONS ONLY: "after", "before", "then", "next", "following"
8. Use existing node IDs from the current graph when making connections
9. When instruction says "Update node: renamed X to Y", find the node with label X and use deleteById + createNode with same ID but new label
10. For node updates, preserve all edges - they will automatically reconnect to the node with same ID"""

def get_graph_commands(current_graph: Dict[str, Any], new_text: str) -> Dict[str, Any]:
    """
    Uses Gemini LLM to generate graph update commands based on natural language input.
    
    Args:
        current_graph: Dict with 'nodes' and 'edges' lists
        new_text: Natural language instruction from user
        
    Returns:
        Dict with 'commands' list containing graph update actions
    """
    if not settings.GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY not configured")
    
    # Configure Gemini
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    
    # Use Gemini 2.0 Flash for fast responses
    model = genai.GenerativeModel(
        model_name='gemini-2.0-flash-exp',
        generation_config={
            'temperature': 0.1,
            'top_p': 0.95,
            'top_k': 40,
            'max_output_tokens': 2048,
        }
    )
    
    # Format the current graph for the LLM
    graph_json = json.dumps(current_graph, indent=2)
    
    # Combine system prompt and user message for Gemini
    full_prompt = f"""{SYSTEM_PROMPT}

Current graph:
{graph_json}

Instruction:
{new_text}

Return updated commands in JSON only."""
    
    try:
        # Generate response
        response = model.generate_content(full_prompt)
        
        # Extract the response text
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        commands_data = json.loads(response_text)
        
        # Validate the response structure
        if "commands" not in commands_data:
            raise ValueError("Response missing 'commands' field")
        
        return commands_data
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse LLM response as JSON: {e}")
    except Exception as e:
        raise ValueError(f"Error calling LLM: {e}")


async def get_graph_commands_async(current_graph: CurrentGraph, instruction: str) -> GraphCommandsResponse:
    """
    Async wrapper for get_graph_commands that works with Pydantic models.

    Args:
        current_graph: Current graph state as Pydantic model
        instruction: Natural language instruction

    Returns:
        GraphCommandsResponse with list of commands
    """
    # Convert Pydantic models to dicts
    graph_dict = current_graph.model_dump()

    # Call the LLM
    commands_dict = get_graph_commands(graph_dict, instruction)

    # Validate and return as Pydantic model
    return GraphCommandsResponse(**commands_dict)


def graph_to_music_prompt(graph_data: Dict[str, Any]) -> str:
    """
    Convert a musical knowledge graph into a detailed text prompt for music generation.

    Builds on the existing graph structure understanding from SYSTEM_PROMPT to create
    rich, detailed prompts that describe the musical composition.

    Args:
        graph_data: Dict with 'nodes' and 'edges' lists

    Returns:
        Detailed text prompt describing the music to generate
    """
    nodes = graph_data.get('nodes', [])
    edges = graph_data.get('edges', [])

    if not nodes:
        return "Create ambient background music"

    # Categorize nodes by type
    sections = []
    instruments = []
    moods = []
    genres = []

    # Build node lookup and categorize
    node_map = {}
    for node in nodes:
        node_id = node.get('id')
        node_data = node.get('data', {})
        node_type = node_data.get('type', '')
        label = node_data.get('label', '')

        node_map[node_id] = node

        if node_type == 'section':
            sections.append(node)
        elif node_type in ['drum', 'bassline', 'melody', 'chord', 'synth', 'vocal', 'fx']:
            instruments.append(node)
        elif node_type == 'genre':
            genres.append(label)
        else:
            moods.append(label)

    # Build edge relationships
    section_sequence = []
    section_instruments = {}  # section_id -> list of instrument labels

    for edge in edges:
        source_id = edge.get('source')
        target_id = edge.get('target')
        relation = edge.get('data', {}).get('relation', '')

        source_node = node_map.get(source_id)
        target_node = node_map.get(target_id)

        if not source_node or not target_node:
            continue

        source_type = source_node.get('data', {}).get('type', '')
        target_type = target_node.get('data', {}).get('type', '')

        # Track section sequence (section -> section)
        if source_type == 'section' and target_type == 'section' and relation == 'next':
            section_sequence.append((source_node, target_node))

        # Track section -> instrument relationships
        if source_type == 'section' and relation == 'has':
            if source_id not in section_instruments:
                section_instruments[source_id] = []
            section_instruments[source_id].append(target_node.get('data', {}).get('label', ''))

    # Build the music prompt
    prompt_parts = []

    # Add genre/style if present
    if genres:
        prompt_parts.append(f"{', '.join(genres)} style")

    # Check if we have structured sections
    if section_sequence:
        # Structure mode: describe the flow
        prompt_parts.append("Track structure:")

        # Build ordered section flow
        visited = set()
        section_flow = []

        # Find first section (has outgoing but no incoming)
        incoming_sections = {edge[1].get('id') for edge in section_sequence}
        for sec_node in sections:
            if sec_node.get('id') not in incoming_sections:
                section_flow.append(sec_node)
                visited.add(sec_node.get('id'))
                break

        # Follow the sequence
        while len(section_flow) < len(sections):
            current_id = section_flow[-1].get('id')
            for source, target in section_sequence:
                if source.get('id') == current_id and target.get('id') not in visited:
                    section_flow.append(target)
                    visited.add(target.get('id'))
                    break
            else:
                break

        # Describe each section with its instruments
        for sec_node in section_flow:
            sec_id = sec_node.get('id')
            sec_label = sec_node.get('data', {}).get('label', '')
            sec_details = sec_node.get('data', {}).get('details', '')

            # Get detailed instrument descriptions
            detailed_instruments = []
            for inst_label in section_instruments.get(sec_id, []):
                # Find the instrument node to get its details
                inst_node = next((n for n in nodes if n.get('data', {}).get('label') == inst_label), None)
                if inst_node:
                    inst_details = inst_node.get('data', {}).get('details', '')
                    detailed_instruments.append(inst_details if inst_details else inst_label)
                else:
                    detailed_instruments.append(inst_label)

            # Build section description
            section_desc = sec_details if sec_details else sec_label
            if detailed_instruments:
                prompt_parts.append(f"{section_desc} with {', '.join(detailed_instruments)}")
            else:
                prompt_parts.append(section_desc)

    elif instruments:
        # Discovery mode: just list instruments with their properties
        instrument_descriptions = []
        for inst_node in instruments:
            inst_data = inst_node.get('data', {})
            inst_label = inst_data.get('label', '')
            inst_details = inst_data.get('details', '')
            inst_key = inst_data.get('key', '')
            inst_bpm = inst_data.get('bpm', '')

            # Use details if available, otherwise just the label
            if inst_details:
                desc = inst_details
            else:
                desc = inst_label

            if inst_key:
                desc += f" in {inst_key}"
            if inst_bpm:
                desc += f" at {inst_bpm} BPM"

            instrument_descriptions.append(desc)

        prompt_parts.append("featuring " + ", ".join(instrument_descriptions))

    # Add moods if present
    if moods:
        prompt_parts.append(f"with {', '.join(moods)} mood")

    # Extract BPM from any node that has it
    bpm_values = [node.get('data', {}).get('bpm') for node in nodes if node.get('data', {}).get('bpm')]
    if bpm_values:
        avg_bpm = int(sum(bpm_values) / len(bpm_values))
        prompt_parts.append(f"tempo around {avg_bpm} BPM")

    # Join everything together
    final_prompt = ". ".join(prompt_parts)

    # Add production quality description
    final_prompt += ". High-quality production with clear separation between elements."

    return final_prompt

