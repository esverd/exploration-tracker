@echo off
REM ============================================
REM Exploration Tracker — Windows Launcher
REM Double-click this file to start the app.
REM ============================================

cd /d "%~dp0"

echo.
echo ===========================
echo   Exploration Tracker
echo ===========================
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed.
    echo.
    echo Please install Node.js from https://nodejs.org
    echo ^(Download the LTS version and run the installer^)
    echo.
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies (first run only^)...
    call npm install
    echo.
)

REM Build if needed
if not exist "dist" (
    echo Building the app (first run only^)...
    call npm run build
    echo.
)

echo Starting the app...
echo The app will open in your browser shortly.
echo.
echo To stop the app, close this window or press Ctrl+C.
echo.

set OPEN_BROWSER=1
node server/index.js
