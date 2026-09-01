/* ============================================================
   curso.js · "Surtido sin ventas" (Área Salón, COTO)
   Migrado desde Articulate Storyline con kit-base v1.9.57
   (CLAUDE.md §7.05). Único archivo que conoce contenido de ESTE
   curso — todo lo demás (motor, narrador, UI, media, hotspots,
   quiz, cierre) es del kit y no se toca (CLAUDE.md §1/§0.1).
   ============================================================ */
(function () {
  'use strict';

  var COURSE_SLUG = 'surtido-sin-ventas';
  var COURSE_NAME = 'Surtido sin ventas';

  /* ---------- Vocabulario propio para la locución ----------
     El diccionario base del kit ya trae PLU/EAN/ticket/etc (Manual de
     Contenido). Acá solo lo específico de este curso. */
  if (window.Narrador && Narrador.addFixes) {
    Narrador.addFixes([
      ['GESCOM', 'Gescom'],
      ['PDA', 'P D A']
    ]);
  }

  /* ============================================================
     ESTADO — persistido en cmi.suspend_data (SCORM.saveState/loadState,
     límite real de 4096 caracteres, CLAUDE.md/README "bugs reales #3"):
     se guardan solo IDs y flags, nunca texto largo.
     ============================================================ */
  var BADGES = [
    { id: 'inicio', nombre: 'Primeros pasos', desc: 'Empezaste el curso.', icono: '🚀' },
    { id: 'conceptos', nombre: 'Conceptos claros', desc: 'Exploraste los 7 conceptos clave.', icono: '📘' },
    { id: 'reportes', nombre: 'A pura pantalla', desc: 'Viste los 2 videos del reporte.', icono: '🎬' },
    { id: 'practica', nombre: 'Jugado y aprendido', desc: 'Terminaste el mini juego.', icono: '🎮' },
    { id: 'curso', nombre: 'Curso completo', desc: 'Terminaste "Surtido sin ventas".', icono: '🏁' }
  ];

  var CONCEPT_IDS = ['plu-ean', 'stock', 'falso-stock', 'rotacion', 'exhibicion', 'surtido', 'gescom'];

  var estado = {
    vistas: {},        // { slideId: true }
    popups: {},         // { popupId: true } — repasos "Lo que vimos"
    conceptos: {},       // { conceptId: true }
    videos: {},          // { src: true }
    logros: {},           // { badgeId: true }
    puntos: 0,
    mjDone: false,          // el mini juego se terminó con éxito al menos una vez
    mjAciertos: {}           // { conceptId: true } — hallazgos ya premiados alguna vez
                              // (CLAUDE.md §6.53: el juego se puede reintentar sin límite,
                              // así que el punto por acierto necesita guardarse acá, no en
                              // el estado efímero del intento en curso, para no poder
                              // "farmear" puntos reintentando)
  };

  function cargarEstado() {
    var s = window.SCORM && SCORM.loadState();
    if (!s) return;
    estado.vistas = s.v || {};
    estado.popups = s.p || {};
    estado.conceptos = s.c || {};
    estado.videos = s.vi || {};
    estado.logros = s.l || {};
    estado.puntos = s.pt || 0;
    estado.mjDone = !!s.mj;
    estado.mjAciertos = s.mo || {};
  }

  function persistState() {
    if (!window.SCORM) return;
    SCORM.saveState({
      v: estado.vistas, p: estado.popups, c: estado.conceptos, vi: estado.videos,
      l: estado.logros, pt: estado.puntos, mj: estado.mjDone, mo: estado.mjAciertos
    });
  }

  /* ============================================================
     PUNTOS Y LOGROS — chip del header (#d-points/#d-badge-count),
     pop-up "Mis logros" (#d-badges-list) y medalla final (coto-cierre).
     Techo real de puntos con el gate actual (conceptos + minijuego
     obligatorios, videos/repasos opcionales):
       inicio(5) + conceptos(7×5=35 + logro 10) + minijuego(10×10=100 +
       logro 20) + reportes(2×10=20 + logro 10) + curso(0, solo medalla)
       = 200 puntos máximo real.
     ============================================================ */
  function award(pts, motivo) {
    estado.puntos += pts;
    var el = document.getElementById('d-points');
    if (el) el.textContent = estado.puntos;
    if (window.Player) Player.toast('✦ +' + pts + ' — ' + motivo);
    persistState();
  }

  function unlockBadge(id) {
    if (estado.logros[id]) return;
    estado.logros[id] = true;
    var b = BADGES.filter(function (x) { return x.id === id; })[0];
    var count = document.getElementById('d-badge-count');
    if (count) count.textContent = Object.keys(estado.logros).length + '/' + BADGES.length;
    renderBadges();
    if (window.Player && b) Player.toast('🏆 Logro desbloqueado: ' + b.nombre);
    persistState();
  }

  function renderBadges() {
    var host = document.getElementById('d-badges-list');
    if (!host) return;
    host.innerHTML = BADGES.map(function (b) {
      var earned = !!estado.logros[b.id];
      return '<div class="d-badge' + (earned ? ' earned' : '') + '">' +
        '<span class="i" aria-hidden="true">' + b.icono + '</span>' +
        '<span class="n">' + b.nombre + '</span>' +
        '<span class="d">' + b.desc + '</span></div>';
    }).join('');
  }

  /* ============================================================
     CONCEPTOS ("Algunos conceptos importantes", [data-layers] real,
     addendum §1 .tabs-v) — gate: hay que abrir los 7 antes de avanzar.
     ============================================================ */
  function conceptosVistosCount() {
    return CONCEPT_IDS.filter(function (id) { return estado.conceptos[id]; }).length;
  }

  function actualizarMensajeGateConceptos() {
    var msg = document.querySelector('[data-concepts-gate-msg]');
    var pend = document.querySelector('[data-concepts-pending]');
    if (!msg || !pend) return;
    var faltan = CONCEPT_IDS.length - conceptosVistosCount();
    pend.textContent = faltan;
    msg.hidden = faltan <= 0;
  }

  /* "Algunos conceptos importantes" es captura íntegra + data-shot-swap
     (CLAUDE.md §1: initConceptShots quedó documentado como candidato a
     generalizar "el día que un curso futuro repita el patrón" — este
     curso, en su versión con arte real del cliente, es exactamente ese
     caso). El índice 0 del swap es el estado neutro (sin ningún
     concepto elegido todavía); los índices 1-7 son los 7 conceptos, en
     el mismo orden que los botones del HTML. */
  function onConceptShotChange(indice) {
    if (indice < 1 || indice > CONCEPT_IDS.length) return;
    var id = CONCEPT_IDS[indice - 1];
    if (!estado.conceptos[id]) {
      estado.conceptos[id] = true;
      award(5, 'concepto "' + id + '" explorado');
      if (conceptosVistosCount() === CONCEPT_IDS.length) {
        unlockBadge('conceptos');
        award(10, '7 conceptos completos');
      }
    }
    actualizarMensajeGateConceptos();
    persistState();
    var texto = document.querySelector('[data-concept-text="' + indice + '"]');
    if (texto && window.Narrador) Narrador.speak(Narrador.textOf(texto), 'slide');
  }

  /* ============================================================
     MINI JUEGO — 5 preguntas con arte/diseño real del cliente
     ("Juego para curso Salón - N días", PDF), en el mismo orden que
     ese documento. Los 5 `why` son los mismos ya redactados/aprobados
     del banco viejo de 10 preguntas (Ronda 2) — se conservan, se
     descartan las otras 5 (no las pide el PDF nuevo). El orden de las
     4 opciones se sortea en cada partida (`shuffled`); el de las 5
     preguntas queda FIJO, calcando la secuencia del PDF.
     ============================================================ */
  var MJ_BANK = [
    { id: 'plu-ean', img: 'img/mj-plu-ean.webp',
      q: 'Es el número que Coto le asigna a cada producto dentro de su sistema. <b>No aparece en el envase.</b>',
      opts: ['PLU', 'Stock', 'EAN', 'Falso stock'], ok: 0,
      why: 'Ese es el PLU — código interno de COTO. El EAN, en cambio, sí aparece impreso en el envase.' },
    { id: 'surtido', img: 'img/mj-reporte.webp',
      q: 'Es un reporte que, según la cantidad de días que elijas, muestra los productos que no se vendieron en ese tiempo.',
      opts: ['Control de rotación', 'Control de surtido sin venta', 'Control de exhibición', 'Control de GESCOM'], ok: 1,
      why: 'El control de surtido sin venta es justamente ese reporte: muestra qué productos no tuvieron movimiento en el período elegido.' },
    { id: 'mejorar-venta', img: 'img/mj-mejorar-venta.webp',
      q: 'Para <b>mejorar la venta</b> de un producto, nuestro sector puede, entre otras opciones, hacer&hellip;',
      opts: ['Ponerlo cerca de línea de cajas', 'Pedir más espacio en góndola', 'Ponerle un cartel de &ldquo;novedad&rdquo;', 'Regalar una muestra'], ok: 1,
      why: 'Pedir más espacio en góndola, exhibirlo como novedad, sumarlo a la línea de cajas o regalar una muestra son acciones reales para mejorar la venta.' },
    { id: 'rotacion', img: 'img/mj-rotacion.webp',
      q: 'La rotación es qué tan rápido se vende un producto en la clase determinada. Según cuánto se vende, cada producto tiene una rotación: <b>A (Alta)</b>: se vende mucho y seguido. <b>B (Media)</b>: se vende con frecuencia moderada. <b>C (Baja)</b>: &hellip;',
      opts: ['Se vende poco o lento', 'Se venden pocos', 'No se vende', 'No hay stock'], ok: 0,
      why: 'Rotación baja es "se vende poco o muy lentamente" — no vendido nunca sería otro problema (stock estancado), y frecuencia moderada es rotación media.' },
    { id: 'ean', img: 'img/mj-ean.webp',
      q: 'Es el número largo que está debajo del código de barras en el envase. Es el mismo en todos los supermercados, <b>lo pone el fabricante.</b>',
      opts: ['Surtido', 'Sobre stock', 'EAN', 'PLU'], ok: 2,
      why: 'El EAN es el código de barras que pone el fabricante — es igual en cualquier supermercado. El PLU, en cambio, es el código interno que le asigna COTO.' }
  ];
  var MJ_VIDAS = 3;
  var MJ_PTS_ACIERTO = 20;   // 5 × 20 = 100, mismo presupuesto que el banco viejo (10 × 10)
  var MJ_PTS_COMPLETO = 20;  // logro "practica", igual que antes

  function shuffled(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Interfaz 100% propia (no usa coto-quiz.js: ese módulo asume el
     layout genérico "Pregunta X de Y" en columna vertical, y el
     diseño real que mandó el cliente —chips de Concepto/Puntos/Vidas/
     Reglas, tarjeta texto+ilustración, píldoras en fila, 2 pantallas
     finales— no calca ese layout). Los 4 paneles (intro/play/fin-ok/
     fin-fail) son `[data-mj-panel]` propios, alternados a mano con
     `.hidden` — mismo criterio que ya usaba este curso antes del
     rediseño, no el `[data-layers]` del motor (CLAUDE.md §1: cualquier
     función que repinta contenido así narra por su cuenta). */
  function initMiniJuego(cierreCb) {
    var root = document.querySelector('[data-slide="minijuego"]');
    if (!root) return;
    var panels = {
      intro: root.querySelector('[data-mj-panel="intro"]'),
      play: root.querySelector('[data-mj-panel="play"]'),
      finOk: root.querySelector('[data-mj-panel="fin-ok"]'),
      finFail: root.querySelector('[data-mj-panel="fin-fail"]')
    };
    var idxEl = root.querySelector('[data-mj-idx]');
    var livesEls = root.querySelectorAll('[data-mj-heart]');
    var consignaEl = root.querySelector('[data-mj-consigna]');
    var imgEl = root.querySelector('[data-mj-img]');
    var optsEl = root.querySelector('[data-mj-opts]');
    var fbEl = root.querySelector('[data-mj-fb]');
    var nextBtn = root.querySelector('[data-mj-next]');

    var cur = 0, vidas = MJ_VIDAS, puntosJuego = 0, aciertos = 0;

    function mostrarPanel(name) {
      Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = (k !== name); });
    }

    function actualizarStats() {
      if (idxEl) idxEl.textContent = cur + 1;
      root.querySelectorAll('[data-mj-puntos-juego]').forEach(function (el) { el.textContent = puntosJuego; });
      livesEls.forEach(function (h, i) { h.classList.toggle('is-off', i >= vidas); });
    }

    function renderPregunta() {
      var it = MJ_BANK[cur];
      if (consignaEl) consignaEl.innerHTML = it.q;
      if (imgEl) { imgEl.src = it.img; imgEl.alt = ''; }
      var orden = shuffled(it.opts.map(function (o, i) { return i; }));
      optsEl.innerHTML = orden.map(function (i) {
        return '<button type="button" class="d-mj-opt" data-i="' + i + '">' + it.opts[i] + '</button>';
      }).join('');
      fbEl.hidden = true; fbEl.textContent = ''; fbEl.className = 'd-mj-fb';
      nextBtn.hidden = true;
      actualizarStats();
      Array.prototype.forEach.call(optsEl.querySelectorAll('.d-mj-opt'), function (btn) {
        btn.addEventListener('click', function () { responder(btn, +btn.getAttribute('data-i'), it); });
      });
      if (!root.hidden) Narrador.speak(Narrador.textOf(consignaEl), 'slide');
    }

    function responder(btn, i, it) {
      if (btn.disabled) return;
      var ok = i === it.ok;
      Array.prototype.forEach.call(optsEl.querySelectorAll('.d-mj-opt'), function (b) {
        b.disabled = true;
        var bi = +b.getAttribute('data-i');
        if (bi === it.ok) b.classList.add('is-ok');
        else if (b === btn) b.classList.add('is-bad');
      });
      fbEl.hidden = false;
      fbEl.className = 'd-mj-fb ' + (ok ? 'is-ok' : 'is-bad');
      fbEl.textContent = (ok ? '¡Correcto! ' : 'No es correcta. ') + it.why;
      if (ok) {
        aciertos++;
        if (!estado.mjAciertos[it.id]) {
          estado.mjAciertos[it.id] = true;
          puntosJuego += MJ_PTS_ACIERTO;
          award(MJ_PTS_ACIERTO, 'concepto "' + it.id + '" del juego acertado');
        }
        if (window.CotoUI) CotoUI.sCorrect();
      } else {
        vidas--;
        if (window.CotoUI) CotoUI.sWrong();
      }
      actualizarStats();
      if (window.XAPI && XAPI.answered) XAPI.answered('minijuego-' + it.id, it.q, ok, it.opts[i]);
      nextBtn.hidden = false;
      if (vidas <= 0) { nextBtn.textContent = 'Ver resultado'; nextBtn.onclick = terminarFail; }
      else if (cur + 1 >= MJ_BANK.length) { nextBtn.textContent = 'Ver resultado'; nextBtn.onclick = terminarOk; }
      else { nextBtn.textContent = 'Siguiente concepto'; nextBtn.onclick = function () { cur++; renderPregunta(); }; }
      Narrador.speak((ok ? 'Correcto. ' : 'Incorrecto. ') + it.why, 'slide');
    }

    function terminarOk() {
      mostrarPanel('finOk');
      panels.finOk.querySelector('[data-mj-fin-aciertos]').textContent = aciertos + '/' + MJ_BANK.length;
      panels.finOk.querySelector('[data-mj-fin-puntos]').textContent = puntosJuego;
      var primeraVez = !estado.mjDone;
      estado.mjDone = true;
      persistState();
      if (primeraVez) { unlockBadge('practica'); award(MJ_PTS_COMPLETO, 'mini juego completado'); }
      cierreCb();
      Narrador.speak(Narrador.textOf(panels.finOk), 'slide');
    }

    function terminarFail() {
      mostrarPanel('finFail');
      panels.finFail.querySelector('[data-mj-fail-aciertos]').textContent = aciertos + '/' + MJ_BANK.length;
      panels.finFail.querySelector('[data-mj-fail-puntos]').textContent = puntosJuego;
      Narrador.speak(Narrador.textOf(panels.finFail), 'slide');
    }

    function empezar() {
      cur = 0; vidas = MJ_VIDAS; puntosJuego = 0; aciertos = 0;
      mostrarPanel('play');
      renderPregunta();
    }

    var startBtn = root.querySelector('[data-mj-start]');
    if (startBtn) startBtn.addEventListener('click', empezar);
    var retryBtn = root.querySelector('[data-mj-retry]');
    if (retryBtn) retryBtn.addEventListener('click', empezar);
    var continueBtn = root.querySelector('[data-mj-continue]');
    if (continueBtn) continueBtn.addEventListener('click', function () { window.motor._advance(1); });

    /* Volver a esta diapositiva desde el índice siempre ofrece el
       mismo "¡Empecemos!" limpio (mismo criterio que otros cursos del
       kit, CLAUDE.md §6.37 punto 2) — el progreso real (estado.mjDone,
       el gate) no se resetea acá, solo lo que se ve. */
    document.addEventListener('slidechange', function (e) {
      if (e.detail.id !== 'minijuego') mostrarPanel('intro');
    });

    mostrarPanel('intro');
  }

  /* ============================================================
     ARRANQUE
     ============================================================ */
  function boot() {
    if (window.SCORM) SCORM.init();
    cargarEstado();

    document.addEventListener('slidechange', function (e) {
      if (window.SCORM) SCORM.setLocation(e.detail.id);
      marcarVista(e.detail.id);
    });
    document.addEventListener('courseend', function () {
      if (window.SCORM) { SCORM.setProgressScore(Math.round((estado.puntos / 200) * 100)); SCORM.markCompleted(); }
      if (window.XAPI && XAPI.completed) XAPI.completed(COURSE_SLUG, COURSE_NAME);
    });

    window.motor = new Motor(document);

    /* ---- Gate genérico (spec-motor-slides.md §4/§7) ----
       "conceptos": los 7 conceptos abiertos.
       "minijuego": el mini juego terminado.
       Repasos ("Lo que vimos en este video" ×2): las 2 tarjetas abiertas
       — data-require-popups en el propio <section>, spec §3. */
    motor.canAdvance = function (slideEl) {
      var id = slideEl.getAttribute('data-slide');
      if (id === 'conceptos') return conceptosVistosCount() >= CONCEPT_IDS.length;
      if (id === 'minijuego') return !!estado.mjDone;
      var req = slideEl.getAttribute('data-require-popups');
      if (req) {
        return req.split(' ').every(function (pid) { return !!estado.popups[pid]; });
      }
      return true;
    };
    document.addEventListener('advanceblocked', function (e) {
      if (e.detail.id === 'conceptos') actualizarMensajeGateConceptos();
      if (window.Player) {
        if (e.detail.id === 'minijuego') Player.toast('🔒 Terminá el mini juego para avanzar');
        else if (e.detail.id === 'repaso-reporte' || e.detail.id === 'repaso-productos') Player.toast('🔒 Abrí las 2 tarjetas para avanzar');
      }
    });

    var Player = initPlayer({
      speakSlide: function (s) {
        // Diapositivas de video de fondo (portada/unidad1): no narran
        // texto propio (CLAUDE.md §7 punto 9.9) — el video, cuando el
        // cliente lo suba, trae su propio audio.
        if (s.classList.contains('d-shot-slide--bg-video')) { Narrador.speak('', 'slide'); return; }
        Narrador.speak(Narrador.textOf(s), 'slide');
      },
      visitedIndexes: function () {
        return Object.keys(estado.vistas).map(function (id) {
          var el = document.querySelector('[data-slide="' + id + '"]');
          return el ? +el.getAttribute('data-slide-index') : -1;
        });
      }
    });
    window.Player = Player;

    initPopupNarration();
    initPopupStagger();
    initStatPopups();
    initPrefetchNeighbors();
    initSummaryPrint();
    initTiempoActivo();
    initVideoSafetyNet();

    initIndexJumps({ selector: '.d-shot-hit--indice', visited: function (id) { return !!estado.vistas[id]; } });
    refreshSidenav();

    initGlossarySearch();
    var refrescarGlosario = initGlossaryUnlock({
      seen: function (id) { return !!estado.vistas[id]; },
      onUnlock: function (labels) {
        Player.toast('🔓 ' + (labels.length === 1 ? 'Desbloqueaste "' + labels[0] + '"' : 'Desbloqueaste ' + labels.length + ' términos') + ' del glosario');
      }
    });

    var shotSwaps = initShotSwap({ onChange: function (indice) { onConceptShotChange(indice); } });
    /* Cada vez que se ENTRA a "conceptos" (primera vez o de vuelta desde
       el índice), la imagen vuelve al estado neutro (tarjetas inactivas
       + ilustración de cuaderno/lupa/engranaje) — pedido del cliente:
       "debería empezar con las tarjetas inactivas... eso debería
       aparecer una vez que se presiona el botón". El progreso real
       (estado.conceptos, el gate) NO se resetea acá — solo la imagen
       que se ve; si el alumno ya completó los 7, sigue pudiendo avanzar. */
    document.addEventListener('slidechange', function (e) {
      if (e.detail.id === 'conceptos' && shotSwaps.conceptos) shotSwaps.conceptos.go(0, true, true);
    });

    initBgVideos();
    initVideoPlayer({
      onFirstPlay: function (src) {
        if (!estado.videos[src]) {
          estado.videos[src] = true;
          award(10, 'video visto');
          var vistos = Object.keys(estado.videos).length;
          if (vistos >= 2) { unlockBadge('reportes'); award(10, '2 videos del reporte vistos'); }
          persistState();
        }
      }
    });

    document.addEventListener('popupopen', function (e) {
      var id = e.detail.id;
      if (id && id.indexOf('repaso-') === 0 && !estado.popups[id]) {
        estado.popups[id] = true;
        persistState();
      }
    });

    /* ---- Mini juego: intro → 5 preguntas → éxito/reintentar ---- */
    initMiniJuego(function () { Cierre.unlockCierre(); });

    /* ---- Cierre ---- */
    var Cierre = initCierreCelebration({
      statIds: ['d-cert-points', 'd-cert-badges'],
      onUnlock: function () {
        var pts = document.getElementById('d-cert-points');
        var badges = document.getElementById('d-cert-badges');
        if (pts) pts.textContent = estado.puntos;
        if (badges) badges.textContent = Object.keys(estado.logros).length + '/' + BADGES.length;
        pintarMedalla(estado.puntos);
      },
      onFinish: function () {
        unlockBadge('curso');
        // Re-sincronizar las tarjetas del resumen: el logro "curso completo"
        // se otorga acá, DESPUÉS de que unlockCierre() ya las había
        // llenado una vez (al terminar el mini juego) — sin esto quedan
        // mostrando el conteo de logros de ese momento, no el final.
        var pts = document.getElementById('d-cert-points');
        var badges = document.getElementById('d-cert-badges');
        if (pts) pts.textContent = estado.puntos;
        if (badges) badges.textContent = Object.keys(estado.logros).length + '/' + BADGES.length;
        pintarMedalla(estado.puntos);
        if (window.XAPI && XAPI.completed) XAPI.completed(COURSE_SLUG, COURSE_NAME);
        if (window.SCORM) { SCORM.setProgressScore(Math.round((estado.puntos / 200) * 100)); SCORM.markCompleted(); }
      }
    });
    window.Cierre = Cierre;

    /* ---- Medalla final — umbrales sobre el puntaje REAL alcanzable
       (200, ver comentario de la sección de puntos), no números
       redondos elegidos a ojo. */
    function pintarMedalla(puntos) {
      var niveles = [
        { id: 'oro', desde: 170, nombre: 'oro', icono: '🥇' },
        { id: 'plata', desde: 120, nombre: 'plata', icono: '🥈' },
        { id: 'bronce', desde: 0, nombre: 'bronce', icono: '🥉' }
      ];
      var nivel = niveles[niveles.length - 1];
      for (var i = 0; i < niveles.length; i++) {
        if (puntos >= niveles[i].desde) { nivel = niveles[i]; break; }
      }
      var caja = document.querySelector('[data-medalla]');
      if (!caja) return;
      caja.setAttribute('data-nivel', nivel.id);
      var ic = caja.querySelector('[data-medalla-ic]');
      var nombre = caja.querySelector('[data-medalla-nombre]');
      var sub = caja.querySelector('[data-medalla-sub]');
      if (ic) ic.textContent = nivel.icono;
      if (nombre) nombre.textContent = nivel.nombre;
      if (sub) {
        var siguiente = niveles[niveles.indexOf(nivel) - 1];
        sub.textContent = siguiente ? ('Te faltaron ' + (siguiente.desde - puntos) + ' puntos para la de ' + siguiente.nombre + '.') : '¡El nivel más alto!';
      }
    }

    /* ---- Marcar visto + desbloquear "inicio" ---- */
    function marcarVista(id) {
      if (!estado.vistas[id]) {
        estado.vistas[id] = true;
        if (id === 'introduccion') { unlockBadge('inicio'); award(5, 'curso empezado'); }
        persistState();
      }
      refreshSidenav();
      if (typeof refrescarGlosario === 'function') refrescarGlosario();
    }

    function refreshSidenav() {
      // Máximo índice visitado hasta ahora — no se usa motor.current()
      // a propósito: el primer slidechange lo emite el propio
      // constructor de Motor (go(0,true) al final de _init()), ANTES
      // de que `window.motor = new Motor(document)` termine de asignar
      // la variable — leerla acá adentro tira "motor is not defined".
      // estado.vistas ya incluye la diapositiva actual (marcarVista la
      // marca antes de llamar acá), así que el máximo es equivalente.
      var ordenActual = Object.keys(estado.vistas).reduce(function (max, id) {
        var el = document.querySelector('[data-slide="' + id + '"]');
        var orden = el ? +el.getAttribute('data-slide-index') : 0;
        return Math.max(max, orden);
      }, 0);
      document.querySelectorAll('.d-sidenav-item[data-goto]').forEach(function (b) {
        var id = b.getAttribute('data-goto');
        var visto = !!estado.vistas[id];
        b.classList.toggle('is-done', visto);
        // No deja saltar adelante — solo hacia diapositivas ya vistas
        // (addendum §8: mismo criterio que initIndexJumps).
        var el = document.querySelector('[data-slide="' + id + '"]');
        var orden = el ? +el.getAttribute('data-slide-index') : 0;
        b.disabled = !visto && orden > ordenActual;
      });
    }

    renderBadges();
    var badgeCount = document.getElementById('d-badge-count');
    if (badgeCount) badgeCount.textContent = Object.keys(estado.logros).length + '/' + BADGES.length;
    var pointsEl = document.getElementById('d-points');
    if (pointsEl) pointsEl.textContent = estado.puntos;
    actualizarMensajeGateConceptos();

    // Barra de progreso arrastrable + gate de contenido (CLAUDE.md §7.9.8).
    motor.restoreMaxVisited(estado.vistas);

    if (window.SCORM) SCORM.commit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
