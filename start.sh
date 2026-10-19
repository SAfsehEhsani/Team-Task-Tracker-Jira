#!/bin/bash
# Team Task Tracker - 1-Click Startup Script for Linux/macOS

echo "==================================================="
echo "   Starting Team Task Tracker (PulseSync)"
echo "==================================================="

# 1. Check Python Virtual Environment
if [ ! -d "backend_venv" ]; then
    echo "[1/3] Creating Python virtual environment..."
    python3 -m venv backend_venv
    echo "[1/3] Installing backend requirements..."
    backend_venv/bin/pip install -r backend/requirements.txt
fi

# 2. Check Frontend Dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "[2/3] Installing frontend npm dependencies..."
    (cd frontend && npm install)
fi

# 3. Launch Servers
echo "[3/3] Launching Backend on http://127.0.0.1:8000 ..."
backend_venv/bin/python backend/manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!

echo "[3/3] Launching Frontend on http://localhost:3000 ..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "==================================================="
echo " Services started!"
echo " - Frontend: http://localhost:3000"
echo " - Backend:  http://127.0.0.1:8000"
echo " Press Ctrl+C to terminate both servers."
echo "==================================================="

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
