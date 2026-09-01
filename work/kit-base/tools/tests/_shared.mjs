/* Utilidades compartidas por los tests genéricos — kit-base v1.0 */
import { chromium, devices } from 'playwright-core';

/* Un error de consola sin la URL que lo causó es inútil (kit-base
   v1.9.52). `msg.text()` de un recurso que falla dice literalmente
   "Failed to load resource: the server responded with a status of 404
   (File not found)" y NADA MÁS — ni qué archivo, ni desde dónde. Cuatro
   de los siete tests rebotan por eso y el informe no te deja avanzar un
   paso. `msg.location().url` tiene la respuesta y se estaba tirando.

   Y `favicon.ico` se ignora explícitamente: el navegador lo pide solo,
   contra la RAÍZ del servidor (no contra la carpeta del curso), así que
   un paquete SCORM que nunca declaró un favicon —o sea, todos— hacía
   fallar 4 de 7 tests por algo que ni siquiera es del curso y que en el
   LMS real ni pasa (ahí la raíz es el host del LMS). Dejarlo rojo por
   default es peor que ignorarlo: entrena a mirar la suite en rojo y
   asumir que "siempre está así" — exactamente el modo de fallar de
   §6.60, donde "0 fallos" quería decir "0 fallos en 6 de 7". Cualquier
   OTRO 404 sigue siendo un fallo, ahora con la URL adelante. */
function mensajeDeConsola(msg) {
  const url = (msg.location && msg.location().url) || '';
  if (/\/favicon\.ico$/.test(url)) return null;
  return url ? `${msg.text()}  ← ${url}` : msg.text();
}

export async function openCourse(url) {
  const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const m = mensajeDeConsola(msg);
    if (m) errors.push(m);
  });
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
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const m = mensajeDeConsola(msg);
    if (m) errors.push(m);
  });
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
