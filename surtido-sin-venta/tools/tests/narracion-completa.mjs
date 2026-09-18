#!/usr/bin/env node
/* narracion-completa.mjs — kit-base v1.9.76
   ------------------------------------------------------------
   POR QUÉ EXISTE. Lee la salida REAL de `Narrador.textOf()` por
   diapositiva. Ninguno de los otros tests la mira, y ahí se esconden
   fallas que no dan error y que el alumno SÍ nota:

     · una diapositiva MUDA (`textOf()` devuelve '') — el curso "no
       narra" y nada lo delata. Ya pasó con 14 diapositivas mudas;
     · un widget "uno a la vez" que muestra sus variantes SEGUIDAS
       porque están escondidas con CSS y no con el atributo `hidden`:
       `textOf()` filtra por `hidden`, NUNCA por el `display` calculado
       (§7.21 F1). Se esconde de la vista pero no de la voz;
     · texto pegado o punto doble en los límites entre nodos narrados.

   LA TRAMPA DEL PROPIO TEST (§7.21 F7): para leer el `textOf()` de una
   diapositiva hay que NAVEGAR a ella primero. El narrador filtra por
   `hidden` y todas menos la activa lo tienen, así que recorrer el DOM
   de una sola pasada devuelve '' para todas y parece que el curso
   entero está mudo. Por eso acá se navega diapositiva por diapositiva.

   Una diapositiva que ES un video (`.d-shot-slide--bg-video`) narra ''
   A PROPÓSITO (§5): el video trae su propia locución. Eso no es un
   fallo — pero SÍ lo es que tenga ese `''` sin ser de video.
*/
import { openCourse, report, requireUrl, irASlide } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

const hayNarrador = await page.evaluate(() => !!(window.Narrador && window.Narrador.textOf));
if (!hayNarrador) {
  report('narracion-completa', ['el curso no expone `Narrador.textOf` — ¿se cargó narrador.js?']);
  await browser.close();
  process.exit(process.exitCode || 0);
}

const ids = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]')).map((s) => s.getAttribute('data-slide')));

for (const id of ids) {
  if (!(await irASlide(page, id))) { fails.push(`no se pudo navegar a "${id}"`); continue; }

  const r = await page.evaluate((slideId) => {
    const el = document.querySelector(`[data-slide="${slideId}"]`);
    if (!el) return null;
    const texto = window.Narrador.textOf(el) || '';
    return {
      texto,
      esVideo: el.classList.contains('d-shot-slide--bg-video'),
      /* Variantes "uno a la vez" escondidas con CSS en vez de `hidden`:
         el narrador las va a leer TODAS, una detrás de otra. */
      ocultasPorCss: Array.from(el.querySelectorAll('[data-panel], [data-repaso-item], .d-mj-nivel'))
        .filter((n) => {
          if (n.hidden) return false;                        // bien escondido
          const st = getComputedStyle(n);
          return st.display === 'none' || st.visibility === 'hidden';
        })
        .map((n) => n.getAttribute('data-panel') || n.className || n.tagName.toLowerCase())
        .slice(0, 4)
    };
  }, id);
  if (!r) continue;

  if (!r.texto.trim() && !r.esVideo) {
    fails.push(`"${id}": `+
      'Narrador.textOf() devuelve vacío y la diapositiva no es de video — va a quedar MUDA ' +
      'sin dar ningún error. Si es a propósito, marcala .d-shot-slide--bg-video.');
  }
  if (r.esVideo && r.texto.trim()) {
    fails.push(`"${id}": es .d-shot-slide--bg-video pero igual narra ` +
      `("${r.texto.slice(0, 40)}…") — se va a encimar con el audio del video.`);
  }
  if (r.ocultasPorCss.length) {
    fails.push(`"${id}": ${r.ocultasPorCss.length} pieza(s) escondida(s) con CSS y no con el ` +
      `atributo \`hidden\` (${r.ocultasPorCss.join(', ')}). textOf() filtra por \`hidden\`, ` +
      'así que las va a narrar TODAS seguidas (§7.21 F1).');
  }
  if (/[.!?]\s*[.!?]/.test(r.texto)) {
    const m = r.texto.match(/.{0,25}[.!?]\s*[.!?].{0,25}/);
    fails.push(`"${id}": puntuación doble en el texto narrado — "…${m[0]}…"`);
  }
  if (/[a-záéíóúñ][A-ZÁÉÍÓÚÑ]/.test(r.texto)) {
    const m = r.texto.match(/.{0,20}[a-záéíóúñ][A-ZÁÉÍÓÚÑ].{0,20}/);
    fails.push(`"${id}": dos frases pegadas sin separador — "…${m[0]}…"`);
  }
}

if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
report('narracion-completa', fails);
await browser.close();
