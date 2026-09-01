#!/usr/bin/env node
/* ============================================================
   build-evaluacion-xml.mjs · kit-base v1.9.56
   ------------------------------------------------------------
   Genera el archivo de evaluación del curso en **Moodle XML** — el
   ÚNICO formato de entrega del kit (Banco de preguntas > Importar >
   formato "Moodle XML"). Toma un JSON de datos y no sabe nada del
   contenido de ningún curso: las preguntas van en el JSON, nunca acá
   (CLAUDE.md §1).

   Uso:
     node tools/build-evaluacion-xml.mjs <datos.json> [salida.xml]

   Sin <salida.xml>, escribe "<slug-del-json>.xml" al lado del JSON.
   `tools/evaluacion.ejemplo.json` es la evaluación real de "Seguridad
   alimentaria" (la que se entregó y el cliente aprobó): sirve de
   plantilla del esquema Y de caso de prueba — regenerarla con este
   script tiene que dar el XML entregado, idéntico byte a byte.

   POR QUÉ SOLO XML (v1.9.56)
   ---------------------------
   Hasta v1.9.55 el kit traía además `build-evaluacion-gift.mjs`
   (formato GIFT). Se sacó: tener dos formatos obligaba a elegir en
   cada curso y el entregable real siempre terminaba siendo el XML,
   que es el único que expresa lo que el cliente pidió —
   retroalimentación a nivel de PREGUNTA
   (`correctfeedback`/`incorrectfeedback`, lo que Moodle muestra al
   cerrar el intento) y `shuffleanswers`/`answernumbering`/
   `defaultgrade` declarados por pregunta en vez de heredados de la
   instalación de Moodle que importe el archivo.

   ESQUEMA DEL JSON
   -----------------
   {
     "categoria": "Nombre del curso",
     "multipleChoice": [{
       "id": "SA01 - Tema",            // el script antepone "MCnn - "
       "pregunta": "…",
       "explicacion": "…",             // UNA por pregunta, sin prefijo
       "correcta":    { "texto": "…" },
       "incorrectas": [{ "texto": "…" }, { "texto": "…" }]
     }],
     "verdaderoFalso": [{
       "id": "SA11 - Tema",            // el script antepone "VFnn - "
       "enunciado": "…",
       "esVerdadero": true,
       "explicacion": "…"
     }]
   }

   LA NORMALIZACIÓN DE PREFIJOS (la parte no obvia)
   -------------------------------------------------
   En el XML la MISMA explicación aparece dos veces por pregunta,
   cambiando solo el prefijo: `¡Correcto! <expl>` en el feedback de
   acierto y `Incorrecto. <expl>` en el de error (verificado contra la
   evaluación real: el cuerpo de las dos es idéntico carácter por
   carácter). Por eso la explicación se escribe UNA vez y PELADA — el
   prefijo lo pone el script.
   `sinPrefijo()` igual saca cualquier prefijo que el texto ya traiga
   ("¡Correcto! …", "Incorrecto, …", "Falso. …"), porque los JSON
   escritos para el viejo formato GIFT los tenían adentro y copiarlos
   tal cual produciría "Incorrecto. ¡Correcto! El 191 compara…". Así un
   JSON viejo sigue generando un XML correcto sin editarlo.

   `explicacion` es el campo canónico; si falta, cae al `feedback` de
   la opción correcta (compatibilidad con los JSON del formato viejo).
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const [, , inPath, outPathArg] = process.argv;
if (!inPath) {
  console.error('Uso: node build-evaluacion-xml.mjs <datos.json> [salida.xml]');
  process.exit(1);
}

const data = JSON.parse(readFileSync(inPath, 'utf8'));
const outPath = outPathArg || join(dirname(inPath), basename(inPath, '.json') + '.xml');

const mc = data.multipleChoice || [];
const vf = data.verdaderoFalso || [];

/* `<name>` y `<category>` van como texto plano (no CDATA, igual que
   los exporta Moodle), así que ahí sí hace falta escapar XML. */
function esc(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* El resto va en CDATA para no tener que escapar el HTML que el
   contenido pueda traer (`<strong>`, `<br>`). Lo único que un CDATA
   no soporta es la secuencia de cierre: se parte en dos bloques, que
   es la forma estándar de escaparla. */
function cdata(s) {
  return '<![CDATA[' + String(s === undefined || s === null ? '' : s).replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
}

/* Saca el prefijo de acierto/error que el texto ya pueda traer
   escrito (los JSON del formato viejo lo tienen), para poder
   re-prefijar sin duplicar. Cubre las variantes reales encontradas en
   los JSON del kit: "¡Correcto!", "Correcto.", "Incorrecto," /
   "Incorrecto.", y "Verdadero."/"Falso." de las de V/F. */
function sinPrefijo(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/^\s*(?:¡?\s*(?:correcto|incorrecto|verdadero|falso)\s*[!.,:]?\s*)+/i, '')
    .trim();
}

const PREFIJO_OK = '¡Correcto! ';
const PREFIJO_MAL = 'Incorrecto. ';

function bloqueMC(q, n) {
  const nombre = `MC${String(n).padStart(2, '0')} - ${q.id}`;
  // `explicacion` es el campo canónico; el fallback cubre los JSON
  // del formato viejo, que la traían en el feedback de la correcta.
  const expl = sinPrefijo(q.explicacion || (q.correcta && q.correcta.feedback));
  const opciones = [
    `    <answer fraction="100" format="html">\n      <text>${cdata(q.correcta.texto)}</text>\n    </answer>`,
    ...(q.incorrectas || []).map(
      (o) => `    <answer fraction="0" format="html">\n      <text>${cdata(o.texto)}</text>\n    </answer>`
    )
  ].join('\n');
  return [
    '  <question type="multichoice">',
    `    <name><text>${esc(nombre)}</text></name>`,
    `    <questiontext format="html"><text>${cdata(q.pregunta)}</text></questiontext>`,
    '    <defaultgrade>1</defaultgrade>',
    '    <single>true</single>',
    '    <shuffleanswers>true</shuffleanswers>',
    '    <answernumbering>abc</answernumbering>',
    `    <correctfeedback format="html"><text>${cdata(PREFIJO_OK + expl)}</text></correctfeedback>`,
    '    <partiallycorrectfeedback format="html"><text></text></partiallycorrectfeedback>',
    `    <incorrectfeedback format="html"><text>${cdata(PREFIJO_MAL + expl)}</text></incorrectfeedback>`,
    opciones,
    '  </question>'
  ].join('\n');
}

function bloqueVF(q, n) {
  const nombre = `VF${String(n).padStart(2, '0')} - ${q.id}`;
  const expl = sinPrefijo(q.explicacion || q.feedback);
  // El orden de las dos opciones es SIEMPRE true y después false (así
  // las exporta Moodle); lo que cambia según `esVerdadero` es cuál
  // lleva fraction="100".
  const fracTrue = q.esVerdadero ? 100 : 0;
  const fracFalse = q.esVerdadero ? 0 : 100;
  const fb = (acierta) => cdata((acierta ? PREFIJO_OK : PREFIJO_MAL) + expl);
  return [
    '  <question type="truefalse">',
    `    <name><text>${esc(nombre)}</text></name>`,
    `    <questiontext format="html"><text>${cdata(q.enunciado)}</text></questiontext>`,
    '    <defaultgrade>1</defaultgrade>',
    `    <answer fraction="${fracTrue}" format="moodle_auto_format">`,
    '      <text>true</text>',
    `      <feedback format="html"><text>${fb(!!q.esVerdadero)}</text></feedback>`,
    '    </answer>',
    `    <answer fraction="${fracFalse}" format="moodle_auto_format">`,
    '      <text>false</text>',
    `      <feedback format="html"><text>${fb(!q.esVerdadero)}</text></feedback>`,
    '    </answer>',
    '  </question>'
  ].join('\n');
}

const total = mc.length + vf.length;
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<!--',
  ` Evaluación — "${data.categoria}"`,
  ' Formato Moodle XML, generado con tools/build-evaluacion-xml.mjs',
  ' Importar en Moodle: Banco de preguntas > Importar > formato "Moodle XML"',
  ` ${mc.length} opción múltiple + ${vf.length} Verdadero/Falso = ${total} preguntas`,
  '-->',
  '<quiz>',
  '  <question type="category">',
  `    <category><text>$course$/top/${esc(data.categoria)}</text></category>`,
  '  </question>',
  ...mc.map((q, i) => bloqueMC(q, i + 1)),
  ...vf.map((q, i) => bloqueVF(q, i + 1)),
  '</quiz>',
  ''
].join('\n');

writeFileSync(outPath, xml, 'utf8');
console.log(`✓ ${outPath} — ${mc.length} opción múltiple + ${vf.length} V/F = ${total} preguntas.`);
