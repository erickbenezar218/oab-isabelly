#!/bin/sh
# Roda no terminal do container **api** no Coolify (não no db). Usa DATABASE_URL já configurada.
set -e
EMAIL="$1"
if [ -z "$EMAIL" ]; then
  echo "Uso: sh coolify-demo-seed.sh seu@email.com"
  exit 1
fi
BASE="${SIMULAORDEM_RAW_BASE:-https://raw.githubusercontent.com/erickbenezar218/oab-isabelly/main}"
DIR="/tmp/simulaordem-seed-$$"
mkdir -p "$DIR"
cd "$DIR"
fetch() {
  url="$1"
  out="$2"
  if command -v wget >/dev/null 2>&1; then
    wget -qO "$out" "$url"
  elif command -v curl >/dev/null 2>&1; then
    curl -fsSL -o "$out" "$url"
  else
    echo "Instale wget ou curl no container, ou baixe os arquivos manualmente."
    exit 1
  fi
}
fetch "$BASE/api/scripts/seed-demo-progress.mjs" seed.mjs
fetch "$BASE/banco_oab.json" banco_oab.json
export NODE_PATH="${NODE_PATH:-/app/node_modules}"
node seed.mjs "$EMAIL"
rm -rf "$DIR"
echo "Pronto. Recarregue simulaordem.com.br (F5)."
