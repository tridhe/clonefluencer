#!/usr/bin/env python3
"""
Test AWS connections to identify storage service issues
"""

import boto3
import os
from botocore.exceptions import ClientError


def test_aws_credentials():
    """Test AWS credentials"""
    print("🔐 Testing AWS credentials...")
    try:
        sts = boto3.client("sts")
        identity = sts.get_caller_identity()
        print(f"✅ AWS credentials working")
        print(f"   Account: {identity.get('Account')}")
        print(f"   User ARN: {identity.get('Arn')}")
        return True
    except Exception as e:
        print(f"❌ AWS credentials failed: {e}")
        return False


def test_s3_connection():
    """Test S3 connection"""
    print("\n🪣 Testing S3 connection...")
    bucket_name = os.getenv("S3_BUCKET_NAME", "influencer-ai-images-ttn-123")

    try:
        s3 = boto3.client("s3")
        s3.head_bucket(Bucket=bucket_name)
        print(f"✅ S3 bucket '{bucket_name}' accessible")
        return True
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        print(f"❌ S3 connection failed: {error_code} - {e}")
        return False
    except Exception as e:
        print(f"❌ S3 connection failed: {e}")
        return False


def test_dynamodb_connection():
    """Test DynamoDB connection"""
    print("\n🗄️ Testing DynamoDB connection...")
    table_name = os.getenv("DYNAMODB_TABLE_NAME", "influencer-ai-generations")

    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.Table(table_name)
        table.load()
        print(f"✅ DynamoDB table '{table_name}' exists and accessible")
        return True
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code == "ResourceNotFoundException":
            print(f"⚠️  DynamoDB table '{table_name}' does not exist")
            return create_dynamodb_table(table_name)
        else:
            print(f"❌ DynamoDB connection failed: {error_code} - {e}")
            return False
    except Exception as e:
        print(f"❌ DynamoDB connection failed: {e}")
        return False


def create_dynamodb_table(table_name):
    """Create DynamoDB table"""
    print(f"📝 Creating DynamoDB table '{table_name}'...")

    try:
        dynamodb = boto3.resource("dynamodb")
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[{"AttributeName": "generation_id", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "generation_id", "AttributeType": "S"},
                {"AttributeName": "user_id", "AttributeType": "S"},
                {"AttributeName": "created_at", "AttributeType": "S"},
                {"AttributeName": "is_public", "AttributeType": "S"},
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
            BillingMode="PAY_PER_REQUEST",
        )

        print("⏳ Waiting for table to be created...")
        table.wait_until_exists()
        print(f"✅ DynamoDB table '{table_name}' created successfully")
        return True

    except Exception as e:
        print(f"❌ Failed to create DynamoDB table: {e}")
        return False


def main():
    """Run all tests"""
    print("🧪 Testing AWS Connections for Storage Service")
    print("=" * 50)

    # Test credentials
    if not test_aws_credentials():
        print("\n❌ Cannot proceed without valid AWS credentials")
        return

    # Test S3
    s3_ok = test_s3_connection()

    # Test DynamoDB
    dynamodb_ok = test_dynamodb_connection()

    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"   AWS Credentials: ✅")
    print(f"   S3 Connection: {'✅' if s3_ok else '❌'}")
    print(f"   DynamoDB Connection: {'✅' if dynamodb_ok else '❌'}")

    if s3_ok and dynamodb_ok:
        print(
            "\n🎉 All AWS services are working! Storage service should initialize successfully."
        )
    else:
        print("\n⚠️  Some services failed. Check the errors above.")


if __name__ == "__main__":
    main()
