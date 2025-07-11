import boto3
import json
import uuid
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
import base64
from io import BytesIO


class StorageService:
    def __init__(self):
        self.table = None
        self.dynamodb = None
        self.s3_client = None
        self.enabled = False
        self._initialized = False

        # Table and bucket names from environment variables
        self.table_name = os.getenv("DYNAMODB_TABLE_NAME", "influencer-ai-generations")
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "influencer-ai-images")

    def _initialize_aws_services(self):
        """Initialize AWS services (lazy loading)"""
        if self._initialized:
            return

        try:
            # Get AWS region from environment
            aws_region = os.getenv("AWS_REGION", "us-east-1")

            # Initialize AWS services with explicit region
            self.dynamodb = boto3.resource(
                "dynamodb",
                region_name=aws_region,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )
            self.s3_client = boto3.client(
                "s3",
                region_name=aws_region,
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            )

            # Get or create DynamoDB table
            self.table = self._get_or_create_table()
            self.enabled = True
            print(f"✅ Storage service initialized successfully")

        except Exception as e:
            print(f"⚠️  Storage service initialization failed: {str(e)}")
            print(
                "📝 Image storage will be disabled. Follow AWS_STORAGE_SETUP.md to enable it."
            )
            self.enabled = False

        self._initialized = True

    def _get_or_create_table(self):
        """Get existing table or create if it doesn't exist"""
        try:
            table = self.dynamodb.Table(self.table_name)
            # Test if table exists
            table.load()
            return table
        except Exception:
            # Create table if it doesn't exist
            return self._create_table()

    def _create_table(self):
        """Create DynamoDB table for image generations"""
        table = self.dynamodb.create_table(
            TableName=self.table_name,
            KeySchema=[
                {"AttributeName": "generation_id", "KeyType": "HASH"}  # Partition key
            ],
            AttributeDefinitions=[
                {"AttributeName": "generation_id", "AttributeType": "S"},
                {"AttributeName": "user_id", "AttributeType": "S"},
                {"AttributeName": "created_at", "AttributeType": "S"},
                {
                    "AttributeName": "is_public",
                    "AttributeType": "S",
                },  # Add this for GSI
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "user-index",
                    "KeySchema": [
                        {"AttributeName": "user_id", "KeyType": "HASH"},
                        {"AttributeName": "created_at", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                },
                {
                    "IndexName": "public-generations-index",
                    "KeySchema": [
                        {"AttributeName": "is_public", "KeyType": "HASH"},
                        {"AttributeName": "created_at", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                },
            ],
            BillingMode="PAY_PER_REQUEST",  # On-demand pricing
        )

        # Wait for table to be created
        table.wait_until_exists()
        return table

    def store_image_generation(
        self,
        user_id: str,
        user_email: str,
        prompt: str,
        image_model: str,
        llm_model: str,
        image_data: bytes,
        character_data: Optional[Dict] = None,
        enhanced_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Store image generation data in DynamoDB and S3

        Args:
            user_id: Cognito user ID
            user_email: User's email
            prompt: Original or enhanced prompt used
            image_model: AI model used for image generation
            llm_model: LLM model used for prompt enhancement
            image_data: bytes
            character_data: Character builder data (optional)
            enhanced_prompt: Enhanced version of prompt (optional)

        Returns:
            Dictionary with generation details
        """
        if not self._initialized:
            self._initialize_aws_services()
        if not self.enabled:
            return {"success": False, "error": "Storage service not available"}

        try:
            # Generate unique IDs
            generation_id = str(uuid.uuid4())
            image_key = f"generations/{user_id}/{generation_id}.png"

            # Upload image to S3
            s3_url = self._upload_image_to_s3(image_data, image_key)

            # Prepare metadata for DynamoDB
            timestamp = datetime.utcnow().isoformat()

            generation_data = {
                "generation_id": generation_id,
                "user_id": user_id,
                "user_email": user_email,
                "prompt": prompt,
                "enhanced_prompt": enhanced_prompt,
                "image_model": image_model,
                "llm_model": llm_model,
                "image_url": s3_url,
                "image_key": image_key,
                "character_data": (
                    json.dumps(character_data) if character_data else None
                ),
                "created_at": timestamp,
                "updated_at": timestamp,
                "status": "completed",
                "is_public": "false",  # Store as string for DynamoDB GSI compatibility
            }

            # Remove None values
            generation_data = {
                k: v for k, v in generation_data.items() if v is not None
            }

            # Store metadata in DynamoDB
            self.table.put_item(Item=generation_data)

            return {
                "success": True,
                "generation_id": generation_id,
                "image_url": s3_url,
                "created_at": timestamp,
            }

        except Exception as e:
            print(f"Error storing image generation: {str(e)}")
            return {"success": False, "error": str(e)}

    def _upload_image_to_s3(self, image_data: bytes, key: str) -> str:
        """Upload image to S3 and return public URL"""
        try:
            # Upload to S3 (without ACL - bucket policy handles public access)
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=image_data,
                ContentType="image/png",
            )

            # Return public URL
            return f"https://{self.bucket_name}.s3.amazonaws.com/{key}"

        except Exception as e:
            print(f"Error uploading to S3: {str(e)}")
            raise

    def _normalize_generation_data(self, generation_data: Dict) -> Dict:
        """Convert DynamoDB data types back to expected frontend types"""
        if generation_data.get("is_public"):
            # Convert string back to boolean for frontend
            generation_data["is_public"] = generation_data["is_public"] == "true"

        if generation_data.get("character_data") and isinstance(
            generation_data["character_data"], str
        ):
            try:
                generation_data["character_data"] = json.loads(
                    generation_data["character_data"]
                )
            except:
                generation_data["character_data"] = None

        return generation_data

    def get_user_generations(
        self, user_id: str, limit: int = 20, last_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get user's image generations with pagination

        Args:
            user_id: User's ID
            limit: Number of items to return
            last_key: Last key for pagination

        Returns:
            Dictionary with generations and pagination info
        """
        if not self._initialized:
            self._initialize_aws_services()
        if not self.enabled:
            return {
                "success": False,
                "error": "Storage service not available",
                "generations": [],
            }

        try:
            query_params = {
                "IndexName": "user-index",
                "KeyConditionExpression": "user_id = :user_id",
                "ExpressionAttributeValues": {":user_id": user_id},
                "ScanIndexForward": False,  # Most recent first
                "Limit": limit,
            }

            if last_key:
                query_params["ExclusiveStartKey"] = {"generation_id": last_key}

            response = self.table.query(**query_params)

            # Normalize data types for frontend
            items = []
            for item in response.get("Items", []):
                items.append(self._normalize_generation_data(item))

            return {
                "success": True,
                "generations": items,
                "last_key": response.get("LastEvaluatedKey", {}).get("generation_id"),
                "count": len(items),
            }

        except Exception as e:
            print(f"Error getting user generations: {str(e)}")
            return {"success": False, "error": str(e), "generations": []}

    def get_generation_by_id(self, generation_id: str) -> Dict[str, Any]:
        """Get specific generation by ID"""
        try:
            response = self.table.get_item(Key={"generation_id": generation_id})

            if "Item" in response:
                item = self._normalize_generation_data(response["Item"])
                return {"success": True, "generation": item}
            else:
                return {"success": False, "error": "Generation not found"}

        except Exception as e:
            print(f"Error getting generation: {str(e)}")
            return {"success": False, "error": str(e)}

    def delete_generation(self, generation_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a generation (both metadata and image)"""
        try:
            # First get the generation to find the image key
            generation = self.get_generation_by_id(generation_id)

            if not generation["success"]:
                return generation

            gen_data = generation["generation"]

            # Verify user owns this generation
            if gen_data["user_id"] != user_id:
                return {"success": False, "error": "Unauthorized"}

            # Delete image from S3
            if gen_data.get("image_key"):
                self.s3_client.delete_object(
                    Bucket=self.bucket_name, Key=gen_data["image_key"]
                )

            # Delete metadata from DynamoDB
            self.table.delete_item(Key={"generation_id": generation_id})

            return {"success": True, "message": "Generation deleted successfully"}

        except Exception as e:
            print(f"Error deleting generation: {str(e)}")
            return {"success": False, "error": str(e)}

    def get_generation_stats(self, user_id: str) -> Dict[str, Any]:
        """Get user's generation statistics"""
        try:
            # Get all user generations (just count)
            response = self.table.query(
                IndexName="user-index",
                KeyConditionExpression="user_id = :user_id",
                ExpressionAttributeValues={":user_id": user_id},
                Select="COUNT",
            )

            total_generations = response.get("Count", 0)

            # You could add more stats here like:
            # - Most used models
            # - Generations per day/week
            # - Total storage used

            return {
                "success": True,
                "stats": {"total_generations": total_generations, "user_id": user_id},
            }

        except Exception as e:
            print(f"Error getting stats: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "stats": {"total_generations": 0},
            }

    def set_generation_public_status(
        self, generation_id: str, user_id: str, is_public: bool
    ) -> Dict[str, Any]:
        """Set the public status of a generation (publish/unpublish)"""
        try:
            # First get the generation to verify ownership
            generation = self.get_generation_by_id(generation_id)

            if not generation["success"]:
                return generation

            gen_data = generation["generation"]

            # Verify user owns this generation
            if gen_data["user_id"] != user_id:
                return {"success": False, "error": "Unauthorized"}

            # Update the public status
            timestamp = datetime.utcnow().isoformat()

            # Store as both boolean AND string for compatibility with both scan formats
            # This ensures it works regardless of how we query the data
            self.table.update_item(
                Key={"generation_id": generation_id},
                UpdateExpression="SET is_public = :is_public_str, updated_at = :updated_at",
                ExpressionAttributeValues={
                    ":is_public_str": "true" if is_public else "false",
                    ":updated_at": timestamp,
                },
            )

            action = "published" if is_public else "unpublished"
            print(f"✅ Generation {generation_id} {action} successfully")

            return {
                "success": True,
                "message": f"Generation {action} successfully",
                "is_public": is_public,
            }

        except Exception as e:
            print(f"Error updating generation public status: {str(e)}")
            return {"success": False, "error": str(e)}

    def _get_all_users_public_generations(self, limit: int = 50) -> List[Dict]:
        """
        Get public generations from all users using the user-index
        This works around the lack of a public-generations-index
        """
        try:
            # First, get a list of unique user_ids from recent activity
            # We'll scan a limited set to get user IDs, then query each user's generations

            # Alternative approach: Use the existing query patterns we know work
            # Since we can't scan, we'll need to track users who have published items

            # For now, return empty list - this would need a different architecture
            # to work properly without scan permissions
            return []

        except Exception as e:
            print(f"Error getting users for public generations: {str(e)}")
            return []

    def get_public_generations_workaround(self, user_id: str) -> List[Dict]:
        """Get public generations for a specific user (workaround method)"""
        try:
            # Query user's generations using existing user-index
            response = self.table.query(
                IndexName="user-index",
                KeyConditionExpression="user_id = :user_id",
                ExpressionAttributeValues={":user_id": user_id},
                ScanIndexForward=False,  # Most recent first
            )

            # Filter for public items
            public_items = []
            for item in response.get("Items", []):
                normalized_item = self._normalize_generation_data(item)
                # Check if it's public and not Studio Magic
                if (
                    normalized_item.get("is_public")
                    and normalized_item.get("image_model") != "flux-kontext-pro"
                ):
                    public_items.append(normalized_item)

            return public_items

        except Exception as e:
            print(f"Error getting user's public generations: {str(e)}")
            return []

    def get_public_generations(
        self, limit: int = 50, last_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get public generations for the explore page using DynamoDB scan with filter"""
        if not self._initialized:
            self._initialize_aws_services()
        if not self.enabled:
            return {
                "success": False,
                "error": "Storage service not available",
                "generations": [],
                "count": 0,
            }

        try:
            print("📊 Attempting to scan DynamoDB for public generations...")

            # First try the proper scan method
            scan_params = {
                "FilterExpression": "attribute_exists(is_public) AND (is_public = :public_true OR is_public = :public_bool)",
                "ExpressionAttributeValues": {
                    ":public_true": "true",  # String format
                    ":public_bool": True,  # Boolean format (for existing data)
                },
                "Limit": limit,
            }

            if last_key:
                scan_params["ExclusiveStartKey"] = {"generation_id": last_key}

            response = self.table.scan(**scan_params)

            # Normalize data types for frontend and sort by created_at (most recent first)
            items = []
            all_items_count = len(response.get("Items", []))

            for item in response.get("Items", []):
                normalized_item = self._normalize_generation_data(item)
                # Only include AI Influencer models (not Studio Magic)
                if normalized_item.get("image_model") != "flux-kontext-pro":
                    items.append(normalized_item)

            # Sort by created_at descending (most recent first)
            items.sort(key=lambda x: x.get("created_at", ""), reverse=True)

            print(
                f"📊 Scanned {all_items_count} total public items, filtered to {len(items)} AI Influencer models"
            )

            return {
                "success": True,
                "generations": items,
                "count": len(items),
                "last_key": response.get("LastEvaluatedKey", {}).get("generation_id"),
            }

        except Exception as e:
            if "AccessDeniedException" in str(e) and "Scan" in str(e):
                print(
                    "⚠️  Scan permission not yet active. Please check your AWS IAM policy."
                )
                print("📝 Returning empty marketplace until permission is resolved.")
                return {
                    "success": True,
                    "generations": [],
                    "count": 0,
                    "message": "Marketplace requires dynamodb:Scan permission. Please check AWS IAM policy.",
                }
            else:
                print(f"Error getting public generations: {str(e)}")
                return {
                    "success": False,
                    "error": str(e),
                    "generations": [],
                    "count": 0,
                }


# Initialize storage service
storage_service = StorageService()
