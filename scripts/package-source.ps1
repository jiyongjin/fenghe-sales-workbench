param([string]$OutputPath)
$ErrorActionPreference = 'Stop'
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (-not $OutputPath) { $OutputPath = Join-Path (Split-Path -Parent $sourceRoot) 'fenghe-sales-workbench-github.zip' }
$archivePath = [IO.Path]::GetFullPath($OutputPath)
if ($archivePath.StartsWith($sourceRoot + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Place the archive outside the source directory.' }
if (Test-Path -LiteralPath $archivePath) { throw 'Archive already exists; choose a new path rather than overwriting it.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open($archivePath,[IO.Compression.ZipArchiveMode]::Create)
$count = 0
try {
  foreach ($file in Get-ChildItem -LiteralPath $sourceRoot -File -Force -Recurse) {
    $relative = $file.FullName.Substring($sourceRoot.Length + 1).Replace('\','/')
    if ($relative -match '(^|/)(node_modules|\.git|data|\.openai|\.wrangler|\.vinext|\.next|outputs|validation)(/|$)' -or $relative -match '^(dist-local|dist|coverage)/' -or $relative -match '(^|/)\.env' -or $relative -match '\.(log|zip|pem|key|tsbuildinfo)$') { continue }
    if ($relative.EndsWith('.csv') -and -not $relative.StartsWith('skills/fenghe-workbench-replica/assets/demo-fixture/')) { throw ('Unexpected CSV in source archive: ' + $relative) }
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$file.FullName,('fenghe-sales-workbench/' + $relative),[IO.Compression.CompressionLevel]::Optimal) | Out-Null
    $count++
  }
} finally { $zip.Dispose() }
Write-Output ('Source archive: ' + $archivePath)
Write-Output ('Files: ' + $count)
Write-Output 'No real data, node_modules, hosting identity, or Git history was included.'
