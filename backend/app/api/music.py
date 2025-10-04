from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.music import MusicGenerationRequest
from app.services.music_service import music_service
import io

router = APIRouter()

@router.post("/generate")
async def generate_music(request: MusicGenerationRequest):
    """
    Generate music based on text prompt

    Example prompt: "hiphop style, quick tempo, drums, guitar"
    """
    try:
        audio_bytes = await music_service.generate_music(
            prompt=request.prompt,
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
