#!/usr/bin/env node
/* ============================================================
   run-tests.mjs — corre TODA la suite de `tools/tests/`.

   POR QUÉ EXISTE (CLAUDE.md §6.60)
   --------------------------------
   El script `test` de package.json era una lista literal de 6
   nombres escrita a mano:

     for t in deep-audit full-regress hitbox-click-check \\
              scroll-audit keyboard-a11y markup-sanity; do ...

   `scorm-tracking.mjs` existía en la carpeta desde kit v1.9.9 y
   NUNCA estaba en esa lista — justo el test que cubre el peor bug
   que tuvo este kit (§6.24: el alumno terminaba el curso y en el LMS
   quedaba `incomplete`, o sea el curso no servía para lo que el
   cliente paga). Durante 30 versiones "0 fallos" quiso decir "0
   fallos en 6 de 7 tests", sin que nada lo dijera.

   La lección no es "agregar scorm-tracking a la lista": es que una
   lista escrita a mano se desactualiza sola y en silencio. Acá la
   lista SALE DE LA CARPETA — un test nuevo entra a la suite por
   existir, sin que nadie se acuerde de nada.

   USO
   ---
     node tools/run-tests.mjs <url-del-curso>
     COURSE_URL=... npm test

   Los tests reciben la URL como primer argumento, igual que antes.
   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR_TESTS = path.join(AQUI, 'tests');

const url = process.argv[2] || process.env.COURSE_URL || '';
if (!url) {
  console.error(
    'Falta la URL del curso.\n' +
      '  node tools/run-tests.mjs <url>\n' +
      '  COURSE_URL=<url> npm test'
  );
  process.exit(2);
}

/* `_shared.mjs` es la librería común, no un test — el guion bajo es la
   convención para eso. Cualquier otro .mjs de la carpeta ES un test y
   entra a la suite solo. */
const esTest = (f) => f.endsWith('.mjs') && !path.basename(f).startsWith('_');

const tests = fs.readdirSync(DIR_TESTS).filter(esTest).sort();

if (!tests.length) {
  console.error(`No se encontró ningún test en ${DIR_TESTS}`);
  process.exit(2);
}

console.log(`Suite: ${tests.length} test(s) en tools/tests/\n`);

const fallaron = [];
for (const t of tests) {
  const nombre = path.basename(t, '.mjs');
  process.stdout.write(`── ${nombre}\n`);
  const r = spawnSync(process.execPath, [path.join(DIR_TESTS, t), url], {
    stdio: 'inherit',
  });
  if (r.status !== 0) fallaron.push(nombre);
  process.stdout.write('\n');
}

/* A diferencia del `|| exit 1` viejo, la suite NO se corta en el primer
   fallo: con un solo test roto, cortar ahí esconde el estado de todos
   los que vienen después y hacen falta 2 corridas para ver el cuadro
   completo. Se corren todos y se reporta el resumen. */
if (fallaron.length) {
  console.error(
    `✗ ${fallaron.length} de ${tests.length} test(s) con fallos: ${fallaron.join(', ')}`
  );
  process.exit(1);
}

console.log(`✓ ${tests.length} de ${tests.length} test(s) en verde.`);
