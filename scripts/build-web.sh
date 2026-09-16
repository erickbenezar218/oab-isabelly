#!/usr/bin/env bash
# Gera web-dist/ para deploy local / fallback.
# Em produção o Coolify builda o Dockerfile (multi-stage) com VITE_* do painel.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/app"

load_env_var() {
  local key="$1"
  [[ -n "${!key:-}" ]] && return 0
  local file="$ROOT/.env"
  [[ -f "$file" ]] || return 0
  local line
  line="$(grep -E "^${key}=" "$file" | tail -1 || true)"
  [[ -n "$line" ]] || return 0
  local val="${line#*=}"
  val="${val%\"}"
  val="${val#\"}"
  val="${val%\'}"
  val="${val#\'}"
  export "$key=$val"
}

load_env_var VITE_API_URL
load_env_var VITE_GOOGLE_CLIENT_ID
load_env_var GOOGLE_CLIENT_ID

export VITE_API_URL="${VITE_API_URL:-/api}"
export VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID:-}}"

echo "→ VITE_API_URL=$VITE_API_URL"
if [[ -n "$VITE_GOOGLE_CLIENT_ID" ]]; then
  echo "→ VITE_GOOGLE_CLIENT_ID=[definido]"
else
  echo "→ VITE_GOOGLE_CLIENT_ID=[vazio — Google login não entra no bundle]"
fi

cp "$ROOT/banco_oab.json" ./public/banco_oab.json
npm run build

rm -rf "$ROOT/web-dist"
cp -r dist "$ROOT/web-dist"
echo "✓ web-dist/ pronto ($(du -sh "$ROOT/web-dist" | cut -f1))"
