#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-8000}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV=""

for arg in "$@"; do
  case "$arg" in
    --dev)  ENV="dev" ;;
    --local)  ENV="local" ;;
    --prod) ENV="prod" ;;
  esac
done

if [ -z "$ENV" ]; then
  echo "error: must pass --dev or --prod" >&2
  exit 1
fi

case "$ENV" in
  dev)  API_BASE="https://dev-backend.netliinks.com:443/" ;;
  local)  API_BASE="http://localhost:8080/" ;;
  prod) API_BASE="https://backend.netliinks.com:443/" ;;
esac

CLIENT_ID="${CLIENT_ID:-c3c0353462}"
CLIENT_SECRET="${CLIENT_SECRET:-2fc9f1be5d7b0d18f25be642b3af1e5b}"

CONFIG_FILE="$ROOT/public/src/scripts/config.js"
echo "window.APP_CONFIG = { baseUrl: '${API_BASE}', clientId: '${CLIENT_ID}', clientSecret: '${CLIENT_SECRET}' };" > "$CONFIG_FILE"
echo "[$ENV] config written → $CONFIG_FILE"

if ! command -v python3 &>/dev/null; then
  echo "error: python3 is required but not found" >&2
  exit 1
fi

echo "Serving $ROOT on http://localhost:$PORT"
python3 -m http.server "$PORT" --directory "$ROOT"
