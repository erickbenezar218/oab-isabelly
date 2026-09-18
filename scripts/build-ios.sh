#!/usr/bin/env bash
# Build web + sync Capacitor iOS (API produção + Google + ícones).
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
  val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
  export "$key=$val"
}

for key in VITE_API_URL VITE_GOOGLE_CLIENT_ID VITE_GOOGLE_IOS_CLIENT_ID GOOGLE_CLIENT_ID GOOGLE_IOS_CLIENT_ID; do
  load_env_var "$key"
done

# App nativo sempre fala com a API pública (não use /api relativo do Docker web).
export VITE_API_URL="${VITE_IOS_API_URL:-https://simulaordem.com.br/api}"
export VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID:-${GOOGLE_CLIENT_ID:-}}"
export VITE_GOOGLE_IOS_CLIENT_ID="${VITE_GOOGLE_IOS_CLIENT_ID:-${GOOGLE_IOS_CLIENT_ID:-}}"

echo "→ VITE_API_URL=$VITE_API_URL"
echo "→ VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:+[definido]}"
echo "→ VITE_GOOGLE_IOS_CLIENT_ID=${VITE_GOOGLE_IOS_CLIENT_ID:+[definido]}"

cp "$ROOT/banco_oab.json" ./public/banco_oab.json
DISABLE_PWA=true npm run build

npx cap sync ios
node "$ROOT/scripts/patch-ios-plist.mjs"
echo "✓ iOS pronto — abra: npm run cap:open (em app/)"
