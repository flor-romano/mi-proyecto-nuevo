#!/usr/bin/env node
/* ============================================================
   verify-hitboxes.mjs · kit-base v1.0 — Área Aprendizaje (COTO)
   ------------------------------------------------------------
   Generaliza el script ad-hoc que encontró el bug real de
   "conceptos" en Surtido sin venta v2 (pestañas con coordenadas
   viejas, no remedidas contra el PDF reexportado — ver CLAUDE.md
   §3 punto 4 y §6.5). En vez de escribir un script nuevo cada vez
   que hay que revisar una diapositiva con hitboxes, correr este:

     node tools/verify-hitboxes.mjs <url> [data-slide-id ...]

   Ejemplos:
     node tools/verify-hitboxes.mjs http://localhost:8891/index.html
       → recorre TODAS las diapositivas con [data-shot], una por una.
     node tools/verify-hitboxes.mjs http://localhost:8891/index.html conceptos reporte
       → solo esas dos.

   Para cada diapositiva con [data-shot], dibuja un rectángulo rojo
   sobre el getBoundingClientRect() REAL de cada [data-hit] (lo que el
   navegador terminó calculando, no lo que dice el HTML) y guarda un
   screenshot en ./verify-hitboxes-out/<slide-id>.png — así se ve a
   simple vista si la zona de clic calza con el arte dibujado debajo
   (que puede tener el resaltado/estado activo horneado en la imagen,
   así que "se ve bien" visualmente no garantiza que el CLICK caiga
   bien — hay que mirar el overlay, no solo la captura).

   También corre un chequeo automático (sin mirar imagen): cualquier
   [data-hit] con rect 0×0 o fuera de los límites del [data-shot] se
   reporta como FALLO en la consola (coordenadas rotas/no inicializadas).
   ============================================================ */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const url = process.argv[2];
const only = process.argv.slice(3);
if (!url) {
  console.error('Uso: node verify-hitboxes.mjs <url> [data-slide-id ...]');
  process.exit(1);
}

const CHROMIUM_PATH = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT_DIR = path.resolve('verify-hitboxes-out');
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROMIUM_PATH, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 800 } });
const consoleErrors = [];
page.on('pageerror', e => consoleErrors.push(String(e)));
// Misma regla que tools/tests/_shared.mjs (kit-base v1.9.52): con la
// URL adelante, y sin contar el favicon.ico que el navegador pide solo
// contra la raíz del servidor y no tiene nada que ver con el curso.
page.on('console', msg => {
  if (msg.type() !== 'error') return;
  const u = (msg.location && msg.location().url) || '';
  if (/\/favicon\.ico$/.test(u)) return;
  consoleErrors.push(u ? `${msg.text()}  ← ${u}` : msg.text());
});

await page.goto(url);
await page.waitForTimeout(500);
await page.keyboard.press('Escape').catch(() => {});

const slideIds = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]'))
    .filter(s => s.querySelector('[data-shot]'))
    .map(s => s.getAttribute('data-slide'))
);
const targets = only.length ? slideIds.filter(id => only.includes(id)) : slideIds;

if (!targets.length) {
  console.log('Ninguna diapositiva con [data-shot] encontrada (o el filtro no matcheó nada).');
  await browser.close();
  process.exit(0);
}

let failures = 0;
for (const id of targets) {
  await page.evaluate((slideId) => {
    const link = document.querySelector(`[data-goto="${slideId}"]`);
    if (link) link.click();
  }, id);
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);

  const report = await page.evaluate(() => {
    const shot = document.querySelector('[data-slide]:not([hidden]) [data-shot]');
    if (!shot) return { hits: [], shotRect: null };
    const shotRect = shot.getBoundingClientRect();
    const hits = Array.from(shot.querySelectorAll('[data-hit]')).map(h => {
      const r = h.getBoundingClientRect();
      return {
        label: (h.querySelector('.sr-only')?.textContent || h.getAttribute('aria-label') || h.className).trim(),
        l: r.left, t: r.top, w: r.width, h: r.height
      };
    });
    return { hits, shotRect: { l: shotRect.left, t: shotRect.top, w: shotRect.width, h: shotRect.height } };
  });

  await page.evaluate((hits) => {
    document.querySelectorAll('.__verify-hit-overlay').forEach(el => el.remove());
    hits.forEach(h => {
      const div = document.createElement('div');
      div.className = '__verify-hit-overlay';
      div.style.cssText = `position:fixed;left:${h.l}px;top:${h.t}px;width:${h.w}px;height:${h.h}px;border:3px solid red;z-index:99999;pointer-events:none;box-sizing:border-box;`;
      document.body.appendChild(div);
    });
  }, report.hits);

  const outFile = path.join(OUT_DIR, `${id}.png`);
  await page.screenshot({ path: outFile });

  const bad = report.hits.filter(h => {
    if (h.w < 4 || h.h < 4) return true; // prácticamente 0×0
    if (!report.shotRect) return false;
    const s = report.shotRect;
    return h.l < s.l - 2 || h.t < s.t - 2 || h.l + h.w > s.l + s.w + 2 || h.t + h.h > s.t + s.h + 2;
  });

  console.log(`\n[${id}] ${report.hits.length} hitbox(es) → ${outFile}`);
  report.hits.forEach(h => console.log(`  - ${h.label || '(sin label)'}: ${Math.round(h.w)}×${Math.round(h.h)} @ (${Math.round(h.l)},${Math.round(h.t)})`));
  if (bad.length) {
    failures += bad.length;
    bad.forEach(h => console.log(`  ⚠️  SOSPECHOSO: "${h.label}" — rect 0×0 o fuera del área de la captura`));
  }
}

if (consoleErrors.length) {
  console.log('\n⚠️ Errores de consola durante la corrida:');
  consoleErrors.forEach(e => console.log('  ' + e));
}

console.log(`\n${targets.length} diapositiva(s) revisada(s), ${failures} hitbox(es) sospechoso(s) automáticamente.`);
console.log(`Screenshots con overlay en: ${OUT_DIR}/`);
console.log('IMPORTANTE: el chequeo automático solo detecta coordenadas rotas (0×0 o fuera de rango).');
console.log('Un hitbox con tamaño válido puede seguir estando MAL UBICADO (ver bug real de "conceptos",');
console.log('CLAUDE.md §3 punto 4) — siempre mirar los screenshots, no confiar solo en "0 sospechosos".');

await browser.close();
process.exit(failures ? 1 : 0);
