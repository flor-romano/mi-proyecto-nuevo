#!/usr/bin/env node
/* new-course.mjs — kit-base v1.9.48
   Automatiza §7 pasos 1-2 del checklist de arranque (CLAUDE.md):
   copiar `kit-base/` completo a la carpeta del curso nuevo y generar
   un `imsmanifest.xml` propio. Nada de esto se editaba a mano por
   necesidad — es la misma lista de archivos de siempre, con el mismo
   riesgo de siempre de olvidarse uno (o de copiar una versión vieja
   de "el curso anterior" en vez de la del kit-base actual).

   QUÉ NO HACE (a propósito, no por descuido)
   -------------------------------------------
   No genera `index.html`. El chrome real (barra superior, barra
   inferior con progreso, sidenav, glosario, logros, fab-stack de
   ayuda/configuración) tiene demasiados IDs/clases con contrato
   exacto (coto-player.js los busca por `getElementById`/selector, y
   si no calzan `initPlayer()` simplemente no hace nada, en silencio
   — el peor tipo de bug para un scaffold: parece que arrancó pero la
   mitad del chrome está muerto) como para fabricarlo de cero acá con
   confianza. `CLAUDE.md` §7.1 ya documenta el método correcto:
   arrancar con el zip de un curso de referencia real y adaptar su
   `index.html` — más fiable que un template inventado.

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

console.log(`✓ Curso creado en ${destinoAbs}`);
console.log('  Siguiente: CLAUDE.md §7 pasos 3+ (índice.html, hitboxes, curso.js real)');
console.log('  El chrome de index.html (header/bottom bar/pop-ups) se arranca con el');
console.log('  método de zip de referencia — CLAUDE.md §7.1 — no lo genera este script.');
