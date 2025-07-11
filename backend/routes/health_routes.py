from flask import Blueprint, jsonify
import os

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "clonefluencer-api",
            "env_vars_present": bool(
                os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY")
            ),
        }
    )


@health_bp.route("/debug/env", methods=["GET"])
def debug_env():
    """Debug endpoint to check environment variables (for development only)"""
    env_vars = {
        "AWS_ACCESS_KEY_ID": "SET" if os.getenv("AWS_ACCESS_KEY_ID") else "NOT SET",
        "AWS_SECRET_ACCESS_KEY": (
            "SET" if os.getenv("AWS_SECRET_ACCESS_KEY") else "NOT SET"
        ),
        "AWS_REGION": os.getenv("AWS_REGION", "NOT SET"),
        "DYNAMODB_TABLE_NAME": os.getenv("DYNAMODB_TABLE_NAME", "NOT SET"),
        "S3_BUCKET_NAME": os.getenv("S3_BUCKET_NAME", "NOT SET"),
        "FLASK_ENV": os.getenv("FLASK_ENV", "NOT SET"),
    }

    return jsonify(
        {
            "environment_variables": env_vars,
            "all_env_vars_present": all(var != "NOT SET" for var in env_vars.values()),
        }
    )
