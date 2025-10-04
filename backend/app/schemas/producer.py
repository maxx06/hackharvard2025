from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class ProducerAnalysisRequest(BaseModel):
    """Request for AI producer analysis"""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    context: Optional[str] = None  # Optional context like "just added drums"


class ProducerAnalysisResponse(BaseModel):
    """Response containing producer feedback"""
    feedback_text: str
    audio_available: bool = True
