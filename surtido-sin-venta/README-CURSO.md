# Surtido sin venta — bitácora del curso

Curso SCORM 1.2 del molde **Área Aprendizaje (COTO)**, categoría
**Salón** (`data-cat="salon"`). Armado sobre **kit-base v1.9.80** con
`tools/new-course.mjs`, a partir del PDF del diseñador
(`Surtido sin venta`, 31 páginas).

Este archivo es la bitácora de ESTE curso. Lo que es del kit y no de
este curso está al final, en **Relay a `kit-base/`** — desde esta sesión
no se editó ni una línea de `kit-base/` (CLAUDE.md §0.1).

---

## 1. Estado

| | |
|---|---|
| Diapositivas | 13 (de 31 páginas de PDF) |
| Suite | **19 de 19 en verde** (17 del kit + 2 propios) |
| Radio de cajas y tarjetas | **30px fijos** (pedido del cliente, tokens `--r-lg`/`--r-xl`) |
| Máximo de puntos medido | **199** (sin los videos reales; 219 con ellos) |
| Medalla | bronce 104 · plata 124 · oro 169 (los "desde N" del cierre los pinta `curso.js` desde `NIVELES`) |
| Logros | **5** (tope del cliente para todos los cursos, ver K14) |
| Videos | **4 placeholders de 0 bytes** con el nombre final (portada, unidad 1 y los 2 del cuerpo) — el cliente los reemplaza sin tocar código |
| Baseline visual | grabada (`tools/visual-baseline/`, 13 capturas) |
| Evaluación | cuestionario aparte en la plataforma → **sin `masteryscore`** en el manifiesto (§3.11) |

```bash
COURSE_URL="http://localhost:8080/index.html" npm test      # 19/19
COURSE_URL="http://localhost:8080/index.html" npm run verify-hitboxes
node tools/verify-places.mjs http://localhost:8080/index.html
npm run check-assets && node tools/check-css-duplicates.mjs css/*.css
node tools/check-contraste.mjs && node tools/check-raw-cat-colors.mjs
COURSE_URL="http://localhost:8080/index.html" npm run visual-regress
```

---

## 2. De 31 páginas a 13 diapositivas

**Antes de contar diapositivas se contaron ESTADOS** (§7 paso 4). Lo que
más redujo: las 8 páginas de "Algunos conceptos importantes" son UNA
diapositiva con 8 variantes de la misma imagen, y las 8 páginas del mini
juego son UNA diapositiva con 4 capas.

| # | `data-slide` | Páginas | Técnica |
|---|---|---|---|
| 0 | `portada` | 1 | captura íntegra |
| 1 | `introduccion` | 2 | captura íntegra |
| 2 | `indice` | 3 | captura + `data-gate-popup="instrucciones"` |
| 3 | `unidad-1` | 4 | captura íntegra |
| 4 | `que-es` | 5 | captura íntegra |
| 5 | `conceptos` | 6–13 | captura + `initShotSwap` (8 variantes) + 7 hitboxes |
| 6 | `video-reporte` | 14 | captura + video real sobre el reproductor dibujado |
| 7 | `repaso-reporte` | 15 (+16, 17) | captura + 2 hitboxes → 2 pop-ups HTML |
| 8 | `video-acciones` | 18 | captura + video real |
| 9 | `repaso-acciones` | 19 (+20, 21) | captura + 2 hitboxes → 2 pop-ups HTML |
| 10 | `minijuego` | 22–29 | HTML real sobre la cáscara `coto-minijuego.css`, 4 capas |
| 11 | `consejos` | 30 | captura + 5 `[data-place]` de texto vivo |
| 12 | `cierre` | 31 | captura + resumen en 2 pasos (`coto-cierre.js`) |

**`pdfinfo` por página, y menos mal** (§6.32): el PDF **mezcla tamaños de
página**. 27 páginas son 2520×1260 (2:1 exacto, la proporción de trabajo
del molde) pero las 4 fichas de repaso vienen verticales y cada una
distinta: 759×802, 747×801, 747×984 y 762×982. Forzarlas al lienzo
panorámico las hubiera estirado en silencio. Por eso esas 4 se
reconstruyeron como pop-ups HTML reales en vez de entrar como captura —
que además deja el texto narrable, buscable y escalable.

### Decisiones que se apartan del brief, y por qué

1. **No hay diapositiva de mini-práctica aparte.** La gamificación
   completa es obligatoria (§6.17.1) y su punto 3 pide "al menos una
   mini-práctica, quiz o repaso": el mini juego de 5 conceptos con vidas
   ES esa pieza (`gamificacion.mjs` la reconoce por `.d-mj-panel`).
   Agregar además un `initMiniQuiz` hubiera sumado una pantalla que el
   índice del PDF no tiene.
2. **El cierre se desbloquea al ENTRAR**, no al terminar el mini juego.
   El gate del mini juego ya impide llegar al cierre sin terminarlo, así
   que una pantalla "🔒 bloqueada" que nunca se ve es exactamente el
   elemento muerto que §7.3 punto 4 prohíbe dejar en el HTML.
3. **La consigna de cada pregunta del mini juego queda horneada en la
   imagen de la escena.** El recorte es la franja completa del PDF
   (texto + ilustración): reinterpretarla como HTML era justo lo que
   §6.32 dice que el cliente NO pidió. El texto vive igual en un
   `.sr-only` por diapositiva, así que se narra y lo lee un lector de
   pantalla.
4. **Las 5 píldoras de "Últimos consejos" y el párrafo final del cierre
   se redibujan en HTML encima de las dibujadas**, con las mismas
   coordenadas medidas y el mismo token de color (`--cat`): el texto
   queda vivo y se corrigen dos errores del PDF (ver §5). Visualmente
   son indistinguibles del arte.

---

## 3. Cómo se midió cada cosa

**Ninguna coordenada se estimó a ojo** (§3 punto 4). Todas salen de
escanear el render a 2520×1260 con un script de PIL y se verificaron
mirando las capturas con overlay.

- **Las 7 píldoras de conceptos**: se detectaron por saturación de color
  en la columna izquierda → 7 bandas de 86 px de alto, todas en
  `x 379–754`, separadas 114,7 px. `data-l=15.040 data-w=14.921
  data-h=6.825`, tops de 30.794 % a 85.397 %.
- **El reproductor dibujado** (páginas 14 y 18): se buscó el rectángulo
  marrón del video → `x[842,1686] y[504,993]`, o sea 845×490. Ese mismo
  recorte es el `poster` (`img/poster-video-*.webp`), así que el `<video>`
  real cae EXACTAMENTE sobre el reproductor que dibujó el diseñador en
  vez de quedar horneado (§6.29 / §7.09 punto 3).
- **Las 4 tarjetas de repaso**: borde de la tarjeta por color de línea
  (#e8e8e8) + el aro de ícono amarillo que asoma arriba → el hitbox
  incluye el círculo, que es lo que el alumno percibe como parte de la
  tarjeta.
- **Los 2 números variables del panel final del mini juego**: se
  midieron sus bandas de texto (`y 941–979`) y se **blanquearon en la
  imagen** con un rectángulo blanco exacto (el fondo ahí es #FFFFFF
  puro, verificado pixel a pixel antes de pintar), para escribirlos
  encima como `[data-place]`. Los rótulos ("Preguntas completadas",
  "Puntos conseguidos") y el tercer stat NO son variables: se quedan en
  el arte. La primera pasada blanqueó 6 px de más y se comió el
  borde superior de "Puntos" — se vio mirando la captura, no leyendo el
  código.
- **El panel de la escena del mini juego**: `x[336,2192] y[268,991]`,
  1856×723. Ese número es el `--mj-escena-ratio` del curso; el kit
  advierte que si esa proporción no es la real, el `cover` recorta y
  cualquier cosa medida sobre el arte se corre.

Verificación visual: `npm run verify-hitboxes` (13 diapositivas, 0
sospechosos) **mirando las capturas**, más `tools/verify-places.mjs`
—herramienta propia— para los 9 `[data-place]`, que el overlay del kit
no dibuja (relay K2).

---

## 4. Puntaje y medalla

La tabla es una intención; **el contador es el hecho** (§7.3 punto 19).
Los tres umbrales NO se eligieron: salen del máximo medido con un
recorrido instrumentado, y ese recorrido es un test de la suite
(`tools/tests/puntaje-curso.mjs`), así que se vuelve a verificar en cada
corrida.

| Qué paga | Cuánto | Total |
|---|---|---|
| Abrir cada concepto (7) | 6 | 42 |
| Abrir cada ficha de repaso (4) | 8 | 32 |
| Ver cada video (2) | 10 | 20 ← **hoy no se puede ganar** |
| Acertar un concepto del mini juego **sin haber errado antes en él** | 25 | 125 |
| …acertarlo después de haber errado en él | 10 | — |

- **Máximo real medido hoy: 199.** Con los `.mp4` reales pasa a 219.
- **Piso garantizado por el gate: 74** (conceptos + fichas; terminar el
  mini juego no paga por sí solo). El bronce arranca ahí, así que quien
  termina el curso nunca se queda sin medalla (§6.10.6).
- **Umbrales: bronce 74 · plata 127 · oro 180.** Los puntos de los videos
  quedan descontados a propósito: contarlos dejaría el piso real por
  debajo del bronce, que es el bug exacto que §7.14 documenta.

### Las 3 patologías de §7.14, revisadas una por una

1. *Puntos que solo miden asistencia*: lo que el gate obliga son 74 de
   199 (37 %). El resto lo decide el desempeño en el mini juego.
2. *Premios binarios en actividades reintentables*: **no hay bonus por
   "completar el mini juego"**. Terminarlo es requisito de avance, no
   puntaje. Se sacó a propósito: un premio binario en algo que se
   reintenta sin límite es un premio por insistir.
3. *La parte que evalúa, pesando poco*: el mini juego pesa 125 de 199
   (63 %).

Y el guard de §6.53: **cada pregunta paga UNA sola vez en todo el curso**
(`estado.mjOk`, persistido en `suspend_data`). Sin eso, rejugar sería
puntaje infinito. Medido: rejugar entero no mueve el contador.

El test lo verifica con tres recorridos: perfecto (199), mínimo (74) e
"insistente" —errar cada pregunta una vez y recién después acertarla,
reintentando el juego las veces que haga falta— que paga **50 contra los
125 de acertar a la primera**. Es la diferencia entre premiar precisión
y premiar insistencia, medida.

---

## 5. Hallazgos de CONTENIDO (para el diseñador, no para el kit)

Auditados sobre el PDF **antes** de construir (§6.26).

1. **Página 30 — "Corregir proble / mas de exhibición".** La palabra
   "problemas" viene partida al medio dentro de la píldora. **Corregido
   en el curso**: la píldora se redibuja en HTML encima de la dibujada.
   Conviene arreglarlo también en el PDF.
2. **Página 31 — "ya estas habilitado"** → *estás*. **Corregido en el
   curso**, mismo mecanismo.
3. **Páginas 6 a 13 — "Hace clic para conocer…"** → *Hacé clic*. Está
   horneado en el arte y no se tocó: solo se corrigió en el texto
   narrado y accesible.
4. **Página 22 — "tenes que seleccionar"** → *tenés*. Ídem: horneado, se
   corrigió solo en la narración.
5. **Página 3 (índice) — la lista queda alineada en escalera**: cada
   renglón arranca más a la izquierda que el anterior. Se dejó tal cual:
   es alineación, no una errata, y rehacerla sería reinterpretar el arte
   (§6.32 / §6.56). Si el diseñador la reexporta alineada, el curso la
   toma sin tocar código.
6. **Contraste del texto blanco sobre el amarillo de Salón.** Medido:
   blanco sobre `--cat` (#F0BE00) da **1.74:1**. El propio sistema de
   diseño ya tiene la respuesta para esta categoría: `--on-cat` de
   `salon` es navy (#1E2D46), que da **7.95:1**. Afecta las 5 píldoras de
   "Últimos consejos" y el párrafo final del cierre — **son del arte
   original**, así que se reprodujeron tal cual y NO se cambiaron sin
   pedido (§6.56). Si el cliente aprueba, es una línea de CSS en
   `diapositivas.css` (`color:var(--on-cat)` en `.d-consejo p` y
   `.d-cierre-eval p`).
7. **El PDF mezcla tamaños de página** (ver §2). No es un error en sí
   —las fichas son pop-ups y tiene sentido que sean verticales— pero
   conviene saberlo: si en algún momento se pide que entren como
   diapositiva, hay que rediagramarlas a 2:1.

---

## 6. Relay a `kit-base/`

Formato de §0.1: **síntoma → diagnóstico contra el código real → cómo se
verificó**. Nada de esto se arregló en `kit-base/` desde acá; los
parches locales que hubo están en el CSS/JS de este curso y se señalan
como tales.

Separado a propósito en **lo que se probó** y **lo que solo se sospecha**.

### K1 · `.d-mj` no tiene alto propio, y el kit no dice quién se lo da — PROBADO

- **Síntoma.** `hitbox-click-check` en rojo:
  `[minijuego] "¡Empecemos! Comenzar el mini juego": tamaño 0×0 (no
  inicializado o roto)`. En pantalla, la capa de portada del mini juego
  no dibujaba nada. Cero errores de consola.
- **Diagnóstico contra el código real.** `coto-minijuego.css` línea 35:
  `.d-mj{ flex:1 1 auto; min-height:0; width:100% }` y línea 53
  `.d-mj-panel{ height:100% }`. `.slide` (coto-shot-stage.css) es
  `display:flex; align-items:center`, así que el alto de `.d-mj` sale de
  su contenido: el `height:100%` del panel se resuelve contra `auto` y
  colapsa, y con él `.d-mj-shot` —que además tiene `container-type:size`,
  o sea contención en los dos ejes—. **Es exactamente el mecanismo que
  el kit ya corrigió un nivel más abajo en v1.9.61 (§7.09 punto 1)**,
  cuando le puso `height:100%` a `.d-mj-shot`: el contenedor de arriba
  quedó con la misma deuda.
- **Por qué es del kit y no de este curso.** Auditando el curso de
  referencia ("Seguridad alimentaria") aparece el mismo pegamento
  escrito a mano: `.slide-minijuego{display:flex}` en su `pulido.css` y
  `.slide-minijuego .slide-inner{flex:1 1 auto; width:100%; height:100%;
  display:flex; flex-direction:column}` en su `diapositivas.css`, con un
  comentario que explica por qué hacen falta los dos. Dos cursos, las
  mismas 5 líneas, redescubiertas por separado.
- **Verificación.** `hitbox-click-check` rojo → verde con
  `[data-slide="minijuego"]{align-items:stretch}` +
  `.d-mj{align-self:stretch; height:100%; min-height:0; display:flex;
  flex-direction:column}` (está en `css/diapositivas.css` de este curso,
  comentado como parche local).
- **Propuesta.** Que `coto-minijuego.css` se haga cargo —ya es dueño de
  `.d-mj`— o, si depende de cómo cada curso arme la diapositiva, una
  fila en `contrato-cableado` con la consecuencia escrita.

### K2 · `verify-hitboxes.mjs` NO dibuja los `[data-place]`, y §7.3 punto 9 dice que sí — PROBADO

- **Síntoma.** `npm run verify-hitboxes` informó
  `[consejos] 0 hitbox(es)` en una diapositiva que tiene 5 `[data-place]`
  encima del arte.
- **Diagnóstico.** `tools/verify-hitboxes.mjs` línea 145:
  `Array.from(shot.querySelectorAll('[data-hit]'))`. La cadena
  `data-place` no aparece en todo el archivo (`grep`). Mientras tanto
  §7.3 punto 9 dice, textual: *"El overlay de hitboxes también dibuja los
  `[data-place]`, y hay que mirarlos… Se ve corriendo
  `tools/verify-hitboxes.mjs` y mirando las capturas"*. La regla existe,
  la herramienta no la cumple, y es una regla sobre algo que **no rompe
  nada** (un `[data-place]` mal puesto solo se superpone al arte) — o
  sea, la única forma de verlo era justamente esa.
- **Verificación.** Se escribió `tools/verify-places.mjs` en este curso
  (herramienta local, no va al kit tal cual): dibuja los 9 `[data-place]`
  de este curso, revelando además las capas ocultas de a una. Con eso se
  confirmó la posición de las 5 píldoras de "Últimos consejos", los 4
  números de los paneles finales del mini juego y el párrafo del cierre.
- **Propuesta.** Una línea en `verify-hitboxes.mjs`
  (`'[data-hit], [data-place]'`, con otro color para distinguirlos, que
  es lo que §7.3 describe). Si se decide no hacerlo, corregir §7.3 punto
  9 — hoy manda a mirar algo que no se dibuja.

### K3 · El pop-up "Cómo recorrer el curso" que genera el kit narra VACÍO — PROBADO

- **Síntoma.** `Narrador.textOf()` sobre
  `[data-popup="instrucciones"] .modal-card` devuelve **cadena vacía**.
  O sea: el primer pop-up que ve un alumno de CUALQUIER curso generado
  no se narra. `initPopupNarration()` corre, llama a `speak('')` y no
  pasa nada. Sin error.
- **Diagnóstico.** `narrador.js` línea 515:
  `TEXT_SEL = 'h2, p, dt, dd, li, .d-q-title, .d-opt-text, .d-quiz-fb,
  .d-quiz-result, .who, .d-cert-note, .d-instr-item'`. El modal que
  escribe `new-course.mjs` usa `<h3>` en `.d-instr-hd` y, en cada
  tarjeta, `.d-instr-card > div > b` + `span`. **Ninguno entra.**
  `.d-instr-item` —que sí está en la lista— es la clase de la grilla de
  tips de *Ayuda* (§6.54 punto 4), otra pieza: el rediseño v3 del
  instructivo (§6.10.2 / §6.20) cambió el marcado y `TEXT_SEL` nunca lo
  siguió.
- **Verificación.** Se volcó el `textOf()` de los 8 pop-ups del curso:
  el de instrucciones era el único vacío. Con
  `Narrador.addTextSel('.d-instr-modal h3, .d-instr-card > div > b,
  .d-instr-card > div > span')` (parche local, en `js/curso.js`) pasa a
  narrar *"Cómo recorrer el curso. Es interactivo. Mirá los videos…"*.
- **Propuesta.** Sumar `.d-instr-card b, .d-instr-card span` (y el `h3`
  del modal) a `TEXT_SEL` en `narrador.js`. Es del kit por definición:
  el marcado lo escribe el kit y el selector también.

### K4 · El glosario del boilerplate narra las pistas de candado, y pegadas — PROBADO

- **Síntoma.** `textOf()` del pop-up de glosario devolvía, por cada
  término: *"…No aparece en el envase.Se desbloquea al llegar a
  «Algunos conceptos importantes»."* — la pista del candado narrada
  aunque el término esté DESBLOQUEADO, y pegada al final de la
  definición sin espacio.
- **Diagnóstico.** Dos cosas que se suman:
  1. `coto-base-addendum-v1.8.css` líneas 837-838 esconden
     `.d-gloss-def`/`.d-gloss-hint` con `display:none`, y `textOf()`
     filtra por el **atributo** `hidden`, nunca por el display calculado.
     Es la trampa F1 que el propio §7.21 documenta — solo que acá la
     produce el marcado que recomienda el kit.
  2. Los dos `<span>` viven en el mismo `<dd>`, así que `textContent`
     los concatena sin separador.
  El addendum ya dice, en el encabezado de su §21, que *"la frase de
  entrada va con `[data-narrate-only]` para no narrar los 16 términos de
  corrido"* — pero `index-boilerplate.html` (lo que escribe
  `new-course.mjs`) **no emite ese párrafo**. La regla está y el marcado
  generado no la cumple.
- **Verificación.** Se volcó el `textOf()` del pop-up antes y después de
  agregar `<p class="d-glossary-intro" data-narrate-only>` al marcado:
  pasa de los 12 términos con sus 12 pistas a la sola frase de entrada.
- **Propuesta.** Que el boilerplate emita ese párrafo; y, aparte, que
  `initGlossaryUnlock()` marque `.d-gloss-hint`/`.d-gloss-def` con el
  atributo `hidden` además de la clase — así el glosario queda bien
  narrado incluso en un curso que decida narrarlo entero.

### K5 · `puntaje-maximo.mjs` no puede medir un mini juego, y declarar el máximo obliga a mentir — PROBADO

- **Síntoma.** Contra este curso, el test informa
  `puntaje medido: 74`, cuando el máximo real es **199**.
- **Diagnóstico.** Su recorrido toca
  `[data-hit], [data-shot-swap-step], [data-shot-swap-go],
  [data-popup-trigger], [data-layer-trigger], [data-repaso-ans]`. Las
  respuestas de un mini juego son `<button class="d-mj-opt">` que el
  curso fabrica con `innerHTML` — no están en esa lista. Y aunque
  estuvieran, tocarlas todas no sería "el máximo": las incorrectas
  cuestan vidas. O sea que no es un selector que falte, es que **un
  recorrido genérico no puede jugar un juego**.
- **La consecuencia incómoda.** `data-puntaje-max` es todo o nada: si
  este curso declara 199, el test falla; si declara 74, el test pasa
  afirmando algo falso. Este curso **no lo declara** —el test informa y
  no exige, que es el comportamiento documentado— y verifica su máximo
  en `tools/tests/puntaje-curso.mjs`, que sí juega el juego (perfecto,
  mínimo e "insistente").
- **Verificación.** Los dos tests conviven en la suite y dan verde: el
  del kit informando 74, el del curso midiendo 199 / 74 / 50.
- **Propuesta.** Un gancho opcional —del estilo
  `window.__PUNTAJE_RECORRIDO__()` que el curso implemente y el kit
  llame— para que `puntaje-maximo` pueda pedirle al curso que complete
  lo que el recorrido genérico no alcanza. Si no, dejar escrito en §7.3
  punto 19 que un curso con mini juego declara su máximo en un test
  propio.

### K6 · Los overlays del kit miden la tipografía en `cqw` del ESCENARIO, no del arte — PROBADO en el curso, SOSPECHADO en el kit

- **Síntoma (en este curso, y está corregido acá).** En un teléfono
  acostado real (750×340, `openCourseMobile`, contexto táctil) el texto
  de las 5 píldoras de "Últimos consejos" **se derramaba fuera de la
  píldora**, blanco sobre blanco e ilegible.
- **Diagnóstico.** `.d-stage` es el contenedor de consulta
  (`container-type:size`), así que `1cqw` es el 1 % del ESCENARIO. Pero
  fuera del rango de proporción donde la captura llena el frame
  (`@container (min-aspect-ratio:1.5) and (max-aspect-ratio:2.2)`,
  coto-shot-stage.css), `.d-shot` queda letterboxeada y bastante más
  angosta. Medido en ese viewport: escenario 750 px de ancho, `.d-shot`
  **366 px** → `1cqw` vale más del doble que el 1 % del arte, y una
  tipografía dimensionada así sale al doble de tamaño.
- **Verificación / fix local.** Cada overlay pasa a ser su propio
  contenedor (`container-type:inline-size`) y la tipografía se mide
  contra ÉL: 5.2 % del ancho de la píldora, que es la proporción real
  medida sobre el arte. Con eso escala parejo en cualquier tamaño;
  verificado con capturas en 1600×900 y en 750×340 táctil.
- **Lo que es SOSPECHA y no está probado.** El kit dimensiona así sus
  propios overlays del panel final del mini juego
  (`.d-mj-fin-tit{font-size:clamp(1.1rem, 2.6cqw, 1.9rem)}`,
  `.d-mj-fin-stat b`, `.d-mj-fin-sub`, coto-minijuego.css). Esos viven
  dentro de `.d-mj-fin`, que es `container-type:size` — otro contenedor,
  con el mismo desfasaje potencial entre su ancho y el del `.d-shot` de
  adentro. **No lo reproduje**: en este curso los números finales son
  cortos y no llegaron a desbordar. Lo dejo anotado como algo para mirar
  con un texto largo, no como bug confirmado.
- **Propuesta.** Dejar la receta escrita (un overlay que lleva texto se
  declara `container-type:inline-size` y se dimensiona contra sí mismo)
  donde se la busque: §7.3, o el encabezado de `coto-shot-stage.css`
  junto a `.d-shot-hit`.

### K7 · Los flotantes de Ayuda/Configuración tapan contenido interactivo en pantallas bajas — PROBADO

- **Síntoma.** En 750×340 táctil, los dos botones flotantes del kit
  tapaban la cuarta píldora de opción del mini juego ("Falso stock") y
  la tarjeta "Reglas".
- **Diagnóstico.** `.d-fab-stack{position:fixed; right:22px;
  bottom:80px; z-index:60}` (coto-player-chrome.css). En una
  diapositiva-captura eso solo tapa arte y no importa; en una
  diapositiva de layout HTML a todo el ancho, tapa controles. Y **ningún
  test lo ve**: `hitbox-click-check` solo mira `[data-hit]`, y estos
  botones no lo son.
- **Verificación.** Capturas antes/después en el mismo viewport táctil.
  Fix local: `padding-right` en `.d-mj-play` por debajo de 560 px de
  alto, reservando el ancho de la pila (52+22 px, 46+14 en mobile).
  No se movieron los flotantes: su posición es del kit y tiene que ser
  la misma en todo el curso.
- **Propuesta.** Una clase utilitaria del kit (o una regla con `:has()`)
  que reserve esa canaleta en diapositivas que no son captura.

### K8 · Documentación que dice algo distinto del código — PROBADO, todo menor

Familia §6.69. Ninguno rompe nada; todos hacen dudar:

- `kit-base/PROMPT-CURSO-NUEVO.md` dice *"usando el kit adjunto
  (`kit-base/`, v1.9.71)"* — el kit es **1.9.80** (`README.md` línea 3 y
  `package.json`). Como ese prompt se copia tal cual a cada chat nuevo,
  el número viaja mal a todos lados. **De hecho el prompt con el que
  arrancó este curso decía "9/9 en verde"**, de una copia todavía más
  vieja; el kit real corre 17.
- `CLAUDE.md` §7 paso 1 dice *"los **16** tests de `tools/tests/`"*.
  Son **17** (`ls tools/tests/*.mjs | grep -v '/_' | wc -l`). Y lo
  llamativo: §7.26 —la sección de esta misma v1.9.80— dice que §7
  *"pasó a listar los 15 JS, 13 CSS y 16 tests reales"*. O sea que la
  ronda que fue a corregir el número lo dejó errado por uno (los 15 JS
  y los 13 CSS sí dan). Mientras tanto `PROMPT-CURSO-NUEVO.md` dice
  17/17, así que las dos cifras conviven en el mismo zip.
- La plantilla `js/curso.js` se presenta como *"kit-base v1.9.40"* y su
  checklist dice *"correr `tools/tests/*.mjs` (los **7**, exit 0 en
  todos)"*. Mismo texto en `kit-base/README.md`, paso 4 de "Arrancar un
  curso nuevo".
- `kit-base/README.md` describe `tools/tests/` como *"suite pass/fail
  genérica, **7 tests**"* y lista 12 archivos JS en el árbol cuando hay
  15.

Sugerencia de método, no de texto: los números que describen el contenido
del propio kit (cuántos tests, cuántos módulos, qué versión) son
exactamente la clase de afirmación que §6.60 dice que no se escribe a
mano — un chequeo de una línea en `npm run test:kit` que compare el
conteo real contra el documentado los mantendría sincronizados solos.

### K9 · `[data-narrate-only]` funciona en los pop-ups y no en las diapositivas — PROBADO

- **Síntoma.** El cliente pidió que la diapositiva de índice locutara
  solo su título y el nombre del curso, sin enumerar los 7 ítems del
  temario (que en pantalla están horneados en la captura, y en el DOM
  viven como `<ul class="sr-only">` porque son el único acceso que tiene
  un lector de pantalla a esa imagen). O sea: sacar algo de la VOZ sin
  sacarlo de la accesibilidad.
- **Diagnóstico.** El kit ya tiene exactamente esa convención:
  `initPopupNarration()` (coto-ui.js) hace
  `pop.querySelector('[data-narrate-only]') || pop.querySelector('.modal-card')`
  y narra solo ese nodo. Pero la narración de DIAPOSITIVA no pasa por
  ahí: `initPlayer()` recibe `speakSlide` y el curso le pasa la
  `<section>` entera a `Narrador.textOf()`. La convención existe, está
  documentada, y del lado de las diapositivas no la mira nadie.
  Los otros dos atributos de la familia (`[data-narrate-last]`,
  `[data-narrate-prefix]`) sí viven dentro de `textOf()` y por eso
  funcionan en los dos lados; `[data-narrate-only]` quedó del lado de
  quien llama.
- **Verificación.** Con `speakSlide` mirando primero
  `s.querySelector('[data-narrate-only]')`, el índice pasa de locutar el
  temario completo a decir exactamente *"Índice de contenidos. Control
  de surtido sin venta."*, y la lista sigue intacta en el DOM (7 `<li>`,
  chequeado en `tools/tests/reporte-cliente.mjs`).
- **Propuesta.** Que la plantilla `js/curso.js` traiga ese
  `querySelector` en su `speakSlide` —son dos líneas y es el lugar donde
  cada curso lo copia—, o que `textOf()` respete el atributo desde
  adentro, como ya hace con los otros dos.

### K10 · El motor de voz falso de `locucion-control.mjs` nunca se instala — PROBADO

- **Síntoma.** Armando un test propio copié la técnica del kit
  (`tools/tests/locucion-control.mjs`): reemplazar `speechSynthesis` por
  un motor falso que tarda 300ms por fragmento, para poder medir el caso
  "responder a MITAD de la locución". No medía nada: el motor falso no
  registraba una sola emisión.
- **Diagnóstico.** `locucion-control.mjs` instala su motor con una
  **asignación simple** dentro de `addInitScript`:
  `window.speechSynthesis = { … }`. `speechSynthesis` es un accessor de
  solo lectura del `Window`, así que en modo sloppy —que es como corre
  un `addInitScript`— **la asignación falla en silencio**: no tira, no
  avisa, y `window.speechSynthesis` sigue siendo el motor real.
- **Verificación, medida en el mismo Chromium de la suite**
  (`/opt/pw-browsers/chromium-1194`):
  - después de `window.speechSynthesis = {…}`, `getVoices()` sigue
    devolviendo la lista real (vacía en headless), no la del falso;
  - con `Object.defineProperty(window, 'speechSynthesis', {…})` sí queda
    una propiedad propia que tapa al accessor, y a partir de ahí el
    motor falso registra todo.
  Mi test usa `defineProperty` por eso, con el porqué escrito al lado.
- **El límite de lo que probé, y vale decirlo:** verifiqué que el motor
  falso NO se instala. **No** audité una por una las aserciones de
  `locucion-control.mjs` para decir cuáles quedan vacías — el test pasa
  en verde y algunas de sus cuentas (cuántas veces se llamó a
  `Narrador.speak`) siguen siendo válidas contra el motor real. Lo que sí
  es seguro es que el escenario por el que ese test dice existir
  —*"sin esto, el caso 'silenciar a mitad de la frase' —que es justo el
  que importa— no existe"*, dice su propio encabezado— no se está
  ejercitando.
- **Propuesta.** Cambiar las dos asignaciones por `defineProperty` (el
  test también reemplaza `SpeechSynthesisUtterance`, con el mismo
  problema) y, ya que estamos, que el propio test verifique que su motor
  quedó instalado antes de medir: dos líneas que convierten un test que
  puede volverse mudo en uno que avisa.

### K11 · `Logros.restore()` no valida contra el catálogo y `unlock()` sí — PROBADO

- **Síntoma.** El chip del header mostró **"7/6 logros"**: más obtenidos
  que el total del catálogo. La grilla, mientras tanto, seguía dibujando
  6 tarjetas — o sea que el número miente y nada más lo delata.
- **Diagnóstico contra el código real.** Las dos puertas de entrada al
  mismo conjunto aplican criterios distintos (`coto-logros.js`):
  - `unlock(id)` valida: `var b = BADGES.filter(x => x.id === id)[0];
    if (!b) return false;` — un id que no está en el catálogo no entra.
  - `restore(s)` NO valida:
    `(s.b || []).forEach(function (id) { obtenidos[id] = true; });`
  Y el HUD hace `Object.keys(obtenidos).length + '/' + BADGES.length`,
  así que cualquier id de más infla el numerador contra un denominador
  fijo.
- **De dónde sale un id que ya no existe.** De probar builds sucesivos
  sobre la misma carpeta o el mismo LMS: `scorm-api.js` deriva su clave
  de respaldo de la RUTA del paquete, así que dos versiones del curso
  servidas desde el mismo lugar comparten estado. Si entre una y otra
  cambió el catálogo de logros, el id viejo sobrevive en el
  `suspend_data` y se sigue contando. Es la misma familia que §7.3
  punto 20 (el cliente probando builds encima del anterior).
- **Verificación.** Reproducido de forma determinística: se escribe un
  `suspend_data` con los 6 ids reales + `'fantasma'`, se recarga, y el
  chip dice exactamente `7/6` con 6 tarjetas dibujadas. Queda como
  chequeo permanente en `tools/tests/reporte-cliente.mjs`.
- **Lo que NO era.** La hipótesis del reporte —un logro contándose dos
  veces al reingresar a una diapositiva— no puede pasar: `obtenidos` es
  un conjunto indexado por id y `unlock()` corta con
  `if (obtenidos[id]) return false;`. Otorgar dos veces el mismo logro
  no suma dos.
- **Parche local.** Se filtra en `curso.js`, antes de llamar a
  `restore()`, contra el catálogo que vive ahí mismo — no se tocó el
  archivo del kit, así que el próximo zip de `kit-base/` no se lleva
  puesto el arreglo por accidente.
- **Propuesta.** Que `restore()` aplique el mismo criterio que
  `unlock()`: ignorar los ids que no estén en `BADGES`. Es una línea, y
  deja el invariante "obtenidos ≤ total" garantizado por el módulo en
  vez de por cada curso.

### K12 · El ancla provisional de §7.18 K2 hace fallar a `overlays-colocados`, de forma intermitente — PROBADO

- **Síntoma.** `overlays-colocados` falló **1 de cada 3 corridas** con
  `[minijuego] (capa "mj-fin-ok") "d-place d-mj-fin-stat": cae fuera de
  su [data-shot] (0, 788 sobre 1600×780)`. En las otras dos, verde. Un
  test que a veces está rojo es exactamente lo que §6.60 / §7.3 punto 17
  dicen que enseña a mirar la suite y asumir que "siempre está así".
- **Diagnóstico.** Los dos overlays viven en un `[data-panel][hidden]`.
  Un `[data-shot]` oculto mide 0×0, así que `_initShots()` no puede
  calcular coordenadas y el motor les aplica su **ancla provisional**
  (`left:0; top:0`, kit-base v1.9.72, §7.18 K2) — que es una mejora
  deliberada, para que no caigan fuera del lienzo. El problema es que
  `overlays-colocados` revela la capa y mide **en el mismo turno
  sincrónico**, sin que el `ResizeObserver` llegue a correr: lo que mide
  es el ancla. Y el ancla, sobre `.d-mj-fin > .d-shot`, cae en (0, 788),
  fuera del `[data-shot]`.
  O sea: **la mitigación del kit dispara el test del kit.** La
  intermitencia viene de que el ancla solo se aplica
  `if (!h.style.left)` — una vez que algo posicionó los overlays de
  verdad, no vuelve.
- **Lo mismo, del lado del alumno.** Un `slidechange` sí dispara el
  recálculo; un `layerchange` **no**. Un curso que pone overlays dentro
  de capas depende del `ResizeObserver`, o sea de un frame de más: la
  primera vez que se abre el panel final, los dos números se pintan un
  instante en la esquina del arte y después saltan a su lugar.
- **Verificación.** Antes: 2 fallos en 6 corridas. Después de
  posicionar los paneles ocultos UNA vez al arranque (revelar → medir →
  volver a ocultar, todo en el mismo turno, sin que el navegador pinte
  en el medio): **10 corridas seguidas en verde**. Requiere además sacar
  `loading="lazy"` de esas dos imágenes — una imagen lazy dentro de un
  panel oculto no se descarga nunca, y sin `naturalWidth` `place()` sale
  por su guard y no hay nada que medir.
- **Propuesta.** Dos caminos, no excluyentes: que `_initShots()` se
  vuelva a correr ante `layerchange` igual que ante `slidechange` (es
  donde el kit ya tiene el resto de la familia "¿quién lo apaga?", y
  `initLayerVideos` es el precedente exacto para la mitad de video); y
  que `overlays-colocados` espere un frame entre revelar una capa y
  medirla, para no medir el ancla que el propio kit puso.

### K13 · Nada avisa si un curso se entrega con el ícono placeholder — PROPUESTA, no bug

`new-course.mjs` deja en `img/icono-<cat>.webp` un WebP de **1×1
transparente**, y lo hace por una buena razón que documenta ahí mismo:
un `src` roto sería un 404, y la suite cuenta cualquier error de consola
como fallo, así que un curso recién generado arrancaría en rojo por un
asset que el diseñador todavía no entregó.

El costo es que la pastilla dorada del header se ve **vacía** y ningún
test lo nota: no hay error, el `src` resuelve, la imagen "existe". Este
curso se entregó así una vuelta entera. Un chequeo de una línea
—`naturalWidth <= 1` en el `<img>` de marca— lo convierte en un aviso.
Encaja en `markup-sanity` (que ya mira este tipo de cosas) o en
`gamificacion` (que ya decide si el curso "está en construcción" por
cantidad de contenido, y podría no exigirlo hasta ese piso).

### Lo que NO es relay

Cosas que aparecieron y que, mirándolas, son de este curso y no del kit:

- Que `.d-mj-body` sea de 2 columnas no es un bug: es el molde de
  "Seguridad alimentaria". Este PDF dispone el juego en filas, así que
  el curso pisa el grid. Es contenido.
- Que `--bg` (celeste de marca) se vea detrás del mini juego tampoco:
  es el default correcto para una diapositiva sin captura a sangre.
  Este PDF pone el juego sobre blanco, así que el curso lo pinta.
- Que `initShotSwap` dispare `onChange` N−1 veces está documentado y es
  lo correcto (la variante 0 se ve al entrar). Acá encaja perfecto: la
  variante 0 no es ningún concepto.

### K14 · Tope de 5 logros por curso — CONVENCIÓN NUEVA del cliente, no bug

**Qué pasó.** El cliente fijó, para TODOS los cursos y no solo para
este, un máximo de **5 logros** en el catálogo. Este curso tenía 6 y se
bajó a 5 fusionando los dos que medían lo mismo partido en dos.

**Por qué es del kit.** El catálogo de logros es contenido del curso
(así lo dice `coto-logros.js` en su cabecera, y está bien), pero el
**tope** no: es una regla de producto que vale para todos. Hoy nada la
sostiene — un curso nuevo puede declarar 8 logros y toda la suite pasa
en verde.

**Propuesta, dos piezas chicas:**

1. Anotarlo en `CLAUDE.md` §1, junto a "qué va en el kit y qué va en el
   curso": *el catálogo de logros lo define el curso, con un máximo de
   5*.
2. Un chequeo en `gamificacion.mjs`, que ya cuenta los logros del
   catálogo (imprime "5 logro(s) en el catálogo"): que falle por encima
   de 5. Es una línea, y convierte una regla verbal en una que no se
   puede olvidar.

Ojo con un detalle que este curso ya pagó: bajar el catálogo deja ids
viejos en el `suspend_data` de quien ya venía jugando, y el chip pasa a
decir "6/5". Eso es K11 (`Logros.restore()` no valida contra el
catálogo) visto desde otro ángulo — y es un argumento más para
arreglarlo en el kit, porque ahora **cualquier** curso que aplique este
tope va a pisarlo.

### K15 · El `.d-shot-hit-play` del kit no trae ícono, y su marcado de ejemplo tampoco — PROBADO

**Síntoma.** Siguiendo al pie de la letra el marcado que documenta
`coto-media.js` para el botón de play:

```html
<button type="button" class="d-shot-hit-play">Reproducir</button>
```

lo que se ve es el círculo azul del kit con la **palabra "Reproducir"**
adentro, en texto negro, desbordando el círculo — no un triángulo de
play.

**Diagnóstico contra el código real.** `coto-media.css` estiliza el
ícono asumiendo que alguien lo pone:

```css
.d-shot-hit-play svg { width: 40%; height: 40%; fill: #fff; margin-left: 8%; }
```

pero ni el CSS trae un `::before` de fallback ni `initInlineCircleVideos`
inyecta un `<svg>` (se verificó: el único `innerHTML` con un `<svg>` en
ese módulo es el del cartel de error, línea 165). O sea: el componente
está completo salvo el ícono, y el ejemplo de la documentación produce
un botón roto. El curso de referencia no lo destapa porque usa la
variante `--art`, con una imagen propia del cliente.

**Cómo se verificó.** Se montó el botón exactamente como lo documenta el
kit y se miró el render; después se puso el `<svg>` a mano y quedó bien
(64×64, círculo navy, triángulo blanco, hover y apagado al reproducir,
todo del kit).

**Propuesta.** Cualquiera de las dos, pero una:
- que `initInlineCircleVideos()` inyecte el `<svg>` del triángulo cuando
  el `.d-shot-hit-play` no tenga uno (y deje el texto como `.sr-only`),
  que es lo que hace el kit en otros lugares; o
- que el ejemplo de la documentación traiga el `<svg>` y un
  `<span class="sr-only">`, como lo escribió este curso.


### K16 · Ayuda y Configuración se abren con el mouse encima, y no hay forma de pedir "solo clic" — PROBADO

**Síntoma.** Los dos flotantes de abajo a la derecha abren su panel al
pasar el cursor por encima, sin clic. Reportado por el cliente.

**Diagnóstico contra el código real.** `coto-player-chrome.css` los
muestra con tres condiciones en OR:

```css
.d-fab:focus-within .d-fab-pop,
.d-fab.is-hover   .d-fab-pop,
.d-fab.is-open    .d-fab-pop { opacity:1; pointer-events:auto; visibility:visible; … }
```

`.is-open` es el pin por clic (`initPinnedPopover`, coto-player.js
§510). `.is-hover` la agrega `attachHoverGrace(it, 'is-hover', graceMs)`
en la misma función, sin opción de apagarlo: `initPinnedPopover` acepta
`graceMs` y `onOpen`, nada para decir "este grupo abre solo con clic".

No es un bug a secas —abrir con hover es una decisión de producto
razonable y está documentada como "la gracia"— pero **no se puede
elegir**, y el kit ya pagó dos parches alrededor de ese hover: el
`closeAll()` que tiene que sacar las dos clases (v1.9.40) y el `blur()`
del segundo clic, que existe solo para pelear contra `:focus-within`
(v1.9.72, §7.19 A5).

**Cómo se verificó.** Con el mouse sobre el botón, `visibility` del
`.d-fab-pop` daba `visible` sin ningún clic. Con el override del curso
da `hidden`, y `visible` recién al clickear. Está como punto 7 de
`tools/tests/reporte-cliente.mjs`.

**Workaround del curso** (en `pulido.css`, no en el kit): se apagan
`:focus-within` y `.is-hover` y se deja `.is-open`. Sacar
`:focus-within` no rompe el teclado, porque Enter sobre el botón
dispara el mismo `click`.

**Propuesta.** Una opción en `initPinnedPopover`, por ejemplo
`opts.soloClic`, que (a) no llame a `attachHoverGrace` y (b) agregue una
clase al contenedor —`.d-fab--solo-clic`— para que el CSS del kit pueda
excluirlo de las dos condiciones que no son el pin. Con eso el curso no
tiene que reescribir una regla del kit para cambiar de opinión sobre un
gesto.


### K17 · El kit dice "el máximo posible del curso" para cualquier puntaje por encima del último nivel — PROBADO

**Síntoma.** El cliente mandó una captura del cierre con **189 puntos**
sobre un máximo de **199**, y debajo de la medalla decía *"189 puntos ·
el máximo posible del curso"*. No era el máximo.

**Diagnóstico contra el código real.** `pintarMedalla()`
(`coto-cierre.js` §361-363) busca el nivel inmediatamente superior al
puntaje y, si no hay ninguno, escribe ese texto:

```js
var sig = null;
for (var i = orden.length - 1; i >= 0; i--) if (orden[i].desde > puntos) { sig = orden[i]; break; }
if (!sig) sub.textContent = puntos + ' puntos · el máximo posible del curso';
```

O sea: "no queda medalla más arriba" se está traduciendo como "sacaste
el máximo". Son cosas distintas y la diferencia es todo el tramo entre
el último umbral y el máximo real — en este curso, 30 puntos.

Es un error de producto, no cosmético: le dice al alumno que ya no
tiene nada más que ganar cuando sí lo tiene, y a quien revisa el curso
le tapa un dato real.

**Cómo se verificó.** Se leyó el `[data-medalla-sub]` con un puntaje por
encima del umbral de oro y por debajo del máximo: dice "el máximo
posible del curso".

**Workaround del curso.** `corregirSubMedalla()` en `curso.js` reescribe
ese texto cuando el puntaje es menor que `MAX_SIN_VIDEOS`: *"N puntos ·
ya tenés la medalla más alta (el máximo del curso es M)"*.

**Propuesta.** Que `pintarMedalla` acepte el máximo del curso como dato
—el curso ya lo tiene calculado— y distinga los dos casos: "ya tenés la
medalla más alta" cuando no hay nivel superior, y "el máximo posible del
curso" solo cuando `puntos === máximo`. Sin ese dato el kit no puede
saber la diferencia, así que no alcanza con cambiar el texto.


### K18 · El kit sabe que este curso no puede usar el recorte de tablet, pero no da forma de apagarlo — PROBADO

**Síntoma.** En iPad, las capturas —y sobre todo los videos de portada y
de unidad, donde se nota— salen recortadas a los costados.

**Diagnóstico contra el código real.** No hay que descubrirlo: está
escrito en la cabecera de `coto-shot-stage.css`, y nombra a este curso:

> "REQUIERE que el PDF del curso se haya diseñado con el margen de
> seguridad NUEVO (8% arriba/abajo + 13% a cada costado). Cursos
> diseñados con el margen VIEJO (8% parejo en las 4 direcciones,
> **ej. «Surtido sin venta»**) NO deben usar este archivo — el recorte
> que habilita en el rango tablet caería sobre contenido real, no sobre
> margen vacío. Para esos cursos, seguir usando el bloque estático de
> solo-lienzo-fijo (sin el @container de abajo)."

El `@container (min-aspect-ratio: 1.5) and (max-aspect-ratio: 2.2)`
(§341) estira `.d-shot` a `100cqw × 100cqh` y deja que
`object-fit:cover` recorte. Medido en un iPad apaisado (1180×820 →
escenario 1180×700, proporción 1.686, dentro del rango): el recorte es
el **15.7% del ancho**, 93px por costado sobre un arte 2:1.

**Y acá está el hallazgo, que no es la regla sino la forma de no
traerla:** `new-course.mjs` copia `coto-shot-stage.css` entero. La
instrucción de la cabecera —"no uses este archivo"— no se puede cumplir
sin romper todo lo demás que el archivo define (la base del escenario,
las diapositivas, el Ken Burns, el aviso de girar el dispositivo). En la
práctica, un curso con margen viejo **no tiene cómo** quedarse fuera de
ese `@container`, más allá de pisarlo a mano.

**Cómo se verificó.** Se midió la proporción de `.d-shot` en 1180×820 y
en 1440×900: daba 1.686 y 1.846 en vez de 2. Con el override del curso
da 2 en los dos casos. Está como punto 17 de
`tools/tests/reporte-cliente.mjs`.

**Propuesta.** Que el recorte de tablet dependa de una clase o una
variable que el curso declare —por ejemplo `.d-stage[data-margen="nuevo"]`
o `--shot-recorte-tablet: 0|1`— con el default en "no recortar". Así un
curso con margen viejo hereda lo seguro sin tener que reescribir una
regla del kit, y uno con margen nuevo lo habilita en una línea. Hoy el
default es el que puede comerse contenido.

### K19 · `showPopup()` enfoca el primer campo de texto, y en iPadOS eso dispara el cartel de "estás escribiendo" — PROBADO

**Síntoma.** En iPad, interactuando por touch, aparece repetidamente el
cartel del sistema *"Parece que estás escribiendo mientras estás en
pantalla completa"*.

**Diagnóstico contra el código real.** `Motor.showPopup()`
(`motor-slides.js` §929) hace:

```js
var focusable = pop.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
if (focusable) focusable.focus();
```

En el glosario del boilerplate, el primer `input` es el buscador
(`<input data-gloss-search type="search">`). iPadOS muestra ese cartel
cuando una página en pantalla completa tiene el foco en un campo de
texto — así que el cartel sale **cada vez que el alumno abre el
glosario**.

Enfocar dentro del pop-up está bien y hace falta (atrapa-foco,
lectores de pantalla). Lo que no corresponde es elegir un campo de
TEXTO cuando el que abre es un dedo: nadie va a tipear, y el costo es
un cartel del sistema encima del curso.

**Cómo se verificó.** En un contexto táctil (820×1180, `hasTouch`), se
abrió el glosario y se leyó `document.activeElement`: daba
`INPUT[type=search]`. Con el parche del curso queda la tarjeta del
pop-up, que sigue estando adentro del diálogo. Punto 18 del test.

**Propuesta.** Que `showPopup()` no elija campos de texto cuando
`matchMedia('(pointer: coarse)')` da verdadero, y caiga en el primer
botón o en la propia tarjeta. Dos líneas, y saca un cartel del sistema
de encima de todos los cursos.

### K20 · El `fullscreen` de video en iOS/iPadOS no emite `fullscreenchange`, así que el reproductor vuelve mal ubicado — PROBADO por síntoma

**Síntoma.** En iPad, después de dar play el reproductor "se tilda": no
se puede agrandar ni achicar correctamente.

**Diagnóstico contra el código real.** El kit ya resolvió el bug de
fondo y lo documenta en `coto-media.js`: el video vive dentro de una
captura posicionada en píxeles por `_initShots()`, y entrar o salir de
pantalla completa no dispara ningún resize, así que al volver queda mal
ubicado. El fix del kit es escuchar `fullscreenchange` y volver a correr
`_initShots()`.

Pero **Safari de iOS/iPadOS no emite `fullscreenchange`** para el
fullscreen nativo de un `<video>`: emite `webkitbeginfullscreen` y
`webkitendfullscreen` sobre el propio elemento. O sea que en el
dispositivo donde más se usa esa pantalla completa, el fix no corre
nunca.

**Cómo se verificó.** No se pudo reproducir el fullscreen nativo de iOS
en el Chromium de la suite; lo que se verificó es el mecanismo — que el
kit solo registra `fullscreenchange`, y que con los dos eventos de
WebKit agregados el recálculo se dispara. El síntoma es el que reportó
el cliente en un iPad real.

**Propuesta.** Registrar los tres eventos en el mismo handler:
`fullscreenchange`, `webkitbeginfullscreen` y `webkitendfullscreen`.
Conviene además recalcular dos veces (en el evento y ~120ms después):
al volver de pantalla completa el layout no está estabilizado en el
mismo turno.


### K21 · El kit escribe todo el chrome en `rem` pero nunca define el tamaño de raíz — PROBADO

**Síntoma.** En un monitor grande el curso "queda chico y perdido en el
medio". Reportado por el cliente con una captura de 1900×1200.

**Diagnóstico contra el código real.** Hay que separar dos cosas que se
ven parecidas.

El LIENZO sí escala, y se midió: a 1900×1200 la captura sale 1900×950
(todo el ancho), a 2560×1440 sale 2560×1280, a 1920×1080 sale 1920×960.
No hay `max-width` en ninguna parte.

Lo que no escalaba es la INTERFAZ. El kit escribe la barra, los
botones, los chips, los modales y el resumen en `rem` —lo correcto—
pero **ningún archivo define `html{font-size}`**, así que la raíz se
queda en los 16px del navegador para siempre. Medido: tipografía de
16px y barra de 56px tanto en 1440 como en 2560. A mayor pantalla, la
interfaz ocupa proporcionalmente MENOS.

El propio kit ya tiene el argumento escrito, pero solo mirando para
abajo: en la regla que achica el chrome en pantallas bajas
(`coto-player-chrome.css` §58, v1.9.79) dice *"que el alto del chrome
no dependa del alto de la pantalla, es real y es del kit"*. Vale igual
para arriba.

**Cómo se verificó.** Se midió `getComputedStyle(document.documentElement).fontSize`
y el alto de `.d-top`/`.d-bottom` en 1440, 1920 y 2560: 16px y 56/64 en
los tres. Con el escalado del curso dan 16, 17.3 y 21, y las barras
acompañan. Punto 22 de `tools/tests/reporte-cliente.mjs`.

**Trampa que este curso pisó al arreglarlo, y que conviene que el kit
evite de raíz:** `.d-iconbtn--labeled` es UNA sola clase, igual de
específica que `.d-iconbtn`. Cualquier regla de ancho sobre
`.d-iconbtn` escrita en el CSS del curso —que carga último— le gana al
`width:auto` del botón etiquetado y lo aplasta a una caja cuadrada, con
los rótulos encimados ("SonidoLocución GlosarioAmpliar"). Pasó acá y se
vio en el render.

**Propuesta.** Dos cosas: (a) que el kit defina la raíz con un `clamp()`
que crezca con el ancho por encima de un umbral —lo que hace que TODO
el `rem` que ya escribió empiece a escalar sin tocar una sola regla
más— y las filas del `.d-app` en `rem` en vez de px; y (b) que
`.d-iconbtn--labeled` gane especificidad (por ejemplo
`.d-iconbtn.d-iconbtn--labeled`) para que no dependa del orden de
carga.


### K22 · `initBgVideos()` da por perdido cualquier error que no sea `NotAllowedError` — PROBADO

**Síntoma.** El video de fondo de la portada queda en la imagen fija al
entrar al curso, y **recién arranca si el alumno avanza una diapositiva
y vuelve**. Reportado por el cliente, con el curso en su visor.

**Diagnóstico contra el código real.** El cable está: `initBgVideos()`
termina con `var cur = global.motor.current(); if (cur) sync(...)`
(`coto-media.js`), así que la diapositiva activa del arranque sí recibe
su `attempt()`. El problema es CUÁNDO: en ese instante el `<video>`
acaba de nacer y todavía está resolviendo su fuente, así que ese
`play()` rechaza con `AbortError` ("interrupted by a new load
request") — no con `NotAllowedError`.

Y el `catch` de `attempt()` trata un solo error como recuperable:

```js
var recuperable = err && err.name === 'NotAllowedError';
if (!recuperable || !videoUsable(v)) { if (tap) tap.hidden = true; return; }
```

Cualquier otro error **esconde el botón de gesto y no vuelve a intentar
nunca**. Al reentrar, el archivo ya está en caché, `play()` resuelve, y
por eso "anda si vuelvo". El reintento mudo de K10 (v1.9.72) resolvió
el caso del autoplay bloqueado, que es el otro; este quedó afuera.

Ojo con la consecuencia secundaria, que es la que hace que el arreglo
del curso no alcance con reintentar: como el kit ya escondió el
`.d-shot-video-tap`, si el reintento sale mudo el alumno se queda sin
forma de pedir el audio. Hay que volver a mostrarlo con
`data-modo="sonido"` (el contrato que el propio kit ya engancha: ese
clic solo saca el mute, sin reiniciar el video).

**Cómo se verificó.** Punto 23 de `tools/tests/reporte-cliente.mjs`: se
simula el rechazo del primer `play()` con `AbortError` y un medio sano
(los `.mp4` del paquete son placeholders de 0 bytes, así que un
`<video>` real termina en `error` y no prueba nada). Sin el reintento
del curso: 1 intento y el video pausado. Con él: reintenta y arranca.
La primera versión del test simulaba `NotAllowedError` y **pasaba
igual con el arreglo desactivado** — porque ESE el kit ya lo maneja;
quedó anotado en el comentario del test para que no vuelva a escribirse
así.

**Propuesta.** Reintentar también ante `AbortError` (y, en general,
cuando el medio todavía no tiene datos), enganchando `loadeddata` /
`canplay` una vez y volviendo a pasar por `attempt()` — no por un
`play()` crudo, para no perder el `currentTime`, el volumen y el manejo
del botón de gesto que `attempt()` ya hace.


### K23 · No hay forma de saber si el alumno eligió velocidad de locución — PROBADO

**Síntoma.** El cliente pidió que en iPad la locución arranque a 0.85x.
El cambio tiene que ser un DEFAULT: si el alumno ya movió el control de
velocidad, manda su elección.

**Diagnóstico contra el código real.** `narrador.js` expone
`setRateFactor()` y `getRateFactor()`, y persiste la elección en
`localStorage` bajo `coto-diapos-rate`. Pero `getRateFactor()` devuelve
un número siempre: `1` tanto si el alumno eligió 1x como si nunca tocó
nada. No hay ninguna API que distinga "valor por defecto" de "valor
elegido", así que el curso no tiene forma de poner un default sin
arriesgarse a pisar una preferencia guardada.

Desde el curso se resuelve leyendo la clave del `localStorage` a mano
(`window.localStorage.getItem('coto-diapos-rate') !== null`), que es
exactamente el tipo de acoplamiento a un detalle interno del kit que
§0.1 pide evitar: si el kit renombra la clave, el curso se rompe en
silencio.

**Cómo se verificó.** Punto 28 de `tools/tests/reporte-cliente.mjs`:
táctil sin elección previa → 0.85x; táctil con `1.2` guardado y
recarga → 1.2x; escritorio → 1x.

**Propuesta.** Dos opciones, cualquiera sirve: (a) un
`Narrador.hasUserRate()` que diga si la preferencia está guardada, o
(b) un `Narrador.setDefaultRateFactor(f)` que aplique el valor **solo
si** el alumno todavía no eligió. La (b) es la que deja el código del
curso en una línea.


### K24 · `initBgVideos()` no tiene `onFirstPlay` y `initInlineCircleVideos()` sí — PROBADO

**Síntoma.** Un curso que mueve una diapositiva del patrón 3 (video
chico dentro del arte) al patrón 1 (video de fondo) pierde los puntos y
el logro por verlo, sin ningún error.

**Diagnóstico contra el código real.** Los dos patrones viven en el
mismo archivo y resuelven el mismo problema de negocio —"¿el alumno vio
este video?"— con contratos distintos. `initInlineCircleVideos(opts)`
toma `seen` / `markSeen` / `onFirstPlay`; `initBgVideos(opts)` toma
`bgVideoAutoMudo` y nada más. Mover una diapositiva de un patrón al
otro obliga a reescribir a mano el enganche de puntaje, que es
justamente la parte que ningún test del kit mira.

**Cómo se verificó.** Pasó acá: las dos diapositivas de video del
cuerpo cambiaron de patrón (§24.2) y hubo que escribir el listener de
`playing` en `curso.js`. Punto 12 del test del curso cubre el resto del
contrato de esas diapositivas, pero el puntaje quedó del lado del curso.

**Propuesta.** Que `initBgVideos()` acepte el mismo trío
`seen`/`markSeen`/`onFirstPlay`. Y que el ejemplo use `playing` y no
`play`: `play` se dispara también cuando el navegador lo intenta y
rechaza, así que un curso que escuche `play` paga un video que el
alumno nunca vio.


### K25 · Los overlays de una diapositiva no visitada llegan SIN medidas — PROBADO

**Síntoma.** Reportado por el cliente como *"al iniciar cada
diapositiva el contenido aparece y se agranda un poquito de golpe, como
un rebote"*.

**Diagnóstico contra el código real.** `_initShots()` posiciona cada
`[data-hit]` / `[data-place]` escribiendo `left/top/width/height` en px
contra la caja renderizada de la imagen. Una diapositiva que todavía no
se visitó está en `display:none`: mide 0×0, `place()` se va sin escribir
nada, y el overlay queda en su tamaño de contenido hasta que el alumno
entra. El kit **ya sabe que esto pasa** —tiene un "ancla provisional"
que los manda a (0,0) para que al menos no caigan fuera del lienzo
(v1.9.72, §7.18 K2)— pero el ancla trata el síntoma de estar en un
lugar absurdo, no el de llegar sin medidas.

Y hay una segunda mitad que las agrava: la captura suele ser
`loading="lazy"` dentro de ese `display:none`, así que el navegador ni
la pide. Sin imagen cargada no hay `naturalWidth`, y sin eso `place()`
no puede calcular nada **ni siquiera al entrar**, hasta que la imagen
termine de bajar.

**Cómo se verificó.** Medido al arrancar el curso: 25 overlays en 6
diapositivas, ninguno con `left/top/width/height`. Medido al entrar a
"Últimos consejos": un panel pasa de 26×5 en (20,56) a 310×74 en
(645,158). Y se grabó la transición cuadro a cuadro para descartar que
fuera una animación: el ancho del dibujo no cambia en ninguno de los 74
cuadros. Puntos 29 y 30 de `tools/tests/reporte-cliente.mjs`.

**Propuesta.** Que `_initShots()` coloque TODOS los `[data-shot]` desde
el arranque, no solo los que miden: cuando un shot mide 0×0 puede tomar
la caja de cualquier otro shot visible del mismo tipo (en un curso de
captura íntegra son todos el mismo lienzo). Y que sondee el tamaño
natural con un `Image()` suelto cuando el `<img>` todavía no cargó —
además de dar la medida, deja el archivo en caché y la captura tampoco
aparece de golpe. Es lo que terminó haciendo este curso a mano
(`precolocarOverlays` en `curso.js`).

**Aparte, y de producto:** `_initHitStagger()`/`_initPlaceStagger()`
escalonan la entrada de cada overlay con `.d-stagger-in`
(`translateY(8px)`) a 45ms y 90ms por elemento. Con 5 paneles el último
arranca a los 360ms, después de que la diapositiva ya terminó su
fundido de 300ms. Es la misma discusión que el Ken Burns (§E1): un
cliente lo pidió, otro lo objeta. Convendría la misma solución — una
variable para apagarlo sin pelearse con el JS que agrega la clase en
cada `slidechange`.


### K26 · `video-fondo.mjs` no prevé el "contenedor vacío" — PROBADO

**Síntoma.** El test exige `poster` en todo `.d-shot-slide--bg-video`.
Un curso donde la diapositiva ES el video —contenedor vacío a la espera
del archivo— no puede ponerlo, y la única salida es tocar un test del
kit.

**Diagnóstico contra el código real.** El chequeo es correcto para el
caso que preveía: arte + video, donde el `poster` es ese arte y cubre
el hueco mientras el `.mp4` no está. Pero el kit soporta los dos usos
del patrón 1 y el test solo contempla uno.

**Cómo se verificó.** Pasó acá (§24.2): el cliente pidió las dos
diapositivas de video vacías, "sin contenido de placeholder", y el test
las marcó en rojo.

**Propuesta.** Que el test honre un opt-out explícito en el marcado
(acá se usó `data-sin-poster`) y que lo aplique solo a ese chequeo. Es
la única divergencia del curso respecto de un test del kit y está
marcada como tal en el archivo.


---

## 7. Segunda vuelta — 3 puntos reportados por el cliente

Los tres quedaron cubiertos por un test propio,
`tools/tests/reporte-cliente.mjs`: son fallas que no se ven en pantalla
ni dan error (qué se dice en voz alta, qué forma tiene un realce, en qué
orden arranca un audio), así que sin test vuelven solas.

**1 · La locución del índice enumeraba el temario.** Ahora dice
exactamente *"Índice de contenidos. Control de surtido sin venta."* La
lista sigue en pantalla (está horneada en la captura) y sigue en el DOM
para el lector de pantalla: se sacó de la VOZ, no de la accesibilidad.
El mecanismo es `[data-narrate-only]`, la misma convención que el kit ya
usa en los pop-ups — que del lado de las diapositivas no estaba cableada
(relay K9).

**2 · El hover de las 2 tarjetas de repaso era una caja grande.** La
causa es la que sospechaba el reporte: el hitbox no es la tarjeta, es la
tarjeta MÁS el aro de ícono que asoma arriba (los dos son el mismo botón
a los ojos del alumno, y así tiene que seguir siendo). El realce que
hereda de `.d-shot-hit:hover` es un outline sobre todo el hitbox, o sea
un rectángulo de esquinas vivas que incluye el aro.
Ahora el realce lo dibuja un `::after` que cubre **solo la tarjeta**, con
su radio real. Las dos medidas salen del render, no del ojo: la tarjeta
arranca a **24.28%** del alto del hitbox (y=574 dentro de 440..992 en un
repaso, y=559 dentro de 424..979 en el otro: 24.23% y 24.32%, medio
píxel de diferencia) y su radio de esquina es de **~40px sobre el lienzo
de 2520**, o sea 5.71% del ancho de la tarjeta.
Ese 5.71% se expresa en `cqw` del **propio hitbox** (`container-type:
inline-size`) y no del escenario, por lo mismo que las píldoras de
consejos: fuera del rango donde la captura llena el frame, `.d-shot`
queda letterboxeada y `1cqw` del escenario deja de ser 1% del arte.
`:focus-visible` se dejó como viene del kit a propósito: por teclado, un
anillo sobre el hitbox entero es lo correcto, porque muestra el área que
realmente se activa.

**3 · El audio del mini juego se superponía y la devolución no sonaba.**
Las dos mitades eran una sola cosa y el error era mío: `responder()`
pintaba el cartel de devolución pero **no narraba nada**. Como
`Narrador.speak()` arranca llamando a `cancel()` (narrador.js), no
narrar la devolución significaba además que nadie cortaba la consigna,
que seguía sonando por abajo. Ahora toda la voz del juego pasa por un
único `narrar()`, así cada cambio de estado corta lo anterior antes de
empezar lo siguiente.
Un detalle que salió de probarlo: si el error que se acaba de cometer es
el que agota las vidas, la devolución y la pantalla de resultado se
locutan **juntas, en una sola emisión** (`terminar(false, q.mal)`) — si
no, el "por qué te equivocaste" se pisaba con el "te quedaste sin vidas"
justo cuando más falta hace.
Y el test de esto obligó a resolver un problema aparte, que terminó
siendo hallazgo de kit: el motor de voz falso que usa la suite para
medir cortes a mitad de frase **no se instala** (relay K10).

---

## 8. Tercera vuelta — 3 puntos más reportados

**1 · El ícono del curso.** No se había revertido: **nunca se había
puesto**. `img/icono-salon.webp` era el WebP de 1×1 transparente que
escribe `new-course.mjs` como placeholder deliberado (un `src` roto sería
un 404 y la suite lo contaría como fallo), y el archivo tenía **un solo
commit** en todo el historial, el del armado inicial. Nada posterior lo
pisó porque no había nada que pisar.
Tampoco llegó adjunto el ícono de referencia que menciona el reporte, así
que el ícono se armó **desde el arte del propio PDF**: la zorra/carrito
que el diseñador dibuja en la página 2 ("Introducción"), recortada de
`x[380,597] y[90,292]` y pasada a blanco con alfa real (el canal se
calcula por cercanía al blanco contra el `#B47800` del fondo, así los
bordes suavizados no quedan con orla dorada). La pastilla del kit ya
aportaba el degradado dorado; se le agregó `border-radius:50%` para que
sea el círculo que pide el reporte.
Si tenían otro archivo pensado, reemplazar `img/icono-salon.webp` y
listo — el HTML no cambia.

**2 · El contador "7/6".** Reproducido y corregido. La causa no es la
del reporte (un logro contándose dos veces es imposible: `obtenidos` es
un conjunto por id y `unlock()` corta si ya está). Lo que pasa es que
`Logros.restore()` mete en ese conjunto **cualquier id que venga del
`suspend_data`, sin cruzarlo contra el catálogo**, mientras que
`unlock()` sí lo valida. Con un id de una versión anterior guardado, el
numerador crece contra un denominador fijo. Detalle: el estado viejo
sobrevive entre builds porque `scorm-api.js` deriva su clave de la RUTA
del paquete — probar zips sucesivos en la misma carpeta lo reproduce.
Se filtra ahora del lado del curso (relay K11).

**3 · Sin salida tras responder mal.** Cierto como reporte de UX, con un
matiz: el juego no estaba trabado —las otras opciones seguían vivas— pero
**no había nada que lo dijera**, y contra el flujo de acierto, que sí
muestra botón, la ausencia se lee como bloqueo. Ahora, tras un error:
el cartel avisa que se puede *probar otra opción o seguir*, aparece un
botón "Seguir al siguiente" (fantasma, para que no compita con las
opciones) y el foco **no** se mueve al botón — con opciones vivas,
llevarle el foco a "seguir" empuja a saltear justo cuando conviene
reintentar. Con acierto, el botón sigue siendo el sólido de siempre.
Consecuencia de diseño: ahora se puede llegar al final salteando, así que
"terminaste con éxito" pasó a depender de haber acertado la última
pregunta y no de haber llegado.
El recorrido instrumentado se ajustó en la misma vuelta: ahora solo
avanza después de un acierto, porque clickear el botón nuevo siempre
habría hecho que el modo "insistente" saltee en vez de corregir.

Probar esto destapó, además, un fallo **intermitente** de la suite que
venía de antes (1 de cada 3 corridas) y que no era de estos cambios:
el ancla provisional del kit sobre los overlays de una capa oculta
(relay K12). Corregido y verificado con 10 corridas seguidas en verde.

---

## 10. Cuarta vuelta — 10 puntos reportados por el cliente

Acá va, punto por punto, qué se encontró de verdad y cómo se verificó.
Los que abrieron un hallazgo de kit están marcados y siguen abajo, en
el §11.

### 10.1 · Videos faltantes en `video/` (portada y unidad)

La carpeta tenía dos `.mp4` de 0 bytes (los dos videos del cuerpo) y el
cliente pidió los otros dos, porque portada y unidad **también son
video**. Eran dos capturas fijas.

Se pasaron al **patrón 1 de `coto-media.js`** (video de fondo):
`.d-shot-slide--bg-video` + `<video class="d-shot-video" playsinline
preload="auto" poster="img/…">` + `.d-shot-video-tap` naciendo
`hidden`, y se cableó `initBgVideos()` en `boot()` — que es la pieza que
§7.17 marca como la falla más común de este molde (el marcado puesto y
el cable no) y además la que reintenta MUDO cuando el navegador rechaza
el autoplay con sonido (§7.18 K10, que pasa SIEMPRE en la portada).

`video/` queda con los cuatro nombres finales, todos placeholder de 0
bytes:

| archivo | diapositiva |
|---|---|
| `video/portada.mp4` | 0 · Portada |
| `video/unidad-1.mp4` | 3 · Unidad 1 |
| `video/como-hacemos-el-reporte.mp4` | 6 · Cómo hacemos el reporte |
| `video/que-hacemos-con-los-productos.mp4` | 8 · Qué hacemos con los productos |

Mientras los archivos no estén, el `poster` —la misma captura que se
veía antes— cubre el hueco: la diapositiva se ve exactamente igual que
hoy. Verificado con `tools/tests/video-fondo.mjs`, que chequea carpeta,
nombre, `poster`, `playsinline`, el botón de gesto oculto al nacer y que
con el autoplay bloqueado el video igual arranque.

**Nota para cuando lleguen los .mp4 de portada y unidad:** `Narrador.textOf()`
trata una `.d-shot-slide--bg-video` como "diapositiva que ES un video" y
**no la narra** — el audio lo pone el video. Es el comportamiento del
kit y el mismo que usa el curso de referencia; hasta que el archivo
esté, esas dos diapositivas quedan mudas.

### 10.2 · Falta la palabra "Índice" junto al ícono de menú

El botón de hamburguesa era un `.d-iconbtn` pelado. El kit ya tiene la
variante etiquetada que usan "Glosario", "Sonido" y "Ampliar":
`.d-iconbtn--labeled` + `<span class="lbl">`. Se usó esa, sin CSS nuevo
— y como bonus el propio kit esconde la etiqueta por debajo de 640px,
donde la barra ya no tiene ancho.

### 10.3 · "Algunos conceptos importantes" — los tres problemas

Los tres salían del mismo lugar, y no era el código: **el diseñador
re-renderizó la columna izquierda en CADA página del PDF**. Medido
sobre las 8 variantes (2520×1260), diferencia contra `conceptos-plu`:

| variante | bandas que cambian (filas) |
|---|---|
| `conceptos-0` | 148-237 (título), 275-338 (párrafo) y **las 7 píldoras** |
| las otras 6 | 275-338 (párrafo) y **solo su propia píldora** |

O sea:

- **El párrafo se movía** porque en 6 de las 8 páginas está unos 6px más
  a la derecha que en las otras 2. No es CSS: son 8 renders distintos
  del mismo texto.
- **La tipografía de las píldoras cambiaba al primer clic** porque la
  página 6 (la variante inicial) las dibuja chicas y translúcidas, y las
  páginas 7 a 13 las dibujan más grandes y en blanco. También horneado.

Arreglo: se compuso **una sola columna izquierda canónica** y se pegó en
las 8 imágenes. La canónica es la de `conceptos-plu` con la píldora
PLU/EAN en su forma NO seleccionada (tomada de `conceptos-surtido`, que
fuera de las bandas de texto medidas es idéntica a `plu`). Las costuras
se eligieron midiendo, no a ojo: filas 100-262 hasta x=1190 (la banda
del título; a partir de x=1160 la diferencia entre las 8 es **0**) y
filas 262-1215 hasta x=980 (el hueco vacío que las 8 comparten entre
x≈948 y x≈1015), con una rampa de alfa de 8px en cada borde.

Resultado medido después del parche: contra `conceptos-plu`, las 8
variantes difieren **solo** en la banda del rótulo PLU (419-445) y en la
de su propia píldora. El párrafo ya no difiere en ninguna.

- **El estado no se reiniciaba al volver.** Ahora `slidechange` sobre
  `conceptos` llama a `swaps.conceptos.go(0, true)`. El `true` es
  `silencioso`: corta el `onChange`, así que el reset no vuelve a pagar
  puntos ni a narrar. Y **no** se toca `estado.conceptos`, que es lo que
  sostiene el gate de la diapositiva y el logro "Explorador": limpiarlo
  dejaría trabado a quien ya los abrió. Verificado: abrir los 7, salir,
  volver → imagen `conceptos-0`, 0 píldoras activas, 42 puntos antes y
  después, "Siguiente" habilitado.

### 10.4 · "Lo que vimos en este video" — hover y diseño de las fichas

**Hover.** El reclamo de la ronda 3 se había arreglado a medias: el
realce arrancaba en el borde de la tarjeta, pero el aro dorado del ícono
**asoma dos tercios por encima de ese borde**, así que un rectángulo que
empiece ahí igual le pasa por arriba. Medido sobre el arte:

| | repaso-reporte | repaso-acciones |
|---|---|---|
| tarjeta | x[502,1204] y[572,994] | x[521,1220] y[557,979] |
| círculo | ⌀273, centro (851,576) | ⌀273, centro (870,560) |
| hitbox | 700×553 | 700×555 |

Relativo al hitbox las dos dan lo mismo: la tarjeta arranca al 23.9% del
alto y el centro del círculo cae al 49.6% del ancho, 0.85% por debajo
del borde superior. Con eso, el realce se hace con una **máscara radial**
que le deja el agujero exacto al aro.

Eso obligó a cambiar cómo se dibuja: antes era un `::after` del hitbox
con `box-shadow` EXTERIOR, y una `mask` recorta por `border-box`, así
que enmascarar ese aro lo borraba entero. Ahora el realce es un
`<span class="d-ficha-ring">` propio con el aro `inset`, que la máscara
sí respeta. `tools/tests/reporte-cliente.mjs` lo verifica por lo que se
ve (borde, radio y presencia de la máscara), no por cómo está hecho.

**Diseño del pop-up.** Las 4 fichas son las páginas VERTICALES del PDF
(16, 17, 20 y 21): no entran en el lienzo 2:1 y por eso se rehacen en
HTML. Estaban aproximadas a ojo. Se rehicieron con las proporciones
medidas de la página 16 (1519×1604):

| pieza | medida | en proporción de la tarjeta |
|---|---|---|
| tarjeta | 1413 × 1257, radio 92 | — |
| círculo | ⌀469, centro 22px POR ENCIMA del borde | 33.1% del ancho |
| título | y[575,640] | 4.44% |
| subrayado | 429 × 10, centrado | 30.3% × 0.7% |
| cuerpo | interlínea 67, glifo 53 | 3.53%, interlínea 1.34 |

La página 17 confirma las mismas métricas de texto con otro largo de
contenido, así que son del diseño y no de esa página. Todo se escribe en
`cqw` sobre `container-type:inline-size` en la tarjeta, así que la ficha
se reconstruye igual a cualquier tamaño sin una sola media query de
tipografía. Se recuperaron además las negritas del PDF en "¿Cómo lo
generamos?" y la sub-lista con guiones de "¿Qué acciones tomar?".

### 10.5 · Bloque blanco sobre las líneas circulares — NO REPRODUCIDO ACÁ, RESUELTO EN §23.3

> **Cerrado en la décima vuelta.** El cliente mandó la captura del LMS
> y ahí se reprodujo: no era un z-index ni un panel blanco, era la
> **franja lateral del lienzo** a una proporción de 2.45:1. Ver §23.3.
> Lo que sigue es lo que se midió en esta vuelta, y se deja porque
> explica por qué buscarlo en el z-index no podía dar con nada.

Es el único punto de esta vuelta que quedó **sin resolver, y sin
inventar un arreglo**. Lo que se hizo para buscarlo:

1. Se recorrieron las 13 diapositivas midiendo, sobre la diapositiva
   activa, **todo** elemento con fondo opaco claro (≥240 en los tres
   canales, alfa ≥0.6) y más de 8000px² de área. El único que aparece en
   las 13 es el propio `.d-shot-img`, que **es** el arte.
2. Se comparó píxel a píxel el render en vivo de cada diapositiva contra
   su imagen fuente, buscando zonas donde el render fuera **más blanco**
   que el arte. Lo que sale es el borde de las letras y de las
   ilustraciones: ruido de reescalado, no un bloque.
3. Se revisaron además los estados que no son "diapositiva quieta": los
   4 pop-ups de ficha, el mini juego (intro, pregunta, devolución, las
   dos pantallas finales) y el resumen del cierre.

Conclusión medida: **ningún elemento HTML o CSS de este curso pinta
blanco por encima del arte**. Las tarjetas y paneles blancos que se ven
—el marco del reproductor, el panel del mini juego, la tarjeta de la
consigna— vienen dibujados en el PDF del diseñador (verificado contra
las páginas 15, 18, 22, 23, 28 y 29: el render coincide con el arte).

Para cerrarlo hace falta **una captura de la pantalla exacta**, o el
nombre de la diapositiva. Si el bloque es del PDF y lo que se quiere es
cambiar el arte, es un pedido para el diseñador (§5) y no un z-index.

La captura llegó en la décima vuelta y la respuesta fue una tercera:
**ni el HTML del curso ni el arte del PDF** — el fondo del escenario,
visible solo cuando la ventana del LMS es más ancha de 2.2:1. Las tres
mediciones de acá arriba miraban el lienzo, que era justamente donde no
estaba (§23.3).

### 10.6 · Mini juego — rejugar y estabilidad del dibujo

**El dibujo se movía.** El kit trae `.d-mj-fb:empty{margin:0}`: con el
cartel vacío la zona no ocupa nada, y como `.d-mj-body` es flex y
centra, al aparecer la devolución la escena se corría. Medido: la
escena arrancaba en y=170 y se iba a y=181.

No se reservó un alto fijo a ojo — eso se desactualiza al primer cambio
de texto. La zona lleva un **molde**: un `.d-mj-fb--molde` invisible que
queda SIEMPRE en el flujo con el texto real más largo que esa pregunta
puede llegar a mostrar (`q.why` o `q.mal` + la coletilla), y el cartel
real se superpone en absoluto. Así el alto reservado es exactamente el
que va a hacer falta, en cada pregunta, y sigue siendo correcto al
redimensionar (que es lo que rompe una medida guardada en píxeles). El
botón de avance hace lo mismo con un fantasma (`.d-mj-next-fantasma`,
sin la clase `.d-mj-next`, para que `_auto()` y la suite no clickeen un
botón que el alumno no ve). Medido después: la escena queda en y=170,
antes y después de responder.

**Rejugar.** Se agregó "Volver a jugar" en la pantalla de éxito, como
`[data-place]` con HTML real sobre el piso gris — que ahí está libre de
punta a punta (medido: la franja y[1178,1250] del lienzo no tiene nada).
Rejugar es seguro por construcción y conviene decir por qué, porque es
justo lo que §6.53 advierte: los puntos de cada concepto los guarda
`estado.mjOk`, persistido, así que una segunda vuelta no paga de nuevo;
`estado.mjErr` también persiste, así que no se puede "limpiar el
prontuario" para arrancar el logro `preciso`; y `estado.mjFin` queda en
`true`, así que el gate no vuelve a cerrarse. Verificado jugando 5/5,
rejugando y volviendo a hacer 5/5: 125 puntos y 2/5 logros antes y
después.

### 10.7 · Ampliar el resumen "Lo que vimos en este curso"

El resumen tenía 3 columnas y el panel quedaba con dos tercios en
blanco. Se sumaron 3 columnas más —los 7 conceptos (en dos) y el paso a
paso en GESCOM— sin contenido nuevo: salen del mismo `CONCEPTOS` de
`curso.js` y de los pop-ups de repaso. La grilla del kit es
`auto-fit minmax(260px,1fr)`, así que las 6 se acomodan solas en 3×2 sin
tocar el CSS del kit.

### 10.8 · Máximo 5 logros por curso

El catálogo tenía 6. Los dos únicos que medían lo mismo partido en dos
eran "Sabés armarlo" (las 2 fichas del primer video) y "Manos a la obra"
(las 2 del segundo): se fusionaron en **"Buen repaso"**, por las 4. Así
el tope se cumple sin sacar ninguna conducta del tablero.

Los ids viejos (`reporte`, `acciones`) siguen en el `suspend_data` de
quien ya venía jugando: los descarta `sanearLogros()`, que filtra contra
el catálogo — el mismo fix del "7/6" de la ronda 3. El test de cliente
ahora usa justamente ese caso como fixture.

Es una regla **general del cliente**, no de este curso: va como hallazgo
K14 al kit.

### 10.9 · Botón de play del kit en las diapositivas de video

Estaban en la **variante (b)** de `initInlineCircleVideos` (el arte
dibuja el reproductor completo, sin botón propio). Eso es exactamente lo
que §6.29 prohíbe: un play dibujado no tiene foco, ni hover, ni
`:focus-visible`, ni nombre accesible.

Se pasaron a la **variante (c)**: carátula real sin control dibujado +
el `.d-shot-hit-play` del kit. Para eso hubo que borrar el círculo de
play de los dos posters. El patrón de texto del fondo se repite cada
**165px** en vertical (medido por autocorrelación, error medio 4.2 sobre
255), así que el relleno del círculo sale del mismo patrón un período
más arriba, con una rampa de 6px — no hay parche inventado.

El `<svg>` del triángulo va en el marcado del curso porque **el kit no
inyecta ninguno**: su CSS estiliza `.d-shot-hit-play svg` pero el
marcado de ejemplo de `coto-media.js` es
`<button class="d-shot-hit-play">Reproducir</button>`, sin ícono. Va
como hallazgo K15.

### 10.10 · Verificación general

**Puntaje y logros.** Se encontró un desfasaje real en la tablita de
medallas del cierre: decía "Bronce desde 148 / Plata desde 190 / Oro
desde 230" (los números de ejemplo que deja el generador del kit) contra
los 74/127/180 que este curso derivó de un recorrido instrumentado. El
alumno leía un umbral y el contador usaba otro. Es la trampa de §7.3
punto 19 al revés: la tabla mentía **en pantalla**. Ahora los "desde N"
los escribe `curso.js` desde la misma constante `NIVELES` que decide la
medalla, así que no pueden volver a separarse.

Lo demás se remidió después de todos los cambios de esta vuelta:

| | medido | declarado |
|---|---|---|
| máximo sin videos | 199 | 199 |
| piso que garantiza el gate | 74 | 74 (= bronce) |
| acertar después de errar | 50 | (a la primera pagaría 125) |
| logros en el catálogo | 5 | 5 |
| `suspend_data` | 431 / 4096 | — |

**Responsive.** Se recorrieron las 13 diapositivas en 4 tamaños reales,
en contexto táctil (`isMobile` + `hasTouch`), midiendo cuánto se sale
del escenario cada elemento visible: iPhone vertical (390×844), iPhone
apaisado (844×390), iPad vertical (820×1180) y iPad apaisado (1180×820).

Lo único que sale es lo que tiene que salir: las partículas de `fx.js`
y el confeti del cierre (los dos, decorativos y en absoluto), y los
`<li>` del índice, que están dentro de un `ul.sr-only` y no se pintan.
En vertical de teléfono el kit muestra su propio aviso de "Girá tu
dispositivo", así que ese caso no es del curso.

**Un bug real sí apareció ahí**: la ficha de repaso no entraba en un
teléfono apaisado (390px de alto) y no se podía bajar. Causa: el kit le
da a `.modal-card` `max-height:88vh; overflow:auto`, y esta ficha
necesita `overflow:visible` para que el aro dorado asome — pero
`overflow:visible` también anula el scroll. El scroll se mudó al
`.modal-bd`, que puede recortarse sin tocar el aro, con
`max-height:calc(88svh - 8rem)` (`svh` y no `vh`: en un teléfono `vh`
cuenta la barra del navegador como si no estuviera). Medido después, con
"¿Cómo lo generamos?" abierta en 844×390: la tarjeta va de y=112 a
y=365 —entra— y el cuerpo scrollea (415px de contenido en 254 de caja).


---

## 13. Quinta vuelta — 5 puntos reportados por el cliente

### 13.1 · Ayuda y Configuración se abrían con el mouse encima

No era un trigger mal puesto del curso: el kit muestra el panel con
**tres** condiciones en OR (`coto-player-chrome.css`):

```css
.d-fab:focus-within .d-fab-pop,
.d-fab.is-hover   .d-fab-pop,
.d-fab.is-open    .d-fab-pop { … visible … }
```

`.is-hover` la pone `attachHoverGrace()` (`coto-player.js`) y `.is-open`
es el pin por clic. Como desde este chat no se toca `kit-base/` (§0.1),
el curso apaga en `pulido.css` las dos condiciones que no son el clic.
Se relaya como **K16** con la propuesta de que sea una opción del kit.

Sacar `:focus-within` no rompe el teclado: con Tab el foco cae en el
`.d-fab-btn` y Enter dispara el mismo `click` que pone `.is-open`; una
vez abierto, el panel se queda abierto mientras se navega adentro porque
la clase sigue puesta. Verificado en el test: con el mouse encima el
panel queda `hidden`, con un clic pasa a `visible`.

### 13.2 · Pop-ups: scroll, título montado, radio y padding

Los cuatro síntomas eran dos causas.

**El radio.** Estaba en `cqw` —o sea en porcentaje del contenedor—, así
que la misma tarjeta se veía casi ovalada angosta y apenas redondeada
ancha. Ahora son **30px fijos**, y no regla por regla: se redefinen los
dos tokens del kit que visten cajas y tarjetas (`--r-lg:22px` y
`--r-xl:32px` → 30px), con lo que entran de una vez los modales, las
tarjetas de logro, el cartel del mini juego y los paneles del cierre.
Quedan afuera a propósito `--r-pill` (botones y chips, que no son
cajas), `--r-sm`/`--r` (detalles chicos, donde 30px se comería el
elemento) y los realces que calcan formas DIBUJADAS —`.d-ficha-ring`,
`.d-shot-hit--tab`—, que tienen que seguir escalando con la imagen.

**El scroll y el título.** El hueco que deja el aro de ícono era
`padding-top` del cuerpo, y el cuerpo es el que scrollea: al bajar, el
título subía y se metía debajo del aro, que es absoluto sobre la tarjeta
y no se mueve. Ahora ese hueco es un espaciador de la TARJETA
(`.modal-card.d-ficha::before`, fuera del área que scrollea), así que el
texto no puede entrar ahí ni aunque scrollee. Y el padding lateral bajó
de 12cqw a 7cqw: el texto entra en 86% del ancho en vez de 76% y la
ficha larga dejó de necesitar scroll.

Medido con "¿Cómo lo generamos?" abierta:

| ventana | radio | ¿scrollea? | ¿entra? |
|---|---|---|---|
| 1158×792 (la del reporte) | 30px | no | sí |
| 1440×900 | 30px | no | sí |
| 820×1180 (iPad) | 30px | no | sí |
| 844×390 (teléfono apaisado) | 30px | sí, y corresponde | sí |

### 13.3 · El índice dejaba avanzar sin ver nada

La diapositiva tenía `data-gate-popup="instrucciones"`, que **no es un
gate**: abre el instructivo al tocar "Siguiente" y deja pasar igual. El
gate de verdad es `data-require-popups`, el mismo que usan las 4 fichas.

No se podían poner los dos: `_advance()` consulta `motor.canAdvance`
**antes** de abrir el pop-up del gate, así que con el gate puesto el
instructivo no llegaría a abrirse nunca y la diapositiva quedaría sin
salida. Por eso el instructivo pasó a tener su propio botón visible,
"Cómo recorrer el curso", sobre una zona del arte medida y vacía
(x[1100,1760] y[920,1080] del lienzo es blanco puro) — que además es lo
que el gate señala cuando el alumno toca "Siguiente" sin haberlo
abierto.

No paga puntos a propósito: `premiarFicha()` solo premia los 4 ids de
las fichas de repaso, así que el máximo de 199 no se movió (el test lo
confirma).

### 13.4 · Mini juego apretado en pantallas chicas

Medido en 1152×648: la ilustración se montaba **18px** sobre las
tarjetas CONCEPTO/PUNTOS/VIDAS, que quedaban cortadas.

La causa es una realimentación, y vale anotarla porque es el tipo de
bug que vuelve: el ancho de las tres filas salía de
`min(73.65cqw, Ncqh * 1856/723)`, y ese `Ncqh` era una constante
afinada **antes** de que existiera la zona de devolución reservada
(ronda 4). Al bajarla para ganar alto, pasaba esto:

1. la fila de estado se quedaba sin ancho y envolvía en dos líneas
   (61px → 123px),
2. las opciones pasaban a dos filas,
3. el molde de la devolución se iba de 2 a 5 renglones (169px → 285px),
4. o sea que quedaba **menos** alto para la escena, que volvía a
   angostarse.

Con `41cqh` la ilustración terminó en 74px de los 528 del panel. La
cuenta se mordía la cola.

Dos cambios lo cortan:

- **La fila de estado, las opciones y la zona de devolución se quedan
  en el ancho del arte** (73.65cqw) y ya no siguen a la escena. Se
  pierde la alineación de los tres bordes en pantallas bajas; es un
  precio chico al lado de la espiral.
- **El alto disponible lo mide `curso.js`** (`ajustarEscena()`) y lo
  publica como `--mj-alto-escena`; el CSS lo usa como segundo tope. Se
  mide y no se estima porque ninguno de los sumandos —fila de estado,
  opciones, devolución, gaps, padding— es una fracción del escenario.
  Corre al entrar a la capa de juego, en cada `render()` y desde un
  `ResizeObserver`.

Huecos entre filas después del cambio (negativo = se montan):

| ventana | antes | después |
|---|---|---|
| 1280×720 | 0 | +15 |
| 1152×648 | **−18** | +15 |
| 1024×600 | **−18** | +15 |
| 1180×820 | **−4** | +21 |
| 960×540 | +34 | +34 |
| 820×1180 | +172 | +172 |

Y la propiedad de la ronda 4 sigue en pie: la ilustración no se mueve al
aparecer la devolución, verificado ahora en 1440×900, 1152×648, 1024×600
y 844×390.

### 13.5 · Animación rara en "Últimos consejos"

No era la animación: las 5 píldoras del arte ya traen su texto
**dibujado**, y encima van las píldoras HTML (para que el texto sea
vivo, narrable y seleccionable). En reposo la de HTML tapa a la
dibujada; mientras entra con su `translate`, deja ver la de abajo — y se
ven los dos textos corridos, que es el "doble render" del reporte.

Arreglo de raíz: se borró el texto horneado de las 5 píldoras en
`img/consejos.webp`. El relleno no es un parche inventado — la píldora
es oro plano (239,190,1), así que se rellenó el interior con su propio
color, detectando el cuerpo de la píldora como "lo que tiene oro a los
cuatro lados" y con 1.2px de difuminado en el borde para no dejar
escalón. La forma de la píldora quedó intacta.

Efecto lateral bueno: el arte traía "Corregir **proble / mas** de
exhibición" partido al medio (era un hallazgo de contenido, §5) y ahora
el único texto que se ve es el del HTML, que está bien escrito.


---

## 15. Sexta vuelta — 2 puntos reportados por el cliente

### 15.1 · El video no llenaba el marco dibujado

Medido sobre el arte (lienzo 2520×1260): la pantalla que el diseñador
dibujó dentro del marco va de **x[842,1686] y[504,993]** — 845×490, o
sea **1.7245:1** — y el hitbox calza exactamente ahí (lo confirma
`verify-hitboxes`). El video real es **16:9 = 1.7778:1**.

El kit le pone a esta variante `object-fit:contain`
(`[data-inline-video].is-poster .d-shot-hit-video`), pensado para que el
video no se recorte contra el marco. Pero `contain` con un video **más
ancho** que su caja hace justo lo que el cliente reportó: entra entero y
deja franja arriba y abajo. La cuenta da 15px de los 490 del arte, que
es exactamente el aire que se ve en su captura.

Arreglo: `cover` en el `<video>` **y** en la carátula. Lo que se recorta
es el ANCHO —la caja es proporcionalmente más alta que 16:9—, 1.5% por
lado; los subtítulos quemados del video van centrados, así que no los
toca.

Dos detalles que valen la pena anotar:

- **La especificidad no es capricho.** `coto-media.js` documenta la
  trampa: el `<video>` de esta variante está bajo
  `[data-inline-video].is-poster .d-shot-hit-video`, tres selectores, y
  un override más liviano le gana al `<img>` de la carátula pero NO al
  `<video>`. Resultado: un encuadre en pausa y otro al reproducir, o sea
  el marco "saltando" al arrancar. El override del curso repite el
  prefijo entero en las dos reglas.
- **Se verificó viendo, no deduciendo.** Como el .mp4 todavía es un
  placeholder de 0 bytes, se metió una imagen de prueba 16:9 en la
  carátula y se compararon los dos `object-fit`: con `contain` asoma el
  fondo del marco arriba y abajo, con `cover` la imagen llega a los dos
  bordes.

### 15.2 · Los íconos de los pop-ups no eran los del diseñador

El cliente los describió como "deformados" y comparó contra su PDF. No
estaban estirados: **eran otro dibujo**. Los `<svg>` estaban escritos a
mano en `index.html` —una aproximación de tres engranajes, de una
etiqueta con "$", de un listado con tildes— y por más que el aro sea
cuadrado y el `viewBox` correcto, una aproximación no va a coincidir
nunca con el original. Es §6.32 al pie de la letra: se usa el arte del
diseñador, no se reinterpreta.

Ahora los cuatro íconos son el **recorte del círculo dorado de su propia
página del PDF** (16, 17, 20 y 21), con el fondo hecho transparente. La
alfa no se estimó: se midió el oro real del círculo (239/199/70) y se
derivó pixel a pixel cuánto se acerca cada uno al blanco viniendo de ese
oro.

El recorte abarca el **círculo entero**, no solo el glifo, y el `<img>`
ocupa el 100% del aro. Eso tiene una consecuencia que es el punto del
diseño: el glifo cae exactamente donde el diseñador lo puso, con su
tamaño y su centrado, **sin una sola constante de posición escrita a
mano** — que es lo que se habría desalineado en la próxima vuelta.

| ficha | página | tamaño del glifo |
|---|---|---|
| ¿Para qué sirve el reporte? | 16 | 49.5% del diámetro |
| ¿Cómo lo generamos? | 17 | 65.5% |
| ¿Qué acciones tomar? | 20 | 54.5% |
| ¿Cómo mejorar la venta? | 21 | 52.1% |

Los cuatro pesan entre 5 y 26 KB (`check-assets` en verde).


---

## 17. Séptima vuelta — 5 puntos reportados por el cliente

### 17.1 · Sacar el botón del índice, que el pop-up salga solo

Vuelve a `data-gate-popup`, que es el mecanismo del kit: al tocar
"Siguiente" el motor **abre el instructivo en vez de navegar**, y
completa el avance recién cuando ese pop-up se cierra (`_pendingNav`,
motor-slides.js). Nadie pasa del índice sin que el instructivo se le
haya puesto delante, y no hay ningún clic intermedio.

Esto reemplaza lo de §13.3, donde el mismo pedido se había resuelto con
`data-require-popups` + un botón visible. Los dos mecanismos no se
pueden combinar: `_advance()` consulta `motor.canAdvance` **antes** de
abrir el pop-up del gate, así que con el gate puesto el instructivo no
llegaría a abrirse nunca.

La diferencia práctica: el botón "Siguiente" ya no se ve bloqueado —
lo que se interpone es el pop-up. El test verifica la garantía y no el
mecanismo: desde el índice, "Siguiente" abre el instructivo y solo
después de cerrarlo se avanza.

### 17.2 · El mini juego aprueba con 3 de 5

Antes aprobaba quien acertara la **última** pregunta. Eso venía de otro
pedido (desde que se puede saltear, llegar al final no prueba nada),
pero dejaba afuera a quien acertaba 4 y fallaba justo la quinta.

Ahora aprueba con `aciertos >= 3` en **esa** partida. Se cuenta sobre el
contador de la corrida y no sobre `estado.mjOk`, que persiste entre
partidas: usar el persistido haría que un segundo intento arrancara con
crédito del primero. Quedarse sin vidas tampoco reprueba por sí solo: si
ya llegó a 3, aprueba igual.

No toca los puntos del curso —cada acierto los paga por separado— ni el
logro `preciso`, que sigue pidiendo 5 de 5 sin un solo error.

Verificado con un recorrido que acierta exactamente 3 y falla 2: llega a
"¡Terminaste con éxito!". Con 2 aciertos, a "Estuviste cerca…".

### 17.3 · Los logros no bloquean la medalla (y qué sí la bloqueaba)

**Los logros nunca entraron en la cuenta.** `medallaDe()`
(`coto-cierre.js` §336) compara puntos contra umbrales y nada más; el
catálogo de logros no aparece. La captura del propio cliente lo muestra:
189 puntos, **4/5 logros**, medalla de oro.

Lo que sí bloqueaba era el **aire entre el último umbral y el máximo**, y
ahí había dos defectos reales:

| umbral | antes | ahora | por qué |
|---|---|---|---|
| bronce | 74 | 74 | el piso que el gate garantiza (recorrido "pésimo" medido) |
| plata | 127 | **124** | 127 era **inalcanzable**: el recorrido "insistente" —explorar todo el curso y acertar las 5 tropezando una vez en cada una— paga 124 |
| oro | 180 | **169** | 180 deja 19 puntos de aire sobre el máximo de 199, y cada tropiezo en el juego cuesta 15: con **dos** errores el oro quedaba fuera de alcance aunque el alumno hubiera hecho todo |

Los tres salen de recorridos medidos con `_auto()`, no de repartir el
máximo en tercios:

```
recorrido            juego                       puntaje
------------------------------------------------------------
pésimo               0 de 5, se queda sin vidas       74   → bronce
insistente           5 de 5, cada una tras un error  124   → plata
perfecto             5 de 5 a la primera             199
oro = todo el contenido (74) + 3×25 + 2×10 =        169
```

`puntaje-curso.mjs` ahora verifica las dos cosas que fallaban: que la
plata sea alcanzable por el recorrido insistente, y que entre el oro y
el máximo quepan al menos dos tropiezos.

**Aparte, un bug de texto que se vio en la misma captura.** El cierre
decía *"189 puntos · el máximo posible del curso"* con un máximo de 199.
Es del kit: escribe esa frase cada vez que no hay un nivel más arriba,
para cualquier puntaje. Se corrige en el curso (`corregirSubMedalla()`)
y se relaya como **K17**.

### 17.4 · El resumen seguía con espacio de sobra

Medido en 1880×920: la grilla ocupaba **309px de los 727** del panel.

Tres cambios, ninguno de contenido inventado:

- **dos columnas más** — "Para el día a día" (los 5 consejos de la
  diapositiva 12) y "Cuándo pedir ayuda" (las situaciones del reporte
  que el curso ya explica): son 8;
- **`grid-auto-rows:1fr` + `align-content:stretch`**, para que las filas
  se repartan el alto en vez de apilarse arriba;
- **un escalón de tipografía**: 13.4px sobre un panel de 1300px de ancho
  se leía como una nota al pie.

Después: **681px de 760**, con 22 de sobra. Mismas tarjetas, misma barra
de categoría, mismo orden.

### 17.5 · El ícono del curso vuelve a ser un cuadrado redondeado

El círculo lo había puesto este curso en una vuelta anterior, a pedido.
Ahora el cliente mandó el asset con su forma real y el círculo le
recortaba las esquinas.

El radio no se eligió a ojo: se midió sobre el asset que mandó —1000×1000
con arcos de ~96px— y da **9.6% del lado**. Se escribe en porcentaje, así
que sigue siendo el mismo recuadro cuando el kit achica la caja por
debajo de 640px. El degradado dorado lo sigue poniendo el kit
(`--cat-grad`).

La regla vivía en dos tests a la vez (uno pedía círculo, otro cuadrado);
quedó una sola, en el punto 15 de `reporte-cliente.mjs`.


---

## 19. Octava vuelta — 6 puntos reportados por el cliente (casi todo iPad)

### 19.1 · Tarjetas de opciones del mini juego con tamaño desparejo

El ancho estaba bien — las cuatro miden lo mismo en cualquier tamaño. Lo
que cambiaba era el **alto**: el kit pone `align-items:start` en la
grilla (`coto-minijuego.css` §318), así que cada tarjeta mide su propio
contenido y la que envuelve en dos renglones queda más alta. Medido en
1024×768 con la pregunta 2: **52px contra 36px**.

`align-items:stretch` las iguala a la altura de la fila, y un
`display:flex` adentro vuelve a centrar el texto en la tarjeta ya
estirada. El test lo mide en una ventana donde el texto de verdad
envuelve — si algún día deja de envolver, el propio test avisa que ya no
está midiendo lo que tenía que medir.

### 19.2 · Videos de portada recortados en iPad

Este lo tenía escrito el kit, palabra por palabra, nombrando a este
curso. `coto-shot-stage.css` dice que los cursos con el margen de diseño
VIEJO —"ej. «Surtido sin venta»"— **no deben usar ese archivo**, porque
el `@container` de tablet estira el lienzo a pantalla completa y deja
que `object-fit:cover` recorte sobre contenido real.

Medido en un iPad apaisado (1180×820 → escenario 1180×700, proporción
1.686, dentro del rango 1.5–2.2): el lienzo pasaba a 1180×700 y el
recorte era del **15.7% del ancho**, 93px por costado.

| ventana | lienzo antes | lienzo ahora |
|---|---|---|
| iPad vertical 820×1180 | 820×410 (2:1, ya estaba bien) | 820×410 |
| iPad apaisado 1180×820 | **1180×700 (1.686 → recorta)** | 1180×590 (2:1) |
| escritorio 1440×900 | **1440×780 (1.846 → recorta)** | 1440×720 (2:1) |

Pasa con todas las capturas, no solo con los videos: ahí se nota más
porque el recorte cae sobre gente y títulos. El curso restaura el lienzo
fijo en ese rango, que es lo que el kit indica para este PDF. Ahora
sobran franjas arriba y abajo (55px en ese iPad, 30 en escritorio), que
es el trato correcto cuando el margen de diseño no protege el recorte.
Relayado como **K18** — lo que le falta al kit no es la regla, es una
forma de NO traerla.

### 19.3 · El cartel de "parece que estás escribiendo"

Lo dispara iPadOS cuando una página en pantalla completa tiene el foco
en un campo de texto. Y el foco se lo lleva el kit: `showPopup()`
enfoca el primer elemento enfocable del pop-up, que en el glosario es el
buscador. O sea que el cartel salía **cada vez que el alumno abría el
glosario**.

El curso corrige lo mínimo: solo con puntero grueso (dedo) y solo si lo
que quedó enfocado es un campo de texto, el foco se mueve a la tarjeta
del pop-up. Sigue siendo un destino válido para el atrapa-foco y para
lectores de pantalla, y con teclado no cambia nada — ahí enfocar el
buscador es lo correcto. Relayado como **K19**.

### 19.4 · El reproductor se traba y no arranca la primera vez

Dos cosas distintas.

**Se traba después del play.** El kit ya resolvió el bug de fondo —al
salir de pantalla completa hay que volver a correr `_initShots()`,
porque el reproductor vive dentro de una captura posicionada en
píxeles— pero escucha `fullscreenchange`, y **Safari de iOS/iPadOS no
lo emite** para el fullscreen nativo de un `<video>`: ahí los eventos
son `webkitbeginfullscreen` y `webkitendfullscreen`. Se agregan los dos,
con dos pasadas de recálculo (en el evento y 120ms después, porque al
volver el layout no está estabilizado en el mismo turno). Relayado como
**K20**.

**No se puede dar play al entrar la primera vez.** Misma familia que
K12: `_initShots()` posiciona los hitboxes midiendo la captura, y si la
imagen todavía no cargó, el botón de play queda en el ancla provisional
— o sea no donde el dedo toca. Al volver a entrar la imagen ya está en
caché y anda, que es exactamente lo que describió el cliente. Dos
arreglos: se saca `loading="lazy"` de las dos capturas de video, y se
agrega una red de seguridad para TODAS las diapositivas — cada captura
que no cargó todavía vuelve a disparar el posicionamiento al terminar.

### 19.5 · Pop-ups que se comen la pantalla en iPad

No es que crezcan: es que **no se achican**. El ancho está en píxeles,
así que la caja mide lo mismo en un monitor y en un iPad vertical, y lo
que cambia es la ventana.

| ventana | ficha | instructivo |
|---|---|---|
| 1440×900 escritorio | 656px = 46% | 620px = 43% |
| 1180×820 iPad apaisado | 656px = 56% | 620px = 53% |
| 820×1180 iPad vertical | **656px = 80%** | **620px = 76%** |

El tope pasa a depender también del ancho de ventana entre 700 y
1100px: `min(41rem, 66vw)`. En un iPad vertical la ficha queda en 541px
(66%), bastante más cerca del 46% de escritorio. No se bajó más porque
por debajo de eso el cuerpo de la ficha larga se vuelve una columna
angosta y vuelve a necesitar scroll — el problema de la quinta vuelta.
Los cajones laterales (glosario, índice) no entran: van pegados al borde
y a alto completo a propósito.

### 19.6 · El mini juego dejaba avanzar sin aprobarlo

El gate miraba `estado.mjFin`, que se pone al TERMINAR — también al
perder. Ahora mira `estado.mjAprobado`, que se persiste y solo se pone
cuando el juego termina con al menos 3 aciertos. Una vez aprobado queda
aprobado, aunque después vuelva a jugar y le vaya peor.

**Esto movió el piso del curso, y con él el bronce.** Si avanzar exige
aprobar, el recorrido más barato que el gate acepta ya no es
"terminarlo perdiendo" sino "aprobarlo a los tropezones": los 7
conceptos (42) + las 4 fichas (32) + 3 aciertos pagados tras error
(3×10 = 30) = **104**. Se agregó el modo `_auto('minimo')` para medirlo
y no estimarlo.

| | antes | ahora | de dónde sale |
|---|---|---|---|
| piso del gate | 74 | **104** | recorrido `minimo` medido |
| bronce | 74 | **104** | el piso, para que nadie termine sin medalla |
| plata | 124 | 124 | recorrido `insistente` medido |
| oro | 169 | 169 | todo el contenido + 3×25 + 2×10 |

Verificado: sin jugar el gate está cerrado; tras perder 0 de 5 sigue
cerrado; tras aprobar 3 de 5 se abre; y volver a jugar y perder no lo
vuelve a cerrar.


---

## 21. Novena vuelta — escalado en pantallas grandes

El reclamo fue: en una pantalla grande el curso no se ajusta a la
ventana, "queda como un stage de tamaño fijo centrado". Medido, son dos
cosas distintas y solo una era un bug.

### 21.1 · El lienzo SÍ escala (y hay que decirlo con los números)

| ventana | escenario | lienzo |
|---|---|---|
| 1440×900 | 1440×780 | 1440×720 — todo el ancho |
| 1920×1080 | 1920×950 | 1920×950 — todo el ancho y todo el alto |
| 1900×1200 | 1900×1071 | 1900×950 — todo el ancho |
| 2560×1440 | 2560×1283 | 2560×1280 — todo el ancho |

No hay ningún `max-width`: el arte usa todo el ancho disponible en
cualquier tamaño. Lo que el cliente ve como espacio de más son **las
franjas de arriba y abajo**, que son el 2:1 fijo que esta captura
necesita para no recortarse. Con un arte de proporción fija y una
ventana que no la tiene, o hay franja o hay recorte — y el recorte ya
se descartó en la vuelta anterior, porque en este PDF cae sobre
contenido real (§19.2 y K18). A 1900×1200 la franja es de 60px arriba y
60 abajo sobre 1071, el 11% del alto.

### 21.2 · La interfaz NO escalaba — eso sí era un bug

El kit escribe todo el chrome en `rem`, que es lo correcto, pero ningún
archivo define `html{font-size}`. Resultado medido: tipografía de 16px
y barra de 56px tanto en un notebook de 1440 como en un monitor de
2560. A mayor pantalla, la interfaz ocupa proporcionalmente menos — que
es exactamente la sensación que describió el cliente.

La raíz pasa a crecer con la ventana:
`clamp(16px, 16px + (100vw − 1700px) × 0.006, 21px)`. Con eso escala
solo todo lo que el kit ya escribió en `rem`. Se suman las tres piezas
de la barra que habían quedado en píxeles crudos (el botón redondo, su
ícono y el recuadro de marca) y el alto de las dos barras, con sus
MISMOS valores convertidos a `rem`.

El arranque en 1700px es a propósito: por debajo de eso la raíz da
exactamente 16px, así que ni los tamaños de la suite (1600×900 el más
grande) ni ningún teléfono o tablet cambian una sola medida.
Verificado midiendo raíz, barras y botones en 1440, 1600, 1024, 820 y
844: idénticos a antes.

| | 1440 | 1920 | 2560 |
|---|---|---|---|
| raíz | 16px | 17.3px | 21px |
| barra superior | 56px | 61px | 74px |
| barra inferior | 64px | 69px | 84px |

### 21.3 · Lo que se rompió arreglándolo, y por qué queda anotado

La primera versión puso `width` sobre `.d-iconbtn` a secas. Eso aplastó
los botones CON etiqueta a una caja cuadrada y los rótulos quedaron
encimados: "SonidoLocución GlosarioAmpliar". La causa es de
especificidad: `.d-iconbtn--labeled` es una sola clase, igual que
`.d-iconbtn`, y el CSS del curso carga último, así que le gana al
`width:auto` del kit.

Se vio en el render, no en los números — las medidas de la barra daban
bien. Quedó corregido con `:not(.d-iconbtn--labeled)` y, sobre todo,
medido en el test: los botones con etiqueta tienen que seguir siendo
más anchos que altos. Va al kit como parte de **K21**.


### 21.4 · Las franjas de arriba y abajo (corrección de §19.2)

El cliente volvió sobre la misma captura: *"¿ves que hay márgenes
arriba y abajo?"*. Sí — y eran la otra cara del arreglo de la octava
vuelta.

Los dos reclamos tiran para lados opuestos: "en iPad los videos se ven
recortados" (§19.2) y "hay márgenes arriba y abajo" (este). Con un arte
de proporción fija y una ventana que no la tiene, o se llena la
pantalla y se recorta a los costados, o se respeta el arte y quedan
franjas. La pregunta correcta no era cuál de las dos, sino **hasta
cuánto se puede recortar sin tocar contenido** — y eso no se había
medido: se había aplicado la advertencia del kit, que asume el peor
caso de todo el rango.

Ahora sí se midió, recortando cada una de las 22 capturas por los
costados y mirando el resultado:

| recorte por lado | proporción de escenario | resultado |
|---|---|---|
| 5.75% | 1.77 | todo entero |
| 7.85% | 1.686 | todo entero |
| 12.5% | 1.50 | **roto**: se cortan las píldoras de los dos costados en "Últimos consejos", y el índice y la unidad pierden su anillo |

Con 8% por lado como presupuesto —el margen de diseño de este PDF— el
lienzo puede llenar la pantalla mientras la proporción del escenario
sea **1.68 o mayor**. Eso cubre el monitor del reporte (1.774), un iPad
apaisado (1.686) y cualquier notebook 16:9. Por debajo de 1.68 vuelve el
lienzo fijo, porque ahí el recorte ya se come las píldoras.

Resultado medido después del cambio:

| ventana | proporción | franja | recorte por lado |
|---|---|---|---|
| 1912×1200 (el reporte) | 1.786 | **0** | 5.3% |
| 1440×900 | 1.846 | **0** | 3.9% |
| 1180×820 (iPad apaisado) | 1.686 | **0** | 7.9% |
| 1024×768 | 1.580 | 136px | — (llenar costaría 10.5%) |
| 820×1180 · 844×390 | fuera de rango | sin cambios | — |

El test lo verifica de los dos lados, porque un umbral solo se sostiene
si falla cuando tiene que fallar: por encima de 1.68 no puede quedar
franja, y por debajo no puede llenarse.

Lo que sigue valiendo de **K18** es lo que se relayó: el kit no da forma
de elegir ese umbral — lo tiene fijo en 1.5 para todos los cursos.

**⚠️ Para cuando lleguen los videos.** Portada y unidad 1 entran en esta
misma regla, así que el .mp4 se recorta igual que la captura. Hay que
pedirle al editor que **no ponga nada importante en el 8% de cada
costado**, el mismo margen que respeta el diseño. Si algún video viene
con texto pegado al borde, la solución es una línea: sacar
`.d-shot-slide--bg-video` de ese bloque y esas dos diapositivas vuelven
al 2:1 fijo, sin tocar el resto.


---

## 23. Décima vuelta — 6 puntos reportados por el cliente

### 23.1 · El video de portada no arrancaba solo

**Lo que reportó.** *"El video de portada no se reproduce
automáticamente al iniciar el curso. Solo empieza a reproducirse si
avanzo a la siguiente diapositiva y vuelvo atrás."*

**Qué era.** Un hallazgo del kit, **K22** — el detalle completo está
ahí arriba. En dos líneas: `initBgVideos()` sí intenta reproducir la
diapositiva activa en el arranque, pero en ese instante el `<video>`
todavía está resolviendo su fuente y `play()` rechaza con `AbortError`;
el `catch` del kit solo considera recuperable el `NotAllowedError`, así
que esconde el botón de gesto y no vuelve a intentar. Al reentrar el
archivo ya está en caché y anda — de ahí el "si vuelvo, funciona".

**Qué se hizo acá.** Un reintento local en `js/curso.js`
(`insistirConElVideoDeFondo`), enganchado a `loadeddata`, `canplay` y
`canplaythrough` más dos timeouts de red (400ms y 1500ms), con tope de
5 intentos y tres cortes: si el alumno ya se fue de la portada, si el
video ya está andando, o si la fuente está rota (`v.error`) no se
insiste. Reintenta **mudo**, que es lo único que los navegadores
permiten sin gesto previo, y si eso sale bien **vuelve a mostrar el
`.d-shot-video-tap` con `data-modo="sonido"`** — sin eso el alumno
queda con el video andando y sin forma de pedir el audio, porque el kit
ya había escondido el botón.

**Cómo se verificó.** Punto 23 del test. Y quedó anotado en el test el
camino equivocado: la primera versión simulaba `NotAllowedError` y
pasaba **con el arreglo desactivado**, porque ese error el kit ya lo
maneja. El que había que simular es el que el kit da por perdido.


### 23.2 · La locución leía "A", "B", "C"

**Lo que reportó.** *"La locución de objetivos de aprendizaje no debe
leer las letras A, B, C. Las letras se mantienen visibles en pantalla
como están — solo cambia lo que se dice."*

**Qué era.** Las tres letras están **horneadas en la captura** (son un
recurso gráfico del diseñador). El texto accesible de la diapositiva
las repetía en tres `<p class="sr-only">A. … / B. … / C. …`, y
`Narrador.textOf()` lee ese texto tal cual.

**Qué se hizo.** Los tres párrafos pasan a ser una `<ol class="sr-only">`
con un `<li>` por objetivo. La lista sigue siendo el único acceso que
tiene un lector de pantalla al contenido —que en pantalla está dentro
de la imagen— y la numeración ahora la pone el marcado, no el texto: el
lector la anuncia como lista y el narrador no la pronuncia.

**Cómo se verificó.** Punto 24 del test, contra `Narrador.textOf()`:
no aparece ninguna letra suelta y siguen estando las tres frases
("Detectar productos…", "Identificar problemas…", "Tomar acciones…").
Dicho completo: *"Introducción. … Objetivos de aprendizaje. Detectar
productos… Identificar problemas… Tomar acciones…"*.


### 23.3 · La línea decorativa cortada por un bloque blanco

**Lo que reportó.** *"Línea decorativa curva interrumpida por un bloque
blanco… La línea debe verse continua, pasando por detrás de los
elementos sin cortes."* Es el mismo punto que venía abierto desde la
cuarta vuelta (§10.5), esta vez con captura del LMS.

**Reproducido, por fin.** En ese visor el escenario queda en
**1276×520**, o sea proporción **2.45** — más ancha que el techo de 2.2
del kit, así que el lienzo vuelve al 2:1 fijo (1040×520) y sobran
**118px de franja a cada lado**. El arte llega hasta el borde del
lienzo y ahí se corta: lo que el cliente ve como "bloque" es la franja,
pintada con el fondo del escenario. No es un z-index, que es lo que se
había buscado en §10.5 sin encontrar nada.

**Por qué la franja no se puede eliminar.** Llenar la pantalla a esa
proporción cuesta un recorte de **9.2% arriba y abajo**. Medido
—recortando las capturas y mirándolas— eso se come la píldora "GESCOM"
de "Algunos conceptos importantes" y el botón "Continuar" del mini
juego. Así que la franja se queda; lo que se puede es que no corte
nada.

**Primer intento, que no alcanzó y queda anotado.** La misma captura de
la diapositiva como fondo del escenario, `cover` + `blur(34px)`.
Sacaba el bloque ajeno (la franja tomaba el color del arte de al lado,
sin constantes de color a mano) y **la línea seguía muriendo en la
costura**: el desenfoque la disuelve. Se vio ampliando la captura, no
en los números — las mediciones de color de la franja daban bien.

**Lo que sí lo resuelve.** `border-image` con un corte de 1px sobre
`.d-stage::before`:

```css
.d-stage::before{
  content:""; position:absolute; inset:0; z-index:0;
  border-style:solid; border-color:transparent;
  border-width:var(--franja-y, 0px) var(--franja-x, 0px);
  border-image-source:var(--franja, none);
  border-image-slice:1 fill;
  border-image-repeat:stretch;
  pointer-events:none;
}
```

`border-image-slice: 1 fill` toma la **columna de borde** de la imagen
(1px de ancho, alto completo) y la estira para llenar la franja, así
que una línea horizontal que llega al borde del lienzo sigue **a su
misma altura exacta** hasta el borde de la ventana. `fill` dibuja
además el centro en el hueco interno —que coincide con el lienzo—, que
es lo que evita un salto de color justo en la costura.

El grosor no se puede escribir en CSS (depende de la proporción de la
ventana del LMS): lo mide `curso.js` contra el render, `[data-shot]`
contra `.d-stage`, y lo publica en `--franja-x`/`--franja-y` en cada
cambio de diapositiva y en cada `resize` (`ResizeObserver`). Sin franja
valen 0, el borde mide 0 y no se dibuja nada.

**Un detalle que costó una vuelta.** La primera versión pasaba
`url("img/portada.webp")` a la custom property y la franja quedaba
vacía. Una `url()` relativa dentro de una custom property se resuelve
contra **la hoja de estilos donde se usa la variable**, no contra el
documento: el navegador estaba pidiendo `css/img/portada.webp`. Se vio
midiendo el `background-image` computado. Ahora `curso.js` la
normaliza con `new URL(url, document.baseURI).href`.

**Cómo se verificó.** Punto 25 del test, y es un test de píxeles porque
ningún chequeo de CSS distinguía las dos versiones: se recorre la
columna de borde del lienzo y, en cada fila donde hay tinta de verdad,
se le pide a la franja la misma tinta (±1 fila, por el antialias). Con
el estirado: 0 filas cortadas. Con el desenfoque: 8 de 8, más el
chequeo de que la línea llega al borde de la ventana. Las 13
diapositivas se miraron a 1276×640 en una hoja de contactos.


### 23.4 · "Los 7 conceptos" listaba 8

**Lo que reportó.** *"'Los 7 conceptos' en el resumen en realidad lista
8… unificar PLU y EAN en un solo ítem."*

**Qué era.** Exactamente eso. En "Algunos conceptos importantes" la
píldora es **una sola** ("PLU/EAN"), y el resumen los había separado en
dos `<li>`.

**Qué se hizo.** Un solo ítem —*"PLU/EAN: los dos códigos del producto.
El PLU es el interno de Coto y no está en el envase; el EAN es el de
barras del envase, que pone el fabricante"*— y "Rotación" sube a la
primera columna para que las dos queden parejas (4 y 3).

**Cómo se verificó.** Punto 26 del test, contando los `<li>` de las
columnas **cuyo encabezado dice "Los 7 conceptos"** — no de toda la
grilla, que tiene otras seis columnas de `li` (pasos, consejos,
acciones). La primera versión contaba la grilla entera y daba 30.


### 23.5 · Pop-ups grandes y con scroll en iPad

**Lo que reportó.** *"Popups en iPad: grandes y con scroll innecesario…
el popup debe mostrar todo el contenido sin scrollear, con un tamaño
acotado."*

**Qué era.** El caso nuevo es el iPad **acostado**: ventana ancha pero
**baja**. A 1180×820 quedan ~578px de alto útil para la tarjeta y la
ficha más larga ("¿Cómo mejorar la venta?") pedía **610**. Los topes
que se habían puesto en la octava vuelta (§19.5) eran de ANCHO, y acá
el que falta es alto.

**Qué se hizo.** Un escalón en `css/pulido.css` para
`@media (max-height:860px) and (min-height:621px)`: tipografía de la
ficha topeada en `min(3.53cqw, 1.02rem)`, padding del cuerpo a
`0 6cqw 6cqw` y márgenes de lista más chicos. El corte está en 860 y no
en 900 a propósito: una pantalla de 900px reales deja ~800 de viewport
con la barra del navegador, así que entra igual; y una ventana de 900
limpios —donde la ficha ya entraba— se queda con la proporción
completa. No pisa el escalón de `max-height:620px` (teléfono
acostado), que además angosta la tarjeta.

**Cómo se verificó.** Punto 27 del test: las **cuatro** fichas en tres
ventanas (1180×820 acostado, 820×1180 parado, 1024×1366 iPad Pro),
midiendo `scrollHeight - clientHeight` del cuerpo y cuánto se sale la
tarjeta por abajo. Sin el escalón: "rep-mejorar" pide 32px de scroll en
el acostado.


### 23.6 · Velocidad de locución por defecto en iPad

**Lo que reportó.** *"Velocidad de locución por defecto en iPad muy
rápida. Ajustar a 0.85x… Confirmar si este ajuste debe aplicarse solo
en iPad o también revisar cómo se siente en mobile en general."*

**Qué se hizo.** En `boot()`, primera cosa después de `SCORM.init()`:
si el puntero es grueso (`matchMedia('(pointer: coarse)')` — o sea
cualquier dispositivo táctil, no solo iPad) y el alumno **todavía no
eligió velocidad**, se arranca en 0.85x. En escritorio no cambia nada.

Sobre la pregunta del cliente: se aplica a **todo lo táctil**, iPad y
teléfono. El motivo es que no hay ninguna diferencia entre un iPad y un
teléfono que justifique tratarlos distinto acá —la locución es la misma
voz del sistema a la misma velocidad—, y discriminar iPad haría falta
mirar el `userAgent`, que en iPadOS miente (se declara Mac desde
iPadOS 13). El puntero grueso es la condición honesta.

Lo importante es que es un **default**, no una imposición: si el alumno
movió el control de velocidad, manda su elección, incluso al reabrir el
curso en otra sesión.

**Lo que esto costó en acoplamiento, y por qué va como K23.** El kit no
tiene ninguna API que diga *"¿el alumno eligió velocidad?"*:
`getRateFactor()` devuelve `1` tanto si eligió 1x como si nunca tocó
nada. Desde acá hay que leer la clave interna del `localStorage`
(`coto-diapos-rate`) a mano — exactamente el tipo de acoplamiento que
§0.1 pide evitar. Relayado como **K23** con dos propuestas concretas.

**Cómo se verificó.** Punto 28 del test, tres casos: táctil sin
elección previa → 0.85x; táctil con `1.2` guardado y recarga → 1.2x
(el default no pisa la elección); escritorio → 1x.


---

## 24. Undécima vuelta — resoluciones contra el PDF, y el rebote de entrada

### 24.1 · Las medidas, remedidas de cero

El pedido fue explícito: *"volvé a medir todo desde cero: las
dimensiones reales del PDF de Illustrator y las del kit base, para
asegurarte de que el arte se esté aplicando tal cual está en el PDF
original, sin desfasajes de escala ni proporción"*. Así que la primera
mitad de esta vuelta es medición, no cambios.

**Lo que se midió, y con qué.**

| qué | medida | cómo |
|---|---|---|
| Artboard del PDF | **2520 × 1260 pt** (2:1 exacto) | `MediaBox` de las 13 páginas |
| Las 30 capturas de diapositiva | **2520 × 1260 px** | tamaño real de cada `.webp` |
| Recorte de la escena del mini juego | 1856 × 723 | asset, y `--mj-escena-ratio: 1856/723` lo declara igual |
| Marco de video del PDF | 845 × 490 | asset, y el hitbox medía 33.532% × 38.889% de 2520×1260 = **845.0 × 490.0** |

O sea: **los archivos estaban bien**. El arte está 1:1 con el artboard,
sin un solo reescalado, y los dos recortes derivados están declarados
con su proporción exacta.

**Dónde estaba el desfasaje.** En el CSS del kit. `coto-shot-stage.css`
hace que el lienzo LLENE el escenario cuando su proporción cae entre
1.5 y 2.2; como la imagen es 2:1 con `object-fit:cover`, eso recorta.
Medido, con el escenario real (ancho / (alto − header − footer)):

| ventana | escenario | proporción | alto del arte visible |
|---|---|---|---|
| 1366 × 768 | 1366 × 648 | 2.11 | **94.9%** (se comía 5.1%) |
| 1600 × 900 | 1600 × 780 | 2.05 | 97.5% |
| 1920 × 1080 | 1920 × 950 | 2.02 | 99.0% |

1366×768 es la resolución de notebook más usada del mundo: ahí el
alumno veía el 94.9% del dibujo. Eso es exactamente "desfasaje de
proporción".

**Qué se hizo.** El lienzo conserva **2:1 en todo el rango**. La regla
de `pulido.css` que en la novena vuelta restauraba el lienzo fijo sólo
entre 1.5 y 1.679 ahora cubre el rango entero del kit (1.5–2.2). Por
debajo de 1.5 y por encima de 2.2 el kit ya dejaba el lienzo fijo, así
que no se tocó nada más.

**Lo que cuesta, medido:** franjas laterales chicas.

| ventana | franja por costado |
|---|---|
| 1920 × 1080 | 10 px |
| 1600 × 900 | 20 px |
| 1366 × 768 | 35 px |
| iPad apaisado | 0 px (el escenario ya da 2:1 justo) |

Y son franjas que desde la décima vuelta continúan el arte (§23.3), no
un bloque de color.

**Esto reemplaza el umbral de 1.68 de la novena vuelta.** Aquel número
salía de medir cuánto se podía recortar sin comerse una píldora — la
pregunta correcta mientras el objetivo era llenar la pantalla. El
cliente cambió el objetivo a "no recortar nada", y con eso el umbral
sobra. Queda anotado porque el razonamiento sigue siendo válido si
alguna vez se vuelve atrás.

**Cómo se verificó.** Punto 17 del test, reescrito: seis ventanas, y en
cada una se calcula el porcentaje del arte visible con la misma cuenta
que hace el navegador (proporción del lienzo contra proporción natural
de la imagen, según el `object-fit` real). Da 100% en las seis. Además
se topea la franja contra el lienzo 2:1 más grande que entra en ese
escenario — medido en vivo, no con un alto de chrome escrito a mano
(se intentó con 120px fijos y falló solo en 1920×1080, donde el chrome
ya mide 130 por el escalado de la novena vuelta).


### 24.2 · Las diapositivas de video: contenedor vacío a 2520 × 1260

**Lo que pidió.** *"Las diapositivas de video deben quedar vacías (sin
contenido de placeholder ni medidas incorrectas) pero con el contenedor
ya configurado en la resolución correcta: 2520 × 1260… Cuando
reemplacemos esos archivos, tienen que encajar exactos en esa
resolución sin recorte ni reescalado."*

**Qué había.** Las dos diapositivas de video del cuerpo eran la captura
completa del PDF —con el reproductor **dibujado** adentro— más un
`<video>` chico encajado en ese dibujo. La caja de ese marco mide
**845 × 490** en el artboard, o sea **1.7245:1**. Un `.mp4` de 2520×1260
metido ahí, con el `object-fit:cover` que le puso la sexta vuelta, se
recortaba **~13.5% de ancho por costado**. Ese era el "no encaja
exacto", y es una medida que hasta esta vuelta era correcta: el archivo
que se esperaba era un clip 16:9 para ese marco, no el artboard entero.

**Qué se hizo.** Las dos pasan al patrón 1 de `coto-media.js` (video de
fondo), igual que la portada: el `.d-shot` es 2:1 exacto — o sea
2520×1260 — en todas las pantallas (§24.1), así que el archivo entra
1:1. Sin `<img>`, sin `poster` y sin el reproductor viejo: el
contenedor queda vacío. Se borraron del paquete los cuatro assets que
ya no se usan (`video-reporte.webp`, `video-acciones.webp` y los dos
`poster-video-*.webp`, 170 KB); siguen en el historial de git si alguna
vez vuelve el reproductor dibujado.

**`contain`, no `cover`.** El kit le pone `cover` al video de fondo.
Con el lienzo 2:1 y un archivo 2520×1260 las dos dan lo mismo. La
diferencia aparece el día que un archivo llegue con otra proporción:
`cover` lo recorta **en silencio** y `contain` lo deja entero con
franjas, que se ven y se corrigen. Después de una vuelta que existe
justamente por un recorte silencioso, la elección es obvia — y es la
única de las dos que *garantiza* el "sin recorte" que se pidió, en vez
de cumplirlo de casualidad mientras los archivos vengan bien.

**Qué hubo que recablear.** Los puntos por ver un video los pagaba
`initInlineCircleVideos` con su `onFirstPlay`, que ya no interviene.
Ahora los paga `curso.js` escuchando `playing` en cada video de fondo
con `data-video-src`. `playing` y no `play`: `play` se dispara también
cuando el navegador lo intenta y lo rechaza, y pagaría un video que el
alumno nunca vio. Las claves de `estado.videos` son las mismas rutas de
siempre, así que un alumno con progreso guardado no pierde ni cobra dos
veces.

**Dos cosas que hay que decir, no esconder.**

1. **Hasta que lleguen los `.mp4`, esas dos diapositivas están en
   blanco.** Es lo que se pidió ("sin contenido de placeholder"), pero
   conviene saberlo antes de mostrarle el curso a alguien. El gate
   (`data-require-seen`) sigue eximiéndose solo mientras el archivo sea
   un placeholder, así que el curso no queda trabado.
2. **El título y el texto de introducción de esas dos diapositivas
   estaban horneados en la captura del PDF**, así que ahora no están en
   pantalla: los tiene que traer el video. Siguen en el DOM como
   `sr-only` para el lector de pantalla y para el índice.

**Excepción declarada en un test del kit.** `video-fondo.mjs` exige
`poster` en todo video de fondo — con razón para el caso que preveía
(arte + video, donde el poster cubre el hueco). El patrón "contenedor
vacío" no lo preveía. Se agregó `data-sin-poster` en el marcado y el
test lo honra **solo** para ese chequeo; los otros cinco (carpeta,
nombre, `playsinline`, botón oculto, autoplay) siguen corriendo. Es la
única divergencia del curso respecto de un test del kit, está marcada
como tal en el archivo, y va relayada como **K26**.

**Cómo se verificó.** Punto 12 del test, reescrito de punta a punta:
contenedor 2:1 exacto, `object-fit` que no recorta, cero `<img>`, cero
`poster`, cero reproductor viejo, y que no se hayan perdido ni la ruta
del `.mp4` ni el gate.


### 24.3 · El "rebote" al entrar a cada diapositiva

**Lo que reportó.** *"Al iniciar cada diapositiva, el contenido aparece
y se agranda un poquito de golpe, como un rebote, en vez de aparecer de
forma prolija y estable. Pasa en todas las diapositivas."*

**Lo primero fue descartar lo obvio.** El kit tiene un Ken Burns (un
zoom lento de 1 a 1.06 sobre `.d-shot`) que sería el sospechoso
natural — pero está **apagado por default** desde v1.9.74 y este curso
no lo enciende. Se verificó leyendo el `animationName` computado: `none`.

**Después se midió el render, cuadro a cuadro.** Se grabó la transición
con `Page.screencast` (74 cuadros) y se siguió el ancho de la remera
roja del personaje: **294–295 px en todos los cuadros**. O sea que el
lienzo no escala. La animación de entrada del kit (`d-slide-in`, 300ms)
es opacidad pura.

**Lo que sí se movía** eran las dos capas que van ENCIMA del arte, y
son dos cosas distintas que el alumno ve como una sola:

1. **Los overlays llegaban sin medidas.** `_initShots()` posiciona cada
   `[data-hit]` / `[data-place]` escribiendo `left/top/width/height` en
   px, calculados contra la caja renderizada de la imagen. Una
   diapositiva no visitada está en `display:none`: mide 0×0, y
   `place()` se va sin escribir nada (el kit lo contempla con un "ancla
   provisional" en 0,0). Medido al arrancar: **25 overlays repartidos
   en 6 diapositivas, ninguno con medidas**. Cada uno quedaba en su
   tamaño de contenido —chico, en una esquina— y saltaba a su caja real
   recién al entrar. Medido en "Últimos consejos": un panel pasaba de
   **26×5 en (20,56)** a **310×74 en (645,158)**. Eso es literal
   "aparece y se agranda de golpe".

   Y hay una segunda mitad: las capturas son `loading="lazy"` dentro de
   un `display:none`, así que el navegador **ni las pedía**. Sin imagen
   cargada no hay `naturalWidth`, y sin eso `place()` no puede calcular
   nada ni siquiera al entrar.

2. **`.d-stagger-in`.** `_initHitStagger()` y `_initPlaceStagger()`
   (motor-slides.js) se la agregan a cada `[data-hit]` y `[data-place]`
   en cada `slidechange`, con retardo creciente (45ms y 90ms por
   elemento). Es `translateY(8px)` + fundido. En "Últimos consejos",
   con 5 paneles, el último arranca a los **360ms** — después de que la
   diapositiva terminó su propio fundido de 300ms — así que los
   carteles siguen entrando de a uno durante ~750ms.

**Qué se hizo.**

- `precolocarOverlays()` en `curso.js`: coloca **todos** los overlays al
  arrancar, sin esperar a entrar. Todos los `.d-shot` del curso son el
  mismo lienzo 2:1, así que la caja del que está visible sirve para
  calcular la de los que no; es la misma cuenta que `place()`, con los
  mismos `data-l/t/w/h`, no una aproximación. Cuando el alumno entra,
  el kit vuelve a correr `place()` y escribe los mismos números.
- Una **sonda de tamaños**: un `Image()` suelto por captura
  desconocida. No toca el DOM ni bloquea el pintado, y arregla las dos
  mitades — da la medida natural para colocar ahora, y deja el archivo
  en caché para que la captura tampoco aparezca de golpe al entrar. No
  se sacó `loading="lazy"` del marcado a propósito: eso cargaría las 30
  capturas antes de pintar nada.
- `.d-stagger-in{ animation:none }` en `pulido.css`. Se apaga por CSS y
  no pidiendo que el kit no ponga la clase, porque la clase la agrega
  su JS en cada cambio de diapositiva. No se pierde nada: es
  exactamente lo que ya veía un alumno con `prefers-reduced-motion`.
- Y el `@keyframes pop` del pop-up (`translateY(14px) scale(.98)`) pasa
  a fundido puro. Es el **único `scale` de entrada que quedaba en el
  curso** y es literal lo que el cliente describió; los pop-ups acá son
  constantes (las 4 fichas, el glosario, y el índice, que se abre solo
  al entrar a su diapositiva). Volver a encenderlo son dos líneas.

**Resultado, medido igual que el problema:** de las 13 diapositivas, 11
entran sin que **ningún** elemento cambie de tamaño ni de posición. Las
otras dos son el mini juego y el cierre, y lo que se mueve ahí son los
papelitos del confeti — se verificó elemento por elemento.

**Cómo se verificó.** Dos puntos nuevos del test. El **29** mide el
síntoma: entra a cada diapositiva y compara la caja de cada elemento
entre el primer cuadro y el último, 900ms después. El **30** mide la
causa, que es lo que se puede romper sin querer tocando CSS:
`.d-stagger-in` inerte y el pop-up sin `pop`. Los dos se probaron al
revés — desactivando cada arreglo y viendo el test ponerse rojo con el
mismo número que había antes.


---

## 22. Pendiente / próximo paso

- **Videos — especificación para el editor.** Los **cuatro** `.mp4` de
  `video/` son placeholders de 0 bytes con su nombre final:
  `portada.mp4`, `unidad-1.mp4`, `como-hacemos-el-reporte.mp4` y
  `que-hacemos-con-los-productos.mp4`. Se reemplazan tal cual, sin
  tocar código.

  **Resolución: 2520 × 1260** (2:1 — el artboard del PDF). Desde la
  undécima vuelta los cuatro son video de fondo y el lienzo conserva
  esa proporción en TODAS las pantallas, así que el archivo entra 1:1,
  sin recorte y sin reescalado no uniforme (§24.1, §24.2). Ya no hace
  falta el margen de seguridad del 8% por costado que pedía la novena
  vuelta: no se recorta nada.

  Un archivo que venga con otra proporción **no se recorta en
  silencio**: el curso usa `object-fit:contain`, así que se va a ver
  con franjas — visible y corregible (§24.2).

  · **Gate:** `initVideoGate` sondea los dos del cuerpo y **exime el
    gate mientras no se puedan reproducir**, así que el curso nunca
    queda trabado; el día que se suban, el gate vuelve a valer solo.
  · **Locución:** una `.d-shot-slide--bg-video` **no se narra** (el
    audio lo pone el video). Eso ya valía para portada y unidad, y
    desde la undécima vuelta vale también para las dos del cuerpo: las
    cuatro están mudas hasta que lleguen los archivos.
  · **Las dos del cuerpo están en blanco** hasta que se suban. Es lo
    que se pidió (contenedor vacío, sin placeholder), pero conviene
    saberlo antes de mostrar el curso. Y el título y el texto de
    introducción que estaban horneados en la captura ahora los tiene
    que traer el video.
  · Si se quiere que no queden en blanco mientras tanto, alcanza con un
    fotograma de cada video como `poster` — una línea por diapositiva,
    y se saca el `data-sin-poster`.
  · Al subir los dos del cuerpo el máximo pasa de 199 a 219 y conviene
    volver a correr `npm test` — `puntaje-curso.mjs` lo va a decir solo.

- **El zip de entrega** se arma con
  `python3 tools/build-zip.py . ../surtido-sin-venta.zip` y solo a
  pedido explícito (§3.12).

- **Franjas del lienzo.** Desde la undécima vuelta el lienzo conserva
  2:1 en TODAS las pantallas para no recortar el arte (§24.1), así que
  donde la ventana no es 2:1 quedan franjas — chicas (10px a 1920×1080,
  35px a 1366×768) y continuando el arte con la columna de borde
  estirada (§23.3). Es lo correcto para líneas que llegan horizontales al borde
  —que es lo que tiene este arte—, y no inventa contenido: si una
  captura futura trajera algo con mucho detalle pegado al costado, la
  franja lo va a repetir como un rayado horizontal. Se mira en el
  render, como el resto.

- Los **26 hallazgos de kit (K1 a K26)** se llevan en un prompt al chat
  de `kit-base/`. Desde acá no se editó `kit-base/`. La única
  divergencia respecto del kit es el opt-out `data-sin-poster` en la
  copia del curso de `tools/tests/video-fondo.mjs`, marcada en el
  archivo y relayada como K26.
