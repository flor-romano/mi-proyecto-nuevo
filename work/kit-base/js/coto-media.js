/* ============================================================
   coto-media.js · Los 3 patrones de video de una diapositiva-captura
   kit-base v1.7 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual a cada curso nuevo, sin editar.
   ------------------------------------------------------------
   Extraído de "Prevención cardiovascular" (initBgVideos /
   initVideoPlayer / initInlineCircleVideos en su curso.js). Los tres
   patrones aparecieron ahí por pedidos concretos del cliente y los
   tres son 100% reusables: ninguno sabe qué video es ni qué contenido
   tiene, solo leen atributos data-* del marcado.

   Los 3 patrones, y cuándo usar cada uno:

   1. VIDEO DE FONDO (`initBgVideos`) — la diapositiva ENTERA es un
      video a sangre, en el mismo lienzo 2:1 que las capturas (portada,
      apertura de unidad). El video corre solo al entrar a la diapo y
      se pausa al salir.
        <section data-slide="portada" class="d-shot-slide--bg-video">
          <div class="d-shot">
            <video class="d-shot-video" playsinline preload="auto"
                   poster="img/portada.webp">
              <source src="video/portada.mp4" type="video/mp4">
            </video>
            <button type="button" class="d-shot-video-tap" hidden>
              Reproducir el video con sonido
            </button>
          </div>
        </section>
      ⚠️ Bug real (documentado): autoplay CON audio lo bloquean todos
      los navegadores si no hubo un gesto previo del alumno — pasa
      SIEMPRE en la portada, que es la 1ª diapo. Por eso el
      `.d-shot-video-tap`: si `play()` es rechazado, el botón aparece;
      tocarlo cuenta como gesto real y desbloquea el audio. No sacarlo.
      Con `prefers-reduced-motion` el video no arranca: se queda quieto
      en el `poster` (que es la misma captura .webp de siempre), así que
      la diapo se ve igual.
      ⚠️ Si el cliente todavía no entregó los .mp4, dejar placeholders
      con el nombre final (CLAUDE.md §3.9): sin el archivo el <source>
      no carga y el navegador se queda en el poster — el curso funciona
      igual mientras tanto.

   2. REPRODUCTOR EN POP-UP (`initVideoPlayer`) — el video vive en un
      pop-up grande, disparado por una hitbox de la captura. Es el
      patrón por defecto para videos tipo tarjeta rectangular.
      SIN `.modal-hd`: se ve solo el video, con un botón de cerrar
      flotante (`.modal-x--video`, CSS en coto-media.css) — ver
      CLAUDE.md §6.12 punto 5.
        <button class="d-shot-hit" data-hit data-video-play
                data-video="video/x.mp4" data-video-title="Título">…</button>
        <div class="modal modal--video" data-popup="video-player" role="dialog" aria-modal="true" aria-label="Video">
          <div class="modal-back" data-popup-close></div>
          <div class="modal-card modal-card--video">
            <h3 id="d-video-title" class="sr-only"></h3>
            <button class="modal-x modal-x--video" data-popup-close aria-label="Cerrar video">✕</button>
            <div class="modal-bd modal-bd--video">
              <video id="d-video-player" controls playsinline></video>
            </div>
          </div>
        </div>

   3. VIDEO CIRCULAR EN EL LUGAR (`initInlineCircleVideos`) — pedido
      explícito del cliente en "Prevención cardiovascular": los círculos
      chicos con la cara del especialista tienen que reproducirse AHÍ
      MISMO, no abrir el pop-up grande. Clic en el play arranca; clic
      sobre el video andando lo pausa. Sin controles nativos: a ese
      tamaño no entran legibles dentro del círculo.
        <div class="d-shot-hit d-shot-hit--circle d-shot-hit--video"
             data-hit data-inline-video data-video="video/x.mp4"
             data-video-title="Título" data-l data-t data-w data-h>
          <video class="d-shot-hit-video" playsinline preload="metadata">…
          <button type="button" class="d-shot-hit-play">Reproducir</button>
        </div>

      3 combinaciones válidas, según lo que el `<video>` traiga (desde
      "Seguridad alimentaria", ver CLAUDE.md §6.29/§6.4x):
        a) Sin `poster` y CON `.d-shot-hit-play` — círculo de arriba: el
           video queda oculto (opacity:0) hasta reproducir, dejando ver
           el arte de base detrás (la cara horneada en la captura).
        b) CON `poster` y SIN `.d-shot-hit-play` — el arte YA dibuja el
           reproductor completo (marco/play/barra) adentro del poster:
           sin botón propio, controles nativos recién al reproducir.
        c) CON `poster` y CON `.d-shot-hit-play` — carátula real (foto/
           patrón del cliente) SIN ningún control dibujado adentro: se
           ve siempre en reposo (a diferencia de (a)) y el botón real
           del kit es el único affordance de play, no uno dibujado.
      Las tres cablean igual — el módulo detecta la combinación solo
      por si el `<video>` trae `poster` y si hay `.d-shot-hit-play` en
      el marcado, sin flags nuevos.

      ⚠️ Trampa de especificidad si el curso pisa el `object-fit` de la
      variante (b)/(c) (ej. quiere `cover` en vez del `contain` de acá
      abajo — caso real, "Seguridad alimentaria"): el `<video>` está
      bajo `[data-inline-video].is-poster .d-shot-hit-video` — 3
      selectores de especificidad — así que un override del curso con
      MENOS de 3 (ej. una sola clase propia del wrapper,
      `.mi-videobox .d-shot-hit-video`) pierde contra ESTA regla y
      nunca se aplica al `<video>`, aunque sí le gane a la del
      `.d-shot-hit-poster-img` (que es una sola clase). Bug real: la
      carátula (en pausa) queda con un encuadre y el video (al
      reproducir) con otro, así que el marco "salta" justo al arrancar
      — parece un bug de recorte del video cuando en realidad es dos
      reglas de `object-fit` distintas peleando. Fix del curso: repetir
      el prefijo `[data-inline-video].is-poster` en el selector propio
      (`[data-inline-video].is-poster.mi-videobox .d-shot-hit-video`),
      nunca solo agregar una clase más liviana.

   Uso (llamar una vez desde boot(), las 3 son opcionales según lo que
   tenga el curso):
     initBgVideos();
     initVideoPlayer({
       onFirstPlay: function (src, title) { award(5, title); XAPI.experienced(src, title); },
       seen: function (src) { return !!state.videosVistos[src]; },
       markSeen: function (src) { state.videosVistos[src] = true; persistState(); }
     });
     initInlineCircleVideos({ onFirstPlay: …, seen: …, markSeen: …,
       afterPlay: syncNextGateUI });

   Todos los patrones de video de este archivo (incluido `initBgVideos`
   desde el fix de más abajo — antes era el único que no lo hacía)
   respetan `prefers-reduced-motion` y cortan la locución antes de
   reproducir (`Narrador.cancel()`): la voz nunca compite con el audio
   del video.
   ============================================================ */
(function (global) {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function silenciarLocucion() {
    if (global.Narrador && global.Narrador.cancel) global.Narrador.cancel();
  }

  /* ============================================================
     mostrarErrorVideo(v) / ocultarErrorVideo(v) — kit-base v1.9.44
     ------------------------------------------------------------
     Los patrones 2-5 (pop-up, círculo inline, video en pop-up de
     contenido, video en capa) no tenían NINGÚN estado visible si el
     `<video>` disparaba `error` DESPUÉS de que el alumno ya lo tocó
     (archivo roto, 404, códec no soportado en ese navegador) — se
     quedaba una caja negra o el último cuadro congelado, sin ningún
     mensaje. `videoUsable()` (más abajo) ya cubría el caso de
     "todavía no hay archivo" para el video de FONDO (vuelve al
     poster, que es la misma captura — no rompe nada visualmente),
     pero acá no hay poster de respaldo equivalente en todos los
     casos.

     `contenedorPara` fuerza `position:relative` en el padre SOLO si
     ya era `static` — es el uso estándar y no invasivo de
     position:relative para dar contexto de posicionamiento a un hijo
     absoluto, no mueve nada que ya estuviera posicionado. */
  function contenedorPara(v) {
    var p = v.parentElement;
    if (!p) return null;
    if (getComputedStyle(p).position === 'static') p.style.position = 'relative';
    return p;
  }
  function mostrarErrorVideo(v) {
    var cont = contenedorPara(v);
    if (!cont) return;
    var msg = cont.querySelector(':scope > .d-video-error');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'd-video-error';
      msg.setAttribute('role', 'alert');
      msg.innerHTML =
        '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/>' +
        '<line x1="12" y1="8" x2="12" y2="13"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
        '<span>No se pudo cargar este video.</span>';
      cont.appendChild(msg);
    }
    msg.classList.add('is-shown');
  }
  function ocultarErrorVideo(v) {
    var p = v.parentElement;
    var msg = p && p.querySelector(':scope > .d-video-error');
    if (msg) msg.classList.remove('is-shown');
  }

  /* BUG REAL, pedido del cliente: el botón "Sonido" del header
     (`initSoundToggle`, coto-player.js) solo apagaba los efectos de UI
     (fx.js/coto-ui.js, mismo `localStorage['coto-diapos-mute']`) — los
     3 patrones de video de ESTE archivo (fondo, pop-up, círculo
     inline) nunca leían esa marca, así que "Sonido" no lo silenciaba
     TODO como se espera de un mute global. Mismo helper `muted()` que
     ya usan fx.js/coto-ui.js (mismo criterio, no un mecanismo nuevo). */
  function muted() { try { return global.localStorage.getItem('coto-diapos-mute') === '1'; } catch (e) { return false; } }
  // Nivel de volumen (0-1, panel de "Sonido" — kit-base v1.9.35,
  // coto-player.js). `initSoundToggle` ya sincroniza `.volume` en
  // caliente sobre CUALQUIER <video> presente al mover el slider; esto
  // cubre el caso de un video que arranca DESPUÉS de ese ajuste (recién
  // se pone play), mismo criterio que ya usa `muted()` acá al lado.
  function volumeLevel() {
    try {
      var v = parseFloat(global.localStorage.getItem('coto-diapos-volume'));
      return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
    } catch (e) { return 1; }
  }

  /* Helpers de "ya visto": si el curso no pasa seen/markSeen, se usa un
     registro en memoria — así el módulo funciona sin configurar nada,
     pero el curso puede persistirlo en su suspend_data si quiere. */
  function vistoAPI(opts) {
    var mem = {};
    return {
      seen: opts.seen || function (src) { return !!mem[src]; },
      mark: opts.markSeen || function (src) { mem[src] = true; }
    };
  }

  /* ============================================================
     videoUsable(v) — ¿este <video> tiene una fuente reproducible?
     ------------------------------------------------------------
     kit-base v1.9.9 · Sale de un bug real y de un riesgo real, los dos
     con la misma causa: durante buena parte del armado los .mp4 son
     placeholders de 0 bytes (el cliente sube los finales al final).

       · bug: `initBgVideos` mostraba el botón ▶ ante CUALQUIER rechazo
         de play(), incluso con el archivo ausente — un ▶ enorme sobre
         el arte que al tocarlo no hacía nada. Solo el rechazo por
         política de autoplay (NotAllowedError) se arregla con un gesto.
       · riesgo: un gate que exija "mirá el video" sobre un archivo que
         no existe deja el curso IMPOSIBLE de terminar.

     Los dos se resuelven preguntando lo mismo, así que la pregunta vive
     acá una sola vez. Un curso que exija videos debe usarla para NO
     exigir los que todavía no se pueden reproducir: así el gate no
     molesta hoy y empieza a exigir solo cuando entren los archivos
     reales, sin tocar código.
     ============================================================ */
  function videoUsable(v) {
    if (!v) return false;
    return !(v.error || v.networkState === 3 /* NETWORK_NO_SOURCE */);
  }

  /* ---- 1. Video de fondo, diapositiva completa ---- */
  function initBgVideos() {
    var videos = document.querySelectorAll('.d-shot-slide--bg-video video.d-shot-video');
    if (!videos.length) return;

    function tapOf(v) { var shot = v.closest('.d-shot'); return shot && shot.querySelector('.d-shot-video-tap'); }

    function attempt(v) {
      var tap = tapOf(v);
      if (tap) tap.hidden = true;
      if (!videoUsable(v)) return;
      try { v.currentTime = 0; } catch (err) {}
      v.muted = muted();
      v.volume = volumeLevel();
      // Defensa en profundidad, igual criterio que los otros 3 patrones
      // de video de este archivo (§ arriba, "Los 3 respetan..."): la
      // razón real de que la locución y el video de fondo no compitan
      // más es que `textOf()` (narrador.js) ya no narra una diapositiva
      // `.d-shot-slide--bg-video` — esto de acá es un segundo cinturón
      // por si algún día algo más queda narrando sobre esta diapo.
      silenciarLocucion();
      var p = v.play();
      if (p && p.catch) p.catch(function (err) {
        // NotAllowedError = falta un gesto → el botón sirve.
        // Cualquier otro error (fuente rota, codec) → no sirve, se
        // queda el poster, que es el mismo arte de la diapositiva.
        var recuperable = err && err.name === 'NotAllowedError';
        if (tap) tap.hidden = !recuperable || !videoUsable(v);
      });
    }

    function sync(id) {
      Array.prototype.forEach.call(videos, function (v) {
        var slide = v.closest('[data-slide]');
        var active = slide && slide.getAttribute('data-slide') === id;
        var tap = tapOf(v);
        if (!active) { v.pause(); if (tap) tap.hidden = true; return; }
        if (prefersReduced) return; // se queda en el poster, quieto
        attempt(v);
      });
    }

    Array.prototype.forEach.call(videos, function (v) {
      // El fin del video cuenta como fin de narración de la diapo: así el
      // autoplay del curso (si está activo) encadena a la siguiente.
      v.addEventListener('ended', function () { document.dispatchEvent(new CustomEvent('slidenarrationend')); });
      /* `[data-autoadvance]` en la diapo (NO el toggle global "Reproducir
         todo" que el cliente pidió sacar — CLAUDE.md §6.6, sigue sin
         botón): esto es más angosto — pedido puntual de "los videos de
         fondo de las portadas/separadores deberían pasar solos a la
         siguiente diapo, sin tocar 'Siguiente'" (así lo hacían en
         Storyline). Se marca por diapo porque NO aplica a toda diapo con
         video de fondo — solo a la que es puro separador, sin nada más
         que mirar/hacer ahí. */
      var slide = v.closest('[data-slide]');
      if (slide && slide.hasAttribute('data-autoadvance')) {
        v.addEventListener('ended', function () {
          if (global.motor) global.motor._advance(1);
        });
      }
      var tap = tapOf(v);
      if (tap) tap.addEventListener('click', function () { attempt(v); });
      // La fuente falla DESPUÉS del primer intento (404, 0 bytes, codec):
      // el botón de gesto ya no tiene nada que hacer, se esconde.
      v.addEventListener('error', function () { if (tap) tap.hidden = true; }, true);
    });

    document.addEventListener('slidechange', function (e) { sync(e.detail.id); });
    var cur = global.motor && global.motor.current();
    if (cur) sync(cur.getAttribute('data-slide'));
  }

  /* ---- 2. Reproductor en pop-up ---- */
  function initVideoPlayer(opts) {
    opts = opts || {};
    var player = document.getElementById(opts.playerId || 'd-video-player');
    var titleEl = document.getElementById(opts.titleId || 'd-video-title');
    var popupId = opts.popupId || 'video-player';
    var visto = vistoAPI(opts);
    if (!player) return;

    player.addEventListener('error', function () { mostrarErrorVideo(player); });

    document.querySelectorAll('[data-video-play]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = btn.getAttribute('data-video');
        var title = btn.getAttribute('data-video-title') || 'Video';
        if (titleEl) titleEl.textContent = title;
        silenciarLocucion();
        ocultarErrorVideo(player); // por si quedó de un video roto anterior en el mismo pop-up
        player.src = src;
        player.muted = muted();
        player.volume = volumeLevel();
        global.motor.showPopup(popupId);
        player.play().catch(function () {});
        if (!visto.seen(src)) {
          visto.mark(src);
          if (opts.onFirstPlay) opts.onFirstPlay(src, title);
        }
        if (opts.afterPlay) opts.afterPlay(src, title);
      });
    });

    // Al cerrar el pop-up hay que soltar el archivo: sin esto el video
    // sigue descargando/sonando de fondo en algunos navegadores.
    document.addEventListener('popupclose', function (e) {
      if (e.detail && e.detail.id === popupId) {
        player.pause();
        player.removeAttribute('src');
        player.load();
      }
    });
  }

  /* ---- 3. Video que se reproduce EN EL LUGAR, sobre la captura ----
     Dos variantes del mismo mecanismo, y la diferencia la decide el
     MARCADO, no un parámetro:

     a) Con un `.d-shot-hit-play` adentro (el círculo de "Prevención
        cardiovascular"): el arte de base es la propia captura de la
        diapositiva, así que el <video> vive oculto (`opacity:0`) y solo
        se muestra mientras reproduce — si quedara visible, al terminar
        mostraría su último cuadro (negro) tapando el dibujo. El botón
        de play lo dibuja el kit.

     b) Sin `.d-shot-hit-play` (agregado en kit v1.9.21 para
        "Seguridad alimentaria"): el arte YA trae dibujado un
        reproductor completo (marco, triángulo de play, barra de
        progreso) y el `poster` del <video> es un recorte de ese mismo
        dibujo. Acá el <video> tiene que estar VISIBLE siempre — es él
        el que muestra el mockup — y no puede llevar `controls` de
        entrada: el navegador superpondría SUS controles sobre los
        dibujados y el play real quedaría desalineado del que el alumno
        ve (bug real ya documentado para pop-ups en CLAUDE.md §6.29,
        que hasta ahora solo estaba resuelto en `initPopupVideos`).
        Patrón: todo el video es el target de clic, `controls` se
        agrega recién en el evento `play` y se saca al terminar o al
        salir de la diapositiva, con `currentTime = 0`, para que al
        volver se vea otra vez el mockup limpio.
     La variante se marca con `.is-poster` en el wrapper desde acá (no
     desde el HTML del curso) para que el CSS pareja no dependa de
     `:has()` ni de que alguien se acuerde de poner una clase.

     BUG REAL encontrado en revisión (kit v1.9.22): la variante (b)
     confiaba 100% en el atributo `poster` nativo del `<video>` para
     mostrar el mockup — funciona en Chromium, pero varios navegadores
     (Safari en particular, y cualquiera con el códec del `.mp4`
     rechazado) REEMPLAZAN el poster por su propio ícono de "medio
     roto" en cuanto intentan precargar metadata de una fuente que no
     pueden decodificar — exactamente el caso de un placeholder de 0
     bytes (CLAUDE.md §3.9), que TODO curso tiene hasta que el cliente
     sube los videos reales. Resultado real: el botón de play dibujado
     en el poster desaparece, sin ningún error visible, en cualquier
     navegador que no sea Chrome de escritorio.
     Fix: el mockup deja de depender del atributo `poster` del
     `<video>` (que sigue puesto, como respaldo) y pasa a vivir como un
     `<img>` real, hijo del wrapper, DEBAJO del video — un `<img>` no
     tiene códec que rechazar, así que su render es inmune a esto. El
     `<video>` pasa a comportarse EXACTAMENTE como la variante circular
     de arriba (`opacity:0` en reposo, `opacity:1` en `.is-playing`):
     dejó de ser cierto que "acá el video tiene que estar visible
     siempre" — ahora lo visible siempre es el `<img>`, y el video
     aparece recién cuando hay algo real que mostrar. */
  function initInlineCircleVideos(opts) {
    opts = opts || {};
    var visto = vistoAPI(opts);
    var wraps = document.querySelectorAll('[data-inline-video]');

    wraps.forEach(function (wrap) {
      var video = wrap.querySelector('.d-shot-hit-video');
      var playBtn = wrap.querySelector('.d-shot-hit-play');
      var src = wrap.getAttribute('data-video');
      var title = wrap.getAttribute('data-video-title') || 'Video';
      if (!video) return;
      /* `poster` ya NO es "sin botón de play" (`!playBtn`): un video
         puede tener carátula real Y un botón de play interactivo propio
         a la vez (caso real, "Seguridad alimentaria" — la carátula es
         un patrón de marca del cliente, sin ningún control dibujado
         adentro, así que necesita el botón real del kit encima). La
         imagen de carátula se inserta siempre que haya `poster` en el
         `<video>`, tenga o no `.d-shot-hit-play`; el botón (si existe)
         se cablea aparte, más abajo. */
      var posterUrl = video.getAttribute('poster');
      var poster = !!posterUrl;
      if (poster) {
        wrap.classList.add('is-poster');
        video.removeAttribute('controls'); // por si el HTML lo trajo puesto
        var posterImg = document.createElement('img');
        posterImg.className = 'd-shot-hit-poster-img';
        posterImg.src = posterUrl;
        posterImg.alt = '';
        posterImg.setAttribute('aria-hidden', 'true');
        wrap.insertBefore(posterImg, video);
      }

      function start() {
        silenciarLocucion();
        wrap.classList.add('is-playing');
        video.muted = muted();
        video.volume = volumeLevel();
        var p = video.play();
        if (p && p.catch) p.catch(function () { wrap.classList.remove('is-playing'); });
        if (!visto.seen(src)) {
          visto.mark(src);
          if (opts.onFirstPlay) opts.onFirstPlay(src, title);
        }
        // Gancho para revalidar el candado de avance de la diapo
        // (data-require-seen) apenas se reproduce — ver CLAUDE.md §9.
        if (opts.afterPlay) opts.afterPlay(src, title);
      }

      // stopPropagation: el wrapper es un [data-hit] del motor; sin esto
      // el clic del play dispararía además la acción de la hitbox.
      if (playBtn) playBtn.addEventListener('click', function (e) { e.stopPropagation(); start(); });

      /* BUG REAL ("Seguridad alimentaria"): al tocar PAUSA en los
         controles nativos, el video volvía a la carátula y el audio
         seguía sonando. Causa: el clic sobre los controles nativos se
         despacha sobre el `<video>` ANTES de que el navegador aplique
         su acción por default, así que un handler que decide mirando
         `video.paused` lee siempre el estado VIEJO — pausaba a mano,
         y acto seguido el control nativo alternaba de pausado a
         reproduciendo. Resultado: `.is-playing` sacada (carátula
         encima) sobre un video andando.
         Fix: mientras haya controles nativos, el play/pausa es de
         ELLOS — este toggle solo actúa antes del primer play (cuando
         todavía no hay `controls`), que es el caso de la variante
         circular sin carátula. */
      video.addEventListener('click', function () {
        if (video.hasAttribute('controls')) return;
        if (video.paused) start();
        else video.pause();
      });

      /* El estado visual lo manda el propio `<video>`, no quien lo
         disparó: así da igual si arrancó por el botón del kit, por un
         clic sobre el video o por los controles nativos. */
      video.addEventListener('play', function () {
        wrap.classList.add('is-playing');
        if (poster) video.setAttribute('controls', '');
      });
      /* En pausa, la variante con carátula se QUEDA mostrando el video
         (su cuadro actual + los controles nativos) — volver a la
         carátula ahí es justamente el bug de arriba. La variante
         circular sí vuelve al arte de base: no tiene controles con los
         que retomar, el único affordance es su botón de play. */
      if (!poster) {
        video.addEventListener('pause', function () { wrap.classList.remove('is-playing'); });
      }
      /* BUG REAL ("Seguridad alimentaria"), corregido acá en vez de
         evitado: controles NATIVOS incluyen el botón de pantalla
         completa, y este video vive dentro de una diapositiva-captura
         posicionada por `_initShots()` (left/top/width/height en px,
         recalculados en `slidechange`/resize) — entrar y salir de
         fullscreen NATIVO no dispara ninguno de esos dos eventos, así
         que el cliente reportó el video "roto" (mal posicionado) al
         volver de pantalla completa. La vuelta anterior lo evitaba
         sacando el botón (`controlslist="nofullscreen"`), pero el
         cliente pidió explícitamente que la pantalla completa quedara
         habilitada — el arte del reproductor ya la dibuja. Fix real:
         escuchar `fullscreenchange` y volver a correr `_initShots()`
         al SALIR — el mismo recálculo que ya corre en cada resize,
         disparado a mano porque este evento no cuenta como uno. */
      video.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement && window.motor && window.motor._initShots) {
          window.motor._initShots();
        }
      });
      video.addEventListener('ended', function () {
        wrap.classList.remove('is-playing');
        if (poster) video.removeAttribute('controls');
        video.currentTime = 0; // para que el próximo play arranque desde el inicio, no desde el final
      });
      video.addEventListener('error', function () {
        wrap.classList.remove('is-playing');
        mostrarErrorVideo(video);
      });
    });

    /* BUG REAL (reportado por el cliente en "Prevención cardiovascular"):
       el video circular seguía sonando después de cambiar de diapositiva.
       Los otros dos patrones ya tenían su punto de corte — el de fondo
       sincroniza con `slidechange`, el de pop-up se detiene en
       `popupclose` — pero este no tenía NINGUNO: se queda en el DOM de
       una diapositiva oculta, reproduciéndose, y el alumno escucha una
       voz sin saber de dónde sale.
       Regla general para cualquier medio con audio que se sume acá:
       preguntarse SIEMPRE "¿quién lo apaga?" antes de darlo por listo. */
    function pausarFuera(id) {
      wraps.forEach(function (wrap) {
        var slide = wrap.closest('[data-slide]');
        if (slide && slide.getAttribute('data-slide') === id) return;
        var v = wrap.querySelector('.d-shot-hit-video');
        if (v && !v.paused) v.pause();
        // Variante (b): al salir de la diapositiva se vuelve al mockup
        // limpio (sin controles nativos encima del dibujado) y al
        // principio del clip, igual que hace initPopupVideos al cerrar.
        if (v && wrap.classList.contains('is-poster')) {
          v.removeAttribute('controls');
          v.currentTime = 0;
        }
        wrap.classList.remove('is-playing');
      });
    }
    document.addEventListener('slidechange', function (e) { pausarFuera(e.detail.id); });
  }

  /* ---- 4. Video EMBEBIDO en un pop-up de contenido ------------------
     kit-base v1.9.4. Cuarto patrón, aparecido en "Uso de Sucursales 3 -
     NOA": la ficha de un tema es un pop-up con texto a un lado y su
     video al otro (no el reproductor a pantalla completa del patrón 2,
     que no lleva texto). El `<video>` vive en el marcado del pop-up con
     sus controles nativos, así que no hace falta ningún disparador.

     Lo que SÍ hace falta, y es la razón de que esto sea kit y no curso:
     nadie lo apagaba. `initVideoPlayer` solo sabe frenar SU reproductor
     (`#d-video-player`); un `<video>` cualquiera adentro de otro pop-up
     se quedaba sonando después de cerrarlo — exactamente el bug de
     CLAUDE.md §6.10.1 punto 1 ("¿quién lo apaga?"), que ya se había
     pagado una vez con el video circular. Acá se cierra el hueco para
     cualquier pop-up del molde:
       · al cerrar el pop-up: pause + volver a 0 (así no reabre al final)
       · al empezar a reproducir: callar la locución, para que la voz
         nunca compita con el audio del video (§5)
       · `onFirstPlay(src, popupId)` para que el curso premie el primer
         visionado sin tener que cablear listeners por su cuenta.

       <div class="modal" data-popup="rep-191"> …
         <video controls playsinline preload="none">
           <source src="video/191.mp4" type="video/mp4"></video> </div>
   -------------------------------------------------------------------- */
  function initPopupVideos(opts) {
    opts = opts || {};
    var sel = opts.selector || '[data-popup] video';
    var videos = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!videos.length) return;
    var visto = vistoAPI(opts);

    videos.forEach(function (v) {
      var pop = v.closest('[data-popup]');
      var popId = pop ? pop.getAttribute('data-popup') : '';
      /* BUG REAL de diseño (CLAUDE.md §6.29): el `poster` de estos
         videos es un mockup que ya trae un reproductor DIBUJADO —
         play, barra de progreso, volumen, pantalla completa, todo
         horneado en la imagen. Si el `<video>` además usa el atributo
         `controls` desde el arranque, el navegador dibuja SU PROPIA
         barra de controles ENCIMA de la que ya está dibujada — dos
         interfaces superpuestas y ninguna de las dos clara. El cliente
         lo reportó como "el botón de play no funciona": probablemente
         estaba tocando el botón HORNEADO EN LA IMAGEN, que no es más
         que píxeles.
         Fix, mismo criterio que `initInlineCircleVideos` (§3 de este
         archivo): SIN `controls` en el marcado. Mientras está pausado
         (mostrando el poster, que ya se ve como un reproductor listo
         para arrancar) el video entero es un botón de play — un solo
         estado, sin ambigüedad. Recién CUANDO arranca la reproducción
         se activan los controles nativos reales (barra, volumen,
         pantalla completa) para que el resto de la experiencia sea
         un reproductor de verdad. */
      v.addEventListener('click', function () {
        if (v.paused) { v.muted = muted(); v.volume = volumeLevel(); v.play().catch(function () {}); }
      });
      v.addEventListener('play', function () {
        v.controls = true;
        silenciarLocucion();
        var src = v.currentSrc || v.getAttribute('src') || popId;
        // `popId` va como 2º argumento a seen/mark (no solo a
        // onFirstPlay): así un curso puede llevar el registro por id de
        // pop-up — corto y estable — en vez de por `src`, que es la URL
        // absoluta del video y ocupa ~10x más en suspend_data, con
        // límite de 4096 caracteres en SCORM 1.2. Argumento extra:
        // los cursos viejos que solo miran `src` siguen andando igual.
        if (!visto.seen(src, popId)) {
          visto.mark(src, popId);
          if (opts.onFirstPlay) opts.onFirstPlay(src, popId);
        }
      });
      v.addEventListener('error', function () { mostrarErrorVideo(v); });
    });

    document.addEventListener('popupclose', function (e) {
      var id = e.detail && e.detail.id;
      videos.forEach(function (v) {
        var pop = v.closest('[data-popup]');
        if (!pop || (id && pop.getAttribute('data-popup') !== id)) return;
        try { v.pause(); v.currentTime = 0; } catch (err) {}
        // Vuelve al estado "poster + un solo botón de play" para la
        // próxima vez que se abra — si quedaran los controles nativos
        // prendidos, reabrir la ficha mostraría la barra de controles
        // sobre un video pausado en el arranque, la misma confusión
        // que este fix vino a evitar.
        v.controls = false;
      });
    });
  }

  /* ---- 5. Video dentro de una CAPA ([data-layers]/[data-panel]) ----
     kit-base v1.9.6. Mismo problema que resuelve `initPopupVideos`
     (§4 arriba) — silenciar la locución al reproducir, premiar el
     primer visionado, pausar y volver a 0 al salir — pero para un
     video que vive dentro de un `[data-panel]` en vez de un
     `[data-popup]`. Se agregó al armar "Uso de Sucursales 3 - NOA":
     el cliente pidió que la ficha de reporte (antes un pop-up) pasara
     a ser una capa más de la diapositiva, a pantalla completa
     (CLAUDE.md §6.20 punto 6) — y `initPopupVideos` escucha
     `popupclose`, un evento que una capa nunca dispara (dispara
     `layerchange`). Sin este módulo, un video dentro de un panel
     seguía sonando después de cambiar de capa: el mismo bug de
     "¿quién lo apaga?" de CLAUDE.md §6.10.1 punto 1, una vez más.

       <div data-panel="rep-191"> …
         <video controls playsinline preload="none">
           <source src="video/191.mp4" type="video/mp4"></video> </div>
  -------------------------------------------------------------------- */
  function initLayerVideos(opts) {
    opts = opts || {};
    var sel = opts.selector || '[data-panel] video';
    var videos = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!videos.length) return;
    var visto = vistoAPI(opts);

    videos.forEach(function (v) {
      var panel = v.closest('[data-panel]');
      var panelId = panel ? panel.getAttribute('data-panel') : '';
      v.addEventListener('play', function () {
        silenciarLocucion();
        var src = v.currentSrc || v.getAttribute('src') || panelId;
        if (!visto.seen(src)) {
          visto.mark(src);
          if (opts.onFirstPlay) opts.onFirstPlay(src, panelId);
        }
      });
      v.addEventListener('error', function () { mostrarErrorVideo(v); });
    });

    document.addEventListener('layerchange', function (e) {
      var target = e.detail && e.detail.target;
      videos.forEach(function (v) {
        var panel = v.closest('[data-panel]');
        if (!panel) return;
        // se apaga si la capa que lo contiene YA NO es la activa
        // (target apunta a OTRA capa del mismo grupo, o a "base").
        if (panel.getAttribute('data-panel') === target) return;
        try { v.pause(); v.currentTime = 0; } catch (err) {}
      });
    });
  }

  /* ---- 6. Diapositiva-captura que cambia de imagen entera ----
     (kit v1.9.21 — la generalización que CLAUDE.md §1/§8 venía
     anotando como pendiente desde "Surtido sin venta")

     Patrón: una diapositiva es una captura íntegra y alguna zona
     dibujada en el arte (flechas de un carrusel, pestañas, los tramos
     de una barra de pasos) cambia la PÁGINA ENTERA por otra variante
     del mismo PDF. Hasta ahora esto se escribía a mano en cada curso
     — `initConceptShots()` en "Surtido sin venta" tenía los 7 nombres
     de concepto hardcodeados, y el propio CLAUDE.md dejaba dicho:
     "si un curso futuro repite el patrón, generalizarla recién ahí".
     "Seguridad alimentaria" lo repite CUATRO veces (2 carruseles,
     1 juego de pestañas y 1 barra de 4 pasos), así que acá está.

     Por qué swap de `src` y no `[data-layers]` con un panel por
     variante: son la MISMA página del PDF con una pieza distinta, así
     que N paneles serían N copias del mismo marcado (y N juegos de
     hitboxes que hay que mantener sincronizados). Una sola `.d-shot-img`
     con la lista de variantes es el mismo resultado visual con un
     orden de magnitud menos de HTML.

     Marcado:
       <div class="d-shot" data-shot
            data-shot-swap="malas"
            data-shot-swap-srcs="img/a.webp|img/b.webp|img/c.webp">
         <img class="d-shot-img" src="img/a.webp" alt="" aria-hidden="true">
         <button data-hit data-shot-swap-step="-1" …>Anterior</button>
         <button data-hit data-shot-swap-step="1"  …>Siguiente</button>
         <button data-hit data-shot-swap-go="2"    …>Ir al paso 3</button>
       </div>

     · `[data-shot-swap-step]` se OCULTA solo cuando el salto se iría de
       rango. No es cosmético: en estos PDF el diseñador dibuja la
       flecha solo en las páginas donde existe (la primera no tiene
       "anterior", la última no tiene "siguiente"), así que un botón
       invisible sobre una flecha que no está dibujada sería un hitbox
       fantasma — justo lo que CLAUDE.md §7.3 punto 4 prohíbe.
     · `[data-shot-swap-go]` marca `.is-active` + `aria-selected` en el
       que corresponde, para el caso pestañas/pasos.
     · Precarga todas las variantes al arrancar: sin eso, el primer
       clic muestra un parpadeo en blanco mientras baja la imagen.
     · `onChange(indice, id, vistos, total)` es el único gancho que
       necesita el curso: de ahí salen la narración del paso, los
       puntos y el gate. El módulo NO narra por su cuenta — quién narra
       qué es decisión de contenido (CLAUDE.md §5).

     Devuelve un mapa { id: { go, index, vistos, total } }. */
  function initShotSwap(opts) {
    opts = opts || {};
    var api = {};
    var grupos = document.querySelectorAll('[data-shot-swap]');

    Array.prototype.forEach.call(grupos, function (shot) {
      var id = shot.getAttribute('data-shot-swap');
      var srcs = (shot.getAttribute('data-shot-swap-srcs') || '').split('|')
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
      var img = shot.querySelector('.d-shot-img');
      if (!img || srcs.length < 2) return;

      srcs.forEach(function (s) { var p = new Image(); p.src = s; });

      var vistos = {};
      var i = Math.max(0, srcs.indexOf(img.getAttribute('src')));
      vistos[i] = true;
      /* Bandera para distinguir un `click` real (mouse O TÁCTIL) de uno
         sintetizado por activación de teclado — ver el porqué en el
         handler de `click` más abajo, `.d-shot-hit--paso`. */
      var pasoPointerVisto = false;

      function sync() {
        Array.prototype.forEach.call(shot.querySelectorAll('[data-shot-swap-step]'), function (b) {
          var d = parseInt(b.getAttribute('data-shot-swap-step'), 10) || 0;
          b.hidden = (i + d) < 0 || (i + d) > srcs.length - 1;
        });
        Array.prototype.forEach.call(shot.querySelectorAll('[data-shot-swap-go]'), function (b) {
          var n = parseInt(b.getAttribute('data-shot-swap-go'), 10);
          var on = n === i;
          b.classList.toggle('is-active', on);
          /* `aria-current` en vez de `aria-selected`: vale en cualquier
             botón, sin obligar al curso a montar un `role="tablist"`
             alrededor de hitboxes que el motor posiciona en absoluto. */
          if (on) b.setAttribute('aria-current', 'true');
          else b.removeAttribute('aria-current');
        });
      }

      /* Fundido corto al cambiar de variante (kit-base v1.9.51) — antes
         el swap de `src` era instantáneo, un salto seco entre página y
         página del PDF. Las `srcs` ya están precargadas (arriba,
         `new Image()`), así que el navegador tiene el bitmap nuevo en
         caché y pinta de inmediato — no hace falta esperar `load`, solo
         una transición de opacidad corta antes/después de asignar el
         `src`. `.d-shot-img--fade` (CSS pareja, coto-shot-stage.css)
         solo aplica mientras dura el cambio — se saca sola al terminar
         para no dejar una `transition` de opacity puesta todo el tiempo
         sobre una imagen que en el resto de los casos (diapositiva
         normal, sin swap) nunca la necesita. */
      var FADE_MS = 110;
      function swapSrc(nuevoSrc) {
        if (prefersReduced) { img.setAttribute('src', nuevoSrc); return; }
        img.classList.add('d-shot-img--fade');
        setTimeout(function () {
          img.setAttribute('src', nuevoSrc);
          setTimeout(function () { img.classList.remove('d-shot-img--fade'); }, FADE_MS);
        }, FADE_MS);
      }

      /* `sinFade`: la barra de pasos arrastrable (`pointermove`, más
         abajo) llama a `go()` una vez por evento durante el arrastre —
         con el fundido puesto ahí, cada paso que el dedo/mouse cruza
         de paso encadenaría su propio fade-out/fade-in, peleando entre
         sí y quedando siempre un paso atrás del gesto real (justo lo
         que un arrastre 1:1 no puede permitirse). El fundido es para
         navegación DISCRETA (clic/tecla en un paso o tab) — durante el
         arrastre, swap instantáneo, como siempre fue. */
      function go(n, silencioso, sinFade) {
        n = Math.max(0, Math.min(srcs.length - 1, n));
        if (n !== i) {
          i = n;
          if (sinFade) img.setAttribute('src', srcs[i]);
          else swapSrc(srcs[i]);
        }
        vistos[i] = true;
        sync();
        if (!silencioso && opts.onChange) {
          opts.onChange(i, id, Object.keys(vistos).length, srcs.length);
        }
      }

      shot.addEventListener('click', function (e) {
        var b = e.target.closest('[data-shot-swap-step],[data-shot-swap-go]');
        if (!b || !shot.contains(b) || b.hidden) return;
        /* `.d-shot-hit--paso`: un clic SIN arrastre ya NO mueve la
           barra (pedido explícito de producto, ver el bloque de
           `pointerdown` más abajo) — dejarlo pasar acá la haría saltar
           igual, contradiciendo esa decisión. PERO un `click` activado
           por TECLADO (Enter/Espacio sobre el botón con foco) nunca
           pasa por `pointerdown`/`pointermove` — sin distinguirlo, los
           pasos quedaban inalcanzables por teclado (bug real,
           encontrado auditando accesibilidad): ahí SÍ tiene que saltar
           directo, es el único disparador posible sin mouse/dedo.
           **`e.detail !== 0` NO alcanza para distinguirlos** (bug real,
           kit-base v1.9.38): un tap táctil real también sintetiza un
           `click` con `detail: 0` — igual al de teclado —, así que ese
           chequeo dejaba pasar el salto directo en touch, justo lo que
           esta función existe para evitar. La distinción real es "¿hubo
           un `pointerdown` justo antes de este `click`?" — eso pasa con
           mouse Y con touch, nunca con teclado. */
        if (b.classList.contains('d-shot-hit--paso')) {
          var fuePointer = pasoPointerVisto;
          pasoPointerVisto = false;
          if (fuePointer) return;
        }
        if (b.hasAttribute('data-shot-swap-go')) go(parseInt(b.getAttribute('data-shot-swap-go'), 10));
        else go(i + (parseInt(b.getAttribute('data-shot-swap-step'), 10) || 0));
      });

      /* Barra de "pasos" arrastrable (pedido explícito, "Seguridad
         alimentaria": "la barra de la diapo rotación tendría que
         poder deslizarse con el mouse"). Acotado a `.d-shot-hit--paso`
         a propósito — NO a cualquier `[data-shot-swap-go]`: ese mismo
         atributo también arma pestañas de categoría (`.d-shot-hit--tab`,
         "Personas/Medio ambiente/Plagas/..."), donde arrastrar entre
         opciones no tiene sentido semántico (no son un progreso lineal).
         `.d-shot-hit--paso` sí lo es (Paso 1 de 4, 2 de 4...), así que
         solo ahí se reemplaza el clic-por-tramo por arrastre real.
         Pedido explícito de producto: un clic SIN mover ya NO salta al
         tramo tocado (se sacó a propósito) — hay que arrastrar de
         verdad. El único disparador puntual (sin arrastre) que queda
         es la activación por TECLADO (Enter/Espacio con foco, ver más
         abajo): no tiene forma de "arrastrar", así que sigue saltando
         directo al paso. Mismo patrón que la barra de progreso del
         curso (`initProgressSeek`, coto-player.js) — MISMO elemento
         escucha down/move/up Y recibe el `setPointerCapture` (acá,
         `shot`).

         BUG REAL propio, encontrado antes de subir esto: la 1ª versión
         escuchaba `pointerdown` en cada BOTÓN y capturaba en `shot` —
         dos elementos distintos. Rompía por partida doble: (1) el paso
         ACTIVO tiene `pointer-events:none` (CSS ya existente, para no
         competir con el resaltado) así que ese botón puntual NUNCA
         recibe `pointerdown` — no se puede ni EMPEZAR el arrastre
         parado en el paso donde ya se está; (2) `setPointerCapture` en
         un elemento que no es el mismo que escucha el evento no
         retargetea de forma confiable (verificado con Playwright:
         `pointermove` dejaba de llegar a los pocos eventos). Fix:
         todo — down, move, up y la captura — vive en `shot`, y el
         punto de partida se decide por POSICIÓN (¿el click cayó
         dentro del rectángulo que ocupan los botones de paso?), no por
         cuál elemento fue el target — así funciona arrancando desde
         CUALQUIER paso, activo o no. */
      var pasos = Array.prototype.filter.call(
        shot.querySelectorAll('[data-shot-swap-go]'),
        function (b) { return b.classList.contains('d-shot-hit--paso'); }
      );
      if (pasos.length > 1) {
        var arrastrandoPaso = false;
        var pasoIniciadoX = 0;
        var pasoMovioDeVerdad = false;
        // Cuánto tiene que moverse el puntero antes de contar como
        // arrastre real — sin esto, CUALQUIER clic (bajar+soltar el
        // mouse casi nunca es 100% inmóvil, siempre hay 1-2px de
        // temblor real) terminaba llamando a `go()` en el primer
        // `pointermove`, o sea saltando igual que si el "clic salta al
        // tramo" nunca se hubiera sacado (bug real reportado por el
        // cliente: "todavía se puede hacer clic para moverla"). Recién
        // a partir de este umbral se considera arrastre de verdad.
        var UMBRAL_ARRASTRE_PX = 6;
        function trackPasos() {
          var rects = pasos.map(function (b) { return b.getBoundingClientRect(); });
          return {
            left: Math.min.apply(null, rects.map(function (r) { return r.left; })),
            right: Math.max.apply(null, rects.map(function (r) { return r.right; })),
            top: Math.min.apply(null, rects.map(function (r) { return r.top; })),
            bottom: Math.max.apply(null, rects.map(function (r) { return r.bottom; }))
          };
        }
        function indiceDesdeX(x, t) {
          var frac = (x - t.left) / (t.right - t.left);
          frac = Math.max(0, Math.min(1, frac));
          return Math.round(frac * (pasos.length - 1));
        }
        shot.addEventListener('pointerdown', function (e) {
          /* Se marca ANTES del chequeo de rango: un `click` sobre un
             botón de paso siempre cae dentro de ese rango (el botón es
             uno de los medidos por `trackPasos()`), así que este
             `pointerdown` es la señal fiable de "no fue teclado" que
             lee el handler de `click`, sin importar mouse o touch. */
          pasoPointerVisto = true;
          var t = trackPasos();
          if (e.clientX < t.left || e.clientX > t.right || e.clientY < t.top || e.clientY > t.bottom) return;
          /* BUG REAL, el que costó más encontrar de toda esta función:
             el arrastre se cortaba solo a mitad de camino, de forma
             intermitente — a veces al primer intento, a veces recién
             al segundo. Causa real (confirmada instrumentando
             `pointercancel`/`gotpointercapture` con logs): el punto de
             partida cae sobre el `<img>` de fondo (el botón del paso
             ACTIVO tiene `pointer-events:none`, así que el target real
             del down es la imagen debajo) — y una imagen es
             ARRASTRABLE por el navegador por default. En cuanto el
             mouse se mueve lo suficiente, el navegador arranca SU
             PROPIO drag-and-drop nativo de imagen y cancela la
             secuencia de punteros con `pointercancel`, cortando el
             `pointermove` en seco. `preventDefault()` en el `pointerdown`
             se lo impide — mismo motivo por el que la barra de progreso
             del curso (`initProgressSeek`) nunca lo necesitó: su pista
             es un `<div>`, no una imagen, y los `<div>` no son
             arrastrables por default. */
          e.preventDefault();
          // Sin `go()` acá a propósito: un clic sin mover ya no salta
          // — hace falta arrastrar de verdad (pedido explícito). El
          // índice recién se actualiza en `pointermove`, más abajo.
          arrastrandoPaso = true;
          pasoMovioDeVerdad = false;
          pasoIniciadoX = e.clientX;
          shot.classList.add('is-seeking-paso');
          try { shot.setPointerCapture(e.pointerId); } catch (err) {}
        });
        shot.addEventListener('pointermove', function (e) {
          if (!arrastrandoPaso) return;
          if (!pasoMovioDeVerdad) {
            if (Math.abs(e.clientX - pasoIniciadoX) < UMBRAL_ARRASTRE_PX) return;
            pasoMovioDeVerdad = true;
          }
          go(indiceDesdeX(e.clientX, trackPasos()), false, true); // sinFade=true: arrastre 1:1, ver el comentario en go()
        });
        ['pointerup', 'pointercancel'].forEach(function (ev) {
          shot.addEventListener(ev, function () {
            arrastrandoPaso = false;
            shot.classList.remove('is-seeking-paso');
          });
        });
      }

      sync();
      api[id] = {
        go: go,
        index: function () { return i; },
        vistos: function () { return Object.keys(vistos).length; },
        total: srcs.length
      };
    });

    return api;
  }

  /* ---- Red de seguridad universal: ningún <video> queda sonando
     fuera de su contexto activo (kit-base v1.9.39) ----
     Los 4 patrones de arriba (fondo/pop-up/círculo/capa) ya se apagan
     solos en su propio evento — esto es un CINTURÓN EXTRA, no un
     reemplazo: barre TODOS los <video> del documento en cada
     `slidechange`/`popupclose`/`layerchange` y pausa cualquiera que
     siga reproduciéndose fuera de la diapositiva/pop-up/capa que
     quedó activa. Cubre tanto un video con un patrón nuevo que un
     curso escriba a mano y se olvide de cablear el apagado (el bug
     real de "¿quién lo apaga?" ya documentado 4 veces — CLAUDE.md
     §6.10.1 punto 1, §6.18 punto 2, §6.20 punto 6.1, §6.45 gap 6) como
     un descuido futuro en uno de los patrones del kit mismo.

     No pisa nada de la lógica fina de cada patrón (reset de
     `currentTime`, sacar `controls`, marcar "visto") — solo pausa.
     Esos detalles siguen siendo responsabilidad de cada patrón que
     SÍ conoce su propio contrato; acá no se sabe (ni hace falta saber)
     qué patrón es cada video. */
  function activo(el) {
    var slide = el.closest('[data-slide]');
    if (slide && slide.hidden) return false;
    var popup = el.closest('[data-popup]');
    if (popup && !popup.classList.contains('open')) return false;
    var panel = el.closest('[data-panel]');
    if (panel && panel.hidden) return false;
    return true;
  }
  function initVideoSafetyNet() {
    function barrer() {
      Array.prototype.forEach.call(document.querySelectorAll('video'), function (v) {
        if (!v.paused && !activo(v)) v.pause();
      });
    }
    document.addEventListener('slidechange', barrer);
    document.addEventListener('popupclose', barrer);
    document.addEventListener('layerchange', barrer);
  }

  global.videoUsable = videoUsable;
  global.initBgVideos = initBgVideos;
  global.initVideoPlayer = initVideoPlayer;
  global.initInlineCircleVideos = initInlineCircleVideos;
  global.initPopupVideos = initPopupVideos;
  global.initLayerVideos = initLayerVideos;
  global.initShotSwap = initShotSwap;
  global.initVideoSafetyNet = initVideoSafetyNet;
})(window);
