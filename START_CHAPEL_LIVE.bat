@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0windows\Start-Chapel.ps1"
if errorlevel 1 (
  echo Chapel could not start. Read the error above.
  pause
  exit /b 1
)
echo Chapel is running. Use STOP_CHAPEL_LIVE.bat to stop this instance.
pause
