# Build stage — Vite 6 + Rollup (estável em Linux/CI)
FROM node:22-bookworm-slim AS builder

WORKDIR /app

ARG VITE_API_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV NODE_OPTIONS=--max-old-space-size=4096
ENV CI=true

COPY app/package*.json app/.npmrc ./
RUN npm ci

COPY app/ ./
COPY banco_oab.json ./public/banco_oab.json
COPY app/public/pecas_oab.json ./public/pecas_oab.json

RUN npm run build

# Production stage
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
