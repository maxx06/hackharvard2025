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

