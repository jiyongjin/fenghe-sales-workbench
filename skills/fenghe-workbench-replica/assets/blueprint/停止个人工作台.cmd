@echo off
chcp 65001 >nul
rem Copyright (c) 2026 风禾永进 (https://yongjin.tech)
rem SPDX-License-Identifier: MIT
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0停止个人工作台.ps1"
pause
