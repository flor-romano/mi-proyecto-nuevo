#!/usr/bin/env node
/* verify-places.mjs — herramienta LOCAL de "Surtido sin venta"
   ------------------------------------------------------------
   `CLAUDE.md` §7.3 punto 9 dice, textualmente: "El overlay de hitboxes
   también dibuja los `[data-place]`, y hay que mirarlos... Se ve
   corriendo `tools/verify-hitboxes.mjs` y mirando las capturas".
   No es cierto contra el código real: `verify-hitboxes.mjs` consulta
   `shot.querySelectorAll('[data-hit]')` y nada más — la palabra
   `data-place` no aparece en el archivo. Este curso tiene 9
   `[data-place]` (5 píldoras de "Últimos consejos", 4 números de los
   paneles finales del mini juego) y el overlay del kit los dibujaba a
   ninguno, así que "mirá las capturas" no alcanzaba para verificarlos.
   Queda relayado; mientras tanto, esto los dibuja en azul.

   Uso: node tools/verify-places.mjs <url> [carpeta_salida]
*/
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const url = process.argv[2];
const out = process.argv[3] || 'verify-places-out';
if (!url) { console.error('Uso: node tools/verify-places.mjs <url> [salida]'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(url);
await page.waitForTimeout(600);
await page.keyboard.press('Escape').catch(() => {});

const slides = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]'))
    .filter((s) => s.querySelector('[data-place]'))
    .map((s) => s.getAttribute('data-slide')));

for (const id of slides) {
  await page.evaluate((s) => {
    const m = window.motor;
    for (let k = 0; k < m.slides.length; k++) {
      if (m.slides[k].getAttribute('data-slide') === s) { m.go(k, true); break; }
    }
  }, id);
  await page.waitForTimeout(400);

  /* Las capas ocultas se revelan de a una: los `[data-place]` de los
     paneles finales del mini juego viven adentro de `[data-panel][hidden]`. */
  const paneles = await page.evaluate((s) =>
    Array.from(document.querySelectorAll(`[data-slide="${s}"] [data-panel]`))
      .map((p) => p.getAttribute('data-panel')), id);
  const vistas = paneles.length ? paneles : [null];

  for (const panel of vistas) {
    await page.evaluate(({ s, p }) => {
      if (p) {
        document.querySelectorAll(`[data-slide="${s}"] [data-panel]`)
          .forEach((el) => { el.hidden = el.getAttribute('data-panel') !== p; });
      }
      document.querySelectorAll('.__place-dbg').forEach((el) => el.remove());
      document.querySelectorAll(`[data-slide="${s}"] [data-place]`).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const d = document.createElement('div');
        d.className = '__place-dbg';
        d.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;` +
          'height:' + r.height + 'px;border:2px solid #0a84ff;box-shadow:0 0 0 1px #fff inset;' +
          'z-index:9999;pointer-events:none';
        document.body.appendChild(d);
      });
    }, { s: id, p: panel });
    await page.waitForTimeout(150);
    const nombre = panel ? `${id}--${panel}` : id;
    await page.screenshot({ path: `${out}/${nombre}.png` });
    const n = await page.evaluate((s) =>
      document.querySelectorAll(`[data-slide="${s}"] [data-place]`).length, id);
    console.log(`[${nombre}] ${n} [data-place] → ${out}/${nombre}.png`);
  }
}
await browser.close();
