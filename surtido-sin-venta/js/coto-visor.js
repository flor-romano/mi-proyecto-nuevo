/* coto-visor.js — kit-base v1.9.78
   Área Aprendizaje (COTO) — visor de documentos
   ------------------------------------------------------------
   POR QUÉ EXISTE. El kit solo tenía `.modal-card--shot` y `--art`, que
   muestran UNA imagen fija. Un curso con documentos reales —un
   convenio, un instructivo, una planilla— necesita paginar, acercar,
   arrastrar, ver a pantalla completa y descargar. Eso lo tuvo que
   escribir un curso entero (CLAUDE.md §7.24), y no tiene nada suyo:
   ninguna línea de acá lee contenido de ningún curso.

   Trae además el **gate por "documento leído entero"**: no alcanza con
   abrir el pop-up, hay que pasar por las N hojas. Usa el MISMO contrato
   `faltan(slideEl)` que `initPopupGate`/`initVideoGate`, así que entra
   en `motor.canAdvance` y en `initGateHints` sin nada nuevo.

   Marcado:
     <div class="modal-back" data-popup="convenio">
       <div class="modal-card d-wide d-visor">
         <div class="modal-hd">
           <button class="modal-x" data-popup-close aria-label="Cerrar">✕</button>
           <h3>Convenio</h3>
         </div>
         <div class="d-visor-lienzo" data-visor
              data-visor-hojas="doc/c-1.webp|doc/c-2.webp|doc/c-3.webp"
              data-visor-descarga="doc/convenio.pdf">
           <img class="d-visor-hoja" alt="">
         </div>
         <div class="d-visor-barra">
           <button data-visor-nav="-1">◀</button>
           <span class="d-visor-prog"></span>
           <button data-visor-nav="1">▶</button>
           <button data-visor-zoom="-1">−</button>
           <span class="d-visor-zoom-val"></span>
           <button data-visor-zoom="1">+</button>
           <button data-visor-ajustar>Ajustar</button>
           <button data-visor-full>Ampliar</button>
           <a class="d-visor-bajar" download target="_blank">Descargar</a>
         </div>
       </div>
     </div>

   ⚠️ `.modal-card d-wide`, NUNCA `.modal-card--art` (§7.21 F4): `--art`
   es para pop-ups que SON una imagen con alfa, y te saca el cap de
   alto — medido, 422px de tarjeta en un viewport de 340.
   -------------------------------------------------------------- */
(function (global) {
  'use strict';

  var PASOS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];   // múltiplos del "ajustar"

  function initVisorDocs(opts) {
    opts = opts || {};
    var lienzos = document.querySelectorAll(opts.selector || '[data-visor]');
    if (!lienzos.length) return null;
    var leidas = {};          // idDoc -> { hoja: true }
    var api = {};

    Array.prototype.forEach.call(lienzos, function (lienzo) {
      var pop = lienzo.closest('[data-popup]');
      var id = pop ? pop.getAttribute('data-popup') : (lienzo.id || 'visor');
      var hojas = (lienzo.getAttribute('data-visor-hojas') || '').split('|')
        .map(function (s) { return s.trim(); }).filter(Boolean);
      var img = lienzo.querySelector('.d-visor-hoja');
      if (!hojas.length || !img) return;

      var ambito = pop || document;
      var i = 0;
      var escalaAjuste = 1;      // la que hace entrar la hoja: SE MIDE
      var paso = PASOS.indexOf(1);
      var tx = 0, ty = 0;
      leidas[id] = {};

      /* ---- Zoom ----
         El piso y los escalones salen de la escala REAL de ajuste, que
         se mide contra el render; no se escriben (§7.21, trampa 5). Un
         curso que clavó el piso en 100% cuando el real era 64% hacía
         que el primer clic saltara de 64% a 125%. */
      function medirAjuste() {
        var cw = lienzo.clientWidth, ch = lienzo.clientHeight;
        var nw = img.naturalWidth, nh = img.naturalHeight;
        if (!cw || !ch || !nw || !nh) return;
        escalaAjuste = Math.min(cw / nw, ch / nh);
      }
      function escala() { return escalaAjuste * PASOS[paso]; }
      function pintarZoom() {
        var e = escala();
        img.style.width = (img.naturalWidth * e) + 'px';
        img.style.height = 'auto';
        img.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
        lienzo.classList.toggle('is-ampliable', PASOS[paso] > 1);
        var val = ambito.querySelector('.d-visor-zoom-val');
        if (val) val.textContent = Math.round(e * 100) + '%';
        ambito.querySelectorAll('[data-visor-zoom]').forEach(function (b) {
          var d = parseInt(b.getAttribute('data-visor-zoom'), 10) || 0;
          b.disabled = (paso + d) < 0 || (paso + d) > PASOS.length - 1;
        });
      }
      function ajustar() {
        medirAjuste();
        paso = PASOS.indexOf(1);
        tx = 0; ty = 0;
        pintarZoom();
      }
      function zoom(d) {
        var n = Math.max(0, Math.min(PASOS.length - 1, paso + d));
        if (n === paso) return;
        paso = n;
        if (PASOS[paso] <= 1) { tx = 0; ty = 0; }
        pintarZoom();
      }

      /* ---- Paginado ---- */
      function pintarNav() {
        ambito.querySelectorAll('[data-visor-nav]').forEach(function (b) {
          var d = parseInt(b.getAttribute('data-visor-nav'), 10) || 0;
          var destino = i + d;
          var fuera = destino < 0 || destino > hojas.length - 1;
          /* Las flechas del visor las dibuja el KIT, así que en los
             extremos se DESHABILITAN con un velo bien visible y el
             rótulo dice el número de página — no se esconden, porque
             acá la barra es fija y un hueco se lee peor que un botón
             apagado (§7.21, sección E). */
          b.disabled = fuera;
          b.setAttribute('aria-label', fuera
            ? (d < 0 ? 'Ya estás en la primera página' : 'Ya estás en la última página')
            : 'Ir a la página ' + (destino + 1) + ' de ' + hojas.length);
        });
        var prog = ambito.querySelector('.d-visor-prog');
        if (prog) prog.textContent = 'Página ' + (i + 1) + ' de ' + hojas.length;
      }
      function ir(n, silencioso) {
        n = Math.max(0, Math.min(hojas.length - 1, n));
        var mismo = (n === i);
        i = n;
        img.setAttribute('src', hojas[i]);
        img.setAttribute('alt', 'Página ' + (i + 1) + ' de ' + hojas.length);
        leidas[id][i] = true;
        pintarNav();
        if (!mismo && !silencioso && opts.onPagina) {
          opts.onPagina(id, i, Object.keys(leidas[id]).length, hojas.length);
        }
      }

      /* ---- Arrastre, solo cuando hay algo que arrastrar ---- */
      var arrastrando = false, x0 = 0, y0 = 0, tx0 = 0, ty0 = 0, movio = 0;
      lienzo.addEventListener('pointerdown', function (e) {
        if (PASOS[paso] <= 1) return;
        arrastrando = true; movio = 0;
        x0 = e.clientX; y0 = e.clientY; tx0 = tx; ty0 = ty;
        lienzo.setPointerCapture(e.pointerId);
      });
      lienzo.addEventListener('pointermove', function (e) {
        if (!arrastrando) return;
        tx = tx0 + (e.clientX - x0);
        ty = ty0 + (e.clientY - y0);
        movio = Math.max(movio, Math.abs(e.clientX - x0), Math.abs(e.clientY - y0));
        img.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      });
      ['pointerup', 'pointercancel'].forEach(function (ev) {
        lienzo.addEventListener(ev, function () { arrastrando = false; });
      });

      /* ---- Tocar el fondo para salir ----
         Respeta LA HOJA, no su marco: ampliado, el lienzo ocupa todo el
         ancho y el marco deja de ser una referencia útil. Y el umbral
         de 6px no es cosmético: arrastrar termina en un `click`, así
         que sin él soltar el dedo después de mover cerraba el visor
         (§7.21, sección J). */
      lienzo.addEventListener('click', function (e) {
        if (movio > 6) { movio = 0; return; }
        if (e.target === img) return;
        var r = img.getBoundingClientRect();
        var dentro = e.clientX >= r.left && e.clientX <= r.right &&
                     e.clientY >= r.top && e.clientY <= r.bottom;
        if (dentro) return;
        if (lienzo.classList.contains('is-full')) salirFull();
      });

      /* ---- Pantalla completa (dentro de la página, no la API nativa:
         adentro del iframe de un LMS `requestFullscreen` depende de
         `allow="fullscreen"` y falla en silencio) ---- */
      function entrarFull() { lienzo.classList.add('is-full'); ajustar(); }
      function salirFull() { lienzo.classList.remove('is-full'); ajustar(); }

      ambito.querySelectorAll('[data-visor-nav]').forEach(function (b) {
        b.addEventListener('click', function () {
          ir(i + (parseInt(b.getAttribute('data-visor-nav'), 10) || 0));
        });
      });
      ambito.querySelectorAll('[data-visor-zoom]').forEach(function (b) {
        b.addEventListener('click', function () {
          zoom(parseInt(b.getAttribute('data-visor-zoom'), 10) || 0);
        });
      });
      var btnAj = ambito.querySelector('[data-visor-ajustar]');
      if (btnAj) btnAj.addEventListener('click', ajustar);
      var btnFull = ambito.querySelector('[data-visor-full]');
      if (btnFull) btnFull.addEventListener('click', function () {
        if (lienzo.classList.contains('is-full')) salirFull(); else entrarFull();
      });

      /* La descarga es un `<a download target="_blank">` y no un botón
         con JS (§7.21, sección J): adentro del iframe de un LMS un link
         normal es lo único que no depende de permisos de script, y el
         `target="_blank"` es el plan B para el iframe que venga sin
         `allow-downloads`. */
      var bajar = ambito.querySelector('.d-visor-bajar');
      var pdf = lienzo.getAttribute('data-visor-descarga');
      if (bajar) {
        if (pdf) bajar.setAttribute('href', pdf);
        else bajar.hidden = true;
      }

      img.addEventListener('load', function () {
        medirAjuste();
        pintarZoom();
      });
      /* El alto del lienzo lo fija el CSS, NO el contenido: si el alto
         de la hoja sale del alto del visor y el visor se dimensiona por
         su contenido, el `ResizeObserver` entra en un bucle y la
         tarjeta se achica sola (§7.21, trampa 6). Acá solo se re-mide,
         nunca se escribe alto. */
      if (global.ResizeObserver) {
        new ResizeObserver(function () { medirAjuste(); pintarZoom(); }).observe(lienzo);
      }

      ir(0, true);
      ajustar();
      api[id] = {
        ir: ir, ajustar: ajustar, zoom: zoom,
        pagina: function () { return i; },
        total: hojas.length,
        leidas: function () { return Object.keys(leidas[id]).length; },
        escala: function () { return escala(); }
      };
    });

    /* ---- Esc con DOS niveles, en fase de CAPTURA ----
       Ampliado, `Esc` tiene que salir primero de pantalla completa y
       recién después cerrar el pop-up. Sin el listener en captura corre
       antes el cierre del motor, y volver al curso desde ampliado es
       imposible sin mouse (§7.21, trampa 10). */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var full = document.querySelector('[data-visor].is-full');
      if (!full) return;
      e.stopPropagation();
      e.preventDefault();
      full.classList.remove('is-full');
      var ev = new Event('visorsalefull'); document.dispatchEvent(ev);
    }, true);

    return {
      docs: api,
      /* Mismo contrato que los gates del kit: faltan las hojas que
         todavía no se miraron. */
      faltan: function (slideEl) {
        if (!slideEl) return [];
        var out = [];
        Object.keys(api).forEach(function (id) {
          var trigger = slideEl.querySelector('[data-popup-trigger="' + id + '"]');
          if (!trigger) return;
          if (api[id].leidas() < api[id].total) out.push(id);
        });
        return out;
      },
      serialize: function () {
        var o = {};
        Object.keys(leidas).forEach(function (k) { o[k] = Object.keys(leidas[k]); });
        return o;
      },
      restore: function (estado) {
        if (!estado) return;
        Object.keys(estado).forEach(function (k) {
          if (!leidas[k]) leidas[k] = {};
          (estado[k] || []).forEach(function (n) { leidas[k][n] = true; });
        });
      }
    };
  }

  /* ============================================================
     initDocEnDiapo(opts) — paginar el documento SIN abrir el pop-up
     ------------------------------------------------------------
     Las flechas ◀ ▶ que **dibuja el arte** pasan las hojas ahí mismo, y
     tocar la hoja abre el visor EN LA PÁGINA que se estaba mirando.

     No se puede hacer con `initShotSwap`, que funde la captura entera:
     acá lo que cambia es UNA hoja dentro del arte, así que va un `<img>`
     colocado sobre el bbox medido de la hoja — un `[data-place]` más,
     posicionado por el motor como cualquier overlay.

     Marcado:
       <div class="d-shot" data-shot>
         <img class="d-shot-img" src="…">
         <img data-place data-doc-hoja="convenio" data-l=… data-t=… data-w=… data-h=…>
         <button data-hit data-doc-nav="-1" data-doc="convenio" …>◀</button>
         <button data-hit data-doc-nav="1"  data-doc="convenio" …>▶</button>
         <button data-hit data-doc-abrir="convenio" …>Ver el documento</button>
       </div>
     ============================================================ */
  function initDocEnDiapo(opts) {
    opts = opts || {};
    var visor = opts.visor;                       // el que devuelve initVisorDocs()
    var hojasDe = opts.hojas || {};               // { convenio: ['a.webp','b.webp'] }
    var estado = {};

    document.querySelectorAll('[data-doc-hoja]').forEach(function (img) {
      var id = img.getAttribute('data-doc-hoja');
      var lista = hojasDe[id] || [];
      if (!lista.length) return;
      estado[id] = 0;
      var ambito = img.closest('[data-shot]') || document;

      function pintar() {
        img.setAttribute('src', lista[estado[id]]);
        img.setAttribute('alt', 'Página ' + (estado[id] + 1) + ' de ' + lista.length);
        ambito.querySelectorAll('[data-doc-nav][data-doc="' + id + '"]').forEach(function (b) {
          var d = parseInt(b.getAttribute('data-doc-nav'), 10) || 0;
          var destino = estado[id] + d;
          var fuera = destino < 0 || destino > lista.length - 1;
          /* Estas flechas las dibujó EL ARTE: están en el píxel, así
             que esconderlas es imposible — se deshabilitan, con un velo
             evidente y un rótulo que da el número de página, que es el
             dato que distingue "no responde" de "está apagado"
             (§7.21, sección E). */
          b.disabled = fuera;
          b.classList.toggle('is-apagado', fuera);
          b.setAttribute('aria-label', fuera
            ? (d < 0 ? 'Ya estás en la página 1 de ' + lista.length
                     : 'Ya estás en la página ' + lista.length + ' de ' + lista.length)
            : 'Ir a la página ' + (destino + 1) + ' de ' + lista.length);
        });
      }
      ambito.querySelectorAll('[data-doc-nav][data-doc="' + id + '"]').forEach(function (b) {
        b.addEventListener('click', function () {
          var d = parseInt(b.getAttribute('data-doc-nav'), 10) || 0;
          var n = Math.max(0, Math.min(lista.length - 1, estado[id] + d));
          if (n === estado[id]) return;
          estado[id] = n;
          pintar();
          if (opts.onPagina) opts.onPagina(id, n, lista.length);
        });
      });
      /* Tocar la hoja abre el visor EN LA PÁGINA que se estaba
         mirando: si abriera siempre en la 1, el alumno perdería lo que
         venía leyendo, que es justo lo contrario de lo que espera. */
      var abrir = ambito.querySelector('[data-doc-abrir="' + id + '"]');
      [img, abrir].forEach(function (el) {
        if (!el) return;
        el.addEventListener('click', function () {
          if (global.motor && global.motor.showPopup) global.motor.showPopup(id);
          if (visor && visor.docs && visor.docs[id]) visor.docs[id].ir(estado[id]);
        });
      });
      pintar();
    });

    return { pagina: function (id) { return estado[id]; } };
  }

  global.initVisorDocs = initVisorDocs;
  global.initDocEnDiapo = initDocEnDiapo;
})(window);
