@echo off
chcp 65001 > nul
setlocal EnableDelayedExpansion

:: 1. Set the source folder to the folder this bat file is launched from
cd /d "%~dp0"
set "PLUGIN_DIR=%~dp0"
if "%PLUGIN_DIR:~-1%"=="\" set "PLUGIN_DIR=%PLUGIN_DIR:~0,-1%"

echo ==============================================================================
echo   INSTALLAZIONE / AGGIORNAMENTO PLUGIN SUPERSET: Calendar Filter
echo   Cartella sorgente: "%PLUGIN_DIR%"
echo ==============================================================================
echo.

:: 2. Run the PowerShell script, passing the source folder explicitly
powershell -NoProfile -ExecutionPolicy Bypass -File "%PLUGIN_DIR%\install-plugin.ps1" -PluginPath "%PLUGIN_DIR%" -SkipBuild %*

set "RC=%ERRORLEVEL%"
if %RC% neq 0 (
    echo.
    echo [ERROR] The Calendar Filter installation failed ^(Code: %RC%^).
) else (
    echo.
    echo [OK] Calendar Filter aggiornato e registrato con successo
)

echo.
rem Con NO_PAUSE=1 non aspetta il tasto (uso da script); il codice di uscita e' quello dell'installazione.
if not "%NO_PAUSE%"=="1" pause
exit /b %RC%
