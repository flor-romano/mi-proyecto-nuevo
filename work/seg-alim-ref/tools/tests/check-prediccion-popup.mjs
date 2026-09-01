/* Test de contenido — específico de este curso, no genérico.
   Verifica el arreglo del pop-up "Un momento, pensemos" (predicción
   antes del video "El proceso de limpieza y desinfección"): pedido
   explícito del cliente — falta ":" después de "pensemos", y "esta un
   poco desfazado el tamaño y las cosas no se ven bien alineadas".
   La causa real del desalineado: `.d-pred-fb` tiene el MISMO nombre de
   clase en `coto-base-addendum-v1.8.css` (kit, pensado para otro
   patrón de pop-up) y en `assets.css` (este curso) — el del kit trae
   padding/border-radius que se colaban en el párrafo de feedback de
   este curso (una caja fantasma con padding pero sin fondo visible que
   la delate). Este test verifica el texto (":") y que esa colisión
   siga neutralizada. */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

await page.evaluate(() => window.motor.showPopup('prediccion-proceso'));
await page.waitForTimeout(300);

const h3 = await page.evaluate(() => {
  const el = document.querySelector('[data-popup="prediccion-proceso"] h3');
  return el ? el.textContent.trim() : null;
});
if (!h3 || !/pensemos:/.test(h3)) failures.push('el título debería terminar en "pensemos:" (con dos puntos), fue: ' + JSON.stringify(h3));

const kicker = await page.evaluate(() => !!document.querySelector('[data-popup="prediccion-proceso"] .d-instr-kicker'));
if (!kicker) failures.push('esperaba el kicker "Antes de mirar el video" en el header del pop-up');

const q = await page.evaluate(() => {
  const el = document.querySelector('[data-popup="prediccion-proceso"] .d-pred-q');
  return el ? el.textContent.trim() : null;
});
if (!q || !/^¿Qué creés/.test(q)) failures.push('esperaba la pregunta como párrafo .d-pred-q, arrancando con "¿Qué creés", fue: ' + JSON.stringify(q));

// Responder y chequear que la caja de feedback no tenga padding/
// border-radius fantasma colados del kit (regresión del bug real).
await page.click('[data-pred-opt="quitar"]');
await page.waitForTimeout(200);
const fbStyle = await page.evaluate(() => {
  const fb = document.querySelector('.d-pred-fb');
  const s = getComputedStyle(fb);
  return { padding: s.padding, borderRadius: s.borderRadius };
});
if (fbStyle.padding !== '0px') failures.push('el feedback de predicción no debería tener padding (caja fantasma del kit colándose) — dio ' + fbStyle.padding);
if (fbStyle.borderRadius !== '0px') failures.push('el feedback de predicción no debería tener border-radius — dio ' + fbStyle.borderRadius);

const continueVisible = await page.evaluate(() => !document.querySelector('[data-pred-continue]').hidden);
if (!continueVisible) failures.push('tras responder, el botón "Continuar" debería quedar visible');

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
await browser.close();
report('prediccion-popup', failures);
