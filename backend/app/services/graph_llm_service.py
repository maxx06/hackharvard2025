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

Important rules:
1. Generate unique IDs for new nodes (use descriptive names like "intro", "chorus", "bass-1", "pad-1", "piano-1", etc.)
2. Calculate positions to distribute nodes spatially - spread them out (increment x by 200-400, y by 150-200)
3. Connect related nodes logically with directed edges
4. When adding instruments to sections, position them below the section node
5. For incremental updates, only create/modify what's mentioned in the instruction
6. Preserve existing graph structure unless explicitly asked to change it
7. TEMPORAL/SEQUENTIAL KEYWORDS: Pay special attention to words like "after", "before", "then", "next", "following"
   - "add X after Y" → create X, then connectNodes from Y to X with relation "after" or "next"
   - "add X before Y" → create X, then connectNodes from X to Y
   - "X then Y" → connectNodes from X to Y
8. Always create directed edges (source → target) that show the flow, order, or hierarchy
9. Use existing node IDs from the current graph when making connections"""

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

