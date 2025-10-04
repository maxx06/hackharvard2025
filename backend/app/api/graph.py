from fastapi import APIRouter, HTTPException
from app.schemas.graph import GraphUpdateRequest, GraphCommandsResponse
from app.services.graph_llm_service import get_graph_commands_async

router = APIRouter()

@router.post("/update", response_model=GraphCommandsResponse)
async def update_graph(request: GraphUpdateRequest):
    """
    Generate graph update commands based on natural language input.
    
    Takes the current graph state and a natural language instruction,
    and returns structured commands to update the graph incrementally.
    """
    try:
        commands = await get_graph_commands_async(
            request.current_graph,
            request.instruction
        )
        return commands
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

