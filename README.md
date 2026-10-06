# Placas animadas para videotutoriales (Remotion)

- `src/config.ts` — textos, colores, tiempos (en segundos) y movimientos editables de cada placa.
- `src/componentes/` — piezas compartidas: fondo + salida, tramas, flechas (`Fondo.tsx`) y texto animado (`Texto.tsx`).
- `src/PlacaIntro.tsx` — placa 1 "En este video" (4 s).
- `src/Placa2.tsx` — placa 2 "Esta herramienta" (5 s).
- `videos/` — renders finales (1920x1080, 30 fps).

## Uso

```bash
npm install
npm run studio          # previsualizar y ajustar
npm run render          # renderiza las dos placas
npm run render:placa2   # solo una
```
