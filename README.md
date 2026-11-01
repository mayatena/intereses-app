# Integra

PWA para aprender de forma progresiva (estilo Duolingo). Primer tema: integrales de 2º de Bachillerato.

- La app lista para publicar está en la raíz: `index.html`, `manifest.webmanifest`, `sw.js` e iconos.
- Código fuente en `src/`. Para regenerar: crea la carpeta `dist/` y ejecuta `node build.js`; luego copia `dist/index.html` a la raíz.
- Tests: `test/verify.js` (matemáticas) y `test/e2e.py` (Playwright).
- Tu progreso se guarda solo en el navegador de cada dispositivo.

## Publicar (GitHub Pages)
Settings → Pages → Source: «Deploy from a branch» → rama `main`, carpeta `/ (root)`.
