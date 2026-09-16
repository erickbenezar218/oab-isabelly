# Frontend pré-buildado em web-dist/ (scripts/build-web.sh)
# Evita npm/vite no Coolify — só nginx servindo arquivos estáticos.
FROM nginx:alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY web-dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
