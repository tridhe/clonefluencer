#!/bin/bash
# 🚀 Quick GitHub Deployment Script for Clonefluencer

echo "🚀 Starting GitHub-based deployment setup..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: This is not a git repository. Run 'git init' first."
    exit 1
fi

# Check if we have commits
if ! git log --oneline -1 > /dev/null 2>&1; then
    echo "⚠️  No commits found. Creating initial commit..."
    git add .
    git commit -m "Initial commit - Clonefluencer hackathon project"
fi

# Check for GitHub remote
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "🔗 GitHub Setup Required:"
    echo "1. Create a new repository on GitHub.com"
    echo "2. Make it PUBLIC (so judges can see it)"
    echo "3. Copy the repository URL"
    echo ""
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/ai-influencer.git): " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ Repository URL is required. Exiting."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ Added GitHub remote: $repo_url"
fi

# Clean up deployment artifacts
echo ""
echo "🧹 Cleaning up manual deployment files..."
rm -rf deployments/
rm -f *.zip
rm -f backend/deployment-package.zip
echo "✅ Cleaned up deployment artifacts"

# Ensure important files are ready
echo ""
echo "📋 Preparing deployment files..."

# Check if Dockerfile exists
if [ ! -f "backend/Dockerfile" ]; then
    echo "❌ Missing backend/Dockerfile - this should have been created"
    exit 1
fi

# Check if amplify.yml exists
if [ ! -f "amplify.yml" ]; then
    echo "❌ Missing amplify.yml - this should exist"
    exit 1
fi

echo "✅ All deployment files ready"

# Commit any changes
echo ""
echo "💾 Committing changes..."
git add .
git commit -m "Prepare for GitHub deployment - Add Docker configs" || echo "No new changes to commit"

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Code pushed to GitHub!"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "🌐 FRONTEND DEPLOYMENT (AWS Amplify):"
    echo "1. Go to: https://console.aws.amazon.com/amplify/"
    echo "2. Click 'New app' → 'Host web app'"
    echo "3. Select 'GitHub' and connect your repo"
    echo "4. Choose branch: main"
    echo "5. Build settings will auto-detect amplify.yml ✅"
    echo "6. Deploy! (Takes ~10 minutes)"
    echo ""
    echo "🔧 BACKEND DEPLOYMENT (Choose one):"
    echo ""
    echo "Option A - Railway (Fastest):"
    echo "1. Go to: https://railway.app"
    echo "2. 'Deploy from GitHub repo'"
    echo "3. Select your repo, root directory: /backend"
    echo "4. Deploy! (2 minutes)"
    echo ""
    echo "Option B - Render (Free):"
    echo "1. Go to: https://render.com"
    echo "2. 'New Web Service'"
    echo "3. Connect GitHub repo, root: /backend"
    echo "4. Deploy!"
    echo ""
    echo "Option C - AWS App Runner:"
    echo "1. Go to: https://console.aws.amazon.com/apprunner/"
    echo "2. 'Create service' → GitHub source"
    echo "3. Root directory: /backend"
    echo ""
    echo "🎯 After deployment:"
    echo "- Update Amplify environment variables with backend URL"
    echo "- Test the live application"
    echo "- Share GitHub repo + live URLs with judges"
    echo ""
    echo "📖 Full guide available in: github-deployment-guide.md"
else
    echo ""
    echo "❌ Failed to push to GitHub. Please check:"
    echo "1. GitHub repository exists and is accessible"
    echo "2. You have push permissions"
    echo "3. Remote URL is correct: $(git remote get-url origin)"
    echo ""
    echo "Try: git push -u origin main --verbose"
fi 