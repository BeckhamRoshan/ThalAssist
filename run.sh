#!/bin/bash

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

# Check prerequisites
for cmd in python3 node npm; do
  if ! command_exists $cmd; then
    echo -e "${RED}❌ $cmd is not installed.${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# ---- Backend Setup ----
echo -e "${YELLOW}🔧 Setting up backend...${NC}"
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment (Git Bash / Windows)
if [ -f ".venv/Scripts/activate" ]; then
    source .venv/Scripts/activate
elif [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
else
    echo -e "${RED}❌ Virtual environment activate script not found!${NC}"
    exit 1
fi

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${GREEN}✅ Backend setup complete${NC}"

# ---- Frontend Setup ----
echo -e "${YELLOW}🔧 Setting up frontend...${NC}"
cd ../frontend
npm install

echo -e "${GREEN}✅ Frontend setup complete${NC}"

# ---- Start Backend ----
start_backend() {
    echo -e "${YELLOW}🚀 Starting backend server...${NC}"
    cd ../backend
    source .venv/Scripts/activate
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started on http://127.0.0.1:8000${NC}"
}

# ---- Start Frontend ----
start_frontend() {
    echo -e "${YELLOW}🚀 Starting frontend server...${NC}"
    cd ../frontend
    npm start &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started on http://localhost:3000${NC}"
}

# Cleanup function
cleanup() {
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID 2>/dev/null; fi
    if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID 2>/dev/null; fi
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}
trap cleanup INT TERM

# Start servers
start_backend
sleep 3
start_frontend
sleep 3

echo -e "${GREEN}🎉 ThalAssist+ is now running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://127.0.0.1:8000"
echo "📖 API Docs: http://127.0.0.1:8000/docs"
echo "Press Ctrl+C to stop both servers${NC}"

wait
