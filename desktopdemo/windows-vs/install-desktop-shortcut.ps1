$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$LauncherPath = Join-Path $PSScriptRoot "Start-LogOS.cmd"
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "LogOS.lnk"

if (-not (Test-Path -LiteralPath $LauncherPath)) {
  throw "Launcher non trovato: $LauncherPath"
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $LauncherPath
$shortcut.WorkingDirectory = $RepoRoot
$shortcut.Description = "Avvia backend LogOS e apre il frontend"
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
$shortcut.Save()

Write-Host "Collegamento creato: $ShortcutPath"
