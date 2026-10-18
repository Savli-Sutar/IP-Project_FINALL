@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0backend"

echo ===================================================
echo Starting Service Request ^& SLA Tracking System...
echo ===================================================

set "MVN_CMD=mvn"

where mvn >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Users\SURENDRA SUTAR\.gemini\antigravity\scratch\maven\apache-maven-3.9.6\bin\mvn.cmd" (
        set "MVN_CMD=C:\Users\SURENDRA SUTAR\.gemini\antigravity\scratch\maven\apache-maven-3.9.6\bin\mvn.cmd"
    ) else if exist "%~dp0..\..\..\maven\apache-maven-3.9.6\bin\mvn.cmd" (
        set "MVN_CMD=%~dp0..\..\..\maven\apache-maven-3.9.6\bin\mvn.cmd"
    ) else if exist "%USERPROFILE%\.gemini\antigravity\scratch\maven\apache-maven-3.9.6\bin\mvn.cmd" (
        set "MVN_CMD=%USERPROFILE%\.gemini\antigravity\scratch\maven\apache-maven-3.9.6\bin\mvn.cmd"
    ) else (
        echo [ERROR] Maven not found in PATH or scratch directory.
        echo Please ensure Maven is installed or in your PATH.
        pause
        exit /b 1
    )
)

echo Using Maven: !MVN_CMD!
echo.
echo Once the application starts, open your browser and navigate to:
echo   http://localhost:8080/index.html
echo.
echo Demo Accounts:
echo   Employee:   employee@company.com / password123
echo   IT Support: support@company.com  / password123
echo ===================================================
echo.

"!MVN_CMD!" spring-boot:run
pause
