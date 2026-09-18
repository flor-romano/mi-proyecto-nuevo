#!/usr/bin/env node
/* puntaje-maximo.mjs — kit-base v1.9.76
   ------------------------------------------------------------
   POR QUÉ EXISTE. Porque **la tabla de puntos es una intención y el
   contador es el hecho** (CLAUDE.md §7.3 punto 19, §7.21). Un curso
   declara "el máximo son 210" sumando su propia tabla, y el recorrido
   real da otra cosa. Eso importa de verdad: los tres umbrales de
   medalla se derivan del máximo, así que un máximo mal declarado deja
   al alumno sin la medalla que se ganó — o se la regala.

   En un curso real este recorrido encontró tres cosas que leer el
   código no encontró, entre ellas un paginador que pagaba por tocar la
   variante que ya estabas viendo (§7.21 F2: 220 medidos contra 210
   declarados).

   QUÉ HACE. Recorre el curso tocando TODO lo que puede pagar —hitboxes,
   variantes, pop-ups, capas— y compara el contador real contra el
   máximo declarado. El curso declara su máximo así:

       <body data-puntaje-max="210">     (o window.__PUNTAJE_MAX__)

   Sin esa declaración el test no falla: informa el máximo medido, que
   ya es el dato que hacía falta para derivar los umbrales.

   Y MIDE `cmi.suspend_data` AL 100%. El guard salta pasando la MITAD
   del cupo de SCORM 1.2 (2048 de 4096), no al borde: `saveState()`
   rechaza en silencio cuando se pasa, y enterarse con el cupo lleno es
   enterarse tarde. Con la mitad libre todavía hay margen para acomodar.

   OJO CON MEDIR EL HUD (§7.14, §7.21 F12): `#d-points` se anima con
   `countTo`, así que leer su `textContent` a mitad de la animación da
   un valor intermedio que "casi" parece bien. Por eso se lee
   `data-valor`, que el kit escribe con el número verdadero antes de
   animar.
*/
import { openCourse, report, requireUrl, irASlide } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

const declarado = await page.evaluate(() => {
  const a = document.body.getAttribute('data-puntaje-max');
  return a ? parseInt(a, 10) : (typeof window.__PUNTAJE_MAX__ === 'number' ? window.__PUNTAJE_MAX__ : null);
});

const puntos = () => page.evaluate(() => {
  const p = document.getElementById('d-points');
  if (!p) return 0;
  const v = p.getAttribute('data-valor');      // el número VERDADERO, sin esperar la animación
  return v !== null ? parseInt(v, 10) : parseInt((p.textContent || '0').replace(/\D/g, ''), 10) || 0;
});

const ids = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]')).map((s) => s.getAttribute('data-slide')));

let toques = 0;
for (const id of ids) {
  if (!(await irASlide(page, id))) continue;

  /* Todo lo que en este molde puede pagar. Se toca con `.click()` del
     DOM y no con el mouse real a propósito: un elemento tapado por otro
     igual tiene que poder pagar si el curso lo cablea, y acá lo que se
     mide es el PUNTAJE, no la clickeabilidad (eso lo cubre
     hitbox-click-check). */
  const SEL = '[data-hit], [data-shot-swap-step], [data-shot-swap-go], ' +
              '[data-popup-trigger], [data-layer-trigger], [data-repaso-ans]';
  const n = await page.evaluate((s) => document.querySelectorAll(
    `[data-slide="${s.id}"] ${s.sel}`).length, { id, sel: SEL });

  for (let i = 0; i < n; i++) {
    try {
      await page.evaluate((s) => {
        const el = document.querySelectorAll(`[data-slide="${s.id}"] ${s.sel}`)[s.i];
        if (el && !el.disabled) el.click();
      }, { id, sel: SEL, i });
      toques++;
      await page.waitForTimeout(40);
      // cerrar lo que se haya abierto, para no tapar el siguiente
      await page.evaluate(() => {
        document.querySelectorAll('[data-popup-close]').forEach((b) => b.click());
      });
    } catch { /* un elemento que desaparece a mitad del recorrido no es un fallo */ }
  }
}

await page.waitForTimeout(600);       // que termine cualquier countTo pendiente
const medido = await puntos();

const suspend = await page.evaluate(() => {
  try {
    if (window.SCORM && SCORM.loadState) {
      const s = JSON.stringify(SCORM.loadState() || {});
      return s.length;
    }
  } catch { /* noop */ }
  return null;
});

console.log(`  · ${toques} elemento(s) tocado(s) · puntaje medido: ${medido}` +
  (declarado !== null ? ` · declarado: ${declarado}` : ' · (sin máximo declarado)') +
  (suspend !== null ? ` · suspend_data: ${suspend}/4096` : ''));

if (declarado !== null && medido !== declarado) {
  fails.push(`el puntaje MEDIDO recorriendo el curso es ${medido} y el declarado es ${declarado}. ` +
    'La tabla de puntos es una intención; el contador es el hecho. Los tres umbrales de medalla ' +
    'se derivan del máximo, así que esta diferencia deja al alumno sin la medalla que se ganó ' +
    '(o se la regala).');
}
if (suspend !== null && suspend > 2048) {
  fails.push(`cmi.suspend_data ocupa ${suspend} de los 4096 caracteres de SCORM 1.2 — ` +
    'pasando la mitad del cupo. `saveState()` rechaza en silencio cuando se pasa del tope, ' +
    'así que el aviso salta acá, con margen para acomodar, y no en el borde.');
}

if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
report('puntaje-maximo', fails);
await browser.close();
