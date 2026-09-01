#!/usr/bin/env node
/* ============================================================
   check-contraste.mjs — validador de contraste WCAG 2.1 de la
   paleta por categoría (kit-base, CLAUDE.md §6.5 / §4).

   POR QUÉ EXISTE
   --------------
   `coto-base.css` afirmaba que "--cat-strong es lo bastante oscuro
   en TODAS las categorías del kit para que el blanco sí pase",
   citando UNA medición puntual (servicio-médico, 4.53:1 — la más al
   límite de las que pasan). Esa generalización era falsa: 5 de las
   23 categorías fallan AA con blanco encima. Es el mismo patrón de
   bug que §6.7 (un valor medido contra UN caso puntual y aplicado
   como constante global) — por eso la defensa no es "volver a
   medirlo bien una vez", es un test que no deje volver a
   generalizar.

   QUÉ VALIDA
   ----------
   No inventa pares: cada uno sale de un uso REAL en el CSS del kit
   (ver `selector` en la tabla PARES). Cada par lleva su propio
   umbral, según el tamaño de texto en el que se usa:
     · 4.5:1 → texto normal (AA)
     · 3.0:1 → texto grande/título (AA-large, >=24px o >=18.66px bold)
   Usar un solo umbral para todo daría falsos positivos en los
   títulos de pop-up y falsos negativos en los botones.

   Lee las categorías del propio `css/coto-base.css`, así una
   categoría nueva queda cubierta sin tocar este archivo.

   USO
   ---
     node tools/check-contraste.mjs              # valida, sale 1 si falla
     node tools/check-contraste.mjs --verbose    # muestra las 23, pasen o no
     node tools/check-contraste.mjs --sugerir    # propone el hex mínimo que corrige

   ============================================================ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CSS_BASE = path.join(AQUI, '..', 'css', 'coto-base.css');

const args = new Set(process.argv.slice(2));
const VERBOSE = args.has('--verbose') || args.has('-v');
const SUGERIR = args.has('--sugerir');

/* ---------- color ---------- */

const normHex = (h) => {
  h = h.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return '#' + h.toUpperCase();
};

const rgb = (hex) => {
  const h = normHex(hex).slice(1);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

/* Luminancia relativa WCAG 2.1 (sRGB). */
const luminancia = (hex) =>
  rgb(hex)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((acc, v, i) => acc + [0.2126, 0.7152, 0.0722][i] * v, 0);

const contraste = (a, b) => {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/* HSL, para oscurecer manteniendo tono y saturación (ver --sugerir). */
const aHsl = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
};

const desdeHsl = ([h, s, l]) => {
  if (s === 0) {
    const v = Math.round(l * 255);
    return normHex(v.toString(16).padStart(2, '0').repeat(3));
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const canal = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return normHex(
    [canal(h + 1 / 3), canal(h), canal(h - 1 / 3)]
      .map((v) => Math.round(v * 255).toString(16).padStart(2, '0'))
      .join('')
  );
};

/* Oscurece bajando SOLO la luminosidad HSL — mantiene el tono y la
   saturación del valor original, que es lo que hace que el color
   siga leyéndose como el mismo de la familia (§6.5: la paleta es
   monocromática por categoría, no se puede virar el tono). */
const oscurecerHasta = (hex, fondo, objetivo) => {
  const [h, s, l0] = aHsl(hex);
  for (let l = l0; l >= 0; l -= 0.002) {
    const cand = desdeHsl([h, s, l]);
    if (contraste(cand, fondo) >= objetivo) return cand;
  }
  return '#000000';
};

/* Mezcla un color con blanco, igual que `color-mix(in srgb, X N%, #FFF)`. */
const mezclarBlanco = (hex, prop) =>
  normHex(
    rgb(hex)
      .map((v) => Math.round(v * prop + 255 * (1 - prop)).toString(16).padStart(2, '0'))
      .join('')
  );

/* ---------- parseo de la paleta ---------- */

/* Los 2 extremos de un `linear-gradient(135deg,#AAA,#BBB)`: son los
   colores reales sobre los que cae el texto de `.modal-hd`/`.cover`
   (el degradado no tiene un color único que medir — se miden los dos
   extremos y manda el peor). */
const paradasGrad = (valor) => {
  const m = valor && valor.match(/#[0-9A-Fa-f]{3,8}/g);
  return m ? m.map(normHex) : [];
};

const leerCategorias = (css) => {
  /* Una categoría puede estar declarada en VARIAS reglas `[data-cat=...]`
     (el bloque principal con la paleta, y más abajo el override de
     --cat-ink en las 7 que lo necesitan). Se fusionan por nombre en vez
     de tratarlas como entradas distintas — si no, el override entra como
     una "categoría" sin --cat y todo el cálculo se cae. */
  const porNombre = new Map();
  const re = /\[data-cat="([^"]+)"\]\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(css))) {
    const [, nombre, cuerpo] = m;
    const tok = (k) => {
      const r = new RegExp(`--${k}\\s*:\\s*([^;}]+)`).exec(cuerpo);
      return r ? r[1].trim() : null;
    };
    const hex = (k) => {
      const v = tok(k);
      return v && /^#[0-9A-Fa-f]{3,8}$/.test(v) ? normHex(v) : null;
    };
    const prev = porNombre.get(nombre) || { nombre };
    const asignar = (k, v) => { if (v != null) prev[k] = v; };
    asignar('cat', hex('cat'));
    asignar('catStrong', hex('cat-strong'));
    asignar('catSoft', hex('cat-soft'));
    asignar('catInk', hex('cat-ink'));
    asignar('onCat', hex('on-cat'));
    const g = paradasGrad(tok('cat-grad'));
    if (g.length) prev.grad = g;
    porNombre.set(nombre, prev);
  }

  const cats = [];
  for (const c of porNombre.values()) {
    /* El selector `[data-cat]` sin valor da el default de los dos tokens
       derivados; acá se reproduce esa misma resolución. */
    if (!c.catInk) c.catInk = c.catStrong;
    /* --cat-wash es un color-mix() en el CSS, no un hex literal: se
       reproduce el MISMO cálculo (12% de --cat sobre blanco). Si cambia
       ese porcentaje en coto-base.css, cambiarlo también acá. */
    c.wash = mezclarBlanco(c.cat, 0.12);
    cats.push(c);
  }
  return cats;
};

/* ---------- pares de uso REALES ----------
   Cada entrada existe porque hay una regla en el CSS del kit que
   pinta ese primer plano sobre ese fondo. Si se agrega un uso nuevo
   con una combinación distinta, sumarlo acá.

   `nucleo` separa dos cosas que NO son igual de urgentes, y mezclarlas
   ahoga lo real (misma lección que §6.59 punto 6 con
   check-css-duplicates: un linter sin filtro no se usa):
     · nucleo:true  → componente que TODO curso del molde usa
       (`.modal-hd`, `.btn-cat`, la pantalla de salida, la píldora del
       pop-up de instrucciones). Un fallo acá ya está en producción.
     · nucleo:false → componente "Learning" del addendum que ningún
       curso usó todavía (verificado contra los cursos entregados:
       0 usos de tabs-v/tabs-h/toggle-seg/radial/badge-cat/d-steps).
       Sigue siendo un bug real del kit — el próximo curso que use el
       componente se lo come — pero no hay nada entregado afectado.
   Los dos se reportan; solo los de núcleo hacen fallar el proceso. */
const PARES = [
  {
    id: 'blanco/ink',
    nucleo: true,
    fg: () => '#FFFFFF',
    bg: (c) => c.catInk,
    umbral: 4.5,
    selector: '.modal-hd--dark, .btn-cat, .d-instr-kicker, .d-nav-btn--cta, .d-aviso-ic',
    nota: 'texto/ícono blanco sobre el relleno sólido de categoría',
  },
  {
    id: 'ink/blanco',
    nucleo: true,
    fg: (c) => c.catInk,
    bg: () => '#FFFFFF',
    umbral: 4.5,
    selector: 'color:var(--cat-ink) sobre --surface (33 usos en el kit)',
    nota: 'texto de categoría sobre superficie blanca',
  },
  {
    id: 'ink/wash',
    nucleo: true,
    fg: (c) => c.catInk,
    bg: (c) => c.wash,
    umbral: 4.5,
    selector: '.d-salida-eval, .d-aviso, .d-steps span, .d-pred-opt:hover, .d-mj-opt:hover',
    nota: 'texto de categoría sobre el fondo tintado que SÍ lleva texto',
  },
  {
    id: 'on-cat/grad',
    nucleo: true,
    fg: (c) => c.onCat,
    bg: (c) => c.grad,
    umbral: 3.0,
    selector: '.modal-hd, .cover, .d-top-brand',
    nota: 'TÍTULO grande sobre el degradado (se miden los 2 extremos)',
  },
  {
    id: 'on-cat/cat',
    nucleo: true,
    fg: (c) => c.onCat,
    bg: (c) => c.cat,
    umbral: 3.0,
    selector: '.icon-circle svg (trazo de ícono sobre el pleno)',
    nota: 'ÍCONO, no texto: WCAG 1.4.11 pide 3:1 para gráficos con significado',
  },
];

/* ---------- excepciones documentadas ----------
   Un caso que NO se puede cerrar sin una decisión de diseño que
   excede a este archivo. No se borran del reporte: se listan aparte
   con su motivo, para que sigan visibles sin frenar una entrega.
   Agregar una acá exige escribir POR QUÉ — si no se puede explicar,
   no es una excepción, es un bug sin arreglar. */
const EXCEPCIONES = [
  {
    cat: 'frescos-2',
    par: 'on-cat/grad',
    motivo:
      'Su --cat-grad (#DC3228 → #FF6E64, Valor 2→4 del manual) abarca un ' +
      'rango de luminancia tan ancho que NINGÚN color de texto pasa 3:1 en ' +
      'los dos extremos: blanco da 2.74 en el claro, navy 2.98 en el oscuro. ' +
      'Se dejó navy por ser estrictamente mejor. Cerrarlo de verdad exige ' +
      'acortar el degradado, que es tocar la tabla oficial del manual (§6.5) ' +
      '— decisión de diseño, no de código. Ninguna otra categoría tiene un ' +
      'degradado tan extendido.',
  },
];

const esExcepcion = (fila) =>
  EXCEPCIONES.find((e) => e.cat === fila.cat && e.par === fila.par.id);

/* ---------- ejecución ---------- */

const css = fs.readFileSync(CSS_BASE, 'utf8');
const cats = leerCategorias(css);

if (!cats.length) {
  console.error('✗ No se encontró ninguna categoría [data-cat=...] en', CSS_BASE);
  process.exit(2);
}

const fallos = [];
const filas = [];

for (const c of cats) {
  for (const par of PARES) {
    const fg = par.fg(c);
    const bgs = [].concat(par.bg(c) || []).filter(Boolean);
    if (!fg || !bgs.length) continue;
    /* Con un degradado manda el PEOR de los dos extremos: el texto
       cruza todo el degradado, no solo el punto que se midió. */
    let peor = null;
    for (const bg of bgs) {
      const r = contraste(fg, bg);
      if (!peor || r < peor.ratio) peor = { ratio: r, bg };
    }
    const ok = peor.ratio >= par.umbral;
    const fila = { cat: c.nombre, par, fg, ...peor, ok, c };
    filas.push(fila);
    if (!ok) fallos.push(fila);
  }
}

const f2 = (n) => n.toFixed(2).padStart(5);

if (VERBOSE) {
  for (const par of PARES) {
    console.log(`\n── ${par.id}  (mín ${par.umbral}:1) — ${par.nota}`);
    console.log(`   ${par.selector}`);
    for (const fila of filas.filter((x) => x.par === par).sort((a, b) => a.ratio - b.ratio)) {
      console.log(
        `   ${fila.ok ? '·' : '✗'} ${fila.cat.padEnd(22)} ${fila.fg} sobre ${fila.bg}  ${f2(fila.ratio)}:1`
      );
    }
  }
  console.log('');
}

const exceptuados = fallos.filter((f) => esExcepcion(f));
const deNucleo = fallos.filter((f) => f.par.nucleo && !esExcepcion(f));
const teoricos = fallos.filter((f) => !f.par.nucleo && !esExcepcion(f));

const imprimirGrupo = (lista, titulo) => {
  if (!lista.length) return;
  console.log(titulo);
  const porPar = new Map();
  for (const f of lista) {
    if (!porPar.has(f.par)) porPar.set(f.par, []);
    porPar.get(f.par).push(f);
  }
  for (const [par, filas] of porPar) {
    console.log(`\n  ${par.id} — mínimo ${par.umbral}:1 · ${par.nota}`);
    console.log(`  usado en: ${par.selector}`);
    for (const f of filas.sort((a, b) => a.ratio - b.ratio)) {
      let linea = `    ✗ ${f.cat.padEnd(22)} ${f.fg} sobre ${f.bg}  →  ${f2(f.ratio)}:1`;
      if (SUGERIR) {
        /* Solo se sugiere oscurecer el FONDO cuando el fondo es un token
           de la categoría y el texto es fijo (blanco/navy). Al revés no
           corresponde: el texto lo fija el diseño, no la paleta.
           Y solo se ofrece si el resultado es realmente alcanzable
           sin llegar al negro — si hay que ir a #000 el problema no se
           arregla oscureciendo, se arregla cambiando el par (ver
           CLAUDE.md §6.5). */
        const fondoEsToken =
          f.bg === f.c.catInk || f.bg === f.c.cat || f.bg === f.c.wash;
        if (fondoEsToken) {
          const nuevo = oscurecerHasta(f.bg, f.fg, par.umbral);
          const r = contraste(f.fg, nuevo);
          linea +=
            r >= par.umbral
              ? `   ·  ${f.bg} → ${nuevo} (${f2(r)}:1)`
              : `   ·  no se arregla oscureciendo — cambiar el par`;
        }
      }
      console.log(linea);
    }
  }
  console.log('');
};

const imprimirExcepciones = () => {
  if (!exceptuados.length) return;
  console.log('━━ EXCEPCIONES DOCUMENTADAS — no frenan la entrega, pero siguen abiertas.\n');
  for (const f of exceptuados) {
    const e = esExcepcion(f);
    console.log(`  ! ${f.cat} · ${f.par.id} — ${f2(f.ratio)}:1 (mínimo ${f.par.umbral})`);
    console.log(`    ${e.motivo.replace(/(.{68}\s)/g, '$1\n    ')}\n`);
  }
};

if (!deNucleo.length && !teoricos.length) {
  console.log(
    `✓ Contraste OK — ${cats.length} categorías × ${PARES.length} pares de uso, 0 fallos` +
      (exceptuados.length ? `, ${exceptuados.length} excepción(es) documentada(s).\n` : '.')
  );
  imprimirExcepciones();
  process.exit(0);
}

console.log(
  `\nContraste — ${cats.length} categorías × ${PARES.length} pares de uso.` +
    `  Núcleo: ${deNucleo.length} fallo(s).  Componentes sin uso: ${teoricos.length}.\n`
);

imprimirGrupo(
  deNucleo,
  '━━ NÚCLEO — componentes que todo curso usa. Esto ya está en producción.'
);
imprimirExcepciones();
imprimirGrupo(
  teoricos,
  '━━ SIN USO HOY — componentes "Learning" del addendum que ningún curso\n' +
    '   invocó todavía. Bug real igual: el próximo curso que los use se lo come.'
);

if (!SUGERIR) {
  console.log('  (correr con --sugerir para ver el hex mínimo que corrige cada uno)\n');
}

/* Solo los de núcleo cortan el proceso: un componente que nadie usa no
   debería frenar una entrega, pero tampoco desaparecer del reporte. */
process.exit(deNucleo.length ? 1 : 0);
