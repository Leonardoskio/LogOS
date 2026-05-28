#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../.." && pwd)"
LAUNCHER_PATH="$SCRIPT_DIR/start-logos.sh"

DESKTOP_DIR="$HOME/Desktop"
if [ -f "$HOME/.config/user-dirs.dirs" ]; then
  # shellcheck disable=SC1090
  . "$HOME/.config/user-dirs.dirs"
  if [ -n "${XDG_DESKTOP_DIR:-}" ]; then
    DESKTOP_DIR="${XDG_DESKTOP_DIR/#\$HOME/$HOME}"
  fi
fi

if [ ! -f "$LAUNCHER_PATH" ]; then
  echo "Launcher non trovato: $LAUNCHER_PATH" >&2
  exit 1
fi

mkdir -p "$DESKTOP_DIR"
chmod +x "$SCRIPT_DIR/start-logos.sh" "$SCRIPT_DIR/stop-logos.sh" "$SCRIPT_DIR/install-desktop-shortcut.sh" 2>/dev/null || true

SHORTCUT_PATH="$DESKTOP_DIR/LogOS.desktop"

cat > "$SHORTCUT_PATH" <<EOF
[Desktop Entry]
Type=Application
Name=LogOS
Comment=Avvia backend LogOS e apre il frontend
Exec=$LAUNCHER_PATH
Path=$REPO_ROOT
Terminal=false
Categories=Development;
EOF

chmod +x "$SHORTCUT_PATH" 2>/dev/null || true

echo "Collegamento creato: $SHORTCUT_PATH"
