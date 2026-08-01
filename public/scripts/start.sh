#!/usr/bin/env bash
set -euo pipefail

PORT=${PORT:-8000}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v python3 &>/dev/null; then
  echo "error: python3 is required but not found" >&2
  exit 1
fi

echo "Serving $ROOT on http://localhost:$PORT"
python3 -m http.server "$PORT" --directory "$ROOT"
