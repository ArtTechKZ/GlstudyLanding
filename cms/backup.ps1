param([Parameter(Mandatory=$true)][string]$InstancePath,[Parameter(Mandatory=$true)][string]$BackupRoot)
$ErrorActionPreference='Stop'
$source=(Resolve-Path -LiteralPath $InstancePath).Path
if(!(Test-Path -LiteralPath (Join-Path $source 'data/gl-study.db'))){throw 'Expected stopped local SQLite instance'}
# Stop Directus before invocation for consistent DB and upload capture.
$target=Join-Path $BackupRoot ('gl-study-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $target | Out-Null
foreach($name in @('data','uploads','extensions')){ $p=Join-Path $source $name; if(Test-Path -LiteralPath $p){Copy-Item -LiteralPath $p -Destination $target -Recurse} }
Get-ChildItem -LiteralPath $target -File -Recurse | Get-FileHash -Algorithm SHA256 | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $target 'manifest.json')
Write-Output $target
