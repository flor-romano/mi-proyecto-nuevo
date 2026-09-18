/* coto-piezas.js — kit-base v1.9.77
   Área Aprendizaje (COTO) — piezas que los cursos venían inventando
   ------------------------------------------------------------
   POR QUÉ EXISTE. Salen del relay de "Seguridad de la información"
   (CLAUDE.md §7.23), que las listó como "piezas que el kit no tiene y
   acá hubo que inventar". Todas cumplen el criterio de §1 —ninguna lee
   nada de un curso en particular— y varias ya aparecieron en más de
   uno, que es lo que §4 pide antes de generalizar.

   Ninguna reemplaza a lo que ya existe:
     · `initHotspots()` sigue siendo "uno activo a la vez";
     · `initShotSwap()` sigue cambiando la página entera;
     · `initMiniQuiz()` sigue siendo el quiz.
   Lo de acá es lo que no encajaba en ninguno.
   -------------------------------------------------------------- */
(function (global) {
  'use strict';

  /* ============================================================
     initRevelados(opts) — revelado ACUMULATIVO
     ------------------------------------------------------------
     Clic en el punto N → aparece la píldora N **y las anteriores
     quedan visibles**. Es la diferencia con `initHotspots()`, que es
     "uno activo a la vez" y limpia los demás, y con `initShotSwap()`,
     que cambia la captura entera.

     Un curso real usó 14 de estas, con gate y puntaje. El caso típico:
     un diagrama donde cada número explica una parte y al final se ven
     todas juntas, que es justamente el resumen que el alumno necesita.

     Marcado (los dos dentro del mismo `[data-shot]`, posicionados por
     el motor con `data-l/t/w/h` como cualquier overlay):
       <button data-hit data-revelar="1" …><span class="sr-only">…</span></button>
       <div data-place data-revelado="1" class="mi-pildora" hidden>…</div>

     `hidden` real y no CSS: el narrador filtra por el atributo, así que
     una píldora escondida con `display:none` se narra igual (§7.21 F1).

     Devuelve `{ faltan, revelados, total, revelarTodo }`. `faltan()`
     usa el MISMO contrato que los gates del kit
     (`initPopupGate`/`initVideoGate`), así que entra en
     `motor.canAdvance` y en `initGateHints` sin nada nuevo.
     ============================================================ */
  function initRevelados(opts) {
    opts = opts || {};
    var sel = opts.selector || '[data-revelar]';
    var vistos = {};
    var disparadores = Array.prototype.slice.call(document.querySelectorAll(sel));
    if (!disparadores.length) return null;

    function panelDe(btn) {
      var id = btn.getAttribute('data-revelar');
      var shot = btn.closest('[data-shot]') || document;
      return shot.querySelector('[data-revelado="' + id + '"]');
    }

    function revelar(btn, silencioso) {
      var id = btn.getAttribute('data-revelar');
      var panel = panelDe(btn);
      if (!panel) return false;
      var nuevo = !vistos[id];
      vistos[id] = true;
      panel.hidden = false;
      btn.classList.add('is-revelado');
      btn.setAttribute('aria-expanded', 'true');
      /* Solo la PRIMERA vez avisa al curso: igual criterio que
         `initShotSwap` desde §7.21 F2 — una pieza reintentable que
         paga en cada toque es puntaje infinito (§7.21, trampa 9). */
      if (nuevo && !silencioso && opts.onRevelar) {
        opts.onRevelar(id, Object.keys(vistos).length, disparadores.length);
      }
      /* Narrar lo que se acaba de revelar, si el curso narra. Se hace
         acá y no en el curso porque es el momento exacto en que el
         contenido pasa a estar visible. */
      if (nuevo && !silencioso && opts.narrar !== false &&
          global.Narrador && global.Narrador.isNarrating && global.Narrador.isNarrating()) {
        var t = global.Narrador.textOf ? global.Narrador.textOf(panel) : '';
        if (t) global.Narrador.speak(t, 'revelado');
      }
      return nuevo;
    }

    disparadores.forEach(function (btn) {
      var panel = panelDe(btn);
      if (panel) panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', function () { revelar(btn); });
    });

    return {
      /* Mismo contrato `faltan(slideEl)` que los gates del kit. */
      faltan: function (slideEl) {
        if (!slideEl) return [];
        return Array.prototype.slice.call(slideEl.querySelectorAll(sel))
          .filter(function (b) { return !vistos[b.getAttribute('data-revelar')]; });
      },
      revelados: function () { return Object.keys(vistos).length; },
      total: function () { return disparadores.length; },
      /* Para restaurar una sesión anterior sin pagar de nuevo ni narrar. */
      revelarTodo: function (ids) {
        (ids || disparadores.map(function (b) { return b.getAttribute('data-revelar'); }))
          .forEach(function (id) {
            var b = disparadores.filter(function (x) {
              return x.getAttribute('data-revelar') === String(id); })[0];
            if (b) revelar(b, true);
          });
      },
      serialize: function () { return Object.keys(vistos); }
    };
  }

  /* ============================================================
     initTandas(opts) — paginador de "tandas" DENTRO de una diapositiva
     ------------------------------------------------------------
     Dos o más juegos de carteles sobre el MISMO arte. No es
     `initShotSwap` (que cambia la captura) ni son dos diapositivas
     (el arte es el mismo y separarlas se lee como repetición).

     Marcado:
       <div data-tandas="riesgos">
         <div data-tanda="1">…overlays…</div>
         <div data-tanda="2" hidden>…overlays…</div>
       </div>
       <button data-tanda-nav="-1" hidden>◀</button>
       <button data-tanda-nav="1">▶</button>
       <span class="d-tanda-prog"></span>

     DÓNDE VAN LOS CONTROLES: se mide la tinta del arte, no se elige a
     ojo (§7.21, sección J). Y se ESCONDEN en los extremos, no se
     deshabilitan — porque los dibujó el kit y no el arte (§7.21,
     sección E): un control que no puede hacer nada y que nadie dibujó
     no tiene por qué ocupar lugar.
     ============================================================ */
  function initTandas(opts) {
    opts = opts || {};
    var grupos = document.querySelectorAll(opts.selector || '[data-tandas]');
    if (!grupos.length) return null;
    var api = {};

    Array.prototype.forEach.call(grupos, function (grupo) {
      var id = grupo.getAttribute('data-tandas');
      var tandas = Array.prototype.slice.call(grupo.querySelectorAll('[data-tanda]'));
      if (tandas.length < 2) return;
      var i = 0;
      var ambito = grupo.closest('[data-slide]') || document;
      var navs = Array.prototype.slice.call(ambito.querySelectorAll('[data-tanda-nav]'));
      var prog = ambito.querySelector('.d-tanda-prog');

      function pintar() {
        tandas.forEach(function (t, k) { t.hidden = k !== i; });
        navs.forEach(function (b) {
          var paso = parseInt(b.getAttribute('data-tanda-nav'), 10) || 0;
          var destino = i + paso;
          b.hidden = destino < 0 || destino > tandas.length - 1;
        });
        if (prog) prog.textContent = (i + 1) + ' de ' + tandas.length;
      }
      function ir(n) {
        n = Math.max(0, Math.min(tandas.length - 1, n));
        if (n === i) return;                       // §7.21 F2: no pagar por quedarte
        i = n;
        pintar();
        if (opts.onChange) opts.onChange(id, i, tandas.length);
      }
      navs.forEach(function (b) {
        b.addEventListener('click', function () {
          ir(i + (parseInt(b.getAttribute('data-tanda-nav'), 10) || 0));
        });
      });
      pintar();
      api[id] = { ir: ir, index: function () { return i; }, total: tandas.length };
    });

    return api;
  }

  /* ============================================================
     initPasosRepaso(opts) — panel de pasos al costado del repaso
     ------------------------------------------------------------
     Pasos numerados que reflejan en qué pregunta está el alumno y cómo
     le fue en las anteriores.

     EL DETALLE QUE IMPORTA, y por el que esto vale subir al kit: lee
     las clases que el kit YA escribe (`is-current`, `is-answered`,
     `is-correct`) con un `MutationObserver`, y NO con un listener de
     clic propio. El estado también cambia con las flechas ‹ › y al
     restaurar una respuesta de una sesión anterior — un listener de
     clic se pierde esos dos casos y el panel queda mintiendo.

     Marcado: `<ol data-repaso-pasos></ol>` en cualquier lado de la
     diapositiva del repaso. Los `<li>` los dibuja este módulo.
     ============================================================ */
  function initPasosRepaso(opts) {
    opts = opts || {};
    var lista = document.querySelector(opts.selector || '[data-repaso-pasos]');
    if (!lista) return null;
    var raiz = lista.closest('[data-slide]') || document;
    var items = Array.prototype.slice.call(raiz.querySelectorAll('[data-repaso-item]'));
    if (!items.length) return null;

    lista.innerHTML = '';
    var pasos = items.map(function (it, k) {
      var li = document.createElement('li');
      li.className = 'd-paso';
      li.textContent = String(k + 1);
      li.setAttribute('aria-hidden', 'true');
      lista.appendChild(li);
      return li;
    });

    function pintar() {
      items.forEach(function (it, k) {
        var p = pasos[k];
        p.classList.toggle('is-current', it.classList.contains('is-current'));
        p.classList.toggle('is-answered', it.classList.contains('is-answered'));
        p.classList.toggle('is-correct', it.classList.contains('is-correct'));
        p.classList.toggle('is-wrong', it.classList.contains('is-wrong'));
      });
      if (opts.onChange) opts.onChange();
    }

    var obs = new MutationObserver(pintar);
    items.forEach(function (it) {
      obs.observe(it, { attributes: true, attributeFilter: ['class'] });
    });
    pintar();
    return { refresh: pintar, desconectar: function () { obs.disconnect(); } };
  }

  /* ============================================================
     initSalidaRepaso(opts) — el "Siguiente" de la última pregunta
     ------------------------------------------------------------
     Pedido explícito de cliente y hoy cada curso lo cablea a mano: con
     TODAS las preguntas contestadas, el "Siguiente" de la última lleva
     a la DIAPOSITIVA siguiente en vez de quedarse sin hacer nada.

     Se engancha en fase de CAPTURA sobre `document` por el mismo
     motivo que §7.18 K9: el kit ya tiene su propio listener en esos
     botones, y entre listeners del mismo nodo gana el que se registró
     primero. La captura corre antes que cualquier burbujeo, sin
     depender del orden de arranque del curso.
     ============================================================ */
  function initSalidaRepaso(opts) {
    opts = opts || {};
    var raiz = document.querySelector(opts.selector || '[data-repaso]');
    if (!raiz) return null;
    var items = Array.prototype.slice.call(raiz.querySelectorAll('[data-repaso-item]'));
    if (!items.length) return null;

    function todasContestadas() {
      return items.every(function (it) { return it.classList.contains('is-answered'); });
    }

    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest && e.target.closest('[data-repaso-next]');
      if (!btn || !raiz.contains(btn)) return;
      var ultimo = items[items.length - 1];
      if (!ultimo || !ultimo.classList.contains('is-current')) return;
      if (!todasContestadas()) return;
      e.stopPropagation();
      e.preventDefault();
      if (opts.onSalir) opts.onSalir();
      else if (global.motor && global.motor._advance) global.motor._advance(1);
    }, true);

    return { todasContestadas: todasContestadas };
  }

  global.initRevelados = initRevelados;
  global.initTandas = initTandas;
  global.initPasosRepaso = initPasosRepaso;
  global.initSalidaRepaso = initSalidaRepaso;
})(window);
