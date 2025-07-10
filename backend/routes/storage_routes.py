from flask import Blueprint, request, jsonify
from services.storage_service import storage_service
import base64

storage_bp = Blueprint("storage", __name__)


@storage_bp.route("/api/generations", methods=["GET"])
def get_user_generations():
    """Get user's image generations with pagination"""
    try:
        # Get user_id from request headers (from Cognito token)
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            return jsonify({"error": "User ID required"}), 401

        # Get query parameters
        limit = int(request.args.get("limit", 20))
        last_key = request.args.get("last_key")

        result = storage_service.get_user_generations(
            user_id=user_id, limit=limit, last_key=last_key
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@storage_bp.route("/api/generations/<generation_id>", methods=["GET"])
def get_generation(generation_id):
    """Get specific generation by ID"""
    try:
        result = storage_service.get_generation_by_id(generation_id)

        if result["success"]:
            return jsonify(result)
        else:
            return jsonify(result), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@storage_bp.route("/api/generations/<generation_id>", methods=["DELETE"])
def delete_generation(generation_id):
    """Delete a generation"""
    try:
        # Get user_id from request headers
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            return jsonify({"error": "User ID required"}), 401

        result = storage_service.delete_generation(generation_id, user_id)

        if result["success"]:
            return jsonify(result)
        else:
            status_code = 403 if result.get("error") == "Unauthorized" else 400
            return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@storage_bp.route("/api/generations/<generation_id>/publish", methods=["POST"])
def publish_generation(generation_id):
    """Mark generation as public"""
    try:
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            return jsonify({"error": "User ID required"}), 401
        result = storage_service.set_generation_public_status(
            generation_id, user_id, True
        )
        status = (
            200
            if result["success"]
            else (403 if result.get("error") == "Unauthorized" else 400)
        )
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@storage_bp.route("/api/generations/<generation_id>/unpublish", methods=["POST"])
def unpublish_generation(generation_id):
    """Remove generation from public explore"""
    try:
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            return jsonify({"error": "User ID required"}), 401
        result = storage_service.set_generation_public_status(
            generation_id, user_id, False
        )
        status = (
            200
            if result["success"]
            else (403 if result.get("error") == "Unauthorized" else 400)
        )
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@storage_bp.route("/api/explore", methods=["GET"])
def explore_public():
    """List public generations"""
    try:
        limit = int(request.args.get("limit", 50))
        last_key = request.args.get("last_key")
        result = storage_service.get_public_generations(limit, last_key)

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@storage_bp.route("/api/user/stats", methods=["GET"])
def get_user_stats():
    """Get user's generation statistics"""
    try:
        # Get user_id from request headers
        user_id = request.headers.get("X-User-ID")
        if not user_id:
            return jsonify({"error": "User ID required"}), 401

        result = storage_service.get_generation_stats(user_id)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@storage_bp.route("/api/store-generation", methods=["POST"])
def store_generation():
    """Store a completed image generation"""
    try:
        # Get user info from headers
        user_id = request.headers.get("X-User-ID")
        user_email = request.headers.get("X-User-Email")

        if not user_id or not user_email:
            return jsonify({"error": "User authentication required"}), 401

        data = request.get_json()

        # Validate required fields
        required_fields = ["prompt", "image_model", "llm_model", "image_data"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Decode base64 image data
        try:
            image_data = base64.b64decode(data["image_data"])
        except Exception as e:
            return jsonify({"error": "Invalid image data format"}), 400

        # Store the generation
        result = storage_service.store_image_generation(
            user_id=user_id,
            user_email=user_email,
            prompt=data["prompt"],
            image_model=data["image_model"],
            llm_model=data["llm_model"],
            image_data=image_data,
            character_data=data.get("character_data"),
            enhanced_prompt=data.get("enhanced_prompt"),
        )

        if result["success"]:
            return jsonify(result), 201
        else:
            return jsonify(result), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500
