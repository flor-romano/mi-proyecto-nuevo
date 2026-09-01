# Seguridad alimentaria — bitácora del curso

Curso SCORM 1.2 (un solo SCO) del molde Área Aprendizaje, armado desde
`kit-base` v1.9.21 + el PDF de Illustrator + los pop-ups exportados
aparte por el diseñador.

- **Área / categoría:** Control de Calidad (`data-cat="control-de-calidad"`).
- **PDF de origen:** 49 páginas, 2520×1260 exacto (2:1) en todas.
- **Diapositivas:** 26.
- **Evaluación:** aparte, en Moodle (`evaluacion-seguridad-alimentaria.gift`).

---

## 1. De 49 páginas a 26 diapositivas

El PDF trae más páginas que diapositivas a propósito: varias son
estados de una misma pantalla. El mapeo:

| Diapositiva | Página(s) del PDF | Qué es |
|---|---|---|
| portada | 1 | captura + hitbox sobre el "Empezar" dibujado |
| introduccion | 2 | captura |
| objetivos | 3 | captura |
| indice | 4 | captura (informativa, sin hitboxes) + gate del instructivo |
| unidad1 | 5 | separador |
| inocuidad | 6 | captura |
| riesgo | 7 | captura |
| **alteracion** | **8 + 9** | 2 estados de la misma página: zona sobre la carne |
| **contaminacion** | **10** (+ pop-ups 11, 12, 13) | 3 tarjetas → los 3 pop-ups que exportaste aparte |
| **contaminan** | **14, 15, 16, 17** | 4 pestañas |
| resumen1 | 18 | captura |
| unidad2 | 19 | separador |
| seguridad | 20 | captura |
| **malas** | **21 a 25** | carrusel de 5 |
| **buenas** | **26 a 29** | carrusel de 4 |
| **limpieza** | **30** (+ pop-ups 31, 32) | 2 tarjetas → los 2 pop-ups exportados |
| proceso | 33 | captura + `<video>` real sobre el mockup dibujado |
| resumen2 | 34 | captura |
| unidad3 | 35 | separador |
| envasado | 36 | captura |
| temperatura | 37 | captura |
| **rotacion** | **38 a 41** | 4 pasos, con la barra dibujada como navegación |
| resumen3 | 42 | captura |
| **minijuego** | **43, 44, 46, 47** (+ pop-up 45) | 3 capas: intro / juego / resultado |
| consejos | 48 | captura |
| cierre | 49 | captura + resumen final |

**21 de las 26 diapositivas son la página del PDF entera, sin tocar.**
Lo único recreado en HTML/CSS es la capa de JUEGO del minijuego,
porque su contenido cambia con la partida y no puede estar horneado.

---

## 2. Los pop-ups del diseñador, tal cual

Los 6 archivos del zip `Pop up/` se usan **sin recortar ni recrear**:
son PNG con alfa real, a resolución nativa, con su ✕ (o su botón
"Continuar") ya dibujados. Van montados sobre `.modal-card--art`, una
clase nueva del kit: tarjeta **transparente y sin sombra propia**,
porque la sombra ya viene en el alfa del archivo y sumarle la del kit
da las dos sombras desalineadas que costaron 6 vueltas de feedback en
el curso anterior (CLAUDE.md §6.28).

Lo único real encima de cada imagen es la hitbox invisible sobre la ✕
dibujada, **medida en píxeles sobre cada archivo** (detección del blob
oscuro del glifo + bounding box).

---

## 3. Interacciones y de dónde salen sus coordenadas

Ningún hitbox está puesto a ojo. Todos se midieron por detección de
color + bounding box sobre el render de 2520×1260 (CLAUDE.md §3.4):

| Interacción | Medición |
|---|---|
| "Empezar" (portada) | píldora `#046E9F`: x 1891–2188, y 1012–1113 |
| Carne (alteración) | bounding box del corte dibujado, hitbox elíptica |
| 3 tarjetas de peligro | tarjeta blanca sola (sin el círculo que sobresale): y 666–969 |
| 4 pestañas | por color de cada pestaña: x 794/1039/1284/1529, ancho 244 |
| Flechas de carrusel | círculo `#1EA9DC` de 66 px, hitbox de 84 px centrada (área táctil) |
| 2 tarjetas de limpieza | y 545–793, x 462–1071 y 1449–2058 |
| Video del proceso | rectángulo gris del mockup: x 1388–2131, y 414–845 |
| 4 tramos de la barra | barra x 960–1559, 4 tramos de 150 px |
| "¡Empecemos!" (minijuego) | píldora `#50BDE6`: x 1102–1419, y 788–873 |
| Botón del panel final | píldora: x 1108–1411, y 1036–1117 |
| ✕ de cada pop-up | glifo oscuro de 42×43 px, hitbox de 68 px centrada |

Verificado además con overlay (`tools/verify-hitboxes.mjs`) mirando las
26 diapositivas una por una.

---

## 4. Gamificación (obligatoria, CLAUDE.md §6.17.1)

- **Puntos y logros** en el chip del header, con 5 logros reales.
- **Glosario** de 24 términos propios del contenido + los 3 peligros.
- **Práctica**: el mini juego del PDF (encontrar 6 cosas mal en una
  imagen) es la instancia de práctica del curso — ver punto 6.
- **Todas las interacciones suman puntos de verdad**, no son trámite.

Puntaje máximo alcanzable: **445** (incluye el repaso rápido, que no
gatea). Piso asegurado de quien termina (el gate exige recorrer todo y
aprobar el juego con 4 de 6 hallazgos, el repaso no cuenta porque no
es obligatorio): **305**. De ahí salen los umbrales de medalla —
bronce 305, plata 350, oro 395 — calculados, no elegidos a ojo
(§6.10.6, recalculados al pasar el mini juego de 5 a 6 hallazgos, ver
punto 6 más abajo).

---

## 5. Avance bloqueado por contenido (gate)

La barra queda bloqueada hasta completar:

| Diapositiva | Qué exige |
|---|---|
| alteracion | mirar la carne alterada |
| contaminacion | abrir los 3 peligros |
| contaminan | recorrer las 4 vías |
| malas | ver las 5 conductas |
| buenas | ver las 4 prácticas |
| limpieza | abrir las 2 fichas |
| proceso | mirar el video *(ver punto 7)* |
| rotacion | recorrer los 4 pasos |
| minijuego | encontrar al menos 4 de 6 |

El menú lateral (☰) tampoco deja saltar a una diapositiva no vista
(§7.3 punto 3): sin eso, cualquiera abriría el índice y saltaría al
cierre sin cumplir ningún gate.

---

## 6. Decisiones que se apartan del brief (o que hay que confirmar)

1. **Las 6 respuestas correctas del mini juego** (originalmente 5,
   interpretadas mirando la ilustración): contaminación cruzada (carne
   cruda y ensalada en la misma mesada), plagas (la mosca en la
   pared), mala higiene del ambiente (la mancha en la mesada), malas
   prácticas con alimentos (barbijo debajo de la nariz, alimentos
   descubiertos), toca los alimentos (manos descubiertas sobre la
   ensalada) y **producto alterado** (agregada en una ronda de
   feedback: el cliente notó, con razón, que una de las dos piezas de
   carne de la ilustración se ve de un color distinto a la otra — un
   signo real de alteración que "Producto alterado" describía y el
   juego marcaba como trampa. Se prefirió corregir la opción del juego
   antes que retocar el dibujo del diseñador). `MJ_TOTAL` pasó de 5 a
   6 y `MJ_APROBAR` de 3 a 4 (misma proporción ~65%), con los
   umbrales de medalla recalculados en consecuencia (CLAUDE.md
   §6.10.6). Cambiarlo es editar `MJ_OPCIONES` en `curso.js` (campo
   `ok`) y su texto de retroalimentación en `MJ_FB`.
2. **El botón del panel final dice "Continuar" cuando aprobás**
   (confirmado con el cliente). El PDF dibuja "Reintentar" en las DOS
   artes de cierre, también en la de aprobado, así que el botón es
   HTML real repintado con la misma forma, tamaño y colores medidos
   sobre el arte (relleno `#50BDE6`, trazo `#046E9F` de 3px, píldora
   x 1105–1414 / y 1033–1120) — cubre el dibujado sin blanquear nada.
   No se blanquea a propósito: un rectángulo blanco sobre una píldora
   redondeada deja las esquinas asomando (CLAUDE.md §6.22 punto 5) y
   acá el botón cae justo sobre el borde entre el fondo blanco y el
   piso gris del dibujo, así que no hay un color único con el que
   taparlo. "Continuar" avanza a "Últimos consejos"; "Reintentar"
   reinicia la partida.
3. **Puntaje interno del juego**: arranca en 1000 (el número del arte)
   y suma 800 por hallazgo — el 5000 que muestra el PDF correspondía a
   5/5, la cantidad original de hallazgos (ver más abajo, "Producto
   alterado" pasó de trampa a hallazgo real: ahora son 6, y una
   partida perfecta da 5800, ya no coincide con el número del arte,
   que queda como referencia histórica del diseño). Cada error
   descuenta 150. El "1150" de la página 47 no sale de ninguna
   fórmula consistente con el 5000, así que se tomó como un número de
   maqueta.
4. **La práctica del curso es el mini juego**, no un quiz aparte: el
   PDF no trae página de práctica y el juego cumple la misma función
   (mismo criterio que "Uso de Sucursales 3 - NOA"). Si se quiere
   además una mini-práctica de 3-5 preguntas, se arma con `coto-quiz.js`
   del kit.
5. **Ícono de marca del header**: placeholder tomado del propio PDF
   (el sello de calidad de la página 2), recortado con alfa. Se
   reemplaza el archivo `img/icono-control-calidad.webp` sin tocar
   código cuando llegue el definitivo.
6. **Teléfono en vertical (portrait): el lienzo de la diapositiva se ve
   como una franja angosta, con mucho espacio vacío arriba y abajo.**
   No es un bug de esta vuelta ni de ninguna anterior — es la
   consecuencia esperada del lienzo fijo 2:1 (CLAUDE.md §2.6/§6.9)
   en una proporción de pantalla muy lejos de esa relación, y el molde
   entero está pensado para desktop/tablet (nunca se probó ni se pidió
   soporte para teléfono en vertical). Se dejó documentado en vez de
   "arreglado" porque la corrección real (¿pedir que roten el
   teléfono? ¿ampliar cuánto se permite recortar en proporciones muy
   angostas?) es una decisión de producto — a confirmar con el cliente
   si en algún momento importa el uso desde el celular en mano.

---

## 7. Pendientes del cliente

- **El video** `video/Proceso de limpieza y desinfeccion.mp4` es un
  placeholder de 0 bytes: hay que reemplazar el archivo con ese nombre
  exacto, sin tocar código. Mientras tanto el gate **degrada, no
  traba** (§6.24): no exige el video porque detecta que la fuente no se
  puede reproducir, y empieza a exigirlo solo cuando el archivo real
  esté en su lugar.

---

## 8. Inconsistencias encontradas en el PDF (menores, no bloquean)

- La página 45 (pop-up de reglas) muestra el cartel **"¡Jugá con
  nosotros!"** mientras las páginas 43, 44, 46 y 47 usan **"¡Aprendé
  jugando!"**. Se usó "¡Aprendé jugando!" por mayoría.
- La página 46 (resultado con éxito) tiene el botón **"Reintentar"**,
  igual que la de fracaso — ver punto 6.2.

---

## 9. Bugs reales corregidos en el kit durante este curso

Los 8 están detallados en `kit-base/CLAUDE.md` §6.45. Resumen:

1. `medallaDe()` daba una medalla de consuelo por debajo del umbral más
   bajo, y el subtítulo decía "te faltaron N para esa misma medalla".
2. `pintarMedalla()` buscaba el próximo nivel sin ordenar el array.
3. `coto-cierre.css` estilaba `.d-cert-stats` solo dentro de sus media
   queries y dejaba la regla base a cada curso.
4. El ancho del resumen de cierre (1680px/96%) nunca había vuelto al kit.
5. `.d-sidenav-progress`, `.d-salida-eval`, `.d-instr-cta` y las tildes
   `.d-u2-*` estaban en el contrato del kit pero sin CSS en el kit.
6. `initInlineCircleVideos` no soportaba el caso "el arte ya dibuja el
   reproductor" (el fix de §6.29 solo existía para pop-ups).
7. Faltaba `.modal-card--art` para pop-ups exportados con alfa.
8. Faltaba `initShotSwap`: la generalización de "pestañas que cambian
   la captura entera", pendiente desde "Surtido sin venta".

Además se subió al kit `coto-minijuego.css`, la cáscara visual del mini
juego, extraída del `diapositivas.css` de "Uso de Sucursales 3 - NOA"
con sus 8 correcciones de layout ya adentro.

**Segunda ronda de bugs de kit** (detalle completo en `kit-base/CLAUDE.md`
§6.49-§6.51):

9. Reproductor de video (`initInlineCircleVideos`): la pausa con
   controles nativos entraba en carrera con el toggle propio del kit
   (audio seguía sonando con la carátula de vuelta), y el botón de
   play quedaba ovalado por el padding por default del `<button>`.
10. Minijuego: `.d-mj-grid` con `align-items:stretch` estiraba las
    píldoras cortas cuando una vecina larga pasaba a 2 líneas.
11. Barra de progreso del curso: `motor.maxVisited` no se recalculaba
    desde `estado.vistas` restaurado al recargar la página — perdía la
    memoria de sesiones anteriores (fix en `curso.js`, lección
    agregada al checklist de arranque del kit).
12. `initShotSwap` sumó arrastre real para grupos `.d-shot-hit--paso`
    (antes solo clic por tramo) — bug real de kit encontrado en el
    camino: el arrastre se cortaba solo por el drag nativo del
    navegador sobre la imagen de fondo (`preventDefault()` lo resuelve).

**Tercera ronda** (detalle completo en `kit-base/CLAUDE.md` §6.52):

13. Glosario interactivo: cada término navega a la diapositiva donde se
    explica (vía `data-goto`, que el motor ya cablea) y se desbloquea
    (nombre + candado → definición real) al llegar a esa diapositiva —
    reusa `estado.vistas` que ya restaura entre sesiones, sin estado
    nuevo. Nuevo `initGlossaryUnlock()` en el kit (`js/coto-ui.js`) +
    CSS pareja en el addendum; `initGlossarySearch()` se ajustó para
    excluir de los resultados a los términos todavía bloqueados.

**Bug real de ESTE curso (no del kit), encontrado auditando el sistema
de puntos a pedido del cliente:**

14. El minijuego premiaba cada hallazgo (30 puntos) sin ningún control
    de "¿ya lo premié antes?" — a diferencia de TODOS los demás puntos
    del curso (peligros, vías, prácticas, video, repaso), que sí
    revisan un flag persistido antes de sumar. Como el curso permite
    reintentar el minijuego sin límite ("las veces que quieras"), cada
    reintento volvía a sumar puntos por los mismos hallazgos —
    rompiendo el techo de 445 puntos y los 3 umbrales de medalla
    (bastaba reintentar 1-2 veces para sacar oro sin haber recorrido el
    resto del curso). Fix: nuevo `estado.juegoAciertos` (persistido,
    igual que `estado.peligros`/`estado.swaps`) — cada hallazgo puntúa
    una sola vez en toda la vida del curso, sin importar cuántos
    intentos hagan falta para encontrarlo. Verificado con un test nuevo
    (`tools/tests/check-minijuego-puntos.mjs`): encontrar 2 hallazgos,
    perder, reintentar y volver a tocar esos mismos 2 ya no suma nada;
    un hallazgo nuevo sigue sumando normal.

    Con el fix, el resto del sistema de puntos/medallas se auditó
    completo y está sano: el piso garantizado de quien completa el gate
    (305) coincide EXACTO con el umbral de bronce (nadie que termine el
    curso se queda sin medalla), y los 3 umbrales (305/350/395) quedan
    espaciados en incrementos parejos de 45-50 puntos dentro del rango
    de 140 puntos "extra" que da el minijuego completo + el repaso
    rápido opcional.

**Pedido puntual, mismo momento**: el botón de pantalla completa pasó
de "Contraer" a "Reducir" (empareja mejor con "Ampliar", mismo verbo de
acción, sin el matiz de "encoger una forma" que tenía "contraer") —
cambio de kit (`js/coto-player.js`), sincronizado.

**Revisión de locuciones a pedido del cliente** (detalle completo en
`kit-base/CLAUDE.md` §6.54, cambios de kit — `js/narrador.js` +
`js/coto-media.js`, sincronizados):

15. Bug real: las 4 diapositivas de video de fondo (portada + 3
    separadores de unidad) narraban su párrafo de `.sr-only` AL MISMO
    TIEMPO que el video reproducía su propio audio — nada las excluía
    de la narración automática, a pesar de que la regla ya documentada
    dice que una diapo que ES un video no se narra. Fix a la raíz en
    `textOf()` (kit): ahora excluye por completo cualquier
    `.d-shot-slide--bg-video`. Verificado con un test nuevo
    (`check-narracion-video.mjs`) que confirma silencio en las 4 y
    narración normal en el resto, con un spy real sobre
    `speechSynthesis.speak()`.
16. Pedido de producto: la voz preferida (fuera de tablet) pasa a ser
    argentina/latinoamericana (es-AR → es-419) antes que la Google
    es-US de siempre — que queda como respaldo, no como default. Sin
    voces hardcodeadas por navegador (el catálogo depende del paquete
    de idioma de cada dispositivo). El caso tablet (Paulina/Mónica, ya
    probado en un iPad real) no se tocó.
17. Pedido de producto: el título horneado en el arte de cada
    diapositiva (la píldora, ej. "Alteración") es el mismo texto que
    el `<h2>` de accesibilidad — y ahora SÍ se narra antes del cuerpo,
    a diferencia del default del kit (que lo excluye por una decisión
    de otro cliente). Se activa con una línea nueva en `curso.js`
    (`Narrador.setNarrateTitles(true)`) — el kit no cambió su
    comportamiento por default para ningún otro curso. El glosario
    queda afuera a propósito (sigue narrando solo la frase de
    entrada). Verificado con `check-narracion-titulos.mjs`.
18. Bug real de KIT (no de este curso): la grilla de 3 tips de "Ayuda"
    (Tarjetas y flechas / Video / Mini juego) quedaba muda en
    CUALQUIER curso que use el panel de "Ayuda" del boilerplate tal
    cual — su texto vive en `span > small`, ninguno narrado. El
    cliente confirmó que sí debía leerse (a diferencia de "Cómo
    recorrer el curso", que se deja mudo a propósito, decisión
    explícita). Fix en `js/narrador.js` (kit): `.d-instr-item` sumado
    a la lista de contenido narrable, con el mismo cuidado de siempre
    para que el título y la nota de cada tip no se lean pegados.
    Verificado con `check-narracion-ayuda.mjs`.
19. Pedido explícito: que quede como regla permanente verificar que la
    narración lee todo "correctamente y en orden" — no una revisión
    puntual. Auditando con esa vara apareció el bug más serio de esta
    ronda: las 2 preguntas de repaso rápido (`resumen1/2/3`) se
    narraban SEGUIDAS al entrar a la diapositiva, revelando la 2ª
    antes de que el alumno llegara a ella — el widget las esconde con
    una clase CSS (`display:none`, `assets.css`), no con el atributo
    `hidden` real que `Narrador.textOf()` sabe respetar. Fix en
    `initRepasoRapido()` (`js/curso.js`): `mostrar(i)` ahora pone
    `hidden` real en cada pregunta que no es la actual — la
    ocultación visual y la de narración pasan a ser la misma
    garantía.
20. Pedido explícito, mismo momento: las preguntas de repaso se
    narraban como afirmación lisa, sin avisar que hay que elegir
    Verdadero o Falso (eso solo se ve, en los botones). Nuevo
    mecanismo de KIT (`js/narrador.js`): `[data-narrate-prefix="..."]`
    antepone un texto hablado sin tocar el texto visible — este curso
    lo usa en las 6 preguntas de repaso
    (`data-narrate-prefix="Verdadero o falso"`).

21. Pedido explícito, mismo momento ("que sea clara, ordenada, con
    sentido, sino va a distraer"): se leyó el texto narrado COMPLETO
    de las 26 diapositivas, no solo la estructura — apareció el bug
    más frecuente de toda la auditoría: **6 de las 26 diapositivas
    decían el título dos veces seguidas** ("Introducción.
    Introducción. En COTO trabajamos..."). Causa: esos párrafos ya
    abrían anunciando el tema en palabras, de la época en que el
    título no se narraba — al prenderlo (punto 17 más arriba) quedó
    redundante. Fix genérico en `js/narrador.js` (kit): `textOf()`
    ahora recorta la apertura duplicada del segundo fragmento cuando
    coincide con el título, tolerante a la puntuación de
    apertura/cierre. Verificado con un diff completo de las 26 salidas
    antes/después: solo las 6 diapositivas afectadas cambiaron, el
    resto byte por byte igual.

**La "regla permanente"**: `tools/tests/check-narracion-completa.mjs`
(nuevo) recorre las 26 diapositivas y compara la narración real contra
4 reglas — empieza con el título (una sola vez, nunca repetido),
ninguna palabra queda pegada, las diapos de video narran silencio, y
el repaso narra exactamente 1 pregunta por vez, nunca 0 ni 2.
Verificado revirtiendo cada fix a propósito antes de confirmar el
resultado final — el test los detecta a los cuatro.

22. Pedido explícito, con mockup aprobado antes de tocar código
    (CLAUDE.md §6.40): "Sonido" gana un panel con barra de volumen
    (0-100%, botón de mute propio, ecualizador decorativo) y
    "Locución" gana una línea de tiempo por frase, con arrastre para
    saltar y botón "Repetir" — se despliegan bajo cada botón al pasar
    el mouse (o con un tap fijo, en táctil). Requirió una
    reestructuración de kit (`js/narrador.js`: estado
    `estadoActual`/`hablarDesde()`, evento `narracionprogreso`,
    `seek()`/`repeat()`/`progreso()` nuevos) — detalle completo en
    `kit-base/CLAUDE.md` §6.55. La línea de tiempo es a nivel de FRASE,
    no de palabra, a propósito (Web Speech API no da progreso
    intra-utterance confiable) — comunicado y aceptado antes de
    implementar. Al pedir explícitamente verificar mobile ("que no se
    rompa nada, ajustalo para mobile como siempre") apareció un bug
    real de KIT: el popover de volumen/locución se anclaba al borde
    derecho en mobile asumiendo que el grupo de botones de audio
    siempre queda ahí — pero el layout de 2 filas del header (≤799px)
    lo mueve a la izquierda, y el panel se salía por completo del
    viewport (medido con Playwright en 390px: `left:-150px`). Fix real
    de kit: el popover se posiciona con JS midiendo la posición real
    del botón en cada apertura, nunca por breakpoint fijo — mismo
    principio que ya costó una vuelta completa con la barra
    superior/inferior en "Uso de Sucursales 3 - NOA" (CLAUDE.md §6.15).

23. Pedido explícito, con mockup aprobado en dos rondas (CLAUDE.md
    §6.40 — la primera propuesta se rechazó por pedido de "más pro,
    más interactivo"): el botón "Ayuda" mezclaba instructivo con
    configuración de voz/velocidad en el mismo pop-up. Se separó en
    dos botones flotantes apilados abajo a la derecha —
    "Ayuda" (instructivo reorganizado como acordeón de preguntas
    frecuentes, más un botón nuevo "Volver a ver la introducción" que
    reabre "Cómo recorrer el curso") y "Configuración" (voz +
    velocidad de siempre, más "Escuchar un ejemplo" a demanda y
    "Restablecer a los valores recomendados"). Detalle completo en
    `kit-base/CLAUDE.md` §6.57. De paso se corrigió un `<div
    class="d-app">` duplicado en `index.html` (HTML mal balanceado,
    invisible porque `.d-app` es `position:fixed` — no afectaba nada
    visible, pero era markup incorrecto real).
24. Feedback puntual sobre el punto 23, 5 correcciones (detalle
    completo en `kit-base/CLAUDE.md` §6.58): (a) **íconos del índice**
    — la mayoría no representaban su sección (`alteracion` con un
    cursor de mouse, las 3 unidades compartiendo el ícono de
    "envasado"...); auditados uno por uno y reasignados, 7 símbolos
    nuevos en el sprite; (b) **gracia de hover de 3s** en los 4
    popovers (Sonido/Locución/Ayuda/Configuración) — antes se cerraban
    de golpe si el mouse cruzaba rápido el hueco entre el botón y el
    panel; (c) Locución **ya no dice "frase N de M"** — sonaba a que
    el audio tuviera partes; (d) el popover de **Ayuda quedó más
    compacto** (las 3 tarjetas + el acordeón entero entran sin scroll,
    antes las clases del addendum estaban pensadas para un drawer
    mucho más ancho); (e) bug real: la barra de "pasos" de **Rotación
    todavía saltaba con un clic** aunque el código ya decía haberlo
    resuelto — el umbral de arrastre real faltaba en el lugar correcto
    (`pointermove`, no el `click`).
25. Verificación de mobile sobre el punto 24, propia (no reporte del
    cliente — nueva regla de proceso, ver `kit-base/CLAUDE.md` §6.10.1
    punto 4): el fix de "Rotación solo-arrastre" del punto 24(e) seguía
    saltando con un simple TAP táctil, sin arrastrar. Causa: el guard
    que distinguía clic real de activación por teclado miraba
    `e.detail !== 0`, pero un tap táctil sintetiza un `click` con
    `detail: 0` — igual al de teclado. Fix real (kit-base v1.9.38):
    la distinción pasa a ser "¿hubo un `pointerdown` justo antes?"
    (cierto para mouse y para touch, nunca para teclado). Verificado en
    viewport táctil real, no solo achicando la ventana.
26. **Ronda de "10 mejoras al kit"** a pedido del cliente (detalle
    completo en `kit-base/CLAUDE.md` §6.59): (a) aviso **"Girá tu
    dispositivo"** para teléfono/tablet en vertical — resuelve la
    limitación de mobile que había quedado documentada sin resolver;
    (b) **red de seguridad universal para video** — cualquier `<video>`
    que quede reproduciéndose fuera de su diapositiva/pop-up/capa se
    pausa solo; (c) **el techo de arrastre de la barra de progreso** ya
    no depende de código a mano en `curso.js` — una función del kit lo
    restaura solo entre sesiones; (d) **certificado de finalización
    descargable como PDF**, con el nombre real del alumno, el curso, la
    fecha y la medalla alcanzada (botón "Descargar certificado" al
    lado de "Imprimir resumen", en el resumen de cierre); (e) 2 bugs
    reales encontrados y corregidos EN EL KIT mismo con una herramienta
    nueva de esta misma vuelta (un linter de CSS duplicado): reglas de
    glosario que nunca se aplicaban por falta de `@media`, y una regla
    de animación duplicada byte a byte; (f) de paso, un directorio
    `undefined/` que se había colado en el zip anterior (bug de un
    test, ya corregido) — no debería volver a aparecer.
27. **El resumen del minijuego pasa de diapo de capa a pop-up real**
    (pedido explícito, mockup aprobado antes de tocar código — detalle
    completo en `kit-base/CLAUDE.md` §6.61). Se cierra por las 4 vías
    de siempre (botón, ✕, Esc, tocar el fondo), todas con la misma
    lógica de continuar al resultado. "Sin scroll" (el otro pedido
    explícito) resultó ser 2 problemas de layout distintos, no 1:
    la lista pasó de 1 a 2 columnas (la mitad de alto), y hubo que
    medir por separado el caso "ancho angosto" (1 columna, sigue
    scrolleando si no se compacta) y el caso "teléfono en horizontal"
    (2 columnas, pero muy poco alto disponible) — una sola regla de
    compactación cubre los dos. Verificado sin scroll con Playwright en
    desktop, ventana angosta y landscape de teléfono real.
28. **Pop-up "Un momento, pensemos" (predicción antes del video
    "proceso"), 2 pedidos puntuales**: faltaba el ":" después de
    "pensemos" (agregado), y "esta un poco desfazado el tamaño y las
    cosas no se ven bien alineadas" — bug real, no de gusto: el
    párrafo de feedback (`.d-pred-fb`) comparte nombre de clase con un
    componente distinto del kit (`coto-base-addendum-v1.8.css`, pensado
    para otro patrón de pop-up) que le colaba padding/border-radius —
    una caja fantasma sin fondo visible que corría todo lo de abajo.
    Neutralizado con un reset explícito en `assets.css` (el archivo del
    curso, sin tocar el kit — es una colisión de nombre en este curso,
    no un bug del componente del kit). De paso, "Antes de mirar el
    video" pasó de ser el arranque de la pregunta a un kicker/píldora
    propio arriba del título (reusa `.d-instr-kicker`, ya genérico en
    el kit), separando mejor el contexto ("cuándo") de la pregunta en
    sí ("qué").
29. **Glosario reordenado por aparición, no alfabético** (pedido
    explícito: "que esté ordenado no alfabeticamente sino en orden de
    aparición de las diapos, como un caminito"). Las 2 listas viejas
    (sección fija "Los 3 peligros" + lista A-Z de 23 términos) se
    fusionaron en 1 sola, ordenada por el `data-slide-index` real de la
    diapositiva de cada término — los 3 peligros quedan naturalmente
    junto a Contaminación/ETA/Microorganismo (comparten diapositiva),
    sin necesitar un encabezado propio. El mecanismo de bloqueo/
    desbloqueo y el buscador (kit, genéricos) no dependían de la
    cantidad de listas ni de encabezados, así que no hizo falta tocar
    ningún JS.
30. **Volumen y popovers, 2 pedidos de kit documentados recién ahora**
    (el código ya estaba aplicado desde antes, cronológicamente junto
    a los puntos 21-25 — quedó sin su entrada en este README hasta
    esta revisión; detalle completo en `kit-base/CLAUDE.md` §6.60):
    (a) el control global **"Sonido" ahora también baja/mutea la
    locución**, no solo videos y tonos de UI — antes bajar "Sonido" a
    0 dejaba la voz sonando igual; (b) la **gracia de hover de los 4
    popovers bajó de 3s a 1,5s**, y de paso apareció un bug real: un
    popover abierto por hover (no por clic) no se cerraba al tocar
    afuera de la pantalla, quedaba pegado hasta que la gracia
    terminaba sola — el cierre por clic-afuera solo limpiaba el
    estado de "pineado por clic", nunca el de "abierto por hover".
31. **2 bugs reales más, reporte del cliente** (detalle completo en
    `kit-base/CLAUDE.md` §6.62): (a) mover el slider de "Sonido" "tarda
    en impactar... hay que reiniciar para que se cambie" — el volumen
    nuevo se guardaba pero nunca refrescaba la locución EN CURSO; una
    diapositiva típica se narra en un solo fragmento, así que "se
    aplica en el fragmento siguiente" nunca se sentía. Fix: el slider
    escucha el evento `change` (una vez, al soltar) y ahí sí refresca
    la narración; (b) **el glosario dejaba saltar el bloqueo de
    avance** — un término bloqueado se veía atenuado con candado, pero
    el botón de adentro seguía 100% clickeable y navegaba igual a esa
    diapositiva, sin haber completado nada de lo intermedio. Mismo
    patrón que ya se había corregido en el índice lateral hace rato,
    nunca portado al glosario. Fix: el botón queda `disabled` real
    mientras el término está bloqueado.
32. **Al acertar una opción del minijuego, se resalta también la zona
    real del dibujo** (pedido explícito, mockup aprobado antes de
    tocar código — detalle completo en `kit-base/CLAUDE.md` §6.63):
    clickear "Plagas" resalta la mosca, "Producto alterado" resalta la
    pieza de carne más oscura (medida con Python/PIL cuál de las dos
    piezas es realmente más oscura, no a ojo), y así con los 6
    hallazgos. "Contaminación cruzada" —relacional, involucra 2
    objetos— quedó en 1 sola zona a pedido del cliente (la tabla con
    ambas piezas de carne). Verificado con Playwright en desktop y en
    viewport táctil real: prende solo el hallazgo acertado (sin apagar
    los previos), errar no cambia nada, y reintentar apaga todo.
33. **Seguimiento del punto 32: cada halo suma el nombre del hallazgo**
    (consulta directa — "¿los diferenciamos por color o le ponés el
    nombre?" — el cliente prefirió el nombre). Encontró una colisión
    real al armarlo: "Producto alterado" y "Contaminación cruzada"
    comparten la misma zona física (la tabla con las 2 piezas de
    carne) — con las 2 etiquetas arriba por default se superponían
    apenas se acertaban juntas, que es el caso más común, no un borde
    raro. "Contaminación cruzada" pasó su etiqueta abajo de la caja
    para dejar de pisarse. Verificado con captura en desktop y mobile
    con los 6 hallazgos prendidos a la vez.
34. **Lote de "dinamismo cinematográfico" aprobado en bloque**
    (consulta exploratoria sobre animación de entrada de las diapos →
    lista de ideas propuestas → "si me gusta todo, avancemos con todo
    esto", más un pedido nuevo del cliente sumado en el mismo mensaje —
    detalle completo en `kit-base/CLAUDE.md` §6.65): la transición de
    entrada entre diapositivas (`.anim-r`/`.anim-l`) YA EXISTÍA y
    funcionaba, solo era demasiado sutil — potenciada a 5%
    translateX + un leve scale de asentamiento, en vez de reconstruida
    de cero; Ken Burns (zoom lento y continuo) en diapositivas-captura
    sin overlays interactivos — excluido automáticamente de cualquier
    diapositiva con hitboxes (bug real encontrado con la suite de
    tests: escalar un contenedor con hitboxes adentro los pone en
    movimiento continuo, rompiendo el clic y el arrastre de la barra
    de pasos de "Rotación"); el chip de puntos del header ahora cuenta
    de un valor a otro en vez de saltar en seco, con un pulso al
    sumar puntos; los botones "Anterior"/"Siguiente" responden al
    toque con una leve presión; el botón "Siguiente" ahora se ve
    atenuado en TODO momento mientras el gate sigue activo (antes solo
    temblaba al fallar un intento) y brilla un instante al
    desbloquearse; y la barra de progreso de abajo suma una trama
    diagonal marcando la parte todavía no alcanzada (pedido nuevo
    explícito del cliente, sumado al mismo mensaje de aprobación).
    Verificado con Playwright pieza por pieza y con la suite completa
    de 25 tests — 2 fallos reales encontrados y corregidos en el
    camino (un test que leía el puntaje antes de que terminara de
    contar, y el bug de Ken Burns sobre hitboxes ya mencionado).

---

## 10. Cómo probarlo

```bash
cd seguridad-alimentaria
python3 -m http.server 8891 &
npm install                      # playwright-core
COURSE_URL=http://localhost:8891/index.html npm test
node tools/verify-hitboxes.mjs http://localhost:8891/index.html
node ../kit-base/tools/check-css-duplicates.mjs css/*.css
```

Los 7 tests genéricos + los 15 propios de este curso
(`check-certificado.mjs`, `check-glosario-flow.mjs`,
`check-minijuego-puntos.mjs`,
`check-narracion-video.mjs`, `check-narracion-titulos.mjs`,
`check-narracion-ayuda.mjs`, `check-narracion-completa.mjs`,
`check-controles-audio.mjs`, `check-controles-audio-mobile.mjs`,
`check-fab-ayuda-config.mjs`, `check-fab-mobile.mjs`,
`check-popover-hover-gracia.mjs`, `check-rotacion-arrastre.mjs`,
`check-rotacion-mobile.mjs`, `check-rotate-notice.mjs`) pasan con 0
fallos.

## 11. Errores propios encontrados antes de entregar

- `XAPI.init()` no existe (xapi.js se configura solo desde
  `window.XAPI_CONFIG`). Lo agarró `markup-sanity` en la 1ª corrida.
- `data-nav="next"` sobre el hitbox de la portada: `_syncNav` le
  agrega `.d-nav-btn--cta` a **cualquier** elemento con ese atributo, y
  esa clase pinta `background:var(--cat-strong)` — habría dibujado un
  bloque de color tapando el botón del arte. Se usa `data-goto`.
- La fila de tildes de "malas"/"buenas" se superponía con el párrafo de
  consigna. Se encontró con el overlay de hitboxes, no a ojo: la banda
  vacía real del arte está DEBAJO de los puntos (82,1% de alto), no
  arriba.
