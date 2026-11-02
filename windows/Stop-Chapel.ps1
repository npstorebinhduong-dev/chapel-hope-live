$ErrorActionPreference = 'Stop'
try {
  $root = Split-Path -Parent $PSScriptRoot
  $runtimeDir = Join-Path $env:LOCALAPPDATA 'ChapelOfHope'
  $hash = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($root))).Replace('-','').Substring(0,16)
  $stateFile = Join-Path $runtimeDir ($hash + '.json')
  if (!(Test-Path -LiteralPath $stateFile)) { Write-Host 'No process owned by this launcher. No programs stopped.'; exit 0 }
  $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
  $proc = Get-Process -Id $state.processId -ErrorAction SilentlyContinue
  if (!$proc) { Remove-Item -LiteralPath $stateFile; Write-Host 'Chapel is already stopped.'; exit 0 }
  $info = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + [int]$state.processId)
  if ($proc.StartTime.ToUniversalTime().Ticks.ToString() -ne $state.startTicks -or $proc.Path -ne $state.node -or !$info.CommandLine.Contains('"' + $state.entry + '"')) { throw 'Process identity differs from launcher record. Refusing to stop it.' }
  try { Invoke-RestMethod 'http://127.0.0.1:3001/api/launcher/stop' -Method Post -Headers @{'X-Chapel-Launcher'=$state.token} -TimeoutSec 3 | Out-Null } catch { Write-Host 'Graceful stop unavailable; checking the owned process again.' }
  if (!$proc.WaitForExit(5000)) {
    $proc.Refresh()
    if ($proc.StartTime.ToUniversalTime().Ticks.ToString() -ne $state.startTicks) { throw 'Process identity changed.' }
    Stop-Process -Id $state.processId
  }
  Remove-Item -LiteralPath $stateFile
  Write-Host 'Chapel stopped. Other Node.js programs and TikFinity were not touched.'
} catch { Write-Host ('ERROR: ' + $_.Exception.Message) -ForegroundColor Red; exit 1 }
