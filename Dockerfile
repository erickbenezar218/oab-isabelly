# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY app/package*.json ./
RUN npm ci

COPY app/ ./
COPY banco_oab.json ./public/banco_oab.json

RUN npm run build

# Production stage
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
