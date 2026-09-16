#!/bin/sh
set -e

echo "==> Node $(node -v) / npm $(npm -v)"

# Garante bindings nativos Linux (Tailwind 4 / lightningcss)
if ! node -e "require('@tailwindcss/oxide-linux-x64-gnu')" 2>/dev/null; then
  echo "==> Instalando @tailwindcss/oxide-linux-x64-gnu"
  npm install @tailwindcss/oxide-linux-x64-gnu@4.3.3 --no-save --legacy-peer-deps
fi
if ! node -e "require('lightningcss-linux-x64-gnu')" 2>/dev/null; then
  echo "==> Instalando lightningcss-linux-x64-gnu"
  npm install lightningcss-linux-x64-gnu@1.33.0 --no-save --legacy-peer-deps
fi

echo "==> VITE_API_URL=${VITE_API_URL:-/api}"
echo "==> VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID:+[set]}"

npm run build
