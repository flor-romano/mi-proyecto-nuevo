# Surtido sin ventas

Bitácora propia de este curso (decisiones, bugs reales, pendientes) — no se mezcla con `kit-base/CLAUDE.md` (CLAUDE.md §0.1).

Generado con `tools/new-course.mjs` a partir de kit-base v1.9.57.

## Origen

Migrado desde el export SCORM/HTML5 de Articulate Storyline (`tools/import-storyline.mjs`,
CLAUDE.md §7.05). 13 diapositivas, 7 mecánicas (captura íntegra) + 6 a mano
(portada, separador de unidad, conceptos, mini juego, y los 2 pares
video/repaso). Categoría: `salon` (Área Salón). Locución: re-narrada con
TTS (voz recomendada), no se conservó el audio grabado de Storyline —
confirmado con el cliente al arrancar esta migración.

## Ronda 2 — PDF v2 del cliente (arte real, reemplaza las capturas de Storyline)

El cliente mandó `Surtido_sin_venta_Claude_V2.pdf` (19 páginas, 2520×1260 —
2:1 EXACTO) con el diseño real de casi todas las diapositivas, en
reemplazo del arte reconstruido a mano de la primera entrega. Motivo del
cliente: la entrega anterior "arrancaba más chica y se agrandaba" (el
pillarbox de `.d-shot-img--sl` + el Ken Burns del kit sobre una imagen
que no era 2:1 nativo) y "Algunos conceptos importantes"/el mini juego/
los repasos no calcaban el diseño real.

Con el PDF a proporción exacta, el problema de raíz desaparece: `cover`
ya no recorta nada (CLAUDE.md §2 punto 8) y no hace falta pillarbox en
ninguna de estas 18 imágenes. Reemplazadas TODAS las capturas salvo la
intro del mini juego (el PDF no trae esa parte todavía):

- Portada, introducción, índice, separador de unidad 1, "¿Qué es...?",
  "Últimos consejos" y el "¡Felicitaciones!" del cierre: mismo patrón
  de captura íntegra, solo cambió el archivo `.webp`.
- **"Algunos conceptos importantes"**: pasó de HTML reconstruido
  (`.tabs-v`) a captura íntegra real + `data-shot-swap` (8 imágenes: 1
  estado neutro + 7 conceptos, cada pill del PDF es ahora un
  `[data-hit]` real medido en píxeles contra el arte). Es el patrón que
  el propio `CLAUDE.md` ya preveía para este curso (`initConceptShots`,
  §1) — ahora con el arte real que lo justifica.
- **"Cómo hacemos el reporte" / "Qué hacemos con los productos"**:
  pasaron de HTML propio (título + tarjeta armada a mano) a captura
  íntegra del placeholder de video real del cliente + 1 hitbox sobre el
  círculo de play (mismo mecanismo `initVideoPlayer` de antes).
- **Los 2 "Lo que vimos en este video"**: pasaron de tarjetas HTML a
  captura íntegra + 2 hitboxes sobre las tarjetas del PDF.
- Números/textos actualizados para coincidir con el PDF real: Stock
  "6 en góndola + 10 en depósito = 16" (antes 10+6), Falso stock
  "20 en sistema vs. 12 reales" (antes 20 vs. 14), Surtido "totalidad de
  los productos disponibles..." (antes "de distintas clases..."),
  Últimos consejos con el texto nuevo de las 5 tarjetas — todo
  actualizado en `index.html`, `curso.js` (glosario + banco del mini
  juego) y `evaluacion.json`.
- Los botones grises "ANTERIOR"/"SIGUIENTE" horneados en las capturas
  viejas de Storyline no existen en ninguna página del PDF nuevo — se
  fueron solos al reemplazar las imágenes (la navegación real sigue
  siendo la barra inferior del kit, nunca duplicada dentro del arte).

## Ronda 3 — feedback puntual sobre la ronda 2

1. **"Conceptos" volvía a mostrar el último estado visitado, no el
   neutro.** El `<img>` de `data-shot-swap` es un solo elemento que
   persiste entre navegaciones (el motor solo oculta/muestra
   diapositivas, no las recrea) — al volver a entrar a la diapositiva
   se veía la última tarjeta clickeada, no la ilustración neutra de
   cuaderno/lupa/engranaje. Fix en `curso.js`: cada `slidechange` hacia
   "conceptos" llama `shotSwaps.conceptos.go(0, true, true)` — resetea
   SOLO la imagen, nunca el progreso real (`estado.conceptos`, el gate
   sigue satisfecho si ya se completó).
2. **Hover de las tarjetas de "Lo que vimos en este video" no calzaba
   con el recuadro.** El `.d-shot-hit` genérico del kit usa
   `border-radius:8px`; las tarjetas reales del PDF tienen un radio
   mucho mayor. Clase nueva `.d-shot-hit--card` (`diapositivas.css`,
   `border-radius:var(--r-lg)`) aplicada a las 4 tarjetas de repaso.
3. **Contenido y estilo de los 4 pop-ups de repaso.** El cliente mandó
   capturas de referencia con el texto real (más específico que el
   texto genérico de la ronda 2) y un estilo distinto — ícono en
   círculo + título con línea de acento, sin la barra de encabezado
   oscura del kit. Actualizado el texto de "¿Para qué sirve el
   reporte?" y "¿Cómo lo generamos?" con el texto exacto que mandó;
   "¿Qué acciones tomar?" y "¿Cómo mejorar la venta?" tienen el estilo
   nuevo pero el texto viejo — están marcados con un comentario HTML
   (`<!-- ⚠️ Texto pendiente... -->`, arriba de esos dos `data-popup`)
   a la espera del texto real que el cliente todavía tiene que mandar.

## Ronda 4 — mismo problema de hover en "repaso-productos" + texto real de sus 2 pop-ups

El fix de hitbox de la ronda 3 (`.d-shot-hit--card`) estaba bien, pero
las coordenadas `data-l/t/w/h` de "Lo que vimos en este video" (repaso
de "Qué hacemos con los productos") se habían copiado de
`repaso-reporte` asumiendo que las tarjetas caían en el mismo lugar en
ambas páginas del PDF — **no es así**: se remidieron por separado
(mismo criterio que CLAUDE.md §3 punto 4: nunca asumir que un layout
"parecido" tiene las mismas coordenadas, remedir siempre contra el
render real) y quedaron con su propio juego de coordenadas.

Contenido real de los 2 pop-ups de `repaso-productos` (mandado por el
cliente, reemplaza el texto genérico de la ronda 2) — ahora con listas
con viñetas dentro del pop-up (`.d-recap-list`, `diapositivas.css`) en
vez de un párrafo simple, y un bloque "Importante" separado por una
línea punteada.

## Ronda 5 — imagen del cierre en blanco, y referencia real para el mini juego

1. **`img/13-fin-del-curso.webp` (la captura "¡Felicitaciones!") a veces
   quedaba en blanco (ícono de imagen rota).** Causa: tenía
   `loading="lazy"`, pero vive dentro de `.d-cierre-shot`, que
   `coto-cierre.css` mantiene en `display:none` hasta que
   `unlockCierre()` agrega `.unlocked` — un mecanismo de visibilidad
   DISTINTO al `[hidden]` nativo que el motor togglea en cada
   `[data-slide]` (la garantía real detrás de la regla de CLAUDE.md §3
   punto 13). Confirmado contra un curso real ya entregado
   (`seguridadalimentaria_2.zip`, que el cliente mandó como referencia):
   su `.d-cierre-shot > .d-shot-img` NO lleva `loading="lazy"` — es una
   excepción ya conocida en la práctica, que no estaba escrita en
   CLAUDE.md §3.13 todavía (candidato a relayar al chat de kit-base).
   Sacado acá.
2. **No se pudo reproducir el mismo síntoma en "conceptos"** con la
   secuencia completa (clickear los 7, recargar, revisitar) en las
   pruebas automatizadas — puede haber sido una extracción vieja/parcial
   del zip anterior superpuesta con la nueva (mismo tipo de problema que
   la Ronda 1, "no se extrajo el zip completo"). Si se repite después de
   borrar la carpeta extraída vieja y volver a extraer este zip entero,
   avisar con el navegador/dispositivo usado para reproducirlo acá.
3. El cliente mandó el zip completo de un curso real ya entregado
   ("Seguridad alimentaria") como referencia general de terminación —
   se está usando para el rediseño del mini juego (ronda siguiente).

**Pendiente de definir con el cliente (no se tocó a la espera de
confirmación):**
1. El PDF nuevo no trae el mini juego — sigue con la captura vieja de
   Storyline (pillarbox) y el motor de mini-práctica genérico
   (`coto-quiz.js`, preguntas de "¿a qué concepto se refiere...?"). El
   cliente mandó, aparte, una captura de referencia de un mini juego
   con cabecera "Puntos/Nivel/Reglas" — no es de este PDF ni trae el
   contenido de este curso, así que hace falta que confirme si quiere
   ESE armado (cáscara de hotspots de `coto-minijuego.css`, necesita
   arte de escena propio) o solo el estilo de cabecera sobre el
   mecanismo de opción múltiple actual.
2. **Nombre del curso**: el PDF nuevo dice "Surtido sin Venta" (singular)
   en la portada y en el cierre — el resto de la infraestructura del
   curso (marca del header, `imsmanifest.xml`, badges, este mismo
   README) sigue con "Surtido sin ventas" (plural), heredado del título
   del export de Storyline. No se renombró todavía por ser un cambio
   grande y silencioso si no era intencional — confirmar cuál es el
   nombre real antes de tocarlo.

## Ronda 6 — rediseño del mini juego (cáscara de chips, no la mecánica de hotspots)

Sobre el pendiente 1 de la Ronda 5: el cliente mandó, además de la
captura de referencia "Puntos/Nivel/Reglas", el zip completo de
"Seguridad alimentaria" (curso real, ya entregado). Se auditó ese curso
antes de decidir:

- Su mini juego usa `coto-minijuego.css` en su variante completa —
  un banco de opciones tipo "mapa" (`.d-mj-grid`/`.d-mj-opt`) sobre una
  escena ilustrada (`.d-mj-escena`), con hallazgos que se resaltan sobre
  el dibujo (`.d-mj-hotspot`). Esa mecánica necesita arte de escena
  propio del diseñador (una ilustración por situación, con las zonas de
  hallazgo ya definidas) — este curso no lo tiene, y el PDF v2 tampoco
  trae el mini juego.
- La propia captura de referencia que mandó el cliente en la Ronda 2
  mostraba justo el arte de "PLU/EAN" de este curso (`06-conceptos-01-
  plu-ean.webp`) dentro de una pantalla con cabecera de chips — señal
  fuerte de que lo que se busca es el LENGUAJE VISUAL (chips de
  Puntos/Reglas, píldoras), no la mecánica de hotspots en sí.

**Decisión tomada**: mantener el mecanismo de opción múltiple ya
armado (`coto-quiz.js`/`initMiniQuiz`, 10 preguntas del banco real del
curso) — es contenido correcto y ya funciona — y sumarle la cáscara
visual de chips que sí es 100% genérica y ya vive en el kit
(`coto-minijuego.css`, clases `.d-mj-stats`/`.d-mj-stat`/`.d-mj-stat--
pts`/`.d-mj-rules`, cargadas en este curso desde el arranque pero sin
usar). Sin tocar `kit-base/` (CLAUDE.md §0.1): las clases ya estaban
disponibles, solo faltaba el marcado del curso que las invoque.

**Implementado** (`index.html` + `js/curso.js`, sin editar ningún
archivo del kit):
- Barra de 2 chips arriba del quiz, dentro de `.d-mj-play`: **Puntos**
  (`.d-mj-stat--pts`, con el mismo total que el chip `#d-points` del
  header — se sincronizan desde la misma función `award()`) y
  **Reglas** (`.d-mj-rules`, botón que abre un pop-up con las 4 reglas
  del juego).
- Pop-up de reglas con el mismo lenguaje visual que los 4 pop-ups de
  repaso ya construidos en la Ronda 3/4 (`.d-recap-modal`: ícono en
  círculo + título con línea de acento) — se descartó inventar un
  estilo nuevo (CLAUDE.md §6.34: una "excepción de diseño" sin respaldo
  del arte es justo el tipo de cosa que se termina revirtiendo).
- `pintarPuntosMinijuego()` nueva en `curso.js`: sincroniza
  `[data-mj-puntos]` cada vez que `award()` suma puntos, y también al
  arrancar el curso (para que quien retoma una sesión vea su puntaje
  real, no 0).

**No se tocó** la imagen de la intro del mini juego (`07-mini-juego.webp`,
todavía la captura pillarboxeada de Storyline) — el PDF v2 sigue sin
traer arte del mini juego, así que no hay una imagen real para
reemplazarla; sigue funcionando igual que antes (botón "Empecemos"
sobre la captura).

Verificado con Playwright: el chip de Puntos arranca en 0, sube en
vivo al responder bien (y coincide siempre con `#d-points` del header),
el pop-up de Reglas abre/cierra por los 3 mecanismos estándar (✕, Esc,
click afuera), y la suite completa (7/7) + `check-css-duplicates.mjs`
siguen en verde. Baseline de `visual-regress.mjs` regenerada.

## Ronda 7 — "conceptos" ya no se apaga al cambiar de pastilla, y el ícono de "¿Cómo mejorar la venta?" pasa a coincidir con el de la tarjeta

Dos reportes puntuales del cliente, ambos reales:

1. **"Cuando se va de un concepto al otro como que se oculta/apaga la
   pantalla — estaría bueno que los conceptos queden estáticos y solo
   cambie la información de cada uno y su ilustración."** Causa real:
   el fundido corto entre variantes que trae el kit (v1.9.51,
   `initShotSwap`) se aplica a la imagen COMPLETA en cada clic — en
   "conceptos" las 8 variantes son la misma página con una sola pastilla
   resaltada + el panel derecho, así que el fundido de imagen a imagen
   hacía que la columna izquierda (que en los hechos NO cambia entre
   variantes) también se desvaneciera un instante, leyéndose como que
   la pantalla entera "se apaga". Se agregó soporte para un atributo
   nuevo, `data-shot-swap-nofade`, en la copia LOCAL de
   `js/coto-media.js` de este curso (**parche puente, CLAUDE.md §0.1 —
   NO se tocó `kit-base/` desde acá**; queda documentado acá para
   relayarlo al chat de `kit-base/` como candidato genérico: cualquier
   curso con un grupo de swap donde solo cambia una PORCIÓN del arte se
   beneficiaría de poder optar por swap instantáneo en vez del fundido
   completo). Se marcó el `[data-shot-swap="conceptos"]` con ese
   atributo — ahora el cambio de pastilla es instantáneo: sin
   transición visible en la columna izquierda (no hay diferencia de
   píxeles que animar) y cambio inmediato en la derecha, que es
   exactamente lo pedido.
2. **"Cuando se abren los recuadros no tienen el mismo ícono que hay al
   momento de hacer clic"** — con una captura de referencia (una
   etiqueta de precio con "$"). El pop-up "¿Cómo mejorar la venta?"
   (dentro de "Lo que vimos en este video", gestión de productos) tenía
   un ícono de rompecabezas genérico que no correspondía al ícono real
   de esa tarjeta en el arte del cliente. Reemplazado por un ícono de
   etiqueta de precio (mismo estilo de trazo que el resto de los
   íconos del curso — `document`/`reloj`/`check` en los otros 3
   pop-ups de repaso, que sí correspondían y no se tocaron).

Verificado con Playwright: el swap de "conceptos" queda en
`opacity:1` sin la clase `d-shot-img--fade` en ningún punto tras el
clic (antes pasaba por una transición de opacidad); el ícono nuevo de
"¿Cómo mejorar la venta?" renderiza correctamente. Suite completa
(7/7), `check-css-duplicates` sin novedades, baseline de
`visual-regress.mjs` regenerada.

## Ronda 8 — ícono del pop-up "¿Cómo lo generamos?" y rediseño completo del mini juego sobre el PDF real

Dos pedidos puntuales del cliente:

1. **"En el botón interactivo de ¿Cómo lo generamos? hay un ícono de
   engranaje pero cuando lo abrís aparece otro, y deben coincidir."**
   La tarjeta usa un ícono de 2 engranajes; el pop-up `repaso-reporte-2`
   tenía horneado un ícono de reloj (sobrante de una plantilla previa,
   sin relación con el contenido real). Reemplazado por el mismo SVG de
   2 engranajes que la tarjeta — mismo criterio que el ícono de
   etiqueta de precio de la Ronda 7 (los 4 pop-ups de repaso ahora
   coinciden con su tarjeta disparadora).
2. **"El mini juego tiene diez preguntas y no tiene diseño, te paso el
   PDF de cómo debería ser — 5 preguntas y su diseño para reemplazar."**
   El cliente mandó `Juego para curso Salón - N días.pdf` (8 páginas,
   arte real: intro, 5 preguntas con ilustración propia, pantalla de
   éxito y de "a reintentar"). Se auditó contra la Ronda 6, que había
   heredado el banco de 10 preguntas de Storyline sobre `coto-quiz.js`
   sin arte — el pedido ahora es reemplazo completo, no un ajuste
   visual sobre lo existente.

   **Implementado**, interfaz 100% propia del curso (no usa
   `coto-quiz.js`/`initMiniQuiz`, que asume el banco viejo de 10
   preguntas sin arte — se deja de cargar en `index.html`; el archivo
   sigue en el kit por si otro curso lo usa, CLAUDE.md §0.1: no se
   toca):
   - **5 conceptos** (recortados del PDF: PLU/EAN, reporte de surtido,
     mejorar la venta, rotación, EAN), cada uno con su ilustración real
     (`img/mj-*.webp`, recortadas del PDF con PyMuPDF + PIL, todas
     < 32 KB) y 4 opciones (orden aleatorio por partida,
     `Fisher-Yates`).
   - Cáscara visual reusada de `coto-minijuego.css` (chips/píldoras:
     `.d-mj-stats`/`.d-mj-stat`/`.d-mj-opt`/`.d-mj-fb`/`.d-mj-heart`) —
     mismos primitivos que la Ronda 6 ya había activado, esta vez con
     3 vidas (corazones) en vez del intento único, layout de tarjeta +
     4 píldoras en fila (NO la grilla con líneas conectoras de
     `.d-mj-grid`/`.d-mj-hotspot`, que es la mecánica de mapa de otro
     curso — acá es opción múltiple simple, ver comentario en
     `diapositivas.css`).
   - 2 pantallas finales 100% propias (éxito / a reintentar) con
     tarjetas de estadística (aciertos, mejor racha, puntos) — se
     probó primero recortar al personaje del PDF para estas pantallas,
     pero el PNG viene aplanado sin separación de capas entre el
     mascot y la tarjeta de fondo, y el recorte sangraba sobre el
     texto en 2 intentos; se descartó el recorte y se armaron las
     tarjetas limpias en CSS/SVG (ícono en círculo, mismo lenguaje que
     los pop-ups de repaso). **Superado en la Ronda 11**: con el PDF
     re-enviado por el cliente, esas mismas 2 páginas rindieron limpias
     (arte vectorial sobre blanco liso, sin la textura que hacía
     sangrar el recorte antes) — hoy usan las mascotas reales, no la
     aproximación en CSS/SVG. Ver Ronda 11 para el detalle.
   - **Puntaje sin cambiar el total del curso**: 5 × 20 pts por acierto
     + 20 pts de completar = 120, igual al presupuesto viejo (10 × 10 +
     20 = 120) — no hizo falta tocar los umbrales de medalla en
     ninguna otra parte del curso.
   - **Guarda anti-farming** (lección de CLAUDE.md §6.53, aplicada
     desde el diseño): los puntos de acierto se registran por concepto
     en `estado.mjAciertos` (persistido en `suspend_data`, clave `mo`),
     separado del estado en memoria de la partida en curso — reintentar
     el juego después de completarlo no vuelve a sumar puntos por el
     mismo concepto. Reintentos ilimitados si se pierden las 3 vidas
     (mismo criterio que antes).
   - Botón "Continuar" gatea con `motor.canAdvance` (`mjDone`) y avanza
     con `motor._advance(1)` — no cambia el patrón de gate que ya usaba
     esta diapositiva.

   **Verificado con Playwright**: recorrido de acierto, de error (resta
   vida), pantalla de "a reintentar" al llegar a 0 vidas, reinicio
   completo desde ahí, recorrido perfecto (5/5) hasta la pantalla de
   éxito con estadísticas correctas (120 pts en el header), guarda
   anti-farming confirmada (repetir el juego ya completado no vuelve a
   sumar puntos). **Viewport móvil real** (iPhone 12, regla de
   CLAUDE.md §7.3/§6.10.1 — probar interacciones nuevas en touch antes
   de cerrar la ronda): sin overflow horizontal, pero la última fila de
   píldoras (apiladas a ancho completo en `@media (max-width:720px)`)
   quedaba tapada por el fab-stack (engranaje/ayuda, `position:fixed`
   del kit) incluso con el panel scrolleado al máximo — corregido con
   `padding-bottom: 210px` en `.d-mj-play` dentro de esa misma media
   query, verificado de nuevo: las 4 opciones quedan tapables sin
   estorbo. (El banner "Retomar" que se ve superpuesto en la primera
   captura es chrome global del kit — `position:fixed`, se descarta con
   la ✕ —, no algo nuevo de esta ronda; no se tocó.)

Suite completa (7/7), `check-css-duplicates`/`check-image-weight`
siguen en verde. Baseline de `visual-regress.mjs` regenerada (el panel
del mini juego cambió por completo).

## Ronda 9 — el mini juego de la Ronda 8 no calcaba el diseño del PDF: portada sin arte, 3 de 5 ilustraciones mal recortadas, chips con un estilo propio

El cliente mandó capturas reales de su propia prueba (portada, Q1, Q2)
comparadas con el PDF de referencia: la portada no tenía el arte de los
2 mascotas ni la guarda gris de abajo, y en la Q2 ("Control de surtido
sin venta") la tarjeta se veía sin ilustración. Reabrí el PDF de la
Ronda 8 a resolución completa (no solo el recorte que había usado para
cada pregunta) y encontré el problema real:

1. **3 de las 5 ilustraciones recortadas en la Ronda 8 estaban mal
   encuadradas** — `mj-plu-ean.webp` cortaba el globo con el número
   "574027" grande a la mitad; `mj-mejorar-venta.webp` y
   `mj-rotacion.webp` estaban recortadas tan de cerca que solo se veía
   una esquina del carrito/gráfico de barras real (de ahí el reporte
   de "faltan las ilustraciones": no faltaban, estaban ahí pero
   ilegibles). Re-recortadas las 3 desde el PDF a resolución completa,
   con margen generoso alrededor del elemento real (verificadas contra
   el render de cada página, una por una). Las otras 2 (`mj-reporte.
   webp`, `mj-ean.webp`) ya estaban bien encuadradas — no se tocaron.
2. **La portada no reconstruía el diseño del PDF** — la Ronda 8 solo
   había traducido el TEXTO de la intro (kicker, título, tips), no el
   arte: 2 mascotas de COTO a los costados, guirnaldas junto a "mini
   juego", el globo de instrucción como tarjeta blanca, y la guarda
   gris curva de abajo con los 3 íconos. Recorté las 2 mascotas y la
   guirnalda directo del PDF (páginas a resolución completa vía
   PyMuPDF): son arte vectorial plano sobre fondo blanco liso (a
   diferencia de las mascotas de las pantallas finales de la Ronda 8,
   que SÍ se habían descartado por venir aplanadas sobre una tarjeta
   con textura), así que el recorte rectangular con márgenes generosos
   funciona limpio — sin necesidad de una máscara de silueta. Un
   detalle real encontrado al recortar: el PNG de la página trae una
   sombra suave del globo de texto detrás del brazo de cada mascota;
   se filtró con un pase que blanquea cualquier píxel cercano a gris
   puro (`abs(r-g)≤6` etc.) antes de recortar, así la sombra desaparece
   sin tocar los colores reales del dibujo (rojo/piel/azul no son
   grises). La guirnalda si se dejó con canal alfa real (a diferencia
   de las mascotas): no tiene ninguna zona blanca propia que pueda
   confundirse con fondo, así que se pudo pasar a transparencia total
   sin ese riesgo.
3. **Los chips (Concepto/Puntos/Vidas/Reglas) tenían un estilo propio
   de esta sesión, no el del PDF** — la Ronda 8 le había dejado al
   chip de Puntos el fondo dorado que trae `coto-minijuego.css` por
   default (`.d-mj-stat--pts`); el PDF real muestra los 4 chips con el
   mismo fondo gris liso, sin resaltar ninguno. Se dejó de usar esa
   clase modificadora (el chip de Puntos ahora es un `.d-mj-stat` más,
   igual que los otros 3). También se sumó el rótulo "¡Jugá con
   nosotros!" arriba a la izquierda de las 5 pantallas de pregunta —
   en la Ronda 8 solo estaba en la intro, pero el PDF lo repite en
   cada pantalla del juego.

**No se tocó** la lógica de puntaje/vidas/guarda anti-farming de la
Ronda 8 (sigue en 120 pts totales, 3 vidas, reintentos ilimitados) —
este pedido era 100% visual, sobre una mecánica que ya estaba
verificada y funcionando.

**Viewport móvil real** (iPhone 12, regla de CLAUDE.md §7.3/§6.10.1):
el recorte de la guirnalda, hecho por error con fondo blanco opaco en
un primer intento, se veía como un cuadrado blanco feo contra el fondo
celeste de la app en mobile (mucho más notorio ahí que en desktop, por
el contraste con el texto pegado al lado) — se corrigió pasándola a
canal alfa real. La guarda gris de la portada, al ser ahora ancho
completo (`100vw`), dejaba la 3ª pastilla ("Aprendé") tapada por el
fab-stack fijo del kit en ≤480px — corregido con el mismo criterio que
ya se había aplicado a las píldoras de respuesta en la Ronda 8
(reservar hueco a la derecha), más un achique de gap/ícono/tipografía
para que las 3 pastillas sigan entrando en una sola fila con ese hueco.

Suite completa (7/7), `check-css-duplicates`/`check-image-weight`
en verde. Baseline de `visual-regress.mjs` regenerada (portada y las
5 pantallas de pregunta cambiaron visualmente).

## Ronda 10 — la portada seguía sin calcar el PDF: mascotas chicas, con hueco hasta el piso, sobre fondo celeste

El cliente mandó la captura de su propia prueba al lado de la del PDF:
comparadas una al lado de la otra, en la mía las mascotas quedaban
chicas y lejos de la tarjeta, con un hueco entre los pies y la guarda
gris (no "paradas" sobre el piso como en el PDF), y el fondo general
era el celeste (`--bg`) del resto del curso en vez del blanco liso que
usa el PDF en las 7 pantallas del juego. Ajustes sobre lo ya recortado
en la Ronda 9 (no hubo que volver a tocar los assets, era 100% layout):

- `[data-slide="minijuego"] .d-mj { background: var(--surface); }` —
  fondo blanco en las 7 pantallas del juego, pisando el celeste del
  resto del curso (curso propio, no toca `kit-base/`).
- Mascotas más grandes (`clamp(110px, 15cqw, 195px)`, antes tope
  168px) y con menos separación de la tarjeta central (`gap: .6rem`,
  antes `1.2rem`) — más cerca del recorte real del PDF sin llegar a
  taparle texto a la tarjeta (probado un primer intento con margen
  negativo que sí superponía el brazo de la mascota sobre el título;
  se descartó por ilegible y se volvió a un gap chico pero positivo).
- `.d-mj-intro-floor` con `margin-top: -14px` (antes `1.8rem` de
  hueco): los pies de las mascotas ahora pisan la guarda gris, como
  en el PDF, en vez de flotar arriba de ella.
- El rótulo "¡Jugá con nosotros!" pasó de estar centrado dentro del
  bloque de texto a `position: absolute` pegado a la esquina superior
  izquierda real del panel — mismo criterio que ya se había usado para
  las 5 pantallas de pregunta en la Ronda 9, ahora también en la
  intro.

Verificado de nuevo en desktop y en viewport móvil real (iPhone 12):
sin overflow horizontal, la guarda con margen negativo no rompe nada
porque las mascotas se ocultan en mobile (`display:none` por debajo de
760px, ya existía desde la Ronda 9). Suite completa (7/7) y los 2
checks de CSS/imágenes en verde. Baseline de `visual-regress.mjs`
regenerada.

## Ronda 11 — "hacelo TAL CUAL el PDF": pantallas finales reconstruidas con el arte real, no el CSS/SVG genérico de la Ronda 6

El cliente insistió en calcar el PDF al 100% y reenvió el archivo. Al
re-renderizarlo con PyMuPDF a resolución completa (páginas 7 y 8 —
pantallas de éxito y de "a reintentar" — habían quedado sin usar desde
la Ronda 6, cuando se las abandonó por un problema de recorte) el
resultado esta vez fue arte vectorial limpio sobre fondo blanco liso,
sin la textura que había hecho fallar el recorte en su momento. Con
eso resuelto, se reconstruyeron ambas pantallas con el arte real en
vez de la aproximación en CSS/SVG:

- **4 mascotas nuevas** (`mj-fin-ok-male/female.webp`,
  `mj-fin-fail-male/female.webp`) — vincha en vez de casco (distintas
  de las de la portada), sosteniendo trofeo o con cara triste según el
  resultado. Mismo filtro de des-grisado que ya se usó en la Ronda 9
  para la portada (blanquea sombras suaves sin tocar el dibujo), más
  un parche puntual por imagen para tapar fragmentos de texto/ícono
  vecino que quedaban pegados al recorte (la tarjeta de estadísticas
  se superpone parcialmente con la mascota en el PDF, así que un
  rectángulo simple no siempre alcanza — se blanquea a mano la
  esquina exacta donde cae el texto ajeno, verificado que no toca a la
  mascota en esa franja). Un recorte (`mj-fin-fail-female`) salió más
  angosto que el resto por el margen que hubo que dejarle al ícono de
  al lado — con el mismo `width` que las demás mascotas se veía
  desproporcionadamente alta/flaca; se volvió a recortar con más aire
  a los costados para que la relación de aspecto quede pareja.
- **2 insignias nuevas** (`mj-badge-ok.webp` con trofeo dorado sólido,
  `mj-badge-fail.webp` con el mismo trofeo en contorno) — el hexágono
  con destellos que el PDF flota sobre la línea divisoria de la
  tarjeta de estadísticas. Recorte directo, sin retoque: están sobre
  blanco liso.
- **Tarjeta de estadísticas rehecha**: línea divisoria fina con la
  insignia centrada encima (antes no existía esa línea), y los 3
  íconos (objetivo/estrella/check-o-x) pasan de círculo con trazo fino
  sobre fondo wash de categoría a círculo SÓLIDO con ícono blanco
  relleno — colores exactos muestreados del PDF (`#ef9f31` objetivo,
  `#f9b12b` estrella/check/x), no aproximados.
- **Mismo esqueleto que la portada** (Ronda 9/10): mascotas
  desbordando los costados de la tarjeta, paradas sobre la guarda gris
  sin hueco, rótulo "¡Jugá con nosotros!" fijo en la esquina, título
  con guirnaldas alrededor de la palabra clave ("éxito" en verde /
  la frase completa en el caso de fail) — se reusan las mismas clases
  `.d-mj-intro-main`/`.d-mj-intro-mascot`/`.d-mj-intro-floor` de la
  intro en vez de duplicar el layout.

Verificado con Playwright: recorrido completo (5/5 → pantalla de
éxito) y recorrido de 3 errores (→ pantalla de "a reintentar"), ambos
con las 4 mascotas, las 2 insignias y los 6 íconos de stat renderizando
sin artefactos. Viewport móvil real (iPhone 12): sin overflow
horizontal, botón "Continuar"/"Reintentar" verificado clear del
fab-stack tras scrollear al fondo (mismo criterio que las píldoras de
respuesta, Ronda 8/9). Suite completa (7/7), `check-css-duplicates`/
`check-image-weight` en verde. Baseline de `visual-regress.mjs`
regenerada.

## Ronda 12 — el cliente seguía viendo las 5 ilustraciones de pregunta en blanco (mascotas de la portada sí se veían)

Capturas reales del cliente (no del PDF, de SU navegador): portada
perfecta con las 2 mascotas, pero las 5 preguntas mostraban la tarjeta
con el texto y las píldoras bien, sin ninguna ilustración — ni rota,
ni cortada: directamente ausente, como si nunca se hubiera puesto un
`src`.

**Investigación** (no se pudo reproducir localmente): se corrió el
mismo recorrido con Playwright contra el servidor local, contra el
mismo `index.html` abierto como `file://` (simulando doble clic desde
el zip descomprimido), y con captura de errores de consola/red — en
los tres casos las 5 imágenes cargan bien (`naturalWidth` > 0, cero
errores de red o de JS). El código de `renderPregunta()` en `curso.js`
es correcto: `if (imgEl) { imgEl.src = it.img; }` — el único escenario
que explica el síntoma exacto (texto y opciones sí, imagen no, sin
ningún error visible) es que `imgEl` diera `null` en el momento de la
consulta, algo que no se logró provocar en ningún escenario probado.

**Diagnóstico más probable**: caché del navegador. Los 5 nombres de
archivo (`mj-plu-ean.webp`, `mj-reporte.webp`, etc.) se vinieron
reusando sin cambiar desde la Ronda 8, mientras el CONTENIDO cambiaba
ronda a ronda (Ronda 8: recortes rotos: Ronda 9: recorte corregido) —
si el cliente vino probando builds sucesivos sobre la misma carpeta/
pestaña sin refresco forzado, el navegador pudo haber quedado sirviendo
una versión cacheada vieja bajo ese mismo nombre de archivo. Las
mascotas de la portada, en cambio, son archivos nuevos desde la Ronda
9 (nunca existieron con otro contenido bajo ese nombre) — consistente
con que esas SÍ se vean bien.

**Acción tomada, sin esperar confirmación del diagnóstico**: se
renombraron las 14 imágenes propias del mini juego (`img/mj-*.webp` →
`img/mj-*-r11.webp`) y se actualizaron las referencias en `index.html`
y `curso.js`. Esto no cambia ningún contenido visual — es puramente
para que el navegador del cliente pida los archivos bajo un nombre que
nunca vio antes, eliminando cualquier posibilidad de caché vieja de
por medio, sin depender de que confirme el diagnóstico.

Reverificado con Playwright (server local + `file://`) que las 5
imágenes cargan con los nuevos nombres, suite completa (7/7),
`check-css-duplicates`/`check-image-weight` en verde. Baseline de
`visual-regress.mjs` regenerada.

## Ronda 13 — faltaban las manchas decorativas de fondo en portada y pantallas finales

Con las ilustraciones de pregunta ya resueltas (Ronda 12), el cliente
pidió mejorar puntualmente la portada sin tocar el resto. Comparando
de nuevo contra el PDF a resolución completa, la diferencia real: las
2 manchas cálidas grandes que el PDF pone en las esquinas (arriba a la
derecha y abajo a la izquierda) no estaban — la portada quedaba sobre
blanco liso.

Se recortaron ambas manchas directo del PDF (formas orgánicas tipo
blob; más simple recortarlas que calcarlas a mano en CSS) y se
armaron transparentes (son de un solo color plano, sin riesgo de
"agujerear" nada al pasar el blanco a alfa, a diferencia de las
mascotas). Se agregan como fondo de `[data-mj-panel="intro"]`,
`[data-mj-panel="fin-ok"]` y `[data-mj-panel="fin-fail"]` — las 3
pantallas que en el PDF comparten este mismo lenguaje visual de
"personaje + tarjeta" (las 5 de pregunta NO las llevan: ya tienen su
propia decoración, más chica, dentro de la tarjeta).

**Bug real encontrado al implementar**: `z-index:-1` en el pseudo-
elemento de la mancha la mandaba detrás de TODO, incluido el fondo
blanco del panel — no se veía nada. La causa: `.d-mj-panel` tenía
`position:relative` pero ningún `z-index` propio, así que no armaba
su propio contexto de apilamiento y el `z-index:-1` de la mancha se
resolvía contra un ancestro mucho más arriba en el árbol, quedando
detrás del fondo blanco de `.d-mj`. Se agregó `z-index:0` a
`.d-mj-panel` para que sí arme su propio contexto — con eso, la
mancha (z-index:-1 LOCAL) queda por encima del fondo del panel pero
por debajo de todo su contenido real, que es lo que se buscaba.

Verificado que las manchas NO aparecen en las 5 pantallas de pregunta
(selector por `[data-mj-panel]` explícito, no una clase compartida
más amplia). Suite completa (7/7), `check-css-duplicates`/
`check-image-weight` en verde, sin overflow horizontal en viewport
móvil real. Baseline de `visual-regress.mjs` regenerada.

## Decisiones de esta migración

- **Reencuadre 2:1**: en vez de editar las capturas (proporción real
  1.779, la del kit es 2.0), se usa `.d-shot-img--sl { object-fit:
  contain }` en `pulido.css` — pillarbox lateral automático, cero
  recorte de contenido. Es una solución de transición; el rediseño real
  aprovechando el ancho extra de 2:1 necesita que el diseñador vuelva a
  exportar el PDF/arte a la proporción de trabajo (CLAUDE.md §2.6).
- **"Cómo hacemos el reporte" y "Qué hacemos con los productos"**: el
  informe del importador las clasificó como "mecánicas" (sin capas/
  estados), pero ambas capturas tenían el reproductor de Storyline
  horneado adentro (el bug de §6.29). Se rehicieron a mano con el patrón
  de tarjeta + `initVideoPlayer` (reproductor compartido, pop-up
  `video-player`).
- **Videos reales**: el export de Storyline no trae ningún `.mp4`
  (confirmado, igual que en la referencia de §7.05). Los 4 videos del
  curso (`portada`, `unidad1`, `reporte-gescom`, `gestion-productos`)
  están como placeholders de 0 bytes con el nombre final — reemplazar el
  archivo en `video/` sin tocar código. Mientras no estén los reales, el
  botón "Empezar"/"Siguiente" de la barra sigue siendo el disparador
  principal en portada/unidad1 (el auto-avance por `ended` no dispara
  con un placeholder de 0 bytes).
- **"Algunos conceptos importantes"**: en vez de captura + hitboxes, se
  armó con `.tabs-v` real (`[data-layers]`) — el propio addendum del kit
  ya cita esta diapositiva como el caso de uso de ese componente. Gate:
  hay que abrir los 7 conceptos para avanzar.
- **Mini juego**: el juego real de Storyline era "elegí el concepto que
  corresponde a esta definición" (10 preguntas, sin arte propio). En la
  Ronda 8 el cliente mandó un PDF con el diseño real del juego (5
  preguntas con ilustración propia) y se reemplazó por completo: interfaz
  100% propia del curso (`initMiniJuego` en `curso.js`, ya no usa
  `coto-quiz.js`) reusando solo la cáscara de chips/píldoras de
  `coto-minijuego.css` (ver Ronda 8 para el detalle). Gate: hay que
  terminarlo para avanzar.
- **Evaluación Moodle**: `evaluacion.json` + `evaluacion-moodle.xml` (20
  preguntas: 10 opción múltiple + 10 V/F), contenido nuevo (no duplica
  las preguntas del mini juego), cubre el reporte, los 7 conceptos, el
  procedimiento y los últimos consejos.

## Pendiente / a confirmar con el cliente

1. **Videos finales** de portada, unidad 1, "Cómo hacemos el reporte" y
   "Qué hacemos con los productos" — hoy son placeholders de 0 bytes.
2. **Reencuadre real a 2:1** de las 13 capturas si se quiere aprovechar
   el ancho extra en vez del pillarbox actual (requiere que el
   diseñador vuelva a exportar el arte).
3. Revisar el criterio de puntaje/medallas (`curso.js`, umbrales
   oro/plata/bronce sobre 200 puntos posibles) contra lo que el cliente
   espera premiar.

## Parches de kit aplicados sobre la copia LOCAL (no sobre `kit-base/`)

El cliente sumó, ya avanzada la migración, un lote de 5 parches sueltos
(`parches-kit-v1.9.56.zip`, con `LEEME.md`) hechos contra kit-base
**v1.9.56** — una versión anterior a la v1.9.57 que arrancó este curso.
Antes de aplicarlos se verificó cada uno contra el código REAL de
`kit-base/` v1.9.57 (regla de §0.1: nunca aplicar un diff a ciegas) —
**los 5 siguen aplicables**, ninguno estaba ya corregido en v1.9.57:

1. **`js/coto-player.js`** — Esc ahora cierra los popovers "pinned"
   (Sonido/Locución de la barra, Ayuda/Configuración flotantes),
   incluido el caso con foco adentro (slider, acordeón). Antes solo
   cerraban con clic afuera o al cambiar de diapositiva. Verificado con
   Playwright sobre este curso: abre con clic, cierra con Esc.
2. **`tools/tests/markup-sanity.mjs`** — nuevo bloque que detecta ids
   duplicados (`getElementById` toma el primero; el resto queda visible
   pero muerto). Corrido sobre este curso: 0 duplicados.
3. **`header-boilerplate.html`** — solo un comentario nuevo (checklist
   de qué sacar al migrar un curso viejo, con drawer de Ayuda, al
   fab-stack). No afecta el runtime — este curso arrancó directo con el
   fab-stack, sin drawer viejo que migrar.
4. **`js/coto-media.js`** — guard en `initPopupVideos` para que el
   video no se quede "trabado" tras pausarlo (el clic del toggle propio
   competía con los controles nativos). Este curso no usa
   `initPopupVideos` (usa `initVideoPlayer`, el reproductor compartido
   en pop-up), así que no cambia nada visible acá, pero la copia local
   ya no arrastra el bug si algún día se suma ese patrón.
5. **`js/motor-slides.js`** — `closePopup()` ahora resincroniza el gate
   visual (`.is-gated` del botón "Siguiente") al cerrar con Esc, no solo
   con clic. Relevante para "Lo que vimos en este video" (repaso-reporte/
   repaso-productos): si el alumno cierra la última tarjeta con Esc en
   vez de con "Entendido", el botón ya no queda mostrándose bloqueado de
   más.

Suite completa (7/7) y `check-image-weight`/`check-css-duplicates`/
`check-raw-cat-colors` corridos de nuevo después de aplicar — todo en
verde.

**Esto es un parche puente de esta sesión de curso, no la fuente de
verdad** (CLAUDE.md §0.1): los 5 parches (ya verificados acá contra el
código real de v1.9.57) tienen que llevarse, en un prompt, al chat
dedicado a `kit-base/` para aplicarse ahí de forma definitiva y salir en
el próximo `kit-base.zip` — si no, el próximo curso vuelve a arrancar
con estos mismos 5 bugs.

## Hallazgos genéricos a relayar al chat de `kit-base/` (CLAUDE.md §0.1)

**No se corrigieron acá** — son síntoma + diagnóstico para verificar
contra el código real del kit en el chat dedicado, nunca un fix ya
aplicado (regla de §0.1):

1. **El clasificador mecánica/interactiva de `import-storyline.mjs` no
   detecta un reproductor de video horneado en la captura** — solo
   cuenta capas/estados de Storyline. Dos diapositivas de este curso
   ("Cómo hacemos el reporte", "Qué hacemos con los productos") salieron
   como "mecánica" en `INFORME-IMPORT.md` pese a tener el reproductor de
   Storyline dibujado adentro de la imagen (el bug de §6.29) — se
   detectó recién mirando la captura a ojo. Síntoma para el próximo
   curso migrado: no confiar ciegamente en "mecánica" cuando el texto
   extraído de esa diapositiva menciona "video" — revisar la imagen.
2. **`verify-hitboxes.mjs` no puede recorrer un curso con el índice
   lateral bloqueado hacia adelante** (`.d-sidenav-item:disabled` en
   diapositivas no vistas, el patrón que ya documenta
   `coto-base-addendum-v1.8.css` sección 8). Navega clickeando
   `[data-goto]` del sidenav — en un curso gateado esos botones están
   `disabled` y el click es un no-op silencioso: el script sigue
   "sacando capturas" pero todas quedan iguales a la última diapositiva
   alcanzable, con el nombre de la diapositiva pedida. `visual-regress.mjs`
   ya resuelve el mismo problema llamando `motor.go(i, true)`
   directamente (bypassea gates a propósito, mismo criterio que
   `?review=1`) — `verify-hitboxes.mjs` podría usar el mismo mecanismo.
3. **`coto-minijuego.css`: `.d-mj-shot`/`.d-mj-fin` no tienen altura
   propia.** Son `display:block` sin `height`, dentro de `.d-mj-panel`
   (que sí mide `height:100%`) — un bloque no hereda el alto de su
   padre solo por estar dentro de un contenedor con `height:100%`, así
   que `.d-mj-shot` colapsa a `height:auto` (0, porque todo su
   contenido depende de `cqh`, que a su vez depende de que `.d-mj-shot`
   YA tenga una altura resuelta). Resultado: el `.d-shot`/`.d-shot-img`/
   cualquier `[data-hit]` de las capas intro/fin del minijuego quedan en
   0×0 hasta que algo de afuera les da altura explícita — encontrado con
   `verify-hitboxes.mjs` en la intro de este mini juego (el hitbox de
   "¡Empecemos!" medía 0×0). Parche local aplicado en su momento en
   `css/diapositivas.css` (`.d-mj-shot, .d-mj-fin { height: 100%; }`) —
   ya no está: la Ronda 8 reemplazó por completo la interfaz del mini
   juego y esas clases (`.d-mj-shot`/`.d-mj-fin`, del patrón de imagen
   capturada) ya no se usan en este curso. El diagnóstico del bug de
   `coto-minijuego.css` en sí sigue vigente para relayar — no se
   corrigió en el kit, este curso simplemente dejó de ejercitarlo.
