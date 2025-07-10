from flask import Blueprint, jsonify
from services.bedrock_service import bedrock_service

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {"status": "healthy", "aws_bedrock_available": bedrock_service.is_available()}
    )
