/* ============================================================
   scorm-tracking.mjs — ¿el curso le habla al LMS?
   ------------------------------------------------------------
   Nació de un bug real (CLAUDE.md §6.24): el motor emitía `courseend`
   al llegar a la diapositiva `data-slide-end` y NINGÚN curso lo
   escuchaba, así que `markCompleted()` no se llamaba nunca. El alumno
   terminaba el curso entero y en el LMS quedaba "incomplete" para
   siempre. No lo agarró ningún test porque los 6 anteriores miran el
   DOM, no la conversación con el LMS — que es justo lo que el cliente
   paga.

   Genérico: instala un LMS falso en `window.API` (SCORM 1.2 lo busca
   ahí), recorre el curso hasta `data-slide-end` y verifica el contrato
   mínimo. No conoce ni un ID de diapositiva de ningún curso.

   Uso:  node tools/tests/scorm-tracking.mjs http://localhost:8891/index.html
   ============================================================ */
import { chromium } from 'playwright-core';

const url = process.argv[2];
if (!url) { console.error('Uso: node scorm-tracking.mjs <url>'); process.exit(1); }

const fallos = [];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.addInitScript(() => {
  const store = {};
  window.__lms = { store };
  const set = (k, v) => { store[k] = String(v); return 'true'; };
  window.API = {
    LMSInitialize: () => 'true',
    LMSFinish: () => { store.__finished = '1'; return 'true'; },
    LMSGetValue: (k) => store[k] || '',
    LMSSetValue: set,
    LMSCommit: () => 'true',
    LMSGetLastError: () => '0',
    LMSGetErrorString: () => '',
    LMSGetDiagnostic: () => ''
  };
});

const jsErrors = [];
page.on('pageerror', e => jsErrors.push(e.message));
await page.goto(url);
await page.waitForTimeout(700);

// 1 · Al entrar tiene que quedar 'incomplete' (no 'not attempted').
const inicial = await page.evaluate(() => window.__lms.store['cmi.core.lesson_status']);
if (inicial !== 'incomplete') {
  fallos.push(`lesson_status al entrar es "${inicial}", se esperaba "incomplete"`);
}

// 2 · Tiene que existir una diapositiva marcada como fin de curso.
const hayFin = await page.evaluate(() => !!document.querySelector('[data-slide-end]'));
if (!hayFin) fallos.push('ninguna diapositiva tiene [data-slide-end]: el curso no puede completarse nunca');

// 3 · Al llegar ahí, el curso tiene que marcar completado.
if (hayFin) {
  await page.evaluate(() => {
    const i = Array.from(document.querySelectorAll('.slide'))
      .findIndex(s => s.hasAttribute('data-slide-end'));
    window.motor.go(i, true);
  });
  await page.waitForTimeout(600);

  const s = await page.evaluate(() => window.__lms.store);
  const st = s['cmi.core.lesson_status'];
  if (!['completed', 'passed'].includes(st)) {
    fallos.push(`al llegar a [data-slide-end] lesson_status quedó en "${st}" — se esperaba completed/passed (¿nadie escucha el evento courseend?)`);
  }
  if (!s['cmi.core.lesson_location']) {
    fallos.push('cmi.core.lesson_location vacío: el curso no guarda por dónde iba (no se puede retomar)');
  }
  const sd = s['cmi.suspend_data'] || '';
  if (sd.length > 4096) {
    fallos.push(`suspend_data usa ${sd.length} caracteres y el límite de SCORM 1.2 es 4096: el progreso se va a truncar`);
  }
}

if (jsErrors.length) fallos.push('errores JS en consola: ' + jsErrors.join(' | '));

await browser.close();

if (fallos.length) {
  console.log(`\n✗ scorm-tracking — ${fallos.length} fallo(s):`);
  fallos.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
console.log('✓ scorm-tracking — sin fallos.');
