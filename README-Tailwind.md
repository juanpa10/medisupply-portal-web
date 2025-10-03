Tailwind setup instructions for this Angular project

This repository contains Angular standalone components and `styles.scss` which uses Tailwind directives.

Quick steps to enable Tailwind locally (PowerShell):

1. Install dependencies

```powershell
npm install
```

2. Generate Tailwind config and PostCSS (optional, already added in this repo):

```powershell
npx tailwindcss init -p
```

3. Ensure `styles.scss` is registered in `angular.json` as a global style. Example `angular.json` snippet (workspace/project -> options):

```json
"projects": {
  "your-project-name": {
    "architect": {
      "build": {
        "options": {
          "styles": [
            "src/styles.scss"
          ],
          "assets": [
            "src/favicon.ico",
            "src/assets"
          ]
        }
      }
    }
  }
}
```

Notes on wiring:
- Place `postcss.config.cjs` and `tailwind.config.cjs` at the project root (already added).
- Angular CLI (v12+) integrates PostCSS automatically. When the build runs, PostCSS will read `postcss.config.cjs` and run Tailwind.
- If you prefer not to rely on Angular's PostCSS integration, you can compile Tailwind separately using the `tailwind:build` script which emits `src/tailwind.css` and then import that CSS from `angular.json` or `styles.scss`.

Example: Import compiled Tailwind output from `src/tailwind.css` inside `styles.scss` (at top):

```scss
@import './tailwind.css';
/* your custom tokens and overrides below */
```

4. Start the dev server

```powershell
npm start
# or
ng serve
```

Notes:
- This project assumes you're using Angular CLI and have an existing Angular workspace. If you don't have one yet, create it with `ng new meddisupply-web --style=scss` and then copy these files into the generated project.
- Tailwind requires PostCSS. `postcss.config.cjs` and `tailwind.config.cjs` are included.
- If using Angular's default build pipeline, ensure PostCSS runs by keeping `postcss.config.cjs` at the project root (Angular CLI will pick it up).
