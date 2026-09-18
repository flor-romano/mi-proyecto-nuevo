#!/usr/bin/env node
/* full-regress.mjs — kit-base v1.0
   Recorre el curso de punta a punta con "Siguiente" y vuelve con
   "Anterior", verificando que el contador de diapositiva avance/
   retroceda en cada paso y que no aparezcan errores de consola en
   ningún punto del camino. Cierra pop-ups automáticos/gate que
   aparezcan en el camino (con reintento — algunos pop-ups automáticos
   tienen un delay, ej. data-intro-popup a los 350ms de llegar).

   LÍMITE REAL, no un bug: si una diapositiva tiene un gate de
   CONTENIDO (motor.canAdvance definido por curso.js — ej. "no avanzar
   de conceptos sin explorar las 7 pestañas"), este test genérico NO
   sabe cómo desbloquearlo (no conoce el contenido del curso) y se va
   a frenar ahí — igual que vería un alumno. Cuando eso pasa, el
   reporte lo distingue de un fallo real; completar el recorrido de
   esa sección con un test propio del curso (ver tools/tests/README.md). */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

/* kit-base v1.9.50 — el chequeo viejo de "suspend_data > 4096" (todavía
   en scorm-tracking.mjs) mira el valor YA GUARDADO en cmi.suspend_data
   al final del curso — pero `SCORM.saveState()` (scorm-api.js) rechaza
   guardar cualquier estado que supere 4096 caracteres y CONSERVA EL
   ANTERIOR, así que ese valor final, por construcción, nunca puede
   superar el límite: el chequeo viejo es código muerto, no puede
   fallar nunca aunque el curso sí esté perdiendo progreso en silencio
   a mitad de camino. La señal real es el propio `console.warn` que
   `saveState()` emite en el momento del rechazo — se captura acá
   porque este test es el que recorre el curso más a fondo (no solo
   llega al final, cierra pop-ups/gates en cada paso). No cubre lo que
   pase durante el `goto()`/500ms inicial de `openCourse()` (antes de
   que este listener exista) — riesgo bajo, ahí todavía no hubo
   interacción que acumule estado. */
const suspendOverflow = [];
page.on('console', msg => { if (/suspend_data ocupa/.test(msg.text())) suspendOverflow.push(msg.text()); });

const total = await page.evaluate(() => document.querySelectorAll('[data-slide]').length);
console.log(`Curso con ${total} diapositivas.`);

function readCounter(page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-slide-counter]');
    return el ? el.textContent.trim() : null;
  });
}

async function closeAnyOpenPopup(page) {
  // hasta 3 vueltas: cerrar puede a veces revelar/disparar otro pop-up
  // encadenado (ej. gate al llegar a la última diapo con CTA pendiente)
  for (let k = 0; k < 3; k++) {
    const closeBtn = await page.$('.modal.open [data-popup-close], [data-popup].open [data-popup-close]');
    if (!closeBtn) return;
    await closeBtn.click({ force: true });
    await page.waitForTimeout(250);
  }
}

await page.evaluate(() => { window.__advanceBlocked = false; document.addEventListener('advanceblocked', () => { window.__advanceBlocked = true; }); });

let prevCounter = await readCounter(page);
let stuckAt = null;
let contentGateAt = null;
for (let i = 0; i < total - 1; i++) {
  await closeAnyOpenPopup(page); // pop-ups automáticos (data-intro-popup) no deben bloquear el clic
  const nextBtn = await page.$('[data-nav="next"]:not([disabled])');
  if (!nextBtn) { stuckAt = i; break; }
  await page.evaluate(() => { window.__advanceBlocked = false; });
  await nextBtn.click({ force: true });
  await page.waitForTimeout(400);
  await closeAnyOpenPopup(page); // pop-ups "gate" disparados por este mismo clic
  let cur = await readCounter(page);
  if (cur === prevCounter) {
    // reintento: puede haber sido una carrera con un pop-up automático demorado (ej. 350ms)
    await closeAnyOpenPopup(page);
    await page.waitForTimeout(200);
    const retryBtn = await page.$('[data-nav="next"]:not([disabled])');
    if (retryBtn) { await retryBtn.click({ force: true }); await page.waitForTimeout(400); await closeAnyOpenPopup(page); }
    cur = await readCounter(page);
  }
  if (cur === prevCounter) {
    const blocked = await page.evaluate(() => window.__advanceBlocked);
    if (blocked) { contentGateAt = i; break; } // gate de CONTENIDO, no un fallo del motor/test
    fails.push(`el contador no cambió al avanzar (paso ${i + 1}): sigue en "${cur}"`);
  }
  prevCounter = cur;
}
if (stuckAt !== null) fails.push(`"Siguiente" quedó deshabilitado antes de llegar al final (en el paso ${stuckAt + 1} de ${total - 1})`);
if (contentGateAt !== null) console.log(`ⓘ Recorrido frenado en el paso ${contentGateAt + 1}/${total - 1} por un gate de CONTENIDO (motor.canAdvance) — no es un fallo, requiere completar la acción del curso ahí para seguir. Ver tools/tests/README.md.`);

for (let i = 0; i < total - 1; i++) {
  await closeAnyOpenPopup(page);
  const prevBtn = await page.$('[data-nav="prev"]:not([disabled])');
  if (!prevBtn) break;
  await prevBtn.click({ force: true });
  await page.waitForTimeout(250);
}
await closeAnyOpenPopup(page);
const backAtStart = await page.evaluate(() => {
  const el = document.querySelector('[data-slide-counter]');
  return el ? el.textContent.trim().startsWith('1 ') : true;
});
if (!backAtStart) fails.push('no volvió a la diapositiva 1 al apretar "Anterior" repetidamente');

if (errors.length) fails.push(...errors.map(e => 'error de consola: ' + e));
if (suspendOverflow.length) {
  fails.push(`suspend_data superó 4096 caracteres ${suspendOverflow.length} vez(veces) durante el recorrido — SCORM.saveState() rechazó guardar y el progreso de ese momento se perdió en silencio: ` + suspendOverflow[0]);
}
report('full-regress', fails);
await browser.close();
