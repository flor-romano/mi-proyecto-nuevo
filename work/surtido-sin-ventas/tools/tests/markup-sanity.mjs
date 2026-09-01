#!/usr/bin/env node
/* markup-sanity.mjs — candidato a kit v1.4
   ------------------------------------------------------------
   Nace de un bug real de "Prevención cardiovascular": a un botón de video
   le faltaba el ">" de cierre de la etiqueta, así que el navegador parseó
   <span class="sr-only"> como ATRIBUTOS del botón. Resultado: el texto
   accesible quedó como texto directo del botón y se veía escrito encima
   del video, sobre el arte.

   Por qué no lo agarraba ningún test existente:
     · deep-audit → el botón seguía teniendo nombre accesible (justamente
       porque el texto pasó a ser su contenido), así que pasaba.
     · hitbox-click-check → el rect seguía siendo válido y clickeable.
     · scroll-audit / keyboard-a11y → nada que ver.
   Solo se vio mirando el screenshot con overlay de verify-hitboxes.mjs.
   Este test automatiza esa clase de error, que es fácil de introducir
   editando HTML a mano y difícil de ver leyendo el archivo.

   Chequea 3 cosas, todas genéricas (no saben nada del contenido):
     1. Ningún elemento tiene atributos "imposibles" (span/div/button/img
        como nombre de atributo) — huella típica de una etiqueta sin cerrar.
     2. Ningún [data-hit] / .d-shot-hit tiene texto VISIBLE: sobre una
        diapositiva-captura el texto va siempre en un .sr-only (si no, se
        dibuja encima del arte) — SALVO que el hitbox lleve
        `data-hit-label-visible` (kit v1.9.5): un botón real reconstruido
        sobre una zona que el arte trae en blanco a propósito (ej. el
        "Continuar"/"Reintentar" del panel final del minijuego, cuyo
        mensaje depende del resultado y no puede quedar horneado en la
        imagen — CLAUDE.md §6.19). Ahí el texto visible ES el nombre
        accesible real, no una fuga de un .sr-only mal cerrado.
     3. Ningún elemento con clase .sr-only quedó visible en pantalla
        (regla de CSS pisada, clase mal escrita, etc.).
     4. Ningún id está repetido en el documento (ver el bloque 5, abajo).
*/
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);

const fails = await page.evaluate(() => {
  const out = [];

  // 1 · atributos "imposibles" = etiqueta anterior sin cerrar con ">"
  const sospechosos = ['span', 'div', 'button', 'img', 'p', 'section', 'svg'];
  document.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(a => {
      const n = a.name.toLowerCase();
      if (n.startsWith('<') || sospechosos.includes(n)) {
        out.push(`<${el.tagName.toLowerCase()}> tiene el atributo "${a.name}" — casi seguro es una etiqueta sin cerrar con ">": ${el.outerHTML.slice(0, 100)}`);
      }
    });
  });

  // 2 · hitboxes con texto visible (tiene que estar todo en .sr-only),
  //     salvo el opt-out explícito data-hit-label-visible (ver arriba)
  document.querySelectorAll('[data-hit]:not([data-hit-label-visible]), .d-shot-hit:not([data-hit-label-visible])').forEach(h => {
    const directo = Array.from(h.childNodes)
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent.trim())
      .filter(Boolean).join(' ');
    if (directo) {
      out.push(`hitbox con texto visible (debería ir dentro de un .sr-only): "${directo.slice(0, 60)}"`);
    }
  });

  // 3 · .sr-only que quedó visible
  document.querySelectorAll('.sr-only, .sr-only-text').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 4 && r.height > 4) {
      out.push(`.sr-only visible en pantalla (${Math.round(r.width)}×${Math.round(r.height)}): "${el.textContent.trim().slice(0, 60)}"`);
    }
  });

  return out;
});

/* 4 · estructura reventada por una etiqueta de cierre DE MÁS.
   Bug real en "Prevención cardiovascular": al borrar un bloque quedó un
   </div> huérfano. El navegador cerró .d-app antes de tiempo y la mitad
   de las diapositivas pasaron a ser hijas de <body>; el pie del
   reproductor se estiró a toda la pantalla. NINGUNO de los 6 tests lo
   detectaba —todos verifican elementos, no el árbol— y el curso "se
   veía roto" sin un solo error de consola. Un cierre de más no rompe el
   parseo (no hay error), solo mueve el resto del documento afuera del
   contenedor: por eso hay que chequear la CONTENCIÓN explícitamente. */
const estructura = await page.evaluate(() => {
  const out = [];
  const app = document.querySelector('.d-app');
  if (!app) { out.push('no existe .d-app'); return out; }
  const total = document.querySelectorAll('[data-slide]').length;
  const dentro = document.querySelectorAll('.d-app [data-slide]').length;
  if (dentro !== total) {
    out.push(`${total - dentro} de ${total} diapositivas quedaron FUERA de .d-app ` +
             '(casi siempre: una etiqueta de cierre de más en el HTML)');
  }
  const sueltas = Array.from(document.body.children)
    .filter(el => el.matches('[data-slide]')).length;
  if (sueltas) out.push(`${sueltas} diapositiva(s) colgando directamente de <body>`);
  return out;
});
fails.push(...estructura);

/* 5 · ids duplicados.
   Bug real al migrar "Uso de Sucursales 3 - NOA" al bloque flotante de
   Ayuda/Configuración: los controles de voz/velocidad/reset vivían en el
   drawer viejo y se agregaron también al flotante, así que por un rato
   hubo dos #d-rate-range, dos #d-config-reset, etc. `getElementById`
   devuelve SIEMPRE el primero del documento, de modo que
   initVoicePicker/initRatePicker/initConfigReset cablearon los controles
   VIEJOS y los del flotante quedaron muertos: el alumno los ve, los toca
   y no pasa nada. Cero errores de consola y los 7 tests en verde — es
   exactamente la clase de fallo silencioso que este archivo existe para
   atrapar. Barato de chequear y sirve para cualquier curso, porque todo
   el kit busca sus controles por id. */
const idsDup = await page.evaluate(() => {
  const vistos = new Set(); const dup = new Set();
  document.querySelectorAll('[id]').forEach((el) => {
    if (vistos.has(el.id)) dup.add(el.id); else vistos.add(el.id);
  });
  return Array.from(dup);
});
fails.push(...idsDup.map((id) => `id duplicado: #${id} — getElementById toma el primero, ` +
  'el resto queda sin cablear (visible pero muerto)'));

if (errors.length) fails.push(...errors.map(e => 'error de consola: ' + e));
report('markup-sanity', fails);
await browser.close();
