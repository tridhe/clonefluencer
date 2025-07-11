"""
InfluencerAI Backend API

A modular Flask application for AI influencer generation using AWS Bedrock.

Features:
- Text prompt enhancement using Claude 3 Sonnet and Amazon Titan
- Character-based prompt generation
- Image generation using multiple AWS Bedrock models
- Modular architecture with separate services and routes
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import requests
import base64
import io
from PIL import Image
from dotenv import load_dotenv

# Load environment variables from .env file
# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, ".env")
load_dotenv(env_path)

from routes.prompt_routes import prompt_bp
from routes.image_routes import image_bp
from routes.health_routes import health_bp
from routes.model_routes import model_bp
from routes.storage_routes import storage_bp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)

    # Define allowed origins for CORS
    allowed_origins = [
        "https://main.dqu54vqh53v5a.amplifyapp.com",  # Your Amplify frontend
        "http://localhost:3000",  # For local development
    ]

    # Enable CORS with specific origins
    CORS(app, origins=allowed_origins, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(prompt_bp, url_prefix="/api")
    app.register_blueprint(image_bp, url_prefix="/api")
    app.register_blueprint(model_bp, url_prefix="/api")
    app.register_blueprint(storage_bp)

    # Simple image merge endpoint
    @app.route("/api/image/merge", methods=["POST"])
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
                return (
                    jsonify({"error": "Both left_url and right_url are required"}),
                    400,
                )

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
            logger.error(f"Error fetching image for merge: {e}")
            return jsonify({"error": f"Failed to fetch image: {str(e)}"}), 500
        except Exception as e:
            logger.error(f"Error in merge_images: {e}")
            return jsonify({"error": str(e)}), 500

    return app


if __name__ == "__main__":
    # Check if required environment variables are set
    required_env_vars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"]
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]

    if missing_vars:
        logger.warning(f"Missing environment variables: {missing_vars}")
        logger.warning("AWS Bedrock functionality may not work correctly")

    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
