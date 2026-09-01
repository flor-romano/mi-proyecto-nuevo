/* Test de contenido — específico de este curso, no genérico (aunque el
   MÉTODO es reutilizable: recorrer Narrador.textOf() de cada diapo y
   auditar orden/integridad, no solo "algo se narra").
   Pedido explícito del cliente: "necesitamos que se lea correctamente
   y en orden, que quede como regla" — y, más específico todavía, "que
   sea clara, ordenada, con sentido, sino va a distraer". Cubre 4
   clases de bug reales que ya aparecieron en este curso:
     1. Texto pegado sin espacio entre dos nodos (".d-q-num", tips de
        Ayuda, etc.) — detectado acá con un heurístico genérico:
        minúscula seguida DIRECTO de mayúscula, sin espacio ni punto.
     2. Título de diapositiva ausente o fuera de orden (setNarrateTitles
        prendido para este curso: el título tiene que ser lo PRIMERO).
     3. Contenido oculto que igual se lee (el bug real de las 2
        preguntas de repaso narradas juntas) — reconfirmado acá con las
        3 diapositivas de resumen.
     4. El título dicho DOS VECES seguidas — bug real encontrado
        recién en 6 de las 26 diapos ("Introducción. Introducción. En
        COTO..."): el propio cuerpo ya abría anunciando el tema en
        palabras, de una época en que el título no se narraba.
        `textOf()` ahora lo recorta solo (`quitarAperturaRepetida`);
        acá se reconfirma que no vuelva a colarse. */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

// Diapositivas que a propósito NO narran nada (video de fondo).
const SILENCIOSAS = new Set(['portada', 'unidad1', 'unidad2', 'unidad3']);

const resultados = await page.evaluate((silenciosas) => {
  var out = [];
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'))
    .sort(function (a, b) { return (+a.getAttribute('data-slide-index')) - (+b.getAttribute('data-slide-index')); });
  slides.forEach(function (s) {
    var id = s.getAttribute('data-slide');
    window.motor.gotoId(id);
    var titulo = s.querySelector('[data-slide-title]');
    out.push({
      id: id,
      titulo: titulo ? titulo.textContent : null,
      texto: window.Narrador.textOf(s),
      esVideo: s.classList.contains('d-shot-slide--bg-video')
    });
  });
  return out;
}, [...SILENCIOSAS]);

const PEGADO = /[a-záéíóúñ][A-ZÁÉÍÓÚÑ]/;

resultados.forEach(function (r) {
  if (SILENCIOSAS.has(r.id)) {
    if (r.texto !== '') failures.push(`"${r.id}" es video de fondo, debería narrar '', narró: "${r.texto.slice(0, 80)}"`);
    return;
  }
  if (!r.texto) {
    failures.push(`"${r.id}" no narra NADA — ¿le falta contenido real, o algo la está silenciando de más?`);
    return;
  }
  if (r.titulo && !r.texto.startsWith(r.titulo)) {
    failures.push(`"${r.id}" no empieza narrando su título ("${r.titulo}"): "${r.texto.slice(0, 80)}..."`);
  }
  if (r.titulo) {
    var restoTrasTitulo = r.texto.slice(r.titulo.length).replace(/^[.\s]+/, '');
    if (restoTrasTitulo.startsWith(r.titulo)) {
      failures.push(`"${r.id}" repite el título dos veces seguidas: "${r.texto.slice(0, 100)}..."`);
    }
  }
  var pegado = r.texto.match(PEGADO);
  if (pegado) {
    failures.push(`"${r.id}" tiene texto pegado sin espacio cerca de "${pegado[0]}": "${r.texto.slice(Math.max(0, r.texto.indexOf(pegado[0]) - 30), r.texto.indexOf(pegado[0]) + 30)}"`);
  }
});

// Repaso rápido: exactamente 1 pregunta narrada por vez (nunca 0, nunca 2+).
['resumen1', 'resumen2', 'resumen3'].forEach(function (id) {
  var r = resultados.find(function (x) { return x.id === id; });
  var matches = (r.texto.match(/Verdadero o falso:/g) || []).length;
  if (matches !== 1) {
    failures.push(`"${id}" debería narrar exactamente 1 pregunta de repaso ("Verdadero o falso:"), narró ${matches}: "${r.texto}"`);
  }
});

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
await browser.close();
report('narracion-completa-orden-e-integridad', failures);
