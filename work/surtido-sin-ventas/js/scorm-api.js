/* ============================================================
   scorm-api.js  ·  Wrapper SCORM 1.2 — Área Aprendizaje (COTO)
   kit-base v1.0 · genérico, sin contenido de curso. Copiar tal cual.
   ------------------------------------------------------------
   Responsabilidad ÚNICA (según spec-motor-slides.md §4):
     - Descubrir el API del LMS (findAPI, walking parent/opener).
     - LMSInitialize / LMSGetValue / LMSSetValue / LMSCommit / LMSFinish.
     - Traducir progreso y nota de la experiencia a los elementos CMI
       de SCORM 1.2 (lesson_status, score.raw, lesson_location,
       suspend_data, session_time, exit, interactions).
   NO sabe nada de la UI ni de la gamificación: la experiencia
   (experiencia.js) le pasa datos ya calculados. Así el front se
   puede testear sin un LMS real (el wrapper degrada a no-op y
   guarda en memoria/localStorage para la vista previa suelta).

   Cambios v2.0:
   · getFirstName(): nombre de pila desde cmi.core.student_name.
   · logInteraction(): registro best-effort en cmi.interactions.
   · finish() reporta cmi.core.exit = "suspend" para que el LMS
     conserve suspend_data entre sesiones.

   Estándar: SCORM 1.2 (ADL). Mastery score = 70 (ver imsmanifest.xml).
   ============================================================ */
(function (global) {
  'use strict';

  var MASTERY = 70;               // nota mínima de aprobación (0-100)
  var FOUND = null;               // referencia al API del LMS
  var INITIALIZED = false;
  var START = Date.now();
  // Clave de respaldo local (preview sin LMS) derivada de la ruta del
  // propio paquete — así cada curso queda aislado en localStorage SIN
  // tener que tocar este archivo por curso (antes tenía el nombre de un
  // curso puntual hardcodeado: "coto-surtido-libre-suspend", chocaba con
  // cualquier otro curso abierto en el mismo navegador/origen).
  var LS_KEY = 'coto-lms-suspend-' + (global.location.pathname || 'default').replace(/[^a-z0-9]+/gi, '-');

  /* ---- Descubrimiento del API (algoritmo estándar SCORM 1.2) ---- */
  function scanWindow(win) {
    var tries = 0;
    while (win && win.API == null && win.parent && win.parent !== win && tries < 12) {
      tries++;
      win = win.parent;
    }
    return win ? win.API : null;
  }
  function findAPI() {
    var api = null;
    try { api = scanWindow(global); } catch (e) {}
    if (!api && global.opener) {
      try { api = scanWindow(global.opener); } catch (e) {}
    }
    return api;
  }

  /* ---- Helpers de bajo nivel ---- */
  function raw(fn) {
    if (!FOUND || typeof FOUND[fn] !== 'function') return '';
    try { return FOUND[fn].apply(FOUND, Array.prototype.slice.call(arguments, 1)); }
    catch (e) { return ''; }
  }
  function get(el) {
    if (!INITIALIZED) return readLocal(el);
    var v = raw('LMSGetValue', el);
    return (v == null) ? '' : String(v);
  }
  function set(el, val) {
    if (!INITIALIZED) { writeLocal(el, val); return false; }
    raw('LMSSetValue', el, String(val));
    return true;
  }
  function commit() {
    if (!INITIALIZED) return false;
    raw('LMSCommit', '');
    return true;
  }

  /* ---- Respaldo local (solo cuando no hay LMS: vista previa) ---- */
  function localBag() {
    try { return JSON.parse(global.localStorage.getItem(LS_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function readLocal(el) {
    var bag = localBag();
    return bag[el] != null ? String(bag[el]) : '';
  }
  function writeLocal(el, val) {
    try {
      var bag = localBag();
      bag[el] = String(val);
      global.localStorage.setItem(LS_KEY, JSON.stringify(bag));
    } catch (e) {}
  }

  /* ---- Tiempo de sesión → formato CMITimespan HH:MM:SS ---- */
  function sessionTime() {
    var s = Math.max(0, Math.floor((Date.now() - START) / 1000));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(h) + ':' + p(m) + ':' + p(sec);
  }
  function clockTime() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  /* ============================================================
     API PÚBLICA — lo único que consume experiencia.js
     ============================================================ */
  var SCORM = {
    masteryScore: MASTERY,
    connected: false,

    /* Inicializa la comunicación con el LMS (o entra en modo preview). */
    init: function () {
      FOUND = findAPI();
      if (FOUND) {
        var ok = raw('LMSInitialize', '');
        INITIALIZED = (ok === 'true' || ok === true);
      }
      this.connected = INITIALIZED;

      // Al entrar: si estaba "not attempted", pasa a "incomplete".
      var status = get('cmi.core.lesson_status');
      if (!status || status === 'not attempted' || status === 'unknown') {
        set('cmi.core.lesson_status', 'incomplete');
      }
      // Rango de la nota (fijo, para que el LMS muestre X/100).
      set('cmi.core.score.min', '0');
      set('cmi.core.score.max', '100');
      commit();
      return this.connected;
    },

    /* Nombre de pila del alumno según el LMS.
       SCORM 1.2 entrega cmi.core.student_name como "Apellido, Nombre".
       Devuelve '' si no hay LMS o el dato no está disponible. */
    getFirstName: function () {
      var full = get('cmi.core.student_name');
      if (!full) return '';
      var parts = full.split(',');
      var first = (parts.length > 1 ? parts[1] : parts[0]).trim().split(/\s+/)[0] || '';
      if (!first) return '';
      return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
    },
    getFullName: function () { return get('cmi.core.student_name') || ''; },

    /* Fuerza un LMSCommit ahora mismo.
       BUG REAL (kit-base v1.9.52): la plantilla `js/curso.js` cerraba su
       `boot()` con `SCORM.commit()` desde que existe — pero `commit()`
       era una función PRIVADA de este módulo, nunca expuesta en la API
       pública. O sea: `window.SCORM.commit` era `undefined` y todo curso
       nuevo arrancado desde la plantilla se comía un
       `TypeError: SCORM.commit is not a function` en la última línea de
       `boot()`, justo después de cablear TODO el curso. Como el error
       cae al final, la pantalla se ve bien y el bug pasa desapercibido
       hasta que alguien mira la consola — pero cualquier `initX()` que
       se agregue DESPUÉS de esa línea no llega a correr nunca.
       Se expone (en vez de sacar la llamada de la plantilla) porque
       "guardá lo pendiente AHORA" es una operación legítima que un
       curso puede necesitar: `saveState`/`setScore`/`markCompleted` ya
       committean solos, pero un curso que solo tocó `setLocation()`
       (que a propósito NO committea, se llama en cada `slidechange`)
       no tenía forma de forzar el flush antes de un momento crítico. */
    commit: function () { return commit(); },

    /* Guarda la ubicación actual (sección visible) para "reanudar". */
    setLocation: function (id) {
      if (id == null) return;
      set('cmi.core.lesson_location', String(id).slice(0, 255));
    },
    getLocation: function () { return get('cmi.core.lesson_location'); },

    /* Persiste el estado de la experiencia (secciones, puntos, logros).
       Objeto → JSON acotado a 4096 chars (límite CMI de SCORM 1.2). */
    /* IMPORTANTE — por qué esto NO corta el string a 4096 y ya:
       cortar un JSON por la mitad produce texto inválido, y como
       loadState() hace JSON.parse dentro de un try/catch que devuelve
       null, el resultado es que el alumno pierde TODO el progreso en
       silencio (no una parte: todo). Bug real verificado en
       "Prevención cardiovascular": guardar un estado de >4096 chars y
       volver a leerlo devuelve null.
       Si el estado no entra, es mejor conservar el último estado válido
       que ya está guardado en el LMS y avisar por consola, así el
       problema se ve en QA en vez de aparecer como "se me borró todo"
       en producción. Si un curso llega a este límite, la solución es
       achicar lo que guarda (IDs cortos, flags en vez de textos), no
       subir el tope: 4096 es el máximo que garantiza SCORM 1.2. */
    saveState: function (obj) {
      var data = '';
      try { data = JSON.stringify(obj); } catch (e) { data = ''; }
      if (!data) return;
      if (data.length > 4096) {
        if (global.console && console.warn) {
          console.warn('[SCORM] suspend_data ocupa ' + data.length +
            ' caracteres y el máximo de SCORM 1.2 es 4096. No se guardó este estado ' +
            '(se conserva el anterior). Hay que reducir lo que persiste el curso.');
        }
        return;
      }
      set('cmi.suspend_data', data);
      commit();
    },
    loadState: function () {
      var data = get('cmi.suspend_data');
      if (!data) return null;
      try { return JSON.parse(data); } catch (e) { return null; }
    },

    /* Registra la nota de la evaluación y decide aprobado/desaprobado.
       OJO: usar SOLO en cursos donde ESTE SCO es la evaluación real —
       marca `passed`/`failed` de forma irreversible para el alumno. Un
       curso de contenido cuya evaluación es un cuestionario aparte en
       la plataforma (el caso de "Prevención cardiovascular" y de "Uso
       de Sucursales 3 - NOA") NO debe llamar acá: reprobaría a alguien
       por un minijuego de práctica. Para esos, `setProgressScore()` +
       `markCompleted()`. */
    setScore: function (score) {
      var n = Math.max(0, Math.min(100, Math.round(score)));
      set('cmi.core.score.raw', String(n));
      set('cmi.core.lesson_status', n >= MASTERY ? 'passed' : 'failed');
      commit();
      return n >= MASTERY;
    },

    /* Registra una nota INFORMATIVA (0-100) sin tocar lesson_status.
       kit-base v1.9.9 · Para cursos de contenido: el LMS muestra cuánto
       aprovechó el alumno (puntos de gamificación, videos vistos,
       fichas abiertas) sin que eso se lea como aprobar/reprobar. El
       estado lo sigue manejando `markCompleted()`. Sin esto, la única
       forma de mandar una nota era `setScore()`, que arrastra el
       estado — por eso ningún curso mandaba nota: mandar nota costaba
       reprobar gente. */
    setProgressScore: function (score) {
      var n = Math.max(0, Math.min(100, Math.round(score)));
      set('cmi.core.score.raw', String(n));
      commit();
      return n;
    },

    /* Registra una respuesta de la evaluación en cmi.interactions
       (SCORM 1.2). Best-effort: si el LMS no soporta interactions,
       los Set fallan en silencio sin afectar el resto del tracking. */
    logInteraction: function (index, id, response, correct) {
      if (!INITIALIZED) return;
      var p = 'cmi.interactions.' + index + '.';
      raw('LMSSetValue', p + 'id', String(id).slice(0, 255));
      raw('LMSSetValue', p + 'type', 'choice');
      raw('LMSSetValue', p + 'student_response', String(response));
      raw('LMSSetValue', p + 'result', correct ? 'correct' : 'wrong');
      raw('LMSSetValue', p + 'time', clockTime());
    },

    /* Marca el curso como completado (sin evaluación aún). */
    markCompleted: function () {
      var st = get('cmi.core.lesson_status');
      if (st !== 'passed' && st !== 'failed') {
        set('cmi.core.lesson_status', 'completed');
        commit();
      }
    },

    /* Cierra la sesión reportando tiempo y modo de salida. Idempotente. */
    finish: function () {
      if (!INITIALIZED) return;
      set('cmi.core.session_time', sessionTime());
      set('cmi.core.exit', 'suspend'); // conservar suspend_data entre sesiones
      commit();
      raw('LMSFinish', '');
      INITIALIZED = false;
      this.connected = false;
    },

    /* Cierre DEFINITIVO, cuando el alumno termina el curso a propósito.
       La diferencia con finish() no es cosmética: `exit = "suspend"` le
       pide al LMS que guarde el punto donde quedó para retomar, y eso es
       lo correcto al cerrar la pestaña a mitad de camino. Al terminar,
       en cambio, `exit = ""` (salida normal) le dice que la sesión se
       cerró completa — si se dejara "suspend", al reabrir el curso el
       alumno volvería al bookmark en vez de arrancar limpio. */
    exitCourse: function () {
      if (!INITIALIZED) { this.exited = true; return; }
      this.markCompleted();
      set('cmi.core.session_time', sessionTime());
      set('cmi.core.exit', '');
      commit();
      raw('LMSFinish', '');
      INITIALIZED = false;
      this.connected = false;
      this.exited = true;
    }
  };

  // Cierre limpio al salir de la página (no perder tiempo/estado).
  global.addEventListener('pagehide', function () { SCORM.finish(); });
  global.addEventListener('beforeunload', function () { SCORM.finish(); });

  global.SCORM = SCORM;
})(window);
