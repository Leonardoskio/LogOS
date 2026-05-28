#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/logos-backend.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "Nessun backend LogOS registrato dal launcher Linux."
  exit 0
fi

PID="$(cat "$PID_FILE")"

if ! kill -0 "$PID" >/dev/null 2>&1; then
  rm -f "$PID_FILE"
  echo "Il backend LogOS non risulta attivo."
  exit 0
fi

kill -- "-$PID" >/dev/null 2>&1 || kill "$PID" >/dev/null 2>&1 || true
rm -f "$PID_FILE"

echo "Backend LogOS fermato."
