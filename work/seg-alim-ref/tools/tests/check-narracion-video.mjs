/* Test de contenido — específico de este curso, no genérico.
   Verifica el fix de un bug real: las 4 diapositivas de video de fondo
   (portada + 3 separadores de unidad) tienen un `<p>` real dentro de su
   `.sr-only` — antes del fix, `speakSlide()` lo narraba igual que
   cualquier párrafo, así que el video (con su propio audio) y la
   locución competían al mismo tiempo. `textOf()` (kit, narrador.js)
   ahora devuelve '' para cualquier `.d-shot-slide--bg-video`. */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

// textOf() filtra contenido dentro de [hidden] — el motor marca hidden
// a toda diapo que no sea la activa. Hay que NAVEGAR a cada una antes
// de leer su texto: si no, da vacío por estar oculta (cualquier diapo
// no-activa), no por el fix que se está probando acá.
const r = await page.evaluate(() => {
  var out = {};
  ['portada', 'unidad1', 'unidad2', 'unidad3', 'inocuidad'].forEach(function (id) {
    window.motor.gotoId(id);
    out[id] = window.Narrador.textOf(document.querySelector('[data-slide="' + id + '"]'));
  });
  return out;
});

['portada', 'unidad1', 'unidad2', 'unidad3'].forEach(function (id) {
  if (r[id] !== '') failures.push(`textOf(${id}) debería ser '' (diapo de video), fue: "${r[id]}"`);
});
if (!r.inocuidad || r.inocuidad.length < 10) {
  failures.push(`textOf(inocuidad) debería traer texto real, trajo: "${r.inocuidad}"`);
}

// Spy real sobre speechSynthesis.speak(): al entrar a una diapo de
// video de fondo, nunca debería llamarse. Cancela primero cualquier
// locución en curso/encolada de la navegación anterior (el chequeo de
// arriba visitó "inocuidad", que sí narra) — si no, el spy agarra
// fragmentos que ya estaban en cola desde ANTES de instalarlo.
await page.evaluate(() => window.Narrador.cancel());
await page.evaluate(() => {
  window.__spoken = [];
  const orig = window.speechSynthesis.speak.bind(window.speechSynthesis);
  window.speechSynthesis.speak = function (u) { window.__spoken.push(u.text); return orig(u); };
});
await page.evaluate(() => window.motor.gotoId('unidad1'));
await page.waitForTimeout(500);
const spoken = await page.evaluate(() => window.__spoken);
if (spoken.length) failures.push(`speechSynthesis.speak() se llamó al entrar a unidad1: ${JSON.stringify(spoken)}`);

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
await browser.close();
report('narracion-no-compite-con-video-fondo', failures);
