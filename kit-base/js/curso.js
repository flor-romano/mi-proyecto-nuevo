/* ============================================================
   curso.js · PLANTILLA DE ARRANQUE (kit-base v1.9.40)
   ------------------------------------------------------------
   Este archivo es el ÚNICO que escribe cada curso — todo lo demás
   (motor, narrador, UI, media, hotspots, quiz, cierre) vive en los
   módulos genéricos del kit y NO SE TOCA (ver CLAUDE.md §1: "¿esto lee
   algo del curso?" — si la respuesta es sí, va acá; si es no, va en el
   archivo genérico correspondiente, nunca acá).

   Punto de partida documentado en README.md ("Con v1.7, un curso.js
   nuevo arranca así") — reemplazar cada bloque con el contenido real
   del curso siguiendo el checklist de CLAUDE.md §7:
     1. PDF → render de cada página
     2. Decidir, diapositiva por diapositiva: captura íntegra
        (.d-shot-slide) vs. piezas HTML reales (texto vivo + arte suelto)
     3. Armar el HTML (index.html) sobre esa decisión
     4. Medir hitboxes en píxeles contra el render (nunca a ojo)
     5. Escribir ESTE archivo: vocabulario propio para la locución,
        banco de datos del curso (quiz/minijuego si aplica), cableado
        de los módulos del kit con los datos/callbacks de este curso
     6. CSS propio del curso en diapositivas.css (nunca en los .css
        del kit) + assets.css si hace falta
     7. imsmanifest.xml con la lista real de archivos
     8. Antes de entregar: correr tools/tests/*.mjs (los 7, exit 0 en
        todos) y tools/verify-hitboxes.mjs para inspección visual
   ============================================================ */
(function () {
  'use strict';

  var COURSE_SLUG = 'nombre-del-curso';
  var COURSE_NAME = 'Nombre del curso';

  /* ---------- Vocabulario propio para la locución ----------
     El diccionario base del kit ya trae la tabla oficial del Manual de
     Contenido (PLU, ticket, online...). Acá solo lo específico de ESTE
     curso — siglas, nombres propios, números que se leen distinto. */
  if (window.Narrador && Narrador.addFixes) {
    Narrador.addFixes([
      // ['SIGLA', 'cómo se lee'],
    ]);
  }

  /* ---------- Estado propio del curso (si aplica) ----------
     Ej.: banco de preguntas del quiz, situaciones del minijuego, qué
     fichas se abrieron — solo si el curso tiene ese contenido.
     Los PUNTOS y los LOGROS ya NO van acá: los maneja `initLogros()`
     (coto-logros.js), más abajo. */
  var estado = { vistas: {} };

  /* ---------- Catálogo de logros (CONTENIDO del curso) ----------
     La única parte de los logros que es propia de cada curso: cuáles
     hay y cómo se llaman. Todo el resto (puntaje, HUD, tarjetas,
     toast, sonido, moneda, xAPI) lo hace `initLogros()` — kit-base
     v1.9.60, §7.08.
       id    · clave corta y estable: viaja en suspend_data (4096
               caracteres contados en SCORM 1.2), así que 'explorador',
               no 'el-alumno-abrio-todas-las-fichas'.
       ic    · emoji de la tarjeta obtenida (bloqueada muestra 🔒).
       txt   · qué logró, en pasado, una vez obtenido.
       pista · qué hay que hacer, mientras sigue bloqueado. */
  var BADGES = [
    // { id: 'explorador', nom: 'Explorador', ic: '🔎',
    //   txt: 'Abriste todas las fichas del curso.',
    //   pista: 'Abrí todas las fichas para desbloquearlo.' },
  ];
  var Logros = null;   // lo crea boot(), cuando el DOM ya existe

  /* Puntos y logros viajan en las claves `p` y `b` — las MISMAS que ya
     usaban los cursos anteriores, así un curso que migre a este módulo
     sigue leyendo el suspend_data que ya tenía guardado. El curso suma
     sus propias claves al lado; `serialize()`/`restore()` son los dos
     únicos puntos de contacto (no escribir `p`/`b` a mano acá). */
  function persistir() {
    if (!window.SCORM || !Logros) return;
    SCORM.saveState(Object.assign({
      vs: Object.keys(estado.vistas)
    }, Logros.serialize()));
  }
  function restaurar() {
    if (!window.SCORM) return;
    var s = SCORM.loadState();
    if (!s) return;
    (s.vs || []).forEach(function (id) { estado.vistas[id] = true; });
    if (Logros) Logros.restore(s);
  }

  /* ---------- Arranque ---------- */
  function boot() {
    if (window.SCORM) SCORM.init();

    /* ---------- Tracking mínimo del LMS — NO comentar ni borrar ----------
       kit-base v1.9.52. Estas dos líneas son EXACTAMENTE lo que
       `tools/tests/scorm-tracking.mjs` le exige a cualquier curso, y
       hasta esta versión la plantilla no las traía: un curso arrancado
       desde acá fallaba ese test recién salido del molde, y si nadie lo
       corría (el test ni siquiera entraba a la suite hasta v1.9.39 —
       §6.60) se reproducía el PEOR bug que tuvo este kit: §6.24, el
       alumno termina el curso entero y en el LMS queda "incomplete"
       para siempre. O sea: el curso no sirve para lo que el cliente
       paga, y nada en pantalla lo delata.

       · `courseend` lo emite el motor al llegar a la diapositiva
         `[data-slide-end]`. El motor NO habla con el LMS a propósito
         (spec-motor-slides.md §4): solo avisa, y alguien tiene que
         escucharlo. Ese alguien es este archivo.
       · `setLocation` en cada `slidechange` es lo que después lee
         `initResume()` (el banner "retomá donde dejaste", coto-player.js)
         al reabrir el curso: sin esto `getLocation()` vuelve siempre
         vacío y el banner no aparece nunca, por más marcado que tenga.

       Se registran ANTES de `new Motor(document)` a propósito: el
       constructor del motor emite su primer `slidechange` adentro (el
       `go()` del final de `_init()`), así que un listener registrado
       después se pierde esa primera diapositiva.

       Si el curso ya lleva su propio `slidechange` (para `estado.vistas`,
       glosario, puntos), se puede mover `setLocation` ahí adentro — lo
       que NO se puede es sacarlo. */
    document.addEventListener('slidechange', function (e) {
      if (window.SCORM) SCORM.setLocation(e.detail.id);
    });
    document.addEventListener('courseend', function () {
      if (window.SCORM) SCORM.markCompleted();
    });

    window.motor = new Motor(document);

    /* Puntos y logros (coto-logros.js, kit-base v1.9.60). Va DESPUÉS
       del motor y ANTES de `restaurar()`: `initLogros()` pinta el HUD
       en 0/N al crearse, y `restaurar()` lo repinta con lo guardado.
       `onChange` se dispara en cada `award()`/`unlock()`, así el
       progreso se guarda solo — antes cada curso tenía que acordarse
       de llamar a `persistir()` después de cada suma, y olvidárselo en
       UN lugar significa que el alumno pierde esos puntos al reabrir. */
    Logros = initLogros({ badges: BADGES, onChange: persistir });
    restaurar();

    /* `initPlayer()` además publica `window.Player` (kit-base v1.9.62),
       así que esta variable local es una comodidad para escribir
       `Player.toast(...)` acá adentro, no la única forma de llegarle.
       Importa porque los módulos del kit que avisan cosas —
       `coto-logros.js` y sus toasts de "+N ·" y "🏆 Logro:"— lo buscan
       en `window`: cuando solo existía esta variable local del IIFE,
       esos avisos no salían nunca y sin un solo error en consola. */
    var Player = initPlayer({
      speakSlide: function (s) { Narrador.speak(Narrador.textOf(s), 'slide'); },
      visitedIndexes: function () { return []; /* índices ya vistos, para la barra */ }
    });

    initPopupNarration();
    initPopupStagger();
    initStatPopups();
    initPrefetchNeighbors();
    initSummaryPrint();
    initTiempoActivo();    // reloj del resumen: descuenta lo que dura mirar video (§6.10.4)
    initVideoSafetyNet();  // pausa cualquier <video> que quede sonando fuera de su diapo/pop-up/capa —
                            // seguro llamarlo siempre, no hace nada si no hay <video> en el DOM (§6.59)

    /* Gates de contenido (kit-base v1.9.63, §7.11). Los dos tienen el
       mismo contrato `faltan(slideEl)`; el curso solo decide la regla
       en `canAdvance`. Descomentar lo que use este curso:
         · `data-require-popups="id1 id2"` en la diapositiva → hay que
           abrir esas fichas antes de avanzar.
         · `data-require-seen="video/a.mp4"` → hay que mirar el video,
           y `initVideoGate` exime solo el que no se pueda reproducir
           (placeholder de 0 bytes), así el curso nunca queda trabado.
       `initGateHints` es lo que hace que el gate no sea mudo: al
       intentar avanzar, "Siguiente" tiembla, pulsa lo que falta tocar
       y un toast dice cuántos quedan. */
    // var popupGate = initPopupGate({ onChange: persistir });
    // var videoGate = initVideoGate({});
    // motor.canAdvance = function (slideEl) {
    //   return popupGate.faltan(slideEl).length === 0 &&
    //          videoGate.faltan(slideEl).length === 0;
    // };
    // initGateHints({ gates: [
    //   { gate: popupGate, sel: function (id) { return '[data-popup-trigger="' + id + '"]'; },
    //     uno: 'tarjeta', varias: 'tarjetas' },
    //   { gate: videoGate, sel: function (src) { return '[data-video="' + src + '"]'; },
    //     uno: 'video', varias: 'videos' }
    // ] });

    /* Repaso rápido (coto-repaso.css + coto-ui.js, kit-base v1.9.64):
       2 preguntas V/F por unidad, una por vez, sin nota ni gate — es
       refuerzo, no evaluación. El marcado va en index.html (contrato
       en el encabezado de coto-repaso.css); acá solo el estado. */
    // initRepasoRapido({
    //   seen: function (id) { return !!estado.repaso[id]; },
    //   markSeen: function (id) { estado.repaso[id] = true; persistir(); },
    //   onCorrect: function () { Logros.award(5, 'Repaso'); }
    // });

    /* ⚠️ Los DOS de acá abajo DEVUELVEN una función `refresh` y hay que
       GUARDARLA (kit-base v1.9.72, §7.18 K5). Corren una vez al crearse
       y después no se enteran de nada: si no los volvés a llamar cuando
       el progreso cambia, se quedan congelados en el estado del arranque
       — el glosario con todos los términos bajo candado para siempre, y
       el índice sin habilitar nunca lo ya visitado. Sin ningún error:
       un curso terminado, con la medalla de oro, y los 8 términos
       todavía bloqueados. Pasó de verdad.
       Por eso van con `var` y con la llamada de refresco a la vista. */

    // Índice ☰: secciones no visitadas quedan disabled — sin esto, el
    // menú lateral deja saltar directo al cierre sin cumplir el gate (§7.3 punto 3).
    // var refrescarIndice = initIndexJumps({ visited: function (id) { return !!estado.vistas[id]; } });

    // Glosario, si el curso lo tiene:
    // initGlossarySearch(); // filtra por texto, ignora mayúsculas/acentos
    // var refrescarGlosario = initGlossaryUnlock({
    //   seen: function (id) { return !!estado.vistas[id]; },
    //   onUnlock: function (labels) { Player.toast('🔓 Desbloqueaste ' + labels.join(', ')); }
    // });

    // …y en cada cambio de diapositiva, DESPUÉS de marcar la visita:
    // document.addEventListener('slidechange', function (e) {
    //   estado.vistas[e.detail.id] = 1;
    //   if (refrescarIndice) refrescarIndice();
    //   if (refrescarGlosario) refrescarGlosario();
    // });

    /* ============================================================
       PIEZAS DE `coto-piezas.js` y `coto-visor.js` (kit-base v1.9.77 y
       v1.9.78). Están acá para que existan a la vista: un módulo del
       kit que no aparece en esta plantilla es un módulo que el curso
       nuevo no sabe que existe, y lo termina reescribiendo a mano.
       Si escribís el marcado y te olvidás del `init`, `contrato-cableado`
       lo reporta con la consecuencia — no falla en silencio.
       ============================================================ */

    // Revelado ACUMULATIVO (el punto N aparece y los anteriores quedan):
    //   <button data-hit data-revelar="1" …><span class="sr-only">…</span></button>
    //   <div data-place data-revelado="1" hidden>…</div>
    // var Revelados = initRevelados({
    //   onRevelar: function (id, n, total) { Logros.award(5, 'Punto ' + id); }
    // });
    // …y para que sea un gate de avance, como cualquier otro del kit:
    //   motor.canAdvance = function (s) { return !Revelados.faltan(s).length; };

    // Dos juegos de carteles sobre el MISMO arte (no es initShotSwap):
    //   <div data-tandas="riesgos"><div data-tanda="1">…</div><div data-tanda="2" hidden>…</div></div>
    //   <button class="d-tanda-nav" data-tanda-nav="1">▶</button><span class="d-tanda-prog"></span>
    // initTandas({ onChange: function (id, i, total) { … } });

    // Visor de documentos: paginado, zoom, arrastre, pantalla completa
    // y descarga. Incluye el gate por "documento leído entero":
    // var Visor = initVisorDocs({ onPagina: function (id, i, leidas, total) { … } });
    //   …y el gate, con el mismo contrato que los demás:
    //   motor.canAdvance = function (s) { return !Visor.faltan(s).length; };

    // Pasar hojas del documento SIN abrir el pop-up (las flechas las
    // dibuja el arte). Tocar la hoja abre el visor en esa misma página:
    // initDocEnDiapo({ visor: Visor, hojas: { convenio: ['doc/c-1.webp', 'doc/c-2.webp'] } });

    // Panel de pasos al costado del repaso (lee el estado por
    // MutationObserver, así también refleja las flechas ‹ › y lo
    // restaurado de una sesión anterior):  <ol data-repaso-pasos></ol>
    // initPasosRepaso();

    // El "Siguiente" de la última pregunta del repaso, con todas
    // contestadas, lleva a la diapositiva siguiente:
    // initSalidaRepaso();

    // Video rectangular en pop-up, y video de una capa [data-layers]:
    // initVideoPlayer({ … });
    // initLayerVideos({ … });
    // Precarga del contenido de un pop-up antes de abrirlo:
    // initPopupPrefetch();

    // Zonas interactivas sobre el arte (hotspots), una llamada por grupo:
    // initHotspots({ zonas: '.d-shot-hit--mi-grupo', cartel: '#mi-cartel' });

    // Carrusel / tabs / pasos que cambian el src de una imagen completa:
    // initShotSwap();

    // Solo si el curso tiene video:
    // initBgVideos();
    // initPopupVideos({ onFirstPlay: function (src, popupId) { /* sumar puntos/logro */ } });
    // initInlineCircleVideos({ … });

    // Solo si el curso tiene mini-quiz/minijuego (coto-quiz.js):
    // initMiniQuiz({ bank: …, onFirstFinish: function (score) { … } });

    // Cierre (coto-cierre.js):
    // initCierreCelebration({ … });

    /* Techo de "hasta dónde llegó" para la barra arrastrable.
       NO está comentado a propósito (kit-base v1.9.71, §7.17): estuvo
       comentado hasta v1.9.70 y el resultado eran dos fallas mudas en
       todo curso generado —
       1. `motor.maxVisited` quedaba `undefined`, y el motor solo dibuja
          `.d-progress-locked` cuando es un número: la trama de "todavía
          bloqueado" no es que se viera poco, es que el elemento no
          existía en el DOM.
       2. Al reingresar, arrastrar la barra hasta una diapositiva ya
          vista EN OTRA SESIÓN no funcionaba, porque el techo se
          calculaba solo con la sesión en curso.
       `restoreMaxVisited()` tolera `undefined` (primera visita), así
       que llamarlo siempre es seguro; `estado` sale del `loadState()`
       de más arriba. */
    motor.restoreMaxVisited(estado && estado.vistas);

    if (window.SCORM) SCORM.commit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
