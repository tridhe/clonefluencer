import logging
from .bedrock_service import bedrock_service

logger = logging.getLogger(__name__)


class KontextService:
    """Service class for optimizing prompts for Flux Kontext image editing"""

    def __init__(self):
        self.bedrock = bedrock_service

    def optimize_kontext_prompt(
        self, user_prompt: str, llm_model: str = "claude"
    ) -> str:
        """
        Optimize user prompt for Flux Kontext using professional techniques

        Assumes model is on the left and product is on the right based on user specification.
        """

        optimization_prompt = f"""
You are an expert at optimizing prompts for Flux Kontext image editing. Your task is to transform the user's basic prompt into a highly specific, professional Kontext instruction.

IMPORTANT CONTEXT:
- The image layout is: Model/Person on LEFT, Product on RIGHT
- This is for AI influencer product placement scenarios
- Follow Kontext best practices for precise editing

Original user prompt: "{user_prompt}"

Transform this prompt using these Kontext techniques:

1. BE SPECIFIC AND CLEAR
   - Use precise descriptions instead of vague terms
   - Specify what should remain unchanged
   - Use step-by-step modifications

2. PRESERVE CHARACTER CONSISTENCY  
   - Maintain "the person on the left" facial features, hairstyle, and expression
   - Preserve the exact same position, scale, and pose
   - Keep lighting and background consistent unless specified

3. PRODUCT INTEGRATION
   - Reference "the product on the right" when integrating items
   - Specify how the product should be worn/held/positioned
   - Maintain realistic proportions and fit

4. COMPOSITION PRESERVATION
   - Keep the person in the exact same position and pose
   - Preserve original lighting style and background
   - Maintain the same camera angle and framing

5. PROFESSIONAL LANGUAGE
   - Use "change", "replace", "add" rather than "transform"
   - Be explicit about what to preserve vs what to modify
   - Include technical details for realistic results

Example transformations:
- "Make her wear the jacket" → "Change the person on the left to wear the jacket from the right, while maintaining the same facial features, hairstyle, pose, and background lighting"
- "Add the product" → "Place the product from the right onto the person on the left, keeping their exact same position, expression, and all other visual elements unchanged"

Create an optimized Kontext prompt that is:
- Specific and detailed
- Preserves character consistency
- Maintains composition
- Uses proper Kontext language
- Under 400 characters for efficiency

Optimized prompt:"""

        try:
            # Use selected LLM model
            if llm_model == "titan":
                return self.bedrock.invoke_titan_text(
                    optimization_prompt, max_tokens=300
                )
            else:
                return self.bedrock.invoke_claude(optimization_prompt, max_tokens=300)
        except Exception as e:
            logger.error(f"Error optimizing Kontext prompt: {e}")
            # Fallback: return original prompt with basic Kontext structure
            return f"Change the person on the left to {user_prompt}, while maintaining the same facial features, pose, and background"


# Global instance
kontext_service = KontextService()
