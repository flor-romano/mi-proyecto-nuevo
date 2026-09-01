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
     Ej.: banco de preguntas del quiz, situaciones del minijuego,
     puntaje, medallas — solo si el curso tiene ese tipo de contenido. */

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

    // Índice ☰: secciones no visitadas quedan disabled — sin esto, el
    // menú lateral deja saltar directo al cierre sin cumplir el gate (§7.3 punto 3).
    // initIndexJumps({ visited: function (id) { return !!estado.vistas[id]; } });

    // Glosario, si el curso lo tiene:
    // initGlossarySearch(); // filtra por texto, ignora mayúsculas/acentos
    // initGlossaryUnlock({
    //   seen: function (id) { return !!estado.vistas[id]; },
    //   onUnlock: function (labels) { Player.toast('🔓 Desbloqueaste ' + labels.join(', ')); }
    // });

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
    // initCertificatePrint({ courseName: COURSE_NAME }); // botón #d-cert-print, si el curso lo suma

    // Si el curso usa initProgressSeek (barra arrastrable) CON gate de
    // contenido (§6.10): después de restaurar el progreso persistido.
    // motor.restoreMaxVisited(estado.vistas);

    if (window.SCORM) SCORM.commit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
