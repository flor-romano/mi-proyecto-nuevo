# spec-motor-slides.md — contrato del motor genérico

kit-base v1.0 · Área Aprendizaje (COTO)

> Este documento describe el contrato que implementa `motor-slides.js`
> (la clase `Motor`) y que todo `index.html` de un curso de este molde
> tiene que respetar en su marcado para que el motor funcione sin
> tocarle una línea. Reconstruido a partir del código real de
> `motor-slides.js` (no había quedado un archivo de spec en el zip
> entregado del curso base — este documento lo reemplaza).

Referencia cruzada: `CLAUDE.md` (la guía maestra del proceso completo,
PDF→curso, diseño, contenido) cita este documento como la definición
técnica exacta del motor; este documento no repite las reglas de
proceso/diseño/contenido, solo el contrato de HTML↔JS.

---

## 1. Qué NO hace el motor (a propósito)

- No habla con el LMS — eso es `scorm-api.js`/`xapi.js`, escuchando los
  eventos que el motor emite.
- No narra nada por voz — eso es `narrador.js` + la lógica de cada
  `curso.js` (qué texto narrar en cada diapositiva/pop-up/capa).
- No sabe nada del contenido del curso: ningún ID de diapositiva,
  ningún texto, ninguna regla de puntaje. Solo lee atributos `data-*`
  genéricos del DOM.

## 2. Instanciación

```html
<script src="js/motor-slides.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    window.motor = new Motor(); // root por defecto = document
  });
</script>
```

`new Motor(root)` corre `_init()` inmediatamente: indexa diapositivas,
conecta navegación/índice/capas/pop-ups/teclado/swipe, arma las marcas
de sección de la barra de progreso, inicializa hitboxes de captura y
muestra la diapositiva 0 (`go(0, true)`, sin animación).

## 3. Diapositivas

```html
<section class="slide" data-slide="mi-id" data-slide-index="3" hidden>
  <h2 data-slide-title>Título (puede ser sr-only)</h2>
  ...
</section>
```

- `data-slide="<id>"` — identificador único, lo usan `gotoId()` y
  `[data-goto]`.
- `data-slide-index="<n>"` — orden de navegación (no tiene que
  coincidir con el orden en el DOM; el motor ordena por este valor al
  indexar). Consecutivo desde 0, sin huecos.
- `hidden` — todas arrancan ocultas salvo la que `go()` deje activa.
- `data-slide-title` — recibe foco (accesibilidad) al entrar a la
  diapositiva; puede ser visualmente `sr-only` si el diseño no lleva
  título visible (caso típico de las diapos-captura).
- `data-nav-cta="<Texto del botón>"` (opcional, solo en la ÚLTIMA
  diapositiva) — en vez de navegar, `_advance` emite `navcta` para que
  `curso.js` ejecute una acción (ej. "Finalizar curso" → revela el
  resumen de cierre).
- `data-slide-end` (opcional, en la última diapositiva) — el motor
  emite `courseend` al llegar; si además no tiene ya consumido
  `data-nav-cta`, un intento más de avanzar emite `courseexit`.
- `data-gate-popup="<popup-id>"` (opcional) — al intentar avanzar DESDE
  esta diapositiva, el motor abre ese pop-up en vez de navegar; al
  cerrarse, completa el avance pendiente automáticamente.
  **Se re-arma al ENTRAR a la diapositiva** (v1.8): si el alumno se va y
  vuelve, el pop-up aparece otra vez. Antes se mostraba una sola vez en
  toda la sesión, y es contenido, no un trámite.
- `data-intro-popup="<popup-id>"` (opcional) — al entrar a esta
  diapositiva el motor abre ese pop-up solo, 350ms después (deja que la
  transición termine antes). **Se abre CADA VEZ que se entra** (v1.8):
  un aviso que aparece una única vez es un aviso que se pierde — quien
  volvió al índice buscando cómo se recorre el curso no encontraba nada.
- `data-intro-once` (opcional, junto al anterior) — vuelve al
  comportamiento viejo: ese pop-up se abre una sola vez por sesión.
- `data-require-seen="<id1> <id2> ...">` (opcional, lo lee `curso.js`
  vía `motor.canAdvance`, el motor NO lo interpreta — ver §7).
- `data-require-popups="<popup-id1> <popup-id2> ...">` (opcional, mismo
  caso: lo interpreta `curso.js`) — exige haber abierto esos pop-ups
  antes de avanzar. Es el equivalente de `data-require-seen` para las
  interacciones que abren una ficha en vez de reproducir un video.

## 4. Navegación

- `[data-nav="prev"]` / `[data-nav="next"]` — botones de avance; el
  motor gestiona `disabled` y el texto de "Siguiente"/"Finalizar"/
  "Empezar"/"Fin" automáticamente vía `_syncNav()`.
- `[data-goto="<slide-id>"]` — cualquier elemento clickeable (índice
  lateral, tarjetas de repaso con link directo) salta a esa diapositiva.
- Flechas de teclado (← →) navegan igual que los botones, salvo con un
  pop-up abierto (ahí gobiernan Esc/Tab) o con foco en un
  input/textarea/button.
- Swipe horizontal sobre `.d-stage` (un dedo, ≥60px, <600ms, mayormente
  horizontal) navega igual — no se activa si el gesto arranca sobre un
  control o con un pop-up abierto.
- `motor.canAdvance(slideEl)` — **hook opcional que define curso.js**,
  no motor-slides.js. Si existe y devuelve `false` para la diapositiva
  actual, `_advance(1)` se frena y emite `advanceblocked` en vez de
  navegar (ej.: "conceptos" no deja avanzar hasta explorar las 7
  pestañas). El motor solo consulta la función: no sabe qué regla hay
  detrás.

## 5. Capas (`[data-layers]`)

```html
<div data-layers>
  <button data-target="a" role="tab">A</button>
  <button data-target="b" role="tab">B</button>
  <div data-panel="a">...</div>
  <div data-panel="b" hidden>...</div>
</div>
```

- Un grupo `[data-layers]` agrupa disparadores `[data-target="<id>"]` y
  paneles `[data-panel="<id>"]`. Al hacer clic en un disparador, el
  panel con ese `data-panel` se muestra (los demás se ocultan con
  `hidden`), el disparador activo recibe `.active` (+ `aria-selected`
  si tiene `role`), y se dispara `layerchange` (bubbles) con
  `detail.target`.
- Panel inicial: el que ya esté sin `hidden` en el HTML, o el primero
  si ninguno lo está.
- Sirve para tabs, stepper, carrusel — cualquier "cambia de contenido
  sin salir de la diapositiva". El motor no distingue el patrón visual,
  solo la mecánica mostrar/ocultar + evento.

## 6. Pop-ups

```html
<button data-popup-trigger="mi-popup">Abrir</button>
...
<div class="modal" data-popup="mi-popup" role="dialog" aria-modal="true">
  <div class="modal-back" data-popup-close></div>
  <div class="modal-card">
    <button data-popup-close aria-label="Cerrar">✕</button>
    ...
  </div>
</div>
```

- `showPopup(id)` / `closePopup()` — añaden/quitan `.open` en
  `[data-popup="<id>"]`, atrapan foco (Tab/Shift+Tab circular dentro
  del pop-up), foco inicial al primer elemento enfocable, devuelven el
  foco a quien abrió al cerrar.
- Cierra por: click en `[data-popup-close]` (backdrop o botón X), Esc,
  o automáticamente al navegar a otra diapositiva con `go()` (nunca
  queda un pop-up abierto "colgado" entre diapositivas).
- Eventos `popupopen`/`popupclose` (bubbles) con `detail.id`.
- Un solo pop-up abierto a la vez (`this.openPopup`).

## 7. Contrato de extensión — lo que curso.js puede engancharle al motor

El motor deja 2 puntos de extensión explícitos, ambos opcionales:

- `motor.canAdvance = function (slideEl) { return boolean; }` — gate de
  avance (ver §4). Ejemplo real: no dejar avanzar de "conceptos" sin
  haber tocado las 7 pestañas, leyendo `data-require-seen` +
  contadores propios de `curso.js`.
- Escuchar los eventos que emite (`slidechange`, `courseend`,
  `layerchange`, `popupopen`, `popupclose`, `advanceblocked`, `navcta`,
  `courseexit`) para narrar, trackear en SCORM/xAPI, animar HUD, etc.
  El motor no sabe ni le importa quién escucha.

## 8. Hitboxes sobre diapositivas-captura (`_initShots`)

Ver `CLAUDE.md` §2 para el patrón completo (captura íntegra vs.
piezas separadas). Contrato mínimo que necesita el motor:

```html
<div class="d-shot" data-shot>
  <img class="d-shot-img" src="..." alt="Texto accesible/narrado">
  <button class="d-shot-hit" data-hit data-l="10.5" data-t="20.3" data-w="8" data-h="12">
    <span class="sr-only">Qué hace este botón</span>
  </button>
</div>
```

- `[data-shot]` contiene una `.d-shot-img` (imagen base, define el
  lienzo de referencia) y N elementos `[data-hit]` (hitboxes reales).

`[data-place]` (v1.8) se posiciona EXACTAMENTE igual que `[data-hit]`,
con los mismos `data-l/t/w/h`, pero **no promete ser interactivo**: es
para overlays que tienen que quedar registrados con el arte y no se
tocan (un cartel de texto, una etiqueta, una fila de progreso).
Marcar como `[data-hit]` algo que no responde al clic es un botón roto
para un lector de pantalla — y `hitbox-click-check` lo detecta como
fallo, con razón.

- `data-l/data-t/data-w/data-h` en **% contra el tamaño REAL
  renderizado** de `.d-shot-img` (no contra el contenedor) — el motor
  recalcula esto en cada resize/orientationchange/carga de imagen,
  leyendo `naturalWidth/Height`, `clientWidth/Height` y el
  `object-fit`/`object-position` **computados** (soporta `cover`,
  `contain`, y el caso sin `object-fit` explícito = tamaño natural).
- Si `.d-shot-img` todavía no cargó, espera a `load`; si el `[data-shot]`
  vive en una diapositiva oculta al arrancar (`clientWidth` 0), se
  reposiciona apenas se vuelve visible vía `ResizeObserver` (o el
  evento `slidechange` como fallback en navegadores sin
  `ResizeObserver`).

## 9. Marcas de sección en la barra de progreso

Automático, no requiere marcado nuevo: deriva "capítulos" de los
mismos `.d-sidenav-group` + `[data-goto]` que ya arma el índice lateral
clickeable (ver `CLAUDE.md` §0 tabla de niveles). Si el curso no tiene
al menos 2 grupos, no agrega marcas — no hace falta desactivarlo a mano.

## 10. Elementos de chrome que el motor sincroniza (opcionales, sin ellos no rompe)

| Selector | Qué hace el motor con él |
|---|---|
| `[data-slide-counter]` | texto `"N / total"` |
| `[data-slide-progress]` | `width` = fracción de progreso |
| `[data-slide-thumb]` | `left` + `aria-valuenow/valuetext` (slider accesible) |
| `[data-progress-track]` | contenedor donde se insertan las marcas de sección |
| `[data-goto]` | recibe `.is-active` en el que corresponde a la diapositiva actual |

---

## Checklist de verificación (usar `tools/verify-hitboxes.mjs` y
`tools/tests/hitbox-click-check.mjs`, ver `CLAUDE.md` §6)

- [ ] Cada `data-slide` es único y `data-slide-index` consecutivo desde 0.
- [ ] Cada `[data-hit]` tiene `data-l/t/w/h` numéricos válidos (no `NaN`,
      no vacíos).
- [ ] Cada `[data-popup-trigger]` apunta a un `[data-popup]` que existe.
- [ ] Cada `[data-goto]` apunta a un `data-slide` que existe.
- [ ] Ningún `[data-hit]` queda con `getBoundingClientRect()` en 0×0
      tras cargar (imagen no cargó, o coordenadas rotas).
