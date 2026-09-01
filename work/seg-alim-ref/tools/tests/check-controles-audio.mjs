import { openCourse, report, requireUrl } from './_shared.mjs';
const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

// 1. Volumen: abrir el panel, mover el slider, verificar % + persistencia.
await page.click('#d-sound');
await page.waitForTimeout(200);
const popVisible1 = await page.evaluate(() => {
  const pop = document.querySelector('[data-audio-ctl="sonido"] .d-audio-pop');
  return getComputedStyle(pop).opacity;
});
if (popVisible1 !== '1') failures.push(`el panel de volumen debería quedar visible tras el clic, opacity=${popVisible1}`);

await page.evaluate(() => {
  const r = document.getElementById('d-vol-range');
  r.value = '40';
  r.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(150);
const volState = await page.evaluate(() => ({
  pct: document.getElementById('d-vol-pct').textContent,
  stored: localStorage.getItem('coto-diapos-volume')
}));
if (volState.pct !== '40%') failures.push(`esperaba 40% en el label, dio ${volState.pct}`);
if (Math.abs(parseFloat(volState.stored) - 0.4) > 0.01) failures.push(`esperaba volumen 0.4 persistido, dio ${volState.stored}`);

// 2. Mute button dentro del panel sincroniza con el botón principal.
await page.click('#d-vol-mute-btn');
await page.waitForTimeout(150);
const muteState = await page.evaluate(() => ({
  headerMuted: document.getElementById('d-sound').classList.contains('is-muted'),
  popMuted: document.getElementById('d-vol-mute-btn').classList.contains('is-muted')
}));
if (!muteState.headerMuted || !muteState.popMuted) failures.push(`mutear desde el panel debería reflejarse en ambos botones: ${JSON.stringify(muteState)}`);
await page.click('#d-vol-mute-btn'); // des-mutea
await page.waitForTimeout(150);

// 3. Secuencia de eventos narracionprogreso: sin backend de audio real
//    en este sandbox, speechSynthesis puede resolver los fragmentos casi
//    instantáneo — en vez de "esperar y sacar una foto", se capturan
//    TODOS los eventos que dispara una narración completa y se valida
//    la secuencia entera (0, 1, 2, terminado), que es lo que de verdad
//    importa: el orden y el conteo, no el timing real.
const secuencia = await page.evaluate(() => {
  return new Promise((resolve) => {
    var eventos = [];
    function onProg(e) {
      eventos.push(e.detail ? { index: e.detail.index, total: e.detail.total, terminado: e.detail.terminado } : null);
      if (e.detail && e.detail.terminado) {
        document.removeEventListener('narracionprogreso', onProg);
        resolve(eventos);
      }
    }
    document.addEventListener('narracionprogreso', onProg);
    window.Narrador.setNarrating(true);
    var s1 = 'Primera frase de prueba, bastante larga para asegurarnos de que ocupe una buena parte del límite de caracteres por fragmento que usa el narrador.';
    var s2 = 'Segunda frase de prueba, también larga, para que el fragmentado la separe de la primera y de la tercera en un trozo aparte.';
    var s3 = 'Tercera y última frase de prueba, para completar el ejemplo con un total de tres fragmentos distintos.';
    window.Narrador.speak(s1 + ' ' + s2 + ' ' + s3, 'other');
    setTimeout(function () { resolve(eventos); }, 3000); // red de seguridad
  });
});
const indices = secuencia.filter(e => e).map(e => e.index + (e.terminado ? ':fin' : ''));
if (secuencia.length < 4 || secuencia[0].total !== 3) {
  failures.push(`esperaba una secuencia de progreso con total=3, dio: ${JSON.stringify(secuencia)}`);
}
if (!secuencia.some(e => e && e.index === 0 && !e.terminado)) failures.push(`nunca se vio el índice 0 (primera frase) en la secuencia: ${JSON.stringify(indices)}`);
if (!secuencia[secuencia.length - 1] || !secuencia[secuencia.length - 1].terminado) {
  failures.push(`la secuencia debería terminar con terminado:true, dio: ${JSON.stringify(indices)}`);
}

// 4. seek(0) sobre la narración YA terminada: "Repetir" tiene que poder
//    volver a arrancarla igual (esto SÍ se puede comprobar sin carrera:
//    el estado post-fin es estable, no una foto de un instante fugaz).
await page.waitForTimeout(200);
const antesDeRepetir = await page.evaluate(() => window.Narrador.progreso());
if (!antesDeRepetir || !antesDeRepetir.terminado) failures.push(`esperaba la narración ya terminada antes de repetir: ${JSON.stringify(antesDeRepetir)}`);
const replayDisabled = await page.evaluate(() => document.getElementById('d-narr-replay').disabled);
if (replayDisabled) failures.push('el botón "Repetir" debería estar habilitado después de que la narración terminó');

const repetido = await page.evaluate(() => {
  window.Narrador.repeat();
  return window.Narrador.progreso();
});
if (!repetido || repetido.index !== 0 || repetido.terminado) {
  failures.push(`"Repetir" debería volver a arrancar desde el índice 0, dio: ${JSON.stringify(repetido)}`);
}

// 4b. seek(1) a un índice intermedio (no 0, no el último) — el índice
//    se fija SINCRÓNICAMENTE antes de llamar a synth.speak(), así que
//    se puede leer en el mismo evaluate() sin carrera de timing.
const seekMedio = await page.evaluate(() => {
  window.Narrador.seek(1);
  return window.Narrador.progreso();
});
if (!seekMedio || seekMedio.index !== 1 || seekMedio.terminado) {
  failures.push(`seek(1) debería dejar el índice en 1, sin terminar, dio: ${JSON.stringify(seekMedio)}`);
}

// 5. Sin narración activa (recién cargada la página): el panel arranca deshabilitado.
await browser.close();
const { browser: b2, page: p2 } = await openCourse(url);
const inicial = await p2.evaluate(() => ({
  disabled: document.getElementById('d-narr-range').disabled,
  replayDisabled: document.getElementById('d-narr-replay').disabled
}));
if (!inicial.disabled || !inicial.replayDisabled) {
  failures.push(`sin narración activa el panel debería estar deshabilitado: ${JSON.stringify(inicial)}`);
}
await b2.close();

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
report('controles-de-audio', failures);
