# Video de repaso – Seguridad alimentaria

Video en Remotion (1920×1080, 30 fps, con locución y efectos). Por ahora incluye las escenas 1 a 6.

## Uso

```bash
npm install
npm run studio   # vista previa interactiva
npm run render   # genera videos/seguridad-alimentaria-escenas-1-6.mp4
```

## Estructura

- `src/theme.ts` – colores, tipografías (Faible Black, Roboto), escala tipográfica y helper `sec()`.
- `src/Video.tsx` – orden de las escenas, duración según cada audio, transiciones, locución y efectos.
- `src/scenes/` – una escena por archivo. `useAt()` convierte segundos desde el inicio de la locución de la escena en frames.
- `src/components/` – fondo con formas orgánicas, pastilla de título, texto palabra por palabra e ilustraciones SVG.

## Tipografías

Se cargan desde `public/fonts/propias` (Faible Black para títulos, Roboto Regular y Bold para
textos). La escala está en `type` dentro de `src/theme.ts`.

## Locución y sincronización

- `public/audio/escena-N.mp3`: un audio por escena. Cada escena dura su audio + 0,5 s antes + 0,8 s después.
- `scripts/locucion.txt`: texto de la locución por escena.
- `scripts/alinear-locucion.py` estima cuándo se dice cada palabra (sin reconocimiento de voz:
  reparte las palabras por sílabas y las ajusta a las pausas del audio) y escribe `src/locucion.json`.
  Volver a correrlo si cambia algún audio.
- Cada escena define sus `CUES` con `v.w('palabra')` (o `v.w('palabra', 2)` para la segunda aparición).
  Para corregir un tiempo a mano, se puede sumar o restar segundos ahí, por ejemplo `v.w('normas') - 0.2`.
- `npm run render:sincronizacion` genera una versión con la locución en pantalla y la palabra
  estimada resaltada, para revisar la sincronización.

## Efectos de sonido

`scripts/generar-sonidos.py` sintetiza `public/sfx/whoosh.wav` (transiciones) y `pop-1..3.wav`
(aparición de íconos, etiquetas y checks), a -20 dB respecto del nivel de la locución.
Los pops de cada escena son su lista `POPS`.

## Ilustraciones originales

- `public/ilustraciones/personaje-pensativo-original.png`: ilustración del curso tal como llegó.
- `scripts/separar-personaje.py` la divide en el personaje solo (`personaje-pensativo.png`, mismo
  lienzo y proporción) y cada burbuja por separado en `public/ilustraciones/burbujas/`,
  recoloreadas a #78D2F0, para animarlas de a una.

## Espacios reservados para Premiere

- Escena 4 (0:37,7–1:00,8): corte de carne fresco → alterado. Rectángulo libre de 700×500 px con la
  esquina superior izquierda en x=1100, y=140 (ver `MEAT_AREA` en `src/scenes/Scene4Alteracion.tsx`).
