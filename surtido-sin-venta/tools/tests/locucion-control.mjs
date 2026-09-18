#!/usr/bin/env node
/* locucion-control.mjs — kit-base v1.9.76
   ------------------------------------------------------------
   POR QUÉ EXISTE. Ninguna de estas fallas rompe nada visible ni da un
   solo error de consola, y las tres las reportó un cliente:

     · entrar a una diapositiva y que NO narre (0 locuciones) — y, como
       es `speak()` quien llama a `cancel()`, la locución anterior sigue
       sonando por abajo, así que además queda desfasada;
     · entrar y que narre DOS veces encimadas;
     · volver a prender el botón y que RELEA la diapositiva entera en
       vez de reanudar (§7.18 K9).

   CÓMO SE MIDE, y por qué hace falta un motor de voz falso: en headless
   no hay voces, así que `speechSynthesis.speak()` termina al instante y
   `progreso()` siempre devuelve `terminado:true`. Con eso, el caso
   "silenciar a mitad de la frase" —que es justo el que importa— no
   existe. Acá se reemplaza el motor por uno que tarda 300ms por
   fragmento, y recién entonces se puede medir.
*/
import { openCourse, report, requireUrl } from './_shared.mjs';
import { chromium } from 'playwright-core';

const url = requireUrl();
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const fails = [];

/* Motor de voz falso: 300ms por fragmento. Se instala ANTES de que
   cargue el curso, porque narrador.js lo mira al inicializarse. */
await page.addInitScript(() => {
  let hablando = null;
  window.speechSynthesis = {
    speaking: false, pending: false, paused: false,
    getVoices: () => [{ name: 'Falsa', lang: 'es-US', voiceURI: 'falsa', default: true, localService: true }],
    speak(u) {
      hablando = u; this.speaking = true;
      u._t = setTimeout(() => { this.speaking = false; hablando = null; if (u.onend) u.onend({}); }, 300);
    },
    cancel() { if (hablando) { clearTimeout(hablando._t); hablando = null; } this.speaking = false; },
    addEventListener() {}, removeEventListener() {}
  };
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.onend = null; this.onerror = null; };
});

await page.goto(url);
await page.waitForTimeout(500);

const hay = await page.evaluate(() =>
  !!(window.Narrador && window.motor && document.getElementById('d-narrate')));
if (!hay) {
  report('locucion-control', ['el curso no tiene locución cableada (`#d-narrate` / `Narrador` / `motor`)']);
  await browser.close();
  process.exit(process.exitCode || 0);
}

await page.evaluate(() => {
  document.getElementById('d-narrate').hidden = false;
  window.__speak = []; window.__seek = [];
  const os = Narrador.speak, ok = Narrador.seek;
  Narrador.speak = function (t) { window.__speak.push(String(t || '').slice(0, 30)); return os.apply(this, arguments); };
  Narrador.seek = function (i) { window.__seek.push(i); return ok.apply(this, arguments); };
  Narrador.setNarrating(true);
});

const ids = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]')).map((s) => s.getAttribute('data-slide')));

/* 1 · Una locución por diapositiva, exactamente. 0 = muda; 2 = encimadas. */
for (const id of ids.slice(1)) {
  await page.evaluate(() => { window.__speak = []; });
  const fue = await page.evaluate((s) => {
    if (!window.motor.gotoId) return false;
    window.motor.gotoId(s); return true;
  }, id);
  if (!fue) continue;
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => window.__speak);
  const esVideo = await page.evaluate((s) =>
    !!document.querySelector(`[data-slide="${s}"]`)?.classList.contains('d-shot-slide--bg-video'), id);
  if (esVideo) continue;                      // por diseño no narra (§5)
  if (r.length === 0) {
    fails.push(`"${id}": entrar no disparó NINGUNA locución. Además de quedar muda, la locución ` +
      'de la diapositiva anterior sigue sonando por abajo, porque es `speak()` quien llama a `cancel()`.');
  } else if (r.length > 1) {
    fails.push(`"${id}": entrar disparó ${r.length} locuciones encimadas (${r.join(' | ')}).`);
  }
}

/* 2 · Volver a prender REANUDA, no relee (§7.18 K9). */
await page.evaluate(() => { window.__speak = []; window.__seek = []; });
await page.click('#d-narrate');                        // apagar a mitad
await page.evaluate(() => { window.__speak = []; window.__seek = []; });
await page.click('#d-narrate');                        // prender
await page.waitForTimeout(200);
const reanuda = await page.evaluate(() => ({ speak: window.__speak, seek: window.__seek }));
if (reanuda.speak.length && !reanuda.seek.length) {
  fails.push('volver a prender la locución RELEE la diapositiva desde el principio en vez de ' +
    'reanudar donde se cortó (§7.18 K9). En una diapositiva larga es volver a escuchar todo.');
}

/* 3 · Tras navegar en silencio, prender lee LA QUE ESTÁ EN PANTALLA. */
await page.click('#d-narrate');                        // apagar
await page.evaluate(() => { if (window.motor) window.motor._advance(1); });
await page.waitForTimeout(300);
await page.evaluate(() => { window.__speak = []; });
await page.click('#d-narrate');                        // prender
await page.waitForTimeout(300);
const tras = await page.evaluate(() => {
  const cur = window.motor.current();
  const esperado = (window.Narrador.textOf(cur) || '').slice(0, 30);
  return { dijo: window.__speak, esperado };
});
if (tras.dijo.length && tras.esperado && !tras.dijo.some((t) => t.slice(0, 20) === tras.esperado.slice(0, 20))) {
  fails.push('después de navegar con la locución apagada, al prenderla lee una diapositiva que ' +
    `no es la que está en pantalla (dijo "${tras.dijo[0]}", se esperaba "${tras.esperado}").`);
}

report('locucion-control', fails);
await browser.close();
