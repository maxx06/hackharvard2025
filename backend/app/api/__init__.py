from fastapi import APIRouter
from app.api import music

router = APIRouter()

router.include_router(music.router, prefix="/music", tags=["music"])

@router.get("/")
async def api_root():
    return {"message": "API v1"}
