#!/usr/bin/env python3
"""
AWS Cognito Judge Account Setup Script

This script creates pre-configured judge accounts for AWS Hackathon evaluation.
Run this once before deployment to set up judge access.
"""

import boto3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def setup_judge_accounts():
    """Set up judge accounts in AWS Cognito"""

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
        {
            "email": "genaihackathon2025@impetus.com",
            "name": "Hackathon Judge 1",
            "password": "HackathonJudge2025!",
        },
        {
            "email": "testing@devpost.com",
            "name": "Hackathon Judge 2",
            "password": "HackathonJudge2025!",
        },
    ]

    try:
        # Create judge group first
        try:
            cognito.create_group(
                GroupName="hackathon-judges",
                UserPoolId=user_pool_id,
                Description="AWS Hackathon Judges with unlimited access",
            )
            print("✅ Created hackathon-judges group")
        except cognito.exceptions.GroupExistsException:
            print("ℹ️  hackathon-judges group already exists")

        # Create each judge account
        for judge in judge_accounts:
            try:
                # Create user
                response = cognito.admin_create_user(
                    UserPoolId=user_pool_id,
                    Username=judge["email"],
                    UserAttributes=[
                        {"Name": "email", "Value": judge["email"]},
                        {"Name": "name", "Value": judge["name"]},
                        {"Name": "email_verified", "Value": "true"},
                    ],
                    TemporaryPassword=judge["password"],
                    MessageAction="SUPPRESS",  # Don't send welcome email
                )

                # Set permanent password
                cognito.admin_set_user_password(
                    UserPoolId=user_pool_id,
                    Username=judge["email"],
                    Password=judge["password"],
                    Permanent=True,
                )

                # Add to judge group
                cognito.admin_add_user_to_group(
                    UserPoolId=user_pool_id,
                    Username=judge["email"],
                    GroupName="hackathon-judges",
                )

                print(f"✅ Created judge account: {judge['email']}")

            except cognito.exceptions.UsernameExistsException:
                print(f"ℹ️  Judge account already exists: {judge['email']}")

                # Still try to add to group and set password
                try:
                    cognito.admin_set_user_password(
                        UserPoolId=user_pool_id,
                        Username=judge["email"],
                        Password=judge["password"],
                        Permanent=True,
                    )

                    cognito.admin_add_user_to_group(
                        UserPoolId=user_pool_id,
                        Username=judge["email"],
                        GroupName="hackathon-judges",
                    )
                    print(f"✅ Updated existing judge account: {judge['email']}")
                except Exception as e:
                    print(f"⚠️  Could not update {judge['email']}: {str(e)}")

            except Exception as e:
                print(f"❌ Error creating {judge['email']}: {str(e)}")
                return False

        print("\n🎉 Judge account setup complete!")
        print("\n📋 Judge Credentials:")
        for judge in judge_accounts:
            print(f"   Email: {judge['email']}")
            print(f"   Password: {judge['password']}")
            print()

        return True

    except Exception as e:
        print(f"❌ Setup failed: {str(e)}")
        return False


def verify_setup():
    """Verify judge accounts are set up correctly"""
    cognito = boto3.client(
        "cognito-idp", region_name=os.getenv("AWS_REGION", "us-east-1")
    )

    user_pool_id = os.getenv("NEXT_PUBLIC_AWS_USER_POOL_ID")

    try:
        # Check if group exists
        groups = cognito.list_groups(UserPoolId=user_pool_id)
        judge_group_exists = any(
            g["GroupName"] == "hackathon-judges" for g in groups["Groups"]
        )

        if judge_group_exists:
            print("✅ Judge group exists")

            # Check group members
            members = cognito.list_users_in_group(
                UserPoolId=user_pool_id, GroupName="hackathon-judges"
            )

            print(f"👥 Judge group has {len(members['Users'])} members:")
            for user in members["Users"]:
                email = next(
                    (
                        attr["Value"]
                        for attr in user["Attributes"]
                        if attr["Name"] == "email"
                    ),
                    "No email",
                )
                print(f"   - {email}")
        else:
            print("❌ Judge group not found")

    except Exception as e:
        print(f"❌ Verification failed: {str(e)}")


if __name__ == "__main__":
    print("🏆 AWS Hackathon Judge Account Setup")
    print("=====================================\n")

    # Check environment
    if not os.getenv("NEXT_PUBLIC_AWS_USER_POOL_ID"):
        print("❌ Please set up your environment variables first!")
        print("   Make sure NEXT_PUBLIC_AWS_USER_POOL_ID is in your .env file")
        exit(1)

    # Setup accounts
    success = setup_judge_accounts()

    if success:
        print("\n🔍 Verifying setup...")
        verify_setup()

        print("\n✅ Setup complete! Judges can now log in with:")
        print("   - genaihackathon2025@impetus.com")
        print("   - testing@devpost.com")
        print("   - Password: HackathonJudge2025!")
    else:
        print("\n❌ Setup failed. Please check your AWS credentials and User Pool ID.")
