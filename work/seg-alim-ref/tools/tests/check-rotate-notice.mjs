/* check-rotate-notice.mjs — kit-base v1.9.39
   Confirma el aviso "Girá tu dispositivo" (.d-rotate-notice,
   coto-shot-stage.css): visible SOLO cuando el .d-stage queda más
   alto que ancho (portrait de verdad — teléfono o tablet en
   vertical), invisible en cualquier landscape (desktop, tablet
   horizontal, teléfono horizontal), sin importar si el viewport es
   táctil o no. Resuelve la limitación documentada sin resolver en
   CLAUDE.md §6.56. */
import { chromium } from 'playwright-core';
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });

async function visible(viewport, isMobile) {
  const page = await browser.newPage({ viewport, isMobile: !!isMobile, hasTouch: !!isMobile });
  await page.goto(process.argv[2]);
  await page.waitForTimeout(400);
  const disp = await page.evaluate(() => getComputedStyle(document.querySelector('.d-rotate-notice')).display);
  await page.close();
  return disp !== 'none';
}

const casos = [
  { nombre: 'teléfono portrait angosto (390x844)', viewport: { width: 390, height: 844 }, isMobile: true, esperado: true },
  { nombre: 'tablet portrait (768x1024)', viewport: { width: 768, height: 1024 }, isMobile: true, esperado: true },
  { nombre: 'desktop 1600x900', viewport: { width: 1600, height: 900 }, esperado: false },
  { nombre: 'tablet landscape (1024x768)', viewport: { width: 1024, height: 768 }, isMobile: true, esperado: false },
  { nombre: 'teléfono landscape (844x390)', viewport: { width: 844, height: 390 }, isMobile: true, esperado: false },
];

const failures = [];
for (const c of casos) {
  const v = await visible(c.viewport, c.isMobile);
  console.log(c.nombre, '-> visible:', v, '(esperado:', c.esperado, ')');
  if (v !== c.esperado) failures.push(c.nombre + ': se esperaba visible=' + c.esperado + ', dio ' + v);
}
console.log(failures.length ? '✗ FALLOS:\n' + failures.map(f=>'  - '+f).join('\n') : '✓ rotate-notice — sin fallos.');
if (failures.length) process.exitCode = 1;
await browser.close();
