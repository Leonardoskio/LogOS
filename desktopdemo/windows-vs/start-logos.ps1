param(
  [switch]$NoBrowser,
  [switch]$CheckOnly
)

$ErrorActionPreference = "Stop"

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$BackendDir = Join-Path $RepoRoot "backend"
$FrontendFile = Join-Path $RepoRoot "frontend\index.html"
$EnvFile = Join-Path $RepoRoot ".env"
$EnvExampleFile = Join-Path $RepoRoot ".env.example"
$HealthUrl = "http://localhost:3000/api/health"
$WaitSeconds = 20

function Test-CommandAvailable {
  param([string]$Name)
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-BackendHealth {
  try {
    $response = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 1
    return $response.data.status -eq "ok"
  } catch {
    return $false
  }
}

function Test-TcpPort {
  param(
    [string]$HostName,
    [int]$Port
  )

  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connect = $client.BeginConnect($HostName, $Port, $null, $null)
    if (-not $connect.AsyncWaitHandle.WaitOne(500, $false)) {
      return $false
    }

    $client.EndConnect($connect)
    return $true
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

function Wait-BackendReady {
  $deadline = (Get-Date).AddSeconds($WaitSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-BackendHealth) {
      return $true
    }

    Start-Sleep -Milliseconds 500
  }

  return $false
}

if (-not (Test-CommandAvailable "node")) {
  throw "Node.js non trovato. Installa Node.js 20+ e riprova."
}

if (-not (Test-CommandAvailable "npm")) {
  throw "npm non trovato. Installa Node.js con npm e riprova."
}

if (-not (Test-Path -LiteralPath (Join-Path $BackendDir "package.json"))) {
  throw "Backend non trovato: $BackendDir"
}

if (-not (Test-Path -LiteralPath $FrontendFile)) {
  throw "Frontend non trovato: $FrontendFile"
}

if ($CheckOnly) {
  Write-Host "Check launcher LogOS completato."
  Write-Host "Backend: $BackendDir"
  Write-Host "Frontend: $FrontendFile"
  Write-Host "Health: $HealthUrl"
  exit 0
}

if (-not (Test-Path -LiteralPath $EnvFile) -and (Test-Path -LiteralPath $EnvExampleFile)) {
  Copy-Item -LiteralPath $EnvExampleFile -Destination $EnvFile
  Write-Host "Creato file .env da .env.example."
}

$backendAlreadyRunning = Test-BackendHealth

if (-not $backendAlreadyRunning) {
  if (Test-TcpPort -HostName "localhost" -Port 3000) {
    throw "La porta 3000 e gia in uso, ma $HealthUrl non risponde come LogOS. Chiudi il processo sulla porta 3000 e riprova."
  }

  $backendCommand = "`$Host.UI.RawUI.WindowTitle = 'LogOS Backend'; npm run dev"
  Start-Process -FilePath "powershell.exe" `
    -WorkingDirectory $BackendDir `
    -ArgumentList @("-NoExit", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $backendCommand)

  Write-Host "Backend LogOS in avvio..."

  if (-not (Wait-BackendReady)) {
    throw "Backend non pronto dopo $WaitSeconds secondi. Controlla la finestra 'LogOS Backend'."
  }
} else {
  Write-Host "Backend LogOS gia attivo su $HealthUrl."
}

if (-not $NoBrowser) {
  $frontendUri = ([System.Uri]$FrontendFile).AbsoluteUri
  Start-Process $frontendUri
  Write-Host "Frontend aperto: $frontendUri"
} else {
  Write-Host "Frontend pronto: $FrontendFile"
}

Write-Host "Per fermare il backend, chiudi la finestra 'LogOS Backend'."
