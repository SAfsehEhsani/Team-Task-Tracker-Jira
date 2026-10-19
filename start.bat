@echo off
title Team Task Tracker Launcher
echo ===================================================
echo    Starting Team Task Tracker (PulseSync)
echo ===================================================
echo.

:: 1. Ensure Local MongoDB Service is Running
echo [1/4] Checking MongoDB Service...
net start MongoDB >nul 2>&1
echo   MongoDB Service active or ready.

:: 2. Check/Setup Python Virtual Environment
echo [2/4] Verifying Backend Environment...
if not exist "backend_venv\Scripts\activate.bat" (
    echo   First time setup: Creating Python virtual environment 'backend_venv'...
    python -m venv backend_venv
    echo   Installing backend dependencies from backend\requirements.txt...
    backend_venv\Scripts\pip install -r backend\requirements.txt
) else (
    echo   Backend virtual environment verified.
)

:: 3. Check/Setup Frontend Node Modules
echo [3/4] Verifying Frontend Dependencies...
if not exist "frontend\node_modules" (
    echo   First time setup: Installing npm dependencies in frontend...
    cd frontend && npm install && cd ..
) else (
    echo   Frontend dependencies verified.
)

:: 4. Launch Backend and Frontend
echo [4/4] Launching Servers...
echo   - Backend REST API: http://127.0.0.1:8000
echo   - Frontend Web UI:  http://localhost:3000
echo.

start "Team Task Tracker - Backend (Django)" cmd /k "backend_venv\Scripts\python backend\manage.py runserver 127.0.0.1:8000"
start "Team Task Tracker - Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

timeout /t 3 >nul 2>&1
start http://localhost:3000

echo ===================================================
echo  All services launched successfully!
echo  - Frontend: http://localhost:3000
echo  - Backend:  http://127.0.0.1:8000
echo.
echo  Browser opened to http://localhost:3000
echo  Press any key to close this launcher monitor.
echo ===================================================
pause
