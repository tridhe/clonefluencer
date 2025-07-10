#!/bin/bash

# InfluencerAI Backend Startup Script

echo "🚀 Starting InfluencerAI Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📋 Please copy env.example to .env and configure your AWS credentials"
    echo "💡 Example: cp env.example .env"
fi

# Start the Flask server
echo "🌟 Starting Flask server on http://localhost:5000..."
python influencer_api.py 