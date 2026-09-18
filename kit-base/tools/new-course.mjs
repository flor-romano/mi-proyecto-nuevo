#!/usr/bin/env node
/* new-course.mjs — kit-base v1.9.48
   Automatiza §7 pasos 1-2 del checklist de arranque (CLAUDE.md):
   copiar `kit-base/` completo a la carpeta del curso nuevo y generar
   un `imsmanifest.xml` propio. Nada de esto se editaba a mano por
   necesidad — es la misma lista de archivos de siempre, con el mismo
   riesgo de siempre de olvidarse uno (o de copiar una versión vieja
   de "el curso anterior" en vez de la del kit-base actual).

   SÍ GENERA EL `index.html` COMPLETO (desde v1.9.60, §7.08)
   ---------------------------------------------------------
   Chrome real incluido: barra superior, barra inferior con progreso,
   sidenav, glosario, logros y el fab-stack de ayuda/configuración,
   más el orden de scripts. Sale de `index-boilerplate.html`, con el
   header inyectado desde `header-boilerplate.html` para que haya UNA
   sola fuente de verdad.

   Este bloque decía exactamente lo contrario hasta v1.9.71 —"no
   genera index.html", y mandaba a adaptar a mano el de otro curso—
   mientras el propio archivo, más abajo, lo generaba y lo anunciaba
   por consola (§7.18 K7). Adaptar a mano es el método viejo y es
   donde el contrato se rompe EN SILENCIO: `initPlayer()` no tira
   ningún error si un id no calza, simplemente deja medio chrome
   muerto.

   Uso:
     node tools/new-course.mjs <carpeta_destino> --titulo "Nombre del curso" --cat <categoria>
   Ejemplo:
     node tools/new-course.mjs ../mi-curso-nuevo --titulo "Higiene y seguridad" --cat seguridad-higiene

   `--cat` tiene que ser una categoría real de `coto-base.css`
   (`[data-cat="..."]`) — se valida contra el archivo real, no contra
   una lista copiada acá que podría quedar desactualizada. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const KIT_ROOT = path.join(AQUI, '..');

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--titulo') out.titulo = argv[++i];
    else if (argv[i] === '--cat') out.cat = argv[++i];
    else out._.push(argv[i]);
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const destino = args._[0];

if (!destino || !args.titulo || !args.cat) {
  console.error('Uso: node new-course.mjs <carpeta_destino> --titulo "Nombre del curso" --cat <categoria>');
  process.exit(1);
}

const categoriasReales = (() => {
  const css = fs.readFileSync(path.join(KIT_ROOT, 'css', 'coto-base.css'), 'utf8');
  const set = new Set();
  const re = /\[data-cat="([^"]+)"\]/g;
  let m;
  while ((m = re.exec(css))) set.add(m[1]);
  return set;
})();
if (!categoriasReales.has(args.cat)) {
  console.error(`✗ "--cat ${args.cat}" no es una categoría real de coto-base.css.`);
  console.error('  Categorías válidas: ' + Array.from(categoriasReales).sort().join(', '));
  process.exit(1);
}

const destinoAbs = path.resolve(destino);
if (fs.existsSync(destinoAbs) && fs.readdirSync(destinoAbs).length) {
  console.error(`✗ ${destinoAbs} ya existe y no está vacía — no se pisa nada.`);
  process.exit(1);
}
fs.mkdirSync(destinoAbs, { recursive: true });

function copiarDir(rel, filtro) {
  const src = path.join(KIT_ROOT, rel);
  const dst = path.join(destinoAbs, rel);
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (filtro && !filtro(entry)) continue;
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(srcPath, dstPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

// ---- 1. Archivos genéricos, tal cual (CLAUDE.md §7 paso 1) ----
copiarDir('css');
copiarDir('js', entry => entry.name !== 'curso.js'); // curso.js se genera aparte, con substitución
copiarDir('fonts');
copiarDir('tools');
fs.copyFileSync(path.join(KIT_ROOT, 'header-boilerplate.html'), path.join(destinoAbs, 'header-boilerplate.html'));
fs.copyFileSync(path.join(KIT_ROOT, 'spec-motor-slides.md'), path.join(destinoAbs, 'spec-motor-slides.md'));
/* El prompt de arranque viaja con el curso: si alguien retoma esta
   carpeta en un chat nuevo (o hay que rehacerla), el procedimiento está
   ahí adentro y no en la memoria de quien la armó. */
fs.copyFileSync(path.join(KIT_ROOT, 'PROMPT-CURSO-NUEVO.md'), path.join(destinoAbs, 'PROMPT-CURSO-NUEVO.md'));
fs.copyFileSync(path.join(KIT_ROOT, 'package.json'), path.join(destinoAbs, 'package.json'));
if (fs.existsSync(path.join(KIT_ROOT, 'package-lock.json'))) {
  fs.copyFileSync(path.join(KIT_ROOT, 'package-lock.json'), path.join(destinoAbs, 'package-lock.json'));
}
fs.mkdirSync(path.join(destinoAbs, 'img'), { recursive: true });
fs.mkdirSync(path.join(destinoAbs, 'video'), { recursive: true });

// ---- 2. curso.js: la plantilla del kit, con COURSE_SLUG/COURSE_NAME reales ----
function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
const slug = slugify(args.titulo);
const cursoJs = fs.readFileSync(path.join(KIT_ROOT, 'js', 'curso.js'), 'utf8')
  .replace("var COURSE_SLUG = 'nombre-del-curso';", `var COURSE_SLUG = '${slug}';`)
  .replace("var COURSE_NAME = 'Nombre del curso';", `var COURSE_NAME = '${args.titulo.replace(/'/g, "\\'")}';`);
fs.writeFileSync(path.join(destinoAbs, 'js', 'curso.js'), cursoJs);

// ---- 3. imsmanifest.xml (mismo formato que un curso real: SCORM 1.2,
//         un SCO, sin masteryscore — ver CLAUDE.md §3.11 sobre cuándo
//         SÍ declararlo) ----
const idBase = slug.toUpperCase().replace(/-/g, '_');
/* El título va DENTRO de XML (comentario, <title> y atributos): un
   "&" o un "<" en el nombre del curso — "Higiene & seguridad", "Uso
   de sucursales <NOA>" — genera un imsmanifest.xml malformado, y un
   manifest que no parsea es un paquete que el LMS rechaza entero al
   importarlo. kit-base v1.9.52. */
function escXml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
const tituloXml = escXml(args.titulo);
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  imsmanifest.xml · "${tituloXml}"
  SCORM 1.2, un solo SCO. Generado por tools/new-course.mjs —
  revisar si corresponde declarar <adlcp:masteryscore> (CLAUDE.md §3.11:
  NO declararlo si la evaluación calificada vive aparte, en Moodle).
-->
<manifest identifier="COTO_${idBase}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>

  <organizations default="ORG_${idBase}">
    <organization identifier="ORG_${idBase}">
      <title>${tituloXml}</title>
      <item identifier="ITEM_${idBase}" identifierref="RES_${idBase}" isvisible="true">
        <title>${tituloXml}</title>
      </item>
    </organization>
  </organizations>

  <resources>
    <resource identifier="RES_${idBase}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
`;
fs.writeFileSync(path.join(destinoAbs, 'imsmanifest.xml'), manifest);

// ---- 4. CSS/README propios del curso — arrancan vacíos, con el
//         encabezado de rigor (evita el bug de §1: "el kit usa clases
//         que no define" si alguien las llena sin acordarse de que
//         existen) ----
for (const nombre of ['assets.css', 'diapositivas.css', 'pulido.css']) {
  fs.writeFileSync(path.join(destinoAbs, 'css', nombre),
    `/* ${nombre} — CSS propio de "${args.titulo}". Nunca tocar los .css del kit (CLAUDE.md §1). */\n`);
}
fs.writeFileSync(path.join(destinoAbs, 'README-CURSO.md'),
  `# ${args.titulo}\n\nBitácora propia de este curso (decisiones, bugs reales, pendientes) — ` +
  `no se mezcla con \`kit-base/CLAUDE.md\` (CLAUDE.md §0.1).\n\n` +
  `Generado con \`tools/new-course.mjs\` a partir de kit-base ` +
  `v${JSON.parse(fs.readFileSync(path.join(KIT_ROOT, 'package.json'), 'utf8')).version}.\n`);

// ---- 5. index.html, a partir de index-boilerplate.html (kit v1.9.60) ----
/* Hasta v1.9.59 este script NO generaba el index.html y mandaba a
   copiar el de un curso de referencia. La auditoría de los 2 cursos
   terminados (§7.08) mostró que el chrome de los dos difiere solo en
   PARÁMETROS, no en estructura — y que adaptarlo a mano es justo donde
   el contrato se rompe EN SILENCIO: `initPlayer()` no tira ningún
   error si un id no calza, simplemente deja medio chrome muerto.
   Generarlo acá lo acierta siempre. Lo que sigue siendo 100% del curso
   son las DIAPOSITIVAS: esto deja una por sección, vacía y rotulada. */

// El color del favicon sale de `--cat-strong` de la categoría elegida,
// leído del CSS real — no de una tabla copiada acá que se desactualice.
const catStrong = (() => {
  const css = fs.readFileSync(path.join(KIT_ROOT, 'css', 'coto-base.css'), 'utf8');
  const linea = css.split('\n').find(l => l.includes(`[data-cat="${args.cat}"]`)) || '';
  const m = linea.match(/--cat-strong:\s*#([0-9A-Fa-f]{6})/);
  return m ? m[1] : '0032C8';
})();

/* Secciones de arranque: el esqueleto que todo curso del molde tiene.
   El curso real suma, saca y renombra — pero arrancar con el orden
   correcto (y con `data-slide-end` en la última) evita de entrada el
   §6.24, el peor bug que tuvo este kit: sin `courseend` el alumno
   termina el curso y el LMS lo deja "incomplete" para siempre. */
const SECCIONES = [
  { id: 'portada', label: 'Portada', icono: 'i-flag', grupo: 'Inicio' },
  { id: 'introduccion', label: 'Introducción', icono: 'i-book' },
  { id: 'objetivos', label: 'Objetivos de aprendizaje', icono: 'i-target' },
  { id: 'tema-1', label: 'Tema 1', icono: 'i-tema-1', grupo: 'Contenido' },
  { id: 'tema-2', label: 'Tema 2', icono: 'i-tema-2' },
  { id: 'repaso', label: 'Repaso', icono: 'i-list-check', grupo: 'Cierre' },
  { id: 'cierre', label: 'Cierre', icono: 'i-medal' }
];

/* Sprite base: SOLO los íconos que el chrome generado referencia de
   verdad. `i-check` es el que usa CADA ítem del índice (la tilde de
   "ya visto"), así que sin él el índice sale roto en todos los cursos
   — por eso el set base es del kit aunque el sprite temático siga
   siendo contenido de curso (§6.67): se suman en el index.html
   generado, con el mismo estilo de línea 24x24. */
/* OJO: `i-check` NO va acá — ya lo define `header-boilerplate.html`,
   que se inyecta entero más abajo. Definirlo en los dos lados es un id
   duplicado, o sea el fallo silencioso del §7.06 punto 2: el `<use>`
   resuelve al primero y el segundo queda muerto. */
const SPRITE_BASE = {
  'i-flag': '<path d="M4 21V4h11l-1.5 4L15 12H4"/>',
  'i-book': '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M6 17h13"/>',
  'i-target': '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  'i-list-check': '<polyline points="3 7 5 9 9 5"/><polyline points="3 16 5 18 9 14"/><line x1="12" y1="7" x2="21" y2="7"/><line x1="12" y1="17" x2="21" y2="17"/>',
  'i-medal': '<circle cx="12" cy="15" r="6"/><path d="M8.5 9.5L6 2h12l-2.5 7.5"/>',
  /* Un ícono POR TEMA, distintos entre sí (kit-base v1.9.76, §7.22).
     El scaffold ponía `i-layers` en los dos temas, y la regla del kit
     dice que dos diapositivas de CONTENIDO distintas nunca comparten
     ícono — el alumno usa el ícono del índice para orientarse, y
     repetido deja de orientar. El test `iconos-indice` lo hace cumplir,
     y con el scaffold viejo fallaba de entrada.
     Son placeholders con forma neutra: el curso los reemplaza por el
     ícono de SU tema, que es justamente lo que la regla pide. */
  'i-tema-1': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 10h8M8 14h5"/>',
  'i-tema-2': '<circle cx="12" cy="12" r="9"/><path d="M12 8v5l3 2"/>'
};
const sprite = Object.entries(SPRITE_BASE).map(([id, body]) =>
  `    <symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`
).join('\n');

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const slides = SECCIONES.map((s, i) => {
  const ultima = i === SECCIONES.length - 1;
  const fin = ultima ? ' data-slide-end' : '';
  /* La capa de confeti va UNA sola vez y en la diapositiva de cierre,
     que es donde `initCierreCelebration()` la usa. Se emite acá, y no
     se deja al curso, por un bug real: "Uso de Sucursales 3 - NOA"
     terminó con DOS `#d-confetti` idénticos (el segundo, muerto —
     `getElementById` devuelve siempre el primero), y eso no lo delataba
     nada hasta que markup-sanity aprendió a ver ids duplicados en
     v1.9.58. Emitirla desde acá cierra las dos puntas: no falta y no
     se duplica. */
  const confeti = ultima
    ? `    <div class="d-confetti" id="d-confetti" aria-hidden="true"></div>\n`
    : '';
  return `  <!-- ${escHtml(s.label)} -->\n` +
    `  <section class="slide" data-slide="${s.id}" data-slide-index="${i}"${fin}>\n` +
    `    <h2>${escHtml(s.label)}</h2>\n` +
    `    <!-- Contenido de esta diapositiva. Decidir primero (CLAUDE.md §7\n` +
    `         paso 2): captura íntegra (.d-shot-slide) vs. piezas HTML reales. -->\n` +
    confeti +
    `  </section>`;
}).join('\n\n');

const sidenavItems = SECCIONES.map(s => {
  const grupo = s.grupo ? `      <span class="d-sidenav-group">${escHtml(s.grupo)}</span>\n` : '';
  return grupo +
    `      <button class="d-sidenav-item" type="button" data-goto="${s.id}">` +
    `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#${s.icono}"/></svg>` +
    `<span>${escHtml(s.label)}</span>` +
    `<svg class="ix-ck" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check"/></svg></button>`;
}).join('\n');

/* El header NO está copiado dentro de index-boilerplate.html: se
   inyecta acá desde `header-boilerplate.html`, su única fuente de
   verdad. Dos copias de la misma barra era garantizar que se
   desincronicen — el bug que este kit ya pagó con el sprite y con los
   popovers. Se le saca el docblock de encabezado (instrucciones para
   quien lo lee suelto): dentro de un index.html ya armado no aporta. */
/* `header-boilerplate.html` trae placeholders entre <> pensados para
   rellenar a mano: <NOMBRE DEL CURSO>, <CATEGORÍA> y el src del logo
   `img/icono-<CATEGORIA>.webp`. Dejarlos sin resolver no es cosmético:
   el src roto es un 404, y un 404 hace fallar TRES tests de la suite
   (deep-audit, full-regress, hitbox-click-check cuentan cualquier
   error de consola). Es justo el tipo de detalle que se olvida al
   adaptar a mano — acá se resuelve siempre. */
const nombreCat = args.cat.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
const header = fs.readFileSync(path.join(KIT_ROOT, 'header-boilerplate.html'), 'utf8')
  .replace(/^<!--[\s\S]*?-->\s*/, '')
  .replace(/img\/icono-<CATEGORIA>\.webp/g, `img/icono-${args.cat}.webp`)
  .replace(/<NOMBRE DEL CURSO>/g, escHtml(args.titulo))
  .replace(/<CATEGORÍA>/g, escHtml(nombreCat));

const indexHtml = fs.readFileSync(path.join(KIT_ROOT, 'index-boilerplate.html'), 'utf8')
  .replace(/^<!--[\s\S]*?-->\s*/, '')     // el docblock de la plantilla no viaja al curso
  .replace(/\{\{TITULO\}\}/g, escHtml(args.titulo))
  .replace(/\{\{CAT\}\}/g, args.cat)
  .replace(/\{\{FAVICON_HEX\}\}/g, catStrong)
  .replace(/\{\{CSS_EXTRA\}\}/g,
    '<!-- <link rel="stylesheet" href="css/coto-quiz.css"> si el curso tiene quiz -->\n' +
    '<!-- <link rel="stylesheet" href="css/coto-minijuego.css"> si tiene minijuego -->')
  .replace(/\{\{SPRITE\}\}/g, sprite)
  .replace(/\{\{HEADER_BOILERPLATE\}\}/g, header.trimEnd())
  .replace(/\{\{SLIDES\}\}/g, slides)
  .replace(/\{\{TOTAL\}\}/g, String(SECCIONES.length))
  .replace(/\{\{SIDENAV_ITEMS\}\}/g, sidenavItems)
  .replace(/\{\{JS_EXTRA\}\}/g, '<!-- <script src="js/coto-quiz.js"></script> si el curso tiene quiz -->');

/* Un token sin rellenar es un `{{ALGO}}` literal en pantalla, en el
   curso entregado. Barato de atrapar acá y carísimo de descubrir en el
   LMS del cliente. */
const tokensSueltos = indexHtml.match(/\{\{[A-Z_]+\}\}/g);
if (tokensSueltos) {
  console.error(`✗ index-boilerplate.html quedó con tokens sin rellenar: ${[...new Set(tokensSueltos)].join(', ')}`);
  process.exit(1);
}
fs.writeFileSync(path.join(destinoAbs, 'index.html'), indexHtml);

/* Logo de la marca: WebP de 1x1 transparente, como PLACEHOLDER real.
   No es capricho — la alternativa (dejar el src apuntando a un archivo
   que no existe) mete un 404 en consola, y la suite cuenta cualquier
   error de consola como fallo del curso: un curso recién generado
   arrancaría con 3 de 7 tests en rojo por un archivo que el diseñador
   todavía no entregó. Con esto arranca en verde y se reemplaza por el
   ícono real cuando llega, sin tocar el HTML. */
const LOGO_1PX_WEBP = 'UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
fs.writeFileSync(path.join(destinoAbs, 'img', `icono-${args.cat}.webp`),
  Buffer.from(LOGO_1PX_WEBP, 'base64'));

console.log(`✓ Curso creado en ${destinoAbs}`);
console.log(`  index.html generado: chrome completo y cableado + ${SECCIONES.length} diapositivas vacías.`);
console.log('  Siguiente: CLAUDE.md §7 pasos 1-2 (PDF → decidir captura vs. HTML real por');
console.log('  diapositiva), después llenar las <section data-slide> y escribir js/curso.js.');
