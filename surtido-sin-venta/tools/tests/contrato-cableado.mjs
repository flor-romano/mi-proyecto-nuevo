#!/usr/bin/env node
/* contrato-cableado.mjs — kit-base v1.9.71
   ------------------------------------------------------------
   POR QUÉ EXISTE. Un relay de "Pedidos de PLU set a Compras" trajo
   cuatro hallazgos con la MISMA forma, y esa forma es la peor que
   puede tener un bug en este kit:

     el kit YA TRAE la pieza · nadie la cablea · no hay ningún error

   Los cuatro (§7.17 bloque B): la narración por diapositiva nunca se
   enganchaba (un curso entero MUDO), `restoreMaxVisited()` no se
   llamaba (la franja de "bloqueado" no existía en el DOM), `#d-salida`
   no se generaba ("Salir del curso" no hacía nada visible dentro del
   iframe de un LMS) y `.d-rotate-notice` tampoco (en un teléfono
   vertical, un lienzo achatado sin explicación).

   Ninguno de los 8 tests que ya había los agarraba, y por una razón
   que vale la pena entender antes de agregar el noveno: TODOS miden lo
   que la página HACE, y estas fallas son cosas que la página NO hace.
   Un curso mudo no tira error, no rompe el layout, no falla un rect,
   no pierde un nombre accesible: simplemente está callado. Un test que
   busca síntomas no puede ver una ausencia.

   Así que este test no busca síntomas: verifica el CONTRATO. Por cada
   pieza que el kit trae, pregunta "¿está enchufada?". Es deliberadamente
   aburrido y deliberadamente específico — no valida diseño ni contenido,
   valida que lo que el kit promete esté conectado.

   Todo lo que chequea es OPCIONAL POR DISEÑO cuando el curso realmente
   no la usa: un curso sin locución no tiene `#d-narrate`, y ahí no hay
   nada que exigir. La regla es "si está la pieza, tiene que estar el
   cable" — nunca "todo curso tiene que tener todo".
*/
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

/* ---- 1. Narración al cambiar de diapositiva -------------------------
   El único que se mide de verdad ejecutando, porque es el único donde
   "está el cable" no se puede leer del DOM. Se intercepta
   `Narrador.speak` —exactamente como lo hizo el curso que encontró el
   bug— y se pasa una diapositiva con un clic real. */
const tieneLocucion = await page.evaluate(() =>
  !!document.getElementById('d-narrate') && !!window.Narrador);
if (tieneLocucion) {
  const narro = await page.evaluate(async () => {
    window.__habló = 0;
    const orig = window.Narrador.speak;
    window.Narrador.speak = function () { window.__habló++; };
    window.Narrador.setNarrating(true);
    const btn = document.querySelector('[data-nav="next"]');
    if (!btn || btn.disabled) { window.Narrador.speak = orig; return null; }
    btn.click();
    await new Promise(r => setTimeout(r, 600));
    window.Narrador.speak = orig;
    return window.__habló;
  });
  if (narro === 0) {
    fails.push(
      'la locución está prendida y se pasó de diapositiva, pero `Narrador.speak` ' +
      'no se llamó ni una vez: el curso va a quedar MUDO en todas sus diapositivas ' +
      'sin dar ningún error (§7.17 B1). Lo cablea `initPlayer()` cuando recibe ' +
      '`speakSlide` — revisar que `js/curso.js` se lo pase.');
  } else if (narro === null) {
    console.log('  · locución: no se pudo avanzar de diapositiva, chequeo omitido');
  }
}

/* ---- 2..4. Piezas que el kit trae y hay que enchufar ---------------- */
const dom = await page.evaluate(() => ({
  maxVisited: window.motor ? typeof window.motor.maxVisited : 'sin-motor',
  hayTrack: !!document.querySelector('[data-progress-track]'),
  haySalida: !!document.getElementById('d-salida'),
  hayCierre: !!document.querySelector('.slide-cierre, [data-slide="cierre"]'),
  hayRotate: !!document.querySelector('.d-stage > .d-rotate-notice'),
  hayStage: !!document.querySelector('.d-stage'),
  glossSearchClase: !!document.querySelector('.d-glossary-search'),
  glossSearchAttr: !!document.querySelector('[data-gloss-search]'),
  faviconEnBody: !!document.body.querySelector('link[rel="icon"]'),
  /* Sin los comentarios HTML: un placeholder NOMBRADO dentro de un
     comentario ("el bueno está en tal lado, con tal token") es
     documentación, no un bug — y la documentación del propio kit los
     nombra. Lo que importa es que no queden en el contenido ni en los
     atributos, que es donde el alumno los vería. */
  tokensSinResolver: (() => {
    const clon = document.documentElement.cloneNode(true);
    const it = document.createNodeIterator(clon, NodeFilter.SHOW_COMMENT);
    const coments = []; let c;
    while ((c = it.nextNode())) coments.push(c);
    coments.forEach(n => n.parentNode && n.parentNode.removeChild(n));
    return (clon.outerHTML.match(/<[A-ZÁÉÍÓÚ][A-ZÁÉÍÓÚ \-]{3,}>/g) || [])
      .filter(t => !/^<(BR|HR|P|B|I)>$/.test(t)).slice(0, 5);
  })()
}));

if (dom.hayTrack && dom.maxVisited === 'undefined') {
  fails.push(
    'hay barra de progreso pero `motor.maxVisited` es undefined: nadie llamó a ' +
    '`motor.restoreMaxVisited()`. La franja `.d-progress-locked` no se dibuja NUNCA ' +
    '(el elemento no llega a existir en el DOM) y al reingresar no se puede arrastrar ' +
    'hasta una diapositiva vista en otra sesión (§7.17 B2).');
}
if (dom.hayCierre && !dom.haySalida) {
  fails.push(
    'el curso tiene diapositiva de cierre pero no tiene `#d-salida`: "Salir del curso" ' +
    'cierra la sesión SCORM y después llama a `window.close()`, que dentro del iframe ' +
    'de un LMS no hace nada NI tira error — el alumno toca el botón final y no pasa ' +
    'nada en pantalla (§7.17 B3). El bloque está en `index-boilerplate.html`.');
}
if (dom.hayStage && !dom.hayRotate) {
  fails.push(
    'falta `.d-rotate-notice` como primer hijo de `.d-stage`: el CSS del aviso "girá ' +
    'tu dispositivo" ya viaja en `coto-shot-stage.css`, pero sin el div un teléfono ' +
    'vertical muestra el lienzo letterboxeado sin decir por qué (§7.17 B4).');
}
if (dom.glossSearchClase && !dom.glossSearchAttr) {
  fails.push(
    'el buscador del glosario tiene la clase `.d-glossary-search` pero no el atributo ' +
    '`data-gloss-search`, que es por donde lo busca `initGlossarySearch()`: el campo se ' +
    've, se puede tipear y no filtra nada, sin error en consola (§7.17 A2).');
}
if (dom.faviconEnBody) {
  fails.push(
    'hay un `<link rel="icon">` dentro del <body>: ahí no tiene efecto. Va en el <head> ' +
    '(§7.17 A1).');
}
if (dom.tokensSinResolver.length) {
  fails.push(
    'quedaron placeholders del boilerplate sin resolver en el HTML: ' +
    dom.tokensSinResolver.join(', '));
}

/* ---- 5. MARCADO SIN INIT: la falla más común de este molde ----
   (kit-base v1.9.80)

   Generalización de los cuatro chequeos de arriba. Todos eran el mismo
   caso —el curso escribe el marcado de una pieza del kit y nadie llama
   a su `init`— y hasta ahora estaban puestos a mano, uno por uno: cada
   módulo nuevo del kit nacía SIN cobertura, y el que se olvidara de
   cablearlo no se enteraba. Le pasó a los seis módulos que entraron
   entre v1.9.77 y v1.9.78.

   El mecanismo es el mismo para todos: si está el marcado, tiene que
   estar la HUELLA que el init deja en el DOM. La huella se elige
   siempre como algo que el init escribe y que nadie escribiría a mano.

   Agregar una pieza nueva al kit = agregar una fila acá. Si la pieza no
   deja ninguna huella en el DOM, no va en esta tabla: un chequeo que no
   puede distinguir "cableado" de "no cableado" da falsos positivos, y
   un aviso que salta por lo correcto deja de leerse (§7.3). */
const PIEZAS = [
  { pieza: 'initRevelados', marcado: '[data-revelar]',
    huella: (el) => el.hasAttribute('aria-expanded'),
    que: 'los puntos no revelan nada al tocarlos y las píldoras quedan visibles desde el arranque' },
  { pieza: 'initTandas', marcado: '[data-tandas]',
    huella: (el) => el.querySelectorAll('[data-tanda]:not([hidden])').length <= 1,
    que: 'se ven TODAS las tandas encimadas en vez de una por vez' },
  { pieza: 'initVisorDocs', marcado: '[data-visor]',
    huella: (el) => !!el.querySelector('.d-visor-hoja[src]'),
    que: 'el visor abre vacío: no carga ninguna hoja' },
  { pieza: 'initPasosRepaso', marcado: '[data-repaso-pasos]',
    huella: (el) => el.children.length > 0,
    que: 'el panel de pasos queda vacío' },
  { pieza: 'initDocEnDiapo', marcado: '[data-doc-hoja]',
    huella: (el) => el.hasAttribute('src'),
    que: 'la hoja del documento no se dibuja sobre el arte' },
  { pieza: 'initShotSwap', marcado: '[data-shot-swap-srcs]',
    huella: (el) => !el.querySelector('[data-shot-swap-step="-1"]') ||
                    el.querySelector('[data-shot-swap-step="-1"]').hidden,
    que: 'las flechas no pasan de variante y se ven habilitadas en los extremos' },
  { pieza: 'initLogros', marcado: '#d-badges-list',
    huella: (el) => {
      const p = document.getElementById('d-points');
      return !p || p.hasAttribute('data-valor');
    },
    que: 'NO HAY PUNTOS NI LOGROS — y la gamificación completa es obligatoria (§6.17.1)' }
];

const sinCable = await page.evaluate((defs) => {
  const out = [];
  defs.forEach((d) => {
    const els = Array.from(document.querySelectorAll(d.marcado));
    if (!els.length) return;                       // el curso no usa la pieza: nada que exigir
    // eslint-disable-next-line no-new-func
    const huella = new Function('el', 'return (' + d.huella + ')(el)');
    const rotos = els.filter((el) => { try { return !huella(el); } catch { return false; } });
    if (rotos.length) {
      out.push(`hay ${els.length} "${d.marcado}" en el curso pero ${rotos.length} sin la huella de ` +
        `\`${d.pieza}()\`: la pieza está y el cable no. Consecuencia: ${d.que}.`);
    }
  });
  return out;
}, PIEZAS.map((d) => ({ ...d, huella: d.huella.toString() })));
fails.push(...sinCable);

if (errors.length) fails.push(...errors.map(e => 'error de consola: ' + e));
report('contrato-cableado', fails);
await browser.close();
