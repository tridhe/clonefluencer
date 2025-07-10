from flask import Blueprint, jsonify

model_bp = Blueprint("model", __name__)


@model_bp.route("/models", methods=["GET"])
def list_models():
    """List available models"""
    return jsonify(
        {
            "text_models": [
                {
                    "id": "claude-3-sonnet",
                    "name": "Claude 3 Sonnet",
                    "description": "Anthropic's Claude 3 Sonnet model via AWS Bedrock",
                },
                {
                    "id": "titan-text",
                    "name": "Amazon Titan Text",
                    "description": "Amazon's Titan Text Express model",
                },
            ],
            "image_models": [
                {
                    "id": "titan-g1",
                    "name": "Titan Image Generator G1",
                    "description": "Amazon's Titan Image Generator G1",
                },
                {
                    "id": "titan-g2",
                    "name": "Titan Image Generator G1 v2",
                    "description": "Amazon's Titan Image Generator G1 v2",
                },
                {
                    "id": "nova-canvas",
                    "name": "Nova Canvas",
                    "description": "Amazon's Nova Canvas image model",
                },
                {
                    "id": "sdxl",
                    "name": "SDXL 1.0",
                    "description": "Stability AI's SDXL 1.0 model",
                },
            ],
        }
    )
