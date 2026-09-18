#!/usr/bin/env node
/* visual-regress.mjs — kit-base v1.9.50
   Regresión visual: screenshot de cada diapositiva contra una
   baseline guardada, con diff a nivel píxel. Cierra el hueco real que
   dejaban los otros 7 tests genéricos — todos miran DOM/comportamiento,
   ninguno mira si algo se ve distinto. Sin esto, un cambio de kit como
   el Ken Burns de §6.64 (que sangraba sobre el letterbox en ciertos
   anchos) solo se detectaba si alguien lo notaba a ojo.

   POR QUÉ NO ES PARTE DE LA SUITE DE 7 (`run-tests.mjs`)
   -------------------------------------------------------
   Los otros 7 son pass/fail sin estado propio — corren limpios contra
   CUALQUIER copia del curso, nunca necesitan "recordar" nada de una
   corrida anterior. Este SÍ: necesita una baseline guardada, y esa
   baseline es del CURSO (no del kit) — cada curso la genera/actualiza
   la primera vez que corre esto contra su propia carpeta. Meterlo en
   `run-tests.mjs` obligaría a versionar imágenes junto con el resto
   de la suite genérica del kit, que no las tiene ni las necesita.

   BASELINE Y ACTUALIZACIÓN INTENCIONAL
   -------------------------------------
   Vive en `<carpeta_del_curso>/tools/visual-baseline/<slide-id>.png`
   (relativo al cwd desde el que se corre, igual que
   `verify-hitboxes-out/`). Si no existe, esta corrida la CREA (no es
   un fallo — es la primera vez). Si existe y difiere más que el
   umbral, es un fallo real: revisar `tools/visual-diff-out/<id>.png`
   (rojo = donde difiere) y decidir — ¿es una regresión, o el cambio
   visual fue a propósito? Si fue a propósito: `--update` pisa la
   baseline con el estado actual. Guardar los `.png` de
   `visual-baseline/` junto con el resto del curso al entregar — no
   son descartables, son el contrato de "así se ve esto".

   DETERMINISMO
   -------------
   `prefers-reduced-motion: reduce` emulado siempre — sin esto, Ken
   Burns/transiciones de diapositiva/cualquier animación en curso haría
   que dos corridas del MISMO estado real dieran screenshots distintos
   (falso positivo puro). El clip es `.d-stage` (el lienzo real de
   proporción fija), no la página entera — así el resultado no depende
   del viewport del test.

   Uso:
     node visual-regress.mjs <url>              # compara contra baseline
     node visual-regress.mjs <url> --update      # graba la baseline nueva
     node visual-regress.mjs <url> --threshold 0.015  # % de píxeles distintos tolerado (default .01 = 1%)
     node visual-regress.mjs <url> id1 id2       # solo esas diapositivas
   Exit code 1 si algún diff supera el umbral. */

import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const argv = process.argv.slice(2);
const url = argv[0];
if (!url || url.startsWith('--')) {
  console.error('Uso: node visual-regress.mjs <url> [--update] [--threshold N] [data-slide-id ...]');
  process.exit(1);
}
const rest = argv.slice(1);
const UPDATE = rest.includes('--update');
let THRESHOLD = 0.01;
const tIdx = rest.indexOf('--threshold');
if (tIdx !== -1) THRESHOLD = parseFloat(rest[tIdx + 1]);
const only = rest.filter((a, i) => a !== '--update' && a !== '--threshold' && !(tIdx !== -1 && i === tIdx + 1));

const CHROMIUM_PATH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASELINE_DIR = path.resolve('tools/visual-baseline');
const DIFF_DIR = path.resolve('tools/visual-diff-out');
fs.mkdirSync(BASELINE_DIR, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.emulateMedia({ reducedMotion: 'reduce' });

await page.goto(url);
await page.waitForTimeout(500);
await page.keyboard.press('Escape').catch(() => {});

const slideIds = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]')).map(s => s.getAttribute('data-slide'))
);
const targets = only.length ? slideIds.filter(id => only.includes(id)) : slideIds;

if (!targets.length) {
  console.log('Ninguna diapositiva encontrada (o el filtro no matcheó nada).');
  await browser.close();
  process.exit(0);
}

/* screenshotEstable — kit-base v1.9.50
   Un `waitForTimeout` fijo no alcanza: se probó primero con 200ms y
   dio un falso positivo real y reproducible (§6.67) — una animación
   de ENTRADA de un widget propio de un curso (`.d-repaso-item.is-current`,
   `.32s`) que no respeta `prefers-reduced-motion` (bug del CSS de
   ESE curso, no del kit) capturaba un cuadro a mitad de camino, y ESE
   cuadro variaba entre corridas por jitter normal del proceso — nunca
   el mismo frame dos veces. Esperar un tiempo fijo asume que todo lo
   que anima en la diapositiva respeta reduced-motion; no se puede dar
   por sentado (un curso puede tener ese bug, como este). La solución
   no depende de saber qué anima: compara dos screenshots consecutivos
   y espera hasta que sean bit a bit idénticos (o se cumpla el tope). */
async function screenshotEstable(locator, maxEsperaMs = 2000, intervaloMs = 120) {
  let anterior = await locator.screenshot();
  const inicio = Date.now();
  while (Date.now() - inicio < maxEsperaMs) {
    await new Promise(r => setTimeout(r, intervaloMs));
    const actual = await locator.screenshot();
    if (Buffer.compare(anterior, actual) === 0) return actual;
    anterior = actual;
  }
  return anterior; // se rindió tras el tope — usa el último cuadro igual, mejor que trabar la corrida
}

const stage = page.locator('.d-stage');
const nuevas = [];
const fallos = [];
const sinCambios = [];

for (const id of targets) {
  await page.evaluate(sid => {
    const i = Array.from(document.querySelectorAll('[data-slide]')).findIndex(s => s.getAttribute('data-slide') === sid);
    if (window.motor) window.motor.go(i, true); // sin animación, sin depender de gates — mismo criterio que verify-hitboxes.mjs (que desde v1.9.61 navega igual: antes clickeaba el índice y se quedaba trabado en un curso gateado)
  }, id);
  await page.waitForTimeout(100); // deja arrancar cualquier animación de entrada antes de empezar a comparar

  const buf = await screenshotEstable(stage);
  const baselinePath = path.join(BASELINE_DIR, `${id}.png`);

  if (UPDATE || !fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, buf);
    nuevas.push(id);
    continue;
  }

  const actual = PNG.sync.read(buf);
  const esperado = PNG.sync.read(fs.readFileSync(baselinePath));
  if (actual.width !== esperado.width || actual.height !== esperado.height) {
    fallos.push(`${id}: cambió el tamaño del stage (${esperado.width}x${esperado.height} → ${actual.width}x${actual.height}) — correr con --update si es a propósito`);
    continue;
  }

  const { width, height } = actual;
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(esperado.data, actual.data, diff.data, width, height, { threshold: 0.1 });
  const ratio = diffPixels / (width * height);

  if (ratio > THRESHOLD) {
    fs.mkdirSync(DIFF_DIR, { recursive: true });
    fs.writeFileSync(path.join(DIFF_DIR, `${id}.png`), PNG.sync.write(diff));
    fallos.push(`${id}: ${(ratio * 100).toFixed(2)}% de píxeles distintos (umbral ${(THRESHOLD * 100).toFixed(2)}%) — ver tools/visual-diff-out/${id}.png`);
  } else {
    sinCambios.push(id);
  }
}

await browser.close();

console.log(`${sinCambios.length} sin cambios, ${nuevas.length} baseline nueva(s), ${fallos.length} fallo(s).`);
if (nuevas.length) console.log('Nuevas: ' + nuevas.join(', '));
if (fallos.length) {
  console.log(`\n✗ visual-regress — ${fallos.length} fallo(s):`);
  fallos.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
console.log('✓ visual-regress — sin fallos.');
