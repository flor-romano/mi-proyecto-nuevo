/* ============================================================
   fx.js · Capa de efectos "cinematográficos" (opcional, no crítica)
   kit-base v1.0 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual.
   ------------------------------------------------------------
   Efectos puramente decorativos, todos desactivables con
   prefers-reduced-motion. NO tocan la lógica del curso ni la
   posición de ningún hitspot: si este archivo no carga, el curso
   funciona igual. Se ejecuta después de curso.js.

   Incluye:
     · Parallax 3D suave de las capturas del PDF (sigue el mouse).
     · Ripple (onda) al hacer clic en botones e hitspots.
     · Partículas de fondo flotando en las diapositivas HTML.
     · Sonidos de interfaz sutiles (usa el mismo tono sintetizado
       del curso vía window.__fxTone si está expuesto; si no, calla).
     · "Moneda" flotante: el +N de puntos vuela hacia el contador.
     · Modo cine: atenúa el resto al reproducir un video.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* ---------- utilidades de audio de interfaz ----------
     Reusa un AudioContext propio, independiente del de curso.js, pero
     respeta el mute global guardado en localStorage por el botón de sonido. */
  var actx;
  function muted() { try { return localStorage.getItem('coto-diapos-mute') === '1'; } catch (e) { return false; } }
  // Nivel de volumen (0-1, panel de "Sonido" — kit-base v1.9.35, coto-player.js).
  function volumeLevel() {
    try {
      var v = parseFloat(localStorage.getItem('coto-diapos-volume'));
      return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
    } catch (e) { return 1; }
  }
  function ac() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return actx; }
  function uiTone(f, d, type, vol) {
    if (muted() || reduce) return;
    var vl = volumeLevel();
    if (vl <= 0) return;
    var c = ac(); if (!c) return;
    var t0 = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime((vol == null ? .05 : vol) * vl, t0 + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + d + .03);
  }
  function sWhoosh() { uiTone(320, .16, 'sine', .04); uiTone(480, .12, 'sine', .035); }
  function sTick() { uiTone(880, .06, 'triangle', .045); }

  /* ============================================================
     1 · (ex) PARALLAX DE PROFUNDIDAD entre fondo y contenido — SACADO
     ------------------------------------------------------------
     Se probó mover solo el fondo (.d-shot-bg) al mover el mouse,
     dejando el contenido quieto. Se rompía el diseño: en estas diapos
     el fondo y el contenido son la MISMA imagen partida en dos capas
     que tienen que quedar perfectamente registradas entre sí (todo el
     trabajo de .d-shot-slide--bg-layered es justamente lograr esa
     alineación exacta) — mover una sola capa, aunque sea unos pocos
     píxeles, desalinea esa costura y se nota. El cliente lo reportó
     ("se rompió bastante el diseño") y se sacó. Si en el futuro se
     quiere un efecto de profundidad, tendría que mover fondo Y
     contenido juntos (misma transform en las dos capas) para no perder
     el registro — eso sí sería seguro, pero no es lo que había acá. */

  /* ============================================================
     2 · RIPPLE al hacer clic (botones e hitspots)
     ============================================================ */
  function initRipple() {
    if (reduce) return;
    document.addEventListener('click', function (e) {
      // .d-concept-tab afuera a propósito: el ripple + el cambio de imagen
      // de fondo al mismo tiempo se sentía "molesto" (dos efectos
      // simultáneos compitiendo) — cambiar de concepto ya tiene su propio
      // feedback (la pestaña pasa a dorado fuerte).
      var el = e.target.closest('.btn, .d-shot-hit:not(.d-concept-tab), .d-iconbtn, .d-chip, .d-nav-btn');
      if (!el) return;
      var r = el.getBoundingClientRect();
      var span = document.createElement('span');
      span.className = 'fx-ripple';
      var size = Math.max(r.width, r.height) * 1.4;
      span.style.width = span.style.height = size + 'px';
      span.style.left = (e.clientX - r.left - size / 2) + 'px';
      span.style.top = (e.clientY - r.top - size / 2) + 'px';
      var prevPos = getComputedStyle(el).position;
      if (prevPos === 'static') el.style.position = 'relative';
      el.appendChild(span);
      setTimeout(function () { span.remove(); }, 620);
    }, true);
  }

  /* ============================================================
     3 · PARTÍCULAS de fondo (solo diapositivas HTML nativas — sin
     captura de PDF: `.slide` que NO es `.d-shot-slide`. Antes esto
     tenía 3 IDs de diapositiva hardcodeados de un curso puntual
     ("laboratorio","casos","evaluacion") — no era genérico de
     verdad, se colaba contenido de curso en un archivo que se supone
     se copia sin editar. La regla real siempre fue "diapositivas
     HTML", que ya existe como distinción de clase en el marcado.)
     ============================================================ */
  function initParticles() {
    if (reduce) return;
    document.querySelectorAll('.slide:not(.d-shot-slide)').forEach(function (slide) {
      var layer = document.createElement('div');
      layer.className = 'fx-particles'; layer.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 14; i++) {
        var p = document.createElement('span');
        p.style.left = Math.random() * 100 + '%';
        p.style.width = p.style.height = (5 + Math.random() * 12) + 'px';
        p.style.animationDuration = (9 + Math.random() * 10) + 's';
        p.style.animationDelay = (-Math.random() * 16) + 's';
        p.style.opacity = (0.05 + Math.random() * 0.12).toFixed(2);
        layer.appendChild(p);
      }
      slide.insertBefore(layer, slide.firstChild);
    });
  }

  /* ============================================================
     4 · SONIDOS de interfaz: whoosh al cambiar de diapo, tick en pop-ups
     ============================================================ */
  function initUISounds() {
    document.addEventListener('slidechange', function () { sWhoosh(); });
    document.addEventListener('popupopen', function () { sTick(); });
  }

  /* ============================================================
     5 · "MONEDA" flotante: el +N vuela desde el HUD hacia los puntos
     (se dispara escuchando el toast; liviano y desacoplado)
     ============================================================ */
  function coin() {
    if (reduce) return;
    var target = document.getElementById('d-points'); if (!target) return;
    var tr = target.getBoundingClientRect();
    var c = document.createElement('div');
    c.className = 'fx-coin'; c.textContent = '✦';
    c.style.left = (tr.left + tr.width / 2) + 'px';
    c.style.top = (tr.top + tr.height / 2 + 40) + 'px';
    document.body.appendChild(c);
    requestAnimationFrame(function () {
      c.style.transform = 'translate(-50%, -46px) scale(1.2)';
      c.style.opacity = '0';
    });
    setTimeout(function () { c.remove(); }, 700);
  }

  /* ============================================================
     6 · MODO CINE: al reproducir un video, se atenúa lo de alrededor
     ============================================================ */
  function initCinema() {
    document.querySelectorAll('[data-video-play]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slide = btn.closest('.slide'); if (!slide) return;
        slide.classList.add('fx-cinema');
      });
    });
    function limpiar() {
      document.querySelectorAll('.fx-cinema').forEach(function (s) { s.classList.remove('fx-cinema'); });
    }
    // al cambiar de diapositiva se limpia
    document.addEventListener('slidechange', limpiar);
    // ...y también al cerrar el pop-up del video. Sin esto, si el curso
    // reproduce el video dentro de un pop-up (patrón habitual) y el alumno
    // lo cierra sin cambiar de diapositiva, el modo cine queda pegado: la
    // barra superior e inferior se quedan al 45% de opacidad hasta navegar.
    // Bug real, verificado en "Prevención cardiovascular".
    document.addEventListener('popupclose', limpiar);
  }

  /* ============================================================
     7 · SPOTLIGHT que sigue el cursor en los botones (glare)
     ============================================================ */
  function initSpotlight() {
    if (reduce) return;
    document.addEventListener('mousemove', function (e) {
      var el = e.target.closest('.btn-cat, .d-nav-btn');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- arranque ---------- */
  function boot() {
    initRipple();
    initParticles();
    initUISounds();
    initCinema();
    initSpotlight();
    // expone coin() para que curso.js lo llame al sumar puntos (si quiere)
    window.__fxCoin = coin;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
