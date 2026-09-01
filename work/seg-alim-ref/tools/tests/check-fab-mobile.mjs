import { openCourseMobile, requireUrl } from './_shared.mjs';
const { browser, page, errors } = await openCourseMobile(requireUrl());
await page.waitForTimeout(100);

const failures = [];

// no debe superponerse con el footer (Anterior/Siguiente/barra)
const overlap = await page.evaluate(() => {
  const stack = document.querySelector('[data-fab-stack]').getBoundingClientRect();
  const bottom = document.querySelector('.d-bottom').getBoundingClientRect();
  return stack.bottom > bottom.top;
});
if (overlap) failures.push('el stack de flotantes se superpone con el footer en mobile');

await page.tap('[data-fab-ctl="ayuda"] .d-fab-btn');
await page.waitForTimeout(400);
const box = await page.evaluate(() => {
  const pop = document.querySelector('[data-fab-ctl="ayuda"] .d-fab-pop');
  const r = pop.getBoundingClientRect();
  return { left: r.left, right: r.right, vw: window.innerWidth, opacity: getComputedStyle(pop).opacity };
});
if (box.opacity !== '1') failures.push('el popover de Ayuda debería abrirse con el tap en mobile');
if (box.left < 0 || box.right > box.vw) failures.push('el popover de Ayuda se sale del viewport en mobile: ' + JSON.stringify(box));

/* Captura OPCIONAL: solo si se pasa un directorio de salida como 2º
   argumento. Sin este guard, `process.argv[3]` viene `undefined` en la
   corrida normal (`node check-fab-mobile.mjs <url>`) y Playwright
   escribía literalmente en `./undefined/mobile-fab-ayuda.png` —
   ensuciando la carpeta del curso con un directorio "undefined" que
   después se colaba en el zip de entrega. Bug real, encontrado al
   armar un zip. */
if (process.argv[3]) await page.screenshot({ path: process.argv[3] + '/mobile-fab-ayuda.png' });

console.log(failures.length ? '✗ FALLOS:\n' + failures.map(f=>'  - '+f).join('\n') : '✓ fab-mobile — sin fallos.');
console.log('errores de consola:', errors.length ? errors.join(' | ') : '(ninguno)');
if (failures.length) process.exitCode = 1;
await browser.close();
