#!/usr/bin/env node
/* limpiar-recorte.mjs — kit-base v1.9.61
   Saca la sombra suave de un recorte hecho sobre una página PLANA.
   ------------------------------------------------------------
   POR QUÉ EXISTE
   Cuando el PDF de referencia trae el arte como página renderizada
   (PNG plano, no vectores por capas), recortar una ilustración
   —personaje, tarjeta, mancha— se lleva puesta la sombra suave del
   elemento de al lado: queda una banda gris pegada a un borde que no
   se puede separar recortando más fino, porque no hay capas que
   separar. Sale de la migración de "Surtido sin ventas", donde la
   misma técnica a mano se usó TRES veces en un solo curso — y hay
   ~20 cursos de Storyline por migrar (§7.05), así que se sube al kit
   en vez de reescribirla cada vez.

   CÓMO FUNCIONA, Y POR QUÉ ASÍ
   Una sombra suave sobre blanco es GRIS: sus tres canales son casi
   iguales entre sí. Los colores reales de un dibujo casi nunca lo
   son (un rojo, un tono de piel, un azul tienen los canales bien
   separados). Entonces la regla es: blanquear un píxel solo si es
   "casi gris puro" (los tres canales dentro de `--tol`) **y** además
   CLARO (>= `--piso`).

   Las dos condiciones juntas son lo que hace que sirva:
     · solo "casi gris" borraría también las líneas oscuras del propio
       arte — contornos, ojos, texto negro — que también son grises.
       El piso de claridad las deja intactas.
     · solo "claro" borraría los blancos y claros legítimos del dibujo.
       La condición de gris deja pasar cualquier claro con color.

   CUÁNDO NO USAR `--alfa`
   Con `--alfa` la sombra queda transparente en vez de blanca. Sirve
   SOLO si el elemento recortado no tiene ninguna zona propia blanca o
   casi blanca: una guirnalda o una mancha de un color andan perfecto;
   un personaje con ropa, casco o delantal blanco NO — se le agujerea
   el dibujo, y encima de forma difícil de ver hasta que el arte queda
   sobre un fondo de otro color. En ese caso conviene dejar el recorte
   con fondo blanco sólido (sin `--alfa`) y que la pantalla real tenga
   fondo blanco también.

   USO
     node tools/limpiar-recorte.mjs entrada.png [salida.png] [opciones]
       --tol N    diferencia máxima entre canales para considerarlo
                  gris (default 6)
       --piso N   claridad mínima para tocarlo (default 150)
       --alfa     además de blanquear, poner esos píxeles
                  transparentes — leer la advertencia de arriba
     Sin `salida.png` escribe `<entrada>-limpio.png`, nunca pisa el
     original: el recorte original es la fuente para reintentar con
     otros umbrales si el primer intento se pasa de agresivo.

   Solo PNG, con el `pngjs` que el kit ya usa para la regresión visual
   — sin dependencias nuevas. Un JPG hay que convertirlo antes (y
   conviene: sus artefactos de compresión ensucian justo los bordes de
   la sombra, que es lo que acá se está midiendo). */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const argv = process.argv.slice(2);
const opts = { tol: 6, piso: 150, alfa: false };
const libres = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--tol') opts.tol = parseInt(argv[++i], 10);
  else if (argv[i] === '--piso') opts.piso = parseInt(argv[++i], 10);
  else if (argv[i] === '--alfa') opts.alfa = true;
  else libres.push(argv[i]);
}
const entrada = libres[0];
if (!entrada) {
  console.error('Uso: node tools/limpiar-recorte.mjs entrada.png [salida.png] [--tol 6] [--piso 150] [--alfa]');
  process.exit(1);
}
if (!fs.existsSync(entrada)) {
  console.error(`✗ No existe: ${entrada}`);
  process.exit(1);
}
if (!/\.png$/i.test(entrada)) {
  console.error('✗ Solo PNG. Convertir antes (y ver la nota sobre JPG en el encabezado).');
  process.exit(1);
}
if (!Number.isFinite(opts.tol) || !Number.isFinite(opts.piso)) {
  console.error('✗ --tol y --piso tienen que ser números.');
  process.exit(1);
}
const salida = libres[1] || entrada.replace(/\.png$/i, '-limpio.png');
if (path.resolve(salida) === path.resolve(entrada)) {
  console.error('✗ La salida no puede pisar la entrada — el original es la fuente para reintentar con otros umbrales.');
  process.exit(1);
}

const png = PNG.sync.read(fs.readFileSync(entrada));
const { data, width, height } = png;
let tocados = 0;
for (let p = 0; p < data.length; p += 4) {
  const r = data[p], g = data[p + 1], b = data[p + 2];
  const casiGris = Math.abs(r - g) <= opts.tol &&
                   Math.abs(g - b) <= opts.tol &&
                   Math.abs(r - b) <= opts.tol;
  /* El piso se mide sobre el canal más OSCURO de los tres: con los
     tres canales casi iguales da igual cuál se mire, pero tomando el
     mínimo un píxel apenas fuera de tolerancia nunca se cuela por el
     canal más claro. Prudente en la dirección correcta: ante la duda,
     no tocar el arte. */
  if (!casiGris || Math.min(r, g, b) < opts.piso) continue;
  data[p] = data[p + 1] = data[p + 2] = 255;
  if (opts.alfa) data[p + 3] = 0;
  tocados++;
}

fs.writeFileSync(salida, PNG.sync.write(png));
const total = width * height;
const pct = ((tocados / total) * 100).toFixed(1);
console.log(`✓ ${salida}`);
console.log(`  ${width}x${height} · ${tocados} de ${total} píxeles (${pct}%) ${opts.alfa ? 'transparentados' : 'blanqueados'}`);
console.log(`  umbrales: --tol ${opts.tol} --piso ${opts.piso}`);
if (pct > 60) {
  console.log('  ⚠ Más del 60% del recorte cambió: probablemente el fondo ya era blanco');
  console.log('    (nada que hacer) o los umbrales están comiéndose el arte. Mirar el resultado.');
} else if (tocados === 0) {
  console.log('  ⚠ No cambió ningún píxel: la sombra puede ser más oscura que --piso');
  console.log('    o tener tinte de color (subir --tol). Probar --piso 120 --tol 10.');
}
