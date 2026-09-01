import { openCourseMobile, requireUrl } from './_shared.mjs';
const { browser, page, errors } = await openCourseMobile(requireUrl());
await page.waitForTimeout(100);

const failures = [];

// Tap en Sonido abre el panel (mecanismo .is-open, no hover — no existe en touch).
await page.tap('#d-sound');
await page.waitForTimeout(250);
const volOpen = await page.evaluate(() => {
  const ctl = document.querySelector('[data-audio-ctl="sonido"]');
  const pop = ctl.querySelector('.d-audio-pop');
  return { isOpen: ctl.classList.contains('is-open'), opacity: getComputedStyle(pop).opacity };
});
if (!volOpen.isOpen || volOpen.opacity !== '1') failures.push(`tap en Sonido debería abrir el panel en mobile: ${JSON.stringify(volOpen)}`);

// El panel no se sale del viewport (medido en píxeles reales).
const box = await page.evaluate(() => {
  const pop = document.querySelector('[data-audio-ctl="sonido"] .d-audio-pop');
  const r = pop.getBoundingClientRect();
  return { left: r.left, right: r.right, vw: window.innerWidth };
});
if (box.left < 0 || box.right > box.vw) {
  failures.push(`el panel de volumen se sale del viewport en mobile: ${JSON.stringify(box)}`);
}

// Tap en Locución cierra el de Sonido y abre el suyo.
await page.tap('#d-narrate');
await page.waitForTimeout(250);
const swapState = await page.evaluate(() => ({
  sonidoOpen: document.querySelector('[data-audio-ctl="sonido"]').classList.contains('is-open'),
  locucionOpen: document.querySelector('[data-audio-ctl="locucion"]').classList.contains('is-open')
}));
if (swapState.sonidoOpen || !swapState.locucionOpen) failures.push(`abrir Locución debería cerrar Sonido: ${JSON.stringify(swapState)}`);

const box2 = await page.evaluate(() => {
  const pop = document.querySelector('[data-audio-ctl="locucion"] .d-audio-pop');
  const r = pop.getBoundingClientRect();
  return { left: r.left, right: r.right, vw: window.innerWidth };
});
if (box2.left < 0 || box2.right > box2.vw) {
  failures.push(`el panel de locución se sale del viewport en mobile: ${JSON.stringify(box2)}`);
}

// Tap afuera cierra todo.
await page.tap('body', { position: { x: 10, y: 400 } });
await page.waitForTimeout(250);
const closedState = await page.evaluate(() => ({
  sonidoOpen: document.querySelector('[data-audio-ctl="sonido"]').classList.contains('is-open'),
  locucionOpen: document.querySelector('[data-audio-ctl="locucion"]').classList.contains('is-open')
}));
if (closedState.sonidoOpen || closedState.locucionOpen) failures.push(`tocar afuera debería cerrar todos los paneles: ${JSON.stringify(closedState)}`);

// El slider de volumen sigue siendo arrastrable (drag táctil nativo del <input type=range>).
await page.tap('#d-sound');
await page.waitForTimeout(200);
const rangeBox = await page.evaluate(() => document.getElementById('d-vol-range').getBoundingClientRect());
await page.touchscreen.tap(rangeBox.x + rangeBox.width * 0.2, rangeBox.y + rangeBox.height / 2);
await page.waitForTimeout(150);
const volAfterTap = await page.evaluate(() => document.getElementById('d-vol-pct').textContent);
console.log('volumen tras tocar el slider en ~20%%:', volAfterTap);

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
console.log(failures.length ? '✗ FALLOS:\n' + failures.map(f=>'  - '+f).join('\n') : '✓ mobile-audio-controls — sin fallos.');
if (failures.length) process.exitCode = 1;
await browser.close();
