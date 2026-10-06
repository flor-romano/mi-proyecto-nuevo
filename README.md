# Video de repaso – Seguridad alimentaria

Video en Remotion (1920×1080, 30 fps, sin audio). Por ahora incluye las escenas 1 a 6 (0:00–1:36).

## Uso

```bash
npm install
npm run studio   # vista previa interactiva
npm run render   # genera videos/seguridad-alimentaria-escenas-1-6.mp4 (sin audio)
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

## Ilustraciones originales

- `public/ilustraciones/personaje-pensativo-original.png`: ilustración del curso tal como llegó.
- `scripts/separar-personaje.py` la divide en el personaje solo (`personaje-pensativo.png`, mismo
  lienzo y proporción) y cada burbuja por separado en `public/ilustraciones/burbujas/`,
  recoloreadas a #78D2F0, para animarlas de a una.

## Espacios reservados para Premiere

- Escena 4 (0:36–1:00): corte de carne fresco → alterado. Rectángulo libre de 700×500 px con la
  esquina superior izquierda en x=1100, y=140 (ver `MEAT_AREA` en `src/scenes/Scene4Alteracion.tsx`).
