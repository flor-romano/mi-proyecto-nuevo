/* Test de contenido — específico de este curso, no genérico (aunque
   el fix que verifica es 100% de kit: `.d-instr-item` en TEXT_SEL).
   Pedido explícito del cliente: la grilla de 3 tips de "Ayuda"
   (Tarjetas y flechas / Video / Mini juego) tiene que narrarse — antes
   quedaba muda porque su texto vive en <span>/<small> sueltos, ninguno
   de los tags que ya se narraban. "Cómo recorrer el curso" queda
   mudo a propósito (decisión explícita del cliente, distinta).
   Desde kit-base v1.9.36 (CLAUDE.md §6.57) "Ayuda" ya no es un
   [data-popup] — es uno de los botones flotantes de [data-fab-stack],
   mismo contenido, selector distinto. */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

const r = await page.evaluate(() => {
  var ayuda = document.querySelector('[data-fab-ctl="ayuda"] .d-fab-pop');
  var instr = document.querySelector('[data-popup="instrucciones"]');
  return {
    ayuda: window.Narrador.textOf(ayuda),
    instrucciones: window.Narrador.textOf(instr.querySelector('.modal-card'))
  };
});

if (!/Tarjetas y flechas\. tocalas/.test(r.ayuda)) failures.push(`falta el tip de tarjetas/flechas bien separado: "${r.ayuda}"`);
if (!/Video\. en "El proceso/.test(r.ayuda)) failures.push(`falta el tip de video bien separado: "${r.ayuda}"`);
if (!/Mini juego\. encontr/.test(r.ayuda)) failures.push(`falta el tip de mini juego bien separado: "${r.ayuda}"`);
if (r.instrucciones !== '') failures.push(`"instrucciones" debería seguir mudo (decisión explícita del cliente), dio: "${r.instrucciones}"`);

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
await browser.close();
report('narracion-tips-de-ayuda', failures);
