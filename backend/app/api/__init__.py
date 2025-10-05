from fastapi import APIRouter
from app.api import music, graph, producer, recommendations

router = APIRouter()

router.include_router(music.router, prefix="/music", tags=["music"])
router.include_router(graph.router, prefix="/graph", tags=["graph"])
router.include_router(producer.router, prefix="/producer", tags=["producer"])
router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])

@router.get("/")
async def api_root():
    return {"message": "API v1"}
