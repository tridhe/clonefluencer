#!/usr/bin/env python3
"""
AWS Setup Checker for InfluencerAI Storage

This script checks your AWS configuration and permissions for DynamoDB and S3.
Run this to diagnose storage setup issues.
"""

import boto3
import os
from botocore.exceptions import ClientError, NoCredentialsError


def check_aws_credentials():
    """Check if AWS credentials are configured"""
    print("🔐 Checking AWS Credentials...")

    try:
        session = boto3.Session()
        credentials = session.get_credentials()

        if credentials is None:
            print("❌ No AWS credentials found")
            print("💡 Configure credentials using one of these methods:")
            print(
                "   - Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables"
            )
            print("   - Use AWS CLI: aws configure")
            print("   - Use IAM roles (if running on EC2)")
            return False

        print(f"✅ AWS credentials found")
        print(f"   Access Key: {credentials.access_key[:8]}...")

        # Test credentials by making a simple call
        sts = boto3.client("sts")
        identity = sts.get_caller_identity()
        print(f"   User ARN: {identity.get('Arn')}")
        print(f"   Account: {identity.get('Account')}")

        return True

    except NoCredentialsError:
        print("❌ AWS credentials not configured")
        return False
    except ClientError as e:
        print(f"❌ AWS credentials invalid: {e}")
        return False
    except Exception as e:
        print(f"❌ Error checking credentials: {e}")
        return False


def check_dynamodb_permissions():
    """Check DynamoDB permissions"""
    print("\n🗄️  Checking DynamoDB Permissions...")

    table_name = os.getenv("DYNAMODB_TABLE_NAME", "influencer-ai-generations")

    try:
        dynamodb = boto3.client("dynamodb")

        # Try to describe the table (if it exists)
        try:
            response = dynamodb.describe_table(TableName=table_name)
            print(f"✅ Table '{table_name}' exists and accessible")
            print(f"   Status: {response['Table']['TableStatus']}")
            print(f"   Items: {response['Table'].get('ItemCount', 'Unknown')}")
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "ResourceNotFoundException":
                print(f"⚠️  Table '{table_name}' does not exist")
                print("   This is normal for first-time setup")

                # Test if we can create tables
                try:
                    # Try to list tables to test permissions
                    dynamodb.list_tables()
                    print("✅ DynamoDB permissions appear to be working")
                    print("   Table will be created automatically on first use")
                    return True
                except ClientError as perm_error:
                    print(f"❌ DynamoDB permission error: {perm_error}")
                    return False
            else:
                print(f"❌ DynamoDB access error: {e}")
                return False

    except Exception as e:
        print(f"❌ Error checking DynamoDB: {e}")
        return False


def check_s3_permissions():
    """Check S3 permissions"""
    print("\n🪣 Checking S3 Permissions...")

    bucket_name = os.getenv("S3_BUCKET_NAME", "influencer-ai-images")

    try:
        s3 = boto3.client("s3")

        # Try to check if bucket exists
        try:
            s3.head_bucket(Bucket=bucket_name)
            print(f"✅ Bucket '{bucket_name}' exists and accessible")

            # Test put/get permissions with a test object
            test_key = "test/permissions-check.txt"
            test_content = b"This is a test file for permissions checking"

            try:
                # Test upload
                s3.put_object(Bucket=bucket_name, Key=test_key, Body=test_content)
                print("✅ S3 upload permissions working")

                # Test download
                s3.get_object(Bucket=bucket_name, Key=test_key)
                print("✅ S3 download permissions working")

                # Cleanup test file
                s3.delete_object(Bucket=bucket_name, Key=test_key)
                print("✅ S3 delete permissions working")

                return True

            except ClientError as e:
                print(f"❌ S3 operation failed: {e}")
                return False

        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                print(f"⚠️  Bucket '{bucket_name}' does not exist")
                print("   You need to create this bucket manually")
                print(f"   Or update S3_BUCKET_NAME environment variable")
                return False
            else:
                print(f"❌ S3 access error: {e}")
                return False

    except Exception as e:
        print(f"❌ Error checking S3: {e}")
        return False


def check_environment_variables():
    """Check required environment variables"""
    print("\n⚙️  Checking Environment Variables...")

    required_vars = ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"]

    optional_vars = ["DYNAMODB_TABLE_NAME", "S3_BUCKET_NAME"]

    all_good = True

    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * 8}...")
        else:
            print(f"❌ {var}: Not set")
            all_good = False

    for var in optional_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {value}")
        else:
            print(f"⚠️  {var}: Using default")

    return all_good


def print_setup_recommendations():
    """Print setup recommendations"""
    print("\n📝 Setup Recommendations:")
    print("\n1. AWS Permissions Required:")
    print(
        "   - DynamoDB: CreateTable, DescribeTable, PutItem, GetItem, Query, DeleteItem"
    )
    print("   - S3: CreateBucket, PutObject, GetObject, DeleteObject, ListBucket")

    print("\n2. Quick Setup Commands:")
    print("   # Create DynamoDB table")
    print("   aws dynamodb create-table --table-name influencer-ai-generations \\")
    print("     --attribute-definitions AttributeName=generation_id,AttributeType=S \\")
    print("                            AttributeName=user_id,AttributeType=S \\")
    print("                            AttributeName=created_at,AttributeType=S \\")
    print("     --key-schema AttributeName=generation_id,KeyType=HASH \\")
    print(
        "     --global-secondary-indexes IndexName=user-index,KeySchema=[{AttributeName=user_id,KeyType=HASH},{AttributeName=created_at,KeyType=RANGE}],Projection={ProjectionType=ALL} \\"
    )
    print("     --billing-mode PAY_PER_REQUEST")

    print("\n   # Create S3 bucket (replace with unique name)")
    print("   aws s3 mb s3://influencer-ai-images-your-unique-suffix")
    print(
        "   aws s3api put-bucket-acl --bucket influencer-ai-images-your-unique-suffix --acl public-read"
    )

    print("\n3. For detailed setup instructions, see:")
    print("   - AWS_STORAGE_SETUP.md")
    print("   - AWS_COGNITO_SETUP.md")


def main():
    """Main function"""
    print("🚀 InfluencerAI AWS Storage Setup Checker")
    print("=" * 50)

    # Check environment variables
    env_ok = check_environment_variables()

    # Check AWS credentials
    creds_ok = check_aws_credentials()

    if not creds_ok:
        print("\n❌ Cannot proceed without valid AWS credentials")
        print_setup_recommendations()
        return

    # Check DynamoDB
    dynamo_ok = check_dynamodb_permissions()

    # Check S3
    s3_ok = check_s3_permissions()

    # Summary
    print("\n" + "=" * 50)
    print("📊 Setup Status Summary:")
    print(f"   Environment Variables: {'✅' if env_ok else '❌'}")
    print(f"   AWS Credentials: {'✅' if creds_ok else '❌'}")
    print(f"   DynamoDB Access: {'✅' if dynamo_ok else '❌'}")
    print(f"   S3 Access: {'✅' if s3_ok else '❌'}")

    if all([env_ok, creds_ok, dynamo_ok, s3_ok]):
        print("\n🎉 All checks passed! Storage should work correctly.")
    else:
        print("\n⚠️  Some issues found. See recommendations above.")
        print_setup_recommendations()


if __name__ == "__main__":
    main()
