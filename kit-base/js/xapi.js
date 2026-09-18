/* ============================================================
   xapi.js · Adaptador xAPI (Tin Can) — en paralelo a SCORM
   kit-base v1.0 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual.
   ------------------------------------------------------------
   Complementa (no reemplaza) el tracking SCORM 1.2 de scorm-api.js:
   arma statements xAPI para los eventos que curso.js decida trackear
   (capas exploradas, videos vistos, actividades interactivas,
   preguntas de práctica, curso completo — el catálogo real de
   eventos es específico de cada curso, curso.js llama al verbo que
   corresponda: `XAPI.experienced()`, `XAPI.answered()`,
   `XAPI.completed()` o `XAPI.awarded()` — ver la API pública al final
   de este archivo) y los envía a un LRS si hay uno configurado.
   (Hasta v1.9.51 este párrafo nombraba un `XAPI.track(...)` que nunca
   existió en el módulo: no hay método genérico, son los 4 verbos.)

   SIN LRS CONFIGURADO (estado por defecto de este paquete): los
   statements quedan en modo local — se arman igual y se guardan en
   memoria (window.XAPI.getLog(), últimos 200) y en consola (debug),
   pero no viaja nada por red. Esto es intencional: no hay LRS ni
   credenciales propias para este curso.

   Para que viajen de verdad a un LRS real, COTO tiene que:
     1) Definir window.XAPI_CONFIG = { endpoint: 'https://tu-lrs/xapi',
        auth: 'Basic ' + btoa('usuario:contraseña') } ANTES de que
        cargue este script (por ejemplo con un <script> propio
        agregado en index.html, o inyectado desde el LMS).
     2) Dar de alta ese endpoint + credenciales — este curso no trae
        ningún LRS: sin ese paso, se queda en modo local para siempre.

   send() nunca lanza ni bloquea la experiencia: si el LRS no está
   configurado, si la red falla o si hay CORS, el curso sigue andando
   igual (mismo criterio que el resto del tracking: best-effort).
   ============================================================ */
(function (global) {
  'use strict';

  var CFG = global.XAPI_CONFIG || null; // { endpoint, auth } — ver nota arriba
  var LOG_MAX = 200;
  var log = [];

  function actor() {
    var name = (global.SCORM && global.SCORM.getFullName && global.SCORM.getFullName()) || '';
    var home = (global.location && global.location.href) ? global.location.href.split('#')[0].split('?')[0] : 'local';
    return {
      objectType: 'Agent',
      name: name || 'Alumno (anónimo)',
      account: { homePage: home, name: name || 'anonimo' }
    };
  }

  function verb(id, es) {
    return { id: 'http://adlnet.gov/expapi/verbs/' + id, display: { es: es } };
  }

  // Slug del curso derivado de la ruta del paquete, NO hardcodeado —
  // antes tenía el nombre de un curso puntual fijo ("surtido-sin-venta"),
  // así que todos los cursos que copiaran este archivo tal cual hubieran
  // mandado sus statements bajo el MISMO activity id, mezclando datos de
  // cursos distintos en cualquier LRS real que los reciba.
  var COURSE_SLUG = (global.location.pathname || 'curso')
    .replace(/\/index\.html?$/i, '').split('/').filter(Boolean).pop() || 'curso';
  function activity(id, name, type) {
    return {
      id: 'https://coto-elearning.local/' + COURSE_SLUG + '/' + id,
      objectType: 'Activity',
      definition: { name: { es: name }, type: type || 'http://adlnet.gov/expapi/activities/interaction' }
    };
  }

  function statement(v, o, result) {
    var st = { actor: actor(), verb: v, object: o, timestamp: new Date().toISOString() };
    if (result) st.result = result;
    return st;
  }

  function send(st) {
    log.push(st);
    if (log.length > LOG_MAX) log.shift();
    if (!CFG || !CFG.endpoint) {
      if (global.console && console.debug) console.debug('[xAPI · local, sin LRS configurado]', st.verb.id.split('/').pop(), st.object.id);
      return;
    }
    try {
      var url = CFG.endpoint.replace(/\/$/, '') + '/statements';
      global.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Experience-API-Version': '1.0.3',
          'Authorization': CFG.auth || ''
        },
        body: JSON.stringify(st)
      }).catch(function () {});
    } catch (e) {}
  }

  var XAPI = {
    /* últimos statements armados (haya o no LRS real) — útil para QA */
    getLog: function () { return log.slice(); },
    isConnected: function () { return !!(CFG && CFG.endpoint); },

    /* diapositiva/interacción vista o usada (sin resultado correcto/incorrecto) */
    experienced: function (id, name) {
      send(statement(verb('experienced', 'experimentó'), activity(id, name)));
    },
    /* pregunta respondida (cualquier quiz/minijuego de práctica) */
    answered: function (id, name, correct, response) {
      send(statement(verb('answered', 'respondió'), activity(id, name, 'http://adlnet.gov/expapi/activities/question'),
        { success: !!correct, response: String(response == null ? '' : response) }));
    },
    /* actividad completada (mini práctica, curso entero) */
    completed: function (id, name, score) {
      var result = { completion: true };
      if (score) result.score = score;
      send(statement(verb('completed', 'completó'), activity(id, name, 'http://adlnet.gov/expapi/activities/course'), result));
    },
    /* logro/badge obtenido (verbo de la comunidad TinCan, pensado para esto) */
    awarded: function (id, name) {
      send(statement({ id: 'http://id.tincanapi.com/verb/awarded', display: { es: 'obtuvo un logro' } },
        activity(id, name, 'https://w3id.org/xapi/acrossx/activities/badge')));
    }
  };

  global.XAPI = XAPI;
})(window);
