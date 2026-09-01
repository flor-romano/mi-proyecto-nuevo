/* Test de contenido — específico de este curso, no genérico.
   Pedido explícito del cliente: el título horneado en el arte de cada
   diapositiva (idéntico al `<h2 data-slide-title>`) debe narrarse ANTES
   del cuerpo — a diferencia del default del kit (nunca narrar títulos).
   Este curso lo prende con `Narrador.setNarrateTitles(true)`. */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

const r = await page.evaluate(() => {
  var out = {};
  window.motor.gotoId('alteracion');
  out.alteracion = window.Narrador.textOf(document.querySelector('[data-slide="alteracion"]'));
  window.motor.gotoId('temperatura');
  out.temperatura = window.Narrador.textOf(document.querySelector('[data-slide="temperatura"]'));
  // Video de fondo: el fix anterior sigue ganando (nunca se narra, con
  // o sin títulos prendidos).
  window.motor.gotoId('unidad1');
  out.unidad1 = window.Narrador.textOf(document.querySelector('[data-slide="unidad1"]'));
  return out;
});

if (!r.alteracion.startsWith('Alteración.')) {
  failures.push(`esperaba que "alteracion" empiece narrando su título ("Alteración. ..."), dio: "${r.alteracion.slice(0, 60)}..."`);
}
if (!r.temperatura.startsWith('Temperatura alimentaria.')) {
  failures.push(`esperaba que "temperatura" empiece narrando su título, dio: "${r.temperatura.slice(0, 60)}..."`);
}
if (r.unidad1 !== '') {
  failures.push(`"unidad1" (video de fondo) debería seguir sin narrarse nada, dio: "${r.unidad1}"`);
}

// El glosario no se ve afectado: sigue narrando SOLO la frase de
// entrada (data-narrate-only), nunca la lista completa de términos.
await page.evaluate(() => window.motor.gotoId('cierre'));
await page.click('[data-popup-trigger="glosario"]');
await page.waitForTimeout(300);
const glosScope = await page.evaluate(() => {
  var pop = document.querySelector('[data-popup="glosario"]');
  var scope = pop.querySelector('[data-narrate-only]');
  return window.Narrador.textOf(scope);
});
if (!/Los términos de seguridad alimentaria/.test(glosScope) || /Peligro biológico/.test(glosScope)) {
  failures.push(`el glosario debería narrar solo la intro, no la lista de términos: "${glosScope}"`);
}

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
await browser.close();
report('narracion-titulos-de-diapo', failures);
