/* Test de contenido — específico de este curso, no genérico.
   Verifica la conversión del repaso del minijuego de CAPA (diapo
   nueva a pantalla completa) a POP-UP real, pedido explícito del
   cliente (kit-base CLAUDE.md §6.60): que se abra como pop-up sobre
   el juego (no tape la capa "jugar" de fondo), que cierre por las 4
   vías genéricas del kit (botón/✕/Esc/fondo) siempre con la misma
   lógica diferida, que la grilla de hallazgos entre SIN SCROLL en
   desktop y en mobile (landscape — el único uso real en teléfono,
   ver check-rotate-notice.mjs), y que la narración del título/
   subtítulo no se duplique (initPopupNarration() está excluida a
   propósito para este pop-up, ver curso.js). */
import { openCourse, openCourseMobile, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];

async function click(page, sel) { await page.click(sel); await page.waitForTimeout(150); }

/* ---- 1. Ganar (6 hallazgos): pop-up abierto, capa de fondo intacta,
   grilla de 2 columnas sin scroll, cierre con la ✕ avanza a mj-fin. */
{
  const { browser, page, errors } = await openCourse(url);
  await page.evaluate(() => window.motor.gotoId('minijuego'));
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape').catch(() => {});

  await click(page, '[data-mj-start]');
  for (const id of ['cruzada', 'plagas', 'higiene', 'alterado', 'practicas', 'toca']) {
    await click(page, `[data-mj-opt="${id}"]`);
  }
  await page.waitForTimeout(900); // setTimeout(700) hasta mostrarRepaso

  const estado = await page.evaluate(() => {
    const modal = document.querySelector('[data-popup="mj-repaso"]');
    const capa = document.querySelector('[data-slide="minijuego"] .d-mj-panel:not([hidden])');
    const card = document.querySelector('.d-mj-repaso-card');
    return {
      abierto: modal.classList.contains('open'),
      capaActiva: capa ? capa.getAttribute('data-panel') : null,
      items: document.querySelectorAll('.d-mj-repaso-item').length,
      cols: getComputedStyle(document.querySelector('.d-mj-repaso-list')).gridTemplateColumns.split(' ').length,
      scrollH: card.scrollHeight, clientH: card.clientHeight,
    };
  });
  if (!estado.abierto) failures.push('al ganar, el pop-up mj-repaso debería quedar abierto');
  if (estado.capaActiva !== 'mj-jugar') failures.push('la capa de fondo debería seguir siendo mj-jugar (el pop-up NO reemplaza la capa), fue ' + estado.capaActiva);
  if (estado.items !== 6) failures.push('al ganar esperaba 6 items en el repaso, hubo ' + estado.items);
  if (estado.cols < 2) failures.push('en desktop esperaba grilla de 2 columnas, dio ' + estado.cols);
  if (estado.scrollH > estado.clientH + 1) failures.push(`el pop-up scrollea en desktop: scrollHeight ${estado.scrollH} > clientHeight ${estado.clientH}`);

  const finScoreEsperado = String(6 * 30 + 50); // PUNTOS.hallazgo x6 + PUNTOS.juegoPerfecto
  await click(page, '[data-popup="mj-repaso"] .modal-x');
  await page.waitForTimeout(300);
  const trasCerrar = await page.evaluate(() => ({
    abierto: document.querySelector('[data-popup="mj-repaso"]').classList.contains('open'),
    capa: document.querySelector('[data-slide="minijuego"] .d-mj-panel:not([hidden])').getAttribute('data-panel'),
    finScore: document.querySelector('[data-mj-fin-score]').textContent.trim(),
  }));
  if (trasCerrar.abierto) failures.push('cerrar con la ✕ debería cerrar el pop-up');
  if (trasCerrar.capa !== 'mj-fin') failures.push('cerrar el repaso (✕) debería avanzar a la capa mj-fin, quedó en ' + trasCerrar.capa);
  if (trasCerrar.finScore !== finScoreEsperado) failures.push(`el puntaje final debería ser ${finScoreEsperado}, fue ${trasCerrar.finScore}`);

  if (errors.length) failures.push('errores de consola (ganar): ' + errors.join(' | '));
  await browser.close();
}

/* ---- 2. Perder (2 aciertos + 3 errores): items = solo lo elegido,
   cierre tocando el fondo también avanza a mj-fin, título/subtítulo
   se narran UNA sola vez (no vía initPopupNarration + speakPaso a la
   vez). */
{
  const { browser, page, errors } = await openCourse(url);
  await page.evaluate(() => {
    window.__spoken = [];
    const orig = window.speechSynthesis.speak.bind(window.speechSynthesis);
    window.speechSynthesis.speak = function (u) { window.__spoken.push(u.text); };
  });
  await page.evaluate(() => window.motor.gotoId('minijuego'));
  await page.waitForTimeout(300);
  await page.keyboard.press('Escape').catch(() => {});

  await click(page, '[data-mj-start]');
  await click(page, '[data-mj-opt="cruzada"]');
  await click(page, '[data-mj-opt="plagas"]');
  await click(page, '[data-mj-opt="limpieza"]');
  await click(page, '[data-mj-opt="tabla"]');
  await click(page, '[data-mj-opt="residuos"]');
  await page.waitForTimeout(900);

  const items = await page.evaluate(() => document.querySelectorAll('.d-mj-repaso-item').length);
  if (items !== 5) failures.push('al perder con 2 aciertos + 3 errores esperaba 5 items (lo elegido), hubo ' + items);

  const spoken = await page.evaluate(() => window.__spoken.slice());
  const repeticiones = spoken.filter(s => /Repasemos tu partida/.test(s));
  if (repeticiones.length !== 1) failures.push('el título/subtítulo del repaso debería narrarse 1 sola vez, se narró ' + repeticiones.length + ' veces: ' + JSON.stringify(repeticiones));

  // cerrar tocando el fondo (lejos del centro — el centro geométrico
  // de .modal-back coincide con el centro de la tarjeta encima).
  await page.mouse.click(20, 20);
  await page.waitForTimeout(300);
  const capaTrasFondo = await page.evaluate(() => document.querySelector('[data-slide="minijuego"] .d-mj-panel:not([hidden])').getAttribute('data-panel'));
  if (capaTrasFondo !== 'mj-fin') failures.push('cerrar el repaso tocando el fondo debería avanzar a mj-fin, quedó en ' + capaTrasFondo);

  if (errors.length) failures.push('errores de consola (perder): ' + errors.join(' | '));
  await browser.close();
}

/* ---- 3. Mobile — landscape real (844×390, iPhone 12 apaisado): sin
   scroll, "Ver resultado" cierra y avanza igual que en desktop. */
{
  const { browser, page, errors } = await openCourseMobile(url);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.evaluate(() => window.motor.gotoId('minijuego'));
  await page.waitForTimeout(300);
  await click(page, '[data-mj-start]');
  for (const id of ['cruzada', 'plagas', 'higiene', 'alterado', 'practicas', 'toca']) {
    await click(page, `[data-mj-opt="${id}"]`);
  }
  await page.waitForTimeout(900);

  const medidas = await page.evaluate(() => {
    const card = document.querySelector('.d-mj-repaso-card');
    return { scrollH: card.scrollHeight, clientH: card.clientHeight };
  });
  if (medidas.scrollH > medidas.clientH + 1) failures.push(`scrollea en mobile landscape: ${medidas.scrollH} > ${medidas.clientH}`);

  await page.tap('[data-mj-repaso-continue]');
  await page.waitForTimeout(300);
  const capaMobile = await page.evaluate(() => document.querySelector('[data-slide="minijuego"] .d-mj-panel:not([hidden])').getAttribute('data-panel'));
  if (capaMobile !== 'mj-fin') failures.push('tocar "Ver resultado" en mobile debería avanzar a mj-fin, quedó en ' + capaMobile);

  if (errors.length) failures.push('errores de consola (mobile): ' + errors.join(' | '));
  await browser.close();
}

report('minijuego-repaso-popup', failures);
