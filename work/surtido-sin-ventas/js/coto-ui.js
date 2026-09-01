/* ============================================================
   coto-ui.js · Comportamientos de interfaz reusables entre cursos
   kit-base v1.7 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual a cada curso nuevo, sin editar.
   ------------------------------------------------------------
   Extraído de "Prevención cardiovascular" (staggerReveal /
   initPopupStagger / initPopupNarration / initStatPopups /
   precargarVecinas / initSummaryPrint / tonos de UI en su curso.js).
   Ninguna de estas funciones lee contenido del curso: trabajan sobre
   atributos data-* y clases del sistema de diseño (CLAUDE.md §1).

   Contenido:
     · initPopupNarration()   narra pop-ups al abrirlos; [data-narrate-only]
     · initPopupStagger()     entrada escalonada del contenido del pop-up
     · staggerReveal(hd, bd)  la misma cascada, a mano (mini-práctica, cierre)
     · initStatPopups()       números que cuentan de 0 a N ([data-count-to])
     · initPrefetchNeighbors() precarga las diapositivas vecinas
     · initSummaryPrint()     imprimir el resumen final
     · initTiempoActivo()     reloj que descuenta el tiempo de video
     · tiempoActivoMs()       ms de recorrido real (sin videos)
     · Sonidos de UI: tone / sCorrect / sWrong / sStreak / sWin

   Uso (desde boot(), en cualquier orden):
     initPopupNarration();      // usa Narrador.textOf por debajo
     initPopupStagger();
     initStatPopups();
     initPrefetchNeighbors();   // se engancha solo a `slidechange`
     initSummaryPrint();

   TODO respeta `prefers-reduced-motion` y el mute global
   (`localStorage['coto-diapos-mute']`), igual que fx.js.
   ============================================================ */
(function (global) {
  'use strict';

  var prefersReduced = global.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function popEl(id) { return document.querySelector('[data-popup="' + id + '"]'); }

  /* ---- Narración de pop-ups ----------------------------------------
     CLAUDE.md §5: los pop-ups se narran solos al abrirse y se callan al
     cerrarse. El reproductor de video queda afuera a propósito — ahí la
     voz taparía el audio del propio video.

     `[data-narrate-only]` acota QUÉ se narra dentro de un pop-up: es la
     distinción "narración obligatoria vs. opcional" que pide el Manual
     de Contenido (CLAUDE.md §6.5), resuelta de forma genérica en el
     marcado en vez de con una regla nueva de código. Nació de un caso
     concreto en "Prevención cardiovascular": al ampliar el glosario a
     16 términos, narrarlo entero pasaba de ~50 segundos a MÁS DE 3
     MINUTOS de locución seguida — y un glosario es material de
     CONSULTA (se abre para buscar un término puntual), no algo para
     escuchar de corrido. Con el atributo sobre la frase de entrada se
     narra solo eso y el resto queda para leer. Sin el atributo, se
     narra el pop-up entero como siempre.

       <div class="modal-card">
         <div class="modal-hd modal-hd--dark">…</div>
         <div class="modal-bd">
           <p class="d-glossary-intro" data-narrate-only>Frase que sí se narra.</p>
           <dl>… 16 términos que NO se narran …</dl>
   -------------------------------------------------------------------- */
  function initPopupNarration(opts) {
    opts = opts || {};
    var skip = opts.skip || ['video-player'];
    function skipped(id) { return skip.indexOf(id) !== -1; }

    document.addEventListener('popupopen', function (e) {
      if (skipped(e.detail.id)) return;
      var pop = popEl(e.detail.id);
      if (!pop) return;
      var scope = pop.querySelector('[data-narrate-only]') || pop.querySelector('.modal-card');
      if (scope) global.Narrador.speak(global.Narrador.textOf(scope), 'other');
    });
    document.addEventListener('popupclose', function (e) {
      if (skipped(e.detail.id)) return;
      global.Narrador.cancel();
    });
  }

  /* ---- Entrada escalonada (título → párrafo → elementos) ------------
     Le pone `.d-stagger-in` (css/coto-base.css) a cada hijo directo de
     `hd`/`bd` con un animation-delay creciente, y hace lo mismo UN
     NIVEL más adentro con cualquier grilla conocida (logros, accesos
     rápidos, stats del cierre) para que esas tarjetas entren en cascada
     entre sí y no todas juntas como "un elemento más" de la lista de
     afuera.

     ⚠️ Regla de uso, decidida con el cliente: se llama SOLO sobre HTML
     real (pop-ups, mini-práctica, resumen del cierre) — NUNCA sobre las
     diapositivas-captura. Una captura es UNA sola imagen con el texto
     horneado adentro (CLAUDE.md §2.8): no tiene título ni párrafo
     separados que puedan entrar por turnos, así que "animar la entrada
     de sus elementos" no es posible sin volver a pedirle al diseñador
     las piezas sueltas con alfa (CLAUDE.md §3.3, la excepción cara).
     El `void el.offsetWidth` entre remove y add es obligatorio: fuerza
     un reflow para que la animación se reinicie si el mismo pop-up se
     vuelve a abrir (sin eso, la 2ª apertura no anima nada).
   -------------------------------------------------------------------- */
  var STAGGER_GRIDS = '.d-badges-grid, .d-instr-grid, .d-cert-stats';
  function staggerReveal(hd, bd) {
    if (prefersReduced) return;
    var items = [];
    if (hd) items.push(hd);
    if (bd) items.push.apply(items, bd.children);
    /* BUG REAL ("Seguridad alimentaria", pop-up de predicción antes de
       un video): un hijo que arranca `hidden` (feedback, botón
       "Continuar" que solo aparece después de responder) igual
       recibía `.d-stagger-in` acá. Con `display:none` en ese momento
       la animación nunca arranca, y sacar el `hidden` más tarde NO la
       reinicia sola (confirmado en Chromium: queda pegada en el
       fotograma `from`, `opacity:0`, para siempre — ver CLAUDE.md).
       Animar la entrada de algo invisible no tiene sentido de todos
       modos, así que se filtra ACÁ: el curso no tiene que acordarse de
       anular la animación a mano en cada elemento que revela después. */
    items = items.filter(function (el) { return !el.hidden; });
    items.forEach(function (el, i) {
      el.classList.remove('d-stagger-in'); void el.offsetWidth;
      el.style.animationDelay = (i * 70) + 'ms';
      el.classList.add('d-stagger-in');
    });
    var root = bd || hd; if (!root) return;
    root.querySelectorAll(STAGGER_GRIDS).forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (child, i) {
        child.classList.remove('d-stagger-in'); void child.offsetWidth;
        child.style.animationDelay = (i * 60) + 'ms';
        child.classList.add('d-stagger-in');
      });
    });
  }

  function initPopupStagger(opts) {
    opts = opts || {};
    // El reproductor de video y el índice lateral quedan afuera: el
    // primero no tiene contenido que escalonar (es un <video> solo) y el
    // segundo es navegación — escalonar 20 ítems retrasa el clic real.
    var skip = opts.skip || ['video-player', 'sidenav'];
    document.addEventListener('popupopen', function (e) {
      if (skip.indexOf(e.detail.id) !== -1) return;
      var pop = popEl(e.detail.id);
      if (!pop) return;
      staggerReveal(pop.querySelector('.modal-hd'), pop.querySelector('.modal-bd'));
    });
  }

  /* ---- Números animados de pop-ups de estadística -------------------
     Cualquier <span data-count-to="N"> dentro de un pop-up cuenta de 0 a
     N al abrirse, una sola vez por elemento (se marca con data-counted
     para no reiniciar si se vuelve a abrir el mismo pop-up).
     ⚠️ El mismo atributo lo lee `Narrador.textOf` para narrar el valor
     FINAL en vez del que esté en pantalla a mitad de la animación (bug
     real: se narraba "disminuir 0% de la mortalidad" en vez de 50%).
     O sea: el atributo no es decorativo, es la fuente de verdad del
     número — no reemplazarlo por el textContent inicial.
   -------------------------------------------------------------------- */
  /* ---- Contador animado, genérico (kit-base v1.9.43) ----
     Generalización real de lo que `initStatPopups` (abajo) ya hacía
     ad-hoc: "0→N, ease-out, UNA sola vez, al abrir un pop-up". Esa
     versión no sirve para un contador que cambia REPETIDAS veces en la
     vida del curso — el caso real que la motivó: el chip de puntos del
     header, que sube en cada `award()` del curso (contenido, no vive
     acá). Diferencias con la versión vieja:
       · `from` opcional — si no se pasa, arranca del `textContent`
         actual del elemento (para que cada llamada nueva sea relativa
         a donde quedó la anterior, no siempre desde 0).
       · Token por elemento — si llega una llamada nueva mientras la
         anterior todavía está animando (dos `award()` seguidos), la
         vieja se corta sola en su próximo frame en vez de pelear por
         el mismo `textContent` (dos `requestAnimationFrame` escribiendo
         el mismo nodo a la vez parpadea/salta). */
  function countTo(el, to, opts) {
    if (!el) return;
    opts = opts || {};
    var from = opts.from;
    if (from == null) {
      var actual = parseInt(String(el.textContent).replace(/[^\d-]/g, ''), 10);
      from = isNaN(actual) ? 0 : actual;
    }
    if (prefersReduced) { el.textContent = String(to); return; }
    var dur = opts.dur || 500;
    var token = (el._countToToken = (el._countToToken || 0) + 1);
    var t0 = null;
    function step(ts) {
      if (el._countToToken !== token) return; // una llamada más nueva la reemplazó
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cúbico
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initStatPopups() {
    document.addEventListener('popupopen', function (e) {
      var pop = popEl(e.detail.id);
      if (!pop) return;
      Array.prototype.forEach.call(pop.querySelectorAll('[data-count-to]'), function (el) {
        var target = parseInt(el.getAttribute('data-count-to'), 10);
        if (el.dataset.counted || isNaN(target)) return;
        el.dataset.counted = '1';
        countTo(el, target, { from: 0, dur: 900 });
      });
    });
  }

  /* ---- Precarga de las diapositivas vecinas -------------------------
     Cada diapositiva es un .webp de página completa (~100-250 KB). Al
     entrar por primera vez, el navegador recién ahí la pide: en una
     conexión de sucursal se ve un parpadeo en blanco justo al avanzar.
     Precargar la siguiente (y la anterior, para el que retrocede)
     mientras el alumno lee la actual elimina ese salto sin costo
     perceptible. Se engancha solo a `slidechange` y corre una vez para
     la diapositiva inicial.
   -------------------------------------------------------------------- */
  function initPrefetchNeighbors() {
    var ya = {};
    function precargar(index) {
      [index + 1, index - 1].forEach(function (i) {
        var vecina = global.motor && global.motor.slides[i];
        if (!vecina) return;
        vecina.querySelectorAll('img[src]').forEach(function (img) {
          var src = img.getAttribute('src');
          if (!src || ya[src]) return;
          ya[src] = true;
          var pre = new Image();
          pre.src = src;
        });
      });
    }
    document.addEventListener('slidechange', function (e) { precargar(e.detail.index); });
    var cur = global.motor && global.motor.current();
    if (cur) precargar(+cur.getAttribute('data-slide-index'));
  }

  /* ---- Imprimir el resumen final ------------------------------------
     `body.printing-summary` es la clase que el CSS del curso usa para
     dejar visible SOLO el resumen al imprimir. El `setTimeout` cubre los
     navegadores donde `window.print()` no bloquea y `afterprint` no
     dispara (Safari); tener los dos no hace daño — sacar la clase dos
     veces es inocuo, dejarla puesta rompe la pantalla.
   -------------------------------------------------------------------- */
  function initSummaryPrint(opts) {
    opts = opts || {};
    var btn = document.getElementById(opts.buttonId || 'd-summary-print');
    if (!btn) return;
    function limpiar() { document.body.classList.remove('printing-summary'); }
    btn.addEventListener('click', function () {
      document.body.classList.add('printing-summary');
      global.print();
      setTimeout(limpiar, 400);
    });
    global.addEventListener('afterprint', limpiar);
  }

  /* ---- Reloj de tiempo ACTIVO ---------------------------------------
     kit-base v1.8. Devuelve cuánto tiempo estuvo la persona RECORRIENDO
     el curso, descontando lo que duró mirar videos.

     Por qué existe: en un curso con 9 videos, la duración del material
     se lleva la mayor parte del número, y "20 min" termina diciendo más
     sobre lo que dura el video que sobre el recorrido de quien lo hizo.
     El reloj se frena mientras haya CUALQUIER <video> reproduciéndose y
     sigue cuando termina.

     Detalle que se paga caro si se hace mal: los videos en curso se
     llevan en una LISTA, no en un contador. Al terminar un video se
     disparan `pause` Y `ended` — con un contador simple quedaría en
     negativo y el reloj no volvería a arrancar nunca.

     ⚠️ Esto es solo el número que se le muestra al alumno.
     `cmi.core.session_time` de SCORM (scorm-api.js) sigue midiendo la
     sesión REAL: el estándar define ese campo como el tiempo que el SCO
     estuvo abierto, así que descontarle los videos sería reportarle mal
     al LMS.

     Uso:
       initTiempoActivo();                       // una vez, en boot()
       tiempoActivoMs();                         // ms de recorrido real
   -------------------------------------------------------------------- */
  var _reloj = { acumulado: 0, desde: Date.now(), enCurso: [] };
  function relojParar(v) {
    if (_reloj.enCurso.indexOf(v) !== -1) return;
    if (_reloj.enCurso.length === 0) _reloj.acumulado += Date.now() - _reloj.desde;
    _reloj.enCurso.push(v);
  }
  function relojSeguir(v) {
    var i = _reloj.enCurso.indexOf(v);
    if (i === -1) return;
    _reloj.enCurso.splice(i, 1);
    if (_reloj.enCurso.length === 0) _reloj.desde = Date.now();
  }
  function tiempoActivoMs() {
    return _reloj.acumulado + (_reloj.enCurso.length ? 0 : Date.now() - _reloj.desde);
  }
  function initTiempoActivo() {
    // en fase de CAPTURA: los eventos de <video> no burbujean
    document.addEventListener('play', function (e) {
      if (e.target && e.target.tagName === 'VIDEO') relojParar(e.target);
    }, true);
    ['pause', 'ended', 'emptied'].forEach(function (ev) {
      document.addEventListener(ev, function (e) {
        if (e.target && e.target.tagName === 'VIDEO') relojSeguir(e.target);
      }, true);
    });
  }

  /* ---- Sonidos de UI (tonos sintetizados, Web Audio API) ------------
     Mismo criterio que fx.js (respetan el mute global y
     prefers-reduced-motion) pero separados: fx.js es decoración de
     CUALQUIER interacción, esto es el vocabulario sonoro de
     actividades (acierto / error / racha / victoria). Sin archivos de
     audio: se sintetizan, así el curso no suma peso al paquete SCORM.
   -------------------------------------------------------------------- */
  var actx;
  /* No se crea el AudioContext hasta que hubo un gesto real del alumno
     (kit-base v1.9.52). Chrome bloquea todo AudioContext creado antes
     del primer gesto y escupe "The AudioContext was not allowed to
     start" en la consola de CADA carga del curso — verificado en
     Chromium headless con un curso mínimo del kit: el `slidechange`
     inicial (el `go()` que hace `new Motor()`) dispara el whoosh antes
     de que nadie haya tocado nada. Ese sonido no se escuchaba igual
     (el contexto nace `suspended`), así que lo único que dejaba era el
     warning y un contexto colgado. El flag se prende con el primer
     `pointerdown`/`keydown` en captura — a partir de ahí todo suena
     como siempre. */
  var huboGesto = false;
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function () { huboGesto = true; }, { capture: true, once: true });
  });
  function ac() {
    if (!huboGesto) return null;
    if (!actx) { try { actx = new (global.AudioContext || global.webkitAudioContext)(); } catch (e) {} }
    return actx;
  }
  function muted() { try { return global.localStorage.getItem('coto-diapos-mute') === '1'; } catch (e) { return false; } }
  // Nivel de volumen (0-1, panel de "Sonido" — kit-base v1.9.35, coto-player.js).
  // Mismo criterio que `muted()`: helper chico duplicado por archivo, no un
  // módulo compartido — cada archivo del kit se copia solo, sin depender
  // de que otro haya cargado antes.
  function volumeLevel() {
    try {
      var v = parseFloat(global.localStorage.getItem('coto-diapos-volume'));
      return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
    } catch (e) { return 1; }
  }
  function tone(f, d, type, vol, when) {
    if (muted() || prefersReduced) return;
    var vl = volumeLevel();
    if (vl <= 0) return;
    var c = ac(); if (!c) return;
    var t0 = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime((vol == null ? .12 : vol) * vl, t0 + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + .03);
  }
  function sCorrect() { tone(660, .12, 'sine', .14); tone(880, .16, 'sine', .12, .09); }
  function sWrong() { tone(220, .22, 'sawtooth', .1); }
  function sStreak() { tone(880, .1, 'sine', .13); tone(1100, .12, 'sine', .12, .08); tone(1320, .16, 'sine', .12, .16); }
  function sWin() { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .18, 'triangle', .12, i * .09); }); }


  /* ============================================================
     initIndexJumps(opts) — índice clicable, pero solo hacia atrás
     ------------------------------------------------------------
     kit-base v1.9.9 · Una diapositiva de índice con hitboxes que
     saltan a cada sección. El punto fino, y la razón de que esto sea
     genérico: **solo se habilitan los destinos ya visitados**. Un
     índice que salta libre hacia adelante ANULA cualquier gate de
     obligatoriedad del curso (abrir fichas, ver videos, aprobar un
     juego), porque los gates se evalúan al avanzar de a una. El
     atajo sirve para volver, no para adelantarse.

     Los destinos bloqueados quedan `disabled`: salen del orden de
     tabulación solos, sin tocar tabindex, y el lector de pantalla lee
     el motivo en vez de ofrecer un botón que no hace nada.

       opts.selector  CSS de las hitboxes (def. '.d-shot-hit--indice')
       opts.visited   fn(idDestino) -> bool  (OBLIGATORIA)
       opts.lockedLabel fn(labelBase) -> texto alternativo

     Llamar `refresh()` (lo devuelve) cada vez que cambie lo visitado.
     ============================================================ */
  function initIndexJumps(opts) {
    opts = opts || {};
    var sel = opts.selector || '.d-shot-hit--indice';
    var visited = opts.visited;
    if (typeof visited !== 'function') return function () {};
    var lockedLabel = opts.lockedLabel || function (base) {
      return base.replace(/^Ir a /, 'Todavía no llegaste a ') +
        ' (se habilita cuando pases por ahí)';
    };

    function refresh() {
      document.querySelectorAll(sel + '[data-goto]').forEach(function (b) {
        var abierto = !!visited(b.getAttribute('data-goto'));
        b.disabled = !abierto;
        b.classList.toggle('is-open', abierto);
        var lbl = b.querySelector('.sr-only');
        if (!lbl) return;
        if (!b.dataset.lblBase) b.dataset.lblBase = lbl.textContent;
        lbl.textContent = abierto ? b.dataset.lblBase : lockedLabel(b.dataset.lblBase);
      });
    }
    refresh();
    return refresh;
  }

  /* ============================================================
     initPopupPrefetch(opts) — precargar los pop-ups de una diapositiva
     ------------------------------------------------------------
     kit-base v1.9.9 · `initPrefetchNeighbors` precarga las
     DIAPOSITIVAS vecinas, pero deja afuera los pop-ups: el primer
     pop-up con imagen pesada que abrías se veía cargar en blanco. Este
     lee, de la diapositiva activa, un atributo con la lista de ids de
     pop-up que va a necesitar, y precarga sus imágenes al entrar — para
     cuando el alumno toca el primer botón, ya están en caché.

     `fetchPriority='low'` a propósito: no tiene que pelear ancho de
     banda con el video de fondo ni con la diapositiva siguiente.

       opts.attr     atributo con los ids (def. 'data-require-fichas')
       opts.imgSel   qué imagen del pop-up precargar (def. '.d-shot-img')
     ============================================================ */
  function initPopupPrefetch(opts) {
    opts = opts || {};
    var attr = opts.attr || 'data-require-fichas';
    var imgSel = opts.imgSel || '.d-shot-img';
    var hechas = {};

    function precargar(slideEl) {
      if (!slideEl) return;
      (slideEl.getAttribute(attr) || '').split(/\s+/).filter(Boolean).forEach(function (id) {
        if (hechas[id]) return;
        hechas[id] = true;
        var img = document.querySelector('[data-popup="' + id + '"] ' + imgSel);
        var src = img && img.getAttribute('src');
        if (!src) return;
        var pre = new Image();
        if ('fetchPriority' in pre) pre.fetchPriority = 'low';
        pre.src = src;
      });
    }

    document.addEventListener('slidechange', function () {
      precargar(global.motor && global.motor.current());
    });
    precargar(global.motor && global.motor.current());
    return precargar;
  }

  /* ============================================================
     initGlossarySearch(opts) — buscador rápido del glosario
     ------------------------------------------------------------
     kit-base v1.9.22. 100% genérico: no sabe qué términos tiene el
     curso, solo filtra los `<dt>/<dd>` de cualquier `dl.d-glossary`
     dentro del pop-up de glosario por coincidencia de texto (sin
     distinguir mayúsculas ni acentos, así "peligro quimico" encuentra
     "Peligro químico"). Si una sección entera (su `<dl>`) queda sin
     resultados, se oculta junto con el encabezado que la precede — un
     `<h4>` "colgado" sin nada debajo se lee como un bug, no como un
     filtro funcionando.

       opts.popup   selector del pop-up (def. '[data-popup="glosario"]')
       opts.input   selector del campo de búsqueda (def. '[data-gloss-search]')
       opts.empty   selector del mensaje "sin resultados" (opcional,
                    def. '[data-gloss-empty]')

     Uso: initGlossarySearch();  // una vez, en boot()
     ============================================================ */
  function quitarAcentos(s) {
    return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function initGlossarySearch(opts) {
    opts = opts || {};
    var popup = document.querySelector(opts.popup || '[data-popup="glosario"]');
    if (!popup) return;
    var input = popup.querySelector(opts.input || '[data-gloss-search]');
    var empty = popup.querySelector(opts.empty || '[data-gloss-empty]');
    if (!input) return;

    var listas = Array.prototype.slice.call(popup.querySelectorAll('dl.d-glossary'));
    function filtrar() {
      var q = quitarAcentos(input.value.trim().toLowerCase());
      var totalVisible = 0;
      listas.forEach(function (dl) {
        var pares = [];
        Array.prototype.forEach.call(dl.children, function (el) {
          if (el.tagName === 'DT') pares.push({ dt: el, dd: null });
          else if (el.tagName === 'DD' && pares.length) pares[pares.length - 1].dd = el;
        });
        var visiblesEnLista = 0;
        pares.forEach(function (par) {
          // Un término bloqueado (initGlossaryUnlock, ver más abajo) nunca
          // entra en los RESULTADOS de una búsqueda con texto — su
          // definición real sigue en el DOM (oculta por CSS, no por este
          // filtro) para el día en que se desbloquee, pero no debería
          // poder "encontrarse" buscando antes de eso. Sin texto de
          // búsqueda (q vacío) sí se muestra, con su candado — es la
          // vista normal del glosario, no un resultado de búsqueda.
          var bloqueado = par.dt.classList.contains('is-locked');
          var texto = quitarAcentos((par.dt.textContent + ' ' + (par.dd ? par.dd.textContent : '')).toLowerCase());
          var visible = !q ? true : (!bloqueado && texto.indexOf(q) !== -1);
          par.dt.hidden = !visible;
          if (par.dd) par.dd.hidden = !visible;
          if (visible) visiblesEnLista++;
        });
        dl.hidden = visiblesEnLista === 0;
        var heading = dl.previousElementSibling;
        if (heading && /^H[1-6]$/.test(heading.tagName)) heading.hidden = visiblesEnLista === 0;
        totalVisible += visiblesEnLista;
      });
      if (empty) empty.hidden = totalVisible !== 0;
    }
    input.addEventListener('input', filtrar);
    filtrar();
  }

  /* ============================================================
     initGlossaryUnlock(opts) — glosario progresivo (candado hasta
     visitar la diapositiva que explica el término)
     ------------------------------------------------------------
     kit-base v1.9.28. 100% genérico: no sabe qué términos tiene el
     curso ni a qué diapositiva corresponde cada uno — eso vive en el
     propio marcado, con el MISMO atributo que ya usa el índice/
     sidenav para saltar (`data-goto="<slide-id>"`, dentro del <dt>):
     `new Motor()` ya lo cablea solo al arrancar (cierra cualquier
     pop-up abierto y navega, gratis — `Motor.prototype.go`), así que
     "hacer clic en un término te lleva a la diapositiva" no necesita
     ningún JS nuevo, alcanza con poner el atributo en el marcado.
     Este módulo solo decide bloqueado/desbloqueado, dejando la fuente
     de verdad (¿ya se vio esa diapositiva?) del lado del curso vía
     callback — igual que `initProgressSeek`/`visitedIndexes()` no
     sabe de dónde sale "visto", solo pregunta.

     Marcado esperado por término, dentro de cualquier `dl.d-glossary`:
       <dt><button data-goto="slide-id">Término</button>
         <svg data-gloss-lock aria-hidden="true">...candado...</svg>
       </dt>
       <dd><span class="d-gloss-def">Definición real.</span>
           <span class="d-gloss-hint">Se desbloquea al llegar a "...".</span></dd>
     El CSS (`coto-base-addendum-v1.8.css`) se encarga de mostrar el
     candado + el hint y ocultar `.d-gloss-def` mientras el <dt> tenga
     la clase `.is-locked` — este módulo solo pone/saca esa clase.

       opts.popup      selector del pop-up (def. '[data-popup="glosario"]')
       opts.seen(id)   función que devuelve true si esa diapositiva
                       (el `data-goto` del término) ya fue vista
       opts.onUnlock(labels) callback opcional: se llama con la lista
                       de nombres de término que pasaron de bloqueado a
                       desbloqueado EN ESA llamada — para disparar un
                       toast ("🔓 Desbloqueaste..."). Nunca se llama en
                       la primera pasada (arranque): un progreso ya
                       restaurado no es una notificación nueva, es
                       estado que se está aplicando en silencio.

     Devuelve una función `refresh()` — el curso la llama de nuevo en
     cada `slidechange` (después de actualizar su propio "visto") para
     que el glosario reaccione en caliente mientras el pop-up puede
     estar abierto o no.

     Uso:
       var refrescarGlosario = initGlossaryUnlock({
         seen: function (id) { return !!estado.vistas[id]; },
         onUnlock: function (labels) {
           if (Player) Player.toast('🔓 ' + (labels.length === 1
             ? 'Desbloqueaste "' + labels[0] + '"'
             : 'Desbloqueaste ' + labels.length + ' términos') + ' del glosario');
         }
       });
       document.addEventListener('slidechange', function (e) {
         estado.vistas[e.detail.id] = true;
         refrescarGlosario();
       });
     ============================================================ */
  function initGlossaryUnlock(opts) {
    opts = opts || {};
    var popup = document.querySelector(opts.popup || '[data-popup="glosario"]');
    if (!popup) return function () {};
    var seen = opts.seen || function () { return true; };

    var terminos = Array.prototype.map.call(popup.querySelectorAll('dl.d-glossary dt'), function (dt) {
      var link = dt.querySelector('[data-goto]');
      if (!link) return null;
      return { dt: dt, link: link, id: link.getAttribute('data-goto'), label: link.textContent, bloqueado: true };
    }).filter(Boolean);

    /* BUG REAL, reportado ("el glosario rompe el bloqueo de avanzar de
       a 1 diapo") — kit-base v1.9.42. Mismo patrón que ya se corrigió
       en el índice lateral (§6.44 punto 2, `.d-sidenav-item:disabled`):
       `.is-locked` solo apagaba el color del término, nunca el botón —
       `data-goto` en un `<button>` sigue siendo clickeable/enfocable
       aunque el `<dt>` que lo envuelve se vea bloqueado. El motor
       (`[data-goto]`, spec-motor-slides.md §4) navega SIN chequear
       ningún gate — eso es correcto para volver a lo ya visto (el
       índice), pero un término TODAVÍA bloqueado apunta a una
       diapositiva que el alumno nunca visitó: un clic ahí saltaba
       directo, saltándose cualquier interacción/gate de las
       diapositivas intermedias. `link.disabled = true` en un `<button>`
       nativo alcanza — un botón deshabilitado no dispara `click` (el
       browser ni siquiera lo entrega al listener del motor), así que
       no hace falta tocar nada del lado de `motor-slides.js`. */
    function refresh(silencioso) {
      var desbloqueados = [];
      terminos.forEach(function (t) {
        var visto = !!seen(t.id);
        if (!silencioso && t.bloqueado && visto) desbloqueados.push(t.label);
        t.bloqueado = !visto;
        t.dt.classList.toggle('is-locked', !visto);
        t.link.disabled = !visto;
      });
      if (desbloqueados.length && opts.onUnlock) opts.onUnlock(desbloqueados);
    }
    refresh(true); // aplica el estado ya restaurado sin avisar (no es "nuevo")
    return refresh;
  }

  /* `CotoUI` es el namespace documentado; los alias sueltos de más
     abajo existen para que `curso.js` llame corto. `initIndexJumps` e
     `initPopupPrefetch` estaban SOLO en los alias y faltaban acá
     (kit-base v1.9.52) — una asimetría silenciosa: quien seguía el
     namespace se encontraba con que dos de las funciones del archivo
     no existían ahí, sin ninguna razón. */
  global.CotoUI = {
    initTiempoActivo: initTiempoActivo,
    tiempoActivoMs: tiempoActivoMs,
    initPopupNarration: initPopupNarration,
    initPopupStagger: initPopupStagger,
    staggerReveal: staggerReveal,
    countTo: countTo,
    initStatPopups: initStatPopups,
    initPrefetchNeighbors: initPrefetchNeighbors,
    initPopupPrefetch: initPopupPrefetch,
    initSummaryPrint: initSummaryPrint,
    initIndexJumps: initIndexJumps,
    initGlossarySearch: initGlossarySearch,
    initGlossaryUnlock: initGlossaryUnlock,
    tone: tone, sCorrect: sCorrect, sWrong: sWrong, sStreak: sStreak, sWin: sWin
  };
  // Alias sueltos, para que el curso.js las llame igual que antes.
  global.initGlossarySearch = initGlossarySearch;
  global.initGlossaryUnlock = initGlossaryUnlock;
  global.initTiempoActivo = initTiempoActivo;
  global.tiempoActivoMs = tiempoActivoMs;
  global.initPopupNarration = initPopupNarration;
  global.initPopupStagger = initPopupStagger;
  global.staggerReveal = staggerReveal;
  global.countTo = countTo;
  global.initStatPopups = initStatPopups;
  global.initPrefetchNeighbors = initPrefetchNeighbors;
  global.initSummaryPrint = initSummaryPrint;
  global.initIndexJumps = initIndexJumps;
  global.initPopupPrefetch = initPopupPrefetch;
})(window);
