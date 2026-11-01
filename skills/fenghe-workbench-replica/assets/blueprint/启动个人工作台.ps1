# Copyright (c) 2026 风禾永进 (https://yongjin.tech)
# SPDX-License-Identifier: MIT
param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$workbenchProject = $PSScriptRoot
$workbenchPort = if ($env:WORKBENCH_PORT) { [int]$env:WORKBENCH_PORT } else { 4318 }
$workbenchUrl = "http://127.0.0.1:$workbenchPort"
$workbenchData = if ($env:WORKBENCH_DATA_DIR) { $env:WORKBENCH_DATA_DIR } else { Join-Path $workbenchProject 'data' }
$runtimeFolder = Join-Path $workbenchProject 'data\runtime'
if (-not (Test-Path (Join-Path $workbenchProject 'dist-local\index.html'))) {
  throw '本机页面还未构建。请在项目目录运行 npm run build:local。'
}
$workbenchNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $workbenchNode) { throw '需要先安装 Node.js 22 或更高版本。' }
function Test-WorkbenchReady {
  try {
    $response = Invoke-RestMethod "$workbenchUrl/api/bootstrap" -TimeoutSec 5
    $modeMatches = $response.mode -eq 'local'
    $directoryMatches = [IO.Path]::GetFullPath($response.directory) -eq [IO.Path]::GetFullPath($workbenchData)
    return ($modeMatches -and $directoryMatches)
  } catch { return $false }
}
if (-not (Test-WorkbenchReady)) {
  New-Item -ItemType Directory -Force -Path $runtimeFolder | Out-Null
  $serverFile = Join-Path $workbenchProject 'server\local.mjs'
  $process = Start-Process -FilePath $workbenchNode.Source -ArgumentList @('"' + $serverFile + '"') -WorkingDirectory $workbenchProject -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtimeFolder 'server.log') -RedirectStandardError (Join-Path $runtimeFolder 'server-error.log')
  Set-Content -LiteralPath (Join-Path $runtimeFolder 'server.pid') -Value $process.Id
  $readyDeadline = (Get-Date).AddSeconds(30)
  while (-not (Test-WorkbenchReady) -and (Get-Date) -lt $readyDeadline) { Start-Sleep -Milliseconds 500 }
  if (-not (Test-WorkbenchReady)) { throw '启动未成功。请查看 data\runtime\server-error.log；也可能是端口 4318 被其他程序占用。' }
}
if (-not $NoBrowser) { Start-Process $workbenchUrl }
Write-Host "工作台已打开：$workbenchUrl"
Write-Host '数据自动写入 CSV。本程序独立运行，关闭 Codex 不会影响它。'
