import logging
from .bedrock_service import bedrock_service

logger = logging.getLogger(__name__)


class PromptService:
    """Service class for prompt enhancement and generation"""

    def __init__(self):
        self.bedrock = bedrock_service

    def enhance_prompt(
        self, user_prompt: str, llm_model: str = "claude", image_model: str = "titan-g1"
    ) -> str:
        """Enhance user prompt with AI suggestions, optimized for image model limits"""

        # Different enhancement strategies based on image model prompt limits
        if image_model in ["titan-g1", "titan-g2"]:
            # Concise enhancement for Titan models (512 char limit)
            enhancement_prompt = f"""Take this prompt: "{user_prompt}"

Make it more professional by adding 2-3 key visual details like lighting, style, or quality terms. Keep it concise and under 400 characters total.

Enhanced prompt:"""
        else:
            # More detailed enhancement for models with higher limits
            enhancement_prompt = f"""You are an expert AI prompt engineer specializing in creating detailed, professional prompts for AI influencer generation. 

Take this basic prompt: "{user_prompt}"

Enhance it by adding:
- Professional photography terms
- Lighting descriptions (studio lighting, natural light, etc.)
- Camera settings and angles
- Style descriptors
- Quality indicators
- Composition details

Keep the original intent but make it much more detailed and professional. Return only the enhanced prompt, no explanations.

Enhanced prompt:"""

        # Use selected LLM model
        if llm_model == "titan":
            return self.bedrock.invoke_titan_text(enhancement_prompt, max_tokens=500)
        else:
            return self.bedrock.invoke_claude(enhancement_prompt, max_tokens=500)

    def generate_character_prompt(
        self, character_features: dict, base_prompt: str = "", llm_model: str = "claude"
    ) -> str:
        """Generate prompt based on character builder selections"""
        # Extract character features
        # Demographics
        age = character_features.get("age", "")
        gender = character_features.get("gender", "")
        ethnicity = character_features.get("ethnicity", "")

        # Physical Features
        body_type = character_features.get("body_type", "")
        hair_style = character_features.get("hair_style", "")
        hair_color = character_features.get("hair_color", "")

        # Personality & Traits
        expression = character_features.get("expression", "")
        personality = character_features.get("personality", "")
        confidence_level = character_features.get("confidence_level", "")

        # Style & Aesthetic
        fashion_style = character_features.get("fashion_style", "")
        overall_vibe = character_features.get("overall_vibe", "")

        # Scene & Setting
        background = character_features.get("background", "")
        lighting_style = character_features.get("lighting_style", "")
        photo_type = character_features.get("photo_type", "")

        character_prompt_template = f"""Create a concise, precise AI influencer prompt. Use ONLY the non-empty specifications below:

Base: {base_prompt if base_prompt else 'AI influencer'}

Features to include:
{f"- {age} {gender}" if age and gender else f"- {age}" if age else f"- {gender}" if gender else ""}
{f"- {ethnicity}" if ethnicity else ""}
{f"- {body_type} build" if body_type else ""}
{f"- {hair_color} {hair_style} hair" if hair_color and hair_style else f"- {hair_style} hair" if hair_style else f"- {hair_color} hair" if hair_color else ""}
{f"- {expression} expression" if expression else ""}
{f"- {personality} personality" if personality else ""}
{f"- {confidence_level} confidence" if confidence_level else ""}
{f"- {fashion_style} style" if fashion_style else ""}
{f"- {overall_vibe} vibe" if overall_vibe else ""}
{f"- {background} background" if background else ""}
{f"- {lighting_style} lighting" if lighting_style else ""}
{f"- {photo_type} shot" if photo_type else ""}

Generate a SHORT, precise prompt (2-3 sentences max) that combines these elements naturally. Focus on visual impact, not technical details.

Prompt:"""

        # Use selected LLM model
        if llm_model == "titan":
            return self.bedrock.invoke_titan_text(
                character_prompt_template, max_tokens=800
            )
        else:
            return self.bedrock.invoke_claude(character_prompt_template, max_tokens=800)


# Global instance
prompt_service = PromptService()
