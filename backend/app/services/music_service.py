from elevenlabs.client import ElevenLabs
from app.core.config import settings
import io

class MusicGenerationService:
    def __init__(self):
        self.client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)

    async def generate_music(self, prompt: str, duration_ms: int = 10000) -> bytes:
        """
        Generate music using ElevenLabs API

        Args:
            prompt: Text description of the music (e.g., "hiphop style, quick tempo, drums, guitar")
            duration_ms: Duration of the music in milliseconds (default: 10000ms = 10 seconds)

        Returns:
            Audio bytes
        """
        try:
            # Generate music using ElevenLabs
            track = self.client.music.compose(
                prompt=prompt,
                music_length_ms=duration_ms,
            )

            # Convert generator to bytes
            audio_bytes = io.BytesIO()
            for chunk in track:
                audio_bytes.write(chunk)

            return audio_bytes.getvalue()

        except Exception as e:
            raise Exception(f"Music generation failed: {str(e)}")

music_service = MusicGenerationService()
