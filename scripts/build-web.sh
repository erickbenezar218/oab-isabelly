#!/usr/bin/env bash
# Gera web-dist/ para deploy (Coolify / Docker).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/app"

export VITE_API_URL="${VITE_API_URL:-/api}"
export VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-}"

echo "→ VITE_API_URL=$VITE_API_URL"
echo "→ VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:+[definido]}"

cp "$ROOT/banco_oab.json" ./public/banco_oab.json
npm run build

rm -rf "$ROOT/web-dist"
cp -r dist "$ROOT/web-dist"
echo "✓ web-dist/ pronto ($(du -sh "$ROOT/web-dist" | cut -f1))"
