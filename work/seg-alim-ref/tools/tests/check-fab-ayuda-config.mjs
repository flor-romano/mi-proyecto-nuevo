import { chromium } from 'playwright-core';
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });

await page.addInitScript(() => {
  function FakeVoice(name, lang) { this.name = name; this.lang = lang; this.default = false; this.localService = true; this.voiceURI = name; }
  const voices = [new FakeVoice('Google español de Argentina', 'es-AR'), new FakeVoice('Google español de Estados Unidos', 'es-US')];
  window.speechSynthesis = window.speechSynthesis || {};
  window.speechSynthesis.getVoices = () => voices;
  window.speechSynthesis.addEventListener = () => {};
  window.speechSynthesis.speak = () => {};
  window.speechSynthesis.cancel = () => {};
});

await page.goto(process.argv[2]);
await page.waitForTimeout(500);
await page.keyboard.press('Escape').catch(()=>{});
await page.waitForTimeout(300);

// Espiar Narrador.speak en vez de ejercitar el motor de voz real: acá
// interesa confirmar que el CABLEADO de los botones llama a
// Narrador.speak(), no que la Web Speech API funcione de punta a
// punta con voces falsas (eso ya se prueba en check-controles-audio.mjs
// con la secuencia de narracionprogreso, y ahí sí con voces reales del
// sandbox cuando existen).
await page.evaluate(() => {
  window.__speakCalls = 0;
  window.Narrador.speak = function (t, k) { window.__speakCalls++; window.__lastText = t; };
});

await page.click('[data-fab-ctl="config"] .d-fab-btn', { force: true });
await page.waitForTimeout(300);

const fieldVisible = await page.evaluate(() => !document.getElementById('d-voice-field').hidden);
const failures = [];
if (!fieldVisible) failures.push('el selector de voz sigue oculto con voces disponibles');

await page.selectOption('#d-voice-select', { index: 1 });
await page.waitForTimeout(100);
let calls = await page.evaluate(() => window.__speakCalls);
if (calls < 1) failures.push('cambiar la voz debería disparar Narrador.speak() (demo)');
const voiceLS = await page.evaluate(() => localStorage.getItem('coto-diapos-voice'));
if (!voiceLS) failures.push('elegir una voz debería persistirla en localStorage');

await page.evaluate(() => { window.__speakCalls = 0; });
await page.click('#d-voice-listen', { force: true });
await page.waitForTimeout(100);
calls = await page.evaluate(() => window.__speakCalls);
if (calls < 1) failures.push('"Escuchar un ejemplo" debería disparar Narrador.speak()');

await page.fill('#d-rate-range', '1.3');
await page.evaluate(() => { document.getElementById('d-rate-range').dispatchEvent(new Event('input')); });
await page.waitForTimeout(500);
const rateVal = await page.evaluate(() => localStorage.getItem('coto-diapos-rate'));
if (rateVal !== '1.3') failures.push('la velocidad no persistió: ' + rateVal);

await page.click('#d-config-reset', { force: true });
await page.waitForTimeout(150);
const afterReset = await page.evaluate(() => ({
  voice: localStorage.getItem('coto-diapos-voice'),
  rate: localStorage.getItem('coto-diapos-rate'),
  selVal: document.getElementById('d-voice-select').value,
  rangeVal: document.getElementById('d-rate-range').value
}));
if (afterReset.voice !== null) failures.push('restablecer debería borrar la voz manual: ' + afterReset.voice);
if (afterReset.rate !== '1') failures.push('restablecer debería volver la velocidad a 1: ' + afterReset.rate);
if (afterReset.selVal !== '') failures.push('el select debería volver a "automática": ' + afterReset.selVal);
if (afterReset.rangeVal !== '1') failures.push('el range debería volver a 1: ' + afterReset.rangeVal);

// Acordeón: una pregunta a la vez.
await page.click('[data-fab-ctl="ayuda"] .d-fab-btn', { force: true });
await page.waitForTimeout(300);
await page.click('.d-fab-acc-q >> nth=0', { force: true });
await page.waitForTimeout(150);
await page.click('.d-fab-acc-q >> nth=2', { force: true });
await page.waitForTimeout(150);
const openCount = await page.evaluate(() => document.querySelectorAll('.d-fab-acc-item.is-open').length);
if (openCount !== 1) failures.push('el acordeón debería dejar una sola pregunta abierta a la vez, hay ' + openCount);

// "Volver a ver la introducción": abre el modal Y cierra el flotante.
await page.click('.d-fab-replay', { force: true });
await page.waitForTimeout(300);
const state = await page.evaluate(() => ({
  modalOpen: document.querySelector('[data-popup="instrucciones"]').classList.contains('open'),
  fabPinned: document.querySelector('[data-fab-ctl="ayuda"]').classList.contains('is-open')
}));
if (!state.modalOpen) failures.push('"Volver a ver la introducción" debería abrir el modal de instrucciones');
if (state.fabPinned) failures.push('el flotante de Ayuda debería cerrarse al abrir el modal de instrucciones');

console.log(failures.length ? '✗ FALLOS:\n' + failures.map(f=>'  - '+f).join('\n') : '✓ fab-ayuda-config — sin fallos.');
console.log('errores de consola:', errors.length ? errors.join(' | ') : '(ninguno)');
if (failures.length) process.exitCode = 1;
await browser.close();
