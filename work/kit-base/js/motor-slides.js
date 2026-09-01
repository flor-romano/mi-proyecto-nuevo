/* ============================================================
   motor-slides.js  ·  Motor de diapositivas / capas / pop-ups
   kit-base v1.0 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual a cada curso nuevo, sin editar.
   ------------------------------------------------------------
   Implementa el contrato de spec-motor-slides.md:
     · Diapositivas: [data-slide][data-slide-index], una visible.
     · Capas: grupos [data-layers] con paneles [data-panel] y
       disparadores [data-target] (tabs, stepper, carrusel).
     · Pop-ups: [data-popup-trigger] abre [data-popup] con .open;
       cierra por X / backdrop / Esc / al navegar. Atrapa el foco.
     · Índice clickeable: [data-goto="slide-id"].
     · Pop-up de instrucciones automático sobre el índice (1ª vez).
   NO habla con el LMS: solo emite eventos (`slidechange`, `courseend`,
   `layerchange`, `popupopen`, `popupclose`). El wrapper SCORM y la
   narración por voz (narrador.js + curso.js) los escuchan aparte.
   Un solo index.html, SIN scroll de página.
   ============================================================ */
(function (global) {
  'use strict';

  var prefersReduced = global.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function Motor(root) {
    this.root = root || document;
    this.slides = [];
    this.index = 0;
    this.openPopup = null;
    this._lastFocus = null;
    this._gatedShown = {};
    this._pendingNav = null;
    this._introShown = false;
    // Estado del gate visual del botón "Siguiente" — ver _syncGate().
    this._navGated = false;
    // Punto de extensión oficial: curso.js puede pisar esto
    // (this.canAdvance = function (slideEl) {...}) para frenar el avance
    // por una regla de CONTENIDO (ej. "explorar las 7 pestañas antes de
    // seguir") — el motor solo la consulta en _advance(), nunca sabe cuál
    // es la regla. null = sin gate, cualquier diapositiva se puede pasar.
    this.canAdvance = null;
    this._init();
  }

  Motor.prototype._init = function () {
    var self = this;
    this.slides = Array.prototype.slice.call(this.root.querySelectorAll('[data-slide]'))
      .sort(function (a, b) {
        return (+a.getAttribute('data-slide-index')) - (+b.getAttribute('data-slide-index'));
      });

    // Navegación prev/next
    this.root.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self._advance(btn.getAttribute('data-nav') === 'next' ? 1 : -1);
      });
    });

    // Índice clickeable (salta directo)
    this.root.querySelectorAll('[data-goto]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        self.gotoId(link.getAttribute('data-goto'));
      });
    });

    // Capas (tabs / stepper / carrusel) — genérico por grupo
    this.root.querySelectorAll('[data-layers]').forEach(function (group) {
      self._initLayers(group);
    });

    // Pop-ups: disparadores
    this.root.querySelectorAll('[data-popup-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.showPopup(btn.getAttribute('data-popup-trigger'));
      });
    });
    // Pop-ups: cierres
    this.root.querySelectorAll('[data-popup-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { self.closePopup(); });
    });

    // Teclado global
    global.addEventListener('keydown', function (e) {
      if (self.openPopup) {
        if (e.key === 'Escape') { self.closePopup(); return; }
        if (e.key === 'Tab') { self._trapFocus(e); }
        return;
      }
      if (e.target && /input|textarea|button/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') self._advance(1);
      else if (e.key === 'ArrowLeft') self._advance(-1);
    });

    // Swipe táctil sobre el escenario: deslizar a la izquierda avanza, a la
    // derecha retrocede — mismo punto de entrada que botones/flechas
    // (_advance), así que respeta gates y data-nav-cta igual que ellos.
    // Umbrales: gesto mayormente horizontal (dx > 1.5·dy), de ≥60px y
    // rápido (<600ms), un solo dedo. No se registra si arranca sobre un
    // control (botón/hitspot/slider) ni con un pop-up abierto — y como
    // solo mira touchend, nunca interfiere con taps ni con el scroll
    // vertical de una diapo alta.
    var stage = this.root.querySelector('.d-stage');
    if (stage) {
      var t0 = null;
      stage.addEventListener('touchstart', function (e) {
        if (self.openPopup || e.touches.length !== 1) { t0 = null; return; }
        if (e.target.closest('button, a, input, [data-hit], [data-slide-thumb]')) { t0 = null; return; }
        t0 = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
      }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        if (!t0 || self.openPopup) return;
        var dx = e.changedTouches[0].clientX - t0.x;
        var dy = e.changedTouches[0].clientY - t0.y;
        var dt = Date.now() - t0.t;
        t0 = null;
        if (dt > 600 || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        self._advance(dx < 0 ? 1 : -1);
      }, { passive: true });
    }

    /* Re-evaluar el gate visual (_syncGate, ver más abajo) después de
       CUALQUIER clic dentro de root — es el único hook genérico posible:
       el motor no sabe qué interacción del curso satisface `canAdvance()`
       (puede ser un hitbox, un video, una pestaña...), así que en vez de
       que cada patrón nuevo tenga que acordarse de avisarle al motor,
       escucha TODO clic y listo. CAPTURA (tercer argumento `true`) +
       `setTimeout(fn, 0)`: el clic real todavía tiene que burbujear y
       correr el handler del CURSO que actualiza el estado que
       `canAdvance()` lee (ej. marcar un hitbox como visto) — si
       `_syncGate` corriera sincrónico acá, leería el estado VIEJO, de
       antes de ese handler. Diferido al próximo tick, ya está actualizado. */
    this.root.addEventListener('click', function () {
      setTimeout(function () { self._syncGate(true); }, 0);
    }, true);

    // Marcas de sección en la barra de progreso (una sola vez: no cambian
    // con la navegación, a diferencia del relleno/pulgar que sí).
    this._initProgressSections();

    // Hitboxes de las diapos-captura (data-shot + data-hit)
    this._initShots();

    // Entrada escalonada de los hitboxes al entrar a una diapositiva —
    // registrado DESPUÉS de _initShots() a propósito (ver el método).
    this._initHitStagger();
    this._initPlaceStagger();

    // Estado inicial — respeta un deep-link de revisión si hay uno activo
    // (ver _resolverDeepLink más abajo).
    this.go(this._resolverDeepLink(), true);
    this._initDeepLinkSync();
    this._initReviewOverlay();
  };

  /* ============================================================
     Modo revisión — kit-base v1.9.48
     ------------------------------------------------------------
     Pedido real: poder abrir el curso directo en una diapositiva
     puntual para revisar/validar un cambio (deep-link), y de un
     vistazo saber qué tiene esa diapositiva — hitbox, gate, pop-ups
     — sin tener que inspeccionar el HTML. Las tres piezas comparten
     el mismo guard: `?review=1` en la URL.

     A PROPÓSITO detrás de `?review=1`, no activo por default: sin
     ese guard, cualquiera podría escribir `#slide=<id-del-final>` en
     la barra de direcciones y saltarse TODOS los gates de contenido
     de un salto — el mismo mecanismo que existe para revisar rápido
     se volvería una forma trivial de saltarse el curso. La URL real
     que entrega el LMS nunca lleva `?review=1`, así que un alumno
     común nunca lo activa sin querer.
     ============================================================ */
  function enModoRevision() {
    return /[?&]review=1(&|$)/.test(global.location.search);
  }
  Motor.prototype._resolverDeepLink = function () {
    if (!enModoRevision()) return 0;
    var m = /slide=([^&]+)/.exec(global.location.hash);
    if (!m) return 0;
    var id = decodeURIComponent(m[1]);
    for (var k = 0; k < this.slides.length; k++) {
      if (this.slides[k].getAttribute('data-slide') === id) return k;
    }
    return 0;
  };
  // Mientras el modo revisión está activo, la URL refleja SIEMPRE la
  // diapositiva actual (replaceState: no ensucia el historial ni
  // interfiere con el botón atrás) — así se puede copiar/compartir el
  // link exacto de lo que se está mirando en ese momento.
  Motor.prototype._initDeepLinkSync = function () {
    if (!enModoRevision()) return;
    document.addEventListener('slidechange', function (e) {
      try {
        global.history.replaceState(null, '', '?review=1#slide=' + encodeURIComponent(e.detail.id));
      } catch (err) {}
    });
  };

  /* `.is-review-mode` en <html>: pinta los `[data-hit]` con un contorno
     (CSS pareja en coto-shot-stage.css) — sin esto son invisibles a
     propósito para el alumno, así que auditar "¿dónde están todas las
     zonas clickeables de esta diapo?" a ojo es imposible sin abrir
     el inspector. Sumado a un chip fijo con lo que la propia diapositiva
     YA declara en su marcado: `data-gate-popup`/`data-require-seen`/
     `data-require-popups` (gate — mismos atributos que lee `canAdvance`
     en curso.js, spec-motor-slides.md §7), `[data-popup-trigger]` y
     `[data-hit]` contados. Es información que el motor YA tiene sin
     preguntarle nada al curso — ninguna de las tres depende de contenido. */
  Motor.prototype._initReviewOverlay = function () {
    if (!enModoRevision()) return;
    var self = this;
    document.documentElement.classList.add('is-review-mode');
    var chip = document.createElement('div');
    chip.className = 'd-review-chip';
    chip.setAttribute('role', 'button');
    chip.setAttribute('tabindex', '0');
    chip.setAttribute('aria-label', 'Modo revisión: ver datos de tracking');
    document.body.appendChild(chip);

    /* Panel de datos de tracking (kit-base v1.9.48) — colapsado por
       default, se abre clickeando el chip. Muestra lo que SCORM/xAPI
       YA están registrando en esta sesión sin que haga falta leer
       localStorage/LMS a mano: `SCORM.loadState()`/`cmi.core.*` (si
       scorm-api.js está cargado — puede no estarlo, se degrada solo)
       y `XAPI.getLog()` (los últimos statements, ya expuestos para
       QA desde que existe xapi.js — ver ahí "útil para QA"). Ninguno
       de los dos módulos sabe que este panel existe: solo lee lo que
       ya exponen. */
    var panel = document.createElement('div');
    panel.className = 'd-review-panel';
    document.body.appendChild(panel);
    chip.addEventListener('click', function () { panel.classList.toggle('is-open'); actualizarPanel(); });
    chip.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); }
    });

    function actualizarChip() {
      var slideEl = self.current();
      if (!slideEl) return;
      var gated = slideEl.hasAttribute('data-gate-popup') ||
        slideEl.hasAttribute('data-require-seen') ||
        slideEl.hasAttribute('data-require-popups');
      var hits = slideEl.querySelectorAll('[data-hit]').length;
      var pops = slideEl.querySelectorAll('[data-popup-trigger]').length;
      var partes = [];
      if (gated) partes.push('🔒 gate');
      if (hits) partes.push(hits + ' hitbox' + (hits === 1 ? '' : 'es'));
      if (pops) partes.push(pops + ' pop-up' + (pops === 1 ? '' : 's'));
      chip.textContent = (partes.length ? partes.join(' · ') : 'sin gate/hitbox/pop-up') + '  ▸';
    }

    function esc(s) {
      var d = document.createElement('div');
      d.textContent = String(s == null ? '' : s);
      return d.innerHTML;
    }

    function actualizarPanel() {
      if (!panel.classList.contains('is-open')) return;
      var html = '<div class="d-review-panel-sec"><b>Diapositiva</b> ' +
        (self.index + 1) + '/' + self.slides.length + ' — <code>' + esc(self.current().getAttribute('data-slide')) + '</code>' +
        (typeof self.maxVisited === 'number' ? ' · vistas hasta ' + (self.maxVisited + 1) : '') + '</div>';

      html += '<div class="d-review-panel-sec"><b>SCORM</b> ';
      if (global.SCORM) {
        html += 'estado: ' + esc(global.SCORM.getLocation ? (global.SCORM.getLocation() || '(sin lesson_location)') : '?');
        try {
          var estado = global.SCORM.loadState && global.SCORM.loadState();
          html += ' · suspend_data: ' + (estado ? JSON.stringify(estado).length + ' car.' : '(vacío)');
        } catch (e) {}
      } else {
        html += '<i>scorm-api.js no cargado</i>';
      }
      html += '</div>';

      html += '<div class="d-review-panel-sec"><b>xAPI</b> ';
      if (global.XAPI) {
        html += global.XAPI.isConnected() ? 'conectado a LRS' : 'modo local (sin LRS configurado)';
        var registro = global.XAPI.getLog().slice(-5).reverse();
        if (registro.length) {
          html += '<ul class="d-review-panel-log">' + registro.map(function (st) {
            var verbo = (st.verb.id || '').split('/').pop();
            var obj = (st.object && st.object.definition && st.object.definition.name && st.object.definition.name.es) || (st.object && st.object.id) || '';
            return '<li>' + esc(verbo) + ' — ' + esc(obj) + '</li>';
          }).join('') + '</ul>';
        } else {
          html += '<div><i>sin statements todavía</i></div>';
        }
      } else {
        html += '<i>xapi.js no cargado</i>';
      }
      html += '</div>';

      panel.innerHTML = html;
    }

    document.addEventListener('slidechange', function () { actualizarChip(); actualizarPanel(); });
    global.setInterval(actualizarPanel, 2000); // refleja session_time/log sin depender de navegar
    actualizarChip();
  };

  /* ---- Marcas de sección en la barra de progreso ----
     Genérico: no sabe nada del contenido del curso. Deriva los "capítulos"
     de la misma estructura que ya arma el índice lateral clickeable —
     un [data-goto] agrupado bajo el ".d-sidenav-group" más cercano hacia
     atrás en el DOM (ver spec-motor-slides.md, "Índice clickeable"). Si el
     curso no tiene grupos (o solo tiene uno), no agrega nada: no hay
     "capítulos" que marcar. Reemplaza los 4 hitos parejos (25/50/75%,
     puramente decorativos) que tenía la pista antes por marcas reales,
     con tooltip del nombre de sección al pasar el mouse/foco. */
  Motor.prototype._initProgressSections = function () {
    var track = this.root.querySelector('[data-progress-track]');
    if (!track) return;
    var groups = []; // { label, firstGotoId }
    var cur = null;
    Array.prototype.forEach.call(this.root.querySelectorAll('.d-sidenav-group, [data-goto]'), function (el) {
      if (el.classList.contains('d-sidenav-group')) { cur = { label: el.textContent.trim(), firstGotoId: null }; groups.push(cur); }
      else if (cur && !cur.firstGotoId) { cur.firstGotoId = el.getAttribute('data-goto'); }
    });
    if (groups.length < 2) return;
    var last = this.slides.length - 1;
    if (last <= 0) return;
    var self = this;
    groups.slice(1).forEach(function (g) { // el 1er grupo arranca en 0%, no necesita marca
      var idx = -1;
      for (var k = 0; k < self.slides.length; k++) {
        if (self.slides[k].getAttribute('data-slide') === g.firstGotoId) { idx = k; break; }
      }
      if (idx <= 0) return;
      var mark = document.createElement('span');
      mark.className = 'd-progress-mark';
      mark.style.left = (idx / last * 100) + '%';
      mark.setAttribute('data-section-label', g.label);
      mark.setAttribute('aria-hidden', 'true'); // decorativo: la info de sección ya está en el índice lateral (accesible)
      track.appendChild(mark);
    });
  };

  /* ---- Hitboxes sobre diapos-captura ([data-shot] + [data-hit]) ----
     Genérico: no sabe nada del contenido del curso, solo lee data-l/t/w/h
     (% contra el tamaño REAL renderizado de la imagen base, ver
     spec-motor-slides.md) y el object-fit/object-position computados de
     ".d-shot-img" — soporta cover, contain y el caso sin object-fit
     (tamaño natural). Se movió acá desde curso.js (donde vivía por
     historia): cualquier curso que use el patrón ".d-shot-slide--bg-*" +
     "[data-hit]" lo hereda gratis, sin copiar la función.
     ".d-shot-video" (diapositiva con fondo de video, ver coto-media.js
     `initBgVideos`) puede tener hitboxes igual que ".d-shot-img" — el
     video, igual que la captura, no siempre carga (placeholder de 0
     bytes hasta que el cliente sube el archivo final), así que el
     tamaño "natural" para posicionar se toma del `poster` (siempre
     presente, es el mismo arte que tendría la imagen estática) en vez
     de `videoWidth/videoHeight`. */
  Motor.prototype._initShots = function () {
    document.querySelectorAll('[data-shot]').forEach(function (shot) {
      var img = shot.querySelector('.d-shot-img');
      var video = !img ? shot.querySelector('.d-shot-video') : null;
      var media = img || video;
      // [data-hit] = zona interactiva (botón invisible sobre el arte).
      // [data-place] = overlay que tiene que quedar REGISTRADO con el arte
      // pero NO es clickeable (un panel de texto, una etiqueta, una guía).
      // Se sumó en v1.7: antes la única forma de posicionar algo contra la
      // imagen era marcarlo [data-hit], y eso lo declara interactivo —
      // hitbox-click-check lo marcaba como fallo, con razón, porque un
      // [data-hit] que no responde al clic es un botón roto para un lector
      // de pantalla. Los dos se posicionan igual; solo cambia qué promete
      // cada uno.
      var hits = shot.querySelectorAll('[data-hit], [data-place]');
      if (!media || !hits.length) return;
      /* Warning de desarrollo (kit-base v1.9.39): `place()` más abajo
         escribe `left`/`top` en `px` sobre cada hit — eso NO HACE NADA
         si el elemento está en flujo normal (`position:static`, el
         default). Bug real ya encontrado dos veces por esta razón
         exacta (CLAUDE.md §6.22 punto 7, §6.45): un `[data-hit]`/
         `[data-place]` nuevo, con sus `data-l/t/w/h` bien medidos,
         quedaba invisible en el lugar equivocado (o sin efecto) porque
         la clase que lo dibuja no hereda `position:absolute` de
         ninguna base (`.d-shot-hit`, `.d-info-panel`, etc. sí la
         traen — el bug aparece con una clase NUEVA que se olvida de
         heredarla). Antes solo se veía mirando la pantalla; ahora
         avisa solo, una vez por elemento, apenas se detecta. */
      hits.forEach(function (h) {
        if (getComputedStyle(h).position !== 'absolute') {
          console.warn(
            '[motor-slides] elemento con data-l/t/w/h pero sin position:absolute ' +
            '(su left/top en px no va a hacer nada) — ', h
          );
        }
      });
      function place(natW, natH) {
        if (!natW || !natH) return;
        var boxW = media.clientWidth, boxH = media.clientHeight;
        if (!boxW || !boxH) return;
        var fit = getComputedStyle(media).objectFit;
        var scale = fit === 'contain' ? Math.min(boxW / natW, boxH / natH)
                  : fit === 'cover'   ? Math.max(boxW / natW, boxH / natH)
                  : boxW / natW; // 'fill'/auto (tamaño natural histórico)
        var dispW = natW * scale, dispH = natH * scale;
        // object-position real (no siempre "50% 50%" centrado — p.ej.
        // conceptos usa "0% 50%" con cover para que el recorte sobrante
        // se coma de un lado y nunca del otro, donde hay elementos
        // clickeables pegados al borde). computedStyle ya lo resuelve a %
        // (o keyword→%): 0%=pegado al borde de ese eje, 50%=centrado,
        // 100%=pegado al otro borde — misma fórmula que usa el navegador.
        var pos = getComputedStyle(media).objectPosition.split(' ');
        var px = parseFloat(pos[0]) || 0, py = parseFloat(pos[1] !== undefined ? pos[1] : pos[0]) || 0;
        var ox = media.offsetLeft + (boxW - dispW) * (px / 100);
        var oy = media.offsetTop + (boxH - dispH) * (py / 100);
        hits.forEach(function (h) {
          h.style.left = (ox + parseFloat(h.getAttribute('data-l')) / 100 * dispW) + 'px';
          h.style.top = (oy + parseFloat(h.getAttribute('data-t')) / 100 * dispH) + 'px';
          h.style.width = (parseFloat(h.getAttribute('data-w')) / 100 * dispW) + 'px';
          h.style.height = (parseFloat(h.getAttribute('data-h')) / 100 * dispH) + 'px';
        });
      }
      if (img) {
        var placeImg = function () { place(img.naturalWidth, img.naturalHeight); };
        /* El listener de `load` se engancha SIEMPRE, no solo cuando la
           imagen todavía no cargó. BUG REAL (kit v1.9.10): si un curso
           cambia el `src` de una diapositiva-captura en caliente — el
           panel final del minijuego lo hace, una arte por resultado —
           la nueva imagen dispara `load`, pero si al iniciar la vieja
           ya estaba completa no había ningún listener escuchando, así
           que las hitboxes y los [data-place] se quedaban con las
           coordenadas viejas (o sin calcular, si el panel arrancó
           oculto con clientWidth 0). El ResizeObserver tampoco salva:
           las dos artes miden lo mismo, así que no hay cambio de
           tamaño que observar. */
        img.addEventListener('load', placeImg);
        if (img.complete) placeImg();
        window.addEventListener('resize', placeImg);
        if (window.ResizeObserver) { new ResizeObserver(placeImg).observe(img); }
        else document.addEventListener('slidechange', placeImg);
      } else {
        /* El `poster` es la ÚNICA fuente de tamaño natural para una
           diapositiva de video (ver el comentario del método): sin él,
           `poster.src = null` se convierte en la cadena "null" y el
           navegador pide una URL inexistente que nunca dispara `load`
           — los hitboxes se quedan sin posicionar, en silencio y sin
           nada en pantalla que lo explique. Se avisa una vez, con el
           mismo criterio que el warning de `position:absolute`. */
        var posterSrc = video.getAttribute('poster');
        if (!posterSrc) {
          console.warn(
            '[motor-slides] .d-shot-video con [data-hit]/[data-place] pero sin atributo ' +
            '`poster`: no hay tamaño natural de referencia, las zonas quedan sin posicionar — ', video
          );
          return;
        }
        var poster = new Image();
        var placeVideo = function () { place(poster.naturalWidth, poster.naturalHeight); };
        poster.addEventListener('load', placeVideo);
        poster.src = posterSrc;
        window.addEventListener('resize', placeVideo);
        if (window.ResizeObserver) { new ResizeObserver(placeVideo).observe(video); }
        else document.addEventListener('slidechange', placeVideo);
      }
    });
  };

  /* ---- Entrada escalonada de hitboxes (kit-base v1.9.51) ----
     Pedido de diseño: las diapositivas con varias zonas interactivas
     ([data-hit]) hoy aparecen todas juntas, sin ninguna jerarquía
     visual que sugiera por dónde arrancar a explorar. Reusa
     `.d-stagger-in` (coto-base.css) — mismo lenguaje visual que ya usa
     `staggerReveal()` (coto-ui.js) para pop-ups, no una animación
     nueva — con el mismo truco de reset (`classList.remove` +
     `void el.offsetWidth` + `classList.add`) para que la animación
     vuelva a jugar cada vez que se re-entra a la diapositiva, no solo
     la primera.

     Registrado DESPUÉS de `_initShots()` en `_init()` a propósito: los
     listeners de `slidechange` que `_initShots()` arma (`placeImg`/
     `placeVideo`) corren PRIMERO en el mismo evento (orden de
     registro = orden de ejecución para listeners del mismo target) y
     dejan `left/top/width/height` ya actualizados antes de que este
     código toque `opacity`/`transform` — nunca anima un hitbox que
     todavía está mal posicionado.

     Solo `[data-hit]` (interactivo) — `[data-place]` (overlay
     decorativo, texto/guía sin acción) queda afuera a propósito: no
     es una zona para "explorar", escalonarla no suma jerarquía, y
     `data-narrate-last` (repaso, algunos paneles) ya depende de que
     ciertos `[data-place]` estén disponibles/legibles de inmediato. */
  Motor.prototype._initHitStagger = function () {
    if (prefersReduced) return;
    document.addEventListener('slidechange', function (e) {
      var slide = document.querySelector('[data-slide="' + CSS.escape(e.detail.id) + '"]');
      if (!slide) return;
      var hits = slide.querySelectorAll('[data-hit]');
      Array.prototype.forEach.call(hits, function (h, i) {
        h.classList.remove('d-stagger-in');
        void h.offsetWidth; // fuerza reflow: sin esto, re-agregar la misma clase no reinicia @keyframes
        h.style.animationDelay = (i * 45) + 'ms';
        h.classList.add('d-stagger-in');
      });
    });
  };

  /* ---- Entrada escalonada de overlays de texto real (kit-base v1.9.51) ----
     CLAUDE.md §6.11 ya deja fijado que el escalonado NO se puede lograr
     sobre una diapositiva-captura (el texto está horneado en el .webp,
     no hay "título"/"párrafo" separados) — pero eso es sobre el ARTE.
     Un `[data-place]` (panel de texto HTML real, registrado por
     posición contra el arte — `.d-info-panel`, `.d-mj-fin-stat`, etc.)
     SÍ es HTML real, exactamente el caso donde §6.11 dice que el
     escalonado es "trivial y ya resuelto" — solo que hasta acá ese
     resuelto era nada más para pop-ups (`popupopen`). Esto extiende el
     MISMO criterio (`.d-stagger-in`, mismo truco de reset) al momento
     de entrar a la diapositiva.

     `:not([aria-hidden="true"])` filtra los `[data-place]` puramente
     decorativos/de estado (ej. `.d-riesgo-check`, un tilde que un
     minijuego prende/apaga según progreso — nunca "aparece" al entrar
     a la diapo, aparece cuando el estado cambia) — animarlos en
     `slidechange` los haría destellar aunque no tengan nada que ver
     con la entrada. Los paneles de texto real (`.d-info-panel` y
     similares) nunca llevan `aria-hidden`, porque su contenido tiene
     que ser perceivable — ahí sí es "texto real" en el sentido del
     pedido. */
  Motor.prototype._initPlaceStagger = function () {
    if (prefersReduced) return;
    document.addEventListener('slidechange', function (e) {
      var slide = document.querySelector('[data-slide="' + CSS.escape(e.detail.id) + '"]');
      if (!slide) return;
      var panels = slide.querySelectorAll('[data-place]:not([aria-hidden="true"])');
      Array.prototype.forEach.call(panels, function (p, i) {
        p.classList.remove('d-stagger-in');
        void p.offsetWidth;
        p.style.animationDelay = (i * 90) + 'ms';
        p.classList.add('d-stagger-in');
      });
    });
  };

  /* ---- Techo real de arrastre hacia adelante (`initProgressSeek`,
     coto-player.js) — `motor.maxVisited` ----
     Absorbe al kit un bug real que costó una vuelta completa
     encontrar en "Seguridad alimentaria" (CLAUDE.md §6.51): cada curso
     tenía que escribir a mano, en su `boot()`, el loop que recalcula
     el máximo visitado desde `estado.vistas` YA RESTAURADO al abrir el
     curso (no solo desde `motor.index` en frío) — y mientras eso vivió
     como una nota de checklist en vez de código, el bug volvió a pasar:
     quien reabre el curso en una sesión nueva se encontraba con la
     barra creyendo que no había visto nada, aunque puntos/logros sí
     restauraban bien (mismo dato, `estado.vistas`, restaurado en un
     lugar y olvidado en otro — la misma familia de bug de siempre).

     Llamarlo UNA vez, después de restaurar el progreso persistido:
       motor.restoreMaxVisited(estado.vistas);
     Después de esa llamada, el motor solo se actualiza: cada
     `slidechange` sube el techo si hace falta, sin que el curso tenga
     que volver a tocar `motor.maxVisited` nunca más. */
  Motor.prototype.restoreMaxVisited = function (vistas) {
    var motor = this;
    var max = this.index;
    this.slides.forEach(function (el) {
      var id = el.getAttribute('data-slide');
      if (vistas && vistas[id]) {
        var i = +el.getAttribute('data-slide-index');
        if (i > max) max = i;
      }
    });
    this.maxVisited = max;
    if (!this._maxVisitedWired) {
      this._maxVisitedWired = true;
      document.addEventListener('slidechange', function () {
        motor.maxVisited = Math.max(motor.maxVisited, motor.index);
      });
    }
    return this.maxVisited;
  };

  /* ---- Navegación de diapositivas ---- */
  // Punto único de entrada para "avanzar/retroceder" (botones + flechas):
  // si la diapositiva actual pide un pop-up "gate" (data-gate-popup, ej.
  // "Importante" en repaso-acciones) y todavía no se mostró, lo abre en vez
  // de navegar. Al cerrarse ese pop-up (X / backdrop / Esc / su propio botón
  // "Continuar", todos pasan por closePopup) recién ahí se completa el avance.
  Motor.prototype._advance = function (dir) {
    if (dir > 0) {
      var cur = this.slides[this.index];
      // gate genérico por contenido (ej. "conceptos": no dejar pasar hasta
      // explorar las 7 pestañas) — lo define curso.js con motor.canAdvance,
      // el motor no sabe qué regla es, solo la consulta y avisa si frena.
      if (typeof this.canAdvance === 'function' && cur && !this.canAdvance(cur)) {
        this._emit('advanceblocked', { id: cur.getAttribute('data-slide') });
        return;
      }
      var gate = cur && cur.getAttribute('data-gate-popup');
      if (gate && !this._gatedShown[gate]) {
        this._gatedShown[gate] = true;
        this._pendingNav = this.index + dir;
        // Si el id de `data-gate-popup` no existe en el marcado (typo,
        // pop-up que se sacó del HTML y quedó el atributo), `showPopup`
        // no abre nada: sin este chequeo el clic se perdía en el vacío
        // y encima dejaba `_pendingNav` colgado. Se sigue de largo —
        // un gate mal escrito no puede convertirse en un curso trabado.
        if (this.showPopup(gate)) return;
        this._pendingNav = null;
      }
      // última diapo con una acción pendiente (data-nav-cta, ej. "Finalizar
      // curso"): "Siguiente" no tiene a dónde ir, así que en vez de navegar
      // se avisa a quien puso el atributo (curso.js) para que haga esa
      // acción; el motor no sabe (ni le hace falta saber) qué hace.
      if (this.index === this.slides.length - 1 && cur && cur.hasAttribute('data-nav-cta')) {
        this._emit('navcta', { id: cur.getAttribute('data-slide') });
        return;
      }
      // última diapo, ya sin data-nav-cta (después de "Finalizar curso"):
      // no hay a dónde avanzar — en vez de dejar el botón "Fin" clickeado
      // en el vacío, se avisa para que curso.js intente cerrar/salir.
      if (this.index === this.slides.length - 1 && cur && cur.hasAttribute('data-slide-end')) {
        this._emit('courseexit', { id: cur.getAttribute('data-slide') });
        return;
      }
    }
    this.go(this.index + dir);
  };

  Motor.prototype.go = function (i, silent) {
    i = Math.max(0, Math.min(this.slides.length - 1, i));
    /* BUG REAL de re-entrada (kit-base v1.9.52): con un pop-up "gate"
       abierto queda un avance pendiente (`_pendingNav`), y `closePopup()`
       lo consume llamando a `go()` por su cuenta. Si en ese momento
       llegaba una navegación EXPLÍCITA (un `[data-goto]` del índice, un
       arrastre de la barra, `gotoId()`), el `closePopup()` de la línea
       de abajo disparaba primero el `go(_pendingNav)` pendiente y recién
       después seguía esta navegación: dos `slidechange` seguidos, el
       primero a una diapositiva que el alumno nunca pidió (y que igual
       quedaba contada como "vista" por cualquier listener del curso).
       Una navegación explícita MANDA sobre el avance pendiente. No
       rompe el flujo normal del gate: ahí `closePopup()` ya pone
       `_pendingNav` en null ANTES de llamar a `go()`. */
    this._pendingNav = null;
    if (this.openPopup) this.closePopup(); // nunca queda un pop-up abierto al navegar
    var prev = this.index;
    this.index = i;
    this.slides.forEach(function (s, k) {
      var active = k === i;
      s.hidden = !active;
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      s.classList.toggle('is-active', active);
      if (active) {
        s.classList.remove('anim-l', 'anim-r');
        if (!prefersReduced && !silent) s.classList.add(k >= prev ? 'anim-r' : 'anim-l');
      }
    });
    this._syncNav();
    // foco al título de la diapositiva (accesibilidad), sin romper el scroll
    var h = this.slides[i].querySelector('[data-slide-title]');
    if (h && !silent) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }

    this._emit('slidechange', { index: i, id: this.slides[i].getAttribute('data-slide') });
    if (this.slides[i].hasAttribute('data-slide-end')) this._emit('courseend', {});

    /* Pop-up automático de la diapositiva (data-intro-popup).
       Se abre CADA VEZ que se entra, no solo la primera: pedido real de
       uso — el alumno que volvió al índice buscando cómo se recorre el
       curso no encontraba nada, porque el pop-up ya se había "gastado".
       Un aviso que aparece una única vez es un aviso que se pierde.
       Si algún curso necesita el comportamiento viejo (una sola vez por
       sesión), lo marca con data-intro-once en la misma diapositiva. */
    /* El pop-up "gate" de esta diapositiva se re-arma al ENTRAR: así
       vuelve a aparecer si el alumno se va y regresa. Antes se mostraba
       una sola vez en toda la sesión — y es contenido, no un trámite:
       quien vuelve a la diapositiva espera volver a verlo. */
    var gateId = this.slides[i].getAttribute('data-gate-popup');
    if (gateId) delete this._gatedShown[gateId];

    var pid = this.slides[i].getAttribute('data-intro-popup');
    if (pid) {
      var unaVez = this.slides[i].hasAttribute('data-intro-once');
      if (!unaVez || !this._introShown) {
        if (unaVez) this._introShown = true;
        var self = this;
        setTimeout(function () { self.showPopup(pid); }, 350);
      }
    }
  };

  Motor.prototype.gotoId = function (id) {
    for (var k = 0; k < this.slides.length; k++) {
      if (this.slides[k].getAttribute('data-slide') === id) { this.go(k); return; }
    }
  };

  Motor.prototype._syncNav = function () {
    var i = this.index, last = this.slides.length - 1;
    var cur = this.slides[i];
    this.root.querySelectorAll('[data-nav="prev"]').forEach(function (b) { b.disabled = i === 0; });
    var isFirst = i === 0;
    var ctaLabel = i === last ? cur.getAttribute('data-nav-cta') : null;
    this.root.querySelectorAll('[data-nav="next"]').forEach(function (b) {
      var lbl = b.querySelector('[data-nav-label]');
      // primera diapo ("Empezar") y última con acción pendiente ("Finalizar
      // curso", vía data-nav-cta) usan el mismo look de llamado a la acción;
      // el resto sigue con "Siguiente"/"Finalizar" (anteúltima) de siempre.
      b.classList.toggle('d-nav-btn--cta', isFirst || !!ctaLabel);
      if (isFirst) {
        b.disabled = false;
        if (lbl) lbl.textContent = 'Empezar';
      } else if (i === last) {
        // "Fin" queda habilitado (no es un callejón sin salida): al
        // clickearlo con data-nav-cta ya consumido, _advance emite
        // "courseexit" para que curso.js intente cerrar/salir del curso.
        b.disabled = false;
        if (lbl) lbl.textContent = ctaLabel || 'Fin';
      } else {
        b.disabled = false;
        if (lbl) lbl.textContent = i === last - 1 ? 'Finalizar' : 'Siguiente';
      }
    });
    // contador + barra de progreso (si existen en el chrome)
    var cnt = this.root.querySelector('[data-slide-counter]');
    if (cnt) cnt.textContent = (i + 1) + ' / ' + this.slides.length;
    // La barra es también un slider para navegar (ver initProgressSeek en
    // curso.js): la posición mapea diapo 0 → 0% (inicio) y última → 100%
    // (fin), así el "pulgar" recorre toda la pista. El relleno y el pulgar
    // comparten esta misma fracción para que arrastrar coincida con lo que
    // se ve. (Antes era (i+1)/total, un "cuánto llevás" que no calzaba con
    // la posición de un pulgar arrastrable.)
    var frac = last > 0 ? i / last : 0;
    var bar = this.root.querySelector('[data-slide-progress]');
    if (bar) bar.style.width = (frac * 100) + '%';
    var thumb = this.root.querySelector('[data-slide-thumb]');
    if (thumb) {
      thumb.style.left = (frac * 100) + '%';
      thumb.setAttribute('aria-valuenow', String(i + 1));
      thumb.setAttribute('aria-valuetext', 'Diapositiva ' + (i + 1) + ' de ' + this.slides.length);
    }
    /* Zona bloqueada de la barra de progreso (kit-base v1.9.43) — pedido
       explícito del cliente: mostrar hasta dónde se puede arrastrar
       (initProgressSeek), no solo frenar el arrastre en silencio al
       llegar al tope. CSS en coto-player-bottom.css (.d-progress-locked).

       Guarda 1: solo si `typeof this.maxVisited === 'number'`. Sin esto,
       en cualquier curso que no adoptó `restoreMaxVisited()` (v1.9.39)
       `this.maxVisited` es `undefined` — tratarlo como "0 visitado"
       taparía la pista ENTERA con la trama, en un curso donde la franja
       ni siquiera debería existir.

       Guarda 2: `Math.max(this.maxVisited, i)`, no `this.maxVisited` a
       secas — bug real de ORDEN, no de cálculo: `_syncNav()` corre acá,
       DENTRO de `go()`, antes de que `go()` emita `slidechange` más
       abajo — y `slidechange` es el evento que dispara el listener de
       `restoreMaxVisited()` que sube `maxVisited`. Sin el `Math.max`, la
       franja quedaba sistemáticamente un paso de navegación atrasada
       (mostraba el tope de ANTES de llegar a la diapositiva actual). */
    if (typeof this.maxVisited === 'number') {
      var track = this.root.querySelector('[data-progress-track]');
      if (track) {
        var maxIdx = Math.max(this.maxVisited, i);
        var fracMax = last > 0 ? Math.min(1, maxIdx / last) : 1;
        var locked = track.querySelector('.d-progress-locked');
        if (!locked) {
          locked = document.createElement('span');
          locked.className = 'd-progress-locked';
          locked.setAttribute('aria-hidden', 'true');
          track.appendChild(locked);
        }
        locked.style.left = (fracMax * 100) + '%';
      }
    }
    // resalta el ítem de índice activo
    this.root.querySelectorAll('[data-goto]').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-goto') === this.slides[i].getAttribute('data-slide'));
    }, this);
    // Arranca "silencioso" (sin glow): llegar a una diapositiva, gateada o
    // no, nunca es un "acabás de desbloquear" — eso solo pasa dentro de la
    // MISMA diapositiva, vía el listener de clic de _init() (más arriba).
    this._syncGate(false);
  };

  /* ---- Gate visual del botón "Siguiente" ----
     `.d-nav-btn.is-gated` (coto-player-bottom.css) existe desde kit-base
     v1.6, documentada — pero hasta acá NINGÚN JS la tocaba: el botón solo
     temblaba (.d-shake) REACTIVAMENTE, al fallar un intento de avanzar
     con `_advance()`. Nunca se veía atenuado DE ANTEMANO, así que el
     alumno no tenía forma de saber que estaba gateado sin probar a
     tocarlo primero. Esto la sincroniza con `canAdvance()` en todo
     momento, y agrega un glow breve (`.d-nav-unlock-glow`, una sola vez,
     nunca en loop) en el instante exacto en que pasa de gateado a libre.
     `permitirGlow=false` desde `_syncNav()` (llegar a una diapositiva no
     es "desbloquear"); `true` desde el listener de clic diferido de
     `_init()` (una interacción SÍ puede haber sido la que lo destrabó). */
  Motor.prototype._syncGate = function (permitirGlow) {
    var cur = this.slides[this.index];
    var puede = typeof this.canAdvance !== 'function' || !cur || this.canAdvance(cur);
    var eraGateado = this._navGated;
    this.root.querySelectorAll('[data-nav="next"]').forEach(function (b) {
      b.classList.toggle('is-gated', !puede);
    });
    if (permitirGlow && eraGateado && puede) {
      this.root.querySelectorAll('[data-nav="next"]').forEach(function (b) {
        b.classList.remove('d-nav-unlock-glow');
        void b.offsetWidth; // reflow: sin esto no se reinicia si ya tenía la clase
        b.classList.add('d-nav-unlock-glow');
      });
    }
    this._navGated = !puede;
  };

  /* ---- Capas dentro de una diapositiva ---- */
  Motor.prototype._initLayers = function (group) {
    var panels = Array.prototype.slice.call(group.querySelectorAll('[data-panel]'));
    var triggers = Array.prototype.slice.call(group.querySelectorAll('[data-target]'));
    function activate(target) {
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== target; });
      triggers.forEach(function (t) {
        var on = t.getAttribute('data-target') === target;
        t.classList.toggle('active', on);
        if (t.hasAttribute('role')) t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      group.dispatchEvent(new CustomEvent('layerchange', { bubbles: true, detail: { target: target } }));
    }
    triggers.forEach(function (t) {
      t.addEventListener('click', function () { activate(t.getAttribute('data-target')); });
    });
    group._activateLayer = activate;
    // panel inicial: el marcado como no-hidden, o el primero
    var first = panels.filter(function (p) { return !p.hidden; })[0] || panels[0];
    if (first) activate(first.getAttribute('data-panel'));
  };

  /* ---- Pop-ups ---- */
  /* Cambiar de capa desde JS, sin simular un clic.
     kit-base v1.9.4. `_initLayers` ya dejaba un handle en el grupo
     (`group._activateLayer`), pero no estaba expuesto ni documentado:
     un curso que necesitaba pasar de capa por lógica propia (terminó
     el minijuego, se resolvió la actividad) no tenía otra forma que
     agregar un <button> invisible con [data-target] y hacerle .click().
     `el` puede ser el grupo [data-layers] o cualquier ancestro suyo
     (típicamente la diapositiva).
     Emite `layerchange` igual que un clic real, así la narración por
     capa sigue funcionando sin cambios. */
  Motor.prototype.showLayer = function (el, target) {
    if (!el) return false;
    var group = el.matches && el.matches('[data-layers]') ? el : el.querySelector('[data-layers]');
    if (!group || !group._activateLayer) return false;
    group._activateLayer(target);
    return true;
  };

  /* Devuelve `true` si realmente abrió algo (kit-base v1.9.52) — lo
     necesita `_advance()` para no dejar la navegación trabada cuando un
     `data-gate-popup` apunta a un id que no existe en el marcado. */
  Motor.prototype.showPopup = function (id) {
    var pop = this.root.querySelector('[data-popup="' + id + '"]');
    if (!pop) return false;
    /* BUG REAL (kit-base v1.9.52): abrir un pop-up DESDE otro pop-up
       (un `[data-popup-trigger]` adentro de un modal — el caso típico:
       un término del glosario que abre su ficha) pisaba `this.openPopup`
       con el nuevo y dejaba el anterior con `.open` puesto, visible y
       ya sin nadie que se lo saque: ni Esc, ni la X, ni el backdrop, ni
       `go()` — todos operan sobre `this.openPopup`, que ya apunta a
       otro nodo. Quedaban dos modales apilados hasta recargar.
       `_pendingNav` se preserva a mano: cerrar el pop-up de acá es un
       relevo entre modales, no el "ya cerraste el gate, seguí" que
       `closePopup()` interpreta al final. */
    if (this.openPopup && this.openPopup !== pop) {
      var pendiente = this._pendingNav;
      this._pendingNav = null;
      this.closePopup();
      this._pendingNav = pendiente;
    }
    this._lastFocus = document.activeElement;
    pop.classList.add('open');
    this.openPopup = pop;
    var focusable = pop.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
    this._emit('popupopen', { id: id });
    return true;
  };
  Motor.prototype.closePopup = function () {
    if (!this.openPopup) return;
    var id = this.openPopup.getAttribute('data-popup');
    this.openPopup.classList.remove('open');
    this.openPopup = null;
    if (this._lastFocus && this._lastFocus.focus) { try { this._lastFocus.focus({ preventScroll: true }); } catch (e) {} }
    this._emit('popupclose', { id: id });
    if (this._pendingNav !== null) {
      var n = this._pendingNav; this._pendingNav = null;
      this.go(n);
    }
  };
  Motor.prototype._trapFocus = function (e) {
    // `select`/`textarea` sumados en v1.9.52: sin ellos, un control de
    // formulario dentro de un modal quedaba FUERA de la trampa de foco
    // (Tab desde ahí se escapaba al chrome de atrás) — mismo selector
    // que usa `showPopup()` para elegir el primer foco.
    var f = this.openPopup.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* ---- Eventos ---- */
  Motor.prototype._emit = function (name, detail) {
    this.root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }));
  };
  Motor.prototype.current = function () { return this.slides[this.index]; };

  global.Motor = Motor;
})(window);
