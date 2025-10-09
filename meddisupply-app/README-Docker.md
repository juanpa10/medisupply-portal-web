```markdown
Docker build and run (meddisupply-app)

This project includes a reproducible multi-stage Dockerfile that builds the Angular app and serves it with nginx.

Important: the Docker builder stage runs the Tailwind CLI during the build so the final production CSS is fully processed. There is no need to manually compile or copy CSS into a running container.

Build the Docker image (from the `meddisupply-app` folder):

```powershell
# build image (tag it e.g. meddisupply:latest)
docker build -t meddisupply:latest .
```

Run the container locally and map container port 80 to host port 4200:

```powershell
# run container and map container port 80 to host 4200
docker run --rm -p 4200:80 --name meddisupply-local meddisupply:latest
```

Open http://localhost:4200/ in your browser to see the app.

Notes:
- The Dockerfile performs an `npm ci` install and runs the Tailwind CLI (to compile `src/styles.scss`) before running `ng build --configuration production`. The final stage uses nginx to serve the build output.
- If you change Tailwind or PostCSS configuration you only need to rebuild the image; the build stage will pick up the changes and produce the processed CSS in the image.

Docker Compose
--------------

This repository also includes a `docker-compose.yml` with two services:

- `web`: builds the production image (same as the Dockerfile) and serves it with nginx on port 4200.
- `dev`: optional development service that mounts your source and runs `ng serve` with hot-reload on port 4201.

Common commands (run from the `meddisupply-app` folder):

```powershell
# Start production web service (builds image if needed, runs detached)
docker-compose up -d --build web

# Check logs
docker-compose logs -f web

# Stop services
docker-compose down
```

Notes & troubleshooting
- If `npm ci` fails during the Docker build, confirm `package.json` and `package-lock.json` are in sync (the builder runs `npm ci`). Run `npm install` locally and commit the updated lockfile before building in CI.
- The builder uses `node:22-bullseye-slim` (Debian-based) to avoid missing build tools; this is slightly larger than Alpine but more robust for native dependency compilation. If you prefer smaller images, we can switch to Alpine and install build dependencies explicitly.
- The production image includes precompiled CSS; you don't need to copy assets or styles into a running container.

If you'd like, I can also add a GitHub Actions workflow to build and push the image to a registry automatically.

```
Docker build and run (meddisupply-app)

This project includes a multi-stage Dockerfile that builds the Angular app and serves it with nginx.

Build the Docker image (from the `meddisupply-app` folder):

```powershell
# build image (tag it e.g. meddisupply:latest)
docker build -t meddisupply:latest .
```

Run the container locally and map port 80 to host port 4200:

```powershell
# run container and map container port 80 to host 4200
docker run --rm -p 4200:80 --name meddisupply-local meddisupply:latest
```

Open http://localhost:4200/ in your browser.

Notes:
- The Dockerfile performs an npm install and a production build inside the builder stage. The final image uses nginx to serve the built files.
- To reduce image size further you can use a different base node image (e.g. node:18-slim) or run `npm ci --production` with appropriate steps, but the current configuration is simple and reliable.

If you want, I can also add a Docker Compose file for local development or GitHub Actions for automated image builds.

Docker Compose
--------------

This repository includes a `docker-compose.yml` with two services:

- `web`: builds the production image (same as the Dockerfile) and serves it with nginx on port 4200.
- `dev`: optional development service that mounts your source and runs `ng serve` with hot-reload on port 4201.

Commands:

```powershell
# Start production web service (builds image if needed)
docker-compose up --build web

# Start optional dev service (hot reload on port 4201)
docker-compose up dev

# Stop services
docker-compose down
```

Notes:
- `dev` uses a Node container and mounts your project, so it will reflect local code changes.
- Choose `web` for a production-like environment, or `dev` for active development.
