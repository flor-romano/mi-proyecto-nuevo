# tools/tests/ — suite mínima genérica

kit-base v1.0 · Área Aprendizaje (COTO)

Copiar esta carpeta tal cual a cada curso nuevo. Estos 7 tests son
genéricos de verdad: solo leen atributos `data-*` y estructura de
`motor-slides.js`, ningún ID de diapositiva ni texto de contenido — no
hace falta adaptar selectores curso a curso. `hitbox-click-check.mjs`
reemplaza y generaliza al antiguo `verify-hitboxes.mjs` (ese sigue
existiendo como herramienta de **inspección visual** ad-hoc; este test
es la versión **pass/fail** para correr en CI o antes de entregar).
`scorm-tracking.mjs` (kit v1.9.9) es el único que NO mira el DOM:
levanta un LMS falso en `window.API` y verifica que el curso realmente
le hable — nació de un bug real en el que ningún curso escuchaba
`courseend`, así que el alumno terminaba todo y en el LMS quedaba
"incomplete" para siempre, sin que ningún test lo notara.

Cada curso agrega, aparte, sus propios tests de contenido (ej.
`check-cierre-flow.mjs`, específico del flujo de certificación de ESE
curso) — ver `CLAUDE.md` §6.

## Cómo correr

```bash
# servir el curso en localhost primero, ej.:
cd mi-curso && python3 -m http.server 8891 &

node tools/tests/deep-audit.mjs        http://localhost:8891/index.html
node tools/tests/full-regress.mjs      http://localhost:8891/index.html
node tools/tests/hitbox-click-check.mjs http://localhost:8891/index.html
node tools/tests/scroll-audit.mjs      http://localhost:8891/index.html
node tools/tests/keyboard-a11y.mjs     http://localhost:8891/index.html
node tools/tests/markup-sanity.mjs     http://localhost:8891/index.html
```

Cada script termina con exit code 0 (todo OK) o 1 (hay fallos, detalle
en stdout). Antes de dar un curso por terminado: **correr los 6, exit
0 en todos.**

`markup-sanity.mjs` (sumado en v1.6, nacido de un bug real en
"Prevención cardiovascular": a un botón de video le faltaba el `>` de
cierre de la etiqueta, y el navegador lo parseó de forma que el texto
accesible quedó VISIBLE en pantalla en vez de en un `.sr-only` — ningún
otro test lo atrapaba) chequea 3 cosas: HTML mal cerrado, hitboxes con
texto visible (debería ir todo en `.sr-only`), y `.sr-only` que quedó
visible por error de CSS.

Requieren `playwright-core` instalado y un Chromium accesible — por
defecto usan `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
(mismo que usa `verify-hitboxes.mjs`); sobreescribir con la variable de
entorno `CHROMIUM_PATH` si hace falta.

## `_shared.mjs` — helpers para tests de contenido/curso

No es un test — es lo que importa cada test de arriba (y cualquier
test propio de un curso). Tres funciones:

- `openCourse(url)` — arranca Chromium, abre el curso en un viewport de
  escritorio (1600×900), junta errores de consola en `errors`. La usan
  los 7 tests genéricos y prácticamente todos los tests de contenido.
- `openCourseMobile(url, deviceName?)` — mismo contrato, pero en un
  contexto TÁCTIL real (`isMobile`/`hasTouch`, perfil completo de
  dispositivo de `playwright-core`, default `'iPhone 12'`). Existe
  desde kit-base v1.9.39, para que la regla de CLAUDE.md §6.10.1 punto
  4 ("toda interacción nueva se prueba en mobile real, en la misma
  vuelta en que se construye") sea fácil de cumplir — antes cada test
  mobile repetía a mano el mismo boilerplate de "levantar un contexto
  táctil". Pasar otro `deviceName` (ej. `'iPad (gen 7)'`) para probar
  tablet real sin escribir un test aparte.
- `report(name, failures)` / `requireUrl()` — formato de salida y
  lectura del argumento `<url>` de la línea de comandos, iguales para
  cualquier test.

Patrón de un test mobile nuevo:
```js
import { openCourseMobile, requireUrl } from './_shared.mjs';
const { browser, page, errors } = await openCourseMobile(requireUrl());
// ... interactuar con page.tap()/page.touchscreen.* ...
await browser.close();
```
