/* Test de contenido — específico de este curso, no genérico.
   Verifica el fix de un bug real: reintentar el minijuego NO debe
   volver a premiar hallazgos ya encontrados en un intento anterior
   (estado.juegoAciertos). Antes del fix, `award(PUNTOS.hallazgo, ...)`
   se llamaba sin ningún guard persistente — cada reintento volvía a
   sumar puntos por los mismos hallazgos, algo que el curso permite sin
   límite ("podés reintentarlo las veces que quieras"), rompiendo por
   completo el techo de puntaje (PUNTOS_MAX) y los umbrales de medalla. */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

async function puntos() {
  // El chip de puntos cuenta de un valor a otro en vez de saltar en
  // seco (kit-base v1.9.44, CotoUI.countTo — 500ms) — esperar a que
  // termine antes de leer el número final, si no se lee un valor
  // intermedio de la animación.
  await page.waitForTimeout(550);
  return await page.evaluate(() => {
    const el = document.getElementById('d-points');
    return el ? parseInt(el.textContent, 10) || 0 : null;
  });
}

async function click(sel) {
  await page.click(sel);
  await page.waitForTimeout(200);
}

// Ir directo al minijuego (gotoId no pasa por ningún gate — es la misma
// ruta que usa el índice/sidenav del curso).
await page.evaluate(() => window.motor.gotoId('minijuego'));
await page.waitForTimeout(300);
await page.keyboard.press('Escape').catch(() => {});

const p0 = await puntos();

// Intento 1: 2 hallazgos correctos + 3 errores → pierde (vidas a 0).
await click('[data-mj-start]');
await click('[data-mj-opt="cruzada"]');
await click('[data-mj-opt="plagas"]');
const pAfterTwo = await puntos();
if (pAfterTwo - p0 !== 60) failures.push(`esperaba +60 tras 2 hallazgos nuevos, fue +${pAfterTwo - p0}`);

await click('[data-mj-opt="limpieza"]');   // error 1
await click('[data-mj-opt="tabla"]');      // error 2
await click('[data-mj-opt="residuos"]');   // error 3 → vidas a 0, termina (pierde)
await page.waitForTimeout(900); // setTimeout(700) hasta mostrarRepaso

await click('[data-mj-repaso-continue]');
await page.waitForTimeout(300);

const accionTrasPerder = await page.evaluate(() =>
  document.querySelector('[data-mj-retry]').getAttribute('data-mj-accion'));
if (accionTrasPerder !== 'reintentar') failures.push(`esperaba acción "reintentar" tras perder, fue "${accionTrasPerder}"`);

const pTrasPerder = await puntos();

// Reintentar: encontrar los MISMOS 2 hallazgos de antes no debería sumar nada más.
await click('[data-mj-retry]');
await page.waitForTimeout(300);
await click('[data-mj-opt="cruzada"]');
await click('[data-mj-opt="plagas"]');
const pTrasRepetir = await puntos();
if (pTrasRepetir !== pTrasPerder) {
  failures.push(`reintentar hallazgos ya premiados sumó puntos de más: antes ${pTrasPerder}, después ${pTrasRepetir}`);
}

// Pero un hallazgo NUEVO (no encontrado en el intento anterior) sí debe puntuar.
await click('[data-mj-opt="higiene"]');
const pTrasNuevo = await puntos();
if (pTrasNuevo - pTrasRepetir !== 30) {
  failures.push(`un hallazgo nuevo debería sumar 30, sumó ${pTrasNuevo - pTrasRepetir}`);
}

/* El puntaje que MUESTRA el minijuego tiene que estar en la MISMA
   escala que el contador del curso (kit-base v1.9.40, reporte del
   cliente: "dice que obtuve 5650 puntos pero en realidad arriba voy
   395"). Antes el minijuego llevaba una moneda propia (base 1000,
   +800/acierto, -150/error) que no sumaba nada al total real.
   El HUD muestra lo que ESTE intento vale: 30 por hallazgo del intento
   en curso — acá van 3 encontrados (cruzada, plagas, higiene), sin el
   bonus porque no están los 6. */
const hudScore = await page.evaluate(() =>
  document.querySelector('[data-slide="minijuego"] [data-mj-score]').textContent.trim());
if (hudScore !== '90') {
  failures.push(`el HUD debería mostrar 90 (3 hallazgos x 30, misma escala que el curso), mostró "${hudScore}"`);
}

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));

await browser.close();
report('minijuego-puntos-no-duplicados', failures);
