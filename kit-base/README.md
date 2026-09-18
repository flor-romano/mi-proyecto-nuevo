# kit-base — Área Aprendizaje (COTO)

**Versión: 1.9.80** · construido a partir de "Surtido sin venta" (curso de
referencia original) y "Prevención cardiovascular" (2º curso real,
fuente de todo lo agregado en v1.4-v1.8), validado contra el Manual de
Diseño + Manual de Contenido oficiales del cliente (ver `CLAUDE.md` §6.5).

Esta carpeta es la base reutilizable de la que parte cada curso nuevo.
La guía de proceso completa (cómo ir de un PDF a un curso terminado,
reglas de diseño/contenido, checklist de arranque) vive en
`CLAUDE.md` — este README solo describe QUÉ hay acá adentro y CÓMO
arrancar un curso con esto. Dentro del repo, `CLAUDE.md` vive un nivel
arriba de esta carpeta; **también hay una copia de `CLAUDE.md` acá
mismo, dentro de `kit-base/`**, para que un zip de esta carpeta sola
(el modo de trabajo normal: sin repo, todo por zip entre chats) ya
traiga la guía completa sin tener que acordarse de mandarla aparte —
bug real de proceso que pasó una vez (se armó un chat nuevo con el
zip de `kit-base/` sin `CLAUDE.md` y quedó sin poder arrancar). Si
`CLAUDE.md` cambia, actualizar las DOS copias (o al menos recordar
copiar la de la raíz acá antes de armar el próximo zip).

## Qué hay

```
kit-base/
├── js/
│   ├── motor-slides.js   — motor de diapositivas/capas/pop-ups (Motor)
│   ├── narrador.js       — wrapper de Web Speech API (narración por voz)
│   ├── scorm-api.js      — wrapper SCORM 1.2
│   ├── xapi.js           — adaptador xAPI/LRS (opcional, en paralelo)
│   ├── fx.js             — efectos decorativos (ripple, partículas, modo cine)
│   ├── coto-player.js    — chrome del reproductor: saludo, toggles, voz,
│   │                       barra arrastrable, toast, retomar (v1.7)
│   ├── coto-media.js     — los 3 patrones de video: fondo, pop-up, circular (v1.7)
│   ├── coto-ui.js        — narración de pop-ups, entrada escalonada, count-up,
│   │                       precarga, imprimir, sonidos, tiempo activo (v1.7-v1.8)
│   ├── coto-hotspots.js  — zonas sobre el arte que revelan información (v1.8)
│   ├── coto-quiz.js      — mini-práctica de opción múltiple genérica (v1.6)
│   ├── coto-cierre.js    — cierre en 2 pasos + confeti + count-up (v1.6)
│   └── curso.js          — PLANTILLA de arranque: el único archivo que
│                           escribe cada curso (no es genérico, se edita)
├── css/
│   ├── coto-base.css               — sistema de diseño (tokens, categorías, kbd, entrada escalonada)
│   ├── coto-base-addendum-v1.8.css — componentes "Learning" (tabs, stepper, índice, instrucciones,
│   │                                  logros, cajón derecho, aro de ícono, tildes, medalla, salida, pasos, aviso)
│   ├── coto-player-chrome.css      — barra superior (.d-top)
│   ├── coto-player-bottom.css      — barra inferior (.d-bottom): nav, contador, progreso arrastrable (v1.4)
│   ├── coto-shot-stage.css         — lienzo de diapositivas-captura + hitboxes .d-shot-hit (v1.7)
│   ├── coto-media.css              — pareja de coto-media.js: los 3 patrones de video (v1.7)
│   ├── coto-fx.css                 — CSS de los efectos que fabrica fx.js (v1.6)
│   ├── coto-quiz.css               — pareja de coto-quiz.js (v1.6)
│   ├── coto-minijuego.css          — cáscara visual del minijuego (v1.9.21)
│   └── coto-cierre.css             — pareja de coto-cierre.js (v1.6)
├── fonts/ — Faible-Black, Roboto (4 pesos), Raleway (2 pesos): reales, con licencia de COTO
├── header-boilerplate.html — HTML de referencia para la barra superior,
│                              pareja de coto-player-chrome.css
├── tools/
│   ├── run-tests.mjs         — corre TODA la suite de tools/tests/ (la lista sale
│   │                           de la carpeta, no escrita a mano — v1.9.39)
│   ├── new-course.mjs        — copia el kit a un curso nuevo + imsmanifest.xml (v1.9.48)
│   ├── import-storyline.mjs  — migra un curso viejo de Storyline: capturas .webp +
│   │                           texto + informe de qué queda a mano (v1.9.57)
│   ├── verify-hitboxes.mjs   — inspección visual de hitboxes (screenshots + overlay)
│   ├── visual-regress.mjs    — regresión visual por screenshots (pixelmatch, v1.9.50)
│   ├── check-contraste.mjs   — contraste de las 23 categorías × 5 pares de uso
│   ├── check-css-duplicates.mjs — selectores CSS repetidos en el mismo archivo (v1.9.39)
│   ├── check-raw-cat-colors.mjs — hex de categoría copiado a mano (bypass de tokens)
│   ├── check-image-weight.mjs   — peso de las imágenes del curso (v1.9.48)
│   ├── build-evaluacion-xml.mjs + evaluacion.ejemplo.json — evaluación → Moodle XML,
│   │                           el único formato de entrega (v1.9.56)
│   ├── build-zip.py          — arma el zip de entrega con flag UTF-8 verificado (v1.9.39)
│   └── tests/                — suite pass/fail genérica, 7 tests (ver tools/tests/README.md)
├── package.json           — dependencias de tools/ (playwright-core, pixelmatch,
│                            pngjs — las 3 se instalan con `npm install`) + scripts npm
└── spec-motor-slides.md   — contrato formal HTML↔JS del motor
```

Todo lo de acá es genérico: **se copia tal cual a cada curso nuevo,
sin editar**. Lo específico de cada curso (`curso.js`, `assets.css`,
`diapositivas.css`, `pulido.css`, `imsmanifest.xml`, `img/`, `video/`)
se escribe aparte, siguiendo el flujo del `CLAUDE.md` §3.

## Arrancar un curso nuevo

1. Copiar esta carpeta completa a `mi-curso-nuevo/`.
2. Cargar las hojas de estilo y los scripts EN ESTE ORDEN (cada uno
   depende de los anteriores):
   ```html
   <link rel="stylesheet" href="css/coto-base.css">
   <link rel="stylesheet" href="css/coto-base-addendum-v1.8.css">
   <link rel="stylesheet" href="css/coto-player-chrome.css">
   <link rel="stylesheet" href="css/coto-player-bottom.css">
   <link rel="stylesheet" href="css/coto-shot-stage.css">
   <link rel="stylesheet" href="css/coto-media.css">   <!-- solo si el curso tiene video -->
   <link rel="stylesheet" href="css/coto-fx.css">
   <link rel="stylesheet" href="css/coto-quiz.css">   <!-- solo si el curso tiene mini-práctica -->
   <link rel="stylesheet" href="css/coto-minijuego.css"> <!-- solo si el curso tiene minijuego -->
   <link rel="stylesheet" href="css/coto-cierre.css"> <!-- solo si el curso tiene cierre con confeti -->
   <!-- acá van los CSS propios del curso: assets.css / diapositivas.css / pulido.css -->
   ```
   ```html
   <script src="js/motor-slides.js"></script>
   <script src="js/scorm-api.js"></script>
   <script src="js/xapi.js"></script>
   <script src="js/narrador.js"></script>
   <script src="js/fx.js"></script>
   <script src="js/coto-player.js"></script>  <!-- chrome del reproductor -->
   <script src="js/coto-ui.js"></script>      <!-- pop-ups, stagger, count-up... -->
   <script src="js/coto-media.js"></script>   <!-- solo si el curso tiene video -->
   <script src="js/coto-hotspots.js"></script><!-- zonas interactivas sobre el arte -->
   <script src="js/coto-quiz.js"></script>    <!-- opcional -->
   <script src="js/coto-cierre.js"></script>  <!-- opcional -->
   <script src="js/curso.js"></script>        <!-- el único que escribe cada curso -->
   ```
   Con v1.9.40, un `curso.js` nuevo arranca así (el resto ya viene hecho
   — el snippet completo, con comentarios de cuándo usar cada llamada,
   vive en `js/curso.js` de esta carpeta; acá solo el resumen):
   ```js
   var Player = initPlayer({
     speakSlide: function (s) { Narrador.speak(Narrador.textOf(s), 'slide'); },
     visitedIndexes: function () { /* índices ya vistos, para la barra */ }
   });
   initPopupNarration(); initPopupStagger(); initStatPopups();
   initPrefetchNeighbors(); initSummaryPrint();
   initTiempoActivo();    // reloj del resumen descuenta video (§6.10.4)
   initVideoSafetyNet();  // pausa cualquier <video> huérfano — llamar SIEMPRE (§6.59)
   initIndexJumps({ visited: … });                  // opcional, gate del menú ☰
   initGlossarySearch(); initGlossaryUnlock({ … });  // opcional, si hay glosario
   initHotspots({ zonas: …, cartel: … });            // opcional, zonas sobre el arte
   initShotSwap();                                   // opcional, carrusel/tabs/pasos
   initCertificatePrint({ courseName: 'Nombre del curso' }); // opcional, botón #d-cert-print
   initBgVideos(); initVideoPlayer({ onFirstPlay: … }); initInlineCircleVideos({ … });
   initMiniQuiz({ bank: …, onFirstFinish: … });
   initCierreCelebration({ … });
   // si hay barra de progreso arrastrable + gate de contenido:
   motor.restoreMaxVisited(estado.vistas);
   ```
   `initTiempoActivo()` e `initVideoSafetyNet()` son las dos únicas
   llamadas de esta lista que van SIN comentar en la plantilla real —
   no dependen de ningún markup del curso, así que no hay motivo para
   dejarlas opt-in (a diferencia del resto: si el curso no tiene esa
   pieza, esa llamada no aplica).
3. Seguir el checklist de `CLAUDE.md` §7 (PDF → render → decidir
   captura íntegra vs. piezas separadas → HTML → hitboxes → `curso.js`
   → CSS propios → `imsmanifest.xml`).
4. Antes de entregar: correr `tools/tests/*.mjs` (los 7, exit 0 en
   todos — `node tools/run-tests.mjs <url>` los corre a todos),
   `tools/verify-hitboxes.mjs` para inspeccionar visualmente
   cualquier diapositiva con hitboxes nueva o recalculada,
   `node tools/check-css-duplicates.mjs <css1> <css2> ...` sobre los
   `.css` propios del curso (detecta selectores repetidos que se pisan
   en silencio, §6.28/§6.33), `node tools/check-image-weight.mjs
   <carpeta>` (formato/peso de `img/`+`video/` antes del zip) y
   `node tools/visual-regress.mjs <url>` sin `--update` (avisa si algo
   cambió visualmente sin querer contra la baseline del curso).
   Armar el zip de entrega con
   `python3 tools/build-zip.py <carpeta> <salida.zip>
   [carpetas_a_excluir...]` — nunca a mano con `zip`, para no perder el
   flag UTF-8 (§3.9). Nunca entregar sin pedido explícito (§3.12).
5. Al cerrar el curso: **NO** editar `CLAUDE.md`/este `README.md` desde
   la sesión de curso (`CLAUDE.md` §0.1, regla dura) — juntar lo nuevo
   que valga la pena retener (ver regla de "¿esto lee algo del curso?"
   en `CLAUDE.md` §1) y llevarlo, en un prompt, al chat dedicado
   exclusivamente a mejorar `kit-base/`. Ese chat es el único lugar
   donde estos dos archivos se editan — evita el patrón ya documentado
   en `CLAUDE.md` §6.17/§6.17.2: un fix que queda atrapado en el zip
   de una sola sesión y que el próximo curso vuelve a tropezar.

## Qué se corrigió al armar v1.0 (no repetir)

Auditando los archivos "genéricos" del curso base antes de copiarlos
acá, aparecieron 3 casos de contenido de curso colado en archivos que
se suponía eran 100% reutilizables — corregidos en esta versión:

- `fx.js`: `initParticles()` tenía 3 IDs de diapositiva hardcodeados
  (`laboratorio`, `casos`, `evaluacion`) en vez del selector genérico
  real (`.slide:not(.d-shot-slide)`, "toda diapositiva HTML nativa").
- `scorm-api.js`: la clave de respaldo en `localStorage` tenía el
  nombre de un curso puntual (`coto-surtido-libre-suspend`) — dos
  cursos copiando este archivo tal cual hubieran compartido el mismo
  storage. Ahora se deriva de la ruta del paquete automáticamente.
- `xapi.js`: el activity ID de cada statement xAPI tenía el slug de un
  curso puntual (`.../surtido-sin-venta/...`) hardcodeado — mismo
  problema, ahora se deriva de la ruta del paquete.
- `speak()`/`speechify()` vivían enteras dentro de `curso.js` (código
  100% genérico atrapado en un archivo específico del curso) — se
  extrajeron a `narrador.js`, con la tabla fonética oficial del Manual
  de Contenido como diccionario base (ver `CLAUDE.md` §6.5).

**Lección para versiones futuras del kit**: "genérico" no es
automático por estar en el archivo "correcto" — hay que auditar el
contenido real antes de asumirlo reutilizable. Repetir esta auditoría
(`grep` por nombres de curso/diapositiva/localStorage keys) cada vez
que se promueva algo nuevo a esta carpeta. **Se repitió al armar v1.6**
(ver más abajo): dos componentes nuevos completos, `coto-quiz.js`/
`coto-cierre.js`, pasaron por la misma auditoría antes de sumarse acá.

## Bugs reales ya corregidos (no volver a introducirlos)

1. **Confeti invisible** (`coto-cierre.css`): el contenedor necesita
   `class="d-confetti"` además del `id="d-confetti"` — todas las
   reglas son `.d-confetti .cf{...}`, y sin la clase cada pieza de
   confeti queda como un `<span>` sin ancho/alto/color, sin ningún
   error en consola.
2. **Festejo prematuro** (`coto-cierre.js`): `unlockCierre()` puede
   llamarse desde una diapositiva ANTERIOR al cierre (ej. al terminar
   la mini-práctica) — el confeti solo se dispara cuando el cierre es
   la diapositiva REALMENTE visible (`celebrateIfOnCierre`), nunca en
   el momento del desbloqueo en sí.
3. **`suspend_data` >4096 caracteres pierde TODO el estado en
   silencio** (`scorm-api.js`, `saveState`) — si un curso se acerca al
   límite, hay que achicar lo que persiste (IDs cortos, flags), no
   asumir que el límite se puede estirar.
4. **Chrome corta la síntesis de voz a los ~15s** en utterances largas
   (`narrador.js`) — ya resuelto con fragmentado por oración; no volver
   a pasar un párrafo entero como una sola utterance.
5. **Modo cine (`fx.js`) puede quedar pegado** si el video se reproduce
   dentro de un pop-up y el alumno lo cierra sin cambiar de
   diapositiva — ya escucha `popupclose` además de `slidechange`.
6. **Un `<button` sin `>` de cierre pasa desapercibido** para la
   mayoría de los chequeos automáticos (el botón conserva nombre
   accesible) pero rompe el `sr-only` de adentro y muestra el texto en
   pantalla — por eso `markup-sanity.mjs` (nuevo en v1.6) chequea HTML
   mal cerrado explícitamente.
7. **Narrar un número que todavía está animándose lee el valor
   inicial** (`narrador.js`, `textOf`): un pop-up de estadística se
   narraba *"se puede disminuir **0%** de la mortalidad"* porque la
   locución arranca junto con el count-up. `textOf` resuelve
   `[data-count-to]` al valor final declarado en el atributo — o sea
   que ese atributo NO es decorativo, es la fuente de verdad del
   número.
8. **`textOf` sobre un solo elemento devolvía vacío**: pasarle un `<p>`
   y buscar `'p'` adentro no encuentra nada. Ya contempla que el propio
   contenedor cuente (`container.matches(TEXT_SEL)`) — hace falta sí o
   sí para `[data-narrate-only]`.
9. **Un `data-require-seen` viejo bloquea el curso para siempre**
   (`motor-slides.js`): al generalizar el gate, un atributo que había
   quedado de una versión anterior del marcado volvió a "activarse" y
   dejó una diapositiva sin forma de avanzar — el alumno queda
   encerrado sin ningún error en consola. Al tocar el gate, revisar
   TODOS los `data-require-seen` del HTML, no solo el que se está
   agregando. `markup-sanity.mjs` chequea que cada valor exista.
10. **El nudge no llegaba a dispararse** (`coto-player-bottom.css` +
    el handler de `advanceblocked`): un `return` temprano cortaba el
    handler antes de marcar los pendientes, así que el alumno veía el
    botón temblar pero nada le indicaba DÓNDE faltaba interactuar.
    Regla: `advanceblocked` siempre tiene que terminar señalando el/los
    elementos pendientes, nunca solo negando el avance.
11. **Las estadísticas del certificado se llenaban antes del último
    logro** (`coto-cierre.js`): mostraba "2/4 logros" en la pantalla que
    justamente otorga el 4º. Los contadores finales se recalculan
    DESPUÉS de otorgar, no en el mismo paso.
12. **CSS que se queda en el curso cuando su JS ya subió al kit.**
    Pasó CUATRO veces: v1.4 (`coto-player-bottom.css`), v1.6
    (`coto-fx.css`), v1.7 (`coto-media.css` y `.d-shot-hit`) y v1.8
    (`.d-shot-img`, el toast, el banner de retomar, el resumen
    imprimible, el layout del cierre). El síntoma es siempre el mismo: un
    archivo del kit usa clases que el kit no define, así que "funciona"
    solo mientras se copie también el CSS del curso anterior.
    **Regla: al promover un JS al kit, buscar su CSS y promoverlo en la
    misma vuelta.** Para verificarlo, comparar todas las clases `.d-*`
    del CSS del curso contra las del kit y revisar una por una las que
    no estén.
13. **Un medio con audio sin nadie que lo apague** (`coto-media.js`,
    `initInlineCircleVideos`): el video circular seguía sonando después
    de cambiar de diapositiva — se quedaba reproduciéndose en una
    diapositiva oculta y el alumno escuchaba una voz sin saber de dónde
    salía. Los otros dos patrones sí tenían punto de corte
    (`slidechange` / `popupclose`); este no tenía ninguno. Ya corregido
    acá. **Regla al sumar cualquier elemento con audio: la pregunta no
    es "¿arranca bien?" sino "¿quién lo apaga?"**
14. **Reusar coordenadas de hitbox de un PDF anterior** — el bug más
    caro y el más difícil de ver: el arte se ve perfecto (el resaltado
    está horneado en la imagen) pero el clic real cae corrido. Ver
    `CLAUDE.md` §3.4; usar `tools/verify-hitboxes.mjs` en CADA
    reexportación, aunque "sea el mismo layout".

### Falsas alarmas (medir antes de "arreglar")

Cinco cosas que parecían bugs y no lo eran — el patrón se repite, así
que vale documentarlo: **el error estaba en el script de medición, no
en el curso**. Modo cine "pegado" (la opacidad real era 1), un video
"de 0×0" (se estaba midiendo otro elemento, en una diapo oculta), el
resumen "sin ocultar" (lo ocultaba el CSS, no el atributo `hidden`),
19 diapositivas "sin narración" (artefacto de leer diapos ocultas
desde el script) y un recap "recortado" (era el toast tapándolo).
Regla: antes de tocar código, verificar que lo medido sea el elemento
correcto **en el estado correcto** (visible, con la voz encendida, con
el nombre real cargado) — mismo espíritu que la lección 6 de
`CLAUDE.md` §6.6.

## Qué queda igual a propósito

`js/narrador.js` sigue trayendo una tabla base de correcciones
fonéticas de vocabulario de **retail** ("ticket", "voucher", "PLU",
"cashback"...) — es la tabla oficial del Manual de Contenido de COTO,
no un descuido: la mayoría de sus cursos son de esa área. Un curso que
no la necesite simplemente no dispara ningún reemplazo (no rompe
nada). Si algún curso de un área muy distinta necesita afinar esto,
usar `Narrador.addFixes()` para sumar/pisar entradas propias — nunca
editar la tabla base acá.

## Historial de versiones

### v1.9.80 — que el curso nuevo no pueda olvidarse de nada

Revisión general del kit con una sola pregunta: **¿qué puede omitir un
curso nuevo sin que nada se lo diga?**

**Y la encontró en mi propio trabajo.** El kit publica 32 funciones
`init*`; la plantilla de `curso.js` mencionaba 23. Las 9 que faltaban
incluían **los 6 módulos que agregué entre v1.9.77 y v1.9.78**. Los
construí, los documenté, los probé — y un curso nuevo no se iba a
enterar de que existen. Tampoco estaban en `contrato-cableado`, así que
escribir su marcado y olvidarse del `init` no daba ningún aviso.

La lección: **agregar una pieza al kit no es escribir el módulo.** Es
escribirlo, ponerlo en la plantilla, cubrirlo en el test de cableado y
nombrarlo en el prompt. Los otros tres pasos son los que hacen que la
pieza exista para quien viene después.

**`contrato-cableado` deja de ser una lista a mano.** Ahora es una tabla
con el mecanismo generalizado: si está el marcado, tiene que estar la
huella que el `init` deja en el DOM. Agregar una pieza = agregar una
fila. Verificado: 5 fallos contra una copia con marcado de cinco piezas
y ningún init.

**`gamificacion.mjs`, el 17º test.** El punto 9.5 del checklist pedía
verificar los cuatro elementos obligatorios a mano — y un checklist
manual se cumple hasta que alguien tiene apuro. Con el cuidado de no
exigirle nada a un curso recién generado: por debajo de 150 palabras de
contenido, informa que está en construcción.

**Y un arreglo mío que había quedado a medias:** §7 seguía terminando
con "seguir con el método de zip de referencia" tres líneas después de
decir que el generador sí hace el `index.html`. Quien leía en orden se
llevaba la instrucción vieja.

La revisión también dice qué NO encontró: ningún id ni `data-*` huérfano
en los boilerplates, y de las 261 clases `.d-*`, las 94 que escribe el
curso son el reparto correcto, no un hueco.


### v1.9.79 — el chrome en teléfono, el test de zoom, y uno que no entró

Séptima y última pasada sobre los relays.

**E2 — el chrome no dependía del alto de la pantalla.** 120px fijos sin
importar la ventana. Medido en un curso limpio: en un teléfono acostado
se come el **31%** (no el 56% que decía el relay — la diferencia era
chrome propio de ese curso). Con las barras compactas bajo
`max-height:460px`, **el lienzo pasa de 270 a 296px** y la tablet queda
igual. Sin sacar un solo control.

**B7 — `visor-zoom.mjs`, el 16º test.** Mira cómo PROGRESA el zoom, no
que exista: que el arranque sea el de "ajustar", que ningún escalón sea
un salto, que "Ajustar" vuelva al mismo lugar. El negativo se probó
rompiendo el código real del kit, no con un fixture.

**B3 no entró, y es la parte más útil de la versión.** Intenté hacer que
`visual-regress` ignore los toasts. El primer enfoque —tapar las zonas
con una capa propia— **rompe la herramienta entera**: todas las capturas
salen idénticas y deja de detectar cualquier cosa, incluso con el umbral
en 0,01%. El segundo (`mask` de Playwright) tampoco detectaba, y
buscando la causa apareció que **la versión original, sin mis cambios,
tampoco detecta un `hue-rotate` sobre el lienzo entero** en ese banco de
pruebas.

Así que el banco no era confiable y el problema es anterior. La
herramienta vuelve intacta a su versión de v1.9.78. La regla que queda:
**antes de arreglar una herramienta de verificación, comprobá que
detecta algo** — si no, lo que estás midiendo es el banco.


### v1.9.78 — el visor de documentos

Sexta pasada: entra la otra mitad de la sección C. `coto-visor.js` +
`coto-visor.css` traen paginado, zoom, "Ajustar", arrastre, pantalla
completa, descarga, **gate por "documento leído entero"** y el paginado
dentro de la diapositiva (`initDocEnDiapo`). Más el panel de recursos
descargables y `tools/pdf-capa-texto.py`.

Lo que hace que no sea un visor genérico:

- **El zoom se mide, no se escribe.** Medido con una hoja de 1200×1700:
  el ajuste da 33% y el primer escalón 41%, no 125%.
- **El alto del lienzo lo fija el CSS**, porque si sale del contenido el
  `ResizeObserver` entra en bucle y la tarjeta se achica sola.
- **Tocar el fondo respeta la hoja, no su marco**, con un umbral de 6px
  porque arrastrar termina en un `click`.
- **`Esc` con dos niveles, en fase de captura**: sale de pantalla
  completa antes de cerrar el pop-up. Medido: el evento no llega al
  listener del motor.
- **La pantalla completa es dentro de la página**, porque
  `requestFullscreen` en un iframe de LMS falla en silencio.

El gate quedó medido en las dos direcciones: con 1 y 2 de 3 hojas
leídas bloquea; con las 3, deja pasar.

**Lo que no pude verificar:** el camino de OCR de `pdf-capa-texto.py`
—esta máquina no tiene `pymupdf` ni `tesseract`—. Sí verifiqué que falla
prolijamente cuando faltan, diciendo cuáles instalar.

Y una anécdota que vale: **`check-css-duplicates` falló sobre el CSS del
visor recién escrito** (`.d-visor-zoom-val` declarado dos veces). Cazó
CSS nuevo, no heredado.


### v1.9.77 — las piezas que los cursos venían inventando

Quinta pasada: entra la primera mitad de la sección C del relay, en
`js/coto-piezas.js` + `css/coto-piezas.css`.

- **`initRevelados`** — revelado ACUMULATIVO: clic en el punto N y las
  anteriores quedan visibles. Ninguna pieza del kit hacía eso
  (`initHotspots` limpia los demás, `initShotSwap` cambia la captura
  entera). Con `faltan()` en el mismo contrato que los gates, y pagando
  solo la primera vez.
- **`initTandas`** — dos juegos de carteles sobre el mismo arte, con los
  controles escondidos en los extremos (los dibujó el kit, no el arte).
- **`initPasosRepaso`** — pasos numerados que leen el estado del kit con
  `MutationObserver` y no con un listener de clic: el estado también
  cambia con las flechas y al restaurar una sesión anterior.
- **`initSalidaRepaso`** — el "Siguiente" de la última pregunta lleva a
  la diapositiva siguiente.
- **Devolución distinta según acierto o error** (`[data-fb-ok]` /
  `[data-fb-no]`): antes salía el mismo texto en los dos casos, y
  terminaba presuponiendo que erraste.

Dos de la lista ya estaban resueltas —la opción múltiple salió en
v1.9.75 y el workaround de A5 desaparece porque A5 se arregló en
v1.9.73— y los pips por objetivo se quedan afuera a propósito: son
contenido, no mecanismo.


### v1.9.76 — cinco tests nuevos: la suite pasa de 10 a 15

Cuarta pasada sobre los relays. Entran `narracion-completa`,
`iconos-indice`, `puntaje-maximo`, `locucion-control` y `video-fondo`,
**todos verificados en los dos sentidos**: verde contra un curso limpio
y rojo contra una copia rota a propósito.

Cazan cosas que ningún test veía: una diapositiva muda, una pieza
escondida con CSS que el narrador lee igual, dos temas con el mismo
ícono, un `<symbol>` definido fuera del sprite, el puntaje máximo real
contra el declarado, `suspend_data` pasando la mitad del cupo, una
diapositiva que narra dos veces, y un video de fondo que se queda
congelado en el poster.

Tres detalles del andamiaje que valen: `locucion-control` instala un
**motor de voz falso** (en headless todo termina al instante y el caso
"silenciar a mitad" no existe), `video-fondo` lanza su **propio Chromium
con la política de autoplay real** (sin eso el bug no se reproduce), y
`puntaje-maximo` lee `data-valor` y no el `textContent` animado.

**`iconos-indice` encontró un bug del propio kit el día que se
enchufó:** el scaffold le daba el mismo ícono a los dos temas, violando
la regla que el test hace cumplir. Esa es la señal de que un test está
bien escrito.


### v1.9.75 — las trampas y los métodos, y tres que eran código

Tercera pasada sobre el relay de "Seguridad de la información": entran
sus secciones F (trampas), E (convenciones) y J (métodos de
construcción) al `CLAUDE.md` — más los tres puntos de F que al
verificarlos resultaron ser **bugs de código y no documentación**:

- **`initShotSwap.go(n)` pagaba por quedarse donde estabas.** `onChange`
  se disparaba aunque no hubiera cambio, así que un paginador le pagaba
  al alumno por tocar la variante que ya estaba viendo. Medido: tres
  toques repetidos daban 4 llamadas; ahora dan 1.
- **El ✓ del repaso regalaba la respuesta en opción múltiple.** En
  Verdadero/Falso el ✓/✕ es la etiqueta del botón; en una múltiple
  aparecía sobre la correcta antes de contestar. Ahora exige
  `.d-repaso-btns--vf`.
- **`<kbd>` era navy sobre navy en cualquier fondo oscuro.** Ahora
  hereda el color y deriva fondo y borde de `currentColor`.

La lección de la versión: **un relay que trae mediciones vale más que
uno que trae diagnósticos.** Dos de esos tres se detectaron por un
número que no cerraba —220 de puntaje contra 210 declarado—, no por leer
el código. El curso no sabía que `go()` tenía un bug: sabía que le
sobraban diez puntos.


### v1.9.74 — el test que faltaba, y los gaps de herramienta

Segunda pasada sobre el relay de "Seguridad de la información".

**`overlays-colocados.mjs`**, el décimo test. Lo justifica una frase del
relay: *catorce píldoras revelables no se veían, con los once tests en
verde*. El motor avisaba por `console.warn` desde v1.9.39 y **ningún
test escuchaba los warnings**. Ahora se escuchan, y además se mide que
cada overlay caiga dentro de su captura. Verificado en los dos sentidos.

**A7** — el gate de video se peleaba con el auto-avance: el propio video
que satisfacía el gate no lo satisfacía, y la diapositiva quedaba
trabada. Ahora un video que llegó al final cuenta como visto, en los
tres patrones de video del kit.

**B4** — el umbral de peso trataba igual a una animación y a una
captura, así que un `.webp` animado era falso positivo permanente. Se
detecta la animación leyendo el archivo y tiene umbral aparte.

**B5** — `hitbox-click-check` reportaba como roto cualquier hitbox de
0×0, y un elemento escondido a propósito mide eso: **el kit se hacía
fallar a sí mismo** con sus propias flechas de paginado.

**E1 — Ken Burns apagado por default.** Tercer cliente sobre el mismo
efecto, y el que definió. El efecto no se borra: se invierte la palanca.


### v1.9.73 — el relay de "Seguridad de la información"

21 diapositivas, 11 rondas, el relay más grande que recibió este kit.
**Tres de sus hallazgos ya estaban arreglados** al llegar: los había
traído también el relay anterior y salieron en v1.9.72. Dos cursos
independientes encontrando lo mismo es la señal más fuerte de este flujo.

Entraron seis arreglos, todos medidos:

- **`initGateHints({ pendientes })` estaba documentado y el código no lo
  leía.** Un curso con un gate propio lo implementaba siguiendo la
  documentación y no pasaba nada, sin error.
- **El generador escribía tres CSS y el boilerplate enlazaba uno**:
  `assets.css` y `pulido.css` llevaban versiones muertos en disco.
- **`initIndexJumps` apuntaba por defecto a un índice que el chrome
  generado no tiene**, así que el menú lateral quedaba **sin gate**: se
  podía saltar al cierre sin cumplir nada. Medido: antes 0 de 7 ítems
  bloqueados, ahora 6 de 7.
- **El segundo clic no cerraba el popover**, porque el CSS también abre
  con `:focus-within` y el clic deja el foco en el botón. Mismo motivo
  por el que `Escape` ya hacía `blur()`.
- **El hover plano tapaba el arte.** La regla correcta ya estaba escrita
  tres reglas más abajo, en `.d-shot-hit--indice`. Se subió a la base.
- **El buscador del glosario usaba una clase que no existe** en ningún
  CSS del kit.

Ese último dejó la lección de la versión: **un arreglo puede tapar el
síntoma que delataba a otro.** El `data-gloss-search` de v1.9.71 hizo que
el buscador funcionara, y al funcionar dejó de ser evidente que su clase
estaba mal escrita.

**Lo que no entró no son parches pendientes, es otra clase de trabajo:**
quince piezas nuevas (un visor de documentos con zoom y paginado, gate
por "documento leído entero", panel de recursos descargables…), cambios
de default que son decisión de producto, ocho tests por escribir y una
pasada de documentación. Está todo mapeado en §7.19.


### v1.9.72 — el relay de "Surtido sin venta", y una regresión propia

Diez hallazgos de un curso que pasó siete rondas con el cliente.
Verificados uno por uno: **nueve ciertos, uno falso**. Ocho aplicados.

**K1 lo introduje yo en v1.9.71.** El `position: relative` que le puse a
`.d-fab-pop--ayuda` para el degradado del panel pisaba, por orden de
fuente y misma especificidad, el `position: absolute` de `.d-fab-pop`:
el panel dejaba de ser overlay y **los dos botones flotantes terminaban
en el medio del lienzo**. Reproducido con los mismos números del relay
(pila en `y=265, h=465` cuando va en `y=615, h=115`). No hacía falta:
`absolute` también arma bloque contenedor.

Salió del kit, pasó los 9 tests y lo encontró el cliente — así que el
arreglo de verdad es **K1b**: `check-css-duplicates` ahora avisa cuando
un modificador `.a--b` duplicado pisa una propiedad estructural de su
base. Las dos condiciones están medidas: la versión amplia da avisos por
overrides legítimos, y un ⚠️ que salta por lo correcto deja de leerse.
Verificado en los dos sentidos: 0 sobre el kit arreglado, y caza el bug
de v1.9.71 con líneas exactas.

**K10 — el patrón estrella no arrancaba nunca solo.** El video de fondo
de la portada quedaba congelado en el poster, y no era un bug raro: los
navegadores bloquean el autoplay con sonido sin gesto previo, así que en
la primera diapositiva el `play()` era rechazado siempre. Lo que se
bloquea es el sonido, no el video. Ahora reintenta mudo y el botón pasa
a ofrecer el audio. Medido con política de autoplay real: antes
`tiempo:0` y en pausa; después reproduce, y al activar el sonido sigue
de largo sin volver a empezar.

**K9 — el botón de locución releía todo en vez de reanudar.** El kit ya
tenía `seek()`, `progreso()` y un `cancel()` que no borra el estado: los
tenía y no los usaba. Ahora reanuda donde se cortó; si ya había
terminado queda en silencio (decisión de producto: releer entero es lo
que el cliente reportó como bug).

**K2 valía por dos cursos.** Un `[data-place]` dentro de una capa oculta
arranca sin coordenadas y cae fuera del lienzo. Lo verifiqué contra el
curso de referencia ya aprobado y daba el mismo fallo, palabra por
palabra. Arreglado en el motor y no en CSS, para no pisarle el CSS a un
curso que posicione sus overlays a mano: **2 fallos → 0**.

**K3 era el falso.** Decía que `.d-mj-fin-stat` no declara
`position:absolute`; computa `absolute` — la regla está doce líneas más
arriba, junto a sus hermanas. No se tocó nada.

También entraron: el tilde de "ya visto" y la línea de progreso del
índice, que el generador emitía y nadie cableaba (K4); la plantilla que
descartaba el `refresh` del glosario y dejaba los términos con candado
en un curso terminado (K5); tres textos que decían que el generador no
hace el `index.html` (K7); y dos archivos de trabajo que viajaban al zip
de entrega (K8).

**K6 queda afuera a propósito:** faltan estilos de lista para fichas de
contenido, pero es el primer caso y la regla del kit pide un segundo
antes de generalizar.


### v1.9.71 — cuatro piezas que el kit traía y nadie enchufaba

Relay de "Pedidos de PLU set a Compras": 30 hallazgos con archivo y
línea. Verificados uno por uno contra el código real — **29 ciertos, 1
mal atribuido**. El mejor medido que recibió este kit, y el más
incómodo, porque el bloque grave no era una lista de bugs sino un
patrón: **el kit trae la pieza, nadie la cablea, y no hay ningún error**.

| | pieza que ya venía | qué pasaba sin el cable |
|---|---|---|
| B1 | `speakSlide` en `initPlayer()` | **el curso quedaba MUDO en todas sus diapositivas** |
| B2 | `motor.restoreMaxVisited()` | la franja de "bloqueado" no existía en el DOM |
| B3 | `#d-salida` (CSS desde v1.8) | "Salir del curso" no hacía nada visible en un LMS |
| B4 | `.d-rotate-notice` (CSS desde v1.9.39) | teléfono vertical: lienzo achatado sin explicación |

B1 es el peor desde el §6.24: `speakSlide` se usaba solo en el click del
botón "Locución", así que narrar al pasar de diapositiva quedaba como
línea a escribir en cada curso. Los pop-ups sí narraban, con lo cual la
falla no se leía como "la locución no anda" sino como "anda a veces".
Medido interceptando `Narrador.speak`: 14 diapositivas, 14 mudas, cero
errores en consola. Ahora lo engancha el kit.

B4 es el caso de manual: el comentario del CSS decía "agregar a mano,
curso por curso". Se agregaba en cero cursos. **Una instrucción en un
comentario no es un mecanismo.**

**Test nuevo, el 9º** (`contrato-cableado.mjs`). Los 8 que había miden
lo que la página HACE, y estas fallas son cosas que la página NO hace —
un curso mudo no rompe nada, está callado. Éste verifica el contrato:
por cada pieza que el kit trae, "¿está enchufada?". Verificado en los
dos sentidos: 9/9 en verde contra un curso recién generado, y 5 fallos
contra una copia con el cableado roto a propósito.

**El choque que no se resolvió aplicando el parche.** El relay pedía
reponer "Frase 4 de 12" en el panel de locución, porque un cliente no
entendía que la barra servía para adelantar. Pero el código tenía
escrito que ese contador se había sacado por pedido explícito de OTRO
cliente. Los dos reportes son ciertos y no dicen lo mismo: uno objeta
exponer los fragmentos, el otro señala que la barra no se distingue de
la de volumen. Se atacó lo segundo sin reintroducir lo primero —
título "Avance" (que hace par con "Volumen"), barra con marcas, una
línea que explica el gesto, y el estado en palabras donde antes había
un slider gris y nada más.

**El hallazgo mal atribuido:** D3 culpaba al boilerplate de que el
pop-up "Antes de empezar" quede mudo. `.d-instr-item` sí está en
`TEXT_SEL`, y `.d-instr-card` no existe en el kit: el marcado mudo es
del curso. No se tocó nada.

También entraron: el favicon muerto dentro del `<body>` (A1), el
buscador del glosario que se veía pero no filtraba por faltarle
`data-gloss-search` (A2), el punto doble de `textOf()` (A3), el ✕ del
pop-up de video tapado por el aviso de error con cualquier `.mp4` de 0
bytes (A4), el aviso de logro pisando el pie del lienzo —ahora
`--d-award-toast-bottom` (A5)—, los dos paneles que quedaban abiertos al
barrer el mouse (A6), el panel de Ayuda que perdía su cabecera al
scrollear (A9), el enunciado del quiz que se iba de vista a 390px de
alto (A10), la trama de "bloqueado" ilegible a 22% (A11), la locución
que se pisaba al pasar de diapo —**4 clics rápidos → 1 narración**, medido
(D1)—, las pronunciaciones de PLU y códigos numéricos (D2) y el cierre
que era un trinquete de un solo sentido (D6).

**Un error propio, del que sale la lección más útil:** separando códigos
en dígitos escribí una regla de 4 y afirmé en el comentario que un año
no colisionaba. Un año son cuatro dígitos: "en 2026" se narraba "en 2 0
2 6". Lo agarré probándola, no releyéndola. Escribir en el comentario
por qué algo es seguro no lo vuelve seguro; si la justificación se puede
correr en 30 segundos, se corre.


### v1.9.70 — el opt-out del Ken Burns no apagaba nada (y fallaba callado)

Zip de parches de 11: **nueve idénticos** a los ya aplicados en v1.9.57
(comparados desde el `diff --git` hacia abajo, no por nombre ni
versión), uno —el micrófono tachado— ya aplicado en su momento con otra
diagonal, y **uno nuevo y correcto en el diagnóstico**: un curso quería
apagar el Ken Burns de las diapositivas-captura, y la receta que traía
no funciona.

```css
/* lo que el curso escribía, cargado DESPUÉS del kit */
.d-shot-slide--bg-layered > .d-shot{ animation:none; }
```

Sigue animando. El selector del kit lleva
`:not(:has([data-hit], [data-place]))` desde v1.9.43 (por una razón
buena y no relacionada: un `transform` continuo en el ancestro rompe
cualquier `getBoundingClientRect()` leído adentro), y eso lo sube a
**0,3,0** contra **0,2,0** de la receta. El orden de carga solo desempata
cuando la especificidad empata. Sin consola, sin error, sin test que lo
agarre: el curso escribe la línea y no pasa nada.

**Arreglo, sin cambiar el default:** la animación se lee de una custom
property con fallback, así que un curso la apaga en una línea y la
especificidad deja de importar (las variables se heredan).

```css
:root{ --d-ken-burns: none; }          /* todo el curso */
#s-3 .d-shot{ --d-ken-burns: none; }   /* una diapositiva sola */
```

Verificado en chromium contra el CSS real del kit: default anima; con
`[data-hit]` adentro no anima (la exclusión de v1.9.43 sigue viva); con
la variable no anima; con `prefers-reduced-motion` no anima; y con la
receta corta **sigue animando**, que es justamente lo que ahora está
documentado en `coto-shot-stage.css` y en §7.16.

De paso quedó registrado un paso en falso propio: probando el archivo
suelto pareció que el `prefers-reduced-motion` local del kit tenía el
mismo agujero. En el stack real no lo tiene —`coto-base.css` anula con
`*{animation:none!important}`, que gana sin depender de especificidad—.
Medir el archivo no es medir el producto.

**Regla que queda:** cuando el kit le ofrezca una palanca al curso, la
palanca es una custom property, no "pisá esta regla". Una regla para
pisar es una promesa que se rompe sola la próxima vez que alguien le
agregue un `:has()` al selector.


### v1.9.68 — `PROMPT-CURSO-NUEVO.md`: el prompt de arranque deja de improvisarse

Faltaba, y era el mismo hueco que este kit ya cerró tres veces con
código: algo que se rehace igual en cada curso y que, por rehacerse de
memoria, pierde detalles. El prompt para abrir el chat de un curso
nuevo no estaba en ningún lado — se escribía a mano cada vez.

Ahora vive en el kit, versionado, y **viaja con cada curso generado**
(el scaffold lo copia): si alguien retoma esa carpeta en un chat nuevo,
el procedimiento está adentro y no en la memoria de quien la armó.

Cubre lo que un chat de curso tiene que saber antes de escribir una
línea: qué leer del `CLAUDE.md` (§7 el checklist, §0.1 la regla de que
desde ahí NUNCA se edita el kit, §7.3 los bugs que no hay que
reintroducir, §1 el corte kit/curso), el comando del generador, la
decisión de captura-vs-HTML por diapositiva, qué NO escribir en
`curso.js` porque el kit ya lo hace, y qué correr antes de entregar.

Verificado contra un curso recién generado: el `npm test` que el prompt
indica da **8/8**, y el archivo aparece en la carpeta del curso.


### v1.9.67 — el destello de arranque: todas las diapositivas visibles a la vez antes de que corra el motor

Dos zips de parches; el segundo era el primero más uno. De los 7, cinco
ya estaban aplicados (v1.9.62) — lo nuevo son dos bugs reales, los dos
reportados **desde una captura de pantalla de un usuario**, que es
justo el tipo de bug que no aparece en la máquina de quien arma el
curso.

- **Destello de arranque (`motor-slides.js` + `coto-shot-stage.css`).**
  Ninguna `.slide` trae `hidden` en el marcado, y el motor recién las
  oculta en su primer `go()`. Entre que el navegador pinta el HTML y
  ese momento, las N diapositivas están **todas visibles y apiladas**
  (`.slide` es `position:absolute; inset:0`), así que se ve un instante
  con todos los textos del curso superpuestos. Medido acá sobre un
  curso recién generado, cargándolo **sin JavaScript** —que es
  exactamente el estado previo al motor—: **7 de 7 visibles a la vez**,
  cero con `hidden`. Con el fix: 1. Afectaba a los tres cursos
  terminados y a todo lo que genera el kit.
  Se resuelve con una regla CSS (`.d-stage:not([data-ready])`) y no
  pidiendo `hidden` en cada `<section>`: son 12, 20 o 26 secciones
  según el curso, es el detalle que se olvida al agregar una
  diapositiva, y ningún test lo atraparía — para cuando los tests miran
  el DOM, el motor ya ordenó todo. Ningún curso ya entregado tiene que
  tocar una línea.
- **El video circular se veía cuadrado al reproducir
  (`coto-media.css`).** El redondeo dependía SOLO del `overflow:hidden`
  del wrapper, y un `<video>` reproduciéndose suele promoverse a su
  propia capa de composición, que no siempre queda recortada por el
  `overflow` de un ancestro. Depende del navegador y de la aceleración
  por GPU, así que puede no verse en la máquina de quien arma el curso
  y sí en la del alumno. Ahora el propio `<video>` lleva
  `border-radius:50%`, que no depende del recorte del ancestro.


### v1.9.66 — rebalanceo de puntaje: un relay que no traía código de kit, y las 2 cosas que igual salieron de verificarlo

Viene de un reporte real del cliente: *"me equivoqué bastante e igual
llegué al máximo del puntaje, no me pareció correcto"*. Tenía razón, y
la causa era estructural: el recorrido obligatorio por gate más el
minijuego ya sumaban el oro, así que **se llegaba a la medalla máxima
sin contestar una sola pregunta del repaso**; y el bonus era binario
en una actividad con reintentos ilimitados, o sea un premio por
insistir.

El relay llegó diciendo que el cambio vive entero en `curso.js`
(puntos y umbrales son contenido, §1) y que lo que sube es la lección.
Verificado antes de aceptarlo: `medallaDe()`/`pintarMedalla()` ordenan
los niveles internamente, así que el kit ya lo soportaba sin tocar
nada. Igual quedaron dos cosas, las dos de comprobar afirmaciones que
el relay hacía sobre código del kit:

- **`initShotSwap` dispara `onChange` N−1 veces por grupo de N
  variantes**, y ahora está documentado en el docblock de `onChange`.
  La variante 0 se marca vista al inicializar pero no premia — y hace
  bien, si premiara repartiría puntos al cargar la página. El
  comportamiento era correcto e invisible para quien escribe la tabla
  de puntos: es el origen exacto de 25 puntos que ese curso declaraba
  y nunca pagó.
- **El contador de puntos publica `data-valor` con el número
  verdadero.** El count-up hace que leer el `textContent` a mitad dé
  valores intermedios; medido acá: 0 / 21 / **46** / 50 a los
  0/80/200/400ms. El "46 donde hay 50" es lo peor, porque parece un bug
  de producto y no un error de lectura. En vez de documentar "esperá
  650ms", `updateHud()` escribe el valor exacto antes de animar: el
  dato correcto está disponible desde el primer instante.

Y una **regla nueva en el checklist §7.3**: los 3 umbrales de medalla
nunca se escriben a mano — se derivan del máximo realmente alcanzable,
descontando placeholders, y ese máximo se verifica con un recorrido
instrumentado. **La tabla es una intención; el contador es el hecho.**


### v1.9.65 — los tests: se cierran los tres agujeros por donde pasaron los bugs de esta ronda

Los tres bugs más caros de las últimas versiones **pasaron la suite en
verde**. No porque faltara un test, sino porque el que correspondía
miraba al lado. Cada arreglo se validó **revirtiendo el bug a
propósito** y confirmando que el test lo agarra.

- **`clip-audit.mjs` (nuevo, 8º test).** Detecta contenido recortado
  dentro de un contenedor que no scrollea — el modo de falla del
  minijuego, que dejaba 3 de 12 opciones inalcanzables con la suite en
  7/7. Construirlo enseñó dos cosas: la medición correcta es por
  **rectángulo contra el ancestro que recorta**, no por `scrollHeight`
  del propio elemento (`.d-mj-play` tenía `overflow:visible`; quien
  recortaba era `.d-stage`, varios niveles arriba), y hay que **revelar
  las capas ocultas** una por una, porque la capa de juego arranca
  detrás de la intro. Filtra lo decorativo (`.sr-only`,
  `aria-hidden`, imágenes con `object-fit`) para no cantar lobo.
  Verificado: 45 hallazgos sin el fix, 16 con él.
- **`check-globals.mjs` (nuevo).** Verifica que todo símbolo que un
  módulo consume de `global` lo publique alguien. Es la pregunta de una
  línea que habría evitado el bug de `window.Player` — tres versiones
  de toasts de logros muertos, sin un error en consola. Estático, corre
  en milisegundos, entra en `npm run test:kit`. También detecta un
  símbolo publicado por dos archivos, donde el orden de los `<script>`
  decide en silencio.
- **`check-contraste.mjs` ahora mira el chrome.** Solo evaluaba la
  paleta por categoría, y por eso el subtítulo del header vivió con
  **2.25:1** (AA pide 4.5). Los pares del chrome son fijos, así que se
  evalúan aparte, con los tokens leídos del CSS real.
- **`irASlide()` en `_shared.mjs`.** El bug de navegar clickeando el
  índice —que en un curso con gate está `disabled`, y el clic es un
  no-op silencioso— estaba en **tres** archivos. En vez de un tercer
  copy-paste, una sola implementación que navega por el motor **y
  verifica que llegó**. Efecto secundario importante: `scroll-audit` y
  `hitbox-click-check` venían auditando solo las diapositivas
  alcanzables de cualquier curso gateado, en silencio.
- **`scroll-audit` suma el teléfono acostado** (844×390 y 932×430). Sus
  6 resoluciones tenían 720px de alto como mínimo: ninguna probaba el
  eje donde falta ALTO, que es el punto ciego estructural de una
  escalera responsive pensada por ancho.


### v1.9.64 — auditoría de los 3 cursos terminados + 2 lotes de parches: el repaso rápido sube al kit, y un bug que dejaba trabado el minijuego en teléfono horizontal

La pregunta que originó esta ronda era "tuve que hacer decenas de
ediciones para llegar a los cursos finales". Medido: **el 93-96% de las
reglas del CSS propio de cada curso está pisando clases del kit**
(233 de 241 en NOA, 238 de 254 en PC, 125 de 132 en SA). Eso no es
diseño de curso, es el curso peleándose con los defaults.

Y el campeón absoluto es `.d-repaso*`: **106 reglas** entre dos cursos.

- **`css/coto-repaso.css` + `initRepasoRapido()` — el repaso rápido
  sube al kit.** §6.46 lo había dejado del lado del curso, y en ese
  momento estuvo bien: existía en UN curso, y la regla del §4 pide un
  segundo caso. Ese caso llegó. De las 42 reglas con el mismo selector
  en los dos cursos, **40 son idénticas byte a byte** — no es diseño
  convergente, es copia y pega. La JS iba por ~95 líneas al 70% de
  similitud. Lo que NO viaja: la colocación (NOA lo apoya sobre el arte
  con `[data-place]`, SA lo pone en una diapositiva normal) y el
  contenido de las preguntas.
- **Minijuego trabado en teléfono horizontal — bug BLOQUEANTE.**
  Medido a 844×390 sobre el kit v1.9.63: `.d-mj-play` necesitaba 355px
  y tenía 270, con `overflow-y:visible` — 3 de las 12 opciones
  físicamente inalcanzables, sin scroll ni gesto que las trajera. Como
  el minijuego suele ser gate obligatorio, deja el curso **imposible de
  terminar** desde un celular acostado. Lo no obvio es por qué ningún
  mecanismo existente lo cubría: el bloque que trae el `overflow-y:auto`
  es `max-width:600px` y el teléfono apaisado tiene 844px de ancho —
  **es ANCHO; lo que le falta es ALTO** — y el aviso "Girá tu
  dispositivo" solo sale en portrait, que es justo lo contrario.
- **Contraste del subtítulo del header.** `.d-brand small` usaba
  `--brand-soft` directo, un token pensado para fondo claro, sobre el
  degradado de marca. Verificado con mi propio cálculo, idéntico al
  reportado: **2.25:1** contra el extremo claro (AA pide 4.5:1). Ahora
  4.79:1 en el peor punto. Afecta a todos los cursos.
- **`verify-hitboxes.mjs`, segunda vuelta.** En v1.9.61 arreglé la
  navegación; faltaban dos cosas: ahora **verifica que llegó** a la
  diapositiva (si no, avisa y no la audita, en vez de medir la
  anterior) e **ignora los `[data-hit]` ocultos a propósito** — la
  flecha de un carrusel da 0×0 legítimo, que es la firma exacta de
  "coordenadas rotas", y un ⚠️ que aparece siempre es un ⚠️ que se
  deja de leer.
- **Se saca el certificado descargable** (decisión de producto del
  cliente). Verificado antes de borrar: existía desde §6.59 pero
  **ningún curso lo integró nunca** — cero llamadas y cero
  `#d-cert-print` en los tres. Ojo al auditar: `.d-cert-stats`,
  `.d-cert-note` y `@keyframes d-cert-shine` son del RESUMEN de cierre
  y siguen en uso.


### v1.9.63 — auditoría del 3er curso terminado: el gate de pop-ups y el aviso de "qué te falta" dejan de reescribirse en cada curso

Sale de revisar "Prevención cardiovascular" ya terminado, sobre el kit
v1.9.62. Primero lo bueno: **cero drift** — el curso usa los archivos
del kit sin tocar uno solo, y tiene 17 funciones propias contra 34 del
curso más viejo, porque ya se apoya en los módulos del kit en vez de
reimplementarlos.

- **`initPopupGate()`** (`js/coto-ui.js`). `faltanPopups()` estaba
  escrita, con el mismo cuerpo, en los **tres** cursos terminados —
  cambiaba solo el nombre del atributo (`data-require-popups` en dos,
  `data-require-fichas` en el tercero: la divergencia que aparece sola
  cuando cada curso reescribe lo mismo) y qué mapa de estado leía. El
  kit ya tenía la otra mitad resuelta con `initVideoGate()` (v1.9.62);
  faltaba la de pop-ups. Mismo contrato `faltan(slideEl)`, y además se
  encarga solo del `popupopen` que los tres cursos también repetían.
- **`initGateHints()`** (`js/coto-ui.js`). Esta duele más: el kit ya
  tenía el **CSS** (`.d-shake` en "Siguiente", `.d-nudge` en el
  elemento pendiente, los dos con `prefers-reduced-motion`) desde que
  se extrajeron de este mismo curso — pero nunca el JS que los
  dispara, así que cada curso tenía que acordarse de cablearlo. Mismo
  seam mal puesto que §7.08 encontró con los puntos y logros. Un gate
  que solo dice "no podés avanzar" deja al alumno buscando qué le
  falta; esto señala la interacción pendiente y dice cuántas quedan.
- **`.d-nudge` deja de estar atado a `.d-shot-hit`.** El pulso lo
  dispara el gate sobre "el elemento que falta tocar", que en un curso
  es una hitbox pero en otro es una tarjeta o un botón del cuerpo de
  la diapositiva. Con el selector viejo, el pulso sobre cualquier otra
  cosa era un no-op **silencioso**: la clase se ponía y no pasaba
  nada.
- **Se explicita el orden del glosario** (consulta directa: "¿está
  definido por orden de aparición?"). Estaba implementado pero no
  escrito en ningún lado: el kit lee los `<dt>` en el orden del HTML y
  **no los ordena nunca**. La convención del molde es orden de
  aparición, que encaja con el desbloqueo progresivo — lo desbloqueado
  queda arriba y lo que falta abajo, así el glosario se lee como un
  mapa del avance.

Verificado en vivo contra el curso real: el gate descuenta el pop-up
al abrirlo, "Siguiente" tiembla, los 3 triggers pendientes pulsan y el
toast dice "Te quedan 3 tarjetas por ver antes de seguir". Y el curso
sigue dando 7/7, igual que uno generado desde cero.


### v1.9.62 — relay de "Prevención cardiovascular": el bug que dejaba mudos los avisos de logros, `initVideoGate()`, y se saca el desplazamiento lateral

Cuatro parches desde la migración de "Prevención cardiovascular" al
kit v1.9.61. Los cuatro se verificaron contra el código real y los
cuatro resultaron ciertos.

- **`js/coto-player.js` — `window.Player` no existía, y era un bug que
  el propio kit introdujo en v1.9.60.** `coto-logros.js` saca sus
  avisos con `global.Player.toast(...)` (el "+N · motivo" de cada
  `award()` y el "🏆 Logro: …" de cada `unlock()`), pero `initPlayer()`
  solo DEVOLVÍA el objeto: el boilerplate y los dos cursos lo guardan
  en una variable local del IIFE que nunca llega a `window`. O sea que
  todos esos toasts estaban muertos, sin un solo error en consola. No
  se había visto porque `coto-logros.js` es posterior a los dos cursos
  y ninguno lo carga todavía — el bug estaba servido para el primero
  que lo usara, que fue este. Ahora `initPlayer()` publica
  `global.Player` además de devolverlo, mismo criterio defensivo que ya
  usaba `initVideoSafetyNet()` dos líneas más arriba. Verificado en
  vivo: los dos toasts que no salían, salen.
- **`js/coto-media.js` — `initVideoGate()`.** `videoUsable()` decía
  desde v1.9.9 "no exijas un video que no se puede reproducir o el
  curso queda imposible de terminar", pero nunca dio el **cómo**, así
  que cada curso lo improvisaba — y resolverlo mirando el `<video>` de
  la diapositiva sale mal: de 9 diapositivas con gate solo 2 tenían un
  `<video>` en el DOM (las otras 7 lo abren en pop-up). Con
  placeholders de 0 bytes esas 2 se eximían y las 7 seguían trabadas,
  que es peor que trabarse en todas porque parece un bug de contenido.
  `initVideoGate()` sondea cada `src` de `data-require-seen` con un
  `<video>` suelto — misma pregunta para los 4 patrones de video, y se
  responde sola cuando entran los archivos reales. Verificado en las
  dos direcciones: con placeholder de 0 bytes exime (curso
  terminable); con un video reproducible bloquea, y verlo destraba.
- **`tools/tests/markup-sanity.mjs` — `--bg-video` sin video de
  fondo.** Desde que `Narrador.textOf()` usa esa clase como señal
  ("una diapositiva que ES un video no se narra"), una diapositiva mal
  marcada se queda **muda**: sin error de consola y con el `.sr-only`
  intacto, así que ni `deep-audit` ni un lector de pantalla lo
  delatan. En ese curso eran 15 de 18 diapositivas, por copiar y pegar
  la anterior. Verificado: detecta una diapositiva inyectada a
  propósito —nombrándola y diciendo el arreglo— y **no da falsos
  positivos** en "Uso de Sucursales 3 - NOA" ni en "Seguridad
  alimentaria".
- **`css/coto-shot-stage.css` — se saca el desplazamiento lateral.**
  Cambio de default, no bug. Queda solo el fundido de opacidad, que es
  lo que resuelve el pedido original de v1.9.43 ("aparecen de golpe")
  sin lo que se objeta ahora. Las clases `anim-l`/`anim-r` siguen
  existiendo y el motor las sigue poniendo — no hace falta tocar
  `motor-slides.js`, y un curso que quiera el desplazamiento puede
  redefinir los keyframes en su propio CSS. La historia del valor
  quedó anotada en el archivo para no rediscutirla desde cero.

### v1.9.61 — relay de "Surtido sin ventas": un bug latente que dejaba hitboxes en 0×0, una herramienta de verificación que mentía, y `limpiar-recorte.mjs`

Relay desde un tercer chat de curso, armado sobre v1.9.57. De los 5
parches adjuntos, 4 y medio ya estaban aplicados (v1.9.58) — lo
genuinamente nuevo salió del resto del informe:

- **`css/coto-minijuego.css` — bug latente desde v1.9.21.**
  `.d-mj-shot`/`.d-mj-fin` tenían `container-type:size` pero ningún
  `height`. La contención de tamaño hace que el elemento ignore su
  contenido al calcular el alto, así que colapsa a 0 — y como sus
  hijos se miden en `100cqh`, todo lo de adentro colapsa con él.
  Medido en Chromium sobre el marcado real: `.d-mj-shot` daba 900×0,
  `.d-shot` 0×0, y un `[data-hit]` de 20%×12% terminaba en **16×6 px**,
  visible pero imposible de tocar. Con `height:100%`: 900×500 y el
  hitbox en sus 180×60. No avisaba nada — ni un error de consola.
- **`tools/verify-hitboxes.mjs` — informes que no describían lo que
  decían describir.** Navegaba clickeando los `[data-goto]` del índice
  lateral; en un curso con gate, `initIndexJumps()` los deja
  `disabled` y el clic es un no-op **silencioso**: el script seguía
  midiendo, pero todas las mediciones eran de la última diapositiva
  alcanzable, repetida. Ahora navega con `motor.go(idx, true)`, igual
  que `visual-regress.mjs` (cuyo comentario decía "mismo criterio que
  verify-hitboxes.mjs" cuando ya no era cierto — corregido también).
- **`tools/import-storyline.mjs` — diapositivas de video mal
  clasificadas.** El clasificador solo contaba capas y estados, así
  que una diapositiva de video (una capa, pocos estados) caía en
  "simple" = "la captura sirve tal cual", que es justo lo que hornea
  el reproductor de Storyline dentro de la imagen (§6.29). Ahora, si
  el texto extraído menciona video, la manda a revisión manual. Solo
  puede mover una diapositiva HACIA la pila "a mano", nunca al revés.
- **`js/coto-media.js` — `data-shot-swap-nofade`.** Opt-in por grupo
  para saltear el fundido de v1.9.51. Lo que generaliza es qué PORCIÓN
  del arte cambia: si las variantes comparten casi todo el cuadro y
  solo cambia un panel, fundir la imagen entera se lee como "la
  pantalla se apagó", no como "se actualizó ese panel". El default no
  cambia.
- **`tools/limpiar-recorte.mjs` — nuevo.** Saca la sombra suave de un
  recorte hecho sobre una página plana de PDF: blanquea (u
  opcionalmente transparenta) los píxeles "casi grises" **y** claros,
  que es lo que distingue una sombra de los colores reales del dibujo
  y de sus líneas oscuras. La técnica se usó 3 veces a mano en un solo
  curso y quedan ~20 migraciones de Storyline por delante. Sin
  dependencias nuevas (usa el `pngjs` que ya estaba).
- **§7.3 puntos 18 y 19**, dos lecciones que no son código: un fondo
  con `z-index:-1` necesita que su contenedor tenga `position:relative`
  **y** `z-index:0` (si no se resuelve contra un ancestro y queda
  invisible, sin ningún error); y si un asset se corrige dos veces
  sobre el mismo nombre de archivo, versionar el nombre — el cliente
  puede estar viendo la versión cacheada y reportar "sigue igual"
  sobre algo ya arreglado.

### v1.9.60 — el kit ya genera el `index.html` completo, y los puntos/logros dejan de copiarse curso a curso

Sale de auditar los DOS cursos terminados ("Uso de Sucursales 3 - NOA"
y "Seguridad alimentaria") contra el kit. Los dos pasan la suite 7/7 y
ninguno tenía arreglos locales sin subir — el problema no era la
calidad de los cursos, era cuánto había que escribir a mano para
llegar a ellos: ~3.000 líneas por curso (`index.html` + `curso.js`)
que el scaffold no tocaba.

**1 · `index-boilerplate.html` + `new-course.mjs` ahora generan el
`index.html` entero.** Hasta v1.9.59 el scaffold decía explícitamente
"no genera index.html" y mandaba a copiar un curso de referencia y
adaptarlo. La medición dio vuelta ese argumento: entre los dos cursos
el chrome de cabecera difiere en 73 de ~180 líneas y esas diferencias
son PARÁMETROS (título, color de favicon, `data-cat`, íconos), no
estructura; el contrato de ids es idéntico. Un curso nuevo sale ahora
con el chrome completo y cableado, 7 diapositivas vacías rotuladas, e
índice lateral generado. **Verificado: la suite oficial da 7/7 en
verde sobre un curso recién generado, sin un solo edit a mano.**
Llegar ahí destapó 5 defectos de contrato que hoy se pagan en CADA
curso hecho a mano: faltaba `data-slide-index` (el motor lo LEE, no lo
asigna), faltaba el envoltorio `.d-app` (sin él cada diapositiva se va
de alto en las 5 resoluciones), el sprite duplicaba `#i-check`, y los
placeholders `<NOMBRE DEL CURSO>`/`icono-<CATEGORIA>.webp` quedaban
sin resolver — ese último es un 404, y un 404 hace fallar 3 tests.

**2 · `coto-logros.js`: puntaje y logros pasan a ser del kit.**
`award` daba 92% de similitud entre los dos cursos, `unlockBadge` 96%,
`renderBadges` 88%. El kit ya era dueño de todo lo demás de esa pieza
(el marcado `#d-badge-count`/`#d-points`, el CSS de las tarjetas, el
pulso del chip, la moneda de `fx.js`, el sonido) — lo único que no
vivía acá era el pegamento, justo lo que cada curso reescribía. Y ya
se había pagado: "Seguridad alimentaria" tenía conteo animado, pulso y
`XAPI.awarded`, y "Uso de Sucursales 3 - NOA", hecho DESPUÉS, los
perdió al copiar. El módulo toma como base la versión más completa,
así el próximo curso arranca mejor y no peor. La plantilla `curso.js`
ya viene cableada, con la persistencia en las mismas claves cortas
(`p`/`b`) que los cursos ya usaban.

**3 · Ícono de Locución tachado cuando está apagada.** Antes apagado y
prendido se distinguían solo por dos ondas chiquitas al costado del
micrófono, que al tamaño real de la barra no se leen. Ahora usa el
mismo lenguaje visual que "Sonido" (tachado = apagado), así no hay dos
convenciones distintas en la misma barra.

### v1.9.59 — segundo lote de parches sobre "Uso de Sucursales 3 - NOA": `object-fit` en video de ficha + 2 lecciones documentadas, y un parche descartado por diagnóstico incorrecto

Segunda tanda de 9 parches desde la misma sesión de curso — 5 ya
estaban aplicados en v1.9.58 (mismo contenido, no-ops), y de los 4
nuevos, 3 se verificaron ciertos y uno se descartó:

- **`css/coto-media.css`** — `[data-popup] video` fijaba
  `aspect-ratio:16/9` pero nunca `object-fit`, así que un video real
  que no es exactamente 16:9 (la gran mayoría) se estiraba para llenar
  la caja en vez de recortarse. Invisible con el placeholder de 0
  bytes del kit, por eso pasó desapercibido. Un `object-fit:cover` lo
  resuelve. Verificado en vivo: `getComputedStyle` confirma
  `object-fit: cover` sobre un video real de NOA.
- **`css/coto-shot-stage.css`** — se documenta, al lado de la regla,
  la receta de una línea para que un curso apague por completo la
  animación de entrada de diapositivas (`animation:none`) cuando el
  cliente la encuentra molesta — no hay un default correcto que sirva
  a todos, así que sigue siendo overridable por curso, ahora sin
  redescubrir la receta cada vez.
- **`css/coto-minijuego.css`** — se documenta la lección de "Uso de
  Sucursales 3 - NOA" sobre cómo pagar puntos del minijuego (por
  situación, en vivo, no en un bloque al final gateado por un mínimo
  de aciertos) — el diseño anterior hacía que las primeras respuestas
  correctas no movieran el chip de puntaje. El parche recibido citaba
  un selector inexistente (`[data-mj-score]`); se corrigió al real
  (`.d-mj-stat--pts`) antes de aplicar.
- **Descartado: reintento de narración por gesture-gating (Safari/iOS).**
  El parche proponía reintentar `Narrador.speak()` en el primer gesto
  si `estadoActual` seguía en `null` (indicio de que el navegador
  descartó en silencio el primer intento). Trazando el código real,
  `estadoActual` se completa DE FORMA SINCRÓNICA dentro de `speak()`
  (antes de que `synth.speak()` corra), independientemente de si el
  motor de voz del navegador termina reproduciendo algo — así que para
  el momento del primer gesto del usuario, `estadoActual` ya no está en
  `null` en el caso que el parche dice resolver, y la condición de
  reintento no dispara. El diagnóstico de causa raíz no se sostiene
  contra este código; no se aplicó.

### v1.9.58 — 4 bugs reales encontrados probando el kit contra "Uso de Sucursales 3 - NOA", relayados como parches y verificados uno por uno

Lote de 5 parches recibidos como `.patch` (formato `git format-patch`,
primera vez en este flujo sin repo) desde una sesión que estaba
probando el kit contra un curso real. Igual que siempre, cada uno se
verificó contra el código real antes de aplicarlo — acá los 5
resultaron ciertos, estática y dinámicamente (Playwright, curso real
overlayado con el kit parcheado):

1. **`js/coto-player.js` — Esc no cerraba los popovers "pinned"**
   (audio de la barra superior, flotantes de Ayuda/Configuración).
   `initPinnedPopover()` cerraba con clic afuera y al cambiar de
   diapositiva, pero no con Esc — y la Ayuda del propio kit promete
   "Esc cierra cualquier ventana emergente". El punto no obvio es el
   `blur()`: el CSS abre el panel también con `:focus-within`, así que
   sacar las clases no alcanza si el foco quedó adentro (una pregunta
   del acordeón, el slider de volumen) — sin soltarlo, el panel queda
   abierto y sigue interceptando clics. Verificado en vivo: los dos
   flotantes abren y cierran con Esc incluso con foco dentro del
   acordeón.
2. **`tools/tests/markup-sanity.mjs` — nuevo chequeo de ids duplicados.**
   `getElementById` devuelve siempre el primero del documento, así que
   un id repetido deja controles VISIBLES PERO MUERTOS, sin un solo
   error de consola. Corrido contra la copia de referencia de "Uso de
   Sucursales 3 - NOA" encontró exactamente eso: `#d-confetti`
   duplicado (dos divs idénticos, el segundo muerto) — bug real de ese
   curso, no del kit, y ya corregido ahí (no toca kit-base).
3. **`header-boilerplate.html` — checklist de migración al fab-stack.**
   Solo comentario: el docblock explicaba dónde va el bloque, pero no
   qué SACAR si el curso venía con el drawer de Ayuda viejo (anterior a
   v1.9.36). Los 4 pasos, incluido mover (no copiar) los 7 ids de
   voz/velocidad/reset — duplicarlos es el mismo fallo silencioso del
   punto 2.
4. **`js/coto-media.js` — `initPopupVideos` no volvía a reproducir tras
   pausar.** Mismo bug que ya se había corregido en
   `initInlineCircleVideos` y nunca se portó a este patrón: una vez que
   el evento `play` prende `v.controls`, el clic sobre el video pasa a
   ser el toggle NATIVO del navegador, y el handler propio corre antes,
   leyendo el estado viejo — sobre un video pausado llamaba `play()` a
   mano y el toggle nativo lo volvía a pausar. Guard de una línea,
   idéntico al de la variante circular (`if (v.controls) return;`).
5. **`js/motor-slides.js` — el gate de avance no se resincronizaba al
   cerrar un pop-up con Esc.** El listener de clic diferido de
   `_init()` cubre cerrar con la X o con "Continuar" (son clics dentro
   de `root`), pero Esc no dispara ningún clic. Se veía en cualquier
   curso donde abrir la última ficha destraba el avance: el alumno la
   mira, cierra con Esc, y "Siguiente" seguía mostrándose bloqueado.
   Verificado en el navegador: `.is-gated` pasaba de `true` a `false`
   solo por cerrar con teclado, sin ningún clic de por medio.

### v1.9.57 — `import-storyline.mjs`: migrar los cursos viejos de Storyline al molde del kit

Hay ~20 cursos hechos con Articulate Storyline antes del kit. La
herramienta no los convierte sola — **produce el insumo que hoy sale
del PDF del diseñador**: una captura `.webp` por diapositiva, el texto
extraído (sirve de guion de narración y de texto accesible), el conteo
de capas/estados por diapo, y un informe de qué queda a mano. Medido
contra el export real de "Surtido sin venta": **13/13 capturas**, 7
mecánicas y 6 a mano. Sin dependencias nuevas: el server local es
`node:http` y el WebP lo encodea el propio Chromium vía canvas.

**Cuatro obstáculos que NO se automatizan y quedan documentados en
§7.05** para no prometer una migración rápida: la proporción de
Storyline (~1.78) no es la del kit (2.0) y reencuadrar es a mano — la
herramienta no recorta, porque recortar perdería contenido en
silencio; la interactividad no sobrevive a una captura plana (46 capas
y 416 estados en el curso medido, concentrados en el minijuego); los
videos no viajan en el export (cero `.mp4`, verificado) y capturarlos
planos hornea el reproductor de Storyline en la imagen (§6.29); y la
locución de Storyline es audio grabado (42 pistas) mientras el kit
narra con `speechSynthesis`.

**Tres trampas del formato, encontradas construyendo la herramienta**
— las tres devolvían datos incorrectos EN SILENCIO: el orden de
`data.js` no es el de reproducción (etiquetaba la diapo 11 con el
título de otra); la etiqueta del menú y el título interno son campos
distintos, y el interno puede estar duplicado entre diapositivas; y el
audio se referencia solo desde `data.js`, así que contarlo por diapo
daba 0 siempre. Por eso la herramienta no cruza NADA por título: el
orden sale del menú (`[role="treeitem"]` sin hijos — soporta varias
escenas y no depende del idioma) y el contenido se cruza por qué
archivo pide el player al abrir cada diapositiva, escuchando la red.

### v1.9.56 — la evaluación es SIEMPRE Moodle XML, y el ejemplo del kit pasa a ser el de "Seguridad alimentaria"

Dos decisiones de producto, aplicadas al kit:

**Un solo formato.** Se eliminó `tools/build-evaluacion-gift.mjs`.
Tener dos formatos obligaba a elegir en cada curso y el entregable real
siempre terminaba siendo el XML — el único que expresa lo que el
cliente pidió (retroalimentación a nivel de pregunta, y
`shuffleanswers`/`answernumbering`/`defaultgrade` explícitos en vez de
heredados de la instalación de Moodle que importe el archivo). El
script npm quedó como `npm run evaluacion`, sin sufijo de formato,
porque ya no hay ambigüedad.

**El ejemplo pasa a ser el caso aprobado.** `tools/evaluacion.ejemplo.json`
era la evaluación de "Uso de Sucursales 3 - NOA"; ahora es la de
"Seguridad alimentaria" — la que se entregó y el cliente aprobó. No es
solo una plantilla: es el **caso de prueba** de la herramienta.
Regenerarlo tiene que dar el XML entregado idéntico byte a byte, así
que si mañana alguien toca el generador y el formato cambia sin querer,
se nota al instante. Verificado: da idéntico.

**Una regla de contenido que quedó desalineada, corregida.** El kit
pedía "SIEMPRE retroalimentación en la correcta Y en cada distractor".
El formato aprobado NO la usa: verificado sobre la evaluación real, 0
de sus 20 distractores llevan feedback propio — Moodle muestra UNA
explicación por pregunta al cerrar el intento. Seguir escribiendo
feedback por distractor era trabajo que el entregable descartaba. La
regla ahora pide una explicación por pregunta, y el campo canónico del
esquema es `explicacion` (una, sin prefijo: el prefijo `¡Correcto! …`
/ `Incorrecto. …` lo pone el script).

### v1.9.55 — `build-evaluacion-xml.mjs`: el formato de evaluación que se entrega (Moodle XML) pasa a generarse solo

La evaluación final de "Seguridad alimentaria" se entregó en **Moodle
XML**, y su encabezado decía "generado con `tools/build-evaluacion-xml.mjs`"
— pero **esa herramienta no existía en el kit**: solo estaba la de GIFT.
O sea, el formato realmente entregable se armaba fuera del kit y no se
podía repetir para el próximo curso. Ahora existe, y consume **el mismo
JSON** que la de GIFT (la evaluación se escribe una sola vez y sale en
cualquiera de los dos formatos). XML es el entregable; GIFT queda porque
es más corto de leer para revisar contenido, pero no puede expresar la
retroalimentación a nivel de pregunta (`correctfeedback`/
`incorrectfeedback`, lo que Moodle muestra al cerrar el intento) ni
`shuffleanswers`/`answernumbering`/`defaultgrade` explícitos.

**El detalle que costaba encontrar a ojo**: en el XML la misma
explicación va dos veces por pregunta, cambiando solo el prefijo
(`¡Correcto! …` / `Incorrecto. …`), pero los JSON escritos para GIFT ya
traen el prefijo adentro del texto. Copiarlo tal cual habría producido
"Incorrecto. ¡Correcto! El 191 compara…" en cada pregunta. El script
normaliza el prefijo antes de reponerlo, así el mismo JSON sirve para
los dos formatos sin editarlo.

**Verificado por reproducción exacta**, no a ojo: se reconstruyó el JSON
a partir del XML real entregado y se regeneró con la herramienta — sale
**idéntico byte a byte** al archivo del cliente (20 preguntas: 10 MC +
10 V/F). Y contra el JSON viejo de NOA (el que trae los prefijos
escritos) se confirmó 0 prefijos duplicados; los dos XML validan con un
parser real.

### v1.9.54 — fusión de las dos ramas del kit: se recuperan los 4 arreglos de consistencia que el fork se había perdido

Esta rama auditó el zip v1.9.53 de la otra (el del halo del minijuego)
antes de fusionarlo, y el resultado fue bueno: **la feature es real**
(`.d-mj-hotspot` × 11 en `coto-minijuego.css` + el prerrequisito
`.d-mj-escena{position:relative}`), **no se perdió nada** de lo que esta
rama había construido (los 15 símbolos de v1.9.43-v1.9.51 —
`_initHitStagger`, `_initPlaceStagger`, `_resolverDeepLink`,
`_initReviewOverlay`, `sinFade`, `d-shot-img--fade`, `mostrarErrorVideo`,
`countTo`, `_syncGate`, `d-ken-burns`… — más las 6 herramientas y el
chequeo de `suspend_data`), y **sus números cierran** (29/29 sintaxis,
contraste OK, 0 duplicados, 0 bypass de tokens, 30 keyframes /
0 huérfanos). Su "suite 5/7, los 2 rojos son mi curso de prueba" se
confirmó desde otro ángulo: contra el curso real de referencia, **los 7
genéricos dan 7/7** (el único rojo que apareció, `check-glosario-flow`,
es un test DEL CURSO que falla igual contra las dos ramas: quedó viejo
respecto del fix de glosario de v1.9.42 — deuda del curso, no del kit).

Lo que el fork sí se había perdido, porque se bifurcó antes: los 4
arreglos de consistencia de la v1.9.52 de ESTA rama, ahora reaplicados
sobre su base — las 4 versiones fantasma (`v1.9.45`/`46`/`47`/`49`,
números que nunca fueron release, citados en 7 archivos + 4 veces en
`CLAUDE.md`, y propagados también al árbol del README) reapuntadas a la
versión que realmente las entregó; `CLAUDE.md` §7 paso 1 decía "6 tests"
cuando son 7; el paso 4 del README no mencionaba `run-tests`,
`check-image-weight` ni `visual-regress`; y el árbol declaraba
`playwright-core` como única dependencia cuando ya son 3.

Además, la lección del choque de numeración sube de §6.70 (registro
histórico) a **§0.1** (la regla de proceso que se lee al arrancar):
**dos zips con el mismo número no son el mismo zip** — antes de fusionar
se compara contenido (símbolos reales), no números; un `§6.6x` a secas
ya no identifica nada en un relay entre chats; y no se renumera
retroactivamente.

### v1.9.53 — el halo de hallazgo del minijuego (`.d-mj-hotspot`), que se quedó atrapado en el zip del otro chat

Reportado desde "Seguridad alimentaria", donde la feature está aprobada
por el cliente y en producción: al acertar una opción del minijuego,
además de que la píldora se ponga verde, se resalta con un aro pulsante
la zona REAL del dibujo que explica ese hallazgo (acertar "Plagas"
resalta la mosca). El kit no lo tenía — `.d-mj-hotspot` no aparecía ni
una vez en los 10 CSS.

No era una pérdida silenciosa: aplicar el kit sobre el curso dejaba los
6 hotspots en `position:static`, o sea las etiquetas ("Plagas", "Mala
higiene"…) tiradas como texto suelto encima del dibujo. Se ve roto.

Además del bloque `.d-mj-hotspot`, hacía falta un prerrequisito que el
kit tampoco tenía: **`.d-mj-escena` no declaraba `position:relative`**,
así que los aros se habrían posicionado contra el ancestro posicionado
más cercano en vez de contra la ilustración — el mismo bug que el
warning de `_initShots()` avisa para `[data-hit]`.

Verificado en Chromium midiendo posiciones reales, no a ojo: con un
arte de proporción conocida y marcas en coordenadas exactas, el aro cae
con **0.00px de desvío** a 800px y a 420px de ancho, `offsetParent` es
`.d-mj-escena`, y las dos etiquetas de zonas superpuestas no se pisan
gracias a `data-mj-hotspot-lbl-pos="abajo"`.

**Choque de numeración entre chats (no se renumera nada, queda como
registro):** los dos chats usamos `v1.9.43` para cosas distintas — acá
fue el lote de 7 mejoras "cinematográficas" (§6.64), allá fueron estos
hotspots, y el lote cinematográfico allá fue `v1.9.44`. Por eso este kit
pasó de 1.9.43 a 1.9.52 sin recibirlos nunca: exactamente el patrón que
§6.17 ya tiene documentado como regla de proceso ("un fix queda atrapado
en el zip de una sesión aislada"). Consecuencia práctica: las secciones
§6.6x de los dos `CLAUDE.md` NO se corresponden entre sí.

**Divergencia conocida, no resuelta acá (el curso no puede subir sin
migrar):** el pop-up de repaso del minijuego tiene dos contratos de
marcado incompatibles. El kit espera `.modal-card--mj-repaso` +
`.d-mj-repaso-kicker` + `.modal-x--mj-repaso`, sin `.modal-hd`; el curso
tiene `.modal-card d-wide d-mj-repaso-card` + `.modal-hd` +
`.d-mj-repaso-bd` (verificado: las dos últimas clases no existen en el
kit). Con el CSS del kit sobre el marcado del curso, las reglas de
compactación apuntan a clases inexistentes y el pop-up scrollea en
mobile landscape. Cuando el curso suba, **migra el curso hacia el
contrato del kit**, no al revés.

### v1.9.52 — revisada final del kit: 16 bugs reales + 6 desalineaciones entre código y documentación

Pasada de auditoría completa sobre los 12 `.js`, los 10 `.css`, el
boilerplate, el spec y las herramientas, sin funcionalidad nueva. Los
tres arreglos del motor están verificados en Chromium headless contra
un curso mínimo armado con el propio kit.

**Cosas que estaban rotas y no se veían:**

- `SCORM.commit()` **no existía**: `commit()` era una función privada de
  `scorm-api.js` y nunca se había expuesto, pero la plantilla
  `js/curso.js` la venía llamando en la última línea de `boot()`. Todo
  curso arrancado desde la plantilla se comía un `TypeError` ahí —
  invisible en pantalla, pero cualquier `initX()` agregado después de esa
  línea no corría nunca. Se expone (en vez de sacar la llamada): "guardá
  lo pendiente AHORA" es una operación legítima que `setLocation()`
  —que a propósito no committea— dejaba sin forma de forzar.
- **"Retomá donde dejaste" nunca funcionó en ningún curso.**
  `initResume()` existe desde v1.7 y su CSS desde v1.8, pero el MARCADO
  (`#d-resume`) no estaba en ningún archivo del kit: la función salía por
  su `if (!bar)` de la primera línea, en silencio, siempre. El bloque
  ahora vive en `header-boilerplate.html`. De paso, `@keyframes
  d-resume-in` —que `.d-resume` declara desde v1.8— tampoco existía en
  ningún `.css`: una `animation-name` que no resuelve es un no-op mudo.
- **Doble `slidechange` por re-entrada** en `Motor.go()`: con un pop-up
  "gate" abierto queda un avance pendiente que `closePopup()` consume por
  su cuenta, así que una navegación EXPLÍCITA (índice, barra, `gotoId`)
  disparaba primero el avance pendiente y después la suya. Una
  diapositiva que el alumno nunca vio quedaba contada como vista por
  todos los listeners del curso (gates, glosario, puntos, barra). Ahora
  la navegación explícita manda.
- **Pop-up sobre pop-up dejaba el primero colgado**: abrir un modal desde
  otro modal pisaba `this.openPopup` y el anterior se quedaba con
  `.open` puesto — sin Esc, sin X, sin backdrop y sin `go()` que lo
  alcanzaran, porque todos operan sobre `this.openPopup`.
- `.d-quiz-mascot.happy` / `.oops` eran **letra muerta**: `coto-quiz.js`
  escribe esas clases desde v1.6 y `coto-quiz.css` no tenía ninguna
  regla para ellas. Completadas con los mismos tokens de estado que ya
  usan `.d-quiz-fb` y `.d-opt` al lado.
- El **AudioContext se creaba antes del primer gesto** (el `slidechange`
  inicial dispara el whoosh): Chrome lo bloquea y deja un warning en la
  consola de cada carga, con el contexto colgado y el sonido perdido
  igual. Ahora nace recién con el primer `pointerdown`/`keydown`.

**Bordes que trababan o rompían en silencio:**

- `data-gate-popup` apuntando a un id inexistente dejaba `_pendingNav`
  colgado y un clic muerto; ahora se sigue de largo (`showPopup()` pasa a
  devolver si abrió o no).
- `.d-shot-video` con `[data-hit]` pero sin atributo `poster`: el
  `poster.src = "null"` pedía una URL inexistente que nunca dispara
  `load`, y las zonas se quedaban sin posicionar sin nada que lo
  explicara. Ahora avisa por consola, como el warning de
  `position:absolute` de al lado.
- `initMiniQuiz()` con el banco vacío moría en `QUIZ[cur].q` y se llevaba
  puesto el resto del `boot()`.
- `initHotspots()` devolvía `null` cuando el selector no encontraba nada,
  contra lo que promete su propio encabezado.
- `tools/new-course.mjs` interpolaba el título **crudo dentro del XML**:
  un `&` o un `<` en el nombre del curso generaba un `imsmanifest.xml`
  malformado, o sea un paquete que el LMS rechaza entero al importarlo.
- La trampa de foco de los pop-ups no incluía `select`/`textarea`: Tab
  desde un control de formulario dentro de un modal se escapaba al
  chrome de atrás.

**La plantilla no cableaba el tracking que la propia suite exige:**

`js/curso.js` no traía ni `SCORM.setLocation()` en `slidechange` ni
`SCORM.markCompleted()` al oír `courseend` — exactamente las dos cosas
que `tools/tests/scorm-tracking.mjs` le pide a cualquier curso. Un curso
recién salido del molde fallaba ese test, y si nadie lo corría (no
entraba a la suite hasta v1.9.39, §6.60) se reproducía **§6.24, el peor
bug que tuvo este kit**: el alumno termina el curso entero y en el LMS
queda `incomplete` para siempre. Nada en pantalla lo delata. De paso,
sin `setLocation()` el banner de "retomá donde dejaste" que se arregló
más arriba tampoco tendría qué leer: `getLocation()` volvería vacío
siempre. Las dos líneas ahora están en la plantilla, sin comentar, con
la nota de por qué no se borran.

**Herramientas:**

- `tools/tests/scorm-tracking.mjs` era el **único** de los 7 tests que
  ignoraba `CHROMIUM_PATH` y no pasaba `--no-sandbox`: en cualquier
  máquina donde Chromium no esté en la ruta clavada a mano, la salida
  documentada en `tools/tests/README.md` arreglaba 6 de 7 y dejaba ése
  roto sin decir por qué. Segunda vez que ese archivo queda afuera de
  algo por haberse escrito aparte (la primera fue §6.60, no estar en la
  lista de la suite).
- Un error de consola se reportaba **sin la URL que lo causó**: el texto
  de un recurso que falla es literalmente "Failed to load resource: 404"
  y nada más. Ahora va con la URL adelante. Y `favicon.ico` se ignora
  explícitamente — el navegador lo pide solo contra la RAÍZ del
  servidor, así que todo paquete SCORM hacía fallar **4 de los 7 tests**
  por algo que no es del curso y que en el LMS real ni ocurre. Dejarlo
  rojo por default entrena a mirar la suite en rojo y asumir que
  "siempre está así": el mismo modo de fallar de §6.60.
- `package-lock.json` declaraba **1.9.48** mientras `package.json` iba en
  1.9.51 — desfasado 3 versiones. Alineado (solo el número; ninguna
  dependencia cambió).

**Documentación que decía algo distinto del código:**

- `[data-nav-label]` (hijo obligatorio de `[data-nav="next"]` para que el
  texto del botón cambie) se usa desde v1.4 y **no estaba documentado en
  ningún lado**: un botón sin ese `<span>` adentro se queda con su texto
  fijo para siempre —"Empezar", "Finalizar" y `data-nav-cta` no aparecen
  nunca— sin ningún error. Ahora está en `spec-motor-slides.md` §4 y §10.
- `xapi.js` nombraba un `XAPI.track(...)` que nunca existió (son 4
  verbos); un comentario de `motor-slides.js` nombraba `SCORM.getState()`
  (es `loadState()`); el namespace `CotoUI` no incluía `initIndexJumps`
  ni `initPopupPrefetch`, que estaban solo en los alias sueltos.
- El árbol "Qué hay" de este README listaba 3 de las 9 herramientas de
  `tools/` y no mencionaba `js/curso.js`.

### v1.9.51 — 3 mejoras de animación/orden de aparición: stagger de hitboxes, crossfade en initShotSwap, y stagger de overlays de texto real

Entrada escalonada de `[data-hit]` al entrar a una diapositiva
(`.d-stagger-in`, mismo lenguaje que ya usan los pop-ups) — verificado
que el arrastre real de la barra de pasos de "Rotación" sigue andando
igual después del stagger. Fundido corto (110ms/110ms) al cambiar de
variante en `initShotSwap` (carruseles/tabs/pasos) — con un parámetro
nuevo (`sinFade`) para que el arrastre 1:1 de "Rotación" siga siendo
instantáneo, sin pelearse con el fade. Y el mismo `.d-stagger-in` para
paneles de texto HTML real (`[data-place]`) al entrar a la
diapositiva — filtrando los `[data-place]` puramente decorativos/de
estado (`aria-hidden="true"`) para no animar algo que no "aparece" al
llegar. Detalle en `CLAUDE.md` §6.68.

### v1.9.50 — cierre de la lista de 10: regresión visual con screenshots (y un falso positivo real que llevó a un fix más robusto), chequeo proactivo de suspend_data, y sprite de íconos mínimo

`tools/visual-regress.mjs` (nuevo, + `pixelmatch`/`pngjs` como
dependencias nuevas): screenshot de cada diapositiva contra una
baseline propia del curso, diff a nivel píxel. La primera versión
(espera fija antes del screenshot) dio un falso positivo 100%
reproducible contra "Seguridad alimentaria" — una animación de un
widget DEL CURSO (`.d-repaso-item.is-current`, `assets.css`) sin
guardia de `prefers-reduced-motion` (bug real de ese curso, no del
kit) hacía que el screenshot cayera a mitad de la animación, en un
cuadro distinto cada corrida. Fix real: esperar a que dos screenshots
consecutivos sean bit a bit idénticos en vez de un tiempo fijo — no
necesita saber qué anima. Verificado con 3 corridas limpias seguidas
del curso completo (26 diapositivas, 0 fallos) y una regresión real
inyectada a propósito que se sigue detectando igual. Además:
`full-regress.mjs`/`scorm-tracking.mjs` ahora detectan el
desbordamiento REAL de `suspend_data` (el chequeo viejo, sobre el
valor final ya guardado, era código muerto — `saveState()` nunca deja
guardar algo así de grande, así que el valor final nunca podía
superar el límite aunque el curso perdiera progreso en silencio a
mitad de camino). Y un sprite de íconos mínimo (`i-check`/`i-play`,
los únicos 2 con un contrato real en el código del kit) agregado a
`header-boilerplate.html` — se descartó un sprite más grande tras
encontrar que la "coincidencia" entre cursos reales era historial de
copiar-pegar, no un contrato (un ícono con el mismo id pero contenido
distinto entre dos cursos, otro definido pero sin un solo uso real).
Detalle en `CLAUDE.md` §6.67.

### v1.9.48 — segunda tanda de la lista de 10 mejoras: peso de assets, lazy-load documentado, modo revisión (deep-link + overlay de gate/hitbox/pop-up + panel de tracking SCORM/xAPI), y scaffolding de curso nuevo

Cierra la lista de 10 mejoras propuestas para el kit en sí (§6.65 +
esta ronda). Nuevo `tools/check-image-weight.mjs` (formato/peso de
`img/`/`video/` de un curso, antes de armar el zip). `loading="lazy"`
en `.d-shot-img` documentado como regla de proceso (§3 paso 13) — se
auditó y un fix solo-JS no es viable (el navegador ya pidió la imagen
antes de que corra cualquier script), tiene que ir en el HTML de cada
curso. Modo revisión (`?review=1`) en `motor-slides.js`: deep-link a
una diapositiva puntual, contorno visual sobre hitboxes + chip con
gate/hitboxes/pop-ups de la diapositiva actual, y un panel (clic en
el chip) con `SCORM.getLocation()`/tamaño de `suspend_data`/últimos 5
statements de `XAPI.getLog()` — todo detrás del mismo guard para que
la URL real del LMS nunca le dé a un alumno una forma de saltarse
gates. Nuevo `tools/new-course.mjs`: automatiza copiar `kit-base/` +
generar `imsmanifest.xml` + arrancar `curso.js` desde la plantilla —
a propósito NO genera `index.html` (el chrome real tiene demasiado
contrato de IDs como para fabricarlo sin el método de zip de
referencia, §7.1). Detalle punto por punto en `CLAUDE.md` §6.66.

### v1.9.44 — 4 mejoras propuestas por Claude (no reportadas por ningún curso): linter de tokens de categoría, índice navegable, protocolo de relay más estricto, y fallback visual de video roto

Primera ronda de una lista de 10 mejoras propuestas para fortalecer
el kit en sí (no relayadas desde un curso): `tools/check-raw-cat-colors.mjs`
(detecta un hex de categoría copiado a mano en vez de `var(--cat...)`,
sumado a `npm run test:kit`); un Índice navegable agregado a
`CLAUDE.md` (se descartó partir el historial a un archivo aparte —
varias secciones "históricas" son reglas de diseño vigentes, moverlas
mal las escondería); §0.1 ahora pide explícitamente síntoma +
diagnóstico al relayar un hallazgo desde un curso, nunca "fix ya
aplicado"; y los 4 patrones de video que dependen de un toque del
alumno (pop-up, círculo inline, video en pop-up de contenido, video
en capa) ahora muestran un mensaje real si el `<video>` no puede
cargar, en vez de una caja negra silenciosa. Detalle en `CLAUDE.md`
§6.65. Quedan 6 ideas más para la próxima vuelta.

### v1.9.43 — lote de 7 mejoras "cinematográficas" reportado desde un curso: 6 de 7 no existían en el kit real

Reporte relayado desde "Seguridad alimentaria" (transición de diapositiva
más marcada, Ken Burns en el fondo, contador animado, pulso al ganar un
logro, feedback de presión en los botones de navegación, glow al
desbloquear el gate de avance, zona bloqueada en la barra de progreso).
Auditado contra el código real antes de aplicar (§0.1): solo el punto 1
tenía precedente; los otros 6 —incluido un "bug ya corregido" sobre una
pieza que no existía— se diseñaron e implementaron de cero en este chat,
con su propia verificación con Playwright. Detalle punto por punto en
`CLAUDE.md` §6.64.

### v1.9.42 — el volumen de locución no aplicaba sin reiniciar, y el glosario dejaba saltar el gate de avance

Detalle completo en `CLAUDE.md` §6.63. 2 bugs reales reportados tras
usar el curso entregado con v1.9.41.

- **Volumen de locución.** `refreshVolume()` (v1.9.40) solo se llamaba
  en el mute, nunca en el slider — la idea era que "el fragmento
  siguiente" aplicara el cambio solo, pero `chunkText` suele producir
  UN fragmento para una narración corta típica, así que en la práctica
  no había "fragmento siguiente" hasta la próxima diapositiva. Fix:
  `range.addEventListener('change', ...)` (nativo de `<input
  type="range">`, dispara UNA vez al soltar, no en cada `input` de un
  arrastre) llama a `refreshVolume()`. Verificado con
  `speechSynthesis.speak` espiado: arrastre simulado no re-emite nada,
  soltar sí, una vez, con el volumen final.
- **Glosario rompía el gate de avance.** `initGlossaryUnlock()` solo
  apagaba visualmente el `<dt>` bloqueado (`.is-locked`) — nunca
  deshabilitaba el `<button data-goto>` de adentro, así que un término
  TODAVÍA no visitado seguía siendo 100% clickeable y saltaba directo,
  saltándose el gate de las diapositivas intermedias. Mismo patrón que
  ya se había corregido en el índice lateral (§6.44 punto 2) pero
  nunca se aplicó al glosario cuando se construyó (§6.52). Fix:
  `link.disabled = !visto` — un botón nativo deshabilitado no dispara
  `click`, cero cambios en `motor-slides.js`. Verificado: término
  bloqueado no navega; el mismo término, ya visitado, sigue navegando
  y cerrando el glosario normal.

### v1.9.41 — el repaso del minijuego pasa de capa a pop-up real; y una discrepancia real entre lo reportado y lo aplicado que confirmó por qué §0.1 verifica antes de confiar

Detalle completo en `CLAUDE.md` §6.62.

**El hallazgo de proceso primero**: arrancó con un resumen de trabajo
que afirmaba "todo esto ya está aplicado, kit en v1.9.41". Verificado
contra el código real antes de tomarlo como dado (regla §0.1) — la
versión real era v1.9.40, y de 6 puntos reportados, 5 coincidían con
lo que hay de verdad en el kit; el 6º (este cambio) no existía en
ningún lado. Confirmado con el cliente que era tarea real pendiente,
no un error del resumen.

**El cambio real, `coto-minijuego.css`**: `.d-mj-repaso` deja de ser
un `[data-panel]` de pantalla completa (una capa más del minijuego) y
pasa a ser un `[data-popup]` real — mismo contrato que cualquier otro
pop-up del kit. El motor YA sabe abrir/cerrar/atrapar foco en
cualquier `[data-popup]` (spec §6) — cero JS nuevo del kit; verificado
con Playwright contra una página aislada que las 4 vías de cierre
(botón, ✕, Esc, backdrop) funcionan, el foco entra al abrir, y
`popupclose` dispara con el `id` correcto. Sin `.modal-hd` a
propósito (mismo criterio que el pop-up de video, §6.12 punto 5) — la
píldora + título ya tienen su propia identidad de color, y forzar el
degradado de marca encima sería un segundo lenguaje visual en el mismo
pop-up. Nuevo `.modal-x--mj-repaso` (mismo patrón que
`.modal-x--video`), y `.modal-card--mj-repaso` (720px, sin activar
`.d-wide` — esa clase fuerza el degradado de marca en el header, que
acá no corresponde).

**Bug real encontrado armando esto**: `.modal-bd` ya trae
`gap:1rem` en su flex-column; `.d-mj-repaso` maneja su espaciado con
`margin-bottom` por hijo — combinados en el mismo elemento (el
contrato nuevo los junta), el gap se sumaba al margin: doble espacio.
`gap:0` en `.d-mj-repaso` lo resuelve sin tocar `.modal-bd`.

**La lista pasa de 1 a 2 columnas** (`display:grid`), y "sin scroll"
resultó ser 2 problemas de layout distintos, no uno: ancho angosto
(mobile portrait) Y alto bajo (teléfono horizontal) desbordan por
razones independientes. Medido con Playwright en 6 tamaños
(escritorio/laptop/iPad H-V/teléfono H-V), comparando `scrollHeight`
vs. `clientHeight`: la primera pasada de compactación (un solo
`@media` con dos condiciones) dejaba 57px de sobra en 844×390 (el caso
más ajustado de alto) — un segundo escalón de compactación, activado
SOLO por `max-height:480px` (mobile portrait no lo necesita, tiene
alto de sobra), lo cerró: sin scroll confirmado en los 6 tamaños con
una segunda medición.

Verificado con suite completa (7/7) contra una copia de un curso
corriendo el kit modificado, sin regresiones en otros componentes.

### v1.9.40 — el contraste no fallaba en 5 categorías, fallaba el sistema de tokens; y `npm test` corría 6 de 7 tests

Ronda con el foco puesto solo en el kit. Detalle completo en
`CLAUDE.md` §6.60.

**2 herramientas nuevas**

- **`tools/check-contraste.mjs`** — valida las 23 categorías contra los
  pares de uso REALES del CSS del kit (cada par sale de una regla
  concreta), cada uno contra el umbral que le corresponde: 4.5:1 texto
  normal, 3:1 texto grande e íconos (WCAG 1.4.11). Lee las categorías
  del propio `coto-base.css`, así una categoría nueva queda cubierta
  sin tocar el script. Separa `nucleo` (componente que todo curso usa
  → corta el proceso) de componentes del addendum sin uso en ningún
  curso → se reportan pero no frenan, misma lección de §6.59 punto 6.
  Las excepciones exigen motivo escrito.
  `npm run contraste` para verlas todas.
- **`tools/run-tests.mjs`** — la suite sale de un glob de
  `tools/tests/*.mjs` en vez de una lista escrita a mano.
  `scorm-tracking.mjs` existía desde v1.9.9 y nunca estaba en esa
  lista: durante 30 versiones "0 fallos" quiso decir "0 fallos en 6 de
  7 tests". Un test nuevo entra a la suite por existir. No corta en el
  primer fallo (el `|| exit 1` viejo escondía el estado del resto).
  `npm run test:kit` corre lo validable SIN un curso (contraste +
  duplicados de CSS).

**Tokens nuevos, sin tocar el manual de marca**

`--cat-strong` hacía dos trabajos con requisitos distintos: bordes
(sin requisito de contraste) y texto/rellenos (con requisito). Y está
atado al manual — §6.5 dejó establecido que los 23 hexes coinciden
exactamente con el Valor 1 oficial. Se separaron:

| Token | Para qué | Estado |
|---|---|---|
| `--cat-strong` | bordes, outlines, sombras, thumbs, degradados | **intacto**, = Valor 1 del manual |
| `--cat-ink` | texto, íconos, rellenos sólidos con texto blanco | default = `--cat-strong`; 7 categorías traen el suyo |
| `--cat-wash` | fondo tintado que LLEVA texto | nuevo, `color-mix(--cat 12%, #FFF)` |

Las 7 con tinta propia están calibradas contra `--cat-wash`, no contra
blanco puro: calibrar contra blanco deja el token sin margen apenas el
fondo lleva tinte.

**4 bugs reales de kit corregidos**

1. `.modal-hd--dark`/`.btn-cat` con blanco sobre `--cat-strong` fallaba
   AA en 5 categorías (`zona-cumples` 3.18, `salon` 3.73,
   `seguridad-higiene` 3.98, `mantenimiento` 4.26, `elaborados` 4.30) —
   `salon` es la categoría de un curso ya entregado.
2. `.d-instr-kicker` (píldora "ANTES DE EMPEZAR") usaba `--on-cat`
   sobre `--cat-soft`: los dos tokens equivocados. Fallaba en 14 de 23,
   incluida `no-alimentos`. Pasa a `--cat-ink` + blanco, el mismo par
   que ya usa el resto del kit.
3. `.d-salida-eval` ponía `--cat-strong` sobre `--cat-soft` a `.9rem`:
   fallaba en 21 de 23. `--cat-soft` está a 4 pasos en una rampa de 6 —
   no hay tinta que llegue ahí. Pasa a `--cat-wash`.
4. `frescos-2` tenía `--on-cat:#FFF` con 2.74:1 sobre su degradado.
   Pasa a navy. Queda como la única excepción documentada del
   validador: su degradado abarca un rango tan ancho que ningún color
   pasa en los dos extremos — cerrarlo exige tocar la tabla del manual.

Resultado: 0 fallos de núcleo en 23 categorías × 5 pares, 1 excepción
documentada. Suite 7/7 en verde.

**`.d-narr-range` resuelto** — el hallazgo que v1.9.39 dejó "sin tocar
por ambiguo". No era ambiguo: la regla compartida
(`.d-vol-slider, .d-narr-range`) mezclaba el skin con el layout, y
`margin:0`/`flex:1` existían solo para el slider de volumen (que vive
en un `display:flex`). El de locución heredaba un `flex:1` inerte y
tenía que anular el margen. Acotados a `.d-vol-slider`. Verificado con
`getComputedStyle`/`getBoundingClientRect`: caja idéntica (218×6px).
Con esto `npm run test:kit` queda en verde y sirve como chequeo real
de entrega.

**`spec-motor-slides.md` y la plantilla `curso.js` puestas al día** —
faltaban 5 y 8 símbolos que el kit ya exportaba: `restoreMaxVisited`,
`initVideoSafetyNet`, `data-autoadvance`, `data-narrate-last`,
`data-narrate-prefix` en la spec; `initTiempoActivo`,
`initGlossarySearch`, `initGlossaryUnlock`, `initIndexJumps`,
`initHotspots`, `initShotSwap`, `initVideoSafetyNet`,
`initCertificatePrint` en `js/curso.js`. Un curso que arranca copiando
`kit-base/` de punta a punta (el flujo real, §7) no lee el código del
kit línea por línea — lee estos dos archivos. `initTiempoActivo()` e
`initVideoSafetyNet()` quedaron sin comentar en la plantilla (no
dependen de markup del curso, seguras de llamar siempre); el resto,
comentadas como opt-in según lo que el curso tenga.

**Nota**: tras mover los fondos de texto a `--cat-wash`, `--cat-soft`
quedó con cero usos en el kit — sus 7 usos eran todos fondos de texto,
o sea que nunca se había usado para lo que fue diseñado. Se deja
definido (Valor 5 del manual, los cursos lo usan en su CSS propio).

**Ronda de feedback sobre "Seguridad alimentaria" (mismo v1.9.40),
detalle en `CLAUDE.md` §6.61:**

- `narrador.js` — "Sonido" ahora también gobierna el volumen de la
  locución. `SpeechSynthesisUtterance.volume` se lee en CADA fragmento
  (`volumenEfectivo()`), y nuevo `Narrador.refreshVolume()` re-emite el
  fragmento en curso cuando hace falta aplicar un volumen nuevo a algo
  que ya está sonando (`volume` no se puede tocar en caliente).
- `coto-player.js` — `toggleMute()` llama a `refreshVolume()` (solo el
  mute, nunca el `input` continuo del slider); gracia de hover
  3s → 1,5s (`GRACIA_HOVER_MS`, un solo lugar); **bug real**: el clic
  afuera y `slidechange` solo sacaban `is-open`, nunca `is-hover` — un
  popover abierto por hover se quedaba colgado hasta vencer la gracia
  aunque el alumno ya hubiera hecho clic afuera.
- `coto-shot-stage.css` — `.d-shot-hit--paso` (que `initShotSwap` ya
  keyeaba desde v1.9.39) no estaba definida en el kit — mismo patrón
  recurrente de §1. Sin ella, heredaba el tinte de `:hover` genérico
  de `.d-shot-hit`, un affordance de "clickeame" sobre un control que
  desde v1.9.37/38 solo responde al arrastre. Ahora trae `cursor:grab`
  sin tinte, con `cursor:grabbing` durante el arrastre real.

### v1.9.39 — ronda de "10 mejoras al kit": mobile de fondo (no parche), 2 bugs de kit propios encontrados con las herramientas nuevas

Pedido directo del cliente ("proponeme 10 cosas que hoy el kit base
debería tener y no tenga"), las 10 aprobadas e implementadas. Detalle
completo en `CLAUDE.md` §6.59.

- **Aviso "Girá tu dispositivo"** (`.d-rotate-notice`,
  `coto-shot-stage.css`) para portrait angosto — resuelve la
  limitación que había quedado documentada sin resolver en §6.56.
- **`openCourseMobile()`** nuevo en `tools/tests/_shared.mjs` — mismo
  contrato que `openCourse()` pero en contexto táctil real, para que
  la regla nueva "todo se prueba en mobile real" sea fácil de cumplir.
  Los 3 tests mobile existentes migrados a usarlo.
- **`initPinnedPopover()`** nuevo en `coto-player.js` — mecanismo
  compartido que `initAudioPopovers()`/`initFabPopovers()` duplicaban
  cada uno por su cuenta (pin, gracia de hover, cierre por fuera/
  slidechange).
- **Red de seguridad universal para `<video>`** (`initVideoSafetyNet`,
  `coto-media.js`, se dispara sola desde `initPlayer()`) — pausa
  cualquier video que quede sonando fuera de su contexto activo,
  cinturón extra sobre los 4 patrones existentes.
- **`Motor.restoreMaxVisited(vistas)`** nuevo en `motor-slides.js` —
  absorbe al kit el bug real de §6.51 (el techo de arrastre de la
  barra de progreso no se restauraba bien entre sesiones); un curso ya
  no tiene que escribir ese loop a mano.
- **`tools/check-css-duplicates.mjs`** nuevo — detecta selectores CSS
  repetidos con propiedades en conflicto (la familia de bug de §6.28/
  §6.33). Encontró y se corrigieron 2 bugs reales en el kit mismo
  (`.d-gloss` en el addendum, una regla `@media` duplicada en
  `coto-cierre.css` — ver detalle abajo).
- **Warning de desarrollo** en `_initShots()` (`motor-slides.js`):
  avisa por consola si un `[data-hit]`/`[data-place]` no tiene
  `position:absolute` (el bug de §6.22 punto 7, antes indetectable
  sin mirar la pantalla).
- **`initConceptShots()` → confirmado resuelto**: era código muerto en
  el "pendiente" de este documento — `initShotSwap()` (§6.45) ya es
  esa generalización, en producción hace rato.
- **Certificado de finalización imprimible/PDF**
  (`initCertificatePrint()`, `coto-cierre.js` + CSS pareja en
  `coto-cierre.css`) — nombre real del alumno (invertido desde
  "Apellido, Nombre" del LMS), curso, fecha y medalla. Pedido pendiente
  desde §6.46, nunca implementado hasta ahora. Cero markup propio de
  curso: el documento se arma entero en JS, el curso solo agrega el
  botón `#d-cert-print`.
- **`tools/build-zip.py`** nuevo — arma el zip de entrega con el flag
  UTF-8 verificado (la trampa de `zipfile` de §3.9), reusable en vez
  de reescribirlo a mano cada vez.

**2 bugs reales de kit encontrados con las herramientas nuevas, los 2
corregidos en la misma vuelta** (`check-css-duplicates.mjs` los
encontró apenas se corrió contra el CSS del kit mismo):
- `.d-gloss > div`/`dt`/`dd` (`coto-base-addendum-v1.8.css`) tenían 4
  declaraciones seguidas sin ningún `@media` — solo la última (la más
  chica) corría, siempre, en cualquier pantalla. Consolidado en la
  regla base, sin cambio de comportamiento visible (era ya el único
  valor que se veía).
- `.d-cert-stats .s.d-shine::after` (`coto-cierre.css`) tenía la MISMA
  regla `@media(prefers-reduced-motion:reduce)` declarada dos veces,
  byte a byte — duplicado exacto, eliminado.

**Bug de proceso encontrado armando el zip de verificación**: un test
mobile (`check-fab-mobile.mjs`) escribía una captura opcional en
`process.argv[3] + '/archivo.png'` sin chequear que ese argumento
existiera — corrido sin ese 3er argumento (el caso normal), Playwright
escribía literalmente en `./undefined/archivo.png`, dejando una
carpeta `undefined/` que se colaba en el zip de entrega. Ya estaba en
el zip anterior entregado al cliente. Corregido con un guard simple.

### v1.9.38 — verificación de mobile tras v1.9.37: el "solo arrastre" de Rotación fallaba en touch de verdad

Encontrado auditando "¿esto anda bien en mobile?" después de entregar
v1.9.37 — no era un reporte del cliente, apareció al re-probar el fix
de Rotación (v1.9.27/v1.9.37) con un tap táctil real en vez de con
mouse. Detalle completo en `CLAUDE.md` §6.58 (nota agregada al pie).

- **Bug real: un tap táctil simple en la barra de "pasos" de Rotación
  seguía saltando directo, sin arrastrar.** El guard que distinguía
  "clic real" (bloqueado) de "activación por teclado" (permitida)
  usaba `e.detail !== 0` — pero un `click` sintetizado por un tap
  táctil TAMBIÉN trae `detail: 0`, igual que uno de teclado. Fix:
  se reemplaza esa heurística por una bandera que marca si hubo un
  `pointerdown` (mouse o touch) justo antes del `click` — eso sí
  distingue de verdad "hubo un dedo/mouse tocando" de "fue Enter/
  Espacio con foco, sin ningún puntero de por medio". Verificado con
  Playwright en viewport táctil real (`isMobile`/`hasTouch`, no solo
  redimensionando la ventana): tap sin arrastrar ya no mueve el paso,
  arrastre táctil real sí, y Enter/Espacio con foco de teclado sigue
  funcionando igual que antes.

### v1.9.37 — feedback sobre v1.9.36: gracia de hover, sin conteo de fragmentos en Locución, Ayuda más compacto, Rotación solo-arrastre de verdad

Ronda de correcciones puntuales sobre lo entregado en v1.9.36. Detalle
completo en `CLAUDE.md` §6.58.

- **Gracia de hover (3s)** en los 4 popovers (Sonido/Locución/Ayuda/
  Configuración): `attachHoverGrace()` nuevo en `coto-player.js` — se
  abren al instante con el mouse, pero tardan 3s en cerrarse después
  de que el mouse se va (cancelable si vuelve a entrar antes). Antes
  dependían de CSS `:hover` puro, que no perdona ni un frame fuera del
  hitbox — cruzar rápido el hueco entre el botón y el popover los
  cerraba de golpe (reporte real del cliente).
- **Locución ya no muestra "frase N de M".** Sonaba a que el audio
  tuviera partes separadas; era un detalle interno de `chunkText`
  (narrador.js) que nunca debió mostrarse. Queda solo la barra
  arrastrable + "Repetir".
- **El popover de Ayuda se veía "con cosas muy grandes".** Las clases
  del addendum (`.d-instr-*`) están pensadas para el drawer ancho de
  "Cómo recorrer el curso" — reusadas tal cual en un popover de
  ~320px, sobraban. Overrides scoped a `.d-fab-pop .d-instr-*` en
  `coto-player-chrome.css`, sin tocar el tamaño original en su uso de
  siempre.
- **Bug real: la barra de "pasos" de Rotación (v1.9.27) todavía
  saltaba con un clic sin arrastrar de verdad** — cualquier clic real
  tiene 1-2px de temblor de mano, y eso alcanzaba para disparar
  `go()` en el primer `pointermove`. Fix: umbral de 6px de movimiento
  antes de contar como arrastre real (`coto-media.js`).
- **Íconos del índice corregidos** (7 símbolos nuevos + 9
  reasignaciones) — es contenido de curso (`seguridad-alimentaria/
  index.html`), no del kit, pero queda documentado en `CLAUDE.md` como
  ejemplo de auditoría a seguir en el próximo curso.
- Tests nuevos, curso: `check-popover-hover-gracia.mjs`,
  `check-rotacion-arrastre.mjs`.

### v1.9.36 — "Ayuda" se separa de "Configuración": dos botones flotantes abajo a la derecha, con valor agregado real

Pedido explícito del cliente: el botón "Ayuda" del header mezclaba
instructivo con configuración (voz/velocidad, escondidas adentro del
mismo pop-up). Mockup aprobado en dos rondas (§6.40) antes de tocar
código — la primera versión, simple, se rechazó por pedido explícito
de "más pro, más interactivo". Detalle completo en `CLAUDE.md` §6.57.

- Dos botones flotantes nuevos, apilados abajo a la derecha
  (`[data-fab-stack]`, `initFabPopovers()` en `coto-player.js`), mismo
  mecanismo "pinned" hover/foco/tap que los popovers de audio de
  v1.9.35 — pero sin posicionamiento dinámico: el anclaje nunca se
  mueve entre breakpoints, así que un `max-width` alcanza en mobile.
- **Ayuda**: el instructivo de siempre (nav + 3 tips), reorganizado
  como acordeón de preguntas frecuentes (una abierta a la vez), más un
  botón nuevo "Volver a ver la introducción" que reabre el pop-up
  "Cómo recorrer el curso" (antes se veía una sola vez, sin forma de
  recuperarlo si se cerraba sin querer).
- **Configuración**: el selector de voz + velocidad, tal cual estaban
  (mismos IDs, `initVoicePicker`/`initRatePicker` sin tocar), más
  "Escuchar un ejemplo" (preview a demanda, sin tener que cambiar el
  selector) y "Restablecer a los valores recomendados"
  (`initConfigReset()`, reusa los listeners existentes en vez de
  duplicar lógica).
- Efectos: aro de "hay algo acá" que pulsa 2 veces al cargar y se
  apaga solo, hover con escala, el engranaje gira, popover con
  entrada tipo rebote — todo bajo `prefers-reduced-motion`.
- **Bug real de kit encontrado de paso** (del curso, no del kit):
  `seguridad-alimentaria/index.html` tenía dos `<div class="d-app">`
  anidados sin su segundo cierre — invisible porque `.d-app` es
  `position:fixed` (el div interno se sale del flujo del externo),
  pero HTML mal balanceado igual. Corregido.
- Tests nuevos, curso: `check-fab-ayuda-config.mjs`,
  `check-fab-mobile.mjs`. `check-narracion-ayuda.mjs` actualizado al
  nuevo selector (ya no hay `[data-popup="ayuda"]`).

### v1.9.35 — controles de audio "cool": barra de volumen + línea de tiempo de locución, con popovers que se posicionan dinámicamente (nunca más por breakpoint fijo)

Pedido explícito del cliente sobre "Seguridad alimentaria", con mockup
aprobado antes de tocar código (proceso fijado en CLAUDE.md §6.40).
Detalle completo en `CLAUDE.md` §6.55.

- **Sonido**: el botón `#d-sound` ahora abre un panel con slider de
  volumen (0-100%), botón de mute propio, y un ecualizador decorativo
  de 10 barras. Nuevo `localStorage['coto-diapos-volume']`. El volumen
  se aplica a los 3 patrones de video (`coto-media.js`) y a los tonos
  de UI (`coto-ui.js`/`fx.js`, nuevo helper `volumeLevel()` duplicado
  en los 3 archivos, mismo criterio que `muted()`).
- **Locución**: el botón `#d-narrate` abre una línea de tiempo por
  fragmento (chunk de `chunkText`) con arrastre para saltar y un botón
  "Repetir". Requirió reestructurar `narrador.js`: nuevo estado
  `estadoActual` (trozos/índice/terminado de la narración actual o
  última), `hablarDesde(i)` como driver único, evento
  `narracionprogreso` en `document`, y `seek(i)`/`repeat()`/
  `progreso()` nuevos en `Narrador`. La línea de tiempo es deliberadamente
  a nivel de FRASE, no de palabra — Web Speech API no da progreso
  intra-utterance confiable, se lo comunicó al cliente antes de
  implementar y lo aceptó.
- **Popovers con posicionamiento dinámico, no por breakpoint**: primer
  intento ancló el panel a la derecha en `@media(max-width:480px)`,
  asumiendo que el grupo de botones de audio siempre queda cerca del
  borde derecho — bug real, encontrado con Playwright en viewport
  móvil real (390px): el layout de 2 filas YA EXISTENTE (`≤799px`,
  `.d-top-group--audio{grid-row:2;justify-self:start}`) mueve ese
  grupo a la IZQUIERDA, y el panel anclado a la derecha se salía por
  completo del viewport (`left:-150px` medido). Fix real:
  `initAudioPopovers()` (`coto-player.js`) mide la posición REAL del
  botón (`getBoundingClientRect()`) en cada apertura
  (click/`mouseenter`/`focusin`/resize) y fija un `left` inline
  clampeado a `[8px, viewport - ancho - 8px]`, con `--flecha-left`
  (variable CSS) para que la flechita del panel siga apuntando al
  botón real aunque el panel se haya corrido. El CSS
  (`left:50%;transform:translateX(-50%)`) queda como fallback sin JS
  únicamente — nunca vuelve a asumir en qué breakpoint/lado va a estar
  el botón.
- Test de timing en este sandbox: Playwright/Chromium sin backend de
  audio real resuelve `speechSynthesis` casi instantáneo — un test que
  espera con `waitForTimeout()` y saca una foto no alcanza a ver un
  estado "a mitad de narración". Patrón nuevo, reusar en cualquier test
  de narración futuro: capturar la secuencia COMPLETA de eventos
  `narracionprogreso` con un listener registrado antes de `speak()`,
  resuelto por Promise, y afirmar sobre la secuencia/orden en vez de
  una foto en un instante.
- Tests nuevos, curso: `tools/tests/check-controles-audio.mjs`
  (funcional: slider, mute, secuencia de progreso, seek/repeat) y
  `tools/tests/check-controles-audio-mobile.mjs` (viewport táctil real
  390×844: tap abre/cambia/cierra, el panel nunca se sale del
  viewport, el slider sigue siendo arrastrable).

### v1.9.34 — bug real, el más frecuente de toda la auditoría de locuciones: el título dicho dos veces seguidas

Detalle completo en `CLAUDE.md` §6.54 punto 6. El pedido "que la
narración sea clara, ordenada, con sentido" exigió leer las 26 salidas
de `textOf()` de punta a punta, no solo chequear estructura — así
apareció en 6 de las 26 diapositivas: el cuerpo ya abría anunciando el
tema en palabras ("Introducción. En COTO trabajamos...") de una época
sin título narrado, y con `setNarrateTitles` prendido (v1.9.31) quedó
sonando "Introducción. Introducción. En COTO...".

**Corregido**
- `js/narrador.js` — `textOf()`: si el título es el primer fragmento y
  el siguiente arranca repitiendo ese mismo texto como su propia
  primera oración, se recorta la apertura duplicada — nunca el título,
  nunca el texto visible. Tolerante a puntuación de apertura/cierre
  (¡¿.!?). Verificado con un diff completo antes/después: solo las 6
  diapositivas afectadas cambiaron, el resto byte por byte igual.

### v1.9.33 — auditoría "lee correctamente y en orden" a pedido del cliente: preguntas de repaso reveladas antes de tiempo, y `[data-narrate-prefix]` nuevo

Detalle completo en `CLAUDE.md` §6.54 punto 5. El cliente pidió que
quede como regla permanente verificar que la narración lee todo bien
y en orden — no una revisión puntual. Auditando con esa vara apareció
un bug real, más grave que los anteriores: las 2 preguntas de repaso
rápido de este curso se narraban juntas al entrar a la diapositiva
(revelaba la 2ª antes de tiempo), porque el widget las esconde con una
clase CSS (`display:none`) y no con el atributo `hidden` real que
`textOf()` sabe respetar — el fix fue en el curso (`initRepasoRapido`),
no en el kit, pero la LECCIÓN sí es de kit y quedó en el checklist de
arranque (§7, punto 9.9).

**Agregado**
- `js/narrador.js` — `textOf()` respeta un nuevo atributo opcional
  `[data-narrate-prefix="..."]`: antepone ese texto (seguido de ": ")
  a lo que se narra de ese nodo, sin tocar el texto/alt visible. Pensado
  para el caso "la narración necesita avisar algo que solo se VE" (ej.
  una pregunta Verdadero/Falso donde los botones nunca se narran) —
  mismo espíritu que `speechify()`: nunca se toca lo visible, solo lo
  que se dice de más.

### v1.9.32 — bug real de kit: la grilla de tips de "Ayuda" quedaba muda en cualquier curso

Detalle completo en `CLAUDE.md` §6.54 punto 4. `.d-instr-item` (el
patrón genérico de la grilla de 2-5 tips de "Ayuda") guarda su texto en
`span > small`, ninguno de los dos narrado por `textOf()` — el gap
existe en cualquier curso que use el panel de "Ayuda" del boilerplate
tal cual, no era específico de "Seguridad alimentaria".

**Corregido**
- `js/narrador.js` — `.d-instr-item` sumado a `TEXT_SEL`. El título y
  la nota de cada tip van sin espacio en el DOM (los separa el CSS);
  `textOf()` ahora clona el nodo y antepone un punto y espacio a cada
  `<small>` antes de leer el texto, mismo criterio que ya usaba para
  `.d-q-num`.

### v1.9.31 — el título horneado en el arte pasa a narrarse, como opt-in por curso (no cambio de default)

Detalle completo en `CLAUDE.md` §6.54 punto 3. El cliente confirmó que
el título de cada diapositiva (la píldora del arte) es el mismo texto
que el `<h2 data-slide-title>` de accesibilidad, y pidió que se
escuche antes del cuerpo — algo que el kit excluye por default desde
una decisión de OTRO cliente.

**Agregado**
- `js/narrador.js` — `Narrador.setNarrateTitles(bool)` (default
  `false`, no cambia nada para ningún curso existente): prendido,
  `textOf()` deja de excluir `[data-slide-title]`. El orden queda
  correcto sin código extra (el `<h2>` ya es el primer hijo de la
  `<section>` en el marcado).

### v1.9.30 — auditoría de locuciones a pedido del cliente: video de fondo compitiendo con la voz, y voz latina/argentina antes que la de EE.UU.

Detalle completo en `CLAUDE.md` §6.54.

**Corregido**
- `js/narrador.js` — `textOf()` ahora devuelve `''` para cualquier
  diapositiva `.d-shot-slide--bg-video`: antes, un `<p>` narrable
  dentro de su `.sr-only` se leía en voz alta AL MISMO TIEMPO que el
  video reproducía su propio audio (bug real, encontrado en "Seguridad
  alimentaria" — sus 4 diapos de video de fondo tienen un párrafo así).
  Es la regla de CLAUDE.md §5 ("una diapo que ES un video no se
  narra"), que antes vivía solo como convención de contenido.
- `js/coto-media.js` — `initBgVideos()` corta la locución
  (`Narrador.cancel()`) antes de reproducir, como cinturón extra —
  mismo criterio que ya tenían los otros 4 patrones de video del
  archivo (era el único que no lo hacía).

**Cambiado**
- `js/narrador.js` — `pickVoice()`: la preferencia general (fuera del
  caso tablet) pasa de "es-US primero, región después" a "región
  primero (es-AR → es-419), es-US como respaldo dentro de la misma
  cadena". Pedido explícito del cliente. Sin nombres de voz
  hardcodeados por navegador — se busca por código de idioma, que es
  estable entre dispositivos; el catálogo real de voces depende del
  paquete de idioma instalado en cada uno, no del navegador.

### v1.9.29 — octava vuelta sobre "Seguridad alimentaria": auditoría del sistema de puntos (bug real de curso, no de kit) + botón de pantalla completa

Detalle completo en `CLAUDE.md` §6.53. A pedido del cliente, se auditó
el sistema de puntos/medallas completo. El único bug real estaba en el
curso (`estado.juegoAciertos` faltante — el minijuego premiaba cada
hallazgo sin guard persistido, farmeable reintentando sin límite); el
resto del sistema (`medallaDe`/`pintarMedalla` en el kit) ya estaba
sano desde el fix de §6.45.

**Cambiado**
- `js/coto-player.js` — el botón de pantalla completa pasa de
  "Contraer" a "Reducir" (pedido puntual del cliente): empareja mejor
  con "Ampliar" (mismo registro, mismo verbo de acción corto), sin el
  matiz de "encoger una forma" que tenía "contraer". Tercera palabra
  que prueba este botón (Contraer → Salir → Contraer → Reducir) — el
  `title`/`aria-label` explícito ("Salir de pantalla completa") no
  cambió, solo el texto corto visible.

### v1.9.28 — séptima vuelta sobre "Seguridad alimentaria": glosario interactivo, con desbloqueo progresivo atado al progreso real del curso

Detalle completo en `CLAUDE.md` §6.52. Pedido del cliente: clic en un
término del glosario navega a la diapositiva donde se explica, y el
término se muestra bloqueado (nombre + candado, sin definición) hasta
que el alumno llega a esa diapositiva.

**Agregado**
- `js/coto-ui.js` — `initGlossaryUnlock(opts)`: pone/saca `.is-locked`
  en cada `<dt data-goto="...">` según `opts.seen(id)` (el curso la
  responde con el mismo `estado.vistas` que ya restaura entre
  sesiones — cero estado nuevo que sincronizar) y avisa por callback
  qué términos se acaban de desbloquear, para un toast. La navegación
  en sí no necesitó JS nuevo: `data-goto` ya lo cablea `Motor._init()`
  (cierra el pop-up y salta, igual que el índice/sidenav).
- `css/coto-base-addendum-v1.8.css` (sección 21, GLOSARIO) —
  `.d-gloss-term-btn`/`.d-gloss-lock-ic`/`.d-gloss-hint`: el término
  como botón real (foco/teclado), candado oculto salvo `.is-locked`,
  definición oculta + hint de desbloqueo visible mientras esté
  bloqueado. Los dos `<span>` (definición real + hint) viven siempre
  en el DOM; el CSS decide cuál se ve, ningún JS reescribe contenido.

**Corregido**
- `js/coto-ui.js` — `initGlossarySearch()`: con texto de búsqueda, un
  término bloqueado ya no puede "encontrarse" (su definición real
  sigue en el DOM, solo oculta por CSS) — antes de este fix, buscar el
  texto exacto de un término aún no visitado lo revelaba igual.

### v1.9.27 — sexta vuelta sobre "Seguridad alimentaria": la barra de progreso "olvidaba" sesiones anteriores, y la barra de pasos de Rotación pasa a ser 100% arrastrable

Detalle completo en `CLAUDE.md` §6.51. El bug más largo de encontrar
de todo el curso: el arrastre de la barra de pasos se cortaba solo a
mitad de camino, de forma intermitente.

**Corregido**
- `js/coto-media.js` — `initShotSwap()`: nueva capacidad de arrastre
  para grupos `.d-shot-hit--paso` (una progresión lineal real, tipo
  "Paso 1 de 4"), acotada a propósito para NO aplicar a
  `.d-shot-hit--tab` (categorías sin orden). El bug real: el punto de
  partida cae sobre el `<img>` de fondo (el paso activo tiene
  `pointer-events:none`), y una imagen es arrastrable por el
  navegador por default — al moverse lo suficiente, el navegador
  arrancaba su propio drag nativo y cancelaba la secuencia de
  punteros (`pointercancel`). `preventDefault()` en el `pointerdown`
  lo resuelve. Pedido de producto en la misma vuelta: un clic sin
  arrastre ya no salta al tramo tocado — hace falta arrastrar de
  verdad; la activación por teclado (Enter/Espacio) sigue saltando
  directo, es el único disparador posible sin mouse.
- Documentado en `CLAUDE.md` §7 (checklist de arranque) como regla
  general: cualquier interacción de arrastre sobre un `<img>` necesita
  `preventDefault()` en el `pointerdown` — los `<div>` no tienen este
  problema (no son arrastrables por default), por eso la barra de
  progreso del curso nunca lo necesitó.

**Corregido (curso, lección genérica para el checklist)**
- La barra de progreso del curso perdía la memoria de sesiones
  anteriores al recargar la página: `motor.maxVisited` (el tope de
  hasta dónde se puede arrastrar hacia adelante) se inicializaba
  siempre en `motor.index` (0 al arrancar), sin mirar `estado.vistas`
  ya restaurado. Nueva regla en el checklist de arranque (§7.9.8):
  este dato tiene que calcularse desde el estado YA RESTAURADO, no
  solo desde el índice en frío.

### v1.9.26 — quinta vuelta sobre "Seguridad alimentaria": las píldoras del minijuego se estiraban al achicar la ventana, y "Producto alterado" pasa a hallazgo real

Detalle completo en `CLAUDE.md` §6.50.

**Corregido**
- `css/coto-minijuego.css` — `.d-mj-grid` tenía `align-items:stretch`:
  en cuanto una etiqueta larga pasaba a 2 líneas al angostar la
  ventana, TODA su fila se estiraba con ella, inflando también a las
  píldoras cortas vecinas. `align-items:start` — cada píldora mide su
  propio contenido, el alto total de la grilla no cambia.
- `css/coto-minijuego.css` — pista diferenciada (reversión explícita
  de una decisión de diseño anterior, §6.39): nueva clase
  `.is-hint-ok` (ícono 💡 + pulso celeste) separada de `.is-hint-bad`
  (pulso ámbar de siempre) — antes las 3 opciones resaltadas se veían
  iguales a propósito, ahora el cliente pidió que se distinga cuál es
  la correcta.

### v1.9.25 — cuarta vuelta sobre "Seguridad alimentaria": la pausa nativa entraba en carrera con el toggle propio, y el botón de play quedaba ovalado

Detalle completo en `CLAUDE.md` §6.49. Dos bugs reales de kit en el
patrón 3 de video (círculo/carátula que reproduce en el lugar), los
dos en el reproductor con carátula real (variante (c), §6.29/§6.45).

**Corregido**
- `js/coto-media.js` — `initInlineCircleVideos()`: el toggle de clic
  propio decidía play/pausa mirando `video.paused` en CUALQUIER clic
  sobre el `<video>`, incluido un clic sobre los controles NATIVOS que
  ese mismo módulo agrega al reproducir. El clic llega al `<video>`
  antes de que el navegador aplique su pausa, así que el handler leía
  el estado viejo y volvía a llamar `play()` a mano — carrera real
  entre dos pausas, síntoma: la carátula volvía pero el audio seguía
  sonando. Ahora el toggle por clic no hace nada una vez que hay
  `controls` puesto (ahí el play/pausa es de ellos), y el estado
  visual (`.is-playing`) se sincroniza escuchando los eventos reales
  `play`/`pause` del `<video>`, no infiriéndolos de un clic.
- `css/coto-media.css` — `.d-shot-hit-play`: se dimensionaba con
  `width`/`height` en % (dos ejes independientes) más un tope en px
  por eje — sobre un wrapper rectangular (una caja de video, nunca
  cuadrada), en cuanto un tope entraba a jugar en un eje y el otro no,
  quedaba ovalado. Pasa a un solo eje (`width:44%`) + `aspect-ratio:1`
  para el otro — redondo en cualquier caja, se vio al pasar a pantalla
  completa (el lienzo cambia de proporción de golpe).
- `js/coto-media.js` — doc-comment de `initInlineCircleVideos()`:
  sumada la advertencia de especificidad para quien pise el
  `object-fit` de la variante con carátula desde el CSS del curso — un
  bug real (course-specific, no de kit) hizo que la carátula y el
  `<video>` real quedaran con encuadres distintos por perder contra la
  regla del kit (3 selectores) con un override de menos especificidad
  (2 selectores).

### v1.9.24 — tercera vuelta sobre "Seguridad alimentaria": auto-avance, 4 bugs reales, y la pantalla de salida

Detalle completo en `CLAUDE.md` §6.48. Cuatro focos: una regla de
proceso nueva del cliente (portada/separadores = video con
auto-avance, 100% curso), una batería de bugs reales de interacción,
una pieza de kit que tenía CSS pero ningún curso la usaba todavía, y
una auditoría de mobile pedida a partir de un bug ya resuelto en "Uso
de Sucursales 3 - NOA".

**Corregido**
- `js/narrador.js` — `textOf()` narraba en orden del DOM sin mirar si
  un contenedor debía ir al final; nuevo `[data-narrate-last]` empuja
  ese contenedor al final de la narración sin importar dónde vive en
  el DOM (el hint/cartel de un hotspot, por ejemplo, que por posición
  siempre queda antes del texto real de la diapo).
- `js/coto-hotspots.js` — `initHotspots()` limpiaba cualquier
  interacción con solo sacar el mouse del contenedor; ahora el clic fija
  la zona (`pinned`) y `mouseleave` no la borra mientras esté fija. De
  paso se simplificó el viejo truco de `pointerdown`/`activaAlTocar`
  para el toggle en táctil — ya no hace falta.
- `css/coto-minijuego.css` — el panel "jugar" del minijuego (`.d-mj-body`)
  seguía siendo grid de 2 columnas fijas en mobile real (375-414px):
  imagen minúscula, opciones a ~50px de ancho, ilegible. Mismo bug ya
  resuelto en "Uso de Sucursales 3 - NOA", nunca antes probado acá en
  viewport mobile real. `display:grid` → `flex-direction:column` en
  el breakpoint ≤600px, con `flex-shrink:0` en la columna de la imagen
  (si no, colapsa a 0px en vez de solo achicarse) y `overflow-y:auto`
  en el panel contenedor (si no, lo que no entra queda cortado, no solo
  apretado).
- `js/coto-media.js` — documentado (no corregido, no hay fix de browser
  real): el video inline de "proceso" con controles nativos se rompía
  al pausar en pantalla completa nativa y volver, porque `_initShots()`
  no recalcula en `fullscreenchange`. El curso saca el botón con
  `controlslist="nofullscreen"`; si un curso futuro necesita fullscreen
  real, usar el patrón 2 (`initVideoPlayer`, pop-up) en vez de la
  variante inline.

**Nuevo**
- `css/coto-base-addendum-v1.8.css` — `#d-salida` (CSS ya existía desde
  v1.8, ver `salirDelCurso()` en `coto-cierre.js`) recibió su primer uso
  real: borde izquierdo en `.d-salida-eval` en vez de un recuadro
  parejo, para que el aviso de "la evaluación es aparte" lea como nota
  al margen, no como alerta de error.
- `css/coto-shot-stage.css` — `.modal-card--art` sigue creciendo por
  pedido del cliente: de 31% a ~36% del viewport (`min(55vw, 580px,
  calc(90vh * ratio))`, antes `min(48vw, 500px, calc(80vh * ratio))`)
  — cuarta ronda de "todavía un poco más" desde v1.9.21.

**Documentación**
- `CLAUDE.md` §7.3 punto 11 (nuevo): cualquier breakpoint ≤600px se
  prueba con Playwright en viewport mobile real (`isMobile`/`hasTouch`),
  nunca solo redimensionando la ventana de escritorio — el mismo bug
  del minijuego pasó sin detectarse en 2 cursos por esto exacto.

### v1.9.23 — segunda vuelta de feedback sobre "Seguridad alimentaria"

Detalle completo en `CLAUDE.md` §6.47. Feedback visual puntual sobre lo
entregado en v1.9.22; casi todo quedó en el curso (tilde en las
tarjetas de peligro, reposición del hint en "temperatura", rediseño
del repaso rápido, contraste del header de un pop-up puntual). Una sola
pieza era un bug real de kit.

**Cambiado**
- `css/coto-shot-stage.css` — `.modal-card--art` se agranda:
  `min(48vw, 500px, calc(80vh * ratio))` (antes `min(32vw, 294px,
  calc(49vh * ratio))`, v1.9.22). El cliente pidió "60%" tras ver el
  resultado anterior; probado literal desbordaba el layout (tapaba
  contenido de al lado), se convalidó un punto medio con Playwright.

**Corregido**
- `js/coto-ui.js` — `staggerReveal()` le ponía `.d-stagger-in` a
  cualquier hijo directo de `.modal-hd`/`.modal-bd`, sin mirar si
  estaba `hidden`. Un hijo que arranca oculto y se revela después (un
  botón "Continuar" que aparece recién al responder, un párrafo de
  feedback) quedaba con la animación pegada en `opacity:0` para
  siempre — `display:none` bloquea el arranque de la animación, y
  sacar el `hidden` después no la reinicia sola. Ahora filtra los
  hijos `hidden` antes de asignar la clase.

### v1.9.22 — ronda de feedback + 10 propuestas sobre "Seguridad alimentaria"

Detalle completo en `CLAUDE.md` §6.46. La mayoría de esta ronda es
contenido específico del curso (repaso rápido, hotspots informativos,
pop-up de predicción, pista del minijuego); solo 3 piezas genéricas
subieron al kit.

**Cambiado**
- `css/coto-shot-stage.css` — `.modal-card--art` se achica otro 30%:
  `min(32vw, 294px, calc(49vh * ratio))` (antes `min(46vw, 420px,
  calc(70vh * ratio))`, v1.9.21).

**Nuevo**
- `js/coto-ui.js` — `initGlossarySearch()`: buscador de texto para
  cualquier pop-up de glosario (`dl.d-glossary`), sin distinguir
  mayúsculas/acentos, oculta encabezados de secciones sin resultados.
- `css/coto-base-addendum-v1.8.css` — markup/estilos del campo de
  búsqueda del glosario (`.d-gloss-search`, `.d-gloss-empty`).

**Corregido**
- `css/coto-base-addendum-v1.8.css` — el borde divisor entre entradas
  del glosario (`.d-glossary > dt:not(:first-child)`) dependía de la
  posición en el DOM, no de visibilidad; con el buscador activo podía
  quedar mal puesto. Ahora `dt:not([hidden]) ~ dt:not([hidden])`.

### v1.9.21 — arranque de "Seguridad alimentaria" (Área Control de Calidad)

Auditoría §7.1 contra "Uso de Sucursales 3 - NOA" (6 gaps) + 2 bugs
encontrados construyendo el curso. Detalle completo en `CLAUDE.md`
§6.45.

**Bugs corregidos**
- `js/coto-cierre.js` — `medallaDe()` devolvía el nivel más bajo como
  medalla de consuelo aunque el puntaje no llegara a ese umbral, y el
  subtítulo decía "te faltaron N para la de bronce" **debajo de**
  "Medalla de bronce". Ahora devuelve `null` y `pintarMedalla()` lo
  muestra como el estado real que es.
- `js/coto-cierre.js` — `pintarMedalla()` buscaba el próximo nivel
  recorriendo el array del curso sin ordenarlo (mismo bug de orden
  implícito que §6.18 punto 4 ya había corregido en `medallaDe`, una
  función más arriba).
- `js/coto-media.js` — `initInlineCircleVideos` no cubría el caso "el
  arte ya dibuja el reproductor y el `poster` ES ese dibujo": el fix de
  §6.29 (sin `controls` nativo hasta que el video arranca) existía solo
  en `initPopupVideos`.

**Piezas que faltaban en el kit** (estaban en el contrato, el CSS vivía
suelto en cada curso)
- `css/coto-cierre.css` — regla base de `.d-cert-stats`/`.d-cert-stats .s`
  (el archivo ya traía sus 3 escalones responsive, pero no la base) +
  ancho del resumen a `min(1680px,96%)`.
- `css/coto-base-addendum-v1.8.css` §11 — `.d-sidenav-progress`,
  `.d-salida-eval`, la regla base de `.d-instr-cta` y las tildes de
  avance `.d-u2-prog`/`.d-u2-prog-lbl`/`.d-u2-dots`/`.d-u2-tick`.

**Nuevo**
- `css/coto-minijuego.css` — la cáscara visual del minijuego, extraída
  del `diapositivas.css` de NOA con sus 6 rondas de correcciones ya
  adentro. El curso solo aporta la topología del banco de opciones y la
  lógica del juego.
- `css/coto-minijuego.css` — `.d-shot-hit.d-mj-fin-cta`: variante
  PINTADA del botón del panel final, para cuando el texto depende del
  resultado pero el arte dibuja uno solo. Cubre al dibujado con la
  misma forma/tamaño/color (colores por `--mj-cta-bg`/`--mj-cta-border`,
  los pone el curso) en vez de blanquear la zona — blanquear una
  píldora con un rectángulo deja las esquinas asomando (§6.22 p.5).
- `css/coto-shot-stage.css` — `.modal-card--art`: pop-up cuyo contenido
  ES el archivo del diseñador (PNG con alfa, silueta no rectangular,
  sombra propia). Tarjeta transparente y sin `box-shadow`, para no
  duplicar la sombra (§6.28).
- `js/coto-media.js` — `initShotSwap()`: "una zona dibujada en el arte
  cambia la captura entera por otra variante" (pestañas, carruseles,
  barras de pasos). Es la generalización de `initConceptShots` que
  `CLAUDE.md` §1/§8 dejaba anotada desde "Surtido sin venta".


- **v1.9.20** (este) — documentación + herramienta nueva, sin cambios
  de código en los módulos existentes:
  - `tools/build-evaluacion-gift.mjs` (nuevo): genera un `.gift`
    importable en Moodle a partir de un JSON de datos del curso — 100%
    genérico, no sabe nada de ningún curso puntual. Plantilla real en
    `tools/evaluacion.ejemplo.json` (las 20 preguntas de "Uso de
    Sucursales 3 - NOA").
  - `CLAUDE.md` §7.2 (uso de la herramienta de evaluación) y §7.3
    (checklist de consistencia de diseño — consolida como reglas
    permanentes varios bugs reales encontrados en rondas de revisión:
    unificar headers de popups del menú, "Sonido" mutea todo,
    gate real en el menú lateral, no dejar hitboxes muertos, método de
    medición para overlays, hover en patrones "toda la superficie es
    un botón", y 2 reglas de higiene de archivos — nunca sincronizar
    `curso.js`/`diapositivas.css`/`index.html` a `kit-base/`, nunca 2
    READMEs con nombres casi iguales en un curso).
- **v1.9.19** (este) — 3 cambios de kit:
  - `css/coto-base-addendum-v1.8.css`: `.modal-card.d-wide > .modal-hd`
    suma al mismo degradado unificado que ya tenía `.d-drawer-r` (v1.9.18)
    — un modal centrado (ej. "Mis logros") también puede pedir el mismo
    encabezado que Índice/Glosario/Ayuda sin usar `.modal-hd--dark`.
  - `js/coto-player.js`: el toggle "Sonido" (`initSoundToggle`) ahora
    también sincroniza `.muted` en TODO `<video>` presente en el DOM al
    togglear — antes solo escribía `localStorage`, que ni coto-media.js
    leía.
  - `js/coto-media.js`: los 3 patrones de video (fondo/pop-up/círculo
    inline) ganan el mismo helper `muted()` que ya usan fx.js/coto-ui.js
    y lo aplican antes de cada `.play()` — bug real, "Sonido" no
    silenciaba ningún video del curso, solo los efectos de UI.
  Ver `CLAUDE.md` §6.44, puntos 8 y 9.
- **v1.9.18** (este) — bug real de kit en
  `css/coto-base-addendum-v1.8.css`: el Índice lateral (`.d-sidenav-hd`,
  degradado propio) y los cajones de la derecha Glosario/Ayuda
  (`.modal-hd--dark`, navy sólido) mezclaban 2 estilos de encabezado
  distintos dentro del mismo curso — justo lo que la nota de
  `.modal-hd--dark` (v1.6) ya advertía no hacer. `.modal-card.d-drawer-r
  > .modal-hd` ahora usa el mismo degradado/tipografía del Índice, sin
  tocar `.modal-hd--dark` en sí (otros popups que la usan a propósito,
  como "Mis logros", no cambian). Ver `CLAUDE.md` §6.41.
- **v1.9.17** (este) — bug real de kit en `css/coto-base.css`: el
  anillo de `:focus-visible` genérico (`border-radius:6px`, pensado
  para botones rectangulares) se aplicaba también a `.modal-x` (la ✕
  de cerrar, circular) — un anillo casi cuadrado sobre un botón
  redondo se lee como un recorte/glitch, no como foco. Se notó recién
  después de v1.9.16 (que arregló que la ✕ tuviera foco de verdad al
  abrir el modal — antes ni eso pasaba). `.modal-x:focus-visible{
  border-radius:50%; }` lo alinea al contorno real del botón.

- **v1.9.16** (este) — 3 cambios de kit:
  - **Bug real** en `css/coto-base.css`: `.modal-x` (la ✕ de cerrar
    de cualquier modal) sin `z-index` podía quedar DEBAJO de un hijo
    posterior del modal con `position:relative` (ej. `.d-instr-hd`) —
    dos elementos "positioned" con z-index:auto se apilan por orden de
    DOM, no por lo que se ve "arriba" a simple vista. Confirmado con
    Playwright: la ✕ de "Cómo recorrer el curso" no cerraba.
    `z-index:2` en `.modal-x` lo resuelve para siempre.
  - **Bug real** en `css/coto-base-addendum-v1.8.css`: el círculo
    decorativo `::after` de `.d-instr-modal` estaba centrado sobre la
    esquina REDONDEADA de la tarjeta — un círculo recortado por otro
    arco dibuja un escalón visible, no una curva limpia. Corrido para
    asomar solo por el borde recto.
  - **Feature nueva, opt-in** en `js/coto-media.js`: `initBgVideos`
    reacciona a `[data-autoadvance]` en la diapositiva — al terminar
    el video de fondo, avanza sola a la siguiente (`motor._advance(1)`).
    Pensada para diapositivas de solo-video-y-texto (portada,
    separadores de unidad). Distinta del botón global "Reproducir
    todo" (CLAUDE.md §6.6, sigue sin botón en el DOM) — sin UI nueva,
    por diapositiva, no revive esa función.

- **v1.9.15** (este) — bug real de kit en `css/coto-cierre.css`: el
  confeti del cierre (`#d-confetti,.d-confetti`) tenía `z-index:200`,
  muy por encima de la barra superior del reproductor (`.d-top`,
  z-index:40 en `coto-player-chrome.css`) — las piezas que caen por
  esa franja quedaban visualmente encima de los botones del header,
  tapando su texto (visto en un curso real: una estrella de confeti
  sobre "Ampliar", ilegible). Bajado a 35: le sigue ganando a
  cualquier contenido normal de diapositiva (sin z-index, auto/0) pero
  queda debajo de `.d-top` (40), `.d-resume` (70) y `.d-award-toast`
  (95). Encontrado en una revisión visual general con Playwright, no
  en un reporte puntual del cliente — los 7 tests automatizados no lo
  detectan porque verifican estructura/comportamiento, no
  superposición visual.

- **v1.9.14** (este) — bug real de kit en `css/coto-shot-stage.css`:
  el breakpoint que decide "lienzo fijo 2:1 con letterbox" vs. "llenar
  el frame completo" estaba en aspect-ratio 1.9, pensado como "cerca de
  2:1, margen chico y tolerable". Medido de verdad contra el `.d-stage`
  real (no el viewport crudo), casi ninguna resolución 16:9 común da
  cerca de 2:1 — 1366×768 (la más usada del mundo) da ≈2.11, y todas
  las 16:9/16:10 típicas caen entre 2.0 y 2.15 — así que quedaban con
  letterbox lateral real (30-45px de cada lado), no "chico y
  tolerable". Techo subido de 1.9 a 2.2: cubre 16:9 completo y deja
  solo ultrawide de verdad (21:9+) con el letterbox fijo, que ahí sí
  corresponde. Detalle en CLAUDE.md §6.31.

- **v1.9.13** (este) — bug real de kit en `js/coto-media.js`:
  `initPopupVideos()` dejaba `controls` nativo puesto desde el
  arranque, duplicando visualmente el reproductor ya DIBUJADO en el
  poster de mockup (triángulo de play, barra de progreso, íconos —
  parte de la imagen estática, no clickeables). El play "no funcionaba"
  porque el usuario tocaba el dibujo, no el control real debajo. Fix:
  mismo patrón que ya usaba `initInlineCircleVideos()` para el mismo
  problema — sin `controls` nativo, el video entero es el target de
  clic, `controls` se activa recién en `play` y se resetea al cerrar
  el pop-up. Detalle en CLAUDE.md §6.29.

- **v1.9.12** (este) — causa raíz real de "los pop-ups se ven mal":
  sombra DOBLE (una horneada en el PDF, otra del `--shadow-pop` del
  kit). Con el PDF v2 actualizado (arte sin sombra), se recortaron de
  nuevo las 10 fichas con margen uniforme en vez de "encontrar el
  borde de la tarjeta" — ya no hay borde que encontrar. Detalle en
  CLAUDE.md §6.28.

- **v1.9.11** (este) — ronda de pulido visual sobre el PDF v2, 6
  pedidos puntuales del cliente. Detalle en CLAUDE.md §6.27.
  - **`js/coto-player.js`** (kit): BUG REAL — el botón "Ampliar" no
    cambiaba de texto/title al entrar a pantalla completa, aunque los
    íconos sí. Ahora sincroniza label + title + aria-label con
    `fullscreenchange`.
  - **Hover de burbujas, forma real**: máscaras PNG→WebP por burbuja
    (contorno exacto extraído del PDF, con la "colita" del globo de
    diálogo) en vez de `border-radius` genérico. ~4-5KB cada una.
  - **Minijuego rediseñado para calcar el PDF v2**: HUD con chip
    "¡Aprendé jugando!", 4 tarjetas grises uniformes, corazones
    pixel-art; grilla de 10 reportes con líneas conectoras (mapa tipo
    organigrama) en vez de una grilla suelta.
  - **3 bugs de coordenadas re-medidas contra arte viejo**: video (ya
    corregido en v1.9.10), tildes de progreso y botón "Empecemos" del
    minijuego.

- **v1.9.10** (este) — rebuild completo sobre el PDF v2 del diseñador.
  Detalle en CLAUDE.md §6.26.
  - **`js/motor-slides.js`**: BUG REAL — `_initShots` solo enganchaba
    `load` si la imagen no estaba completa al iniciar, así que cambiar
    el `src` en caliente no re-medía las hitboxes. Ahora el listener va
    siempre.
  - **`css/coto-shot-stage.css`**: la proporción del recorte de ficha
    deja de estar hardcodeada (era un dato del arte de un curso dentro
    de un archivo del kit) y pasa a `--shot-card-ratio`, que cada curso
    declara.

- **v1.9.9** (este) — revisión full a pedido del cliente. Detalle en
  CLAUDE.md §6.24. Lo central:
  - **BUG CRÍTICO**: ningún curso escuchaba `courseend`, así que
    `markCompleted()` no se llamaba nunca y el alumno terminaba el
    curso con `lesson_status = incomplete` en el LMS. Los 6 tests
    estaban en verde porque todos miran el DOM y ninguno miraba al
    LMS.
  - **`tools/tests/scorm-tracking.mjs`** (7º test, nuevo): levanta un
    LMS falso y verifica estado inicial, completado al llegar a
    `data-slide-end`, `lesson_location` y el techo de 4096 de
    `suspend_data`.
  - **`js/scorm-api.js`**: nuevo `setProgressScore()` — nota
    informativa sin tocar `lesson_status`. `setScore()` queda para los
    cursos que SÍ son la evaluación, con el comentario que lo aclara.
  - **Promoción al kit** (lo genérico deja de vivir en el curso):
    `initIndexJumps()` (índice clicable solo hacia lo visitado) y
    `initPopupPrefetch()` (precarga de pop-ups de la diapositiva
    actual) pasan a `coto-ui.js`; `videoUsable()` pasa a
    `coto-media.js` exportado; `.d-shot-hit--indice` a
    `coto-shot-stage.css` y `.d-glossary-sub` al addendum. El próximo
    curso los hereda sin volver a descubrirlos.
  - **`js/coto-media.js`**: el botón ▶ de video de fondo ya no aparece
    cuando la fuente está rota (antes lo mostraba ante cualquier
    rechazo de `play()`); `initPopupVideos` pasa `popId` a
    `seen`/`mark` para poder registrar por id y no por ruta larga.

- **v1.9.8** (este, actualizado) — portada y separadores de unidad
  pasan a video de fondo, más 2 ajustes puntuales. Detalle en
  CLAUDE.md §6.23.
  - **Curso**: `portada`/`unidad1`/`unidad2`/`unidad3` pasan de
    `d-shot-slide--bg-layered` (imagen) a `d-shot-slide--bg-video`
    (`<video>` + poster), igual patrón que "Prevención
    cardiovascular". 4 placeholders nuevos de 0 bytes en `video/`
    (el cliente agrega los archivos reales después, en el zip).
  - **`js/curso.js`**: se agregó la llamada a `initBgVideos()` (ya
    existía en `coto-media.js`, sin uso en ningún curso todavía).
  - **Bug real de kit encontrado por `hitbox-click-check`**:
    `motor-slides.js` → `_initShots` medía SIEMPRE contra
    `.d-shot-img`; la hitbox "Empezar" de la portada quedaba en 0×0
    al no haber imagen (ahora hay video). Fix: `_initShots` también
    soporta `.d-shot-video`, midiendo contra las dimensiones
    naturales del `poster` en vez de `videoWidth/videoHeight` (que
    nunca están disponibles con un placeholder de 0 bytes). Cualquier
    curso que ponga hitboxes sobre una diapositiva de video de fondo
    hereda el fix.
  - **`css/diapositivas.css`**: bug real — faltaba la regla base de
    `.d-instr-cta` (el addendum del kit solo define su `background`);
    el botón "Empezar mi aprendizaje" quedaba sin centrar. Se agregó
    `display:flex;justify-content:center`, igual que en "Prevención
    cardiovascular".
  - **`css/diapositivas.css`**: `.d-u2-tick` un poco más grande
    (`clamp(16px,1.8cqw,26px)` → `clamp(20px,2.3cqw,32px)`), pedido
    puntual del cliente.

- **v1.9.7** (este, actualizado) — ronda de UX/interacción a pedido
  del cliente. Detalle en CLAUDE.md §6.22. Cambios reales:
  - **`assets.css`**: hover de las burbujas pasó de tinte plano a un
    aro de color (mismo patrón `.d-shot-hit--ent` de "Prevención
    cardiovascular", CLAUDE.md §6.10.3), y se agregó `.is-watched`
    (tilde verde al mirar el video, no solo al abrir la ficha).
  - **Ficha de reporte**: vuelve a ser un `[data-popup]` real (no una
    capa) — el cliente pidió que se pueda cerrar tocando el fondo,
    algo que una capa dentro de la diapositiva no puede dar. Mismo
    recorte de "solo la tarjeta" de la vuelta anterior, ahora dentro
    de un `.modal` con backdrop clickeable.
  - **`js/curso.js`**: `initPopupVideos` (ya existía en el kit, sin
    uso) vuelve a usarse; nuevo `estado.videosFicha` +
    `marcarBurbujaVisto()` para la tilde verde.
  - **`img/minijuego-fin.webp`**: se repintó un rectángulo blanco que
    quedaba asomando detrás del botón Continuar/Reintentar (el mask
    original era recto, el botón es una píldora más chica).
  - **`css/coto-cierre.css`**: bug real encontrado — un bloque de
    reglas del resumen de cierre estaba SIN `@media`, duplicando
    (y pisando siempre) el escalón más chico de la escalera de
    compresión por alto de pantalla. Por eso el resumen se veía
    "muy chiquito" en cualquier tamaño de pantalla. Se borró el
    duplicado sin `@media`.
  - **Curso**: el repaso del resumen ahora incluye 1 línea de "para
    qué sirve" por cada uno de los 10 reportes (antes solo el
    nombre), y el resumen ocupa más ancho de pantalla.
  - **Curso**: nueva fila "N de M videos vistos" con tildes
    (`.d-u2-prog`/`.d-u2-tick`, mismo patrón de "Prevención
    cardiovascular") en las 3 diapositivas con burbujas — bug real al
    armarla: faltaba `position:absolute` en `.d-u2-prog`, así que el
    posicionamiento por píxeles de `_initShots` no hacía nada.

- **v1.9.7** (este) — auditoría a pedido del cliente ("sentí que
  muchas cosas nos están quedando mal o faltan") comparando este
  curso contra el código real de "Prevención cardiovascular",
  componente por componente. Detalle en CLAUDE.md §6.21. 4 hallazgos:
  - **`header-boilerplate.html`**: los botones de Glosario/Ayuda/Logros
    traían atributos inventados (`data-open-glossary` etc.) en vez del
    `data-popup-trigger` genérico que ya usa el resto del kit —
    corregidos los 4 atributos, y se borró `initHeaderShortcuts()` de
    `coto-player.js` (dejó de hacer falta: era un parche sobre un
    síntoma, no la corrección real).
  - **Curso**: `.d-sidenav-progress` y `.d-salida-eval` se usan en el
    marcado pero no tenían CSS propio en `diapositivas.css` — quedaban
    con estilo de párrafo por default. Agregadas.
  - **Curso**: `coto-quiz.css`/`coto-quiz.js`/`coto-hotspots.js`
    estaban cargados sin usarse (el minijuego reemplaza a la
    mini-práctica de quiz acá) — sacadas las 3 referencias.
  - **Curso**: chequeo visual recorriendo las 12 diapositivas a mano
    encontró el desajuste "Activos"/"Clavos" (burbuja de Stock del
    sector) que había quedado pendiente de una vuelta anterior —
    corregido el texto horneado en `img/stock-sector.webp`.
  - **Curso**: re-medición de todos los `[data-hit]` importantes
    contra los renders del PDF (no contra memoria/capturas) — 10
    burbujas + botón del minijuego dieron exactos; el botón "Empezar"
    de la portada tenía `data-h` corto (se quedaba ~1.7% de la
    píldora sin responder al toque) — recalculado por el mismo método
    de detección de color que el resto.

- **v1.9.6** (este, actualizado) — sexta vuelta sobre "Uso de
  Sucursales 3 - NOA": la ficha de reporte dejó de ser un `[data-popup]`
  — ahora es una capa más (`[data-layers]`/`[data-panel]`) de la propia
  diapositiva, a pantalla completa, mismo mecanismo que ya usaba el
  minijuego. Se agregó `initLayerVideos()` a `coto-media.js` (pareja de
  `initPopupVideos()`, pero para video dentro de una capa en vez de un
  pop-up — escucha `layerchange`, no `popupclose`). Detalle en
  CLAUDE.md §6.20 punto 6.

- **v1.9.6** (este, actualizado) — quinta vuelta sobre "Uso de
  Sucursales 3 - NOA": el `.webp` de cada ficha dejó de incluir el
  fondo difuminado del PDF (causaba un doble blur visible: el del PDF
  + el del propio `.modal-back` del pop-up) — ahora es un recorte de
  SOLO la tarjeta blanca, con `aspect-ratio` de `.modal-card--shot >
  .d-shot` ajustado a la proporción real del recorte (≈1.805:1, no
  2:1) para que `object-fit:cover` no la deforme. Detalle en
  CLAUDE.md §6.20 punto 5.

- **v1.9.6** (este) — cuarta vuelta sobre "Uso de Sucursales 3 - NOA":
  la ficha de reporte (pop-up con texto + video) se pasó de "recreada
  con CSS" a "captura íntegra de la diapo del PDF + overlay real"
  (video con `poster` real y botón ✕), y se revirtió la animación de
  3 capas de las burbujas azules a la interacción estándar del kit
  (el cliente la había rechazado explícitamente). Detalle completo en
  CLAUDE.md §6.20.
  - **`css/coto-shot-stage.css`**: nueva clase genérica
    `.modal-card--shot` (+ `.modal-card--shot > .d-shot`) — mismo
    patrón `.d-shot-slide--bg-layered` de siempre (captura +
    `[data-hit]`/`[data-place]` posicionados por `_initShots`), ahora
    también usable dentro de un `.modal-card`, para pop-ups cuyo arte
    es una diapositiva completa ya diseñada. Bug real encontrado
    armando esto: reusar el `container-type:size` + `cqw/cqh` del
    lienzo principal sin que el `.modal-card` tuviera un alto propio
    externo colapsaba el `.d-shot` a alto 0 (pop-up vacío) — la
    solución para un contenedor "que sabe encogerse solo" (como
    cualquier `.modal-card`) es más simple: `width:100%` +
    `aspect-ratio:2/1` directo, sin container queries.
  - **`css/assets.css`** (curso): revertida la animación de burbujas
    (pulso idle + hover con `translateY`/`scale` + tap) a la
    interacción estándar del kit (`.d-shot-hit` ya trae tinte en hover
    + aro en foco) — quedó solo el radio medido y el punto `.is-done`.

- **v1.9.5** (este) — auditoría dirigida pieza por pieza sobre "Uso de
  Sucursales 3 - NOA" (índice, glosario, ayuda, logros, resumen de
  cierre) contra "Prevención cardiovascular", más el rediseño del panel
  final del minijuego reusando el arte real del diseñador. Detalle
  completo en CLAUDE.md §6.19. Un solo gap real del kit esta vuelta
  (los otros 4 hallazgos fueron "el kit ya tenía el contrato correcto,
  la sesión anterior no lo usó" — mismo patrón de siempre, §6.17.2):
  - **`css/coto-cierre.css`**: nuevo bloque `.d-summary` +
    `@media print{...}` — el esqueleto genérico que le faltaba al
    resumen imprimible. `initSummaryPrint()` (coto-ui.js) y el botón
    ya existían desde v1.6, pero sin este CSS un curso que los cableaba
    igual terminaba imprimiendo la app en vivo (rota) en vez de la
    hoja de resumen.
  - **`tools/tests/markup-sanity.mjs`**: nuevo atributo de opt-out
    `data-hit-label-visible` para hitboxes con texto REAL visible a
    propósito (un botón reconstruido sobre una zona que el arte dejó
    en blanco, con mensaje condicional — patrón nuevo, ver abajo). Sin
    el opt-out, el test los marcaba como el bug de sr-only-filtrado que
    dio origen al test — falso positivo.
  - **Técnica nueva, documentada para reusar**: cuando un resultado
    tiene que variar (aprobado/a reintentar, etc.) sobre una pantalla
    que el diseñador ya armó en el PDF, no hace falta descartar el
    arte — si las zonas de texto están sobre fondo liso, se pueden
    reexportar en blanco (PIL) y poner HTML real encima con el mismo
    `Motor._initShots`/`[data-place]`/`[data-hit]` de siempre. Mantiene
    el diseño y los personajes originales, solo el texto es dinámico.

- **v1.9.4** (este) — segunda vuelta de "Uso de Sucursales 3 - NOA",
  rehecho de cero con el método de CLAUDE.md §7.1 (kit-base + PDF + zip
  de "Prevención cardiovascular" como referencia). La auditoría módulo
  por módulo del PASO 1 **no encontró diferencias**: v1.9.3 ya tenía
  todo lo de "Prevención cardiovascular" (las ~94 clases `.d-*`
  compartidas coinciden byte a byte, y las 26 funciones genéricas
  siguen 1:1). Los 4 bugs de esta vuelta salieron de **construir** un
  curso con el kit, no de compararlo — detalle completo en CLAUDE.md
  §6.18:
  - **`js/coto-player.js`**: nuevo `initHeaderShortcuts()`. El
    `header-boilerplate.html` traía Glosario, Ayuda y Logros marcados
    con `data-open-glossary`/`data-open-help`/`data-open-badges`, pero
    el motor solo entiende `[data-popup-trigger]` y ningún módulo
    escuchaba esos alias: **3 botones muertos en el header** de
    cualquier curso que copiara el boilerplate como manda el checklist
    §7, sin error en consola. Mismo patrón que los botones invisibles
    de §6.17.
  - **`js/coto-media.js` + `css/coto-media.css`**: nuevo 4º patrón,
    `initPopupVideos()` — video embebido en un pop-up de contenido
    (texto de un lado, video del otro). Existía el reproductor a
    pantalla completa y el video circular, pero un `<video>` común
    dentro de otro pop-up **no lo frenaba nadie** al cerrarlo: seguía
    sonando sobre la diapositiva. Tercera aparición de la misma
    pregunta ("¿quién lo apaga?", §6.10.1). Incluye el
    `aspect-ratio:16/9` que evita el falso "video recortado" con
    placeholders de 0 bytes (§6.14 punto 4).
  - **`header-boilerplate.html`**: suma el `<link rel="icon">` como
    data-URI. Sin él el navegador pide `/favicon.ico` y ese 404 entra
    como "error de consola" en **3 de los 6 tests** — un curso recién
    armado no podía llegar a los 0 fallos que el propio checklist
    exige, por un archivo que en realidad no falta.
  - **`js/coto-cierre.js`**: `medallaDe()` ya no depende del orden del
    array de rangos. Antes devolvía la medalla correcta solo si el
    curso pasaba los niveles de mayor a menor —convención no escrita en
    ningún lado—; con el orden natural (bronce, plata, oro) daba
    **siempre la más baja**, sin error: 150 puntos exactos sobre un
    umbral de plata de 150 mostraban "bronce" y el subtítulo salteaba
    plata. Ahora ordena una copia por umbral antes de decidir.
  - **`js/motor-slides.js`**: nuevo `Motor.prototype.showLayer(el,
    target)`. El hook ya existía (`group._activateLayer`) pero no
    estaba expuesto: un curso que necesitaba cambiar de capa por lógica
    propia (terminó una actividad) tenía que meter un `<button>`
    invisible con `[data-target]` y hacerle `.click()`.
  - **Lección de proceso de esta vuelta**: los 6 tests en verde **no**
    quieren decir "el curso anda". En cualquier curso con gate de
    contenido la suite se frena antes del final (a propósito), así que
    toda la lógica de cierre —medalla, estadísticas, salida— queda del
    otro lado y sin probar. El bug de la medalla apareció recién en un
    recorrido end-to-end escrito a mano que resolvía los gates. Vale
    la pena dejar ese script en el curso.

- **v1.9.3** (este) — auditoría dirigida, función por función, de
  "Prevención cardiovascular" (curso.js completo, 1956 líneas) contra
  los 6 módulos nuevos del kit, a pedido del cliente tras ver el
  resultado de "Uso de Sucursales 3 - NOA" (detalle completo en
  CLAUDE.md §6.17.2). Resultado: la enorme mayoría de las funciones YA
  estaba migrada 1:1 (chrome, media, ui, hotspots, quiz, cierre) — casi
  todo lo hecho en v1.1-v1.9 fue exactamente ese trabajo. Un gap real:
  - **`css/coto-base-addendum-v1.8.css`**: el componente `.d-medalla*`
    seguía siendo la versión VIEJA (caja entera teñida con degradado
    pálido por tier) que el cliente había rechazado explícitamente —
    el rediseño real (badge saturado propio + caja neutra + pop
    elástico/destello al revelar) quedó documentado en CLAUDE.md §6.13
    pero nunca se trajo de vuelta al kit. Reemplazado por la versión
    real de "Prevención cardiovascular".
  - **`js/coto-cierre.js`**: faltaba `revealMedalla()` — sin ella,
    nada dispara `.is-revealing` y la animación nueva del CSS no
    arranca nunca. Agregada y cableada en `mostrarResumen()` junto a
    `animateCertStats`/`shineCertStats`.
  - Verificado con una página de smoke test aislada (solo kit, sin
    curso real): badge oro/plata/bronce con sombra sobre caja neutra,
    igual al diseño aprobado.

- **v1.9.2** — primera prueba real end-to-end del kit: un curso
  nuevo ("Uso de Sucursales 3 - NOA", armado en otra sesión sin acceso
  a este repo, usando los 6 módulos nuevos TAL CUAL como pide §7 del
  checklist) salió, según el cliente, muy por debajo de "Prevención
  cardiovascular". Auditoría lado a lado (zip real entregado vs.
  "Prevención cardiovascular", con Playwright) encontró **2 bugs reales
  en el kit mismo** (detalle completo en CLAUDE.md §6.17) — la
  confirmación de que "Prevención cardiovascular" nunca haber cargado
  estos módulos (§6.10.8) dejó bugs sin forma de aparecer hasta ahora:
  - **`js/coto-player.js`**: `initNarrateToggle()`/`initFullscreen()`
    solo tocaban `btn.hidden` en la rama SIN soporte de API — la rama
    CON soporte (el caso normal) nunca hacía `btn.hidden = false`, así
    que los botones de Locución y Ampliar quedaban invisibles SIEMPRE,
    en cualquier navegador, sin error en consola. Fix: `btn.hidden =
    false` agregado en la rama con soporte de las dos funciones.
    Verificado con Playwright contra el zip real: 0 controles visibles
    antes del fix, ambos funcionando después, mismo HTML.
  - **`css/coto-base.css`**: los 8 `@font-face` apuntaban a
    `url('fonts/Nombre.woff2')` en vez de `url('../fonts/Nombre.woff2')`
    — ruta rota relativa al propio CSS (`css/`), cuando la carpeta real
    está un nivel arriba. El bug no se había notado porque
    `prevencion-cardiovascular/` tiene una copia duplicada accidental
    de las fuentes en `css/fonts/` que "tapaba" la ruta rota sin
    querer. Fix: las 8 rutas corregidas a `../fonts/`.
  - **No son bugs del kit** (aclarado para no confundirlos con los 2 de
    arriba): el chip de logros/puntos y el botón "Glosario" del
    `header-boilerplate.html` no aparecen en el curso nuevo porque no
    tiene sistema de puntaje ni glosario — decisión de contenido válida
    de esa sesión, no algo para "arreglar" acá.
  - **Lección de proceso** (la más importante de esta vuelta): el flujo
    real es kit-base viajando por zip hacia sesiones sin acceso a este
    repo. Esas sesiones pueden encontrar y corregir bugs reales del kit
    en su copia local, pero no tienen forma de devolver el fix a este
    `kit-base/` canónico — queda atrapado en su propio zip hasta que
    alguien lo trae de vuelta a mano. Cuando una sesión de curso nuevo
    reporte "encontré y arreglé un bug del kit", ese fix hay que
    auditarlo y aplicarlo ACÁ explícitamente, no asumir que ya está
    resuelto.

- **v1.9** — tercera vuelta de revisión en vivo de "Prevención
  cardiovascular" (post-entrega). 5 correcciones puntuales, detalle
  completo en CLAUDE.md §6.12:
  - `header-boilerplate.html`: el pop-up "Cómo recorrer el curso" pasa
    de `data-intro-popup` (automático) a `data-gate-popup` (aparece al
    tocar "Siguiente" desde el índice) y se recorta de 2 grillas de
    íconos a 2 párrafos + botón — el detalle de controles ya vive en
    "Ayuda", no hacía falta duplicarlo.
  - `coto-media.js` / `coto-media.css` (`initInlineCircleVideos`): el
    `<video>` circular ahora tiene `opacity:0` salvo mientras
    `.is-playing` — bug real donde, al terminar, el último cuadro
    (negro) quedaba tapando la imagen de base en vez de volver a
    mostrarla. Sumado `currentTime = 0` en `ended`.
  - Lección de diseño (sin código nuevo del kit, documentada para el
    próximo curso que la necesite): una tarjeta que "sigue" al elemento
    activo de un gráfico interactivo no necesita rastrear el mouse —
    alcanza con reusar la dirección/bisectriz que el gráfico ya calcula
    por elemento (mismo patrón `--bx`/`--by` de "torta interactiva") y
    una posición CSS fija por elemento.
  - Lección de diseño: el radio de esquina del `:hover` de un
    `[data-hit]` tiene que medirse contra el radio REAL de la tarjeta/
    forma del arte (PIL, mismo método que CLAUDE.md §3.4), no heredar
    el genérico `--r-sm` de `.d-shot-hit` — si no, el tinte se ve como
    un rectángulo asomando por fuera de las esquinas curvas.
  - Lección de diseño: el pop-up de video puede prescindir de
    `.modal-hd` (solo se ve el video + controles nativos) sin romper la
    regla de cierre consistente — el botón de cerrar solo necesita un
    ancestro `position:relative`, no específicamente un `.modal-hd`.

  Cuarta vuelta de revisión visual sobre el mismo curso, 4 hallazgos
  más (detalle completo en CLAUDE.md §6.13):
  - **`js/narrador.js`**: `speechify()` ahora saca cualquier emoji del
    texto ANTES de narrarlo (`stripEmojis`, `\p{Extended_Pictographic}`
    + indicadores regionales de bandera) — pedido explícito de cliente,
    Web Speech API los lee como su nombre Unicode ("trofeo", etc.),
    ruido que no aporta nada al oído. Nunca toca el texto/alt visible.
  - Bug real de proceso (no del kit en sí, de cómo se lo usa): un curso
    que todavía no migró al addendum v1.8 (ver §6.10.8) y usa una clase
    de ahí igual (`.btn-ic`) se rompe en silencio — sin
    `.btn-ic svg{width:1.1em;height:1.1em}`, un `<svg>` sin tamaño
    propio cae en su default de 300×150px, y el botón (`inline-flex`)
    se infla para contenerlo: un óvalo gigante con un ícono enorme, no
    "sin estilo". Antes de usar una clase del addendum, confirmar que
    el curso realmente cargue esa versión — si no, copiarla al CSS
    propio con un comentario explicando por qué está duplicada.
  - Lección de diseño: seguir la dirección bx/by "matemática" para
    posicionar una tarjeta de datos no alcanza sola — hay que medir en
    píxeles dónde están las etiquetas YA impresas en el arte (mismo
    método PIL de CLAUDE.md §3.4) y mover la tarjeta a un hueco
    realmente libre. A veces la solución más simple es UNA posición
    reusada por los 2-3 elementos de un mismo lado, ya que nunca se
    muestran a la vez.
  - Lección de diseño: el color de un premio (medalla/insignia) va en
    un badge propio alrededor del ícono (tamaño fijo, degradado con
    saturación real, `box-shadow`), no tiñendo toda la tarjeta que lo
    contiene — un degradado muy pálido de fondo completo se lee como
    "gris", no como oro/plata/bronce. El efecto de entrada
    "cinematográfico" se arma con pop elástico (`cubic-bezier` con
    overshoot) + destello radial que se apaga, disparado UNA vez por
    celebración (nunca en loop), respetando `prefers-reduced-motion`.

  Quinta vuelta, la más grande: rediseño del pop-up de arranque + 4
  hallazgos más (detalle completo en CLAUDE.md §6.14):
  - **`header-boilerplate.html` + `coto-base-addendum-v1.8.css`**: el
    pop-up "Cómo recorrer el curso" pasa a una grilla 2x2 de tarjetas
    ícono+texto con acentos decorativos de color en las esquinas
    (`.d-instr-modal`/`.d-instr-hd`/`.d-instr-kicker`/
    `.d-instr-cardgrid`/`.d-instr-card`/`.d-instr-card-ic`), pedido del
    cliente sobre una referencia visual de otro curso. Armado 100% con
    tokens (`--cat`/`--cat-strong`/`--cat-soft`/`--cat-grad`): cambia
    de color de curso a curso solo con `data-cat`.
  - Antes de implementar un rediseño visual grande sobre una
    referencia, mandar preview de imagen de un mockup aislado (mismos
    tokens del kit) y aprobarlo ahí — recién después portarlo al curso
    real. Evita iterar en vivo sobre el curso (con el riesgo de dejarlo
    a medio romper entre vueltas) cuando el pedido todavía está
    cambiando de forma (4 iteraciones de íconos en este caso).
  - **`coto-media.css`**: nueva sección "2. Video rectangular en
    pop-up" — faltaba el CSS de `.modal-card--video`/`.modal-x--video`
    (ya en curso.js/diapositivas.css desde v1.9 anterior, nunca subido
    al kit) y se agrega `aspect-ratio:16/9` al `<video>`. BUG REAL: sin
    eso, un placeholder de video (0 bytes, sin metadata) cae en el alto
    fijo por default del navegador (150px) y se ve "recortado" — se
    reproduce en CUALQUIER pantalla, no solo tablet, aunque el reporte
    real llegó probando en iPad. `aspect-ratio` se retira solo en
    cuanto carga un video real (el navegador prioriza su relación de
    aspecto intrínseca).
  - Bug real de especificidad CSS: dos reglas `:hover` de 1 clase cada
    una, sobre un elemento que hereda AMBAS clases, no "se combinan" —
    gana la que esté más abajo en el archivo, sin importar cuál "tiene
    más sentido". Corregido con un selector combinado
    (`.d-shot-hit--circle.d-shot-hit--video:hover`) que tiene más
    especificidad y gana siempre.
  - **`narrador.js`**: `pickVoice()` detecta tablet
    (`matchMedia('(pointer:coarse)')` + pantalla no-chica, sin
    sniffear user-agent) y ahí prefiere Paulina (es-MX) y después
    Mónica (es-ES) antes de la cadena es-US de siempre — pedido real
    de cliente probando en iPad. Paulina sonaba levemente cortada: se
    le subió el rate a 1.22x (excepción puntual, no una regla general
    — mismo criterio que `isHighQualityVoice`/§6.7).
  - **`tools/tests/scroll-audit.mjs`**: 3 viewports de tablet nuevos
    (iPad horizontal 1024×768, iPad Pro horizontal 1366×1024, iPad
    chico vertical 768×1024) — el bug del video recortado no lo
    agarraba ningún test existente.

  Sexta vuelta, bug real reportado por el cliente en un iPad físico
  (no en ningún test): la barra superior/inferior se veía cortada
  (detalle completo en CLAUDE.md §6.15).
  - **`coto-player-chrome.css`**: `.d-app` suma
    `grid-template-columns: minmax(0,1fr)` — sin eso, la columna
    implícita del grid usa el min-content de sus hijos `flex:none`
    (saludo, botones, grupos de controles) en vez del ancho real del
    contenedor, así que puede crecer más ancha que la ventana. Con
    `body{overflow:hidden}` (a propósito) ese desborde no scrollea:
    directamente queda invisible. Es el fix estándar del bug de CSS
    Grid conocido como "grid blowout".
  - El breakpoint mobile del header (2 filas, ver §6.6) subió de
    850px a 1180px: con el saludo del alumno puesto, el header
    necesita ~1146px en una sola fila — un iPad horizontal de 1024px
    quedaba en el peor lugar posible (ni entraba en una fila, ni
    activaba el layout de 2 filas que lo hubiera resuelto).
  - **`tools/tests/scroll-audit.mjs`**: por qué ningún test lo había
    agarrado — `#d-greet` (el saludo) solo se completa si
    `SCORM.getFirstName()` devuelve algo, y en cualquier corrida
    automática (sin LMS real) esa función siempre da vacío. El header
    se probaba SIEMPRE en su versión más angosta posible, nunca en el
    ancho real que genera un alumno de verdad. El test ahora inyecta
    un saludo con nombre largo antes de medir, y mide
    `.d-top`/`.d-bottom` directamente además del documento completo
    (que `overflow:hidden` en `body` deja ciego a este tipo de
    desborde). Lección general: cualquier UI que dependa de un dato
    que la suite nunca tiene disponible es una zona ciega automática,
    aunque todo dé verde.

  Séptima vuelta: el fix anterior (subir el breakpoint a 1180px)
  eliminó el corte pero dejó al iPad horizontal (1024px) entrando al
  layout de 2 filas — visualmente menos prolijo que el de escritorio,
  reportado directo por el cliente (detalle completo en CLAUDE.md
  §6.16).
  - **`coto-player-chrome.css`**: nuevo nivel intermedio "tablet
    compacta, sigue en 1 fila" (`@media (max-width:1180px) and
    (min-width:800px)`) — oculta el texto de los botones-ícono
    (mismo patrón ya usado para celular en ≤767px), achica gaps y
    los `max-width` del saludo/marca, pero mantiene `display:flex`
    en una sola fila. El breakpoint de 2 filas baja de 1180px a
    `max-width:799px`.
  - El límite de 800px (no 701px, el primer valor probado) salió de
    `scroll-audit`: a 768×1024 el nivel compacto todavía desbordaba
    36px — hay que dejar que ese ancho caiga al layout de 2 filas en
    vez de forzarlo a 1 fila.
  - Lección general: un fix que resuelve "ya no se corta" no resuelve
    automáticamente "se ve como yo esperaba" — son dos preguntas
    distintas, y conviene chequear las dos con el cliente en vez de
    asumir que la primera cubre la segunda.

- **v1.8** — segunda vuelta completa de "Prevención
  cardiovascular", con el curso ya entregado y revisado por el cliente.
  Todo lo de acá salió de uso real, no de teoría.

  **JS nuevo en el kit:**
  - **`coto-hotspots.js`** (nuevo): zonas interactivas sobre el arte que
    revelan información. En el curso este mismo patrón terminó escrito
    CUATRO veces con nombres distintos —sectores de una torta, filas de
    un gráfico de barras, etapas de un proceso, la ilustración de cada
    factor— y las cuatro hubo que arreglarlas por separado. Acá está una
    sola vez, con los 3 disparadores obligatorios (mouse, teclado,
    táctil) y **dos bugs encadenados del toggle ya resueltos**:
    (1) con mouse, el clic cerraba lo que el hover acababa de abrir;
    (2) atarlo a "solo cerrar en táctil" tampoco alcanza, porque un toque
    también sintetiza `mouseenter` antes del `click` y el gesto abría y
    cerraba a la vez. La solución es comparar contra el estado que había
    en `pointerdown`, antes de que empezara la interacción.
  - `coto-ui.js` → **`initTiempoActivo()` / `tiempoActivoMs()`**: el
    tiempo que se le muestra al alumno descuenta lo que duró mirar
    videos. En un curso con 9 videos, la duración del material se lleva
    la mayor parte del número. Los videos en curso se llevan en una
    LISTA y no en un contador: al terminar se disparan `pause` Y `ended`,
    y un contador quedaría en negativo y el reloj no arrancaría más.
    `cmi.core.session_time` no se toca — el estándar lo define como el
    tiempo que el SCO estuvo abierto.
  - `coto-cierre.js` → **`salirDelCurso()`**: el curso se puede cerrar
    de verdad. El botón del pie pasa a "Salir del curso" y sigue
    funcionando después del primer clic (si el alumno vuelve al resumen,
    tiene que poder salir otra vez).
  - `coto-cierre.js` → **`pintarMedalla(puntos, niveles)`**: premio final
    de oro/plata/bronce. El mecanismo es del kit, los umbrales son
    contenido de cada curso.
  - `scorm-api.js` → **`exitCourse()`**: cierra con `cmi.core.exit = ""`
    (salida normal) en vez de `"suspend"`. No es cosmético: al terminar,
    dejar `"suspend"` haría que al reabrir el curso el alumno vuelva al
    bookmark en vez de arrancar limpio.
  - `motor-slides.js` → **`data-intro-popup` se abre cada vez** que se
    entra a la diapositiva (antes, una sola vez por sesión). Queda
    `data-intro-once` para el comportamiento anterior. Y el pop-up
    **"gate" (`data-gate-popup`) se re-arma al entrar**, así que vuelve a
    aparecer si el alumno se va y regresa.
  - `motor-slides.js` → **`[data-place]`**: overlays que tienen que
    quedar registrados con el arte pero NO son interactivos. Antes la
    única forma de posicionar algo contra la imagen era marcarlo
    `[data-hit]`, y eso lo declara accionable: `hitbox-click-check` lo
    marcaba como fallo, con razón.

  **CSS nuevo en el addendum (secciones 10-16):**
  - `.modal--drawer-right` — cajón pegado al borde derecho, para los
    paneles que se abren desde los botones de la derecha de la barra
    (Glosario, Ayuda). Un pop-up centrado no comunica de dónde salió.
  - `.d-hit-ring` — resaltar SOLO el ícono dentro de una hitbox que
    abarca "ícono + etiqueta". Un recuadro sobre toda la zona se ve como
    una tarjeta pegada encima del arte (reportado dos veces por el
    cliente). El aro se dimensiona contra el eje CONSTANTE del grupo.
  - `.d-ticks` — tildes de avance de una unidad. **No navegan y son
    `<span>`**: si no se puede accionar, no debe anunciarse como
    accionable a un lector de pantalla.
  - `.d-steps` — barra de pasos NAVEGABLE dentro de un pop-up. Acá sí
    son `<button>`, porque sí se accionan.
  - `.d-medalla*`, `.d-salida`, `.d-aviso` — parejas de lo de arriba.
  - `coto-media.css` y `.d-shot-hit` en `coto-shot-stage.css`: el CSS
    que faltaba de `coto-media.js` y de `Motor._initShots`.

  **CSS huérfano que seguía en cada curso** (auditoría clase por clase,
  comparando todas las `.d-*` del curso contra las del kit — apareció el
  mismo hueco por CUARTA vez, así que ahora está escrito como regla en
  "Bugs reales" más arriba):
  - **`.d-shot-img`** → `coto-shot-stage.css`. Es LA referencia contra la
    que `_initShots` calcula la posición de cada hitbox (lee su
    `naturalWidth`, su `clientWidth` y su `object-fit` computados). El
    kit calculaba contra un elemento que el kit no definía.
  - **`.d-award-toast` y `.d-resume*`** → `coto-player-chrome.css`,
    parejas de `toast()` e `initResume()` de `coto-player.js`.
  - **`.d-summary*`** (resumen imprimible), **`.d-stat-pop*`**,
    **`.d-pred*`** (pregunta con feedback dentro de un pop-up) y
    **`.d-glossary`/`.d-gloss`** → addendum, secciones 18-21.
  - **`.d-cierre-*`** (layout del resumen de cierre, con los 3 escalones
    de compresión por alto de pantalla) → `coto-cierre.css`.

  Después de esto, lo único que queda en el CSS del curso son instancias
  concretas de patrones que el kit ya tiene (`.d-shot-hit--ent` es un
  `.d-hit-ring`, `.d-u2-tick` un `.d-tick`, `.d-pie-card` un
  `.d-hotspot-card`…) y layout de contenido propio.

  **Componentes de interfaz que salieron de la última revisión:**
  - **`.btn-ic`** (addendum 22) — botón del ancho de su texto, con
    ícono. Los botones de acción de los pop-ups se veían enormes porque
    heredaban el ancho de la tarjeta. Un botón a ancho completo comunica
    "esta es la única salida": bien en un formulario, mal en un pop-up
    que además se cierra con la ✕.
  - **`.d-cta-sticky`** — el llamado a la acción pegado al pie de la
    tarjeta. En el pop-up más largo del curso, el botón quedaba abajo de
    todo y fuera de la vista en pantallas bajas; un botón que hay que ir
    a buscar scrolleando no se usa. Mismo criterio que `.modal-hd`
    sticky, del otro lado.
  - **`header-boilerplate.html`** suma la plantilla completa del pop-up
    **"Cómo recorrer el curso"**, genérica para cualquier curso del
    molde. Corrige un error real: la versión anterior prometía que desde
    el índice se podía "saltar a cualquier diapositiva", falso en todo
    curso con avance bloqueado — el índice sirve para VOLVER a lo ya
    visto. Ver `CLAUDE.md` §6.10.2.1.

  **Tests reforzados** (los dos nacieron de bugs que ninguno atrapaba):
  - `markup-sanity.mjs` verifica que las diapositivas estén DENTRO de
    `.d-app`. Un `</div>` de más no rompe el parseo ni tira error: solo
    saca el resto del documento del contenedor. En el curso real dejó 11
    diapositivas colgando de `<body>` y estiró el pie a toda la pantalla.
  - `scroll-audit.mjs` verifica que el contenido no se RECORTE, además de
    que no haya scroll. Con `.slide-inner` centrado, un contenido más
    alto que la diapositiva no genera scroll: simplemente queda fuera de
    alcance, que es peor. En el curso real el resumen final se cortaba
    170px sin ninguna señal.

  **Todo lo nuevo se validó en aislamiento** (página mínima, solo el kit):
  aro de 140,7px sobre un ícono de 46,9% del alto, tildes en verde/gris,
  medalla resolviendo nivel y "te faltaron N", pantalla de salida, y el
  reloj marcando 0ms durante 600ms de video y 401ms en 400ms sin video.

- **v1.7** — cierre de "Prevención cardiovascular": se terminó
  de vaciar el `curso.js` de todo lo que NO era contenido. Antes de
  esta versión, un curso nuevo copiaba el kit y aun así reescribía a
  mano ~600 líneas de infraestructura (barra superior, videos,
  pop-ups, precarga, sonidos) — cada vez, y cada vez volviendo a
  tropezar con los mismos bugs. Lo que se sumó:
  - **`js/coto-player.js`** (nuevo): todo el chrome del reproductor —
    saludo con el nombre del alumno, toggles de sonido/locución/
    pantalla completa, selector manual de voz, barra de progreso
    arrastrable (con el tope real de arrastre por diapositivas ya
    visitadas), avisos flotantes (`toast`) y banner de "retomá donde
    dejaste". Una sola llamada: `initPlayer({...})`.
  - **`js/coto-media.js`** (nuevo): los 3 patrones de video que
    aparecieron en este curso, los 3 reusables — video de fondo a
    sangre (con el botón de gesto que destraba el autoplay con audio,
    que los navegadores bloquean SIEMPRE en la portada), reproductor en
    pop-up, y el video circular que se reproduce **en el lugar**
    (pedido explícito del cliente: los círculos con la cara del
    especialista no tenían que abrir el pop-up grande).
  - **`js/coto-ui.js`** (nuevo): narración de pop-ups con
    `[data-narrate-only]`, entrada escalonada (`staggerReveal` +
    enganche automático a `popupopen`), números que cuentan de 0 a N,
    precarga de diapositivas vecinas, imprimir el resumen y los
    sonidos de UI (acierto/error/racha/victoria).
  - **`js/narrador.js` → `Narrador.textOf(container)`**: la extracción
    del texto a narrar dejó de ser "el `slideText()` que cada curso se
    escribe" y pasó al kit, con los **4 bugs que cada curso volvía a
    tropezar** ya resueltos adentro (nodos `[hidden]` que
    `textContent` devuelve igual, título de diapositiva que el cliente
    no quiere escuchar, el número de pregunta pegado al enunciado, y
    los números animados leídos a mitad de camino). Extensible por
    curso con `Narrador.addTextSel()`.
  - **`[data-narrate-only]`**: la distinción "narración obligatoria vs.
    opcional" que pide el Manual de Contenido (`CLAUDE.md` §6.5) —
    pendiente desde v1.0 — quedó resuelta **en el marcado**, sin regla
    nueva de código. Caso que la disparó: al ampliar el glosario a 16
    términos, narrarlo entero pasaba de ~50 segundos a más de 3
    minutos; un glosario es material de CONSULTA, no para escuchar de
    corrido. Con el atributo se narra solo la frase de entrada.
  - **`css/coto-media.css`** (nuevo): la pareja CSS de `coto-media.js`.
    Se extrajo junto con él porque el JS solo no alcanza — sin estas
    reglas el video de fondo no cubre el lienzo, el círculo no es un
    círculo y el botón de play no aparece.
  - **`coto-shot-stage.css`** suma `.d-shot-hit` (la pareja CSS de
    `Motor._initShots`): el motor calculaba y aplicaba las coordenadas
    en %, pero las reglas que hacen que eso funcione
    (`position:absolute`, hover, aro de `:focus-visible`) vivían
    copiadas a mano en cada curso. `coto-player-bottom.css` incluso ya
    usaba `.d-shot-hit.d-nudge` sin que `.d-shot-hit` existiera en el
    kit. **Este hueco —"un archivo del kit asume clases que el kit no
    define"— ya apareció 3 veces** (v1.4 `coto-player-bottom.css`, v1.6
    `coto-fx.css`, v1.7 acá): al promover un JS al kit, buscar SIEMPRE
    su CSS y promoverlo en la misma vuelta.
  - **`coto-base.css`** suma la regla de consistencia de encabezados de
    pop-up (las dos variantes no se mezclan dentro de un curso) y la
    advertencia de que `.d-stagger-in` depende de la regla global de
    `prefers-reduced-motion` para no dejar el contenido invisible.
  - **`coto-player-bottom.css`** suma el bloque de gate de avance
    (`.is-gated`/`.d-shake`/`.d-nudge`): el botón "Siguiente" nunca se
    deshabilita con `disabled` (un lector de pantalla dejaría de
    anunciarlo) — se atenúa, tiembla al intentar avanzar, y el hitbox
    pendiente pulsa para guiar la mirada.
  - **`coto-base.css`** suma `.modal-hd{position:sticky}` — sin eso, en
    un pop-up largo (glosario de 16 términos) el título se va con el
    scroll y se pierde el contexto de qué se está leyendo.
  - Los 3 módulos nuevos se validaron **en aislamiento**, cargando solo
    `narrador.js` + el módulo nuevo en una página mínima (mismo método
    que se usó para v1.1): narración acotada, count-up llegando al
    valor final, delays escalonados correctos, pop-up de video excluido
    de la narración, 0 errores de página.
  - **Pendiente honesto**: "Prevención cardiovascular" quedó entregado
    con sus copias inline de estas funciones (son el original del que
    se extrajeron, funcionando y probado end-to-end). El primer curso
    que consuma `coto-player.js`/`coto-media.js`/`coto-ui.js` desde el
    kit va a ser el próximo — si aparece algún ajuste ahí, corregirlo
    **en el kit**, no en el curso.
- **v1.6** — de "Prevención cardiovascular" (2º curso real
  construido con este kit):
  - `coto-base-addendum-v1.8.css` suma 3 componentes nuevos: índice
    lateral con ícono+check por sección (antes un simple punto), pop-up
    "Cómo recorrer el curso" con grilla de accesos rápidos, y pop-up
    "Mis logros" con grilla de tarjetas (bloqueada/desbloqueada).
  - `coto-base.css` suma entrada escalonada (`.d-stagger-in`,
    título→párrafo→elementos) para HTML real (pop-ups, mini-práctica,
    resumen) — a propósito NO se aplica a diapositivas-captura (título
    y texto son la misma imagen ahí, no hay nada que escalonar).
  - `coto-fx.css` (nuevo): CSS que le faltaba a `fx.js` desde v1.0 —
    vivía copiado a mano en el `assets.css` de cada curso.
  - `coto-quiz.js`/`coto-quiz.css` (nuevo): mini-práctica de opción
    múltiple, extraída y parametrizada por callbacks (antes vivía
    entera adentro del `curso.js` de cada curso, reescrita de cero).
  - `coto-cierre.js`/`coto-cierre.css` (nuevo): cierre en 2 pasos +
    confeti + count-up + brillo de medalla, mismo criterio de extracción.
  - `motor-slides.js`: `this.canAdvance`/`this._introShown` ahora se
    declaran explícitos en el constructor (antes funcionaban por *duck
    typing*, sin declarar — el primero es el punto de extensión oficial
    para gates de contenido, ver `_advance()`).
  - `tools/tests/markup-sanity.mjs` (nuevo, 6º test): nace de un bug
    real — un botón de video sin el `>` de cierre pasaba `deep-audit`
    (conservaba nombre accesible) pero rompía el `sr-only` de adentro y
    mostraba el texto en pantalla.
  - `fonts/`: las 4 familias reales (antes no existía esta carpeta en
    el kit; cada curso arrancaba con 404 hasta notarlo).
- **v1.4** — `coto-player-bottom.css` (nuevo): `coto-player-chrome.css`
  ya usaba las clases `.d-bottom`/`.d-nav-btn`/`.d-counter`/
  `.d-progress*` sin definirlas — vivían copiadas a mano en cada curso.
  `coto-base.css` suma `.sr-only` (requerida por `spec-motor-slides.md`
  pero ausente del kit hasta acá) y las reglas base de `.d-stage`/
  `.slide` (container-type, position, anim-l/anim-r) que
  `coto-shot-stage.css` daba por sentadas sin definir.
- **v1.3** — `css/coto-shot-stage.css`: lienzo de diapositivas-
  captura con margen ampliado para tablets. Reporte real probando
  "Surtido sin venta" en tablet: el letterbox del lienzo fijo 2:1 se
  siente peor en un dispositivo real que en la tabla de números.
  Solución: diseñar el PDF con más margen de seguridad a los COSTADOS
  (8% arriba/abajo sin cambio + 13% a cada lado, antes 8% parejo) para
  poder recortar tablets dentro de esa zona ya sabida vacía, en vez de
  mostrar franja vacía. Implementado con CSS Container Query
  (`@container` sobre `.d-stage`, rango de proporción 1.5-1.9) — ver
  `CLAUDE.md` §6.9 para el cálculo completo, incluido un error real de
  la primera pasada (medir la proporción del dispositivo/viewport en
  vez de la del `.d-stage` real, que descuenta el alto de
  header+footer — daba un margen ~2x más grande del necesario).
  **⚠️ NO retroactivo**: solo para cursos diseñados con el margen
  nuevo, desde "Prevención cardiovascular" en adelante — no aplicar a
  "Surtido sin venta" (margen viejo, 8% parejo, recortaría contenido
  real).
- **v1.2** — `js/narrador.js`: la velocidad de narración
  (1.15x) dejó de ser una constante fija. Bug real reportado probando
  "Surtido sin venta" en tablet: la voz de respaldo (sin la voz
  preferida Google es-US disponible) sonaba atropellada a esa
  velocidad — 1.15x se había ajustado y probado SOLO contra esa voz
  puntual. Fix: `isHighQualityVoice(v)` decide el rate por voz
  (1.15x si es de calidad conocida, 1.0x si es de respaldo no
  probada) — ver `CLAUDE.md` §6.7.
- **v1.1** — rediseño completo de la barra superior
  (`css/coto-player-chrome.css` + `header-boilerplate.html`),
  extraído tras encontrar y corregir 5 bugs reales de layout (ver
  `CLAUDE.md` §6.6: centrado matemático vs. real, `display:grid` que
  apila en vez de poner en fila, `justify-content` faltante en botón
  ícono+texto, flex-wrap que no reparte elementos entre líneas aunque
  puedan encogerse, y el fix principal — CSS Grid de 2 columnas
  compartidas entre fila 1 y fila 2 para que el corte quede alineado
  en pantallas angostas). Validado de forma aislada: mismo screenshot
  cargando SOLO `coto-player-chrome.css` + `coto-base.css` + addendum
  + `assets.css` del curso, sin `diapositivas.css`/`pulido.css`.
- **v1.0** — primera extracción formal desde "Surtido sin venta" v2.
  Incluye: motor genérico, narrador genérico, sistema de diseño
  validado contra el manual oficial, spec del motor reconstruida,
  suite de tests + herramienta de verificación de hitboxes.
