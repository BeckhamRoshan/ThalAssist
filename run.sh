#!/bin/bash

# ThalAssist+ Startup Script
echo "🩸 Starting ThalAssist+ Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python is installed
if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16 or higher.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Setup backend
echo -e "${YELLOW}🔧 Setting up backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source .venv/bin/activate || source .venv/Scripts/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p app/services/utils

echo -e "${GREEN}✅ Backend setup complete${NC}"

# Setup frontend
echo -e "${YELLOW}🔧 Setting up frontend...${NC}"
cd ../frontend

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo -e "${GREEN}✅ Frontend setup complete${NC}"

# Function to start backend
start_backend() {
    echo -e "${YELLOW}🚀 Starting backend server...${NC}"
    cd backend
    source .venv/bin/activate || source .venv/Scripts/activate
    export PYTHONPATH="${PYTHONPATH}:$(pwd)"
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started on http://127.0.0.1:8000${NC}"
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}🚀 Starting frontend server...${NC}"
    cd frontend
    npm start &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started on http://localhost:3000${NC}"
}

# Function to cleanup processes
cleanup() {
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

# Start both servers
echo -e "${YELLOW}🚀 Starting ThalAssist+ servers...${NC}"

# Go back to root directory
cd ..

# Start backend
start_backend
sleep 3

# Start frontend  
start_frontend
sleep 3

echo -e "${GREEN}"
echo "🎉 ThalAssist+ is now running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://127.0.0.1:8000"
echo "📖 API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo -e "${NC}"

# Wait for background processes
wait