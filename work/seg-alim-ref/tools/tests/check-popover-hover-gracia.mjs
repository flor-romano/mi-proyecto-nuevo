/* Test de contenido — el mecanismo (attachHoverGrace/initPinnedPopover,
   coto-player.js) es 100% de kit, pero corre contra los popovers reales
   de este curso (Sonido/Locución/Ayuda/Configuración). Pedido explícito
   del cliente: "se me complica pasar rápido el mouse a los desplegables
   sin que desaparezcan" — antes el cierre dependía de CSS :hover puro
   (sin perdón de un solo frame fuera del hitbox); ahora JS agrega una
   clase con una gracia antes de cerrar, cancelable si el mouse vuelve a
   entrar (al botón O al popover) antes de que venza.

   La gracia arrancó en 3s (v1.9.37) y bajó a 1,5s por pedido del
   cliente (v1.9.40): 3s alcanzaban para cruzar el hueco pero dejaban el
   panel colgado un rato largo después de que el alumno ya siguió con
   otra cosa. Mismo pedido sumó que un clic AFUERA cierre el popover
   aunque se haya abierto por hover — antes el handler de click-afuera
   solo sacaba `is-open` (el pin), nunca `is-hover`, así que el panel se
   quedaba hasta que venciera la gracia. */
import { chromium } from 'playwright-core';
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
await page.goto(process.argv[2]);
await page.waitForTimeout(500);
await page.keyboard.press('Escape').catch(()=>{});
await page.waitForTimeout(300);

const GRACIA_MS = 1500;
const failures = [];

const abierto = (sel) => page.evaluate(
  (s) => { const el = document.querySelector(s); return el.classList.contains('is-hover') || el.classList.contains('is-open'); },
  sel
);

async function checkCtl(selectorCtl, selectorBtn, selectorPop, label) {
  // 1 · abre con el mouse encima
  await page.hover(selectorBtn);
  await page.waitForTimeout(200);
  if (!await abierto(selectorCtl)) failures.push(`hover sobre ${label} debería abrir su popover`);

  // 2 · sigue abierto a mitad de la gracia
  await page.mouse.move(200, 500);
  await page.waitForTimeout(GRACIA_MS * 0.4);
  if (!await abierto(selectorCtl)) failures.push(`${label}: se cerró antes de tiempo — debería aguantar la gracia de ${GRACIA_MS}ms`);

  // 3 · se cierra solo pasada la gracia (+ margen)
  await page.waitForTimeout(GRACIA_MS + 400);
  if (await abierto(selectorCtl)) failures.push(`${label}: debería cerrarse solo pasados los ${GRACIA_MS}ms de gracia`);

  // 4 · re-entrar al popover antes de que venza cancela la gracia
  await page.hover(selectorBtn);
  await page.waitForTimeout(150);
  await page.mouse.move(200, 500);
  await page.waitForTimeout(GRACIA_MS * 0.4);
  await page.hover(selectorPop);
  await page.waitForTimeout(GRACIA_MS + 400);
  if (!await abierto(selectorCtl)) failures.push(`${label}: mover el mouse al popover antes de que venza la gracia debería cancelarla`);

  // 5 · un clic AFUERA lo cierra YA, sin esperar la gracia
  await page.mouse.click(200, 500);
  await page.waitForTimeout(150);
  if (await abierto(selectorCtl)) failures.push(`${label}: un clic afuera debería cerrarlo al instante, sin esperar la gracia`);

  // dejar todo cerrado para el siguiente control
  await page.mouse.move(10, 10);
  await page.waitForTimeout(GRACIA_MS + 400);
}

await checkCtl('[data-audio-ctl="sonido"]', '#d-sound', '[data-audio-ctl="sonido"] .d-audio-pop', 'Sonido');
await checkCtl('[data-audio-ctl="locucion"]', '#d-narrate', '[data-audio-ctl="locucion"] .d-audio-pop', 'Locución');
await checkCtl('[data-fab-ctl="config"]', '[data-fab-ctl="config"] .d-fab-btn', '[data-fab-ctl="config"] .d-fab-pop', 'Configuración');
await checkCtl('[data-fab-ctl="ayuda"]', '[data-fab-ctl="ayuda"] .d-fab-btn', '[data-fab-ctl="ayuda"] .d-fab-pop', 'Ayuda');

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
console.log(failures.length ? '✗ FALLOS:\n' + failures.map(f=>'  - '+f).join('\n') : '✓ popover-hover-gracia — sin fallos.');
if (failures.length) process.exitCode = 1;
await browser.close();
