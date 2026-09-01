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

    // Re-chequea el gate visual (`_syncGate`) tras cualquier clic dentro
    // de la diapositiva actual — así el botón "Siguiente" deja de verse
    // atenuado apenas se completa la interacción que faltaba, sin
    // esperar a la próxima navegación. Captura (no bubbling) + un
    // `setTimeout` de red de seguridad: el propio clic puede ser el que
    // actualiza el estado que `canAdvance()` consulta (ej. el handler de
    // curso.js que marca un hitbox como visto), así que hay que dejar
    // que termine de correr antes de re-evaluar.
    this.root.addEventListener('click', function () {
      setTimeout(function () { self._syncGate(); }, 0);
    }, true);

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

    // Marcas de sección en la barra de progreso (una sola vez: no cambian
    // con la navegación, a diferencia del relleno/pulgar que sí).
    this._initProgressSections();

    // Hitboxes de las diapos-captura (data-shot + data-hit)
    this._initShots();

    // Estado inicial
    this.go(0, true);
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
        var poster = new Image();
        var placeVideo = function () { place(poster.naturalWidth, poster.naturalHeight); };
        poster.addEventListener('load', placeVideo);
        poster.src = video.getAttribute('poster');
        window.addEventListener('resize', placeVideo);
        if (window.ResizeObserver) { new ResizeObserver(placeVideo).observe(video); }
        else document.addEventListener('slidechange', placeVideo);
      }
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
        this.showPopup(gate);
        return;
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
    // Zona bloqueada de la barra (kit-base v1.9.44, pedido del cliente:
    // "que se note que eso todavía está bloqueado por avanzar"). Va desde
    // el techo real de arrastre (this.maxVisited — el mismo dato que ya
    // usa initProgressSeek para limitar hasta dónde se puede arrastrar
    // hacia adelante, §6.51/§6.59) hasta el final de la pista. Sin
    // `restoreMaxVisited()` cableado por el curso, `maxVisited` nunca baja
    // de `this.index` (ver el propio setter más arriba) — en un curso SIN
    // gate de contenido, `maxVisited` termina siempre igual al último
    // punto visitado y esta franja no aporta nada (correcto: no hay nada
    // bloqueado que marcar).
    // Solo si el curso lleva la cuenta real de `maxVisited` (vía
    // `restoreMaxVisited()` o a mano, ver arriba) — sin eso, `undefined`
    // NO se trata como "nada visitado" (taparía la pista entera desde
    // el arranque en cualquier curso que todavía no adoptó el mecanismo).
    if (typeof this.maxVisited === 'number') {
      var track = this.root.querySelector('[data-progress-track]');
      if (track) {
        var lockEl = track.querySelector('.d-progress-locked');
        if (!lockEl) {
          lockEl = document.createElement('div');
          lockEl.className = 'd-progress-locked';
          lockEl.setAttribute('aria-hidden', 'true');
          track.appendChild(lockEl);
        }
        // `Math.max(this.maxVisited, i)`, no `this.maxVisited` a secas:
        // `_syncNav()` corre ANTES de emitir `slidechange` (ver `go()`
        // más abajo), y es justo ese evento el que dispara el listener
        // de `restoreMaxVisited()` que sube `maxVisited` a la diapo
        // nueva — sin este `Math.max`, la franja bloqueada quedaría un
        // paso atrás en cada navegación (mostrando como "todavía
        // bloqueado" contenido en el que el alumno está parado en este
        // instante).
        var effectiveMax = Math.max(this.maxVisited, i);
        var maxFrac = last > 0 ? Math.min(1, effectiveMax / last) : 1;
        lockEl.style.left = (maxFrac * 100) + '%';
      }
    }
    // resalta el ítem de índice activo
    this.root.querySelectorAll('[data-goto]').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-goto') === this.slides[i].getAttribute('data-slide'));
    }, this);
    this._syncGate();
  };

  /* ---- Estado visual reactivo del gate (kit-base v1.9.44) ----
     `.d-nav-btn.is-gated` (CSS, coto-player-bottom.css) ya existía
     desde v1.6 —documentado en CLAUDE.md §6.10 punto 1— pero ningún
     JS la tocaba nunca: el botón "Siguiente" nunca mostraba el estado
     atenuado hasta el momento de intentar avanzar y temblar
     (.d-shake). Este método la mantiene sincronizada con
     `canAdvance()` en TODO momento, no solo al fallar un intento — y
     dispara un glow breve (`.d-nav-unlock-glow`, CSS) el instante en
     que pasa de gateado a libre, como aviso de "ya podés seguir".
     Se llama desde `_syncNav()` (cubre cambio de diapositiva) y desde
     un `click` delegado en captura sobre `this.root` (cubre que el
     alumno complete el gate DENTRO de la misma diapositiva — clic en
     un hitbox, cerrar un pop-up, etc. — sin esperar a la próxima
     navegación). No agrega gate donde no lo hay: si `canAdvance` es
     null, `gated` es siempre false y esto no hace nada. */
  Motor.prototype._syncGate = function () {
    var cur = this.slides[this.index];
    var gated = typeof this.canAdvance === 'function' && !!cur && !this.canAdvance(cur);
    var wasGated = this._gateOn;
    this.root.querySelectorAll('[data-nav="next"]').forEach(function (b) {
      b.classList.toggle('is-gated', gated);
    });
    if (wasGated && !gated && !prefersReduced) {
      this.root.querySelectorAll('[data-nav="next"]').forEach(function (b) {
        b.classList.remove('d-nav-unlock-glow');
        void b.offsetWidth;
        b.classList.add('d-nav-unlock-glow');
      });
    }
    this._gateOn = gated;
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

  Motor.prototype.showPopup = function (id) {
    var pop = this.root.querySelector('[data-popup="' + id + '"]');
    if (!pop) return;
    this._lastFocus = document.activeElement;
    pop.classList.add('open');
    this.openPopup = pop;
    var focusable = pop.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
    this._emit('popupopen', { id: id });
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
    var f = this.openPopup.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])');
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
