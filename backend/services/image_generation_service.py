import boto3
import json
import base64
import logging
import os
import requests
import time
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class ImageGenerationService:
    """Service class for image generation using AWS Bedrock models"""

    def __init__(self):
        self.bedrock_client = None
        self._bedrock_initialized = False
        self.flux_api_key = None  # Will be set from environment
        self.flux_base_url = "https://api.bfl.ai/v1"

    def _initialize_bedrock_client(self):
        """Initialize Bedrock client (lazy loading)"""
        if self._bedrock_initialized:
            return

        try:
            # Get AWS region from environment
            aws_region = os.getenv("AWS_REGION", "us-east-1")

            self.bedrock_client = boto3.client(
                "bedrock-runtime",
                region_name=aws_region,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            logger.info("AWS Bedrock client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AWS Bedrock client: {e}")
            self.bedrock_client = None

        self._bedrock_initialized = True

    def set_flux_api_key(self, api_key: str):
        """Set the FLUX API key"""
        self.flux_api_key = api_key

    def generate_with_titan_g1(
        self, prompt: str, width: int = 1024, height: int = 1024
    ) -> str:
        """Generate image using Titan Image Generator G1"""
        if not self._bedrock_initialized:
            self._initialize_bedrock_client()
        if not self.bedrock_client:
            raise Exception("AWS Bedrock client not initialized")

        try:
            body = {
                "taskType": "TEXT_IMAGE",
                "textToImageParams": {"text": prompt},
                "imageGenerationConfig": {
                    "numberOfImages": 1,
                    "width": width,
                    "height": height,
                    "cfgScale": 8.0,
                    "seed": 0,
                },
            }

            response = self.bedrock_client.invoke_model(
                modelId="amazon.titan-image-generator-v1", body=json.dumps(body)
            )

            response_body = json.loads(response["body"].read())
            return response_body["images"][0]

        except Exception as e:
            logger.error(f"Error generating image with Titan G1: {e}")
            raise

    def generate_with_titan_g2(
        self, prompt: str, width: int = 1024, height: int = 1024
    ) -> str:
        """Generate image using Titan Image Generator G1 v2"""
        if not self._bedrock_initialized:
            self._initialize_bedrock_client()
        if not self.bedrock_client:
            raise Exception("AWS Bedrock client not initialized")

        try:
            body = {
                "taskType": "TEXT_IMAGE",
                "textToImageParams": {"text": prompt},
                "imageGenerationConfig": {
                    "numberOfImages": 1,
                    "width": width,
                    "height": height,
                    "cfgScale": 8.0,
                    "seed": 0,
                },
            }

            response = self.bedrock_client.invoke_model(
                modelId="amazon.titan-image-generator-v2:0", body=json.dumps(body)
            )

            response_body = json.loads(response["body"].read())
            return response_body["images"][0]

        except Exception as e:
            logger.error(f"Error generating image with Titan G2: {e}")
            raise

    def generate_with_nova_canvas(
        self, prompt: str, width: int = 1024, height: int = 1024
    ) -> str:
        """Generate image using Nova Canvas"""
        if not self._bedrock_initialized:
            self._initialize_bedrock_client()
        if not self.bedrock_client:
            raise Exception("AWS Bedrock client not initialized")

        try:
            body = {
                "taskType": "TEXT_IMAGE",
                "textToImageParams": {"text": prompt},
                "imageGenerationConfig": {
                    "numberOfImages": 1,
                    "width": width,
                    "height": height,
                    "cfgScale": 8.0,
                },
            }

            response = self.bedrock_client.invoke_model(
                modelId="amazon.nova-canvas-v1:0", body=json.dumps(body)
            )

            response_body = json.loads(response["body"].read())
            return response_body["images"][0]

        except Exception as e:
            logger.error(f"Error generating image with Nova Canvas: {e}")
            raise

    def generate_with_sdxl(
        self, prompt: str, width: int = 1024, height: int = 1024
    ) -> str:
        """Generate image using SDXL 1.0"""
        if not self._bedrock_initialized:
            self._initialize_bedrock_client()
        if not self.bedrock_client:
            raise Exception("AWS Bedrock client not initialized")

        try:
            body = {
                "text_prompts": [{"text": prompt, "weight": 1.0}],
                "cfg_scale": 10,
                "seed": 0,
                "steps": 30,
                "width": width,
                "height": height,
            }

            response = self.bedrock_client.invoke_model(
                modelId="stability.stable-diffusion-xl-base-v1-0", body=json.dumps(body)
            )

            response_body = json.loads(response["body"].read())
            return response_body["artifacts"][0]["base64"]

        except Exception as e:
            logger.error(f"Error generating image with SDXL: {e}")
            raise

    async def generate_with_flux_kontext(
        self,
        prompt: str,
        input_image_base64: str,
        aspect_ratio: str = "1:1",
        seed: Optional[int] = None,
        safety_tolerance: int = 2,
        output_format: str = "jpeg",
    ) -> Dict[str, Any]:
        """
        Generate image using FLUX.1 Kontext for image editing

        Args:
            prompt: Text description of the edit to be applied
            input_image_base64: Base64 encoded input image
            aspect_ratio: Desired aspect ratio (e.g., "16:9")
            seed: Seed for reproducibility
            safety_tolerance: Moderation level (0-2)
            output_format: Output format ("jpeg" or "png")

        Returns:
            Dict containing the generated image data
        """
        if not self.flux_api_key:
            raise ValueError("FLUX API key not configured")

        try:
            # Create request payload
            payload = {
                "prompt": prompt,
                "input_image": input_image_base64,
                "aspect_ratio": aspect_ratio,
                "safety_tolerance": safety_tolerance,
                "output_format": output_format,
            }

            if seed is not None:
                payload["seed"] = seed

            headers = {
                "accept": "application/json",
                "x-key": self.flux_api_key,
                "Content-Type": "application/json",
            }

            # Submit generation request
            response = requests.post(
                f"{self.flux_base_url}/flux-kontext-pro",
                headers=headers,
                json=payload,
                timeout=30,
            )

            if not response.ok:
                error_msg = (
                    f"FLUX API request failed: {response.status_code} - {response.text}"
                )
                logger.error(error_msg)
                raise Exception(error_msg)

            result = response.json()
            request_id = result.get("id")
            polling_url = result.get("polling_url")

            if not request_id or not polling_url:
                raise Exception(
                    "Invalid response from FLUX API - missing id or polling_url"
                )

            # Poll for result
            max_attempts = 60  # 30 seconds with 0.5s intervals
            attempt = 0

            while attempt < max_attempts:
                time.sleep(0.5)
                attempt += 1

                poll_response = requests.get(
                    polling_url,
                    headers={"accept": "application/json", "x-key": self.flux_api_key},
                    timeout=10,
                )

                if not poll_response.ok:
                    logger.warning(f"Polling failed: {poll_response.status_code}")
                    continue

                poll_result = poll_response.json()
                status = poll_result.get("status")

                logger.info(f"FLUX generation status: {status} (attempt {attempt})")

                if status == "Ready":
                    sample_url = poll_result.get("result", {}).get("sample")
                    if sample_url:
                        # Download the generated image
                        img_response = requests.get(sample_url, timeout=30)
                        if img_response.ok:
                            image_base64 = base64.b64encode(
                                img_response.content
                            ).decode("utf-8")
                            return {
                                "success": True,
                                "image": f"data:image/{output_format};base64,{image_base64}",
                                "prompt": prompt,
                                "model": "flux-kontext-pro",
                                "width": 1024,  # FLUX default
                                "height": 1024,
                                "request_id": request_id,
                            }
                        else:
                            raise Exception("Failed to download generated image")
                    else:
                        raise Exception("No sample URL in ready response")

                # Stop early if FLUX has actively moderated the request so the frontend can respond immediately
                elif status == "Request Moderated":
                    raise Exception(
                        "FLUX has moderated this request. Please adjust your prompt or input image to comply with safety guidelines."
                    )

                elif status in ["Error", "Failed"]:
                    error_msg = poll_result.get("error", "Generation failed")
                    raise Exception(f"FLUX generation failed: {error_msg}")

            raise Exception("FLUX generation timed out")

        except requests.exceptions.RequestException as e:
            logger.error(f"FLUX API request error: {e}")
            raise Exception(f"FLUX API request failed: {str(e)}")
        except Exception as e:
            logger.error(f"FLUX generation error: {e}")
            raise

    def generate_image(
        self, prompt: str, model: str, width: int = 1024, height: int = 1024
    ) -> str:
        """Generate image using the specified model"""
        model_generators = {
            "titan-g1": self.generate_with_titan_g1,
            "titan-g2": self.generate_with_titan_g2,
            "nova-canvas": self.generate_with_nova_canvas,
            "sdxl": self.generate_with_sdxl,
        }

        generator = model_generators.get(model)
        if not generator:
            raise ValueError(f"Unsupported model: {model}")

        return generator(prompt, width, height)


# Global instance
image_service = ImageGenerationService()
