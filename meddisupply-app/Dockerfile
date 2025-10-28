## ---------- Stage 1: build Angular ----------
FROM node:22-bullseye-slim AS builder
WORKDIR /app

# Dependencias
COPY package*.json ./
RUN npm ci --silent

# Código fuente
COPY . .

# Compilar Tailwind dentro de styles.scss
RUN npx tailwindcss -i ./src/styles.scss -o ./src/styles.scss --minify

# Build de producción (usa environment.prod.ts)
RUN npm run build -- --configuration production


## ---------- Stage 2: Nginx ----------
FROM nginx:stable-alpine

# Limpiar contenido default y copiar build
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/meddisupply-app/browser /usr/share/nginx/html

# Copiar configuración de Nginx
# (Asegúrate de que nginx.conf y proxy_params estén junto al Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY proxy_params /etc/nginx/proxy_params

# Validar configuración (falla el build si hay error)
RUN nginx -t

EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
