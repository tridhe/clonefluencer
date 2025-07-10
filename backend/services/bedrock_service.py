import boto3
import json
import os
import logging

logger = logging.getLogger(__name__)


class BedrockService:
    """Service class for AWS Bedrock interactions"""

    def __init__(self):
        self.client = self._initialize_client()

    def _initialize_client(self):
        """Initialize AWS Bedrock client"""
        try:
            client = boto3.client(
                "bedrock-runtime",
                region_name=os.getenv("AWS_REGION", "us-east-1"),
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            logger.info("AWS Bedrock client initialized successfully")
            return client
        except Exception as e:
            logger.error(f"Failed to initialize AWS Bedrock client: {e}")
            return None

    def is_available(self) -> bool:
        """Check if Bedrock client is available"""
        return self.client is not None

    def invoke_claude(self, prompt: str, max_tokens: int = 1000) -> str:
        """Invoke Claude 3 model via AWS Bedrock"""
        if not self.client:
            raise Exception("AWS Bedrock client not initialized")

        try:
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "top_p": 0.9,
            }

            response = self.client.invoke_model(
                modelId="anthropic.claude-3-sonnet-20240229-v1:0", body=json.dumps(body)
            )

            response_body = json.loads(response["body"].read())
            return response_body["content"][0]["text"]

        except Exception as e:
            logger.error(f"Error invoking Claude: {e}")
            raise

    def invoke_titan_text(self, prompt: str, max_tokens: int = 1000) -> str:
        """Invoke Amazon Titan text model via AWS Bedrock"""
        if not self.client:
            raise Exception("AWS Bedrock client not initialized")

        try:
            body = {
                "inputText": prompt,
                "textGenerationConfig": {
                    "maxTokenCount": max_tokens,
                    "temperature": 0.7,
                    "topP": 0.9,
                    "stopSequences": [],
                },
            }

            response = self.client.invoke_model(
                modelId="amazon.titan-text-express-v1", body=json.dumps(body)
            )

            response_body = json.loads(response["body"].read())
            return response_body["results"][0]["outputText"]

        except Exception as e:
            logger.error(f"Error invoking Titan: {e}")
            raise


# Global instance
bedrock_service = BedrockService()
