@echo off
cd /d "%~dp0backend"
echo Starting Service Request & SLA Tracking System...
mvn spring-boot:run
pause
