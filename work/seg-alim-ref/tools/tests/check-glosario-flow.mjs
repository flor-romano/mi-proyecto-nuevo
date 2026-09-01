import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

async function openGlosario() {
  await page.evaluate(() => { window.motor.closePopup && window.motor.closePopup(); });
  await page.click('[data-popup-trigger="glosario"]');
  await page.waitForTimeout(200);
}

// 1) Estado inicial: todos los términos bloqueados (candado visible, sin datos).
await openGlosario();
const initial = await page.evaluate(() => {
  const dts = Array.from(document.querySelectorAll('[data-popup="glosario"] dl.d-glossary dt'));
  return {
    total: dts.length,
    lockedCount: dts.filter(dt => dt.classList.contains('is-locked')).length,
  };
});
if (initial.total !== 26) failures.push(`esperaba 26 términos, hay ${initial.total}`);
if (initial.lockedCount !== 26) failures.push(`esperaba 26 bloqueados al inicio, hay ${initial.lockedCount}`);

/* 1.5) BUG REAL, reporte del cliente: un término BLOQUEADO seguía
   navegando igual al tocarlo — rompía el bloqueo de "hay que ir
   interactuando diapo por diapo para avanzar" (kit-base v1.9.42,
   CLAUDE.md §6.62). `.is-locked` solo cambiaba estilos; el
   `[data-goto]` de adentro seguía siendo un botón habilitado, y el
   motor cablea CUALQUIER `[data-goto]` con un `click` genérico sin
   mirar gates. Fix: `initGlossaryUnlock()` ahora también pone
   `disabled` en el propio botón mientras está bloqueado — un botón
   nativo disabled no dispara `click`, así que ni hace falta que el
   motor sepa nada de "bloqueado". */
const slideAntesDeForzar = await page.evaluate(() => window.motor.current().getAttribute('data-slide'));
const bloqueado = await page.evaluate(() => {
  const dt = Array.from(document.querySelectorAll('[data-popup="glosario"] dl.d-glossary dt'))
    .find(d => d.classList.contains('is-locked'));
  const btn = dt ? dt.querySelector('[data-goto]') : null;
  return btn ? { term: btn.textContent.trim(), disabled: btn.disabled } : null;
});
if (!bloqueado) {
  failures.push('esperaba encontrar un término bloqueado para probar el gate');
} else {
  if (!bloqueado.disabled) failures.push(`el botón del término bloqueado "${bloqueado.term}" debería estar disabled`);
  // Forzar el clic igual (Playwright permite forzar sobre un disabled)
  // para confirmar que, aunque alguien lo dispare, el motor no navega
  // — la protección real es el atributo `disabled` nativo (el click ni
  // se emite en un uso normal), pero si algo lo forzara, tampoco debería
  // avanzar por accidente.
  await page.click('[data-popup="glosario"] dl.d-glossary dt.is-locked .d-gloss-term-btn >> nth=0', { force: true }).catch(() => {});
  await page.waitForTimeout(300);
  const slideTrasForzar = await page.evaluate(() => window.motor.current().getAttribute('data-slide'));
  if (slideTrasForzar !== slideAntesDeForzar) {
    failures.push(`clickear un término bloqueado navegó igual, de "${slideAntesDeForzar}" a "${slideTrasForzar}" — rompe el bloqueo de avance`);
  }
}

// 2) Buscar un término bloqueado por texto: no debería aparecer en resultados.
await page.fill('[data-gloss-search]', 'alergeno');
await page.waitForTimeout(150);
const searchLocked = await page.evaluate(() => {
  const dt = Array.from(document.querySelectorAll('[data-popup="glosario"] dl.d-glossary dt'))
    .find(d => d.textContent.includes('Alérgeno'));
  return dt ? dt.hidden : null;
});
if (searchLocked !== true) failures.push(`buscar un término bloqueado debería ocultarlo (hidden=${searchLocked})`);
await page.fill('[data-gloss-search]', '');
await page.waitForTimeout(150);

/* 3) Visitar la diapositiva NORMALMENTE (como llegaría un alumno real
   navegando el curso, no clickeando el término — "Inocuidad" sigue
   bloqueada hasta acá, el punto 1.5 ya confirmó que no se puede saltar
   por el glosario). `gotoId` es la misma ruta que usa el índice del
   curso, sin pasar por ningún gate — sirve para simular "el alumno ya
   llegó a esta diapo" sin tener que jugar todo el recorrido gateado
   completo. */
await page.evaluate(() => window.motor.gotoId('inocuidad'));
await page.waitForTimeout(300);
const slideTrasVisita = await page.evaluate(() => window.motor.current().getAttribute('data-slide'));
if (slideTrasVisita !== 'inocuidad') failures.push(`gotoId('inocuidad') debería haber navegado ahí, quedó en "${slideTrasVisita}"`);

// 4) Visitar la diapositiva desbloquea el término + dispara un toast.
const unlockState = await page.evaluate(() => {
  const dt = Array.from(document.querySelectorAll('[data-popup="glosario"] dl.d-glossary dt'))
    .find(d => d.textContent.includes('Inocuidad'));
  return dt ? dt.classList.contains('is-locked') : null;
});
if (unlockState !== false) failures.push(`"Inocuidad" debería estar desbloqueado tras visitar su diapositiva (locked=${unlockState})`);

const toastSeen = await page.evaluate(() => {
  const t = document.querySelector('.d-award-toast.show');
  return t ? t.textContent : null;
});
if (!toastSeen || !/[Dd]esbloqueaste/.test(toastSeen)) {
  failures.push(`esperaba un toast de desbloqueo visible, hubo: "${toastSeen}"`);
}

// 5) Ahora sí aparece en el glosario visible + se puede buscar.
await openGlosario();
const afterUnlock = await page.evaluate(() => {
  const dt = Array.from(document.querySelectorAll('[data-popup="glosario"] dl.d-glossary dt'))
    .find(d => d.textContent.includes('Inocuidad'));
  const dd = dt.nextElementSibling;
  return {
    locked: dt.classList.contains('is-locked'),
    defVisible: getComputedStyle(dd.querySelector('.d-gloss-def')).display !== 'none',
  };
});
if (afterUnlock.locked) failures.push('"Inocuidad" sigue con candado en el glosario tras visitar la diapositiva');
if (!afterUnlock.defVisible) failures.push('la definición de "Inocuidad" debería mostrarse ya desbloqueada');

await page.fill('[data-gloss-search]', 'inocuidad');
await page.waitForTimeout(150);
const searchUnlocked = await page.evaluate(() => {
  const dt = Array.from(document.querySelectorAll('[data-popup="glosario"] dl.d-glossary dt'))
    .find(d => d.textContent.includes('Inocuidad'));
  return dt ? dt.hidden : null;
});
if (searchUnlocked !== false) failures.push(`buscar "inocuidad" debería encontrar el término ya desbloqueado (hidden=${searchUnlocked})`);

/* 6) Ya desbloqueado, clickear el término SÍ navega (esto es la
   función real del glosario interactivo — "volver a repasar" un
   término ya visto, §6.52) y cierra el pop-up. Se navega antes a otra
   diapo para que el click tenga algo real que mover. */
await page.evaluate(() => { window.motor.closePopup && window.motor.closePopup(); });
await page.evaluate(() => window.motor.gotoId('riesgo'));
await page.waitForTimeout(200);
await openGlosario();
await page.click('[data-popup="glosario"] dt:has-text("Inocuidad") .d-gloss-term-btn');
await page.waitForTimeout(400);
const afterNavUnlocked = await page.evaluate(() => ({
  slide: window.motor.current().getAttribute('data-slide'),
  popupOpen: !!document.querySelector('.modal.open'),
}));
if (afterNavUnlocked.slide !== 'inocuidad') failures.push(`click en "Inocuidad" (ya desbloqueada) debería navegar ahí, fue a "${afterNavUnlocked.slide}"`);
if (afterNavUnlocked.popupOpen) failures.push('el glosario debería cerrarse al navegar (término desbloqueado)');

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));

await browser.close();
report('glosario-interactivo', failures);
