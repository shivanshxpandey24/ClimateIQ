@echo off
title AeroResilience Environmental Intelligence Platform
echo ============================================================
echo   Starting AeroResilience Platform with Live OpenAQ v3
echo ============================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "AeroResilience Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --port 8000 --host 127.0.0.1 --reload"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "AeroResilience Frontend (Vite/React)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ============================================================
echo   AeroResilience is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000/docs
echo ============================================================
timeout /t 3 > nul
start http://localhost:5173
