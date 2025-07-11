from flask import Blueprint, request, jsonify
import logging
from services.prompt_service import prompt_service

logger = logging.getLogger(__name__)

prompt_bp = Blueprint("prompt", __name__)

# Route definitions for prompt generation and enhancement


@prompt_bp.route("/enhance-prompt", methods=["POST", "OPTIONS"])
def enhance_prompt():
    """Enhance user prompt with AI suggestions"""
    # Handle OPTIONS request for CORS preflight
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()
        user_prompt = data.get("prompt", "")
        llm_model = data.get("llm_model", "claude")

        if not user_prompt:
            return jsonify({"error": "Prompt is required"}), 400

        enhanced_text = prompt_service.enhance_prompt(user_prompt, llm_model)

        return jsonify(
            {"original_prompt": user_prompt, "enhanced_prompt": enhanced_text.strip()}
        )

    except Exception as e:
        logger.error(f"Error enhancing prompt: {e}")
        return jsonify({"error": "Failed to enhance prompt"}), 500


@prompt_bp.route("/optimize-kontext-prompt", methods=["POST", "OPTIONS"])
def optimize_kontext_prompt():
    """Optimize user prompt specifically for Flux Kontext"""
    # Handle OPTIONS request for CORS preflight
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()
        user_prompt = data.get("prompt", "")
        llm_model = data.get("llm_model", "claude")

        if not user_prompt:
            return jsonify({"error": "Prompt is required"}), 400

        from services.kontext_service import kontext_service

        optimized_text = kontext_service.optimize_kontext_prompt(user_prompt, llm_model)

        return jsonify(
            {"original_prompt": user_prompt, "optimized_prompt": optimized_text.strip()}
        )

    except Exception as e:
        logger.error(f"Error optimizing Kontext prompt: {e}")
        return jsonify({"error": "Failed to optimize Kontext prompt"}), 500


@prompt_bp.route("/character-prompt", methods=["POST", "OPTIONS"])
def character_prompt():
    """Generate prompt based on character builder selections"""
    # Handle OPTIONS request for CORS preflight
    if request.method == "OPTIONS":
        return "", 200

    try:
        data = request.get_json()
        character_features = data.get("character_features", {})
        base_prompt = data.get("base_prompt", "")
        llm_model = data.get("llm_model", "claude")

        generated_prompt = prompt_service.generate_character_prompt(
            character_features, base_prompt, llm_model
        )

        return jsonify(
            {
                "character_features": character_features,
                "base_prompt": base_prompt,
                "generated_prompt": generated_prompt.strip(),
            }
        )

    except Exception as e:
        logger.error(f"Error generating character prompt: {e}")
        return jsonify({"error": "Failed to generate character prompt"}), 500


@prompt_bp.route("/surprise-prompt", methods=["POST", "OPTIONS"])
def surprise_prompt():
    """Generate a random surprise prompt for inspiration"""
    # Handle OPTIONS request for CORS preflight
    if request.method == "OPTIONS":
        return "", 200

    try:
        # This can be expanded to include more sophisticated random generation
        import random

        # Sample surprise prompts for inspiration
        surprise_prompts = [
            "A confident tech entrepreneur in a modern office setting, showcasing the latest innovation",
            "An elegant fashion model at a luxury rooftop party, golden hour lighting",
            "A fitness influencer in a minimalist gym, natural morning light streaming through windows",
            "A creative artist in a bright studio space, surrounded by colorful artwork",
            "A professional chef in a modern kitchen, artfully presenting a gourmet dish",
            "A travel blogger at a scenic overlook, casual adventure outfit with mountain backdrop",
            "A lifestyle influencer in a cozy coffee shop, laptop open, warm ambient lighting",
            "A sustainability advocate in a urban garden, surrounded by lush plants and greenery",
        ]

        selected_prompt = random.choice(surprise_prompts)

        return jsonify({"prompt": selected_prompt})

    except Exception as e:
        logger.error(f"Error generating surprise prompt: {e}")
        return jsonify({"error": "Failed to generate surprise prompt"}), 500
