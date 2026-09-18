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
| Máximo de puntos medido | **199** (sin los videos reales; 219 con ellos) |
| Medalla | bronce 74 · plata 127 · oro 180 (los "desde N" del cierre los pinta `curso.js` desde `NIVELES`) |
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

### 10.5 · Bloque blanco sobre las líneas circulares — NO REPRODUCIDO

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

## 12. Pendiente / próximo paso

- **Videos.** Los **cuatro** `.mp4` de `video/` son placeholders de 0
  bytes con su nombre final:
  `portada.mp4`, `unidad-1.mp4`, `como-hacemos-el-reporte.mp4` y
  `que-hacemos-con-los-productos.mp4`.
  · Los dos del cuerpo: `initVideoGate` los sondea y **exime el gate
    mientras no se puedan reproducir**, así que el curso nunca queda
    trabado; el día que se suban, el gate vuelve a valer sin tocar
    código.
  · Los dos de fondo (portada y unidad): mientras no estén se ve el
    `poster`, que es la misma captura de siempre. Y ojo con esto, que es
    del kit y no del curso: una `.d-shot-slide--bg-video` **no se
    narra** (el audio lo pone el video), así que esas dos diapositivas
    están mudas hasta que lleguen los archivos.
  Proporción a pedirle al editor: **2:1** (mismo criterio que el PDF).
  Al subir los dos del cuerpo el máximo pasa de 199 a 219 y conviene
  volver a correr `npm test` — `puntaje-curso.mjs` lo va a decir solo.

- **Punto 5 de la cuarta vuelta ("bloque blanco sobre las líneas
  circulares") sigue abierto.** No se reprodujo, y está documentado en
  §10.5 qué se midió para buscarlo. Hace falta una captura de la
  pantalla exacta o el nombre de la diapositiva. Si el bloque resulta
  ser del arte del PDF, es un pedido para el diseñador (§5), no un
  z-index.

- **El zip de entrega** se arma con
  `python3 tools/build-zip.py . ../surtido-sin-venta.zip` y solo a
  pedido explícito (§3.12).

- Los **15 hallazgos de kit (K1 a K15)** se llevan en un prompt al chat
  de `kit-base/`. Desde acá no se editó `kit-base/`.
