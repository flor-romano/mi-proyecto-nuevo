# Video de repaso – Seguridad alimentaria

Video en Remotion (1920×1080, 30 fps, sin audio). Por ahora incluye las escenas 1 a 3 (0:00–0:36).

## Uso

```bash
npm install
npm run studio   # vista previa interactiva
npm run render   # genera videos/seguridad-alimentaria-escenas-1-3.mp4 (sin audio)
```

## Estructura

- `src/theme.ts` – colores, tipografías (Nunito Black, Roboto) y helper `sec()`.
- `src/Video.tsx` – orden y tiempos de las escenas según el guion; transiciones de deslizamiento.
- `src/scenes/` – una escena por archivo. `at(segundos)` mide el tiempo desde el inicio de la escena en el guion.
- `src/components/` – fondo con formas orgánicas, pastilla de título, texto palabra por palabra e ilustraciones SVG.

## Fuentes sin acceso a Google Fonts

Las fuentes se cargan con `@remotion/google-fonts`. Si el navegador del render no puede llegar a
`fonts.gstatic.com` (por ejemplo, detrás de un proxy), se pueden usar las copias de `public/fonts`:

```bash
node scripts/descargar-fuentes.mjs           # solo si falta public/fonts
REMOTION_LOCAL_FONTS=1 npm run render
```
