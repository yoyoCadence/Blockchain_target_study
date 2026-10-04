@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 goto missing_node
node scripts\start-research.mjs %*
set "researchExit=%errorlevel%"
if /I not "%~1"=="--check" pause
exit /b %researchExit%
:missing_node
echo Node.js 22+ : https://nodejs.org/
if /I not "%~1"=="--check" pause
exit /b 1
