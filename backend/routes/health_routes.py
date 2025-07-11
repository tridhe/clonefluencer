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


@health_bp.route("/debug/storage", methods=["GET"])
def debug_storage():
    """Debug endpoint to test storage service initialization"""
    try:
        import boto3
        from botocore.exceptions import ClientError

        # Get AWS region from environment
        aws_region = os.getenv("AWS_REGION", "us-east-1")

        # Test AWS credentials
        sts = boto3.client("sts", region_name=aws_region)
        identity = sts.get_caller_identity()

        # Test S3
        s3 = boto3.client("s3", region_name=aws_region)
        bucket_name = os.getenv("S3_BUCKET_NAME", "influencer-ai-images-ttn-123")
        s3.head_bucket(Bucket=bucket_name)

        # Test DynamoDB
        dynamodb = boto3.resource("dynamodb", region_name=aws_region)
        table_name = os.getenv("DYNAMODB_TABLE_NAME", "influencer-ai-generations")
        table = dynamodb.Table(table_name)
        table.load()

        return jsonify(
            {
                "status": "success",
                "aws_account": identity.get("Account"),
                "s3_bucket": bucket_name,
                "dynamodb_table": table_name,
                "table_status": table.table_status,
                "message": "All AWS services accessible",
            }
        )

    except ClientError as e:
        return jsonify(
            {
                "status": "error",
                "error_type": "ClientError",
                "error_code": e.response["Error"]["Code"],
                "error_message": str(e),
            }
        )
    except Exception as e:
        return jsonify(
            {"status": "error", "error_type": type(e).__name__, "error_message": str(e)}
        )
