@echo off
title Team Task Tracker - Production Launcher
echo ===================================================
echo     Launching Team Task Tracker in PRODUCTION Mode
echo ===================================================
echo.

:: 1. Verify MongoDB connection
echo [1/3] Verifying MongoDB service...
net start MongoDB >nul 2>&1

:: 2. Launch Django Backend
echo [2/3] Launching Production Django API on http://127.0.0.1:8000 ...
start "PulseSync Backend (Production)" cmd /k "backend_venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000"

:: 3. Launch Next.js Production Server
echo [3/3] Launching Next.js Production Build on http://localhost:3000 ...
start "PulseSync Frontend (Production)" cmd /k "cd frontend && npm run start"

echo.
echo ===================================================
echo  Production Services are LIVE!
echo  - Frontend Web UI:  http://localhost:3000
echo  - Backend REST API: http://127.0.0.1:8000/api/health/
echo.
echo  To run with Docker instead:
echo    docker compose up --build -d
echo ===================================================
pause
