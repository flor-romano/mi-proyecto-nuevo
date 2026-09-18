#!/usr/bin/env node
/* overlays-colocados.mjs — kit-base v1.9.74
   ------------------------------------------------------------
   POR QUÉ EXISTE. Un relay de "Seguridad de la información" lo llamó
   "el gap que más caro salió" de todo el curso, y la frase que lo
   resume es ésta: **catorce píldoras revelables no se veían, con los
   once tests en verde**.

   El mecanismo está documentado hace rato (CLAUDE.md §6.22 punto 7,
   §6.45) y hasta tiene un aviso escrito en el motor: `Motor._initShots`
   escribe `left/top/width/height` EN PÍXELES y COMO ESTILO EN LÍNEA
   sobre cada `[data-hit]`/`[data-place]`. Sobre un elemento en flujo
   normal (`position: static`, el default) eso NO HACE NADA: la pieza
   cae al final del flujo, fuera del arte — y mientras tanto el clic
   sigue sumando puntos, así que el curso parece funcionar.

   El motor avisa por `console.warn`. El problema es que **ningún test
   del kit escuchaba los `warning`**: `_shared.mjs` filtra
   `msg.type() !== 'error'`. Un aviso que nadie escucha es un aviso que
   no existe.

   Este test hace las dos cosas que faltaban:
     1. Escucha la consola INCLUYENDO `warning`, y falla si el motor
        avisó por un overlay sin `position:absolute`.
     2. No se conforma con el aviso: mide. Cada `[data-hit]`/
        `[data-place]` tiene que caer DENTRO de su `[data-shot]`, con
        una tolerancia de 4px — que es la diferencia entre "está
        colocado" y "está en el lugar donde lo dejó el flujo".

   Recorre TODAS las diapositivas, no solo la primera: el bug del relay
   estaba en una diapositiva del medio. Y revela las capas ocultas una
   por una, por el mismo motivo que `clip-audit`: un overlay dentro de
   un `[data-panel][hidden]` es justamente donde esto se esconde.
*/
import { openCourse, report, requireUrl, irASlide } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

/* La consola, con warnings. `openCourse` ya engancha los `error`; acá
   se suma un segundo oyente SOLO para los avisos del motor, filtrado
   por su prefijo para no arrastrar ruido de terceros. */
const avisos = [];
page.on('console', (msg) => {
  if (msg.type() !== 'warning') return;
  const t = msg.text();
  if (t.includes('[motor-slides]')) avisos.push(t);
});

const ids = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]')).map((s) => s.getAttribute('data-slide')));

for (const id of ids) {
  const ok = await irASlide(page, id);
  if (!ok) { fails.push(`no se pudo navegar a "${id}"`); continue; }

  const problemas = await page.evaluate((slideId) => {
    const out = [];
    const slide = document.querySelector(`[data-slide="${slideId}"]`);
    if (!slide) return out;

    /* Las capas ocultas se revelan de a una: un overlay dentro de un
       `[data-panel][hidden]` es donde este bug se esconde mejor. */
    const paneles = Array.from(slide.querySelectorAll('[data-panel]'));
    const estados = paneles.map((p) => p.hidden);

    function medir(contexto) {
      slide.querySelectorAll('[data-shot]').forEach((shot) => {
        const sr = shot.getBoundingClientRect();
        if (!sr.width || !sr.height) return;      // shot todavía sin medidas: no es su turno
        shot.querySelectorAll('[data-hit], [data-place]').forEach((h) => {
          const st = getComputedStyle(h);
          if (st.display === 'none' || st.visibility === 'hidden') return;
          const etiqueta = (h.querySelector('.sr-only')?.textContent ||
            h.getAttribute('aria-label') || h.className || h.tagName.toLowerCase()).trim().slice(0, 40);

          if (st.position !== 'absolute') {
            out.push(`${contexto}"${etiqueta}": position:${st.position} — el motor le escribe ` +
              `left/top en px y eso no hace NADA sobre un elemento en flujo. ` +
              `Cae fuera del arte mientras el clic sigue contando.`);
            return;
          }
          const r = h.getBoundingClientRect();
          if (!r.width || !r.height) return;      // sin caja: lo cubre hitbox-click-check
          const T = 4;
          if (r.left < sr.left - T || r.top < sr.top - T ||
              r.right > sr.right + T || r.bottom > sr.bottom + T) {
            out.push(`${contexto}"${etiqueta}": cae fuera de su [data-shot] ` +
              `(${Math.round(r.left - sr.left)}, ${Math.round(r.top - sr.top)} sobre ` +
              `${Math.round(sr.width)}×${Math.round(sr.height)})`);
          }
        });
      });
    }

    medir(`[${slideId}] `);
    paneles.forEach((p, i) => {
      paneles.forEach((o) => { o.hidden = true; });
      p.hidden = false;
      medir(`[${slideId}] (capa "${p.getAttribute('data-panel')}") `);
    });
    paneles.forEach((p, i) => { p.hidden = estados[i]; });
    return out;
  }, id);

  fails.push(...problemas);
}

if (avisos.length) {
  fails.push(...[...new Set(avisos)].map((a) =>
    `el motor avisó por consola y nadie lo escuchaba: ${a.slice(0, 160)}`));
}
if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
report('overlays-colocados', fails);
await browser.close();
