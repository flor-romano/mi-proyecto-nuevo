#!/usr/bin/env node
/* ============================================================
   build-evaluacion-gift.mjs · kit-base v1.9.20
   ------------------------------------------------------------
   Genera un archivo .gift (formato GIFT, importable directo en
   Moodle: Banco de preguntas > Importar > formato "GIFT") a partir
   de un JSON de datos del curso — nunca hardcodear preguntas acá,
   este script es 100% genérico (CLAUDE.md §1: "¿esto lee algo del
   curso?" — si sí, va en el JSON de datos, no en este archivo).

   Uso:
     node tools/build-evaluacion-gift.mjs <datos.json> [salida.gift]

   Si se omite <salida.gift>, escribe "<slug-del-json>.gift" al lado
   del JSON de entrada.

   Formato del JSON de entrada (ver tools/evaluacion.ejemplo.json,
   el caso real de "Uso de Sucursales 3 - NOA"):
   {
     "categoria": "Nombre del curso",
     "multipleChoice": [
       {
         "id": "MC01 - lo que sea",
         "pregunta": "Texto de la pregunta",
         "correcta": { "texto": "...", "feedback": "..." },
         "incorrectas": [
           { "texto": "...", "feedback": "..." },
           { "texto": "...", "feedback": "..." }
         ]
       }
     ],
     "verdaderoFalso": [
       {
         "id": "VF01 - lo que sea",
         "enunciado": "Afirmación a evaluar",
         "esVerdadero": true,
         "feedback": "Explicación, aplica sea correcta o no la respuesta"
       }
     ]
   }

   Reglas de contenido (para quien escriba el JSON, no para este
   script): dificultad media, opción múltiple de 3 alternativas,
   SIEMPRE retroalimentación en la correcta Y en cada distractor —
   explicando por qué está mal, no solo "incorrecto". Ver CLAUDE.md
   §9 para la guía completa de cómo armar el contenido de una
   evaluación nueva.
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const [, , inPath, outPathArg] = process.argv;
if (!inPath) {
  console.error('Uso: node build-evaluacion-gift.mjs <datos.json> [salida.gift]');
  process.exit(1);
}

const data = JSON.parse(readFileSync(inPath, 'utf8'));
const outPath = outPathArg || join(dirname(inPath), basename(inPath, '.json') + '.gift');

/* GIFT reserva ~ = # { } y los dos puntos al arrancar un título — hay
   que escaparlos con \ dentro del texto de preguntas/respuestas, o
   Moodle los interpreta como sintaxis en vez de texto literal. */
function escapeGift(s) {
  return String(s).replace(/([~=#{}])/g, '\\$1');
}

function mcBlock(q, n) {
  const correcta = `\t=${escapeGift(q.correcta.texto)} #${escapeGift(q.correcta.feedback)}`;
  const incorrectas = q.incorrectas
    .map((o) => `\t~${escapeGift(o.texto)} #${escapeGift(o.feedback)}`)
    .join('\n');
  return `::MC${String(n).padStart(2, '0')} - ${q.id}::${escapeGift(q.pregunta)} {\n${correcta}\n${incorrectas}\n}`;
}

function vfBlock(q, n) {
  const valor = q.esVerdadero ? 'TRUE' : 'FALSE';
  return `::VF${String(n).padStart(2, '0')} - ${q.id}::${escapeGift(q.enunciado)} {\n\t${valor}#${escapeGift(q.feedback)}\n}`;
}

const mc = data.multipleChoice || [];
const vf = data.verdaderoFalso || [];

const lines = [];
lines.push(`// ============================================================`);
lines.push(`// Evaluación — "${data.categoria || 'Curso'}"`);
lines.push(`// Formato GIFT, generado con tools/build-evaluacion-gift.mjs`);
lines.push(`// Importar en Moodle: Banco de preguntas > Importar > formato "GIFT"`);
lines.push(`// ${mc.length} opción múltiple + ${vf.length} Verdadero/Falso = ${mc.length + vf.length} preguntas`);
lines.push(`// ============================================================`);
lines.push('');
if (data.categoria) lines.push(`$CATEGORY: ${data.categoria}`);
lines.push('');
lines.push('// ---------- Opción múltiple ----------');
lines.push('');
mc.forEach((q, i) => { lines.push(mcBlock(q, i + 1)); lines.push(''); });
lines.push('// ---------- Verdadero / Falso ----------');
lines.push('');
vf.forEach((q, i) => { lines.push(vfBlock(q, i + 1)); lines.push(''); });

writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log(`OK: ${mc.length + vf.length} preguntas (${mc.length} MC + ${vf.length} V/F) → ${outPath}`);
