from pydantic import BaseModel
from typing import List, Dict, Any


class RecommendationRequest(BaseModel):
    """Request for LLM-powered instrument recommendations"""
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


class InstrumentRecommendation(BaseModel):
    """Single instrument recommendation with LLM reasoning"""
    instrument_id: str
    instrument_name: str
    culture: str
    genre: str
    type: str  # drum, melody, bassline, synth, vocal, fx, chord
    reason: str  # LLM's explanation of why this instrument fits


class RecommendationsResponse(BaseModel):
    """Response containing LLM-generated recommendations"""
    recommendations: List[InstrumentRecommendation]
