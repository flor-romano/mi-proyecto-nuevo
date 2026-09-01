/* ============================================================
   curso.js · "Seguridad alimentaria" · Área Control de Calidad (COTO)
   ------------------------------------------------------------
   Acá va SOLO lo que es contenido de ESTE curso: textos, banco del
   mini juego, puntaje, IDs de diapositiva y el cableado entre los
   módulos de kit-base. Todo lo que no lea nada propio de este curso
   vive en el kit (CLAUDE.md §1). En esta vuelta subieron al kit:
   `initShotSwap` (coto-media.js), la variante "el arte ya dibuja el
   reproductor" de `initInlineCircleVideos` (coto-media.js +
   coto-media.css), `.modal-card--art` (coto-shot-stage.css), la
   cáscara del mini juego (coto-minijuego.css) y 4 bloques del contrato
   que el kit pedía pero no estilaba (addendum + coto-cierre.css).
   ============================================================ */
(function () {
  'use strict';

  var COURSE_SLUG = 'seguridad-alimentaria';
  var COURSE_NAME = 'Seguridad alimentaria';

  /* ---------- Vocabulario propio para la locución ----------
     El diccionario base del kit ya trae la tabla oficial del Manual de
     Contenido. Acá solo lo específico de este curso: las siglas y las
     temperaturas, que un TTS lee mal si se le pasa el símbolo. */
  if (window.Narrador && Narrador.addFixes) {
    Narrador.addFixes([
      [/\bETAs\b/g, 'e te as'],
      [/\bETA\b/g, 'e te a'],
      [/-18\s*°?C?\b/g, 'menos 18 grados'],
      [/(\d+)\s*°\s*C\b/g, '$1 grados'],
      [/\bhepatitis A\b/gi, 'hepatitis a'],
      [/\bPLU\b/g, 'pe ele ú']
    ]);
  }
  /* Pedido explícito del cliente: el título horneado en el arte de
     cada diapositiva (la píldora, ej. "Alteración", "Temperatura
     alimentaria") es el MISMO texto que el `<h2 data-slide-title>` de
     accesibilidad — y quiere que se anuncie por voz antes del cuerpo.
     El kit por default NO lo narra (decisión de otro cliente, "sonaba
     redundante") — acá se prende explícito, sin tocar el default de
     ningún otro curso. El glosario queda afuera de este cambio a
     propósito: sigue usando `[data-narrate-only]` (solo la frase de
     entrada), nunca la lista completa de términos. */
  if (window.Narrador && Narrador.setNarrateTitles) Narrador.setNarrateTitles(true);

  /* ================= GAMIFICACIÓN =================
     Puntaje realmente alcanzable — los umbrales de medalla se CALCULAN
     sobre esto, no se eligen a ojo (CLAUDE.md §6.10.6):

       · 3 fichas de peligro ×10 ......................  30
       · alteración de la carne (zona interactiva) ....  10
       · 4 vías de contaminación ×10 ..................  40
       · 5 malas prácticas ×5 .........................  25
       · 4 buenas prácticas ×5 ........................  20
       · 2 fichas de limpieza/desinfección ×10 ........  20
       · video del proceso ............................  20
       · 4 pasos de control de vencimientos ×5 ........  20
       -----------------------------------------------------
       subtotal recorrido (TODO gateado, o sea asegurado)  185
       · mini juego: 6 hallazgos ×30 ..................  180
       · bonus por encontrar los 6 ....................   50
       · repaso rápido: 6 preguntas ×5 ................   30
       -----------------------------------------------------
       máximo alcanzable ............................... 445
       piso asegurado de quien termina (el gate exige el
       recorrido completo + aprobar el juego con 4) ..... 305
       (el repaso no gatea ni se exige, así que no cuenta
       para el piso — mismo criterio siempre)

     MJ_TOTAL pasó de 5 a 6 (y MJ_APROBAR de 3 a 4, misma proporción
     ~60-65%): "Producto alterado" dejó de ser una opción trampa —
     el arte SÍ muestra una pieza de carne con un color distinto a la
     otra (bug real reportado, ver MJ_FB.alterado más abajo), así que
     ahora es un hallazgo correcto más en vez de tocar el dibujo del
     diseñador.

     Medallas: bronce arranca en el piso (305) — una medalla que se
     obtiene sin hacer nada no premia nada. */
  var PUNTOS = {
    peligro: 10, alteracion: 10, via: 10, mala: 5, buena: 5,
    limpieza: 10, video: 20, paso: 5, hallazgo: 30, juegoPerfecto: 50,
    repaso: 5
  };
  var MJ_TOTAL = 6;
  var REPASO_TOTAL = 6; // 2 preguntas × 3 resúmenes de unidad
  /* Techo real de la tabla de arriba: se calcula, no se escribe a mano
     — si mañana cambia un valor de PUNTOS, la nota informativa que
     viaja al LMS se reajusta sola. */
  var PUNTOS_MAX = PUNTOS.peligro * 3 + PUNTOS.alteracion + PUNTOS.via * 4 +
                   PUNTOS.mala * 5 + PUNTOS.buena * 4 + PUNTOS.limpieza * 2 +
                   PUNTOS.video + PUNTOS.paso * 4 +
                   PUNTOS.hallazgo * MJ_TOTAL + PUNTOS.juegoPerfecto +
                   PUNTOS.repaso * REPASO_TOTAL;
  var NIVELES = [
    { id: 'oro',    nombre: 'oro',    icono: '🥇', desde: 395 },
    { id: 'plata',  nombre: 'plata',  icono: '🥈', desde: 350 },
    { id: 'bronce', nombre: 'bronce', icono: '🥉', desde: 305 }
  ];

  var BADGES = [
    { id: 'riesgo',   ic: '🔬', nom: 'Riesgo detectado',  txt: 'Recorriste toda la unidad de riesgo alimentario.',
      pista: 'Abrí los 3 peligros, mirá la alteración y recorré las 4 vías de contaminación.' },
    { id: 'higiene',  ic: '🧼', nom: 'Manos limpias',      txt: 'Recorriste toda la unidad de manipulación segura e higiene.',
      pista: 'Recorré las malas y buenas prácticas, las 2 fichas de limpieza y el video.' },
    { id: 'frio',     ic: '🌡️', nom: 'Cadena de frío',     txt: 'Recorriste toda la unidad de conservación y control.',
      pista: 'Recorré los 4 pasos del control de vencimientos.' },
    { id: 'ojo',      ic: '🎯', nom: 'Ojo entrenado',      txt: 'Encontraste las 6 cosas que estaban mal en la imagen.',
      pista: 'Encontrá las 6 cosas que están mal en el mini juego.' },
    { id: 'curso',    ic: '🏁', nom: 'Curso completo',     txt: 'Recorriste todo el curso de punta a punta.',
      pista: 'Llegá al resumen final del curso.' }
  ];

  var estado = {
    puntos: 0,
    badges: {},
    peligros: {},      // id de pop-up (peligro-*/como-*) → abierto
    alteracion: false, // se miró la carne alterada
    swaps: {},         // id de grupo → { indice: true } de variantes vistas
    video: false,      // se reprodujo el video del proceso
    juegoHecho: false,
    juegoAprobado: false,
    juegoHallazgos: 0,
    juegoPerfecto: false,
    juegoErrados: {},  // id de opción del minijuego → todavía sin acertar nunca
    juegoAciertos: {}, // id de opción del minijuego → YA premiada alguna vez
                        // (distinto de mj.hallados, que se resetea en cada
                        // intento: sin esto, reintentar el juego re-premiaba
                        // los mismos hallazgos cada vez — ver responder())
    vistas: {},        // id de diapositiva → ya se entró alguna vez
    repaso: {}         // id de pregunta de repaso → contestada bien
  };

  /* Grupos de pop-up: los 3 peligros y las 2 fichas de limpieza usan
     el mismo mecanismo (imagen del diseñador + hitbox sobre la ✕). */
  var POPUPS = {
    'peligro-biologico': { grupo: 'peligros',  ptos: PUNTOS.peligro,  nom: 'Peligro biológico' },
    'peligro-fisico':    { grupo: 'peligros',  ptos: PUNTOS.peligro,  nom: 'Peligro físico' },
    'peligro-quimico':   { grupo: 'peligros',  ptos: PUNTOS.peligro,  nom: 'Peligro químico' },
    'como-limpiar':      { grupo: 'limpieza',  ptos: PUNTOS.limpieza, nom: '¿Cómo limpiar?' },
    'como-desinfectar':  { grupo: 'limpieza',  ptos: PUNTOS.limpieza, nom: '¿Cómo desinfectar?' }
  };
  var GRUPOS_POPUP = {
    peligros: ['peligro-biologico', 'peligro-fisico', 'peligro-quimico'],
    limpieza: ['como-limpiar', 'como-desinfectar']
  };

  /* Puntos por variante nueva vista en cada carrusel/pestañero. */
  var SWAP_PTOS = { contaminan: PUNTOS.via, malas: PUNTOS.mala, buenas: PUNTOS.buena, rotacion: PUNTOS.paso };
  var SWAP_LBL = {
    contaminan: ['vía', 'vías'],
    malas: ['conducta', 'conductas'],
    buenas: ['práctica', 'prácticas'],
    rotacion: ['paso', 'pasos']
  };

  /* Texto de cada variante: es lo ÚNICO que se narra al cambiar de
     paso — nunca la bajada fija de la diapositiva, que ya se narró al
     entrar (CLAUDE.md §6.5, bug real de re-narrar la consigna). */
  var SWAP_TXT = {
    contaminan: [
      'Personas. Los seres humanos somos la principal fuente de contaminación, ya que albergamos en nuestro cuerpo —nariz, boca, oídos, piel— gérmenes que podemos transmitir a los alimentos. Nuestras manos son vehículo de transmisión de bacterias y parásitos, por eso es muy importante higienizarnos cada vez que estemos en contacto con alimentos.',
      'Medio ambiente. Un ambiente mal higienizado, con presencia de polvo, tierra o restos de alimentos, es el medio ideal para la proliferación de microorganismos. Por eso, es necesario realizar la limpieza y desinfección de todos los lugares en los que se acondicionan los alimentos: depósitos, cámaras de refrigeración, góndolas. Otro factor que influye es la temperatura: las bajas temperaturas impiden la reproducción de los microorganismos, por lo tanto tenemos que controlar el frío de las cámaras y de las góndolas.',
      'Plagas. Asociada a la suciedad del medio ambiente, la presencia de plagas —moscas, hormigas, cucarachas, ratas— implica un serio riesgo de contaminación. Si estos insectos o roedores entran en contacto con los alimentos, pueden transmitirles bacterias, parásitos y virus muy peligrosos. Nuestra responsabilidad como colaboradores es alertar a los responsables de la sucursal si encontramos evidencia de plagas.',
      'Contaminación cruzada. Es la transferencia involuntaria de microorganismos o alérgenos de un alimento o superficie contaminado hacia un alimento inocuo o seguro. Puede darse en forma directa, cuando un alimento contaminado entra en contacto con uno seguro; o en forma indirecta, cuando se transfieren por medio de un intermediario: cuchillos, manos, tablas.'
    ],
    malas: [
      'No tocarse la nariz, la boca, el pelo y/o los ojos. En estas zonas del cuerpo se pueden encontrar muchas bacterias. Al tocarlas, los microorganismos se trasladan a nuestras manos y dedos, y si entramos en contacto con alimentos, corremos el riesgo de contaminarlos.',
      'No toser o estornudar sobre los alimentos. Al hacer esto liberamos al ambiente gérmenes que habitan en nuestra boca y nariz. Si lo hacemos sobre alimentos descubiertos, esos gérmenes los contaminan.',
      'No fumar. Al fumar, nuestros dedos entran en contacto con bacterias de la boca, el cigarrillo favorece la tos y los estornudos. Y, además, las cenizas o colillas pueden caer sobre los alimentos y contaminarlos.',
      'No comer o masticar chicles. Restos de comida y saliva pueden caer sobre los alimentos, contaminándolos.',
      'No utilizar joyas y/o objetos personales. Se recomienda evitar relojes, cadenitas, pulseras, anillos y aros, ya que son lugares perfectos para la acumulación de suciedad. En el caso de los colaboradores que participan de la producción de alimentos, por ejemplo en Elaborados, está prohibido su uso.'
    ],
    buenas: [
      'Lavado de manos. Es la principal forma de combatir la contaminación alimentaria, ya que las manos son el principal vehículo de transmisión de microorganismos a los alimentos.',
      'Usar ropa de trabajo limpia y adecuada. Cada puesto —Cajas, Salón, Coto Digital, Carnicería— tiene un uniforme asignado en sucursal. Tenemos la obligación de usar la ropa de trabajo acorde a nuestra función y verificar que esté en perfectas condiciones de higiene.',
      'Protegerse de cortes y heridas. Los cortes y heridas son lugares ideales para el desarrollo de bacterias. Deben protegerse con apósitos impermeables.',
      'Informar síntomas de enfermedad. Siempre que estemos con vómitos, diarrea, mucosidad nasal o tos, debemos informar a un superior, ya que si entramos en contacto con alimentos podemos contaminarlos.'
    ],
    rotacion: [
      'Paso 1. Diariamente, los responsables de las góndolas deberán realizar un control de vencimiento de todos los artículos.',
      'Paso 2. En caso de encontrar un producto vencido, se deberá retirar inmediatamente de la góndola.',
      'Paso 3. Los productos vencidos se colocarán en bolsas, y un jefe de sector deberá controlar que la mercadería esté en condiciones de decomisar o devolver al proveedor.',
      'Paso 4. El producto vencido se llevará a un sector específico: la cámara de decomiso y devoluciones. De esta forma, se evita que los alimentos vencidos entren en contacto con otros en buen estado.'
    ]
  };

  var Player, Cierre, Swaps = {};

  function award(n, motivo) {
    estado.puntos += n;
    updateHud();
    pulsarChipPuntos();
    if (Player && motivo) Player.toast('+' + n + ' · ' + motivo);
    persistir();
  }

  /* Pulso breve en el chip de logros/puntos del header al sumar puntos
     — feedback visual de "esto acaba de pasar", separado de updateHud()
     (que también corre al restaurar progreso/desbloquear un logro, donde
     un pulso sería ruido, no festejo). Mismo patrón de "sacar y volver a
     poner la clase + reflow forzado" que .d-stagger-in/.d-nudge (kit,
     CLAUDE.md §6.11) para que se pueda repetir en awards seguidos. */
  function pulsarChipPuntos() {
    var chip = document.querySelector('.d-chip--achieve');
    if (!chip) return;
    chip.classList.remove('is-award-pulse');
    void chip.offsetWidth;
    chip.classList.add('is-award-pulse');
  }

  function unlockBadge(id) {
    if (estado.badges[id]) return;
    var b = BADGES.filter(function (x) { return x.id === id; })[0];
    if (!b) return;
    estado.badges[id] = true;
    updateHud();
    renderBadges();
    if (Player) Player.toast('🏆 Logro: ' + b.nom);
    if (window.XAPI) XAPI.awarded(id, b.nom);
    if (window.CotoUI && CotoUI.sStreak) CotoUI.sStreak();
    persistir();
  }

  function updateHud() {
    var c = document.getElementById('d-badge-count');
    var p = document.getElementById('d-points');
    if (c) c.textContent = Object.keys(estado.badges).length + '/' + BADGES.length;
    if (p) {
      if (window.CotoUI && CotoUI.countTo) CotoUI.countTo(p, estado.puntos);
      else p.textContent = estado.puntos;
    }
  }

  function renderBadges() {
    /* Contrato del kit (addendum, sección "logros"): el contenedor es
       #d-badges-list.d-badges-grid y cada tarjeta es .d-badge[.earned]
       con tres <span> (.i / .n / .d). Escribir clases propias acá deja
       el CSS del kit sin aplicar (bug real de otros cursos). */
    var g = document.getElementById('d-badges-list');
    if (!g) return;
    g.innerHTML = '';
    BADGES.forEach(function (b) {
      var on = !!estado.badges[b.id];
      var el = document.createElement('div');
      el.className = 'd-badge' + (on ? ' earned' : '');
      var i = document.createElement('span'); i.className = 'i';
      i.setAttribute('aria-hidden', 'true'); i.textContent = on ? b.ic : '🔒';
      var n = document.createElement('span'); n.className = 'n'; n.textContent = b.nom;
      var d = document.createElement('span'); d.className = 'd';
      d.textContent = on ? b.txt : b.pista;
      el.appendChild(i); el.appendChild(n); el.appendChild(d);
      g.appendChild(el);
    });
  }

  /* ---------- Persistencia SCORM (cmi.core.suspend_data) ----------
     Claves cortas a propósito: SCORM 1.2 limita suspend_data a 4096
     caracteres. */
  function persistir() {
    if (!window.SCORM) return;
    var sw = {};
    Object.keys(estado.swaps).forEach(function (g) { sw[g] = Object.keys(estado.swaps[g]).join(','); });
    SCORM.saveState({
      p: estado.puntos,
      b: Object.keys(estado.badges),
      pop: Object.keys(estado.peligros),
      alt: estado.alteracion ? 1 : 0,
      sw: sw,
      vid: estado.video ? 1 : 0,
      j: estado.juegoHecho ? 1 : 0,
      jh: estado.juegoHallazgos,
      jp: estado.juegoPerfecto ? 1 : 0,
      jok: estado.juegoAprobado ? 1 : 0,
      je: Object.keys(estado.juegoErrados),
      ja: Object.keys(estado.juegoAciertos),
      vs: Object.keys(estado.vistas),
      rp: Object.keys(estado.repaso)
    });
  }

  function restaurar() {
    if (!window.SCORM) return;
    var s = SCORM.loadState();
    if (!s) return;
    estado.puntos = s.p || 0;
    (s.b || []).forEach(function (id) { estado.badges[id] = true; });
    (s.pop || []).forEach(function (id) { estado.peligros[id] = true; });
    estado.alteracion = !!s.alt;
    Object.keys(s.sw || {}).forEach(function (g) {
      estado.swaps[g] = {};
      String(s.sw[g]).split(',').filter(Boolean).forEach(function (i) { estado.swaps[g][i] = true; });
    });
    estado.video = !!s.vid;
    estado.juegoHecho = !!s.j;
    estado.juegoHallazgos = s.jh || 0;
    estado.juegoPerfecto = !!s.jp;
    estado.juegoAprobado = !!s.jok;
    (s.je || []).forEach(function (id) { estado.juegoErrados[id] = true; });
    (s.ja || []).forEach(function (id) { estado.juegoAciertos[id] = true; });
    (s.vs || []).forEach(function (id) { estado.vistas[id] = true; });
    (s.rp || []).forEach(function (id) { estado.repaso[id] = true; });
  }

  /* ================= NARRACIÓN ================= */
  function speakSlide(slideEl) {
    if (!slideEl || !window.Narrador) return;
    Narrador.speak(Narrador.textOf(slideEl), 'slide');
  }
  function speakPaso(txt) {
    if (!txt || !window.Narrador || !Narrador.isNarrating()) return;
    Narrador.speak(txt, 'other');
  }

  /* ================= FICHAS (pop-ups del diseñador) ================= */
  function marcarPopupVisto(id) {
    document.querySelectorAll('[data-peligro-trigger="' + id + '"]').forEach(function (h) {
      h.classList.add('is-done');
    });
    var info = POPUPS[id];
    if (info) actualizarTicks(info.grupo);
  }

  function actualizarTicks(grupo) {
    var ids = GRUPOS_POPUP[grupo];
    if (!ids) return;
    var vistos = ids.filter(function (r) { return estado.peligros[r]; }).length;
    document.querySelectorAll('[data-vistos-lbl="' + grupo + '"]').forEach(function (lbl) {
      lbl.textContent = vistos + ' de ' + ids.length + ' peligros vistos';
    });
    document.querySelectorAll('[data-vistos-dots="' + grupo + '"]').forEach(function (dots) {
      ids.forEach(function (r) {
        var t = dots.querySelector('[data-item="' + r + '"]');
        if (t) t.classList.toggle('is-done', !!estado.peligros[r]);
      });
    });
  }

  function initPopupsDeContenido() {
    Object.keys(estado.peligros).forEach(marcarPopupVisto);
    Object.keys(GRUPOS_POPUP).forEach(actualizarTicks);

    document.addEventListener('popupopen', function (e) {
      var id = e.detail && e.detail.id;
      var info = POPUPS[id];
      if (!info) return;
      marcarPopupVisto(id);
      if (estado.peligros[id]) return;
      estado.peligros[id] = true;
      award(info.ptos, info.nom);
      actualizarTicks(info.grupo);
      revisarLogros();
      if (window.motor) motor._syncNav();
    });
  }

  /* ================= CARRUSELES / PESTAÑAS / PASOS =================
     Toda la mecánica (swap de la captura, ocultar la flecha que se
     iría de rango, marcar la pestaña activa, precargar) la resuelve
     `initShotSwap` del kit. Acá solo el contenido: qué se narra en
     cada paso, cuántos puntos vale y cómo se ven las tildes. */
  function actualizarSwapTicks(id) {
    var vistos = estado.swaps[id] ? Object.keys(estado.swaps[id]).length : 0;
    var total = Swaps[id] ? Swaps[id].total : (SWAP_TXT[id] || []).length;
    var lbl = SWAP_LBL[id] || ['paso', 'pasos'];
    document.querySelectorAll('[data-vistos-lbl="' + id + '"]').forEach(function (el) {
      el.textContent = vistos + ' de ' + total + ' ' + (total === 1 ? lbl[0] : lbl[1]) + ' vistas';
    });
    document.querySelectorAll('[data-vistos-dots="' + id + '"]').forEach(function (dots) {
      for (var i = 0; i < total; i++) {
        var t = dots.querySelector('[data-item="' + i + '"]');
        if (t) t.classList.toggle('is-done', !!(estado.swaps[id] && estado.swaps[id][i]));
      }
    });
  }

  function initSwaps() {
    Swaps = initShotSwap({
      onChange: function (i, id) {
        var txt = (SWAP_TXT[id] || [])[i];
        // texto accesible del paso actual (aria-live), para lectores de
        // pantalla: la imagen es la que cambia y ellos no la "ven".
        var out = document.querySelector('[data-swap-body="' + id + '"]');
        if (out) out.textContent = txt || '';
        speakPaso(txt);

        estado.swaps[id] = estado.swaps[id] || {};
        if (!estado.swaps[id][i]) {
          estado.swaps[id][i] = true;
          award(SWAP_PTOS[id] || 5, (SWAP_TXT[id] || [])[i] ? txt.split('.')[0] : 'Paso visto');
          revisarLogros();
          if (window.motor) motor._syncNav();
        }
        actualizarSwapTicks(id);
        persistir();
      }
    });

    // Restaurar: la variante 0 siempre cuenta como vista (es la que se
    // muestra al entrar) y las guardadas se repintan.
    Object.keys(Swaps).forEach(function (id) {
      estado.swaps[id] = estado.swaps[id] || {};
      estado.swaps[id][0] = true;
      var txt = (SWAP_TXT[id] || [])[0];
      var out = document.querySelector('[data-swap-body="' + id + '"]');
      if (out && !out.textContent) out.textContent = txt || '';
      actualizarSwapTicks(id);
    });
  }

  /* ================= "Inocuidad" =================
     Diapo definitoria (ícono único, sin sub-temas separables como
     "seguridad"). El texto ya cubre el QUÉ y el POR QUÉ; el hotspot
     sobre el ícono del escudo suma el CÓMO — una regla práctica y
     accionable para el día a día, que el texto no da (mismo criterio
     que el tip de "envasado"). */
  var INOCUIDAD_TIP = {
    regla: {
      name: 'En la práctica',
      txt: 'Antes de vender o entregar un alimento, preguntate: ¿está en buen estado, bien conservado y bien manipulado? Si tenés dudas, no lo entregues — consultá a tu responsable.'
    }
  };
  function initInocuidadTip() {
    var slide = document.querySelector('[data-slide="inocuidad"]');
    if (!slide) return;
    var cartel = slide.querySelector('[data-inocuidad-cartel]');
    var hint = slide.querySelector('[data-inocuidad-hint]');
    if (!cartel) return;
    initHotspots({
      zonas: '[data-inocuidad-tip]',
      clave: 'data-inocuidad-tip',
      contenedor: '[data-inocuidad-zona]',
      datos: INOCUIDAD_TIP,
      cartel: '[data-inocuidad-cartel]',
      render: function (c, d) {
        c.querySelector('[data-inocuidad-name]').textContent = d.name;
        c.querySelector('[data-inocuidad-txt]').textContent = d.txt;
      },
      onSelect: function (k, d) {
        if (hint) hint.hidden = true;
        if (window.XAPI) XAPI.experienced('hotspot-' + k, d && d.name ? d.name : k);
      },
      onClear: function () { if (hint) hint.hidden = false; },
      narrar: function (d) { return d.name + '. ' + d.txt; }
    });
  }

  /* ================= "¿Qué es la seguridad alimentaria?" =================
     Diapo estática: 3 íconos con pinta de botón que no hacían nada
     (feedback del cliente). Son un adelanto de la unidad — cada uno
     revela 1-2 líneas de qué viene, con el mismo patrón `initHotspots`
     de la carne/los peligros. A propósito NO navegan (`data-goto`)
     ni saltan diapositivas: el curso tiene avance bloqueado por
     contenido (CLAUDE.md §6.10) y adelantarse rompería esa regla —
     esto es un preview, no un atajo. */
  var SEG_TEMAS = {
    manipulacion: {
      name: 'Manipulación segura de alimentos',
      txt: 'Buenas prácticas al manipular los alimentos: higiene personal, uso correcto del uniforme y cómo evitar la contaminación cruzada.'
    },
    ambientes: {
      name: 'Limpieza y desinfección de ambientes',
      txt: 'Cómo mantener limpios y desinfectados los espacios de trabajo: mesadas, depósitos y áreas de manipulación.'
    },
    utensilios: {
      name: 'Limpieza y desinfección de utensilios y máquinas',
      txt: 'Cómo limpiar y desinfectar correctamente cuchillos, tablas, bachas y máquinas antes de usarlos.'
    }
  };
  function initSeguridadIntro() {
    var slide = document.querySelector('[data-slide="seguridad"]');
    if (!slide) return;
    var cartel = slide.querySelector('[data-seg-cartel]');
    var hint = slide.querySelector('[data-seg-hint]');
    if (!cartel) return;
    initHotspots({
      zonas: '[data-seg-tema]',
      clave: 'data-seg-tema',
      contenedor: '[data-seg-icons]',
      datos: SEG_TEMAS,
      cartel: '[data-seg-cartel]',
      render: function (c, d) {
        c.querySelector('[data-seg-name]').textContent = d.name;
        c.querySelector('[data-seg-txt]').textContent = d.txt;
      },
      onSelect: function (k, d) {
        if (hint) hint.hidden = true;
        if (window.XAPI) XAPI.experienced('hotspot-' + k, d && d.name ? d.name : k);
      },
      onClear: function () { if (hint) hint.hidden = false; },
      narrar: function (d) { return d.name + '. ' + d.txt; }
    });
  }

  /* ================= "Temperatura alimentaria" =================
     Los 3 rangos ya están horneados en el arte como texto — acá no
     hace falta REVELAR nada (a diferencia de "seguridad", donde el
     dato estaba oculto detrás de un ícono mudo). Lo que suma valor
     real es un ejemplo CONCRETO y reconocible de sucursal por rango,
     información nueva que el arte no trae. */
  var TEMP_RANGOS = {
    refrigerado: {
      name: 'Refrigerado: 0° a 5°C',
      txt: 'Ejemplo: los fiambres y lácteos en la heladera de la góndola.'
    },
    congelado: {
      name: 'Congelado: menos de -18°C',
      txt: 'Ejemplo: la carne y el pescado en el freezer del depósito.'
    },
    caliente: {
      name: 'Caliente: más de 65°C',
      txt: 'Ejemplo: las comidas preparadas en el mantenedor de la rotisería.'
    }
  };
  function initTemperaturaIntro() {
    var slide = document.querySelector('[data-slide="temperatura"]');
    if (!slide) return;
    var cartel = slide.querySelector('[data-temp-cartel]');
    var hint = slide.querySelector('[data-temp-hint]');
    if (!cartel) return;
    initHotspots({
      zonas: '[data-temp-rango]',
      clave: 'data-temp-rango',
      contenedor: '[data-temp-rangos]',
      datos: TEMP_RANGOS,
      cartel: '[data-temp-cartel]',
      render: function (c, d) {
        c.querySelector('[data-temp-name]').textContent = d.name;
        c.querySelector('[data-temp-txt]').textContent = d.txt;
      },
      onSelect: function (k, d) {
        if (hint) hint.hidden = true;
        if (window.XAPI) XAPI.experienced('hotspot-' + k, d && d.name ? d.name : k);
      },
      onClear: function () { if (hint) hint.hidden = false; },
      narrar: function (d) { return d.name + '. ' + d.txt; }
    });
  }

  /* ================= "Envasado" =================
     Diapo estática, un solo hitbox sobre la bandeja. El texto ya
     explica el PORQUÉ (el aire no entra en contacto); el cartel suma
     un tip práctico y accionable que el texto no da. */
  var ENVASADO_TIP = {
    bandeja: {
      name: 'Al envasar, revisá esto',
      txt: 'El film tiene que cubrir toda la bandeja, bien pegado a los bordes, sin bolsas de aire — ahí es donde el aire vuelve a entrar en contacto con el alimento.'
    }
  };
  function initEnvasadoTip() {
    var slide = document.querySelector('[data-slide="envasado"]');
    if (!slide) return;
    var cartel = slide.querySelector('[data-envasado-cartel]');
    var hint = slide.querySelector('[data-envasado-hint]');
    if (!cartel) return;
    initHotspots({
      zonas: '[data-envasado-tip]',
      clave: 'data-envasado-tip',
      contenedor: '[data-envasado-zona]',
      datos: ENVASADO_TIP,
      cartel: '[data-envasado-cartel]',
      render: function (c, d) {
        c.querySelector('[data-envasado-name]').textContent = d.name;
        c.querySelector('[data-envasado-txt]').textContent = d.txt;
      },
      onSelect: function (k, d) {
        if (hint) hint.hidden = true;
        if (window.XAPI) XAPI.experienced('hotspot-' + k, d && d.name ? d.name : k);
      },
      onClear: function () { if (hint) hint.hidden = false; },
      narrar: function (d) { return d.name + '. ' + d.txt; }
    });
  }

  /* ================= Predicción antes del video "proceso" =================
     Item 7 de la ronda de mejoras. Pop-up de texto plano (mismo molde
     que "logros") que se abre solo al entrar a la diapo "proceso" vía
     data-intro-popup/-once (kit, motor-slides.js) — ANTES de que el
     alumno mire el video. No suma puntos (mismo criterio que los
     hotspots informativos de esta ronda): es una pausa para pensar,
     no una instancia de evaluación. */
  var PRED_FB = {
    ok: 'Exacto: primero se quita la suciedad visible a mano o con cepillo, recién después se aplica la solución de limpieza. Mirá el video para ver el proceso completo.',
    no: 'No pasa nada, ahora lo vemos: primero se quita la suciedad visible a mano o con cepillo, recién después se aplica la solución de limpieza. Mirá el video para ver el proceso completo.'
  };
  function initPrediccionProceso() {
    var pop = document.querySelector('[data-popup="prediccion-proceso"]');
    if (!pop) return;
    var opts = pop.querySelector('[data-pred-opts]');
    var fb = pop.querySelector('[data-pred-fb]');
    var seguir = pop.querySelector('[data-pred-continue]');
    if (!opts || !fb) return;
    var respondido = false;
    opts.querySelectorAll('button[data-pred-opt]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (respondido) return;
        respondido = true;
        var ok = btn.getAttribute('data-pred-ok') === 'true';
        btn.setAttribute('data-chosen', '');
        btn.classList.add(ok ? 'is-correct' : 'is-wrong');
        opts.querySelectorAll('button[data-pred-opt]').forEach(function (b) { b.disabled = true; });
        var texto = ok ? PRED_FB.ok : PRED_FB.no;
        fb.textContent = texto;
        fb.hidden = false;
        if (seguir) seguir.hidden = false;
        if (window.Narrador && Narrador.isNarrating()) Narrador.speak(texto, 'other');
      });
    });
  }

  /* ================= Repaso rápido (resúmenes de unidad) =================
     2 preguntas V/F por unidad, sin nota ni gate — puro refuerzo antes
     de pasar a la siguiente (CLAUDE.md §3.11: mini-práctica sin
     calificar, mismo criterio que el curso ya usa en el minijuego para
     "no es la evaluación"). Un solo listener genérico para las 6
     preguntas del curso — cada `[data-repaso-item]` ya trae su propia
     pregunta/respuesta/feedback en el marcado. */
  function initRepasoRapido() {
    document.querySelectorAll('[data-repaso]').forEach(function (panel) {
      var items = Array.prototype.slice.call(panel.querySelectorAll('[data-repaso-item]'));
      var count = panel.querySelector('[data-repaso-count]');
      var prevBtn = panel.querySelector('[data-repaso-prev]');
      var nextBtn = panel.querySelector('[data-repaso-nextq]');
      if (!items.length) return;

      /* UNA pregunta por vez (pedido del cliente): con las 2 a la vez,
         al contestar la primera el panel crecía y chocaba contra el
         borde inferior de la diapositiva. Mostrando de a una, el alto
         del bloque no depende de cuántas se contestaron.
         Las flechas ‹ › (pedido aparte) navegan libre entre preguntas
         YA contestadas o no — a diferencia de "Siguiente" (que solo
         aparece tras responder y empuja el flujo hacia adelante), acá
         el alumno puede volver a mirar la 1 después de la 2 sin
         perder nada: ninguna respuesta se resetea al navegar. */
      var actual = 0;
      function mostrar(i) {
        i = Math.max(0, Math.min(items.length - 1, i));
        actual = i;
        items.forEach(function (it, n) {
          it.classList.toggle('is-current', n === i);
          /* BUG REAL: `.d-repaso-item{display:none}` (CSS, ver
             assets.css) esconde visualmente las preguntas que no son
             la actual, pero `Narrador.textOf()` solo filtra por el
             atributo `hidden` real — nunca miró `display:none` de una
             clase CSS. Resultado: al entrar a la diapo se narraban las
             2 preguntas de repaso SEGUIDAS, revelando la 2ª antes de
             que el alumno llegara a ella. `hidden` en el elemento real
             (no solo la clase) hace que la ocultación visual Y la de
             narración sean la MISMA garantía, sin depender de que
             textOf conozca esta clase puntual. */
          it.hidden = n !== i;
        });
        if (count) count.textContent = (i + 1) + ' de ' + items.length;
        if (prevBtn) prevBtn.disabled = i === 0;
        if (nextBtn) nextBtn.disabled = i === items.length - 1;
      }
      if (prevBtn) prevBtn.addEventListener('click', function () { mostrar(actual - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { mostrar(actual + 1); });
      function resolver(item, acerto) {
        item.classList.add('is-answered', acerto ? 'is-correct' : 'is-wrong');
        var fb = item.querySelector('[data-repaso-fb]');
        if (fb) fb.hidden = false;
        item.querySelectorAll('[data-repaso-ans]').forEach(function (b) { b.disabled = true; });
        var todas = items.every(function (it) { return it.classList.contains('is-answered'); });
        panel.classList.toggle('is-complete', todas);
      }

      items.forEach(function (item, idx) {
        var ok = item.getAttribute('data-repaso-ok') === 'true';
        var id = item.getAttribute('data-repaso-id');
        var btns = item.querySelectorAll('[data-repaso-ans]');
        var next = item.querySelector('[data-repaso-next]');
        if (next) next.addEventListener('click', function () { mostrar(idx + 1); });

        // Quien ya la contestó bien en una sesión anterior la encuentra
        // resuelta, no en blanco — mismo criterio que cualquier otro
        // progreso persistido del curso.
        if (id && estado.repaso[id]) {
          btns.forEach(function (b) {
            if ((b.getAttribute('data-repaso-ans') === 'true') === ok) b.setAttribute('data-chosen', '');
          });
          resolver(item, true);
          return;
        }
        btns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (item.classList.contains('is-answered')) return;
            var elegido = btn.getAttribute('data-repaso-ans') === 'true';
            var acerto = elegido === ok;
            btn.setAttribute('data-chosen', '');
            resolver(item, acerto);
            var fb = item.querySelector('[data-repaso-fb]');
            if (window.XAPI && id) {
              var q = item.querySelector('.d-repaso-q');
              XAPI.answered('repaso-' + id, q ? q.textContent : id, acerto, elegido ? 'Verdadero' : 'Falso');
            }
            if (window.Narrador && Narrador.isNarrating() && fb) Narrador.speak(fb.textContent, 'other');
            if (acerto && id && !estado.repaso[id]) {
              estado.repaso[id] = true;
              award(PUNTOS.repaso, 'Repaso correcto');
              persistir();
            }
          });
        });
      });

      // Arranca en la primera sin contestar; si ya están todas, se queda
      // en la última con la banda de "Repaso completo" a la vista.
      var arranque = items.length - 1;
      for (var i = 0; i < items.length; i++) {
        if (!items[i].classList.contains('is-answered')) { arranque = i; break; }
      }
      mostrar(arranque);
    });
  }

  /* ================= "¿Qué es el riesgo alimentario?" — tildes de estado =================
     Las 2 tarjetas ya muestran su respuesta horneada en el arte: acá
     no hay nada que revelar. Lo que suma es mostrar un tilde REAL si
     el alumno vuelve a esta diapo (el índice sirve para VOLVER, CLAUDE.md
     §6.10) después de haber recorrido la sección relacionada — nunca
     al revés, nunca un tilde que no refleje progreso real. */
  function marcarRiesgoVisto() {
    var slide = document.querySelector('[data-slide="riesgo"]');
    if (!slide) return;
    var produce = slide.querySelector('[data-riesgo-check="produce"]');
    var contaminan = slide.querySelector('[data-riesgo-check="contaminan"]');
    if (produce) produce.classList.toggle('is-on', !!estado.alteracion);
    if (contaminan) contaminan.classList.toggle('is-on', todasLasVariantes('contaminan', 4));
  }

  /* ================= ALTERACIÓN (zona sobre la carne) =================
     El PDF entrega las 2 versiones de la misma página y su propia
     consigna dibujada. `initHotspots` del kit da los 3 disparadores
     obligatorios (mouse + teclado + táctil) con el toggle ya resuelto
     — en tablet no existe el hover (CLAUDE.md §6.10.1 regla 2). */
  function initAlteracion() {
    var img = document.querySelector('[data-alteracion-img]');
    if (!img) return;
    var flag = document.querySelector('[data-carne-flag]');
    var BUENA = 'img/alteracion.webp', MALA = 'img/alteracion-mal.webp';
    var pre = new Image(); pre.src = MALA;

    initHotspots({
      zonas: '[data-carne]',
      clave: 'data-carne',
      /* BUG REAL reportado: había que "correr mucho el mouse" para que
         la carne volviera al estado normal. `initHotspots()` (kit) por
         default limpia el estado al hacer `mouseleave` del contenedor
         MÁS CERCANO con clase `.d-shot` — que acá es la diapositiva
         ENTERA (una sola zona ocupa 30×37% del lienzo), así que había
         que sacar el mouse de casi toda la pantalla para que se
         disparara. Pasándole `contenedor` explícito = la propia zona,
         el `mouseleave` se dispara apenas el mouse sale del área
         resaltada — que es lo que se espera de un hover. */
      contenedor: '[data-carne]',
      datos: { mal: { txt: 'Así se observa la alteración: la carne pierde color, brilla menos y la superficie cambia de textura. A simple vista ya no está apta para el consumo.' } },
      onSelect: function () {
        img.setAttribute('src', MALA);
        if (flag) flag.classList.add('is-on');
        if (estado.alteracion) return;
        estado.alteracion = true;
        award(PUNTOS.alteracion, 'Alteración observada');
        revisarLogros();
        persistir();
        if (window.motor) motor._syncNav();
      },
      onClear: function () {
        img.setAttribute('src', BUENA);
        if (flag) flag.classList.remove('is-on');
      },
      narrar: function (d) { return d && d.txt; }
    });
  }

  /* ================= MINI JUEGO =================
     Diseño del cliente (PDF páginas 43 a 47): una sola imagen, 12
     opciones en un "mapa" de 3×4 con líneas conectoras, originalmente
     5 cosas que están mal (ver nota de "alterado" más abajo, ahora 6),
     3 vidas y un pop-up de reglas.
     El puntaje interno del juego (arranca en 1000) es del juego; los
     puntos del CURSO se otorgan por hallazgo con award(). */
  /* Rediseño de las 12 opciones (pedido del cliente: "algunas me
     parecieron confusas"). Causa real encontrada: 3 de las 12 eran
     categorías ABSTRACTAS del manual (Peligro biológico/químico/
     físico — la misma taxonomía que enseña la diapo "Contaminación")
     mezcladas con las otras 9, que son observaciones CONCRETAS de la
     escena ("hay una mosca", "usa la tabla de corte"). Un alumno que
     ve manos descubiertas piensa, con razón, "eso ES un peligro
     biológico" — y el juego se lo marcaba mal porque en realidad
     pedía la conducta puntual, no la clasificación. La propia
     retroalimentación vieja lo delataba ("Es un TIPO de peligro, no
     algo que se vea en la imagen"): si hace falta esa aclaración, la
     opción no pertenece a esta lista. Fix: las 3 categorías se
     reemplazan por 3 observaciones puntuales, DEL MISMO TIPO que el
     resto — visualmente ausentes de la escena, no clasificaciones. */
  var MJ_OPCIONES = [
    { id: 'cruzada',   txt: 'Contaminación cruzada', ok: true },
    { id: 'plagas',    txt: 'Plagas',                ok: true },
    { id: 'limpieza',  txt: 'Productos de limpieza cerca de los alimentos', ok: false },
    { id: 'higiene',   txt: 'Mala higiene del ambiente', ok: true },
    { id: 'tabla',     txt: 'Usar la tabla de corte', ok: false },
    { id: 'residuos',  txt: 'Residuos mezclados con los alimentos', ok: false },
    { id: 'alterado',  txt: 'Producto alterado',      ok: true },
    { id: 'uniforme',  txt: 'Uniforme completo',      ok: false },
    { id: 'practicas', txt: 'Malas prácticas con alimentos', ok: true },
    { id: 'pared',     txt: 'Pared sucia',            ok: false },
    { id: 'toca',      txt: 'Toca los alimentos',     ok: true },
    { id: 'iluminacion', txt: 'Falta de iluminación',   ok: false }
  ];

  /* Retroalimentación por opción: la correcta explica QUÉ se ve en la
     imagen; la incorrecta explica por qué no corresponde, sin retar
     (CLAUDE.md §6.10.2.3: quien hace un curso de inducción suele estar
     en sus primeros días). */
  var MJ_FB = {
    cruzada:   'Sí. La carne cruda está sobre la misma mesada que la ensalada lista para consumir: los microorganismos pasan de una a otra.',
    plagas:    'Sí. Hay una mosca sobre la pared. Ante cualquier evidencia de plagas hay que avisar al jefe de sector o al gerente.',
    higiene:   'Sí. Se ve una mancha de suciedad sobre la mesada: un ambiente mal higienizado es el medio ideal para los microorganismos.',
    practicas: 'Sí. El barbijo le queda debajo de la nariz y hay alimentos descubiertos: al hablar, toser o estornudar se contaminan.',
    toca:      'Sí. Está manipulando la ensalada con las manos descubiertas. Las manos son el principal vehículo de transmisión de microorganismos.',
    limpieza:  'No se ve ningún producto de limpieza cerca de los alimentos en esta imagen. Guardarlos separados de la comida es lo correcto.',
    residuos:  'No hay residuos a la vista mezclados con la comida en esta escena.',
    iluminacion: 'El área se ve bien iluminada en la imagen: no es lo que está mal acá.',
    tabla:     'Usar la tabla de corte está BIEN. Lo que está mal es que la carne cruda y la ensalada compartan la misma mesada.',
    uniforme:  'La ropa de trabajo está limpia y en condiciones: el uniforme no es el problema acá.',
    /* Bug real reportado por el cliente: una de las dos piezas de
       carne SÍ se ve de un color distinto a la otra (más oscura) — el
       arte muestra un signo de alteración real. Se corrigió acá la
       opción (pasa de trampa a hallazgo correcto) en vez de tocar el
       dibujo del diseñador. */
    alterado:  'Sí. Una de las piezas de carne está más oscura que la otra: ese cambio de color es un signo de alteración.',
    pared:     'La pared en sí no tiene manchas ni suciedad — lo que sí está sucio es la mesada. La mosca que ves sobre la pared es un problema aparte (una plaga, no falta de limpieza): esa se marca con la opción "Plagas".'
  };

  var MJ_VIDAS = 3;
  var MJ_APROBAR = 4;          // hallazgos mínimos para pasar (misma proporción ~65% que 3 de 5)
  /* BUG REAL corregido (kit-base v1.9.40, reporte del cliente: "dice
     que obtuve 5650 puntos pero en realidad arriba voy 395").

     El minijuego tenía su PROPIA moneda: arrancaba en 1000, sumaba 800
     por acierto y restaba 150 por error, así que una partida perfecta
     mostraba 5800 — mientras el contador del curso (arriba a la
     derecha) iba en 395 sobre un máximo de ~430. Dos números llamados
     "puntos", en escalas que no tienen NADA que ver, en la misma
     pantalla: el del panel final ni siquiera sumaba al total del curso
     (lo que suma de verdad son los `PUNTOS.hallazgo` de más abajo).

     Ahora hay UNA sola moneda: la del curso. El puntaje que muestra el
     minijuego (HUD y panel final) es exactamente lo que ese intento
     aporta al contador de arriba — 30 por hallazgo + 50 de bonus al
     encontrar los 6. Los errores siguen costando una VIDA, que ya era
     la penalidad real del juego; restar puntos era inventar un castigo
     en una moneda que no existía.

     Ojo con la interacción con §6.53: `estado.juegoAciertos` hace que
     cada hallazgo puntúe UNA sola vez en toda la vida del curso (para
     que reintentar no sea puntaje infinito). Así que en un REINTENTO el
     minijuego muestra lo que ese intento vale, y el contador de arriba
     no lo vuelve a sumar — que es lo correcto, y ahora además es
     legible: los dos números están en la misma escala.

     El puntaje NO se lleva en una variable propia: se DERIVA de
     `mj.hallados` con `puntosDelIntento()` más abajo, leyendo
     `PUNTOS.hallazgo`/`PUNTOS.juegoPerfecto` — las mismas constantes
     que usa `award()`. Guardar el número aparte sería una segunda
     copia del mismo dato, esperando a desincronizarse el día que
     alguien cambie la tabla de PUNTOS (el patrón de bug que ya costó
     caro en §6.25 y §6.51). */

  var HEART_SVG = '<svg viewBox="0 0 8 7" shape-rendering="crispEdges">' +
    '<path fill="currentColor" d="M1 0h2v1H1zM5 0h2v1H5zM0 1h1v1H0zM3 1h2v1H3zM7 1h1v1H7z' +
    'M0 2h8v2H0zM1 4h6v1H1zM2 5h4v1H2zM3 6h2v1H3z"/></svg>';

  /* Topología del mapa: 3 columnas × 4 filas de contenido con pistas
     de conexión de por medio (columnas 2 y 4; filas 2, 4 y 6). Las
     posiciones son explícitas para los 12 botones — con auto-flow, el
     grid mete botones dentro de las pistas angostas reservadas para
     las líneas (bug real documentado en CLAUDE.md §6.27). */
  var MJ_POS = [
    [1, 1], [3, 1], [5, 1],
    [1, 3], [3, 3], [5, 3],
    [1, 5], [3, 5], [5, 5],
    [1, 7], [3, 7], [5, 7]
  ];

  function initMinijuego() {
    var slide = document.querySelector('[data-slide="minijuego"]');
    if (!slide) return;
    var grid = slide.querySelector('[data-mj-grid]');
    var fbEl = slide.querySelector('[data-mj-fb]');
    var remedyEl = slide.querySelector('[data-mj-remedy]');
    var foundEl = slide.querySelector('[data-mj-found]');
    var scoreEl = slide.querySelector('[data-mj-score]');
    var livesEl = slide.querySelector('[data-mj-lives]');
    var finImg = slide.querySelector('[data-mj-fin-img]');
    var finFound = slide.querySelector('[data-mj-fin-found]');
    var finScore = slide.querySelector('[data-mj-fin-score]');
    var finSay = slide.querySelector('[data-mj-fin-say]');
    /* El repaso es un pop-up real (`[data-popup="mj-repaso"]`), vive
       fuera de `slide` en el documento — a diferencia del resto de
       estos `querySelector`, estos 3 buscan desde `document`. */
    var repasoListEl = document.querySelector('[data-mj-repaso-list]');
    var repasoTitleEl = document.querySelector('[data-mj-repaso-title]');
    var repasoSubEl = document.querySelector('[data-mj-repaso-sub]');
    if (!grid) return;

    var mj = { vidas: MJ_VIDAS, hallados: {}, errados: {}, orden: [], activo: false };

    /* Puntos que ESTE intento aporta al contador del curso — la misma
       moneda del chip de arriba, no una escala interna aparte (ver la
       nota de MJ_VIDAS/MJ_APROBAR más arriba: el panel final mostraba
       5650 mientras el header iba en 395).
       Se DERIVA de `mj.hallados` en vez de llevarse en una variable
       propia, y lee las mismas constantes que `award()`: si mañana
       cambia `PUNTOS.hallazgo`, el número que muestra el minijuego se
       reajusta solo, sin quedar una copia vieja por ahí. */
    function puntosDelIntento() {
      var n = Object.keys(mj.hallados).length;
      var p = n * PUNTOS.hallazgo;
      if (n >= MJ_TOTAL) p += PUNTOS.juegoPerfecto;
      return p;
    }

    function irA(panel) {
      var b = slide.querySelector('[data-target="' + panel + '"]');
      if (b) b.click();
    }

    function pintarVidas() {
      if (!livesEl) return;
      livesEl.innerHTML = '';
      for (var i = 0; i < MJ_VIDAS; i++) {
        var h = document.createElement('span');
        h.className = 'd-mj-heart' + (i < mj.vidas ? '' : ' is-off');
        h.setAttribute('aria-hidden', 'true');
        h.innerHTML = HEART_SVG;
        livesEl.appendChild(h);
      }
      livesEl.setAttribute('aria-label', 'Vidas restantes: ' + mj.vidas + ' de ' + MJ_VIDAS);
    }

    function hud() {
      var n = Object.keys(mj.hallados).length;
      if (foundEl) foundEl.textContent = n + '/' + MJ_TOTAL;
      if (scoreEl) scoreEl.textContent = String(puntosDelIntento());
      pintarVidas();
    }

    /* El "mapa" (12 botones) se arma una sola vez.
       Pedido explícito del cliente: sacar las líneas que conectaban las
       opciones (estilo organigrama, heredado del molde de NOA) — acá
       las 12 opciones son un banco plano, no un mapa jerárquico, así
       que las líneas no aportaban nada y se sacan. Las pistas de
       `--mj-track` entre columnas/filas del grid quedan como separación
       normal, sin dibujar nada encima. */
    function armarGrid() {
      grid.innerHTML = '';
      MJ_OPCIONES.forEach(function (o, idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'd-mj-opt';
        b.textContent = o.txt;
        b.setAttribute('data-mj-opt', o.id);
        b.style.gridColumn = String(MJ_POS[idx][0]);
        b.style.gridRow = String(MJ_POS[idx][1]);
        b.addEventListener('click', function () { responder(o, b); });
        grid.appendChild(b);
      });
    }

    function resetBotones() {
      grid.querySelectorAll('.d-mj-opt').forEach(function (b) {
        b.className = 'd-mj-opt';
        b.disabled = false;
      });
    }

    /* ---- Pista tras inactividad (propuesta 4/10) ----
       A los 20s sin responder, resalta 1 opción correcta todavía no
       encontrada + 2 incorrectas todavía no probadas. Pedido explícito
       del cliente: que SÍ quede claro cuál de las 3 es la correcta —
       antes (CLAUDE.md §6.39) resaltaba las 3 igual a propósito para
       no delatar la respuesta; ahora la correcta suma `.is-hint-ok`
       (ícono 💡 + pulso celeste, CSS del kit) y las 2 incorrectas se
       quedan con el pulso ámbar de siempre (`.is-hint` a secas).
       Se reprograma en cada respuesta y se cancela al terminar/salir
       (mismo mecanismo ya usado en "Uso de Sucursales 3 - NOA"). */
    var pistaTimer = null;
    function marcarHint(id, ok) {
      var btn = grid.querySelector('[data-mj-opt="' + id + '"]');
      if (btn) btn.classList.add('is-hint', ok ? 'is-hint-ok' : 'is-hint-bad');
    }
    function limpiarPista() {
      if (pistaTimer) { clearTimeout(pistaTimer); pistaTimer = null; }
      grid.querySelectorAll('.d-mj-opt.is-hint').forEach(function (b) {
        b.classList.remove('is-hint', 'is-hint-ok', 'is-hint-bad');
      });
    }
    function elegirAlAzar(arr, n) {
      var copia = arr.slice(), out = [];
      while (copia.length && out.length < n) {
        out.push(copia.splice(Math.floor(Math.random() * copia.length), 1)[0]);
      }
      return out;
    }
    function programarPista() {
      limpiarPista();
      pistaTimer = setTimeout(function () {
        var correctas = MJ_OPCIONES.filter(function (o) { return o.ok && !mj.hallados[o.id]; });
        var incorrectas = MJ_OPCIONES.filter(function (o) { return !o.ok && !mj.errados[o.id]; });
        if (!correctas.length) return;
        elegirAlAzar(correctas, 1).forEach(function (o) { marcarHint(o.id, true); });
        elegirAlAzar(incorrectas, 2).forEach(function (o) { marcarHint(o.id, false); });
      }, 20000);
    }

    function empezar() {
      mj.vidas = MJ_VIDAS; mj.hallados = {}; mj.errados = {}; mj.orden = []; mj.activo = true;
      resetBotones();
      slide.querySelectorAll('[data-mj-hotspot].is-on').forEach(function (s) { s.classList.remove('is-on'); });
      if (fbEl) { fbEl.textContent = ''; fbEl.className = 'd-mj-fb'; }
      hud();
      irA('mj-jugar');
      speakPaso('¿Qué observás en esta imagen que esté mal? Elegí las ' + MJ_TOTAL + ' cosas que están mal.');
      programarPista();
      aplicarRemediacion();
    }

    /* Remediación adaptativa (propuesta de UX, no del PDF): al
       reintentar, se resaltan de entrada las opciones que la vez
       anterior fueron un error (una distracción elegida) o un
       hallazgo que nunca se encontró — en vez de las 12 en igualdad
       de condiciones cada vez. Se aplica DESPUÉS de `programarPista()`
       a propósito: esa función limpia cualquier `.is-hint` antes de
       programar su propio timer de 20s, así que aplicar esto antes
       lo borraría de inmediato. */
    function aplicarRemediacion() {
      var ids = Object.keys(estado.juegoErrados);
      if (remedyEl) remedyEl.hidden = !ids.length;
      ids.forEach(function (id) {
        // `estado.juegoErrados` mezcla 2 cosas (ver `terminar()`): una
        // distracción que se eligió por error, o un hallazgo real que
        // nunca se encontró — cada una necesita el color correcto.
        var opt = MJ_OPCIONES.filter(function (o) { return o.id === id; })[0];
        marcarHint(id, !!(opt && opt.ok));
      });
    }

    function responder(o, btn) {
      if (!mj.activo || btn.disabled) return;
      btn.disabled = true;
      mj.orden.push({ id: o.id, ok: o.ok });
      if (window.XAPI) XAPI.answered('minijuego-' + o.id, o.txt, o.ok, o.txt);
      if (o.ok) {
        mj.hallados[o.id] = true;
        btn.classList.add('is-ok');
        /* Pedido explícito del cliente: al acertar, resaltar también
           la zona real del dibujo (no solo la píldora de la opción).
           `data-mj-hotspot` coincide 1:1 con `o.id` — la cáscara
           visual (posición, halo, pulso) es 100% del kit
           (coto-minijuego.css, `.d-mj-hotspot`), acá solo se prende. */
        var spot = slide.querySelector('[data-mj-hotspot="' + o.id + '"]');
        if (spot) spot.classList.add('is-on');
        feedback(true, MJ_FB[o.id]);
        /* BUG REAL: `mj.hallados` se resetea en cada intento (empezar()),
           así que premiar acá sin más volvía a dar los mismos PUNTOS.hallazgo
           cada vez que se reintentaba el minijuego — algo que el curso
           permite sin límite ("podés reintentarlo las veces que quieras").
           `estado.juegoAciertos` persiste entre intentos (y entre
           sesiones): cada hallazgo puntúa una sola vez en toda la vida
           del curso, sin importar cuántos intentos hagan falta para
           encontrarlo. */
        if (!estado.juegoAciertos[o.id]) {
          estado.juegoAciertos[o.id] = true;
          award(PUNTOS.hallazgo, 'Lo encontraste');
        }
      } else {
        mj.errados[o.id] = true;
        mj.vidas--;
        btn.classList.add('is-bad');
        feedback(false, MJ_FB[o.id]);
      }
      hud();
      if (Object.keys(mj.hallados).length >= MJ_TOTAL) return terminar(true);
      if (mj.vidas <= 0) return terminar(false);
      programarPista();
    }

    function feedback(ok, txt) {
      if (!fbEl) return;
      fbEl.className = 'd-mj-fb ' + (ok ? 'is-ok' : 'is-bad');
      fbEl.textContent = txt || '';
      speakPaso(txt);
    }

    function terminar(gano) {
      mj.activo = false;
      limpiarPista();
      var hallados = Object.keys(mj.hallados).length;
      estado.juegoHecho = true;
      estado.juegoHallazgos = Math.max(estado.juegoHallazgos, hallados);
      if (hallados >= MJ_APROBAR) estado.juegoAprobado = true;
      /* Remediación adaptativa: si encontró las MJ_TOTAL, no queda nada que
         reforzar la próxima vez. Si no, se guardan sus distracciones
         (mj.errados) y los hallazgos que nunca encontró — eso es lo
         que se resalta al reintentar (aplicarRemediacion()). */
      if (gano) {
        estado.juegoErrados = {};
      } else {
        Object.keys(mj.errados).forEach(function (id) { estado.juegoErrados[id] = true; });
        MJ_OPCIONES.forEach(function (o) { if (o.ok && !mj.hallados[o.id]) estado.juegoErrados[o.id] = true; });
      }
      if (gano && !estado.juegoPerfecto) {
        estado.juegoPerfecto = true;
        award(PUNTOS.juegoPerfecto, 'Encontraste las ' + MJ_TOTAL);
        unlockBadge('ojo');
      }
      persistir();

      if (finImg) finImg.setAttribute('src', gano ? 'img/minijuego-fin-exito.webp' : 'img/minijuego-fin-reintentar.webp');
      if (finFound) finFound.textContent = hallados + '/' + MJ_TOTAL;
      if (finScore) finScore.textContent = String(puntosDelIntento());
      /* Pedido explícito del cliente: el arte trae "Reintentar" en las
         DOS versiones, también en la de aprobado. Quien pasa tiene que
         poder seguir, así que el botón real dice "Continuar". */
      slide.querySelectorAll('[data-mj-retry]').forEach(function (b) {
        b.textContent = gano ? 'Continuar' : 'Reintentar';
        b.setAttribute('data-mj-accion', gano ? 'continuar' : 'reintentar');
        b.setAttribute('aria-label', gano
          ? 'Continuar con el curso'
          : 'Reintentar el mini juego');
      });
      var dicho = gano
        ? '¡Terminaste el mini juego con éxito! Encontraste las ' + MJ_TOTAL + ' cosas que estaban mal, con ' + puntosDelIntento() + ' puntos. Ya podés identificar lo que no se debe hacer en el área de trabajo.'
        : '¡Ups! Estuviste cerca. Encontraste ' + hallados + ' de ' + MJ_TOTAL + ', con ' + puntosDelIntento() + ' puntos. Tocá "Reintentar" para intentarlo de nuevo.';
      if (finSay) finSay.textContent = dicho;
      setTimeout(function () {
        pendienteFin = { gano: gano, dicho: dicho };
        mostrarRepaso(gano);
      }, 700);
    }

    /* ================= Repaso del minijuego (entre terminar y ver el
       resultado) — pedido explícito, mejor devolución/aprendizaje.
       Al ganar: las MJ_TOTAL correctas, con su explicación completa —
       sin riesgo de "espoilear" nada, ya las encontró todas.
       Al perder: SOLO lo que el alumno eligió en ESTA partida (`mj.orden`,
       en el orden real en que clickeó), aciertos y errores propios —
       nunca la lista completa de correctas, para no arruinarle el
       reintento mostrándole de arranque qué le falta. */
    var pendienteFin = null;
    function mostrarRepaso(gano) {
      if (!repasoListEl) { irA('mj-fin'); return; }
      repasoListEl.innerHTML = '';
      var items;
      if (gano) {
        if (repasoTitleEl) repasoTitleEl.textContent = '¡Encontraste las ' + MJ_TOTAL + '!';
        if (repasoSubEl) repasoSubEl.textContent = 'Antes de ver tu resultado final, repasemos qué estaba mal en la imagen y por qué.';
        items = MJ_OPCIONES.filter(function (o) { return o.ok; })
          .map(function (o) { return { id: o.id, ok: true, txt: o.txt }; });
      } else {
        if (repasoTitleEl) repasoTitleEl.textContent = 'Repasemos tu partida';
        if (repasoSubEl) repasoSubEl.textContent = 'Esto es lo que elegiste esta vez. Las que todavía no encontraste te esperan en el reintento.';
        items = mj.orden.map(function (a) {
          var o = MJ_OPCIONES.filter(function (x) { return x.id === a.id; })[0];
          return { id: a.id, ok: a.ok, txt: o ? o.txt : a.id };
        });
      }
      items.forEach(function (it) {
        var li = document.createElement('li');
        li.className = 'd-mj-repaso-item ' + (it.ok ? 'is-ok' : 'is-bad');
        var ic = document.createElement('span');
        ic.className = 'd-mj-repaso-ic'; ic.setAttribute('aria-hidden', 'true');
        ic.textContent = it.ok ? '✓' : '✕';
        var txt = document.createElement('div');
        txt.className = 'd-mj-repaso-txt';
        var b = document.createElement('b'); b.textContent = it.txt;
        var p = document.createElement('p'); p.textContent = MJ_FB[it.id] || '';
        txt.appendChild(b); txt.appendChild(p);
        li.appendChild(ic); li.appendChild(txt);
        repasoListEl.appendChild(li);
      });
      if (window.motor) motor.showPopup('mj-repaso');
      if (repasoTitleEl && repasoSubEl) {
        speakPaso(repasoTitleEl.textContent + '. ' + repasoSubEl.textContent);
      }
    }

    armarGrid();
    hud();
    slide.querySelectorAll('[data-mj-start]').forEach(function (b) {
      b.addEventListener('click', empezar);
    });
    /* El botón del panel final es UNO solo con dos comportamientos: el
       arte del PDF dibuja "Reintentar" en las dos versiones, así que
       el texto lo pone el HTML (ver `.d-mj-fin-cta`) y acá se decide
       qué hace. Aprobado → sigue al contenido siguiente; no aprobado
       → vuelve a empezar la partida. */
    slide.querySelectorAll('[data-mj-retry]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.getAttribute('data-mj-accion') === 'continuar') {
          if (window.motor) motor._advance(1);
          return;
        }
        empezar();
      });
    });
    /* El repaso es un pop-up real (CLAUDE.md, arriba): "Ver resultado"
       lleva `data-popup-close`, así que el motor ya lo cierra solo
       (junto con ✕/Esc/fondo — las 3 vías de siempre, §6.10.2). Acá
       solo falta reaccionar al cierre, sea cual sea la vía, con la
       misma lógica diferida de siempre (pasar a la capa "fin",
       narrar el resultado, confeti si ganó). */
    document.addEventListener('popupclose', function (e) {
      if (!e.detail || e.detail.id !== 'mj-repaso' || !pendienteFin) return;
      irA('mj-fin');
      speakPaso(pendienteFin.dicho);
      if (pendienteFin.gano && window.confetti) confetti();
      if (window.motor) motor._syncNav();
      pendienteFin = null;
    });

    /* BUG conocido del molde (CLAUDE.md §6.37 punto 2): el motor no
       recarga la diapositiva al navegar, así que quien sale a mitad de
       partida y vuelve encontraría la capa "jugar"/"fin" tal cual la
       dejó, sin ningún botón visible para arrancar de nuevo. Al SALIR
       de la diapositiva se resetea a la portada del juego. */
    document.addEventListener('slidechange', function (e) {
      if (e.detail.id !== 'minijuego') { mj.activo = false; limpiarPista(); irA('mj-intro'); }
    });
  }

  /* ================= LOGROS POR UNIDAD ================= */
  function todasLasVariantes(id, total) {
    return estado.swaps[id] && Object.keys(estado.swaps[id]).length >= total;
  }
  function revisarLogros() {
    if (GRUPOS_POPUP.peligros.every(function (p) { return estado.peligros[p]; }) &&
        estado.alteracion && todasLasVariantes('contaminan', 4)) unlockBadge('riesgo');
    if (todasLasVariantes('malas', 5) && todasLasVariantes('buenas', 4) &&
        GRUPOS_POPUP.limpieza.every(function (p) { return estado.peligros[p]; }) &&
        estado.video) unlockBadge('higiene');
    if (todasLasVariantes('rotacion', 4)) unlockBadge('frio');
  }

  /* ================= GATE DE AVANCE (CLAUDE.md §6.10) ================= */
  function faltanPopups(slideEl) {
    var req = (slideEl.getAttribute('data-require-popups') || '').split(/\s+/).filter(Boolean);
    return req.filter(function (id) { return !estado.peligros[id]; });
  }
  function faltanSwap(slideEl) {
    var id = slideEl.getAttribute('data-require-swap');
    if (!id || !Swaps[id]) return 0;
    var vistos = estado.swaps[id] ? Object.keys(estado.swaps[id]).length : 0;
    return Math.max(0, Swaps[id].total - vistos);
  }
  /* Un gate sobre un recurso que todavía no existe tiene que DEGRADAR,
     no trabar (CLAUDE.md §6.24): mientras el .mp4 sea un placeholder de
     0 bytes, el video no se puede reproducir y exigirlo dejaría el
     curso imposible de terminar. Empieza a exigir solo cuando el
     archivo real esté en su lugar, sin tocar código. */
  function faltaVideo(slideEl) {
    var src = slideEl.getAttribute('data-require-seen');
    if (!src || estado.video) return false;
    var v = slideEl.querySelector('video');
    if (v && window.videoUsable && !videoUsable(v)) return false;
    return true;
  }

  function nudge(el) {
    if (!el) return;
    el.classList.remove('d-nudge');
    void el.offsetWidth;
    el.classList.add('d-nudge');
  }

  /* ================= Entrada animada en las diapos genéricas =================
     Pedido del cliente: introducción/objetivos/índice/consejos son la
     misma captura plana en cualquier curso — sin piezas sueltas que
     escalonar (staggerReveal, kit, es solo para HTML real, nunca para
     una diapositiva-captura — ver su propio comentario en coto-ui.js).
     Fade+rise de la imagen entera, disparado a mano en cada
     `slidechange` (si no, la animación CSS solo correría una vez, al
     cargar la página, no cada vez que se vuelve a la diapo). */
  var GENERIC_ENTER_SLIDES = { introduccion: true, objetivos: true, indice: true, consejos: true };
  function initGenericEnter() {
    document.addEventListener('slidechange', function (e) {
      if (!GENERIC_ENTER_SLIDES[e.detail.id]) return;
      var img = document.querySelector('[data-slide="' + e.detail.id + '"] .d-shot-img');
      if (!img) return;
      img.classList.remove('d-generic-enter');
      void img.offsetWidth;
      img.classList.add('d-generic-enter');
    });
  }

  function initGates() {
    motor.canAdvance = function (slideEl) {
      if (!slideEl) return true;
      if (faltanPopups(slideEl).length) return false;
      if (faltanSwap(slideEl)) return false;
      if (slideEl.getAttribute('data-require-hotspot') && !estado.alteracion) return false;
      if (faltaVideo(slideEl)) return false;
      if (slideEl.getAttribute('data-slide') === 'minijuego' && !estado.juegoAprobado) return false;
      return true;
    };

    /* Negar el avance sin decir DÓNDE falta es una trampa: el handler
       tiene que terminar SIEMPRE marcando lo pendiente (§6.10 regla 2). */
    document.addEventListener('advanceblocked', function (e) {
      var id = e.detail && e.detail.id;
      var slideEl = id ? document.querySelector('[data-slide="' + id + '"]') : motor.current();
      if (!slideEl) return;

      var faltan = faltanPopups(slideEl);
      if (faltan.length) {
        if (Player) Player.toast('Te falta abrir ' + faltan.length + (faltan.length === 1 ? ' ficha' : ' fichas'));
        faltan.forEach(function (p) { nudge(slideEl.querySelector('[data-peligro-trigger="' + p + '"]')); });
        return;
      }

      if (slideEl.getAttribute('data-require-hotspot') && !estado.alteracion) {
        if (Player) Player.toast('Pasá el mouse (o tocá) la carne para ver la alteración');
        nudge(slideEl.querySelector('[data-carne]'));
        return;
      }

      var restan = faltanSwap(slideEl);
      if (restan) {
        var g = slideEl.getAttribute('data-require-swap');
        var lbl = SWAP_LBL[g] || ['paso', 'pasos'];
        if (Player) Player.toast('Te ' + (restan === 1 ? 'falta 1 ' + lbl[0] : 'faltan ' + restan + ' ' + lbl[1]) + ' por ver');
        slideEl.querySelectorAll('[data-shot-swap-step],[data-shot-swap-go]').forEach(function (b) {
          if (!b.hidden) nudge(b);
        });
        return;
      }

      if (faltaVideo(slideEl)) {
        if (Player) Player.toast('Mirá el video para poder seguir');
        nudge(slideEl.querySelector('[data-inline-video]'));
        return;
      }

      if (slideEl.getAttribute('data-slide') === 'minijuego') {
        if (Player) Player.toast('Encontrá al menos ' + MJ_APROBAR + ' de ' + MJ_TOTAL + ' para seguir');
        nudge(slideEl.querySelector('[data-mj-start]:not([hidden])') || slideEl.querySelector('[data-mj-grid]'));
      }
    });
  }

  /* ================= ÍNDICE LATERAL =================
     El menú lateral nunca deja saltar a una diapositiva no vista
     (CLAUDE.md §7.3 punto 3): además del tilde `.is-done`, el link
     tiene que quedar `disabled`, o los gates no valen nada. */
  function marcarVistas() {
    var items = document.querySelectorAll('.d-sidenav-item[data-goto]');
    var vistas = 0;
    items.forEach(function (a) {
      var visto = !!estado.vistas[a.getAttribute('data-goto')];
      if (visto) vistas++;
      a.classList.toggle('is-done', visto);
      a.disabled = !visto;
    });
    var p = document.getElementById('d-sidenav-progress');
    if (p) p.textContent = 'Viste ' + vistas + ' de ' + items.length + ' secciones';
    marcarObjetivos();
  }

  /* Progreso por objetivo (propuesta de UX, no del PDF): las 26
     diapositivas dicen cuánto navegaste, no cuánto de los 3 objetivos
     de aprendizaje ("Objetivos de aprendizaje", A/B/C) ya cubriste.
     Cada objetivo mapea 1:1 con una unidad (A=riesgo, B=manipulación e
     higiene, C=conservación y control, mismo orden que la diapositiva
     "objetivos") — se da por cubierto cuando el alumno llega al resumen
     de esa unidad, el mismo checkpoint que ya usa el resto del curso. */
  var OBJ_CHECK = { A: 'resumen1', B: 'resumen2', C: 'resumen3' };
  function marcarObjetivos() {
    var n = 0;
    Object.keys(OBJ_CHECK).forEach(function (k) {
      var done = !!estado.vistas[OBJ_CHECK[k]];
      if (done) n++;
      var pip = document.querySelector('[data-obj-pip="' + k + '"]');
      if (pip) pip.classList.toggle('is-done', done);
    });
    var lbl = document.querySelector('[data-obj-lbl]');
    if (lbl) lbl.textContent = n + ' de 3 objetivos cubiertos';
  }

  /* ================= BOOT ================= */
  function boot() {
    var refrescarGlosario = null; // asignada más abajo, tras initGlossaryUnlock()
    if (window.SCORM) SCORM.init();
    /* xapi.js no tiene init(): se configura solo desde
       `window.XAPI_CONFIG` si el cliente lo define, y si no queda
       registrando statements en memoria. Solo se le habla al terminar
       (XAPI.completed), igual que el curso de referencia. */
    restaurar();

    window.motor = new Motor();
    /* BUG REAL encontrado en revisión: `motor.maxVisited` nunca se
       inicializaba antes de este punto. `new Motor()` ya dispara un
       `slidechange` sincrónico para la diapositiva 0 (dentro de
       `_init()`), así que el listener de acá abajo se lo pierde —  eso
       solo importaría poco, pero además `Math.max(undefined, n)` da
       `NaN`, y una vez `NaN` la propiedad queda envenenada para
       siempre (`Math.max(NaN, cualquier_cosa)` es SIEMPRE `NaN`). El
       síntoma real: `initProgressSeek()` (kit, coto-player.js) usa
       `visitedIndexes()` para calcular hasta dónde se puede ARRASTRAR
       la barra hacia adelante — con `maxVisited` en `NaN`, el `for (i
       = 0; i <= NaN; i++)` nunca corre ni una vez, así que
       `visitedIndexes()` devolvía `[]` siempre y el tope quedaba
       pegado a la diapositiva ACTUAL. Resultado: arrastrar hacia atrás
       funcionaba (nunca depende de `maxVisited`), pero hacia adelante
       nunca — ni siquiera a una diapositiva ya vista minutos antes.

       SEGUNDO BUG REAL, mismo síntoma, encontrado después ("recién
       estaba intentando adelantar... y no me deja, pero yo ya había
       visto las diapos siguientes"): el fix de arriba solo cubre la
       sesión EN CURSO — `motor.maxVisited = motor.index` arranca
       siempre en 0 (o donde caiga `new Motor()`), sin mirar
       `estado.vistas`, que `restaurar()` YA repobló un par de líneas
       más arriba con el progreso de sesiones ANTERIORES (el mismo
       dato que sí restaura bien puntos/logros/badges). Quien vuelve a
       abrir el curso sin tocar el banner "Retomá donde dejaste"
       (que es opt-in, CLAUDE.md §6.10 — nunca salta solo) se queda
       con `index` en 0 pero `estado.vistas` con, por ejemplo, las
       primeras 8 diapositivas marcadas — y la barra, mirando solo
       `motor.index`, cree que el techo real es 0. Fix: calcular el
       máximo real recorriendo `estado.vistas` (ya restaurado) contra
       `data-slide-index` de cada diapositiva, no asumir que arrancar
       la sesión implica arrancar el progreso.

       Los dos bugs de arriba pasaron a ser responsabilidad del KIT
       (kit-base v1.9.39, `Motor.prototype.restoreMaxVisited`) — este
       curso es la primera prueba real end-to-end de esa función: una
       sola llamada reemplaza el loop a mano Y el `Math.max` en cada
       `slidechange` de más abajo, sin que este archivo tenga que
       volver a acordarse de `maxVisited` nunca más. */
    motor.restoreMaxVisited(estado.vistas);

    document.addEventListener('slidechange', function (e) {
      estado.vistas[e.detail.id] = true;
      if (window.SCORM) SCORM.setLocation(e.detail.id);
      marcarVistas();
      if (refrescarGlosario) refrescarGlosario();
      persistir();
      speakSlide(motor.current());
    });

    /* Cierre de tracking con el LMS. `setProgressScore` reporta la nota
       como dato INFORMATIVO sin tocar `lesson_status`: este curso no es
       la evaluación (el cuestionario es aparte, en la plataforma), así
       que llamar a setScore() marcaría passed/failed sin corresponder
       (CLAUDE.md §6.24). */
    document.addEventListener('courseend', function () {
      if (!window.SCORM) return;
      SCORM.setProgressScore(estado.puntos / PUNTOS_MAX * 100);
      SCORM.markCompleted();
    });
    document.addEventListener('courseexit', function () {
      if (window.SCORM) SCORM.finish();
    });

    Player = initPlayer({
      speakSlide: speakSlide,
      visitedIndexes: function () {
        var out = [];
        for (var i = 0; i <= motor.maxVisited; i++) out.push(i);
        return out;
      }
    });

    /* `mj-repaso` narra a mano desde `mostrarRepaso()` (título+
       subtítulo, mismo texto de siempre) — la lista de hallazgos usa
       `<li>` con `<b>`+`<p>` adentro, y `TEXT_SEL` (narrador.js)
       matchea `li` Y `p` a la vez: la narración automática los leería
       duplicados y con el título pegado a la descripción (CLAUDE.md
       §6.54). Se excluye acá, no en el kit — el resto de los pop-ups
       del curso sigue narrando automático como siempre. */
    initPopupNarration({ skip: ['video-player', 'mj-repaso'] });
    initPopupStagger();
    initPrefetchNeighbors();
    initTiempoActivo();
    initSummaryPrint();
    initGlossarySearch();
    refrescarGlosario = initGlossaryUnlock({
      seen: function (id) { return !!estado.vistas[id]; },
      onUnlock: function (labels) {
        if (!Player) return;
        Player.toast('🔓 ' + (labels.length === 1
          ? 'Desbloqueaste "' + labels[0] + '"'
          : 'Desbloqueaste ' + labels.length + ' términos') + ' del glosario');
      }
    });
    initBgVideos();
    initGenericEnter();

    initInlineCircleVideos({
      seen: function () { return estado.video; },
      markSeen: function () { estado.video = true; },
      onFirstPlay: function () {
        award(PUNTOS.video, 'Video visto');
        revisarLogros();
        persistir();
        if (window.motor) motor._syncNav();
      },
      afterPlay: function () { if (window.motor) motor._syncNav(); }
    });

    initPopupsDeContenido();
    initSwaps();
    initInocuidadTip();
    initSeguridadIntro();
    initTemperaturaIntro();
    initEnvasadoTip();
    initPrediccionProceso();
    initRepasoRapido();
    marcarRiesgoVisto();
    document.addEventListener('slidechange', function (e) {
      if (e.detail.id === 'riesgo') marcarRiesgoVisto();
    });
    initAlteracion();
    initMinijuego();
    initGates();

    Cierre = initCierreCelebration({
      statIds: ['d-cert-score', 'd-cert-points', 'd-cert-badges', 'd-cert-videos'],
      ctaLabel: 'Ver mi resumen',
      salirLabel: 'Salir del curso',
      onFinish: function () {
        unlockBadge('curso');
        fillCertStats();
        pintarMedalla(estado.puntos, NIVELES);
        if (window.XAPI) XAPI.completed(COURSE_SLUG, COURSE_NAME);
        if (window.SCORM) SCORM.markCompleted();
        persistir();
      },
      stagger: function (el) { if (window.staggerReveal) staggerReveal(null, el); }
    });

    document.addEventListener('slidechange', function (e) {
      if (e.detail.id === 'cierre') Cierre.unlockCierre();
    });

    updateHud();
    renderBadges();
    marcarVistas();
    speakSlide(motor.current());
  }

  function fillCertStats() {
    /* Contrato del kit (coto-cierre.js): 4 IDs fijos, en ESTE orden —
       son los que initCierreCelebration anima con el count-up. Se
       recalculan DESPUÉS de otorgar el último logro, si no el resumen
       muestra "4/5" en la pantalla que justamente entrega el 5º. */
    var score = document.getElementById('d-cert-score');
    var points = document.getElementById('d-cert-points');
    var badges = document.getElementById('d-cert-badges');
    var inter = document.getElementById('d-cert-videos');
    var hechas = Object.keys(estado.peligros).length +
      (estado.alteracion ? 1 : 0) + (estado.video ? 1 : 0) +
      Object.keys(estado.swaps).reduce(function (n, g) { return n + Object.keys(estado.swaps[g]).length; }, 0);
    var TOTAL_INTER = 5 + 1 + 1 + 17;   // 5 fichas + carne + video + 4+5+4+4 variantes
    if (score) score.textContent = estado.juegoHallazgos + '/' + MJ_TOTAL;
    if (points) points.textContent = String(estado.puntos);
    if (badges) badges.textContent = Object.keys(estado.badges).length + '/' + BADGES.length;
    if (inter) inter.textContent = hechas + '/' + TOTAL_INTER;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
