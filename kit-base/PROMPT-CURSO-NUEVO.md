# Prompt de arranque para un curso nuevo

**Qué es esto:** el texto que se pega en el chat NUEVO de un curso, para
que arranque sabiendo cómo trabaja este molde sin tener que
redescubrirlo. Vive en el kit y no en el chat de kit-base a propósito:
es el mismo prompt todas las veces, es sobre el PROCESO y no sobre el
contenido de ningún curso, y armarlo de memoria cada vez es exactamente
cómo se pierden los detalles que después cuestan una vuelta de feedback.
Si el proceso cambia, se cambia acá — no en el mensaje que uno escribe
apurado al abrir el chat.

**Cómo se usa:** copiar el bloque de abajo, reemplazar lo que está
entre `<>` y adjuntar el zip de `kit-base/` + el PDF del diseñador.

---

## ✂️ Copiar desde acá

Vas a armar un curso SCORM del molde "Área Aprendizaje (COTO)" usando el
kit adjunto (`kit-base/`, v1.9.71). Antes de escribir una línea, leé del
kit:

- `CLAUDE.md` **§7** — el checklist de arranque, paso por paso.
- `CLAUDE.md` **§0.1** — cómo se relevan hallazgos hacia el kit. Es la
  regla más importante de este flujo: **desde este chat NO se edita
  nunca `kit-base/`**, ni para un arreglo de una línea. Si algo del kit
  está mal o falta, se anota y se relaya; lo canónico se edita en su
  propio chat.
- `CLAUDE.md` **§7.3** — la lista de bugs que ya se pagaron una vez y no
  hay que reintroducir. Conviene releerla antes de entregar, no solo al
  empezar.
- `CLAUDE.md` **§1** — qué va en el kit y qué va en el curso. La
  pregunta es siempre: *"¿esto lee algo del curso?"* Si no lee nada del
  curso, es del kit y no se escribe acá.

### Datos de este curso

- **Nombre:** `<NOMBRE DEL CURSO>`
- **Categoría:** `<categoria>` — tiene que ser una de las reales de
  `css/coto-base.css`; el generador valida contra el CSS y las lista si
  te equivocás.
- **PDF del diseñador:** adjunto.
- **Videos:** `<sí / no / todavía no los entregaron>`

### Paso 1 — generar el esqueleto (NO armarlo a mano)

```bash
node tools/new-course.mjs ../<carpeta-del-curso> \
  --titulo "<NOMBRE DEL CURSO>" --cat <categoria>
```

Eso genera el `index.html` COMPLETO —chrome, barra inferior, índice
lateral, modales, orden de scripts— más el `imsmanifest.xml`, el CSS
propio vacío y las diapositivas rotuladas. Recién salido del generador
tiene que dar **17/17 en verde**; si no, es un bug del kit y se relaya
antes de seguir.

**No adaptar el `index.html` de otro curso a mano.** Ese era el método
viejo y es donde el contrato se rompe en silencio: `initPlayer()` no
tira ningún error si un id no calza, simplemente deja medio chrome
muerto.

### Sobre el curso de referencia adjunto

Va también el zip de un curso ya terminado y aprobado. **Se AUDITA, no
se copia** (§7.1): ninguna diapositiva, imagen ni id de ese curso pasa
a este. Sirve para UNA sola cosa — el estándar de PULIDO: mirarlo para
responder *"¿esto se siente tan terminado como un curso aprobado?"*.

**Y hay algo que NO hay que copiarle: su `curso.js`.** Ese curso se
armó sobre una versión anterior del kit, así que tiene escrito a mano
cosas que HOY son módulos del kit. Si ves ahí una función que hace
puntos, logros, repaso, gates o avisos de "te falta tocar esto", no la
copies: buscá el módulo equivalente en el kit. Copiar de un curso viejo
es cómo un curso nuevo termina ARRANCANDO PEOR que el anterior — ya
pasó una vez, un curso perdió el conteo animado, el pulso del chip y el
envío a xAPI por copiar de otro en vez de mirar el kit.

Regla corta: del curso de referencia se mira **cómo se ve**; del kit se
saca **cómo se hace**.

### Paso 2 — decidir, diapositiva por diapositiva

Por cada página del PDF, una decisión que condiciona todo lo demás:

- **Captura íntegra** (`.d-shot-slide`) — la página entra como imagen y
  las zonas interactivas van encima como hitboxes medidas en píxeles.
- **Piezas HTML reales** — texto vivo + arte suelto, cuando el texto
  tiene que ser seleccionable, buscable o cambiar de tamaño.

Las hitboxes **se miden contra el render, nunca a ojo**, y se verifican
con `npm run verify-hitboxes` (saca capturas con el rectángulo real
dibujado encima).

### Paso 3 — escribir `js/curso.js`

Es el ÚNICO archivo que se escribe entero. Va: el vocabulario propio
para la locución, el banco de preguntas, el catálogo de logros, el
puntaje y el cableado de los módulos del kit. La plantilla ya viene con
todo comentado y en el orden correcto.

Lo que **no** va acá porque el kit ya lo hace. Si estás por escribir
algo que suene a alguna de estas cosas, **buscalo primero: está**, y
escribirlo a mano es cómo un curso nuevo termina arrancando peor que el
anterior.

| querés… | ya existe |
|---|---|
| puntos, logros, medalla | `initLogros`, `initCierreCelebration` |
| repaso / mini-quiz | `initRepasoRapido`, `initMiniQuiz` |
| frenar el avance hasta que toquen algo | `initPopupGate`, `initVideoGate` |
| avisar qué le falta tocar al alumno | `initGateHints` |
| glosario con búsqueda y candado | `initGlossarySearch`, `initGlossaryUnlock` |
| índice lateral con tilde y gate | `initIndexJumps` |
| zonas tocables sobre el arte | `initHotspots` |
| cambiar la captura por variantes | `initShotSwap` |
| **revelar de a uno y que queden acumulados** | **`initRevelados`** |
| **dos juegos de carteles sobre el mismo arte** | **`initTandas`** |
| **un documento con paginado, zoom y descarga** | **`initVisorDocs`** |
| **pasar hojas sin abrir el pop-up** | **`initDocEnDiapo`** |
| **pasos numerados al costado del repaso** | **`initPasosRepaso`** |
| **salir del repaso con la última respuesta** | **`initSalidaRepaso`** |
| video de fondo / en pop-up / circular / en capa | `initBgVideos`, `initVideoPlayer`, `initInlineCircleVideos`, `initLayerVideos` |

**La gamificación completa es OBLIGATORIA** (§6.17.1), no una decisión
de alcance: logros, puntos, glosario y gate de avance van en todos los
cursos salvo que el cliente lo apruebe explícitamente por escrito.

Y si escribís el marcado de una de estas piezas y te olvidás de llamar
a su `init`, **`contrato-cableado` te lo dice con la consecuencia**: no
falla en silencio. Esa es la falla más cara que tuvo este molde.

**Y desde v1.9.71, tampoco va la narración por diapositiva.** Era la
línea que todo curso escribía a mano (`slidechange` → `speakSlide`) y
ahora la engancha `initPlayer()` solo: alcanza con pasarle `speakSlide`,
que la plantilla ya trae. Incluye el corte de la locución anterior y la
espera de 220ms, así que pasar cinco diapositivas rápido dispara UNA
narración en vez de encolar cinco. Si escribís tu propio listener de
`slidechange` para narrar, vas a tener DOS — el opt-out es
`speakOnSlideChange:false`.

Esto viene de que el kit venía fallando en silencio en cuatro lugares
con la misma forma —traía la pieza, nadie la cableaba, y no había
ningún error— hasta el punto de que un curso entero podía quedar
**mudo** sin que nada lo delatara (§7.17). Por eso ahora hay un test
que verifica el cableado, no los síntomas: si algo de esto se
desconecta, `contrato-cableado` lo dice con nombre y consecuencia.

### Paso 4 — antes de entregar

```bash
COURSE_URL="http://localhost:8080/index.html" npm test   # los 17, exit 0 en todos
npm run verify-hitboxes                                   # inspección visual
npm run check-assets                                      # peso/formato de imágenes
```

Un "0 fallos" solo vale si además mirás **cuántos tests dice haber
corrido**. Y `contrato-cableado` es el que más conviene leer cuando
falla: no reporta que algo se ve mal, reporta que algo **no está
enchufado** — que es el tipo de falla que no se nota mirando el curso. Y los umbrales de la medalla **no se escriben a mano**: se
derivan del máximo realmente alcanzable, descontando lo que todavía sea
placeholder, y ese máximo se verifica con un recorrido instrumentado —
la tabla de puntos es una intención, el contador es el hecho (§7.3
punto 19).

### Durante todo el curso: el relay

Cada vez que encuentres algo que es del KIT y no de este curso —un bug,
un hueco, un patrón que tuviste que escribir a mano y que serviría a
cualquier curso— **anotalo en el `README-CURSO.md` de este curso** con:
síntoma, diagnóstico contra el código real, y cómo lo verificaste. Al
final se relaya todo junto al chat del kit.

Lo que hace útil a un relay: que distinga lo que YA probaste de lo que
solo suponés, y que diga cómo lo mediste. Un relay que dice "esto es
mío, esto es del kit, y esto último lo verifiqué así" vale el doble que
uno con más hallazgos sin comprobar.

## ✂️ Hasta acá
