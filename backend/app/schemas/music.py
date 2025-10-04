from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class MusicGenerationRequest(BaseModel):
    prompt: Optional[str] = Field(
        None,
        description="Description of the music to generate (deprecated - use graph_data)",
        example="hiphop style, quick tempo, drums, guitar"
    )
    graph_data: Optional[Dict[str, Any]] = Field(
        None,
        description="Graph structure with nodes and edges to convert to music"
    )
    duration_ms: int = Field(
        default=10000,
        ge=1000,
        le=120000,
        description="Duration in milliseconds (1000-120000ms)"
    )

class MusicGenerationResponse(BaseModel):
    message: str
    audio_url: str = None
