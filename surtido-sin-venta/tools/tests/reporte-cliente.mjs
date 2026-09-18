#!/usr/bin/env node
/* reporte-cliente.mjs — test PROPIO de "Surtido sin venta"
   ------------------------------------------------------------
   Los tres puntos que el cliente reportó después de la primera entrega.
   Van como test y no como "ya lo miré": los tres son fallas que NO se
   ven en pantalla ni dan error —qué se dice en voz alta, qué forma tiene
   un realce, en qué orden arranca un audio— así que sin un test vuelven
   solas en la próxima vuelta.

     1. El índice locuta SOLO su título y el nombre del curso. Enumerar
        los 7 ítems era decir el temario dos veces (acá y al llegar a
        cada sección). La lista sigue en el DOM para el lector de
        pantalla: se saca de la VOZ, no de la accesibilidad.
     2. El realce de las 2 tarjetas de repaso calza con el borde de la
        TARJETA, no con el rectángulo del hitbox (que además cubre el aro
        de ícono, y por eso se veía una caja grande de esquinas vivas).
     3. Al responder en el mini juego, la consigna se corta y arranca la
        devolución: ni superposición ni silencio.
*/
import { openCourse, report, requireUrl, irASlide } from './_shared.mjs';
import { chromium } from 'playwright-core';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];
const cerca = (a, b, tol) => Math.abs(a - b) <= tol;

/* ---- 1 · qué locuta el índice ---------------------------------- */
{
  await irASlide(page, 'indice');
  const dicho = await page.evaluate(() => {
    const s = document.querySelector('[data-slide="indice"]');
    const solo = s.querySelector('[data-narrate-only]');
    return {
      locutado: (window.Narrador.textOf(solo || s) || '').trim(),
      itemsEnDom: s.querySelectorAll('ul li').length
    };
  });
  const esperado = 'Índice de contenidos. Control de surtido sin venta.';
  if (dicho.locutado !== esperado) {
    fails.push(`el índice locuta "${dicho.locutado}" y tiene que locutar exactamente ` +
      `"${esperado}" — sin enumerar los ítems del listado.`);
  }
  if (dicho.itemsEnDom !== 7) {
    fails.push(`el índice tiene ${dicho.itemsEnDom} ítems accesibles y deberían ser 7: la lista ` +
      'se saca de la locución, NO del DOM — es el único acceso que tiene un lector de pantalla ' +
      'al temario, que en pantalla está horneado dentro de la captura.');
  }
}

/* ---- 2 · forma del realce de las tarjetas de repaso -------------
   La tarjeta está DIBUJADA en la captura, así que no hay nodo que
   medir: se calcula dónde cae contra la imagen y se compara con el
   `::after` que pinta el realce. Las coordenadas son las mismas que
   están en el marcado, medidas sobre el render de 2520x1260. */
const TARJETAS = [
  { slide: 'repaso-reporte', hit: { t: 440, h: 553 }, card: { t: 574, b: 992 } },
  { slide: 'repaso-acciones', hit: { t: 424, h: 555 }, card: { t: 559, b: 978 } }
];
for (const t of TARJETAS) {
  await irASlide(page, t.slide);
  await page.waitForTimeout(350);
  const m = await page.evaluate((slide) => {
    const btn = document.querySelector(`[data-slide="${slide}"] .d-hit-ficha`);
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    const cs = getComputedStyle(btn, '::after');
    return {
      w: r.width, h: r.height,
      top: parseFloat(cs.top),
      radio: parseFloat(cs.borderTopLeftRadius),
      contenido: cs.content,
      hoverOutline: getComputedStyle(btn).outlineStyle
    };
  }, t.slide);
  if (!m) { fails.push(`[${t.slide}] no hay ninguna .d-hit-ficha`); continue; }
  if (!m.contenido || m.contenido === 'none') {
    fails.push(`[${t.slide}] la .d-hit-ficha no tiene el ::after que dibuja el realce: el hover ` +
      'vuelve a ser el rectángulo entero del hitbox, con el aro de ícono adentro.');
    continue;
  }
  // dónde arranca la tarjeta dentro del hitbox, en px de pantalla
  const escala = m.h / t.hit.h;
  const topEsperado = (t.card.t - t.hit.t) * escala;
  if (!cerca(m.top, topEsperado, 2)) {
    fails.push(`[${t.slide}] el realce arranca a ${m.top.toFixed(1)}px del borde del hitbox y la ` +
      `tarjeta arranca a ${topEsperado.toFixed(1)}px: el remarcado no calza con el borde real.`);
  }
  // el radio se declara en cqw del PROPIO hitbox: 5.71% de su ancho
  const radioEsperado = m.w * 0.0571;
  if (!cerca(m.radio, radioEsperado, 2)) {
    fails.push(`[${t.slide}] el radio del realce es ${m.radio.toFixed(1)}px y el de la tarjeta es ` +
      `${radioEsperado.toFixed(1)}px. Si dio 0, el \`cqw\` no se está resolviendo contra el hitbox ` +
      '(falta `container-type:inline-size`) y el realce sale con esquinas vivas.');
  }
}

/* ---- 3 · timing de audio del mini juego -------------------------
   Con un motor de voz FALSO, no con el real: en headless no hay voces,
   así que `speechSynthesis.speak()` termina al instante y el caso que
   importa —responder A MITAD de la consigna— no existiría. Misma
   técnica que usa `locucion-control.mjs` del kit: 300ms por fragmento,
   y recién ahí se puede medir si la consigna se CORTÓ o si siguió
   sonando por abajo. */
{
  const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const b2 = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
  const p2 = await b2.newPage({ viewport: { width: 1600, height: 900 } });
  await p2.addInitScript(() => {
    window.__voz = { dichos: [], cortes: [], cortadaEnCurso: 0 };
    let hablando = null;
    /* `window.speechSynthesis = {...}` NO reemplaza nada: es un accessor
       de solo lectura y la asignación falla EN SILENCIO (modo sloppy).
       Medido en este mismo Chromium: después de asignar, `getVoices()`
       sigue devolviendo la lista real (vacía en headless). Con
       `defineProperty` sí queda una propiedad propia que tapa al
       accessor. El motor de voz falso de `locucion-control.mjs` (kit)
       usa la asignación simple — relayado (K10). */
    const falso = {
      speaking: false, pending: false, paused: false,
      getVoices: () => [{ name: 'Falsa', lang: 'es-AR', voiceURI: 'falsa', default: true, localService: true }],
      speak(u) {
        window.__voz.dichos.push(u.text);
        hablando = u; falso.speaking = true;
        u._t = setTimeout(() => {
          falso.speaking = false; hablando = null; if (u.onend) u.onend({});
        }, 300);
      },
      cancel() {
        window.__voz.cortes.push(hablando ? hablando.text : null);
        if (falso.speaking) window.__voz.cortadaEnCurso++;
        if (hablando) { clearTimeout(hablando._t); hablando = null; }
        falso.speaking = false;
      },
      addEventListener() {}, removeEventListener() {}
    };
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true, writable: true, value: falso
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true, writable: true,
      value: function (t) { this.text = t; this.onend = null; this.onerror = null; }
    });
  });
  await p2.goto(url);
  await p2.waitForTimeout(600);
  await p2.keyboard.press('Escape').catch(() => {});
  await irASlide(p2, 'minijuego');
  await p2.waitForTimeout(300);

  const r = await p2.evaluate(async () => {
    const raiz = document.querySelector('[data-slide="minijuego"]');
    window.Narrador.setNarrating(true);
    raiz.querySelector('[data-target="mj-juego"]').click();
    await new Promise(r => setTimeout(r, 120));      // A MITAD de la consigna
    const consignaSonando = window.speechSynthesis.speaking;
    const dichosAntes = window.__voz.dichos.length;
    const cortadasAntes = window.__voz.cortadaEnCurso;

    const opts = () => Array.from(raiz.querySelectorAll('[data-mj-opciones] .d-mj-opt'));
    opts()[1].click();                                // respuesta incorrecta
    await new Promise(r => setTimeout(r, 60));
    const trasError = {
      corto: window.__voz.cortadaEnCurso > cortadasAntes,
      nuevos: window.__voz.dichos.slice(dichosAntes)
    };

    const marca = window.__voz.dichos.length;
    opts().find(b => !b.disabled && b.textContent === 'PLU').click();
    await new Promise(r => setTimeout(r, 60));
    const trasAcierto = window.__voz.dichos.slice(marca);
    return { consignaSonando, trasError, trasAcierto, todos: window.__voz.dichos };
  });
  await b2.close();

  if (!r.consignaSonando) {
    fails.push('el motor de voz falso no estaba narrando la consigna al momento de responder: ' +
      'el chequeo de superposición no llegó a medir nada (revisar el test, no el curso).');
  }
  if (!r.trasError.corto) {
    fails.push('responder NO cortó la consigna que estaba sonando: se superpone con la devolución ' +
      '(`Narrador.speak` arranca llamando a `cancel()`, así que esto quiere decir que el curso no ' +
      'está narrando nada al responder).');
  }
  const dijoMal = r.trasError.nuevos.join(' ');
  if (!dijoMal.includes('ese dato sí aparece en el envase')) {
    fails.push('al responder MAL no se locuta la devolución: el alumno no escucha por qué se ' +
      `equivocó (se dijo: "${dijoMal.slice(0, 70) || '(nada)'}").`);
  }
  const dijoBien = r.trasAcierto.join(' ');
  /* Se compara contra un tramo SIN siglas: lo que llega al motor de voz
     ya pasó por `speechify()`, así que "PLU" viaja como "pe ele ú" y
     "EAN" como "eán" (narrador.js). Buscar la sigla cruda acá daría un
     fallo que no existe. */
  if (!dijoBien.includes('es el código interno de Coto')) {
    fails.push('al responder BIEN no se locuta la devolución ' +
      `(se dijo: "${dijoBien.slice(0, 70) || '(nada)'}").`);
  }
}

if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
report('reporte-cliente', fails);
await browser.close();
