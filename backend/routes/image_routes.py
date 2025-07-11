from flask import Blueprint, request, jsonify, send_file
import requests
import base64
import io
from PIL import Image
import logging
import os
import asyncio
from services.image_generation_service import ImageGenerationService

logger = logging.getLogger(__name__)
image_bp = Blueprint("image", __name__)

# Initialize the image generation service
image_service = ImageGenerationService()

# Set FLUX API key from environment
flux_api_key = os.getenv("FLUX_API_KEY")
if flux_api_key:
    image_service.set_flux_api_key(flux_api_key)


@image_bp.route("/generate", methods=["POST", "OPTIONS"])
def generate_image():
    """Generate an image using AWS Bedrock"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        prompt = data.get("prompt")
        character_features = data.get("characterFeatures", {})
        image_model = data.get(
            "model", "titan-g1"
        )  # Frontend sends 'model', not 'imageModel'
        llm_model = data.get("llmModel", "claude")
        enhance_prompt = data.get(
            "enhance_prompt", False
        )  # Only enhance if explicitly requested

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        # Import services here to avoid circular imports
        from services.bedrock_service import bedrock_service
        from services.prompt_service import prompt_service
        from services.image_generation_service import image_service
        from services.storage_service import storage_service

        # Get current user if authenticated (simplified for now)
        current_user = None

        # Use original prompt by default, enhance only if requested
        final_prompt = prompt
        enhanced_prompt = None

        if enhance_prompt:
            # Enhance prompt using LLM, passing image model for optimization
            enhanced_prompt = prompt_service.enhance_prompt(
                prompt, llm_model, image_model
            )
            if enhanced_prompt:
                final_prompt = enhanced_prompt
            else:
                logging.warning("Failed to enhance prompt, using original")

        # Set prompt length limits based on the specific image model
        model_prompt_limits = {
            "titan-g1": 512,  # Amazon Titan Image Generator G1
            "titan-g2": 512,  # Amazon Titan Image Generator G1 v2
            "nova-canvas": 1000,  # Nova Canvas (more generous limit)
            "sdxl": 1000,  # SDXL 1.0 (more generous limit)
        }

        max_prompt_length = model_prompt_limits.get(
            image_model, 512
        )  # Default to 512 for safety

        if len(final_prompt) > max_prompt_length:
            # Truncate at word boundary to avoid cutting words in half
            final_prompt = final_prompt[:max_prompt_length].rsplit(" ", 1)[0]
            logging.info(
                f"Truncated prompt to {len(final_prompt)} characters for {image_model} model compatibility (limit: {max_prompt_length})"
            )

        # Generate image
        image_data = image_service.generate_image(final_prompt, image_model)

        if not image_data:
            return jsonify({"error": "Failed to generate image"}), 500

        # Store the generation if user is authenticated and storage is enabled
        generation_id = None
        if current_user and storage_service.enabled:
            try:
                generation_id = storage_service.store_generation(
                    user_id=current_user["user_id"],
                    user_email=current_user.get("email", ""),
                    prompt=prompt,
                    enhanced_prompt=enhanced_prompt,
                    image_data=image_data,
                    image_model=image_model,
                    llm_model=llm_model,
                    character_data=character_features,
                )
                logging.info(f"Stored generation with ID: {generation_id}")
            except Exception as e:
                logging.error(f"Failed to store generation: {e}")
                # Continue without storing - don't fail the request

        return jsonify(
            {
                "success": True,
                "image": image_data,
                "prompt": final_prompt,  # The actual prompt used for generation
                "original_prompt": prompt,  # The user's original prompt
                "enhanced_prompt": enhanced_prompt,  # The enhanced version (if any)
                "was_enhanced": enhance_prompt and enhanced_prompt is not None,
                "generation_id": generation_id,
            }
        )

    except Exception as e:
        logging.error(f"Error in generate_image: {e}")
        return jsonify({"error": str(e)}), 500


@image_bp.route("/proxy", methods=["POST", "OPTIONS"])
def proxy_image():
    """Proxy endpoint to fetch images and return as base64, bypassing CORS"""
    try:
        data = request.get_json()

        if not data or "url" not in data:
            return jsonify({"error": "Image URL is required"}), 400

        image_url = data["url"]

        # Validate URL (basic security check)
        if not image_url.startswith(("http://", "https://")):
            return jsonify({"error": "Invalid URL"}), 400

        # Fetch the image
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()

        # Verify it's an image
        content_type = response.headers.get("content-type", "")
        if not content_type.startswith("image/"):
            return jsonify({"error": "URL does not point to an image"}), 400

        # Convert to base64
        image_base64 = base64.b64encode(response.content).decode("utf-8")

        # Create data URL
        data_url = f"data:{content_type};base64,{image_base64}"

        return jsonify(
            {
                "success": True,
                "data_url": data_url,
                "content_type": content_type,
                "size": len(response.content),
            }
        )

    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching image: {e}")
        return jsonify({"error": f"Failed to fetch image: {str(e)}"}), 500
    except Exception as e:
        logging.error(f"Error in proxy_image: {e}")
        return jsonify({"error": str(e)}), 500


@image_bp.route("/merge", methods=["POST", "OPTIONS"])
def merge_images():
    """Server-side image merging to avoid CORS issues"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        left_url = data.get("left_url")
        right_url = data.get("right_url")
        target_width = data.get("target_width", 512)
        target_height = data.get("target_height", 512)

        if not left_url or not right_url:
            return jsonify({"error": "Both left_url and right_url are required"}), 400

        # Fetch both images
        def fetch_image(url):
            if url.startswith("data:"):
                # Handle data URLs
                header, data = url.split(",", 1)
                image_data = base64.b64decode(data)
                return Image.open(io.BytesIO(image_data))
            else:
                # Fetch external URLs
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                return Image.open(io.BytesIO(response.content))

        left_img = fetch_image(left_url)
        right_img = fetch_image(right_url)

        # Resize images to target size
        left_img = left_img.resize(
            (target_width, target_height), Image.Resampling.LANCZOS
        )
        right_img = right_img.resize(
            (target_width, target_height), Image.Resampling.LANCZOS
        )

        # Create merged image
        merged_width = target_width * 2
        merged_height = target_height
        merged_img = Image.new("RGB", (merged_width, merged_height))

        # Paste images side by side
        merged_img.paste(left_img, (0, 0))
        merged_img.paste(right_img, (target_width, 0))

        # Convert to base64
        buffer = io.BytesIO()
        merged_img.save(buffer, format="PNG")
        buffer.seek(0)

        image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        data_url = f"data:image/png;base64,{image_base64}"

        return jsonify(
            {
                "success": True,
                "merged_image": data_url,
                "width": merged_width,
                "height": merged_height,
            }
        )

    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching image for merge: {e}")
        return jsonify({"error": f"Failed to fetch image: {str(e)}"}), 500
    except Exception as e:
        logging.error(f"Error in merge_images: {e}")
        return jsonify({"error": str(e)}), 500


@image_bp.route("/flux", methods=["POST", "OPTIONS"])
def flux_edit_image():
    """Edit image using FLUX API"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        input_image = data.get("input_image")
        prompt = data.get("prompt")

        if not input_image or not prompt:
            return jsonify({"error": "Both input_image and prompt are required"}), 400

        # Import Kontext service for prompt optimization
        from services.kontext_service import kontext_service

        # Get LLM model for optimization (default to claude)
        llm_model = data.get("llm_model", "claude")

        # Optimize the prompt for Kontext using AI
        optimized_prompt = kontext_service.optimize_kontext_prompt(prompt, llm_model)
        logger.info(f"Original prompt: {prompt}")
        logger.info(f"Optimized Kontext prompt: {optimized_prompt}")

        # Use the optimized prompt for generation
        final_prompt = optimized_prompt.strip()

        # Extract base64 data if it's a data URL
        if input_image.startswith("data:"):
            # Remove data URL prefix to get just the base64 data
            input_image = input_image.split(",", 1)[1]

        # Optional parameters
        aspect_ratio = data.get("aspect_ratio", "1:1")
        seed = data.get("seed")
        safety_tolerance = data.get("safety_tolerance", 2)
        output_format = data.get("output_format", "jpeg")

        # Check if FLUX API key is configured
        if not flux_api_key:
            return (
                jsonify(
                    {
                        "error": "FLUX API key not configured. Please set FLUX_API_KEY environment variable."
                    }
                ),
                500,
            )

        # Generate with FLUX Kontext (run async function in sync context)
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                image_service.generate_with_flux_kontext(
                    prompt=final_prompt,
                    input_image_base64=input_image,
                    aspect_ratio=aspect_ratio,
                    seed=seed,
                    safety_tolerance=safety_tolerance,
                    output_format=output_format,
                )
            )
            # Include both original and optimized prompts in response
            result["original_prompt"] = prompt
            result["optimized_prompt"] = final_prompt
            return jsonify(result)
        finally:
            loop.close()

    except ValueError as e:
        logger.error(f"Validation error in flux_edit_image: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Error in flux_edit_image: {e}")
        return jsonify({"error": str(e)}), 500
