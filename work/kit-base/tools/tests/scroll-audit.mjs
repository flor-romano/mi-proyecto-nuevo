#!/usr/bin/env node
/* scroll-audit.mjs — kit-base v1.0
   Cero scroll de página en NINGUNA diapositiva, en un set de tamaños
   de ventana representativos (incluye algunos achatados/angostos, no
   solo 16:9 de escritorio, para agarrar overflow que solo aparece en
   pantallas atípicas). Chequea overflow vertical Y horizontal. */
import { chromium } from 'playwright-core';
import { report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const VIEWPORTS = [
  { w: 1920, h: 1080, label: '1920×1080' },
  { w: 1366, h: 768, label: '1366×768' },
  { w: 1440, h: 900, label: '1440×900' },
  { w: 1280, h: 720, label: '1280×720 (angosta)' },
  { w: 1024, h: 1366, label: '1024×1366 (tablet vertical)' },
  { w: 1024, h: 768, label: '1024×768 (iPad horizontal)' },
  { w: 1366, h: 1024, label: '1366×1024 (iPad Pro horizontal)' },
  { w: 768, h: 1024, label: '768×1024 (iPad chico vertical)' }
];

const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const fails = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});

  /* BUG REAL encontrado en tablet (iPad 1024px) con un nombre real de
     alumno: sin él, `#d-greet` (el saludo "👋 Hola, Nombre") queda
     hidden en cualquier corrida automática — no hay LMS real dando
     `cmi.core.student_name` — así que este chequeo SIEMPRE corría con
     el header en su versión más angosta posible, nunca con el ancho
     real que un alumno de verdad genera. Se simula acá, una vez por
     viewport, con un nombre deliberadamente largo (peor caso real,
     no el más corto) para que la barra se mida en las condiciones
     que de verdad importan. */
  await page.evaluate(() => {
    const el = document.getElementById('d-greet');
    if (!el) return;
    el.textContent = '';
    const ic = document.createElement('span');
    ic.className = 'ic'; ic.setAttribute('aria-hidden', 'true'); ic.textContent = '👋';
    el.appendChild(ic);
    el.appendChild(document.createTextNode(' Hola, Alejandra Fernandez'));
    el.hidden = false;
  });

  /* Chequeo aparte del de scroll de página: `body{overflow:hidden}`
     (kit-base, a propósito — CLAUDE.md) tapa cualquier overflow a
     nivel documento, así que un `.d-top`/`.d-bottom` más ancho que la
     ventana (bug real de CSS Grid: la columna implícita de `.d-app`
     sin `minmax(0,1fr)` crece con el min-content de sus hijos
     `flex:none` en vez de respetar el ancho fijo del contenedor) queda
     invisible para `document.documentElement.scrollWidth` — hay que
     medir la barra en sí. */
  const barOverflow = await page.evaluate(() => {
    const vw = window.innerWidth;
    const top = document.querySelector('.d-top');
    const bottom = document.querySelector('.d-bottom');
    return {
      top: top ? top.scrollWidth - vw : 0,
      bottom: bottom ? bottom.scrollWidth - vw : 0
    };
  });
  if (barOverflow.top > 2) fails.push(`[${vp.label}] .d-top se desborda ${barOverflow.top}px con un nombre real en el saludo`);
  if (barOverflow.bottom > 2) fails.push(`[${vp.label}] .d-bottom se desborda ${barOverflow.bottom}px con un nombre real en el saludo`);

  const slideIds = await page.evaluate(() => Array.from(document.querySelectorAll('[data-slide]')).map(s => s.getAttribute('data-slide')));
  for (const id of slideIds) {
    await page.evaluate((slideId) => {
      const link = document.querySelector(`[data-goto="${slideId}"]`);
      if (link) link.click();
    }, id);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const out = {
        vScroll: doc.scrollHeight - doc.clientHeight,
        hScroll: doc.scrollWidth - doc.clientWidth,
        recorte: 0
      };
      /* "Sin scroll" NO alcanza como criterio. Bug real en "Prevención
         cardiovascular": el contenido de la mini práctica medía 860px
         contra 600 disponibles, pero como .slide-inner está centrado y
         la diapositiva recorta lo que sobra, la PÁGINA no scrolleaba —
         simplemente el encabezado de la actividad quedaba cortado y
         fuera de alcance, que es peor que un scroll. Hay que comparar
         el alto real del contenido contra el de su diapositiva. */
      const slide = document.querySelector('[data-slide]:not([hidden])');
      // Solo los .slide-inner que están REALMENTE en pantalla: el cierre
      // tiene uno oculto (el resumen, display:none) y medirlo daba un
      // recorte falso igual al alto del encabezado — falsa alarma
      // detectada al estrenar este chequeo.
      const inner = slide && Array.from(slide.querySelectorAll('.slide-inner'))
        .find(el => el.offsetParent !== null && el.getBoundingClientRect().height > 0);
      if (inner) {
        const ir = inner.getBoundingClientRect(), sr = slide.getBoundingClientRect();
        out.recorte = Math.round(Math.max(sr.top - ir.top, ir.bottom - sr.bottom));
      }
      return out;
    });
    if (overflow.vScroll > 2) fails.push(`[${vp.label}] data-slide="${id}": scroll vertical de ${overflow.vScroll}px`);
    if (overflow.hScroll > 2) fails.push(`[${vp.label}] data-slide="${id}": scroll horizontal de ${overflow.hScroll}px`);
    if (overflow.recorte > 2) fails.push(`[${vp.label}] data-slide="${id}": el contenido se recorta ${overflow.recorte}px (no hay scroll, pero queda fuera de alcance)`);
  }
  await page.close();
}

report('scroll-audit', fails);
await browser.close();
