# LUBENS FARNESIO
Proyecto React + Vite + Tailwind listo para Netlify.

## Local
```bash
npm install
cp .env.example .env  # si usas Supabase
npm run dev
```

## Build / Preview
```bash
npm run build
npm run preview
```

## Netlify
- Build command: `npm run build`
- Publish dir: `dist`
- (Opcional) Vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`


---
## ⚙️ Deploy automático con GitHub Actions + Netlify
Este repo incluye `.github/workflows/deploy-netlify.yml`. Al hacer **push a `main`**:
1. CI instala dependencias y hace `npm run build` (usando `VITE_*` si los defines como **Secrets**).
2. Publica a Netlify con el **Netlify CLI**.

### Secrets necesarios en GitHub
- `NETLIFY_AUTH_TOKEN` → Personal Access Token de Netlify
- `NETLIFY_SITE_ID` → ID del sitio en Netlify
- (Opcional) `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` si tu build necesita variables en tiempo de compilación.

> Alternativa: puedes omitir los `VITE_*` en Actions y definirlos solo en **Netlify (Site settings → Environment variables)** si preferís que el build ocurra en Netlify. En este workflow el build ocurre en Actions, por eso se exponen aquí.
