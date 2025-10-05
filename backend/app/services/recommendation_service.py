import json
from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings


# Import the full instrument database (we'll pass available instruments to the LLM)
AVAILABLE_INSTRUMENTS = """
Latin: Bongos, Congas, Timbales, Trumpet, Classical Guitar
African: Djembe, Talking Drum, Balafon, Kora
Brazilian: Surdo, Tamborim, Agogô, Cavaquinho
J-pop/K-pop: Bright Synth, Synth Pad, Vocoder
Chinese: Guzheng, Erhu, Dizi, Pipa
Indian: Tabla, Sitar, Bansuri, Tanpura
Middle Eastern: Oud, Darbuka, Qanun, Ney
Caribbean: Steel Pan, Reggae Bass
Spanish: Flamenco Guitar, Palmas, Cajón
Electronic: Dubstep Bass, House Piano, Trance Lead
Urban/Hip-Hop: 808 Bass, Vinyl Scratch, Trap Hi-hat
"""

AVAILABLE_GENRES = """
Latin: Salsa, Merengue, Bachata, Mambo, Bolero, Latin Jazz, Mariachi, Bossa Nova
African: Afrobeat, Highlife, Soukous, Afro-Jazz, Tribal, Griot
Brazilian: Samba, Pagode, Forró, Choro, MPB, Batucada
Asian: J-pop, K-pop, C-Pop, City Pop, Vaporwave, Bollywood, Bhangra
Chinese: Traditional Chinese, Classical Chinese, Contemporary Chinese
Indian: Classical Indian, Raga, Carnatic, Hindustani, Devotional
Middle Eastern: Arabic, Turkish, Persian, Sufi, Andalusian, Belly Dance
Caribbean: Reggae, Calypso, Soca, Dub, Dancehall, Ska
Spanish: Flamenco, Rumba, Sevillanas
Electronic: EDM, House, Techno, Trance, Dubstep, Future Bass, Synthwave
Hip-Hop/Urban: Hip-Hop, Trap, R&B, Drill, Turntablism
World: World Music, Fusion, Ambient, Cinematic
"""

RECOMMENDATION_PROMPT = """You are an expert music producer and ethnomusicologist who specializes in global music traditions and cross-cultural fusion.

Your task is to analyze a musical composition graph and recommend 6-8 culturally-appropriate instruments that would enhance the composition.

AVAILABLE INSTRUMENTS BY CULTURE:
{instruments}

AVAILABLE GENRES:
{genres}

CURRENT COMPOSITION:
Nodes: {nodes_json}
Edges: {edges_json}

Existing instruments: {existing_instruments}
Existing genres: {existing_genres}

RECOMMENDATION GUIDELINES:
1. **Cross-Cultural Blending**: Suggest creative combinations (Hip-Hop + Afrobeat djembe, J-pop + Guzheng)
2. **Avoid Duplicates**: NEVER recommend instruments already in the graph
3. **Fill Musical Gaps**: If missing bass, recommend bass instruments. If missing melody, recommend melodic instruments
4. **Cultural Authenticity**: When specific genres are present, prioritize instruments from those traditions
5. **Educational Value**: Explain WHY each instrument fits and what it brings to the composition
6. **Diversity**: Include instruments from different cultures when appropriate

RECOMMENDATION REASONING:
- If graph has "Hip-Hop" → Consider Afrobeat percussion (djembe), Latin rhythm (congas), Asian fusion (guzheng)
- If graph has "J-pop" → Suggest bright synths, vocoders, electronic elements
- If graph has "Latin" → Recommend bongos, congas, brass, classical guitar
- If graph has basic drums/bass → Suggest melodic or harmonic elements to fill the mid/high range
- If graph is ambient/minimal → Suggest atmospheric instruments (guzheng, bansuri, synth pads)

OUTPUT FORMAT (JSON only, no other text):
{{
  "recommendations": [
    {{
      "instrument_id": "djembe",
      "instrument_name": "Djembe",
      "culture": "African",
      "genre": "Afrobeat, Hip-Hop, World Music",
      "type": "drum",
      "reason": "Adds authentic West African polyrhythmic depth to hip-hop grooves. The 'talking' quality of djembe creates conversational rhythms that blend perfectly with modern beats."
    }},
    {{
      "instrument_id": "guzheng",
      "instrument_name": "Guzheng",
      "culture": "Chinese",
      "genre": "Traditional, Ambient, C-Pop",
      "type": "melody",
      "reason": "Chinese pentatonic melodies create a unique East-meets-West fusion. The flowing, ethereal quality adds unexpected beauty and cultural depth."
    }}
  ]
}}

IMPORTANT:
- Return ONLY valid JSON, no markdown formatting
- Recommend 6-8 instruments maximum
- Each reason should be 1-2 sentences explaining the musical and cultural value
- Be specific and educational in your reasoning
- Prioritize instruments that create interesting cross-cultural blends
"""


class RecommendationService:
    def __init__(self):
        self.gemini_configured = False
        if settings.GOOGLE_API_KEY:
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self.gemini_configured = True

    def generate_recommendations(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Use Gemini LLM to generate intelligent instrument recommendations.

        Args:
            nodes: List of node dictionaries from the graph
            edges: List of edge dictionaries from the graph

        Returns:
            List of recommendation dictionaries with reasons
        """
        if not self.gemini_configured:
            raise ValueError("GOOGLE_API_KEY not configured")

        # Extract existing instruments and genres
        existing_instruments = []
        existing_genres = []

        for node in nodes:
            node_label = node.get("data", {}).get("label", "")
            node_type = node.get("data", {}).get("type", "")

            if node_type == "genre":
                existing_genres.append(node_label)
            else:
                existing_instruments.append(node_label)

        # Build the prompt
        prompt = RECOMMENDATION_PROMPT.format(
            instruments=AVAILABLE_INSTRUMENTS,
            genres=AVAILABLE_GENRES,
            nodes_json=json.dumps(nodes, indent=2),
            edges_json=json.dumps(edges, indent=2),
            existing_instruments=", ".join(existing_instruments) if existing_instruments else "None",
            existing_genres=", ".join(existing_genres) if existing_genres else "None (general composition)"
        )

        # Use Gemini to generate recommendations
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash-exp',
            generation_config={
                'temperature': 0.7,  # Creative but consistent
                'top_p': 0.9,
                'max_output_tokens': 2048,
            }
        )

        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            response_text = response_text.strip()

            # Parse JSON response
            result = json.loads(response_text)
            recommendations = result.get("recommendations", [])

            print(f"[Recommendations] Generated {len(recommendations)} recommendations")
            for rec in recommendations:
                print(f"  - {rec['instrument_name']}: {rec['reason'][:80]}...")

            return recommendations

        except json.JSONDecodeError as e:
            print(f"[Recommendations] JSON parse error: {e}")
            print(f"[Recommendations] Response text: {response_text[:500]}")
            raise ValueError(f"Failed to parse LLM response as JSON: {e}")
        except Exception as e:
            print(f"[Recommendations] Error: {e}")
            raise ValueError(f"Error generating recommendations: {e}")


# Singleton instance
recommendation_service = RecommendationService()
