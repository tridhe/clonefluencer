#!/usr/bin/env python3
"""
Fix AWS Cognito Judge Account Status

This script fixes the FORCE_CHANGE_PASSWORD status for judge accounts
and ensures they are properly verified.
"""

import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def fix_judge_accounts():
    """Fix judge accounts in AWS Cognito"""

    # Initialize Cognito client
    cognito = boto3.client(
        "cognito-idp", region_name=os.getenv("AWS_REGION", "us-east-1")
    )

    # Your User Pool ID (from your .env file)
    user_pool_id = os.getenv("NEXT_PUBLIC_AWS_USER_POOL_ID")

    if not user_pool_id:
        print(
            "❌ Error: NEXT_PUBLIC_AWS_USER_POOL_ID not found in environment variables"
        )
        return False

    judge_accounts = [
        {"email": "genaihackathon2025@impetus.com", "password": "HackathonJudge2025!"},
        {"email": "testing@devpost.com", "password": "HackathonJudge2025!"},
    ]

    try:
        for judge in judge_accounts:
            try:
                # Set permanent password and mark as verified
                cognito.admin_set_user_password(
                    UserPoolId=user_pool_id,
                    Username=judge["email"],
                    Password=judge["password"],
                    Permanent=True,  # This removes FORCE_CHANGE_PASSWORD status
                )

                # Confirm the user if not already confirmed
                try:
                    cognito.admin_confirm_sign_up(
                        UserPoolId=user_pool_id, Username=judge["email"]
                    )
                except Exception as e:
                    if "UserNotFoundException" in str(e):
                        print(f"❌ User not found: {judge['email']}")
                        continue
                    elif "NotAuthorizedException" in str(e):
                        # User already confirmed, this is fine
                        pass
                    else:
                        print(f"⚠️  Could not confirm {judge['email']}: {str(e)}")

                # Verify email attribute
                cognito.admin_update_user_attributes(
                    UserPoolId=user_pool_id,
                    Username=judge["email"],
                    UserAttributes=[{"Name": "email_verified", "Value": "true"}],
                )

                print(f"✅ Fixed account: {judge['email']}")
                print("   - Removed FORCE_CHANGE_PASSWORD status")
                print("   - Confirmed user")
                print("   - Verified email")

            except cognito.exceptions.UserNotFoundException:
                print(f"❌ User not found: {judge['email']}")
            except Exception as e:
                print(f"❌ Error fixing {judge['email']}: {str(e)}")
                return False

        print("\n🎉 Judge accounts fixed successfully!")
        print("\n📋 Try logging in with:")
        for judge in judge_accounts:
            print(f"   Email: {judge['email']}")
            print(f"   Password: {judge['password']}")
            print()

        return True

    except Exception as e:
        print(f"❌ Fix failed: {str(e)}")
        return False


if __name__ == "__main__":
    print("🔧 AWS Hackathon Judge Account Fix")
    print("=================================\n")

    # Check environment
    if not os.getenv("NEXT_PUBLIC_AWS_USER_POOL_ID"):
        print("❌ Please set up your environment variables first!")
        print("   Make sure NEXT_PUBLIC_AWS_USER_POOL_ID is in your .env file")
        exit(1)

    # Fix accounts
    fix_judge_accounts()
