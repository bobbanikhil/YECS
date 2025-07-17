#!/bin/bash

# YECS Deployment Script
echo "🚀 Starting YECS deployment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Create project directory if it doesn't exist
mkdir -p yecs-system
cd yecs-system

echo "📁 Setting up project structure..."

# Create backend directory structure
mkdir -p backend/models backend/utils backend/database
mkdir -p frontend/src/components frontend/src/pages frontend/src/services
mkdir -p frontend/public
mkdir -p tests

# Backend deployment
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
echo "Initializing database..."
python -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('✅ Database initialized successfully')
"

# Start backend server in background
echo "🚀 Starting backend server..."
nohup python app.py > backend.log 2>&1 &
echo $! > backend.pid
echo "✅ Backend server started on http://localhost:5000"

cd ..

# Frontend deployment
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install

# Build production version
echo "Building frontend..."
npm run build

# Install serve globally if not already installed
if ! command -v serve &> /dev/null; then
    echo "Installing serve package..."
    npm install -g serve
fi

# Start frontend server in background
echo "🚀 Starting frontend server..."
nohup serve -s build -l 3000 > frontend.log 2>&1 &
echo $! > frontend.pid
echo "✅ Frontend server started on http://localhost:3000"

cd ..

echo ""
echo "🎉 YECS deployment completed successfully!"
echo ""
echo "📊 Services:"
echo "   • Backend API: http://localhost:5000"
echo "   • Frontend App: http://localhost:3000"
echo ""
echo "📋 Log files:"
echo "   • Backend: backend/backend.log"
echo "   • Frontend: frontend/frontend.log"
echo ""
echo "🛑 To stop services:"
echo "   • Backend: kill \$(cat backend/backend.pid)"
echo "   • Frontend: kill \$(cat frontend/frontend.pid)"
echo ""
echo "🔍 Health check:"
echo "   curl http://localhost:5000/"
echo ""
