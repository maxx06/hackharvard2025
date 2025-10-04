from fastapi import APIRouter
from app.api import music, graph

router = APIRouter()

router.include_router(music.router, prefix="/music", tags=["music"])
router.include_router(graph.router, prefix="/graph", tags=["graph"])

@router.get("/")
async def api_root():
    return {"message": "API v1"}
