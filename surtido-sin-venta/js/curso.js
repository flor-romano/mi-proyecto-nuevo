/* ============================================================
   curso.js — "Surtido sin venta" (Área Salón · COTO)
   ------------------------------------------------------------
   El ÚNICO archivo que se escribe entero. Todo lo demás (motor,
   narrador, player, media, ui, piezas, logros, cierre) vive en los
   módulos del kit y no se toca: la pregunta de CLAUDE.md §1 es
   siempre "¿esto lee algo de ESTE curso?". Si la respuesta es no, va
   al kit — y el fix se relaya, nunca se edita `kit-base/` desde acá
   (§0.1).

   Lo que hay acá, en orden:
     1. vocabulario propio para la locución
     2. contenido: textos de los 7 conceptos y banco del mini juego
     3. tabla de puntos + umbrales de medalla (derivados, no elegidos)
     4. catálogo de logros
     5. persistencia (suspend_data)
     6. boot(): cableado de los módulos del kit
   ============================================================ */
(function () {
  'use strict';

  var COURSE_SLUG = 'surtido-sin-venta';
  var COURSE_NAME = 'Surtido sin venta';

  /* ---------- 1 · Vocabulario propio para la locución ----------
     El diccionario base del kit ya trae la tabla oficial del Manual de
     Contenido (PLU, ticket, online, y el deletreo de códigos de 5 a 8
     dígitos — o sea que "574027" ya se lee dígito por dígito). Acá van
     solo las siglas de ESTE curso. */
  if (window.Narrador && Narrador.addFixes) {
    Narrador.addFixes([
      [/\bEAN\b/g, 'eán'],
      [/\bGESCOM\b/gi, 'guescóm'],
      [/(\d)\s*cc\b/gi, '$1 centímetros cúbicos'],
      /* "A (Alta)" / "B (Media)" / "C (Baja)": sin esto el paréntesis
         se lee como una pausa seca en medio de la clasificación. */
      [/\b([ABC])\s*\(([^)]+)\)/g, '$1, $2,']
    ]);
  }
  /* El minijuego arma sus opciones con `innerHTML`, así que sus botones
     tienen que entrar en el selector que mira `Narrador.textOf()` — si
     no, la diapositiva del juego narra la consigna y se queda muda en
     las cuatro respuestas (CLAUDE.md §1, narración de contenido con
     render propio en JS). */
  if (window.Narrador && Narrador.addTextSel) {
    Narrador.addTextSel('.d-mj-opt');
    /* El pop-up "Cómo recorrer el curso" que genera el kit narraba
       VACÍO: su tarjeta usa `<h3>` + `<b>`/`<span>` dentro de
       `.d-instr-card`, y ninguno entra en el selector de
       `Narrador.textOf()` (que sí contempla `.d-instr-item`, la clase
       del acordeón de Ayuda — otra pieza). Verificado leyendo la
       salida real de `textOf()` sobre ese pop-up: cadena vacía.
       Es del kit y está relayado; mientras tanto se suma acá. */
    Narrador.addTextSel('.d-instr-modal h3, .d-instr-card > div > b, .d-instr-card > div > span');
  }

  /* ---------- 2 · Contenido ---------- */

  /* Los 7 conceptos. El ÍNDICE coincide con `data-shot-swap-go` del
     marcado: 0 es la pantalla sin concepto elegido (la que se ve al
     entrar) y por eso no tiene texto propio. */
  var CONCEPTOS = [
    null,
    { id: 'plu', nom: 'PLU y EAN',
      txt: 'PLU y EAN: los dos códigos que identifican a cada producto. ' +
           'PLU, código interno: es el número que Coto le asigna a cada producto dentro de su sistema, no aparece en el envase. ' +
           'EAN, código de barras: es el número largo que está debajo del código de barras en el envase, es el mismo en todos los supermercados y lo pone el fabricante.' },
    { id: 'stock', nom: 'Stock',
      txt: 'Stock: es la cantidad de unidades que tenemos de un producto, tanto en góndola como en depósito. ' +
           'Por ejemplo: si hay 6 en góndola y 10 en depósito, el stock total es 16.' },
    { id: 'falso', nom: 'Falso stock',
      txt: 'Falso stock: cuando el sistema indica que tenemos una cierta cantidad de stock, pero en la góndola y el depósito hay menos unidades de las que figura. ' +
           'Por ejemplo: el sistema dice 20 unidades de gaseosa, pero al contar físicamente solo hay 12. Esas 8 unidades de diferencia son el falso stock, un error que hay que analizar y corregir.' },
    { id: 'rotacion', nom: 'Rotación',
      txt: 'Rotación: es qué tan rápido se vende un producto en la clase determinada. Según cuánto se vende, cada producto tiene una rotación. ' +
           'A, alta: se vende mucho y seguido. B, media: se vende con frecuencia moderada. C, baja: se vende poco o muy lentamente.' },
    { id: 'exhibicion', nom: 'Exhibición',
      txt: 'Exhibición: es cómo está presentado el producto en el salón de ventas, si está bien ubicado, a la altura de los ojos, con el frente visible y con precio. ' +
           'Una buena exhibición hace que el producto se vea y se venda. Una mala exhibición, con el producto escondido, dado vuelta o sin precio, puede hacer que no se venda aunque haya stock.' },
    { id: 'surtido', nom: 'Surtido',
      txt: 'Surtido: es la totalidad de los productos que tenemos disponibles para vender en los diferentes sectores de una sucursal.' },
    { id: 'gescom', nom: 'GESCOM',
      txt: 'GESCOM, Gestión Comercial: es el sistema interno que usamos en Coto para consultar reportes y ver el stock de cada producto, entre otras cosas. ' +
           'En este caso vas a usarlo para armar y leer el reporte de surtido sin venta.' }
  ];

  /* Banco del mini juego — las 5 pantallas del PDF (páginas 23 a 27).
     `ok` es el índice de la opción correcta; el orden de las opciones
     es el del arte, no se baraja: la escena está horneada en la imagen
     y el alumno la lee de izquierda a derecha igual que en el papel. */
  var MJ = [
    { id: 'q1', escena: 'img/mj-escena-1.webp',
      consigna: 'Es el número que Coto le asigna a cada producto dentro de su sistema. No aparece en el envase. ¿De qué concepto hablamos?',
      opts: ['PLU', 'Stock', 'EAN', 'Falso stock'], ok: 0,
      why: 'El PLU es el código interno de Coto. El EAN es el de barras del envase, que pone el fabricante.',
      mal: 'Ojo: ese dato sí aparece en el envase o mide otra cosa. El código interno del sistema es el PLU.' },
    { id: 'q2', escena: 'img/mj-escena-2.webp',
      consigna: 'Es un reporte que, según la cantidad de días que elijas, muestra los productos que no se vendieron en ese tiempo. ¿Qué control es?',
      opts: ['Control de rotación', 'Control de surtido sin venta', 'Control de exhibición', 'Control de GESCOM'], ok: 1,
      why: 'Es el control de surtido sin venta: lista los productos sin movimiento en la cantidad de días que elijas.',
      mal: 'Ese control mira otra cosa. El que lista los productos sin movimiento por cantidad de días es el de surtido sin venta.' },
    { id: 'q3', escena: 'img/mj-escena-3.webp',
      consigna: 'Para mejorar la venta de un producto nuestro sector puede, entre otras opciones, hacer una de estas cosas. ¿Cuál?',
      opts: ['Ponerlo cerca de línea de cajas', 'Pedir más espacio en góndola', 'Ponerle un cartel de novedad', 'Regalar una muestra'], ok: 1,
      why: 'Nuestro sector puede pedir un cambio de lugar, más espacio en góndola, una oferta, o analizar si conviene tenerlo en el surtido.',
      mal: 'Esa acción no depende de nuestro sector. Lo que sí podemos pedir es un cambio de lugar, más espacio en góndola o una oferta.' },
    { id: 'q4', escena: 'img/mj-escena-4.webp',
      consigna: 'La rotación es qué tan rápido se vende un producto en la clase determinada. A (Alta): se vende mucho y seguido. B (Media): se vende con frecuencia moderada. ¿Y la C?',
      opts: ['C (Baja): se venden pocos', 'C (Baja): no se vende', 'C (Baja): no hay stock', 'C (Baja): se vende poco o lento'], ok: 3,
      why: 'La rotación C es baja: el producto se vende poco o muy lentamente. Que rote poco no quiere decir que no se venda ni que falte stock.',
      mal: 'Rotación baja no es lo mismo que "no se vende" ni que "no hay stock": es que se vende poco o muy lentamente.' },
    { id: 'q5', escena: 'img/mj-escena-5.webp',
      consigna: 'Es el número largo que está debajo del código de barras en el envase. Es el mismo en todos los supermercados y lo pone el fabricante. ¿Qué es?',
      opts: ['Surtido', 'Sobre stock', 'EAN', 'PLU'], ok: 2,
      why: 'El EAN es el código de barras del envase. Es el mismo en todos los supermercados porque lo pone el fabricante.',
      mal: 'El código del envase, igual en todos los supermercados, es el EAN. El PLU es el interno de Coto.' }
  ];

  /* ---------- 3 · Puntaje ----------
     Diseñado contra las 3 patologías de §7.14 (el puntaje no puede
     premiar insistencia en vez de precisión):
       · lo que el gate YA obliga a hacer pesa poco (74 de 199);
       · NO hay premio binario por "completar el mini juego" — terminarlo
         es requisito de avance, no puntaje;
       · la parte que sí evalúa (el mini juego) pesa 125 de 199, y lo
         que decide cuánto paga cada pregunta es haberla acertado SIN
         haber errado antes: reintentar recupera 10, nunca los 25.
     Los tres umbrales NO se eligen: salen del máximo medido con un
     recorrido instrumentado (`tools/tests/puntaje-curso.mjs`), y se
     verifican ahí — la tabla es una intención, el contador es el hecho
     (§7.3 punto 19). */
  var PTS = {
    concepto: 6,     // x7  = 42   (explorar: no se toca, es el aprendizaje)
    ficha: 8,        // x4  = 32
    video: 10,       // x2  = 20   ← HOY no se puede ganar: los .mp4 son placeholder
    mjBien: 25,      // x5  = 125  (acierto sin haber errado antes esa pregunta)
    mjBienTrasError: 10
  };
  /* Máximo alcanzable HOY (sin los videos reales) = 42 + 32 + 125 = 199.
     Con los videos cargados pasa a 219; los umbrales siguen valiendo.
     Piso garantizado por el gate = 42 + 32 = 74 (terminar el mini juego
     no paga por sí solo), así que el bronce arranca ahí: quien termina
     el curso nunca se queda sin medalla (§6.10.6). */
  var MAX_SIN_VIDEOS = 199;
  var PISO_GATE = 74;
  var NIVELES = [
    { id: 'bronce', desde: PISO_GATE, nombre: 'bronce', icono: '🥉' },
    { id: 'plata', desde: 127, nombre: 'plata', icono: '🥈' },
    { id: 'oro', desde: 180, nombre: 'oro', icono: '🥇' }
  ];

  /* Reglas del mini juego, en sus propios puntos (los de la tarjeta
     amarilla del arte). Salen de los números que el PDF ya muestra:
     1000 de arranque, 2350 con 5 de 5 → +270 por acierto; y 1150 con
     1 acierto y 3 vidas perdidas → −40 por error. */
  var MJ_INICIAL = 1000, MJ_ACIERTO = 270, MJ_ERROR = 40, MJ_VIDAS = 3;

  /* ---------- 4 · Catálogo de logros ----------
     Ninguno depende de un video: con los .mp4 en placeholder serían
     logros imposibles de obtener (§3.9). */
  var BADGES = [
    { id: 'conceptos', nom: 'Explorador', ic: '🔎',
      txt: 'Abriste los 7 conceptos del curso.',
      pista: 'Abrí los 7 conceptos de "Algunos conceptos importantes".' },
    { id: 'reporte', nom: 'Sabés armarlo', ic: '📋',
      txt: 'Repasaste para qué sirve el reporte y cómo se genera.',
      pista: 'Abrí las 2 fichas de "Lo que vimos en este video" del primer video.' },
    { id: 'acciones', nom: 'Manos a la obra', ic: '🛠️',
      txt: 'Repasaste qué acciones tomar y cómo mejorar la venta.',
      pista: 'Abrí las 2 fichas de "Lo que vimos en este video" del segundo video.' },
    { id: 'juego', nom: 'Jugador', ic: '🎮',
      txt: 'Terminaste el mini juego.',
      pista: 'Terminá el mini juego, con o sin errores.' },
    { id: 'preciso', nom: 'Sin errores', ic: '🎯',
      txt: 'Acertaste los 5 conceptos del mini juego sin equivocarte ni una vez.',
      pista: 'Acertá los 5 conceptos del mini juego sin errar ninguno.' },
    { id: 'curso', nom: 'Curso completo', ic: '🏅',
      txt: 'Completaste "Surtido sin venta".',
      pista: 'Llegá al final del curso.' }
  ];
  var Logros = null;   // lo crea boot(), cuando el DOM ya existe

  /* ---------- 5 · Estado y persistencia ----------
     Claves cortas: `suspend_data` tiene 4096 caracteres contados en
     SCORM 1.2 y `saveState()` rechaza en silencio si se pasa.
       vs = diapositivas vistas · cs = conceptos abiertos
       pg = pop-ups abiertos    · vg = videos vistos
       mo = preguntas del juego ya acertadas (guard de §6.53:
            sin esto, reintentar el juego pagaría de nuevo = puntaje
            infinito en una actividad reintentable)
       me = preguntas en las que ya se erró alguna vez (es lo que hace
            que reintentar recupere 10 y no 25)
       mf = el juego se terminó alguna vez (gate de avance) */
  var estado = { vistas: {}, conceptos: {}, popups: {}, videos: {},
                 mjOk: {}, mjErr: {}, mjFin: false };

  function persistir() {
    if (!window.SCORM || !Logros) return;
    SCORM.saveState(Object.assign({
      vs: Object.keys(estado.vistas),
      cs: Object.keys(estado.conceptos),
      pg: Object.keys(estado.popups),
      vg: Object.keys(estado.videos),
      mo: Object.keys(estado.mjOk),
      me: Object.keys(estado.mjErr),
      mf: estado.mjFin ? 1 : 0
    }, Logros.serialize()));
  }
  function restaurar() {
    if (!window.SCORM) return;
    var s = SCORM.loadState();
    if (!s) return;
    (s.vs || []).forEach(function (id) { estado.vistas[id] = true; });
    (s.cs || []).forEach(function (id) { estado.conceptos[id] = true; });
    (s.pg || []).forEach(function (id) { estado.popups[id] = true; });
    (s.vg || []).forEach(function (id) { estado.videos[id] = true; });
    (s.mo || []).forEach(function (id) { estado.mjOk[id] = true; });
    (s.me || []).forEach(function (id) { estado.mjErr[id] = true; });
    estado.mjFin = !!s.mf;
    if (Logros) Logros.restore(s);
  }

  function contar(mapa) { return Object.keys(mapa).length; }

  /* ---------- 6 · Arranque ---------- */
  function boot() {
    if (window.SCORM) SCORM.init();

    /* Tracking mínimo del LMS — las dos líneas que exige
       `scorm-tracking.mjs`. Se registran ANTES de `new Motor()` porque
       el constructor emite su primer `slidechange` adentro. */
    document.addEventListener('slidechange', function (e) {
      if (window.SCORM) SCORM.setLocation(e.detail.id);
    });
    document.addEventListener('courseend', function () {
      if (window.SCORM) SCORM.markCompleted();
    });

    window.motor = new Motor(document);

    Logros = initLogros({ badges: BADGES, onChange: persistir });
    restaurar();

    var Player = initPlayer({
      /* `[data-narrate-only]` acota la locución a una parte de la
         diapositiva, igual que ya hace `initPopupNarration()` con los
         pop-ups (coto-ui.js). El kit sostiene esa convención SOLO del
         lado de los pop-ups: `speakSlide` recibe la `<section>` entera y
         no la mira. Lo usa el índice, que muestra el temario en pantalla
         pero no lo enumera en voz alta. Relayado (K9). */
      speakSlide: function (s) {
        var solo = s.querySelector('[data-narrate-only]');
        Narrador.speak(Narrador.textOf(solo || s), 'slide');
      },
      visitedIndexes: function () {
        return motor.slides
          .filter(function (s) { return estado.vistas[s.getAttribute('data-slide')]; })
          .map(function (s) { return parseInt(s.getAttribute('data-slide-index'), 10); });
      }
    });

    /* Cada diapositiva arranca diciendo su título (§7 punto 9.9). Los
       cuerpos de este curso no repiten el título, así que no hay nada
       que recortar. */
    Narrador.setNarrateTitles(true);

    initPopupNarration();
    initPopupStagger();
    initStatPopups();
    initPrefetchNeighbors();
    initSummaryPrint();
    initTiempoActivo();
    initVideoSafetyNet();

    /* ---- Videos: el patrón "el arte ya dibuja el reproductor" ----
       Variante (b) de `initInlineCircleVideos` (coto-media.js): el
       `poster` es un recorte del reproductor que el diseñador dibujó,
       así que el <video> real cae exactamente encima. */
    initInlineCircleVideos({
      seen: function (src) { return !!estado.videos[src]; },
      markSeen: function (src) { estado.videos[src] = true; },
      onFirstPlay: function (src, title) {
        Logros.award(PTS.video, 'Video: ' + title);
        persistir();
        motor._syncNav();
      }
    });

    /* ---- Los 7 conceptos ----
       ⚠️ Un grupo de N variantes dispara `onChange` N−1 veces, no N: la
       variante 0 es la que ya se ve al entrar (coto-media.js). Acá eso
       es justo lo que queremos — la 0 no es ningún concepto. */
    initShotSwap({
      onChange: function (i) {
        var c = CONCEPTOS[i];
        if (!c) return;
        if (!estado.conceptos[c.id]) {
          estado.conceptos[c.id] = true;
          Logros.award(PTS.concepto, c.nom);
          if (contar(estado.conceptos) === 7) Logros.unlock('conceptos');
          persistir();
          motor._syncNav();
        }
        /* La narración de la variante la dispara el curso, no el kit:
           qué se narra es contenido (§5). */
        if (Narrador.isNarrating()) Narrador.speak(c.txt, 'other');
      }
    });

    /* ---- Gates de contenido ----
       · `initPopupGate` lee `data-require-popups` (las 4 fichas).
       · `initVideoGate` SONDEA cada `data-require-seen`: con los .mp4
         todavía en placeholder los exime solos, así el curso nunca
         queda trabado, y el gate vuelve a valer el día que el cliente
         suba los archivos, sin tocar código. */
    var popupGate = initPopupGate({
      seen: function (id) { return !!estado.popups[id]; },
      markSeen: function (id) { estado.popups[id] = true; },
      onChange: function (id) { premiarFicha(id); }
    });
    var videoGate = initVideoGate({
      seen: function (src) { return !!estado.videos[src]; },
      markSeen: function (src) { estado.videos[src] = true; }
    });

    function premiarFicha(id) {
      if (['rep-para-que', 'rep-como', 'rep-acciones', 'rep-mejorar'].indexOf(id) === -1) return;
      Logros.award(PTS.ficha, 'Ficha de repaso');
      if (estado.popups['rep-para-que'] && estado.popups['rep-como']) Logros.unlock('reporte');
      if (estado.popups['rep-acciones'] && estado.popups['rep-mejorar']) Logros.unlock('acciones');
      persistir();
      motor._syncNav();
    }

    /* Gate propio de este curso: los 7 conceptos y el mini juego
       terminado. El motor solo consulta `canAdvance`, no sabe por qué. */
    function faltanConceptos(slideEl) {
      if (!slideEl || slideEl.getAttribute('data-slide') !== 'conceptos') return [];
      return CONCEPTOS.slice(1)
        .filter(function (c) { return !estado.conceptos[c.id]; })
        .map(function (c) { return c.id; });
    }
    function faltaJuego(slideEl) {
      if (!slideEl || slideEl.getAttribute('data-slide') !== 'minijuego') return [];
      return estado.mjFin ? [] : ['minijuego'];
    }

    motor.canAdvance = function (slideEl) {
      return popupGate.faltan(slideEl).length === 0 &&
             videoGate.faltan(slideEl).length === 0 &&
             faltanConceptos(slideEl).length === 0 &&
             faltaJuego(slideEl).length === 0;
    };

    /* Sin esto el gate es mudo: el alumno ve que "Siguiente" no anda y
       no sabe QUÉ le falta. `pendientes` es la vía para los gates
       propios; los declarativos van en `gates`. */
    initGateHints({
      pendientes: function (slideEl) {
        var out = [];
        faltanConceptos(slideEl).forEach(function (id) {
          var i = CONCEPTOS.findIndex(function (c) { return c && c.id === id; });
          var el = slideEl.querySelector('[data-shot-swap-go="' + i + '"]');
          if (el) out.push({ el: el, tipo: out.length ? 'conceptos' : 'concepto' });
        });
        if (faltaJuego(slideEl).length) {
          var btn = slideEl.querySelector('[data-panel]:not([hidden]) [data-hit]');
          out.push({ el: btn, tipo: 'terminar el mini juego' });
        }
        return out;
      },
      gates: [
        { gate: popupGate,
          sel: function (id) { return '[data-popup-trigger="' + id + '"]'; },
          uno: 'ficha', varias: 'fichas' },
        { gate: videoGate,
          sel: function (src) { return '[data-inline-video][data-video="' + src + '"]'; },
          uno: 'video', varias: 'videos' }
      ]
    });

    /* ---- Índice lateral y glosario ----
       Los DOS devuelven un `refresh` y hay que guardarlo: corren una
       vez al crearse y después no se enteran de nada (§7.18 K5). */
    var refrescarIndice = initIndexJumps({
      visited: function (id) { return !!estado.vistas[id]; }
    });
    initGlossarySearch();
    var refrescarGlosario = initGlossaryUnlock({
      seen: function (id) { return !!estado.vistas[id]; },
      onUnlock: function (labels) {
        Player.toast('🔓 ' + (labels.length === 1
          ? 'Desbloqueaste “' + labels[0] + '”'
          : 'Desbloqueaste ' + labels.length + ' términos') + ' del glosario');
      }
    });

    /* ---- Mini juego ---- */
    var MJ_UI = initMinijuego();

    /* ---- Cierre ----
       Se desbloquea al ENTRAR (más abajo, en `slidechange`): el gate del
       mini juego ya garantiza que nadie llega antes de terminarlo, así
       que una pantalla "bloqueada" que nunca se ve sería justo el
       elemento muerto que §7.3 punto 4 prohíbe dejar. */
    var Cierre = initCierreCelebration({
      statIds: ['d-cert-points', 'd-cert-badges', 'd-cert-mj', 'd-cert-time'],
      ctaLabel: 'Ver mi resumen',
      salirLabel: 'Salir del curso',
      onUnlock: function () {
        setText('d-cert-points', String(Logros.puntos()));
        setText('d-cert-badges', String(Logros.obtenidos()));
        setText('d-cert-mj', contar(estado.mjOk) + '/5');
        setText('d-cert-time', String(Math.max(1, Math.round((window.tiempoActivoMs ? tiempoActivoMs() : 0) / 60000))));
      },
      onFinish: function () {
        Logros.unlock('curso');
        /* Los contadores finales se recalculan DESPUÉS de otorgar el
           último logro, nunca en el mismo paso (bug real del kit, README
           punto 11): si no, el resumen muestra "5/6 logros" en la misma
           pantalla que entrega el sexto. */
        setText('d-cert-points', String(Logros.puntos()));
        setText('d-cert-badges', String(Logros.obtenidos()));
        pintarMedalla(Logros.puntos(), NIVELES);
        if (window.XAPI) XAPI.completed(COURSE_SLUG, COURSE_NAME);
        if (window.SCORM) SCORM.markCompleted();
        persistir();
      },
      onCelebrate: function () { if (window.CotoUI && CotoUI.sWin) CotoUI.sWin(); },
      stagger: function (el) { if (window.staggerReveal) staggerReveal(null, el); }
    });

    /* ---- Marcar visitas, refrescar índice/glosario, desbloquear el
            cierre. Un solo listener, después de todo lo anterior. ---- */
    document.addEventListener('slidechange', function (e) {
      estado.vistas[e.detail.id] = true;
      if (refrescarIndice) refrescarIndice();
      if (refrescarGlosario) refrescarGlosario();
      if (e.detail.id === 'cierre') Cierre.unlockCierre();
      if (e.detail.id === 'minijuego') MJ_UI.alEntrar();
      persistir();
    });

    /* Techo de "hasta dónde llegó" para la barra arrastrable: se
       calcula desde el estado YA RESTAURADO, no desde `motor.index` en
       frío — si no, quien reabre el curso en una sesión nueva se
       encuentra la barra creyendo que no vio nada (§6.51). */
    motor.restoreMaxVisited(estado.vistas);
    if (refrescarIndice) refrescarIndice();
    if (refrescarGlosario) refrescarGlosario();

    /* Lo expone para el recorrido instrumentado de
       `tools/tests/puntaje-curso.mjs`, que es quien verifica que el
       máximo real coincida con el que sostienen los umbrales. */
    window.__CURSO__ = {
      maxSinVideos: MAX_SIN_VIDEOS, pisoGate: PISO_GATE,
      niveles: NIVELES, pts: PTS, mj: MJ_UI
    };

    if (window.SCORM) SCORM.commit();
  }

  function setText(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  /* ============================================================
     MINI JUEGO — 5 conceptos, 3 vidas, puntaje propio.
     La cáscara visual es del kit (`coto-minijuego.css`); esto es la
     lógica, que es contenido de este curso. Las 3 pantallas del PDF
     son capas `[data-panel]` de la misma diapositiva.
     ============================================================ */
  function initMinijuego() {
    var raiz = document.querySelector('[data-slide="minijuego"]');
    if (!raiz) return { alEntrar: function () {} };

    var elEscena = raiz.querySelector('[data-mj-escena]');
    var elConsigna = raiz.querySelector('[data-mj-consigna]');
    var elOpciones = raiz.querySelector('[data-mj-opciones]');
    var elFb = raiz.querySelector('[data-mj-fb]');
    var elN = raiz.querySelector('[data-mj-n]');
    var elPts = raiz.querySelector('[data-mj-pts]');
    var elVidas = raiz.querySelector('[data-mj-vidas]');

    var i = 0, vidas = MJ_VIDAS, puntos = MJ_INICIAL, aciertos = 0, bloqueado = false;

    /* Corazones "pixel art", no el glifo ❤: el arte del PDF los dibuja
       de 8 bits y `coto-minijuego.css` ya estila `.d-mj-heart`. */
    function pintarVidas() {
      if (!elVidas) return;
      elVidas.innerHTML = '';
      for (var v = 0; v < MJ_VIDAS; v++) {
        var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        s.setAttribute('class', 'd-mj-heart' + (v < vidas ? '' : ' is-off'));
        s.setAttribute('viewBox', '0 0 16 14');
        s.setAttribute('aria-hidden', 'true');
        var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('fill', 'currentColor');
        p.setAttribute('d', 'M2 1h4v1h1v1h2V2h1V1h4v1h1v5h-1v2h-1v1h-1v1h-1v1h-1v1h-1v1H7v-1H6v-1H5v-1H4v-1H3V9H2V7H1V2h1z');
        s.appendChild(p);
        elVidas.appendChild(s);
      }
      elVidas.setAttribute('aria-label', vidas + ' de ' + MJ_VIDAS + ' vidas');
    }

    function hud() {
      if (elN) elN.textContent = String(Math.min(i + 1, MJ.length));
      if (elPts) elPts.textContent = String(puntos);
      pintarVidas();
    }

    function panel(id) {
      var trig = raiz.querySelector('[data-target="' + id + '"]');
      if (trig) { trig.click(); return; }
      /* Sin disparador en el marcado (las pantallas finales no lo
         tienen: se llega por lógica, no por un clic), se mueve a mano
         el mismo juego de capas que maneja el motor. */
      raiz.querySelectorAll('[data-panel]').forEach(function (p) {
        p.hidden = p.getAttribute('data-panel') !== id;
      });
      document.dispatchEvent(new CustomEvent('layerchange', {
        bubbles: true, detail: { target: id }
      }));
    }

    function render() {
      var q = MJ[i];
      bloqueado = false;
      if (elEscena) elEscena.setAttribute('src', q.escena);
      if (elConsigna) elConsigna.textContent = q.consigna;
      if (elFb) { elFb.textContent = ''; elFb.className = 'd-mj-fb'; }
      if (elOpciones) {
        elOpciones.innerHTML = '';
        q.opts.forEach(function (txt, k) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'd-mj-opt';
          b.textContent = txt;
          b.addEventListener('click', function () { responder(k, b); });
          elOpciones.appendChild(b);
        });
      }
      hud();
      /* El motor no se entera de un `innerHTML`: si esta función no
         narrara, el juego quedaría mudo a partir del primer concepto
         (CLAUDE.md §1). El guard de `hidden` evita narrar en el render
         inicial, con la capa todavía oculta. */
      var capa = elOpciones && elOpciones.closest('[data-panel]');
      if (capa && !capa.hidden && !raiz.hidden) {
        narrar(q.consigna + ' ' + q.opts.join('. '));
      }
    }

    /* TODA la voz del juego pasa por acá, y por un motivo concreto:
       `Narrador.speak()` arranca llamando a `cancel()` (narrador.js),
       así que enrutar cada cambio de estado por esta función garantiza
       que lo anterior se corte antes de que empiece lo siguiente. Es el
       mismo "¿quién lo apaga?" de §6.10.1 punto 1, aplicado a la voz:
       el motor corta la locución al cambiar de DIAPOSITIVA y al cerrar
       un POP-UP, pero un `layerchange` —que es lo que pasa acá— no corta
       nada, así que le toca al curso. */
    function narrar(txt) {
      if (!txt || !window.Narrador) return;
      Narrador.speak(txt, 'other');
    }
    function textoDePanel(id) {
      var p = raiz.querySelector('[data-panel="' + id + '"] .sr-only');
      return p ? p.textContent.trim() : '';
    }

    function feedback(ok, txt) {
      if (!elFb) return;
      elFb.className = 'd-mj-fb ' + (ok ? 'is-ok' : 'is-bad');
      elFb.textContent = txt;
    }

    function responder(k, btn) {
      if (bloqueado) return;
      var q = MJ[i];
      if (k === q.ok) {
        bloqueado = true;
        btn.classList.add('is-ok');
        elOpciones.querySelectorAll('.d-mj-opt').forEach(function (b) { b.disabled = true; });
        puntos += MJ_ACIERTO;
        aciertos++;
        if (window.CotoUI && CotoUI.sCorrect) CotoUI.sCorrect();
        /* Guard persistido (§6.53): una pregunta paga UNA sola vez en
           todo el curso. Sin esto, reintentar el juego sería puntaje
           infinito. Y paga menos si ya se había errado esa pregunta:
           lo que se premia es la precisión, no la insistencia (§7.14). */
        if (!estado.mjOk[q.id]) {
          estado.mjOk[q.id] = true;
          Logros.award(estado.mjErr[q.id] ? PTS.mjBienTrasError : PTS.mjBien,
                       'Concepto ' + (i + 1) + ' de 5');
        }
        feedback(true, q.why);
        /* Corta la consigna si todavía estaba sonando y arranca la
           devolución. Antes no se narraba ninguna de las dos cosas: la
           consigna seguía de fondo y la devolución no se escuchaba. */
        narrar(q.why);
        hud();
        siguientePaso();
        persistir();
      } else {
        btn.classList.add('is-bad');
        btn.disabled = true;
        vidas--;
        puntos = Math.max(0, puntos - MJ_ERROR);
        estado.mjErr[q.id] = true;
        if (window.CotoUI && CotoUI.sWrong) CotoUI.sWrong();
        feedback(false, q.mal);
        hud();
        persistir();
        /* Si este error fue el último, la devolución y el resultado se
           narran JUNTOS, en una sola emisión: narrar el "por qué" y
           enseguida pisarlo con la pantalla final dejaría al alumno sin
           la explicación justo cuando más la necesita. */
        if (vidas <= 0) terminar(false, q.mal);
        else narrar(q.mal);
      }
    }

    function siguientePaso() {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-cat d-mj-next';
      b.textContent = i + 1 < MJ.length ? 'Siguiente concepto' : 'Ver resultado';
      b.addEventListener('click', function () {
        b.remove();
        if (i + 1 < MJ.length) { i++; render(); }
        else terminar(true);
      });
      elFb.after(b);
      b.focus();
    }

    function terminar(gano, preludio) {
      estado.mjFin = true;
      Logros.unlock('juego');
      if (gano && aciertos === MJ.length && !Object.keys(estado.mjErr).length) {
        Logros.unlock('preciso');
      }
      var suf = gano ? 'ok' : 'retry';
      setTextoNodo('[data-mj-' + suf + '-aciertos]', aciertos + '/' + MJ.length);
      setTextoNodo('[data-mj-' + suf + '-puntos]', String(puntos));
      panel('mj-fin-' + suf);
      narrar([preludio, textoDePanel('mj-fin-' + suf)].filter(Boolean).join(' '));
      persistir();
      motor._syncNav();
    }

    function setTextoNodo(sel, txt) {
      var el = raiz.querySelector(sel);
      if (el) el.textContent = txt;
    }

    function reiniciar() {
      i = 0; vidas = MJ_VIDAS; puntos = MJ_INICIAL; aciertos = 0;
      panel('mj-juego');
      render();
    }

    /* El botón "¡Empecemos!" ya cambia de capa solo (`data-target`, lo
       cablea el motor); lo único que falta es pintar la 1ª pregunta. */
    document.addEventListener('layerchange', function (e) {
      if (e.detail && e.detail.target === 'mj-juego' && !elOpciones.children.length) render();
    });

    var btnContinuar = raiz.querySelector('[data-mj-continuar]');
    if (btnContinuar) btnContinuar.addEventListener('click', function () {
      /* Guard de panel oculto: el recorrido instrumentado de la suite
         clickea TODOS los `[data-hit]` de cada diapositiva, incluidos
         los de capas escondidas. Sin esto, un clic sobre un botón que
         el alumno no puede ver navegaría igual. */
      if (btnContinuar.closest('[data-panel]').hidden) return;
      motor._advance(1);
    });
    var btnReintentar = raiz.querySelector('[data-mj-reintentar]');
    if (btnReintentar) btnReintentar.addEventListener('click', function () {
      if (btnReintentar.closest('[data-panel]').hidden) return;
      reiniciar();
    });

    pintarVidas();

    return {
      alEntrar: function () { hud(); },
      /* Para el recorrido instrumentado de `tools/tests/puntaje-curso.mjs`:
         juega solo, sin mouse. Tres modos, uno por cada cosa que hay
         que poder medir sobre el puntaje:
           'perfecto'   → los 5 a la primera (el MÁXIMO real);
           'pesimo'     → siempre mal hasta quedarse sin vidas (el PISO
                          que el gate garantiza: terminar el juego sin
                          acertar nada);
           'insistente' → yerra cada pregunta una vez y recién después
                          la acierta, reintentando cuantas veces haga
                          falta — es el alumno de §7.14, el que "se
                          equivocó bastante y llegó igual al máximo". */
      _auto: function (modo) {
        modo = modo || 'perfecto';
        function finAbierto() {
          return !!raiz.querySelector('[data-panel="mj-fin-ok"]:not([hidden]), [data-panel="mj-fin-retry"]:not([hidden])');
        }
        panel('mj-juego');
        if (!elOpciones.children.length) render();
        for (var guard = 0; guard < 200; guard++) {
          if (finAbierto()) {
            if (modo === 'pesimo') break;
            var reint = raiz.querySelector('[data-mj-reintentar]');
            if (reint && !reint.closest('[data-panel]').hidden) { reint.click(); continue; }
            break;                       // terminó bien: no hay nada más que jugar
          }
          var q = MJ[i];
          /* Elegir "la equivocada" como `(ok+1) % n` a secas no sirve:
             una opción errada queda `disabled`, así que en la segunda
             vuelta ese índice ya no está y cualquier fallback termina
             tocando la CORRECTA — el recorrido "pésimo" acertaba sin
             querer y el piso medido daba 10 puntos de más. Se pide
             siempre la primera opción viva que NO sea la correcta. */
          var erroneaViva = null;
          for (var n = 0; n < elOpciones.children.length; n++) {
            if (n !== q.ok && !elOpciones.children[n].disabled) {
              erroneaViva = elOpciones.children[n]; break;
            }
          }
          var btn;
          if (modo === 'perfecto') btn = elOpciones.children[q.ok];
          else if (modo === 'pesimo') btn = erroneaViva;
          else btn = estado.mjErr[q.id] ? elOpciones.children[q.ok] : erroneaViva;
          if (!btn || btn.disabled) break;
          btn.click();
          var next = elFb.nextElementSibling;
          if (next && next.classList.contains('d-mj-next')) next.click();
        }
        return { aciertos: aciertos, puntos: puntos, vidas: vidas, fin: finAbierto() };
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
