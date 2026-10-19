@echo off
title Team Task Tracker Launcher
echo ===================================================
echo    Starting Team Task Tracker (PulseSync)
echo ===================================================
echo.

echo [1/2] Launching Django REST Backend on http://127.0.0.1:8000 ...
start "Team Task Tracker - Backend (Django)" cmd /k "backend_venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000"

echo [2/2] Launching Next.js Frontend on http://localhost:3000 ...
start "Team Task Tracker - Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo  Services started in new terminal windows!
echo  - Frontend Web UI:  http://localhost:3000
echo  - Backend REST API: http://127.0.0.1:8000/api/health/
echo.
echo  Access:
echo    Open http://localhost:3000 to sign in with your real account.
echo ===================================================
pause
