#!/usr/bin/env node
/* video-fondo.mjs — kit-base v1.9.76
   ------------------------------------------------------------
   POR QUÉ EXISTE. El patrón "video de fondo" (patrón 1 de
   coto-media.js) es el de la portada, y todo el trato con el cliente
   es *"dejá el .mp4 ahí, con ese nombre, y anda sin tocar código"*. Lo
   que hay que blindar es justamente eso, porque nada de esto da error:

     1. el NOMBRE y la CARPETA del archivo — si alguien los cambia, el
        video que suba el cliente no lo levanta nadie y la diapositiva
        se queda en el poster para siempre;
     2. el `poster`, que es lo que se ve mientras el archivo no está —
        sin él la diapositiva es un rectángulo negro;
     3. `playsinline`, sin el cual iOS abre el video a pantalla completa
        y se lleva puesto el curso;
     4. el botón de gesto (`.d-shot-video-tap`) OCULTO al nacer: visible
        de entrada es un "reproducir" sobre un video que ya está
        corriendo;
     5. y lo que costó una entrega (§7.18 K10): que con el autoplay CON
        SONIDO rechazado —que es lo que pasa SIEMPRE en la primera
        diapositiva, porque todavía no hubo un gesto del alumno— el
        video **igual termine reproduciéndose**, en mudo, en vez de
        quedarse congelado en el poster.

   El punto 5 solo se puede medir con la política real del navegador:
   sin `--autoplay-policy=document-user-activation-required` el
   navegador de pruebas deja pasar cualquier autoplay y el bug no
   existe. Por eso este test lanza su propio Chromium.
*/
import { report, requireUrl } from './_shared.mjs';
import { chromium } from 'playwright-core';

const url = requireUrl();
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({
  executablePath,
  args: ['--no-sandbox', '--autoplay-policy=document-user-activation-required']
});
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const fails = [];
await page.goto(url);
await page.waitForTimeout(400);

const slides = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.d-shot-slide--bg-video')).map((s) => ({
    id: s.closest('[data-slide]')?.getAttribute('data-slide') || '(sin data-slide)',
    hayVideo: !!s.querySelector('video.d-shot-video')
  })));

if (!slides.length) {
  report('video-fondo', []);              // el curso no usa el patrón: nada que verificar
  await browser.close();
  process.exit(process.exitCode || 0);
}

for (const s of slides) {
  if (!s.hayVideo) {
    fails.push(`"${s.id}": declara .d-shot-slide--bg-video pero no tiene <video class="d-shot-video">. ` +
      'Narrador.textOf() la trata como "diapositiva que ES un video" y NO la narra: queda muda.');
    continue;
  }
  const v = await page.evaluate((id) => {
    const sl = document.querySelector(`[data-slide="${id}"]`);
    const vid = sl.querySelector('video.d-shot-video');
    const src = vid.getAttribute('src') ||
      (vid.querySelector('source') && vid.querySelector('source').getAttribute('src')) || '';
    const tap = sl.querySelector('.d-shot-video-tap');
    return {
      src,
      poster: vid.getAttribute('poster') || '',
      playsinline: vid.hasAttribute('playsinline'),
      hayTap: !!tap,
      tapOculto: tap ? tap.hidden : null
    };
  }, s.id);

  if (!v.src) fails.push(`"${s.id}": el <video> no tiene src ni <source>.`);
  else if (!/^video\//.test(v.src)) {
    fails.push(`"${s.id}": el video vive en "${v.src}" y no en video/. La convención del kit es ` +
      'video/<nombre>.mp4 — si alguien la cambia, el archivo final que suba el cliente no lo ' +
      'levanta nadie y no da ningún error.');
  }
  if (!v.poster) {
    fails.push(`"${s.id}": el <video> no tiene \`poster\`. Mientras el archivo no está —o mientras ` +
      'carga— la diapositiva es un rectángulo negro.');
  }
  if (!v.playsinline) {
    fails.push(`"${s.id}": al <video> le falta \`playsinline\`: en iOS abre a pantalla completa y ` +
      'se lleva puesto el curso.');
  }
  if (v.hayTap && v.tapOculto === false) {
    fails.push(`"${s.id}": el botón de gesto (.d-shot-video-tap) nace VISIBLE. Tiene que nacer con ` +
      '`hidden`: lo muestra el JS solo si hizo falta.');
  }
}

/* 5 · con el autoplay bloqueado, el video igual tiene que arrancar. */
const primera = slides.find((s) => s.hayVideo);
if (primera) {
  await page.evaluate((id) => { if (window.motor && window.motor.gotoId) window.motor.gotoId(id); }, primera.id);
  await page.waitForTimeout(2000);
  const est = await page.evaluate((id) => {
    const vid = document.querySelector(`[data-slide="${id}"] video.d-shot-video`);
    return vid ? { pausado: vid.paused, t: vid.currentTime, listo: vid.readyState } : null;
  }, primera.id);
  /* readyState 0 = el archivo no está (placeholder de 0 bytes): eso es
     un estado válido y esperado durante la producción, no un fallo. */
  if (est && est.listo > 0 && est.pausado && est.t === 0) {
    fails.push(`"${primera.id}": el video está cargado y NO se reproduce. Dos causas posibles, y ` +
      'conviene descartarlas en este orden: (a) nadie llamó a `initBgVideos()` — la pieza está y ' +
      'el cable no, que es la falla más común de este molde (§7.17); o (b) el autoplay CON SONIDO ' +
      'fue rechazado —lo normal en la primera diapositiva, porque todavía no hubo un gesto del ' +
      'alumno— y no se reintentó MUDO (§7.18 K10). Lo que el navegador bloquea es el sonido, no el video.');
  }
}

report('video-fondo', fails);
await browser.close();
