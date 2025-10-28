## ---------- Stage 1: build Angular ----------
FROM node:22-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npx tailwindcss -i ./src/styles.scss -o ./src/styles.scss --minify
RUN npm run build -- --configuration production

## ---------- Stage 2: Nginx ----------
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/meddisupply-app/browser /usr/share/nginx/html

# nginx.conf está en la raíz del contexto (según tu captura)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# proxy_params está en etc/nginx/proxy_params (usa la ruta completa)
COPY etc/nginx/proxy_params /etc/nginx/proxy_params

# valida configuración
RUN nginx -t

EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
