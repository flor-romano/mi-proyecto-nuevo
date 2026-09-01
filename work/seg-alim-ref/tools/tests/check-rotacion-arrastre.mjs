import { chromium } from 'playwright-core';
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
await page.goto(process.argv[2]);
await page.waitForTimeout(500);
await page.evaluate(() => { window.motor.go(21); }); // rotación
await page.waitForTimeout(400);

const failures = [];
const step3 = await page.$('[data-shot-swap="rotacion"] [data-shot-swap-go="3"]');
const box = await step3.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;

// Un "clic" real: down y up en EXACTAMENTE el mismo punto, sin mover.
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(150);
let idx = await page.evaluate(() => window.__api_rotacion_test);
// leemos el índice real vía data-shot-swap-go activo
let activo = await page.evaluate(() => {
  const btn = document.querySelector('[data-shot-swap="rotacion"] [data-shot-swap-go].is-active');
  return btn ? btn.getAttribute('data-shot-swap-go') : null;
});
if (activo !== '0') failures.push('un clic sin arrastre movió la barra: quedó en el paso ' + activo + ' (esperaba seguir en 0)');

// Ahora un arrastre real (>6px) al paso 4 (índice 3) — SÍ debe mover.
const step0 = await page.$('[data-shot-swap="rotacion"] [data-shot-swap-go="0"]');
const box0 = await step0.boundingBox();
const startX = box0.x + box0.width / 2, startY = box0.y + box0.height / 2;
await page.mouse.move(startX, startY);
await page.mouse.down();
await page.mouse.move(cx, cy, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(150);
activo = await page.evaluate(() => {
  const btn = document.querySelector('[data-shot-swap="rotacion"] [data-shot-swap-go].is-active');
  return btn ? btn.getAttribute('data-shot-swap-go') : null;
});
if (activo !== '3') failures.push('un arrastre real debería mover la barra al paso arrastrado, quedó en ' + activo);

/* Con el mouse encima, un tramo NO debe pintarse ni mostrar la mano de
   "clickeame": desde v1.9.37/v1.9.38 el clic no mueve la barra (solo el
   arrastre), así que ese affordance invitaba al gesto equivocado
   (reporte del cliente, v1.9.40). Queda `cursor:grab`, que es el gesto
   que sí funciona. */
const selTramo = '[data-shot-swap="rotacion"] [data-shot-swap-go="1"]';
await page.hover(selTramo);
await page.waitForTimeout(200);
const estilo = await page.evaluate((s) => {
  const cs = getComputedStyle(document.querySelector(s));
  return { background: cs.backgroundColor, cursor: cs.cursor };
}, selTramo);
const transparente = estilo.background === 'rgba(0, 0, 0, 0)' || estilo.background === 'transparent';
if (!transparente) failures.push('con el mouse encima, un tramo de la barra no debería pintarse — dio background ' + estilo.background);
if (estilo.cursor !== 'grab') failures.push('el cursor sobre la barra debería ser "grab" (arrastrar), no la mano de clic — dio ' + estilo.cursor);

console.log(failures.length ? '✗ FALLOS:\n' + failures.map(f=>'  - '+f).join('\n') : '✓ rotacion-solo-arrastre — sin fallos.');
console.log('errores de consola:', errors.length ? errors.join(' | ') : '(ninguno)');
if (failures.length) process.exitCode = 1;
await browser.close();
