/* ============================================================
   coto-cierre.js · Cierre en 2 pasos (captura "¡Felicitaciones!" →
   resumen con estadísticas animadas) + confeti
   kit-base v1.8 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual a cada curso nuevo, sin editar.
   ------------------------------------------------------------
   Extraído de "Prevención cardiovascular". Dos bugs reales ya
   corregidos acá, no repetirlos en el próximo curso:
     1) El confeti se creaba en el DOM pero nunca se veía: el
        contenedor (#d-confetti) necesita la clase ".d-confetti"
        (no alcanza con el id) — todas las reglas de este archivo
        son ".d-confetti .cf{...}".
     2) El festejo NO se dispara cuando se llama a unlockCierre()
        (eso pasa al terminar la mini-práctica, una diapositiva
        ANTERIOR al cierre) — se dispara recién cuando el cierre es
        la diapositiva REALMENTE visible (celebrateIfOnCierre),
        enganchado también a "slidechange" por si se entra ya
        desbloqueado (ej. saltando desde el índice).

   Contrato de marcado esperado:
     <section class="slide slide-cierre d-shot-slide" data-slide="cierre" data-slide-end>
       <p class="locked">🔒 Hacé la mini práctica para desbloquear el cierre del curso.</p>
       <div class="d-cierre-shot" data-cierre-step="shot">...captura "¡Felicitaciones!"...</div>
       <div class="d-cierre-summary" data-cierre-step="summary" hidden>
         <div class="d-cierre-results">...tarjetas con id de stats...</div>
         <div class="d-cierre-recap">...repaso...</div>
       </div>
     </section>
     <div id="d-confetti" class="d-confetti" aria-hidden="true"></div>
   El CSS (.locked/.unlocked/.d-cierre-shot/.d-cierre-summary) sigue
   siendo course-specific (cada curso arma su propio layout de
   resumen) — lo genérico acá es SOLO el mecanismo de desbloqueo +
   confeti + count-up, no el diseño visual del resumen.

   Uso:
     var Cierre = initCierreCelebration({
       statIds: ['d-cert-score','d-cert-points','d-cert-badges','d-cert-time','d-cert-tries'],
       onUnlock: function () {           // llenar los textos de stats ANTES de que se animen
         setText('d-cert-score', ...); setText('d-cert-points', ...);
       },
       onFinish: function () {           // al pasar de "shot" a "summary" (1 sola vez)
         unlockBadge('curso');
         XAPI.completed(courseSlug, courseName);
         SCORM.markCompleted();
       },
       stagger: function (el) { if (window.staggerReveal) staggerReveal(null, el); } // opcional
     });
     // en algún punto del curso (ej. al terminar la mini-práctica):
     Cierre.unlockCierre();
   ============================================================ */
(function (global) {
  'use strict';

  var prefersReduced = global.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function noop() {}

  function initCierreCelebration(opts) {
    opts = opts || {};
    var statIds = opts.statIds || [];
    var onUnlock = opts.onUnlock || noop;
    var onFinish = opts.onFinish || noop;
    var stagger = opts.stagger || noop;
    var cierreCelebrated = false;

    function animateCertStats() {
      if (prefersReduced) return;
      statIds.forEach(function (id) {
        var e = document.getElementById(id); if (!e) return;
        var full = e.textContent; var m = full.match(/^(\d+)(.*)$/);
        if (!m) return;
        var target = parseInt(m[1], 10), suffix = m[2], t0 = null, dur = 900;
        if (target === 0) return;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          e.textContent = Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        e.textContent = '0' + suffix;
        requestAnimationFrame(step);
      });
    }

    function shineCertStats() {
      if (prefersReduced) return;
      var cards = document.querySelectorAll('.d-cert-stats .s');
      Array.prototype.forEach.call(cards, function (c, i) {
        c.classList.remove('d-shine');
        void c.offsetWidth;
        setTimeout(function () { c.classList.add('d-shine'); }, i * 110);
      });
    }

    /* Efecto cinematográfico de la medalla: pop elástico + destello, una
       sola vez por vuelta (ver CSS `.d-medalla.is-revealing`, addendum).
       El reflow forzado (void offsetWidth) reinicia la animación si el
       alumno vuelve a pasar por el resumen. Pareja de `pintarMedalla()` —
       llamar DESPUÉS de pintar la medalla, para que ya tenga
       `data-nivel` puesto cuando arranca la animación. */
    function revealMedalla() {
      if (prefersReduced) return;
      var caja = document.querySelector('[data-medalla]');
      if (!caja) return;
      caja.classList.remove('is-revealing');
      void caja.offsetWidth;
      caja.classList.add('is-revealing');
    }

    function celebrate() {
      if (prefersReduced) return;
      var l = document.getElementById('d-confetti'); if (!l) return; l.innerHTML = '';
      var t = ['var(--cat)', 'var(--cat-strong)', 'var(--cat-soft)', 'var(--brand)', 'var(--success)'];
      var shapes = ['sq', 'circ', 'star', 'ribbon'];
      for (var i = 0; i < 90; i++) {
        var s = document.createElement('span');
        s.className = 'cf cf-' + shapes[i % shapes.length];
        s.style.left = Math.random() * 100 + '%';
        s.style.background = t[i % t.length];
        s.style.animationDelay = (Math.random() * .7) + 's';
        s.style.animationDuration = (2.4 + Math.random() * 1.8) + 's';
        s.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
        l.appendChild(s);
      }
      for (var j = 0; j < 36; j++) {
        var b = document.createElement('span');
        b.className = 'cf cf-burst cf-' + shapes[j % shapes.length];
        b.style.background = t[j % t.length];
        var ang = (j / 36) * Math.PI * 2, dist = 120 + Math.random() * 220;
        b.style.setProperty('--bx', Math.cos(ang) * dist + 'px');
        b.style.setProperty('--by', Math.sin(ang) * dist + 'px');
        b.style.animationDelay = (Math.random() * .1) + 's';
        l.appendChild(b);
      }
      setTimeout(function () { l.innerHTML = ''; }, 4800);
    }

    function celebrateIfOnCierre() {
      if (cierreCelebrated) return;
      var c = document.querySelector('.slide-cierre.unlocked');
      if (!c || c.hidden) return;
      cierreCelebrated = true;
      celebrate();
      if (opts.onCelebrate) opts.onCelebrate(); // ej. sonido de victoria — el curso decide
    }

    function unlockCierre() {
      var c = document.querySelector('.slide-cierre'); if (!c) return;
      c.classList.add('unlocked');
      c.setAttribute('data-nav-cta', opts.ctaLabel || 'Finalizar curso');
      if (global.motor) global.motor._syncNav();
      onUnlock();
      celebrateIfOnCierre();
    }

    document.addEventListener('slidechange', function (e) {
      if (e.detail.id === 'cierre') celebrateIfOnCierre();
    });
    /* UN SOLO manejador de navcta, con 2 pasos.
       kit v1.8 · Con dos listeners separados (uno para "mostrar el
       resumen" y otro para "salir") los DOS se disparaban en el MISMO
       clic: el primero marcaba "listo" y el segundo leía esa marca ya
       puesta. Resultado real: la pantalla de despedida tapaba el resumen
       al instante y no se llegaba a leer nada. */
    var paso = 0;
    document.addEventListener('navcta', function (e) {
      if (!e.detail || e.detail.id !== 'cierre') return;
      if (paso === 0) { paso = 1; mostrarResumen(); }
      else salirDelCurso(opts);
    });

    /* ---- "Anterior" vuelve al paso 0 del cierre (kit-base v1.9.71, §7.17) ----
       BUG REAL reportado por el cliente. Hasta v1.9.70 `paso` era un
       trinquete de un solo sentido: `mostrarResumen()` hacía
       `shot.hidden = true` y nada lo volvía a mostrar nunca. Como
       adentro del cierre no existía ningún paso hacia atrás, "Anterior"
       retrocedía la DIAPOSITIVA entera — y al volver al cierre seguía
       en el resumen. O sea: la felicitación no se podía volver a ver en
       toda la sesión, y el alumno que tocó "Anterior" por curiosidad la
       perdía para siempre.

       Se engancha en FASE DE CAPTURA sobre `document`, no sobre el
       botón: el motor pone su propio listener en cada `[data-nav]`
       (motor-slides.js, `_bindNav`) y entre listeners del mismo nodo
       gana el que se registró primero — que según el orden de arranque
       del curso puede ser el motor. La captura corre antes que
       cualquier listener de burbujeo, sin importar el orden de
       registro, así que `stopPropagation()` alcanza y no hace falta
       pedirle al curso que llame a este módulo antes que al motor. */
    document.addEventListener('click', function (e) {
      if (paso !== 1) return;
      var btn = e.target && e.target.closest && e.target.closest('[data-nav="prev"]');
      if (!btn) return;
      var cur = global.motor && global.motor.current();
      if (!cur || cur.getAttribute('data-slide') !== 'cierre') return;
      e.stopPropagation();
      e.preventDefault();
      volverAlShot();
    }, true);

    /* Deshace exactamente lo que hizo `mostrarResumen()`. El rótulo del
       botón del pie vuelve al que tenía el curso en su HTML: guardarlo
       en vez de escribir uno fijo acá es lo que evita que este módulo
       le imponga una palabra al curso. */
    function volverAlShot() {
      var shot = document.querySelector('[data-cierre-step="shot"]');
      var summary = document.querySelector('[data-cierre-step="summary"]');
      if (summary) summary.hidden = true;
      if (shot) shot.hidden = false;
      var c = document.querySelector('.slide-cierre');
      if (c && ctaOriginal !== null) c.setAttribute('data-nav-cta', ctaOriginal);
      paso = 0;
      if (global.motor) global.motor._syncNav();
    }
    var ctaOriginal = null;

    function mostrarResumen() {
      var shot = document.querySelector('[data-cierre-step="shot"]');
      var summary = document.querySelector('[data-cierre-step="summary"]');
      if (shot) shot.hidden = true;
      if (summary) { summary.hidden = false; stagger(summary); }
      setTimeout(animateCertStats, 260);
      setTimeout(shineCertStats, 1300);
      setTimeout(revealMedalla, 150);
      onFinish();
      /* El botón del pie NO se apaga: pasa a "Salir del curso". Antes se
         le sacaba data-nav-cta y quedaba como un "Fin" muerto — el
         alumno no tenía ninguna forma clara de cerrar y terminaba
         cerrando la pestaña, que en SCORM es irse sin avisar. */
      var c = document.querySelector('.slide-cierre');
      if (c && ctaOriginal === null) ctaOriginal = c.getAttribute('data-nav-cta');
      if (c) c.setAttribute('data-nav-cta', opts.salirLabel || 'Salir del curso');
      if (global.motor) global.motor._syncNav();
    }

    return { unlockCierre: unlockCierre, celebrateIfOnCierre: celebrateIfOnCierre,
             volverAlShot: volverAlShot,
             salir: function () { salirDelCurso(opts); } };
  }

  /* ---- Salida real del curso ----------------------------------------
     kit-base v1.8. El botón sigue funcionando después del primer clic
     (SCORM.exitCourse es idempotente): si el alumno vuelve al resumen,
     tiene que poder salir otra vez.
     `window.close()` solo funciona si el LMS abrió el curso en una
     ventana nueva; dentro de un iframe no hace nada y NO tira error —
     por eso la pantalla de despedida se muestra SIEMPRE y el cierre
     automático es un extra, nunca el mecanismo.
     Marcado esperado (opcional):
       <div id="d-salida" class="d-salida" hidden role="status"> …
         <button data-salida-volver>Volver al resumen</button> </div>
   -------------------------------------------------------------------- */
  function salirDelCurso(opts) {
    opts = opts || {};
    if (global.Narrador) global.Narrador.cancel();
    if (opts.onExit) opts.onExit();
    if (global.SCORM && global.SCORM.exitCourse) global.SCORM.exitCourse();
    var despedida = document.getElementById(opts.salidaId || 'd-salida');
    if (despedida) {
      despedida.hidden = false;
      var volver = despedida.querySelector('[data-salida-volver]');
      if (volver && !volver._wired) {
        volver._wired = true;
        volver.addEventListener('click', function () { despedida.hidden = true; });
      }
    }
    setTimeout(function () { try { global.close(); } catch (err) {} }, 400);
  }

  /* ---- Medalla final por puntaje ------------------------------------
     kit-base v1.8. El mecanismo es genérico; los umbrales son contenido
     de cada curso y por eso se pasan por parámetro.

     ⚠️ Regla aprendida: los umbrales se calculan a partir del puntaje
     REALMENTE alcanzable, no con números redondos elegidos a ojo. Si el
     curso tiene avance bloqueado por contenido, quien lo termina ya
     tiene un piso asegurado de puntos: la medalla más baja debería
     arrancar ahí, porque una medalla que se obtiene sin hacer nada no
     premia nada.
     Y los 3 rangos se muestran SIEMPRE, también los no alcanzados, con
     cuántos puntos faltaron para el siguiente: si no se ve qué faltaba,
     la medalla no motiva.

     Marcado esperado:
       <div class="d-medalla" data-medalla>
         <div class="d-medalla-ic" data-medalla-ic></div>
         <p class="d-medalla-tit">Medalla de <b data-medalla-nombre></b></p>
         <p class="d-medalla-sub" data-medalla-sub></p>
       </div>
       <ol class="d-medalla-rangos">
         <li data-rango="oro">…</li> <li data-rango="plata">…</li> …

     Uso:
       pintarMedalla(state.puntos, [
         { id:'oro', desde:130, nombre:'oro', icono:'🥇' },
         { id:'plata', desde:115, nombre:'plata', icono:'🥈' },
         { id:'bronce', desde:0, nombre:'bronce', icono:'🥉' }
       ]);
   -------------------------------------------------------------------- */
  /* kit v1.9.4 · Antes esta función recorría `niveles` tal cual venía y
     devolvía el PRIMERO que el puntaje alcanzara — o sea, daba el
     resultado correcto solo si el curso pasaba los rangos ordenados de
     mayor a menor, algo que no estaba escrito en ningún lado. Con el
     array al revés (bronce, plata, oro — el orden en que uno los
     piensa) devolvía SIEMPRE la medalla más baja, sin ningún error:
     puntaje de plata mostrando bronce y un "te faltaron N para la de
     oro" que salteaba plata. Encontrado en "Uso de Sucursales 3 - NOA"
     con 150 puntos exactos sobre un umbral de plata de 150.
     Ahora se ordena una COPIA por umbral descendente antes de decidir,
     así el orden del array del curso deja de importar. */
  /* BUG REAL encontrado armando "Seguridad alimentaria" (kit v1.9.21).
     `medallaDe` devolvía SIEMPRE el nivel más bajo como fallback, aun
     cuando el puntaje no llegaba ni a ese umbral. Combinado con el
     subtítulo (que sí calcula el próximo umbral por alcanzar), el
     resumen mostraba literalmente:

        "Medalla de bronce — 230 puntos · te faltaron 45 para la de bronce"

     …o sea, te felicita por una medalla y en la línea de abajo te dice
     que te faltan puntos para esa misma medalla. Devolver `null` es lo
     correcto: "no alcanzaste ninguna todavía" es un estado real, no un
     bronce de consuelo. En un curso bien armado el gate garantiza el
     piso (CLAUDE.md §6.10.6, el umbral más bajo ARRANCA en el piso
     asegurado), así que este caso casi no se ve en un recorrido
     normal — pero aparece apenas alguien queda por debajo, y ahí el
     mensaje contradictorio es peor que no mostrar nada.

     El segundo arreglo es el mismo tipo de bug que §6.18 punto 4 ya
     había corregido en `medallaDe` y que quedó sin corregir acá al
     lado: la búsqueda del "próximo nivel" recorría `niveles` en el
     orden en que lo escribió el curso. Con el array al revés
     (bronce, plata, oro — el orden en que uno los piensa) devolvía el
     nivel equivocado. Ahora las dos funciones ordenan una copia y el
     orden del array del curso deja de importar. */
  function medallaDe(puntos, niveles) {
    var orden = niveles.slice().sort(function (a, b) { return b.desde - a.desde; });
    for (var i = 0; i < orden.length; i++) if (puntos >= orden[i].desde) return orden[i];
    return null;   // todavía no alcanzó ninguna
  }
  function pintarMedalla(puntos, niveles) {
    var caja = document.querySelector('[data-medalla]');
    if (!caja || !niveles || !niveles.length) return;
    var orden = niveles.slice().sort(function (a, b) { return b.desde - a.desde; });
    var m = medallaDe(puntos, niveles);
    var masBaja = orden[orden.length - 1];
    caja.setAttribute('data-nivel', m ? m.id : 'ninguna');
    var ic = document.querySelector('[data-medalla-ic]');
    var nom = document.querySelector('[data-medalla-nombre]');
    var lbl = document.querySelector('[data-medalla-lbl]');
    var sub = document.querySelector('[data-medalla-sub]');
    if (ic) ic.textContent = m ? m.icono : '🔒';
    /* `[data-medalla-lbl]` es OPCIONAL y retrocompatible: si el curso
       lo trae, el kit escribe ahí la etiqueta que va delante del
       nombre ("Medalla de" / "Todavía sin medalla de") y el nombre
       queda en su `<b>` de siempre, sin tocar el marcado ni perder el
       estilo. Un curso que no lo tenga se comporta igual que antes. */
    if (lbl) lbl.textContent = m ? 'Medalla de' : 'Todavía sin medalla de';
    if (nom) nom.textContent = (m || masBaja).nombre;
    if (sub) {
      var sig = null;
      for (var i = orden.length - 1; i >= 0; i--) if (orden[i].desde > puntos) { sig = orden[i]; break; }
      if (!sig) sub.textContent = puntos + ' puntos · el máximo posible del curso';
      else if (!m) sub.textContent = puntos + ' puntos · te faltan ' + (sig.desde - puntos) + ' para la de ' + sig.nombre;
      else sub.textContent = puntos + ' puntos · te faltaron ' + (sig.desde - puntos) + ' para la de ' + sig.nombre;
    }
    document.querySelectorAll('[data-rango]').forEach(function (li) {
      li.classList.toggle('is-logrado', !!m && li.getAttribute('data-rango') === m.id);
    });
  }

  /* El CERTIFICADO DESCARGABLE se sacó en kit-base v1.9.64 (decisión de
     producto del cliente: "lo de descargar certificado quiero que lo
     dejemos de usar en los cursos"). Vivía acá como
     `initCertificatePrint()` desde §6.59 punto 9, probada en
     aislamiento — pero NINGÚN curso la integró nunca: verificado sobre
     los tres cursos terminados, cero llamadas en `curso.js` y cero
     `#d-cert-print` en el marcado. Sacarla no pierde nada en
     producción; formaliza lo que ya era el estado real.
     OJO al auditar: lo que queda con nombre parecido —`.d-cert-stats`,
     `.d-cert-note`, `@keyframes d-cert-shine`— es del RESUMEN DE
     CIERRE, no del certificado. No tocarlo. */

  global.initCierreCelebration = initCierreCelebration;
  global.salirDelCurso = salirDelCurso;
  global.medallaDe = medallaDe;
  global.pintarMedalla = pintarMedalla;
})(window);
