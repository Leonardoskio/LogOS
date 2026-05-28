#!/usr/bin/env bash
set -euo pipefail

NO_BROWSER=0
CHECK_ONLY=0

for arg in "$@"; do
  case "$arg" in
    --no-browser) NO_BROWSER=1 ;;
    --check-only) CHECK_ONLY=1 ;;
    *) echo "Uso: start-logos.sh [--no-browser] [--check-only]" >&2; exit 2 ;;
  esac
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
FRONTEND_FILE="$REPO_ROOT/frontend/index.html"
ENV_FILE="$REPO_ROOT/.env"
ENV_EXAMPLE_FILE="$REPO_ROOT/.env.example"
HEALTH_URL="http://localhost:3000/api/health"
PID_FILE="$SCRIPT_DIR/logos-backend.pid"
LOG_FILE="$SCRIPT_DIR/logos-backend.log"
WAIT_SECONDS=20

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "$1 non trovato. Installa Node.js 20+ con npm e riprova." >&2
    exit 1
  fi
}

backend_health() {
  node -e '
    const url = process.argv[1];
    const timeout = AbortSignal.timeout(1000);
    fetch(url, { signal: timeout })
      .then((response) => response.json())
      .then((body) => process.exit(body?.data?.status === "ok" ? 0 : 1))
      .catch(() => process.exit(1));
  ' "$HEALTH_URL" >/dev/null 2>&1
}

port_in_use() {
  node -e '
    const net = require("node:net");
    const socket = net.connect({ host: "127.0.0.1", port: 3000 });
    socket.setTimeout(500);
    socket.on("connect", () => {
      socket.destroy();
      process.exit(0);
    });
    socket.on("timeout", () => {
      socket.destroy();
      process.exit(1);
    });
    socket.on("error", () => process.exit(1));
  ' >/dev/null 2>&1
}

wait_backend_ready() {
  local deadline=$((SECONDS + WAIT_SECONDS))

  while [ "$SECONDS" -lt "$deadline" ]; do
    if backend_health; then
      return 0
    fi

    sleep 0.5
  done

  return 1
}

require_command node
require_command npm

if [ ! -f "$BACKEND_DIR/package.json" ]; then
  echo "Backend non trovato: $BACKEND_DIR" >&2
  exit 1
fi

if [ ! -f "$FRONTEND_FILE" ]; then
  echo "Frontend non trovato: $FRONTEND_FILE" >&2
  exit 1
fi

if [ "$CHECK_ONLY" -eq 1 ]; then
  echo "Check launcher LogOS completato."
  echo "Backend: $BACKEND_DIR"
  echo "Frontend: $FRONTEND_FILE"
  echo "Health: $HEALTH_URL"
  exit 0
fi

if [ ! -f "$ENV_FILE" ] && [ -f "$ENV_EXAMPLE_FILE" ]; then
  cp "$ENV_EXAMPLE_FILE" "$ENV_FILE"
  echo "Creato file .env da .env.example."
fi

if backend_health; then
  echo "Backend LogOS gia attivo su $HEALTH_URL."
else
  if port_in_use; then
    echo "La porta 3000 e gia in uso, ma $HEALTH_URL non risponde come LogOS." >&2
    exit 1
  fi

  (
    cd "$BACKEND_DIR"
    if command -v setsid >/dev/null 2>&1; then
      setsid npm run dev > "$LOG_FILE" 2>&1 &
    else
      npm run dev > "$LOG_FILE" 2>&1 &
    fi
    echo $! > "$PID_FILE"
  )

  echo "Backend LogOS in avvio..."

  if ! wait_backend_ready; then
    echo "Backend non pronto dopo $WAIT_SECONDS secondi. Log: $LOG_FILE" >&2
    exit 1
  fi
fi

if [ "$NO_BROWSER" -eq 0 ]; then
  FRONTEND_URI="$(node -e 'const { pathToFileURL } = require("node:url"); console.log(pathToFileURL(process.argv[1]).href);' "$FRONTEND_FILE")"

  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$FRONTEND_URI" >/dev/null 2>&1 &
    echo "Frontend aperto: $FRONTEND_URI"
  else
    echo "xdg-open non trovato. Apri manualmente: $FRONTEND_FILE"
  fi
else
  echo "Frontend pronto: $FRONTEND_FILE"
fi

echo "Per fermare il backend su Linux: bash ./desktopdemo/linux-vs/stop-logos.sh"
