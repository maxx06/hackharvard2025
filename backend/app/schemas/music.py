from pydantic import BaseModel, Field

class MusicGenerationRequest(BaseModel):
    prompt: str = Field(
        ...,
        description="Description of the music to generate",
        example="hiphop style, quick tempo, drums, guitar"
    )
    duration_ms: int = Field(
        default=10000,
        ge=1000,
        le=60000,
        description="Duration in milliseconds (1000-60000ms)"
    )

class MusicGenerationResponse(BaseModel):
    message: str
    audio_url: str = None
