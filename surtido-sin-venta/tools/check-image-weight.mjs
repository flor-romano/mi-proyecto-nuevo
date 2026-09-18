#!/usr/bin/env node
/* check-image-weight.mjs — kit-base v1.9.48
   Chequeo de peso/formato de assets ANTES de armar el zip de entrega
   (`build-zip.py`) — pensado para correr contra la carpeta de un
   CURSO, no contra kit-base (que no trae `img/`/`video/` propios).

   POR QUÉ EXISTE
   --------------
   El kit fija `.webp` como formato único para capturas desde el
   inicio (CLAUDE.md §3: "Renderizar cada página a `.webp`") — pero
   nada lo hacía cumplir. Un `.png`/`.jpg` suelto en `img/` (quedó de
   un export apurado, o de pegar un asset del cliente tal cual) pasa
   desapercibido en una revisión visual — se ve igual — y el único
   costo real (peso extra, a veces 5-10x) lo paga el alumno con
   conexión mala, en silencio.

   QUÉ VALIDA
   ----------
   1. Formato: cualquier imagen que NO sea `.webp`/`.svg` dentro de
      `img/` es una alerta — el kit no usa otro formato para capturas.
   2. Peso de imagen: cualquier archivo en `img/` por encima de
      UMBRAL_IMG (300 KB por default) — una captura 2:1 bien
      comprimida rara vez pasa eso; si lo hace, casi siempre es un
      `.webp` sin recomprimir o con alfa innecesaria.
   3. Peso de video: cualquier archivo en `video/` por encima de
      UMBRAL_VIDEO (15 MB por default) — pensado como aviso, no regla
      dura (un video de fondo largo puede pasarlo legítimamente); por
      eso NO hace fallar el exit code, solo lo lista aparte.

   No mide contenido (no decodifica la imagen, no corre ningún
   compresor) — es un chequeo de "¿algo se escapó del proceso
   esperado?", no un optimizador.

   Uso:
     node check-image-weight.mjs [carpeta_curso]   (default: cwd)
     node check-image-weight.mjs --img-kb 400 --video-mb 20 [carpeta]
   Exit code 1 si hay formato incorrecto o imagen pesada (los videos
   pesados solo avisan, no frenan). */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
let umbralImgKB = 300;
/* Una imagen ANIMADA no se mide con la misma vara que una captura
   (kit-base v1.9.74, §7.20 B4). El umbral de 300 KB está calibrado —lo
   dice el propio encabezado de este archivo— para una captura 2:1
   estática. Un `.webp` animado legítimo pesa del orden del megabyte y
   quedaba como falso positivo PERMANENTE, que es la peor clase de
   aviso: el que se aprende a ignorar.
   Y el peso de una animación casi no depende de la calidad ni del
   tamaño arriba de ~75 cuadros: depende de la CANTIDAD DE CUADROS
   (medido sobre un mismo GIF: 130 KB entre la mejor y la peor imagen,
   contra ~400 KB que cuesta duplicar los cuadros). Así que apretar la
   calidad para entrar en 300 KB empeora la imagen sin resolver nada. */
let umbralAnimKB = 1200;
let umbralVideoMB = 15;
const pathArgs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--img-kb') { umbralImgKB = parseFloat(args[++i]); continue; }
  if (args[i] === '--anim-kb') { umbralAnimKB = parseFloat(args[++i]); continue; }
  if (args[i] === '--video-mb') { umbralVideoMB = parseFloat(args[++i]); continue; }
  pathArgs.push(args[i]);
}
const raiz = path.resolve(pathArgs[0] || '.');

/* ¿La imagen está ANIMADA? Se lee el archivo, no la extensión.
   · WebP: es un RIFF; animado = trae un chunk "ANIM".
   · GIF: animado = más de un bloque de Graphic Control Extension
     (0x21 0xF9). Uno solo es un GIF de un cuadro.
   · APNG: un PNG con un chunk "acTL" antes del primer "IDAT".
   Solo se leen los primeros 64 KB: los chunks que marcan animación van
   al principio en los tres formatos. */
function esAnimada(f) {
  let buf;
  try {
    const fd = fs.openSync(f, 'r');
    buf = Buffer.alloc(65536);
    const n = fs.readSync(fd, buf, 0, 65536, 0);
    fs.closeSync(fd);
    buf = buf.subarray(0, n);
  } catch { return false; }
  const ext = path.extname(f).toLowerCase();
  if (ext === '.webp') {
    return buf.subarray(0, 4).toString('latin1') === 'RIFF' &&
           buf.includes(Buffer.from('ANIM', 'latin1'));
  }
  if (ext === '.gif') {
    let cuadros = 0;
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i] === 0x21 && buf[i + 1] === 0xF9) cuadros++;
      if (cuadros > 1) return true;
    }
    return false;
  }
  if (ext === '.png') {
    const acTL = buf.indexOf(Buffer.from('acTL', 'latin1'));
    const IDAT = buf.indexOf(Buffer.from('IDAT', 'latin1'));
    return acTL !== -1 && (IDAT === -1 || acTL < IDAT);
  }
  return false;
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const FORMATOS_OK = new Set(['.webp', '.svg']);
const imgDir = path.join(raiz, 'img');
const videoDir = path.join(raiz, 'video');

const problemasFormato = [];
const problemasPeso = [];
const avisosVideo = [];

for (const f of walk(imgDir)) {
  const ext = path.extname(f).toLowerCase();
  if (!FORMATOS_OK.has(ext)) {
    problemasFormato.push(`${path.relative(raiz, f)} — formato ${ext || '(sin extensión)'}, se espera .webp`);
    continue;
  }
  const kb = fs.statSync(f).size / 1024;
  const anim = esAnimada(f);
  const umbral = anim ? umbralAnimKB : umbralImgKB;
  if (kb > umbral) {
    problemasPeso.push(
      `${path.relative(raiz, f)} — ${kb.toFixed(0)} KB ` +
      `(umbral ${umbral} KB${anim ? ', imagen ANIMADA' : ''})`);
  }
}

for (const f of walk(videoDir)) {
  const mb = fs.statSync(f).size / (1024 * 1024);
  if (mb > umbralVideoMB) {
    avisosVideo.push(`${path.relative(raiz, f)} — ${mb.toFixed(1)} MB (umbral ${umbralVideoMB} MB)`);
  }
}

if (!fs.existsSync(imgDir) && !fs.existsSync(videoDir)) {
  console.log(`✗ no se encontró img/ ni video/ dentro de ${raiz} — ¿es la carpeta de un curso?`);
  process.exitCode = 1;
} else {
  if (problemasFormato.length) {
    console.log(`✗ Formato incorrecto (${problemasFormato.length}):`);
    problemasFormato.forEach(p => console.log('  - ' + p));
  } else {
    console.log('✓ Formato de imágenes — todo en .webp/.svg.');
  }

  if (problemasPeso.length) {
    console.log(`✗ Imágenes pesadas (${problemasPeso.length}):`);
    problemasPeso.forEach(p => console.log('  - ' + p));
  } else {
    console.log(`✓ Peso de imágenes — ninguna supera su umbral (${umbralImgKB} KB estáticas / ${umbralAnimKB} KB animadas).`);
  }

  if (avisosVideo.length) {
    console.log(`⚠ Videos pesados (aviso, no frena la entrega, ${avisosVideo.length}):`);
    avisosVideo.forEach(p => console.log('  - ' + p));
  } else {
    console.log(`✓ Peso de videos — ninguno supera ${umbralVideoMB} MB.`);
  }

  process.exitCode = (problemasFormato.length || problemasPeso.length) ? 1 : 0;
}
