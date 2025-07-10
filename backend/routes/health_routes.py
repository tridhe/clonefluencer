from flask import Blueprint, jsonify
import os

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    # Simple health check that doesn't depend on AWS connectivity
    return jsonify(
        {
            "status": "healthy",
            "service": "clonefluencer-api",
            "env_vars_present": bool(os.getenv("AWS_ACCESS_KEY_ID")),
        }
    )
