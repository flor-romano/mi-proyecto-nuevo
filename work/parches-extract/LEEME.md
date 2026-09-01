# Parches para kit-base v1.9.56

5 parches sueltos, cada uno independiente del otro. Salen de migrar
"Uso de Sucursales 3 - NOA" a v1.9.56 y de adoptar los flotantes de
Ayuda/Configuración.

## Cómo aplicarlos

Desde la raíz del kit (donde está `header-boilerplate.html`):

```sh
git am /ruta/a/parches-kit/*.patch        # si el kit está en git
# o, sin git:
patch -p1 < 0001-....patch                # uno por uno, en orden
```

Están hechos contra el v1.9.56 tal cual me lo pasaste, sin ninguna
modificación previa.

## Qué trae cada uno

**0001 — `js/coto-player.js`: Esc cierra los popovers "pinned".**
Bug. `initPinnedPopover()` cerraba con clic afuera y al cambiar de
diapositiva, pero no con Esc — y el texto de Ayuda del propio kit
promete "Esc cierra cualquier ventana emergente". Afecta a los DOS
consumidores del helper: los popovers de audio de la barra superior
(Sonido/Locución) y los flotantes de Ayuda/Configuración. La parte no
obvia es el `blur()`: el CSS abre el panel también con `:focus-within`,
así que sacar las clases no alcanza si el foco quedó adentro (una
pregunta del acordeón, el slider de volumen) — el panel se queda abierto
y encima sigue interceptando clics sobre lo que tapa.

**0002 — `tools/tests/markup-sanity.mjs`: detectar ids duplicados.**
Test nuevo (bloque 5). `getElementById` devuelve siempre el primero del
documento, así que un id repetido deja controles VISIBLES PERO MUERTOS,
sin un solo error de consola y con los 7 tests en verde. Es exactamente
lo que pasa al adoptar el flotante sin sacar el drawer viejo. Ya
encontró algo real: "Uso de Sucursales 3 - NOA" venía con `#d-confetti`
duplicado desde antes (dos divs idénticos, el segundo muerto).

**0003 — `header-boilerplate.html`: checklist de migración al fab-stack.**
Solo comentario. El docblock explica dónde va el bloque, pero no qué hay
que SACAR al adoptarlo si el curso venía con drawer de Ayuda. Los 4
pasos, incluido mover (no copiar) los 7 ids de voz/velocidad/reset.

**0004 — `js/coto-media.js`: `initPopupVideos` no reproducía tras pausar.**
Bug reportado antes y todavía abierto en v1.9.56. Es el MISMO bug que §3
ya había corregido en `initInlineCircleVideos`, que nunca se portó a este
patrón: una vez que `v.controls` está prendido, el clic sobre el video es
el toggle nativo, y el handler propio corre antes leyendo el estado
viejo. Guard de una línea, idéntico al de la variante circular.

**0005 — `js/motor-slides.js`: resincronizar el gate al cerrar con Esc.**
Bug. El listener de clic diferido de `_init()` cubre cerrar con la X o
con "Continuar" (son clics dentro de `root`), pero no el cierre por
teclado. Se ve en cualquier curso donde abrir la última ficha destraba el
avance: el alumno la mira, cierra con Esc, ya cumplió el requisito y
"Siguiente" sigue mostrándose bloqueado. La llamada va DESPUÉS de
`_emit('popupclose')` a propósito — ese evento es el que los cursos usan
para marcar la ficha vista, o sea el estado que `canAdvance()` lee.

## Cómo los verifiqué

Sobre el kit parcheado, con el curso NOA encima:

- Suite oficial **7/7 en verde**, y también 7/7 sobre el curso con el kit
  SIN parchear (los parches no rompen nada existente).
- **0001**: los dos flotantes abren/cierran con Esc en desktop (1280) y
  mobile (390), incluso con el foco dentro del acordeón. Con esto pude
  sacar el `initFabEsc()` que había tenido que escribir en `curso.js`.
- **0002**: inyectando un id repetido a propósito, lo reporta; y detectó
  el `#d-confetti` duplicado real del curso.
- **0004**: reproducido con un video real en Chromium. Sin parche
  clic→reproduce, clic→pausa, clic→NO reproduce. Con parche, los 3 clics
  responden.
- **0005**: antes del parche `canAdvance()` da true y el botón sigue con
  `.is-gated`; después, se destraba. Medido en el navegador, comparando
  el mismo curso contra el kit parcheado y sin parchear.

## Aparte: un arreglo que va en el curso, no acá

"Uso de Sucursales 3 - NOA" tenía `#d-confetti` duplicado (dos divs
idénticos). Ya lo corregí en el curso; lo menciono porque es lo que
destapó el test 0002.
