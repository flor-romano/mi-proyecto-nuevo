#!/usr/bin/env node
/* ============================================================
   check-globals.mjs · kit-base v1.9.65 — Área Aprendizaje (COTO)
   ------------------------------------------------------------
   CONTRATO DE SÍMBOLOS GLOBALES ENTRE LOS MÓDULOS DEL KIT.

   POR QUÉ EXISTE (§7.10, y es un bug que se autoinfligió el kit):
   `coto-logros.js` sacaba sus avisos con `global.Player.toast(...)` —
   el "+N · motivo" de cada `award()` y el "🏆 Logro:" de cada
   `unlock()`. Pero `initPlayer()` solo DEVOLVÍA su API: nunca la
   publicaba en `window`, y todos los cursos la guardan en una variable
   local. `global.Player` era `undefined` y **todos esos avisos estaban
   muertos**, sin un solo error en consola.

   Lo que hace este chequeo es la pregunta de una línea que habría
   evitado eso: **de todo lo que un módulo CONSUME de `global`, ¿hay
   alguien que lo PUBLIQUE?** Los archivos del kit son autocontenidos a
   propósito (se copian de a uno a cada curso), así que el único
   contrato entre ellos es justamente `window` — y hasta ahora nadie lo
   verificaba.

   Es estático a propósito: no necesita navegador, curso ni servidor.
   Corre en milisegundos y entra en `npm run test:kit`, así que un
   símbolo que se rompe se ve en el commit que lo rompe y no tres
   versiones después, cuando un curso lo estrena.

     node tools/check-globals.mjs
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const JS_DIR = path.join(AQUI, '..', 'js');

/* Provistos por el navegador o por el propio curso — no los publica
   ningún módulo del kit y no tiene sentido exigirlo. */
const DEL_ENTORNO = new Set([
  'document', 'window', 'navigator', 'location', 'screen', 'history',
  'speechSynthesis', 'SpeechSynthesisUtterance', 'matchMedia', 'getComputedStyle',
  'requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout', 'clearTimeout',
  'setInterval', 'clearInterval', 'localStorage', 'sessionStorage', 'fetch',
  'Image', 'Audio', 'AudioContext', 'webkitAudioContext', 'CustomEvent', 'Event',
  'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'performance',
  'parent', 'top', 'self', 'frameElement', 'console', 'alert', 'print',
  'close', 'opener', 'addEventListener', 'removeEventListener', 'dispatchEvent',
  'innerWidth', 'innerHeight', 'scrollX', 'scrollY', 'devicePixelRatio',
  'API', 'API_1484_11',            // el LMS los inyecta en window (SCORM)
  'motor',                          // lo publica curso.js, no un módulo del kit
  'COURSE_SLUG', 'COURSE_NAME',
  'XAPI_CONFIG'                     // config opcional que define el curso, no el kit
]);

const archivos = fs.readdirSync(JS_DIR).filter(f => f.endsWith('.js'));

/* Lo que cada archivo PUBLICA: `global.X = ...` / `window.X = ...` */
const publica = new Map();
/* Lo que cada archivo CONSUME: `global.X` / `window.X` leído */
const consume = new Map();

for (const f of archivos) {
  const src = fs.readFileSync(path.join(JS_DIR, f), 'utf8')
    /* Los comentarios se sacan antes de buscar: este kit documenta
       muchísimo, y un `global.Player` mencionado en una explicación no
       es ni un consumo ni una publicación. Contarlos daría exactamente
       el falso negativo que este chequeo viene a evitar. */
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  for (const m of src.matchAll(/\b(?:global|window)\.([A-Za-z_$][\w$]*)\s*=(?!=)/g)) {
    if (!publica.has(m[1])) publica.set(m[1], []);
    publica.get(m[1]).push(f);
  }
  for (const m of src.matchAll(/\b(?:global|window)\.([A-Za-z_$][\w$]*)\b(?!\s*=(?!=))/g)) {
    if (!consume.has(m[1])) consume.set(m[1], new Set());
    consume.get(m[1]).add(f);
  }
}

const fallos = [];

for (const [sym, files] of consume) {
  if (DEL_ENTORNO.has(sym)) continue;
  if (publica.has(sym)) continue;
  const quienes = Array.from(files).join(', ');
  fallos.push(`"${sym}" lo consume ${quienes} pero NINGÚN módulo del kit lo publica ` +
    '(o falta el `global.X = X`, o el consumo tiene un typo)');
}

/* Publicado dos veces desde archivos distintos: el segundo pisa al
   primero según el orden de los <script>, que es justo el tipo de bug
   que no se ve hasta que alguien reordena. */
for (const [sym, files] of publica) {
  const unicos = Array.from(new Set(files));
  if (unicos.length > 1) {
    fallos.push(`"${sym}" lo publican DOS archivos (${unicos.join(', ')}) — ` +
      'el orden de los <script> decide cuál gana, en silencio');
  }
}

if (fallos.length) {
  console.log(`\n✗ check-globals — ${fallos.length} problema(s) en el contrato entre módulos:`);
  fallos.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
console.log(`✓ check-globals — ${consume.size} símbolos consumidos, todos publicados o del entorno ` +
  `(${publica.size} publicados por ${archivos.length} módulos).`);
