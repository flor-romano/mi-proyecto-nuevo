/* coto-logros.js — kit-base v1.9.60
   Área Aprendizaje (COTO) — puntaje y logros del curso
   ------------------------------------------------------------
   POR QUÉ EXISTE (auditoría de los 2 cursos terminados, §7.08):
   se compararon los `curso.js` de "Uso de Sucursales 3 - NOA" y
   "Seguridad alimentaria" función por función. `award` daba 92% de
   similitud entre los dos, `unlockBadge` 96%, `renderBadges` 88%,
   `updateHud` 67% — o sea, las mismas ~45 líneas copiadas y pegadas
   de un curso al otro. El kit ya era dueño de TODO lo demás de esta
   pieza: el marcado (`#d-badge-count` y `#d-points` viven en
   `header-boilerplate.html`), el CSS de las tarjetas
   (`.d-badge`/`.d-badges-grid`, addendum), el pulso del chip
   (`.d-chip--achieve.is-award-pulse`, coto-player-chrome.css), la
   moneda voladora (`fx.js`) y el sonido (`CotoUI.sStreak`). Lo único
   que NO vivía acá era el pegamento entre todo eso — justamente la
   parte que cada curso reescribía.

   Y ya se pagó el precio: "Seguridad alimentaria" tenía el conteo
   animado (`CotoUI.countTo`), el pulso del chip y el envío a xAPI
   (`XAPI.awarded`) — y "Uso de Sucursales 3 - NOA", que se armó
   DESPUÉS, no los tiene. La duplicación no solo cuesta líneas: hace
   que un curso nuevo ARRANQUE PEOR que el anterior, porque el que
   copia no sabe qué mejoras había que traerse. Este módulo toma como
   base la versión más completa de las dos, así el próximo curso las
   hereda de entrada en vez de redescubrirlas.

   QUÉ ES DEL KIT (está acá) y QUÉ NO (queda en el curso):
   · Acá: el contador de puntos, el set de logros obtenidos, pintar el
     HUD, dibujar la grilla de tarjetas, el toast, el sonido, la
     moneda, el pulso y el aviso a xAPI.
   · En el curso: el CATÁLOGO de logros (contenido: qué logros hay,
     cómo se llaman, qué pista dan) y CUÁNDO se otorga cada cosa (las
     reglas de su contenido). Eso no generaliza y no tiene por qué.

   Uso:
     var Logros = initLogros({
       badges: [{ id:'explorador', nom:'Explorador', ic:'🔎',
                  txt:'Abriste todas las fichas.',
                  pista:'Abrí todas las fichas de la diapositiva 3.' }, …]
     });
     Logros.award(10, 'Ficha completa');   // suma puntos + toast + fx
     Logros.unlock('explorador');          // otorga el logro (idempotente)

   Persistencia: este módulo NO llama a `SCORM.saveState()` por su
   cuenta a propósito — cada curso guarda además sus propias claves y
   `suspend_data` tiene 4096 caracteres contados en SCORM 1.2 (ver
   `check-suspend-data`). El curso arma su objeto y le pide a este
   módulo su parte:
     SCORM.saveState(Object.assign({ mis:'claves' }, Logros.serialize()));
     Logros.restore(SCORM.loadState());
   `serialize()` usa las mismas claves cortas que ya usaban los dos
   cursos (`p` = puntos, `b` = ids de logros), así un curso viejo que
   migre a este módulo sigue leyendo su propio suspend_data guardado.
   -------------------------------------------------------------- */
(function (global) {
  'use strict';

  function initLogros(opts) {
    opts = opts || {};
    var BADGES = opts.badges || [];
    var puntos = 0;
    var obtenidos = {};

    /* El HUD se pinta por id, igual que lo hacía cada curso — son los
       ids del boilerplate del kit, no inventados acá. Si el curso no
       los tiene (una portada suelta, un test), simplemente no pinta:
       nunca romper por marcado ausente. */
    function updateHud() {
      var c = document.getElementById('d-badge-count');
      var p = document.getElementById('d-points');
      if (c) c.textContent = Object.keys(obtenidos).length + '/' + BADGES.length;
      if (!p) return;
      /* `countTo` anima el número en vez de saltarlo de golpe — venía
         de "Seguridad alimentaria" y es lo que "Uso de Sucursales 3"
         perdió al copiar. Con fallback: si `coto-ui.js` no está
         cargado, se escribe el número y listo. */
      /* `data-valor` con el número VERDADERO, siempre y antes de
         animar (kit-base v1.9.66). El count-up de `countTo` dura 500ms
         con ease-out, así que leer el `textContent` a mitad devuelve un
         valor intermedio — y por la curva sale CASI bien: "49" donde
         hay 50, "88" donde hay 90. Eso es lo peor que puede pasarle a
         una medición, porque no parece un error de lectura sino un bug
         de producto, y manda a buscar donde no está (le costó una
         vuelta entera al rebalanceo de "Seguridad alimentaria", §7.14).
         Con este atributo el dato exacto está disponible sin esperar
         nada: los tests y el curso leen `data-valor`; el `textContent`
         queda para el ojo, que es a quien la animación le sirve. */
      p.setAttribute('data-valor', String(puntos));
      if (global.CotoUI && global.CotoUI.countTo) global.CotoUI.countTo(p, puntos);
      else p.textContent = puntos;
    }

    /* Pulso del chip de logros del header. La clase se saca y se
       vuelve a poner con un reflow en el medio (`void offsetWidth`):
       sin eso, dos premios seguidos no reinician la animación y el
       segundo no se ve — mismo patrón que ya usa `_syncGate()` en
       motor-slides.js para el glow del botón "Siguiente". */
    function pulsarChip() {
      var chip = document.querySelector('.d-chip--achieve');
      if (!chip) return;
      chip.classList.remove('is-award-pulse');
      void chip.offsetWidth;
      chip.classList.add('is-award-pulse');
    }

    /* Contrato del kit (addendum, sección "logros"): el contenedor es
       #d-badges-list.d-badges-grid y cada tarjeta es .d-badge[.earned]
       con tres <span> (.i / .n / .d). Escribir clases propias acá deja
       el CSS del kit sin aplicar — era un bug real y recurrente de
       curso, y es la razón principal de que esto suba al kit: acá el
       contrato se cumple una sola vez, para todos. */
    function render() {
      var g = document.getElementById('d-badges-list');
      if (!g) return;
      g.innerHTML = '';
      BADGES.forEach(function (b) {
        var on = !!obtenidos[b.id];
        var el = document.createElement('div');
        el.className = 'd-badge' + (on ? ' earned' : '');
        var i = document.createElement('span');
        i.className = 'i';
        i.setAttribute('aria-hidden', 'true');
        i.textContent = on ? b.ic : '🔒';
        var n = document.createElement('span');
        n.className = 'n';
        n.textContent = b.nom;
        var d = document.createElement('span');
        d.className = 'd';
        d.textContent = on ? b.txt : b.pista;
        el.appendChild(i); el.appendChild(n); el.appendChild(d);
        g.appendChild(el);
      });
    }

    function award(n, motivo) {
      puntos += n;
      updateHud();
      pulsarChip();
      /* La moneda voladora la expone fx.js como `__fxCoin` para que la
         llame quien suma puntos (ver su §5). Antes la disparaba el
         curso —o no la disparaba, según el curso— así que acá queda
         atada al único lugar donde los puntos suben de verdad. */
      if (global.__fxCoin) global.__fxCoin();
      if (global.Player && motivo) global.Player.toast('+' + n + ' · ' + motivo);
      if (opts.onChange) opts.onChange();
    }

    function unlock(id) {
      if (obtenidos[id]) return false;   // idempotente: otorgar dos veces no suma dos toasts
      var b = BADGES.filter(function (x) { return x.id === id; })[0];
      if (!b) return false;              // id que no está en el catálogo: no inventar una tarjeta
      obtenidos[id] = true;
      updateHud();
      render();
      if (global.Player) global.Player.toast('🏆 Logro: ' + b.nom);
      if (global.XAPI) global.XAPI.awarded(id, b.nom);
      if (global.CotoUI && global.CotoUI.sStreak) global.CotoUI.sStreak();
      if (opts.onChange) opts.onChange();
      return true;
    }

    function serialize() {
      return { p: puntos, b: Object.keys(obtenidos) };
    }

    /* Tolerante a `null`/objeto vacío a propósito: `SCORM.loadState()`
       devuelve null en la primera visita, y obligar a cada curso a
       chequearlo antes de llamar acá es exactamente el tipo de detalle
       que se olvida en el curso número 3. */
    function restore(s) {
      if (!s) return;
      puntos = s.p || 0;
      (s.b || []).forEach(function (id) { obtenidos[id] = true; });
      updateHud();
      render();
    }

    updateHud();
    render();

    return {
      award: award,
      unlock: unlock,
      has: function (id) { return !!obtenidos[id]; },
      puntos: function () { return puntos; },
      total: function () { return BADGES.length; },
      obtenidos: function () { return Object.keys(obtenidos).length; },
      render: render,
      updateHud: updateHud,
      serialize: serialize,
      restore: restore
    };
  }

  global.initLogros = initLogros;
})(window);
