/* check-volumen-locucion.mjs — kit-base v1.9.40
   El control "Sonido" del header es un volumen GLOBAL: la locución
   (SpeechSynthesisUtterance.volume) tiene que respetar el mismo slider
   que el video y los efectos, y quedar en 0 si "Sonido" está muteado
   (§6.44 punto 9: "Sonido mutea TODO"). Espía speechSynthesis.speak
   para leer el volumen real de cada utterance emitido — en este
   sandbox no hay audio real, pero el valor que se le pasa al motor sí
   es verificable. */
import { chromium } from 'playwright-core';
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const url = process.argv[2];
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto(url);
await page.waitForTimeout(500);

const r = await page.evaluate(() => {
  const vistos = [];
  const orig = speechSynthesis.speak.bind(speechSynthesis);
  speechSynthesis.speak = function (u) { vistos.push(u.volume); orig(u); };
  const ultimo = () => (vistos.length ? vistos[vistos.length - 1] : null);
  const out = {};
  localStorage.setItem('coto-diapos-volume', '1');
  localStorage.setItem('coto-diapos-mute', '0');
  Narrador.speak('Hola esto es una prueba de volumen.', 'other');
  out.vol100 = ultimo();
  localStorage.setItem('coto-diapos-volume', '0.3');
  Narrador.speak('Otra prueba distinta.', 'other');
  out.vol30 = ultimo();
  localStorage.setItem('coto-diapos-mute', '1');
  Narrador.speak('Prueba con mute puesto.', 'other');
  out.muteado = ultimo();
  return out;
});

/* BUG REAL, reporte del cliente (kit-base v1.9.42, CLAUDE.md §6.62):
   mover el slider de volumen "tarda en impactar... hay que reiniciar
   para que se cambie" — el `input` handler (coto-player.js) guardaba
   el volumen nuevo pero nunca refrescaba la locución EN CURSO, solo
   el toggle discreto de mute lo hacía; la narración de una diapositiva
   típica entra en UN solo fragmento, así que "se aplica en el
   fragmento siguiente" nunca llegaba a sentirse. Fix: el slider suma
   un listener de `change` (dispara UNA vez al soltar el mouse — o en
   cada flecha con teclado, que no tiene "arrastre") que llama
   `Narrador.refreshVolume()` — `input` sigue actualizando valor/
   localStorage/UI en cada tick sin tocar la narración (evita cortar
   la frase a cada píxel de arrastre).
   Se espía `Narrador.refreshVolume` DIRECTO (no `speechSynthesis.speak`
   ni `Narrador.progreso()`): en este sandbox sin backend de audio real,
   cuánto tarda una narración simulada en marcarse "terminada" resultó
   errático entre corridas — depender de eso hacía flaky justo la parte
   que hay que verificar. Espiar la función que el fix agrega es la
   señal directa e inequívoca de que el mecanismo dispara. */
await page.evaluate(() => {
  window.__refreshCalls = 0;
  var orig = Narrador.refreshVolume;
  Narrador.refreshVolume = function () { window.__refreshCalls++; return orig.apply(Narrador, arguments); };
});
await page.evaluate(() => {
  var range = document.getElementById('d-vol-range');
  // Arrastre real: varios `input` seguidos (cada tick del drag)...
  [80, 60, 40, 30].forEach(function (v) {
    range.value = String(v);
    range.dispatchEvent(new Event('input', { bubbles: true }));
  });
});
const duranteDrag = await page.evaluate(() => window.__refreshCalls);
await page.evaluate(() => {
  // ...y recién `change` al soltar (un solo evento, al final del gesto).
  document.getElementById('d-vol-range').dispatchEvent(new Event('change', { bubbles: true }));
});
const trasSoltar = await page.evaluate(() => window.__refreshCalls);

const failures = [];
if (duranteDrag !== 0) {
  failures.push(`durante el arrastre ('input', antes de soltar) no debería llamarse refreshVolume — se llamó ${duranteDrag} vez(es)`);
}
if (r.vol100 !== 1) failures.push('con el slider en 100% se esperaba volume 1, dio ' + r.vol100);
if (Math.abs(r.vol30 - 0.3) > 0.001) failures.push('con el slider en 30% se esperaba volume 0.3, dio ' + r.vol30);
if (r.muteado !== 0) failures.push('con "Sonido" muteado se esperaba volume 0, dio ' + r.muteado);
if (trasSoltar < 1) {
  failures.push('al soltar el slider (evento "change") debería llamarse refreshVolume una vez — no pasó, sigue el bug de "hay que reiniciar"');
}
console.log(failures.length ? '✗ FALLOS:\n' + failures.map(f => '  - ' + f).join('\n') : '✓ volumen-locucion — sin fallos.');
console.log('errores de consola:', errors.length ? errors.join(' | ') : '(ninguno)');
if (failures.length) process.exitCode = 1;
await browser.close();
