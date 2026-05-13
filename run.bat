@echo off
chcp 65001 >nul 2>&1
echo ================================================
echo   Copilot Switch - BYOK Config Manager
echo ================================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.8+
    pause
    exit /b 1
)

:: Install dependencies
echo [INFO] Installing dependencies...
pip install -q -r requirements.txt

:: Start server
echo.
echo [INFO] Starting server, open http://127.0.0.1:5000
start http://127.0.0.1:5000
python copilot_switch.py

pause
