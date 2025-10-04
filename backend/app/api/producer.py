from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from app.schemas.producer import ProducerAnalysisRequest, ProducerAnalysisResponse
from app.services.ai_producer_service import ai_producer_service
import io
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze")
async def analyze_composition(request: ProducerAnalysisRequest):
    """
    Analyze the current musical composition and get AI producer feedback.

    Returns streaming audio response with producer's voice feedback.
    """
    try:
        logger.info(f"Producer analyze request: {len(request.nodes)} nodes, {len(request.edges)} edges")

        # Get feedback text and audio
        feedback_text, audio_bytes = await ai_producer_service.get_producer_feedback(
            nodes=request.nodes,
            edges=request.edges,
            context=request.context
        )

        logger.info(f"Generated feedback: {feedback_text[:100]}...")

        # Return audio as streaming response
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "X-Feedback-Text": feedback_text,  # Include text in header for debugging/display
                "Content-Disposition": "inline; filename=producer_feedback.mp3"
            }
        )
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Internal error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/analyze-text", response_model=ProducerAnalysisResponse)
async def analyze_composition_text(request: ProducerAnalysisRequest):
    """
    Get text-only producer feedback without voice generation.
    Useful for testing or when audio is not needed.
    """
    try:
        feedback_text = ai_producer_service.analyze_graph(
            nodes=request.nodes,
            edges=request.edges,
            context=request.context
        )

        return ProducerAnalysisResponse(
            feedback_text=feedback_text,
            audio_available=False
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
