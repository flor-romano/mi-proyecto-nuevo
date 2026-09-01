/* Utilidades compartidas por los tests genéricos — kit-base v1.0 */
import { chromium, devices } from 'playwright-core';

export async function openCourse(url) {
  const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});
  return { browser, page, errors };
}

/* openCourseMobile — kit-base v1.9.39. Mismo contrato que openCourse()
   pero en un contexto TÁCTIL real (isMobile/hasTouch, perfil completo
   de dispositivo — no solo un viewport angosto de escritorio). Existe
   porque CLAUDE.md §6.10.1 punto 4 (regla fija desde esta vuelta: toda
   interacción nueva se prueba en mobile real, en la MISMA vuelta en
   que se construye) solo es fácil de cumplir si el boilerplate de
   "levantar un contexto táctil" no hay que reescribirlo en cada test
   nuevo — antes de esto, cada test mobile (`check-fab-mobile.mjs`,
   `check-controles-audio-mobile.mjs`...) repetía las mismas ~6 líneas.

   `deviceName` es opcional — cualquier clave de `playwright-core`'s
   `devices` (default 'iPhone 12', 390×844, el mismo tamaño que ya
   usaba toda la suite mobile existente). Pasar otro nombre (ej.
   'iPad (gen 7)') para probar tablet real sin escribir un test aparte. */
export async function openCourseMobile(url, deviceName) {
  const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const device = devices[deviceName || 'iPhone 12'];
  const ctx = await browser.newContext({ ...device });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});
  return { browser, page, errors };
}

export function report(name, failures) {
  if (failures.length) {
    console.log(`\n✗ ${name} — ${failures.length} fallo(s):`);
    failures.forEach(f => console.log('  - ' + f));
    process.exitCode = 1;
  } else {
    console.log(`✓ ${name} — sin fallos.`);
  }
}

export function requireUrl() {
  const url = process.argv[2];
  if (!url) {
    console.error(`Uso: node ${process.argv[1].split('/').pop()} <url>`);
    process.exit(1);
  }
  return url;
}
