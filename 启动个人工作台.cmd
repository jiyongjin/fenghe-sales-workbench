@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0启动个人工作台.ps1"
if errorlevel 1 pause
