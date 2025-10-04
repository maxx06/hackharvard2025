from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.music import MusicGenerationRequest
from app.services.music_service import music_service
from app.services.graph_llm_service import graph_to_music_prompt
import io

router = APIRouter()

@router.post("/generate")
async def generate_music(request: MusicGenerationRequest):
    """
    Generate music based on graph data or text prompt

    Accepts either:
    - graph_data: Knowledge graph structure (preferred)
    - prompt: Direct text prompt (fallback)
    """
    try:
        # Convert graph to prompt if graph_data is provided
        if request.graph_data:
            prompt = graph_to_music_prompt(request.graph_data)
            print(f"[Music API] Generated prompt from graph: {prompt}")
        elif request.prompt:
            prompt = request.prompt
        else:
            raise ValueError("Either graph_data or prompt must be provided")

        audio_bytes = await music_service.generate_music(
            prompt=prompt,
            duration_ms=request.duration_ms
        )

        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=generated_music.mp3"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
