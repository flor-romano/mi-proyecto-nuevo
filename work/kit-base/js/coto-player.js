/* ============================================================
   coto-player.js · Controles del reproductor (barra superior e inferior)
   kit-base v1.7 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual a cada curso nuevo, sin editar.
   ------------------------------------------------------------
   Todo el "chrome" que cada curso venía reescribiendo de cero en su
   propio curso.js: saludo con el nombre del alumno, botones de sonido /
   locución / pantalla completa, selector manual de voz, barra de
   progreso arrastrable, avisos flotantes (toast) y banner de "retomá
   donde dejaste". Ninguna de estas funciones lee contenido del curso —
   solo IDs del boilerplate del header/footer (ver
   header-boilerplate.html) y la API del motor.

   Pareja de: coto-player-chrome.css + coto-player-bottom.css.

   Uso (una sola llamada, después de crear el Motor):
     var Player = initPlayer({
       speakSlide: function (slideEl) { Narrador.speak(textOf(slideEl), 'slide'); },
       // Índices de diapositiva ya visitados — el tope real hasta donde
       // se puede ARRASTRAR la barra hacia adelante (ver initProgressSeek).
       visitedIndexes: function () {
         return Object.keys(state.vistas).map(function (id) {
           var el = document.querySelector('[data-slide="' + id + '"]');
           return el ? +el.getAttribute('data-slide-index') : -1;
         });
       }
     });
     Player.toast('texto');   // el curso lo usa para sus propios avisos
   ============================================================ */
(function (global) {
  'use strict';

  function initPlayer(opts) {
    opts = opts || {};
    var speakSlide = opts.speakSlide || function () {};
    var visitedIndexes = opts.visitedIndexes || function () { return []; };

    /* ---- Aviso flotante ---- */
    var toastEl = null, toastTimer = null;
    function toast(text, ms) {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'd-award-toast';
        toastEl.setAttribute('aria-live', 'polite');
        document.body.appendChild(toastEl);
      }
      toastEl.textContent = text;
      toastEl.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 2200);
    }

    /* ---- Saludo con el nombre del alumno ----
       El emoji va en su propio <span class="ic"> (no pegado al texto)
       para poder ocultarlo aparte en pantallas angostas sin tocar el
       nombre. Se arma con createTextNode y NO con innerHTML porque `n`
       viene del LMS (cmi.core.student_name): no hay que confiar en que
       nunca traiga caracteres raros. */
    function initGreeting() {
      var el = document.getElementById('d-greet');
      if (!el || !global.SCORM) return;
      var n = global.SCORM.getFirstName();
      if (!n) return;
      el.textContent = '';
      var ic = document.createElement('span');
      ic.className = 'ic'; ic.setAttribute('aria-hidden', 'true'); ic.textContent = '👋';
      el.appendChild(ic);
      el.appendChild(document.createTextNode(' Hola, ' + n));
      el.hidden = false;
    }

    /* ---- Sonido (mute global, compartido con fx.js vía localStorage) ---- */
    function initSoundToggle() {
      var btn = document.getElementById('d-sound');
      if (!btn) return;
      var LS = 'coto-diapos-mute';
      var LS_VOL = 'coto-diapos-volume';
      var muted = false;
      try { muted = localStorage.getItem(LS) === '1'; } catch (e) {}
      /* BUG REAL, pedido del cliente ("Sonido debería mutear todo el
         curso, sin excepción"): esto solo tocaba `localStorage`, que
         fx.js/coto-ui.js SÍ leen (efectos de UI) pero coto-media.js no
         leía (los 3 patrones de video del kit — fondo, pop-up, círculo
         inline — seguían sonando aparte). coto-media.js ya lee la
         misma marca al ARRANCAR cada video (próxima vez que se
         reproduce, ya sale mudo/con sonido según corresponda), pero un
         video de FONDO ya sonando en el momento del click (portada,
         separador de unidad) necesita que ALGUIEN le toque `.muted`
         ahí mismo — nadie lo hacía. */
      /* Volumen (pedido de producto, kit-base v1.9.35): antes "Sonido"
         era on/off puro. `volume` es el nivel real (0-1), separado del
         flag `muted` — igual que cualquier control de volumen real
         (sistema operativo, YouTube): arrastrar el slider a >0 con el
         sonido muteado desmutea solo (si no, mover la barra "no hace
         nada" a los ojos del alumno); el ícono/estado "silenciado" se
         calcula con `efectivoMudo()` = muted O volumen en 0, sin
         necesidad de mezclar los dos datos en un solo flag. */
      var volume = 1;
      try {
        var savedVol = parseFloat(localStorage.getItem(LS_VOL));
        if (!isNaN(savedVol)) volume = Math.min(1, Math.max(0, savedVol));
      } catch (e) {}

      var popMuteBtn = document.getElementById('d-vol-mute-btn');
      var range = document.getElementById('d-vol-range');
      var pct = document.getElementById('d-vol-pct');
      var barsWrap = document.getElementById('d-vol-bars');
      var barEls = barsWrap ? Array.prototype.slice.call(barsWrap.children) : [];

      function efectivoMudo() { return muted || volume <= 0; }
      function syncVideos() {
        document.querySelectorAll('video').forEach(function (v) {
          v.muted = efectivoMudo();
          v.volume = volume;
        });
      }
      function sync() {
        var off = efectivoMudo();
        btn.classList.toggle('is-muted', off);
        btn.setAttribute('aria-pressed', off ? 'false' : 'true');
        btn.setAttribute('aria-label', off ? 'Activar sonido' : 'Silenciar sonido');
        if (popMuteBtn) {
          popMuteBtn.classList.toggle('is-muted', off);
          popMuteBtn.setAttribute('aria-pressed', off ? 'true' : 'false');
          popMuteBtn.setAttribute('aria-label', off ? 'Activar sonido' : 'Silenciar sonido');
        }
        var pctVal = Math.round(volume * 100);
        if (range) range.value = String(pctVal);
        if (pct) pct.textContent = pctVal + '%';
        // Ecualizador decorativo: cuántas barras "prenden" es proporcional
        // al volumen — puramente visual, no representa audio real (no
        // hay forma confiable de leer el espectro de un <video> remoto
        // sin enredarse con CORS); apagado entero si está mudo.
        var prendidas = off ? 0 : Math.round((volume * barEls.length));
        barEls.forEach(function (b, i) { b.classList.toggle('is-on', i < prendidas); });
        syncVideos();
      }
      sync();

      function toggleMute() {
        muted = !muted;
        try { localStorage.setItem(LS, muted ? '1' : '0'); } catch (e) {}
        sync();
        /* Solo acá, nunca en el `input` del slider de abajo (kit-base
           v1.9.40): "Sonido" ahora también gobierna el volumen de la
           locución (narrador.js, `volumenEfectivo()`), y la única forma
           de aplicar un volumen nuevo a un utterance que ya está sonando
           es re-emitirlo — bien para un gesto discreto como mutear (el
           alumno espera silencio YA), pero recortaría la frase en seco
           en cada píxel si se llamara durante un arrastre continuo. */
        if (global.Narrador && global.Narrador.refreshVolume) global.Narrador.refreshVolume();
      }
      btn.addEventListener('click', toggleMute);
      if (popMuteBtn) popMuteBtn.addEventListener('click', toggleMute);
      if (range) {
        range.addEventListener('input', function () {
          volume = Math.min(1, Math.max(0, parseInt(range.value, 10) / 100));
          try { localStorage.setItem(LS_VOL, String(volume)); } catch (e) {}
          if (volume > 0 && muted) {
            muted = false;
            try { localStorage.setItem(LS, '0'); } catch (e) {}
          }
          sync();
        });
        /* BUG REAL, reportado tras entregar v1.9.40 (kit-base v1.9.42):
           el volumen de la locución quedaba sin aplicar hasta reiniciar
           la narración — "subo y bajo el volumen y no cambia". Causa
           real: `u.volume` de un `SpeechSynthesisUtterance` no se puede
           tocar en caliente sobre uno que ya está sonando (comentario
           de §6.60 más arriba) — la única forma de aplicarlo es
           re-emitir (`Narrador.refreshVolume()`), y esa llamada se dejó
           a propósito FUERA del `input` de arriba para no cortar la
           frase en cada píxel de un arrastre continuo. El plan era que
           "el fragmento siguiente" lo resolviera solo — pero
           `chunkText` (narrador.js, tope 180 caracteres) suele producir
           UN SOLO fragmento para una diapositiva típica (título + un
           párrafo corto): no hay "fragmento siguiente" hasta que
           termina TODA la narración, así que en la práctica el volumen
           no se sentía actualizar hasta la próxima diapositiva.
           Fix real: `change` (nativo de `<input type="range">`) es
           exactamente el gesto discreto que ya usa `toggleMute()` —
           dispara UNA vez al soltar (mouse/touch/teclado), nunca en
           cada tick de un arrastre en curso, así que re-emitir ahí no
           corta nada a mitad de frase. */
        range.addEventListener('change', function () {
          if (global.Narrador && global.Narrador.refreshVolume) global.Narrador.refreshVolume();
        });
      }
    }

    /* ---- Locución on/off ---- */
    function initNarrateToggle() {
      var btn = document.getElementById('d-narrate');
      if (!btn) return;
      // sin Web Speech API el botón no tiene nada que controlar (el
      // header-boilerplate lo trae hidden justamente por esto)
      if (!('speechSynthesis' in global)) { btn.hidden = true; return; }
      // BUG REAL (encontrado recién en el primer curso que usó el kit
      // end-to-end, "Uso de sucursales 3 - NOA"): el boilerplate trae
      // el botón `hidden` a propósito para el caso SIN soporte — pero
      // nada lo des-ocultaba en el caso CON soporte (el caso normal).
      // El botón quedaba invisible SIEMPRE, en cualquier navegador,
      // aunque Web Speech API estuviera disponible.
      btn.hidden = false;
      function sync() {
        var on = global.Narrador.isNarrating();
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.setAttribute('aria-label', on ? 'Silenciar la locución' : 'Escuchar la diapositiva');
      }
      sync();
      btn.addEventListener('click', function () {
        var on = !global.Narrador.isNarrating();
        global.Narrador.setNarrating(on);
        sync();
        if (on) speakSlide(global.motor.current());
      });
    }

    /* ---- Línea de tiempo de la locución (pedido de producto, kit-base
       v1.9.35) ----
       Panel bajo el botón "Locución": progreso + arrastrar para saltar
       + repetir. La granularidad es por FRASE (el mismo fragmentado de
       `chunkText` en narrador.js), no por palabra — Web Speech API no
       da un "segundo exacto" de por dónde va la síntesis, y encima esa
       precisión es más floja todavía con las voces DE RED (Google/
       Microsoft online) que este kit ya prioriza (§6.7/§6.54) — un
       progreso fino prometería algo que no se puede garantizar en la
       mayoría de los navegadores reales. Por frase sí es 100% confiable
       (`onend`/`onerror` de cada utterance SIEMPRE disparan). Todo el
       estado real vive en narrador.js (`seek`/`repeat`/`progreso`) —
       esto solo pinta lo que llega por el evento `narracionprogreso` y
       traduce los gestos del alumno a llamadas al motor de voz. */
    function initNarrateTimeline() {
      var range = document.getElementById('d-narr-range');
      var replayBtn = document.getElementById('d-narr-replay');
      var status = document.getElementById('d-narr-status');
      if (!range || !replayBtn || !('speechSynthesis' in global)) return;

      var arrastrando = false;
      range.addEventListener('pointerdown', function () { arrastrando = true; });
      ['pointerup', 'pointercancel'].forEach(function (ev) {
        range.addEventListener(ev, function () { arrastrando = false; });
      });

      /* Sin "frase N de M": pedido explícito del cliente — sonaba como
         si la locución tuviera "partes" separadas, cuando en realidad
         es un audio continuo. Alcanza con la barra (arrastrable, salta
         al soltar) + el botón "Repetir"; el conteo de fragmentos sigue
         existiendo puertas adentro (chunkText, narrador.js) pero ya no
         se le muestra al alumno. */
      function pintar(p) {
        var hay = !!(p && p.total);
        range.disabled = !hay;
        replayBtn.disabled = !hay;
        if (!hay) {
          if (status) status.hidden = true;
          if (!arrastrando) { range.max = 0; range.value = 0; }
          return;
        }
        if (!arrastrando) {
          range.max = String(p.total - 1);
          range.value = String(Math.min(p.index, p.total - 1));
        }
        if (status) status.hidden = !!p.terminado;
      }
      pintar(global.Narrador.progreso());
      document.addEventListener('narracionprogreso', function (e) { pintar(e.detail); });

      // `change` (no `input`): saltar recién al SOLTAR, no en cada
      // pixel arrastrado — cada salto corta y vuelve a arrancar una
      // utterance, encadenar eso en cada frame se escucharía como un
      // tartamudeo, no como un arrastre suave.
      range.addEventListener('change', function () {
        global.Narrador.seek(parseInt(range.value, 10) || 0);
      });
      replayBtn.addEventListener('click', function () { global.Narrador.repeat(); });
    }

    /* ---- Gracia de hover para popovers (Sonido/Locución/Ayuda/
       Configuración) ----
       Bug real reportado: mover el mouse del botón al popover (hay un
       hueco vertical real entre los dos, `top:calc(100%+10px)` en
       audio / `bottom:calc(100%+14px)` en los flotantes) podía perder
       el hover a mitad de camino si el cursor se movía rápido — CSS
       `:hover` no perdona ni un frame fuera de los dos rectángulos.
       Fix: en vez de que el CSS decida solo con `:hover`, JS agrega
       una clase (`openClass`) al entrar y la saca recién 3s después de
       salir — cancelable si el mouse vuelve a entrar antes (al botón O
       al popover, da igual, el listener está en el contenedor
       `.d-audio-ctl`/`.d-fab`, que envuelve a los dos). El foco por
       teclado (`:focus-within` en CSS) sigue sin gracia — no hay
       "hueco que cruzar" con Tab, así que no la necesita. */
    function attachHoverGrace(el, openClass, delayMs) {
      var timer = null;
      function abrir() {
        if (timer) { clearTimeout(timer); timer = null; }
        el.classList.add(openClass);
      }
      function cerrarConGracia() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () {
          el.classList.remove(openClass);
          timer = null;
        }, delayMs);
      }
      el.addEventListener('mouseenter', abrir);
      el.addEventListener('mouseleave', cerrarConGracia);
    }

    /* ---- Mecanismo genérico de popover "pinned" (kit-base v1.9.39) ----
       `initAudioPopovers()` e `initFabPopovers()` cablean casi la misma
       lógica cada uno por su cuenta (pin por click, un solo abierto a la
       vez, gracia de hover, cierre por fuera/slidechange) — duplicada
       significa que un bug encontrado en una (ej. la gracia de hover de
       §6.58) hay que acordarse de portarlo a mano a la otra. Un solo
       mecanismo reduce esa superficie, y cualquier popover NUEVO que
       cuelgue del chrome (mobile incluido, CLAUDE.md §6.10.1 punto 4)
       lo hereda gratis en vez de reinventarlo.

       `items`: elementos contenedores, cada uno con un botón disparador
       adentro (`opts.btnSelector`) y la clase `is-open` que el CSS ya
       sabe interpretar. `opts.onOpen(item)`, si se pasa, corre al abrir
       por click/hover/foco Y en cada resize mientras esté abierto — es
       el gancho de posicionamiento dinámico que necesita
       `initAudioPopovers` (§6.55) y que `initFabPopovers` no necesita
       (anclaje fijo). Devuelve `{ closeAll }` para que el que llama
       pueda cerrar todo desde un botón propio (ej. "volver a ver la
       introducción" en el FAB de Ayuda). */
    /* Gracia de hover antes de cerrar un popover "pinned" al salir del
       mouse — bajada de 3s a 1,5s (kit-base v1.9.40): cruzar el hueco
       real entre botón y panel (10-14px) lleva ~50ms, así que 3s alcanzaban
       de sobra para el gesto pero dejaban el panel colgado mucho después
       de que el alumno ya siguió con otra cosa. Un solo lugar para el
       número — cualquier ajuste futuro se hace acá, no en cada llamada. */
    var GRACIA_HOVER_MS = 1500;

    function initPinnedPopover(items, opts) {
      opts = opts || {};
      var graceMs = opts.graceMs || GRACIA_HOVER_MS;
      /* Un popover tiene UNA sola noción de "cerrado" — hay que sacar
         `is-open` (el pin por clic/tap) Y `is-hover` (la gracia). Antes
         `closeAll()` y el `document click` de abajo solo sacaban
         `is-open`: un panel abierto por HOVER se quedaba colgado hasta
         que venciera la gracia aunque el alumno ya hubiera hecho clic
         afuera, cambiado de diapositiva, o tocado "volver a ver la
         introducción" — bug real, no solo del hover en sí (kit-base
         v1.9.40). */
      function closeAll() { items.forEach(function (it) { it.classList.remove('is-open', 'is-hover'); }); }
      if (!items.length) return { closeAll: closeAll };

      items.forEach(function (it) {
        var btn = it.querySelector(opts.btnSelector);
        if (!btn) return;
        btn.addEventListener('click', function () {
          var yaAbierto = it.classList.contains('is-open');
          closeAll();
          if (!yaAbierto) {
            it.classList.add('is-open');
            if (opts.onOpen) opts.onOpen(it);
          }
        });
        if (opts.onOpen) {
          it.addEventListener('mouseenter', function () { opts.onOpen(it); });
          it.addEventListener('focusin', function () { opts.onOpen(it); });
        }
        attachHoverGrace(it, 'is-hover', graceMs);
      });
      document.addEventListener('click', function (e) {
        items.forEach(function (it) {
          if (!it.contains(e.target)) it.classList.remove('is-open', 'is-hover');
        });
      });
      document.addEventListener('slidechange', closeAll);
      if (opts.onOpen) {
        window.addEventListener('resize', function () {
          items.forEach(function (it) { if (it.classList.contains('is-open')) opts.onOpen(it); });
        });
      }
      return { closeAll: closeAll };
    }

    /* ---- Paneles de audio (volumen / línea de tiempo): el tap fija
       el panel abierto — mismo criterio que `initHotspots` (coto-
       hotspots.js): el hover/foco ya los abre solos por CSS
       (`:hover`/`:focus-within` en `.d-audio-ctl`), pero en touch no
       existe el hover (CLAUDE.md §6.10.1 regla 2), así que hace falta
       un gesto explícito que los deje abiertos para poder tocar el
       slider de adentro. */
    function initAudioPopovers() {
      var ctls = Array.prototype.slice.call(document.querySelectorAll('.d-audio-ctl'));
      if (!ctls.length) return;

      /* El botón de audio no siempre está cerca del borde derecho —
         en mobile (≤799px, ver coto-player-chrome.css) el layout de
         2 filas lo manda a la IZQUIERDA. Un anclaje fijo por CSS
         asumía mal, así que acá se mide la posición REAL del botón
         en cada apertura y se corrige el `left` inline (con `--flecha-
         left` para que la flechita siga apuntando al botón), dejando
         el `left:50%` del CSS como fallback sin JS. */
      function posicionar(ctl) {
        var pop = ctl.querySelector('.d-audio-pop');
        if (!pop) return;
        var margen = 8;
        var anchoVentana = document.documentElement.clientWidth || window.innerWidth;
        var rectCtl = ctl.getBoundingClientRect();
        var anchoPop = pop.getBoundingClientRect().width;
        var centroCtl = rectCtl.left + rectCtl.width / 2;
        var izqMax = Math.max(margen, anchoVentana - anchoPop - margen);
        var izq = Math.min(Math.max(centroCtl - anchoPop / 2, margen), izqMax);
        pop.style.left = (izq - rectCtl.left) + 'px';
        pop.style.transform = 'none';
        var flecha = Math.min(Math.max(centroCtl - izq, 14), Math.max(14, anchoPop - 14));
        pop.style.setProperty('--flecha-left', flecha + 'px');
      }

      initPinnedPopover(ctls, { btnSelector: '.d-iconbtn', onOpen: posicionar });
    }

    /* ---- Botones flotantes: Ayuda + Configuración (kit-base v1.9.36,
       CLAUDE.md §6.57) ----
       Mismo mecanismo "pinned" que initAudioPopovers (hover/foco en
       desktop, clic fijo en táctil) — pero sin el posicionamiento
       dinámico de ese: acá el anclaje es SIEMPRE abajo a la derecha
       (nunca se mueve entre breakpoints como el grupo de audio), así
       que un `max-width` en CSS alcanza para no salirse en mobile. */
    function initFabPopovers() {
      var stack = document.querySelector('[data-fab-stack]');
      if (!stack) return;
      var fabs = Array.prototype.slice.call(stack.querySelectorAll('[data-fab-ctl]'));
      if (!fabs.length) return;

      var pinned = initPinnedPopover(fabs, { btnSelector: '.d-fab-btn' });

      /* Aro de "hay algo acá": un pulso corto una sola vez por visita,
         apenas carga el curso — nunca en loop (sería ruido permanente,
         no un llamado de atención). Se apaga sola al terminar la
         animación (2 vueltas de 1.6s, ver keyframes en el CSS) o si el
         alumno ya interactuó con cualquiera de los dos botones antes. */
      fabs.forEach(function (fab) { fab.classList.add('is-pulsing'); });
      setTimeout(function () {
        fabs.forEach(function (fab) { fab.classList.remove('is-pulsing'); });
      }, 3300);
      fabs.forEach(function (fab) {
        var btn = fab.querySelector('.d-fab-btn');
        if (btn) btn.addEventListener('click', function () {
          fabs.forEach(function (o) { o.classList.remove('is-pulsing'); });
        }, { once: true });
      });

      /* Acordeón de "Ayuda": una pregunta abierta a la vez. */
      var acc = stack.querySelector('[data-fab-acc]');
      if (acc) {
        var items = Array.prototype.slice.call(acc.querySelectorAll('.d-fab-acc-item'));
        items.forEach(function (item) {
          var q = item.querySelector('.d-fab-acc-q');
          if (!q) return;
          q.addEventListener('click', function () {
            var yaAbierta = item.classList.contains('is-open');
            items.forEach(function (o) { o.classList.remove('is-open'); });
            if (!yaAbierta) item.classList.add('is-open');
          });
        });
      }

      /* "Volver a ver la introducción": además de abrir el pop-up
         "instrucciones" (ya cableado solo por el motor vía
         data-popup-trigger), cierra el propio flotante de Ayuda —
         si no, queda "pinned" abierto detrás del modal. */
      var replayBtn = stack.querySelector('.d-fab-replay');
      if (replayBtn) replayBtn.addEventListener('click', pinned.closeAll);
    }

    /* ---- Selector manual de voz ----
       narrador.js expone pickVoice/setManualVoice justamente para esto:
       la elección automática es "mejor esfuerzo" y depende de qué voces
       tenga el dispositivo del alumno. */
    function initVoicePicker() {
      var field = document.getElementById('d-voice-field');
      var sel = document.getElementById('d-voice-select');
      if (!field || !sel || !('speechSynthesis' in global)) return;
      function fill() {
        var voices = speechSynthesis.getVoices().filter(function (v) { return /^es/i.test(v.lang); });
        if (!voices.length) return;
        var current = global.Narrador.pickVoice();
        sel.textContent = '';
        var auto = document.createElement('option');
        auto.value = ''; auto.textContent = 'Voz recomendada (automática)';
        sel.appendChild(auto);
        voices.forEach(function (v) {
          var o = document.createElement('option');
          o.value = v.name + '|' + v.lang;
          o.textContent = v.name + ' (' + v.lang + ')';
          if (current && v.name === current.name && v.lang === current.lang) o.selected = true;
          sel.appendChild(o);
        });
        field.hidden = false;
      }
      fill();
      speechSynthesis.addEventListener('voiceschanged', fill);
      sel.addEventListener('change', function () {
        var voices = speechSynthesis.getVoices();
        var v = voices.find(function (x) { return (x.name + '|' + x.lang) === sel.value; });
        global.Narrador.setManualVoice(v || null);
        global.Narrador.speak('Esta es la voz que vas a escuchar durante el curso.', 'other');
      });

      /* "Escuchar un ejemplo": mismo texto de prueba de arriba, pero
         a demanda — el cambio de <select> ya lo dispara solo, esto
         cubre el caso de querer re-escuchar la voz YA elegida sin
         tener que tocar el selector. */
      var listenBtn = document.getElementById('d-voice-listen');
      if (listenBtn) listenBtn.addEventListener('click', function () {
        global.Narrador.speak('Esta es la voz que vas a escuchar durante el curso.', 'other');
      });
    }

    /* ---- Control manual de velocidad de la locución ----
       Complementa (no reemplaza) el ajuste automático por calidad de
       voz de narrador.js (§6.7 del CLAUDE.md: 1.0x/1.15x/1.22x según
       la voz elegida) — el slider aplica un MULTIPLICADOR sobre ese
       valor ya afinado, nunca lo pisa con un número fijo. Vive en el
       mismo pop-up de "Ayuda" que el selector de voz, no en la barra
       superior: la barra ya tuvo demasiadas rondas de bugs de layout
       (CLAUDE.md §6.6/§6.15/§6.16) como para sumarle un control más. */
    function initRatePicker() {
      var field = document.getElementById('d-rate-field');
      var range = document.getElementById('d-rate-range');
      var out = document.getElementById('d-rate-value');
      if (!field || !range || !out || !('speechSynthesis' in global)) return;
      function label(f) {
        if (f <= 0.85) return f.toFixed(2) + 'x (más lento)';
        if (f >= 1.15) return f.toFixed(2) + 'x (más rápido)';
        return f.toFixed(2) + 'x (normal)';
      }
      var current = global.Narrador.getRateFactor();
      range.value = current;
      out.textContent = label(current);
      field.hidden = false;
      var debounceTimer = null;
      range.addEventListener('input', function () {
        var f = parseFloat(range.value);
        out.textContent = label(f);
        global.Narrador.setRateFactor(f);
        // Debounce: no interrumpir la narración en cada micro-paso del
        // slider, solo cuando el alumno se queda quieto un instante —
        // mismo criterio que cualquier control que dispara una acción
        // costosa (acá, cortar y re-empezar una frase hablada).
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          global.Narrador.speak('Así de rápido vas a escuchar la locución.', 'other');
        }, 400);
      });
    }

    /* ---- Restablecer voz + velocidad a los valores recomendados ----
       En vez de duplicar la lógica de setManualVoice/setRateFactor
       acá, se reusan los listeners de "change"/"input" que
       initVoicePicker/initRatePicker ya cablean — bajarle el valor al
       control y disparar el evento hace exactamente lo mismo que si
       el alumno lo hubiera tocado a mano (label, persistencia y el
       aviso hablado incluidos), sin dos caminos de código para el
       mismo resultado. */
    function initConfigReset() {
      var resetBtn = document.getElementById('d-config-reset');
      if (!resetBtn) return;
      resetBtn.addEventListener('click', function () {
        var sel = document.getElementById('d-voice-select');
        var range = document.getElementById('d-rate-range');
        if (sel) { sel.value = ''; sel.dispatchEvent(new Event('change')); }
        if (range) { range.value = '1'; range.dispatchEvent(new Event('input')); }
      });
    }

    /* ---- Pantalla completa ----
       Útil cuando el curso queda embebido chico dentro de la página del
       LMS. Si el navegador no soporta la API (o el iframe de Moodle no
       trae allowfullscreen), el botón directamente se oculta en vez de
       fallar visiblemente al hacer clic. */
    function initFullscreen() {
      var btn = document.getElementById('d-fullscreen');
      if (!btn) return;
      if (!document.documentElement.requestFullscreen) { btn.hidden = true; return; }
      // Mismo bug que initNarrateToggle: el caso CON soporte nunca
      // des-ocultaba el botón, solo el caso sin soporte lo tocaba.
      btn.hidden = false;
      var lbl = btn.querySelector('.lbl');
      /* BUG REAL: los 2 SVG (ic-expand/ic-compress) ya se alternaban
         solos por CSS (`#d-fullscreen.is-on`), pero el texto visible
         ("Ampliar") y el `title`/`aria-label` quedaban fijos aunque el
         curso ya estuviera en pantalla completa — mismo botón, mismo
         nombre, dos estados. `aria-pressed` ya cambiaba (por eso un
         lector de pantalla SÍ se enteraba), pero quien lee la etiqueta
         a simple vista, no.
         El texto en sí pasó por 3 rondas de pedidos del cliente: primero
         "Salir" (cuando está maximizado, "contraer" no le sonaba bien),
         después volvió a "Contraer", y terminó en "Reducir" — empareja
         mejor con "Ampliar" (mismo registro, mismo tipo de verbo de
         acción) sin el matiz de "contraer" (que suena más a encoger
         una forma que a un estado de pantalla). El `title`/`aria-label`
         (para lectores de pantalla y tooltip) sigue algo más explícito
         que el texto corto del botón. */
      function syncLabel(on) {
        var texto = on ? 'Reducir' : 'Ampliar';
        if (lbl) lbl.textContent = texto;
        btn.title = on ? 'Salir de pantalla completa' : 'Pantalla completa';
        btn.setAttribute('aria-label', btn.title);
      }
      btn.addEventListener('click', function () {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen().catch(function () {});
      });
      document.addEventListener('fullscreenchange', function () {
        var on = !!document.fullscreenElement;
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        syncLabel(on);
      });
    }

    /* ---- Barra de progreso arrastrable ----
       motor-slides.js ya sincroniza relleno y pulgar con la misma
       fracción (diapo 0 → 0%, última → 100%) justamente para que
       arrastrar coincida con lo que se ve (ver _syncNav). Acá va la otra
       mitad: el gesto real de arrastre/clic. Las flechas del teclado NO
       se manejan acá a propósito — el pulgar es un <span>, así que el
       listener global del motor ya las procesa; duplicarlas haría
       avanzar 2 diapositivas de una. */
    function initProgressSeek() {
      var track = document.querySelector('[data-progress-track]');
      var thumb = document.querySelector('[data-slide-thumb]');
      if (!track || !global.motor) return;
      var last = global.motor.slides.length - 1;
      if (last <= 0) return;

      /* Tope real de hasta dónde se puede arrastrar hacia ADELANTE.
         BUG REAL (encontrado comparando contra "Surtido sin venta"): sin
         este tope, arrastrar el pulgar llama a motor.go() directo,
         salteándose CUALQUIER gate de contenido — el botón "Siguiente"
         sí lo respeta porque pasa por _advance, pero el drag nunca
         pasaba por ahí. Retroceder siempre es libre. */
      function maxReachable() {
        var max = global.motor.index;
        visitedIndexes().forEach(function (i) { if (i >= 0 && i > max) max = i; });
        return max;
      }
      function indexFromEvent(e) {
        var r = track.getBoundingClientRect();
        var frac = (e.clientX - r.left) / r.width;
        frac = Math.max(0, Math.min(1, frac));
        return Math.round(frac * last);
      }
      function preview(i) {
        var pct = (i / last) * 100;
        var fill = track.querySelector('[data-slide-progress]');
        if (fill) fill.style.width = pct + '%';
        if (thumb) thumb.style.left = pct + '%';
      }
      var dragging = false;
      track.addEventListener('pointerdown', function (e) {
        dragging = true;
        track.classList.add('is-seeking');
        track.setPointerCapture(e.pointerId);
        preview(Math.min(indexFromEvent(e), maxReachable()));
      });
      track.addEventListener('pointermove', function (e) {
        if (dragging) preview(Math.min(indexFromEvent(e), maxReachable()));
      });
      track.addEventListener('pointerup', function (e) {
        if (!dragging) return;
        dragging = false;
        track.classList.remove('is-seeking');
        var raw = indexFromEvent(e), max = maxReachable();
        if (raw > max) toast('🔒 Todavía no viste esa parte del curso');
        global.motor.go(Math.min(raw, max));
      });
      track.addEventListener('pointercancel', function () {
        dragging = false;
        track.classList.remove('is-seeking');
        global.motor._syncNav();
      });
      if (thumb) {
        thumb.addEventListener('keydown', function (e) {
          if (e.key === 'Home') { e.preventDefault(); global.motor.go(0); }
          else if (e.key === 'End') { e.preventDefault(); global.motor.go(Math.min(last, maxReachable())); }
        });
      }
    }

    /* ---- "Reproducir todo" (autoavance al terminar cada locución) ----
       Decisión de producto del cliente: el botón se sacó de la barra por
       bajo valor frente al ruido visual que sumaba (ver CLAUDE.md §6.6).
       Queda como no-op seguro, sin punto de entrada en el DOM, por si se
       recupera con otro disparador — no volver a agregar el botón sin
       pedido explícito. */
    function initAutoplay() {
      var btn = document.getElementById('d-autoplay');
      if (!btn) return; // sin botón en el DOM: no hace nada, a propósito
      var on = false;
      btn.addEventListener('click', function () {
        on = !on;
        btn.classList.toggle('is-on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      document.addEventListener('slidenarrationend', function () {
        if (on) global.motor._advance(1);
      });
    }

    /* ---- Banner "Retomá donde dejaste" ----
       El curso guarda la ubicación en cmi.core.lesson_location en cada
       slidechange. Cómo usar ese dato al reingresar es una decisión de
       producto: acá NUNCA se navega solo — se ofrece y el alumno decide.
       (La 1ª versión de "Prevención cardiovascular" saltaba sola a la
       última diapositiva vista, y desorienta: el alumno abre el curso y
       aparece en el medio sin entender por qué.) Se autooculta a los 9s. */
    function initResume() {
      var bar = document.getElementById('d-resume');
      if (!bar || !global.SCORM) return;
      var id = global.SCORM.getLocation();
      if (!id) return;
      var first = global.motor && global.motor.slides[0];
      if (first && id === first.getAttribute('data-slide')) return; // ya está al principio
      if (!document.querySelector('[data-slide="' + id + '"]')) return;
      bar.hidden = false;
      var go = document.getElementById('d-resume-go');
      var x = document.getElementById('d-resume-x');
      if (go) go.addEventListener('click', function () { global.motor.gotoId(id); bar.hidden = true; });
      if (x) x.addEventListener('click', function () { bar.hidden = true; });
      setTimeout(function () { if (!bar.hidden) bar.hidden = true; }, 9000);
    }

    initGreeting();
    initSoundToggle();
    initNarrateToggle();
    initNarrateTimeline();
    initAudioPopovers();
    initFabPopovers();
    initVoicePicker();
    initRatePicker();
    initConfigReset();
    initFullscreen();
    initProgressSeek();
    initAutoplay();
    initResume();
    /* Red de seguridad universal para <video> (kit-base v1.9.39,
       initVideoSafetyNet en coto-media.js) — se dispara sola desde ACÁ,
       no como un init más que el curso tenga que acordarse de llamar:
       `initPlayer()` es el único punto que TODO curso llama siempre,
       así que colgarla de acá es la única forma de garantizar que
       ningún patrón de video (los 4 del kit, o uno nuevo que un curso
       escriba a mano) se quede sonando fuera de su diapositiva/pop-up/
       capa por olvidarse de cablearla — el bug de "¿quién lo apaga?"
       que ya volvió a aparecer 4 veces (CLAUDE.md §6.10.1 punto 1,
       §6.18 punto 2, §6.20 punto 6.1, §6.45 gap 6). Curso sin video →
       `coto-media.js` no está cargado → `global.initVideoSafetyNet` no
       existe → no hace nada, sin error (mismo criterio defensivo que
       `initGreeting()` con `global.SCORM` más arriba). */
    if (typeof global.initVideoSafetyNet === 'function') global.initVideoSafetyNet();

    return { toast: toast };
  }

  global.initPlayer = initPlayer;
})(window);
