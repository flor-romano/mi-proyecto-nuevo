#!/usr/bin/env node
/* hitbox-click-check.mjs — kit-base v1.0
   Versión pass/fail (para CI) de verify-hitboxes.mjs: para cada
   diapositiva con [data-shot], cada [data-hit] tiene que:
     1) tener tamaño real > 0 (coordenadas inicializadas),
     2) estar dentro de los límites de [data-shot] (no desbordar),
     3) ser lo que realmente recibe el click en su propio centro —
        detecta el caso "otro elemento con z-index más alto lo tapa",
        que verify-hitboxes.mjs (solo mira el rect, no hace click real)
        no atrapa.
   No verifica que el CONTENIDO del click sea el correcto (eso requiere
   saber qué hace cada botón) — para eso, usar verify-hitboxes.mjs y
   mirar el screenshot a ojo contra el arte. */
import { openCourse, report, requireUrl, irASlide } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

const slideIds = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]'))
    .filter(s => s.querySelector('[data-shot]'))
    .map(s => s.getAttribute('data-slide'))
);

for (const id of slideIds) {
  /* Navegación por el motor + verificación (kit-base v1.9.65, helper
     compartido). Antes clickeaba el índice, `disabled` en cualquier
     curso con gate: este test venía revisando los hitboxes de la misma
     diapositiva alcanzable, repetida, y dando verde. Ver `irASlide`. */
  const llego = await irASlide(page, id);
  if (llego !== id) {
    fails.push(`no se pudo navegar a "${id}" (quedó en "${llego}") — NO auditada`);
    continue;
  }
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(150);

  const issues = await page.evaluate((slideId) => {
    const out = [];
    const shot = document.querySelector('[data-slide]:not([hidden]) [data-shot]');
    if (!shot) return out;
    const shotRect = shot.getBoundingClientRect();
    shot.querySelectorAll('[data-hit]').forEach(h => {
      const label = (h.querySelector('.sr-only')?.textContent || h.getAttribute('aria-label') || h.className || '(sin label)').trim();
      /* Un hitbox ESCONDIDO A PROPÓSITO no es un hitbox roto
         (kit-base v1.9.74, §7.20 B5). Un elemento con `hidden` —o con
         `display:none`/`visibility:hidden` heredado— mide 0x0, que es
         exactamente la huella de "nunca se inicializó". Sin esta
         distinción el kit SE HACE FALLAR A SÍ MISMO: las flechas
         `data-shot-swap-step` del propio kit se esconden al llegar a
         los extremos, que es su comportamiento correcto. */
      const oculto = h.hidden || h.closest('[hidden]') ||
        (() => { const st = getComputedStyle(h);
                 return st.display === 'none' || st.visibility === 'hidden'; })();
      if (oculto) return;

      const r = h.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) {
        out.push(`[${slideId}] "${label}": tamaño ${Math.round(r.width)}×${Math.round(r.height)} (no inicializado o roto)`);
        return;
      }
      if (r.left < shotRect.left - 2 || r.top < shotRect.top - 2 ||
          r.left + r.width > shotRect.left + shotRect.width + 2 ||
          r.top + r.height > shotRect.top + shotRect.height + 2) {
        out.push(`[${slideId}] "${label}": se sale del área de la captura`);
      }
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const topEl = document.elementFromPoint(cx, cy);
      if (!topEl || !(topEl === h || h.contains(topEl))) {
        out.push(`[${slideId}] "${label}": otro elemento tapa el centro del hitbox (elementFromPoint no devuelve este botón)`);
      }
    });
    return out;
  }, id);
  fails.push(...issues);
}

if (errors.length) fails.push(...errors.map(e => 'error de consola: ' + e));
report('hitbox-click-check', fails);
await browser.close();
