#!/usr/bin/env node
/* puntaje-curso.mjs — test PROPIO de "Surtido sin venta"
   ------------------------------------------------------------
   POR QUÉ EXISTE, y por qué no alcanza con el `puntaje-maximo.mjs` del
   kit: ese recorre el curso clickeando todo lo que en este molde puede
   pagar (`[data-hit]`, `[data-shot-swap-go]`, `[data-popup-trigger]`,
   `[data-layer-trigger]`, `[data-repaso-ans]`) — y las respuestas de
   un mini juego no están en esa lista, porque son `<button class=
   "d-mj-opt">` que el curso fabrica con `innerHTML`. Resultado: contra
   este curso mide 74 (lo que paga el recorrido guiado) y no los 199
   reales. Declarar `data-puntaje-max="74"` haría pasar el test del kit
   diciendo una mentira, así que este curso NO lo declara y verifica su
   máximo acá. (Está anotado en README-CURSO.md como hallazgo de kit.)

   Lo que este test hace, y que es lo que pide §7.3 punto 19 — "la
   tabla de puntos es una intención, el contador es el hecho":
     1. juega el curso entero de la mejor forma posible (los 7
        conceptos, las 4 fichas, el mini juego 5 de 5 sin errar) y
        compara el contador REAL contra el máximo declarado;
     2. hace el recorrido MÍNIMO (solo lo que el gate obliga) y compara
        contra el piso, que es de donde sale el umbral de bronce: si el
        piso quedara por debajo, quien termina el curso se quedaría sin
        medalla, que es justo lo que §6.10.6 prohíbe;
     3. verifica que reintentar el mini juego NO vuelva a pagar
        (el guard persistido de §6.53: premio por ítem sin guard en una
        actividad reintentable = puntaje infinito);
     4. verifica que acertar DESPUÉS de haber errado pague menos que
        acertar a la primera — que es lo que hace que el puntaje mida
        precisión y no insistencia (§7.14).
*/
import { openCourse, report, requireUrl, irASlide } from './_shared.mjs';

const url = requireUrl();
const fails = [];

const puntos = (page) => page.evaluate(() => {
  const p = document.getElementById('d-points');
  const v = p && p.getAttribute('data-valor');
  return v !== null && v !== undefined ? parseInt(v, 10) : 0;
});

/* Recorrido completo y perfecto. Todo por DOM: lo que se mide es el
   puntaje, no la clickeabilidad (eso lo cubre hitbox-click-check). */
async function recorrido(page, { conceptos, fichas, juego }) {
  if (conceptos) {
    await irASlide(page, 'conceptos');
    await page.evaluate(() => {
      document.querySelectorAll('[data-slide="conceptos"] [data-shot-swap-go]')
        .forEach((b) => b.click());
    });
    await page.waitForTimeout(200);
  }
  if (fichas) {
    for (const s of ['repaso-reporte', 'repaso-acciones']) {
      await irASlide(page, s);
      await page.evaluate((id) => {
        document.querySelectorAll(`[data-slide="${id}"] [data-popup-trigger]`)
          .forEach((b) => b.click());
        document.querySelectorAll('[data-popup-close]').forEach((b) => b.click());
      }, s);
      await page.waitForTimeout(150);
    }
  }
  if (juego) {
    await irASlide(page, 'minijuego');
    await page.evaluate((modo) => window.__CURSO__.mj._auto(modo), juego);
    await page.waitForTimeout(250);
  }
  await page.waitForTimeout(650);   // que termine cualquier countTo
  return puntos(page);
}

/* ---- 1 · máximo real ---- */
{
  const { browser, page, errors } = await openCourse(url);
  const declarado = await page.evaluate(() => window.__CURSO__ && window.__CURSO__.maxSinVideos);
  const medido = await recorrido(page, { conceptos: true, fichas: true, juego: 'perfecto' });
  console.log(`  · máximo medido: ${medido} · declarado (sin videos): ${declarado}`);
  if (medido !== declarado) {
    fails.push(`el máximo MEDIDO recorriendo el curso entero sin errar es ${medido} y el ` +
      `declarado en curso.js es ${declarado}. Los 3 umbrales de medalla salen de ese número, ` +
      'así que la diferencia deja al alumno sin la medalla que se ganó (o se la regala).');
  }
  const oro = await page.evaluate(() => window.__CURSO__.niveles.find((n) => n.id === 'oro').desde);
  if (medido < oro) {
    fails.push(`el oro pide ${oro} puntos y el máximo real es ${medido}: es inalcanzable.`);
  }
  /* Reintentar el juego no puede volver a pagar (§6.53). */
  const antes = medido;
  await page.evaluate(() => window.__CURSO__.mj._auto('perfecto'));
  await page.waitForTimeout(650);
  const despues = await puntos(page);
  if (despues !== antes) {
    fails.push(`rejugar el mini juego cambió el puntaje de ${antes} a ${despues}: falta el guard ` +
      'persistido por pregunta (§6.53, premio por ítem sin guard en una actividad reintentable ' +
      '= puntaje infinito).');
  }
  if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
  await browser.close();
}

/* ---- 2 · piso del gate ---- */
{
  const { browser, page, errors } = await openCourse(url);
  const piso = await page.evaluate(() => window.__CURSO__ && window.__CURSO__.pisoGate);
  const bronce = await page.evaluate(() => window.__CURSO__.niveles.find((n) => n.id === 'bronce').desde);
  /* Lo mínimo que el gate obliga: los conceptos, las fichas y terminar
     el juego (con o sin aciertos). Los videos NO entran: hoy son
     placeholder y `initVideoGate` los exime, así que sus puntos no se
     pueden conseguir y no pueden sostener ningún umbral (§7.3 p.19). */
  const medido = await recorrido(page, { conceptos: true, fichas: true, juego: 'pesimo' });
  console.log(`  · piso medido (solo lo obligatorio): ${medido} · declarado: ${piso} · bronce: ${bronce}`);
  if (medido !== piso) {
    fails.push(`el piso MEDIDO haciendo solo lo que el gate obliga es ${medido} y el declarado ` +
      `es ${piso}.`);
  }
  if (bronce > medido) {
    fails.push(`el bronce arranca en ${bronce} y el piso garantizado del gate es ${medido}: ` +
      'quien termina el curso haciendo lo mínimo se queda SIN medalla (§6.10.6).');
  }
  const terminado = await page.evaluate(() =>
    !!document.querySelector('[data-panel="mj-fin-retry"]:not([hidden]), [data-panel="mj-fin-ok"]:not([hidden])'));
  if (!terminado) fails.push('el recorrido mínimo no llegó a ninguna pantalla final del mini juego.');
  if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
  await browser.close();
}

/* ---- 3 · precisión, no insistencia (§7.14) ---- */
{
  const { browser, page, errors } = await openCourse(url);
  await irASlide(page, 'minijuego');
  /* El alumno "insistente": yerra cada pregunta una vez y recién
     después la acierta, reintentando el juego las veces que haga falta.
     Tiene que terminar por debajo del que acertó todo a la primera. */
  await page.evaluate(() => window.__CURSO__.mj._auto('insistente'));
  await page.waitForTimeout(650);
  const trasError = await puntos(page);
  const pts = await page.evaluate(() => window.__CURSO__.pts);
  const esperado = pts.mjBienTrasError * 5;
  console.log(`  · acertar todo DESPUÉS de errar paga ${trasError} (a la primera pagaría ${pts.mjBien * 5})`);
  if (trasError >= pts.mjBien * 5) {
    fails.push(`acertar después de errar paga ${trasError}, igual o más que acertar a la primera ` +
      `(${pts.mjBien * 5}): el puntaje premia insistencia en vez de precisión (§7.14).`);
  }
  if (trasError !== esperado) {
    fails.push(`acertar las 5 tras errar cada una paga ${trasError} y la tabla dice ${esperado}.`);
  }
  if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
  await browser.close();
}

report('puntaje-curso', fails);
