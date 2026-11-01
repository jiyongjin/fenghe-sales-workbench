# Copyright (c) 2026 风禾永进 (https://yongjin.tech)
# SPDX-License-Identifier: MIT
$ErrorActionPreference = 'Stop'
$runtimePidFile = Join-Path $PSScriptRoot 'data\runtime\server.pid'
if (-not (Test-Path -LiteralPath $runtimePidFile)) { Write-Host '没有由一键启动器启动的工作台。'; exit 0 }
$workbenchProcessId = [int](Get-Content -LiteralPath $runtimePidFile)
$workbenchProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $workbenchProcessId" -ErrorAction SilentlyContinue
$expectedServer = Join-Path $PSScriptRoot 'server\local.mjs'
if ($workbenchProcess -and $workbenchProcess.CommandLine -like "*$expectedServer*") {
  Stop-Process -Id $workbenchProcessId
  Write-Host '工作台服务已停止。CSV 数据仍保留在 data 目录。'
} else { Write-Host '原服务已经停止，未操作其他程序。' }
