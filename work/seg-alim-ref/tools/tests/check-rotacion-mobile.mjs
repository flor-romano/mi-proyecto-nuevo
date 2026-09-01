import { openCourseMobile, requireUrl } from './_shared.mjs';
/* Compañero de check-rotacion-arrastre.mjs, pero en viewport TÁCTIL
   real (isMobile/hasTouch) — CLAUDE.md §7.3 punto 11: un tap sin
   arrastre y un arrastre real se comportan distinto en touch que con
   mouse (ver kit-base v1.9.38: un tap táctil sintetiza un `click` con
   `detail:0`, igual al de teclado, así que probarlo solo con
   page.mouse.* no alcanza para confirmar el fix en mobile de verdad). */
const { browser, page, errors } = await openCourseMobile(requireUrl());
await page.evaluate(() => { window.motor.go(21); }); // rotación
await page.waitForTimeout(400);

const failures = [];
const activo = async () => page.evaluate(() => {
  const btn = document.querySelector('[data-shot-swap="rotacion"] [data-shot-swap-go].is-active');
  return btn ? btn.getAttribute('data-shot-swap-go') : null;
});

// Tap táctil simple, sin arrastre, sobre el paso 3 — NO debe saltar.
const step3 = await page.$('[data-shot-swap="rotacion"] [data-shot-swap-go="3"]');
const box3 = await step3.boundingBox();
await page.touchscreen.tap(box3.x + box3.width / 2, box3.y + box3.height / 2);
await page.waitForTimeout(200);
let idx = await activo();
if (idx !== '0') failures.push('un tap táctil sin arrastrar movió la barra: quedó en el paso ' + idx + ' (esperaba seguir en 0)');

// Arrastre táctil real (>6px), parado en el paso activo, al paso 4 (índice 3) — SÍ debe mover.
const step0 = await page.$('[data-shot-swap="rotacion"] [data-shot-swap-go="0"]');
const box0 = await step0.boundingBox();
const startX = box0.x + box0.width / 2, startY = box0.y + box0.height / 2;
const endX = box3.x + box3.width / 2, endY = box3.y + box3.height / 2;
await page.evaluate(({ x1, y1, x2, y2 }) => {
  const el = document.querySelector('[data-shot-swap="rotacion"]');
  function fire(type, x, y) {
    el.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, cancelable: true }));
  }
  fire('pointerdown', x1, y1);
  fire('pointermove', x1 + 20, y1);
  fire('pointermove', x2, y2);
  fire('pointerup', x2, y2);
}, { x1: startX, y1: startY, x2: endX, y2: endY });
await page.waitForTimeout(200);
idx = await activo();
if (idx !== '3') failures.push('un arrastre táctil real debería mover la barra al paso arrastrado, quedó en ' + idx);

console.log(failures.length ? '✗ FALLOS:\n' + failures.map(f => '  - ' + f).join('\n') : '✓ rotacion-mobile — sin fallos.');
console.log('errores de consola:', errors.length ? errors.join(' | ') : '(ninguno)');
if (failures.length) process.exitCode = 1;
await browser.close();
