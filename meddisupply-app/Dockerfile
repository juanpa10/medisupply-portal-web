## Stage 1: build the Angular app
FROM node:22-bullseye-slim as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
# Compile Tailwind into the SCSS file so Angular CLI will include processed CSS
# We overwrite src/styles.scss with the compiled output (plain CSS is valid SCSS).
RUN npx tailwindcss -i ./src/styles.scss -o ./src/styles.scss --minify

# Now build the production bundle (Angular will include the processed styles.scss)
RUN npm run build -- --configuration production

## Stage 2: serve with nginx
FROM nginx:stable-alpine
# Remove default nginx content and copy the production build. Newer Angular builds
# place output under dist/<app>/browser; copy that directory's contents into nginx root.
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist/meddisupply-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
