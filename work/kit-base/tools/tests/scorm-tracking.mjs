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
/* Mismo arranque que los otros 6 tests (kit-base v1.9.52): este era el
   ÚNICO que ignoraba `CHROMIUM_PATH` y no pasaba `--no-sandbox`, con la
   ruta clavada a mano y sin escape. Consecuencia real: en cualquier
   máquina donde Chromium no esté exactamente ahí, la salida documentada
   en tools/tests/README.md ("exportá CHROMIUM_PATH") arreglaba 6 de 7
   tests y dejaba éste roto, sin que nada dijera por qué justo ese.
   Es la segunda vez que scorm-tracking.mjs queda afuera de algo por ser
   el que se escribió aparte — la primera fue no estar en la lista de la
   suite (§6.60). */
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
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
// kit-base v1.9.50 — ver full-regress.mjs para el porqué: el chequeo
// de "cmi.suspend_data > 4096" de más abajo es código muerto por
// construcción (saveState() nunca deja que se guarde algo así de
// grande), así que la señal real es este console.warn en el momento
// del rechazo, no el valor final ya guardado.
const suspendOverflow = [];
page.on('console', msg => { if (/suspend_data ocupa/.test(msg.text())) suspendOverflow.push(msg.text()); });
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
}

if (suspendOverflow.length) {
  fallos.push(`suspend_data superó 4096 caracteres ${suspendOverflow.length} vez(veces) — saveState() rechazó guardar y el progreso de ese momento se perdió en silencio: ` + suspendOverflow[0]);
}
if (jsErrors.length) fallos.push('errores JS en consola: ' + jsErrors.join(' | '));

await browser.close();

if (fallos.length) {
  console.log(`\n✗ scorm-tracking — ${fallos.length} fallo(s):`);
  fallos.forEach(f => console.log('  - ' + f));
  process.exit(1);
}
console.log('✓ scorm-tracking — sin fallos.');
