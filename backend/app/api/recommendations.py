from fastapi import APIRouter, HTTPException
from app.schemas.recommendations import RecommendationRequest, RecommendationsResponse, InstrumentRecommendation
from app.services.recommendation_service import recommendation_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/generate", response_model=RecommendationsResponse)
async def generate_recommendations(request: RecommendationRequest):
    """
    Generate LLM-powered instrument recommendations based on the current graph.

    Uses Gemini to analyze the composition and suggest culturally-appropriate
    instruments with explanations for why each instrument would enhance the music.
    """
    try:
        logger.info(f"Generating recommendations for graph with {len(request.nodes)} nodes, {len(request.edges)} edges")

        # Generate recommendations using LLM
        recommendations_data = recommendation_service.generate_recommendations(
            nodes=request.nodes,
            edges=request.edges
        )

        # Convert to Pydantic models
        recommendations = [
            InstrumentRecommendation(**rec) for rec in recommendations_data
        ]

        logger.info(f"Generated {len(recommendations)} recommendations")

        return RecommendationsResponse(recommendations=recommendations)

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Internal error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
