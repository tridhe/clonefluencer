#!/usr/bin/env python3
"""
AWS Resources Setup Script for InfluencerAI

This script creates the required AWS resources for image storage:
- DynamoDB table for metadata
- S3 bucket for images (with unique name)
"""

import boto3
import os
import json
import time
from botocore.exceptions import ClientError


def create_dynamodb_table():
    """Create DynamoDB table for image generations"""
    print("🗄️  Creating DynamoDB table...")

    table_name = os.getenv("DYNAMODB_TABLE_NAME", "influencer-ai-generations")

    try:
        dynamodb = boto3.client("dynamodb")

        # Check if table already exists
        try:
            response = dynamodb.describe_table(TableName=table_name)
            print(f"✅ Table '{table_name}' already exists")
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] != "ResourceNotFoundException":
                print(f"❌ Error checking table: {e}")
                return False

        # Create the table
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[{"AttributeName": "generation_id", "KeyType": "HASH"}],
            AttributeDefinitions=[
                {"AttributeName": "generation_id", "AttributeType": "S"},
                {"AttributeName": "user_id", "AttributeType": "S"},
                {"AttributeName": "created_at", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "user-index",
                    "KeySchema": [
                        {"AttributeName": "user_id", "KeyType": "HASH"},
                        {"AttributeName": "created_at", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                    "ProvisionedThroughput": {
                        "ReadCapacityUnits": 5,
                        "WriteCapacityUnits": 5,
                    },
                }
            ],
            ProvisionedThroughput={"ReadCapacityUnits": 5, "WriteCapacityUnits": 5},
        )

        print(f"⏳ Waiting for table '{table_name}' to be created...")

        # Wait for table to be active
        waiter = dynamodb.get_waiter("table_exists")
        waiter.wait(TableName=table_name)

        print(f"✅ Table '{table_name}' created successfully")
        return True

    except ClientError as e:
        print(f"❌ Failed to create DynamoDB table: {e}")
        return False


def create_s3_bucket():
    """Create S3 bucket for image storage"""
    print("\n🪣 Creating S3 bucket...")

    # Generate a unique bucket name
    import random
    import string

    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
    bucket_name = f"influencer-ai-images-{suffix}"

    try:
        s3 = boto3.client("s3")

        # Create bucket
        try:
            # For us-east-1, don't specify LocationConstraint
            region = os.getenv("AWS_REGION", "us-east-1")
            if region == "us-east-1":
                s3.create_bucket(Bucket=bucket_name)
            else:
                s3.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={"LocationConstraint": region},
                )

            print(f"✅ Bucket '{bucket_name}' created successfully")

        except ClientError as e:
            if e.response["Error"]["Code"] == "BucketAlreadyExists":
                print(f"⚠️  Bucket name '{bucket_name}' already exists globally")
                return False
            else:
                print(f"❌ Failed to create bucket: {e}")
                return False

        # Set bucket policy for public read access
        try:
            bucket_policy = {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Sid": "PublicReadGetObject",
                        "Effect": "Allow",
                        "Principal": "*",
                        "Action": "s3:GetObject",
                        "Resource": f"arn:aws:s3:::{bucket_name}/*",
                    }
                ],
            }

            s3.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(bucket_policy))

            print(f"✅ Bucket policy set for public read access")

        except ClientError as e:
            print(f"⚠️  Warning: Could not set bucket policy: {e}")
            print("   Images may not be publicly accessible")

        # Update environment variable suggestion
        print(f"\n📝 Add this to your backend/.env file:")
        print(f"S3_BUCKET_NAME={bucket_name}")

        return True

    except Exception as e:
        print(f"❌ Error creating S3 bucket: {e}")
        return False


def create_iam_policy():
    """Create IAM policy for storage permissions"""
    print("\n🔐 Creating IAM policy...")

    table_name = os.getenv("DYNAMODB_TABLE_NAME", "influencer-ai-generations")

    try:
        iam = boto3.client("iam")

        # Get current user
        sts = boto3.client("sts")
        identity = sts.get_caller_identity()
        account_id = identity["Account"]

        policy_name = "InfluencerAI-Storage-Policy"

        policy_document = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": [
                        "dynamodb:CreateTable",
                        "dynamodb:DescribeTable",
                        "dynamodb:PutItem",
                        "dynamodb:GetItem",
                        "dynamodb:Query",
                        "dynamodb:DeleteItem",
                        "dynamodb:UpdateItem",
                        "dynamodb:ListTables",
                    ],
                    "Resource": [
                        f"arn:aws:dynamodb:*:{account_id}:table/{table_name}",
                        f"arn:aws:dynamodb:*:{account_id}:table/{table_name}/index/*",
                    ],
                },
                {
                    "Effect": "Allow",
                    "Action": [
                        "s3:CreateBucket",
                        "s3:PutObject",
                        "s3:GetObject",
                        "s3:DeleteObject",
                        "s3:PutObjectAcl",
                        "s3:ListBucket",
                        "s3:PutBucketPolicy",
                    ],
                    "Resource": [
                        "arn:aws:s3:::influencer-ai-images-*",
                        "arn:aws:s3:::influencer-ai-images-*/*",
                    ],
                },
            ],
        }

        try:
            # Create policy
            response = iam.create_policy(
                PolicyName=policy_name,
                PolicyDocument=json.dumps(policy_document),
                Description="Policy for InfluencerAI storage operations",
            )

            policy_arn = response["Policy"]["Arn"]
            print(f"✅ Policy '{policy_name}' created successfully")

            # Get current user name
            user_arn = identity["Arn"]
            user_name = user_arn.split("/")[-1]

            # Attach policy to user
            iam.attach_user_policy(UserName=user_name, PolicyArn=policy_arn)

            print(f"✅ Policy attached to user '{user_name}'")
            return True

        except ClientError as e:
            if e.response["Error"]["Code"] == "EntityAlreadyExists":
                print(f"⚠️  Policy '{policy_name}' already exists")

                # Try to attach existing policy
                try:
                    user_arn = identity["Arn"]
                    user_name = user_arn.split("/")[-1]
                    policy_arn = f"arn:aws:iam::{account_id}:policy/{policy_name}"

                    iam.attach_user_policy(UserName=user_name, PolicyArn=policy_arn)
                    print(f"✅ Existing policy attached to user")
                    return True

                except ClientError as attach_error:
                    print(f"⚠️  Could not attach policy: {attach_error}")
                    return False
            else:
                print(f"❌ Failed to create IAM policy: {e}")
                return False

    except Exception as e:
        print(f"❌ Error with IAM operations: {e}")
        return False


def main():
    """Main setup function"""
    print("🚀 InfluencerAI AWS Resources Setup")
    print("=" * 50)

    # Check credentials first
    try:
        sts = boto3.client("sts")
        identity = sts.get_caller_identity()
        print(f"🔐 Setting up resources for: {identity['Arn']}")
    except Exception as e:
        print(f"❌ AWS credentials not configured: {e}")
        return

    success_count = 0
    total_steps = 3

    # Step 1: Create IAM policy
    if create_iam_policy():
        success_count += 1
        print("⏳ Waiting for IAM changes to propagate...")
        time.sleep(10)  # Wait for IAM changes

    # Step 2: Create DynamoDB table
    if create_dynamodb_table():
        success_count += 1

    # Step 3: Create S3 bucket
    if create_s3_bucket():
        success_count += 1

    # Summary
    print("\n" + "=" * 50)
    print(f"📊 Setup completed: {success_count}/{total_steps} steps successful")

    if success_count == total_steps:
        print("\n🎉 All AWS resources created successfully!")
        print("\n📝 Next steps:")
        print("1. Restart your backend server")
        print("2. Test image generation while signed in")
        print("3. Check that images are stored in AWS")

    else:
        print("\n⚠️  Some steps failed. You may need to:")
        print("1. Check AWS permissions")
        print("2. Follow the manual setup guide in AWS_STORAGE_SETUP.md")
        print("3. Contact AWS support if issues persist")


if __name__ == "__main__":
    main()
