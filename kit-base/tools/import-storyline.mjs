#!/usr/bin/env node
/* ============================================================
   import-storyline.mjs · kit-base v1.9.57
   ------------------------------------------------------------
   Primer paso para migrar un curso viejo de Articulate Storyline
   (export SCORM/HTML5) al molde del kit. NO produce un curso
   terminado — produce el INSUMO que hoy sale del PDF del diseñador
   (una captura por diapositiva) más el texto y la estructura ya
   extraídos, y un informe de qué queda a mano.

   QUÉ HACE
   --------
   1. Lee `html5/data/js/data.js` → lista real de diapositivas
      (título, orden, lmsId).
   2. Escanea el JS de cada diapositiva → texto visible (sirve de
      guion de narración y de texto accesible), y cuenta capas y
      estados, que es la medida honesta de cuánta interactividad hay
      que rehacer.
   3. Levanta el curso en un server local propio (sin dependencias),
      lo abre en Chromium y captura cada diapositiva a `.webp`.
   4. Escribe `storyline-import.json` + `INFORME-IMPORT.md`.

   QUÉ NO HACE (a propósito)
   -------------------------
   · No arma `index.html` ni cablea nada del motor: la interactividad
     de Storyline (capas/estados) no sobrevive a una captura plana y
     se rehace con `initShotSwap`/`[data-layers]`, que es decisión de
     diseño, no algo mecánico.
   · No reencuadra a 2:1. El escenario de Storyline suele ser ~1.86
     (2180x1174 en el curso de referencia) y el kit trabaja en 2.000
     (CLAUDE.md §2.6): no es un recorte, los layouts difieren. La
     herramienta REPORTA la proporción real y deja el reencuadre a
     criterio humano — recortar solo perdería contenido en silencio.
   · No trae videos: verificado en un export real, los `.mp4` no
     viajan en el paquete (solo quedan PNG de mockup). Y capturar una
     diapo de video plana hornea el reproductor de Storyline dentro
     de la imagen, que es el bug de CLAUDE.md §6.29. Esas diapos se
     rearman con `coto-media.js` y el video original aparte.

   POR QUÉ NAVEGA POR EL MENÚ Y NO POR LA API DE STORYLINE
   -------------------------------------------------------
   `window.DS` (el runtime) no expone ninguna función de navegación
   pública — se probó. Reversear sus internals minificados sería
   frágil entre versiones de Storyline, y un lote de cursos viejos
   casi seguro mezcla versiones. El menú del player expone
   `[role="treeitem"]` (rol ARIA estándar) y se clickea POR ÍNDICE,
   no por texto: así no depende del idioma ni del título.

   Y la espera de la timeline no es un `sleep` fijo: cada diapositiva
   anima distinto. Se captura cuando dos screenshots consecutivos
   salen idénticos — el mismo criterio que `visual-regress.mjs`.

   Uso:
     node tools/import-storyline.mjs <export-storyline/> <destino/> [opciones]
       --escala N     factor de resolución (default 2 = captura al doble)
       --calidad N    calidad WebP 0-1 (default 0.92)
       --puerto N     puerto del server temporal (default 8899)
   ============================================================ */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright-core';

const argv = process.argv.slice(2);
const [origen, destino] = argv.filter(a => !a.startsWith('--'));
const opt = (n, def) => { const i = argv.indexOf('--' + n); return i === -1 ? def : Number(argv[i + 1]); };
const ESCALA = opt('escala', 2), CALIDAD = opt('calidad', 0.92), PUERTO = opt('puerto', 8899);

if (!origen || !destino) {
  console.error('Uso: node import-storyline.mjs <export-storyline/> <destino/> [--escala 2] [--calidad .92] [--puerto 8899]');
  process.exit(1);
}
const SRC = path.resolve(origen), DST = path.resolve(destino);
if (!fs.existsSync(path.join(SRC, 'story.html')) || !fs.existsSync(path.join(SRC, 'html5', 'data', 'js', 'data.js'))) {
  console.error(`✗ ${SRC} no parece un export HTML5 de Storyline (falta story.html o html5/data/js/data.js).`);
  process.exit(1);
}

/* ---------- 1. estructura: qué diapositivas hay ---------- */
function leerProvideData(file) {
  // Storyline envuelve todo en window.globalProvideData('clave', '<json escapado>')
  const s = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').trim();
  const ini = s.indexOf("'"), coma = s.indexOf(',', ini);
  let payload = s.slice(s.indexOf("'", coma) + 1, s.lastIndexOf("')"));
  // el JSON viene con \" y \\ escapados como literal JS
  payload = payload.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  return JSON.parse(payload);
}

const data = leerProvideData(path.join(SRC, 'html5', 'data', 'js', 'data.js'));
/* Locución: Storyline la referencia como story_content/<id>_44100_<kbps>_<n>.mp3
   desde data.js. Es un total del curso, no atribuible a una diapositiva
   sin recorrer el modelo entero — para decidir "¿re-narro con TTS o le
   sumo audio grabado al kit?" alcanza con saber cuánto hay. */
const audioTotalCurso = new Set(
  (fs.readFileSync(path.join(SRC, 'html5', 'data', 'js', 'data.js'), 'utf8')
    .match(/[A-Za-z0-9]+_44100_\d+_\d+\.mp3/g) || [])).size;

/* ---------- 2. contenido: texto, capas y estados por diapositiva ---------- */
/* Se indexa por ARCHIVO, no por título. Cruzar por título es
   inherentemente frágil en Storyline, y el curso de referencia lo
   probó de dos formas a la vez:
     · la etiqueta del MENÚ y el título INTERNO de la diapositiva son
       campos distintos y editables por separado — la diapo 11 se
       llama "Logueo y precarga en PDA" en el menú y "Lo que vimos en
       este video" adentro;
     · ese título interno además está DUPLICADO en dos diapositivas,
       así que ni siquiera identifica una sola.
   Cuál archivo corresponde a cada diapositiva se resuelve al navegar:
   el player pide `html5/data/js/<hash>.js` de la diapo que abre, y
   eso se escucha por red (más abajo). */
const jsDir = path.join(SRC, 'html5', 'data', 'js');
const perfiles = new Map(); // nombre de archivo -> { texto[], capas, estados, audio }
for (const f of fs.readdirSync(jsDir)) {
  if (!f.endsWith('.js') || ['data.js', 'frame.js', 'paths.js'].includes(f)) continue;
  const t = fs.readFileSync(path.join(jsDir, f), 'utf8').replace(/^﻿/, '');
  if (!/"title":"/.test(t)) continue;
  const textos = [...t.matchAll(/"text":"((?:[^"\\]|\\.)*)"/g)]
    .map(m => {
      let s = m[1];
      try { s = JSON.parse('"' + s + '"'); } catch (e) { /* fragmento no parseable, se usa crudo */ }
      return s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    })
    .filter(s => s.length > 3);
  perfiles.set(f, {
    tituloInterno: (() => { try { return JSON.parse('"' + t.match(/"title":"((?:[^"\\]|\\.)*)"/)[1] + '"'); } catch (e) { return null; } })(),
    texto: [...new Set(textos)],
    capas: (t.match(/"kind":"slidelayer"/g) || []).length,
    estados: (t.match(/"kind":"state"/g) || []).length,
    /* El audio NO se cuenta acá: las pistas de locución se
       referencian TODAS desde `data.js` (el manifiesto global), no
       desde el JS de cada diapositiva — contarlas por diapo daba 0
       siempre, un dato falso. Se cuenta el total, más abajo. */
  });
}

/* ---------- 3. clasificación: qué es mecánico y qué es a mano ---------- */
function clasificar(d, i, perfil) {
  if (i === 0) return { tipo: 'portada', manual: true, motivo: 'la portada se rearma a mano (video/arte propio del molde)' };
  if (/^unidad\b/i.test(d.titulo)) return { tipo: 'separador de unidad', manual: true, motivo: 'los separadores de unidad se rearman a mano' };
  if (perfil && (perfil.capas > 1 || perfil.estados > 20)) {
    return { tipo: 'interactiva', manual: true, motivo: `${perfil.capas} capa(s) y ${perfil.estados} estado(s): la interactividad no sobrevive a una captura plana, se rehace con initShotSwap/[data-layers]` };
  }
  /* Video horneado en la captura (kit-base v1.9.61, hallazgo de la
     migración de "Surtido sin ventas"): el clasificador de arriba solo
     cuenta capas y estados, así que una diapositiva de VIDEO —que en
     Storyline suele tener una sola capa y pocos estados— caía en
     "simple", o sea "la captura sirve tal cual como `.d-shot-img`". Es
     justo lo que NO hay que hacer: capturarla plana hornea el
     reproductor de Storyline DENTRO de la imagen (§6.29, el bug que el
     cliente reportó como "el botón de play no funciona" — estaba
     tocando píxeles dibujados). En ese curso salieron dos así y se
     descubrieron mirando las imágenes a ojo, que es exactamente lo que
     esta herramienta existe para evitar.
     La señal barata es el texto ya extraído: si menciona video, se
     manda a revisión manual. Deliberadamente conservador — solo puede
     mover una diapositiva HACIA la pila "a mano", nunca al revés: un
     falso positivo cuesta una mirada de cinco segundos, un falso
     negativo cuesta un reproductor horneado que se descubre con el
     curso ya entregado. */
  const dice = (perfil?.texto || []).join(' ').toLowerCase();
  if (/\bv[ií]deo\b|\breproduc|\bmir[áa] el\b/.test(dice)) {
    return {
      tipo: 'posible video', manual: true,
      motivo: 'el texto menciona video: capturarla plana hornearía el reproductor de Storyline en la imagen (§6.29) — mirarla y, si es video, rehacerla con el patrón de video del kit'
    };
  }
  return { tipo: 'simple', manual: false, motivo: 'la captura sirve como .d-shot-img; falta texto accesible y narración' };
}

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'diapo';

/* ---------- 4. server local propio (sin dependencias) ---------- */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.xml': 'text/xml', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const abs = path.join(SRC, rel);
  if (!abs.startsWith(SRC) || !fs.existsSync(abs) || fs.statSync(abs).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(abs).pipe(res);
});
await new Promise(r => server.listen(PUERTO, r));

/* ---------- 5. capturas ---------- */
fs.mkdirSync(path.join(DST, 'img'), { recursive: true });
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: CHROMIUM, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: ESCALA });
/* Qué archivo de diapositiva pide el player al abrir cada una: es el
   único vínculo confiable entre lo que se ve y el modelo de datos
   (ver la nota sobre títulos más arriba). */
let pedidosJs = [];
page.on('request', r => {
  const m = r.url().match(/\/html5\/data\/js\/([\w]+\.js)$/);
  if (m && !['data.js', 'frame.js', 'paths.js'].includes(m[1])) pedidosJs.push(m[1]);
});
await page.goto(`http://localhost:${PUERTO}/story.html`, { waitUntil: 'networkidle' });
await page.waitForTimeout(7000); // arranque del player (carga el modelo y monta el menú)

// La misma idea que screenshotEstable() en visual-regress.mjs: no adivinar
// cuánto dura la animación de entrada, esperar a que la imagen se quede quieta.
async function capturaEstable(loc, maxMs = 12000, paso = 500) {
  let ant = await loc.screenshot();
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    await new Promise(r => setTimeout(r, paso));
    const act = await loc.screenshot();
    if (Buffer.compare(ant, act) === 0) return act;
    ant = act;
  }
  return ant;
}

// WebP sin dependencias: lo encodea el propio Chromium vía canvas.
async function aWebp(pngBuf, calidad) {
  const b64 = await page.evaluate(async ([png, q]) => {
    const img = new Image();
    await new Promise((ok, err) => { img.onload = ok; img.onerror = err; img.src = 'data:image/png;base64,' + png; });
    const c = document.createElement('canvas');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', q).split(',')[1];
  }, [pngBuf.toString('base64'), calidad]);
  return Buffer.from(b64, 'base64');
}

/* El ORDEN y los TÍTULOS salen del menú del player, no de `data.js`.
   BUG REAL encontrado con el curso de referencia: `data.js` lista la
   diapositiva 11 como "Lo que vimos en este video" cuando el menú
   —que es por donde se navega— dice "Logueo y precarga en PDA". Su
   orden interno no es el de reproducción, así que etiquetar las
   capturas con `data.js` las nombra mal EN SILENCIO: la imagen
   correcta con el título de otra. Con 20 cursos, eso se descubre
   tarde y a mano.
   Una diapositiva es un `[role="treeitem"]` SIN treeitems adentro;
   los nodos con hijos son escenas/grupos (un curso con varias
   escenas trae varios). Es estructural: no depende del idioma, del
   título ni de la versión de Storyline. */
const indicesDiapo = await page.$$eval('[role="treeitem"]', els =>
  els.map((e, i) => {
    /* El título viene DUPLICADO en cada ítem (la etiqueta visible y
       una copia para lector de pantalla), y Storyline le pega el
       estado a UNA sola de las dos ("Inicio del curso visitado" —
       pasa apenas el player marca la primera diapo como vista, antes
       de que esto corra). La copia más corta es la limpia; elegirla
       por longitud no depende del idioma del player, a diferencia de
       recortar la palabra "visitado"/"visited"/"completado". */
    const lineas = [...new Set((e.innerText || '').split('\n').map(t => t.trim()).filter(Boolean))];
    const titulo = lineas.sort((a, b) => a.length - b.length)[0] || '';
    return { i, titulo, esDiapo: e.querySelectorAll('[role="treeitem"]').length === 0 };
  }).filter(x => x.esDiapo && x.titulo));
const diapos = indicesDiapo.map(x => ({ titulo: x.titulo, menuIndex: x.i, lmsId: null }));
if (!diapos.length) { console.error('✗ no se encontró ninguna diapositiva en el menú del player'); await browser.close(); server.close(); process.exit(1); }

const salida = [];
let capturadas = 0, proporcion = null;
for (let i = 0; i < diapos.length; i++) {
  const d = diapos[i];
  const nombre = `${String(i + 1).padStart(2, '0')}-${slug(d.titulo)}`;
  const reg = { orden: i + 1, titulo: d.titulo, slug: nombre, captura: null };
  let perfil = null;
  try {
    pedidosJs = [];
    await page.locator('[role="treeitem"]').nth(d.menuIndex).click({ force: true, timeout: 10000 });
    const cont = page.locator('.slide-container').first();
    await cont.waitFor({ state: 'visible', timeout: 15000 });
    // El archivo que el player pidió al navegar ES el de esta diapositiva
    // (ver la nota sobre por qué no se cruza por título).
    for (const f of pedidosJs) if (perfiles.has(f)) { perfil = perfiles.get(f); break; }
    const png = await capturaEstable(cont);
    const webp = await aWebp(png, CALIDAD);
    fs.writeFileSync(path.join(DST, 'img', nombre + '.webp'), webp);
    const box = await cont.boundingBox();
    if (!proporcion && box) proporcion = box.width / box.height;
    reg.captura = `img/${nombre}.webp`;
    reg.kb = Math.round(webp.length / 1024);
    capturadas++;
  } catch (e) {
    reg.error = String(e).split('\n')[0].slice(0, 120);
  }
  // La clasificación necesita el perfil, que recién se conoce al navegar.
  const cls = clasificar(d, i, perfil);
  Object.assign(reg, cls, {
    archivoStoryline: perfil ? [...perfiles.entries()].find(([, v]) => v === perfil)[0] : null,
    tituloInterno: perfil?.tituloInterno ?? null,
    capas: perfil?.capas ?? null, estados: perfil?.estados ?? null,
    textos: perfil?.texto ?? []
  });
  salida.push(reg);
  process.stdout.write(`  ${String(i + 1).padStart(2, '0')} ${d.titulo.slice(0, 40).padEnd(42)}${reg.captura ? String(reg.kb) + ' KB' : 'FALLÓ'}  ${cls.tipo}${perfil ? '' : '  (sin perfil)'}\n`);
}

await browser.close();
server.close();

/* ---------- 6. salidas ---------- */
const meta = { origen: SRC, curso: data.projectId || path.basename(SRC), generadoPor: 'tools/import-storyline.mjs',
  proporcionStoryline: proporcion ? Number(proporcion.toFixed(3)) : null, proporcionKit: 2.0,
  diapositivas: salida };
fs.writeFileSync(path.join(DST, 'storyline-import.json'), JSON.stringify(meta, null, 2) + '\n');

const manual = salida.filter(s => s.manual), simples = salida.filter(s => !s.manual);
const audioTotal = audioTotalCurso;
const informe = `# Import de Storyline — ${meta.curso}

Generado con \`tools/import-storyline.mjs\` (kit-base v1.9.57).
**Esto no es un curso terminado**: son las capturas + el texto + la
estructura, listos para armar el curso con el molde del kit.

## Resumen

| | |
|---|---|
| Diapositivas | ${salida.length} |
| Capturas OK | ${capturadas}/${salida.length} |
| Mecánicas (captura sirve como está) | ${simples.length} |
| Requieren trabajo a mano | ${manual.length} |
| Proporción de Storyline | **${meta.proporcionStoryline ?? '?'}** (el kit usa **2.0** — ver §2.6) |
| Pistas de locución grabada | ${audioTotal} |

⚠️ **Reencuadre**: la proporción no coincide con la del kit. No se
recortó nada automáticamente (recortar perdería contenido en
silencio): cada captura hay que reencuadrarla a 2:1 antes de usarla
como \`.d-shot-img\`.

⚠️ **Videos**: no viajan en el export de Storyline. Las diapositivas
con video se rearman con \`coto-media.js\` y el archivo original
aparte — capturarlas planas hornea el reproductor de Storyline dentro
de la imagen (CLAUDE.md §6.29).

⚠️ **Locución**: Storyline trae audio grabado (${audioTotal} pistas); el kit
narra con \`speechSynthesis\` (TTS). O se re-narra con el texto de abajo,
o hay que sumarle al kit soporte de audio grabado (hoy no lo tiene).

## Requieren trabajo a mano (${manual.length})

${manual.map(s => `- **${String(s.orden).padStart(2, '0')} · ${s.titulo}** — _${s.tipo}_: ${s.motivo}`).join('\n') || '_ninguna_'}

## Mecánicas (${simples.length})

${simples.map(s => `- ${String(s.orden).padStart(2, '0')} · ${s.titulo} → \`${s.captura || '—'}\``).join('\n') || '_ninguna_'}

## Texto extraído por diapositiva

Sirve como guion de narración y como texto accesible (\`sr-only\`) —
revisarlo antes de usarlo: incluye nombres de objetos de Storyline
("Rectángulo 8", "Recurso 77.png") mezclados con el texto real.

${salida.map(s => `### ${String(s.orden).padStart(2, '0')} · ${s.titulo}\n\n${s.textos.length ? s.textos.map(t => `- ${t}`).join('\n') : '_sin texto extraído_'}`).join('\n\n')}
`;
fs.writeFileSync(path.join(DST, 'INFORME-IMPORT.md'), informe);

console.log(`\n✓ ${capturadas}/${salida.length} capturas en ${path.join(destino, 'img')}`);
console.log(`  ${simples.length} mecánicas · ${manual.length} a mano · proporción ${meta.proporcionStoryline} (kit: 2.0)`);
console.log(`  → ${path.join(destino, 'INFORME-IMPORT.md')} y storyline-import.json`);
