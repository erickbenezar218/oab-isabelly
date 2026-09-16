# Build do frontend no deploy — usa VITE_* do Coolify (build args).
FROM node:22-alpine AS builder
WORKDIR /app

COPY app/package.json app/package-lock.json ./
RUN npm ci

COPY app/ ./
COPY banco_oab.json ./public/banco_oab.json

ARG VITE_API_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
