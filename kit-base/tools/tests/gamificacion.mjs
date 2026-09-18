#!/usr/bin/env node
/* gamificacion.mjs — kit-base v1.9.80
   ------------------------------------------------------------
   POR QUÉ EXISTE. La gamificación completa es **obligatoria** desde
   §6.17.1 — el cliente fue explícito: *"eso no es una decisión de
   alcance válida, es un faltante"*. Y hasta ahora la única forma de
   hacerla cumplir era el punto 9.5 del checklist de §7, que pide
   "verificar explícitamente que estén los 4 elementos".

   Un checklist que se verifica a mano se cumple hasta que alguien tiene
   apuro. Esto lo mide.

   LOS CUATRO ELEMENTOS:
     1. chip de logros/puntos funcionando en el header;
     2. glosario con términos REALES del curso;
     3. al menos una mini-práctica, quiz o repaso;
     4. que las interacciones sumen puntos de verdad.

   EL CUIDADO QUE HACE QUE ESTO NO MOLESTE: un curso recién generado no
   tiene nada de eso —y no debería fallar por estar vacío—. Así que el
   test primero decide si el curso YA TIENE CONTENIDO, mirando cuánto
   texto narrable hay en total. Un scaffold tiene los rótulos de sección
   y nada más; un curso de verdad tiene cientos de palabras. Por debajo
   del piso, el test informa y no exige: es un curso en construcción.

   Es el mismo criterio de `iconos-indice`: un test que le falla a un
   curso recién generado enseña a ignorar la suite.
*/
import { openCourse, report, requireUrl, irASlide } from './_shared.mjs';

const PISO_PALABRAS = 150;

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

/* Cuánto contenido hay. Se navega diapositiva por diapositiva porque
   `textOf()` filtra por `hidden` y todas menos la activa lo tienen
   (§7.21, trampa 7). */
const ids = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-slide]')).map((s) => s.getAttribute('data-slide')));
let palabras = 0;
for (const id of ids) {
  if (!(await irASlide(page, id))) continue;
  palabras += await page.evaluate((s) => {
    const el = document.querySelector(`[data-slide="${s}"]`);
    if (!el || !window.Narrador || !window.Narrador.textOf) return 0;
    return (window.Narrador.textOf(el) || '').split(/\s+/).filter(Boolean).length;
  }, id);
}

if (palabras < PISO_PALABRAS) {
  console.log(`  · ${palabras} palabras de contenido: el curso está en construcción, ` +
    `no se exige la gamificación todavía (piso: ${PISO_PALABRAS}).`);
  report('gamificacion', errors.map((e) => 'error de consola: ' + e));
  await browser.close();
  process.exit(process.exitCode || 0);
}

const g = await page.evaluate(() => ({
  hayChip: !!document.querySelector('.d-chip--achieve'),
  puntosCableados: (() => {
    const p = document.getElementById('d-points');
    return !!p && p.hasAttribute('data-valor');
  })(),
  terminosGlosario: document.querySelectorAll('dl.d-glossary dt').length,
  hayGlosario: !!document.querySelector('[data-popup="glosario"]'),
  hayPractica: !!document.querySelector('[data-repaso-item], .d-q, .d-mj-panel, [data-repaso]'),
  badges: document.querySelectorAll('#d-badges-list .d-badge').length
}));

if (!g.hayChip || !g.puntosCableados) {
  fails.push('no hay puntos funcionando en el header (§6.17.1). Falta el chip `.d-chip--achieve` ' +
    'o nadie llamó a `initLogros()` — sin eso el curso no puntúa nada y la medalla del cierre ' +
    'no tiene de dónde salir.');
}
if (!g.badges) {
  fails.push('el catálogo de logros está vacío: `#d-badges-list` no tiene ninguna `.d-badge`. ' +
    'Los logros son contenido del curso y van en el `badges:` de `initLogros()`.');
}
if (!g.hayGlosario) {
  fails.push('el curso no tiene pop-up de glosario (§6.17.1, obligatorio).');
} else if (g.terminosGlosario === 0) {
  fails.push('el glosario existe pero está VACÍO: 0 términos. El pop-up abre y no dice nada — ' +
    'peor que no tenerlo.');
}
if (!g.hayPractica) {
  fails.push('no hay ninguna mini-práctica, quiz ni repaso (§6.17.1, obligatorio).');
}

console.log(`  · ${palabras} palabras · ${g.terminosGlosario} término(s) de glosario · ` +
  `${g.badges} logro(s) en el catálogo`);

if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
report('gamificacion', fails);
await browser.close();
