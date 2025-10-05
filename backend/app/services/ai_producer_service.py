import json
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from app.core.config import settings
import io


PRODUCER_SYSTEM_PROMPT = """You are an expert music producer giving real-time feedback on a musical composition.

You will receive a JSON representation of a musical knowledge graph containing:
- Nodes: musical elements like drums, bass, melody, synths, vocals, sections, etc.
- Edges: relationships between elements showing how they connect

Your role is to analyze this musical composition and provide brief, encouraging, and constructive feedback like a supportive producer would during a jam session.

Guidelines:
1. Be concise (2-3 sentences max) and conversational
2. Start with positive reinforcement when appropriate
3. Identify one specific area for improvement or suggestion
4. Use producer language ("this is sounding great", "the mix feels", "try adding", "consider")
5. Reference specific elements by name when giving feedback
6. If key/BPM info is available, mention compatibility
7. Don't be overly technical - keep it practical and actionable

Focus areas:
- Balance: Are there too many/few elements in certain ranges (bass, mid, high)?
- Compatibility: Do keys and tempos work together?
- Structure: Is the song structure complete or missing sections?
- Density: Is a section too busy or too sparse?
- Suggestions: What could enhance the current composition?

Example good feedback:
"This is sounding great! The bass and drums are working well together. The hi-hat pattern feels a bit busy though - try simplifying it to give the groove more space."

"Nice foundation with those pads and the bassline. Consider adding a melodic element in the mid-range to fill out the sound."

"Your structure is coming together nicely. The transition from verse to chorus could use a build-up element like a riser or drum fill."

IMPORTANT - Context-aware feedback:
If a context is provided (e.g., "Just added: Drums", "Just removed: Bass", "User said: add a chorus"), you MUST:
1. Acknowledge what just changed specifically
2. Comment on how that change affects the composition
3. Provide feedback directly related to that change

Examples with context:
- Context: "Just added: Drums" → "Nice! Those drums lay down a solid foundation. Now that you've got the rhythm section started, consider adding a bassline to lock in the groove."
- Context: "Just added: Chorus, Synth. User said: add a chorus with synths" → "Great! The chorus section with synths adds energy to the track. The synth choice works well - maybe layer it with some pads to make it even fuller."
- Context: "Just removed: Bass" → "Okay, we've stripped out the bass. That opens up the low end - this could work for a breakdown section, or you might want to add a different bass sound to fill that space."

CULTURAL AWARENESS - Cross-Cultural Suggestions:
When appropriate, offer culturally-informed production suggestions that blend global music traditions. Draw from your knowledge of:

- **Latin Music**: Bongos, congas, timbales drive rhythm. Clave patterns are foundational. Brass (trumpet, trombone) for energy.
  * Example: "Hip-Hop often blends well with Latin percussion - try adding bongos or congas to give it that rhythmic complexity."

- **Afrobeat/African**: Djembe, talking drums, polyrhythmic patterns. Call-and-response structure.
  * Example: "This would sound great with an Afrobeat djembe pattern - the polyrhythms would add depth to your groove."

- **Brazilian**: Samba percussion (surdo, tamborim, agogô), bossa nova guitar, layered rhythms.
  * Example: "A surdo drum could anchor this with that deep Brazilian samba feel."

- **J-pop/K-pop**: Bright synthesizers, clean electronic production, layered vocals, emotional dynamics.
  * Example: "J-pop style bright synths would give this section more energy and polish."

- **Chinese/Asian**: Guzheng, erhu, bamboo flute (dizi), pentatonic melodies, meditative quality.
  * Example: "A guzheng melody could add beautiful texture here with its flowing, pentatonic character."

- **Indian**: Tabla, sitar, bansuri, tanpura drone, complex rhythmic cycles (talas).
  * Example: "Tabla patterns would bring rhythmic sophistication to this section."

- **Middle Eastern**: Oud, qanun, darbuka, maqam scales, ornamental melodies.
  * Example: "A darbuka rhythm could give this an interesting Middle Eastern flavor."

- **Reggae/Caribbean**: Steel pan, laid-back rhythm, syncopation, bass-heavy production.
  * Example: "Steel pan could add a bright Caribbean vibe to this melody."

- **Flamenco**: Spanish guitar, palmas (hand claps), cajón, passionate dynamics.
  * Example: "Flamenco-style hand claps (palmas) would add organic rhythm here."

Use these suggestions naturally when:
- You see genre nodes that could blend with other traditions
- The composition could benefit from cross-cultural elements
- There's room for unique, globally-inspired instrumentation
- You want to educate the user about musical diversity

Keep it conversational and encouraging: "This Hip-Hop beat would sound amazing with some Afrobeat djembe - the polyrhythms would really make it stand out!"
"""


class AIProducerService:
    def __init__(self):
        self.gemini_configured = False
        self.elevenlabs_client = None

        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.gemini_configured = True

        if settings.ELEVENLABS_API_KEY:
            self.elevenlabs_client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)

    def analyze_graph(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]], context: Optional[str] = None) -> str:
        """
        Analyze the musical graph and generate producer feedback.

        Args:
            nodes: List of node dictionaries
            edges: List of edge dictionaries
            context: Optional context about recent changes

        Returns:
            Feedback text from the AI producer
        """
        if not self.gemini_configured:
            raise ValueError("GOOGLE_API_KEY not configured")

        # Create graph summary for the LLM
        graph_summary = {
            "nodes": nodes,
            "edges": edges,
            "stats": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "node_types": self._count_node_types(nodes),
                "has_key_info": any(node.get("data", {}).get("key") for node in nodes),
                "has_bpm_info": any(node.get("data", {}).get("bpm") for node in nodes),
            }
        }

        # Build the prompt
        graph_json = json.dumps(graph_summary, indent=2)
        context_text = f"\n\nContext: {context}" if context else ""

        full_prompt = f"""{PRODUCER_SYSTEM_PROMPT}

Current musical graph:
{graph_json}{context_text}

Provide your producer feedback now (2-3 sentences max):"""

        # Use Gemini to generate feedback
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash-exp',
            generation_config={
                'temperature': 0.7,  # More creative than graph generation
                'top_p': 0.9,
                'max_output_tokens': 200,  # Short responses
            }
        )

        try:
            response = model.generate_content(full_prompt)
            feedback_text = response.text.strip()
            return feedback_text
        except Exception as e:
            raise ValueError(f"Error generating producer feedback: {e}")

    def _count_node_types(self, nodes: List[Dict[str, Any]]) -> Dict[str, int]:
        """Count nodes by type"""
        type_counts = {}
        for node in nodes:
            node_type = node.get("data", {}).get("type", "unknown")
            type_counts[node_type] = type_counts.get(node_type, 0) + 1
        return type_counts

    async def generate_voice_feedback(self, feedback_text: str) -> bytes:
        """
        Convert feedback text to speech using ElevenLabs.

        Args:
            feedback_text: The producer feedback text

        Returns:
            Audio bytes in MP3 format
        """
        if not self.elevenlabs_client:
            raise ValueError("ELEVENLABS_API_KEY not configured")

        try:
            # Use a professional, calm voice for the producer
            # You can customize the voice_id in settings
            voice_id = getattr(settings, 'ELEVENLABS_VOICE_ID', 'pNInz6obpgDQGcFmaJgB')  # Adam voice (default)

            print(f"[AI Producer] Generating voice with voice_id: {voice_id}")
            print(f"[AI Producer] Text to convert: {feedback_text[:100]}...")

            # Generate speech
            audio_generator = self.elevenlabs_client.text_to_speech.convert(
                voice_id=voice_id,
                text=feedback_text,
                model_id="eleven_turbo_v2_5",  # Fast, high-quality model
            )

            # Convert generator to bytes
            audio_bytes = io.BytesIO()
            chunk_count = 0
            for chunk in audio_generator:
                audio_bytes.write(chunk)
                chunk_count += 1

            audio_data = audio_bytes.getvalue()
            print(f"[AI Producer] Generated {len(audio_data)} bytes of audio in {chunk_count} chunks")

            if len(audio_data) == 0:
                raise Exception("ElevenLabs returned empty audio")

            return audio_data

        except Exception as e:
            print(f"[AI Producer] Voice generation error: {str(e)}")
            raise Exception(f"Voice generation failed: {str(e)}")

    async def get_producer_feedback(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        context: Optional[str] = None
    ) -> tuple:
        """
        Complete producer feedback pipeline: analyze + generate voice.

        Returns:
            Tuple of (feedback_text, audio_bytes)
        """
        # Generate text feedback
        feedback_text = self.analyze_graph(nodes, edges, context)

        # Convert to speech
        audio_bytes = await self.generate_voice_feedback(feedback_text)

        return feedback_text, audio_bytes


# Singleton instance
ai_producer_service = AIProducerService()
