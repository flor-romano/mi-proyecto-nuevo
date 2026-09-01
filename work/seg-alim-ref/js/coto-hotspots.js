/* ============================================================
   coto-hotspots.js · Zonas interactivas sobre el arte que revelan info
   kit-base v1.8 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual a cada curso nuevo, sin editar.
   ------------------------------------------------------------
   En "Prevención cardiovascular" este mismo patrón terminó escrito
   CUATRO veces con nombres distintos: los sectores de una torta, las
   filas de un gráfico de barras, las 4 etapas de un proceso y la
   ilustración grande de cada factor. Las cuatro hacían exactamente lo
   mismo — resaltar la zona elegida, atenuar las demás, mostrar un
   cartel con su contenido y limpiar al salir — y las cuatro tuvieron
   que arreglarse por separado cuando algo estaba mal. Esta función es
   esa lógica, una sola vez.

   Lo que cambia entre casos es SOLO geometría y contenido: las zonas ya
   están posicionadas por el motor (`[data-hit]`, ver `_initShots`) o son
   `<path>` de un SVG dibujado encima del arte. Este módulo no sabe nada
   de eso.

   ⚠️ Los 3 disparadores son obligatorios, no una elección de estilo:
     · `mouseenter` — mouse
     · `focus`      — teclado
     · `click`      — táctil, con toggle para poder cerrar
   En una tablet NO existe el hover, y el cliente prueba los cursos en
   tablet (CLAUDE.md §6.8/§6.10.1). Una interacción que solo escucha
   `mouseenter` es invisible para la mitad de los alumnos.

   Uso (un caso con cartel):
     initHotspots({
       zonas: '[data-barra]',                 // selector de las zonas
       clave: 'data-barra',                   // atributo que las identifica
       datos: { cardio: { name: '…', txt: '…' }, … },
       cartel: '[data-barra-cartel]',         // nodo a mostrar/ocultar
       render: function (cartel, d) {         // cómo llenarlo
         cartel.querySelector('[data-name]').textContent = d.name;
         cartel.querySelector('[data-txt]').textContent  = d.txt;
       },
       narrar: function (d) { return d.name + '. ' + d.txt; },  // opcional
       claseIdle: 'is-barra-idle'             // clase en el contenedor
     });                                      //   cuando no hay nada activo

   Uso (un caso que abre un pop-up en vez de un cartel):
     initHotspots({
       zonas: '[data-etapa]', clave: 'data-etapa', datos: ETAPAS,
       soloClick: true,                       // sin revelar al pasar el mouse
       onSelect: function (id, d) { mostrarEtapa(id); motor.showPopup('etapa'); }
     });

   Devuelve { mostrar(clave), limpiar() } por si el curso necesita
   dispararlo desde otro lado (ej. los botones de una barra de pasos).
   ============================================================ */
(function (global) {
  'use strict';

  function initHotspots(opts) {
    opts = opts || {};
    var zonas = document.querySelectorAll(opts.zonas);
    if (!zonas.length) return null;

    var contenedor = opts.contenedor
      ? document.querySelector(opts.contenedor)
      : zonas[0].closest('.d-shot') || zonas[0].parentNode;
    var cartel = opts.cartel ? document.querySelector(opts.cartel) : null;
    var claseIdle = opts.claseIdle || 'is-idle';
    var activa = null;
    /* Clic = "quedate fijo" (pedido real de cliente, "Seguridad
       alimentaria"): antes CUALQUIER interacción (hover, foco o clic)
       se borraba con `mouseleave` del contenedor, así que en desktop
       era imposible sacar el mouse del ícono para leer el cartel sin
       que se cerrara solo. `pinned` es la zona que el clic dejó fija;
       mientras haya una, `mouseleave` no limpia — vuelve a mostrar ESA
       zona en vez de cualquiera que haya quedado hover-previsualizada.
       Se destraba clickeando la misma zona de nuevo, otra zona, o
       afuera (contenedor Y cartel). */
    var pinned = null;

    function datoDe(z) {
      var k = z.getAttribute(opts.clave);
      return { k: k, d: opts.datos ? opts.datos[k] : null };
    }

    function mostrarZona(z) {
      var info = datoDe(z);
      if (opts.datos && !info.d) return;
      activa = z;
      Array.prototype.forEach.call(zonas, function (o) {
        o.classList.toggle('is-active', o === z);
      });
      if (contenedor) contenedor.classList.remove(claseIdle);
      if (cartel && opts.render) { opts.render(cartel, info.d, info.k); cartel.hidden = false; }
      if (opts.onSelect) opts.onSelect(info.k, info.d, z);
      /* Se narra SOLO lo que se acaba de revelar, nunca la diapositiva
         entera: la consigna fija ya se narró al entrar y repetirla en
         cada zona es justo lo que el cliente marcó como molesto
         (CLAUDE.md §6.5). */
      if (opts.narrar && global.Narrador && global.Narrador.isNarrating()) {
        var texto = opts.narrar(info.d, info.k);
        if (texto) global.Narrador.speak(texto, 'other');
      }
    }

    function limpiar() {
      activa = null;
      pinned = null;
      Array.prototype.forEach.call(zonas, function (o) { o.classList.remove('is-active'); });
      if (contenedor) contenedor.classList.add(claseIdle);
      if (cartel) cartel.hidden = true;
      if (opts.onClear) opts.onClear();
    }

    Array.prototype.forEach.call(zonas, function (z) {
      if (!opts.soloClick) {
        z.addEventListener('mouseenter', function () { mostrarZona(z); });
        z.addEventListener('focus', function () { mostrarZona(z); });
      }
      /* El clic fija: si ya era la zona fija, lo saca (toggle); si no,
         pasa a ser esta. No hace falta la vieja pirueta de comparar
         contra el estado de ANTES del toque (`pointerdown`) para no
         confundir el `mouseenter` sintético que los navegadores emulan
         sobre touch — acá el hover ya no toca `pinned`, así que un
         toque siempre lo deja en un estado predecible sin importar si
         antes sintetizó hover o no. */
      z.addEventListener('click', function () {
        if (pinned === z) limpiar();
        else { pinned = z; mostrarZona(z); }
      });
    });

    if (!opts.soloClick && contenedor) {
      contenedor.addEventListener('mouseleave', function () {
        if (pinned) mostrarZona(pinned);
        else limpiar();
      });
    }
    /* Clic afuera (ni la zona ni su cartel) destraba — el gesto típico
       para cerrar algo que quedó fijo. */
    document.addEventListener('click', function (e) {
      if (!pinned) return;
      var dentro = (contenedor && contenedor.contains(e.target)) || (cartel && cartel.contains(e.target));
      if (!dentro) limpiar();
    });
    /* Al cambiar de diapositiva no puede quedar una zona "elegida" de
       antes: si el alumno vuelve, la vería resaltada sin haberla tocado. */
    document.addEventListener('slidechange', limpiar);

    limpiar();
    return {
      mostrar: function (clave) {
        for (var i = 0; i < zonas.length; i++) {
          if (zonas[i].getAttribute(opts.clave) === String(clave)) { mostrarZona(zonas[i]); return; }
        }
      },
      limpiar: limpiar
    };
  }

  global.initHotspots = initHotspots;
})(window);
