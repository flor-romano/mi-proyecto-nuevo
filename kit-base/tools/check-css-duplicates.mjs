#!/usr/bin/env node
/* check-css-duplicates.mjs — kit-base v1.9.39
   Detecta selectores CSS repetidos en el MISMO contexto de cascada
   (mismo anidado de @media/@supports, o ninguno) que además comparten
   al menos una propiedad — la firma exacta del bug real que ya costó 2
   vueltas distintas (CLAUDE.md §6.28/§6.33: `.modal-card--shot`
   declarado dos veces con `--shot-card-ratio` distinto, gana la
   última — un `grep` del selector antes de agregar una regla nueva
   habría evitado las dos). En ambos casos "0 fallos" en los tests
   estructurales no decía nada — el HTML/JS estaban perfectos, el bug
   vivía solo en el CSS, invisible a una lectura rápida.

   Por qué exige "al menos una propiedad en común" y no alcanza con
   "selector repetido": un componente grande partido en 2+ reglas con
   propiedades DISTINTAS (ej. `.d-instr-modal{position:relative;...}`
   más abajo `.d-instr-modal{border-bottom-left-radius:70px}`) es un
   estilo de autoría válido — las dos reglas se suman, ninguna pisa a
   la otra. Sin este filtro el script ahogaría el hallazgo real en
   decenas de falsos positivos de ese tipo.

   Por qué NO compara "selector sin @media" contra "el mismo selector
   DENTRO de un @media": ese cruce es el patrón NORMAL de cualquier CSS
   responsive (una regla base + un override en `@media` que le cambia
   valores a propósito) — intentarlo automatizado da ruido masivo
   incluso en CSS del kit ya correcto (probado). El caso real de §6.28
   (un bloque completo duplicado, uno sin guardia y el otro adentro de
   un `@media`) sigue siendo un caso para ojo humano — antes de agregar
   una regla nueva para un selector que sospechás que ya existe,
   `grep` el selector primero (regla de §6.33).

   No entra en `@font-face`/`@keyframes`/`@page` (su sintaxis interna no
   son selectores CSS reales — `0%`/`50%`/`100%` repetidos entre
   `@keyframes` distintos es normal, no un bug).

   Uso: node check-css-duplicates.mjs <archivo1.css> [archivo2.css ...]
   Exit code 1 si encuentra algo, 0 si no. */

import fs from 'node:fs';

function stripComments(css) {
  // Preserva la CANTIDAD de saltos de línea de cada comentario (los
  // reemplaza por igual número de '\n', el resto en blanco) para que
  // los números de línea reportados después sigan calzando con el
  // archivo real — sin esto, un comentario multilínea corría todas las
  // líneas siguientes y el reporte apuntaba a la línea equivocada.
  return css.replace(/\/\*[\s\S]*?\*\//g, m => {
    const saltos = m.split('\n').length - 1;
    return '\n'.repeat(saltos);
  });
}

function findMatchingBrace(text, openIdx) {
  let depth = 1;
  let i = openIdx + 1;
  while (i < text.length && depth > 0) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    i++;
  }
  return i - 1;
}

function normalizeWs(s) {
  return s.replace(/\s+/g, ' ').trim();
}

function splitSelectors(prelude) {
  // Split por comas de nivel 0 (respeta paréntesis de :not(a, b), etc.)
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < prelude.length; i++) {
    const c = prelude[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) {
      out.push(prelude.slice(start, i));
      start = i + 1;
    }
  }
  out.push(prelude.slice(start));
  return out.map(normalizeWs).filter(Boolean);
}

function propiedadesDe(inner) {
  // Nombres de propiedad de nivel 0 dentro del cuerpo de una regla
  // (ignora los ; dentro de paréntesis, ej. var(--x, 1px; 2px) no existe
  // en CSS real pero cubrimos el caso de calc()/var() con comas igual).
  const props = new Set();
  let depth = 0, start = 0;
  const declaraciones = [];
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ';' && depth === 0) {
      declaraciones.push(inner.slice(start, i));
      start = i + 1;
    }
  }
  declaraciones.push(inner.slice(start));
  for (const d of declaraciones) {
    const idx = d.indexOf(':');
    if (idx > 0) {
      const nombre = d.slice(0, idx).trim();
      if (nombre) props.add(nombre);
    }
  }
  return props;
}

function analizarArchivo(path) {
  const raw = fs.readFileSync(path, 'utf8');
  const text = stripComments(raw);

  // key "ctx||selector" -> [{line, props:Set}]
  const ocurrencias = new Map();

  function lineaDe(idx) {
    return text.slice(0, idx).split('\n').length;
  }

  function walk(body, contextStack, offset) {
    let i = 0;
    while (i < body.length) {
      const braceIdx = body.indexOf('{', i);
      if (braceIdx === -1) break;
      const prelude = body.slice(i, braceIdx).trim();
      const closeIdx = findMatchingBrace(body, braceIdx);
      if (closeIdx < 0 || closeIdx > body.length) break;
      const inner = body.slice(braceIdx + 1, closeIdx);

      if (prelude.startsWith('@')) {
        const atName = (prelude.match(/^@[a-zA-Z-]+/) || [''])[0].toLowerCase();
        if (atName === '@media' || atName === '@supports') {
          walk(inner, contextStack.concat([normalizeWs(prelude)]), offset + braceIdx + 1);
        }
        // @font-face / @keyframes / @page / etc.: opaco, no se recorre.
      } else if (prelude) {
        const ctxKey = contextStack.join(' > ');
        const props = propiedadesDe(inner);
        // La línea se mide desde el primer carácter NO-espacio del
        // prelude, no desde `i` — `i` suele caer justo en el salto de
        // línea que sigue al `}` anterior, lo que reportaba la línea
        // de la regla previa en vez de la real (bug propio, encontrado
        // comparando el resultado contra un `grep -n` directo).
        let selStart = i;
        while (selStart < braceIdx && /\s/.test(body[selStart])) selStart++;
        const linea = lineaDe(offset + selStart);
        for (const sel of splitSelectors(prelude)) {
          const key = ctxKey + '||' + sel;
          if (!ocurrencias.has(key)) ocurrencias.set(key, []);
          ocurrencias.get(key).push({ line: linea, props });
        }
      }
      i = closeIdx + 1;
    }
  }

  walk(text, [], 0);

  const hallazgos = [];

  /* ---- Punto ciego: el duplicado que pisa a su CLASE BASE ----
     (kit-base v1.9.72, §7.18 K1b)

     Lo de abajo compara los bloques de un selector duplicado ENTRE SÍ.
     Eso dejó pasar una regresión real: `.d-fab-pop--ayuda` estaba
     declarado dos veces, y los dos bloques declaraban propiedades
     DISTINTAS —así que entre ellos no había conflicto y el chequeo
     decía "sin duplicados"—, pero el segundo bloque declaraba
     `position: relative`, que pisaba en silencio el `position:absolute`
     de `.d-fab-pop`. Misma especificidad (una clase), así que ganaba
     por orden de fuente. El panel dejó de ser overlay y los dos botones
     flotantes terminaron en el medio del lienzo.

     Por qué la condición es tan específica —modificador DUPLICADO que
     pisa una propiedad ESTRUCTURAL de su base— y no "cualquier
     modificador que pisa a su base": medido sobre el CSS del kit, la
     versión amplia da un aviso por un override legítimo
     (`.d-iconbtn--labeled` cambiando `display`), que es exactamente
     para lo que existe un modificador. Un ⚠️ que salta por lo correcto
     deja de leerse (§7.3). Lo que convierte a K1 en bug no es el
     override: es que estaba escrito en un bloque APARTE del principal,
     que es la forma que tiene "no me di cuenta de que la base ya lo
     declaraba". */
  const ESTRUCTURALES = ['position', 'display', 'overflow', 'overflow-x', 'overflow-y'];
  const porSelector = new Map();   // selector -> {props unificadas}
  for (const [key, lista] of ocurrencias) {
    const sel = key.split('||')[1];
    if (!porSelector.has(sel)) porSelector.set(sel, new Set());
    for (const o of lista) for (const p of o.props) porSelector.get(sel).add(p);
  }
  for (const [key, lista] of ocurrencias) {
    if (lista.length < 2) continue;                       // solo duplicados
    const [ctx, sel] = key.split('||');
    const m = sel.match(/^(\.[A-Za-z0-9_-]+)--[A-Za-z0-9_-]+$/);
    if (!m) continue;                                     // solo modificadores `.a--b`
    const base = porSelector.get(m[1]);
    if (!base) continue;
    const pisadas = ESTRUCTURALES.filter(
      p => base.has(p) && lista.some(o => o.props.has(p)));
    if (!pisadas.length) continue;
    hallazgos.push(
      `"${sel}"${ctx ? ' dentro de ' + ctx : ''} — declarado ${lista.length} veces ` +
      `(líneas ${lista.map(o => o.line).join(', ')}) y pisa [${pisadas.join(', ')}] ` +
      `de su clase base "${m[1]}", que tiene la MISMA especificidad: gana por orden ` +
      `de fuente, en silencio. Si el override es a propósito, declararlo en el bloque ` +
      `principal del modificador y no en uno aparte.`
    );
  }
  for (const [key, lista] of ocurrencias) {
    if (lista.length < 2) continue;
    const [ctx, sel] = key.split('||');
    // ¿Comparten al menos una propiedad entre CUALQUIER par de ocurrencias?
    const comunes = new Set();
    for (let a = 0; a < lista.length; a++) {
      for (let b = a + 1; b < lista.length; b++) {
        for (const p of lista[a].props) if (lista[b].props.has(p)) comunes.add(p);
      }
    }
    if (comunes.size === 0) continue; // reglas partidas sin conflicto real
    const lineas = lista.map(o => o.line).join(', ');
    hallazgos.push(
      `"${sel}"${ctx ? ' dentro de ' + ctx : ''} — declarado ${lista.length} veces ` +
      `(líneas ${lineas}), comparten la(s) propiedad(es) [${Array.from(comunes).join(', ')}]: ` +
      `la última declaración gana esa(s) propiedad(es) en silencio.`
    );
  }
  return hallazgos;
}

const archivos = process.argv.slice(2);
if (!archivos.length) {
  console.error('Uso: node check-css-duplicates.mjs <archivo1.css> [archivo2.css ...]');
  process.exit(1);
}

let huboHallazgos = false;
for (const path of archivos) {
  if (!fs.existsSync(path)) {
    console.error(`✗ no existe: ${path}`);
    huboHallazgos = true;
    continue;
  }
  const hallazgos = analizarArchivo(path);
  if (hallazgos.length) {
    huboHallazgos = true;
    console.log(`✗ ${path}:`);
    hallazgos.forEach(h => console.log('  - ' + h));
  } else {
    console.log(`✓ ${path} — sin selectores duplicados con propiedades en conflicto.`);
  }
}

process.exitCode = huboHallazgos ? 1 : 0;
