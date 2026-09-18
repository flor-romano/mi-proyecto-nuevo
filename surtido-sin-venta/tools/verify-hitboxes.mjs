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
  /* Navegar por el motor y NO clickeando el `[data-goto]` del índice
     (kit-base v1.9.61, hallazgo de la migración de "Surtido sin
     ventas"). En un curso con gate de avance, `initIndexJumps()` deja
     `disabled` los ítems del índice de las diapositivas todavía no
     vistas (addendum §8) — y un clic sobre un botón `disabled` es un
     no-op SILENCIOSO: el script seguía "recorriendo" el curso y
     midiendo, pero todas las mediciones eran de la última diapositiva
     alcanzable, repetida. Un informe entero de hitboxes que parece
     correcto y no describe lo que dice describir: el peor modo de
     fallar para una herramienta de verificación.
     `go(idx, true)` saltea gates a propósito y sin animación — el
     mismo criterio que `?review=1` y que ya usaba `visual-regress.mjs`
     (cuyo comentario decía "mismo criterio que verify-hitboxes.mjs"
     cuando en realidad acá se clickeaba; ahora sí es cierto). El clic
     queda de último recurso para un curso sin `window.motor`. */
  const llego = await page.evaluate((slideId) => {
    const m = window.motor;
    let ok = false;
    if (m && m.slides && m.go) {
      for (let k = 0; k < m.slides.length; k++) {
        if (m.slides[k].getAttribute('data-slide') === slideId) { m.go(k, true); ok = true; break; }
      }
    }
    if (!ok) {
      const link = document.querySelector(`[data-goto="${slideId}"]`);
      if (link) link.click();
    }
    const act = document.querySelector('[data-slide]:not([hidden])');
    return act ? act.getAttribute('data-slide') : null;
  }, id);
  /* Y se VERIFICA que haya llegado (kit-base v1.9.64, relay de
     "Seguridad alimentaria"). Navegar bien no alcanza: si por lo que
     sea la diapositiva no cambia, el script seguiría midiendo la
     anterior y reportando "0 sospechosos" sobre una diapositiva que no
     es la que dice. Auditar en silencio la diapositiva equivocada es
     peor que fallar: la herramienta existe para dar confianza antes de
     entregar, y ahí la estaría dando falsa. */
  if (llego !== id) {
    console.log(`  ⚠️  no se pudo navegar a "${id}" (quedó en "${llego}") — se saltea, NO se audita`);
    failures++;
    continue;
  }
  await page.waitForTimeout(600);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);

  const report = await page.evaluate(() => {
    const shot = document.querySelector('[data-slide]:not([hidden]) [data-shot]');
    if (!shot) return { hits: [], shotRect: null };
    const shotRect = shot.getBoundingClientRect();
    /* Se saltean los hitboxes OCULTOS A PROPÓSITO (kit-base v1.9.64):
       un `[data-hit]` con `hidden`/`display:none` da rect 0x0, que es
       EXACTAMENTE la firma de "coordenadas rotas" que este script
       busca — pero acá no está roto, está bien escondido. Caso real:
       las flechas anterior/siguiente de un carrusel, donde la que se
       iría de rango se oculta sola (§6.45: un botón invisible sobre una
       flecha que el arte no dibuja ES el hitbox fantasma a evitar). Sin
       el filtro, cada corrida reportaba 2 "sospechosos" que no lo eran
       — y un ⚠️ que aparece siempre y nunca importa es un ⚠️ que se
       deja de leer, justo el día que aparezca uno de verdad. */
    const visible = (el) => {
      if (el.hidden || el.closest('[hidden]')) return false;
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    };
    const hits = Array.from(shot.querySelectorAll('[data-hit]')).filter(visible).map(h => {
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
