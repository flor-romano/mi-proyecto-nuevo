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
let umbralVideoMB = 15;
const pathArgs = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--img-kb') { umbralImgKB = parseFloat(args[++i]); continue; }
  if (args[i] === '--video-mb') { umbralVideoMB = parseFloat(args[++i]); continue; }
  pathArgs.push(args[i]);
}
const raiz = path.resolve(pathArgs[0] || '.');

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
  if (kb > umbralImgKB) {
    problemasPeso.push(`${path.relative(raiz, f)} — ${kb.toFixed(0)} KB (umbral ${umbralImgKB} KB)`);
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
    console.log(`✓ Peso de imágenes — ninguna supera ${umbralImgKB} KB.`);
  }

  if (avisosVideo.length) {
    console.log(`⚠ Videos pesados (aviso, no frena la entrega, ${avisosVideo.length}):`);
    avisosVideo.forEach(p => console.log('  - ' + p));
  } else {
    console.log(`✓ Peso de videos — ninguno supera ${umbralVideoMB} MB.`);
  }

  process.exitCode = (problemasFormato.length || problemasPeso.length) ? 1 : 0;
}
