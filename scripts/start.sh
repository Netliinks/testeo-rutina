#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-8000}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV=""

for arg in "$@"; do
  case "$arg" in
    --dev)  ENV="dev" ;;
    --prod) ENV="prod" ;;
  esac
done

if [ -z "$ENV" ]; then
  echo "error: must pass --dev or --prod" >&2
  exit 1
fi

case "$ENV" in
  dev)  API_BASE="https://dev-backend.netliinks.com:443/" ;;
  prod) API_BASE="https://backend.netliinks.com:443/" ;;
esac

CONFIG_FILE="$ROOT/public/src/scripts/config.js"
echo "window.APP_CONFIG = { baseUrl: '${API_BASE}' };" > "$CONFIG_FILE"
echo "[$ENV] config written → $CONFIG_FILE"

if ! command -v python3 &>/dev/null; then
  echo "error: python3 is required but not found" >&2
  exit 1
fi

echo "Serving $ROOT on http://localhost:$PORT"
python3 -m http.server "$PORT" --directory "$ROOT"
