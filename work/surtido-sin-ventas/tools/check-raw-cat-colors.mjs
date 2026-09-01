#!/usr/bin/env node
/* check-raw-cat-colors.mjs — kit-base v1.9.43
   Detecta un hex de categoría (--cat / --cat-strong / --cat-soft /
   --cat-ink, definidos en coto-base.css §[data-cat=...]) escrito a
   mano, como literal, en una declaración que NO es la definición del
   token — es decir: alguien copió el número en vez de usar
   `var(--cat-strong)` (o similar). Ese bypass es exactamente lo que
   rompe la paridad con el Manual de Diseño si el cliente pide
   ajustar una categoría más adelante: el token cambia, pero el color
   copiado a mano se queda atrás, en silencio.

   POR QUÉ NO ES "cualquier color crudo es un error"
   --------------------------------------------------
   Se probó esa versión primero (ver CLAUDE.md §6.65): el kit tiene
   ~150 usos legítimos de colores crudos (blancos/negros/grises de
   chrome, sombras `rgba(20,30,60,...)`, gradientes del minijuego)
   que NO tienen nada que ver con el sistema de categorías — exigir
   que todo pase por un token ahí sería ruido puro y el chequeo se
   terminaría ignorando. Este script solo mira los 75 hex que SON
   valores reales de --cat/--cat-strong/--cat-soft/--cat-ink hoy —
   si alguno de esos aparece suelto fuera de su propia definición,
   es casi con certeza una copia a mano, no una decisión de diseño.

   Excluye las declaraciones de custom property (`--algo: #hex`,
   que es donde los tokens SE DEFINEN) y los bloques `[data-cat=...]`
   enteros.

   Uso: node check-raw-cat-colors.mjs [css/coto-base.css ...]
        (sin argumentos: revisa todos los css/*.css del kit)
   Exit code 1 si encuentra algo, 0 si no. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CSS_DIR = path.join(AQUI, '..', 'css');
const CSS_BASE = path.join(CSS_DIR, 'coto-base.css');

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, m => '\n'.repeat(m.split('\n').length - 1));
}

function tokensDeCategoria() {
  const raw = stripComments(fs.readFileSync(CSS_BASE, 'utf8'));
  const re = /--(cat|cat-strong|cat-soft|cat-ink)\s*:\s*(#[0-9a-fA-F]{3,8})/g;
  const set = new Set();
  let m;
  while ((m = re.exec(raw))) set.add(m[2].toLowerCase());
  return set;
}

function analizarArchivo(filePath, hexSet) {
  const raw = stripComments(fs.readFileSync(filePath, 'utf8'));
  const lines = raw.split('\n');
  const hallazgos = [];
  const declRe = /([a-zA-Z-]+)\s*:\s*[^;{}]*?(#[0-9a-fA-F]{3,8})/g;
  lines.forEach((line, i) => {
    let m;
    declRe.lastIndex = 0;
    while ((m = declRe.exec(line))) {
      const prop = m[1];
      const hex = m[2].toLowerCase();
      if (prop.startsWith('--')) continue; // es la definición del token, no un bypass
      if (hexSet.has(hex)) {
        hallazgos.push(`línea ${i + 1}: "${prop}: ${m[2]}" — ese hex es un token de categoría; usar var(--cat...) en su lugar.`);
      }
    }
  });
  return hallazgos;
}

const args = process.argv.slice(2);
const archivos = args.length
  ? args
  : fs.readdirSync(CSS_DIR).filter(f => f.endsWith('.css')).map(f => path.join(CSS_DIR, f));

const hexSet = tokensDeCategoria();
let huboHallazgos = false;

for (const f of archivos) {
  if (!fs.existsSync(f)) {
    console.error(`✗ no existe: ${f}`);
    huboHallazgos = true;
    continue;
  }
  const hallazgos = analizarArchivo(f, hexSet);
  if (hallazgos.length) {
    huboHallazgos = true;
    console.log(`✗ ${f}:`);
    hallazgos.forEach(h => console.log('  - ' + h));
  } else {
    console.log(`✓ ${path.basename(f)} — sin hex de categoría copiado a mano.`);
  }
}

if (!huboHallazgos) {
  console.log(`\n✓ Sin bypass de tokens de categoría — 0 de ${hexSet.size} hex conocidos aparece suelto.`);
}

process.exitCode = huboHallazgos ? 1 : 0;
