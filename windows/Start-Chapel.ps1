$ErrorActionPreference = 'Stop'
try {
  $root = Split-Path -Parent $PSScriptRoot
  Set-Location -LiteralPath $root
  if (!(Test-Path -LiteralPath (Join-Path $root 'package.json'))) { throw 'Extract the entire ZIP before starting.' }
  $node = (Get-Command node.exe -ErrorAction Stop).Source
  $version = [version]((& $node --version).Trim().TrimStart('v'))
  if ($version -lt [version]'22.12.0') { throw 'Install Node.js 22.12 or newer (Node 24 LTS recommended), then reopen this launcher.' }
  $runtimeDir = Join-Path $env:LOCALAPPDATA 'ChapelOfHope'
  New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
  $hash = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($root))).Replace('-','').Substring(0,16)
  $stateFile = Join-Path $runtimeDir ($hash + '.json')
  $entry = Join-Path $root 'production\server.cjs'
  if (!(Test-Path -LiteralPath $entry) -or !(Test-Path -LiteralPath (Join-Path $root 'apps\client\dist\index.html'))) {
    Write-Host 'Production build absent. Installing locked dependencies and building...'
    $npm = (Get-Command npm.cmd -ErrorAction Stop).Source
    & $npm ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed. Check Internet access and retry.' }
    & $npm run build:windows
    if ($LASTEXITCODE -ne 0) { throw 'Production build failed. See output above.' }
  }
  $health = $null
  try { $health = Invoke-RestMethod 'http://127.0.0.1:3001/api/health' -TimeoutSec 2 } catch {}
  if ($health -and $health.product -eq 'chapel-hope-live') {
    Write-Host ('Existing Chapel server: ' + $health.version + ' / source ' + $health.mode)
    if ($health.version -ne '1.9.0') { throw 'Another Chapel version is running. Stop it with its own launcher before starting v1.9.' }
  } else {
    if (Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue) { throw 'Port 3001 belongs to another program. Stop/change that program; this launcher will not kill it.' }
    $token = [guid]::NewGuid().ToString('N')
    $env:CHAPEL_LAUNCH_TOKEN = $token
    $env:CHAPEL_CONFIG = Join-Path $runtimeDir 'operator-settings.json'
    $env:PORT = '3001'
    $proc = Start-Process -FilePath $node -ArgumentList ('"' + $entry + '"') -WorkingDirectory $root -PassThru -RedirectStandardOutput (Join-Path $runtimeDir ($hash + '.out.log')) -RedirectStandardError (Join-Path $runtimeDir ($hash + '.err.log'))
    $proc.Refresh()
    @{ processId=$proc.Id; startTicks=$proc.StartTime.ToUniversalTime().Ticks.ToString(); entry=$entry; token=$token; node=$node } | ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding UTF8
    Remove-Item Env:CHAPEL_LAUNCH_TOKEN
    $ready = $false
    for ($i=0; $i -lt 30; $i++) {
      if ($proc.HasExited) { throw ('Server exited. See logs in ' + $runtimeDir) }
      try { $health=Invoke-RestMethod 'http://127.0.0.1:3001/api/health' -TimeoutSec 1; if ($health.product -eq 'chapel-hope-live') { $ready=$true; break } } catch {}
      Start-Sleep -Milliseconds 500
    }
    if (!$ready) { throw 'Server did not become ready. Use STOP_CHAPEL_LIVE.bat and inspect logs.' }
  }
  Write-Host ('SERVER READY | source: ' + $health.mode + ' | TikFinity: ' + $health.source)
  Write-Host 'LIVE: http://127.0.0.1:3001/  | CONTROL: http://127.0.0.1:3001/control'
  Write-Host 'Click the LIVE window to unlock audio. Run preflight in Control. GO LIVE remains your decision.'
  # Prefer a dedicated capture window so switching Control tabs cannot go on stream.
  $edgeRoot = ${env:ProgramFiles(x86)}
  if (!$edgeRoot) { $edgeRoot = $env:ProgramFiles }
  $edge = Join-Path $edgeRoot 'Microsoft\Edge\Application\msedge.exe'
  if (Test-Path -LiteralPath $edge) {
    Start-Process -FilePath $edge -ArgumentList '--new-window','--app=http://127.0.0.1:3001/','--window-size=540,960'
  } else {
    Start-Process 'http://127.0.0.1:3001/'
    Write-Host 'Move the LIVE tab to its own window before Window Capture.'
  }
  Start-Process 'http://127.0.0.1:3001/control'
} catch { Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red; exit 1 }
