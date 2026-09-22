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

   Segunda tanda de reportes:
     4. El ícono del curso de la barra superior es el real, no el
        placeholder de 1x1 que deja el generador.
     5. El chip de logros NUNCA puede mostrar más obtenidos que el total
        del catálogo ("7/6"), ni siquiera con estado viejo guardado.
     6. Tras responder MAL también hay botón para avanzar: el alumno no
        puede quedar sin salida visible.

   Quinta tanda:
     7. Ayuda y Configuración se abren SOLO con clic, nunca con el mouse
        encima.
     8. La ficha de repaso entra sin scroll, con 30px de radio, y su
        título arranca por debajo del aro de ícono.
     9. El índice no deja avanzar hasta abrir "Cómo recorrer el curso".
    10. En pantallas bajas ninguna fila del mini juego se monta sobre
        otra.
    11. Las píldoras de "Últimos consejos" no tienen texto horneado
        debajo del HTML (era lo que se veía "duplicado" al animarse).

   Sexta tanda:
    12. El video llena el marco que el diseñador dibujó, sin franjas
        arriba y abajo.
    13. Los íconos de las fichas son el recorte del PDF, cuadrados y sin
        deformar — no un `<svg>` dibujado a mano acá.

   Séptima tanda:
    14. El mini juego aprueba con 3 de 5 (y no aprueba con 2).
    15. El ícono del curso es un cuadrado de esquinas redondeadas, no un
        círculo.

   Octava tanda — casi toda de iPad:
    16. Las 4 tarjetas de opciones del mini juego miden lo mismo aunque
        una envuelva en dos renglones.
    17. El lienzo llena la pantalla mientras el recorte que eso cuesta
        entre en el margen del diseño (medido: hasta 8% por lado), y
        vuelve al 2:1 fijo por debajo de ese umbral.
    18. Abrir un pop-up con el dedo no deja el foco en un campo de texto
        (es lo que dispara el cartel de iPadOS "parece que estás
        escribiendo en pantalla completa").
    19. Las capturas de las diapositivas de video no son `lazy`: si no,
        al entrar por primera vez el botón de play queda mal ubicado.
    20. Los pop-ups no se comen la pantalla en un iPad vertical.
    21. El mini juego no deja avanzar hasta APROBARLO.

   Novena tanda:
    22. En una pantalla grande la interfaz escala (y los botones con
        etiqueta no se aplastan al hacerlo).

   Décima tanda:
    23. El video de fondo de la portada INSISTE si el navegador le
        bloquea el primer play (era eso lo que hacía que arrancara solo
        al ir y volver de diapositiva).
    24. La locución de los objetivos no dice "A", "B" ni "C" — las
        letras siguen en pantalla, que es donde el diseñador las puso.
    25. Donde el lienzo deja franja, la franja CONTINÚA el arte: la
        línea decorativa llega al borde de la ventana con el mismo
        color, sin costura (medido sobre los píxeles de la captura).
    26. "Los 7 conceptos" del resumen son 7.
    27. Las fichas de repaso entran sin scroll también en un iPad
        acostado (es el alto de ventana que las rompía).
    28. En un dispositivo táctil la locución arranca a 0.85x, en
        escritorio a 1x, y una velocidad ya elegida por el alumno manda
        sobre las dos.
*/
import { openCourse, report, requireUrl, irASlide } from './_shared.mjs';
import { chromium } from 'playwright-core';
import { PNG } from 'pngjs';

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
   `<span class="d-ficha-ring">` que pinta el realce. Las coordenadas
   salen del marcado y del arte medido a 2520x1260.

   El cliente reclamó esto DOS veces, y la segunda fue más fina que la
   primera: no alcanza con que el realce empiece en el borde de la
   tarjeta (ronda 2) — el aro dorado del ícono asoma por encima de ese
   borde, y un rectángulo que arranque ahí igual le pasa por arriba
   (ronda 3). Por eso acá se verifica lo que se ve, no cómo está hecho:
   1) que el realce arranque en el borde real de la tarjeta,
   2) que tenga las esquinas redondeadas de la tarjeta, y
   3) que el centro del círculo del ícono quede FUERA del realce —
      medido pidiéndole al navegador el color del píxel… que no se
      puede. Lo que sí se puede es leer la máscara: si no hay
      `mask-image` con un agujero, el círculo queda tapado. */
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
    const ring = btn.querySelector('.d-ficha-ring');
    if (!ring) return { w: 0, h: 0, sinRing: true };
    const r = btn.getBoundingClientRect();
    const rr = ring.getBoundingClientRect();
    const cs = getComputedStyle(ring);
    return {
      w: r.width, h: r.height,
      top: rr.top - r.top,
      radio: parseFloat(cs.borderTopLeftRadius),
      mask: cs.maskImage || cs.webkitMaskImage || 'none',
      contenedor: getComputedStyle(btn).containerType
    };
  }, t.slide);
  if (!m) { fails.push(`[${t.slide}] no hay ninguna .d-hit-ficha`); continue; }
  if (m.sinRing) {
    fails.push(`[${t.slide}] la .d-hit-ficha no tiene el <span class="d-ficha-ring"> que dibuja ` +
      'el realce: el hover vuelve a ser el rectángulo entero del hitbox, con el aro de ícono adentro.');
    continue;
  }
  // dónde arranca la tarjeta dentro del hitbox, en px de pantalla
  const escala = m.h / t.hit.h;
  const topEsperado = (t.card.t - t.hit.t) * escala;
  if (!cerca(m.top, topEsperado, 3)) {
    fails.push(`[${t.slide}] el realce arranca a ${m.top.toFixed(1)}px del borde del hitbox y la ` +
      `tarjeta arranca a ${topEsperado.toFixed(1)}px: el remarcado no calza con el borde real.`);
  }
  // el radio se declara en cqw del PROPIO hitbox: 6% de su ancho
  const radioEsperado = m.w * 0.06;
  if (!cerca(m.radio, radioEsperado, 2)) {
    fails.push(`[${t.slide}] el radio del realce es ${m.radio.toFixed(1)}px y el de la tarjeta es ` +
      `${radioEsperado.toFixed(1)}px. Si dio 0, el \`cqw\` no se está resolviendo contra el hitbox ` +
      `(containerType="${m.contenedor}") y el realce sale con esquinas vivas.`);
  }
  if (!/radial-gradient/.test(m.mask)) {
    fails.push(`[${t.slide}] el realce no tiene la máscara radial que le hace el agujero al aro ` +
      `dorado (mask-image: ${m.mask}). Sin eso el rectángulo del realce le pasa por encima al ` +
      'círculo del ícono, que es exactamente lo que el cliente reportó.');
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

/* ---- 4 · el ícono del curso no es el placeholder ---------------- */
{
  const ico = await page.evaluate(() => {
    const img = document.querySelector('.d-brand .lg img');
    if (!img) return null;
    return { w: img.naturalWidth, h: img.naturalHeight, src: img.getAttribute('src'),
             radio: getComputedStyle(img.closest('.lg')).borderTopLeftRadius };
  });
  if (!ico) fails.push('no hay <img> de marca en la barra superior.');
  else if (ico.w <= 1 || ico.h <= 1) {
    fails.push(`el ícono del curso sigue siendo el placeholder de ${ico.w}x${ico.h} que escribe ` +
      '`new-course.mjs` (un WebP de 1x1 transparente): la pastilla dorada se ve vacía.');
  }
  /* La FORMA del recuadro se chequea en el punto 15: el cliente pasó de
     pedir círculo a pedir el cuadrado redondeado de su asset, y tener la
     regla en dos lugares garantizaba que una de las dos quedara vieja. */
}

/* ---- 5 · el chip de logros no puede pasarse del total -----------
   Se fuerza el caso real: `suspend_data` con un id de logro que ya no
   está en el catálogo (lo que queda al probar builds sucesivos sobre la
   misma carpeta, porque `scorm-api.js` deriva su clave de la ruta del
   paquete). `Logros.restore()` del kit no cruza esos ids contra el
   catálogo y el chip terminaba mostrando "7/6". */
{
  await page.evaluate(() => {
    const s = window.SCORM.loadState() || {};
    s.b = ['conceptos', 'repaso', 'juego', 'preciso', 'curso', 'reporte', 'acciones', 'fantasma-de-otra-version'];
    window.SCORM.saveState(s);
  });
  await page.reload();
  await page.waitForTimeout(700);
  const chip = await page.evaluate(() => ({
    txt: document.getElementById('d-badge-count').textContent,
    tarjetas: document.querySelectorAll('#d-badges-list .d-badge').length
  }));
  const m = /^(\d+)\/(\d+)$/.exec(chip.txt.trim());
  if (!m) {
    fails.push(`el chip de logros dice "${chip.txt}" y no tiene la forma N/M.`);
  } else if (+m[1] > +m[2]) {
    fails.push(`el chip muestra "${chip.txt}": más logros obtenidos que el total del catálogo. ` +
      'Un id guardado que ya no existe se sigue contando — `Logros.restore()` no lo valida y ' +
      '`unlock()` sí, así que las dos puertas al mismo conjunto no aplican el mismo criterio.');
  }
  if (m && +m[2] !== chip.tarjetas) {
    fails.push(`el chip dice que hay ${m[2]} logros y la grilla dibuja ${chip.tarjetas} tarjetas.`);
  }
  // se deja el estado limpio para lo que venga después
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
  await page.reload();
  await page.waitForTimeout(500);
}

/* ---- 6 · tras responder MAL hay salida ------------------------- */
{
  await irASlide(page, 'minijuego');
  await page.waitForTimeout(250);
  await page.click('[data-slide="minijuego"] [data-target="mj-juego"]');
  await page.waitForTimeout(300);
  const r = await page.evaluate(async () => {
    const raiz = document.querySelector('[data-slide="minijuego"]');
    const opts = () => Array.from(raiz.querySelectorAll('[data-mj-opciones] .d-mj-opt'));
    opts()[1].click();                       // incorrecta en la pregunta 1
    await new Promise(r => setTimeout(r, 200));
    const boton = raiz.querySelector('.d-mj-next');
    const antes = raiz.querySelector('[data-mj-n]').textContent;
    const vivas = opts().filter(b => !b.disabled).length;
    // el cartel se lee ANTES de avanzar: `render()` lo limpia al pasar
    // de pregunta, y leerlo después devolvía siempre vacío.
    const fb = raiz.querySelector('[data-mj-fb]').textContent;
    if (boton) boton.click();
    await new Promise(r => setTimeout(r, 250));
    return {
      habiaBoton: !!boton,
      rotulo: boton ? boton.textContent : null,
      vivasTrasError: vivas,
      preguntaAntes: antes,
      preguntaDespues: raiz.querySelector('[data-mj-n]').textContent,
      fb: fb
    };
  });
  if (!r.habiaBoton) {
    fails.push('tras responder MAL no aparece ningún botón para avanzar: el alumno ve la ' +
      'devolución y no tiene salida visible.');
  }
  if (r.vivasTrasError < 2) {
    fails.push(`tras el error quedaron ${r.vivasTrasError} opciones habilitadas: la opción errada ` +
      'se deshabilita, el resto tiene que seguir viva para poder reintentar.');
  }
  if (r.preguntaDespues === r.preguntaAntes) {
    fails.push(`el botón de avance no pasó de pregunta (sigue en la ${r.preguntaDespues}).`);
  }
  if (!/probar otra opción o seguir/i.test(r.fb || '')) {
    fails.push('el cartel de error no avisa que se puede reintentar o seguir.');
  }
}

/* ---- 7 · Ayuda y Configuración: solo clic ----------------------
   Se mide el efecto, no la implementación: con el mouse encima del
   botón, el panel tiene que seguir invisible; con un clic, visible. */
{
  const vis = () => page.evaluate(() =>
    getComputedStyle(document.querySelector('.d-fab--config .d-fab-pop')).visibility);
  await page.hover('.d-fab--config .d-fab-btn');
  await page.waitForTimeout(450);
  if (await vis() !== 'hidden') {
    fails.push('el panel de Configuración se abre con el mouse encima. Tiene que abrirse solo ' +
      'con clic: el kit lo muestra también por `.is-hover` y por `:focus-within` ' +
      '(coto-player-chrome.css), y el curso apaga esas dos condiciones en pulido.css.');
  }
  await page.click('.d-fab--config .d-fab-btn');
  await page.waitForTimeout(350);
  if (await vis() !== 'visible') {
    fails.push('el panel de Configuración NO se abre al hacer clic: al apagar el hover se apagó ' +
      'también la única forma de abrirlo.');
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
}

/* ---- 8 · la ficha de repaso entra sin scroll -------------------
   Tres cosas que el cliente vio juntas: scroll donde no hacía falta,
   el título montado sobre el aro (consecuencia del scroll: el aro es
   absoluto y no se mueve) y el radio en porcentaje. */
{
  await irASlide(page, 'repaso-reporte');
  await page.waitForTimeout(300);
  await page.evaluate(() => document.querySelector('[data-popup-trigger="rep-como"]').click());
  await page.waitForTimeout(600);
  const m = await page.evaluate(() => {
    const c = document.querySelector('[data-popup="rep-como"] .modal-card.d-ficha');
    const bd = c.querySelector('.modal-bd');
    const tit = c.querySelector('.d-ficha-tit').getBoundingClientRect();
    const aro = c.querySelector('.d-ficha-ic').getBoundingClientRect();
    return {
      radio: parseFloat(getComputedStyle(c).borderTopLeftRadius),
      scroll: bd.scrollHeight > bd.clientHeight + 1,
      titTop: tit.top, aroBot: aro.bottom,
      cardBot: c.getBoundingClientRect().bottom, vh: window.innerHeight
    };
  });
  if (m.scroll) {
    fails.push('la ficha "¿Cómo lo generamos?" necesita scroll en una pantalla normal. El texto ' +
      'entra: lo que sobraba era el padding interno.');
  }
  if (Math.abs(m.radio - 30) > 0.6) {
    fails.push(`el radio de la ficha es ${m.radio.toFixed(1)}px y tiene que ser 30px fijos. Si da ` +
      'un número grande y variable, volvió a estar en `cqw` (o sea en porcentaje del contenedor).');
  }
  if (m.titTop < m.aroBot) {
    fails.push('el título de la ficha arranca por encima del borde inferior del aro de ícono: se ' +
      'monta sobre el círculo. El hueco del aro tiene que estar FUERA del área que scrollea.');
  }
  if (m.cardBot > m.vh + 1) {
    fails.push(`la ficha se sale ${Math.round(m.cardBot - m.vh)}px por abajo de la ventana.`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
}

/* ---- 9 · el índice pone el instructivo delante ------------------
   Cambió de forma en la sexta vuelta: el cliente pidió sacar el botón
   intermedio y que el pop-up salga solo al tocar "Siguiente". Lo que se
   verifica es la garantía, no el mecanismo: desde el índice no se puede
   pasar a la diapositiva siguiente sin que el instructivo se haya
   puesto delante. */
{
  await irASlide(page, 'indice');
  await page.waitForTimeout(350);
  const hayBoton = await page.evaluate(() =>
    !!document.querySelector('[data-slide="indice"] [data-popup-trigger]'));
  if (hayBoton) {
    fails.push('el índice volvió a tener un botón intermedio para abrir el instructivo. El cliente ' +
      'pidió que el pop-up salga solo al tocar "Siguiente".');
  }
  await page.click('[data-nav="next"]');
  await page.waitForTimeout(650);
  const tras = await page.evaluate(() => {
    const m = document.querySelector('[data-popup="instrucciones"]');
    return {
      abierto: !!m && !m.hidden && getComputedStyle(m).display !== 'none',
      slide: document.querySelector('.slide.is-active').dataset.slide
    };
  });
  if (tras.slide !== 'indice') {
    fails.push(`tocar "Siguiente" en el índice llevó directo a "${tras.slide}" sin mostrar el ` +
      'instructivo: se puede avanzar sin ver el contenido.');
  }
  if (!tras.abierto) {
    fails.push('tocar "Siguiente" en el índice no abrió el instructivo. Con `data-gate-popup` el ' +
      'motor lo abre EN VEZ de navegar y completa el avance al cerrarlo (`_pendingNav`).');
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  const despues = await page.evaluate(() => document.querySelector('.slide.is-active').dataset.slide);
  if (despues === 'indice') {
    fails.push('al cerrar el instructivo el curso no avanzó: el gate del kit dejó el avance colgado.');
  }
}

/* ---- 10 · el mini juego no se monta en pantallas bajas ---------
   Se mide en una ventana propia y baja (1152x648, la del reporte): las
   cuatro filas del panel tienen que quedar una debajo de la otra, con
   aire. El bug medía −18px entre la ilustración y la fila de estado. */
{
  const chico = await browser.newPage({ viewport: { width: 1152, height: 648 } });
  await chico.goto(url);
  await chico.waitForFunction(() => window.motor);
  await chico.evaluate(() => {
    const i = Array.from(document.querySelectorAll('.slide')).findIndex(
      (e) => e.dataset.slide === 'minijuego');
    window.motor.go(i);
  });
  await chico.waitForTimeout(500);
  await chico.evaluate(() => document.querySelector('.d-mj-fin-btn').click());
  await chico.waitForTimeout(700);
  const h = await chico.evaluate(() => {
    const q = (s) => document.querySelector(s).getBoundingClientRect();
    const top = q('.d-mj-top'), esc = q('.d-mj-escena'), grid = q('.d-mj-grid'),
          zona = q('.d-mj-zona-fb'), play = q('.d-mj-play');
    return {
      arriba: esc.top - top.bottom,
      medio: grid.top - esc.bottom,
      abajo: zona.top - grid.bottom,
      pie: play.bottom - zona.bottom
    };
  });
  await chico.close();
  Object.keys(h).forEach((k) => {
    if (h[k] < 0) {
      fails.push(`en 1152x648 el mini juego se monta: el hueco "${k}" mide ${Math.round(h[k])}px. ` +
        'El alto que le queda a la ilustración lo mide `ajustarEscena()` en curso.js — si dio ' +
        'negativo, o no corrió o alguna fila volvió a seguir el ancho de la escena.');
    }
  });
}

/* ---- 11 · las píldoras de consejos no tienen texto horneado -----
   El cliente lo vio como "texto duplicado" al animarse: la píldora HTML
   entra con un `translate` y, mientras está en vuelo, deja ver el texto
   que el PDF ya traía dibujado debajo. Se borró del arte, así que el
   chequeo es sobre la IMAGEN: dentro de la píldora no puede quedar
   nada claro sobre el amarillo. */
{
  const blancos = await page.evaluate(async () => {
    const img = new Image();
    img.src = 'img/consejos.webp';
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    const cajas = Array.from(document.querySelectorAll('[data-slide="consejos"] .d-consejo'));
    return cajas.map((el) => {
      const l = parseFloat(el.dataset.l) / 100 * c.width;
      const t = parseFloat(el.dataset.t) / 100 * c.height;
      const w = parseFloat(el.dataset.w) / 100 * c.width;
      const h = parseFloat(el.dataset.h) / 100 * c.height;
      /* Margen PROPORCIONAL, no 12px fijos: el `[data-place]` es algo más
         grande que la píldora dibujada, así que un margen chico dejaba
         entrar el fondo claro de la diapositiva por los bordes y el test
         contaba 100 píxeles "blancos" que no eran texto de nadie. Con
         9% de ancho y 22% de alto la ventana queda bien adentro del oro
         y el texto —centrado— sigue entrando entero. */
      const mx = w * 0.09, my = h * 0.22;
      const d = c.getContext('2d').getImageData(l + mx, t + my, w - mx * 2, h - my * 2).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 245 && d[i + 1] > 245 && d[i + 2] > 245) n++;
      }
      return { txt: el.textContent.trim().slice(0, 24), n };
    });
  });
  blancos.forEach((b) => {
    if (b.n > 60) {
      fails.push(`la píldora "${b.txt}" todavía tiene ${b.n} píxeles de texto blanco HORNEADO en ` +
        'img/consejos.webp. Mientras la píldora HTML entra con su animación se ven los dos textos ' +
        'a la vez, que es el "doble render" que reportó el cliente.');
    }
  });
}

/* ---- 12 · el video llena el marco dibujado --------------------
   La pantalla que dibujó el diseñador mide 845x490 del lienzo
   (x[842,1686] y[504,993]), o sea 1.7245:1, y el video real es 16:9.
   Con el `object-fit:contain` que el kit le pone a esta variante,
   quedaban 15px de franja arriba y abajo. Se chequean las dos cosas
   que tienen que valer juntas: que el hitbox siga calzando con el
   marco, y que el video Y la carátula estén los dos en `cover` — si
   uno solo lo está, el encuadre cambia al arrancar y el marco "salta"
   (la trampa de especificidad que documenta coto-media.js). */
{
  const RATIO = 845 / 490;
  for (const slide of ['video-reporte', 'video-acciones']) {
    await irASlide(page, slide);
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const w = document.querySelector('.slide.is-active [data-inline-video]');
      if (!w) return null;
      const v = w.querySelector('.d-shot-hit-video');
      const im = w.querySelector('.d-shot-hit-poster-img');
      const r = w.getBoundingClientRect();
      return {
        video: v ? getComputedStyle(v).objectFit : null,
        poster: im ? getComputedStyle(im).objectFit : null,
        ratio: r.width / r.height
      };
    });
    if (!m) { fails.push(`[${slide}] no hay ningún [data-inline-video].`); continue; }
    if (m.video !== 'cover') {
      fails.push(`[${slide}] el <video> está en object-fit:${m.video}. Con "contain" un video 16:9 ` +
        'entra entero en un marco de 1.7245:1 y deja franjas arriba y abajo — el reporte del cliente.');
    }
    if (m.poster !== 'cover') {
      fails.push(`[${slide}] la carátula está en object-fit:${m.poster} y el video en ` +
        `${m.video}: el encuadre cambia al arrancar y el marco salta.`);
    }
    if (!cerca(m.ratio, RATIO, 0.01)) {
      fails.push(`[${slide}] la caja del video es ${m.ratio.toFixed(4)}:1 y la pantalla dibujada es ` +
        `${RATIO.toFixed(4)}:1. Con "cover" eso ya no deja franjas, pero recorta de más: revisar ` +
        'las coordenadas del hitbox contra el arte.');
    }
  }
}

/* ---- 13 · los íconos de las fichas son los del PDF --------------
   El cliente los vio "deformados". No estaban estirados: eran `<svg>`
   dibujados a mano acá, o sea otro dibujo. Ahora son el recorte del
   círculo dorado de su propia página del PDF. Se chequea que sean
   imágenes, que carguen, que el archivo sea cuadrado y que el aro
   también — un aro no cuadrado sí los estiraría. */
{
  for (const [slide, ids] of [['repaso-reporte', ['rep-para-que', 'rep-como']],
                              ['repaso-acciones', ['rep-acciones', 'rep-mejorar']]]) {
    await irASlide(page, slide);
    await page.waitForTimeout(250);
    for (const id of ids) {
      await page.evaluate((x) => document.querySelector(`[data-popup-trigger="${x}"]`).click(), id);
      await page.waitForTimeout(450);
      const m = await page.evaluate((x) => {
        const aro = document.querySelector(`[data-popup="${x}"] .d-ficha-ic`);
        if (!aro) return null;
        const img = aro.querySelector('img');
        const r = aro.getBoundingClientRect();
        return {
          hayImg: !!img,
          haySvg: !!aro.querySelector('svg'),
          cargo: img ? (img.complete && img.naturalWidth > 0) : false,
          natural: img ? [img.naturalWidth, img.naturalHeight] : null,
          fit: img ? getComputedStyle(img).objectFit : null,
          aro: [r.width, r.height]
        };
      }, id);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      if (!m) { fails.push(`[${id}] la ficha no tiene .d-ficha-ic.`); continue; }
      if (!m.hayImg) {
        fails.push(`[${id}] el ícono volvió a ser un dibujo propio (${m.haySvg ? '<svg> inline' : 'nada'}) ` +
          'en vez del recorte del PDF: el cliente ya reportó que esos dibujos no son los suyos.');
        continue;
      }
      if (!m.cargo) fails.push(`[${id}] el ícono no carga (img/ic-${id}.webp).`);
      else if (m.natural[0] !== m.natural[1]) {
        fails.push(`[${id}] el archivo del ícono es ${m.natural[0]}x${m.natural[1]}: no es cuadrado, ` +
          'así que el recorte no abarca el círculo entero y el glifo no va a caer donde lo puso el diseñador.');
      }
      if (!cerca(m.aro[0], m.aro[1], 1)) {
        fails.push(`[${id}] el aro mide ${m.aro[0].toFixed(1)}x${m.aro[1].toFixed(1)}: no es cuadrado ` +
          'y el ícono sale estirado.');
      }
      if (m.fit !== 'contain') {
        fails.push(`[${id}] el ícono está en object-fit:${m.fit}; con algo distinto de "contain" ` +
          'se deforma si el aro deja de ser cuadrado.');
      }
    }
  }
}

/* ---- 14 · el mini juego aprueba con 3 de 5 ---------------------
   No lo cubre `_auto()`: sus tres modos son "todas bien", "todas mal" y
   "todas bien tras errar", y acá hace falta acertar EXACTAMENTE 3 y
   fallar 2. Se usa `_claves()`, que expone la respuesta correcta de
   cada pregunta solo para esto. */
{
  for (const [aciertos, esperado] of [[3, 'ok'], [2, 'retry']]) {
    await irASlide(page, 'minijuego');
    await page.waitForTimeout(300);
    const r = await page.evaluate(async (n) => {
      const raiz = document.querySelector('[data-slide="minijuego"]');
      const claves = window.__CURSO__.mj._claves();
      /* Partida LIMPIA, venga de donde venga: los puntos 6 y 10 de este
         mismo archivo ya jugaron, así que al entrar el juego puede
         estar en la intro, a MITAD de una partida o en una pantalla
         final. Sin reiniciar de verdad, las respuestas quedaban
         corridas una pregunta y el test medía cualquier cosa. */
      window.__CURSO__.mj._reiniciar();
      await new Promise((r) => setTimeout(r, 350));
      for (let q = 0; q < claves.length; q++) {
        const opts = Array.from(raiz.querySelectorAll('.d-mj-opt'));
        if (!opts.length) break;
        const idx = q < n ? claves[q] : (claves[q] + 1) % opts.length;
        opts[idx].click();
        await new Promise((r) => setTimeout(r, 220));
        const next = raiz.querySelector('.d-mj-next');
        if (next) { next.click(); await new Promise((r) => setTimeout(r, 260)); }
        const fin = raiz.querySelector('[data-panel="mj-fin-ok"]:not([hidden])') ||
                    raiz.querySelector('[data-panel="mj-fin-retry"]:not([hidden])');
        if (fin) break;
      }
      await new Promise((r) => setTimeout(r, 350));
      return {
        ok: !raiz.querySelector('[data-panel="mj-fin-ok"]').hidden,
        retry: !raiz.querySelector('[data-panel="mj-fin-retry"]').hidden,
        umbral: window.__CURSO__.mj._aprobacion
      };
    }, aciertos);
    const dio = r.ok ? 'ok' : r.retry ? 'retry' : 'ninguna';
    if (dio !== esperado) {
      fails.push(`con ${aciertos} de 5 el mini juego terminó en la pantalla "${dio}" y se esperaba ` +
        `"${esperado}" (umbral declarado: ${r.umbral} aciertos).`);
    }
  }
}

/* ---- 15 · el ícono del curso no es un círculo ------------------
   El asset del cliente es un cuadrado de esquinas redondeadas con arcos
   de ~9.6% del lado. Un `border-radius:50%` le recorta las esquinas. */
{
  const m = await page.evaluate(() => {
    const lg = document.querySelector('.d-brand .lg');
    if (!lg) return null;
    const r = lg.getBoundingClientRect();
    /* `borderTopLeftRadius` computado devuelve el valor TAL CUAL se
       escribió: "9.6%" si es porcentaje, "8px" si es absoluto. Hay que
       normalizar antes de comparar, o un 9.6% se lee como 9.6px. */
    const crudo = getComputedStyle(lg).borderTopLeftRadius;
    const lado = Math.min(r.width, r.height);
    const pct = crudo.endsWith('%') ? parseFloat(crudo) : (parseFloat(crudo) / lado) * 100;
    return { pct, crudo, lado };
  });
  if (!m) fails.push('no hay `.d-brand .lg` en la barra superior.');
  else {
    const pct = m.pct;
    if (pct > 25) {
      fails.push(`el recuadro del ícono tiene un radio del ${pct.toFixed(1)}% del lado (${m.crudo}): a partir de ` +
        '~25% deja de leerse como cuadrado redondeado y a 50% es un círculo, que le recorta las ' +
        'esquinas al asset del cliente.');
    }
  }
}

/* ---- 16 · las 4 opciones del mini juego miden lo mismo ---------
   El kit pone `align-items:start` en la grilla (coto-minijuego.css
   §318), así que cada tarjeta mide su propio contenido y la que
   envuelve en dos renglones queda más alta. Se mide en la pregunta 2,
   que es la del texto largo, y en una ventana donde de verdad envuelve. */
{
  const chico = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await chico.goto(url);
  await chico.waitForFunction(() => window.motor && window.__CURSO__);
  await chico.evaluate(() => {
    const i = Array.from(document.querySelectorAll('.slide')).findIndex((e) => e.dataset.slide === 'minijuego');
    window.motor.go(i);
  });
  await chico.waitForTimeout(400);
  const cajas = await chico.evaluate(async () => {
    const raiz = document.querySelector('[data-slide="minijuego"]');
    window.__CURSO__.mj._reiniciar();
    await new Promise((r) => setTimeout(r, 300));
    const claves = window.__CURSO__.mj._claves();
    raiz.querySelectorAll('.d-mj-opt')[claves[0]].click();       // pasar a la pregunta 2
    await new Promise((r) => setTimeout(r, 250));
    raiz.querySelector('.d-mj-next')?.click();
    await new Promise((r) => setTimeout(r, 400));
    return Array.from(raiz.querySelectorAll('.d-mj-opt')).map((e) => {
      const r = e.getBoundingClientRect();
      return { t: e.textContent.trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height),
               lineas: Math.round(r.height / parseFloat(getComputedStyle(e).lineHeight)) };
    });
  });
  await chico.close();
  const envuelve = cajas.some((c) => c.lineas > 1);
  const anchos = new Set(cajas.map((c) => c.w));
  const altos = new Set(cajas.map((c) => c.h));
  if (!envuelve) {
    fails.push('en 1024x768 ninguna opción envuelve en dos renglones: el test ya no mide lo que ' +
      'tenía que medir (cambió el texto o el ancho). Revisar el caso a mano.');
  }
  if (altos.size > 1) {
    fails.push(`las tarjetas de opciones tienen altos distintos (${[...altos].join(', ')}px): la que ` +
      'envuelve en dos renglones queda más alta. Falta `align-items:stretch` en la grilla — el kit ' +
      'trae `start`.');
  }
  if (anchos.size > 1) {
    fails.push(`las tarjetas de opciones tienen anchos distintos (${[...anchos].join(', ')}px).`);
  }
}

/* ---- 17 · hasta dónde se llena la pantalla ---------------------
   Dos reclamos opuestos del cliente —"en iPad los videos se ven
   recortados" y "hay márgenes arriba y abajo"— se resuelven con un
   único número: cuánto se puede recortar por costado sin tocar
   contenido. Se midió sobre las capturas recortándolas y mirándolas:
   a 5.75% y a 7.85% por lado queda todo entero; a 12.5% se cortan las
   píldoras de "Últimos consejos" y los anillos del índice y la unidad.
   De ahí sale el umbral de 1.68 de proporción de escenario.

   Se verifica de los DOS lados, porque un umbral solo se sostiene si
   falla cuando tiene que fallar:
     · por encima de 1.68 el lienzo llena la pantalla (sin franjas);
     · por debajo, vuelve el lienzo fijo 2:1 (con franjas), porque ahí
       el recorte ya se comería contenido. */
{
  const CASOS = [
    ['monitor del reporte', 1912, 1200, 'llena'],
    ['iPad apaisado', 1180, 820, 'llena'],
    ['escritorio', 1440, 900, 'llena'],
    ['tablet angosta', 1024, 768, 'franjas']
  ];
  for (const [nom, w, h, esperado] of CASOS) {
    const tab = await browser.newPage({ viewport: { width: w, height: h } });
    await tab.goto(url);
    await tab.waitForFunction(() => window.motor);
    await tab.waitForTimeout(400);
    const m = await tab.evaluate(() => {
      const st = document.querySelector('.d-stage').getBoundingClientRect();
      const sh = document.querySelector('.slide.is-active .d-shot').getBoundingClientRect();
      return { razon: st.width / st.height, franja: st.height - sh.height, ratioLienzo: sh.width / sh.height };
    });
    await tab.close();
    const llena = m.franja < 2;
    const recorte = ((2 - m.razon) / 4) * 100;
    if (esperado === 'llena' && !llena) {
      fails.push(`[${nom} ${w}x${h}] quedan ${Math.round(m.franja)}px de franja. A esa proporción ` +
        `(${m.razon.toFixed(3)}) llenar cuesta ${recorte.toFixed(1)}% de recorte por lado, que está ` +
        'dentro del margen del diseño: no corresponde dejar franja.');
    }
    if (esperado === 'franjas' && llena) {
      fails.push(`[${nom} ${w}x${h}] el lienzo llena la pantalla, pero a esa proporción ` +
        `(${m.razon.toFixed(3)}) eso cuesta ${recorte.toFixed(1)}% de recorte por lado — medido, ahí ` +
        'ya se cortan las píldoras de "Últimos consejos". Tiene que volver al lienzo fijo 2:1.');
    }
    if (!llena && !cerca(m.ratioLienzo, 2, 0.02)) {
      fails.push(`[${nom} ${w}x${h}] hay franja pero el lienzo no quedó en 2:1 sino en ` +
        `${m.ratioLienzo.toFixed(3)}: está recortando Y dejando franja a la vez.`);
    }
  }
}

/* ---- 18 · el foco no queda en un campo de texto con el dedo -----
   `Motor.showPopup()` enfoca el primer elemento enfocable del pop-up
   (motor-slides.js §929), que en el glosario es el buscador. En
   iPadOS, un campo de texto enfocado en pantalla completa dispara el
   cartel "parece que estás escribiendo". Se mide en un contexto TÁCTIL,
   que es donde el curso aplica el parche. */
{
  const ctxTouch = await browser.newContext({ viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true });
  const tap = await ctxTouch.newPage();
  await tap.goto(url);
  await tap.waitForFunction(() => window.motor);
  await tap.evaluate(() => document.querySelector('[data-popup-trigger="glosario"]').click());
  await tap.waitForTimeout(600);
  const foco = await tap.evaluate(() => {
    const el = document.activeElement;
    const tipo = (el.getAttribute && el.getAttribute('type')) || '';
    return { tag: el.tagName, tipo, dentroDelPopup: !!(el.closest && el.closest('[data-popup="glosario"]')) };
  });
  await ctxTouch.close();
  const esTexto = foco.tag === 'TEXTAREA' ||
    (foco.tag === 'INPUT' && ['', 'text', 'search', 'email', 'url', 'tel', 'number', 'password'].includes(foco.tipo));
  if (esTexto) {
    fails.push(`con el dedo, abrir el glosario deja el foco en <${foco.tag} type="${foco.tipo}">. ` +
      'En iPadOS eso dispara el cartel "parece que estás escribiendo mientras estás en pantalla ' +
      'completa", una y otra vez.');
  }
  if (!foco.dentroDelPopup) {
    fails.push('al mover el foco fuera del campo de texto se fue afuera del pop-up: el atrapa-foco ' +
      'del motor y los lectores de pantalla quedan sin destino.');
  }
}

/* ---- 19 · las capturas de video no son `lazy` ------------------
   `_initShots()` posiciona los hitboxes midiendo la captura. Si la
   imagen todavía no cargó, el botón de play queda en el ancla
   provisional y el primer toque no le pega — el cliente lo describió
   como "hay que salir y volver a entrar para que se destrabe". */
{
  const lazy = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-slide^="video-"] .d-shot-img'))
      .filter((i) => i.getAttribute('loading') === 'lazy')
      .map((i) => i.closest('[data-slide]').dataset.slide));
  if (lazy.length) {
    fails.push(`las capturas de ${lazy.join(', ')} tienen loading="lazy": al entrar por primera vez ` +
      'el botón de play puede quedar mal ubicado hasta que la imagen cargue.');
  }
}

/* ---- 20 · los pop-ups no se comen la pantalla en iPad ---------- */
{
  const tab = await browser.newPage({ viewport: { width: 820, height: 1180 } });
  await tab.goto(url);
  await tab.waitForFunction(() => window.motor);
  await tab.evaluate(() => {
    const i = Array.from(document.querySelectorAll('.slide')).findIndex((e) => e.dataset.slide === 'repaso-reporte');
    window.motor.go(i);
  });
  await tab.waitForTimeout(400);
  await tab.evaluate(() => document.querySelector('[data-popup-trigger="rep-como"]').click());
  await tab.waitForTimeout(600);
  const pct = await tab.evaluate(() => {
    const c = document.querySelector('[data-popup="rep-como"] .modal-card.d-ficha');
    return (c.getBoundingClientRect().width / window.innerWidth) * 100;
  });
  await tab.close();
  if (pct > 70) {
    fails.push(`en un iPad vertical la ficha ocupa el ${pct.toFixed(0)}% del ancho. El ancho está ` +
      'en píxeles, así que no se achica con la ventana: hay que topearlo también en `vw`.');
  }
}

/* ---- 21 · no se avanza sin aprobar el mini juego --------------- */
{
  const j = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await j.goto(url);
  await j.waitForFunction(() => window.motor && window.__CURSO__);
  await j.evaluate(() => {
    const i = Array.from(document.querySelectorAll('.slide')).findIndex((e) => e.dataset.slide === 'minijuego');
    window.motor.go(i);
  });
  await j.waitForTimeout(400);
  const gate = () => j.evaluate(() => window.motor.canAdvance(document.querySelector('[data-slide="minijuego"]')));
  if (await gate()) fails.push('el mini juego deja avanzar sin haberlo jugado.');
  await j.evaluate(() => window.__CURSO__.mj._auto('pesimo'));
  await j.waitForTimeout(700);
  if (await gate()) {
    fails.push('el mini juego deja avanzar después de TERMINARLO perdiendo (0 de 5). El gate tiene ' +
      'que pedir aprobarlo, no solo llegar al final.');
  }
  await j.evaluate(() => window.__CURSO__.mj._reiniciar());
  await j.waitForTimeout(350);
  await j.evaluate(() => window.__CURSO__.mj._auto('minimo'));
  await j.waitForTimeout(700);
  if (!await gate()) fails.push('tras APROBAR el mini juego (3 de 5) el gate sigue cerrado.');
  await j.evaluate(() => window.__CURSO__.mj._reiniciar());
  await j.waitForTimeout(350);
  await j.evaluate(() => window.__CURSO__.mj._auto('pesimo'));
  await j.waitForTimeout(700);
  if (!await gate()) {
    fails.push('volver a jugar y perder volvió a cerrar el gate: aprobar una vez tiene que quedar ' +
      'aprobado.');
  }
  await j.close();
}

/* ---- 22 · la interfaz escala en pantallas grandes --------------
   Dos cosas que van juntas y que se rompieron una a la otra mientras se
   arreglaba esto, así que las dos quedan medidas:

   · la raíz tiene que crecer por encima de 1700px (el kit escribe todo
     el chrome en `rem` pero nunca define el tamaño de raíz, así que la
     interfaz quedaba de 16px en cualquier monitor), y por debajo tiene
     que seguir exactamente en 16 para no mover nada de lo ya probado;
   · los botones CON etiqueta tienen que seguir siendo más anchos que
     altos. `.d-iconbtn--labeled` es una sola clase, igual de específica
     que `.d-iconbtn`: una regla de ancho sobre `.d-iconbtn` en el CSS
     del curso —que carga último— le gana al `width:auto` del kit y los
     aplasta a una caja cuadrada, con los rótulos encimados. Pasó de
     verdad y se vio en el render. */
{
  for (const [nom, w, h, raizEsperada] of [['grande', 1920, 1080, 'mayor'], ['normal', 1440, 900, 'igual']]) {
    const g = await browser.newPage({ viewport: { width: w, height: h } });
    await g.goto(url);
    await g.waitForFunction(() => window.motor);
    await g.waitForTimeout(500);
    const m = await g.evaluate(() => {
      const et = document.querySelector('.d-iconbtn--labeled');
      const r = et ? et.getBoundingClientRect() : null;
      const st = document.querySelector('.d-stage').getBoundingClientRect();
      const sh = document.querySelector('.slide.is-active .d-shot').getBoundingClientRect();
      return {
        raiz: parseFloat(getComputedStyle(document.documentElement).fontSize),
        etiqueta: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
        lienzo: { w: sh.width, h: sh.height },
        escenario: { w: st.width, h: st.height }
      };
    });
    await g.close();
    if (raizEsperada === 'mayor' && !(m.raiz > 16.5)) {
      fails.push(`en ${w}x${h} la tipografía de raíz sigue en ${m.raiz}px: la interfaz no escala y ` +
        'en un monitor grande queda proporcionalmente más chica que en un notebook.');
    }
    if (raizEsperada === 'igual' && !cerca(m.raiz, 16, 0.01)) {
      fails.push(`en ${w}x${h} la raíz quedó en ${m.raiz}px y tiene que ser 16: el escalado sólo ` +
        'arranca por encima de 1700px, para no mover nada de lo ya verificado.');
    }
    if (m.etiqueta && m.etiqueta.w <= m.etiqueta.h + 4) {
      fails.push(`en ${w}x${h} los botones con etiqueta quedaron en ${m.etiqueta.w}x${m.etiqueta.h}: ` +
        'se aplastaron a una caja cuadrada y los rótulos se enciman. Una regla de ancho sobre ' +
        '`.d-iconbtn` le gana al `width:auto` de `.d-iconbtn--labeled` — misma especificidad, y el ' +
        'CSS del curso carga después.');
    }
    /* El lienzo es 2:1 fijo, así que llena UNA de las dos dimensiones —
       la que limite— y deja franja en la otra. Lo que no puede pasar es
       que le sobre lugar en las dos: eso sí sería un lienzo de tamaño
       fijo perdido en el medio, que es lo que el cliente creyó ver. */
    const llenaAncho = m.lienzo.w >= m.escenario.w - 2;
    const llenaAlto = m.lienzo.h >= m.escenario.h - 2;
    if (!llenaAncho && !llenaAlto) {
      fails.push(`en ${w}x${h} el lienzo mide ${Math.round(m.lienzo.w)}x${Math.round(m.lienzo.h)} ` +
        `dentro de un escenario de ${Math.round(m.escenario.w)}x${Math.round(m.escenario.h)}: le ` +
        'sobra lugar en los dos ejes, o sea que no está escalando con la ventana.');
    }
  }
}

/* ---- 23 · la portada insiste con su video ----------------------
   El cliente: "el video de portada no arranca; sí arranca si avanzo a
   la siguiente y vuelvo". Eso es exactamente la firma de un `play()`
   rechazado UNA vez: al entrar por primera vez el navegador todavía no
   contó ninguna interacción del alumno y bloquea el autoplay; al
   volver, ya hubo clic en "Siguiente" y el mismo `play()` pasa.

   Se prueba simulando ESE navegador y no el real, a propósito: los
   cuatro `.mp4` del paquete son marcadores de 0 bytes hasta que el
   cliente entregue los videos, así que un `<video>` real acá termina en
   `error` y no hay nada que reproducir. Lo que se simula es únicamente
   el rechazo del primer `play()` y un medio sano; todo lo demás es el
   código del curso.

   El error simulado es `AbortError` y NO `NotAllowedError`, y la
   diferencia es todo el test: el `NotAllowedError` (el de "falta un
   gesto") el kit YA lo maneja —reintenta mudo, `coto-media.js`— así que
   simulando ese, el test pasa aunque se saque el arreglo del curso
   (pasó: se escribió primero así y no detectaba nada). El que el kit da
   por perdido es cualquier OTRO error, y el del arranque es
   `AbortError` ("interrupted by a new load request"): el `<video>`
   todavía está resolviendo su fuente cuando `initBgVideos()` le pide
   play. Si se saca el reintento del curso, esto queda en 1 intento y el
   video no arranca. */
{
  const v = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await v.addInitScript(() => {
    window.__plays = 0;
    let pausado = true;
    Object.defineProperty(HTMLMediaElement.prototype, 'error', { get: () => null, configurable: true });
    Object.defineProperty(HTMLMediaElement.prototype, 'paused', { get: () => pausado, configurable: true });
    HTMLMediaElement.prototype.play = function () {
      window.__plays++;
      if (window.__plays === 1) {
        const e = new Error('interrupted by a new load request');
        e.name = 'AbortError';
        return Promise.reject(e);
      }
      pausado = false;
      return Promise.resolve();
    };
  });
  await v.goto(url);
  await v.waitForFunction(() => window.motor);
  await v.waitForTimeout(2200);
  const r = await v.evaluate(() => ({
    intentos: window.__plays,
    andando: !document.querySelector('[data-slide="portada"] video.d-shot-video').paused
  }));
  await v.close();
  if (r.intentos < 2) {
    fails.push(`el video de la portada intentó reproducirse ${r.intentos} vez/veces y se rindió al ` +
      'primer rechazo. El kit solo reintenta ante `NotAllowedError`; con cualquier otro error ' +
      'esconde el botón de gesto y no vuelve a intentar, así que el video recién arranca cuando el ' +
      'alumno avanza y vuelve — que es exactamente lo que reportó el cliente.');
  }
  if (!r.andando) {
    fails.push('tras el reintento el video de la portada sigue pausado: el reintento corre pero no ' +
      'llega a poner el video a andar.');
  }
}

/* ---- 24 · los objetivos no se locutan "A, B, C" ---------------- */
{
  await irASlide(page, 'introduccion');
  await page.waitForTimeout(300);
  const dicho = await page.evaluate(() => {
    const s = document.querySelector('[data-slide="introduccion"]');
    return (window.Narrador.textOf(s) || '').trim();
  });
  if (/\b(A|B|C)\s*[.·]/.test(dicho)) {
    fails.push(`la locución de la introducción dice "${dicho.slice(0, 90)}…": todavía enumera las ` +
      'letras. Las letras son un recurso GRÁFICO del diseñador (están horneadas en la captura); ' +
      'leerlas en voz alta no agrega nada y corta la frase.');
  }
  for (const frase of ['Detectar productos', 'Identificar problemas', 'Tomar acciones']) {
    if (!dicho.includes(frase)) {
      fails.push(`la locución de la introducción ya no dice "${frase}": sacar las letras no puede ` +
        'llevarse puesto el texto del objetivo.');
    }
  }
}

/* ---- 25 · la franja continúa el arte --------------------------
   Reporte del cliente, con captura del LMS: "una línea decorativa
   curva se ve interrumpida por un bloque blanco". En 1276x640 el
   escenario queda en 2.45:1, más ancho que el techo de 2.2 del kit, así
   que el lienzo vuelve al 2:1 fijo y sobran 118px por costado.

   No alcanza con mirar el CSS: la primera versión de este arreglo
   (misma imagen, `cover` + `blur`) pasaba cualquier chequeo de "la
   franja tiene el color del arte" y la línea IGUAL moría en la costura.
   Así que se mide sobre los píxeles: se busca en la columna de adentro
   del lienzo la fila con más tinta y se compara ESE color con el de la
   mitad de la franja. Si la línea sigue, son el mismo color. */
{
  const f = await browser.newPage({ viewport: { width: 1276, height: 640 } });
  await f.goto(url);
  await f.waitForFunction(() => window.motor);
  await f.waitForTimeout(800);
  const geo = await f.evaluate(() => {
    const st = document.querySelector('.d-stage').getBoundingClientRect();
    const sh = document.querySelector('.slide.is-active [data-shot]').getBoundingClientRect();
    const cs = getComputedStyle(document.querySelector('.d-stage'), '::before');
    return {
      stX: st.x, stY: st.y, stW: st.width, stH: st.height, shX: sh.x, shW: sh.width,
      borde: parseFloat(cs.borderLeftWidth) || 0,
      fuente: cs.borderImageSource || '',
      corte: cs.borderImageSlice || ''
    };
  });
  const barra = Math.round(geo.shX - geo.stX);
  if (barra < 40) {
    fails.push(`en 1276x640 el lienzo dejó ${barra}px de franja: se esperaban ~118 y sin franja este ` +
      'test no prueba nada. Cambió el umbral del lienzo fijo y hay que rehacer la medición.');
  } else {
    if (Math.abs(geo.borde - barra) > 1.5) {
      fails.push(`la franja mide ${barra}px pero el borde de \`.d-stage::before\` quedó en ` +
        `${geo.borde}px. El grosor lo mide \`curso.js\` (\`--franja-x\`) contra el render: si no ` +
        'coinciden, el estirado del borde no cae donde está la franja.');
    }
    if (!/portada\.webp/.test(geo.fuente)) {
      fails.push(`la franja no está tomando la captura de la diapositiva activa (\`${geo.fuente.slice(0, 60)}\`).`);
    }
    if (!/\bfill\b/.test(geo.corte)) {
      fails.push('a `border-image-slice` le falta `fill`: sin eso el hueco central queda vacío y ' +
        'aparece un salto de color justo en la costura.');
    }
    /* Los píxeles. Se recorre la COLUMNA DE BORDE del lienzo (la
       primera columna de arte, nítida) y, en cada fila donde hay tinta
       de verdad, se le pide a la franja el mismo color. Si la línea
       sigue, coinciden; si la franja es un bloque —o un desenfoque, que
       es lo mismo a estos efectos— no.

       Muestrear unos píxeles ADENTRO del lienzo no sirve y ya dio un
       falso rojo: el arte se curva rápido (la línea entra horizontal y
       arranca el codo enseguida), así que a 3px de la costura ya se
       está comparando otra altura de la misma curva.

       Y el umbral de "coincide" se mide en varias filas y no en una: la
       versión desenfocada de este arreglo pasaba un chequeo de una sola
       fila por casualidad (la fila de más tinta de una franja borrosa
       es pálida, y contra un arte pálido daba parecido). */
    const png = PNG.sync.read(await f.screenshot());
    const px = (x, y) => {
      const i = (png.width * y + x) << 2;
      return [png.data[i], png.data[i + 1], png.data[i + 2]];
    };
    const tinta = (c) => Math.abs(255 - c[0]) + Math.abs(255 - c[1]) + Math.abs(255 - c[2]);
    const dif = (a, b) => Math.max(...[0, 1, 2].map((k) => Math.abs(a[k] - b[k])));
    const costura = Math.round(geo.shX);
    const xJunto = costura - 2;             // franja, pegada a la costura
    const xLejos = Math.round(geo.stX) + 4; // franja, contra el borde de la ventana
    const y0 = Math.round(geo.stY) + 10;
    const y1 = Math.round(geo.stY + geo.stH) - 10;
    const filas = [];
    for (let y = y0; y < y1; y++) {
      if (tinta(px(costura, y)) > 90) filas.push(y);
    }
    if (filas.length < 4) {
      fails.push(`la columna de borde del lienzo tiene ${filas.length} filas con tinta en la ` +
        'portada: sin líneas que lleguen al borde este test no comprueba nada, hay que elegir otra ' +
        'diapositiva.');
    } else {
      /* Lo que se compara es la TINTA, no el color exacto. La franja
         estira la columna 0 de la imagen y el lienzo muestra la columna
         que cae en x=118 — no son exactamente la misma columna fuente,
         así que en el borde antialiaseado de un trazo los dos degradés
         difieren bastante en rgb aunque la línea sea la misma. Lo que
         no puede pasar es que donde el arte tiene un trazo la franja
         esté vacía: eso es la línea cortada. ±1 fila, por el mismo
         motivo del antialias. */
      const enFranja = (y) => Math.max(
        tinta(px(xJunto, y - 1)), tinta(px(xJunto, y)), tinta(px(xJunto, y + 1))
      );
      const cortadas = filas.filter((y) => enFranja(y) < tinta(px(costura, y)) * 0.5);
      if (cortadas.length > filas.length * 0.2) {
        const y = cortadas[0];
        fails.push(`${cortadas.length} de ${filas.length} filas con tinta se cortan en la costura ` +
          `(en y=${y} el arte es rgb(${px(costura, y)}) y la franja rgb(${px(xJunto, y)})). La ` +
          'franja tiene que ESTIRAR la columna de borde de la imagen: ni taparla con un color, ni ' +
          'desenfocarla —el desenfoque disuelve la línea igual que el bloque.');
      }
      const apagadas = filas.filter((y) => dif(px(xJunto, y), px(xLejos, y)) > 12);
      if (apagadas.length) {
        const y = apagadas[0];
        fails.push(`la línea no llega al borde de la ventana: a y=${y} la franja vale ` +
          `rgb(${px(xJunto, y)}) pegada al lienzo y rgb(${px(xLejos, y)}) contra el borde. Estirar ` +
          'una columna da color constante en horizontal; cualquier otra cosa, no.');
      }
    }
  }
  await f.close();
}

/* ---- 26 · "los 7 conceptos" del resumen son 7 ------------------ */
{
  await irASlide(page, 'cierre');
  await page.waitForTimeout(400);
  /* Se cuenta por el TÍTULO visible y no por un selector propio: la
     afirmación que el cliente leyó es la del encabezado, y el resumen
     tiene otras columnas (pasos, consejos) que también son `li`. */
  const n = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.d-cierre-recap-col'))
      .filter((c) => /^Los 7 conceptos/.test((c.querySelector('h4').textContent || '').trim()))
      .reduce((t, c) => t + c.querySelectorAll('li').length, 0));
  if (n !== 7) {
    fails.push(`el resumen anuncia "los 7 conceptos" y lista ${n}. PLU y EAN son los dos códigos ` +
      'del mismo producto y van en un solo ítem — es lo que dice el curso en "Algunos conceptos ' +
      'importantes", donde la píldora también es una sola ("PLU/EAN").');
  }
}

/* ---- 27 · las fichas entran sin scroll en un iPad acostado -----
   El punto 8 ya mide esto en una ventana de escritorio. Lo que reportó
   el cliente esta vuelta es otro caso: el iPad ACOSTADO, donde la
   ventana es ancha pero BAJA (1180x820 deja ~578px de alto útil para la
   tarjeta) — y ahí "¿Cómo mejorar la venta?", que es la más larga,
   pedía 610px. Se prueban las cuatro fichas y las dos orientaciones. */
{
  const FICHAS = [
    ['repaso-reporte', 'rep-para-que'], ['repaso-reporte', 'rep-como'],
    ['repaso-acciones', 'rep-acciones'], ['repaso-acciones', 'rep-mejorar']
  ];
  for (const [w, h, nom] of [[1180, 820, 'iPad acostado'], [820, 1180, 'iPad parado'], [1024, 1366, 'iPad Pro parado']]) {
    const t = await browser.newPage({ viewport: { width: w, height: h } });
    await t.goto(url);
    await t.waitForFunction(() => window.motor);
    for (const [slide, popup] of FICHAS) {
      await t.evaluate((s) => {
        const i = Array.from(document.querySelectorAll('.slide')).findIndex((e) => e.dataset.slide === s);
        window.motor.go(i, true);
      }, slide);
      await t.waitForTimeout(350);
      await t.evaluate((k) => document.querySelector(`[data-popup-trigger="${k}"]`).click(), popup);
      await t.waitForTimeout(500);
      const m = await t.evaluate((k) => {
        const c = document.querySelector(`[data-popup="${k}"] .modal-card.d-ficha`);
        const bd = c.querySelector('.modal-bd');
        const r = c.getBoundingClientRect();
        return { falta: bd.scrollHeight - bd.clientHeight, abajo: r.bottom - window.innerHeight };
      }, popup);
      if (m.falta > 1) {
        fails.push(`en ${nom} (${w}x${h}) la ficha "${popup}" necesita ${Math.round(m.falta)}px de ` +
          'scroll. El contenido es corto: lo que sobra es tipografía y padding para ese alto de ventana.');
      }
      if (m.abajo > 1) {
        fails.push(`en ${nom} (${w}x${h}) la ficha "${popup}" se sale ${Math.round(m.abajo)}px por ` +
          'abajo de la ventana.');
      }
      await t.keyboard.press('Escape');
      await t.waitForTimeout(250);
    }
    await t.close();
  }
}

/* ---- 28 · velocidad de locución por default en táctil ----------
   Pedido del cliente: en iPad la locución se escucha demasiado rápida;
   que arranque en 0.85x. Se toca SOLO el default y solo si el alumno
   todavía no eligió velocidad — el kit guarda la elección en
   `localStorage` bajo `coto-diapos-rate` y esa elección manda siempre.
   El caso "ya eligió" se prueba explícitamente porque es el que un
   default mal puesto pisa sin que se note. */
{
  const dedo = await browser.newContext({
    viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true
  });
  const td = await dedo.newPage();
  await td.goto(url);
  await td.waitForFunction(() => window.Narrador && window.motor);
  await td.waitForTimeout(400);
  const rDedo = await td.evaluate(() => window.Narrador.getRateFactor());
  if (Math.abs(rDedo - 0.85) > 0.001) {
    fails.push(`en un dispositivo táctil la locución arranca en ${rDedo}x y tiene que arrancar en 0.85x.`);
  }
  /* Ya eligió: se escribe la preferencia y se recarga. */
  await td.evaluate(() => window.localStorage.setItem('coto-diapos-rate', '1.2'));
  await td.reload();
  await td.waitForFunction(() => window.Narrador && window.motor);
  await td.waitForTimeout(400);
  const rElegido = await td.evaluate(() => window.Narrador.getRateFactor());
  if (Math.abs(rElegido - 1.2) > 0.001) {
    fails.push(`el alumno había elegido 1.2x y al reabrir el curso quedó en ${rElegido}x: el default ` +
      'táctil está pisando la elección guardada en vez de ceder ante ella.');
  }
  await dedo.close();

  const raton = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await raton.goto(url);
  await raton.waitForFunction(() => window.Narrador && window.motor);
  await raton.waitForTimeout(400);
  const rRaton = await raton.evaluate(() => window.Narrador.getRateFactor());
  await raton.close();
  if (Math.abs(rRaton - 1) > 0.001) {
    fails.push(`en escritorio la locución arranca en ${rRaton}x: el ajuste es para el dedo (puntero ` +
      'grueso), no para todo el mundo.');
  }
}

if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
report('reporte-cliente', fails);
await browser.close();
