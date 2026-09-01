# Cursos SCORM COTO — Área Aprendizaje · guía maestra

> Este documento es el "gen" del que parte cada curso nuevo. Lo lee Claude
> (o cualquier dev) al arrancar un curso. **Se actualiza SOLO desde el chat
> dedicado a mejorar `kit-base/` — nunca desde una sesión de curso, ver
> §0.1** — con lo nuevo que valga la pena retener; nunca se re-escribe
> desde cero. Es la contraparte *reutilizable* del README de cada curso
> (que sigue siendo su bitácora propia, cronológica, con decisiones
> específicas de ESE cliente/contenido).
>
> Curso de referencia donde se fijó este patrón: **"Surtido sin venta"**
> (Área Salón). Segundo curso que ya reusa la base: **"Medios de pago"**.
> Desde esta versión, la parte reutilizable en código vive aparte como
> **`kit-base/` (v1.3)** — este documento sigue siendo la guía de
> proceso/diseño/contenido; ver `kit-base/README.md` para qué hay en
> la carpeta y cómo arrancar un curso con eso (§7 tiene el checklist
> corto).
>
> **Este archivo también tiene una copia dentro de `kit-base/CLAUDE.md`**
> (el original de la fuente de verdad sigue siendo este, un nivel
> arriba de esa carpeta) — así un zip de `kit-base/` solo ya trae la
> guía completa, sin depender de acordarse de mandarla aparte en el
> flujo sin repo (chat nuevo por curso). Si edita uno, editar el otro.

---

## Índice

- [0. Qué es un curso de este molde](#0-qué-es-un-curso-de-este-molde)
- [0.1 Regla dura: `kit-base/` se edita en UN solo lugar — nunca desde una sesión de curso](#01-regla-dura-kit-base-se-edita-en-un-solo-lugar-nunca-desde-una-sesión-de-curso)
- [1. Qué es genérico (se copia tal cual) vs. qué es del curso](#1-qué-es-genérico-se-copia-tal-cual-vs-qué-es-del-curso)
- [2. El patrón central: `.d-shot-slide--bg-layered`](#2-el-patrón-central-d-shot-slide--bg-layered)
- [3. Flujo: de "PDF de Illustrator" a curso terminado](#3-flujo-de-pdf-de-illustrator-a-curso-terminado)
- [4. Sistema de diseño (`coto-base.css` + addendum)](#4-sistema-de-diseño-coto-basecss-addendum)
- [5. Narración por voz](#5-narración-por-voz)
- [6. Testing (`tools/tests/`, Playwright)](#6-testing-toolstests-playwright)
- [6.5 Manuales oficiales de marca y contenido (fuente de verdad)](#65-manuales-oficiales-de-marca-y-contenido-fuente-de-verdad)
- [6.6 Rediseño de la barra superior (`.d-top`) — kit-base v1.1](#66-rediseño-de-la-barra-superior-d-top-kit-base-v11)
- [6.7 Locución: velocidad fija = bug real en dispositivos sin la voz preferida](#67-locución-velocidad-fija-bug-real-en-dispositivos-sin-la-voz-preferida)
- [6.8 Márgenes en tablet — primera pasada: aceptado tal cual (ver §6.9 para la vuelta 2)](#68-márgenes-en-tablet-primera-pasada-aceptado-tal-cual-ver-69-para-la-vuelta-2)
- [6.9 Margen de seguridad ampliado para tablets — la solución real](#69-margen-de-seguridad-ampliado-para-tablets-la-solución-real)
- [6.9.1 Franjas laterales en ultrawide: es lo correcto, NO lo "arregles"](#691-franjas-laterales-en-ultrawide-es-lo-correcto-no-lo-arregles)
- [6.10 Avance bloqueado por contenido (gate) — kit-base v1.7](#610-avance-bloqueado-por-contenido-gate-kit-base-v17)
- [6.10.1 Interacciones nuevas: 4 reglas que salieron de bugs reales](#6101-interacciones-nuevas-4-reglas-que-salieron-de-bugs-reales)
- [6.10.2 Pop-ups: una sola regla para todo el curso](#6102-pop-ups-una-sola-regla-para-todo-el-curso)
- [6.10.2.1 El instructivo de arranque: qué decir y qué NO prometer](#61021-el-instructivo-de-arranque-qué-decir-y-qué-no-prometer)
- [6.10.2.2 Cuándo conviene romper la convención de pop-ups](#61022-cuándo-conviene-romper-la-convención-de-pop-ups)
- [6.10.2.3 Tono: el alumno puede estar nervioso en su primer día](#61023-tono-el-alumno-puede-estar-nervioso-en-su-primer-día)
- [6.10.3 Resaltar una hitbox: el ícono, no la caja](#6103-resaltar-una-hitbox-el-ícono-no-la-caja)
- [6.10.4 Tiempo mostrado ≠ tiempo de sesión](#6104-tiempo-mostrado-tiempo-de-sesión)
- [6.10.5 El curso tiene que poder cerrarse](#6105-el-curso-tiene-que-poder-cerrarse)
- [6.10.6 Premio final: los umbrales se calculan, no se eligen](#6106-premio-final-los-umbrales-se-calculan-no-se-eligen)
- [6.10.7 Zonas interactivas sobre el arte: el toggle del clic](#6107-zonas-interactivas-sobre-el-arte-el-toggle-del-clic)
- [6.10.8 "Extraído al kit" no es "probado en un curso real" — auditar la diferencia](#6108-extraído-al-kit-no-es-probado-en-un-curso-real-auditar-la-diferencia)
- [6.11 Animación de entrada escalonada — hasta dónde llega (y por qué)](#611-animación-de-entrada-escalonada-hasta-dónde-llega-y-por-qué)
- [6.12 Pop-up de arranque, video circular, torta interactiva y video en pop-up — 4 lecciones reales (kit v1.9)](#612-pop-up-de-arranque-video-circular-torta-interactiva-y-video-en-pop-up-4-lecciones-reales-kit-v19)
- [6.13 Ronda de revisión visual: 3 lecciones más (kit v1.9)](#613-ronda-de-revisión-visual-3-lecciones-más-kit-v19)
- [6.14 Pop-up 2x2 con color de curso, hover duplicado, video "recortado" y voz en tablet (kit v1.9)](#614-pop-up-2x2-con-color-de-curso-hover-duplicado-video-recortado-y-voz-en-tablet-kit-v19)
- [6.15 Bug real: la barra superior/inferior se cortaba en iPad — pero solo con un alumno real logueado](#615-bug-real-la-barra-superiorinferior-se-cortaba-en-ipad-pero-solo-con-un-alumno-real-logueado)
- [6.16 El fix de §6.15 tenía un costo de UX que había que resolver aparte](#616-el-fix-de-615-tenía-un-costo-de-ux-que-había-que-resolver-aparte)
- [6.17 Primera prueba real end-to-end del kit — 2 bugs reales confirmados en el kit mismo (kit v1.9.2)](#617-primera-prueba-real-end-to-end-del-kit-2-bugs-reales-confirmados-en-el-kit-mismo-kit-v192)
- [6.17.1 Gamificación completa: requisito fijo, no decisión de alcance por curso](#6171-gamificación-completa-requisito-fijo-no-decisión-de-alcance-por-curso)
- [6.17.2 Auditoría dirigida: "traer de vuelta" prevención cardiovascular al kit — 1 gap real más encontrado](#6172-auditoría-dirigida-traer-de-vuelta-prevención-cardiovascular-al-kit-1-gap-real-más-encontrado)
- [6.18 Segunda vuelta de "Uso de Sucursales 3 - NOA" — 4 bugs reales más, los 4 en el kit (kit v1.9.4)](#618-segunda-vuelta-de-uso-de-sucursales-3---noa-4-bugs-reales-más-los-4-en-el-kit-kit-v194)
- [6.19 Tercera vuelta sobre "Uso de Sucursales 3 - NOA" — auditoría dirigida contra "Prevención cardiovascular" pieza por pieza (kit v1.9.5)](#619-tercera-vuelta-sobre-uso-de-sucursales-3---noa-auditoría-dirigida-contra-prevención-cardiovascular-pieza-por-pieza-kit-v195)
- [6.20 Cuarta vuelta sobre "Uso de Sucursales 3 - NOA" — recrear con CSS un pop-up que el diseñador ya armó para copiar y pegar (kit-base v1.9.6)](#620-cuarta-vuelta-sobre-uso-de-sucursales-3---noa-recrear-con-css-un-pop-up-que-el-diseñador-ya-armó-para-copiar-y-pegar-kit-base-v196)
- [6.21 Auditoría a pedido del cliente contra "Prevención cardiovascular", componente por componente (kit-base v1.9.7)](#621-auditoría-a-pedido-del-cliente-contra-prevención-cardiovascular-componente-por-componente-kit-base-v197)
- [6.22 Ronda de UX/interacción a pedido del cliente (kit-base v1.9.7)](#622-ronda-de-uxinteracción-a-pedido-del-cliente-kit-base-v197)
- [6.23 Portada y separadores de unidad pasan a video de fondo — 1 bug real de kit encontrado (kit-base v1.9.8)](#623-portada-y-separadores-de-unidad-pasan-a-video-de-fondo-1-bug-real-de-kit-encontrado-kit-base-v198)
- [6.24 Revisión full a pedido del cliente: 20 hallazgos, y el peor no lo veía ningún test (kit-base v1.9.9)](#624-revisión-full-a-pedido-del-cliente-20-hallazgos-y-el-peor-no-lo-veía-ningún-test-kit-base-v199)
- [6.25 La tilde verde no se marcaba: un bug que YO introduje al "limpiar" estado duplicado](#625-la-tilde-verde-no-se-marcaba-un-bug-que-yo-introduje-al-limpiar-estado-duplicado)
- [6.26 Rebuild sobre el PDF v2: cuando el arte mejora, aparecen bugs que el arte viejo tapaba (kit-base v1.9.10)](#626-rebuild-sobre-el-pdf-v2-cuando-el-arte-mejora-aparecen-bugs-que-el-arte-viejo-tapaba-kit-base-v1910)
- [6.27 Ronda de pulido visual sobre el PDF v2: 5 pedidos puntuales (kit-base v1.9.11)](#627-ronda-de-pulido-visual-sobre-el-pdf-v2-5-pedidos-puntuales-kit-base-v1911)
- [6.28 "Los pop-ups se siguen viendo mal" — la causa real era una sombra DOBLE, no un problema de diseño](#628-los-pop-ups-se-siguen-viendo-mal-la-causa-real-era-una-sombra-doble-no-un-problema-de-diseño)
- [6.29 Video con controles nativos duplicando un reproductor ya dibujado en el poster — bug real de kit (`coto-media.js`, kit-base v1.9.13)](#629-video-con-controles-nativos-duplicando-un-reproductor-ya-dibujado-en-el-poster-bug-real-de-kit-coto-mediajs-kit-base-v1913)
- [6.30 Minijuego: layout debe calcar la disposición del PDF, pero lo recreado en CSS puede (y debe) tener más terminación visual que el arte](#630-minijuego-layout-debe-calcar-la-disposición-del-pdf-pero-lo-recreado-en-css-puede-y-debe-tener-más-terminación-visual-que-el-arte)
- [6.31 Primer intento de rediseño de las 10 fichas (recorte → HTML real, REVERTIDO en §6.32) + bug real de kit: el letterbox lateral se disparaba en las resoluciones de escritorio más comunes](#631-primer-intento-de-rediseño-de-las-10-fichas-recorte-html-real-revertido-en-632-bug-real-de-kit-el-letterbox-lateral-se-disparaba-en-las-resoluciones-de-escritorio-más-comunes)
- [6.32 §6.31 estaba mal leído: el cliente pidió usar las imágenes del PDF, no reinterpretarlas — y las mandó a resolución nativa para pegar directo](#632-631-estaba-mal-leído-el-cliente-pidió-usar-las-imágenes-del-pdf-no-reinterpretarlas-y-las-mandó-a-resolución-nativa-para-pegar-directo)
- [6.33 La ficha quedaba grande y con la ✕ recortada — dos bugs reales, uno de ellos una regla CSS duplicada que se pisaba a sí misma](#633-la-ficha-quedaba-grande-y-con-la-recortada-dos-bugs-reales-uno-de-ellos-una-regla-css-duplicada-que-se-pisaba-a-sí-misma)
- [6.34 Revisión general a pedido del cliente ("pegale una revisión para que se vea y funcione bien") — 3 bugs reales encontrados con Playwright, ninguno reportado antes](#634-revisión-general-a-pedido-del-cliente-pegale-una-revisión-para-que-se-vea-y-funcione-bien-3-bugs-reales-encontrados-con-playwright-ninguno-reportado-antes)
- [6.36 Feedback puntual del cliente sobre la revisión de §6.34 — 5 correcciones reales](#636-feedback-puntual-del-cliente-sobre-la-revisión-de-634-5-correcciones-reales)
- [6.37 El minijuego no calcaba la dinámica original acordada, y "volver para atrás" dejaba sin forma de rejugar](#637-el-minijuego-no-calcaba-la-dinámica-original-acordada-y-volver-para-atrás-dejaba-sin-forma-de-rejugar)
- [6.38 El foco de la ✕ dibujaba un anillo casi cuadrado sobre un botón redondo — bug real de kit](#638-el-foco-de-la-dibujaba-un-anillo-casi-cuadrado-sobre-un-botón-redondo-bug-real-de-kit)
- [6.39 Rediseño completo del minijuego: cajas más lindas, layout, y la tensión de "10 opciones" resuelta con un mecanismo de juego, no con contenido](#639-rediseño-completo-del-minijuego-cajas-más-lindas-layout-y-la-tensión-de-10-opciones-resuelta-con-un-mecanismo-de-juego-no-con-contenido)
- [6.40 El cartel "¡Aprendé jugando!" pasa a estar arriba del iPad (alineado a la izquierda) — 2 bugs reales de layout mobile encontrados al validar el cambio](#640-el-cartel-aprendé-jugando-pasa-a-estar-arriba-del-ipad-alineado-a-la-izquierda-2-bugs-reales-de-layout-mobile-encontrados-al-validar-el-cambio)
- [6.41 Auditoría del cliente comparando 5 pantallas de cierre contra el PDF real + 2 pedidos puntuales resueltos (kit-base v1.9.18)](#641-auditoría-del-cliente-comparando-5-pantallas-de-cierre-contra-el-pdf-real-2-pedidos-puntuales-resueltos-kit-base-v1918)
- [6.42 El fix de §6.41 sobrecorrigió: "centrado" no era `align-items:start`, y mobile necesitaba la MISMA disposición de escritorio, no una rehecha](#642-el-fix-de-641-sobrecorrigió-centrado-no-era-align-itemsstart-y-mobile-necesitaba-la-misma-disposición-de-escritorio-no-una-rehecha)
- [6.43 Cierre de ronda: ícono real de NOA, objetivo C, y un bug real en el armado del zip de entrega](#643-cierre-de-ronda-ícono-real-de-noa-objetivo-c-y-un-bug-real-en-el-armado-del-zip-de-entrega)
- [6.44 Batería grande de correcciones del cliente: índice no interactivo, gate real en el menú lateral, esquina del pop-up de instrucciones, y re-calibración del video de las 10 fichas](#644-batería-grande-de-correcciones-del-cliente-índice-no-interactivo-gate-real-en-el-menú-lateral-esquina-del-pop-up-de-instrucciones-y-re-calibración-del-video-de-las-10-fichas)
- [6.45 Arranque de "Seguridad alimentaria" (Área Control de Calidad) — 8 gaps reales del kit y la primera cáscara de minijuego compartida (kit-base v1.9.21)](#645-arranque-de-seguridad-alimentaria-área-control-de-calidad-8-gaps-reales-del-kit-y-la-primera-cáscara-de-minijuego-compartida-kit-base-v1921)
- [6.46 Ronda de feedback + 10 propuestas de mejora sobre "Seguridad alimentaria" — 3 piezas que subieron al kit (kit-base v1.9.22)](#646-ronda-de-feedback-10-propuestas-de-mejora-sobre-seguridad-alimentaria-3-piezas-que-subieron-al-kit-kit-base-v1922)
- [6.47 Segunda vuelta de feedback sobre "Seguridad alimentaria" — un bug real de kit (`staggerReveal()` con hijos `hidden`) y el resto quedó en el curso (kit-base v1.9.23)](#647-segunda-vuelta-de-feedback-sobre-seguridad-alimentaria-un-bug-real-de-kit-staggerreveal-con-hijos-hidden-y-el-resto-quedó-en-el-curso-kit-base-v1923)
- [6.48 Tercera vuelta sobre "Seguridad alimentaria": video de fondo con auto-avance, 3 bugs reales de interacción, la pantalla de salida, y un bug de mobile real heredado de NOA (kit-base v1.9.24)](#648-tercera-vuelta-sobre-seguridad-alimentaria-video-de-fondo-con-auto-avance-3-bugs-reales-de-interacción-la-pantalla-de-salida-y-un-bug-de-mobile-real-heredado-de-noa-kit-base-v1924)
- [6.49 Cuarta vuelta sobre "Seguridad alimentaria": el video se pausaba solo (o no se pausaba), el botón de play quedaba ovalado, y una trampa de especificidad que hay que dejar advertida en el kit (kit-base v1.9.25)](#649-cuarta-vuelta-sobre-seguridad-alimentaria-el-video-se-pausaba-solo-o-no-se-pausaba-el-botón-de-play-quedaba-ovalado-y-una-trampa-de-especificidad-que-hay-que-dejar-advertida-en-el-kit-kit-base-v1925)
- [6.50 Minijuego: las píldoras se estiraban al achicar la ventana, y "Producto alterado" pasa de trampa a hallazgo real con pista diferenciada (kit-base v1.9.26)](#650-minijuego-las-píldoras-se-estiraban-al-achicar-la-ventana-y-producto-alterado-pasa-de-trampa-a-hallazgo-real-con-pista-diferenciada-kit-base-v1926)
- [6.51 La barra de progreso "olvidaba" sesiones anteriores, y la barra de "pasos" de Rotación pasa a ser arrastrable — el bug más largo de encontrar de todo el curso (kit-base v1.9.27)](#651-la-barra-de-progreso-olvidaba-sesiones-anteriores-y-la-barra-de-pasos-de-rotación-pasa-a-ser-arrastrable-el-bug-más-largo-de-encontrar-de-todo-el-curso-kit-base-v1927)
- [6.52 Glosario interactivo: clic en un término navega a la diapositiva, y el glosario se desbloquea con el progreso real del curso (kit-base v1.9.28)](#652-glosario-interactivo-clic-en-un-término-navega-a-la-diapositiva-y-el-glosario-se-desbloquea-con-el-progreso-real-del-curso-kit-base-v1928)
- [6.53 Auditoría del sistema de puntos a pedido del cliente: un `award()` sin guard persistido en una actividad reintentable es puntaje infinito (curso, no kit)](#653-auditoría-del-sistema-de-puntos-a-pedido-del-cliente-un-award-sin-guard-persistido-en-una-actividad-reintentable-es-puntaje-infinito-curso-no-kit)
- [6.54 Auditoría de locuciones a pedido del cliente: un video de fondo compitiendo con la voz, y la prioridad de voz pasa a ser latina/argentina antes que la de EE.UU. (kit-base v1.9.30)](#654-auditoría-de-locuciones-a-pedido-del-cliente-un-video-de-fondo-compitiendo-con-la-voz-y-la-prioridad-de-voz-pasa-a-ser-latinaargentina-antes-que-la-de-eeuu-kit-base-v1930)
- [6.55 Controles de audio "cool": barra de volumen + línea de tiempo de locución, con popovers que se posicionan dinámicamente en vez de anclar por breakpoint (kit-base v1.9.35)](#655-controles-de-audio-cool-barra-de-volumen-línea-de-tiempo-de-locución-con-popovers-que-se-posicionan-dinámicamente-en-vez-de-anclar-por-breakpoint-kit-base-v1935)
- [6.56 Revisión general a pedido del cliente sobre "Seguridad alimentaria" — recorrido visual completo, 0 bugs reales encontrados, y 1 limitación de diseño preexistente que queda documentada (no corregida sin pedido)](#656-revisión-general-a-pedido-del-cliente-sobre-seguridad-alimentaria-recorrido-visual-completo-0-bugs-reales-encontrados-y-1-limitación-de-diseño-preexistente-que-queda-documentada-no-corregida-sin-pedido)
- [6.57 "Ayuda" deja de mezclar instructivo con configuración: dos botones flotantes, con valor agregado real (kit-base v1.9.36)](#657-ayuda-deja-de-mezclar-instructivo-con-configuración-dos-botones-flotantes-con-valor-agregado-real-kit-base-v1936)
- [6.58 Feedback puntual sobre lo entregado en §6.57: 5 correcciones reales, todas de kit salvo los íconos (kit-base v1.9.37)](#658-feedback-puntual-sobre-lo-entregado-en-657-5-correcciones-reales-todas-de-kit-salvo-los-íconos-kit-base-v1937)
- [6.59 Ronda de "10 mejoras al kit" a pedido del cliente: mobile como parte del diseño (no un parche), y 2 bugs reales de kit encontrados con las herramientas que se acaban de construir (kit-base v1.9.39)](#659-ronda-de-10-mejoras-al-kit-a-pedido-del-cliente-mobile-como-parte-del-diseño-no-un-parche-y-2-bugs-reales-de-kit-encontrados-con-las-herramientas-que-se-acaban-de-construir-kit-base-v1939)
- [6.60 Ronda "mejorar el kit al máximo": el contraste no fallaba en 5 categorías, fallaba el sistema de tokens — y `npm test` corría 6 de 7 tests (kit-base v1.9.40)](#660-ronda-mejorar-el-kit-al-máximo-el-contraste-no-fallaba-en-5-categorías-fallaba-el-sistema-de-tokens-y-npm-test-corría-6-de-7-tests-kit-base-v1940)
- [6.61 Ronda de feedback sobre "Seguridad alimentaria": el volumen de "Sonido" pasa a gobernar también la locución, y un bug real de popovers que se quedaban colgados tras un clic afuera (kit-base v1.9.40)](#661-ronda-de-feedback-sobre-seguridad-alimentaria-el-volumen-de-sonido-pasa-a-gobernar-también-la-locución-y-un-bug-real-de-popovers-que-se-quedaban-colgados-tras-un-clic-afuera-kit-base-v1940)
- [6.62 Discrepancia real entre lo reportado y lo aplicado — y el punto que faltaba: el repaso del minijuego pasa de capa a pop-up real (kit-base v1.9.41)](#662-discrepancia-real-entre-lo-reportado-y-lo-aplicado-y-el-punto-que-faltaba-el-repaso-del-minijuego-pasa-de-capa-a-pop-up-real-kit-base-v1941)
- [6.63 2 bugs reales reportados tras entregar v1.9.41: el volumen de locución no aplicaba sin reiniciar, y el glosario dejaba saltar el gate de avance (kit-base v1.9.42)](#663-2-bugs-reales-reportados-tras-entregar-v1941-el-volumen-de-locución-no-aplicaba-sin-reiniciar-y-el-glosario-dejaba-saltar-el-gate-de-avance-kit-base-v1942)
- [6.64 Lote de 7 mejoras "cinematográficas" reportado desde "Seguridad alimentaria" — 6 de 7 no existían en el kit real (kit-base v1.9.43)](#664-lote-de-7-mejoras-cinematográficas-reportado-desde-seguridad-alimentaria-6-de-7-no-existían-en-el-kit-real-kit-base-v1943)
- [6.65 Ronda de mejoras propuestas por Claude, no reportadas por ningún curso: linter de tokens, índice navegable, protocolo de relay más estricto, y fallback visual de video roto (kit-base v1.9.44)](#665-ronda-de-mejoras-propuestas-por-claude-no-reportadas-por-ningún-curso-linter-de-tokens-índice-navegable-protocolo-de-relay-más-estricto-y-fallback-visual-de-video-roto-kit-base-v1944)
- [6.66 Segunda tanda de la lista de 10 mejoras: peso de assets, lazy-load, modo revisión (deep-link + overlay + panel de tracking), y scaffolding de curso nuevo (kit-base v1.9.48)](#666-segunda-tanda-de-la-lista-de-10-mejoras-peso-de-assets-lazy-load-modo-revisión-deep-link-overlay-panel-de-tracking-y-scaffolding-de-curso-nuevo-kit-base-v1948)
- [6.67 Las 3 últimas de la lista de 10: regresión visual con screenshots, chequeo proactivo de suspend_data, y sprite de íconos — con un hallazgo real de flakiness en el camino (kit-base v1.9.50)](#667-las-3-últimas-de-la-lista-de-10-regresión-visual-con-screenshots-chequeo-proactivo-de-suspenddata-y-sprite-de-íconos-con-un-hallazgo-real-de-flakiness-en-el-camino-kit-base-v1950)
- [6.68 3 mejoras de animación/orden de aparición propuestas por Claude: stagger de hitboxes, crossfade en initShotSwap, y stagger de overlays de texto real (kit-base v1.9.51)](#668-3-mejoras-de-animaciónorden-de-aparición-propuestas-por-claude-stagger-de-hitboxes-crossfade-en-initshotswap-y-stagger-de-overlays-de-texto-real-kit-base-v1951)
- [6.69 Revisada final del kit: 16 bugs reales + 6 desalineaciones entre código y documentación (kit-base v1.9.52)](#669-revisada-final-del-kit-12-bugs-reales--6-desalineaciones-entre-código-y-documentación-kit-base-v1952)
- [6.70 El halo de hallazgo del minijuego, atrapado en el zip del otro chat — y el choque de numeración que lo dejó pasar (kit-base v1.9.53)](#670-el-halo-de-hallazgo-del-minijuego-atrapado-en-el-zip-del-otro-chat--y-el-choque-de-numeración-que-lo-dejó-pasar-kit-base-v1953)
- [7. Checklist de arranque rápido para un curso nuevo](#7-checklist-de-arranque-rápido-para-un-curso-nuevo)
- [7.1 Método de arranque con zip de referencia (kit-base + PDF + curso completo)](#71-método-de-arranque-con-zip-de-referencia-kit-base-pdf-curso-completo)
- [7.2 Generar la evaluación para Moodle](#72-generar-la-evaluación-para-moodle)
- [7.3 Checklist de consistencia de diseño — no reintroducir estos bugs](#73-checklist-de-consistencia-de-diseño-no-reintroducir-estos-bugs)
- [8. Kit master — estado actual](#8-kit-master-estado-actual)

---

## 0. Qué es un curso de este molde

Un solo `index.html` (SCORM 1.2, un SCO), **sin scroll de página**,
diapositivas a pantalla completa, en una **proporción panorámica fija**
(ver §2 para cuál usar y por qué — la resolución EXACTA en píxeles del
PDF de Illustrator puede cambiar entre clientes/rondas sin afectar nada
del código, siempre que se respete esa proporción). Solo **modo claro**.
Narración automática por voz. Progreso guardado en `cmi.core.suspend_data`
con bookmark de reingreso.

Tres niveles de estado (contrato fijo de `motor-slides.js`, ver
`spec-motor-slides.md`):

| Nivel | Qué es | Ejemplo |
|---|---|---|
| **Diapositiva** | Pantalla completa, una visible a la vez (`[data-slide][data-slide-index]`) | portada, índice, unidad 1... |
| **Capa** | Bloque que cambia dentro de una diapositiva, sin salir de ella (`[data-layers]`/`[data-panel]`/`[data-target]`) | tabs de conceptos, un caso por vez, una pregunta por vez |
| **Pop-up** | Overlay con fondo oscurecido (`[data-popup-trigger]`/`[data-popup]`) | instrucciones, repasos "Lo que vimos", logros |

---

## 0.1 Regla dura: `kit-base/` se edita en UN solo lugar — nunca desde una sesión de curso

**Si estás leyendo esto DESDE una sesión de curso** (el flujo normal:
zip de `kit-base/` + PDF, sin repo, un chat nuevo por curso) — esto te
aplica directamente, seguí leyendo antes de tocar ningún archivo
"genérico".

**La sesión de un curso nunca es el lugar donde `kit-base/` se corrige
de forma definitiva**, aunque ahí mismo se detecte el bug, se entienda
la causa raíz y hasta se aplique el fix. Podés (y a veces tenés que,
para no bloquear la entrega de ESE curso) parchear tu copia local —
pero ese parche no es la fuente de verdad de nada más que ese zip.

**Por qué esta regla existe — el costo real que tenía la versión
vieja del mecanismo, documentado en §6.17/§6.17.2**: una sesión de
curso encontraba y arreglaba un bug real del kit, lo aplicaba a su
copia local, entregaba el curso... y el `kit-base/` "canónico" nunca
se enteraba — el fix quedaba atrapado en un zip aislado. El próximo
curso arrancaba con el mismo bug, otra vez, porque nada garantizaba
que alguien lo trajera de vuelta a mano. Pasó más de una vez (§6.17,
§6.17.2, §6.18) antes de que esto se formalizara.

**El mecanismo, en 4 pasos:**

1. Durante una sesión de curso, cualquier cosa que surja y NO dependa
   de contenido de ESE curso (criterio ya fijado en §1: "¿esto lee
   algo del curso? si no, es del kit") es candidata a subir. **La
   sesión de curso relaya el SÍNTOMA y, si lo tiene, el diagnóstico —
   nunca un "fix ya aplicado" ni un número de versión de destino.**
   Motivo (documentado en §6.64): dos veces ya un hallazgo relayado
   como "ya corregido contra la vX.Y" resultó, al auditarlo acá, no
   corresponder a código real (1/6 puntos una vez, 6/7 la otra). Un
   parche local de ESE curso puede incluirse como referencia de lo que
   se probó, pero el diseño y el fix definitivo se hacen en este chat,
   una sola vez, contra el código real — no se copian a ciegas.
2. **Ese hallazgo se lleva, en un prompt, al chat dedicado exclusivamente
   a mejorar `kit-base/`** (este chat/documento es esa fuente de
   verdad) — nunca se da por "ya resuelto" solo porque la copia local
   del curso lo tiene.
3. En el chat dedicado: el hallazgo se **verifica contra el código
   REAL del kit** (nunca se aplica un diff a ciegas solo porque "así
   lo pasaron" — puede haber cambiado desde que se escribió el
   hallazgo), se aplica, se prueba (suite completa contra una copia de
   un curso corriendo el kit modificado — nunca alcanza con correr la
   suite contra el curso tal cual, que sigue usando SU copia vieja del
   CSS/JS) y se documenta acá (sección nueva, más changelog + versión
   en `kit-base/README.md`).
4. El `kit-base.zip` que sale de ESE chat, ya actualizado, es el que
   arranca el próximo curso — nunca un zip parcheado a mano desde una
   sesión de curso.

**Consecuencia práctica para el checklist de arranque (§7) y de
cierre**: los pasos que decían "actualizar `kit-base/`" o "releer este
archivo y editarlo" ya NO se hacen desde la sesión de curso — se hacen
acá. Ver la nota en cada paso.

**Dos zips con el mismo número NO son el mismo zip** (aprendido en
v1.9.53/§6.70, cuando dos chats de kit habían usado `v1.9.43` para
cosas distintas). El número de versión NO alcanza como identidad: si
dos ramas del kit avanzaron en paralelo, "los dos estamos en 1.9.43"
se LEE como sincronizado y no lo está. Consecuencias operativas:

- **Antes de fusionar dos kits, comparar contenido, no números**:
  `diff` de la lista de archivos + `grep` de los símbolos concretos
  que cada lado dice tener (nombres de función/clase reales, no
  secciones de changelog). El choque de v1.9.43 no se detectó
  comparando versiones — se detectó aplicando el kit sobre el curso
  real y viendo el marcado roto.
- **Un `§6.6x` a secas ya no identifica nada en un relay** entre
  chats: las secciones de dos `CLAUDE.md` no se corresponden. Citar
  siempre el símbolo real (`.d-mj-hotspot`, `_syncGate`) además del
  número de sección.
- **No renumerar retroactivamente** para "arreglar" un choque:
  reescribe un historial que el otro lado ya citó. Se registra el
  choque y se sigue.

---

## 1. Qué es genérico (se copia tal cual) vs. qué es del curso

Esta separación es la que hace posible el "gen". Al arrancar un curso
nuevo, los archivos de la columna izquierda **se copian sin tocar** (o
con cambios triviales de nombre de archivo); todo el trabajo real pasa
por la columna derecha.

| Genérico — no sabe nada del contenido | Específico del curso |
|---|---|
| `css/coto-base.css` — sistema de diseño (tokens, tipografías, categorías, `.alert`, `.modal`) | `css/assets.css` — capas `.d-shot-*` de ESTE curso |
| `css/coto-base-addendum-v1.8.css` — componentes "Learning" (tabs, stepper, carrusel, radial...) | `css/diapositivas.css` — layout de ESTAS diapositivas |
| `js/motor-slides.js` — motor de diapositivas/capas/pop-ups + hitboxes (`_initShots`, ver §2) | `css/pulido.css` — ajustes finales de coherencia de ESTE curso |
| `js/scorm-api.js` — wrapper SCORM 1.2 | `js/curso.js` — contenido, gamificación, narración, minijuegos |
| `js/xapi.js` — adaptador xAPI en paralelo | `imsmanifest.xml` — título/identificador de ESTE curso |
| `js/fx.js` — ripple, partículas, modo cine, efectos genéricos | `img/`, `video/` — assets exportados de ESTE PDF |
| `js/narrador.js` — voz + `textOf()` (qué texto narrar de un contenedor) | secciones de test que verifican texto/flujo propios del curso |
| `js/coto-player.js` — chrome del reproductor (saludo, toggles, voz, barra, toast, retomar) | |
| `js/coto-media.js` — los 3 patrones de video (fondo, pop-up, circular en el lugar) | |
| `js/coto-ui.js` — narración de pop-ups, entrada escalonada, count-up, precarga, sonidos, tiempo activo | |
| `js/coto-hotspots.js` — zonas sobre el arte que revelan información (§6.10.7) | |
| `js/coto-quiz.js` / `js/coto-cierre.js` — mini-práctica y cierre con festejo | |
| `tools/tests/*.mjs` (excepto los que auditan contenido puntual) | |

**Regla hermana, aprendida cuatro veces:** cuando un JS sube al kit,
**su CSS tiene que subir en la misma vuelta**. Pasó en v1.4, v1.6, v1.7
y v1.8: el síntoma siempre es un archivo del kit que usa clases que el
kit no define, así que "funciona" solo mientras se copie también el CSS
del curso anterior. Para verificarlo: comparar todas las clases `.d-*`
del CSS propio del curso contra las del kit y revisar una por una las
que no aparezcan.

**Regla al escribir código nuevo:** si una función no lee nada
específico del curso (no conoce IDs de diapositivas, textos, ni
lógica de puntaje) y solo opera sobre atributos `data-*` genéricos,
**va en el kit, no en `curso.js`**. Así el próximo curso la hereda
gratis. Desde el kit v1.7 hay un archivo para cada familia (motor,
narrador, player, media, ui, quiz, cierre, fx) — la pregunta al
escribir algo nuevo ya no es "¿lo dejo en curso.js?" sino "¿a cuál de
estos pertenece?". Lo único que debería quedar en `curso.js` es
**contenido**: textos, banco de preguntas, lógica de puntaje, IDs de
diapositiva y el cableado entre módulos. `initShots()` (hitboxes sobre
diapos-captura) ya vive en `motor-slides.js`
(`Motor.prototype._initShots`, corre solo desde `new Motor()`, igual
que las marcas de sección de la barra de progreso) — es el ejemplo a
seguir. `initConceptShots()` (precarga/swap de las 7 variantes de
imagen de conceptos) se QUEDÓ en `curso.js` a propósito: aunque el
patrón "tabs que cambian la imagen de fondo" es reusable, la función tal
como está tiene hardcodeados los nombres de los 7 conceptos de este
curso — si un curso futuro repite el patrón, generalizarla recién ahí
(parametrizar la lista de variantes), no antes.

**Narración de contenido con render propio en JS (minijuegos, práctica,
laboratorios):** si una diapo arma su contenido con `el.innerHTML = …`
en vez del sistema de capas (`[data-layers]`/`[data-panel]`), el motor
NO se entera de los cambios (no hay `layerchange`) y la narración se
queda muda después del primer nivel/pregunta. Regla: cada función que
re-pinta ese contenido (`render()`, `renderQ()`, etc.) tiene que
terminar con un llamado a `speak(...)` propio, guardado con
`if (narrating) { … if (!slideEl.hidden) speak(...) }` (el guard de
`hidden` evita narrar en el render() inicial de `boot()`, con la diapo
todavía oculta). Ver `initMinijuego`/`initQuiz` en curso.js del curso
base para el patrón exacto.

---

## 2. El patrón central: `.d-shot-slide--bg-layered`

Es la técnica que permite fidelidad 1:1 con la maqueta de Illustrator
sin recodificar cada diapositiva a mano.

1. **Del PDF exportado se sacan 2 capas por diapositiva** (o una sola
   si no hace falta separar):
   - **`bg-*.webp`** — el fondo completo de la página, a sangre.
   - **`img/<slide>/*.webp`** — piezas de contenido con **alfa real**
     (texto, tarjetas, personajes) recortadas del mismo PDF, que se
     posicionan como capas independientes encima del fondo.
   - Fondo y contenido deben quedar **registrados pixel a pixel**: es
     la misma imagen partida en dos. No mover una capa sin la otra
     (se probó parallax de solo-fondo y se sacó por esto — desalinea
     la costura al instante, ver README del curso base).
2. **HTML:** `.d-shot-bg` (fondo) + `.d-shot-img` (imagen base o de
   contenido) + N `.d-anim-item[data-hit]` (piezas sueltas) dentro de
   un contenedor `[data-shot]`.
3. **Posicionamiento:** cada pieza lleva `data-l/data-t/data-w/data-h`
   en **porcentaje contra el tamaño REAL mostrado de la imagen base**
   (no contra el contenedor). `initShots()` recalcula esto en cada
   resize/orientationchange leyendo `naturalWidth/Height`,
   `clientWidth/Height` y el `object-fit`/`object-position`
   **computados** (no asume `cover`+centrado):
   - `contain` → `scale = min(boxW/natW, boxH/natH)`
   - `cover` → `scale = max(boxW/natW, boxH/natH)`
   - offset según `object-position` real (0%=pegado al borde,
     50%=centrado, 100%=pegado al otro borde — misma fórmula que usa
     el navegador).
4. **Cuándo usar `cover` en vez de `contain`:** por defecto `contain`
   (la captura se ve entera, sin recortar). Usar `cover` con
   `object-position` explícito solo cuando hace falta sangrar 100%
   sin banda gris **y** hay margen de sobra de un lado para absorber
   el recorte sin comerse elementos clickeables (ver diapo de
   conceptos: `cover` + `0% 50%` porque las pestañas están pegadas al
   borde izquierdo, así que el recorte se come del derecho).
5. **Resolución de origen del PDF:** el sistema entero trabaja en
   **porcentajes**, nunca en píxeles absolutos del PDF. Cambiar la
   resolución de exportación de Illustrator **no requiere ningún cambio
   de código**, siempre que se mantenga la MISMA proporción — eso es lo
   que permite pasar de un tamaño en px a otro sin tocar una línea. Lo
   que sí importa mucho es **cuál proporción elegir**: ver el punto 6.
6. **Qué proporción usar (y por qué NO 21:9):** 21:9 (2,33:1) se probó
   en "Surtido sin venta" y resultó **más panorámica que cualquier
   pantalla real**. Con el header/footer del curso descontados (~120px),
   las resoluciones típicas dan: 1920×1080 → 2,00 · 1366×768 → 2,11 ·
   1440×900 → 1,85 · 2560×1440 → 1,94. Ninguna llega a 2,33. Resultado:
   con `contain` (nunca recorta) siempre sobra franja vacía arriba/abajo
   en cualquier pantalla real; con `cover` (llena siempre) el recorte
   varía según la ventana y en el peor caso se come contenido real (pasó
   en la diapo de "Rotación": la leyenda "Baja rotación" quedaba
   cortada). **Usar 2:1** como proporción de trabajo — está mucho más
   cerca del promedio real (~1,9–2,1) y reduce la franja/el recorte a
   casi nada en la inmensa mayoría de las pantallas.
   **Margen de seguridad (actualizado desde "Prevención
   cardiovascular" en adelante — ver §6.9 para el porqué): 8% arriba/
   abajo + 13% a cada costado**, sin texto/botones/logos ahí (solo
   fondo o decoración) — así el recorte residual en pantallas atípicas
   de escritorio (ultrawide, etc.) Y en tablets (ver `coto-shot-stage.css`,
   §6.9) nunca se comen contenido real. El margen lateral es más grande
   que el vertical a propósito: el recorte en tablet es siempre lateral,
   nunca arriba/abajo (ver §6.9). Instrucción lista para pasarle al
   diseñador/editor de video: 2:1 exacto (ej. 2520×1260 para el PDF,
   mismo criterio para los videos), con ~330px de margen horizontal
   (13%, a cada lado) y ~100px vertical (8%, arriba y abajo) — a esa
   resolución — libres de contenido importante en los bordes.
   **Cursos ya diseñados con el margen viejo (8% parejo en las 4
   direcciones, ej. "Surtido sin venta") siguen usando ese margen sin
   cambios** — esta instrucción nueva es para el PRÓXIMO PDF que se le
   pida al diseñador, no retroactiva.
7. **El contenedor tiene que estar fijado a la MISMA proporción que el
   PDF — si no, todo lo anterior no sirve.** Bug real encontrado: el
   `.d-shot` (la caja que contiene fondo+captura+hitspots) se dejó en
   `width:100%; height:100%` de `.slide`, que a su vez ocupa TODO el
   espacio libre entre header y footer — o sea, la forma real de la
   ventana del alumno, casi nunca la proporción del diseño. Con
   `object-fit:cover` eso escala/recorta una cantidad *distinta según
   cada ventana*, nunca la prevista. **Solución (CSS puro, sin JS):**
   fijar `.d-stage` como *size container* (`container-type: size`) y
   usar el doble `min()` con unidades `cqw`/`cqh` (a diferencia de
   `%`/`vw`/`vh`, SÍ se pueden combinar en el mismo `calc()`) para que
   `.d-shot` sea SIEMPRE la proporción exacta del diseño, con
   letterbox/pillarbox automático si la ventana no calza:
   ```css
   .d-stage { container-type: size; }
   .d-shot-slide--bg-layered > .d-shot,
   .d-shot-slide--bg-video > .d-shot {
     aspect-ratio: 2 / 1; /* la proporción elegida en el punto 6 */
     width:  min(100cqw, 100cqh * 2 / 1);
     height: min(100cqh, 100cqw * 1 / 2);
     margin: auto;
   }
   ```
   Con esto, `cover` recorta SIEMPRE la misma cantidad prevista por el
   diseño (nunca más), en cualquier ventana — es lo que hace que el
   margen de seguridad del punto 6 sea una garantía real y no una
   esperanza. **Validado con "Surtido sin venta" v2** (PDF 2520×1260,
   exacto 2:1): recorte real = 0 en todas las ventanas probadas, no hizo
   falta ajustar el margen de seguridad del 8%.
8. **Con imagen y contenedor EXACTAMENTE a la misma proporción, `cover`
   no recorta nunca** (recorte = 0 matemáticamente, no "en la práctica").
   Esto cambia el cálculo de costo/beneficio del punto 3 de §3: si el
   PDF se exporta ya a la proporción de trabajo exacta (§2.6), separar
   fondo+piezas en capas con alfa deja de ser necesario para "que no se
   recorte nada" — esa garantía ahora la da la proporción exacta, no el
   `bg-layered` con piezas sueltas. Ver §3 punto 3 (versión actualizada)
   y el nuevo criterio por defecto: **captura íntegra único**, reservar
   piezas separadas solo para necesidades reales de interacción/animación
   por pieza.
9. **Margen de seguridad ampliado para tablets (nuevo desde
   "Prevención cardiovascular" en adelante — NO aplica a cursos ya
   diseñados con el margen viejo, ver §6.8/§6.9):** el lienzo fijo 2:1
   garantiza cero recorte, pero en tablets (proporción de pantalla más
   angosta que 2:1) deja una franja vacía arriba/abajo bastante más
   grande que en desktop — reporte real de uso probando "Surtido sin
   venta" en tablet. La franja no se puede eliminar sin permitir ALGÚN
   recorte en ese rango de proporciones — la solución no es más código,
   es diseñar el PDF con más margen vacío a los COSTADOS (el recorte en
   tablet siempre es lateral, nunca arriba/abajo, ver razonamiento
   completo en §6.9) para poder recortar ahí con seguridad.
   **Instrucción nueva para el diseñador**: margen de seguridad
   **8% arriba/abajo (sin cambio) + 13% a cada costado** (antes 8%
   parejo en las 4 direcciones). Implementado en
   `kit-base/css/coto-shot-stage.css` — lienzo fijo 2:1 en pantallas
   cercanas a esa proporción (≥1.9), lienzo a pantalla completa
   (recortando dentro del margen de 13%) en el rango de tablet
   protegido (1.5–1.9), vuelve al lienzo fijo (letterbox) fuera de ese
   rango. **Ojo con la proporción que hay que medir**: no es la
   proporción cruda del dispositivo/viewport — hay que restar el alto
   fijo del header+footer del área real de la diapositiva. Un iPad "es"
   4:3 (1.33) pero el `.d-stage` real en un iPad landscape mide
   ≈1.58 — confundir estos dos números fue el error real de la 1ª
   pasada de este cálculo (se había calculado con la proporción del
   dispositivo, no la del `.d-stage`, dando un margen sobrestimado de
   17% en vez de los 13% reales necesarios).

---

## 3. Flujo: de "PDF de Illustrator" a curso terminado

Este es el proceso que el cliente/vos van a repetir en cada curso
nuevo. Documentarlo acá es el punto central de este archivo.

1. **Recibir el PDF exportado de Illustrator** (una página por
   diapositiva, en la proporción de trabajo vigente — ver §2.6, hoy
   **2:1**, con margen de seguridad de **8% arriba/abajo + 13% a los
   costados** (desde "Prevención cardiovascular" en adelante — ver
   §6.9; cursos anteriores usan el margen viejo, 8% parejo) — con
   todas las diapositivas del guion ya diagramadas — portada, índice,
   contenido, cierre, etc). Mismo criterio de proporción + margen para
   los videos que entregue el cliente (ver §2.6 para la instrucción
   exacta a pasarle al diseñador y al editor de video).
2. **Renderizar cada página a `.webp`** a la resolución de trabajo
   vigente (el valor exacto en píxeles no importa, lo que importa es
   respetar la proporción — ver §2.5/§2.6).
3. **Para cada diapositiva, decidir (criterio actualizado desde "Surtido
   sin venta" v2 — ver §2.8):**
   - **Por defecto: captura íntegra** — una sola imagen (`.d-shot-img`)
     con TODO el contenido de la página horneado, sin `.d-shot-bg` ni
     piezas `.d-anim-item` separadas. Con el PDF exportado exacto a la
     proporción de trabajo (§2.6), `cover` no recorta nada, así que no
     hace falta la separación fondo/piezas para garantizar fidelidad.
     Encima de la imagen van solo los elementos HTML que necesitan ser
     REALMENTE interactivos: botones invisibles (`.d-shot-hit`) sobre
     zonas clickeables (play de video, tarjetas de pop-up, tabs que
     cambian de imagen completa — ver diapo "conceptos"), con `alt`/
     `sr-only` para accesibilidad y narración. Es el patrón que ya usan
     "conceptos" y "cierre" desde el origen del curso base.
   - **Excepción — piezas separadas con alfa (`bg-layered` "clásico",
     fondo + `img/<slide>/*.webp` con alfa real):** usar SOLO cuando la
     diapo necesita animar la ENTRADA de piezas individuales por
     separado (stagger tipo "armado en cámara") y ese efecto no se puede
     lograr con CSS puro sobre un overlay HTML de texto encima de la
     imagen íntegra. Requiere que el diseñador exporte cada pieza como
     capa Illustrator independiente con alfa — más trabajo de exportación
     y más superficie de bugs (posicionamiento % por pieza, registro
     pixel a pixel fondo/pieza) que la captura íntegra. Pensar dos veces
     antes de pedirlo: casi siempre alcanza con captura íntegra + stagger
     CSS sobre un `<div>` de texto real superpuesto.
4. **Extraer coordenadas de hitboxes** (`data-l/t/w/h`) midiendo la
   posición de cada elemento clickeable como % del lienzo completo.
   **Regla dura, aprendida en "Surtido sin venta" v2:** si el cliente
   reexporta un PDF ya existente (mismo contenido, "mismo layout" a
   simple vista, nueva proporción o nueva resolución), **remedir SIEMPRE
   las coordenadas contra el render nuevo, nunca reusar las % viejas**
   — aunque el elemento clickeable esté dibujado DENTRO de la imagen
   (como las píldoras de "conceptos", horneadas en el PDF, no HTML). Un
   reflow de layout menor entre versiones (por Illustrator, por el
   diseñador ajustando márgenes) desplaza esos elementos unos puntos %
   y las zonas de clic quedan pisando el borde del vecino — bug real
   encontrado en las 7 pestañas de "conceptos" al pasar de 21:9 a 2:1:
   se veían bien (el resaltado activo está horneado en la imagen) pero
   el click real caía corrido. Detectarlo a simple vista es difícil
   porque el arte se ve perfecto; hay que medir en píxeles (script
   Python con PIL: escanear filas/columnas no-blancas para encontrar
   el borde real de cada pieza) o superponer un overlay de debug con
   Playwright (dibujar `getBoundingClientRect()` de cada `[data-hit]`
   en rojo sobre un screenshot) y comparar visualmente contra el arte.
   Vale para CUALQUIER curso con capas/hitboxes sobre imagen — no es
   un caso aislado de este curso, va a repetirse en todos.
5. **Escribir el HTML de la diapositiva** siguiendo el contrato del
   motor (`[data-slide]`, `[data-layers]` si aplica, `[data-popup]`
   si aplica) + capas `.d-anim-item[data-hit]`.
6. **Texto real siempre como HTML accesible encima de la imagen**
   (nunca solo dentro del webp): `<h1>/<h2>` oculto (`sr-only`) con
   el título real, botones invisibles sobre las hitboxes con texto
   accesible, `alt=""` + `aria-hidden="true"` en las imágenes
   puramente decorativas.
7. **Narración:** todo texto leído en voz alta pasa por `speechify()`
   antes de `speechSynthesis` (corrige siglas — ver §5) — nunca se
   toca el `alt` visible/accesible, solo lo que se dice.
8. **Gamificación que no tiene página en el PDF** (minijuegos,
   laboratorios interactivos, evaluación) se construye como interfaz
   propia con el sistema de componentes COTO (`coto-base.css` +
   addendum), no como captura — documentar la decisión en el README
   del curso bajo "decisiones que se apartan del brief".

   **⚠️ Obligatorio en TODO curso, no opcional (regla fija del
   cliente desde "Uso de Sucursales 3 - NOA" — ver §6.17.1):**
   logros + puntos (chip del header + `initCierreCelebration` con
   medalla real), glosario con términos del curso, al menos una
   mini-práctica/quiz (`coto-quiz.js`), y que las interacciones del
   curso (hitboxes, hotspots, videos vistos) sumen puntos de verdad,
   no queden en "gate sin premio". Si un curso puntual no tiene
   contenido natural para alguna de estas piezas (ej. no hay términos
   técnicos para un glosario), **no se saca el elemento en silencio**
   — se arma con lo que haya (aunque sea un glosario corto) o se lo
   consulta explícitamente con el cliente antes de entregar sin él.
   Ver §6.17.1 para el caso real que disparó esta regla.
9. **Placeholders de video:** si el cliente todavía no entrega los
   videos finales, dejar archivos placeholder con el **nombre exacto**
   que van a tener los reales, mismo `src` en el HTML — el cliente
   reemplaza el archivo sin tocar código. **Ojo con nombres de archivo
   con tildes/ñ al armar el zip de entrega**: en este entorno, `zip`
   sin forzar codificación (o con locale no-UTF-8) puede guardar el
   nombre mal (ej. "Cómo" queda como "C#U00f3mo") y se ve roto en
   Windows/7-Zip aunque en el visor de acá parezca normal. Antes de
   entregar, generar el zip forzando el flag UTF-8 en cada entry
   (con Python: `zipfile.ZipInfo` + `zi.flag_bits |= 0x800`) y
   verificarlo reabriendo el zip y chequeando ese flag — no confiar en
   que "se ve bien" en el propio listado.
   ⚠️ **Trampa de `zipfile`**: poner `flag_bits` en el `ZipInfo` ANTES
   de `writestr()` **no sirve** — `_open_to_write()` lo pisa con `0x00`
   internamente. Hay que volver a ponerlo recorriendo `z.filelist`
   DESPUÉS de escribir todo y ANTES de `z.close()` (que es cuando se
   escribe el directorio central, el que leen los descompresores).
   El `assert` de verificación al final atrapa exactamente esto.
10. **Correr la suite de tests** (`tools/tests/`, ver §6) antes de
    dar por cerrado el curso.
11. **`imsmanifest.xml`:** clonar el de un curso anterior, cambiar
    `identifier`/`title`/`ORG_ID`/`ITEM_ID`/`RES_ID` y el criterio de
    completado (¿hay evaluación calificada dentro del SCO o es un
    cuestionario aparte en Moodle? — no declarar `masteryscore` si no
    corresponde).
12. **Nunca entregar el zip final sin que el cliente/vos lo pida
    explícitamente** — regla fija de proceso, no técnica.
13. **`loading="lazy"` en TODO `.d-shot-img` salvo la primera
    diapositiva** (kit-base v1.9.48). Cada diapositiva es un `.webp`
    de página completa (~100-250 KB) y las secciones `[data-slide]`
    ya están todas en el DOM desde el arranque — sin este atributo el
    navegador pide las ~25-30 imágenes de un curso típico ENTERAS al
    cargar la página, aunque el alumno nunca pase de la diapositiva 3.
    `initPrefetchNeighbors()` (`coto-ui.js`) ya evita el parpadeo al
    navegar (precarga la vecina siguiente/anterior con `slidechange`)
    — pero eso es una optimización SOBRE una carga que, sin este
    atributo, ya fue 100% eager desde el HTML. Confirmado con
    Playwright que las dos piezas cooperan bien: (1) con la geometría
    real del motor (`[data-slide]{position:absolute;inset:0}`), un
    `<img loading="lazy" hidden>` NO se pide al cargar la página y SÍ
    se pide en cuanto `_syncNav()` saca el `hidden` de su diapositiva;
    (2) el prefetch de `initPrefetchNeighbors()` usa `new Image()` —
    un objeto aparte del `<img>` real del DOM, así que el atributo
    `loading` no lo afecta, y al llegar a esa diapositiva el
    navegador sirve la imagen desde caché en vez de re-pedirla.
    **Esto tiene que ir en el HTML que arma cada curso** — kit-base no
    genera el marcado de las diapositivas, así que no hay forma de
    aplicarlo retroactivamente desde acá: agregarlo vía JS después de
    que el HTML ya parseó NO sirve (verificado: el navegador ya
    disparó el pedido de red mucho antes de que corra cualquier
    `<script>`, aunque el script le asigne `loading='lazy'` al toque).
    La primera diapositiva queda afuera a propósito: es la única que
    el alumno ve sin haber navegado nunca, `loading="lazy"` ahí solo
    agregaría latencia sin ningún beneficio.

---

## 4. Sistema de diseño (`coto-base.css` + addendum)

- **`coto-base.css`** (versionado, ej. v1.1): tokens (`--brand`,
  `--cat`, `--surface`, `--line`, `--shadow-card`, `--r`...),
  tipografías del sistema, las categorías reales del manual (21 +
  2 excepciones de Zona E!), colores funcionales
  (éxito/advertencia/error/info) y `.alert`/`.modal` base. **No se
  toca por curso** salvo que falte un token real del manual.
- **`coto-base-addendum-v1.8.css`**: componentes de capa "Learning"
  que no están en la base pero se repiten entre cursos —
  `.tabs-v`/`.tabs-h`/`.stepper-h`/`.carousel`/`.toggle-seg`/
  `.radial`/`.alert-inline`. Depende de los tokens de la base, no
  redefine nada. **Cuándo agregar un componente acá vs. dejarlo en
  el CSS del curso:** si la pieza es genéricamente útil (un patrón de
  interacción, no un layout puntual de una diapositiva) y hay
  chance de que otro curso la necesite, sube al addendum;
  bump de versión + una línea en el header del archivo listando qué
  se agregó y en qué curso se detectó la necesidad.
- **Tipografías fijas:** Roboto (contenido), Faible (títulos/impacto),
  Raleway (detalles puntuales). `basis33` (pixel font) **solo** si el
  curso tiene un minijuego retro — no es parte del set base. **Anton
  SC y Unbounded están descartadas por decisión de cliente** (se
  probaron, no convencieron) — no reintroducirlas sin que lo pida
  explícitamente un cliente nuevo. Los `.woff2` reales (Faible-Black,
  Roboto ×4, Raleway ×2, con licencia del cliente) viven en
  `kit-base/fonts/` desde v1.6 — antes cada curso arrancaba con 404 en
  las fuentes hasta que alguien lo notaba.
- **Encabezado de pop-up: dos variantes, y la elección NO es estética.**
  `.modal-hd` (degradado de categoría, texto oscuro) es la de siempre;
  `.modal-hd--dark` (fondo sólido `--cat-strong`, texto blanco) se
  agregó en v1.6 para pop-ups de impacto. **Blanco sobre `--cat`
  (#1EB4BE) da 2.52:1 y NO pasa WCAG AA** — es el error fácil de
  cometer al querer "un header más lindo". Blanco sobre `--cat-strong`
  (#008296) da 4.53:1 y sí pasa. El navy #1E2D46 sobre el degradado da
  4.39-6.93:1, muy por encima del 3.0 que pide texto grande. Regla:
  **medir el contraste antes de invertir un color de header**, no
  después.
- **Las dos variantes de encabezado NO se mezclan dentro de un mismo
  curso.** Hallazgo visual real: quedaron 4 pop-ups con encabezado
  claro y 1 con oscuro, y la diferencia se leía como un error de diseño
  aunque las dos variantes fueran correctas por separado. **Es un
  problema de consistencia, no de accesibilidad** — hay que decir cuál
  es cuál al reportarlo, porque el arreglo es distinto. Al elegir una
  variante para un pop-up, aplicarla a TODOS.
- **`.modal-hd` es `position:sticky`** (v1.7): en un pop-up largo
  (glosario de 16 términos) el título se iba con el scroll y se perdía
  el contexto de qué se estaba leyendo.
- **Toda animación de entrada tiene que verse bien SIN animación.**
  `.d-stagger-in` arranca en `opacity:0` con `both`: si la regla global
  de `prefers-reduced-motion` (`*{animation:none!important}` en
  `coto-base.css`) no estuviera, un alumno con movimiento reducido
  vería el contenido **invisible**, no "sin animación". Vale para
  cualquier efecto de entrada nuevo: el estado visible nunca puede
  depender de que la animación efectivamente corra.
- `data-cat="<categoría>"` en `<body>` resuelve la paleta de esa
  categoría (Área Salón, etc.) contra las variables de la base.
- **Ícono de marca del curso en el header**: va como `<img>` real
  (`img/icono-<área>.webp`) — no como SVG inline improvisado. Lo
  entrega el cliente junto con el PDF; si todavía no llegó, dejar el
  archivo con el nombre final y reemplazarlo después sin tocar código
  (mismo criterio que los videos, §3.9).

---

## 5. Narración por voz

- Web Speech API (`speechSynthesis`), sin dependencias externas.
- Velocidad fija: **1.15x**.
- Voz preferida: **es-US** ("Google español de Estados Unidos") por
  sobre es-ES — decisión de cliente (acento).
- `speechify(text)` corrige pronunciación de siglas/nombres propios
  ANTES de hablar (ej. PLU → "pe ele ú", GESCOM → queda plano) — es
  una función de mapeo simple, se extiende agregando pares
  sigla→pronunciación al diccionario interno, uno por curso según el
  vocabulario específico del contenido. **Nunca toca el `alt` o texto
  visible**, solo la copia que se le pasa al sintetizador.
- No lee el nombre del curso/marca ni títulos repetidos dentro del
  propio texto (se sacó por ruido/redundancia).
- Se narra sola cada diapositiva al entrar, con pausa siempre
  disponible; pop-ups y capas se narran solos al abrirse, se callan
  al cerrarse.
- **Una diapositiva que ES un video no se narra**, y eso no es un
  hueco a tapar: el video trae su propia locución y narrar encima sería
  contraproducente. Igual lleva su título real en `sr-only` para
  lectores de pantalla — o sea, queda muda pero NO queda inaccesible.
  Ojo al auditar: un test que cuente "diapositivas sin narración" va a
  marcarlas, y son correctas. Lo mismo hace `coto-media.js` al
  reproducir cualquier video (`Narrador.cancel()`): la voz nunca compite
  con el audio de un video.

---

## 6. Testing (`tools/tests/`, Playwright)

Suite mínima que debería existir en TODO curso de este molde antes de
entregar (los primeros 4 son genéricos — se adaptan solo en selectores
de IDs de diapositivas, no en lógica):

- `deep-audit` — recorrido completo, consistencia general.
- `full-regress` — regresión de principio a fin.
- `hitbox-click-check` — cada `[data-hit]` es clickeable y dispara lo
  esperado.
- `scroll-audit` — **cero scroll** en ninguna diapositiva, en un set
  de resoluciones/viewports.
- `keyboard-a11y` — recorrido 100% por teclado (flechas + Esc),
  indicador de foco visible, nombre accesible en todos los botones,
  `alt` en todas las imágenes, respeto de `prefers-reduced-motion`.
- `check-cierre-flow` (o equivalente) — específico del curso: valida
  el flujo de cierre/certificación puntual.

Antes de dar un curso por terminado: **correr toda la suite, 0 fallos.**

---

## 6.5 Manuales oficiales de marca y contenido (fuente de verdad)

El cliente entregó dos manuales oficiales — **`Manual_de_diseño.pdf`** (65
págs., cubre marca "Formación", sistema de color/tipografía por
categoría, estructura de curso) y **`Manual_de_Contenido.docx`** (guía de
redacción/tono) — leídos completos y contrastados contra
`coto-base.css`/`curso.js` reales (no contra suposiciones). Quedan como
la referencia oficial de acá en más; lo que sigue es el resumen
accionable, con lo ya cumplido marcado para no re-auditar de cero cada
vez.

### Colores por categoría — YA CORRECTO, no tocar

Se comparó cada uno de los 21+2 valores hex de `coto-base.css` contra la
tabla oficial del manual (paleta monocromática de 6 pasos por categoría,
p.26–27 — el color de marca/identidad de cada categoría es **Valor 3**).
**Coinciden exactamente** en las 15 Sucursales + 5 Central + Zona E! +
las 2 excepciones (Gourmet/Cumples) — `--cat` = V3, `--cat-strong` = V1,
`--cat-soft` = V5, `--cat-grad` = V2→V4 en las 15+5, consistente en
TODAS. Conclusión: **quien armó `coto-base.css` ya había leído bien el
manual** — no hace falta re-derivar nada. Al agregar una categoría nueva
que hoy no esté en el CSS, usar el mismo criterio (V3/V1/V5/V2→V4) leído
directo de la tabla del manual, no inventar valores.

### Tipografía — confirmado, con una escala de referencia nueva

Faible (Black, títulos) + Roboto (Regular/Medium/Bold/Black/Italic,
lectura) son exactamente lo que especifica el manual (p.9, p.23,
p.24). **Raleway no aparece en el manual** — no es una contradicción
(el manual simplemente no cubre "detalles puntuales"), se mantiene como
decisión propia del proyecto ya documentada en §4. Anton SC/Unbounded no
aparecen tampoco — consistente con el rechazo ya registrado.

Escala tipográfica oficial de Storyline 360 (p.24) — útil como
**referencia de jerarquía relativa** (título > subtítulo > destacado >
párrafo), no como valores px/rem literales a copiar 1:1: nuestro medio
es HTML responsive a pantalla completa, no un canvas fijo de Storyline,
así que el número de pt no traduce directo, pero la PROPORCIÓN entre
niveles sí debería respetarse:

| Uso | Fuente | Tamaño Storyline |
|---|---|---|
| Título del curso | Faible Black | 54pt |
| Bajadas de título | Roboto | 28pt |
| Título de diapositiva (sin contenedor) | Faible Black | 40pt |
| Título de diapositiva (con contenido) | Faible Black | 28pt |
| Subtítulos | Roboto Bold | 22pt |
| Destacados | Roboto Bold | 20pt |
| Párrafos | Roboto Regular/Bold/Italic | 18pt |

### Gaps reales del manual (no inventar reglas que no existen)

- **Logo:** las secciones "Usos permitidos/prohibidos/aplicación sobre
  fondos/convivencia con marcas" están en el índice pero las páginas
  salen en blanco en la extracción — no hay regla de tamaño mínimo,
  área de resguardo ni "qué no hacer" recuperable de este PDF. Si hace
  falta esa info, pedirla aparte al cliente, no asumir.
- **Margen de seguridad (nuestro 8%, ver §2.6):** el manual no define
  ningún grid/margen oficial — nuestra regla no está contradicha, pero
  tampoco corroborada por el manual; es una convención propia, no
  citarla como "del manual".
- **Colores funcionales (éxito/error/advertencia/info):** no existen en
  el manual — los que usamos son decisión propia, válida, pero no
  "cumplimiento de manual".
- **Border-radius/shadow numéricos:** el manual solo muestra
  botones/pills/tabs cualitativamente (sin valores px) — nuestros
  tokens `--r`/`--shadow-card` no se pueden validar ni invalidar contra
  esto.

### Reglas de contenido/redacción — nuevas, aplicar desde el próximo curso

Del `Manual_de_Contenido.docx`, reglas concretas que HOY no están
formalizadas en ningún lado del proceso (aplicar en cada curso nuevo,
revisar si corresponde retrofit en cursos ya cerrados):

- **Vos/nosotros mezclado según función**, no un solo registro fijo:
  "nosotros" para presentar contexto/tema ("vamos a aprender..."),
  "vos" para instrucciones concretas ("ingresá...", "seleccioná..."),
  vuelta a "nosotros" para retomar la explicación guiada.
- **Números siempre en dígitos**, nunca escritos en palabras — sin
  excepción de magnitud. ("Llevá 2 paquetes", no "Llevá dos paquetes".)
- **Lenguaje de género neutro para roles**: "el personal de Cajas" /
  "los colaboradores del sector", nunca "el cajero/la cajera". Aplica a
  todos los roles y sectores, siempre.
- **Objetivos de aprendizaje: exactamente 3**, cada uno arranca con un
  verbo en infinitivo de una lista aprobada (Identificar, Conocer,
  Aplicar, Detectar, Asumir — no repetir verbo entre los 3), progresión
  A: qué es → B: cómo funciona → C: cómo se aplica. "Entender" NO es un
  verbo válido (ejemplo del manual de qué evitar: "Entender el proceso
  de limpieza" está marcado como "vago, sin verbo de acción").
- **Últimos consejos: exactamente 5 tips**, siempre 2ª persona +
  imperativo, una oración corta cada uno, justo antes del cierre.
- **Mayúsculas de títulos**: sentence case (solo la primera palabra en
  mayúscula), excepto nombres propios, siglas y nombres de sector/
  sistema (Cajas, Salón, GESCOM, EMC, Track3...). Ojo: el "nombre
  completo" del curso en Moodle es la ÚNICA excepción — ese sí va con
  mayúscula por palabra (Title Case), a propósito, distinto del resto.
- **Punto final**: frase con verbo → lleva punto; título/etiqueta sin
  verbo → sin punto.
- **Negrita con criterio**: solo para el término clave que se define
  por primera vez, una acción crítica que no se puede saltear, o un
  número/código/nombre de sistema importante — "si hay demasiadas
  negritas en una diapositiva, ninguna llama la atención".
- **Nombres de botones/menús/campos entre comillas** en el texto Y en
  la narración: `hacé clic en "Guardar"`.
- **"Una idea por pantalla"**: si el colaborador no puede leer y
  retener el contenido en una sola pantalla, hay que partirlo — bloques
  de 3 a 5 elementos (de ahí que los objetivos sean 3, no 8).
- **Texto + imagen, nunca texto sobre texto**: la imagen tiene que
  aportar información, no decorar. (Esto respalda el patrón de captura
  íntegra: si el HTML pone texto real ENCIMA de una imagen que ya tiene
  texto horneado, se está violando esta regla — cuidado al decidir
  overlays de texto sobre capturas.)

### Narración obligatoria vs. opcional — RESUELTO en "Prevención cardiovascular"

El manual distingue narración **obligatoria** (título + párrafo
principal, se reproduce sola al entrar) de **opcional** (bullets/
tarjetas secundarias, con ícono de sonido que el colaborador aprieta si
quiere escucharlo — si no lo aprieta, sigue leyendo). Hasta el kit v1.6
el pipeline narraba TODO el texto accesible de una sola, sin distinguir
— quedaba anotado acá como decisión de producto pendiente.

**Se resolvió en el marcado, no con código nuevo** (kit v1.7,
`coto-ui.js` → `initPopupNarration`): el atributo **`[data-narrate-only]`**
acota qué se narra dentro de un pop-up. Si está, se narra solo ese
nodo; si no está, se narra el pop-up entero como siempre — o sea,
retrocompatible y opt-in por diapositiva.

**Caso real que lo disparó** (vale como criterio para decidir cuándo
usarlo): al ampliar el glosario a 16 términos, narrarlo entero pasaba
de ~50 segundos a **más de 3 minutos** de locución seguida. Un glosario
es material de **CONSULTA** — se abre para buscar un término puntual,
no para escuchar de corrido. Regla práctica: si el contenido del pop-up
se **consulta** (glosario, tabla de referencia, listado largo), narrar
solo la frase de entrada con `[data-narrate-only]`; si se **lee de
principio a fin** (una explicación, un repaso "Lo que vimos"), narrar
todo.

### Bug real confirmado: re-narrar la consigna fija en cada paso de una actividad multi-paso

Reporte real de uso (no del manual, feedback directo sobre "Surtido sin
venta" ya entregado): en **mini-práctica** (5 preguntas) y
**minijuego** (10 niveles), la narración repite la consigna/intro fija
completa CADA VEZ que se pasa a la siguiente pregunta/nivel, además de
narrar lo nuevo — molesto de escuchar 5 o 10 veces seguidas.

**Causa raíz encontrada en el código** (`curso.js` del curso base):
`narrateStep()` (minijuego) y el narrado de `renderQ()` (mini-práctica)
llaman a `speak(slideText(slideEl))` en cada re-render, y `slideText()`
concatena TODO el texto visible de la diapositiva (`.slide-lead, p, li,
dd`) — incluida la introducción fija que no cambia entre preguntas/
niveles, no solo el contenido nuevo del paso actual.

**Regla para el próximo curso** (aplicar en `curso.js`, patrón
genérico — no requiere cambios en `narrador.js`/motor): en cualquier
actividad de varios pasos dentro de la misma diapositiva
(mini-práctica, minijuego, laboratorio, o lo que venga), separar:
- **Narración de intro/consigna**: se narra UNA sola vez, al entrar a
  la diapositiva (ya cubierto por `speakCurrent()` en `slidechange`) —
  NO debe volver a incluirse en la narración de cada paso siguiente.
- **Narración por paso**: en cada `render()`/`renderQ()` posterior, se
  narra SOLO el contenido específico de ese paso (la pregunta N, el
  feedback, las opciones) — nunca el `.slide-lead`/párrafo introductorio
  de la diapositiva completa.

En la práctica: no reusar `slideText(slideEl)` (que barre TODA la
diapositiva) para narrar un paso individual — armar un texto acotado
solo con los nodos del paso actual (mismo criterio ya usado para el
laboratorio de falso stock con `[data-lab-text]`, ver `slideText()`:
ahí también se evitó traer de vuelta la consigna estática, esto es
extender ese mismo criterio a mini-práctica/minijuego, que hoy no lo
aplican). Pendiente aplicar en el próximo curso — no se tocó en
"Surtido sin venta" (cerrado); si se decide parchearlo ahí también,
hacerlo aparte como fix puntual, no como parte del kit.

### Tabla fonética oficial para narración — ampliar el diccionario

El manual trae una tabla oficial de reescritura fonética para TTS
(término original → cómo escribirlo en la locución, sin tocar el texto
visible), más amplia que el diccionario actual (`SPEECH_FIXES` en
`curso.js`, hoy solo PLU/GESCOM/EAN — específico de este curso):

| Término | Locución |
|---|---|
| Ticket | Tíquet |
| Enter | Énter |
| DNI | deneí |
| Multistore | Múltiestór |
| OK | okéy |
| Voucher | váucher |
| CRM | Ce erre eme |
| Power Apps | Pábuer áps |
| Call Center | Col Sénter |
| Online | onláin |
| STS | ese te ese |
| WEB | güeb |
| PLU | pe ele uh |
| Cashback | cáshback |
| PIN PAD | PíNPAD |
| Contactless | cóntact les |
| NFC | ene efe ce |

Confirma que el criterio actual de PLU (deletrear) es correcto y
avalado por el manual — aunque el texto exacto difiere ("pe ele uh" del
manual vs. "pe ele ú" que usamos hoy, variación menor, revisar si
conviene alinear literal). **Acción pendiente para el próximo curso**:
`speak()`/`speechify()` son 100% genéricos (wrapper de Web Speech API,
sin nada específico del curso) y HOY viven enteros en `curso.js` —
deberían migrar a `motor-slides.js`/`fx.js` (mismo criterio que
`initShots()`, ver §1), con esta tabla oficial como diccionario BASE
genérico, extendido por un array chico de términos propios en cada
`curso.js` (como hoy GESCOM, específico de "Surtido sin venta"). No se
tocó en el curso ya cerrado — es tarea para cuando se arranque el
próximo.

### Gap identificado, no bug: framing de prácticas/evaluaciones

El manual NO tiene ninguna regla sobre cómo hablar de errores/puntaje/
"esto no cuenta para la nota" — el fix que se hizo en un curso anterior
sobre esa frase fue un buen criterio propio, pero no está respaldado
por texto del manual (tampoco contradicho). Vale la pena sugerirle al
cliente que lo agregue como regla explícita a su propio manual de
contenido — hoy es una norma de equipo no escrita en ningún lado
oficial.

---

## 6.6 Rediseño de la barra superior (`.d-top`) — kit-base v1.1

Rediseño completo pedido por el cliente sobre "Surtido sin venta": la
barra tenía hasta 7 botones-ícono idénticos en fila sin agrupar, sin
texto, y el saludo del alumno no tenía lugar fijo. Quedó resuelto,
extraído al kit (`kit-base/css/coto-player-chrome.css` +
`kit-base/header-boilerplate.html`) y validado de forma aislada (ver
kit-base/README.md) — usar ese archivo tal cual en el próximo curso,
no repetir el proceso de diseño desde cero. Lecciones reales de esta
vuelta, todas con bug concreto encontrado y corregido:

1. **Centrado real vs. centrado matemático.** Un bloque centrado con
   grid de 3 columnas iguales (`1fr auto 1fr`) queda centrado contra
   el ANCHO TOTAL del contenedor — si los bloques de los costados
   tienen anchos distintos (típico: marca angosta a la izquierda,
   2+ grupos de controles a la derecha), el centro se ve corrido hacia
   el lado más ancho. Fix: 2 spacers `flex:1` independientes a los
   costados del bloque central (no 1 solo, no grid de columnas
   iguales) — reparten el espacio SOBRANTE real, no el ancho total.
2. **`display:grid` sin columnas apila en vez de poner en fila.** Un
   botón con ícono+texto que hereda `display:grid;place-items:center`
   (pensado para un solo hijo) apila ícono y texto en filas separadas
   en vez de ponerlos uno al lado del otro — grid sin
   `grid-template-columns` explícito mete cada hijo en su propia fila
   implícita. Fix: `display:flex;flex-direction:row` para cualquier
   botón con más de un hijo visual.
3. **`justify-content:center` no es opcional en un botón ícono+texto
   que a veces queda solo-ícono.** Sin esa propiedad, cuando el texto
   se oculta (mobile) el ícono queda pegado a un costado del botón
   mientras el fondo/aro de estado activo (`.is-on`) sí ocupa el
   botón completo — ícono y resaltado quedan visualmente
   desalineados entre sí. Encontrado probando el botón de locución en
   mobile con la voz activada por defecto.
4. **flex-wrap no "encoge para que quepan más ítems por línea".** El
   algoritmo de wrap de flexbox decide cuántos elementos entran en
   cada línea usando el ancho SIN achicar de cada uno; `flex-shrink`
   solo actúa DESPUÉS de que un elemento ya quedó asignado a una
   línea. Un bloque con `flex-shrink` permitido igual puede terminar
   solo en su propia línea si no entraba "justo" junto al anterior —
   nunca cambia CUÁNTOS elementos comparten línea. Para forzar que 2
   bloques compartan SIEMPRE una sola línea (encogiéndose con elipsis
   si hace falta), hay que sacarlos del wrap general y ponerlos en su
   propio contenedor con `flex-wrap:nowrap`.
5. **2 filas independientes con `space-between` cada una ≠ columnas
   alineadas entre sí.** Si fila 1 y fila 2 son 2 flex containers
   separados, cada uno calcula su propio "punto de corte" según el
   ancho de SU contenido — con contenido distinto entre filas (marca+
   saludo arriba, grupos de controles abajo), el corte queda en un
   lugar distinto en cada fila y no se leen como una grilla prolija
   ("se ve chueco", reporte real del cliente). **Fix real: una sola
   CSS Grid de 2 columnas para TODA la barra**, con `display:contents`
   en los wrappers de fila para que sus hijos sean celdas directas de
   esa grilla compartida — mismas columnas garantizadas en las 2
   filas, como una tabla. Ver el media query completo en
   `coto-player-chrome.css` para el patrón exacto (es el fix más
   importante de toda esta vuelta, reusar tal cual ante cualquier
   header/footer de 2+ filas en pantallas angostas).
6. **Auditar el DOM real antes de confiar en medidas de elementos
   "representativos".** Varias veces una medición pareció mostrar un
   bug que en realidad era el script de prueba (no el sitio) — probar
   contra el estado real (voz activada por defecto, saludo con nombre
   real) antes de concluir que algo está mal.
7. **Se sacó el botón "Automático"/"Reproducir todo".** Decisión de
   producto del cliente: bajo valor real frente al ruido visual que
   sumaba. La función sigue en `curso.js` (`initAutoplay`, no-op
   seguro sin el botón en el DOM) por si se recupera con otro punto de
   entrada más adelante — no volver a agregar el botón sin que se
   pida explícitamente.
8. **Micrófono en vez de play/stop para "locución".** Un ícono de play
   se confunde con controles de video; un micrófono comunica mejor
   "hay una voz leyendo esto". Patrón: apagado = mic simple (invita a
   tocar), prendido = mic con ondas de sonido + pulso CSS.

---

## 6.7 Locución: velocidad fija = bug real en dispositivos sin la voz preferida

Reporte real de uso (probando "Surtido sin venta" en tablet): la
locución "iba muy rápido" con voz de hombre — en desktop, con la voz
de Google es-US, sonaba perfecto.

**Causa raíz**: `u.rate = 1.15` estaba hardcodeado en `speak()`,
aplicado siempre sin importar qué voz terminara eligiendo
`pickVoice()`. 1.15x se ajustó y probó SOLO contra la voz preferida
(Google es-US) — cualquier voz de respaldo (el dispositivo no siempre
tiene esa voz específica; en la tablet cayó en otra, de hombre, motor
más básico) hereda la misma velocidad sin haber sido probada,
sonando atropellada.

**Fix** (aplicado en `narrador.js` del kit y en `curso.js` de
"Surtido sin venta"): `isHighQualityVoice(v)` — true solo para la voz
preferida (Google es-US) o cualquier voz marcada por el navegador/SO
como motor neural/online/premium/enhanced. `u.rate` pasa a ser
`isHighQualityVoice(v) ? 1.15 : 1.0` — con una voz no confirmada, se
narra a ritmo normal (1.0x) en vez de arriesgarse a que suene mal.
**Regla general para cualquier ajuste fino de narración**: un valor
tuneado a mano (velocidad, tono) SIEMPRE hay que asumir que se probó
contra UNA voz puntual, no contra "la narración" en abstracto — atarlo
condicionalmente a esa voz, nunca aplicarlo como constante global.

## 6.8 Márgenes en tablet — primera pasada: aceptado tal cual (ver §6.9 para la vuelta 2)

Medido en 4 tamaños reales de tablet: el margen vertical de letterbox
que deja el lienzo fijo a 2:1 (ver §2.6/2.7) varía fuerte según el
dispositivo — ~6% en tablets 16:10 horizontal, ~21-24% en tablets 4:3
horizontal (iPad), ~55% en vertical. Es consecuencia directa y
esperada de la decisión de 2:1 + cero recorte: las tablets están más
lejos de esa proporción que las ventanas de escritorio (~1.85-2.11).

**Primera decisión del cliente** (revisada después en §6.9 al ver el
resultado en un dispositivo real): uso horizontal únicamente + cero
recorte siempre por sobre "pantalla completa" → margen aceptado sin
tocar código. **Esta decisión se revisó** — ver §6.9, quedó
reemplazada por un margen de diseño ampliado en vez de aceptar la
franja vacía tal cual. Se deja este punto igual (no se borra) porque
documenta el razonamiento intermedio y por qué NO alcanzaba con
"aceptarlo" una vez visto en un dispositivo real.

## 6.9 Margen de seguridad ampliado para tablets — la solución real

Al probar "Surtido sin venta" en una tablet real, el margen aceptado
en §6.8 se sintió peor en la práctica que en la tabla de números — el
cliente pidió reconsiderarlo. Propuesta del cliente, correcta en
concepto: **diseñar el PDF con más margen de seguridad, para poder
recortar tablets DENTRO de esa zona ya sabida vacía**, en vez de
mostrar letterbox. Se implementó así:

- **El recorte en tablet es SIEMPRE lateral** (izquierda/derecha),
  nunca arriba/abajo — una tablet horizontal es más angosta que 2:1 en
  relación al alto, así que al llenar la pantalla completa lo que
  sobra es ancho, no alto. Por eso el margen top/bottom (8%) no
  necesita agrandarse, solo el de los costados.
- **Error real en el primer cálculo, corregido**: la proporción a
  proteger NO es la proporción cruda del dispositivo/viewport (un
  iPad "es" 4:3 = 1.33) — hay que restar el alto fijo del
  header+footer (~120px) del alto total para obtener la proporción
  REAL del `.d-stage` (el área donde vive la diapositiva). Para un
  iPad landscape (viewport CSS 1024×768), la proporción cruda es 1.33
  pero la del `.d-stage` real es ≈1.58; para un iPad Pro landscape
  (1366×1024), ≈1.51. Confundir estos dos números llevó a una primera
  estimación de margen (17% por costado) casi el doble de lo
  necesario. **Regla general: medir siempre contra el contenedor
  real que se está protegiendo, nunca contra el dispositivo/viewport
  completo** — mismo tipo de error, en espíritu, que el bug de §2.7
  (`width:100%;height:100%` en vez de un lienzo fijo).
- **Margen final: 8% arriba/abajo (sin cambio) + 13% a cada costado**
  (antes 8% parejo). Protege hasta proporción de `.d-stage` ≈1.5
  (cubre iPad e iPad Pro landscape reales, los casos más angostos
  entre los dispositivos probados). Por debajo de esa proporción
  (tablets aún más angostas, o vertical) el lienzo vuelve al modo
  fijo con letterbox — la opción segura para una proporción no
  protegida por el margen de diseño.
- **Implementación**: `kit-base/css/coto-shot-stage.css` (nuevo,
  reemplaza el bloque de lienzo fijo que antes se escribía a mano por
  curso) — usa una CSS Container Query (`@container
  (min-aspect-ratio:1.5) and (max-aspect-ratio:1.9)`) sobre `.d-stage`
  para decidir entre lienzo fijo 2:1 (desktop) y lienzo a pantalla
  completa recortando con `cover` (tablet protegida). Validado con una
  imagen de prueba marcando la zona seleccionada, confirmando que el
  recorte real en proporción 1.51-1.58 nunca llega a tocarla.
- **⚠️ NO retroactivo**: "Surtido sin venta" quedó diseñado con el
  margen VIEJO (8% parejo) — aplicarle este CSS nuevo recortaría
  contenido real, no margen vacío. Este archivo/instrucción es para
  **"Prevención cardiovascular" en adelante**. Si algún día se decide
  rehacer el PDF de "Surtido sin venta" con el margen nuevo, ahí sí
  se puede sumar el CSS — no antes.

## 6.9.1 Franjas laterales en ultrawide: es lo correcto, NO lo "arregles"

Hallazgo de la revisión visual de "Prevención cardiovascular", anotado
acá porque es exactamente el tipo de cosa que alguien va a ver en el
próximo curso y va a querer "corregir", rompiendo el diseño.

En pantallas muy panorámicas (proporción de `.d-stage` ≈2.67, monitores
ultrawide) el lienzo fijo 2:1 deja **franjas a los costados**. Se ve
como un defecto y no lo es: llenar el frame ahí obligaría a recortar
**12,5% arriba y abajo**, muy por encima del margen de seguridad
vertical del 8% (§2.6) — o sea, se comería contenido real. Las franjas
son la opción correcta.

La asimetría con el caso tablet (§6.9, donde sí se recorta) no es
inconsistencia, es la consecuencia de que el margen de diseño es
distinto en cada eje: **13% a los costados** permite recortar lateral
con seguridad, **8% arriba/abajo** no da para recortar vertical. Por eso
`coto-shot-stage.css` recorta en el rango tablet y hace letterbox en
ultrawide. Regla general: **el recorte solo se habilita en el eje y en
el rango que el margen de diseño ya cubre**; fuera de eso, franja.

## 6.10 Avance bloqueado por contenido (gate) — kit-base v1.7

Pedido explícito del cliente en "Prevención cardiovascular", con la
opción más estricta de las que se le ofrecieron: **la barra queda
bloqueada si el alumno no hizo clic en cada interacción y no vio cada
video** — igual que "Surtido sin venta". Quedó armado como mecanismo
genérico del kit, no como lógica de este curso:

- **`motor.canAdvance`** — punto de extensión oficial del motor (ya
  declarado explícito en el constructor desde v1.6). El curso le
  asigna una función que devuelve `false` mientras falte algo.
- **`data-require-seen="video/x.mp4"`** en la diapositiva — el motor
  frena solo hasta que ese recurso figure como visto.
- **`advanceblocked`** — evento que dispara el motor cuando el alumno
  intenta avanzar igual. Es el gancho para dar feedback.

Tres reglas aprendidas con bugs reales, las tres ya resueltas en el kit:

1. **El botón "Siguiente" NUNCA se deshabilita con `disabled`/
   `aria-disabled`** — un lector de pantalla dejaría de anunciarlo como
   interactivo y el alumno ciego no tendría forma de saber que existe.
   Se atenúa visualmente (`.is-gated`) y, al intentarlo, tiembla
   (`.d-shake`): feedback físico de "todavía no", sin romper la
   accesibilidad.
2. **Negar el avance sin decir DÓNDE falta es una trampa.** El handler
   de `advanceblocked` tiene que terminar SIEMPRE marcando los
   elementos pendientes (`.d-nudge` pulsa 2 veces sobre cada hitbox que
   falta). Bug real: un `return` temprano cortaba el handler antes de
   marcarlos, así que el botón temblaba y nada indicaba qué hacer.
3. **Un `data-require-seen` que quedó de una versión anterior del
   marcado deja el curso encerrado**, sin ningún error en consola. Bug
   real: al generalizar el gate, un atributo viejo volvió a
   "activarse" y una diapositiva se quedó sin forma de avanzar. Al
   tocar el gate hay que revisar TODOS los `data-require-seen` del
   HTML, no solo el que se está agregando — `markup-sanity.mjs` chequea
   que cada valor referenciado exista de verdad.

## 6.10.1 Interacciones nuevas: 4 reglas que salieron de bugs reales

Cuatro cosas que hay que dar por sentadas cada vez que se agrega una
interacción a un curso de este molde. Las cuatro salieron de bugs
concretos, no de teoría.

1. **Todo medio con audio necesita alguien que lo apague.** Bug real
   reportado por el cliente en "Prevención cardiovascular": el video
   circular seguía sonando después de cambiar de diapositiva. Los otros
   dos patrones de video sí tenían su punto de corte (el de fondo
   sincroniza con `slidechange`, el de pop-up para en `popupclose`);
   este no tenía ninguno, así que se quedaba reproduciéndose en una
   diapositiva oculta y el alumno escuchaba una voz sin saber de dónde
   salía. **Al sumar cualquier elemento con audio, la pregunta no es
   "¿arranca bien?" sino "¿quién lo apaga?"** — y la respuesta tiene
   que ser un evento del motor, no la buena voluntad del alumno.
   Corregido en `coto-media.js` del kit, así que un curso nuevo ya lo
   hereda resuelto.
2. **En tablet NO existe el hover.** Una interacción que solo responde
   a `mouseenter` es invisible para la mitad de los alumnos — y el
   cliente prueba los cursos en tablet (§6.8). Toda interacción de
   "pasar el mouse y que aparezca algo" tiene que escuchar **los 3**:
   `mouseenter` (mouse), `focus` (teclado) y `click` (táctil, con
   toggle para poder cerrarlo).
3. **Una interacción nueva también entra al gate.** Si el curso tiene
   avance bloqueado por contenido (§6.10), agregar una interacción sin
   sumarla al gate rompe la regla que el cliente pidió ("la barra
   bloqueada si no hiciste clic en cada interacción"). Para pop-ups
   existe el mismo mecanismo declarativo que para los videos:
   `data-require-popups="id1 id2"` en la diapositiva, con el mismo
   `.d-nudge` señalando los que faltan. Es genérico — mismo criterio
   que `data-require-seen`, candidato claro a subir al kit cuando un
   segundo curso lo use.
4. **Mobile/responsive se piensa AL CONSTRUIR, no se audita al final
   — regla fija del cliente, de acá en adelante sin excepción.**
   Hasta ahora el patrón repetido en este documento (§6.42, §6.48,
   §6.55, §6.58 nota al pie...) fue: se construye una interacción
   viendo solo desktop, se entrega, y RECIÉN ahí — por un reporte del
   cliente o por una auditoría posterior — aparece que en mobile se
   rompe, se recorta, o el gesto no funciona igual (touch sintetiza
   eventos distinto que mouse, ver el propio caso de Rotación arriba).
   Cada una de esas vueltas costó una ronda de feedback completa que
   se podía evitar. **De ahora en adelante, toda pieza de UI/interacción
   nueva se prueba en viewport táctil real (`isMobile:true`,
   `hasTouch:true` con Playwright — nunca solo achicar la ventana de
   escritorio, §6.48/§7.3 punto 11) ANTES de darla por terminada, en
   la MISMA vuelta en que se construye** — no como un chequeo aparte
   que se hace "si después el cliente pregunta". Esto aplica a:
   - Cualquier gesto nuevo (arrastre, swipe, hover-con-gracia): probar
     que el evento sintético real de touch (no solo mouse) produce el
     resultado esperado — `click.detail`, `pointerType`, y qué eventos
     SÍ y NO dispara un tap simple vs. un tap-y-arrastre son distintos
     entre mouse y touch, y typearlo mal es indetectable a simple
     vista (§6.58, Rotación: el bug pasó los tests de mouse en verde).
   - Cualquier layout nuevo (grid, popover, tarjeta): probar en al
     menos un viewport de teléfono real (~375-430px, portrait Y
     landscape) además de tablet — no asumir que "ya se probó
     responsive" porque se probó en un iPad o achicando Chrome.
   - Cualquier popover/tooltip que cuelgue de un botón del chrome:
     medir su posición real en el viewport táctil, no asumir que el
     botón sigue del mismo lado que en desktop (§6.55/§7.3 punto 12).
   La meta es que un curso entregado sea **sólido en cualquier
   dispositivo desde la primera entrega** — que probarlo en el celular
   del cliente confirme lo ya verificado acá, nunca sea la forma en
   que se descubre un bug nuevo. Mismo criterio, más allá de mobile:
   antes de dar por terminada cualquier pieza nueva, pensar qué caso
   obvio-en-retrospectiva podría faltar (teclado, un guard que no
   sobrevive un reintento, un evento que no dispara en el otro
   patrón de video, etc. — los patrones de bug ya catalogados en este
   mismo documento) y verificarlo de una, en vez de entregar y esperar
   a que una vuelta de feedback lo encuentre.

## 6.10.2 Pop-ups: una sola regla para todo el curso

Salió de una revisión del cliente sobre "Prevención cardiovascular", con
pop-ups que cerraban de formas distintas y botones que no hacían nada.

- **Todos se cierran igual**: el control de arriba a la derecha, `Esc`, o
  tocando fuera. Los tres andan en todos, sin excepción.
- **Un pop-up de CONSULTA no lleva botón al pie.** Glosario, ayuda,
  fichas de contenido, estadísticas, logros: el botón "Continuar" ahí no
  continúa nada, solo cierra — o sea, duplica el control de arriba con
  otra palabra. Y en una tarjeta con poco contenido se ve enorme, porque
  ocupa el ancho completo.
- **Solo lleva botón el pop-up que ARRANCA o COMPLETA algo**, porque ahí
  el botón sí hace algo distinto de cerrar: el de instrucciones
  ("Empezar el recorrido"), el de intro de una actividad, y el pop-up
  "gate" (`data-gate-popup`) cuyo cierre completa el avance a la
  diapositiva siguiente.
- **Un ícono grande necesita aire arriba.** Un círculo de 84px con
  `padding-top:.3rem` queda pegado al encabezado. Mínimo `1.5rem`.
- **Si el contenido cambia entre aperturas del MISMO pop-up, reservar
  el alto del texto más largo.** Si no, la tarjeta se agranda y se
  achica al saltar de paso y los controles se mueven bajo el dedo.
- **Un aviso que aparece una sola vez es un aviso que se pierde.** Los
  pop-ups automáticos (`data-intro-popup`) y los "gate"
  (`data-gate-popup`) se re-arman al ENTRAR a la diapositiva: quien
  vuelve espera volver a verlos. Además, si el aviso importa de verdad
  (ej. "esto no es la evaluación"), no alcanza con una línea en la
  bajada: va como pop-up ANTES de empezar y como bloque destacado
  (`.d-aviso`), porque una línea más de texto se lee en diagonal.
- **La info de un pop-up que aparece solo una vez tiene que vivir
  también en un lugar fijo.** El instructivo del índice se duplica en el
  botón "Ayuda" de la barra superior, que está en todas las
  diapositivas.
- **Los paneles que se abren desde la barra superior van como cajón del
  mismo lado que su botón** (`.modal--drawer` a la izquierda para el
  índice, `.modal--drawer-right` para glosario y ayuda). Un pop-up
  centrado no comunica de dónde salió, y un cajón gana el alto que un
  glosario largo necesita.

## 6.10.2.1 El instructivo de arranque: qué decir y qué NO prometer

Error real encontrado en "Prevención cardiovascular": el pop-up "Cómo
recorrer el curso" decía que desde el índice se podía **"saltar a
cualquier diapositiva"**. Es falso en cualquier curso con avance
bloqueado por contenido (§6.10) — el índice sirve para **volver a lo ya
visto**, no para adelantarse. Un instructivo que promete algo que no
pasa es peor que no tener instructivo.

Hay una plantilla genérica en `kit-base/header-boilerplate.html`, y el
criterio es: el instructivo habla de los **controles del reproductor** y
del **tipo de interacciones que tiene el molde** — nunca de las
diapositivas concretas de ese curso. Así sirve igual para todos:

1. Cómo avanzar (flechas, botones, barra de progreso).
2. Los 4 controles de la barra superior, uno por uno.
3. Que el curso es interactivo: videos, zonas que responden, práctica.
4. Que **para avanzar hay que interactuar con todo**, y que si falta
   algo se lo va a señalar.
5. Que se suman puntos y logros, y que al final hay un resumen.

Dos detalles de forma que costaron una vuelta cada uno:
- **El botón va pegado al pie** (`.d-cta-sticky`). Es el pop-up más
  largo del curso y en pantallas bajas su llamado a la acción quedaba
  abajo de todo: un botón que hay que ir a buscar scrolleando no se usa.
- **Los botones de acción van del ancho de su texto**, no del ancho de
  la tarjeta (`.btn-ic`, con ícono). Un botón a ancho completo comunica
  "esta es la única salida" — está bien en un formulario, mal en un
  pop-up que además se cierra con la ✕.

## 6.10.2.2 Cuándo conviene romper la convención de pop-ups

La regla de §6.10.2 es que todos los pop-ups se ven igual. La excepción
válida es el pop-up que **no es contenido ni trámite, sino juego**.

Caso real: las preguntas de predicción antes de cada video de la unidad
2 ("¿Te la jugás?"). Se le dio encabezado propio con degradado, tarjeta
más angosta, opciones tipo ficha y un premio animado al acertar. Se ve
distinto **a propósito**, para que se lea como un desafío rápido y no
como una ficha de contenido más.

Dos condiciones para que la excepción no se vuelva inconsistencia:
1. **Que sea UNA sola** en todo el curso. Dos excepciones ya son un
   segundo estilo, y ahí volvemos al problema de §4.
2. **Que esté escrita en el HTML**, al lado del marcado, explicando por
   qué rompe la convención. Si no, la próxima persona la "corrige".

El premio es **cosmético**: los puntos los suma el mismo `award()` de
siempre. Lo que se agrega es que se VEAN — el número que sube desde el
botón acertado y la moneda de `fx.js`. Gamificación de percepción, no
de puntaje.

## 6.10.2.3 Tono: el alumno puede estar nervioso en su primer día

El copy de un pop-up "divertido" puede sonar mal según QUIÉN lo lee.
Caso real: el pop-up de predicción se llamaba "¿Te la jugás?" — lenguaje
de apuesta/desafío. El cliente lo frenó con un argumento que hay que
tener presente siempre en este tipo de cursos: **quien hace un curso de
inducción suele estar en sus primeros días de trabajo, nervioso**, no
buscando que lo pongan a prueba. "Jugarse", "desafío", "reto", "ganar" —
cualquier palabra que suene a examen o a apuesta puede sumar presión en
vez de sacarla.

Se corrigió a **"Un momento, pensemos"** (invita, no exige) y el
feedback de error a **"No pasa nada, ahora lo vemos"** (nunca hubo
penalidad real — es +5 puntos cosméticos si acierta, nada si no — pero
había que decirlo explícito, no asumir que se entiende solo).

Regla general para cualquier curso de este molde: antes de escribir
copy "con onda" para una interacción opcional, preguntarse si el
público real (alguien nuevo en el trabajo, aprendiendo procesos que
todavía no domina) lo va a leer como invitación o como presión.

## 6.10.3 Resaltar una hitbox: el ícono, no la caja

Reportado dos veces por el cliente sobre diapositivas distintas. Una
hitbox que abarca "ícono + etiqueta" resaltada con fondo o recuadro se
ve como **una tarjeta gris pegada encima del arte**: el recuadro incluye
el texto y no coincide con ninguna forma del dibujo.

Se resalta **solo el ícono**, con un aro que sigue la forma redonda que
ya está dibujada (`.d-hit-ring` del addendum). Cómo dimensionarlo — esto
hay que MEDIRLO en cada curso, no copiar números: el aro se define contra
el eje de la hitbox que sea **constante** entre todos los elementos del
grupo. Si todas tienen el mismo alto y distinto ancho (típico con
etiquetas de 1, 2 o 3 líneas), dimensionar por alto; si comparten ancho,
por ancho. `aspect-ratio:1` completa el otro eje.

Y el aro ES el indicador de foco: ponerle además un `outline` rectangular
vuelve a dibujar justo el recuadro que se quiso evitar.

## 6.10.4 Tiempo mostrado ≠ tiempo de sesión

Pedido del cliente: que el tiempo del resumen no cuente lo que dura mirar
los videos. Con 9 videos, la duración del material se lleva la mayor
parte del número, y "20 min" termina diciendo más sobre el video que
sobre el recorrido de la persona.

`initTiempoActivo()` (kit, `coto-ui.js`) frena el reloj mientras haya
cualquier `<video>` reproduciéndose. Dos cosas que hay que respetar:

1. **Los videos en curso se llevan en una LISTA, no en un contador.** Al
   terminar un video se disparan `pause` **y** `ended`: con un contador
   simple queda en negativo y el reloj no vuelve a arrancar nunca.
2. **`cmi.core.session_time` NO se toca.** El estándar SCORM lo define
   como el tiempo que el SCO estuvo abierto: descontarle los videos sería
   reportarle mal al LMS. Son dos números distintos con dos destinos
   distintos.

## 6.10.5 El curso tiene que poder cerrarse

Antes, al terminar, el botón del pie quedaba como un "Fin" que no hacía
nada y el alumno cerraba la pestaña a mano — que en SCORM equivale a
irse sin avisar.

- El botón pasa a **"Salir del curso"** y **sigue funcionando después
  del primer clic**: si el alumno vuelve al resumen, tiene que poder
  salir otra vez.
- `SCORM.exitCourse()` cierra con **`cmi.core.exit = ""`** (salida
  normal), no con `"suspend"`. La diferencia no es cosmética: `"suspend"`
  le pide al LMS que guarde el punto donde quedó — correcto al cerrar la
  pestaña a mitad de camino, incorrecto al terminar, porque al reabrir el
  curso volvería al bookmark en vez de arrancar limpio.
- `window.close()` solo funciona si el LMS abrió el curso en ventana
  nueva. Dentro de un iframe no hace nada y no tira error: por eso la
  pantalla de despedida se muestra **siempre** y el cierre automático es
  un extra, nunca el mecanismo.

## 6.10.6 Premio final: los umbrales se calculan, no se eligen

Al sumar medallas de oro/plata/bronce, los rangos de puntos salen del
puntaje **realmente alcanzable**, no de números redondos elegidos a ojo.
Se suman todas las fuentes de puntos del curso para obtener el máximo, y
—si hay avance bloqueado por contenido— el **piso asegurado** de quien
lo termina. La medalla más baja arranca en ese piso: una medalla que se
obtiene sin hacer nada no premia nada.

Los 3 rangos se muestran **siempre**, también los no alcanzados, y con
cuántos puntos faltaron para el siguiente. Si no se ve qué faltaba, la
medalla no motiva.

## 6.10.7 Zonas interactivas sobre el arte: el toggle del clic

Al agregar zonas que revelan información sobre una imagen (sectores de
un gráfico, filas de una tabla, etapas de un proceso), el patrón es
siempre el mismo y conviene usar `initHotspots()` del kit en vez de
volver a escribirlo — en "Prevención cardiovascular" terminó escrito
**cuatro veces** con nombres distintos, y las cuatro hubo que
corregirlas por separado.

El detalle que se paga caro son **dos bugs encadenados del toggle**:

1. Con `if (activa === z) limpiar()` a secas, en una computadora con
   **mouse el clic cierra lo que el hover acababa de abrir**: el
   `mouseenter` llega primero y deja la zona activa, así que el clic la
   encuentra abierta y la apaga.
2. Atarlo a "cerrar solo en táctil" **tampoco alcanza**: un toque
   sintetiza `mouseenter` antes del `click` (los navegadores emulan
   mouse sobre touch), así que en tablet el toque abría y cerraba en el
   mismo gesto y no pasaba nada.

La solución no es mirar el estado en el momento del clic, sino el que
había **antes de que empezara la interacción**: `pointerdown` se dispara
antes que los eventos de mouse sintetizados, así que ahí se guarda la
foto y el toggle compara contra esa.

## 6.10.8 "Extraído al kit" no es "probado en un curso real" — auditar la diferencia

Pedido explícito del cliente: verificar si el sistema de puntos/medallas
va a funcionar igual en el próximo curso vía el kit. La respuesta
obligó a auditar algo más grande de lo esperado.

**El mecanismo en sí es sano**: `pintarMedalla(puntos, niveles)` en
`coto-cierre.js` es puro y parametrizado — no lee nada de un curso en
particular, recibe los puntos y los 3 rangos por parámetro. Probado en
aislamiento (página mínima, solo el kit) resuelve el nivel correcto y el
mensaje de "te faltaron N" bien en los casos límite.

**Pero "Prevención cardiovascular" no lo usa.** Auditando los
`<script src>`/`<link>` del curso real contra lo que el kit declara
como v1.8, ninguno de los 6 módulos nuevos (`coto-player.js`,
`coto-media.js`, `coto-ui.js`, `coto-hotspots.js`, `coto-quiz.js`,
`coto-cierre.js`) está cargado — el curso sigue con
`coto-base-addendum-v1.2.css` y todo el comportamiento vive inline en
`curso.js`/`diapositivas.css`. "Extraído y validado en aislamiento" y
"funciona en un curso real" son afirmaciones distintas, y solo la
primera era cierta.

**La consecuencia concreta que esto produjo**: `curso.js` tenía su
propia copia local de `medallaDe()`/`pintarMedalla()`, casi idéntica a
la que subió al kit el mismo día — nunca migrada. Como `curso.js` corre
en su propio IIFE, la copia local **tapa** a la función global sin
pisarla: no hay ningún error, la página funciona perfecto, pero
`window.pintarMedalla` del kit simplemente nunca se llama. Dos
implementaciones del mismo cálculo, sin que nada las mantenga
sincronizadas si una cambia.

**Regla para no repetir esto**: cuando se extrae una función al kit
desde un curso ya escrito, el trabajo no termina hasta que ESE curso
llama a la versión del kit (borrando la copia local) o hasta que se
documenta explícitamente por qué no. "Subir la función" sin "migrar
quien la usaba" dejó un duplicado silencioso.

**Veredicto honesto para el próximo curso**: el mecanismo de medallas
(y los otros 5 módulos) está listo para copiarse tal cual — la lógica
es correcta y ya se probó aislada. Pero la primera prueba real,
end-to-end, dentro de un curso completo, todavía no pasó. Si el próximo
curso arranca copiando `kit-base/` de punta a punta (checklist §7) y
usando los módulos sin reescribirlos, esa va a ser la validación real.
Hasta entonces, tratar el kit como "diseño correcto, no como
"funcionando comprobado".

## 6.11 Animación de entrada escalonada — hasta dónde llega (y por qué)

Consulta real del cliente: "¿qué complejidad tiene que primero entren
los títulos, después los párrafos y después los elementos?". La
respuesta corta: **depende de si la diapositiva es HTML real o una
captura**, y no es un problema de código sino de qué entregó el
diseñador.

- **HTML real** (pop-ups, mini-práctica, resumen del cierre, logros):
  trivial y ya resuelto en el kit — `.d-stagger-in` de `coto-base.css`
  + `staggerReveal()` de `coto-ui.js`, que se engancha solo a
  `popupopen`. Escalona los hijos directos y, un nivel más adentro, las
  tarjetas de las grillas conocidas, para que entren en cascada entre
  sí y no todas juntas como "un elemento más".
- **Diapositivas-captura**: **no se puede**, y no por falta de código.
  Una captura es UNA imagen con el texto horneado adentro (§2.8): no
  existen "el título" y "el párrafo" como objetos separados que puedan
  entrar por turnos. Lograrlo exige volver al camino caro de §3.3 —
  pedirle al diseñador cada pieza como capa Illustrator independiente
  con alfa, con el costo de exportación y la superficie de bugs de
  posicionamiento que eso trae.
- **Decisión tomada con el cliente**: aplicar el escalonado **solo
  donde ya hay HTML real**. Es el 90% del efecto percibido a costo
  cero, sin cambiarle el pipeline de entrega al diseñador.
- Detalle de implementación que se paga caro si se olvida: entre
  `classList.remove` y `classList.add` hace falta un `void
  el.offsetWidth` para forzar el reflow — sin eso la animación **no se
  reinicia** y la segunda vez que se abre el mismo pop-up no anima nada.

---

## 6.12 Pop-up de arranque, video circular, torta interactiva y video en pop-up — 4 lecciones reales (kit v1.9)

Ronda de revisión en vivo de "Prevención cardiovascular" que tocó 4
componentes ya extraídos o candidatos a extraerse. Las 4 lecciones son
genéricas — aplican a cualquier curso del molde, no solo a este.

**1 · El pop-up de arranque no debe abrirse solo, y menos ser largo.**
La plantilla `data-intro-popup` (automática al entrar a una diapo) es
mala opción para un pop-up de bienvenida: interrumpe sin que el alumno
lo pida. Se reemplazó por `data-gate-popup` en la diapositiva "índice"
— el mismo mecanismo que cualquier otro gate de contenido — así el
pop-up aparece recién cuando el alumno toca "Siguiente", como un paso
más del recorrido, no una interrupción. De paso se recortó de 2 grillas
de íconos (7 ítems) a 2 párrafos + botón: el detalle de controles de la
barra superior YA vive en el pop-up "Ayuda" (accesible desde cualquier
diapositiva) — duplicarlo en el pop-up de arranque solo lo infla.
Actualizado en `kit-base/header-boilerplate.html` (v1.9).

**2 · Video que se reproduce EN el lugar (círculo o cualquier overlay
sobre `.d-shot-img`): el `<video>` tiene que estar OCULTO salvo
mientras reproduce, nunca visible por defecto.** Bug real: al terminar
el video (`ended`), se sacaba la clase `.is-playing` pero el `<video>`
seguía dibujado encima, mostrando su último cuadro — negro en estos
clips — tapando la imagen de base que debería volver a verse. La regla
general: si un `<video>` se superpone a una imagen estática que "hace
de poster", el `<video>` debe tener `opacity:0` (o `visibility:hidden`)
salvo mientras está en reproducción real (`.is-playing`), nunca
"siempre visible" con la esperanza de que su último cuadro coincida con
algo razonable. Sumar también `video.currentTime = 0` en `ended`, para
que el próximo play no intente arrancar desde el final. Corregido en
`kit-base/js/coto-media.js` + `coto-media.css`
(`initInlineCircleVideos`).

**3 · Una tarjeta de datos que "sigue" al elemento activo de un gráfico
interactivo (torta, barras, etc.) no necesita rastrear la posición real
del mouse.** Pedido típico: "que el dato aparezca cerca de la parte del
gráfico que estoy mirando". Rastrear el cursor en píxeles es fuente de
jitter, no funciona con teclado/foco (mitad de los alumnos en tablet no
tienen mouse, CLAUDE.md §6.10.1), y es más código del necesario. Si el
gráfico ya calcula una dirección/bisectriz por elemento para el efecto
de "separarse un poco al elegirlo" (variables tipo `--bx`/`--by`,
patrón ya usado en la torta de este curso), esa MISMA dirección sirve
para posicionar la tarjeta: un atributo (`data-pie-active="<id>"` o
similar) por selección, con una posición CSS fija por elemento. Menos
código, funciona igual con mouse/teclado/tap, sin jitter.

**4 · El radio de esquina del `:hover` tiene que MEDIRSE contra el
radio real del arte, no heredar el genérico.** La clase base
`.d-shot-hit` trae `border-radius:var(--r-sm)` (8px) — pensada para
hitboxes rectas/chicas. Sobre una tarjeta de video con esquinas muy
redondeadas dibujadas en el PDF (~32px reales, medido con el mismo
método PIL de CLAUDE.md §3.4: escanear la tarjeta blanca contra el
fondo), un tinte de `:hover` con 8px de radio se ve como un rectángulo
casi recto asomando por fuera de las esquinas curvas — "una forma rara
que se extiende de más", reporte real del cliente. Regla: cualquier
hitbox que se dibuja sobre una tarjeta/forma redondeada del arte
necesita su propio `border-radius` ajustado a esa forma (`--r-lg`/
`--r-xl` del sistema de diseño, o medido a mano si no calza con ninguno
de los tokens), no el genérico de `.d-shot-hit`.

**5 · Pop-up de video: la barra superior (`.modal-hd`) es opcional, no
obligatoria.** La regla de consistencia de pop-ups (§6.10.2) exige que
TODOS cierren igual (X/Esc/backdrop), pero no exige que todos tengan
`.modal-hd`. Para un reproductor de video, mostrar solo el video con
sus controles nativos (sin barra de título encima) es más limpio; el
cierre pasa a un botón flotante sobre la esquina del video
(`position:absolute` directo sobre `.modal-card`, ya que `.modal-x`
solo necesita un ancestro `position:relative` — no específicamente
`.modal-hd`) con fondo semitransparente oscuro para leerse sobre
cualquier contenido de video. El título accesible se mantiene en el DOM
como `sr-only` para lectores de pantalla, sin verse.

---

## 6.13 Ronda de revisión visual: 3 lecciones más (kit v1.9)

Cuarta pasada de revisión en vivo sobre "Prevención cardiovascular".
Las 3 lecciones son genéricas, aplican a cualquier curso del molde.

**1 · `.btn-ic` (y cualquier clase del addendum v1.8) NO existe si el
curso todavía carga la v1.2 — y eso rompe visualmente, no solo
"falta un estilo".** Bug real, encontrado recién ahora aunque el botón
llevaba varias vueltas usando la clase: sin `.btn-ic svg{width:1.1em;
height:1.1em}`, un `<svg>` sin `width`/`height` propios cae en su
tamaño intrínseco por default — **300×150px** — y como el botón es
`inline-flex` (se agranda para contener a su hijo), el resultado es un
óvalo gigante con un triángulo enorme adentro, no "un botón sin
ícono". Cualquier curso que use una clase del addendum tiene que
verificar que el `<link>` de esa versión esté realmente en el
`<script>/<link>` del `index.html` — no alcanza con que la clase
"suene familiar" del kit. Mientras un curso no migre de verdad (ver
§6.10.8), la clase necesaria se copia entera al CSS propio del curso,
con un comentario explicando por qué existe ahí duplicada.

**2 · Una tarjeta que seguía la dirección bx/by "matemática" pisaba las
etiquetas horneadas en la imagen — medir en píxeles, no confiar en la
fórmula.** Extensión del hallazgo de §6.12 punto 3: usar la misma
dirección que separa un sector al elegirlo (`--bx`/`--by`) es un buen
punto de partida para posicionar una tarjeta de datos, pero no alcanza
solo — hay que chequear en píxeles reales dónde están las etiquetas ya
impresas en el arte (mismo método PIL de §3.4) y mover la tarjeta a un
hueco realmente vacío, aunque eso signifique alejarse de la dirección
"pura" bx/by. En este curso terminó siendo más simple: UNA posición a
la derecha de la torta (hueco real, antes del video) para el sector de
ese lado, y UNA posición a la izquierda (hueco entre las 2 etiquetas
de ese lado) reusada por los 2 sectores de ese lado — nunca se
muestran a la vez, así que no hace falta una posición por sector.

**3 · El color de un "premio" (medalla, insignia, logro) va en un
badge propio, no tiñendo toda la tarjeta que lo contiene.** Reporte
real: la tarjeta de medalla tenía un degradado MUY pálido de fondo por
tier (oro/plata/bronce) — en pantalla se leía casi gris, "quedaba
feo". Fix: el color de tier se concentra en un badge cuadrado-
redondeado propio alrededor del ícono (`width`/`height` fijos,
degradado con más saturación, `box-shadow`), y la tarjeta que lo
contiene queda neutra (`var(--surface-2)`). El contraste hace que el
badge se lea como "el premio" en vez de que toda la tarjeta se vea
desteñida.

**4 · Un efecto de entrada "cinematográfico" para un logro se arma con
2 piezas, no una: pop elástico + destello, y las dos SOLO una vez.**
`cubic-bezier(.34,1.56,.64,1)` con overshoot (escala pasa de 1 antes
de asentarse) da la sensación de "cayó en su lugar"; un
`radial-gradient` detrás que se expande y se apaga (no un loop) suma
la sensación de flash sin volverse ruido permanente. Se dispara una
vez por vuelta de celebración (`classList.remove` + reflow forzado +
`classList.add`, mismo patrón que `.d-nudge`/`.d-stagger-in`), nunca
como animación continua — un brillo que no termina se lee como
"rota", no como festejo. Respeta `prefers-reduced-motion` como
cualquier otra animación de entrada (regla ya fija del sistema de
diseño, CLAUDE.md §4).

---

## 6.14 Pop-up 2x2 con color de curso, hover duplicado, video "recortado" y voz en tablet (kit v1.9)

Quinta ronda de revisión en vivo de "Prevención cardiovascular". 5
lecciones genéricas.

**1 · Antes de implementar un rediseño visual grande, mandar preview de
imagen — no el curso real.** El cliente pasó una referencia visual de
otro curso y pidió algo parecido para el pop-up de arranque. Se armó un
mockup HTML aislado (mismos tokens de color/tipografía del kit,
`data-cat` real) y se generaron capturas con Playwright ANTES de tocar
`index.html`, iterando los 4 íconos en vivo (varias rondas: "no
quedaron muy bien", cambios puntuales por ícono) sin arriesgar romper
el curso real en cada vuelta. Recién con el diseño aprobado se portó a
`index.html` + `header-boilerplate.html` + CSS. Vale para cualquier
pedido de "hacé algo parecido a esta referencia": el costo de un mockup
aislado es mínimo comparado con iterar directo sobre el curso.

**2 · Un componente de color "de marca" se arma con tokens, nunca con
hex fijos, si tiene que ser reusable entre cursos.** El pop-up nuevo
(`.d-instr-modal`, `.d-instr-card-ic`, etc.) usa exclusivamente
`--cat`/`--cat-strong`/`--cat-soft`/`--cat-grad` — ni un color
hardcodeado. Resultado: el mismo bloque HTML/CSS sirve para cualquier
curso del kit cambiando SOLO el `data-cat` del `<body>`, que es
exactamente lo que hace que valga la pena subirlo al addendum.

**3 · Dos reglas `:hover` con la MISMA especificidad conviven mal si un
elemento hereda las dos clases.** Bug real: un video circular con
`class="d-shot-hit--circle d-shot-hit--video"` recibía el `background`
de `.d-shot-hit--circle:hover` (pensado para hitboxes normales) en vez
del `background:transparent` de `.d-shot-hit--video:hover` (pensado
para no teñir el video) — ambos selectores son "1 clase + :hover", así
que gana el que esté MÁS ABAJO en el archivo final, no el que "tenga
más sentido". Visualmente: un aro de color de más, superpuesto al
botón de play. Fix: un selector combinado
(`.d-shot-hit--circle.d-shot-hit--video:hover`) con más especificidad,
que gana siempre sin depender del orden de los archivos CSS. Cuando dos
clases utilitarias conviven en el mismo elemento y una necesita anular
a la otra en el mismo pseudo-estado, el selector combinado es la forma
robusta — no reordenar reglas y confiar en que el orden nunca cambie.

**4 · Un reproductor de video que se ve "recortado" en tablet puede no
tener nada que ver con la tablet.** Reporte real: "en iPad el
reproductor se ve recortado". Causa real: los placeholders de video son
archivos de 0 bytes (CLAUDE.md §3.9) — sin metadata, un `<video>` con
`width:100%;height:auto` cae en el alto FIJO por default del navegador
(150px, sin relación con el ancho), así que se ve como una franja
angosta en CUALQUIER dispositivo, no solo en tablet — pasa que en
desktop con un modal más chico es menos notorio y en tablet con el
modal más ancho la franja se nota más. Fix: `aspect-ratio:16/9` en el
`<video>` — reserva una caja razonable desde el placeholder, y en
cuanto carga un video real con su propia relación de aspecto, el
navegador la usa por sobre el `aspect-ratio` de CSS (no hace falta
sacarlo al reemplazar placeholders). Regla general: ante un bug
reportado "en tablet", reproducirlo TAMBIÉN en desktop antes de asumir
que es de tablet — puede ahorrar horas de buscar en el lugar
equivocado. `scroll-audit` (kit-base/tools/tests/) suma 3 viewports de
tablet (iPad horizontal 1024×768, iPad Pro horizontal 1366×1024, iPad
chico vertical 768×1024) para que este tipo de bug aparezca en la
suite en vez de en un dispositivo real.

**5 · Un ajuste de voz por dispositivo (no solo por voz) es un caso
legítimo, y se detecta sin sniffear user-agent.** Extensión de
`isHighQualityVoice`/§6.7: el cliente probó en iPad y pidió preferir
voces específicas (Paulina es-MX, después Mónica es-ES) ahí, más allá
de la cadena es-US de siempre. `matchMedia('(pointer:coarse)')` +
umbral de tamaño de pantalla (`Math.min(screen.width,screen.height)
>= 600`) distingue tablet de celular sin tocar `navigator.userAgent` —
más confiable entre navegadores y no se rompe si un fabricante cambia
el string de UA. Mismo criterio que §6.7 para la velocidad: un ajuste
fino probado contra UNA voz puntual (acá, Paulina sonando "cortada") se
ata condicionalmente a esa voz (rate 1.22x solo para Paulina), nunca se
generaliza como constante global.

---

## 6.15 Bug real: la barra superior/inferior se cortaba en iPad — pero solo con un alumno real logueado

Reporte real del cliente probando en un iPad físico (no en nuestros
tests): la barra superior e inferior aparecían cortadas — el botón
"Ampliar" desaparecía del header y "Siguiente"/"Empezar" quedaba
recortado en el footer. Costó dos rondas de fotos del cliente
diagnosticarlo bien (la primera foto tenía una rotación que llevó a un
diagnóstico erróneo — ver más abajo) y **nuestra propia suite de tests
nunca lo detectó**, con dos causas encadenadas, ambas genéricas:

1. **Bug de fondo — "grid blowout" de CSS Grid.** `.d-app` (kit-base,
   `coto-player-chrome.css`) es `display:grid` con `grid-template-rows`
   definido pero **sin `grid-template-columns`**. Sin eso, la columna
   implícita usa su ancho `auto` por default — que en CSS Grid se
   calcula por el **min-content** de los ítems adentro, no por el
   ancho real del contenedor. `.d-top`/`.d-bottom` tienen varios hijos
   `flex:none` que se niegan a achicarse (el saludo, los botones-ícono,
   los grupos de controles); si la suma de esos anchos supera el
   viewport, la fila del grid crece más ancha que la ventana — el
   contenido de más NO scrollea (`body{overflow:hidden}`, a propósito,
   ver arriba en este mismo archivo), simplemente queda invisible,
   cortado. Fix: `grid-template-columns: minmax(0,1fr)` en `.d-app` —
   es el fix estándar de este bug conocido de CSS Grid, fuerza a la
   columna a nunca superar el contenedor sin importar cuánto pidan sus
   hijos.
2. **Por qué ningún test lo agarró — el header nunca se probó en su
   ancho real.** El saludo (`#d-greet`, "👋 Hola, Nombre") solo se
   completa si `SCORM.getFirstName()` devuelve algo — y en cualquier
   corrida automática (Playwright sin LMS real detrás) esa función
   siempre devuelve vacío, así que el header SIEMPRE se probaba en su
   versión más angosta posible. El ancho real que un alumno de carne y
   hueso genera (con su nombre real en el saludo) nunca se ejecutó en
   la suite. Fix: `scroll-audit.mjs` ahora inyecta un saludo con un
   nombre deliberadamente largo antes de medir, y además mide
   `.d-top`/`.d-bottom` directamente (no solo
   `document.documentElement`, que el `overflow:hidden` del body deja
   ciego a este tipo de desborde).
3. **El breakpoint mobile (850px) tampoco alcanzaba para un iPad de
   1024px con el header completo.** Con el saludo puesto, el header
   necesitaba ~1146px para entrar en una sola fila — muy por encima de
   los 850px donde recién pasaba al layout de 2 filas (§6.6). Subido a
   1180px: cubre el iPad horizontal más chico (1024px) con margen.

**Lección general, más allá de este bug puntual:** cualquier pieza de
UI cuyo contenido dependa de un dato que la suite de tests NUNCA tiene
disponible (acá, el nombre real de un alumno vía SCORM) es una zona
ciega automática — por más que la suite pase en verde, no probó ese
caso. Antes de confiar en "0 fallos" para un componente así, hay que
preguntarse explícitamente qué datos reales le faltan a la simulación
y, si es barato, simularlos (como se hizo acá) en vez de asumir que el
caso vacío representa el peor caso real — casi nunca lo es.

**Nota aparte sobre cómo se llegó a diagnosticarlo:** la primera foto
que mandó el cliente tenía el header/footer visualmente rotados 90° —
llevó a un diagnóstico inicial equivocado (bloqueo de rotación del
iPad). El cliente aclaró que el dispositivo SÍ estaba en horizontal;
la rotación era un artefacto de cómo se había tomado/orientado esa
foto en particular, no del dispositivo. La foto nativa (captura de
pantalla real, sin cámara de por medio) que se pidió después fue la
que permitió ver el desborde real sin ambigüedad — pedir una captura
nativa en vez de una foto de la pantalla ahorra rondas de diagnóstico
cuando hay dudas de orientación o nitidez.

---

## 6.16 El fix de §6.15 tenía un costo de UX que había que resolver aparte

El pasaje a layout de 2 filas a partir de 1180px (§6.15) resuelve el
desborde real, pero el cliente lo probó en iPad (1024px) y prefería la
barra de 1 sola fila "prolija" de escritorio — el layout de 2 filas se
sentía más apretado/distinto de lo esperado justo en un ancho donde,
sacándole el TEXTO a los botones-ícono, en realidad entra todo en 1
fila sin problema.

**Fix: una tercera franja de breakpoints**, no solo dos. Antes había
"desktop completo" y "2 filas" con un solo corte. Ahora:

1. **Desktop** (sin media query): 1 fila, todo con texto.
2. **Tablet compacta, nueva** (`800px`–`1180px`): sigue en 1 fila, pero
   se le aplica EL MISMO recorte que ya existía para celular —
   `.d-iconbtn--labeled .lbl{display:none}` (solo ícono, sin texto),
   subtítulo de marca oculto, `max-width` más chico en marca/saludo.
   El contenido cabe en 1 fila porque se le sacó el peso que sobraba,
   no porque se comprimió tipografía.
3. **2 filas** (`≤799px`, bajado de 1180px): recién acá, donde ni con
   los íconos solos alcanza una fila cómoda.

**Regla general que deja esto**: cuando un fix de "no se corta más"
cambia también la FORMA del layout (acá: 2 filas en vez de 1),
verificar con el cliente si el cambio de forma en sí es aceptable —
"ya no se corta" y "se ve como yo esperaba" son dos preguntas
distintas, y un reporte de bug puede en realidad ser sobre la segunda
aunque la causa raíz sea la primera. La solución casi siempre está a
mitad de camino: no volver al layout roto, pero tampoco quedarse con
el primer layout que "funciona" — acá alcanzó con adelantar un
recorte que YA existía en el kit para un ancho más angosto.

---

## 6.17 Primera prueba real end-to-end del kit — 2 bugs reales confirmados en el kit mismo (kit v1.9.2)

§6.10.8 dejaba pendiente **la** validación real: un curso que arranque
copiando `kit-base/` completo y use los 6 módulos nuevos (`coto-player.js`,
`coto-media.js`, `coto-ui.js`, `coto-hotspots.js`, `coto-quiz.js`,
`coto-cierre.js`) TAL CUAL, sin reimplementar nada a mano en `curso.js`
(a diferencia de "Prevención cardiovascular", que nunca los cargó).
Ese curso fue **"Uso de Sucursales 3 - NOA"**, armado en otra sesión sin
acceso a este repo (flujo zip: kit-base.zip + PDF → curso nuevo). El
cliente lo comparó con "Prevención cardiovascular" y lo vio muy por
debajo — pidió auditar qué le faltaba al kit. La auditoría (comparación
de HTML/CSS/JS lado a lado + Playwright contra el zip real entregado)
encontró **2 bugs reales confirmados, los dos en `kit-base/` mismo, no
en cómo se usó** — la señal de que "extraído y validado en aislamiento"
seguía sin ser lo mismo que "anda en un curso real":

1. **`coto-player.js` — `#d-narrate`/`#d-fullscreen` quedaban
   invisibles SIEMPRE, en cualquier navegador.**
   `header-boilerplate.html` trae los dos botones con `hidden` en el
   HTML a propósito — para el caso SIN soporte de Web Speech API /
   Fullscreen API. Pero `initNarrateToggle()`/`initFullscreen()` en
   `coto-player.js` solo tocaban `btn.hidden` en la rama SIN soporte
   (`btn.hidden = true`); la rama CON soporte (el caso normal, el que
   pasa en cualquier navegador moderno) nunca hacía `btn.hidden =
   false`. Resultado: los botones de Locución y Ampliar quedaban
   ocultos para siempre, sin error en consola, en cualquier curso que
   usara el kit como está documentado. Nadie lo había visto antes
   porque "Prevención cardiovascular" — el único curso probado a fondo
   hasta ahora — nunca cargó `coto-player.js`: su versión de estos
   botones vive inline en su propio `curso.js`, sin el atributo
   `hidden` de arranque, así que el bug no tenía forma de aparecer ahí.
   **Fix**: `btn.hidden = false` agregado en la rama con soporte de
   las dos funciones. Verificado con Playwright contra el zip real
   entregado: antes del fix, cero controles de Locución/Ampliar
   visibles en el header pese a que el navegador soporta ambas APIs;
   después del fix (mismo HTML, solo reemplazando `coto-player.js`),
   los dos aparecen andando.
2. **`coto-base.css` — rutas de `@font-face` rotas.** Los 8
   `@font-face` apuntaban a `url('fonts/Nombre.woff2')` — una ruta
   relativa al propio archivo CSS (`css/coto-base.css`), que en
   realidad resuelve a `css/fonts/Nombre.woff2`. La carpeta real de
   fuentes del kit vive un nivel arriba (`fonts/`, hermana de `css/`),
   así que la ruta correcta es `../fonts/Nombre.woff2`. El bug estaba
   agazapado sin que nadie lo notara porque `prevencion-cardiovascular/`
   tiene, además de la carpeta `fonts/` correcta, una copia duplicada
   accidental en `css/fonts/` — un resabio de armado que sin querer
   "tapaba" la ruta rota. El curso nuevo no tenía ese duplicado (armó
   la carpeta limpia, como corresponde) y ahí sí se vio el 404: título/
   textos cayendo a la tipografía de sistema en vez de Faible/Roboto/
   Raleway. **Fix**: las 8 rutas corregidas a `../fonts/` en
   `kit-base/css/coto-base.css`. **Lección**: un curso con un archivo
   de más (la carpeta duplicada) puede estar ocultando un bug real en
   vez de ser simple desprolijidad — vale la pena preguntarse, ante
   cualquier carpeta "de más" en un curso que funciona, si no está ahí
   tapando algo.

**Lo que la auditoría NO encontró en su momento — decisión de contenido
del curso nuevo, no bug del kit** (para no confundir las dos cosas al
leer el reporte que se le mandó al cliente): el chip de logros/puntos y
el botón "Glosario" del header-boilerplate no aparecen en "Uso de
Sucursales 3 - NOA" porque ese curso no tiene sistema de puntaje ni
términos de glosario — se armó `initCierreCelebration({statIds:
[]})` y el header se recortó a mano sacando esos dos elementos. **El
cliente revisó esta "decisión de alcance" y la rechazó de plano — ver
§6.17.1: pasa a ser un requisito fijo, no algo opcional a criterio de
quien arma el curso.**

**Meta-lección de proceso, más allá de estos 2 bugs puntuales:** el
flujo de trabajo real es **kit-base vive en este repo, pero viaja a
cada curso nuevo por zip, hacia sesiones sin acceso a este repo**. Esas
sesiones SÍ pueden encontrar y corregir bugs reales del kit (como pasó
acá — el propio curso nuevo ya traía el fix de fuentes aplicado a su
copia local) pero **no tienen forma de devolver ese fix a este
`kit-base/` canónico** — el arreglo queda atrapado en el
`kit-base.zip` de esa sesión aislada, y este repo sigue con el bug
hasta que alguien lo trae de vuelta a mano (como se hizo acá). **Regla
de proceso**: cuando una sesión de curso nuevo reporta "encontré y
arreglé un bug del kit", ese fix tiene que volver a auditarse y
aplicarse ACÁ, en el `kit-base/` de este repo — no asumir que "ya
está resuelto" solo porque el zip que le devolvieron al cliente lo
tiene.

**Este hallazgo se formalizó como regla dura en §0.1**: el mecanismo
de "alguien se acuerda de traerlo de vuelta" no alcanza — ahora hay un
chat dedicado exclusivamente a `kit-base/`, y todo lo genérico que
surja en una sesión de curso se releva ahí en un prompt, nunca se edita
en el kit desde la sesión de curso misma.

---

## 6.17.1 Gamificación completa: requisito fijo, no decisión de alcance por curso

Tras leer el hallazgo de §6.17 (glosario y logros/puntos ausentes en
"Uso de Sucursales 3 - NOA" por decisión de esa sesión), el cliente
fue explícito: **eso no es una decisión de alcance válida, es un
faltante.** Regla fija desde acá en adelante, para TODO curso de este
molde, sin excepción salvo que el cliente la apruebe explícitamente
para un curso puntual:

- **Logros + puntos**: el chip del header (`data-open-badges`,
  `#d-badge-count`/`#d-points`) tiene que estar presente y funcionando
  — no se recorta del `header-boilerplate.html`. El cierre usa
  `initCierreCelebration()` con rangos de medalla reales (§6.10.6:
  los umbrales se CALCULAN sobre el puntaje realmente alcanzable de
  ESE curso, nunca `statIds: []` ni un cierre "unlocked" sin premio).
- **Glosario**: el botón "Glosario" del header tampoco se recorta.
  Todo curso tiene vocabulario propio del sector/sistema que vale la
  pena definir (nombres de pantallas, siglas, términos de proceso) —
  si a primera vista "no hay términos técnicos", releer el guion del
  PDF buscando nombres de sistema/sector/función que un colaborador
  nuevo no conoce todavía; casi siempre hay más de los que parece.
  Un glosario de 5-6 términos ya cumple la regla — no hace falta que
  sea largo, solo que exista y sirva de consulta real.
- **Al menos una mini-práctica o quiz** (`coto-quiz.js`): el curso
  tiene que darle al alumno una instancia real de poner en práctica lo
  visto, no solo consumir contenido pasivamente. Si el guion del PDF
  no trae una página de práctica explícita, se construye como
  interfaz propia (mismo criterio ya fijado en §3 punto 8) — un banco
  chico de 3-5 preguntas sobre el contenido de las unidades alcanza.
- **Las interacciones dan puntos de verdad**: hitboxes, hotspots,
  videos vistos — cualquier cosa que el gate (§6.10) ya exige para
  avanzar tiene que sumar puntos al completarse, no ser un trámite
  silencioso. Si algo es obligatorio para avanzar pero no premia nada,
  es la señal de que falta cablear `award()`/el sistema de puntos
  sobre esa interacción, no de que "no aplica" gamificación ahí.
- **Si de verdad no hay forma razonable de cumplir alguna de estas
  piezas** para un curso puntual (caso excepcional, no el default):
  **no se resuelve sacando el elemento en silencio.** Se consulta
  explícitamente con el cliente ANTES de entregar, y la decisión (y
  el motivo) queda documentada en el README del curso bajo
  "decisiones que se apartan del brief" — igual que cualquier otra
  desviación del molde estándar (§3 punto 8).
- **Para quien arranca un curso nuevo desde `kit-base/`**: el
  checklist de §7 ya incluye este chequeo como paso explícito — no
  alcanza con "los 6 módulos están cargados" (§6.10.8/§6.17), hay que
  verificar que las 4 piezas de esta lista estén realmente presentes
  y funcionando antes de dar el curso por terminado.

---

## 6.17.2 Auditoría dirigida: "traer de vuelta" prevención cardiovascular al kit — 1 gap real más encontrado

A pedido explícito del cliente ("tomá la última versión de prevención
y llenar el kit base con todo lo desarrollado"), se hizo una segunda
pasada — esta vez comparando función por función `curso.js` de
"Prevención cardiovascular" (1956 líneas, nunca migrado a los módulos
del kit — ver §6.10.8) contra los 6 módulos nuevos del kit, no solo
los 2 bugs puntuales de §6.17.

**Resultado principal: la enorme mayoría YA estaba migrada.** Cada
ronda de este curso (v1.1 a v1.9) fue, en los hechos, exactamente este
trabajo — extraer lo genérico de `curso.js` al módulo del kit que
corresponde. Un repaso función por función confirma que
`initGreeting/initSoundToggle/initNarrateToggle/initVoicePicker/
initFullscreen/initProgressSeek/initAutoplay/initResume` (chrome),
`initBgVideos/initVideoPlayer/initInlineCircleVideos` (media),
`initPopupNarration/initPopupStagger/initStatPopups/
initPrefetchNeighbors/initTiempoActivo` + sonidos (ui),
`initHotspots` (hotspots), `initMiniQuiz` (quiz), y
`animateCertStats/shineCertStats/celebrate/unlockCierre/mostrarResumen/
salirDelCurso/medallaDe/pintarMedalla` (cierre) tienen su equivalente
1:1 en el kit, con la misma firma y el mismo comportamiento.

**Lo que quedó fuera, y por qué está bien que quede fuera** (no son
gaps, son diapositivas específicas de ESTE curso): `initFactores`,
`initPieChart`, `initEtapas`, `initBarras` son 4 aplicaciones
distintas del mismo patrón toggle que `initHotspots` ya generaliza —
existen porque "Prevención cardiovascular" se escribió ANTES de que
`initHotspots` existiera en el kit y nunca se migró (mismo gap de
§6.10.8, ya documentado, no nuevo). `initPrediccion` es la excepción
de diseño de §6.10.2.2 (pop-up "¿Te la jugás?" → "Un momento,
pensemos"), a propósito UNA sola vez, no un patrón a generalizar.
`initSlideGates`/`missingSeen`/`missingPopups` son el cableado de gate
de ESTE curso sobre el punto de extensión `motor.canAdvance` — cada
curso escribe el suyo, es el patrón correcto (§6.10).

**El gap real que sí apareció — medalla, versión desactualizada.**
`css/coto-base-addendum-v1.8.css` todavía tenía la versión VIEJA del
componente `.d-medalla*` (teñir toda la caja con un degradado pálido
por tier) — la que el cliente rechazó explícitamente en la revisión
que dio origen a §6.13 punto 3. El rediseño real (badge saturado
propio alrededor del ícono + caja neutra + efecto cinematográfico de
pop elástico y destello al revelar) quedó documentado en `CLAUDE.md`
pero **nunca se había vuelto a traer al kit** — exactamente el mismo
patrón de falla que los 2 bugs de §6.17 (una sesión de curso encuentra
y arregla algo real, pero el kit canónico de este repo se queda
atrás). Se portó ahora:
- `css/coto-base-addendum-v1.8.css`: bloque `.d-medalla*` reemplazado
  entero por la versión real de "Prevención cardiovascular"
  (`.d-medalla-ic` con badge + `box-shadow`, `@keyframes d-medal-pop`/
  `d-medal-glow`, guard de `prefers-reduced-motion`, ajustes
  responsive en `max-height:800px`/`860px`).
- `js/coto-cierre.js`: faltaba la función `revealMedalla()` — el CSS
  nuevo depende de que algo agregue `.is-revealing` a `[data-medalla]`
  para disparar la animación, y nada lo hacía. Agregada (mismo cuerpo
  que la de "Prevención cardiovascular") y cableada en `mostrarResumen()`
  junto a `animateCertStats`/`shineCertStats` (`setTimeout(revealMedalla,
  150)`), mismo timing que el curso real.
- Verificado con una página de smoke test aislada (solo
  `coto-base.css` + addendum + `coto-cierre.css` + `coto-cierre.js`,
  sin nada de un curso real): antes del fix, badge plano sin
  tratamiento visual; después, degradado oro/plata/bronce con sombra
  sobre la caja neutra, igual al diseño aprobado por el cliente.

**Conclusión honesta para el próximo curso**: después de esta
auditoría, el kit SÍ contiene — código y estilos — prácticamente todo
lo desarrollado y aprobado en "Prevención cardiovascular". Lo que
falta no es volumen de funciones sin migrar, sino que **cada bug o
mejora real que una sesión de curso encuentre tiene que volver a
traerse a este `kit-base/` a mano** (§6.17 ya lo dejó como regla de
proceso) — no hay ninguna sincronización automática entre el
`kit-base.zip` que circula por las sesiones sin repo y este original.

---

## 6.18 Segunda vuelta de "Uso de Sucursales 3 - NOA" — 4 bugs reales más, los 4 en el kit (kit v1.9.4)

El curso se rehízo desde cero siguiendo el método de §7.1 (kit-base +
PDF + zip de "Prevención cardiovascular" como referencia). La auditoría
del PASO 1 —comparar módulo por módulo, función por función, el kit
contra el curso de referencia— **no encontró ninguna diferencia**: la
v1.9.3 ya tenía todo lo de "Prevención cardiovascular" migrado, y las
~94 clases `.d-*` que ambos comparten coinciden byte a byte. Los 4
bugs de esta vuelta aparecieron **construyendo el curso nuevo**, no
comparando con el viejo — que es exactamente el punto de §6.10.8: hay
bugs que solo se ven cuando alguien usa el kit de verdad.

**1 · `header-boilerplate.html` traía 3 botones que nada cableaba.**
El boilerplate marca Glosario, Ayuda y Logros con `data-open-glossary`
/ `data-open-help` / `data-open-badges`, pero el motor solo entiende
`[data-popup-trigger]` y ningún módulo del kit escuchaba esos otros
tres atributos. Un curso que copiaba el boilerplate tal cual —que es
literalmente lo que manda el checklist de §7— quedaba con **3 botones
muertos en la barra superior**: sin error en consola, sin nada que se
abra al tocarlos. Es el mismo patrón de falla que los botones de
Locución/Ampliar invisibles de §6.17, y por la misma razón: el curso
de referencia no usa el boilerplate (su header usa
`data-popup-trigger` directo), así que el bug no tenía dónde
manifestarse. **Fix**: `initHeaderShortcuts()` en `coto-player.js`,
que mapea los 3 alias al pop-up correspondiente (IDs configurables por
`opts`). **Lección**: cuando el kit ofrece DOS formas de declarar lo
mismo, hay que verificar que las dos estén implementadas — un atributo
que solo existe en la plantilla y no en el código es peor que no
tenerlo, porque parece que funciona.

**2 · Un `<video>` dentro de un pop-up de contenido no tenía quién lo
apagara.** `initVideoPlayer` sabe frenar SU reproductor
(`#d-video-player`) al cerrar; `initInlineCircleVideos` ya aprendió a
frenarse en `slidechange` (§6.10.1). Pero un `<video>` cualquiera
adentro de otro pop-up —el caso de este curso, donde cada ficha de
reporte es texto + su video— **no lo frenaba nadie**: se cerraba el
pop-up y el audio seguía sonando sobre la diapositiva. Tercera vez que
se paga la misma pregunta. **Fix**: `initPopupVideos()` en
`coto-media.js` (+ su CSS pareja en `coto-media.css`, con el
`aspect-ratio:16/9` que evita el falso bug de "video recortado" de
§6.14 punto 4 con placeholders de 0 bytes). Cubre cualquier pop-up del
molde: pausa y vuelve a 0 al cerrar, calla la locución al reproducir y
avisa el primer visionado por callback para que el curso premie sin
cablear listeners propios.

**3 · Sin `<link rel="icon">`, un curso nuevo no puede pasar su propia
suite.** El navegador pide `/favicon.ico`, no existe en el paquete, y
ese 404 entra como "error de consola" en **3 de los 6 tests**
(`deep-audit`, `markup-sanity`, `full-regress`). O sea: un curso recién
armado desde el boilerplate arranca con 3 fallos que no son del curso,
y quien audita pierde el tiempo buscando un archivo que no falta. El
curso de referencia SÍ tiene el favicon (data-URI en su `<head>`), pero
nunca se había subido a `header-boilerplate.html` — el mismo tipo de
hueco que §6.17 punto 2. **Fix**: la línea, como data-URI parametrizado
por color de categoría, agregada al boilerplate con la explicación al
lado.

**4 · `medallaDe()` daba la medalla equivocada si los rangos venían en
el orden "natural".** La función recorría `niveles` tal cual y devolvía
el primero que el puntaje alcanzara — correcto SOLO con el array
ordenado de mayor a menor, algo que no estaba escrito en ningún lado.
Con el array al revés (bronce, plata, oro — el orden en que uno los
piensa y los escribe) devolvía **siempre la medalla más baja**, sin
ningún error: 150 puntos exactos sobre un umbral de plata de 150
mostraban "bronce", y el subtítulo decía "te faltaron 20 para la de
oro" **salteando plata**, que es la pista de que algo estaba mal.
Encontrado recién en el recorrido end-to-end real, no por los tests
—ninguno llega al cierre, porque el gate de contenido los frena antes
(§6.10)—. **Fix**: `medallaDe()` ordena una copia por umbral
descendente antes de decidir, así el orden del array del curso deja de
importar. **Lección más general**: una función del kit que depende de
un orden implícito en los datos que le pasa el curso es una trampa —
o lo documenta y lo valida, o se vuelve independiente del orden. Y:
**los 6 tests en verde no significan "el curso anda"**; en cualquier
curso con gate hay que hacer además un recorrido completo a mano
(o con un script propio que resuelva los gates) hasta la última
pantalla, porque toda la lógica de cierre/medalla/estadísticas vive
justo del otro lado de donde la suite se frena.

---

## 6.19 Tercera vuelta sobre "Uso de Sucursales 3 - NOA" — auditoría dirigida contra "Prevención cardiovascular" pieza por pieza (kit v1.9.5)

El cliente pidió algo más puntual que §6.18: comparar, **componente por
componente**, el índice/glosario/ayuda/logros/resumen de cierre de este
curso contra los mismos componentes de "Prevención cardiovascular", y
además rehacer las fichas de reporte y el panel final del minijuego
para que sigan el diseño real del PDF. La sesión que armó la v1 de este
curso (§6.18) había escrito su PROPIA versión de varios de estos
componentes en vez de usar el contrato que el kit ya define — funcionan,
pero no se ven iguales al resto del molde. Hallazgos:

**1 · Índice/glosario/ayuda/logros: reinventados en vez de reusar el
contrato del kit.** La v1 de este curso armó su propio HTML para estos
4 pop-ups (con clases propias, sidenav con "candados" a mano) en vez de
copiar la estructura que ya define `coto-base-addendum-v1.8.css`
(`.d-sidenav-hd`/`.d-drawer-r`/`.modal-hd--dark`/`.d-badges-grid`
`.d-badge.earned`) y que el propio motor cablea solo
(`Motor.prototype._init` ya escucha `[data-goto]`, pone `.is-active` en
el activo). Resultado: visualmente distintos del resto del molde,
aunque funcionaban. **No es un bug del kit** — el kit ya tenía el
contrato correcto, documentado con ejemplo de marcado completo en el
addendum — es la lección de siempre (§6.17.2): "está en el kit" no
sirve de nada si la sesión que arma el curso no lo usa. Reescrito para
copiar el marcado tal cual, incluida `marcarVistas()` (mismo nombre y
misma lógica que el curso de referencia: `.is-done` en lo ya visitado,
nunca "candados" con `disabled` sobre diapositivas futuras — el índice
sirve para VOLVER, el motor ya deja `[data-goto]` saltar a cualquier
lado sin chequear gate, es una limitación conocida y aceptada desde
"Prevención cardiovascular", no algo que este curso deba resolver de
nuevo por su cuenta).

**2 · Resumen de cierre: layout propio en vez del contrato de
`coto-cierre.js`.** Mismo patrón — IDs inventados
(`d-cert-reportes`/`d-cert-situaciones`/...) en vez de los 4 fijos que
`initCierreCelebration` anima con el count-up
(`d-cert-score`/`d-cert-points`/`d-cert-badges`/`d-cert-tries`), sin
`.d-cert-stats .s` (el layout de tarjeta que espera el brillo del
kit), sin el botón "Imprimir resumen" ni la sección `#d-summary` que
lo respalda. Reescrito con el contrato real + contenido propio de este
curso en el resumen imprimible.

**3 · Gap real del kit, no de este curso: faltaba el esqueleto CSS del
resumen imprimible.** `coto-ui.js` trae `initSummaryPrint()` desde v1.6
y varios cursos ya tienen su propio `<section id="d-summary">`, pero
**ningún archivo del kit define el mecanismo genérico** de
mostrar/ocultar (`.d-summary{display:none}` + el bloque
`@media print{ body.printing-summary ... }`). Un curso que cablea el
botón y escribe su `#d-summary` (como pide el checklist) igual
terminaba imprimiendo la app en vivo, rota, porque nada ocultaba el
resto de la interfaz al imprimir. **Fix**: el esqueleto genérico subió
a `coto-cierre.css` (pareja de `initSummaryPrint`); el contenido de
`#d-summary` sigue siendo de cada curso, como corresponde.

**4 · Fichas de reporte: rediseñadas para seguir el PDF real (píldora
de título + esquina redondeada con la ✕), no el `.modal-hd` genérico.**
Es contenido específico de este curso (no sube al kit), pero dejó una
lección de proceso cara: al escribir la regla `.d-rep{padding-top:0}`
con un reemplazo de texto amplio, **se pisó por accidente todo el
resto de las reglas de `.d-rep`** (el grid de 2 columnas, las viñetas
de la lista) que ya estaban escritas más arriba en el mismo archivo —
la ficha quedó en 1 columna, texto y video apilados, sin ningún error
de sintaxis que lo delatara. Se encontró recién mirando el screenshot,
no leyendo el CSS. **Lección general**: un reemplazo de texto que
usa "desde este comentario hasta antes de aquella regla" es tan
peligroso como un merge a ciegas — hay que releer el bloque COMPLETO
después, no solo el fragmento que se tenía en mente al escribir el
`replace`.

**5 · Panel final del minijuego: reusa el arte REAL del diseñador con
las zonas de texto borradas, no una tarjeta genérica inventada.** El
cliente fue explícito: mismo diseño, mismos 2 personajes con trofeos,
la medalla central — el mensaje tiene que poder variar según el
resultado (aprobado / a reintentar) sin perder el arte original. Como
las 6 zonas de texto del PDF (título, bajada, 3 indicadores, botón)
estaban horneadas sobre fondo blanco liso, se pudo re-exportar la
imagen con esas zonas blanqueadas (Python/PIL, rectángulos blancos
sobre las coordenadas medidas) y poner HTML real encima, posicionado
con el MISMO mecanismo que cualquier hitbox sobre captura
(`Motor._initShots`, `[data-place]` para lo no-clickeable, `[data-hit]`
para el botón) — nada de layout propio a mano. **Técnica reusable**
para cualquier curso futuro que necesite un resultado condicional
sobre arte ya diagramado por el diseñador: blanquear solo lo que
cambia, mantener todo lo demás (personajes, íconos, decoración) tal
cual el PDF, texto real encima con las coordenadas de siempre.
Dos bugs de CSS reales al implementarlo, los dos con lección general:
  - `display:flex` sobre un contenedor con texto suelto + `<br>` +
    un `<b>` (mezcla de nodo de texto y elemento) trata cada uno como
    un ITEM DE FLEX separado con `flex-direction` en `row` (el
    default) — el texto y la etiqueta en negrita quedaban lado a lado
    en vez de una línea abajo de la otra. Fix: `flex-direction:column`
    explícito en cualquier contenedor flex que mezcle texto suelto con
    elementos hijos.
  - Un bloque de texto posicionado con `data-place` y anclado con
    `justify-content:flex-end` (pensado para el contenido más largo
    que medía el arte original) empujaba contenido más corto contra el
    borde inferior de su caja — pisaba el botón que está inmediatamente
    debajo. Fix: `flex-start`, el contenido dinámico se ancla arriba de
    su zona, no abajo.

**6 · Gap real del kit: `markup-sanity.mjs` asumía que TODO
`[data-hit]`/`.d-shot-hit` tiene que llevar su texto en `.sr-only`.**
Cierto en el 100% de los casos hasta ahora (botones invisibles sobre
capturas), pero el panel final del punto 5 introduce un patrón nuevo y
legítimo: un botón REAL con texto VISIBLE reconstruido sobre una zona
que el arte dejó en blanco a propósito. El test lo marcaba como el
mismo bug que dio origen al test (`sr-only` filtrándose por una
etiqueta sin cerrar) — falso positivo. **Fix**: nuevo atributo de
opt-out explícito, `data-hit-label-visible`, que el test respeta y que
dice en el propio marcado "este texto visible es a propósito, no una
fuga".

**7 · Interacción de las burbujas azules — CORREGIDO en §6.20: esto
SÍ era un bug, no gustos de diseño.** Lo que sigue quedó mal
diagnosticado en su momento y la vuelta siguiente lo revirtió: pulso
idle sutil y desfasado entre burbujas, hover/focus con `translateY` +
sombra propia (cubic-bezier con overshoot) y estado de presión al
tocar. El cliente lo rechazó explícitamente ("están muy feas y
desprolijas las animaciones... por qué no te copias un poco del
estilo que veníamos usando en Prevención?") — y contra el código real
de "Prevención cardiovascular", NINGÚN `.d-shot-hit` de ningún curso
del kit anima nada: el tinte de fondo en hover + el aro de foco que ya
trae `.d-shot-hit` en `coto-shot-stage.css` ES el estándar. Ver §6.20
punto 2 para el fix y la lección de proceso (inventar una interacción
"vistosa" sin verificarla contra el molde real, aunque se sienta
"mejor", es el mismo error de raíz que ya se documentó en §6.10.8).

---

## 6.20 Cuarta vuelta sobre "Uso de Sucursales 3 - NOA" — recrear con CSS un pop-up que el diseñador ya armó para copiar y pegar (kit-base v1.9.6)

Feedback del cliente con capturas: la ficha de reporte (pop-up con
texto + video) NO se parecía al PDF ("a vos te parece que los pop-ups
están iguales? solo tenías que copiar y pegar, no rehacerlos"), y
después una vuelta más específica: "no tenés que extraer solo el
pop-up, podés copiar directamente toda la diapo con el fondo blur, ya
el diseñador lo armó para que solo copies y pegues la diapo... vos
solo tenés que sumar el reproductor".

**1 · Ficha de reporte: de "recrear con CSS" a "captura íntegra +
overlay real" — mismo patrón `.d-shot-slide--bg-layered` de siempre,
aplicado a un pop-up.** La v1 de la ficha (§6.19 aplicado a este
pop-up) tenía título en píldora + esquina de color + columna de texto
+ columna de video con placeholder gris — todo reconstruido a mano en
CSS tratando de calcar a ojo el diseño del PDF. Resultado: proporciones
distintas del original y un video sin la captura+play que el diseñador
ya horneó en el arte. El pedido real era más simple Y más fiel: la
diapositiva COMPLETA del PDF (fondo difuminado + tarjeta blanca +
título + texto + mockup de video, todo en un mismo render) es un solo
`.d-shot-img`, y sobre esa imagen solo se agregan 2 elementos
posicionados por `Motor._initShots` — el mismo mecanismo que ya usan
las burbujas sobre las diapositivas normales, aplicado por primera vez
DENTRO de un `.modal-card`:
- un botón `[data-hit]` invisible sobre la ✕ ya dibujada (cierra el
  pop-up, `data-popup-close`);
- un `<video controls playsinline poster="...">` real como
  `[data-place]`, del tamaño y posición exactos del mockup ya dibujado
  (mismo `poster` — un recorte del propio render, no un placeholder
  genérico — así la transición póster→reproducción no salta).

Medido con detección de posición por comparación de píxeles (no a
ojo): las 10 fichas del curso comparten la MISMA región de video
(1923,619 a 2717,1128 sobre el render de 3360×1680) y la MISMA región
de ✕ (2654,248, 170×170) — son elementos de plantilla, idénticos en
las 10 diapositivas del PDF. Una sola coordenada de cada uno alcanza
para las 10 fichas.

**Bug real encontrado armando esto:** `.modal-card--shot` necesitaba
que su `.d-shot` interno reservara alto según `aspect-ratio:2/1` —
igual que el lienzo principal (`.d-shot-slide--bg-layered > .d-shot`).
El primer intento reusó el mismo patrón `container-type:size` +
`min(100cqw, 100cqh*2/1)` de ese lienzo, agregando `.modal-card--shot`
a la misma lista de selectores. Resultado: el pop-up abría
COMPLETAMENTE VACÍO (`.d-shot` con `clientHeight:0`, así que
`_initShots` nunca podía calcular ninguna posición). Causa: ese cálculo
con `cqw`/`cqh` depende de que el *contenedor* con `container-type:size`
ya tenga un alto propio resuelto desde AFUERA (el `.d-stage` del curso
lo tiene fijo por el layout de header+footer) — un `.modal-card` no
tiene ningún alto externo, así que con `container-type:size` no puede
resolver ni su propio alto ni el de sus queries: colapsa a 0. Fix: dentro
de un pop-up no hace falta esa gimnasia — `.modal-card` ya sabe encogerse
solo (`max-width`/`max-height:88vh` de la clase base del kit), así que
alcanza con `width:100%` + `aspect-ratio:2/1` directo, sin
`container-type` ni unidades `cqw/cqh`. Nueva clase genérica en
`coto-shot-stage.css`: `.modal-card--shot` + `.modal-card--shot > .d-shot`
— reusable por cualquier curso futuro que necesite este mismo patrón
("pop-up = captura íntegra de una diapo + overlay real").

**2 · Burbujas: animación de 3 capas revertida a la interacción
estándar del kit (ver corrección en §6.19 punto 7).** Se sacaron el
pulso idle (`@keyframes d-burbuja-idle`), el hover con
`translateY`+`scale`+sombra propia y el `:active` con scale — quedó
solo `border-radius` (medido contra el arte) + el `.is-done::after`
(puntito, sin animar). La interacción real vuelve a ser 100% la que ya
da gratis `.d-shot-hit` del kit (tinte en hover, aro en foco) — cero
CSS nuevo de interacción, coherente con "Prevención cardiovascular" y
con cualquier otro hitbox del curso.

**3 · Minijuego "se rompió todo": investigado, NO se encontró
regresión real.** Se rearmaron por script las 2 rutas (3/5 aprobado,
1/5 no aprobado) contra el build corregido y ambas renderizan
correctamente — título, bajada, contador, porcentaje, mensaje y el
botón correcto (`Continuar` solo si aprobó, `Reintentar` si no) todos
en su lugar, sin superposiciones. La captura que mostró el cliente
(3/5, 60%, "¡Excelente!", `Continuar`) es exactamente el resultado
esperado con `MJ_APROBAR = 3` de 5 — no hay bug visible reproducible.
Queda para confirmar con el cliente si la confusión es sobre el
UMBRAL en sí (¿por qué 60%?) más que sobre algo roto en pantalla — el
umbral es una decisión de negocio, no algo que este kit pueda inferir
solo. Las 3 vidas (corazones) del HUD son puramente decorativas — bajan
con cada error pero no cortan el juego ni afectan si se aprueba o no
(eso depende solo de aciertos ≥ `MJ_APROBAR`); si el diseño esperaba que
quedarse sin vidas interrumpiera el intento, es un requisito nuevo, no
un bug de esta implementación.

**4 · `.modal-card--shot` a 1100px dejaba la diapo chica, con doble
fondo difuminado.** Bug real en el fix del punto 1 de esta misma
sección: el ancho se dejó en `min(1100px,94vw)` — el tamaño default de
un pop-up de CONTENIDO (texto/listas), no el de una captura que ya es
la diapositiva completa con su propio fondo horneado. A 1100px la
imagen quedaba centrada con un marco de sobra alrededor mostrando la
diapositiva EN VIVO desenfocada detrás — dos "blur" distintos y
visibles a la vez. Pedido explícito del cliente: "la idea es que la
diapo del diseñador complete todo el espacio". Subir el tamaño a
`min(96vw,176vh)` NO alcanzó (ver punto 5): el doble fondo seguía ahí.

**5 · El fondo difuminado del PDF, sacado del arte — solo queda el de
la tarjeta.** El punto 4 subió el TAMAÑO del pop-up pero dejó el
`.webp` con el fondo difuminado del PDF horneado adentro — a
pantalla casi completa, el doble blur (el del PDF + el del propio
`.modal-back` del pop-up detrás) se veía todavía más, no menos.
Feedback del cliente con captura señalando el borde visible entre
ambos: "tenemos doble fondo y erróneo... de última sacale el fondo
del pop-up y recortalo, solo dejá el pop-up". Fix real: cada `.webp`
de ficha se recortó a SOLO la tarjeta blanca (bounding box del blob
blanco más grande de la página, detectado por componentes conexos —
mismas coordenadas en las 10 fichas: es un elemento de plantilla,
443,153 a 2916,1524 sobre el render de 3360×1680). Sin el fondo del
PDF horneado, el único blur que queda es el del `.modal-back` del kit
— uno solo, no dos. Como la tarjeta NO es 2:1 (es ≈1.805:1,
1980×1097), hubo que ajustar el `aspect-ratio` de `.modal-card--shot
> .d-shot` a la proporción real del recorte — con 2:1 fijo,
`object-fit:cover` (default de `.d-shot-img`) recortaba el arte para
forzarlo al cuadro equivocado. Las coordenadas de `[data-hit]`/
`[data-place]` (✕ y video) también se recalcularon relativas al
recorte nuevo, no a la página completa.

**6 · La ficha dejó de ser un pop-up — pasó a ser una CAPA de la
propia diapositiva.** El punto 5 dejó la ficha viéndose bien (una sola
capa de blur), pero seguía siendo un `.modal` — el cliente lo vio de
nuevo y fue tajante: "a vos te parece que está bien? no entiendo por
qué no copiás y pegás tal cual la diapo del diseñador, no la hagas
como pop-up, hacela como una diapo capa nueva a pantalla completa".
Fix real (no un ajuste de tamaño más — un cambio de mecanismo):
- Los 10 `<div class="modal" data-popup="rep-XXX">` se BORRARON
  enteros. Cada ficha ahora es un `[data-panel]` más, hermano del
  panel `base` (el contenido original con las burbujas), dentro de un
  `[data-layers]` que vive DENTRO de la propia `<section data-slide>`
  — el mismo mecanismo que ya usaba el minijuego para sus 3 capas
  (intro/jugar/fin), aplicado por primera vez a diapositivas-captura
  normales. La burbuja pasa de `data-popup-trigger` a `data-target`
  (cambia de capa en la MISMA diapositiva, no abre nada encima); el
  botón ✕ vuelve a `data-target="base"`.
- Cada panel de ficha reusa el patrón `.d-shot-slide--bg-layered >
  .d-shot` de siempre (mismo lienzo 2:1, mismas reglas cqw/cqh de
  `_initShots`) — puesto en el panel en vez de en la `<section>`
  (ahora hay 2 niveles de por medio: `[data-layers]` y `[data-panel]`).
  Puente nuevo en el `diapositivas.css` DEL CURSO (`.slide-inner[data-layers]{width:100%;
  height:100%;display:flex;align-items:center;justify-content:center}`)
  porque solo lo usan las 3 diapositivas con burbujas de este curso —
  si otro curso repite el patrón "captura con capas en vez de
  pop-up", vale la pena subir el puente al kit en su momento.
- **Bug real de proceso al migrar**: `initPopupVideos()` (coto-media.js
  §4) escucha el evento `popupclose` para pausar el video al cerrar —
  una capa nunca dispara ese evento (dispara `layerchange`). Sin
  arreglarlo, el video de la ficha hubiera seguido sonando después de
  cambiar de capa (mismo bug de "¿quién lo apaga?" de CLAUDE.md
  §6.10.1 punto 1, de nuevo). Se agregó `initLayerVideos()` — mismo
  contrato (silenciar locución al reproducir, premiar primer
  visionado, pausar+resetear al salir), pero escuchando `layerchange`
  y buscando el `[data-panel]` ancestro en vez de `[data-popup]`. El
  curso ahora llama `initLayerVideos()` en vez de `initPopupVideos()`
  (ya no queda ningún `<video>` real dentro de un `[data-popup]` en
  este curso).
- El atributo de la burbuja se renombró de `data-popup-trigger` a
  `data-ficha-trigger`: `data-popup-trigger` tiene cableado GENÉRICO
  en `motor-slides.js` (cualquier elemento con ese atributo dispara
  `showPopup()` al hacer clic) — dejarlo hubiera hecho que la burbuja
  intentara abrir un `[data-popup]` que ya no existe, además de
  cambiar de capa. `data-require-popups` (el atributo de gate en la
  `<section>`) se renombró a `data-require-fichas` por la misma razón
  de claridad, aunque no colisionaba con nada del kit.
- Aprovechando la reescritura completa del archivo, se sacó un
  fragmento de marcado roto que quedó de una edición anterior (un
  comentario HTML sin cerrar entre la sección del minijuego y
  "Últimos consejos" que por casualidad no rompía el render — el
  primer `-->` real que encontraba el parser resultaba estar más
  adelante, así que el contenido intermedio quedaba comentado sin que
  se notara desde afuera).

**7 · La capa SÍ tiene que verse como pop-up — con fondo difuminado
del PDF y todo.** Corrección inmediata al punto 6: sacar el `.modal`
no significaba sacar la estética de "tarjeta flotando sobre un fondo
difuminado" — el cliente lo aclaró con la MISMA captura del punto 5
("la capa nueva tiene que ser esta, como simulando que es un
pop-up"). El punto 5 ya había resuelto el doble-fondo sacando el
`.webp` de solo-la-tarjeta; ese cambio se revirtió: cada panel de
ficha vuelve a usar la diapositiva COMPLETA del PDF (fondo difuminado
horneado + tarjeta) como `.webp`, en las coordenadas originales de
`[data-hit]`/`[data-place]` sobre la página entera. La diferencia
real con el punto 5 (v3) es que ahora NO hay un `.modal-back` de
kit encima — el layer ES la diapositiva, así que solo hay UN fondo
difuminado (el horneado en el arte), nunca dos. Con el panel usando
el mismo `.d-shot-slide--bg-layered > .d-shot` (2:1, `object-fit:cover`
sin recorte porque el PDF completo SÍ es 2:1 real) no hizo falta
ningún `aspect-ratio` especial — es exactamente el mismo cálculo que
cualquier otra diapositiva-captura del curso, sin excepción nueva que
mantener.

---

## 6.21 Auditoría a pedido del cliente contra "Prevención cardiovascular", componente por componente (kit-base v1.9.7)

Pedido directo: "sentí que muchas cosas nos están quedando mal o
faltan". Se comparó cada componente visible de este curso contra el
código REAL del curso de referencia (no contra la memoria de sesiones
anteriores) — capturas lado a lado de header, índice, glosario,
ayuda, logros, salida y resumen, más un diff de clases CSS entre los
dos bundles. La mayoría coincidía ya (índice, glosario, ayuda, logros
y resumen están al día, herencia del trabajo de §6.19). 4 hallazgos
reales:

**1 · Los botones del header usaban atributos inventados
(`data-open-glossary`/`data-open-help`/`data-open-badges`) en vez del
mecanismo genérico del kit (`data-popup-trigger`).** El curso de
referencia usa `data-popup-trigger="glosario"/"ayuda"/"logros"` en
los 3 botones — el motor ya sabe abrir un pop-up con eso, sin JS
extra. La vuelta anterior de este curso (CLAUDE.md §6.18) había
"solucionado" que esos 3 botones no hicieran nada agregando una
función nueva al kit (`initHeaderShortcuts()`, coto-player.js) que
los traducía a `showPopup()` — un parche sobre un síntoma. La raíz
real era que `header-boilerplate.html` traía los atributos
EQUIVOCADOS: debían ser `data-popup-trigger` desde el principio, como
en la referencia. Fix real: se corrigieron los 4 atributos en
`header-boilerplate.html` (kit) y en este curso, y se borró
`initHeaderShortcuts()` — ya no hace falta, es el mismo mecanismo
genérico que abre el índice y cualquier otro pop-up. Lección: un
"arreglo" que agrega código nuevo al kit para que un síntoma
desaparezca, sin comparar contra el molde real, puede estar
tapando el bug en vez de corregirlo — exactamente el error de proceso
que ya describe §6.10.8, de nuevo.

**2 · `.d-sidenav-progress` y `.d-salida-eval` sin CSS propio.** Las
dos clases están en el contrato (las usa el marcado/JS del kit) pero
cada curso tiene que traer su propia regla en su `diapositivas.css`
— no son universales, dependen de `--cat`. Sin la regla, "Viste 1 de
12 secciones" se leía como párrafo negro grande en vez de nota chica
y gris, y el aviso de la evaluación en la pantalla de salida no se
distinguía como nota destacada. Se agregaron las 2 reglas
(equivalentes a las de "Prevención cardiovascular", con
`--cat-soft`/`--cat-strong` en vez de los hex hardcodeados que tenía
la referencia — CLAUDE.md §6.14 punto 2).

**3 · `coto-quiz.css`/`coto-quiz.js`/`coto-hotspots.js` cargados sin
usarse.** Los 3 archivos estaban en el `<head>`/`<body>` del curso
(cargados en cada visita) pero ningún marcado ni JS de este curso los
invoca — el minijuego reemplaza a la mini-práctica de quiz en el
diseño de este curso, así que esos módulos no aplican. Se sacaron las
3 referencias del `index.html` (los archivos siguen en `kit-base/`
para el próximo curso que sí tenga una mini-práctica de quiz).

**4 · Todo lo demás auditado coincide.** Header, índice/sidenav
(mismo `.ix-ck`, mismos grupos), glosario, ayuda, logros (grid de
tarjetas, mismo criterio de bloqueado/desbloqueado), resumen del
cierre (medalla + stats + recap de 3 columnas + imprimir), banner de
"retomá donde dejaste" (`#d-resume`) y el mecanismo de
"Finalizar curso" en 2 pasos (`data-nav-cta`/evento `navcta`) están
todos alineados con el molde real. La sensación de "muchas cosas
quedando mal" venía de estos 4 puntos puntuales, no de una brecha
estructural generalizada.

**5 · Chequeo visual recorriendo las 12 diapositivas a mano, pedido
aparte del cliente.** La auditoría de componentes (arriba) no
reemplaza mirar cada diapositiva real — se recorrieron las 12 por
captura. Confirmó un pendiente real que ya estaba anotado desde antes
sin resolver: en "Stock del sector" la burbuja mostraba **"Activos"**
horneado en el arte, pero abría la ficha **"Clavos (281)"** (el
nombre accesible sr-only ya decía "Clavos" — el desajuste era solo
visual, para el alumno vidente). Fix: se tapó "Activos" con el mismo
azul de la burbuja y se escribió "Clavos" encima (Roboto Bold, misma
altura y centrado que el resto de las burbujas — la fuente real del
diseñador no estaba disponible en `.ttf`, así que se usó la más
cercana ya empaquetada en el curso). Se eligió renombrar la IMAGEN
para que diga "Clavos", no la ficha para que diga "Activos": el resto
del curso (glosario, minijuego situación 5, ficha 281) ya usa
"Clavos" como nombre canónico del reporte — cambiarlo ahí hubiera
sido más invasivo y menos consistente. El resto del recorrido visual
no encontró nada más — el texto invertido en los círculos "Unidad
1/2/3" es diseño intencional del PDF (motivo de sello circular), no
un defecto.

**6 · Re-medición de TODOS los `[data-hit]` importantes contra el
PDF original (pedido explícito: "medilo contra el PDF").** No contra
capturas de pantalla ni contra memoria — contra los renders de las
33 páginas. Se re-detectaron por color+bounding-box las 10 burbujas
(2+5+3) de Ventas/Stock/Gestión, el botón "Empecemos" del minijuego y
el botón "Empezar" de la portada. Resultado: las 10 burbujas y el
botón del minijuego dieron una coincidencia EXACTA (a menos de 0.1
punto porcentual) contra los valores ya cargados — la medición
original de esas piezas fue correcta. **1 hallazgo real**: el botón
"Empezar" de la portada tenía un hitbox `data-h="7.30"` que se
quedaba corto contra la altura real de la píldora (medida: `8.10`)
— el ~1.7% inferior de la píldora visible (unos 21px sobre el lienzo
de 1260px) no respondía al clic/toque. Causa probable: la medición
original de ese botón se hizo a mano/aproximada, no por detección de
color como el resto — inconsistencia de método entre piezas, no un
cambio de diseño posterior. Fix: recalculado por el mismo método de
detección que ya usa el resto del curso (`data-l="75.06"
data-t="82.92" data-w="11.73" data-h="8.10"`). El botón "Continuar"/
"Reintentar" del final del minijuego mostró una diferencia mayor
(~1-3 puntos porcentuales) pero en la dirección de SOBRA, no de
falta — su hitbox es más grande que la píldora del PDF original, lo
cual es intencional ahí: es un botón HTML real con texto dinámico
sobre una zona repintada en blanco (§6.19 punto 6), no una
recreación 1:1 de un elemento oculto del arte, así que no aplica el
mismo criterio de "tiene que calzar exacto".

---

## 6.22 Ronda de UX/interacción a pedido del cliente (kit-base v1.9.7)

Pedido con 4 capturas y 6 puntos de texto — "miralo del lado de UX
diseño interacción, que todo esté en su correcto lugar".

**1 · El pop-up "Cómo recorrer el curso" ya calcaba el de referencia.**
El cliente pidió que quedara igual al de "Prevención cardiovascular"
(píldora "ANTES DE EMPEZAR", grilla 2×2 de tarjetas con ícono, botón
único al pie) pero en colores NOA. Al comparar: ya era así — la
vuelta de §6.19 ya lo había armado con ese contrato
(`.d-instr-modal`/`.d-instr-cardgrid`/`.d-instr-card`) y en azul NOA.
Sin cambios; se dejó registrado para no reabrirlo por error creyendo
que faltaba.

**2 · Hover de las burbujas: el aro de color, no el tinte plano.**
El cliente señaló con captura el hover de los círculos de ENT en
"Prevención cardiovascular" (`.d-shot-hit--ent`, ya documentado en
CLAUDE.md §6.10.3 "resaltar una hitbox: el ícono, no la caja") y
pidió aplicarlo a las burbujas. La v2 de la burbuja (§6.19 punto 7)
había vuelto al tinte plano genérico pensando que ESE era "el estilo
de Prevención" — en realidad el tinte plano es el default para
cualquier hitbox que NO pide el patrón de aro, y los que sí lo piden
(como ENT) usan exactamente este aro. Fix en `assets.css`:
`.d-shot-hit--burbuja` pasa a `background:transparent` con un
`box-shadow` de aro (`color-mix(--cat-strong 55%)`) + elevación
mínima en hover/focus, sin tinte de fondo.

**3 · La ficha vuelve a ser un pop-up real (otra vez).** El cliente
probó la versión de capa (§6.20/§6.21) y objetó algo que ninguna
captura mostraba: "si bien estéticamente queda similar, la idea es
que el pop-up viva separado del fondo, para poder cerrarlo tocando
el fondo" — una capa dentro de la diapositiva nunca iba a poder dar
eso, por diseño (no hay backdrop, no hay nada "afuera" que tocar).
Se ofrecieron 2 caminos (recortar el fondo del arte, o pedirle al
diseñador páginas sin fondo) y se optó por el primero, ya resuelto
en v3 (§6.20 punto 5): el `.webp` de cada ficha vuelve a ser SOLO la
tarjeta (sin el fondo difuminado del PDF), montada de nuevo en un
`.modal`/`.modal-card--shot` real — con `.modal-back
data-popup-close` (tocar afuera cierra) y sin doble blur (el único
fondo difuminado que se ve es el del propio `.modal-back`). Las 10
burbujas volvieron a `data-popup-trigger` (cableado genérico del
kit); `data-ficha-trigger` se mantiene aparte, solo para las marcas
de "visto"/"mirado" (punto 4). Sobre "la cruz mal posicionada": con
las coordenadas del recorte de v3 (`l:89.41 t:6.93 w:6.87 h:12.40`)
el hitbox cubre la X del arte con margen de sobra — se remidió y no
se encontró error; probablemente la observación fue sobre la versión
de capa (con la página completa, otras coordenadas), ya reemplazada.

**4 · Tilde verde al mirar el video, no solo al abrir la ficha.**
Pedido explícito, mismo criterio que el check verde (`#2e7d32`) de
"Prevención cardiovascular" en sus tildes de avance. Se agregó
`estado.videosFicha` (nuevo, separado de `estado.fichas` que ya
marcaba "abrí la ficha") y `marcarBurbujaVisto()`, disparado desde
`initPopupVideos({onFirstPlay})` — que volvió a usarse tal cual (ya
existía en el kit, había quedado sin uso durante la vuelta de capas).
CSS nuevo: `.d-shot-hit--burbuja.is-watched::after` (tilde ✓ blanca
sobre círculo verde, reemplaza visualmente al puntito de `.is-done`
en el mismo lugar — nunca compiten porque "visto" implica "abierto").

**5 · Botón Continuar/Reintentar del minijuego: rectángulo blanco
detrás rompiendo el arte.** Bug real de una vuelta anterior
(§6.17.1/§6.19): al preparar `minijuego-fin.webp` para el texto
dinámico se pintó un rectángulo blanco RECTO sobre la zona del botón
original (que en el arte real es una píldora redondeada más chica)
— el botón CSS (píldora, `border-radius:999px`) no cubría las 4
esquinas del rectángulo, así que quedaban asomando como un recuadro
blanco alrededor del botón redondeado. Fix: se repintó esa franja
con el color de fondo real de la ola (`rgb(150,157,207)`, medido con
color-picker) en vez de blanco — ya no hay nada que sobresalga del
botón, cualquiera sea su forma.

**6 · Resumen de cierre: "se ve muy chiquito" — bug real, no
opinión.** Encontrado auditando `coto-cierre.css`: un bloque de ~20
reglas (`.d-cierre-recap`, `.d-cert-note`, etc.) estaba escrito SIN
ningún `@media` que lo envolviera, y ESE MISMO bloque de valores
(los 3 escalones de compresión para pantallas bajas) ya estaba
correctamente envuelto en `@media (max-height:860/740/660px)` más
abajo en el archivo — comparación línea por línea confirmó que eran
duplicados exactos. El bloque sin `@media` se aplicaba siempre,
pisando en cascada TODO lo de arriba con los valores del escalón más
chico (pensado para pantallas de 660px de alto), sin importar el
tamaño real de pantalla — por eso se veía "muy chiquito" incluso en
pantallas grandes. Fix: se borró el bloque duplicado sin `@media`
(las versiones correctamente envueltas siguen intactas). Aparte, a
pedido del cliente ("agregale más info, para qué sirve cada
reporte"): el repaso rápido pasó de una lista de nombres a una lista
de definición con nombre + 1 línea de qué hace cada uno de los 10
reportes (`.d-recap-rep`, mismo patrón visual que `.d-gloss` pero en
color de categoría), y el ancho del resumen subió de 1400px a
1680px/96% para aprovechar mejor pantallas grandes.

**7 · Fila de tildes verdes "N de M videos vistos" — el cliente
mandó una captura aparte para aclarar el punto 4.** La captura
mostraba el patrón exacto de "Prevención cardiovascular": no solo el
checkmark chico sobre cada burbuja (eso ya estaba, punto 4), sino
también una FILA de tildes agrupadas con etiqueta ("Factor 1 de 6" +
6 círculos que se ponen verdes uno por uno) — el patrón
`.d-u2-prog`/`.d-u2-tick` que ya estaba identificado en el kit
(comentario de §6.10.3) pero nunca se había portado a un curso nuevo.
Se agregó una fila por cada una de las 3 diapositivas con burbujas
(2/5/3 tildes según la cantidad de reportes de esa unidad),
posicionada con el mismo mecanismo `[data-place]` de siempre, debajo
del párrafo de introducción. **Bug real al armarlo**: la primera
pasada dejó el elemento invisible en la posición equivocada (caía
pegado al pie de la diapositiva en vez del 40% de alto pedido) —
`.d-u2-prog` no tenía `position:absolute`, así que el
`left`/`top` en píxeles que calcula `_initShots` no hacía nada
(un elemento en flujo normal ignora `top`/`left`). Mismo tipo de
bug que ya avisa el comentario de `_initShots` en motor-slides.js
sobre por qué CUALQUIER `[data-hit]`/`[data-place]` nuevo necesita
heredar `position:absolute` de alguna clase base — acá se agregó
directo en la regla en vez de heredarlo, y se pasó por alto.

**8 · "La cruz y el play siguen sin funcionar", "las tildes no se
marcan" — investigado, NO son bugs de este curso.** Los 10
`video/*.mp4` son placeholders de 0 bytes (documentado desde CLAUDE.md
§3.9: el cliente todavía no entregó los videos finales). Con un
`<video>` de 0 bytes, `.play()` no dispara el evento `play` (el
navegador no tiene nada que reproducir) — por eso el botón de play no
hace nada VISIBLE, y por la misma razón `initPopupVideos`
(`onFirstPlay`) nunca se dispara, así que la tilde verde tampoco se
marca. Se verificó por script que el botón ✕ SÍ cierra el pop-up
(clic real en sus coordenadas, en 4 tamaños de ventana distintos) y
que el `<video>` está bien posicionado — el bloqueo real es la falta
de archivo, no el marcado ni el JS. Van a funcionar solos en cuanto
se reemplacen los 10 placeholders por los videos reales, sin tocar
código.

**9 · "No hiciste el pop-up de inicio" — investigado, el gate SÍ
funciona, pero dispara al SALIR de "Índice", no al entrar.**
Comprobado por script el flujo completo: Portada → Empezar →
Objetivos → Siguiente (a Índice, sin pop-up, correcto) → Siguiente
(intenta ir a Unidad 1) → ahí SÍ aparece "Cómo recorrer el curso" y
bloquea el avance hasta cerrarlo. Es el mismo mecanismo y el mismo
criterio que usa "Prevención cardiovascular" con su propio
`data-gate-popup="instrucciones"` (también en la diapositiva de
índice, no en la anterior) — `Motor.prototype._advance` gatea
`data-gate-popup` de la diapositiva que se está por ABANDONAR, no de
la que se está por entrar, por diseño (ver comentario en
motor-slides.js). Si el cliente lo espera más temprano (por ejemplo
disparado directo después de "Empezar"), es un cambio de UX a
confirmar explícitamente, no una corrección de bug — mover el
`data-gate-popup` a la diapositiva "Objetivos" lo lograría.

**10 · Fila de tildes: alineada al párrafo y más abajo.** Pedido
puntual — pasó de `data-l="3" data-t="40"` (posición arbitraria) a
`data-l="12.94" data-t="44"`, medido contra el borde izquierdo real
del párrafo de texto en el arte (mismo margen que el título) y con
más aire debajo del párrafo más largo (Stock del sector, 2 líneas +
2 líneas).

---

## 6.23 Portada y separadores de unidad pasan a video de fondo — 1 bug real de kit encontrado (kit-base v1.9.8)

El cliente confirmó que portada y los 3 separadores de unidad
(`unidad1`/`unidad2`/`unidad3`) son diapositivas con VIDEO de fondo,
no imagen estática — mismo patrón que usa "Prevención cardiovascular"
en su propia portada/separadores (`d-shot-slide--bg-video` +
`<video class="d-shot-video">` con `poster`, en vez de
`d-shot-slide--bg-layered` + `<img class="d-shot-img">`). Los videos
reales los agrega el cliente después, directo en el zip — igual
convención que las 10 fichas de reporte, que ya usan placeholders de
0 bytes desde §3.9.

**Cambios:**
- Las 4 diapositivas convertidas a `d-shot-slide--bg-video` con
  `<video class="d-shot-video" playsinline preload="auto"
  poster="img/X.webp"><source src="video/X.mp4"></video>` +
  `.d-shot-video-tap` (botón de gesto para autoplay con sonido
  rechazado), markup idéntico al de la referencia.
- 4 placeholders nuevos de 0 bytes: `video/portada.mp4`,
  `video/unidad1.mp4`, `video/unidad2.mp4`, `video/unidad3.mp4`.
- `initBgVideos()` (ya existía en `coto-media.js`, sin uso) ahora se
  llama desde `boot()` en `curso.js` — quedaba escrito en el kit pero
  ningún curso lo invocaba todavía.

**Bug real de kit encontrado al probar esto — `hitbox-click-check`
lo agarró en el primer test:** la portada tiene un botón "Empezar"
dibujado en el arte, con hitbox `[data-hit]` posicionada en
`data-l/t/w/h`. `Motor.prototype._initShots` (motor-slides.js) mide
SIEMPRE contra `.d-shot-img` (`naturalWidth/naturalHeight`) para
calcular dónde cae esa hitbox — con la portada ahora en video, no hay
`.d-shot-img` en la diapositiva, así que la hitbox quedaba en 0×0 (no
inicializada). La referencia nunca tuvo este caso porque en
"Prevención cardiovascular" ninguna diapositiva con video de fondo
real (con `<video>`, no solo la clase CSS) tiene hitboxes encima — es
una diferencia de diseño de este curso, no algo que la referencia ya
hubiera resuelto.

Fix en el kit (`motor-slides.js`, `_initShots`): ahora soporta tanto
`.d-shot-img` como `.d-shot-video`. Cuando el fondo es video, mide
contra las dimensiones naturales del `poster` (una `Image` oculta
cargando esa URL) en vez de `videoWidth/videoHeight` del propio
video — el poster siempre está presente y es el mismo arte que
tendría la imagen estática, mientras que un video de 0 bytes (o
todavía sin cargar) nunca expone `videoWidth`. Cualquier curso futuro
que ponga un `[data-hit]`/`[data-place]` sobre una diapositiva de
video de fondo hereda el fix gratis, igual que con `.d-shot-img`.

Verificado: `hitbox-click-check` pasa (portada 0×0 → tamaño correcto,
clic real funciona), los otros 5 tests del kit también pasan, y por
captura se confirmó que la portada muestra el poster + botón de
gesto (autoplay con audio rechazado, como es de esperar con un
video de 0 bytes) sin romper el layout.

**Además, en la misma ronda:**
- **Botón "Empezar mi aprendizaje" sin centrar — bug real, CSS
  faltante.** El curso no tenía ninguna regla base para
  `.d-instr-cta` (solo el addendum del kit define su `background`,
  nunca su `display`/alineación) — sin `display:flex;
  justify-content:center` el botón quedaba pegado a la izquierda de
  su contenedor. Se agregó la regla, idéntica a la que ya usa
  "Prevención cardiovascular" en su propio `diapositivas.css`.
- **Tildes de avance de video más grandes:** `.d-u2-tick` pasó de
  `clamp(16px,1.8cqw,26px)` a `clamp(20px,2.3cqw,32px)`, pedido
  puntual del cliente.

---

## 6.24 Revisión full a pedido del cliente: 20 hallazgos, y el peor no lo veía ningún test (kit-base v1.9.9)

El cliente pidió "una revisión full, proponeme 20 correcciones y
mejoras" mientras esperaba el PDF nuevo. De los 20, se ejecutaron 17
(los 4 críticos + 13 elegidos por el cliente). Lo importante no es el
número: es **dónde** estaba el peor.

### El bug que 6 tests en verde no podían ver

`motor-slides.js` emite `courseend` al llegar a la diapositiva marcada
`data-slide-end`, y `courseexit` al salir. **Ningún curso escuchaba
ninguno de los dos.** Consecuencia: `SCORM.markCompleted()` no se
llamaba nunca, así que el alumno recorría el curso entero, aprobaba el
minijuego, llegaba al resumen — y en el LMS su estado seguía siendo
`incomplete`. Para el negocio, el curso no servía para nada.

Los 6 tests del kit estaban en verde porque **todos miran el DOM**:
marcado, hitboxes, teclado, scroll, recorrido, auditoría. Ninguno
miraba la conversación con el LMS, que es justo lo que el cliente
paga. Por eso el fix incluye un 7º test (`scorm-tracking.mjs`) que
levanta un LMS falso en `window.API` y verifica el contrato mínimo.
**Lección: un test que no puede fallar por la razón por la que el
producto existe, no está cubriendo el producto.**

### Corrección de un hallazgo propio, antes de romper nada

El hallazgo inicial decía "`setScore()` nunca se llama, la nota no
viaja al LMS". Es cierto, pero el fix obvio era **peor que el bug**:
`setScore()` marca `passed`/`failed` de forma irreversible, y este
curso NO es la evaluación (el texto de salida dice que el cuestionario
es aparte, en la plataforma). Llamarla habría **reprobado** a quien
sacara 2/5 en un minijuego de práctica. "Prevención cardiovascular"
tampoco la llama nunca — el patrón ya estaba, mal leído.

Fix real: `setProgressScore()` nuevo en el kit, que reporta
`score.raw` como dato informativo **sin tocar `lesson_status`**. La
inconsistencia "minijuego aprueba con 60% pero MASTERY es 70" se
disuelve sola al no flipear estado. En `setScore()` quedó el comentario
que dice cuándo sí y cuándo no usarla.

### Gates que no se pueden satisfacer

Al hacer los videos obligatorios (`faltanVideos`) apareció un riesgo
real: los `.mp4` son placeholders de 0 bytes hasta que el cliente suba
los finales. Un gate a secas dejaba el curso **imposible de terminar**
— el alumno trabado esperando ver un video que no existe. `faltanVideos`
descarta los videos cuya fuente no se puede reproducir (`v.error` o
`networkState === 3`): hoy no molesta, y en cuanto entren los archivos
reales empieza a exigir solo, sin tocar código. **Regla: un gate nuevo
sobre un recurso que todavía no existe tiene que degradar, no trabar.**

### El resto, en breve

- **Botón de play fantasma (kit)**: `initBgVideos` mostraba el ▶ ante
  *cualquier* rechazo de `play()`, incluso con la fuente rota. Ahora
  solo ante `NotAllowedError` (lo único que un gesto arregla).
- **Estado duplicado**: `estado.videos` (por `src`, rutas largas) y
  `estado.videosFicha` (por id) guardaban lo mismo. Quedó solo el
  segundo; `initPopupVideos` ahora pasa `popId` también a
  `seen`/`mark`. `suspend_data` medido: 126 caracteres con 3 fichas,
  lejos del techo de 4096 — pero ahora el test lo vigila.
- **Índice clicable, solo hacia atrás**: pedido explícito — saltar
  libre habría anulado los gates de obligatoriedad. Los destinos no
  visitados quedan `disabled` (fuera del tab order gratis).
- **Intentos del minijuego**: sacados del estado, del `suspend_data` y
  del panel final por pedido del cliente. La 4ª tarjeta del cierre
  ahora muestra "videos vistos". El índice de `cmi.interactions` usa un
  contador local de sesión, no persistido.
- **Dato redundante encontrado de paso**: el panel final mostraba
  "3/5 situaciones" y "60% completado" — el mismo número dicho dos
  veces. El segundo pasó a mostrar el puntaje del juego, que sí agrega
  una dimensión (descuenta por error).
- **Glosario**: de 15 a 31 entradas. Faltaba lo más buscado —
  encontrar un reporte **por número** ("pasame el 219"), que es como
  los nombra la gente en la sucursal.
### Promoción al kit: la deuda que casi se repite

Los arreglos salieron funcionando pero **quedaron en `curso.js`**, que
por la tabla de §1 es archivo del curso. Tres no leían nada propio de
este curso, así que por esa misma regla les tocaba subir — y no
subirlos era exactamente el patrón que genera los bugs de estas
vueltas: algo se resuelve bien en un curso y se vuelve a descubrir,
roto, en el siguiente. Promovidos:

| Antes (curso.js) | Ahora (kit) |
|---|---|
| `habilitarIndice()` | `initIndexJumps(opts)` — coto-ui.js |
| `precargarFichas()` | `initPopupPrefetch(opts)` — coto-ui.js |
| `roto(v)` (local de initBgVideos) | `videoUsable(v)` — coto-media.js, exportado |
| `.d-shot-hit--indice` (assets.css) | coto-shot-stage.css |
| `.d-glossary-sub` (diapositivas.css) | coto-base-addendum-v1.8.css |

`videoUsable` es el caso más claro de por qué conviene: la MISMA
pregunta ("¿este video se puede reproducir?") resuelve el bug del ▶
fantasma y el riesgo del gate imposible. Teniéndola en dos lados se
arregla una y se olvida la otra.

En `curso.js` queda solo lo que sí es de este curso: de dónde sale
"ya visitado" (`estado.vistas`) y qué pop-ups precargar. Verificado
después del refactor: índice deshabilitado en fresco, habilitado tras
pasar por la unidad, clic navega, y las 2 fichas de "Ventas del
sector" se precargan al entrar.

- **2 hallazgos propios que resultaron falsos** y se verificaron antes
  de "arreglarlos": `SCORM.finish()` en `pagehide`/`beforeunload` ya
  estaba (scorm-api.js), y el resumen imprimible ya estaba completo y
  cableado. `prefers-reduced-motion` también estaba cubierto en los 9
  CSS. **Auditar incluye descartar los propios hallazgos.**

---

## 6.25 La tilde verde no se marcaba: un bug que YO introduje al "limpiar" estado duplicado

El cliente reportó tres veces que las tildes verdes no se marcaban. Las
dos primeras lo atribuí (con evidencia) a los .mp4 de 0 bytes: sin
archivo no hay evento `play`, sin `play` no hay tilde. Era cierto —
pero incompleto, y tapó un bug real que había metido yo.

**Cómo se encontró:** en vez de volver a explicar la teoría, generé un
.mp4 real de 2 segundos con ffmpeg, lo puse en lugar de un placeholder
y probé la cadena entera. El evento `play` disparó **y la tilde siguió
gris**. Ahí se acabó la hipótesis del placeholder.

**Causa:** al deduplicar el estado (§6.24) apunté `markSeen` al mismo
mapa que usaba la guarda de `onFirstPlay`:

```js
// coto-media.js — el orden importa
if (!visto.seen(src, popId)) {
  visto.mark(src, popId);                 // escribe estado.videosFicha[popId]
  opts.onFirstPlay(src, popId);           // ...y recién acá corre el curso
}

// curso.js — la guarda ya no podía ser verdadera NUNCA
onFirstPlay: function (src, popId) {
  if (popId && !estado.videosFicha[popId]) {   // ← siempre false
    marcarBurbujaVisto(popId);
  }
}
```

Antes de la limpieza, `markSeen` escribía en `estado.videos` (otro
mapa), así que la guarda seguía funcionando por casualidad. Al unificar
los mapas —que era lo correcto— quedó una doble verificación del mismo
hecho, y la segunda se volvió imposible.

**Fix:** sacar la guarda. `initPopupVideos` YA garantiza que
`onFirstPlay` corre una sola vez; el curso solo tiene que reaccionar.

**Lecciones, las dos caras:**
1. **Una condición verificada dos veces contra el mismo dato es una
   condición muerta esperando.** Si el módulo ya decide "primera vez",
   el consumidor no vuelve a preguntarlo.
2. **Una explicación correcta puede tapar un bug.** El diagnóstico de
   los 0 bytes era verdadero y verificable, y por eso mismo frenó la
   investigación dos rondas. Cuando el cliente insiste después de una
   explicación que cierra, conviene reproducir con el recurso REAL
   (acá: fabricar el .mp4 que faltaba) en vez de repetir el argumento.

**De paso, medido y corregido:** la hitbox de la ✕ de las fichas cubría
x 1770-1906 / y 76-212 cuando la ✕ dibujada mide 33×33px centrada en
(1886, 94) — colgaba 116px a la izquierda y 101px por debajo del
símbolo visible. Ahora es un cuadrado de 77px centrado en la ✕ (área
táctil cómoda, ~51px en pantalla a 1400px de ancho). Las 10 fichas
tenían la ✕ en el mismo píxel, verificado una por una.

**Confirmado con video real:** la ficha reproduce EN EL LUGAR con los
controles nativos (play/pausa, tiempo, volumen, **pantalla completa**),
que es exactamente lo que pedía el cliente. No hacía falta cambiar
nada: `controls` ya estaba en el marcado.

---

## 6.26 Rebuild sobre el PDF v2: cuando el arte mejora, aparecen bugs que el arte viejo tapaba (kit-base v1.9.10)

El cliente pidió al diseñador tres cosas concretas y las tres llegaron:
pop-ups **sin fondo horneado**, una **segunda arte de cierre** para el
minijuego (reintentar además de continuar), y los **datos en blanco**
para completarlos por código. 29 páginas contra 33 de la v1.

### Auditar el PDF ANTES de construir: 3 errores de contenido

1. **Objetivos B y C idénticos**, palabra por palabra.
2. **La burbuja seguía diciendo "Activos"** donde el índice, la ficha y
   el minijuego dicen "Clavos (281)". Mismo error que en la v1, no
   corregido. Evidencia 3 a 1 → se repinta a "Clavos" otra vez.
3. **La situación 1 del minijuego mostraba resaltado el 194** cuando el
   enunciado es textualmente la descripción del 191. Acá el hallazgo
   más útil fue el negativo: **el curso ya tenía `ok: '191'`**. El
   error vivía solo en el mockup. Sin revisar el código antes de
   "arreglarlo", se habría roto algo que estaba bien.

### Los bugs que el arte nuevo destapó

**1 · `_initShots` no re-medía al cambiar el `src` (bug de kit).** El
listener de `load` se enganchaba SOLO si la imagen no estaba completa
al iniciar. El panel final ahora cambia de arte según el resultado, y
como las dos artes miden lo mismo el `ResizeObserver` tampoco
disparaba: las hitboxes y los `[data-place]` se quedaban sin calcular.
Fix: enganchar `load` siempre. **Regla: un elemento cuyo `src` puede
cambiar en caliente necesita que el recálculo esté atado al evento, no
al estado inicial.**

**2 · El CSS pintaba fondo sólido sobre el botón del cierre**, tapando
el texto que ahora viene horneado. Pasó a ser hitbox transparente,
mismo patrón que el "Empezar" de la portada. **Cuando el arte empieza a
traer una pieza, el CSS que la dibujaba deja de ser estilo y pasa a ser
estorbo.**

**3 · Inconsistencia entre las dos artes nuevas**: en "reintentar" el
primer ícono está 51px más abajo que en "continuar". Se ubicaron los
indicadores en una posición que despeja las dos, en vez de moverlos por
JS según la variante.

### Medir, no estimar (otra vez)

Las 10 burbujas se re-detectaron por color. Dos salían de ~700px contra
~455px de las demás: el navy de la burbuja es contiguo con el traje del
personaje, así que la caja se estiraba hasta el hombro. Con el aro de
hover eso se ve mal y además hace clickeable a una persona dibujada.
Fix: avanzar desde el borde izquierdo hasta el primer hueco real de
cobertura. Las 10 quedaron en ~455px.

### Parametrizar en vez de hardcodear

La proporción del recorte de ficha cambió (1980×1097 → 1902×1076).
Estaba escrita a mano en `coto-shot-stage.css`, que es archivo de KIT —
o sea que el kit venía cargando un dato del arte de UN curso. Ahora el
kit expone `--shot-card-ratio` con un default y cada curso declara la
suya. **Si un valor del kit cambia cada vez que cambia el arte, no era
del kit: era una variable disfrazada de regla.**

---

## 6.27 Ronda de pulido visual sobre el PDF v2: 5 pedidos puntuales (kit-base v1.9.11)

**1 · Nombres de video.** El cliente exporta los 10 videos como
"Reporte 191.mp4", "Reporte 194.mp4"... — se renombraron los 10
placeholders y sus 10 referencias en `index.html` para calzar exacto
(antes usaban slugs propios, ej. `191-evolucion-de-ventas.mp4`).

**2 · Tildes pegadas al párrafo — bug real de medición.** El párrafo
de "Stock del sector" en el PDF v2 es más largo que en la v1 y termina
en `data-t≈45.16%`; la fila de tildes seguía en `data-t="44"` (medido
contra el arte VIEJO, nunca reajustado tras el rebuild). Se subió a
`48.5` con margen suficiente para las 3 variantes (ventas 40.08%,
stock 45.16%, gestión 41.98%).

**3 · La forma del hover, corregida con la silueta real, no con
CSS genérico.** El cliente lo dijo con precisión: "esa forma no se
parece a la correcta". Tenía razón — `border-radius:2.2em` dibuja un
óvalo uniforme, pero el globo de diálogo del PDF tiene una "colita"
apuntando al personaje, una curva asimétrica que ningún
`border-radius` reproduce. Fix: se extrajo el contorno EXACTO de cada
una de las 10 burbujas en píxeles (componente conexo no-blanco que
contiene el centro medido, agujeros de texto rellenados con
`binary_fill_holes`, dilatado 6px y restado el original → queda solo
el borde), guardado como máscara PNG→WebP de ~4-5KB por burbuja
(`img/masks/rep-XXX-ring.webp`). En CSS, un `::before` con
`mask-image` + `background:var(--cat-strong)` dibuja el aro con la
forma real, oculto por opacity y visible en :hover/:focus-visible.
**Bug de implementación propio, encontrado antes de entregar**: los
`url()` de un CSS se resuelven relativos a la carpeta del ARCHIVO CSS,
no a la raíz del sitio — escribir `url(img/masks/...)` desde
`css/assets.css` apuntaba a `css/img/masks/...`, que no existe. Se
corrigió a `url(../img/masks/...)`, mismo criterio que ya usan los
`@font-face` de `coto-base.css`.

**4 · Botón "Ampliar" sin estado — bug real, kit.** Los 2 SVG
(expandir/contraer) ya se alternaban solos por CSS al entrar/salir de
pantalla completa, pero el TEXTO visible y el `title`/`aria-label`
quedaban fijos en "Ampliar" aunque el curso ya estuviera maximizado —
mismo botón, dos estados, un solo nombre. Fix en `coto-player.js`
(kit): `fullscreenchange` ahora también sincroniza `.lbl.textContent`
y `title`/`aria-label` ("Ampliar"/"Pantalla completa" ↔
"Contraer"/"Salir de pantalla completa").

**5 · Botón "Empezar" del minijuego, coordenadas del arte viejo.**
Mismo patrón que el bug de la portada en §6.25: el rebuild sobre el
PDF v2 regeneró `minijuego-intro.webp`, pero la hitbox de la píldora
"¡Empecemos!" se quedó con las coordenadas medidas contra la v1
(`data-t="62.38"`). En el arte nuevo la píldora está en
`data-t="54.68"` — 7.7 puntos porcentuales más arriba. Re-medido y
verificado con un clic real (no simulado por selector) en las
coordenadas de pantalla reales del botón.

**6 · El diseño del minijuego no calcaba el arte del PDF v2 — pedido
explícito, no ajuste menor.** El HUD y la grilla de opciones eran una
interpretación libre de la v1, nunca actualizada cuando el diseñador
rehizo el minijuego para v2 (chip "¡Aprendé jugando!" en vez de "¡Jugá
con nosotros!", 4 tarjetas grises uniformes en vez de 3 estilos
distintos, corazones 8-bit en vez del glifo ❤, y sobre todo: el banco
de 10 reportes pasa de una grilla suelta a un "mapa" con líneas
conectoras, estilo organigrama).

Implementación de las líneas — **sin SVG y sin JS de layout**: en vez
de `gap` (que no deja dónde "enganchar" una línea), el grid define sus
propios TRACKS de conexión de 2rem entre cada columna/fila de
contenido (`grid-template-columns: 1fr 2rem 1fr 2rem 1fr`, filas
análogas) y las líneas son ítems más del grid, posicionados por número
de línea (`grid-column`/`grid-row`). El nodo suelto de la 4ª fila
("Relevamiento de clases") cuelga de un travesaño horizontal + 3
tramos verticales cortos — mismo patrón que un organigrama de RRHH.

**Bug real de implementación (encontrado en la primera prueba, no en
producción)**: sin posición explícita en LOS 9 PRIMEROS botones (solo
el 10º la tenía), el auto-flow de CSS Grid llena los tracks en orden,
incluidas las columnas/filas de 2rem reservadas para las líneas —
2 de los 10 reportes terminaban aplastados dentro de una columna
angosta de conexión. Fix: los 9 primeros también reciben
`grid-column`/`grid-row` explícitos por índice (`POS[idx]`), no solo
el que se sale del patrón regular.

**Segundo bug real, mismo commit**: como el "mapa" (grid + líneas) es
SIEMPRE igual — no cambia entre las 5 situaciones, solo cambia cuál de
los 10 nodos es la respuesta correcta — `render()` hacía
`grid.innerHTML=''` y reconstruía los 10 botones en cada situación.
Funcionaba con botones sueltos, pero ahora las líneas viven adentro del
mismo contenedor: recrearlo todo también las hubiera borrado. Se separó
en `armarGrid()` (arma botones + líneas UNA sola vez, al arrancar el
minijuego) y `render()` (solo resetea clases/`disabled` de los botones
existentes) — verificado con las 5 situaciones seguidas Y un reintento
completo: 16 líneas y 10 botones estables, sin clases ni `disabled`
residuales de la partida anterior.

**Tercer bug, cosmético**: `.d-mj-stat b{ display:flex; gap:.3rem }`
en la regla genérica de las 4 tarjetas metía un hueco entre "1" y "/5"
en "Situaciones" ("1 /5") — el gap solo hacía falta en "Puntos"
(ícono + número), pero al ponerlo en la regla compartida, flexbox trata
el texto suelto como otro ítem de flex más. Se acotó `display:flex` +
`gap` a `.d-mj-stat--pts` únicamente.

---

## 6.28 "Los pop-ups se siguen viendo mal" — la causa real era una sombra DOBLE, no un problema de diseño

El cliente insistió varias veces en que las fichas de reporte "se ven
mal" sin poder señalar qué exactamente, y en las últimas 2 vueltas
corregí posición de la ✕, del video y del hover de las burbujas sin
tocar el síntoma real. La vuelta que lo resolvió no fue un ajuste de
coordenadas: el cliente le pidió al diseñador sacar una sombra que
tenía horneada la tarjeta del PDF, y con esa arte nueva el problema
desapareció solo.

**Causa raíz, confirmada pixel a pixel**: el recorte de cada ficha
(`img/rep-XXX.webp`) traía un degradé gris suave horneado alrededor de
todo el borde (~20px, de 255 a ~219 y de vuelta a 255 — una sombra
suave tipo tarjeta). Al mismo tiempo, `.modal-card` (kit,
`coto-base.css`) le aplica su PROPIO `box-shadow: var(--shadow-pop)`
(`0 18px 50px rgba(30,45,70,.22)`, sombra grande) a CUALQUIER pop-up,
incluida la ficha (`class="modal-card modal-card--shot"`, las dos
clases conviven). Resultado: dos sombras superpuestas, una rectangular
(la del PDF, siguiendo el borde recto de la tarjeta original) y una
redondeada (la del CSS, siguiendo el `border-radius` del modal) — el
"se ve mal" era exactamente esta doble sombra desalineada, visible
como un halo gris raro alrededor de la tarjeta.

**Fix, con el PDF v2 actualizado (sin la sombra horneada)**: como el
arte ahora es contenido borde a borde sobre blanco puro sin ningún
límite de tarjeta dibujado, el recorte ya no necesita "encontrar el
borde de la tarjeta" — se mide la UNIÓN del bounding box de contenido
de las 10 fichas (título, párrafo, viñetas, mockup de video, ✕) y se
le agrega un margen uniforme de 70px por los 4 lados, mismo criterio
que el padding interno de una tarjeta. El único fondo/sombra que se ve
ahora es el de NUESTRO `.modal-card`, una sola vez, prolijo.

**Cambios**: los 10 `img/rep-XXX.webp` y sus 10 posters regenerados
(mismo criterio, nueva caja de recorte); `--shot-card-ratio` pasa de
`1.7677` a `2.0917` (la caja con margen es más ancha en proporción que
el recorte ajustado de antes); re-medidos la ✕ (43×43px, antes
también 43×43 pero en otra posición relativa por el nuevo margen) y el
área de video (misma proporción interna, 1.724, se mueve por el mismo
motivo).

**Lección para el checklist de auditoría del kit**: cuando un curso
usa `.modal-card` + arte propio (`.modal-card--shot` u otro patrón de
recorte), el arte NUNCA debería traer su propia sombra/borde horneado
— el kit ya la provee vía `--shadow-pop`, y una segunda sombra en el
PNG/WebP es indetectable "a ojo" en una revisión rápida pero se nota
enseguida al lado de otros pop-ups del mismo curso que sí usan un solo
borde limpio. Pedirle al diseñador arte "sin sombra ni borde, el kit
la pone" debería ser parte del brief inicial, no algo que se descubre
en la 6ª vuelta de feedback.

---

## 6.29 Video con controles nativos duplicando un reproductor ya dibujado en el poster — bug real de kit (`coto-media.js`, kit-base v1.9.13)

El cliente reportó dos síntomas sobre el video de las fichas de
reporte: "el botón de play no funciona" y, al reproducirse, "queda con
bordes circulares y algo en el fondo, no cubre bien la pantalla". El
segundo síntoma resultó ser el contenido REAL del video que el cliente
agrega manualmente al zip (una tarjeta de texto sobre fondo punteado,
exportada así desde su editor) — no un bug de este curso, así que no
hay nada que arreglar en CSS/HTML para eso; se le explica al cliente
que es un tema de export de su lado, no del reproductor.

El primer síntoma sí era un bug real, y de kit. `initPopupVideos()`
(`coto-media.js`) dejaba el atributo `controls` puesto desde el
arranque en los `<video>` de las fichas. El problema es que el
`poster` de estos videos (`img/posters/rep-XXX-poster.webp`) es un
mockup ya renderizado por el diseñador que trae DIBUJADO un
reproductor falso (triángulo de play centrado, barra de progreso roja,
íconos de pausa/volumen/pantalla completa) como parte de la imagen
estática. Con `controls` nativo puesto, el navegador superpone SU
PROPIO overlay de controles sobre ese dibujo — dos reproductores
compitiendo visualmente, con el triángulo de play real invisible o
mal alineado sobre el dibujado. El clic "no funcionaba" porque el
usuario tocaba el play dibujado (parte de la imagen, no clickeable),
no el control real del navegador debajo.

**Fix**: mismo patrón que ya usa `initInlineCircleVideos()` en el
propio kit para el mismo problema — sin `controls` nativo, el video
entero es el target de clic (`video.paused ? video.play() : —`), y
`controls` se activa recién en el evento `play` (así el usuario tiene
forma de pausar/buscar una vez que el video ya arrancó y el poster
dibujado ya no se ve). Al cerrar el pop-up se resetea `currentTime` y
se vuelve a sacar `controls`, para que al reabrir se vea el poster
limpio otra vez. Los 10 `<video class="d-rep-video">` del curso
perdieron el atributo `controls` del HTML (ahora lo pone JS on-demand).

**Nota de entorno de testing**: no se pudo confirmar la reproducción
real (decodificación H.264) en este sandbox — el Chromium de Playwright
acá no tiene códec de video, `canPlayType('video/mp4;codecs="avc1..."')`
devuelve vacío. Se verificó en cambio el ciclo de vida completo del
estado (`controls` false → true al reproducir → false al cerrar/reabrir)
a nivel DOM, que es donde vivía el bug real.

---

## 6.30 Minijuego: layout debe calcar la disposición del PDF, pero lo recreado en CSS puede (y debe) tener más terminación visual que el arte

Dos pedidos en la misma vuelta que en un primer intento fueron en
direcciones opuestas y hubo que corregir: (1) mover las 4 tarjetas de
estado (Situaciones/Puntos/Vidas/Reglas) del header a un bloque
centrado arriba del banco de respuestas, y (2) casi enseguida después,
"que quede con la misma disposición que traía el arte, los tamaños y
ubicaciones similares al arte". La lectura correcta del pedido
completo: la DISPOSICIÓN (posición/tamaño de cada pieza) tiene que
calcar el PDF —cartel a la izquierda, las 4 tarjetas a la derecha,
misma franja superior—, pero las piezas que son recreación en CSS (no
un recorte de imagen real, como sí lo es el cartel "¡Aprendé
jugando!") tienen que verse **más terminadas que el plano gris
original**, con sombras/degradés/transiciones — "más pro diseñador,
con efectos".

**Bug real encontrado de paso, en la vuelta anterior**: las tarjetas
de estado tenían `color:#fff` (texto blanco) sobre `background:#e3e3e6`
(gris muy claro) — contraste casi nulo, el número y la etiqueta de
cada tarjeta eran prácticamente invisibles. Se coló al copiar un
estilo pensado para fondo oscuro sin verificar contra el fondo real.
Fix: `color:var(--text)` para los números y `var(--text-soft)` para
las etiquetas (mismos tokens que usa el resto del curso para texto
sobre superficie clara).

**Terminación visual agregada** (sin tocar la disposición del PDF):
degradé sutil + sombra de "elevación real" (contacto + ambiente) en
las 4 tarjetas, con la de "Puntos" con un acento dorado propio;
hover/active con leve `translateY` + sombra más marcada en el botón
"Reglas"; las píldoras de respuesta ganaron sombra de contacto y un
hover con escala + sombra más notoria (antes solo cambiaba el borde);
el estado de respuesta correcta/incorrecta ahora tiene un pulso corto
(`@keyframes mj-pop`) al aparecer, en vez de cambiar de color en seco.

---

## 6.31 Primer intento de rediseño de las 10 fichas (recorte → HTML real, REVERTIDO en §6.32) + bug real de kit: el letterbox lateral se disparaba en las resoluciones de escritorio más comunes

El cliente reexportó el PDF (`fa455572-...v2.pdf` → nueva versión) con
un diseño de ficha de reporte totalmente distinto al que veníamos
recortando como imagen: fondo blanco liso de borde a borde, título en
píldora que sangra hasta el borde izquierdo, un adorno curvo tipo
"hoja" en la esquina superior derecha con la ✕ de cerrar, viñetas con
punto + línea conectora (1 a 5 por ficha, sin línea cuando hay una
sola), y una tarjeta de video aparte a la derecha. El pedido fue
explícito: "acomodalos como deberían ir en nuestro formato de diapo",
es decir, no seguir recortando la ficha entera como imagen.

**Por qué esta vez SÍ conviene HTML/CSS real** (a diferencia del v1 de
§6.19/§6.20, donde recrear con CSS "no calcaba"): ese arte viejo tenía
textura/sombra imposible de igualar en CSS plano. Este arte nuevo es
geometría plana simple — píldora, círculos, líneas rectas, una tarjeta
redondeada — exactamente el tipo de diseño que SÍ se recrea bien.
Cambio de arquitectura en las 10 fichas (`index.html` + nueva sección 1
de `diapositivas.css`):
- Título, descripción y viñetas pasan a ser HTML real y visible (antes
  vivían DUPLICADOS: la imagen mostraba una versión horneada y un
  `.sr-only` idéntico servía solo al lector de pantalla — ahora hay una
  sola fuente de verdad, visible y accesible a la vez).
- La lista de viñetas usa un patrón genérico reutilizable: punto
  (`.d-rep2-dot`) + línea `::after` que conecta cada punto con el
  siguiente, SALVO en el último `<li>` (que no tiene `:not(:last-child)`)
  — con una sola viñeta no hay línea, igual que el PDF.
- El único recorte de imagen que queda es el adorno de esquina
  (`img/rep-corner.webp`, ~5KB, con transparencia): es una curva tipo
  blob (no un radio circular simple) que se repite IDÉNTICA en las 10
  fichas, así que un solo recorte reutilizado es más prolijo que
  aproximarla con `border-radius`. La ✕ de cerrar es un botón real
  (mismo patrón `data-hit`/hitbox-sobre-imagen que ya usa el kit en
  otros lados) posicionado por porcentaje sobre ese adorno — no es
  parte de la imagen.
- El video ya no depende de `[data-place]`/`_initShots` (ese mecanismo
  es para overlays que tienen que registrarse contra una imagen con
  letterboxing real vía `object-fit`); ahora es un `<video>` normal
  dentro de una tarjeta con `aspect-ratio` fija, posicionado con
  `position:absolute;inset:0` — no hace falta JS para colocarlo.

**Bug real de KIT encontrado de paso** (`css/coto-shot-stage.css`,
kit-base v1.9.14): mientras investigaba el segundo reclamo del cliente
("las diapos no llegan a los bordes laterales"), medí el aspect-ratio
real del `.d-stage` (ancho / (alto − header − footer, ~120px fijos))
contra las resoluciones de escritorio más comunes, no contra el
viewport crudo. El breakpoint que decide "lienzo fijo 2:1 con
letterbox" vs. "llenar el frame completo" estaba en 1.9, pensado como
"cerca de 2:1, letterbox chico y tolerable". Medido de verdad: **casi
ninguna resolución 16:9 común da cerca de 2:1** — 1366×768 (la
resolución de laptop MÁS usada en el mundo) da ≈2.11, 1600×900 ≈2.05,
1280×720 ≈2.13, 1536×864 ≈2.07, 2560×1440 ≈1.94. Todas por encima
(o rozando) el viejo techo de 1.9, así que cualquiera de estas
resoluciones caía en la rama de lienzo fijo con letterbox lateral
REAL — hasta 30-45px de cada lado en 1366×768, medido con Playwright,
nada "chico ni tolerable". Solo 1920×1080 exacto da 2:1 justo (por
eso "se veía bien" en el testeo previo con esa resolución puntual).
**Fix**: subir el techo del rango "llenar completo" de 1.9 a 2.2 —
cubre 16:9 completo (hasta ~1280×720) y deja SOLO ultrawide de verdad
(21:9 ≈2.33+) en la rama de lienzo fijo, que es donde sí corresponde
un letterbox real (recortar tanto ancho ahí SÍ excede el margen de
seguridad del 13% por costado). Verificado con Playwright en 8
resoluciones reales: gap lateral bajó de 30-45px a ≤16px (redondeo)
en TODAS las 16:9/16:10 comunes, mientras 2560×1080 (21:9 real) sigue
letterboxeado a propósito.

---

## 6.32 §6.31 estaba mal leído: el cliente pidió usar las imágenes del PDF, no reinterpretarlas — y las mandó a resolución nativa para pegar directo

Inmediatamente después de entregar el rediseño HTML/CSS de §6.31, el
cliente corrigió: *"no tenías que rehacer los pop ups, tenías que usar
los que te pasé en el pdf"*, y después, más específico todavía:
*"fijate que los pop ups te los pasé en una reso menor para que ya no
tengas que recortar sino que lo pegues encima de la capa base"*.

**Error real de lectura, dos capas**:
1. El mensaje original ("ya exportados los pop de otra forma, vos
   acomodalos como deberían ir en nuestro formato de diapo y
   ubicación") lo interpreté como "reconstruí el contenido en nuestro
   sistema" cuando en realidad decía "el diseñador ya te dio el activo
   final, vos posicionalo" — ambigüedad real del lenguaje, pero el
   precedente de TODAS las vueltas anteriores (§6.19-§6.28) era usar
   recorte de imagen, así que ante la duda debí haber preguntado en
   vez de asumir el cambio de arquitectura más grande posible.
2. Más concreto todavía y verificable con `pdfinfo`: estas 10 páginas
   del PDF NO vienen al tamaño 2520×1260 del resto (el que uso siempre
   para renderizar) — vienen en su propio tamaño de página, ~1855×1029pt
   (ratio 1.8). Mi primer render de estas páginas (antes de escribir
   HTML/CSS) usó `pdftoppm -scale-to-x 2520 -scale-to-y 1260`, que
   ESTIRA cualquier página a ese tamaño exacto sin importar su tamaño
   real — así que aunque hubiera querido recortar la imagen tal cual,
   el render de origen ya venía distorsionado. Eso reforzó (mal) la
   sensación de "esto no se puede usar tal cual, hay que reconstruirlo".

**Fix real**: revertir el HTML/CSS de §6.31 (se descarta, no se deja
"por si sirve" — código muerto no documentado es peor que no tenerlo),
volver al patrón `.modal-card--shot` + `img/rep-XXX.webp` de §6.19/
§6.22 (recorte real, `<video>` posicionado encima con `data-place`),
pero esta vez renderizando cada una de las 10 páginas CON SU PROPIO
tamaño nativo (`pdftoppm -r 130` sin `-scale-to-x/-scale-to-y`, una
página a la vez) en vez de forzarlas al tamaño del resto del PDF.
Resultado: el `.webp` de cada ficha es la tarjeta completa tal cual la
exportó el diseñador (fondo blanco, píldora, viñetas, adorno de
esquina, tarjeta de video con el mockup de muestra incluido) — sin
ningún recorte manual de mi parte, solo convertida a webp. Nuevo
`--shot-card-ratio: 1.8` (era 1.8 también en versiones previas de la
ficha vieja — no es casualidad, es la proporción real del diseño de
ficha en este curso). Coordenadas de `data-place` del video y del
hitbox de cierre re-medidas contra el nuevo recorte (mismo criterio
que siempre: detectar el rectángulo oscuro del mockup / el centro de
la ✕ dibujada, con Python/PIL, no a ojo).

**Lección de proceso para el checklist**: cuando el cliente dice "usá
lo que te pasé" después de una vuelta donde reconstruiste contenido,
la lectura por defecto es SIEMPRE "poné la imagen tal cual", no
"reinterpretalo mejor". Y antes de decidir que un recorte "no se puede
usar tal cual" por verse distorsionado o desproporcionado, correr
`pdfinfo` para confirmar el tamaño de página real de CADA página del
PDF — un PDF puede mezclar tamaños de página distintos entre secciones
(este los mezcla: la mayoría a 2520×1260, las fichas a ~1855×1029), y
forzar todo al mismo tamaño de render estira/distorsiona silenciosamente
lo que no coincide.

---

## 6.33 La ficha quedaba grande y con la ✕ recortada — dos bugs reales, uno de ellos una regla CSS duplicada que se pisaba a sí misma

El cliente probó el fix de §6.32 y reportó dos problemas puntuales:
la ficha se veía "algo grande" y la ✕ de cerrar aparecía recortada
(no se veía completa ni funcionaba bien al tacto/clic en esa zona).
Pidió comparar contra los PDF viejos para ver "el tamaño exacto".

**Bug real #1 — regla CSS duplicada, la última pisa a la primera**:
`diapositivas.css` tenía DOS declaraciones de `.modal-card--shot`
con `--shot-card-ratio` distinto: la de la sección 1 (agregada en
§6.32, valor correcto `1.8`, medido contra el arte nuevo) y otra más
abajo, en la sección 7, que había quedado de §6.28 con el valor del
arte VIEJO (`2.0917`, de un recorte que ya no existe). Mismo
selector, misma especificidad → gana la que aparece último en el
archivo, así que el navegador armaba la caja de la ficha con la
proporción **vieja**, no la nueva — de ahí el tamaño raro y (via
`object-fit:cover`, que recorta lo que sobra para llenar una caja con
la proporción equivocada) la ✕ cortada. Es la misma familia de bug
que §6.25 (estado duplicado, uno de los dos queda viejo) pero en CSS
en vez de JS: **antes de agregar una regla nueva para un selector que
ya existe en el archivo, buscarlo primero** (`grep` del selector) en
vez de asumir que es la única declaración.

**Bug real #2 — tamaño no calibrado contra ninguna referencia real**:
el ancho por default del kit para `.modal-card--shot` (`94vw`) es un
default genérico "lo más grande posible sin salirse", pensado para
cuando no hay otra pista. Medí el PDF de referencia MÁS VIEJO de este
curso (`a5cf8e1b-...`, el que ya mostraba la ficha como pop-up abierto
sobre el fondo de la diapositiva, no como página aparte) con
Python/PIL: ahí la tarjeta ocupa ≈74% del ancho / ≈84% del alto del
lienzo, con harto margen de backdrop visible alrededor — bastante más
chica que el 94vw que se estaba usando. Ajustado a `min(74vw, 80vh ×
1.8)`.

**Ajuste adicional, mismo commit**: el radio de borde de la tarjeta
bajó de `--r-xl` (32px, el default del kit) a `--r` (14px). El arte
nuevo dibuja su propio adorno de esquina (la "hoja" con la ✕) bien
pegado al borde de la imagen — un radio de contenedor grande le comía
un pedazo real, más allá del bug de la proporción. Con uno chico el
recorte del contenedor casi no toca el dibujo, pero la tarjeta sigue
leyéndose redondeada como el resto de los pop-ups del curso.

**Lección para el checklist**: cuando el cliente manda VARIAS versiones
de un mismo PDF a lo largo de la vuelta a vuelta, las versiones viejas
siguen siendo una fuente de verdad válida para proporciones/tamaños
que la versión nueva no muestra en contexto (acá: cómo se ve la ficha
YA ABIERTA sobre el fondo, algo que el PDF más nuevo — cada ficha en
su propia página suelta — no mostraba). No descartar el PDF anterior
una vez que llega uno nuevo; puede seguir respondiendo preguntas que
el nuevo no cubre.

---

## 6.34 Revisión general a pedido del cliente ("pegale una revisión para que se vea y funcione bien") — 3 bugs reales encontrados con Playwright, ninguno reportado antes

Pedido abierto, sin síntoma puntual. Metodología: capturar las 12
diapositivas + los 10 pop-ups de ficha + los pop-ups genéricos
(índice, glosario, instrucciones, reglas) con Playwright a 1600×1000,
mirarlas una por una, y probar el minijuego a un par de resoluciones
angostas realistas (900×700, no solo el ancho de escritorio de
siempre). Encontró 3 bugs reales que ningún test automatizado
detecta (verifican estructura/accesibilidad, no que dos elementos se
vean superpuestos):

**1. El confeti del cierre tapaba el botón "Ampliar" del header.**
`#d-confetti,.d-confetti` (kit, `coto-cierre.css`) tenía
`z-index:200` — muy por encima de `.d-top` (z-index:40, el header del
reproductor). Las piezas de confeti que caen por esa franja quedaban
VISUALMENTE encima del texto de los botones del header, tapándolo. No
hacía falta ganarle a ningún chrome fijo del curso, solo al contenido
normal de la diapositiva (sin z-index, auto/0) — bajado a 35. Bug de
kit, corregido en las dos copias (curso + `kit-base/`, kit-base
v1.9.15).

**2. En el layout apilado del minijuego (`<1000px` de ancho), la
imagen de la situación se derramaba sobre el texto y las opciones de
abajo.** `.d-mj-escena{ height:100% }` funciona en desktop porque su
fila de grid tiene una altura definida (`grid-template-rows` con
`1fr`, agregado ahora), pero en el layout de 1 columna de mobile la
fila quedaba implícita ("auto") — porcentaje contra una fila de altura
indeterminada es circular, así que el navegador terminaba ignorando
el `max-height:100%` de la imagen y la dibujaba a tamaño natural
(~600px) sin que nada la contuviera. Fix real, no cosmético: la imagen
pasa a `position:absolute;inset:0` dentro de un contenedor con altura
DEFINIDA (`height:34vh`, no `%`) — así `object-fit:contain` tiene
contra qué calcular y encoge de verdad en vez de desbordar.

**3. El pop-up de "Reglas del minijuego" no le gustó al cliente.**
No había síntoma técnico — era la única pieza del curso con acento
ámbar/amarillo mientras todo el resto es azul/blanco. Investigando el
motivo: la vuelta que lo creó (ver el `.d-reglas-*` ya borrado) lo
declaró como "excepción de diseño" citando §6.10.2.2 — pero esa
sección describe una excepción real de OTRO curso ("¿Te la jugás?",
con arte propio del diseñador); acá no había ningún respaldo del PDF
para el acento ámbar, fue una decisión mía sin pedido del cliente ni
referencia de diseño. Se reemplaza por el patrón `.d-instr-*` que ya
usa el pop-up "Cómo recorrer el curso" (kit,
`coto-base-addendum-v1.8.css`) — mismo look, cero CSS nuevo que
mantener.

**Lección para el checklist**: "revisión general" sin síntoma puntual
justifica un barrido visual completo con capturas — bugs de
superposición/z-index/desborde son literalmente invisibles para los
7 tests automatizados (que verifican estructura y comportamiento, no
"¿se ve mal esto?"). Y una "excepción de diseño declarada" (§6.10.2.2)
solo es válida si tiene un motivo de diseño real detrás — si en algún
momento se cuela una sin ese respaldo, no hay problema en revertirla
después.

---

## 6.36 Feedback puntual del cliente sobre la revisión de §6.34 — 5 correcciones reales

Ronda de feedback con capturas concretas sobre lo entregado en §6.34.
Cada punto, con su causa real:

1. **La portada no debería tener botón "Empezar"**: es una diapositiva
   de fondo de VIDEO — el cliente pidió sacar el hotspot invisible
   `.d-shot-hit--cta` por completo. Pedido relacionado, mismo mensaje
   ("los videos de las portadas deberían continuar directamente a la
   diapo sin necesidad de hacer clic en Siguiente — así lo veníamos
   haciendo en Storyline"): agregado `initBgVideos` (kit,
   `coto-media.js`) reacciona al atributo `[data-autoadvance]` en la
   diapositiva — al terminar el video de fondo, llama
   `motor._advance(1)` solo. **Distinto del botón global "Reproducir
   todo"** que el cliente pidió sacar en su momento (CLAUDE.md §6.6,
   sigue sin botón en el DOM): esto es angosto y sin UI nueva, opt-in
   por diapositiva vía atributo — no revive esa función. Marcado en
   `portada`, `unidad1`, `unidad2` y `unidad3` (las 4 diapositivas que
   son solo video + texto, sin ninguna otra interacción).
2. **La ✕ de "Cómo recorrer el curso" no cerraba**: bug real de kit,
   confirmado con Playwright (`elementFromPoint` devolvía
   `.d-instr-hd`, no el botón). `.d-instr-hd` tiene `position:relative`
   (lo necesita para sus propios hijos) y sin `z-index` en `.modal-x`,
   dos elementos "positioned" con z-index:auto se apilan por ORDEN DE
   DOM — `.d-instr-hd`, que viene después en el marcado, ganaba aunque
   la ✕ se viera "arriba". `z-index:2` en `.modal-x` (kit,
   `coto-base.css`) lo resuelve para cualquier modal, no solo este.
3. **El círculo decorativo de esquina se recortaba raro**: el
   `::after` de `.d-instr-modal` (kit, addendum) estaba centrado
   exactamente sobre la esquina REDONDEADA de la tarjeta — un círculo
   recortado por otro arco (el de la esquina) dibuja un escalón, no
   una curva limpia. Corrido para que asome solo por el borde inferior
   recto.
4. **El video de la ficha quedaba corrido del fondo blanco**: la caja
   `data-place` del video se había medido a ojo sobre un crop de
   contexto amplio; remedida con detección de borde por gradiente
   (Python/PIL, scaneando dónde el gris del `box-shadow` empieza a
   subir hacia blanco puro, en 3 filas distintas para confirmar) dio
   una caja bastante más angosta y un poco más abajo que la usada —
   sincronizada en las 10 fichas.
5. **Los videos se podían descargar** desde el menú de 3 puntos de los
   controles nativos: `controlsList="nodownload noremoteplayback"` +
   `disablePictureInPicture` en los 10 `<video class="d-rep-video">`.

---

## 6.37 El minijuego no calcaba la dinámica original acordada, y "volver para atrás" dejaba sin forma de rejugar

Feedback de una sesión de prueba real con el equipo del cliente (no
solo la persona que revisa el curso):

**1. Avance automático por temporizador, no por decisión del alumno.**
La versión anterior avanzaba sola con `setTimeout` (1.9s si acertabas,
3.2s si no) — muy poco tiempo para leer la explicación completa y ver
cuál era la correcta, Y no calcaba la dinámica que el cliente había
acordado con el equipo: la marca de correcto/incorrecto tiene que
quedar FIJA hasta que el alumno decida seguir, no revertir sola. Fix:
`responder()` ya no dispara ningún timer — deja las píldoras marcadas
(verde la elegida si acertó, roja la elegida + verde la correcta si no)
y muestra un botón real "Siguiente situación" (`data-mj-next`, oculto
hasta responder) como único disparador para avanzar.

**2. "Volví para atrás y ya no puedo volver a jugar."** El motor no
recarga la diapositiva al navegar — es la MISMA instancia de siempre.
Si el alumno salía a mitad de partida (o después de terminarla) y
volvía, encontraba el panel "jugar" (o "fin") exactamente como lo
había dejado, sin ningún botón visible para arrancar de nuevo — el
único disparador de `empezar()` es el botón de la portada de
bienvenida (`.d-mj-start`), invisible si esa capa no está activa. Fix:
un listener de `slidechange` que, al salir de la diapositiva del
minijuego, resetea a la capa "intro" — volver siempre ofrece el mismo
"¡Empecemos!" limpio de la primera vez.

**3. Las líneas del "mapa" no calcaban el PDF.** La conexión hacia el
10º reporte (el nodo solo, centrado abajo) usaba un travesaño
horizontal a todo el ancho del grid + 3 tramos verticales cortos (tipo
organigrama) — el PDF conecta ese nodo con una única línea vertical
recta desde el botón del medio de la fila de arriba, nada más. El
cliente lo marcó como "líneas raras" con una captura del PDF al lado;
comparación directa confirmó que el travesaño ancho no existe en el
original. Simplificado a una sola línea vertical (`.d-mj-line--v3c`).

**No resuelto en esta vuelta, necesita más información**:
- **Pantalla de resultado "deformada" en el caso de fallar**: no pude
  reproducirlo en Playwright a varios tamaños de ventana (1600×1000,
  1024×640) ni jugando la partida real hasta fallar — el layout salió
  igual en los dos estados (éxito/reintentar) en todos los casos
  probados. Puede ser específico del tamaño de ventana/zoom real del
  que reportó el bug. Pendiente: pedir una captura de pantalla
  completa (no recortada) + tamaño de ventana para reproducirlo.
- **Línea del conector ligeramente descentrada en la ficha "Clavos
  (281)"**: confirmado que el corrimiento YA está en el PDF original
  (se ve igual en un render fresco de la página, antes de cualquier
  recorte o conversión de mi parte) — es el vector del propio archivo
  de diseño, no algo introducido acá. No corregible sin re-dibujar
  encima del arte del cliente; se lo señalo para que lo vean en su
  archivo fuente si les importa corregirlo.
- **Demasiadas opciones (10) para una sola respuesta correcta por
  situación**, y **pedido de rediseñar el layout para que el texto
  "esté todo junto"**: son decisiones de contenido/diseño, no bugs —
  quedan para que el cliente confirme qué dirección quiere antes de
  tocar nada.

---

## 6.38 El foco de la ✕ dibujaba un anillo casi cuadrado sobre un botón redondo — bug real de kit

El cliente volvió a marcar el pop-up "Cómo recorrer el curso" como
"algo mal en el diseño", con una captura mostrando un círculo raro
alrededor de la ✕. No era el mismo bug de §6.36 (el corte de esquina,
ya corregido) — era otra cosa, visible SOLO porque §6.36 arregló que
la ✕ tuviera foco de verdad al abrir el pop-up (WCAG: el foco tiene
que entrar al modal). El anillo de `:focus-visible` genérico del kit
(`coto-base.css`, pensado para botones rectangulares) usa
`border-radius:6px` — sobre un botón CIRCULAR (`.modal-x`,
`border-radius:50%`) dibuja un anillo casi cuadrado que no sigue el
contorno del botón, y esa forma desalineada es la que se lee como
"recorte"/glitch. Bug real de kit, no específico de este curso — pasa
en cualquier pop-up con `.modal-x`. Fix de una línea:
`.modal-x:focus-visible{ border-radius:50%; }`.

**Verificado, no era el problema del cliente pero corre riesgo de
confundir**: la dinámica del minijuego de §6.37 (marca fija +
"Siguiente situación", sin auto-avance) SÍ está andando bien —
probado con Playwright clickeando una opción y esperando 4s: el
estado queda idéntico, sin revertir. El cliente repitió el mismo
reclamo textual de §6.37 en el mensaje siguiente; probablemente
todavía no había probado el zip con el fix, o lo hizo contra una copia
vieja en caché. Las 10 opciones por situación del minijuego (la queja
de "muy difícil") son las MISMAS 10 que trae el PDF del cliente en
cada situación — reducirlas se iría de "que sea lo más parecido al
PDF" (pedido explícito, mismo mensaje). Tensión real entre dos pedidos
del cliente, señalada de vuelta, no resuelta unilateralmente.

---

## 6.39 Rediseño completo del minijuego: cajas más lindas, layout, y la tensión de "10 opciones" resuelta con un mecanismo de juego, no con contenido

El cliente contestó a §6.38 confirmando que la dinámica de "marca fija
+ Siguiente situación" ya andaba bien, y pidió una segunda ronda de
pulido — esta vez con dirección de diseño concreta (screenshot del PDF
al lado) y, sobre la tensión señalada en §6.38 ("10 opciones vs. que
sea igual al PDF"), una idea propia para resolverla sin sacrificar
ninguna de las dos cosas.

**Cambios de layout/visual**:
1. Las 4 tarjetas de estado (Situaciones/Puntos/Vidas/Reglas) vuelven
   a moverse — esta vez a `.d-mj-choose`, centradas arriba del banco
   de respuestas (revierte el layout "cartel + tarjetas en la misma
   fila" de §6.30, que a su vez había revertido la versión centrada de
   una vuelta anterior a esa — la disposición final es esta).
2. Cartel "¡Aprendé jugando!" agrandado (`clamp(2.4rem→3.4rem` pasa a
   `clamp(3.4rem→5rem`).
3. **Bug real encontrado de paso** ("sacale el recuadro blanco que
   tiene detrás del iPad"): las 5 ilustraciones de situación son un
   webp plano sin alpha (fondo blanco horneado), las 5 con el MISMO
   tamaño exacto (950×668). `.d-mj-escena` usaba `object-fit:contain`
   sin que su caja tuviera la misma proporción que la imagen — el aire
   sobrante en un eje se veía como un recuadro blanco de más alrededor
   del iPad, porque el fondo de la diapositiva también es blanco. Fix
   real: `aspect-ratio:950/668` en la caja (no un truco de recorte),
   así no sobra aire en ningún eje.
4. Píldoras de opción con degradé sutil de superficie (no blanco
   plano), sombra de contacto, y estado "resuelto" (ver punto 6) con
   su propio estilo — gris tildado, no "botón roto".
5. Feedback (`.d-mj-fb`) y el botón "Siguiente situación" rediseñados:
   el feedback pasa de texto suelto a una tarjeta con acento de color
   + ícono redondo (✓ verde / i gris), y ambos entran con una
   animación corta en vez de aparecer en seco.

**Mecánica nueva, pedido explícito ("que a medida que contestás bien
tengas más opciones de seguir contestando bien")**: cada reporte
contestado CORRECTAMENTE queda bloqueado (`is-resuelto`, con ✓ y
estilo apagado) para el resto de la partida — el banco de 10 se achica
solo para quien va bien. Seguro por diseño de datos: los 5 `ok` de
`MJ_SITUACIONES` son los 5 IDs distintos (191/285/196/222/281), así
que bloquear un acierto pasado NUNCA puede tapar la respuesta correcta
de una situación futura — el guard en `render()` (`id !== s.ok`) lo
documenta pero en la práctica nunca se dispara con los datos actuales.

**Esto es la resolución real de la tensión de §6.38**: en vez de sacar
opciones del PDF (que lo aleja del original) o dejar las 10 siempre
(que lo hace "muy difícil" para todos), el juego se vuelve
PROGRESIVAMENTE más fácil para quien acierta — mismo tablero que el
PDF en todo momento, pero con menos candidatas activas a medida que
avanza una buena partida.

**Pista tras 20s de inactividad** (pedido explícito, con parámetros
dados: "contador de 50s, a los 20s resaltar 3 opciones"): un
`setTimeout` de 20s por situación resalta con un halo pulsante ámbar
la respuesta correcta + 2 distractores al azar entre los que siguen
disponibles — no delata cuál es la correcta, solo reduce el ruido de
10 a 3. Se cancela al responder o al cambiar de situación/salir de la
diapositiva (mismo `slidechange` de §6.37). No se implementó ninguna
acción especial a los 50s puntuales — el cliente dio el parámetro de
"contador de 50s" sin especificar qué pasa exactamente en ese punto
más allá del resaltado a los 20s; se prefirió no inventar una segunda
mecánica no pedida.

**Animaciones de "sensación de juego"** (pedido explícito): la
respuesta correcta ahora tiene un festejo corto (`mj-celebrate`,
escala + rotación leve) en vez de un pulso plano; la incorrecta
tiembla (`mj-shake`) en vez de solo cambiar de color. Las dos respetan
`prefers-reduced-motion`.

---

## 6.40 El cartel "¡Aprendé jugando!" pasa a estar arriba del iPad (alineado a la izquierda) — 2 bugs reales de layout mobile encontrados al validar el cambio

**Pedido del cliente**, con una captura de la pantalla en vivo:
"el aprendé jugando debería estar arriba del ipad alineado desde el
inicio izquierdo". Antes de tocar código se armó un artifact de
preview (proceso nuevo pedido por el cliente, ver más abajo) con dos
propuestas — cartel arriba del iPad + 3 estilos de píldora — y el
cliente eligió la disposición mostrada y la píldora "opción B"
(elevada, con gradiente y sombra — la que ya estaba en el zip).

**Cambio real**: se sacó el wrapper `.d-mj-hud` (que ponía cartel +
stats en una fila horizontal arriba de las 2 columnas) y se armó
`.d-mj-escena-col` — una columna flex (`align-items:flex-start`) con
el cartel y el iPad apilados, viviendo DENTRO de la primera columna
del grid de `.d-mj-body` junto al iPad. Las stats se quedan centradas
arriba de las opciones, como ya estaban.

**Bug 1 — recorte del iPad en mobile** (encontrado al probar en
900×700, no reportado por el cliente): el `@media(max-width:1000px)`
tenía `.d-mj-escena{ height:34vh; position:relative }` +
`.d-mj-escena img{ position:absolute; inset:0; width:100%; height:100%
}` — una altura fija SIN relación con la proporción real de las 5
imágenes (950×668, ver §6.34). Con `object-fit:cover` forzando esa
caja desproporcionada, la imagen se recortaba mal (se veían franjas
verdes/negras del fondo del arte a los costados en vez del contenido
completo). Fix: en vez de `height:34vh` + `width:100%` (dos medidas
INDEPENDIENTES entre sí, forzando una caja con proporción propia), la
caja pasa a `height:34vh; width:auto` — con el `aspect-ratio:950/668`
de la regla base (desktop) todavía activo, el ancho se DERIVA de esa
altura ya definida, así la proporción real de la imagen se respeta
siempre, en cualquier alto.

**Bug 2 — las stats se superponían al iPad en mobile** (mismo
viewport, encontrado en la misma pasada): `.d-mj-body` es un grid; en
mobile pasa a 1 columna con 2 filas apiladas. Primer diagnóstico
equivocado: parecía el mismo patrón de "altura en % sobre una fila
`auto`" de §6.34, así que se probó sacar `height:100%` de
`.d-mj-escena-col` — no cambió nada. Medición real con Playwright
(bounding boxes de cada bloque) mostró la causa correcta: `.d-mj-body`
hereda `align-items:center` de la regla base de escritorio (donde
tiene sentido, las 2 columnas miden parecido). Acá abajo, apilado, el
contenido de la fila 2 (`.d-mj-choose`, con el listado completo de
opciones) mide MÁS que lo que el grid le asigna a su fila `auto` — y
"centrado" reparte ese sobrante mitad arriba, mitad abajo: la mitad de
arriba invadía visualmente la fila 1 (el iPad), aunque en el DOM las
filas nunca se solapan. Se probó `align-items:start` con
`grid-template-rows:auto auto` explícito — mejoró pero seguía sin
cerrar bien, porque un grid con fila `auto` midiendo una columna flex
que a su vez tiene un ítem con `aspect-ratio` es una medida circular
(el navegador mide la fila `auto` ANTES de que el ancho final de la
columna esté resuelto, y le da un alto menor al real). Como en mobile
`.d-mj-body` es 1 sola columna, el grid no aporta nada ahí: la
solución de raíz fue pasar `.d-mj-body` a `display:flex;
flex-direction:column` dentro de ese media query — cada bloque mide su
alto real por contenido y el siguiente arranca justo después, sin que
el navegador tenga que adivinar el tamaño de una fila antes de tener
los datos para calcularla.

**Proceso nuevo, pedido explícito del cliente** (se aplica de acá en
adelante para todo cambio visual, no solo para éste): *"siempre andá
mostrándome antes de hacer y antes de darme el zip preguntame"* — dos
reglas separadas: (1) antes de implementar un cambio visual/de layout,
mostrar una propuesta (screenshot o artifact) y esperar aprobación
explícita antes de tocar código; (2) antes de entregar cualquier zip,
avisar y esperar el OK del cliente — no enviarlo automáticamente
apenas los tests pasan.

---

## 6.41 Auditoría del cliente comparando 5 pantallas de cierre contra el PDF real + 2 pedidos puntuales resueltos (kit-base v1.9.18)

El cliente mandó 5 capturas (paneles de fin del minijuego, resumen
final, Índice, Glosario) con dos pedidos: **"comparado con el PDF hay
cosas mal"** (genérico) y **"unifiquemos Índice/Glosario/Ayuda en un
solo diseño"** (puntual). Antes de tocar nada se comparó cada captura
contra el render real del PDF (`render/p-31/32/33.png`) para separar
lo que es un bug real de lo que ya era una decisión de cliente tomada
en una vuelta anterior — evitar deshacer trabajo ya aprobado por
malinterpretar "distinto al PDF" como "mal".

**Hallazgo real 1 — Índice/Glosario/Ayuda, 2 estilos de encabezado
mezclados.** El Índice usa su propio header (`.d-sidenav-hd`,
degradado `--brand-deep→--brand`); Glosario y Ayuda traían
`.modal-hd--dark` (navy sólido). La propia nota de `.modal-hd--dark`
en `coto-base.css` (kit-base v1.6, hallazgo de "Prevención
cardiovascular") ya advierte no mezclar variantes de header dentro de
un mismo curso — acá se había vuelto a pisar esa regla. Fix (kit,
`coto-base-addendum-v1.8.css`): `.modal-card.d-drawer-r > .modal-hd`
ahora fuerza el mismo degradado/padding/tipografía del Índice, sin
tocar `.modal-hd--dark` en sí (otros popups que sí la usan a
propósito, como "Mis logros", no cambian).

**Hallazgo real 2 — panel final del minijuego, NO es un bug.** Los 3
datos ("Situaciones correctas/Puntos en el juego/Videos vistos") no
calzan con el texto genérico del PDF ("Situaciones/% completado/
mensaje"), pero es un cambio explícito de una vuelta anterior (§6.10.1/
notas de kit): el PDF repetía el mismo número dos veces ("3/5" y
"60%") y el cliente pidió reemplazar el segundo dato por el puntaje
real. Se dejó como está — señalado al cliente para que confirme, no
se tocó sin su OK.

**Hallazgo real 3 (fuera de alcance, sin tocar todavía) — "Repaso
rápido de todo el curso".** Esa pantalla (medalla + stats + 3 columnas
de texto) es un componente genérico del kit que nunca recibió la
identidad visual real del PDF de cierre (blob azul curvo de "Últimos
consejos", tarjetas tipo globo de diálogo). Es la que más se aleja del
PDF de las 5 capturas. El cliente todavía no priorizó este frente —
queda pendiente, no descartado.

**Pedido puntual — "mucho aire arriba entre el cartel y la barra
superior" (minijuego).** Causa real: `.d-mj-body` es `flex:1` (ocupa
TODO el alto restante de la diapositiva) con `align-items:center` en
una sola fila de grid — con contenido más bajo que ese alto
disponible, quedaba centrado verticalmente y el aire de sobra se
repartía mitad arriba, mitad abajo. `align-items:start` ancla las 2
columnas arriba, sin aire fantasma.

**Pedido puntual — "en mobile está todo desorganizado" (minijuego).**
`.d-mj-escena-col` (cartel+iPad) hereda `align-items:flex-start` de la
regla de escritorio (pensada para vivir al lado de la columna de
opciones) — apilado a pantalla completa en mobile, eso dejaba el
cartel+iPad pegados a la izquierda con aire vacío a la derecha,
mientras las tarjetas de stats y las opciones (ancho completo) se
centran solas: 2 alineaciones distintas en la misma pantalla. Fix
(`@media max-width:1000px`): `.d-mj-escena-col{ align-items:center }`
— todo el stack mobile queda centrado como una sola unidad.

---

## 6.42 El fix de §6.41 sobrecorrigió: "centrado" no era `align-items:start`, y mobile necesitaba la MISMA disposición de escritorio, no una rehecha

Dos correcciones sobre lo hecho en §6.41, con el cliente ya viendo el
resultado en pantalla — ambas bugs reales de CSS Grid, no cambios de
gusto.

**1 · "mucho aire abajo" después de arreglar "mucho aire arriba".**
`.d-mj-body` tenía una sola fila `minmax(0,1fr)` — un track FLEXIBLE
que siempre absorbe el 100% del alto disponible de `.d-mj-body`
(`flex:1`, todo el alto restante de la diapositiva), sin importar qué
diga `align-items`. Con `center` (versión original) cada COLUMNA se
centraba por separado dentro de esa fila gigante — la columna más
corta (cartel+iPad) quedaba flotando con aire propio arriba Y abajo.
Con `start` (fix de §6.41) el contenido anclaba arriba pero todo el
sobrante de esa fila gigante se acumulaba abajo, de un solo lado —
"mucho aire arriba" se convirtió en "mucho aire abajo". Fix real: la
fila pasa de `minmax(0,1fr)` a `auto` (mide lo que el contenido
necesita, ni más) y `align-content:center` centra esa fila YA COMPACTA
como una sola unidad dentro del alto disponible de `.d-mj-body` —
mismo aire arriba que abajo del bloque completo, no de cada columna
por separado.

**2 · El rediseño mobile de §6.40/§6.41 no era "el mismo diseño
ajustado", era otro diseño.** El cliente lo dijo explícito: "el ipad
quedó super chico", "hay huecos, faltan opciones", "respetemos la
disposición del diseño web ajustado un poco para mobile pero
manteniendo el diseño web". Tenía razón — el `@media(max-width:1000px)`
reemplazaba la disposición ENTERA de escritorio (grid de 2 columnas,
grilla de opciones de 3 columnas con líneas conectoras) por otra cosa
(layout apilado, iPad forzado a `height:34vh`, grilla de solo 2
columnas). Se sacó ese reemplazo: ahora la disposición de escritorio
se mantiene tal cual hasta 600px de ancho (las columnas son `fr`, se
angostan solas) y recién por debajo de eso se compacta tipografía y
espaciados — nunca la disposición en sí.

**Bug real de kit encontrado al bajar el ancho, afecta CUALQUIER
tamaño de pantalla, no solo mobile:** `.d-mj-grid` usaba
`grid-template-columns: 1fr 2rem 1fr 2rem 1fr` — `1fr` a secas es
`minmax(auto,1fr)`, el mínimo automático es el tamaño INTRÍNSECO del
contenido, así que la columna nunca se encoge más allá de eso. Con
texto largo ("Mercadería no apta (210)"), en vez de hacer wrap el
grid se ensanchaba más allá del contenedor — la 3ª columna de
opciones quedaba literalmente recortada fuera de la pantalla en vez
de angostarse. Y aunque el TRACK se arregla con `minmax(0,1fr)`, el
ÍTEM (el botón `.d-mj-opt`) también necesita su propio `min-width:0`
— un ítem de grid tiene `min-width:auto` por defecto (= su contenido
sin partir) sin importar cuán angosto sea el track que lo contiene.
Dos fixes, uno en el contenedor y otro en el ítem — con solo el del
contenedor la píldora se sigue derramando fuera de su columna.

**3 · "la de ipad le falta aire arriba" — feedback sobre el resultado
del punto 1, mismo turno.** No era el centrado (ese ya estaba bien):
en anchos ~900-1100px (típico iPad) las columnas de `.d-mj-body` son
más angostas que en escritorio grande, el texto de las opciones
envuelve a más líneas, y `.d-mj-choose` termina midiendo MÁS alto que
el espacio vertical disponible — `align-content:center` reparte
correctamente, pero reparte un DESBORDE (mitad arriba, mitad abajo) en
vez de aire, y la mitad de arriba se comía el hueco bajo la barra
superior. Fix: nuevo `@media(max-width:1100px)` que compacta los
espacios "elásticos" pensados para escritorio grande (los `2rem` fijos
entre filas/columnas de `.d-mj-grid`, el padding de `.d-mj-opt`, los
márgenes de `.d-mj-consigna`/`.d-mj-stats`) — no cambia la
disposición (sigue siendo el mismo grid de escritorio, sin rehacer
nada), solo el "aire interno" de cada pieza, lo suficiente para que el
contenido vuelva a ser más bajo que el espacio disponible y el
centrado tenga margen real. Confirmado con capturas en 900×700 y
1024×768: ~20-45px de aire visible arriba y abajo.

**4 · "las reglas quedaron en 2 líneas" — mismo turno, viendo la
captura de arriba.** `.d-mj-stats` tenía `flex-wrap:wrap` con 4
tarjetas de `min-width:88px` fijo: en el mismo rango ~900-1100px la
4ª tarjeta ("Reglas") no entraba en la fila y se caía sola a una 2ª
línea — 4 tarjetas de estado nunca deberían partirse en 2+2 ni 3+1.
Fix: `flex-wrap:nowrap` (fuerza 1 sola fila siempre) + `.d-mj-stat`
pasa de `min-width:88px` fijo a `min-width:0; flex:1 1 88px` (88px es
ahora una BASE, no un piso — la tarjeta se achica por su contenido
real si hace falta en vez de forzar el wrap). Con "Reglas" ya fijo en
la misma fila, sobró alto para devolverle aire a los márgenes que se
habían compactado en el punto 3 (`.d-mj-escena-col` gap 1.6rem,
`.d-mj-stats` margin-bottom hasta 1.2rem en el rango 1100px) — pedido
explícito del cliente viendo la captura ("me gusta más... incluso
podrías darle más aire").

**5 · "los datos de vida y puntos salen por fuera de sus cajas" —
regresión introducida por el fix del punto 4, mismo turno.** Al sacar
`min-width:0` de `.d-mj-stat` en el punto 4 quedó bien documentado
pero el propio código TODAVÍA lo tenía puesto — quedó una línea vieja
sin borrar. Con `min-width:0` + `flex-wrap:nowrap`, si las 4 tarjetas
no entran en la fila el navegador las achica con `flex-shrink` más
allá de lo que su contenido necesita: el número "1000" (PUNTOS) y los
3 corazones (VIDAS) — las 2 tarjetas con más contenido — se dibujaban
igual, a su tamaño real, pero DESBORDADOS fuera del borde redondeado
de su propia tarjeta (mismo síntoma que el wrap del punto 4, distinta
forma: antes se caía a una 2ª línea, ahora se sale de la caja). Fix
real, dos partes: (1) sacar `min-width:0` de una vez — vuelve el piso
de contenido real por tarjeta; (2) como sacar ese piso hace que la
fila necesite más ancho del disponible en ~900-1100px, achicar el
CONTENIDO de las 2 tarjetas más anchas en ese rango (ícono del trofeo,
tamaño de "1000", corazones, gaps internos) para que su piso real
vuelva a entrar cómodo en una sola fila sin invadir nada. La lección:
`min-width:0` sin verificar que el contenido real entre en el espacio
disponible no es un fix, es mover el problema de "se cae a otra línea"
(visible, feo) a "se derrama silenciosamente" (más difícil de notar
en una revisión rápida).

---

## 6.43 Cierre de ronda: ícono real de NOA, objetivo C, y un bug real en el armado del zip de entrega

**Ícono de marca del header** (pendiente desde §3.9/README-CURSO.md
punto 4): el cliente mandó `Icono NOA.png` — blanco con transparencia,
pensado para ir sobre el fondo de color, no sobre blanco (por eso se
veía "en blanco" al mandarlo por chat, antes de tenerlo como archivo).
Reemplazó `img/icono-no-alimentos.webp` (el donut genérico que había de
placeholder) con el mismo nombre de archivo, sin tocar código.

**Objetivo C** (pendiente desde §3.4/README-CURSO.md 0.4): el PDF v2
repetía el texto de B en C. El cliente mandó una captura con el texto
real ("Aplicar los puntos de control en la rutina diaria de gestión.")
— coincide exacto con `render/p-02.png` (el PDF original, no el v2),
así que se reexportó `img/objetivos.webp` desde esa página (mismo
recorte de 2520×1260, sin re-diagramar nada) en vez de escribir el
texto a mano sobre la imagen existente.

**Bug real encontrado armando el zip de entrega**: el curso tiene DOS
READMEs en la raíz — `README.md` (copia vieja del README del propio
kit-base, arrastrada desde que el curso se scaffoldeó, nunca
actualizada, quedó en v1.9.12) y `README-CURSO.md` (la bitácora real
de ESTE curso, la que se le escribe al cliente en cada vuelta). El zip
de una vuelta anterior empaquetó por error el primero — el cliente
recibía notas de desarrollo del kit en vez de su propia bitácora.
Fix: excluir `README.md` del zip del curso y usar `README-CURSO.md`.
**Regla para el próximo curso**: si se scaffoldea copiando `kit-base/`
de punta a punta (§7), borrar o renombrar el `README.md` heredado
antes de escribir `README-CURSO.md`, para que no puedan coexistir 2
READMEs con nombres casi iguales y contenido totalmente distinto.

---

## 6.44 Batería grande de correcciones del cliente: índice no interactivo, gate real en el menú lateral, esquina del pop-up de instrucciones, y re-calibración del video de las 10 fichas

Pedido en un solo mensaje largo, con varios items reales de distinto
tipo — resumen de los que ya quedaron resueltos:

**1 · Índice de contenidos (diapositiva) dejó de ser clicable.** Tenía
3 hitboxes (una por unidad) que en realidad NUNCA funcionaron —
quedaron `disabled` a mano en el HTML desde siempre (el
`habilitarIndice()` que las iba a prender, mencionado en un comentario
viejo, nunca se escribió). El navegador les seguía dibujando foco/hover
residual igual — el "recuadro raro" que vio el cliente sobre "Stock y
productos". Se sacaron los 3 botones muertos: la diapositiva es 100%
informativa ahora, sin hitboxes fantasma.

**2 · Bug real de gate, no cosmético: el índice lateral (menú ☰) dejaba
saltar a CUALQUIER diapositiva.** `marcarVistas()` en `curso.js` solo
marcaba el tilde `.is-done` en las secciones vistas — el link en sí
seguía siempre habilitado. Cualquiera podía abrir el menú y saltar
directo a "Cierre y resumen" sin abrir una sola ficha, mirar un video ni
jugar el minijuego — los gates de obligatoriedad (que sí frenan el
botón "Siguiente") no se aplicaban acá. Fix (`curso.js` + kit,
`.d-sidenav-item:disabled` en `coto-base-addendum-v1.8.css`): las
secciones no vistas quedan `disabled` — mismo criterio que ya usaba el
índice de contenidos. Vistas → libre ir y volver; no vistas → bloqueadas
hasta pasar por "Siguiente".

**3 · Esquina del pop-up "Cómo recorrer el curso" (`.d-instr-modal`).**
2 intentos previos (§6.36 y uno de esta misma vuelta) de un círculo
decorativo flotante en la esquina inferior izquierda, ninguno se leía
como una esquina limpia — un círculo de OTRO radio superpuesto a una
esquina redondeada siempre deja un "escalón" visible donde las 2 curvas
se cruzan. Fix real: se saca el círculo (`::after`) y la esquina en sí
pasa a `border-bottom-left-radius:70px` — una esquina en punta de medio
círculo de verdad, no una forma superpuesta imitándola. Mismo componente
que usa el pop-up de reglas del minijuego (`.d-instr-modal` compartido).

**4 · Re-calibración completa del video superpuesto en las 10 fichas de
reporte.** Bug real, no solo estético: las 10 usaban las MISMAS
coordenadas `data-place` heredadas de una versión anterior del arte —
el video quedaba más chico y más abajo que la tarjeta blanca real
dibujada en cada imagen, dejando un borde de esa tarjeta visible en vez
de taparla entera ("el rectángulo blanco de atrás"). Proceso de
re-medición, con 2 vueltas en falso documentadas para que no se repita
el mismo error:
  - Medir directo sobre el `.webp` del curso (Python/PIL, transición de
    sombra/fondo) da un resultado que en el render EN VIVO no calza
    igual — hay una diferencia entre el espacio de porcentaje del
    archivo crudo y el del contenedor ya renderizado (no se identificó
    una causa de 1 sola línea; puede ser antialiasing/redondeo de
    layout) lo bastante grande como para que "se ve bien en un recorte
    del archivo" NO garantice "se ve bien en el pop-up real".
  - Medir directo sobre la página del PDF original (que el cliente
    volvió a pasar como referencia) tampoco alcanza sola: hay que saber
    EXACTO dónde está el borde de la tarjeta blanca dentro de esa
    página completa, y un error ahí (ej. agarrar de más el margen del
    pop-up) se traduce 1:1 al resultado.
  - **Método que sí funcionó, y que hay que usar de entrada la próxima
    vez que haga falta re-posicionar algo superpuesto a un `.d-shot`**:
    ocultar el elemento superpuesto (`display:none` por JS), screenshotear
    el POP-UP YA RENDERIADO en el tamaño real de pantalla, y medir sobre
    ESE screenshot (no sobre el archivo fuente ni sobre el PDF). Así se
    mide en el mismo espacio de coordenadas donde después se va a
    POSICIONAR — cero traducción entre sistemas, cero margen para que
    un desajuste de un paso se filtre al siguiente.
  - Valores finales (compartidos por las 10 fichas, mismo template):
    `data-l="50.02" data-t="30.2" data-w="41.39" data-h="48.05"`.
  - De paso, `.d-rep-video` no tenía `border-radius` — con el video
    llenando la tarjeta de punta a punta (ya no hay hueco), sus esquinas
    cuadradas asomaban por fuera de las esquinas redondeadas de la
    tarjeta dibujada debajo. `border-radius:14px` (mismo `--r` que usa
    `.modal-card--shot`) lo resuelve.

**5 · Botones de play sin feedback al hover (kit, `coto-media.css`).**
`initPopupVideos` (coto-media.js) deja TODO el video como un solo botón
de play mientras está pausado (el poster ya trae el ▶ horneado), pero
sin ningún feedback propio más que `cursor:pointer`. Nuevo
`[data-popup] video:not([controls]):hover` con `brightness(1.08)` +
`scale(1.012)` leve (respeta `prefers-reduced-motion`) — apunta solo al
estado pausado/antes de arrancar; una vez reproduciendo, los controles
nativos del navegador ya traen su propio hover.

**6 · Botón "Ampliar"/"Contraer" — pedido opuesto al de una vuelta
anterior.** El texto en pantalla completa había pasado de "Contraer" a
"Salir" por pedido explícito del cliente en una vuelta previa ("cuando
está maximizado no estaría bueno que se llame contraer"). Esta vuelta
pidió volver a "Contraer" — revertido en `coto-player.js` (kit),
dejando el `title`/`aria-label` ("Salir de pantalla completa") sin
tocar, que es donde vive el matiz más explícito.

**7 · Error propio, encontrado y corregido en el momento**: al
sincronizar los archivos de kit tocados esta vuelta, un `cp` sin filtrar
sobrescribió `kit-base/js/curso.js` (la plantilla de arranque para el
PRÓXIMO curso) con el `curso.js` completo de ESTE curso — exactamente
lo que CLAUDE.md §1 prohíbe ("curso.js es específico de cada curso,
nunca toca kit-base"). Reconstruido como plantilla genérica real
(el snippet corto documentado en `kit-base/README.md`, "con v1.7 un
curso.js nuevo arranca así"), sin ningún dato de "Uso de Sucursales 3".
No afectó al curso entregado — el `curso.js` real de este curso nunca
se tocó — pero si no se detectaba a tiempo habría arruinado el punto de
partida del próximo curso.

**8 · "Mis logros" al mismo diseño de Índice/Glosario/Ayuda.** Pedido
explícito de seguir unificando ("todo lo que se desprenda del menú del
curso debe tener el mismo diseño"). `.modal-card.d-drawer-r > .modal-hd`
(fix de §6.41) se extiende a `.modal-card.d-wide > .modal-hd` — mismo
degradado/tipografía, 2 formas de contenedor (cajón lateral vs. modal
centrado), sin tocar `.modal-hd--dark` en sí (queda disponible para un
uso futuro genuinamente distinto).

**9 · "Sonido" no muteaba los videos — bug real, no solo del curso.**
`initSoundToggle` (`coto-player.js`) solo escribía
`localStorage['coto-diapos-mute']`; fx.js/coto-ui.js SÍ la leen (efectos
de UI), pero los 3 patrones de video de `coto-media.js` (fondo, pop-up,
círculo inline) nunca la leían — "Sonido" apagaba los efectos pero no
los videos, contradiciendo la expectativa de un mute GLOBAL. Fix en 2
partes, ambas necesarias:
  - `coto-media.js` gana el mismo helper `muted()` que ya usan
    fx.js/coto-ui.js, y lo aplica (`v.muted = muted()`) justo antes de
    cada `.play()` de los 3 patrones — así todo video que arranca
    DESPUÉS de togglear "Sonido" ya nace en el estado correcto.
  - Eso solo no alcanza para un video de FONDO que ya está sonando EN
    EL MOMENTO del click (portada, separador de unidad) — nadie le
    tocaba `.muted` en vivo. `coto-player.js` suma `syncVideos()`
    (`document.querySelectorAll('video').forEach(v => v.muted = ...)`)
    llamado desde el mismo `sync()` que ya corre al togglear Y al
    cargar la página — cualquier video, de cualquier patrón, presente
    en el DOM en ese momento, queda sincronizado al toque.

---

## 6.45 Arranque de "Seguridad alimentaria" (Área Control de Calidad) — 8 gaps reales del kit y la primera cáscara de minijuego compartida (kit-base v1.9.21)

Curso nuevo armado con el método de §7.1 (kit-base + PDF + el zip de
"Uso de Sucursales 3 - NOA" como referencia). La auditoría del PASO 2
—módulo por módulo, clase por clase— encontró **6 diferencias reales**
entre el kit y el curso de referencia; construir el curso destapó **2
bugs más**, los dos en el kit. Y por primera vez apareció un caso que
la regla de §4 ("si un segundo curso la necesita, sube al kit") pedía a
gritos: **el minijuego**.

### El minijuego: el diseñador reusa su propio molde, así que el kit también

El PDF de este curso trae un minijuego con **el mismo molde visual** que
el de NOA: cartel "¡Aprendé jugando!" arriba a la izquierda, la
ilustración al costado, las 4 tarjetas de estado (encontrados / puntos /
vidas con corazones 8-bit / reglas), el banco de opciones como un "mapa"
de píldoras unidas por líneas, y el panel final con los 2 personajes y
sus trofeos. La **mecánica** sí cambia (acá es UNA imagen con 5 cosas
mal y 12 opciones, no 5 situaciones con 1 respuesta cada una), pero eso
es lógica de juego, no diseño.

Toda esa cáscara vivía en el `diapositivas.css` de NOA — ~120 reglas
`.d-mj-*` con **seis rondas de feedback del cliente encima** (§6.30,
§6.34, §6.37, §6.39, §6.40, §6.42: el aire arriba/abajo, el wrap de la
4ª tarjeta, el derrame de "1000" fuera de su caja, el recuadro blanco
alrededor del iPad, el `minmax(0,1fr)` + `min-width:0`…). Reescribirla
era garantía de volver a pisar los mismos 8 bugs. Se extrajo a
**`css/coto-minijuego.css`** con la separación explícita escrita en el
propio archivo:

- **Kit**: lienzo de las capas intro/fin, columna cartel + ilustración,
  las 4 tarjetas de estado, las píldoras con sus estados, el feedback,
  el botón de avance, el panel final y toda la escalera responsive.
  Parametrizado con `--mj-accent`, `--mj-escena-ratio` y `--mj-track`.
- **Curso**: la TOPOLOGÍA del banco (cuántas filas/columnas y dónde va
  cada línea — 10 nodos en NOA, 12 acá), la proporción real de sus
  ilustraciones, y la lógica del juego en `curso.js`.

**Lección**: cuando el diseñador reusa su propio molde entre cursos, lo
que se repite no es "un componente" suelto sino una PANTALLA entera con
su historia de correcciones. Ahí el costo de no subirla al kit no es
escribir CSS de nuevo: es volver a descubrir los mismos bugs de layout
uno por uno, con el cliente mirando.

### Los 2 bugs que aparecieron construyendo, no comparando

**1 · `medallaDe()` daba una medalla de consuelo, y el subtítulo la
desmentía en la línea de abajo.** Con un puntaje por debajo del umbral
más bajo, la función devolvía igual el nivel más bajo (`return
orden[orden.length - 1]`), mientras el subtítulo —que sí calcula el
próximo umbral por alcanzar— decía cuánto faltaba para ESE MISMO nivel.
En pantalla, textual:

> **Medalla de bronce** — 230 puntos · te faltaron 45 para la de bronce

Te felicita por una medalla y te dice que te faltan puntos para
conseguirla. Se ve solo si alguien queda por debajo del piso (en un
curso bien armado el gate lo garantiza, §6.10.6), pero cuando se ve es
peor que no mostrar nada. **Fix**: `medallaDe` devuelve `null` cuando no
se alcanzó ninguna, y `pintarMedalla` lo trata como el estado real que
es (candado, "Todavía sin medalla de bronce", "te faltan N"). El
contrato suma un `[data-medalla-lbl]` **opcional y retrocompatible**:
si el curso lo trae, el kit escribe ahí la etiqueta que va delante del
nombre y el `<b>` del nombre queda intacto con su estilo; si no lo
trae, se comporta igual que antes.

**2 · El mismo bug de orden implícito de §6.18 punto 4, una función más
abajo.** Aquella vuelta arregló `medallaDe()` para que ordenara una
copia antes de decidir… y dejó intacta la búsqueda del "próximo nivel"
dentro de `pintarMedalla()`, que seguía recorriendo `niveles` en el
orden en que lo escribió el curso. **Lección de proceso**: cuando se
corrige una dependencia de orden implícito, hay que buscar el MISMO
patrón en todo el archivo, no solo en la función que falló — casi nunca
está una sola vez.

### Los 6 gaps de la auditoría contra el curso de referencia

1. **`coto-cierre.css` estilaba `.d-cert-stats` solo dentro de sus media
   queries.** El archivo declaraba que el layout de la tarjeta de
   estadística "queda a cargo de cada curso"… y traía igual sus 3
   escalones responsive de `padding`/`font-size` más abajo. O sea: el
   kit estilaba el componente pero dependía de que el curso escribiera
   la regla base. El que se olvidaba veía "10/10Reportes explorados"
   pegado en una línea. Subió la regla base (usa solo tokens).
2. **El ancho del resumen de cierre (`1680px/96%`) nunca volvió al
   kit** — el fix de §6.22 punto 6 quedó atrapado en el curso, el
   patrón de siempre (§6.17.2). El kit seguía en `1400px/100%`.
3. **`.d-sidenav-progress` y `.d-salida-eval`** seguían fuera del kit
   con una nota que decía que "no son universales porque dependen de
   `--cat`". Es falso: `--cat` lo resuelve el `data-cat` del `<body>`,
   que es justamente el mecanismo genérico del kit (§6.14 punto 2). Las
   dos usan solo tokens. Subieron al addendum.
4. **`.d-instr-cta`**: el addendum traía SOLO el degradé de fondo dentro
   de `.d-instr-modal`; la regla base (`display:flex;justify-content:
   center`) vivía suelta en cada curso, y sin ella el botón queda
   alineado a la izquierda (§6.23). Subió.
5. **Las tildes de avance `.d-u2-prog`/`.d-u2-tick`**: patrón
   identificado desde §6.10.3, portado a mano en §6.22 punto 7, nunca
   subido. Subieron con el `position:absolute` que las hace funcionar
   sobre un `[data-place]` (el bug de §6.22 punto 7 escrito al lado).
6. **`initInlineCircleVideos` no cubría "el arte ya dibuja el
   reproductor".** El fix de §6.29 —sin `controls` nativo hasta que el
   video arranca, porque si no el navegador superpone SUS controles
   sobre el play dibujado en el póster— existía SOLO en
   `initPopupVideos`. Este curso tiene un video embebido en una
   diapositiva normal (no en un pop-up) con ese mismo mockup dibujado,
   y el bug se reproducía igual. Ahora `initInlineCircleVideos` detecta
   la variante por el MARCADO (si no hay `.d-shot-hit-play`, el
   `<video>` es visible siempre y `controls` se agrega en `play`), y
   marca `.is-poster` en el wrapper desde el propio JS para que el CSS
   no dependa de `:has()` ni de que el curso se acuerde de escribirla.

### 2 piezas nuevas del kit, las dos pedidas por el arte de este curso

**`.modal-card--art` (coto-shot-stage.css)** — el diseñador entregó los
6 pop-ups como **PNG con alfa real**, a resolución nativa, con su ✕ (o
su botón "Continuar") ya dibujados. `.modal-card--shot` no servía por
dos motivos que no son de gusto: (a) la silueta no es un rectángulo —el
ícono redondo sobresale por arriba de la tarjeta—, así que el
`background` y el `border-radius` de `.modal-card` se dibujarían como
una caja blanca detrás del círculo, delatando el recorte; y (b) la
sombra ya viene en el alfa, y `.modal-card` le suma `--shadow-pop`: las
dos sombras desalineadas de §6.28, otra vez. La clase nueva es
transparente, sin borde ni sombra, con `object-fit:contain` y su
`--shot-card-ratio` por pop-up.

**`initShotSwap()` (coto-media.js)** — la generalización que §1 y §8
venían anotando como pendiente desde "Surtido sin venta"
(`initConceptShots`, con los 7 conceptos hardcodeados: *"si un curso
futuro repite el patrón, generalizarla recién ahí"*). Este curso lo
repite **cuatro veces**: 2 carruseles, 1 juego de pestañas y 1 barra de
4 pasos, todos "una zona dibujada en el arte cambia la página entera
por otra variante del mismo PDF". Tres detalles que valen para
cualquier curso futuro:

- **Swap de `src`, no `[data-layers]` con un panel por variante.** Son
  la MISMA página con una pieza distinta: N paneles serían N copias del
  mismo marcado y N juegos de hitboxes que mantener sincronizados.
- **La flecha que se iría de rango se OCULTA sola.** En estos PDF el
  diseñador dibuja la flecha solo donde existe (la primera página no
  tiene "anterior", la última no tiene "siguiente"). Un botón invisible
  sobre una flecha que no está dibujada es exactamente el hitbox
  fantasma que prohíbe §7.3 punto 4.
- **El módulo no narra.** Expone `onChange(indice, id, vistos, total)`
  y nada más: qué se narra en cada paso es contenido, y narrar el paso
  actual —nunca la consigna fija de la diapositiva— es la regla de
  §6.5 que ya costó un reporte del cliente.

### El botón del panel final: cuándo pintar y cuándo no

El arte de cierre del minijuego de este curso dibuja **"Reintentar" en
las DOS versiones**, también en la de aprobado — el alumno que pasa
quedaría sin botón para seguir. El cliente confirmó que tiene que decir
"Continuar" al aprobar, así que el botón pasa a ser HTML real.

La tentación es blanquear la zona en el arte y dibujar encima. **No**:
es exactamente el bug de §6.22 punto 5 (un rectángulo blanco sobre una
píldora redondeada deja las 4 esquinas asomando), y acá encima el botón
cae justo sobre el borde entre el fondo blanco de la tarjeta y el piso
gris del dibujo — no hay un color de fondo único con el que taparlo.
Lo que sí funciona: **repintar el botón entero con la misma forma,
tamaño y colores medidos sobre el arte**, de modo que cubra al dibujado
sin dejar nada asomando (relleno y trazo sacados con un muestreo de
píxeles, no a ojo). Quedó como variante genérica en el kit,
`.d-shot-hit.d-mj-fin-cta` (coto-minijuego.css), al lado de la
`.d-mj-fin-btn` transparente de siempre, con la regla de cuándo usar
cada una escrita en el propio archivo:

- El arte trae el texto CORRECTO para ese resultado → hitbox
  transparente (`.d-mj-fin-btn`). Pintarle fondo taparía el texto del
  diseñador (§6.26 punto 2).
- El texto DEPENDE del resultado y el arte dibuja uno solo →
  `.d-mj-fin-cta`, con `--mj-cta-bg`/`--mj-cta-border` que pone el
  curso porque los colores salen del arte, no de la categoría.

### Dos errores propios, atrapados antes de entregar

- **`data-nav="next"` sobre una hitbox invisible.** Parecía la forma
  natural de cablear el "Empezar" dibujado en la portada. Pero
  `_syncNav` le agrega `.d-nav-btn--cta` a **cualquier** elemento con
  ese atributo, y esa clase pinta `background:var(--cat-strong)`: el
  resultado habría sido un bloque de color sólido tapando el botón que
  el arte ya dibuja. `data-goto` hace lo mismo (el motor lo cablea
  igual) sin ese efecto. **Regla**: antes de reusar un atributo del
  chrome en un elemento que NO es del chrome, revisar qué le hace
  `_syncNav` — el motor no distingue entre un botón de la barra y una
  hitbox sobre una captura.
- **La fila de tildes pisando el párrafo de consigna**, en 2
  diapositivas. No se vio mirando el curso: se vio con el overlay de
  hitboxes (`tools/verify-hitboxes.mjs`), que dibuja también los
  `[data-place]`. La banda realmente vacía del arte estaba DEBAJO de
  los puntos del carrusel (82,1% de alto), no arriba. **Reafirma §7.3
  punto 5**: la posición de cualquier overlay se mide contra el arte
  (acá: perfil de filas no-blancas del render), no se estima.

---

## 6.46 Ronda de feedback + 10 propuestas de mejora sobre "Seguridad alimentaria" — 3 piezas que subieron al kit (kit-base v1.9.22)

Ronda con dos partes: 6 correcciones puntuales pedidas por el cliente
sobre lo entregado en §6.45, y un bloque de 10 propuestas de mejora
propias (autorizadas 9/10 — la restante, mostrar el nombre del alumno
en el certificado, quedó pendiente de decisión del cliente, sin
implementar). La mayoría de lo nuevo (repaso rápido en los resúmenes de
unidad, hotspots informativos en "seguridad"/"temperatura"/"envasado"/
"inocuidad", pop-up de predicción antes del video, pista del minijuego)
es contenido específico de este curso y quedó en `seguridad-alimentaria/`.
Tres piezas eran genéricas de verdad y subieron al kit:

**1 · `.modal-card--art` seguía viéndose grande, incluso después del
primer ajuste.** La fórmula de §6.45 (`min(46vw, 420px, calc(70vh *
ratio))`) fue la primera pasada; el cliente pidió achicarla más. Se
escaló cada término x0.7: `min(32vw, 294px, calc(49vh * ratio))`.
Verificado en los 3 pop-ups representativos (situaciones del minijuego,
peligros, reglas): 18% del ancho de pantalla en los 3, texto legible
sin recortes. **Lección de proceso**: "achicalo" sin un número no
significa "un poco" — confirmar la magnitud (acá, otro 30%) antes de
ajustar a ojo, y volver a medir con Playwright después, no solo mirar.

**2 · Buscador del glosario — 100% genérico, nunca supo qué términos
tiene el curso.** `initGlossarySearch()` (nuevo, `js/coto-ui.js`)
filtra cualquier `dl.d-glossary` dentro del pop-up de glosario por
texto, ignorando mayúsculas y acentos (`quimico` encuentra `químico`,
vía `normalize('NFD')`). Si una sección entera queda sin resultados
oculta también su encabezado — nunca deja un `<h4>` colgado sin nada
debajo — y muestra un mensaje "sin resultados" opcional
(`data-gloss-empty`). Markup y estilos del campo de búsqueda en
`css/coto-base-addendum-v1.8.css`.

Bug real encontrado de paso, en la misma sección del CSS: el borde
divisor entre entradas (`.d-glossary > dt:not(:first-child)`) dependía
de la POSICIÓN en el DOM, no de visibilidad — con el buscador activo,
la primera entrada realmente visible podía no ser la primera del DOM y
quedaba con un borde superior de más (o la que debía tenerlo, no lo
tenía). Corregido a `.d-glossary dt:not([hidden]) ~ dt:not([hidden])`,
correcto con o sin filtro activo.

**3 · Lo que NO subió, a propósito.** El pop-up de predicción antes del
video "proceso" reutiliza `data-intro-popup`/`data-intro-once`
(mecanismo ya genérico desde antes, `motor-slides.js`) pero con
markup/estilo de texto plano igual al de "logros" — no la excepción de
diseño de §6.10.2.2 de OTRO curso ("¿Te la jugás?", con arte propio del
diseñador detrás). §6.36 punto 3 ya había documentado el costo real de
invocar esa excepción sin respaldo de diseño (acento ámbar sin pedido
del cliente, revertido); este curso no lo repite. La pista del
minijuego (`programarPista()`, `curso.js`) reusa `.d-mj-opt.is-hint` —
animación que YA vivía en `css/coto-minijuego.css` desde "Uso de
Sucursales 3 - NOA" sin que ningún curso la disparara todavía; sigue
sin subir nada nuevo, solo la primera vez que se usa.

---

## 6.47 Segunda vuelta de feedback sobre "Seguridad alimentaria" — un bug real de kit (`staggerReveal()` con hijos `hidden`) y el resto quedó en el curso (kit-base v1.9.23)

Feedback visual puntual sobre lo entregado en §6.46: el pop-up seguía
chico, faltaba contraste en un header, y 3 pedidos de diseño más
(tilde en vez de punto, reubicar un hint, rediseñar el repaso rápido).
Casi todo quedó en `seguridad-alimentaria/` por ser específico del
curso — una sola pieza era un bug real de kit.

**1 · `.modal-card--art` necesitaba bastante más tamaño, no un ajuste
fino.** El cliente pidió "60%" tras ver el resultado de §6.46 (18% del
viewport). Probado literal (`min(60vw, 960px, calc(96vh * ratio))`):
56.6% de un viewport 1600×900 — el pop-up tapaba las tarjetas de los
costados y el aviso de puntos, texto enorme. Se convalidó un punto
medio con Playwright antes de aplicarlo, no directamente el número
pedido: `min(48vw, 500px, calc(80vh * ratio))` ≈ 31% del viewport,
visiblemente más grande que antes sin romper el layout. **Mismo
patrón que §6.46 punto 1**: un número del cliente sin ver el resultado
renderizado es una intención, no una medida — verificar con captura
antes de aplicar, y si el literal rompe algo, decirlo y proponer un
punto medio con evidencia, no aplicar a ciegas ni tampoco ignorarlo.

**2 · Bug real de kit: `staggerReveal()` dejaba contenido invisible
para siempre.** El pop-up de predicción de este curso (texto plano,
§6.46 punto 3) suma un botón "Continuar" y usa el `<p>` de feedback ya
existente — ambos nacen `hidden`, recién aparecen cuando el alumno
responde. `staggerReveal()` (`js/coto-ui.js`) le pone `.d-stagger-in` a
TODOS los hijos directos de `.modal-hd`/`.modal-bd` al abrir el
pop-up, sin mirar si están `hidden`. Con `display:none` en ese
momento la animación (`opacity:0 → 1`) nunca arranca, y sacar el
`hidden` más tarde no la reinicia sola — queda pegada en el fotograma
`from` (`opacity:0`) para siempre, confirmado en Chromium con
`getComputedStyle`. `coto-quiz.js` esquivaba el problema sin querer
(llama a `stagger()` sobre `.d-q`, que no incluye el feedback/mascota
como hijos directos), pero cualquier pop-up de texto plano con
contenido que se revela después de una interacción lo iba a pisar
tarde o temprano. **Fix**: `staggerReveal()` ahora filtra `el.hidden`
antes de asignar la clase — animar la entrada de algo invisible
tampoco tenía sentido, así que el fix es a la vez la corrección y la
simplificación correcta (nada que un curso tenga que acordarse de
anular a mano).

**3 · Lo que quedó en el curso, y por qué.**
- **Tilde en vez de punto** en las tarjetas de peligro/limpieza
  (`.d-shot-hit--peligro.is-done`): antes un punto verde liso, ahora el
  mismo ícono de tilde que `.d-riesgo-check`/`.d-u2-tick`. Puramente
  visual y específico de esas 5 tarjetas — no hay nada genérico que
  extraer.
- **Reposición del hint de "temperatura"**: el `data-l/t/w/h` del panel
  de hint/cartel vivía abajo a la derecha, lejos de las filas clicables
  y pegado a un globo de texto FIJO del arte (parecía el disparador).
  Se subió y alineó con las filas. Son coordenadas contra el arte de
  ESTE curso — no hay pieza de kit involucrada.
- **Rediseño del repaso rápido**: tarjeta con borde/sombra propios,
  numeración en círculo, botones V/F con ✓/✕, feedback con emoji de
  cierre. Vive enteramente en `seguridad-alimentaria/css/assets.css`
  (el widget completo, `.d-repaso*`, ya era course-only desde §6.46 —
  ver la nota ahí sobre por qué no se reutilizó `coto-quiz.js`).
- **Contraste del header del pop-up de predicción**: `[data-cat=
  "control-de-calidad"]` fija `--on-cat` oscuro (navy) A PROPÓSITO
  para ese degradado claro (`css/coto-base.css`, tabla de colores por
  categoría) — pero el pop-up de predicción es el ÚNICO del curso que
  usa `.modal-hd` liso sin pasar por `.d-wide`/`.d-drawer-r` (que ya
  fuerzan blanco por pedido de cliente, §6.41): sin
  ningún otro pop-up hermano que mantener consistente, el fix fue un
  `color:#fff` scoped a `[data-popup="prediccion-proceso"] .modal-hd`
  en el curso, no un cambio al default de la categoría en el kit (que
  sigue siendo válido para el próximo curso que sí use `--on-cat` como
  está pensado).

---

## 6.48 Tercera vuelta sobre "Seguridad alimentaria": video de fondo con auto-avance, 3 bugs reales de interacción, la pantalla de salida, y un bug de mobile real heredado de NOA (kit-base v1.9.24)

Ronda con cuatro focos distintos — arranca con una regla de proceso
nueva del cliente, sigue con una batería de bugs reales encontrados
probando (no reportados a ciegas), suma una pieza del kit que estaba a
medio terminar, y cierra con una auditoría de mobile pedida
explícitamente a partir de un bug ya resuelto en otro curso.

**1 · Portada y separadores de unidad: regla fija nueva.** El cliente
avisó que, en TODO curso nuevo, portada y separadores de unidad van a
ser un video que arranca solo al entrar y avanza a la próxima diapo al
terminar — sube los `.mp4` finales directo al zip, sin pedir cambios de
código. El patrón (`initBgVideos` + `.d-shot-slide--bg-video` +
`data-autoadvance`) ya existía en el kit desde "Prevención
cardiovascular", pero "Seguridad alimentaria" había arrancado esas 4
diapos como imagen estática (§6.45 no lo tocó). Convertidas con
placeholders de 0 bytes (§3.9). 100% curso — no hay nada de kit acá,
solo un recordatorio: **la próxima auditoría de arranque (§7.1) debería
chequear esto de entrada**, no esperar a que el cliente lo pida nuevo
en cada curso.

**2 · Bug real: `staggerReveal()` no era el único lugar que asumía
orden del DOM = orden de narración.** `Narrador.textOf()` (kit,
`narrador.js`) narra en orden de aparición en el DOM — pero un panel de
hint/cartel de hotspot (`.d-info-panel`) tiene que vivir DENTRO de
`.d-shot` para que `_initShots()` lo posicione, y `.d-shot` cierra
SIEMPRE antes del `.sr-only` con el texto real de la diapo (que vive
afuera, por accesibilidad). Resultado real, reportado en "inocuidad":
la indicación ("Tocá el ícono para...") se narraba ANTES que el
contenido, no después como corresponde (título → info → indicación).
Mismo patrón en los otros 6 `.d-info-panel` del curso (seguridad/
temperatura/envasado/3 resúmenes). Fix: nuevo `[data-narrate-last]` —
un contenedor marcado así se empuja al final de la narración sin
importar dónde vive en el DOM, preservando el orden relativo dentro de
cada grupo. Genérico, cero curso-specific.

**3 · Bug real: video inline con controles nativos + layout de
diapositiva a medida = pantalla completa rota.** El video de "proceso"
(`initInlineCircleVideos`, variante (b) con controles nativos, §6.46)
vive dentro de una diapositiva posicionada en píxeles por
`_initShots()`, recalculados solo en `slidechange`/resize. Entrar y
salir de pantalla completa NATIVA del navegador no dispara ninguno de
esos dos eventos — el cliente lo reportó "roto" (mal posicionado) al
pausar en pantalla completa y volver, y el audio seguía sonando después
de cerrar. Sin fix de browser real posible (mezclar fullscreen nativo
con un layout de diapositivas a medida es una fuente conocida de este
bug en cualquier navegador): se saca el botón con
`controlslist="nofullscreen"` en el curso. Documentado en
`coto-media.js` para que el próximo curso con esta variante lo sepa de
entrada — si necesita fullscreen real, usar el patrón 2 (pop-up,
`initVideoPlayer`) en su lugar, que sí vive fuera del lienzo.

**4 · Bug real: `initHotspots()` no dejaba leer el cartel con mouse
real.** `mouseleave` del contenedor limpiaba CUALQUIER interacción
(hover, foco o clic) apenas el mouse salía — en desktop era imposible
sacar el mouse del ícono para leer el cartel sin que se cerrara solo
(pedido real del cliente: "que al hacer clic el cartel pueda quedar
fijo"). Ahora el clic fija la zona (`pinned`); mientras haya una fija,
`mouseleave` no limpia — vuelve a mostrar esa zona. Se destraba
clickeando la misma zona, otra, o afuera. De paso se pudo SACAR el
viejo truco de `pointerdown`/`activaAlTocar` que evitaba que el toggle
de toque se confundiera con el `mouseenter` sintético que los
navegadores emulan sobre touch (§1.8 original) — con `pinned` movido
solo por clic, ese truco ya no hacía falta. Aplica a los 4 hotspots del
curso sin tocar nada course-specific.

**5 · Pieza de kit que estaba a medio terminar: `#d-salida`.** El
CSS completo de la pantalla de salida (`.d-salida`/`.d-salida-card`/
`.d-salida-ic`/`.d-salida-eval`, addendum §14) y el JS que la busca por
id (`salirDelCurso()`, `coto-cierre.js`) ya estaban en el kit desde
v1.8 — pero el HTML nunca se agregó a "Seguridad alimentaria", así que
"Salir del curso" no mostraba nada más que el intento de
`window.close()`. Apareció recién cuando el cliente pasó una captura
del mismo mensaje rediseñado en "Uso de Sucursales 3 - NOA" pidiendo
aplicarlo acá también — es decir, la pieza YA vivía en el kit, lo que
faltaba era el markup del curso. Se sumó un detalle de diseño real al
CSS del kit: borde izquierdo en `.d-salida-eval` en vez de un recuadro
parejo, para que lea como nota al margen y no como alerta de error.
**Lección de proceso**: si una pieza del kit tiene CSS pero cero
cursos usándola, un checklist de arranque no la va a encontrar sola —
agregar `#d-salida` (con el contenido real del curso) al §7 de abajo
para que el próximo curso no dependa de que el cliente vea el gap en
otro lado primero.

**6 · Bug real de kit, heredado sin saberlo de "Uso de Sucursales 3 -
NOA": el panel "jugar" del minijuego no pasaba a 1 columna en mobile
real.** Pedido explícito del cliente de auditar esto con la MISMA
metodología que ya le había costado una vuelta entera en NOA (no
redimensionar la ventana de escritorio — viewport mobile real con
`isMobile`/`hasTouch`). El comentario de la "escalera responsive" de
`coto-minijuego.css` (§6.42 punto 2) decía que angostar las columnas
`fr` alcanzaba — probado en 375/414px real, `.d-mj-body` seguía siendo
grid de 2 columnas fijas, comprimidas a ~135-155px: imagen minúscula,
píldoras del banco de opciones a ~50px, texto en 3-4 líneas, ilegible.
Mismo bug, mismo archivo compartido, nunca antes probado en un
viewport real para ESTE curso. Fix: `display:grid` → `flex-direction:
column` en el breakpoint ≤600px, con las 2 trampas que el cliente ya
había mapeado en NOA (y que se evitaron gracias a eso):
- `.d-mj-escena-col` ya traía `min-height:0` (para el grid) — en
  columna, sumado al `flex-shrink:1` por default de cualquier hijo
  flex, colapsaba la imagen a 0px en vez de solo achicarla.
  `flex-shrink:0` lo fija a su alto real.
- `.d-mj-escena` traía `max-height:100%` pensado para una fila de grid
  con alto ya resuelto — sin base fiable en columna (`aspect-ratio` ya
  dimensiona la imagen sola, no hace falta).
- `.d-mj-play` suma `overflow-y:auto` (mismo patrón que
  `.d-cierre-summary`, `coto-cierre.css`) porque `.d-stage` recorta con
  `overflow:hidden` más arriba en la cadena — sin esto, lo que no entra
  en un viewport bajo queda CORTADO, no solo apretado.
Verificado con Playwright en viewport mobile real (375/414px): imagen
completa, tarjetas legibles, opciones a ancho completo, scroll llega a
todo, clic funcional (feedback + puntos correctos). Re-verificado en
768/834 (tablet, sigue en grid) y 1280 (desktop) sin cambios.
**Lección de proceso, la misma que §6.34 y varias más ya dejaron
anotada de otras formas**: "probé el responsive" sin especificar CÓMO
se probó no alcanza como verificación — redimensionar la ventana de
escritorio no es lo mismo que un viewport mobile real (faltan
`isMobile`/`hasTouch`, y algunos navegadores/CSS se comportan distinto).
Sumado a §7.3 (checklist de consistencia de diseño) como punto
explícito: probar cualquier breakpoint ≤600px con Playwright en
viewport mobile real (`isMobile:true`, `hasTouch:true`), no solo la
ventana de escritorio angosta.

---

## 6.49 Cuarta vuelta sobre "Seguridad alimentaria": el video se pausaba solo (o no se pausaba), el botón de play quedaba ovalado, y una trampa de especificidad que hay que dejar advertida en el kit (kit-base v1.9.25)

Feedback puntual sobre el video de "proceso" (patrón 3, variante con
carátula real — §6.29/§6.45): al tocar pausa en los controles nativos
el video volvía a mostrar la carátula pero el audio seguía sonando
("no corta"), y el botón de play quedaba ovalado en vez de circular al
entrar a pantalla completa. Los dos, bugs reales de KIT — no del
marcado de este curso.

**1 · Pausa que no pausaba — carrera entre el clic del control nativo y
el propio handler.** `initInlineCircleVideos` dejaba un
`video.addEventListener('click', …)` que decidía play/pausa mirando
`video.paused` en CUALQUIER clic sobre el `<video>`, sin distinguir un
clic sobre el CUERPO del video de uno sobre la barra de controles
nativos que ese mismo `play` ya le había puesto (variante con
carátula). El clic sobre el botón de pausa nativo llega al `<video>`
**antes** de que el navegador aplique la pausa — así que el handler
propio leía `video.paused === false` (todavía, el estado viejo),
concluía "está reproduciendo, así que pauso", llamaba `video.pause()`
a mano… y un instante después el control nativo terminaba de procesar
SU pausa, dejando los dos en pugna. El síntoma real observado
(carátula de vuelta + audio sonando) es la firma clásica de un
`play()`/`pause()` en carrera: `.is-playing` se sacaba (mostrando la
carátula) mientras el `<video>` de fondo seguía sonando porque el
segundo `pause()` interno de los controles nunca llegó a aplicarse
limpio.

Fix real, no un parche de timing: el toggle por clic **deja de
decidir nada una vez que hay controles nativos puestos** (`if
(video.hasAttribute('controls')) return;`) — con controles nativos, el
play/pausa es trabajo DE ELLOS, punto. El estado visual
(`.is-playing`) pasa a escuchar los eventos reales `play`/`pause` del
propio `<video>` en vez de que un clic los infiera — así da igual
quién disparó el cambio (el botón del kit, un clic sobre el video
antes del primer play, o los controles nativos después). Un matiz
más: en pausa, la variante CON carátula ya no vuelve a mostrarla —
se queda mostrando el cuadro congelado + los controles, como
cualquier reproductor real (volver a la carátula ahí ERA el bug); la
variante circular SIN carátula sí vuelve al arte de base al pausar,
porque no tiene controles con los que retomar — su único affordance
es el botón de play propio.

**Regla general que deja esto**: un listener de `click` genérico sobre
un `<video>` que en algún momento de su ciclo de vida puede tener
`controls` nativo puesto es una fuente de carrera garantizada — los
controles nativos YA manejan sus propios clics internamente, y
duplicar esa decisión "por si acaso" es lo que rompe. La pregunta
correcta no es "¿qué hago en este clic?" sino "¿quién es dueño del
play/pausa en este momento?" — y una vez que hay `controls`, la
respuesta es siempre "el navegador".

**2 · Botón de play ovalado en pantalla completa.** `.d-shot-hit-play`
se dimensionaba con `width:44%; height:44%` (dos ejes en % del
wrapper) más `max-width:64px; max-height:64px` (un tope por eje). Un
wrapper CUADRADO no delata el problema (los dos ejes dan el mismo
número), pero uno rectangular sí — y el wrapper es una caja de video
(nunca cuadrada). En cuanto un tope entra a jugar en un eje y en el
otro no (típico al cambiar de tamaño de ventana, y sobre todo al pasar
a pantalla completa, donde el lienzo cambia de proporción de golpe),
ancho y alto dejan de coincidir → botón ovalado. Fix: un solo eje
manda (`width: 44%`) y `aspect-ratio: 1` deriva el otro — redondo
siempre, en cualquier caja, sin importar cuántos topes se crucen.
Mismo patrón de bug (2 ejes independientes + tope por eje) que ya
había costado 2 vueltas distintas en "Uso de Sucursales 3 - NOA"
(§6.42 punto 5, la tarjeta "Puntos" derramándose) — vale la pena
recordar: **cualquier elemento que tenga que ser un círculo real se
dimensiona con UN eje + `aspect-ratio:1`, nunca con `width`/`height`
independientes**, así sea 99% de las veces "obviamente" redondo en las
pruebas de escritorio.

**3 · Trampa de especificidad al pisar `object-fit` de la variante con
carátula, dejada documentada en el propio `coto-media.js`.** Bug
course-specific (no de kit), pero la CAUSA es genérica y se va a
repetir: este curso quiso `cover` en vez del `contain` por defecto
para la caja de video del proceso (la tarjeta del diseñador es
1.716:1, los videos del cliente se exportan a 2:1 — con `contain`
sobraba franja arriba/abajo dentro de la tarjeta). El primer intento
agregó `.d-shot-hit--videobox .d-shot-hit-video { object-fit: cover;
}` — 2 selectores de clase. La regla del kit que había que pisar,
`[data-inline-video].is-poster .d-shot-hit-video`, tiene 3. Un
selector con MENOS especificidad nunca gana, sin importar en qué
archivo esté ni en qué orden se cargue: el `<video>` se quedó en
`contain` mientras la carátula (que sí tenía menos competencia, un
solo selector del lado del kit) pasó a `cover` sin problema — dos
`object-fit` distintos conviviendo, uno para el reposo y otro para la
reproducción. El síntoma reportado por el cliente fue justamente
"el video tiene unos recortes arriba y abajo cuando empieza a
reproducir" — que en realidad era el encuadre CAMBIANDO de golpe al
arrancar, no un recorte real de contenido. Fix del curso: repetir el
prefijo completo del kit en el selector propio
(`[data-inline-video].is-poster.d-shot-hit--videobox …`), no solo
sumar una clase más. Documentado ahora como advertencia directamente
en el doc-comment de `initInlineCircleVideos` (kit,
`js/coto-media.js`) para que el próximo curso que quiera pisar este
`object-fit` lo vea ANTES de repetir el mismo bug.

---

## 6.50 Minijuego: las píldoras se estiraban al achicar la ventana, y "Producto alterado" pasa de trampa a hallazgo real con pista diferenciada (kit-base v1.9.26)

Dos pedidos/reportes del cliente sobre "Seguridad alimentaria" en la
misma vuelta, los dos con cambios de kit.

**1 · Bug real de layout: "las cajitas de respuesta del minijuego se
agrandan cuando el curso está achicado".** Medido con Playwright en 12
anchos de ventana (620px a 1920px), comparando la altura de una
píldora CORTA ("Contaminación cruzada") contra una LARGA ("Productos
de limpieza cerca de los alimentos") en la misma fila del grid: la
corta pasaba de 46px a 86px de alto según el ancho — sin que su propio
texto necesitara más de 1 línea. Causa: `.d-mj-grid` tenía
`align-items:stretch` — el default de CSS Grid para el eje de bloque.
En cuanto la ventana se angosta lo suficiente para que la etiqueta
larga pase a 2 líneas, la fila ENTERA (todas sus celdas) se estira
para igualar a la más alta, inflando también a las vecinas cortas.
Fix: `align-items:start` en `.d-mj-grid` — cada píldora mide su propio
contenido; el alto TOTAL de la grilla no cambia (las filas siguen
reservando el espacio de la celda más alta, así que el layout general
es idéntico), solo deja de inflarse el botón individual. Las líneas
conectoras (`.d-mj-line--h`/`--v`) no se ven afectadas: ya fijan su
propia alineación con `align-self`/`justify-self` explícito,
independiente del `align-items` del contenedor — vale como regla
general: cualquier ítem de grid que necesite una alineación distinta a
la del resto debería fijar la suya propia en vez de depender de que el
`align-items` del padre nunca cambie.

**2 · "Producto alterado" tenía un problema real, no de percepción.**
El cliente señaló que una de las dos piezas de carne del arte SÍ se ve
de un color distinto a la otra (más oscura) — y el feedback del juego
decía "no cambiaron de color", contradiciendo lo que se ve. Confirmado
con recorte + comparación de píxeles (no a ojo). Dos caminos posibles:
recolorear el arte para que ambas piezas queden parejas (mockup
armado, comparado antes/después), o promover la opción de "trampa" a
"hallazgo real". El cliente eligió la segunda — preferencia explícita
de no tocar el dibujo del diseñador. Esto es contenido, no kit (queda
en `curso.js`/`README-CURSO.md` del curso: `MJ_TOTAL` 5→6, `MJ_APROBAR`
3→4, umbrales de medalla recalculados sobre el nuevo puntaje máximo),
pero deja una lección general: **antes de "arreglar" un arte que no
calza con el copy, preguntar si el copy es el que está mal** — en este
caso, technically ninguna de las dos correcciones era "más correcta"
en abstracto, la decisión fue del cliente.

**3 · Pista diferenciada — reversión explícita de una decisión de
diseño anterior.** La pista tras 20s de inactividad (y la remediación
al reintentar) resaltaban 3 opciones — 1 correcta + 2 incorrectas —
SIN decir cuál era cuál, a propósito (§6.39: "nunca delata CUÁL de las
3 es la correcta, solo reduce el ruido"). El cliente pidió ahora
explícitamente que SÍ se distinga. Importante: esto no es un bug
corregido, es un cambio de producto que REVIERTE una decisión anterior
— documentarlo así evita que alguien mire el commit viejo y "corrija"
el nuevo pensando que es un descuido. Kit (`css/coto-minijuego.css`):
`.is-hint-ok` (la correcta) suma una insignia con ícono 💡 + pulso
celeste; `.is-hint-bad` (las incorrectas del trío) se queda con el
pulso ámbar de siempre, sin ícono — dos estados que no dependen solo
del color, para no fallar en daltonismo. El curso decide CUÁLES 3
resaltar (`programarPista()`/`aplicarRemediacion()` en `curso.js`,
con un helper `marcarHint(id, ok)` que centraliza qué clase poner);
el kit solo decide cómo se ve cada estado.

---

## 6.51 La barra de progreso "olvidaba" sesiones anteriores, y la barra de "pasos" de Rotación pasa a ser arrastrable — el bug más largo de encontrar de todo el curso (kit-base v1.9.27)

**1 · Bug real, encontrado a partir de un reporte confuso del
cliente**: "estaba intentando adelantar la barra de abajo y no me
deja, pero yo ya había visto las diapos siguientes". La barra de
progreso SÍ soporta arrastrar hacia adelante hasta lo ya visitado
(`initProgressSeek`, §6.10/kit v1.7) — pero el TOPE se calcula con
`motor.maxVisited`, una propiedad que **cada curso** inicializa en su
propio `boot()` (no es del kit: nació en `curso.js`, ver el comentario
ya existente ahí sobre el bug original de `NaN`). El código lo
inicializaba con `motor.maxVisited = motor.index` — que es 0 al
arrancar, salvo que el alumno acepte el banner "Retomá donde dejaste"
(opt-in, nunca salta solo, §6.10). El problema: `restaurar()` YA había
repoblado `estado.vistas` con el progreso de sesiones ANTERIORES un
par de líneas antes — el mismo dato que sí restaura bien puntos y
logros — pero `motor.maxVisited` nunca lo consultaba. Resultado: quien
reabre el curso sin tocar el banner de "retomar" se encuentra con la
barra de arrastre creyendo que el techo real es 0, aunque haya
recorrido media unidad en una sesión previa. Fix (en `curso.js`, no
hay código de kit que tocar — pero la LECCIÓN sí es genérica, ver
abajo): recorrer `Object.keys(estado.vistas)` contra
`data-slide-index` de cada diapositiva para calcular el máximo real,
ANTES de fijar `motor.maxVisited`. Verificado con Playwright simulando
una recarga completa de página (avanzar, `page.reload()`, comprobar
que el arrastre hacia adelante llega hasta lo ya visitado).

   **Regla para el checklist de arranque (§7) de cualquier curso
   futuro que use `initProgressSeek` + `visitedIndexes`**: si el curso
   persiste progreso entre sesiones (todos lo hacen, vía
   `suspend_data`), `motor.maxVisited` — o el mecanismo equivalente
   que el curso use para alimentar `visitedIndexes()` — tiene que
   calcularse a partir del estado YA RESTAURADO al arrancar, nunca
   solo desde `motor.index` en frío. Es exactamente el mismo tipo de
   bug, en espíritu, que ya cuesta caro en este molde: un dato que se
   restaura bien en un lugar (puntos, logros) y se olvida restaurar en
   otro (el techo de arrastre) porque viven en variables separadas que
   nadie sincronizó explícitamente.

**2 · Barra de "pasos" arrastrable — pedido explícito, generalizado en
el kit.** La diapositiva "Rotación y control de vencimientos" tiene 4
botones `.d-shot-hit--paso` ("Paso 1 de 4"... "Paso 4 de 4") dibujados
sobre una barra horizontal del arte — hasta ahora solo clic discreto
por tramo. El cliente pidió que se pudiera ARRASTRAR, como un slider
real. Generalizado en `initShotSwap()` (kit, `js/coto-media.js`),
acotado a propósito a `.d-shot-hit--paso` — **no** a cualquier
`[data-shot-swap-go]`: ese mismo atributo también arma pestañas de
categoría (`.d-shot-hit--tab`, "Personas/Medio ambiente/Plagas/...",
usado en "¿Cómo se contaminan?"), donde arrastrar entre opciones no
tiene sentido semántico — no son una progresión lineal, son categorías
sin orden. Solo `.d-shot-hit--paso` (un progreso real: paso 1→2→3→4)
suma la posibilidad de deslizar.

   **El bug real, y por qué costó 2 rondas encontrarlo**: el arrastre
   se cortaba solo a mitad de camino, de forma INTERMITENTE — a veces
   al primer intento, a veces recién al segundo, lo que hizo pensar
   por un rato que el problema era de timing/coalescing de eventos
   sintéticos de Playwright. La causa real, confirmada instrumentando
   `pointercancel`/`gotpointercapture`/`lostpointercapture` con logs
   dentro del propio handler: el botón del paso ACTIVO tiene
   `pointer-events:none` (CSS ya existente, para no competir
   visualmente con el resaltado) — así que el `pointerdown` que arranca
   ahí en realidad hace *hit-test* sobre el `<img>` de fondo, no sobre
   el botón. Y una imagen es ARRASTRABLE por el navegador por default
   (se puede arrastrar para guardarla/copiarla). En cuanto el mouse se
   mueve lo suficiente, el navegador reconoce el gesto como "el usuario
   quiere arrastrar esta imagen" y dispara SU PROPIO drag-and-drop
   nativo — lo que cancela la secuencia de eventos de puntero en curso
   (`pointercancel`), cortando el `pointermove` en seco a mitad de
   camino. `e.preventDefault()` en el `pointerdown` se lo impide.
   **Por qué la barra de progreso del curso (`initProgressSeek`, kit
   v1.7) nunca tuvo este bug**: su pista es un `<div>` plano, no una
   imagen — los `<div>` no son arrastrables por default, así que nunca
   compitió con el drag nativo del navegador. **Regla nueva para
   cualquier interacción de arrastre futura que viva ENCIMA de un
   `<img>`** (no solo swap de pasos — cualquier hitbox arrastrable
   sobre una captura): llamar `e.preventDefault()` en el `pointerdown`
   SIEMPRE, no solo cuando "se nota" el bug en pruebas rápidas — la
   intermitencia es la firma de este tipo de carrera con el navegador,
   no una señal de que "a veces no pasa nada".

   **Regresión propia, encontrada y corregida antes de subir esto**:
   la primera versión escuchaba `pointerdown` en cada BOTÓN de paso
   individual (no en el `[data-shot]` contenedor) y llamaba a
   `setPointerCapture` sobre un elemento DISTINTO (el contenedor) —
   mezcla que además de no arreglar el bug de arriba, dejaba al botón
   del paso activo (`pointer-events:none`) sin ningún listener que
   pudiera dispararse ahí, imposibilitando arrancar el arrastre parado
   en el paso actual. Fix: todo — `pointerdown`/`pointermove`/
   `pointerup` Y la captura — vive en el MISMO elemento (`shot`), y el
   punto de partida se decide por POSICIÓN (¿la coordenada cae dentro
   del rectángulo que ocupan los botones de paso?), no por cuál
   elemento resultó ser el target real del evento — mismo patrón que
   ya usa `initProgressSeek`, ahora con la razón explícita de por qué
   importa copiarlo exacto.

   **Segunda regresión propia, distinta**: al mover el `pointerdown` al
   contenedor y disparar `go()` inmediatamente al presionar (para que
   un simple clic sin arrastre también funcione), el listener de
   `click` YA EXISTENTE (delegado, para el resto de los patrones de
   swap) seguía disparando `go()` una segunda vez para el mismo botón
   — inofensivo para el índice final, pero duplicaba `onChange`
   (narración/puntaje dos veces). Peor: al excluir sin más
   `.d-shot-hit--paso` del handler de `click`, los pasos dejaron de
   responder a activación por TECLADO (Enter/Espacio sobre el botón
   con foco disparan un `click` sintético, sin ningún `pointerdown`
   previo — un lector de pantalla o un alumno sin mouse se hubiera
   quedado sin poder cambiar de paso). Fix: distinguir el origen del
   `click` con `e.detail` — un clic real de mouse siempre trae
   `detail >= 1` (cuenta de clics), uno sintetizado por activación de
   teclado trae `detail === 0`. El handler de `click` solo se salta
   para `.d-shot-hit--paso` cuando `e.detail !== 0` (ya resuelto por el
   arrastre); con `detail === 0` deja pasar el `go()` de siempre.
   **Regla general**: cualquier vez que se reemplace un mecanismo de
   `click` por uno de `pointerdown`/drag, verificar EXPLÍCITAMENTE que
   la activación por teclado (que nunca genera eventos de puntero)
   siga funcionando — es fácil de pasar por alto porque "anda bien" en
   cualquier prueba manual con mouse.

   Verificado con Playwright: 8 corridas seguidas de 3 arrastres
   consecutivos cada una (incluido arrancar parado en el paso activo),
   sin un solo fallo; Enter/Espacio con foco de teclado siguen
   cambiando de paso; un clic simple de mouse no narra/premia dos
   veces; los tabs de "¿Cómo se contaminan?" y las flechas+puntos de
   malas/buenas prácticas quedan sin cambios de comportamiento.

---

## 6.52 Glosario interactivo: clic en un término navega a la diapositiva, y el glosario se desbloquea con el progreso real del curso (kit-base v1.9.28)

Pedido explícito del cliente sobre "Seguridad alimentaria": que cada
término del glosario, al tocarlo, lleve a la diapositiva donde se
explica; que el glosario se vaya desbloqueando a medida que el alumno
llega a esas diapositivas; y que avise cuando desbloquea un concepto.
Confirmado con el cliente antes de escribir código (dos decisiones de
diseño reales, por `AskUserQuestion`): término bloqueado = nombre
visible + candado, definición oculta (no "nombre + definición
tachada"); la búsqueda del glosario excluye los términos bloqueados.

**Diseño clave: cero estado nuevo que mantener sincronizado.** La
tentación era un `estado.glosario = {}` propio, marcado a mano por
término. Pero el curso YA sabe "qué diapositivas se visitaron"
(`estado.vistas`, restaurado entre sesiones desde antes — CLAUDE.md
§6.51) — un término está desbloqueado si y solo si ya se visitó SU
diapositiva. Cero mapa nuevo, cero riesgo de que un dato se desincronice
del otro (la misma familia de bug que costó caro en §6.25/§6.51: dos
lugares guardando el mismo hecho, y uno de los dos quedando viejo).

**Diseño clave 2: "clic navega" no necesitó JS nuevo.** El atributo
`data-goto="<slide-id>"` ya es el mecanismo del kit para el índice/
sidenav — `Motor._init()` lo cablea solo (cierra cualquier pop-up
abierto vía `go()` y navega). Poner ese mismo atributo en el `<dt>`
del término (dentro de un `<button>`, para que sea foco/teclado real)
es TODO lo que hace falta — cero JS de navegación propio.

**Lo que SÍ subió al kit — genérico de verdad, no sabe qué términos
tiene ningún curso:**
- `initGlossaryUnlock(opts)` (`js/coto-ui.js`) — recorre
  `dl.d-glossary dt[data-goto]`, pregunta `opts.seen(id)` (que el curso
  responde con `!!estado.vistas[id]`) y pone/saca `.is-locked` en el
  `<dt>`. Devuelve una función `refresh()` que el curso llama de nuevo
  en cada `slidechange` — la primera pasada (arranque, progreso ya
  restaurado) es SILENCIOSA a propósito (`refresh(true)`): aplicar un
  estado que ya existía no es una notificación nueva. Las pasadas
  siguientes sí acumulan qué términos pasaron de bloqueado a
  desbloqueado y se los pasan a `opts.onUnlock(labels)`, para que el
  curso dispare un toast (`Player.toast('🔓 Desbloqueaste ...')`) —
  mismo patrón ya usado para logros/puntos, nada nuevo del lado del
  toast.
- CSS pareja en `coto-base-addendum-v1.8.css`, sección 21 (GLOSARIO):
  `.d-gloss-term-btn` (el término, sin skin de botón, subrayado al
  hover/foco), `.d-gloss-lock-ic` (candado, oculto salvo
  `dt.is-locked`), y `dt.is-locked + dd .d-gloss-def{display:none}` /
  `.d-gloss-hint{display:inline}` — el `<dd>` de cada término trae
  SIEMPRE los dos `<span>` (definición real + hint de desbloqueo), el
  CSS decide cuál se ve según la clase del `<dt>` hermano. Ningún JS
  reescribe contenido en caliente — evita el riesgo de "guardé la
  definición en un `data-*` y me olvidé de un caso" que ya costó caro
  en otros componentes del kit.
- `initGlossarySearch()` (mismo archivo, ya existente desde v1.9.22) se
  extiende una línea: con texto de búsqueda, un `<dt class="is-locked">`
  nunca entra en los resultados (su definición real sigue en el DOM,
  pero oculta por CSS, no por el filtro — no debería poder
  "encontrarse" buscando antes de desbloquearse). Sin texto de
  búsqueda, se sigue mostrando igual que siempre (con su candado): esa
  es la vista normal del glosario, no un resultado de búsqueda.

**Lo que quedó en el curso, a propósito**: el mapeo término→diapositiva
(qué `data-goto` le corresponde a cada uno de los 26 `<dt>`) es
contenido — depende de qué explica cada diapositiva de ESTE curso. Se
armó leyendo el HTML real de cada diapositiva/pop-up (no adivinado),
agrupando términos que se explican en la MISMA diapositiva (ej. los 3
"Peligro biológico/físico/químico" → la diapositiva "Contaminación",
donde viven los 3 pop-ups que los explican) — visitar esa diapositiva
una vez desbloquea los 3 de un saque, y el toast lo dice ("Desbloqueaste
3 términos") en vez de listarlos uno por uno.

Verificado con Playwright (`seguridad-alimentaria/tools/tests/
check-glosario-flow.mjs`, nuevo test de contenido — no es genérico,
queda en el curso): los 26 términos arrancan bloqueados; buscar el
texto de un término bloqueado no lo encuentra; clic en un término
navega a su diapositiva y cierra el glosario; visitar esa diapositiva
lo desbloquea Y dispara el toast; reabrir el glosario ya lo muestra sin
candado, con su definición real, y ahora sí aparece en la búsqueda.

---

## 6.53 Auditoría del sistema de puntos a pedido del cliente: un `award()` sin guard persistido en una actividad reintentable es puntaje infinito (curso, no kit)

Pedido directo del cliente sobre "Seguridad alimentaria": revisar que
el sistema de puntos y los 3 umbrales de medalla (bronce/plata/oro)
"funcionen bien y tengan lógica correcta". Auditoría completa de TODAS
las fuentes de puntos del curso (`award()` en cada una) contra su
mecanismo de guard:

| Fuente | Guard antes de `award()` |
|---|---|
| 3 peligros + 2 fichas de limpieza (`estado.peligros`) | ✓ `if (estado.peligros[id]) return;` |
| 4 carruseles/pestañas (`estado.swaps`) | ✓ `if (!estado.swaps[id][i]) {...}` |
| Alteración (`estado.alteracion`) | ✓ flag booleano revisado antes |
| Video del proceso (`estado.video`) | ✓ vía `seen`/`markSeen` de `initInlineCircleVideos` |
| Repaso rápido (`estado.repaso`) | ✓ `if (acerto && !estado.repaso[id])` |
| Bonus "encontró las 6" del minijuego (`estado.juegoPerfecto`) | ✓ `if (gano && !estado.juegoPerfecto)` |
| **Hallazgo individual del minijuego** (30 pts c/u) | **✗ ninguno — bug real** |

**El bug real**: `responder()` llamaba `award(PUNTOS.hallazgo, ...)`
directo, sin mirar nada persistido — solo `mj.hallados` (el mapa del
INTENTO actual, que `empezar()` resetea entero en cada partida nueva).
El curso permite reintentar el minijuego sin límite ("podés
reintentarlo las veces que quieras", texto real de "Ayuda") — así que
cada reintento volvía a sumar 30 puntos por CADA hallazgo, aunque ya se
hubiera encontrado y premiado en un intento anterior. Con 2-3
reintentos alcanzaba para superar el umbral de oro sin haber recorrido
el resto del curso, rompiendo por completo el techo de puntaje
(`PUNTOS_MAX`) y el sentido de los 3 umbrales.

**Por qué no se había visto antes**: es el ÚNICO punto de premio de
todo el curso que vive dentro de una actividad diseñada para
reintentarse. Las 6 fuentes restantes son todas "se hace una vez y
queda hecho" (abrir un pop-up, ver un video, acertar una pregunta) —
ahí `estado.<algo>[id]` alcanza sola como guard porque nunca hay un
segundo intento del mismo ítem. El minijuego es la excepción: el mismo
hallazgo puede "sucederle" al alumno más de una vez en la vida del
curso, y necesita su PROPIO flag persistido, distinto del estado
efímero del intento en curso.

**Fix** (curso, no kit — `estado.juegoAciertos`, mismo patrón que
`estado.peligros`): un mapa persistido de "hallazgos ya premiados
alguna vez", separado de `mj.hallados` (que sigue reseteándose cada
intento, porque SÍ necesita reiniciarse para la lógica de juego —
`disabled`, clases `.is-ok`, cuándo termina la partida). `responder()`
solo llama `award()` si el hallazgo no está en `estado.juegoAciertos`
todavía. Verificado con un test nuevo que juega, pierde a propósito,
reintentra y confirma que re-encontrar los mismos hallazgos no suma
puntos — solo un hallazgo genuinamente nuevo sigue sumando.

**Regla nueva para el checklist de cualquier curso futuro (§7)**:
**toda actividad que el curso deja REINTENTAR (no solo "hacer una
vez") necesita que su premio por ítem individual se guarde en un flag
persistido, independiente del estado efímero del intento actual** — no
alcanza con revisar "¿tiene guard?", hay que revisar específicamente
"¿ese guard sobrevive a un reintento, o vive en una variable que se
resetea junto con la partida?". Cualquier minijuego/práctica/quiz que
permita repetir intentos en cursos futuros debe auditarse con esta
pregunta antes de dar el sistema de puntos por terminado.

**De paso, confirmado correcto (no hacía falta tocar nada)**: con el
fix aplicado, el piso garantizado de quien completa el gate coincide
EXACTO con el umbral de bronce (mismo diseño de §6.10.6: nadie que
termine el curso siguiendo el gate se queda sin medalla), los 3
umbrales quedan espaciados en incrementos parejos dentro del rango de
puntos "extra" que da el contenido opcional, y `medallaDe()`/
`pintarMedalla()` (kit, `coto-cierre.js`) ya tienen el fix de §6.45 (no
dan medalla de consuelo por debajo del piso, ordenan una copia del
array antes de decidir). Único detalle cosmético, no un bug: el
subtítulo dice "el máximo posible del curso" también cuando se alcanza
el umbral de la medalla más alta sin llegar al puntaje máximo literal
— la palabra "máximo" ahí se refiere a "no hay nivel siguiente", no a
"puntaje perfecto". No se tocó (es de kit, afecta a todos los cursos,
y es una imprecisión de redacción menor, no un error de cálculo) —
queda anotado por si vale la pena aclarar la frase en una vuelta futura.

---

## 6.54 Auditoría de locuciones a pedido del cliente: un video de fondo compitiendo con la voz, y la prioridad de voz pasa a ser latina/argentina antes que la de EE.UU. (kit-base v1.9.30)

Pedido explícito del cliente: "revisemos cómo funcionan las locuciones
en este curso y en los cursos en general". Se auditó `narrador.js`
completo contra las reglas ya documentadas (§5, §6.5, §6.7,
§6.10.1) y contra el cableado real de `curso.js` — el minijuego, el
repaso rápido y los hotspots ya cumplían la regla de "narrar solo lo
nuevo, nunca repetir la consigna fija" (§6.5). Dos hallazgos reales.

**1 · Bug real: las 4 diapositivas de video de fondo tenían un `<p>`
narrable, y nada las excluía.** Portada + los 3 separadores de unidad
(`.d-shot-slide--bg-video`) traen un `<p>` real dentro de su
`.sr-only` ("Arranca la Unidad 1..."). `speakSlide()` lo lee igual que
cualquier párrafo — así que al entrar arrancaban DOS audios a la vez:
la locución leyendo esa frase y el video reproduciéndose con su propio
sonido (normalmente sin bloqueo de autoplay, porque el gesto de
"Siguiente" que llevó hasta ahí ya cuenta como interacción del
usuario para el navegador). Es exactamente lo que CLAUDE.md §5 prohíbe
("una diapositiva que ES un video no se narra... narrar encima sería
contraproducente") — pero esa regla vivía solo como convención de
contenido (no poner un `<p>` narrable ahí), nunca aplicada por código.
Los otros 4 patrones de video del kit (`initVideoPlayer`,
`initPopupVideos`, `initLayerVideos`, `initInlineCircleVideos`) sí
cortan la locución antes de reproducir (`Narrador.cancel()`) —
`initBgVideos` era el único que no, porque nunca se pensó que fuera a
convivir con un párrafo narrable.

Fix a la raíz, en `textOf()` (`js/narrador.js`), no en cada curso: una
diapositiva `.d-shot-slide--bg-video` devuelve `''` al nivel de "toda
la diapositiva" (la llamada de `speakSlide`) — su `.sr-only` sigue
íntegro para un lector de pantalla real, que no pasa por `textOf()`.
Un pop-up abierto DESDE una diapo de video sigue narrando normal (el
`container` ahí es el pop-up, no la `<section>`). Además,
`initBgVideos()` (`js/coto-media.js`) suma `Narrador.cancel()` antes de
reproducir, como cinturón extra — mismo criterio que los otros 4
patrones. Verificado con Playwright
(`seguridad-alimentaria/tools/tests/check-narracion-video.mjs`, nuevo
test de contenido): `textOf()` da `''` en las 4 diapos de video y texto
real en una diapo normal; un spy sobre `speechSynthesis.speak()`
confirma que nunca se llama al entrar a un separador de unidad. Se
verificó también que el test detecta el bug real revirtiendo el fix a
propósito antes de confirmar el resultado final.

**2 · Pedido de producto: la voz preferida pasa a ser
argentina/latinoamericana, con la de Estados Unidos como respaldo, no
como default.** Hasta ahora `pickVoice()` (fuera de tablet) probaba
primero "Google español de Estados Unidos" (es-US, la que el cliente
había elegido probando voces en una vuelta anterior, §6.7) y recién
si no estaba cae en la cadena por región (es-AR → es-419 → es-UY →
es-CL → es-MX → cualquier es-*). El cliente pidió invertir esa
prioridad: preferir una voz argentina o latinoamericana, y usar la de
EE.UU. solo si el dispositivo no tiene ninguna de esas.

Se investigó qué tan realista es prometer una voz "es-AR" específica
por navegador antes de tocar código — conclusión: **no conviene
hardcodear nombres de voz por navegador/SO**, porque el catálogo
depende del paquete de idioma instalado en CADA dispositivo, no del
navegador — un nombre que hoy existe en una versión de Windows/Android
puede no estar en otra. Lo estable es buscar por **código de idioma**
(`es-AR`, `es-419`...), que es exactamente el mecanismo que la cadena
de respaldo YA usaba — el cambio real es de ORDEN, no de mecanismo
nuevo.

Fix: la cadena de tiers pasa de `[es-AR, es-419, es-UY, es-CL, es-MX,
es-*]` (corriendo DESPUÉS de es-US) a `[es-AR, es-419, es-US, es-UY,
es-CL, es-MX, es-*]` — es-US se corre adentro de la MISMA cadena, ya no
tiene un chequeo aparte antes de ella. Dentro del nivel es-US puntual
se sigue prefiriendo la marca "Google" (el matiz de §6.7) por sobre
cualquier otra es-US genérica. El caso tablet (Paulina es-MX / Mónica
es-ES, probado a mano en un iPad real) queda intacto — ya cumplía
"latina" con Paulina, y es una preferencia ya validada con el
cliente, no algo a tocar sin pedido explícito. Verificado con
Playwright inyectando catálogos de voces falsos vía
`speechSynthesis.getVoices()`: con es-AR disponible gana es-AR; sin
es-AR/es-419 cae en la Google es-US de siempre (nunca en silencio, ni
en una voz peor que antes); en tablet con Paulina disponible sigue
ganando Paulina sin cambios.

**3 · Pedido de seguimiento, mismo día: el título horneado en el arte
SÍ debe narrarse — opt-in por curso, no cambio de default (kit-base
v1.9.31).** El cliente confirmó que el título de cada diapositiva
(la píldora del arte, ej. "Alteración", "Temperatura alimentaria") es
el MISMO texto que el `<h2 data-slide-title>` de accesibilidad — y que
en ESTE curso lo quiere escuchado antes del cuerpo, algo que
`textOf()` excluye por default desde una decisión de OTRO cliente
("Surtido sin venta", CLAUDE.md §5: "sonaba redundante"). En vez de
pisar ese default para todos los cursos, se sumó un opt-in nuevo:
`Narrador.setNarrateTitles(bool)` (default `false`, sin cambiar nada
para ningún curso existente) — `textOf()` deja de excluir
`[data-slide-title]` cuando está prendido. Este curso lo activa en
`curso.js`, una línea, al lado de `addFixes()`. El orden queda
correcto sin código extra: el `<h2>` ya es el primer hijo de la
`<section>` en el marcado, así que sale primero en `textOf()` por
orden de DOM, igual que cualquier diapositiva normal. No afecta al
glosario (sigue acotado a `[data-narrate-only]`, nunca la lista
completa) ni a las diapositivas de video de fondo (el fix del punto 1
de esta misma sección corta ANTES de llegar a este filtro). Verificado
con Playwright (`check-narracion-titulos.mjs`): el texto narrado de
una diapositiva normal ahora empieza con su título exacto; una diapo
de video sigue en silencio; el glosario sigue narrando solo la frase
de entrada.

**4 · Pedido de seguimiento: la grilla de tips de "Ayuda" quedaba
muda — bug real de KIT, no de este curso (kit-base v1.9.32).** Se
auditó qué narra y qué no cada pop-up del curso comparando la salida
real de `textOf()` contra lo que se ve en pantalla. Dos hallazgos:

- **"Cómo recorrer el curso" no narra nada** (todo su texto vive en
  `h3`/`div`/`b`/`span`, ninguno de los tags que `textOf()` lee).
  Consultado con el cliente — decisión explícita: se deja mudo, es
  contenido visual/skimmable, no hace falta narrarlo.
- **"Ayuda" narraba 6 de 9 piezas de contenido reales**: sí leía el
  párrafo de navegación y las 5 notas, pero se saltaba por completo la
  grilla de 3 tips (Tarjetas y flechas / Video / Mini juego). Causa:
  `.d-instr-item` (`coto-base-addendum-v1.8.css` — el patrón GENÉRICO
  del kit para esta grilla, no algo propio de este curso) guarda su
  texto en `span > small`, y ninguno de los dos estaba en `TEXT_SEL`.
  Como es un componente del boilerplate, el gap existe en CUALQUIER
  curso que use el panel de "Ayuda" tal cual viene, no solo acá.

  Fix: `.d-instr-item` sumado a `TEXT_SEL`. Con el mismo cuidado del
  bug 3 original de `textOf()` (`.d-q-num` pegado al enunciado): el
  título y la nota de cada tip van sin espacio en el DOM (los separa
  el CSS), así que sin más se narraba el título y la nota pegados como
  una sola palabra — mismo patrón de fix, clonar el nodo y anteponer
  un punto y espacio a cada nota antes de leer el texto, nunca tocar el
  DOM real. Verificado con Playwright (`check-narracion-ayuda.mjs`):
  los 3 tips narran separados correctamente, "Cómo recorrer el curso"
  sigue mudo.

**5 · Pedido explícito: auditoría completa de "lee correctamente y en
orden", con eso como regla permanente (no una revisión puntual)
(kit-base v1.9.33).** El cliente pidió verificar que TODAS las
diapositivas se narren bien y en orden, con un ejemplo concreto: "las
preguntas ¿las lee como preguntas?". Auditando el repaso rápido
(`resumen1/2/3`) con la misma técnica (leer la salida REAL de
`textOf()`, no asumir por el marcado) apareció un bug real, más grave
que los anteriores porque **revela contenido antes de tiempo**:

- **Las 2 preguntas de repaso se narraban SEGUIDAS al entrar a la
  diapositiva**, aunque el widget solo muestra una por vez. Causa:
  `.d-repaso-item{display:none}` (`assets.css`, curso) esconde las
  preguntas que no son la actual con una clase CSS — pero
  `Narrador.textOf()` solo sabe filtrar por el atributo `hidden` real
  (`!n.closest('[hidden]')`), nunca miró `display:none` de una clase.
  Un alumno escuchando (sin mirar la pantalla) se enteraba de la
  pregunta 2 antes de haber contestado la 1. Fix, en el curso (esto es
  un widget propio, `initRepasoRapido`, no del kit): `mostrar(i)` ahora
  ADEMÁS pone `hidden` real en cada `.d-repaso-item` que no es la
  actual — la ocultación visual y la de narración pasan a ser la MISMA
  garantía, no dos mecanismos separados que hay que mantener
  sincronizados a mano.
- **Las preguntas se narraban como afirmación lisa, sin avisar que hay
  que elegir Verdadero o Falso** — esa parte solo se veía (los
  botones), nunca se escuchaba. El cliente confirmó que sí quiere el
  aviso por voz. Fix genérico de kit, no un parche puntual: nuevo
  atributo `[data-narrate-prefix="..."]` en `textOf()` — cualquier nodo
  narrado puede pedir un prefijo hablado sin tocar su texto visible
  (mismo espíritu que `speechify()`: nunca se toca el `alt`/texto
  accesible, solo lo que se dice de más). El curso lo usa en las 6
  `<p class="d-repaso-q">` (`data-narrate-prefix="Verdadero o
  falso"`) — cualquier curso futuro con el mismo patrón de pregunta
  V/F hereda el mecanismo gratis, solo pone el atributo.

**La "regla permanente" que pidió el cliente**, no una revisión
puntual: `tools/tests/check-narracion-completa.mjs` (nuevo, test de
CONTENIDO — el método es genérico pero las aserciones puntuales son de
este curso). Recorre las 26 diapositivas, para cada una compara la
salida real de `Narrador.textOf()` contra 3 reglas: (1) las 4 de video
de fondo narran `''`, el resto no narra vacío; (2) con
`setNarrateTitles` prendido, el texto tiene que EMPEZAR con el título
exacto de la diapositiva — así "narra en orden" queda verificable, no
solo "narra algo"; (3) un heurístico genérico (minúscula pegada
directo a mayúscula, sin espacio ni punto) detecta cualquier texto
"corrido" — la misma firma que ya dieron 3 bugs reales distintos
(`.d-q-num`, los tips de "Ayuda", y este). Más una aserción específica
del repaso rápido: exactamente una pregunta con el prefijo "Verdadero
o falso:" por diapositiva de resumen, nunca cero ni dos. Verificado
revirtiendo cada fix a propósito antes de confirmar el resultado
final — el test lo detecta.

**Patrón para el próximo curso** (vale la pena copiarlo, no reinventar
la auditoría cada vez): si un curso tiene widgets propios con estado
"solo uno visible a la vez" (repaso, pasos, tabs armados a mano en
HTML real en vez de por swap de imagen), verificar explícitamente que
la ocultación use el atributo `hidden` real y no solo una clase CSS —
es exactamente el mismo tipo de bug, en espíritu, que el `[hidden]`
que ya usa el resto del kit en todos lados (paneles de capas, pop-ups,
gates) para la MISMA garantía doble (visual + narración).

**6 · El pedido "que sea clara, ordenada, con sentido" encontró el bug
más frecuente de toda la auditoría: el título dicho DOS VECES seguidas
en 6 de las 26 diapositivas (kit-base v1.9.34).** No alcanzaba con
chequear estructura (título presente, en orden, sin palabras pegadas)
— hubo que efectivamente LEER las 26 salidas de `textOf()` de punta a
punta para encontrarlo. Causa: varios párrafos de este curso ya
abrían anunciando el tema en palabras ("Introducción. En COTO
trabajamos...", "Objetivos de aprendizaje. A: Identificar...") — se
escribieron así en una época en que ningún título se narraba (§6.54
puntos 1-3 son de ESTA misma vuelta, el título recién se prendió acá
mismo), así que el propio texto hacía ese trabajo. Prender
`setNarrateTitles` no le avisó a esos párrafos que ya no hacía falta,
y quedó sonando "Introducción. Introducción. En COTO trabajamos...".
Otros 20 de los 26 no tenían este problema (sus párrafos ya arrancaban
directo con contenido real, sin restatear el tema) — el bug no es
sistemático del molde, depende de cómo se redactó cada `.sr-only`.

Fix genérico en `textOf()` (`js/narrador.js`), no un parche por
diapositiva: si el primer fragmento narrado es el título Y el
fragmento siguiente ARRANCA repitiendo ese mismo texto como su propia
primera oración, se recorta esa apertura duplicada — nunca el título
en sí, nunca el texto visible (CLAUDE.md §5), solo lo que se dice de
más. La comparación es tolerante a la puntuación de apertura/cierre
(¡¿.!?) para que funcione igual con un título que termina en "!" o "?"
que con uno que termina en nada. Diapositivas sin esta redundancia
quedan intactas — la comparación simplemente no encuentra coincidencia
y no recorta nada (verificado con un diff completo de las 26 salidas
antes/después del fix: SOLO las 6 afectadas cambiaron, byte por byte
iguales en las otras 20 y en los 12 pop-ups auditados).

`check-narracion-completa.mjs` suma esta 4ª regla (además de las 3 de
§6.54 punto 5): el texto que sigue al título, después de sacarle el
punto/espacio, nunca puede volver a empezar con el título mismo.
Verificado revirtiendo el fix a propósito: el test detecta las 6
diapositivas afectadas, una por una.

---

## 6.55 Controles de audio "cool": barra de volumen + línea de tiempo de locución, con popovers que se posicionan dinámicamente en vez de anclar por breakpoint (kit-base v1.9.35)

Pedido explícito del cliente sobre "Seguridad alimentaria" a partir de
una captura de los botones "Sonido"/"Locución" del header: al de
Sonido, sumarle una barra para subir/bajar el volumen; al de Locución,
una línea de tiempo pequeña que muestre por qué frase va la narración,
permita arrastrar para saltar, y repetirla — "algo muy cool", con las
opciones desplegándose al pasar el mouse sobre cada botón. Antes de
tocar código se armó un mockup HTML aislado (mismos tokens/CSS reales
del kit) y se mostró con capturas de Playwright — aprobado explícito
("sisi me re gusta") antes de escribir el HTML/CSS/JS real del curso,
siguiendo el proceso fijado en §6.40. Al terminar, el cliente pidió
también verificar mobile ("fijate de que no se rompa nada, y ajustarlo
para mobile como siempre") — eso encontró el bug real de kit que se
documenta abajo.

**1 · Volumen (`#d-sound`).** `initSoundToggle()` (kit,
`coto-player.js`) suma un slider 0-100% + botón de mute propio +
ecualizador decorativo de 10 barras, con un `localStorage` nuevo
(`coto-diapos-volume`, string float 0-1) al lado del `coto-diapos-mute`
ya existente. `efectivoMudo()` (`muted || volume <= 0`) es la única
verdad para el ícono/estado — `muted` y `volume` se persisten por
separado, pero mover el slider por encima de 0 estando muteado
desmutea solo (comportamiento esperado de cualquier control de volumen
real). El volumen se aplica en 3 lugares que antes solo miraban
`muted()`:
- **Video** (`coto-media.js`): `v.volume = volumeLevel()` junto a
  `v.muted` en los 4 puntos de reproducción de los 3 patrones (fondo,
  pop-up, círculo inline).
- **Tonos de UI** (`coto-ui.js`/`fx.js`): `volumeLevel()` (mismo
  helper, duplicado en los 3 archivos — criterio ya fijado en el kit
  de que cada archivo es copy-paste autocontenido, no un módulo
  compartido) escala el gain de `tone()`/`uiTone()`; con `vl<=0` se
  corta antes de crear el oscilador.

**2 · Locución (`#d-narrate`).** Requirió reestructurar `narrador.js`:
el `speak()`/`siguiente()` de siempre (closure inline, sin estado
recuperable desde afuera) pasa a un estado de módulo `estadoActual`
(`{trozos, v, rate, kind, index, terminado}` — los fragmentos de
`chunkText`, la voz/velocidad elegidas, y en qué fragmento va) y un
driver único `hablarDesde(i)`, que emite un evento
`narracionprogreso` en `document` en cada arranque/fin de fragmento.
Nuevo en `Narrador`: `seek(i)` (salta y arranca desde ahí, solo si hay
narración activa), `repeat()` (= `seek(0)`, funciona también DESPUÉS
de que la narración terminó — `cancel()` marca `terminado:true` pero
nunca borra `estadoActual`, justamente para que "Repetir" lo siga
usando) y `progreso()` (`{index, total, terminado}` o `null`). La
línea de tiempo del panel (`initNarrateTimeline()`, `coto-player.js`)
es un `<input type=range>` que refleja `progreso()` en vivo.

**Deliberadamente a nivel de FRASE/fragmento, no de palabra** — se le
comunicó al cliente antes de implementar y lo aceptó: Web Speech API
no da progreso intra-utterance confiable, sobre todo con las voces de
red (Google/Microsoft online) que el kit ya prioriza (§6.7/§6.54) —
prometer una línea de tiempo palabra-por-palabra hubiera sido una
promesa que la API no puede cumplir de forma estable entre
dispositivos/navegadores.

**3 · Bug real de kit encontrado en la verificación de mobile: anclar
el popover por breakpoint fijo asume mal dónde va a estar el botón.**
El primer intento fijaba el panel centrado en desktop y anclado al
borde DERECHO en `@media(max-width:480px)` — asumiendo que el grupo de
botones de audio se mantiene cerca del borde derecho de la pantalla en
cualquier ancho. Falso: el layout de 2 filas YA EXISTENTE del header
(§6.6, `≤799px`) mueve `.d-top-group--audio` a
`grid-row:2;justify-self:start` — el costado IZQUIERDO. Con el botón
ya cerca del borde izquierdo, un panel anclado a la derecha se salía
del viewport por completo (medido con Playwright en 390px de ancho:
`left:-150px` en el panel de volumen, `left:-108px` en el de
locución — el equivalente táctil del "grid blowout" que ya costó una
vuelta entera en §6.15, mismo tipo de error: asumir una posición fija
del chrome sin medirla contra el layout real en ese ancho).

Fix real, sin depender de ningún breakpoint: `initAudioPopovers()`
(kit, `coto-player.js`) mide la posición REAL del botón
(`getBoundingClientRect()`) en cada apertura —
`click`/`mouseenter`/`focusin`, más `resize` mientras el panel esté
`.is-open` (el caso táctil/rotación, el más propenso a necesitar
recalcular) — y fija un `left` inline clampeado a
`[8px, viewport - ancho del panel - 8px]`, con una variable CSS
(`--flecha-left`) para que la flechita del panel (`.d-audio-pop::before`)
siga apuntando al centro real del botón aunque el panel se haya
corrido para entrar en pantalla. El CSS (`left:50%;
transform:translateX(-50%)`) queda como fallback SOLO para el caso sin
JS — nunca vuelve a asumir en qué breakpoint o lado de la pantalla va
a estar el botón, así que sigue funcionando aunque el layout del
header cambie de nuevo en el futuro (otro breakpoint, otro orden de
grupos) sin que este componente necesite tocarse.

**Lección general, en la misma línea que §6.15/§7.3 punto 11**: cualquier
elemento de UI cuya posición en pantalla puede cambiar entre
breakpoints (por un layout de grid/flex que ya reordena cosas, como
este header) no debería recibir un segundo elemento (un popover, un
tooltip) anclado con una posición fija asumida para "el otro"
breakpoint — hay que medir la posición real en el momento de mostrarlo,
o el popover hereda el mismo bug de "se ve bien en desktop, se rompe en
mobile" que ya costó dos vueltas distintas en este kit por razones
parecidas.

**4 · Pitfall de testing en este sandbox, documentado para reusar.**
El Chromium de Playwright acá no tiene backend de audio real —
`speechSynthesis` resuelve los fragmentos casi instantáneo, así que un
test que espera con `waitForTimeout()` y saca una foto del estado
nunca alcanza a ver "a mitad de la narración" (siempre ve el estado
final). Patrón que sí funciona, para cualquier test de narración
futuro: registrar el listener de `narracionprogreso` ANTES de llamar
`speak()`, juntar la secuencia COMPLETA de eventos en un array
resuelto por `Promise` (con un `setTimeout` de red de seguridad), y
afirmar sobre la secuencia/orden entera en vez de una foto en un
instante — el mismo problema, en espíritu, que ya documentó §6.34 para
bugs visuales que un test estructural no puede ver: acá el problema es
de TIMING, no de estructura, y la solución es capturar la secuencia
completa en vez de adivinar cuándo mirar.

**Tests nuevos, curso** (no genéricos — quedan en
`seguridad-alimentaria/tools/tests/`, no en el kit):
`check-controles-audio.mjs` (slider, mute, secuencia completa de
`narracionprogreso`, `seek`/`repeat`, estado inicial deshabilitado) y
`check-controles-audio-mobile.mjs` (viewport táctil real 390×844,
`isMobile:true`/`hasTouch:true`: tap abre/cambia/cierra el panel
correcto, el panel nunca se sale del viewport, el slider sigue siendo
arrastrable con drag táctil nativo).

---

## 6.56 Revisión general a pedido del cliente sobre "Seguridad alimentaria" — recorrido visual completo, 0 bugs reales encontrados, y 1 limitación de diseño preexistente que queda documentada (no corregida sin pedido)

Pedido abierto ("pegale una buena revisada a todo"), sin síntoma
puntual — mismo criterio de §6.34: un pedido de "revisión general" se
responde con un barrido visual completo con capturas, no solo con la
suite automatizada (los 7 tests genéricos + los 8 propios ya venían en
verde antes de empezar). Se recorrieron con Playwright las 26
diapositivas completas, sus pop-ups internos, los 4 pop-ups genéricos
del header (índice, glosario, ayuda, logros), las dos rutas completas
del minijuego (aprobado y a reintentar, incluida la pantalla de repaso
de partida y el reset real al tocar "Reintentar"), el resumen final +
"Mis logros" + la pantalla de salida, y un pase en viewport móvil real
(390×844, header/minijuego/glosario/índice).

**Resultado: cero bugs reales.** Cada cosa que a primera vista parecía
un hallazgo se investigó hasta la causa y resultó ser diseño intencional
ya documentado, o un artefacto del propio script de revisión — vale la
pena dejar registrado el descarte, porque cada uno es el mismo tipo de
señal que en rondas anteriores SÍ resultó ser un bug real, y conviene
que quien audite después sepa que ya se revisó y por qué se descartó:

1. **El video placeholder de "El proceso de limpieza y desinfección" se
   ve con un póster con textura repetida y una barra de controles
   dibujada.** Es el placeholder genérico (el `.mp4` real todavía no lo
   subió el cliente, mismo patrón de §3.9) — no es el arte final ni un
   glitch. Confirmado extrayendo el `.webp` del póster directo (sin
   pasar por el navegador): la textura y la barra "de mentira" ya están
   horneadas en el archivo.
2. **El panel "Puntos" del minijuego arranca en 1000, no en 0.** Es
   `MJ_BASE = 1000`, documentado en el propio código
   ("puntaje interno inicial, lo dibuja el PDF") — el minijuego usa un
   presupuesto que sube con cada acierto (+800) y baja con cada error
   (−150), no un contador que arranca en cero. Partida perfecta:
   1000 + 6×800 = 5800, exacto al número que mostró la corrida real.
3. **El pop-up de "Reglas del mini juego" tiene 2 íconos "¡" y formas
   decorativas en las 4 esquinas que a simple vista parecen un glitch
   de posicionamiento.** Es el arte del diseñador tal cual
   (`img/pop-reglas-minijuego.webp`, patrón `.modal-card--art` de
   §6.45) — confirmado extrayendo el PNG con su alfa real: las formas
   están dibujadas ahí, no las agrega ningún CSS.
4. **"Peligro biológico/físico/químico" aparecen en el glosario en una
   sección aparte ("Los 3 peligros, de un vistazo") separada de la
   lista alfabética completa.** Es contenido curado a propósito
   (`h4.d-glossary-sub` distinto), no una duplicación — verificado que
   NO vuelven a aparecer en "Términos, de la A a la Z" (grep sobre el
   bloque completo del glosario, un solo `<dt>` por término en todo el
   archivo).
5. **Un párrafo del pop-up "Ayuda" se veía notablemente más transparente
   que los de arriba en una captura.** Es la animación `.d-stagger-in`
   de siempre (§6.11) atrapada a mitad de camino porque la captura se
   tomó a los 400ms de abrir el pop-up — con `animation-delay` de hasta
   0.49s + 0.38s de duración, el último párrafo no termina de entrar
   hasta los ~870ms. Confirmado re-midiendo `opacity` a los 3s: los 5
   párrafos en `1`. Error del script de revisión (esperó poco), no del
   curso — pero deja la lección para cualquier captura futura de un
   pop-up recién abierto: esperar al menos ~1s si tiene contenido con
   `.d-stagger-in`, no solo el tiempo de apertura del modal.

**Lo único real que apareció, y por qué NO se tocó sin consultar:**
en un viewport de **teléfono en vertical** (390×844, portrait), el
lienzo de la diapositiva (`.d-shot`, fijo a la proporción 2:1 del
diseño — §2.6/§2.7) queda como una franja horizontal angosta centrada
verticalmente, con una franja vacía enorme arriba y abajo — el
contenido se ve, pero ocupa una fracción chica de la pantalla. **No es
una regresión de esta ronda ni de ninguna anterior**: es la
consecuencia esperada y ya documentada del lienzo fijo 2:1 en
proporciones lejos de esa relación (§6.9 — "por debajo de esa
proporción [protegida por el margen de diseño] el lienzo vuelve al
modo fijo con letterbox"), aplicada a un caso más extremo que los que
el kit prueba hoy. **La suite del kit nunca probó este caso**:
`scroll-audit.mjs` llega hasta "768×1024 (iPad chico vertical)" como
el viewport angosto más extremo — un teléfono en vertical (~375-430px
de ancho) nunca estuvo en la lista, y todo el diseño de este molde
(§0, "proporción panorámica fija") asume uso desktop/tablet, coherente
con que el cliente (colaboradores de sucursal accediendo desde una
notebook/tablet de trabajo) probablemente nunca lo vea así. Se decidió
**dejarlo documentado en vez de "corregirlo" unilateralmente**: la
corrección real (¿pedirle al alumno que rote el teléfono? ¿ampliar el
rango de proporciones que llenan pantalla completa más allá de lo que
el margen de seguridad del PDF permite recortar sin seguridad, §6.9?)
es una decisión de producto, no un bug de código — igual que cada vez
que este documento distingue explícitamente entre "hallazgo real" y
"decisión que hay que consultar" (§6.17, §6.44 punto 5, etc.).

**Regla nueva para el checklist de revisión (complementa §7.3 punto
11):** cuando se prueba un curso en viewport móvil real, probar
también el caso PORTRAIT angosto de teléfono (no solo el táctil
genérico de 390×844 que ya usan los tests de controles de audio) contra
el LIENZO PRINCIPAL de las diapositivas, no solo contra popovers/pop-ups
sueltos — un componente flotante (popover, drawer) puede pasar
perfecto en ese viewport mientras el lienzo 2:1 de fondo se reduce a
una franja — son dos preguntas distintas y hay que probarlas por
separado.

---

## 6.57 "Ayuda" deja de mezclar instructivo con configuración: dos botones flotantes, con valor agregado real (kit-base v1.9.36)

Pedido explícito del cliente sobre "Seguridad alimentaria": el botón
"Ayuda" del header en realidad mezclaba dos cosas distintas —
instructivo (navegación, atajos, avisos) y configuración real
(selector de voz + velocidad, escondidos adentro del mismo pop-up
desde que existen). Pidió separarlos en dos botones (Ayuda /
Configuración), bajarlos del header a **flotantes discretos, apilados
abajo a la derecha**, con estilo "pop-up" en vez de drawer — y, en una
segunda vuelta, que cada uno sume **valor real**, no solo el contenido
reubicado. Aprobado con mockup (dos rondas: una versión inicial simple,
descartada por pedido explícito de "más pro, más interactivo"; la
versión final con acordeón + reabrir intro + escuchar ejemplo +
restablecer, sí aprobada) antes de tocar código, siguiendo el proceso
fijo de §6.40.

**1 · Mecanismo**: `[data-fab-stack]` con dos `[data-fab-ctl]`
(`"config"` y `"ayuda"`), cableado por `initFabPopovers()`
(`coto-player.js`) — mismo criterio "pinned" que `initAudioPopovers`
(hover/foco en desktop, clic fijo en táctil, CLAUDE.md §6.10.1 regla
2). A diferencia de `initAudioPopovers`, **no necesita posicionamiento
dinámico por JS**: el anclaje es siempre abajo a la derecha (nunca se
mueve entre breakpoints como el grupo de audio, §6.55), así que un
`max-width` en CSS alcanza para no salirse en mobile. `position:fixed`
contra el viewport, mismo criterio que `.d-award-toast`/`.d-resume`
(ya en `coto-player-chrome.css`) — nunca dentro de `.d-stage`, que
recorta con `overflow:hidden`.

**2 · Contenido movido, sin reescribir**: el instructivo (nav +
`.d-instr-grid` de 3 tips) y el selector de voz/velocidad
(`d-voice-field`/`d-rate-field`, IDs intactos — los sigue leyendo
`initVoicePicker`/`initRatePicker` sin cambios) pasaron tal cual del
viejo drawer `[data-popup="ayuda"]` (que se borró) a sus popovers
nuevos. Los 5 avisos sueltos (`.d-instr-note`) se reorganizaron como
**acordeón de preguntas frecuentes** (`[data-fab-acc]`, una pregunta
abierta a la vez) — mismo contenido, formato más interactivo.

**3 · Valor agregado real, no solo reubicación** (2ª vuelta, pedido
explícito tras rechazar una primera propuesta más floja — "dame
mejores opciones"):
- **"Volver a ver la introducción"** (`.d-fab-replay`,
  `data-popup-trigger="instrucciones"`): el pop-up "Cómo recorrer el
  curso" se ve UNA sola vez (`data-gate-popup` en la diapositiva de
  índice, §6.12/§6.36) — si el alumno lo cerró sin querer, antes no
  había forma de recuperarlo. El motor ya sabe abrir cualquier
  `[data-popup]` vía `data-popup-trigger`, así que no hizo falta JS de
  navegación nuevo — `initFabPopovers()` solo cierra el propio
  flotante de Ayuda al tocarlo, para que no quede "pinned" abierto
  detrás del modal.
- **"Escuchar un ejemplo"** (`#d-voice-listen`, dentro de
  `initVoicePicker`): reproduce la MISMA frase de prueba que ya sonaba
  sola al cambiar de voz en el `<select>` — pero a demanda, sin tener
  que tocar el selector. Cubre el caso real de querer re-escuchar la
  voz YA elegida (por ejemplo, la primera vez que se abre el panel,
  antes de cambiar nada).
- **"Restablecer a los valores recomendados"** (`#d-config-reset`,
  `initConfigReset()`): en vez de duplicar la lógica de
  `setManualVoice`/`setRateFactor`, le baja el valor "automático"/`1`
  al `<select>`/`<input range>` y dispara sus propios eventos
  `change`/`input` — reusa exactamente los mismos listeners que ya
  existían, así que el label, la persistencia y el aviso hablado
  quedan iguales que si el alumno lo hubiera tocado a mano. Cero
  camino de código paralelo para el mismo resultado.

**4 · Efectos visuales, con guardas**: aro de color alrededor del
botón que pulsa 2 veces al cargar el curso y se apaga solo (o al
primer clic en cualquiera de los dos botones) — nunca en loop, sería
ruido permanente en vez de un llamado de atención puntual. Hover con
`translateY`+`scale`, el engranaje de Configuración gira al pasar el
mouse, el popover entra con un leve rebote (`cubic-bezier` con
overshoot, mismo lenguaje que el resto del kit — medallas, logros).
Todo corre bajo la regla global de `prefers-reduced-motion` de
`coto-base.css` (`*{animation:none!important}`) — en reposo, sin la
animación, el aro es `opacity:0` (invisible), así que sin movimiento
se ve exactamente igual que "todavía no pulsó", nunca roto.

**5 · Bug real de kit encontrado de paso, sin relación con este
pedido**: `seguridad-alimentaria/index.html` tenía **dos
`<div class="d-app">` anidados sin su segundo cierre** — un
`<div class="d-app">` duplicado justo antes del real, ambos abiertos,
con un solo `</div>` de cierre más abajo (el HTML quedaba mal
balanceado). No se notaba visualmente porque `.d-app` es
`position:fixed` — el div interno (con la MISMA regla `position:fixed`
aplicada a sí mismo) se sale del flujo del grid del externo y listo,
ningún test de los 6 genéricos lo detecta porque ninguno valida
balance de tags, solo comportamiento. Encontrado al tocar exactamente
esa zona del archivo para este cambio. Corregido en el curso — no es
un bug de kit (el `header-boilerplate.html` nunca tuvo la
duplicación), fue un accidente de una edición anterior de este curso
puntual.

**Tests nuevos, curso**: `check-fab-ayuda-config.mjs` (selector de voz
con catálogo falso inyectado vía `addInitScript` — Web Speech API no
tiene voces reales en este sandbox; espía `Narrador.speak` en vez de
ejercitar el motor real, ver nota en el propio test sobre por qué;
persistencia de voz/velocidad; reset; acordeón "una pregunta a la
vez"; "volver a ver la introducción" abre el modal Y cierra el
flotante) y `check-fab-mobile.mjs` (viewport táctil real 390×844: no
se superpone con el footer, el popover nunca se sale del viewport).
`check-narracion-ayuda.mjs` (ya existente, §6.54 punto 4) se actualizó
para apuntar al nuevo selector (`[data-fab-ctl="ayuda"] .d-fab-pop` en
vez de `[data-popup="ayuda"] .modal-card`, que ya no existe) — mismo
contenido, mismas aserciones.

---

## 6.58 Feedback puntual sobre lo entregado en §6.57: 5 correcciones reales, todas de kit salvo los íconos (kit-base v1.9.37)

Ronda de feedback directo sobre los botones flotantes de §6.57 y una
diapositiva vieja (Rotación, §6.51). Los 5 puntos, con su causa real:

**1 · Íconos del índice: la mayoría no representaban su sección**
(reporte del cliente, con razón — auditado uno por uno contra su
`data-goto`). Reutilizar íconos genéricos "porque ya existían en el
sprite" sin pensar el significado dejó casos como `alteracion` con
`i-cursor` (puntero de mouse — cero relación con "un alimento
alterado") o las 3 `unidad1/2/3` compartiendo `i-boxes` con
`envasado` (que sí es packaging de verdad). Corregido en
`seguridad-alimentaria/index.html` — 7 símbolos nuevos en el sprite
(`i-shield`, `i-alert`, `i-clock`, `i-x-circle`, `i-droplet`,
`i-rotate`, `i-layers`, mismo estilo línea/24×24 que el resto) y 9
reasignaciones: `inocuidad`→escudo (coincide con el ícono que ya usa
el propio arte de esa diapositiva), `riesgo`→alerta, `alteracion`→
reloj (la alteración se define por vencimiento/vida útil, no por
"click aquí"), `malas`→prohibido, `limpieza`→gota, `unidad1/2/3`→
capas (dejó de competir con `envasado`), `rotacion`→flechas
circulares (coincide literal con la palabra). De paso, `i-chart-pie`
(único uso: `contaminacion`) tenía una sola línea radial — a ese
tamaño se leía como manecillas de reloj, no como gráfico de torta; se
le sumaron 2 líneas más para que se vea como 3 gajos (biológico/
físico/químico, que es justo lo que esa diapositiva reparte). **Es
contenido de curso, no del kit** — el sprite de íconos vive en cada
`index.html`, no en `header-boilerplate.html`.

**2 · Bug real de kit: los popovers (Sonido/Locución/Ayuda/
Configuración) se cerraban de golpe al cruzar el hueco entre el botón
y el panel.** `.d-audio-pop`/`.d-fab-pop` abren por CSS `:hover` puro
— sin perdón de un solo frame fuera de los dos rectángulos (botón +
popover, con un hueco real de 10-14px entre ambos). Mover el mouse
rápido y en diagonal (el caso real que reportó el cliente) podía salir
de los dos rectángulos a la vez durante esa transición, y el CSS
cerraba al instante. Fix: `attachHoverGrace(el, openClass, delayMs)`
nuevo en `coto-player.js` — JS agrega una clase (`is-hover`) al
`mouseenter` y la saca recién 3s después del `mouseleave`, cancelable
si el mouse vuelve a entrar (al botón O al popover — el listener está
en el contenedor que envuelve a los dos) antes de que venza. El CSS
pasa de `:hover` a `.is-hover` como disparador (`:focus-within` se
queda igual, sin gracia — con teclado no hay "hueco que cruzar", Tab
salta directo). Mismo helper reusado para los 4 popovers —
`initAudioPopovers` e `initFabPopovers` lo llaman igual.

**3 · "1 de 2", "1 de 5" en Locución: pedido explícito de sacarlo —
"como si el sonido tuviese distintas partes".** El conteo de
fragmentos (`chunkText`, narrador.js) es un detalle interno para
resolver el bug del corte de ~15s de Chrome en utterances largas
(CLAUDE.md, narrador.js) — nunca fue pensado como algo que el alumno
tuviera que ver o entender. Mostrarlo ("frase 1 de 5") sí sonaba como
si la narración tuviera "partes" separadas, cuando es un audio
continuo. Sacado: `#d-narr-time` se borró del HTML (curso y
`header-boilerplate.html`) y de `initNarrateTimeline()` — el panel
queda con la barra arrastrable (salta al soltar, no en cada pixel) +
"Repetir", nada más. El conteo interno de fragmentos sigue existiendo
puertas adentro, simplemente ya no se expone.

**4 · El popover de Ayuda se veía "con cosas muy grandes" — bug real
de reutilización de tamaño, no de contenido.** `.d-instr-nav`/
`.d-instr-grid`/`.d-instr-item` (addendum) están pensados para el
drawer ANCHO de "Cómo recorrer el curso" (400px+) — reusados tal cual
dentro de un popover de ~320px (§6.57), el grid de 3 tarjetas
(padding `.9rem`, íconos 28px) apenas entraba, la 3ª tarjeta se caía a
una 2ª fila y el popover necesitaba scroll para mostrar todo. Fix:
overrides scoped a `.d-fab-pop .d-instr-*` en `coto-player-chrome.css`
— padding, íconos e íconos de texto más chicos SOLO dentro de este
popover, sin tocar el tamaño original que sigue siendo correcto en el
drawer/modal donde se usa así desde antes. Con el fix, las 3 tarjetas
+ el botón de reabrir intro + las 5 preguntas del acordeón entran
completas sin scroll en un viewport de escritorio típico.

**5 · Bug real de kit: la barra de "pasos" de Rotación (arrastrable
desde §6.51) todavía saltaba con un clic sin arrastrar de verdad.**
El código de §6.51 ya tenía el `return` que evita que el `click`
salte directo — pero el arrastre en sí (`pointerdown`→`pointermove`→
`pointerup`) llamaba a `go()` en el PRIMER `pointermove`, sin importar
cuánto se hubiera movido el mouse. En la práctica, ningún clic real es
100% inmóvil entre el down y el up (siempre hay 1-2px de temblor de
mano/mouse) — así que CUALQUIER clic terminaba llamando a `go()` de
todas formas, contradiciendo el "solo arrastre" que el propio comentario
del código decía haber resuelto. Fix real: umbral de movimiento
(`UMBRAL_ARRASTRE_PX = 6`) — `pointermove` no llama a `go()` hasta que
el desplazamiento acumulado desde el `pointerdown` supera ese umbral;
por debajo, un clic (con o sin el temblor normal de la mano) no mueve
nada. Una vez cruzado el umbral una vez, el arrastre sigue fluido para
el resto del gesto. **Lección para cualquier interacción "solo
arrastre" futura**: un `return` en el handler de `click` NO alcanza
para bloquear el salto si el mecanismo real de movimiento vive en
`pointermove` — hay que poner el umbral ahí, donde realmente se
decide si hubo arrastre o no.

**Tests nuevos, curso**: `check-popover-hover-gracia.mjs` (hover real
con `page.hover()`, no `click({force:true})` — el force-click no
dispara `mouseleave` de forma realista y da falsos positivos de "se
quedó pegado"; prueba los 4 popovers: abre al entrar, sigue abierto
durante la gracia tras salir, se cierra solo pasados los 3s, y la
gracia se cancela si el mouse entra al popover antes de que venza) y
`check-rotacion-arrastre.mjs` (un clic exacto sin mover no cambia el
paso activo; un arrastre real de >6px sí). `check-fab-ayuda-config.mjs`
(§6.57) no necesitó tocarse — sigue pasando igual, no ejercita hover.

**Nota agregada al verificar mobile (kit-base v1.9.38): el fix del
punto 5 (Rotación solo-arrastre) estaba incompleto en touch.** Auditar
"¿anda bien en mobile?" tras esta entrega (no un reporte del cliente,
sino la verificación de rutina de §7.3 punto 11) encontró que un TAP
táctil simple en un `.d-shot-hit--paso` seguía saltando directo, sin
arrastrar — el guard `e.detail !== 0` que distinguía clic real de
activación por teclado (comentario del punto 5, arriba) resultó
indistinguible en touch: un `click` sintetizado por un tap táctil real
TAMBIÉN trae `detail: 0`, igual que uno de teclado (confirmado
instrumentando el evento con Playwright en viewport táctil real —
`isMobile`/`hasTouch`, no redimensionando la ventana de escritorio).
**Fix real** (`js/coto-media.js`, `initShotSwap`): se reemplaza la
heurística de `e.detail` por una bandera (`pasoPointerVisto`) que el
`pointerdown` deja en `true` — para mouse Y para touch por igual,
porque los dos disparan `pointerdown` antes del `click`, y ninguno de
los dos lo hace la activación por teclado. El `click` handler la lee y
la resetea: si estuvo prendida, hubo un dedo/mouse de por medio y se
bloquea el salto (igual que antes con mouse, ahora también con touch);
si no, es la única vía posible sin puntero — teclado — y se deja
pasar, sin cambios. **Lección general, aplica a cualquier guard
`click`-vs-`teclado` futuro en este molde**: `e.detail` NO es un
sustituto confiable de "¿hubo un puntero real?" — distingue "cuántos
clics seguidos" (pensado para dobles clics), no "de dónde vino este
clic". La señal correcta es la presencia (o ausencia) de un evento de
puntero (`pointerdown`/`pointerup`) inmediatamente antes del `click`.
Nuevo test `check-rotacion-mobile.mjs`, compañero de
`check-rotacion-arrastre.mjs` pero en viewport táctil real: tap simple
no salta, arrastre táctil real sí, Enter/Espacio con foco sigue
saltando igual que siempre.

---

## 6.59 Ronda de "10 mejoras al kit" a pedido del cliente: mobile como parte del diseño (no un parche), y 2 bugs reales de kit encontrados con las herramientas que se acaban de construir (kit-base v1.9.39)

Pedido directo, sin síntoma puntual: "proponeme 10 cosas que hoy el
kit base debería tener y no tenga". Se armó la lista priorizando lo
que el cliente había pedido en el mismo intercambio — mobile pensado
desde el diseño, no auditado al final — y gaps ya señalados en este
documento sin resolver. Las 10 aprobadas ("mandale") e implementadas.

**Regla de proceso nueva, pedida en el mismo intercambio, ANTES de
esta lista — queda registrada acá porque cambia cómo se trabaja de acá
en adelante, no es parte de las 10 mejoras en sí**: "de ahora en
adelante... todo tiene que ser responsive e ir de la mano con mobile...
nuestro producto de curso tiene que estar pensado en su totalidad de
formas y dispositivos" + "vos tenés que adelantarte y prever cosas que
se te puedan pasar... para evitar tantas correcciones a futuro". Ver
§6.10.1 punto 4 (regla fija, ya escrita ahí) — mobile se prueba en la
MISMA vuelta en que se construye, no como auditoría posterior.

**1 · Aviso "Girá tu dispositivo" para portrait angosto.** Resuelve la
limitación que §6.56 había dejado documentada A PROPÓSITO sin
resolver ("es una decisión de producto, no un bug de código"). Con el
pedido explícito de hoy de que el curso sea sólido en cualquier
dispositivo, dejarlo así ya no alcanza. `.d-rotate-notice`
(`coto-shot-stage.css`): oculto por default, visible vía
`@container (max-aspect-ratio:1)` — el mismo mecanismo de
`@container` que ya decide el resto del lienzo responsive en este
archivo, cero JS. El umbral (`aspect-ratio:1` del `.d-stage`, no del
dispositivo/viewport crudo — mismo cuidado de siempre, §6.9) separa
"tablet angosta en horizontal" (ya cubierta por el lienzo fijo con
letterbox razonable) de "portrait de verdad", donde el lienzo 2:1
quedaría como una franja mínima. No es una restricción nueva: el
cliente ya había limitado el curso a horizontal en tablets (§6.8) —
esto solo lo COMUNICA en vez de mostrar un layout roto sin explicación.
El header/footer del reproductor siguen 100% usables debajo del
aviso (no se cubre `.d-app` entero, solo `.d-stage`) — el alumno puede
seguir navegando el índice/glosario/ayuda mientras gira el teléfono.
Verificado con Playwright en 5 viewports (portrait angosto, tablet
portrait, desktop, tablet landscape, teléfono landscape): visible SOLO
en los 2 portrait, invisible en los 3 landscape — `check-rotate-notice.mjs`.

**2 · `openCourseMobile()` compartido (`tools/tests/_shared.mjs`).**
Antes de esta vuelta, cada test mobile (`check-fab-mobile.mjs`,
`check-controles-audio-mobile.mjs`, `check-rotacion-mobile.mjs`)
repetía a mano las mismas ~6 líneas de "levantar un contexto táctil
real". Con la regla nueva de §6.10.1 punto 4 exigiendo mobile real en
CADA interacción nueva, ese boilerplate repetido es fricción que
invita a saltearlo. Mismo contrato que `openCourse()`, pero con
`devices['iPhone 12']` (perfil completo, no solo viewport+isMobile+
hasTouch sueltos) como default, `deviceName` opcional para probar
otro perfil (ej. tablet) sin escribir un test aparte. Los 3 tests
mobile existentes migrados para usarlo — mismo comportamiento,
confirmado corriendo la suite completa antes y después.

**3 · `initPinnedPopover()` compartido (`coto-player.js`).**
`initAudioPopovers()` (§6.55) e `initFabPopovers()` (§6.57) cableaban
casi la misma lógica cada uno por su cuenta — pin por click, un solo
abierto a la vez, gracia de hover (§6.58), cierre por click-afuera y
por `slidechange`. Un bug encontrado en una función (como la gracia
de hover) obligaba a acordarse de portarlo a mano a la otra — ya pasó
una vez. Extraído a un mecanismo único, parametrizado por
`btnSelector` y un `onOpen(item)` opcional (el posicionamiento
dinámico que `initAudioPopovers` necesita y `initFabPopovers` no).
Devuelve `{ closeAll }` para que el que llama pueda cerrar todo desde
un botón propio (el de "volver a ver la introducción" del FAB).
Refactor puro — mismo comportamiento externo, verificado con la suite
completa (en particular `check-popover-hover-gracia.mjs`,
`check-fab-ayuda-config.mjs`, `check-fab-mobile.mjs`).

**4 · Red de seguridad universal para `<video>`
(`initVideoSafetyNet`, `coto-media.js`).** El bug de "¿quién lo apaga?"
(§6.10.1 punto 1) ya volvió a aparecer 4 veces en 4 patrones distintos
a lo largo de este documento — cada vez que un patrón nuevo se olvida
de cablear su propio apagado. En vez de esperar la 5ª vez, un
cinturón extra: en cada `slidechange`/`popupclose`/`layerchange`,
barre TODOS los `<video>` del documento y pausa cualquiera que siga
reproduciéndose fuera de la diapositiva/pop-up/capa activa (`activo(el)`
chequea `closest('[data-slide]')`/`closest('[data-popup]')`/
`closest('[data-panel]')` independientemente, sin asumir un único
nivel de anidado). No pisa la lógica fina de cada patrón (reset de
`currentTime`, sacar `controls`, marcar "visto") — solo pausa; esos
detalles siguen siendo responsabilidad de cada patrón. Se dispara
sola desde `initPlayer()` (el único punto que TODO curso llama
siempre), con chequeo defensivo `typeof global.initVideoSafetyNet ===
'function'` — un curso sin video (sin `coto-media.js` cargado) no
hace nada, sin error. Verificado forzando un `<video>` a reportar
`paused:false` (el sandbox no decodifica H.264 real, mismo límite ya
documentado en §6.29) y confirmando que `barrer()` lo pausa al perder
contexto.

**5 · `Motor.restoreMaxVisited(vistas)` (`motor-slides.js`).**
Absorbe al kit el bug real de §6.51: el techo de arrastre de la barra
de progreso tenía que recalcularse a mano, en cada curso, desde
`estado.vistas` ya restaurado — vivía como nota de checklist (§7 punto
9.8), no como código, y el bug volvió a pasar por eso mismo. Una sola
llamada (`motor.restoreMaxVisited(estado.vistas)`, después de
restaurar el progreso persistido) reemplaza el loop a mano Y el
`Math.max` en cada `slidechange` — el motor se actualiza solo de ahí
en más. "Seguridad alimentaria" es la primera prueba real: se
reemplazó el código a mano de `curso.js` por la llamada nueva,
verificado simulando una recarga de página después de avanzar 7
diapositivas (el techo de arrastre sobrevive intacto).

**6 · `tools/check-css-duplicates.mjs`.** Detecta selectores CSS
repetidos en el MISMO contexto de cascada que además comparten al
menos una propiedad — la firma exacta de §6.28/§6.33 (`.modal-card--shot`
declarado dos veces con `--shot-card-ratio` distinto, gana el último).
Deliberadamente NO alcanza con "selector repetido": un componente
partido en 2+ reglas con propiedades DISTINTAS (`.d-instr-modal` en
dos bloques, cero propiedades en común) es autoría válida, no un bug —
sin ese filtro el script ahoga cualquier hallazgo real en decenas de
falsos positivos (confirmado corriéndolo sin el filtro contra el CSS
del propio kit). Tampoco compara "sin `@media`" contra "dentro de un
`@media`" — ese cruce es el patrón NORMAL de cualquier CSS responsive
(base + override a propósito) y dio ruido masivo incluso en CSS ya
correcto; el caso real de §6.28 (bloque completo duplicado, uno sin
guardia) sigue siendo un caso para ojo humano — `grep` el selector
antes de agregar una regla nueva (§6.33) sigue siendo la defensa real
para ESE patrón puntual.

**Pagó su costo de construcción en el momento**: corrido contra el
CSS del kit apenas terminado, encontró 2 bugs reales (detalle abajo),
los 2 corregidos en la misma vuelta.

**7 · Warning de desarrollo en `_initShots()` (`motor-slides.js`).**
El bug de §6.22 punto 7 (`[data-hit]`/`[data-place]` con
`data-l/t/w/h` bien medidos pero sin `position:absolute`, así que el
`left`/`top` en px no hace nada) era indetectable sin mirar la
pantalla. Ahora, al posicionar los hits de cada `.d-shot`, se chequea
`getComputedStyle(h).position !== 'absolute'` y se avisa por
`console.warn` una vez por elemento. Verificado que NO da falsos
positivos recorriendo las 26 diapositivas reales de "Seguridad
alimentaria" (0 warnings) antes de darlo por bueno.

**8 · `initConceptShots()` → confirmado resuelto, no había nada que
hacer.** Al auditar este pendiente (arrastrado en la lista de "8. Kit
master" desde hace varias vueltas) se encontró que YA estaba resuelto
desde §6.45: `initShotSwap()` es exactamente esa generalización,
probada en 4 variantes distintas en producción. La nota vieja quedó
sin tacharse por omisión, no porque faltara trabajo — corregida.
"Surtido sin venta" (curso cerrado, fuera de este repo) sigue con su
copia hardcodeada de los 7 conceptos — no se migra, un curso cerrado
no se retoca sin un bug real que lo justifique.

**9 · Certificado de finalización imprimible/PDF con nombre del
alumno.** Pedido pendiente desde §6.46 (una de las 10 propuestas de
esa vuelta, nunca implementada). `initCertificatePrint()`
(`coto-cierre.js`) + CSS pareja (`coto-cierre.css`) — mismo mecanismo
YA probado del resumen imprimible (`initSummaryPrint`,
`window.print()` + una clase en `<body>` que tapa la app y muestra
SOLO el documento; "imprimir a PDF" es la forma estándar del
navegador de generar un PDF real sin sumar ninguna librería). La
diferencia real con el resumen: el certificado no necesita NINGÚN
HTML propio de curso — el documento se arma entero en JS
(`createElement`/`textContent`, nunca `innerHTML`, mismo criterio de
seguridad que `initGreeting()` con el nombre que viene del LMS) leyendo
`SCORM.getFullName()` (invertido de "Apellido, Nombre" a "Nombre
Apellido" para que se lea natural), el nombre del curso
(`opts.courseName`), la fecha del día, y la medalla alcanzada si el
curso tiene sistema de puntos (`[data-medalla-nombre]`, se omite si
`data-nivel="ninguna"`). Un curso nuevo solo agrega el botón
`#d-cert-print` junto al de "Imprimir resumen" — cero markup del
certificado en sí. Diseño con tokens del curso (`--cat`/`--cat-strong`/
`--font-title`), orientación landscape al imprimir (`@page{size:
landscape}`). Verificado con un LMS falso (`Lencina, Damian` →
"Damian Lencina" en el certificado), confirmando que `window.print()`
se llama, `body.printing-cert` se agrega y se limpia después, y con
una captura en modo `@media print` real — `check-certificado.mjs`.

**10 · `tools/build-zip.py`.** El script de armar el zip con el flag
UTF-8 forzado (la trampa de `zipfile` de §3.9: `flag_bits` hay que
reaplicarlo DESPUÉS de escribir todas las entradas, no antes) se venía
reescribiendo a mano en cada sesión que necesitaba entregar un zip.
Ahora es una herramienta fija (`kit-base/tools/build-zip.py`,
reusable para cualquier curso o para el kit mismo), con verificación
real incluida (reabre el zip generado y confirma el flag en cada
entrada + `testzip()` de integridad) — no "se ve bien", confirmado.
Excluye `node_modules`/`.git` siempre, y el `README.md` heredado del
scaffold si el curso ya tiene su propio `README-CURSO.md` (regla de
§6.43, ahora aplicada por código en vez de a mano cada vez).

### 2 bugs reales de kit encontrados con `check-css-duplicates.mjs`, los 2 corregidos en la misma vuelta

Confirma el valor de construir la herramienta: corrida contra el CSS
del kit apenas terminada (no contra un curso — contra `kit-base/css/*`
directo), encontró 2 bugs reales que ningún test estructural podía
ver, con años de vueltas de feedback sin que nadie los notara:

1. **`.d-gloss > div`/`dt`/`dd`** (`coto-base-addendum-v1.8.css`)
   tenían, después de la regla base, 4 "escalones" de compresión más
   seguidos — SIN ningún `@media` que los envolviera. Mismo selector
   redeclarado varias veces al hilo, cada uno pisando al anterior en
   silencio: SIEMPRE se aplicaba solo el último (el más chico, `padding:
   .06rem .2rem`), en CUALQUIER tamaño de pantalla, nunca los 3
   anteriores. Parecía pensado para escalonarse por altura (mismo
   patrón que `.d-medalla`/`.d-cert-stats`, con `max-height:800/860/
   740/660` ya establecido en el propio archivo y en
   `coto-cierre.css`), pero los `@media` que le hubieran dado sentido
   nunca se escribieron. Sin forma de recuperar qué breakpoints se
   pensaban, se optó por NO inventarlos: se consolidó el valor final
   (el que ya era, en los hechos, el único que corría) en la regla
   base, sin cambio de comportamiento visible — solo se borró el
   código muerto. Si hace falta compresión real por altura acá, es un
   pedido nuevo a implementar aparte, con los breakpoints que
   corresponda.
2. **`.d-cert-stats .s.d-shine::after`** (`coto-cierre.css`) tenía la
   MISMA regla `@media(prefers-reduced-motion:reduce){...
   animation:none;display:none}` declarada dos veces, byte a byte
   idénticas — duplicado exacto sin ninguna diferencia, eliminado.

**1 hallazgo del linter dejado sin tocar, a propósito**: `.d-narr-range`
(`coto-player-chrome.css`) comparte `margin` entre una regla compartida
(`.d-vol-slider, .d-narr-range{...margin:0...}`) y una regla específica
más abajo (`margin:.3rem 0 .55rem`) — ambigüedad real entre "reset
compartido + override final a propósito" (lo más probable, dado que
el resto de las propiedades de la regla específica no colisiona) y
"duplicado accidental". Sin poder confirmar la intención original, se
dejó como está y se documenta acá para quien lo revise después — el
linter señala candidatos, no reemplaza criterio humano.

### Bug de proceso encontrado armando el zip de verificación (no parte de las 10, efecto colateral)

Al armar los zips de "antes de las 10 mejoras" que pidió el cliente,
apareció un directorio `undefined/` con una captura de pantalla suelta
en la raíz de "Seguridad alimentaria" — colado en el zip anterior ya
entregado al cliente. Causa: `check-fab-mobile.mjs` escribía una
captura opcional con `process.argv[3] + '/archivo.png'` sin chequear
que ese 3er argumento existiera — corrido en su forma normal (`node
check-fab-mobile.mjs <url>`, sin 3er argumento), Playwright interpretó
literalmente `undefined + '/archivo.png'` como ruta. Fix: guardar la
captura solo `if (process.argv[3])`. **Lección para cualquier test que
saque una captura "opcional"**: un argumento no pasado en JS es
`undefined`, y concatenarlo a un string lo convierte en el TEXTO
"undefined" sin ningún error — hacer siempre un chequeo explícito
antes de usar un argumento opcional en una ruta de archivo.

---

## 6.60 Ronda "mejorar el kit al máximo": el contraste no fallaba en 5 categorías, fallaba el sistema de tokens — y `npm test` corría 6 de 7 tests (kit-base v1.9.40)

Ronda con el foco puesto **solo en el kit** (los zips de "Seguridad
alimentaria" y "Uso de Sucursales 3 - NOA" entraron como material de
consulta y banco de pruebas, no para modificarlos). Se arrancó por los
2 puntos marcados como urgentes de una lista de 10, y el primero
resultó ser bastante más grande de lo que decía el enunciado.

### El hallazgo: una afirmación medida contra UN caso, aplicada a 23

`coto-base.css` decía, textual:

> `--cat-strong` es lo bastante oscuro en **TODAS** las categorías del
> kit para que el blanco sí pase (blanco vs `--cat-strong` de
> "servicio-médico" da 4.53:1)

Se midió **una** categoría — y justo la más al límite de las que pasan
— y se generalizó a las 23. Es exactamente el patrón de §6.7 (un valor
tuneado contra una sola voz y aplicado como constante global), en otro
dominio. Peor: el bloque de accesibilidad de más arriba en ese MISMO
archivo ya identificaba a `salón`, `seguridad-higiene`,
`mantenimiento` y `zona-cumples` como "familias claras" donde no va
texto chico sobre el color — y `.modal-hd--dark` les ponía `#fff`
igual, tres líneas más abajo. La regla estaba escrita; el componente
no la respetaba.

**Lección de proceso**: una afirmación de cobertura ("en todas", "en
cualquier caso", "siempre") escrita en un comentario, con UN ejemplo
al lado como prueba, es una hipótesis disfrazada de hecho. Si vale la
pena escribirla, vale la pena que la verifique un script.

### `tools/check-contraste.mjs` (nuevo)

Valida las 23 categorías contra los pares de uso REALES del CSS del
kit — cada par sale de una regla concreta, no de una lista inventada —
y cada uno contra **el umbral que le corresponde**: 4.5:1 texto
normal, 3:1 texto grande y también íconos (WCAG 1.4.11, contraste de
elementos no textuales). Un solo umbral para todo daba falsos
positivos en los títulos de pop-up y falsos negativos en los botones.

Lee las categorías del propio `coto-base.css`, así una categoría nueva
queda cubierta sin tocar el script.

**Dos decisiones de diseño del script, las dos por la lección de
§6.59 punto 6** (un linter sin filtro no se usa):

- **`nucleo: true/false`.** La primera corrida dio 60 fallos y era
  ilegible. Verificado contra los cursos entregados, 6 componentes del
  addendum (`tabs-v`, `tabs-h`, `toggle-seg`, `radial`, `badge-cat`,
  `d-steps`) tienen **0 usos** — sus fallos son reales pero no hay
  nada entregado afectado. Se reportan aparte y no cortan el proceso;
  los de núcleo sí.
- **`EXCEPCIONES` con motivo obligatorio.** Un caso que no se puede
  cerrar sin una decisión que excede al archivo no se borra del
  reporte ni se deja fallando para siempre: se lista aparte con el por
  qué escrito. Si no se puede explicar, no es una excepción, es un bug
  sin arreglar.

### La corrección: separar los dos trabajos que hacía un solo token

`--cat-strong` hacía dos cosas a la vez — pintar bordes/sombras y
pintar texto/rellenos sólidos — y solo una de las dos tiene un
requisito de contraste. Además está atado al manual: §6.5 dejó
establecido que los 23 hexes coinciden EXACTAMENTE con el Valor 1 de
la tabla oficial, que es lo que hace la paleta auditable. Corregirlo
directo habría hecho que el kit dejara de coincidir con el manual.

**Decisión del cliente, consultada explícitamente antes de tocar
color**: token nuevo, manual intacto.

| Token | Para qué | Estado |
|---|---|---|
| `--cat-strong` | bordes, outlines, sombras, thumbs, paradas de degradado, puntos | **intacto** = Valor 1 del manual |
| `--cat-ink` | texto, íconos, y rellenos sólidos que llevan texto blanco | por default ES `--cat-strong`; 7 categorías traen el suyo |
| `--cat-wash` | fondo tintado que LLEVA texto (`color-mix(--cat 12%, #FFF)`) | nuevo |

Las 7 con tinta propia (`elaborados`, `salon`, `mantenimiento`,
`servicio-medico`, `panol-base-12`, `seguridad-higiene`,
`zona-cumples`) están calibradas a >=4.5:1 contra `--cat-wash`, no
contra blanco puro. **Ese es el punto fino**: calibrar contra blanco
deja el token sin margen apenas el fondo lleva algo de tinte —
medido, aclarar el fondo casi no mueve la aguja (se estanca entre 3.87
y 4.31), porque el limitante es la tinta, no el fondo. Calibrar contra
el fondo más exigente en el que se usa da >=4.85:1 sobre blanco de
yapa.

Los overrides van DESPUÉS del default en el archivo: `[data-cat]` y
`[data-cat="x"]` son los dos selectores de atributo, misma
especificidad, así que manda el orden. Está anotado en el CSS — no
reordenar.

### 3 bugs reales más, encontrados por la herramienta recién construida

Como en §6.59 punto 6, el validador pagó su costo de construcción en
el momento:

1. **`.d-instr-kicker` usaba los dos tokens equivocados.** La píldora
   "ANTES DE EMPEZAR" pintaba `--on-cat` sobre `--cat-soft`. `--on-cat`
   está definido como el color de contraste contra `--cat` (el pleno),
   no contra `--cat-soft` (el Valor 5, mucho más claro). En las 14
   categorías donde `--on-cat` es blanco, eso dejaba texto de 11,5px
   entre 1.69:1 y 3.57:1 — incluida `no-alimentos`, la categoría de un
   curso ya entregado. Se ofrecieron 2 caminos con mockup y el cliente
   eligió el sólido: `background:var(--cat-ink); color:#fff`, el mismo
   par que ya usan `.btn-cat` y `.modal-hd--dark`. Correcta en las 23 y
   más saturada que antes.
2. **`.d-salida-eval` ponía texto sobre un token que no es fondo de
   texto.** `--cat-strong` sobre `--cat-soft` a `.9rem`: falla en 21 de
   23, incluida `control-de-calidad` (3.29:1). `--cat-soft` está a 4
   pasos de `--cat-strong` en una rampa de 6 — **no hay valor de tinta
   que llegue a 4.5:1 ahí**, no se arregla oscureciendo. Pasó a
   `--cat-wash`.
3. **`frescos-2` tenía mal el `--on-cat`.** Blanco sobre su propio
   degradado daba 2.74:1 — por debajo incluso del 3:1 de texto grande.

   **Y acá el subcaso honesto**: navy tampoco lo cierra. Su
   `--cat-grad` (#DC3228 → #FF6E64, Valor 2→4 del manual) abarca un
   rango de luminancia tan ancho que ningún color de texto pasa 3:1 en
   los DOS extremos — blanco falla en el claro (2.74), navy en el
   oscuro (2.98). Se dejó navy por ser estrictamente mejor y quedó
   como la única `EXCEPCIÓN` documentada del validador. Cerrarlo de
   verdad exige acortar el degradado, o sea tocar la tabla del manual:
   decisión de diseño, no de código. Ninguna otra categoría tiene un
   degradado tan extendido.

**Dato que salió de paso**: después de mover los 7 fondos de texto a
`--cat-wash`, `--cat-soft` quedó con **cero usos** en todo el kit. Los
7 que tenía eran todos fondos de texto — el token nunca se había usado
para lo que fue diseñado. Se deja definido (es el Valor 5 del manual y
los cursos lo usan en su CSS propio) con la nota de para qué sirve.

Resultado final: **0 fallos de núcleo** en 23 categorías × 5 pares de
uso, con 1 excepción documentada.

### `npm test` corría 6 de 7 tests, y el que faltaba era el que importa

El script `test` de `package.json` era una lista literal escrita a
mano:

```
for t in deep-audit full-regress hitbox-click-check \
         scroll-audit keyboard-a11y markup-sanity; do ...
```

`scorm-tracking.mjs` existía en `tools/tests/` desde kit v1.9.9 y
**nunca estuvo en esa lista** — justo el test que cubre el peor bug
que tuvo este kit (§6.24: el alumno terminaba el curso y en el LMS
quedaba `incomplete`; para el negocio, el curso no servía para nada).
Durante 30 versiones, "0 fallos" quiso decir "0 fallos en 6 de 7
tests", sin que nada lo dijera.

**La lección no es "agregar scorm-tracking a la lista"** — es que una
lista escrita a mano se desactualiza sola y en silencio, igual que el
comentario de contraste de más arriba. Nuevo `tools/run-tests.mjs`: la
lista **sale de la carpeta** (`tools/tests/*.mjs`, salteando los que
empiezan con `_`, que por convención son librerías compartidas y no
tests). Un test nuevo entra a la suite por existir.

Dos detalles del runner:
- **No corta en el primer fallo.** El `|| exit 1` viejo escondía el
  estado de todos los tests siguientes y obligaba a 2 corridas para
  ver el cuadro completo. Ahora corre todos y reporta el resumen.
- `npm run test:kit` (nuevo) corre lo que se puede validar **sin un
  curso**: contraste + duplicados de CSS. Es el primer paso hacia el
  test de humo del kit solo que §6.10.8 viene pidiendo.

Verificado: 7 de 7 en verde contra un curso real, y también contra una
copia de ese curso con el kit modificado encima (los cursos tienen su
propia copia del CSS, así que correr la suite contra el curso tal cual
NO prueba los cambios del kit — hay que armar la copia).

### El `.d-narr-range` que §6.59 dejó "sin tocar por ambiguo" no era ambiguo — faltaba mirar el contexto

§6.59 cerró con un hallazgo del linter de CSS dejado a propósito sin
resolver: `.d-narr-range` con `margin` declarado en una regla
compartida (`.d-vol-slider, .d-narr-range`) y otra vez en su regla
específica, sin poder confirmar si era "reset + override a propósito" o
un duplicado accidental. Quedó así dos versiones.

Se resolvió acá porque empezó a molestar de verdad: hacía salir en rojo
al `npm run test:kit` nuevo, o sea un chequeo de entrega que nadie
puede usar si arranca fallando.

**No hacía falta más información — hacía falta mirar 20 líneas más
arriba y más abajo.** La regla compartida traía `margin:0` **y**
`flex:1`. Los dos existen para el slider de VOLUMEN, que vive en
`.d-vol-row` (`display:flex`). `.d-narr-range` vive en `.d-narr-pop`,
que es un bloque simple: heredaba un `flex:1` completamente inerte y
tenía que anular un margen que nunca debió recibir. O sea que el
"override a propósito" era real, pero era el síntoma — la causa era que
la regla compartida mezclaba el SKIN (común a los dos) con el
comportamiento de layout (propio de uno solo).

Fix: la regla compartida queda solo con el skin; `margin:0; flex:1` se
acotan a `.d-vol-slider`. Verificado con `getComputedStyle` y
`getBoundingClientRect` antes/después: la única propiedad que cambia es
`flex-grow` de `.d-narr-range` (1 → 0), inerte porque su padre no es
flex — caja idéntica, 218×6px en los dos casos.

**Lección**: "el linter señala candidatos, no reemplaza criterio
humano" (§6.59) sigue siendo cierto, pero "ambiguo" fue el diagnóstico
equivocado. Cuando un duplicado parece ambiguo, la pregunta que lo
destraba casi nunca es "¿cuál gana?" sino **"¿por qué esta propiedad
está en la regla compartida?"** — un selector agrupado que mezcla
apariencia con posicionamiento va a generar un override en cuanto los
dos elementos vivan en contenedores distintos.

### `spec-motor-slides.md` y la plantilla `curso.js`: 5 y 8 símbolos que el kit exporta y nadie documentaba

Dos fuentes de verdad quedaron atrás de lo que el código ya hacía —
`package.json` (versión) era la tercera, ya corregida al arranque de
esta ronda. Un curso nuevo que arranca copiando `kit-base/` de punta a
punta (§7, el flujo real) no lee el código del kit línea por línea: lee
estos dos archivos. Lo que no está ahí, se pierde en silencio.

**`spec-motor-slides.md`** no mencionaba `restoreMaxVisited`,
`initVideoSafetyNet`, `data-autoadvance`, `data-narrate-last` ni
`data-narrate-prefix` — los 5 verificados contra el código real
(`motor-slides.js`/`coto-media.js`/`narrador.js`), no copiados de
memoria. Se agregaron como secciones nuevas (§8.1, §11-14), cada una
con el marcado mínimo, qué bug real resolvió, y la referencia cruzada a
la sección de `CLAUDE.md` donde está la historia completa.

**La plantilla `js/curso.js`** (83 líneas) no mencionaba
`initTiempoActivo`, `initGlossarySearch`, `initGlossaryUnlock`,
`initIndexJumps`, `initHotspots`, `initShotSwap`, `initVideoSafetyNet`
ni `initCertificatePrint` — las 8 confirmadas exportadas
(`global.init*`) antes de tocar nada. Se agregaron al `boot()` de
ejemplo, comentadas como el resto salvo dos: `initTiempoActivo()` e
`initVideoSafetyNet()` van SIN comentar, porque no dependen de ningún
markup del curso (verificado leyendo su cuerpo: solo escuchan eventos
globales) — no hay motivo para que sean opt-in. El snippet resumido de
`README.md` se actualizó igual, con la misma nota.

**Por qué importaba, no es solo prolijidad**: `initVideoSafetyNet` e
`initIndexJumps` son justo las dos piezas que ya causaron un bug real
documentado en este mismo archivo cuando faltaron (§6.10.1 punto 1 —
"¿quién apaga el video?" — repetido 4 veces antes de que existiera el
cinturón extra; §6.44 punto 2 — el menú lateral dejaba saltar a
cualquier diapositiva sin cumplir el gate). Que la plantilla las
mencione es la diferencia entre "un curso nuevo las hereda por
default" y "un curso nuevo las reintroduce como bug, otra vez".

Verificado con la suite completa (7/7) contra una copia de un curso
corriendo el kit modificado — los cambios de esta parte son solo
documentación/plantilla, no tocan ningún `.js`/`.css` del kit, así que
la verificación es "no rompió nada", no "arregló algo".


---

## 6.61 Ronda de feedback sobre "Seguridad alimentaria": el volumen de "Sonido" pasa a gobernar también la locución, y un bug real de popovers que se quedaban colgados tras un clic afuera (kit-base v1.9.40)

Ronda con 3 cambios de kit y 2 de curso; solo los de kit entran acá —
los de curso (puntaje del minijuego derivado en vez de guardado,
`cursor:grab` en la Rotación de este curso puntual, sacar el botón de
certificado) quedan en la bitácora de "Seguridad alimentaria", fuera
de este repo.

### 1 · `narrador.js` — "Sonido" ahora también gobierna el volumen de la locución

Pedido del cliente: que "Sonido" module el volumen de la locución, o
que Locución tenga su propia barra. Se descartó la segunda — un
segundo control para lo mismo se desincroniza del primero y obliga a
bajar el volumen dos veces — y se completó la primera: mismo criterio
que §6.44 punto 9 ya fijó para el mute ("Sonido mutea TODO, video
incluido"), acá para el nivel.

`SpeechSynthesisUtterance` acepta `volume` (0-1). Nuevo
`volumenEfectivo()` (copia local del mismo patrón `muted()`/
`volumeLevel()` que ya usan coto-player.js/coto-media.js/coto-ui.js/
fx.js — cada archivo del kit es copy-paste autocontenido, no un módulo
compartido) se lee en `hablarDesde()` en **cada fragmento**, no una
sola vez al arrancar: una locución larga se parte en varios utterances
(`chunkText`), así que mover el slider a mitad de una narración se
escucha recién en el fragmento SIGUIENTE si no se hace nada más — ver
el punto 2 para la vuelta inmediata.

**`Narrador.refreshVolume()` (nuevo, exportado)**: `volume` de un
utterance no se puede tocar en caliente sobre uno que ya está sonando
— la única forma de aplicar un volumen nuevo a lo que ya se está
narrando es re-emitirlo desde el fragmento actual (`seek(estadoActual.
index)`). Guardado contra narrar algo que ya terminó o que no está
activo (`estadoActual.terminado`/`!narrating`).

Verificado con `speechSynthesis.speak` espiado: volumen default 1,
baja a 0.4 al mover el slider, cae a 0 con mute, y `refreshVolume()`
re-emite el fragmento EN CURSO con el volumen nuevo sin esperar a que
termine solo.

### 2 · `coto-player.js` — mute instantáneo, gracia de hover más corta, y un bug real de popovers que no cerraban

**a) `toggleMute()` llama a `Narrador.refreshVolume()`** justo después
de `sync()` — solo ahí, nunca en el `input` continuo del slider de
volumen: mutear es un gesto discreto (el alumno espera silencio YA),
pero re-emitir en cada píxel de un arrastre cortaría la frase en seco.
Verificado con un espía sobre `refreshVolume`: el clic en "Sonido" lo
llama una vez, el `input` del slider no lo llama ninguna.

**b) Gracia de hover: 3s → 1,5s.** Cruzar el hueco real entre botón y
panel (10-14px) lleva ~50ms — 3s alcanzaban de sobra para el gesto
pero dejaban el panel colgado mucho después de que el alumno ya siguió
con otra cosa. Un solo lugar para el número
(`GRACIA_HOVER_MS = 1500`), usado como default en `initPinnedPopover`;
sacado el `graceMs: 3000` explícito de las dos llamadas
(`initAudioPopovers`, `initFabPopovers`) — antes había 3 lugares con
el mismo número mágico, ahora uno. Verificado con timing real: sigue
abierto a los 1300ms, cerrado a los 1700ms.

**c) Bug real: el clic afuera no cerraba un popover abierto por
HOVER.** `closeAll()` y el handler de `document click` solo sacaban
`is-open` (el pin por clic/tap) — nunca `is-hover` (la gracia). Un
panel abierto con el mouse se quedaba colgado hasta que venciera la
gracia aunque el alumno ya hubiera hecho clic afuera, cambiado de
diapositiva (`slidechange`), o tocado "volver a ver la introducción"
(§6.57). Un popover tiene UNA sola noción de "cerrado" — los dos
puntos ahora sacan las dos clases. Verificado: `mouseenter` deja
`is-hover`, un clic en `document.body` lo saca al instante (no espera
la gracia) y tampoco deja `is-open` puesto.

### 3 · `.d-shot-hit--paso` sin definir en el kit — el mismo bug de §1, otra vez

`initShotSwap()` (`coto-media.js`, §6.51) keyea sobre
`.d-shot-hit--paso` para decidir qué hitbox de un grupo de swap es
arrastrable, pero la clase vivía SOLO en el `assets.css` de cada
curso — el patrón "el kit usa clases que el kit no define" que §1 ya
marca como recurrente (v1.4, v1.6, v1.7, v1.8, y ahora esto). La
consecuencia real: `.d-shot-hit` (la base, en `coto-shot-stage.css`)
ya trae un tinte de `:hover` genérico pensado para hitboxes que SÍ
responden al clic — un paso arrastrable desde v1.9.37/38 NO responde
al clic (solo al arrastre), así que ese tinte heredado es un
affordance de "clickeame" sobre algo que no hace nada al clic. Bug
real confirmado en "Seguridad alimentaria" (ver README-CURSO.md de ese
curso, "Rotación").

Subido a `coto-shot-stage.css`, junto a `.d-shot-hit--circle`:
`cursor:grab` (afordance correcto para arrastre), tinte de `:hover`
anulado, `cursor:grabbing` mientras `[data-shot].is-seeking-paso`
(la clase que el propio `initShotSwap` ya pone durante el arrastre
real). El aro de `:focus-visible` de la base NO se toca — por teclado
el tramo sí se activa con Enter/Espacio, no es decoración de sobra.
Verificado: `cursor:grab` en reposo, sin necesitar que el curso
redefina nada.

### Verificación

Los 3 puntos, con scripts dirigidos además de la suite genérica (la
suite no cubre volumen de narración ni timing de popovers — son
comportamientos que solo se ven espiando `speechSynthesis.speak` o
midiendo clases en el tiempo, no estructura del DOM): volumen
default/bajado/muteado/`refreshVolume` correctos; `toggleMute` llama
a `refreshVolume` una vez, el slider ninguna; hover→clic-afuera cierra
al instante; gracia exacta en 1500ms; `cursor:grab` resuelto sin
markup del curso. Suite completa 7/7 contra una copia de un curso
corriendo el kit modificado. `check-css-duplicates`/`check-contraste`
sin novedades.

---

## 6.62 Discrepancia real entre lo reportado y lo aplicado — y el punto que faltaba: el repaso del minijuego pasa de capa a pop-up real (kit-base v1.9.41)

Arranque de ronda con un resumen de trabajo que decía "todo esto ya
está aplicado, v1.9.41". Verificado contra el código real antes de
tomarlo como contexto (regla de §0.1: nunca asumir "ya está resuelto"
sin comprobarlo) — la versión real era v1.9.40, y de los 6 puntos del
resumen, 5 coincidían con lo que hay efectivamente en este archivo
(§6.55, 6.57, 6.58, 6.59, 6.60/6.61). El punto 6 — "el repaso del
minijuego pasa de capa a pop-up real" — **no estaba en ningún lado**:
ni en el CSS, ni documentado. Confirmado con el usuario que era una
tarea real pendiente, no un error del resumen, y se implementó acá.

**Por qué vale la pena dejarlo anotado**: es la primera vez que el
mecanismo de §0.1 se pone a prueba con una discrepancia real, y el
resultado confirma por qué el paso de verificación importa — sin él,
esta sección se hubiera escrito narrando un cambio que nunca existió.

### El cambio: `.d-mj-repaso` deja de ser `[data-panel]`, pasa a `[data-popup]`

Antes: una capa más del `[data-layers]` del minijuego (intro/jugar/
fin/repaso), pantalla completa, con un botón que saltaba a mano a la
capa "fin". Ahora: un `[data-popup]` real, mismo contrato que
cualquier otro pop-up del kit — `.modal`/`.modal-back`/`.modal-card`/
`.modal-bd`, `[data-popup-close]`.

**El punto central, verificado con Playwright antes de dar el cambio
por terminado**: el motor (`showPopup`/`closePopup`, ya documentado en
`spec-motor-slides.md` §6) sabe abrir/cerrar/atrapar foco en CUALQUIER
`[data-popup]` sin que el kit necesite una línea de JS nueva. Probado
con una página aislada (solo el kit, sin curso): `data-popup-trigger`
abre, y las 4 vías de cierre (botón `data-popup-close`, ✕, Esc, click
en el backdrop) cierran — las 4 confirmadas una por una, más que el
foco entra al pop-up al abrir y que `popupclose` dispara con
`detail.id` correcto (`curso.js` se engancha ahí para decidir
"continuar"/"reintentar", sin cablear un handler de clic propio en el
botón). Cero JS nuevo en el kit — es, en los hechos, el argumento a
favor de usar el contrato genérico en vez de reinventar el cierre cada
vez (mismo espíritu que §6.19 punto 1: "está en el kit" no sirve si
la sesión que arma el curso no lo usa — acá es al revés, usar el
contrato del kit evita escribir nada).

**Sin `.modal-hd`, a propósito** — mismo criterio que el pop-up de
video (§6.12 punto 5, "la barra superior es opcional, no obligatoria"):
la píldora + título de repaso ya tienen su propia identidad de color
(`--cat`/`--cat-ink`, igual que el resto del minijuego); forzar el
degradado de marca fijo de `.modal-hd` encima hubiera sido un segundo
lenguaje de color en el mismo pop-up. El cierre es un `.modal-x`
flotante propio (`.modal-x--mj-repaso`), mismo patrón que
`.modal-x--video` en `coto-media.css` — el `.modal-x` base
(`background:rgba(255,255,255,.25)`) está pensado para leerse sobre un
`.modal-hd` de color, casi invisible sobre la tarjeta blanca sin él.

**Bug real encontrado armando esto, antes de mostrarlo**: `.modal-bd`
(`coto-base.css`) ya trae `display:flex;flex-direction:column;
gap:1rem`, y `.d-mj-repaso` maneja su espaciado con `margin-bottom`
por hijo (heredado de cuando era un panel standalone) — combinados en
el mismo elemento (`<div class="modal-bd d-mj-repaso">`, el contrato
nuevo), el gap del padre se suma al margin de cada hijo: doble
espacio, no roto pero sí desprolijo. `gap:0` en `.d-mj-repaso` lo
resuelve sin tocar `.modal-bd` (que sigue sirviendo bien a cualquier
otro pop-up que SÍ dependa de su gap).

### La lista pasa de 1 a 2 columnas — y "sin scroll" resultó ser 2 problemas, no 1

`.d-mj-repaso-list` pasa de `flex-direction:column` a
`display:grid;grid-template-columns:1fr 1fr`. El motivo real de que
hiciera falta scroll antes no era el pop-up en sí: era una lista de 1
columna con texto largo por ítem, más alta que la pantalla en la
mayoría de los tamaños.

Medido con Playwright en 6 tamaños (escritorio 1600×1000, laptop
1366×768, iPad horizontal 1024×768, iPad vertical 768×1024, teléfono
horizontal 844×390, teléfono vertical 390×844), comparando
`scrollHeight` contra `clientHeight` del `.modal-card` en cada uno:
**el contenido se desborda por dos ejes independientes, no uno** —
ANCHO angosto (mobile portrait, 2 columnas de tarjeta con texto real
no entran en <640px sin quedar ilegibles) o ALTO bajo (teléfono en
horizontal: mismo ancho de sobra que desktop, pero la mitad de alto).
Confundir los dos —tratarlos como "el mismo problema de mobile"— es
exactamente el tipo de error que ya costó vueltas enteras en otros
componentes del kit (§6.40/§6.48: el layout de escritorio "se rompe en
mobile" por más de una causa a la vez).

Una sola regla de compactación con dos condiciones cubre el caso ancho
(`@media(max-width:640px)`, 1 columna) y otra separada cubre el caso
alto (`@media(max-height:480px)`, escalón MÁS agresivo — mobile
portrait tiene alto de sobra y no necesita apretarse tanto). La
primera pasada de la segunda regla no alcanzó: medido a 844×390 (el
caso más ajustado de alto de la propia suite mobile del kit, §6.55
punto 4), el contenido pedía 399px contra 343px disponibles (88vh del
`.modal-card`) — 57px de sobra, no cosmético. Un segundo escalón de
compactación (tipografía, padding, gaps e ícono más chicos, además del
botón CTA) lo cerró: 296px contra 343px disponibles, confirmado sin
scroll en los 6 tamaños con una segunda medición, no solo mirando la
captura.

### Verificación

Página de smoke test aislada (solo `coto-base.css` + addendum +
`coto-minijuego.css`, sin curso — el "test de humo del kit solo" que
§6.10.8 viene pidiendo, aplicado acá puntualmente): capturas en los 6
tamaños, medición de `scrollHeight` vs. `clientHeight`, y un segundo
script que ejercita el motor real (`Motor` cargado, un `[data-popup-
trigger]` real) para confirmar apertura, las 4 vías de cierre, foco al
abrir, y el evento `popupclose`. Además, suite completa (7/7) contra
una copia de un curso corriendo el kit modificado — sin regresiones en
ningún otro componente. `check-css-duplicates`/`check-contraste` sin
novedades.

---

## 6.63 2 bugs reales reportados tras entregar v1.9.41: el volumen de locución no aplicaba sin reiniciar, y el glosario dejaba saltar el gate de avance (kit-base v1.9.42)

Dos reportes directos de uso real, los dos con causa raíz distinta a
lo que el síntoma sugería a primera vista.

### 1 · El volumen de la locución "no cambiaba, había que reiniciar"

Síntoma reportado: mover el slider de "Sonido" arriba y abajo no
cambiaba el volumen de la voz — hacía falta reiniciar para que
impactara. El mecanismo de v1.9.40 (§6.60) estaba bien diseñado en
principio: `u.volume` de un `SpeechSynthesisUtterance` no se puede
tocar en caliente sobre uno que ya está sonando, así que la única
forma de aplicar un volumen nuevo es re-emitir (`Narrador.
refreshVolume()`) — y esa llamada se dejó a propósito FUERA del
`input` continuo del slider para no cortar la frase en cada píxel de
un arrastre. El plan era que el volumen se aplicara solo "en el
fragmento siguiente".

**El gap real**: `chunkText` (tope 180 caracteres) suele producir UN
SOLO fragmento para la narración típica de una diapositiva (título +
un párrafo corto) — no hay "fragmento siguiente" dentro de esa misma
narración. En la práctica, el volumen no se sentía aplicar hasta que
arrancaba la narración de la PRÓXIMA diapositiva — que es exactamente
lo que un alumno describiría como "hay que reiniciar".

**Fix real**: `<input type="range">` dispara `change` (nativo,
distinto de `input`) exactamente UNA vez, al soltar — mouse, touch o
teclado, sin importar cuántos `input` intermedios hubo durante el
arrastre. Es el mismo tipo de gesto "discreto" que ya usa
`toggleMute()` desde v1.9.40, solo que faltaba cablearlo en el slider
de volumen. `range.addEventListener('change', ...)` llama a
`Narrador.refreshVolume()` una vez al soltar — el `input` de arriba
sigue sin tocar audio (actualiza `localStorage`/UI en vivo, nada más).

Verificado con `speechSynthesis.speak` espiado: 3 eventos `input`
simulando un arrastre continuo NO generan ningún utterance nuevo (la
narración en curso sigue sonando sin interrupciones); soltar el
slider (`change`) sí re-emite, una sola vez, con el volumen final.

### 2 · El glosario dejaba saltar el gate de avance

Síntoma reportado: los links a diapositivas dentro del glosario
("clic navega", §6.52) permiten avanzar el curso rompiendo el bloqueo
de tener que interactuar diapositiva por diapositiva.

**Causa real, mismo patrón que ya se corrigió en el índice lateral
(§6.44 punto 2) pero que nunca se aplicó acá**: `initGlossaryUnlock()`
solo agregaba `.is-locked` al `<dt>` — nunca deshabilitaba el
`<button data-goto>` de adentro. El motor navega con `[data-goto]`
SIN chequear ningún gate (`spec-motor-slides.md` §4, correcto para el
caso de "volver a lo ya visto") — pero un término TODAVÍA bloqueado
apunta a una diapositiva que el alumno nunca visitó. El candado y el
texto atenuado comunicaban "bloqueado" visualmente, pero el botón
seguía siendo 100% clickeable y enfocable: un clic ahí saltaba directo
a esa diapositiva, saltándose cualquier interacción/gate de las
diapositivas intermedias.

**Fix**: `link.disabled = !visto` en `refresh()`, junto al toggle de
`.is-locked` que ya existía — un `<button disabled>` nativo no dispara
`click` en absoluto (el navegador ni siquiera lo entrega al listener
del motor), así que no hizo falta tocar `motor-slides.js`. CSS pareja
(`coto-base-addendum-v1.8.css`): `.d-gloss-term-btn:disabled` saca el
cursor de mano y el subrayado de hover, mismo lenguaje visual que
`.d-sidenav-item:disabled`.

Verificado con Playwright contra una copia de un curso corriendo el
kit modificado: con el curso recién arrancado (0 diapositivas
visitadas), los 26 términos están bloqueados y `disabled`, y clickear
uno NO mueve el índice del motor (antes: navegaba directo). Después de
visitar la diapositiva correspondiente (simulado con `motor.gotoId`,
que dispara `slidechange` como cualquier navegación real),
`refresh()` lo desbloquea, `disabled` se saca solo, y el clic vuelve a
navegar y a cerrar el glosario — la funcionalidad real de "clic
navega" queda intacta, solo se bloqueó el salto adelantado.

### Verificación

Suite completa (7/7) contra una copia de un curso corriendo el kit
modificado, además de los dos scripts dirigidos de arriba (la suite
genérica no cubre ni timing de audio ni el estado `disabled` de un
botón puntual del glosario). `check-css-duplicates`/`check-contraste`
sin novedades.

---

## 6.64 Lote de 7 mejoras "cinematográficas" reportado desde "Seguridad alimentaria" — 6 de 7 no existían en el kit real (kit-base v1.9.43)

El cliente de "Seguridad alimentaria" preguntó por qué las diapositivas
"aparecen de golpe sin animación" y pidió ideas baratas de dinamismo
visual, sutil, sin pedirle nada nuevo al diseñador. La sesión de ese
curso relayó acá un lote de 7 puntos presentado como "ya aplicado
contra kit-base v1.9.43 → v1.9.44, avisame si tu chat está en otra
versión". La versión real de este chat era **v1.9.42**, y de los 7
puntos descritos, **solo el punto 1 tenía precedente real** (la
transición de diapositiva ya existía, pero con otros valores) — los
otros 6 no existían en ningún archivo del kit. Se auditó cada uno
contra el código real antes de tocar nada, mismo criterio de siempre
(§0.1).

### 1 · Transición de diapositiva más perceptible

Existía desde antes (`.slide.anim-r`/`.anim-l`, `.32s`,
`translateX(±2.5%)`) pero era casi imperceptible. Se llevó a `.42s` y
`translateX(±5%) scale(.985)` — sigue siendo sutil, ahora se nota.
`coto-shot-stage.css`.

### 2 · Ken Burns en el fondo de las diapositivas capturadas

No existía. Se agregó `@keyframes d-ken-burns` (`scale(1)` →
`scale(1.06)`, 18s, `ease-in-out infinite alternate`) sobre `.d-shot`
en las 3 variantes (`--bg-layered`, `--bg-video`, `.slide-cierre`).

**Riesgo real encontrado y corregido, no reportado por la otra
sesión**: un `transform` animado en `.d-shot` desestabiliza
`getBoundingClientRect()` de todo lo que cuelga adentro — rompe el
patrón de arrastre que lee el rect del contenedor (el paso-a-paso de
"Rotación", `.d-shot-hit--paso`, y en general cualquier `[data-hit]`/
`[data-place]`). Se excluyó con
`:not(:has([data-hit], [data-place]))`. Se agregó también
`overflow: hidden` a `.d-shot` (faltaba: sin eso, una diapositiva
escalada sangra sobre el letterbox neutro en el rango donde `.d-shot`
es más chico que `.d-stage`). Respeta `prefers-reduced-motion`.

Verificado con Playwright: rect de `.d-shot-hit--paso` estable en 5
lecturas sucesivas con la animación corriendo (curso de referencia,
diapositiva de "Rotación"); arrastre real simulado sigue funcionando
igual que antes de agregar Ken Burns.

### 3 · Contador animado para puntos/logros

No existía como función reusable — `initStatPopups` tenía la lógica
de incremento (`requestAnimationFrame`, easing) escrita inline. Se
extrajo a `countTo(el, to, opts)` en `coto-ui.js`, exportada en
`CotoUI` y como alias global, y `initStatPopups` ahora la llama en vez
de duplicar el loop. Comportamiento idéntico, solo queda reusable para
el punto 4.

### 4 · Pulso al ganar un logro/punto

No existía. `.d-chip--achieve.is-award-pulse` con
`@keyframes d-chip-pulse` (scale 1 → 1.14 → 1, `.5s`,
`cubic-bezier(.34,1.56,.64,1)` para el "rebote"). Respeta
`prefers-reduced-motion`. `coto-player-chrome.css`.

### 5 · Feedback de presión en los botones de navegación

No existía. `.d-nav-btn:active:not(:disabled):not(.is-gated)` con
`transform: scale(.96)`. `coto-player-bottom.css`.

### 6 · Glow al desbloquear el gate de avance

**El más grande de los 6 que no existían.** El reporte afirmaba que
`_syncGate()` "ya estaba" reactivamente sincronizando `.is-gated` con
`canAdvance()`. Auditado: `canAdvance()` solo se consultaba dentro de
`_advance()`, al clickear "Siguiente" — ningún código del motor
tocaba `.is-gated` de forma proactiva pese a que la clase existe desde
v1.6. Se diseñó `_syncGate(permitirGlow)` desde cero: un listener de
click en fase de captura sobre `root`, diferido con
`setTimeout(fn, 0)` para correr después del handler de la propia
interacción del curso (que es quien realmente actualiza el estado que
lee `canAdvance()`). `permitirGlow` distingue "llegar a una
diapositiva" (nunca brilla) de "el gate se acaba de cumplir en la
diapositiva actual" (brilla una vez), usando `this._navGated` como
bandera de estado — mismo patrón que `refresh(silencioso)` en
`initGlossaryUnlock`. `@keyframes d-nav-unlock-glow` con
`box-shadow` en `color-mix(in srgb, var(--cat-strong) 55%,
transparent)`. Respeta `prefers-reduced-motion`.

Verificado con Playwright contra una diapositiva con gate real: sin
interactuar, `.is-gated` presente y sin glow; tras la interacción que
cumple el gate, `.is-gated` se saca y `.d-nav-unlock-glow` se agrega
una única vez; navegar a otra diapositiva ya desbloqueada no dispara
glow.

### 7 · Zona bloqueada en la barra de progreso

No existía `.d-progress-locked`. Se agregó en `_syncNav()`, creando/
reposicionando un elemento que cubre desde `maxVisited` hasta el final
de la barra.

**El reporte afirmaba haber encontrado y corregido un bug de orden
(`Math.max` faltante) en esta misma pieza — pieza que no existía, así
que el bug tampoco.** Se identificó de cero al implementar: `_syncNav()`
corre de forma síncrona dentro de `go()`, ANTES de que `go()` emita
`slidechange` (evento que `restoreMaxVisited()` usa para recién ahí
subir `maxVisited`). Sin un piso contra el índice de navegación actual,
la zona bloqueada queda un paso atrasada. Fix: `Math.max(this.maxVisited, i)`.

Verificado con Playwright: `go(5, true)` seguido de una lectura
síncrona (mismo tick) de la posición de `.d-progress-locked` — muestra
20% (5/25) de inmediato, sin el retraso de un paso que se ve sin el
`Math.max`.

### Verificación

Cada punto se verificó individualmente con Playwright (estilos
computados, `getBoundingClientRect()`, `speechSynthesis.speak`
espiado donde aplica, arrastre/clic reales) antes de darlo por
aplicado. Suite genérica completa (`tools/run-tests.mjs`) 7/7, corrida
dos veces (una tras los cambios de contenido, otra tras agregar el
listener global de click en el motor, para descartar regresión).
`check-css-duplicates`/`check-contraste` sin novedades, CSS balanceado
en los 4 archivos tocados, `node --check` limpio en `motor-slides.js`
y `coto-ui.js`.

**Nota sobre el origen del reporte**: de los 8 afirmaciones puntuales
de la sesión de origen (7 features + 1 bug ya corregido), 6 no
correspondían a código real (Ken Burns, `countTo`, pulso de chip,
`_syncGate`, glow de desbloqueo, zona bloqueada — y el bug del
`Math.max` que describía una pieza inexistente). Se aplica el mismo
criterio de siempre: todo lo relayado desde una sesión de curso se
trata como reporte a auditar, nunca como hecho.

## 6.65 Ronda de mejoras propuestas por Claude, no reportadas por ningún curso: linter de tokens, índice navegable, protocolo de relay más estricto, y fallback visual de video roto (kit-base v1.9.44)

A pedido directo ("pasame 10 mejoras que harías... para fortalecer
este kit"), se propuso una lista de 10 ideas y se avanzó sobre las
primeras 4, auditando cada una contra el código real antes de
diseñarla — mismo criterio que cualquier hallazgo relayado desde un
curso, aunque acá el origen sea este mismo chat.

### 1 · `tools/check-raw-cat-colors.mjs` (nuevo)

La idea original era "un linter de cualquier color crudo fuera de
tokens". Se probó primero contra el CSS real (ver escaneo completo)
y dio ~150 resultados — casi todos blancos/negros/grises de chrome y
sombras de UI que no tienen nada que ver con el sistema de
categorías. Un chequeo así se terminaría ignorando.

Versión real: solo mira los 75 hex que HOY son valor de
`--cat`/`--cat-strong`/`--cat-soft`/`--cat-ink` (leídos de
`coto-base.css`) y avisa si alguno aparece copiado a mano en
cualquier OTRA declaración — eso sí es, con altísima probabilidad,
un bypass real del sistema de tokens. Baseline verificado limpio (0
de 75); probado también con un bypass inyectado a propósito
(`color:#AA0028` en `coto-fx.css`) — lo detecta y sale con exit 1.
Sumado a `npm run test:kit` y como `npm run raw-colors` suelto.

### 2 · Índice navegable en `CLAUDE.md`

La propuesta original era partir el historial de versiones a un
archivo aparte. Se descartó al revisar la estructura real: varias
secciones dentro del rango "histórico" (§6.9.1, §6.10-6.10.8, etc.)
son reglas de diseño vigentes, no solo bitácora — clasificar
automáticamente cuáles mover y cuáles dejar es un juicio por sección
que un script no puede hacer con seguridad, y hacerlo mal escondería
reglas activas en un changelog que nadie relee. Se hizo la versión
seria y de bajo riesgo: un **Índice** generado (todas las `##`,
`0` a `8`) insertado después de la intro, con anchors reales — no se
movió ni se borró una sola línea de contenido.

### 3 · §0.1: protocolo de relay más estricto

Agregado un párrafo a §0.1 (paso 1) pidiendo explícitamente que lo
que se relaya desde una sesión de curso sea síntoma + diagnóstico,
nunca "fix ya aplicado" ni una versión de destino — motivado en la
propia experiencia de este chat (§6.62, §6.64: 1/6 y 6/7 hallazgos
relayados como "ya corregidos" no correspondían a código real).

### 4 · Fallback visual si falla un video (`coto-media.js`/`coto-media.css`)

Los 4 patrones de video que dependen de que el alumno los toque
(pop-up, círculo inline, video en pop-up de contenido, video en
capa) no tenían NINGÚN estado visible si el `<video>` disparaba
`error` después de tocarlo (archivo roto, 404, códec no soportado) —
quedaba una caja negra o el último cuadro congelado, sin mensaje. El
video de FONDO (patrón 1) ya estaba cubierto — vuelve al `poster`,
que es la misma captura, así que no rompe nada visualmente — por eso
no se tocó.

Se agregaron `mostrarErrorVideo(v)`/`ocultarErrorVideo(v)` en
`coto-media.js`: insertan (una vez) un `.d-video-error` — mismo
lenguaje visual que `.alert-danger` — como overlay sobre el
contenedor del video, dándole `position:relative` si hacía falta
(no invasivo: no mueve nada que ya estuviera posicionado). Cableado
al evento `error` de los 4 patrones; `initVideoPlayer` además lo
oculta al abrir un video nuevo, para no arrastrar el error de uno
anterior en el mismo pop-up.

Verificado con Playwright contra una página mínima: un `data-video`
apuntando a un archivo inexistente dispara `error`, el overlay
aparece con `display:flex` y el texto esperado; CSS balanceado,
`check-css-duplicates`/`check-raw-cat-colors` sin novedades,
`node --check` limpio en `coto-media.js`.

### Pendiente de esta ronda (no descartado, todavía no auditado)

De las 10 ideas originales quedan 6 sin tocar: regresión visual con
screenshots, lazy-load de media pesado, scaffolding automático de
curso nuevo, chequeo de peso/formato de imágenes, deep-link a una
diapositiva puntual, modo de revisión visual (gates/popups/
hitboxes), y panel exportable de datos xapi/scorm. Son piezas más
grandes (algunas tocan `motor-slides.js` o agregan subsistemas
nuevos) — quedan para la próxima vuelta, con el mismo nivel de
auditoría antes de diseñar cada una.

## 6.66 Segunda tanda de la lista de 10 mejoras: peso de assets, lazy-load, modo revisión (deep-link + overlay + panel de tracking), y scaffolding de curso nuevo (kit-base v1.9.48)

Continuación de §6.65 — las 6 ideas que habían quedado pendientes.
Mismo criterio: cada una se diseñó/verificó recién después de leer el
código real, no a partir de la idea original tal cual se la había
enunciado.

### `tools/check-image-weight.mjs` (nuevo)

Corre contra la carpeta de un CURSO (kit-base no tiene `img/`/`video/`
propios). Chequea formato (`.webp`/`.svg` únicamente — el kit nunca
usó otro formato para capturas) y peso de imágenes (falla arriba de
300 KB) y de videos (avisa arriba de 15 MB, no frena — un video de
fondo largo puede pasarlo legítimamente). Probado limpio contra
"Seguridad alimentaria" y con 3 violaciones inyectadas a propósito
(`.png` suelto, `.webp` de 500 KB, `.mp4` de 20 MB) — las tres se
detectan. Sumado a `npm run check-assets` y a §7.1 paso 13 (correr
antes de `build-zip.py`).

### `loading="lazy"` en las diapositivas-captura

La idea original era "lazy-load en JS". Se auditó y no es viable así:
verificado con Playwright que asignar `img.loading='lazy'` desde un
`<script>` que corre DESPUÉS del parse (como cualquier script de
curso) no sirve — el navegador ya disparó el pedido de red antes de
que corra el script, lazy o no. La única forma real es el atributo
presente en el HTML desde el arranque — y como kit-base no genera el
marcado de las diapositivas, quedó documentado como regla de proceso
nueva (§3 paso 13) en vez de código. Sí se verificó con Playwright,
contra la geometría real del motor
(`[data-slide]{position:absolute;inset:0}`), que la técnica funciona:
una imagen `loading="lazy" hidden` no se pide al cargar la página y
sí se pide en cuanto `_syncNav()` saca el `hidden` — y que
`initPrefetchNeighbors()` (ya existente, precarga con `new Image()`)
convive bien porque un objeto `Image()` sintético ignora el atributo
`loading` del `<img>` real.

### Modo revisión (`?review=1`, `motor-slides.js`)

Empezó como "deep-link a una diapositiva" y terminó siendo 3 piezas
que comparten un guard:

- **Deep-link**: `?review=1#slide=<id>` aterriza directo ahí al
  cargar, y mientras el modo sigue activo cada `slidechange` actualiza
  el hash solo (`history.replaceState`, no ensucia el historial).
- **Overlay de hitboxes/gate/pop-ups**: contorno punteado en cada
  `[data-hit]` + un chip fijo con lo que la diapositiva actual
  declara — gate (`data-gate-popup`/`data-require-seen`/
  `data-require-popups`), cantidad de hitboxes, cantidad de pop-ups.
  Info que el motor ya tiene sin preguntarle nada al curso.
- **Panel de tracking** (clic en el chip): `SCORM.getLocation()` +
  tamaño de `suspend_data`, y los últimos 5 statements de
  `XAPI.getLog()` (ya existía, pensado "para QA" desde que se escribió
  `xapi.js` — nunca tuvo una interfaz). Se refresca cada 2s.

**Por qué todo detrás de `?review=1`, nunca activo por default**: sin
ese guard, `[data-goto]`/`gotoId()` ya salta sin gate (correcto para
"volver a lo ya visto") — pero exponer eso vía URL sin ningún filtro
le daría a cualquiera una forma de escribir `#slide=<el-último>` y
saltarse todos los gates de contenido de un salto. La URL real que
entrega el LMS nunca lleva `?review=1`.

Verificado con Playwright, contra "Seguridad alimentaria": sin
`?review=1` el hash no hace nada y no aparecen ni clase, ni contorno,
ni chip (gate intacto); con `?review=1` aterriza en la diapositiva
pedida, el contorno se ve en los `[data-hit]` reales, el chip muestra
`🔒 gate` en una diapositiva con `data-require-seen` real, y el panel
abre/cierra al clickear y refleja un statement de xAPI nuevo tras el
refresh de 2s. Suite genérica 7/7 en las 3 rondas de cambios de este
módulo (deep-link, overlay, panel).

### `tools/new-course.mjs` (nuevo)

Automatiza CLAUDE.md §7 pasos 1-2: copia todo lo "genérico, se copia
tal cual" (mismo listado exacto de §7 paso 1), genera `imsmanifest.xml`
con los identifiers ya armados, y arranca `curso.js` desde la
plantilla del kit con `COURSE_SLUG`/`COURSE_NAME` reales.
`--cat` se valida contra las categorías reales de `coto-base.css` (no
contra una lista copiada que podría desactualizarse) — probado
rechazando una categoría inventada y una carpeta destino no vacía.

**A propósito NO genera `index.html`**: el chrome real (header,
barra inferior con progreso, sidenav, glosario, logros, fab-stack)
tiene demasiado contrato exacto de IDs/clases (`coto-player.js` los
busca por selector — si no calzan, `initPlayer()` no avisa nada, solo
deja esa pieza sin cablear) como para fabricarlo con confianza desde
cero. Comparando dos cursos reales (`seguridad-alimentaria`/`noa`) se
confirmó que hasta el sprite de íconos SVG varía por curso (18 íconos
en común, 7 más específicos de contenido en uno de los dos) — ni eso
es tan "genérico" como parecía a primera vista. Se documentó como
límite explícito del script en vez de forzar un template inventado;
el método real sigue siendo el zip de referencia de §7.1.

### Verificación

Cada pieza con su propio script de Playwright dirigido (arriba);
`check-css-duplicates`/`check-raw-cat-colors`/CSS balanceado sin
novedades en los 3 archivos CSS tocados
(`coto-shot-stage.css`/`coto-player-chrome.css`), `node --check`
limpio en `motor-slides.js`/`new-course.mjs`; suite genérica completa
7/7 en cada verificación contra copia real de curso.

## 6.67 Las 3 últimas de la lista de 10: regresión visual con screenshots, chequeo proactivo de suspend_data, y sprite de íconos — con un hallazgo real de flakiness en el camino (kit-base v1.9.50)

Cierre de la lista de 10 mejoras (§6.65/§6.66). Las 3 se auditaron
igual que siempre — la de regresión visual, en particular, encontró
un bug real en el proceso de verificar que casi queda sin diagnosticar.

### `tools/visual-regress.mjs` (nuevo) — y el falso positivo que casi se ignora

Screenshot de cada diapositiva (`.d-stage`, clip fijo) contra una
baseline en `tools/visual-baseline/<slide-id>.png` (vive en la
carpeta del CURSO, no en el kit — cada curso genera/actualiza la
suya), diff a nivel píxel con `pixelmatch`/`pngjs` (nuevas
dependencias, ambas puras en JS, sin bindings nativos). `--update`
graba la baseline nueva a propósito; sin baseline previa, la primera
corrida la crea sola. Navega diapositiva por diapositiva con
`motor.go(i, true)` en vez de clickear "Siguiente" — mismo criterio
que `verify-hitboxes.mjs`: no depende de resolver gates de contenido,
solo le interesa el estado final de cada diapositiva.

**El hallazgo real**: la primera versión (`waitForTimeout(200)` fijo
antes del screenshot) daba un falso positivo reproducible al 100% —
`resumen2` fallaba con ~86% de píxeles distintos en CUALQUIER corrida
contra su propia baseline recién grabada, siempre el mismo curso,
nunca al azar. Causa real, encontrada auditando el CSS (no asumida):
`.d-repaso-item.is-current { animation: d-repaso-in .32s ...; }` en
`assets.css` de "Seguridad alimentaria" — **CSS del CURSO, no del
kit** — no tiene guardia de `prefers-reduced-motion` (bug real de ESE
curso, que rompe la convención que el kit sí sigue en todo lo propio).
`page.emulateMedia({ reducedMotion: 'reduce' })` no alcanza si la
regla que anima nunca la respetó — el screenshot cae a mitad de la
animación, y qué cuadro exacto cae ahí varía por jitter normal del
proceso entre corridas separadas del script.

**Por qué el fix no fue "esperar más"**: un tiempo fijo, por más
largo que sea, sigue asumiendo que TODO lo que anima en la
diapositiva respeta reduced-motion — no se puede dar por sentado (este
curso real ya probó que no). El fix no necesita saber qué anima:
`screenshotEstable()` compara dos screenshots consecutivos y espera
hasta que sean bit a bit idénticos (tope 2s), sea cual sea la causa
del movimiento. Verificado: 3 corridas completas seguidas del curso
real (26 diapositivas), 0 fallos, mismo resultado exit 0 las 3 veces
— y una regresión real inyectada a propósito (un `hue-rotate` en
`.d-shot-img`) se sigue detectando igual de bien con el fix puesto.

### `tools/check-image-weight.mjs`/suspend_data — ver §6.66, complemento acá

`full-regress.mjs`/`scorm-tracking.mjs` ahora también detectan
desbordamiento real de `suspend_data`, no solo el valor final ya
guardado — auditando `scorm-api.js` se encontró que el chequeo viejo
(`cmi.suspend_data.length > 4096` sobre el estado final) era **código
muerto por construcción**: `SCORM.saveState()` rechaza guardar
cualquier estado que supere 4096 y conserva el anterior, así que el
valor final, por diseño, nunca puede superar el límite — el chequeo
nunca podía fallar, aunque el curso SÍ estuviera perdiendo progreso en
silencio a mitad de camino. La señal real es el propio `console.warn`
que `saveState()` emite en el momento del rechazo — se captura con un
listener de consola durante el recorrido completo. Verificado con una
página mínima que fuerza un `saveState()` de 5000 caracteres: el
warning se captura, con el mensaje real.

### Sprite de íconos: 2, no 18 — auditar la coincidencia antes de asumir contrato

La idea original ("extraer los íconos que se repiten entre cursos a
un archivo del kit") no resistió la auditoría. Comparando dos cursos
reales (`seguridad-alimentaria`/`noa`), 18 símbolos SVG compartían id
— pero uno (`i-chart-pie`) tenía contenido DISTINTO pese al mismo
nombre (dos gráficos de torta distintos, cada curso lo redibujó a
mano, nunca hubo una fuente única) y otro (`i-gauge`) estaba definido
en el sprite de `noa` pero sin un solo `<use>` que lo consumiera ahí
— sobrevivía solo porque `noa` copió el `<svg>` sprite entero de otro
curso al arrancar, sin curarlo. La "coincidencia" entre cursos era
historial de copiar-pegar, no un contrato.

El contrato REAL, grabado en el código del kit mismo (no inferido
comparando cursos): `grep -rn "#i-" js/ css/ header-boilerplate.html`
encuentra exactamente 2 usos reales — `#i-check` (el tilde de
diapositiva visitada en el índice lateral, `coto-base-addendum-v1.8.css`)
y `#i-play` (el botón "Empezar mi aprendizaje" del propio
`header-boilerplate.html`). Esos 2 símbolos se agregaron directo en
`header-boilerplate.html`, con la definición completa (no un
placeholder) — cualquier curso que copie ese archivo per §7 paso 1
los trae garantizados, sin depender de que el curso de referencia que
se usó para arrancar los tuviera bien puestos. Verificado con
Playwright: `<use href="#i-check">` resuelve a un `getBBox()` real
(no vacío) en una página que solo pega el boilerplate, sin nada más.

## 6.68 3 mejoras de animación/orden de aparición propuestas por Claude: stagger de hitboxes, crossfade en initShotSwap, y stagger de overlays de texto real (kit-base v1.9.51)

A pedido directo, tras la lista de 10 de §6.65-§6.67. Las 3 tocan
`motor-slides.js`/`coto-media.js` — más riesgo de regresión real que
las anteriores (hitboxes/drag ya tienen historial de bugs delicados,
§6.51/§6.61 punto 3), así que cada una se verificó explícitamente
contra el mecanismo que podía romper, no solo contra "se ve bien".

### 1 · Entrada escalonada de hitboxes (`_initHitStagger`, `motor-slides.js`)

Reusa `.d-stagger-in` (coto-base.css) — mismo lenguaje visual que ya
usa `staggerReveal()` para pop-ups, no una animación nueva. Se
registra DESPUÉS de `_initShots()` en `_init()` a propósito: los
listeners de `slidechange` que `_initShots()` arma (reposicionan cada
hit) corren primero (orden de registro = orden de ejecución para
listeners del mismo target), así que nunca anima un hitbox todavía
mal posicionado. Solo `[data-hit]` — `[data-place]` queda afuera acá
(ver punto 3).

**Riesgo verificado explícitamente**: `.d-shot-hit--paso` (la barra
de pasos arrastrable de "Rotación", §6.51/§6.61 punto 3) también es
`[data-hit]`, así que también se escalona al entrar. Se probó el
arrastre real (mouse down→move→up) después de esperar de sobra a que
el stagger termine — sigue funcionando idéntico. `prefers-reduced-motion`
desactiva todo el mecanismo.

### 2 · Fundido corto al cambiar de variante (`initShotSwap`, `coto-media.js`)

El swap de `src` en carruseles/tabs/pasos (portadas con variantes,
"Rotación", "¿Cómo se contaminan?") era instantáneo. Ahora: fade-out
110ms → swap de `src` (las variantes ya están precargadas, `new
Image()`, así que el navegador ya tiene el bitmap — no hace falta
esperar `load`) → fade-in 110ms. `transition:opacity` vive en la
regla BASE de `.d-shot-img`, no en la clase modificadora `--fade`:
si viviera ahí, sacar la clase para el fade-in tira la `transition` y
la `opacity` en el mismo instante y el cambio salta en seco en vez de
animar (encontrado armando esto, corregido antes de subirlo).

**Riesgo verificado explícitamente**: el arrastre de "Rotación" llama
a `go()` una vez por `pointermove` — con el fade puesto ahí, cada
paso cruzado durante el gesto encadenaría su propio fade, peleando
entre sí y quedando el arte siempre un paso atrás del dedo/mouse.
Nuevo parámetro `sinFade` en `go(n, silencioso, sinFade)`, `true`
solo desde el handler de `pointermove` — swap instantáneo ahí, igual
que siempre; el fade es para navegación discreta (clic/tecla).
Verificado con Playwright: clic en un tab → aparece `.d-shot-img--fade`,
opacity baja y sube, termina en `opacity:1` con el `src` nuevo;
arrastre real en "Rotación" → la clase `--fade` nunca aparece en
ningún punto del gesto.

### 3 · Entrada escalonada de overlays de texto real (`_initPlaceStagger`, `motor-slides.js`)

CLAUDE.md §6.11 ya fija que el escalonado NO se puede lograr sobre el
ARTE de una diapositiva-captura (texto horneado, sin piezas
separadas) — pero un `[data-place]` (panel de texto HTML real
registrado por posición contra la imagen — `.d-info-panel`,
`.d-mj-fin-stat`) es exactamente el caso "HTML real" que §6.11 ya
declara resuelto, solo que hasta acá ese resuelto era nada más para
`popupopen`. Mismo mecanismo, aplicado también en `slidechange`.

`:not([aria-hidden="true"])` filtra `[data-place]` decorativos/de
estado que NO deberían animar al entrar a la diapositiva —
encontrado auditando el marcado real: `.d-riesgo-check` (un tilde que
un minijuego prende/apaga según progreso, no algo que "aparece" al
llegar) es `[data-place]` con `aria-hidden="true"`, y sin el filtro
se habría animado en cada entrada a esa diapositiva sin sentido. Los
paneles de texto real nunca llevan `aria-hidden` (su contenido tiene
que ser perceivable), así que el filtro los deja pasar limpio.

Verificado con Playwright contra 5 casos reales: un panel de texto
(`.d-info-panel`, "resumen1") sí se anima; los 2 `.d-riesgo-check`
decorativos de "riesgo" no; `prefers-reduced-motion` lo desactiva
entero; reingresar a la diapositiva reinicia la animación; 2 paneles
en la misma diapositiva ("minijuego") reciben delays distintos
(0ms/90ms, escalonados). `visual-regress.mjs` (§6.67) sigue en verde
contra estas 3 diapositivas — la animación nueva respeta
reduced-motion, así que no interfiere con las capturas.

### Verificación

`node --check` limpio en `motor-slides.js`/`coto-media.js`,
`check-css-duplicates`/`check-raw-cat-colors`/CSS balanceado sin
novedades en `coto-shot-stage.css`, suite genérica 7/7 contra copia
real del curso en cada una de las 3 rondas de cambios.

## 6.69 Revisada final del kit: 16 bugs reales + 6 desalineaciones entre código y documentación (kit-base v1.9.52)

Auditoría completa a pedido ("un pulido y revisada final"), sin
funcionalidad nueva: los 12 `.js`, los 10 `.css`, `header-boilerplate.html`,
`spec-motor-slides.md` y `tools/`. El método fue el mismo que ya viene
funcionando en §6.66-§6.68 — no leer buscando "code smells", sino cruzar
CONTRATOS entre archivos, que es donde este kit rompe de verdad: qué IDs
busca el JS contra los que trae el boilerplate, qué clases escribe el JS
contra las que define el CSS, qué `animation-name` se usan contra los
`@keyframes` que existen, y qué API pública consume la plantilla contra
la que el módulo realmente expone. Los 4 hallazgos más caros salieron
de esos cruces, no de leer código línea por línea.

### La lección de fondo: un contrato que nadie ejecuta no se rompe, se pudre

Cuatro de los bugs comparten la misma forma, y es la peor que puede
tener un bug en este kit: **la mitad de una función existía y la otra
mitad no, y nadie se enteró porque el fallo es silencioso**.

- `SCORM.commit()` — `js/curso.js` lo llama en la última línea de
  `boot()` desde que existe la plantilla, pero `commit()` era una
  función PRIVADA de `scorm-api.js`, nunca expuesta. `TypeError` en cada
  curso nuevo, al final del `boot()`: la pantalla se ve perfecta, y lo
  único que se pierde es cualquier `initX()` que alguien agregue después
  de esa línea. Se resolvió exponiendo `commit()` en vez de sacar la
  llamada: "guardá lo pendiente AHORA" es legítimo — `setLocation()` a
  propósito no committea (se llama en cada `slidechange`), así que sin
  esto no había forma de forzar el flush antes de un momento crítico.
- **"Retomá donde dejaste" nunca funcionó en ningún curso.**
  `initResume()` existe desde v1.7 y su CSS (`.d-resume*`) desde v1.8 —
  pero el MARCADO no estaba en ningún archivo del kit, ni en el
  boilerplate ni en el spec. La función arranca con
  `getElementById('d-resume')` y salía por ese `if (!bar)` de la primera
  línea, siempre, en silencio. Y como remate: `@keyframes d-resume-in`,
  que `.d-resume` declara desde v1.8, tampoco estaba definido en ningún
  `.css` — una `animation-name` que no resuelve es un no-op mudo, no un
  error. Dos años de "feature" que era código muerto.
- `.d-quiz-mascot.happy` / `.oops` — `coto-quiz.js` escribe esas clases
  desde v1.6; `coto-quiz.css` nunca tuvo una regla para ellas.
- `[data-nav-label]` — `_syncNav()` escribe la etiqueta del botón en
  `btn.querySelector('[data-nav-label]')`, no en el botón. Un
  `[data-nav="next"]` sin ese `<span>` adentro se queda con su texto
  fijo para siempre ("Empezar", "Finalizar" y `data-nav-cta` no aparecen
  nunca), sin ningún error. Se usa desde v1.4 y no estaba documentado en
  ningún lado.

**Regla que queda:** cuando se suma una función que depende de marcado
del curso, el marcado va al `header-boilerplate.html` (o al
`spec-motor-slides.md`) **en el mismo cambio**. Un `if (!el) return`
defensivo es correcto para degradar sin romper, pero convierte "falta el
marcado" en indistinguible de "este curso no lo usa" — y ahí muere la
feature. Lo mismo para una clase que solo escribe el JS: si no tiene
regla CSS, no existe.

### Re-entrada en `Motor.go()` — el bug que contaba diapositivas no vistas

Con un pop-up "gate" abierto queda un avance pendiente (`_pendingNav`), y
`closePopup()` lo consume llamando a `go()` por su cuenta. Si en ese
momento llegaba una navegación EXPLÍCITA (`[data-goto]` del índice,
arrastre de la barra, `gotoId()`), el `closePopup()` del principio de
`go()` disparaba PRIMERO el avance pendiente y recién después seguía la
navegación pedida: dos `slidechange` seguidos.

Lo grave no es el salto visual (es un frame), es que **`slidechange` es
el evento del que cuelga todo lo que cuenta progreso** en un curso
—`estado.vistas`, gates, desbloqueo del glosario, puntos,
`maxVisited`— así que una diapositiva que el alumno nunca vio quedaba
marcada como vista por todos ellos a la vez. Misma familia que §6.51
(`maxVisited` restaurado en un lugar y olvidado en otro).

Fix: `this._pendingNav = null` al entrar a `go()` — una navegación
explícita MANDA sobre el avance pendiente. No rompe el flujo normal del
gate, porque ahí `closePopup()` ya pone `_pendingNav` en null ANTES de
llamar a `go()`. Verificado en Chromium headless: sin el fix el log de
`slidechange` da `["b","c"]`, con el fix `["c"]`.

### Pop-up sobre pop-up

`showPopup()` pisaba `this.openPopup` con el nuevo modal y dejaba el
anterior con `.open` puesto. A partir de ahí NADA lo alcanza: Esc, la X,
el backdrop y `go()` operan todos sobre `this.openPopup`, que ya apunta
a otro nodo — dos modales apilados hasta recargar. El caso que lo
dispara es normal y está documentado en el propio kit: un término del
glosario que abre su ficha. Ahora `showPopup()` cierra el anterior
preservando `_pendingNav` a mano (cerrar ahí es un relevo entre modales,
no el "ya cerraste el gate, seguí" que `closePopup()` interpreta al
final), y pasa a devolver `true`/`false` según haya abierto algo.

Ese valor de retorno cierra otro borde: un `data-gate-popup` que apunta a
un id inexistente (typo, o pop-up que se sacó del HTML y quedó el
atributo) dejaba `_pendingNav` colgado y un clic muerto. Un gate mal
escrito no puede convertirse en un curso trabado: ahora se sigue de largo.

### El resto (bordes que rompían en silencio)

- `.d-shot-video` con `[data-hit]` pero sin atributo `poster`:
  `poster.src = video.getAttribute('poster')` con el atributo ausente da
  la cadena `"null"`, el navegador pide una URL inexistente que nunca
  dispara `load`, y las zonas se quedan sin posicionar sin nada que lo
  explique. Ahora avisa por consola, mismo criterio que el warning de
  `position:absolute` de al lado (§6.45).
- `initMiniQuiz()` con el banco vacío moría en `QUIZ[cur].q` y se llevaba
  puesto el resto del `boot()` — el caso real es cablear el quiz antes de
  tener escritas las preguntas.
- `initHotspots()` devolvía `null` cuando el selector no encontraba
  zonas, contra lo que promete su propio encabezado.
- La trampa de foco de los pop-ups no incluía `select`/`textarea`: Tab
  desde un control de formulario dentro de un modal se escapaba al chrome
  de atrás.
- **AudioContext antes del primer gesto**: el `slidechange` inicial (el
  `go()` que hace `new Motor()`) dispara el whoosh de `fx.js` antes de
  que nadie haya tocado nada. Chrome bloquea el contexto, escupe
  `"The AudioContext was not allowed to start"` en la consola de CADA
  carga y el sonido no se escucha igual. Ahora el contexto nace recién
  con el primer `pointerdown`/`keydown` (mismo cambio en `fx.js` y
  `coto-ui.js`, que tienen cada uno su copia local del helper).
- `tools/new-course.mjs` interpolaba el título **crudo dentro del XML**:
  un `&` o un `<` en el nombre ("Higiene & seguridad") generaba un
  `imsmanifest.xml` malformado — o sea un paquete que el LMS rechaza
  entero al importarlo, el peor tipo de fallo posible para un scaffold.

### La plantilla no cableaba el tracking que la propia suite exige

El hallazgo más caro de la vuelta, y salió recién al final, corriendo la
suite entera contra un curso mínimo armado con el kit — no leyendo
código. `js/curso.js` no traía ninguna de estas dos líneas:

```js
document.addEventListener('slidechange', function (e) { SCORM.setLocation(e.detail.id); });
document.addEventListener('courseend',  function ()  { SCORM.markCompleted(); });
```

Son EXACTAMENTE lo que `tools/tests/scorm-tracking.mjs` verifica, y ese
test nació de §6.24 — el alumno termina el curso entero y en el LMS
queda `incomplete` para siempre, o sea el curso no sirve para lo que el
cliente paga. La cadena completa del fallo: el motor emite `courseend`
pero a propósito no habla con el LMS (spec §4, es correcto); la
plantilla debía escucharlo y no lo hacía; el test que lo detecta no
entró a la suite hasta v1.9.39 (§6.60); y cuando entró, ya fallaba de
fábrica para cualquier curso nuevo. **Tres capas de red de seguridad,
las tres con el mismo agujero.**

Y hay un segundo efecto que conecta con el arreglo de `#d-resume` de más
arriba: sin `setLocation()`, `SCORM.getLocation()` vuelve vacío siempre,
así que el banner de "retomá donde dejaste" —al que recién le pusimos
marcado y `@keyframes`— seguiría sin aparecer nunca. Arreglar la mitad
visible de una función no la enciende si la mitad que produce el dato
tampoco existe.

**Regla que queda:** lo que un test de la suite da por obligatorio va en
la plantilla SIN COMENTAR. Un `// initX()` comentado es una sugerencia;
un test que falla de fábrica es una trampa, porque el primer reflejo
ante una suite roja recién arrancada es "ya va a andar cuando el curso
esté armado".

### Las herramientas también tenían su §6.60

Tres cosas, todas de la misma familia: el diagnóstico existía pero no
llegaba a quien lo necesitaba.

- `tools/tests/scorm-tracking.mjs` era el ÚNICO de los 7 que ignoraba
  `CHROMIUM_PATH` y no pasaba `--no-sandbox` — ruta clavada a mano, sin
  escape. En cualquier máquina donde Chromium no esté ahí, el workaround
  documentado en `tools/tests/README.md` arregla 6 de 7 y deja ése roto
  sin explicar por qué justo ése. Es la SEGUNDA vez que este archivo
  queda afuera de algo por haberse escrito aparte del resto.
- Un error de consola se reportaba sin la URL: `msg.text()` de un
  recurso caído dice "Failed to load resource: the server responded with
  a status of 404 (File not found)" y nada más — ni qué archivo ni desde
  dónde. `msg.location().url` lo tenía y se tiraba. Un informe de fallo
  que no te deja avanzar un paso es casi tan malo como no tenerlo.
- Y con eso a la vista apareció lo de fondo: el 404 era `favicon.ico`,
  que el navegador pide SOLO contra la raíz del servidor —no contra la
  carpeta del curso— así que **todo paquete SCORM hacía fallar 4 de los
  7 tests** por algo que no es del curso y que en el LMS real ni ocurre
  (ahí la raíz es el host del LMS). Se ignora explícitamente. Dejarlo
  rojo por default es peor que ignorarlo: entrena a mirar la suite en
  rojo y asumir que siempre está así, que es el modo de fallar de §6.60
  otra vez —"0 fallos" que no quería decir nada—.

Con eso, la suite pasa de 3/7 a 5/7 contra un curso mínimo del kit; los
2 que quedan (`deep-audit`, `keyboard-a11y`) fallan CON RAZÓN, porque ese
curso mínimo trae los botones `sidenav`/`logros`/`glosario` del
boilerplate sin los pop-ups que cada curso escribe aparte.

### Documentación que decía algo distinto del código

`xapi.js` nombraba en su encabezado un `XAPI.track(...)` que nunca
existió (son 4 verbos: `experienced`/`answered`/`completed`/`awarded`);
un comentario de `motor-slides.js` nombraba `SCORM.getState()` (es
`loadState()`); el namespace `CotoUI` no incluía `initIndexJumps` ni
`initPopupPrefetch`, que estaban solo en los alias sueltos; y el árbol
"Qué hay" de `kit-base/README.md` listaba 3 de las 9 herramientas de
`tools/` y no mencionaba `js/curso.js`.

### Verificación

`node --check` limpio en los 29 `.js`/`.mjs`; `check-contraste` (23
categorías × 5 pares, 0 fallos), `check-css-duplicates` y
`check-raw-cat-colors` sin novedades; barrido de `@keyframes` definidos
contra usados (31 definidos, 0 huérfanos después del fix); cruce de IDs
del JS contra `header-boilerplate.html` y de clases del JS contra el CSS.
Y un curso mínimo armado con el propio kit, levantado en Chromium
headless: `boot()` sin errores ni warnings de consola, navegación con
etiquetas correctas, y los 4 arreglos del motor probados uno por uno
(gate abre pop-up, `data-goto` con gate abierto da UN solo
`slidechange`, pop-up anidado cierra el anterior, gate inexistente no
traba). Y la suite completa de 7 tests corrida contra ese mismo curso
mínimo: 5 en verde, y los 2 restantes fallando con razón por lo que le
falta al curso de prueba, no por el kit.

## 6.70 El halo de hallazgo del minijuego, atrapado en el zip del otro chat — y el choque de numeración que lo dejó pasar (kit-base v1.9.53)

Reportado desde el chat de "Seguridad alimentaria" siguiendo §0.1
(el relay pidió explícitamente auditar, no confiar). **Se auditó todo
contra el código real antes de tocar nada, y las 3 afirmaciones dieron
verdaderas** — vale dejar registrado que se verificaron, porque el
valor de §0.1 es justamente que un relay correcto y uno equivocado se
leen igual hasta que se chequea:

| Afirmación del relay | Verificación |
|---|---|
| `.d-mj-hotspot` no existe en el kit | `grep` en los 10 CSS + los 12 JS + boilerplate + spec: **0 ocurrencias** |
| `.d-mj-escena` necesita `position:relative` y hay que ver si el kit lo tiene | El kit tenía `overflow:hidden` y `aspect-ratio` pero **NO** `position:relative` |
| El contrato del repaso diverge | Kit: `modal-card--mj-repaso`/`d-mj-repaso-kicker`/`modal-x--mj-repaso` ✓ existen · `d-mj-repaso-card`/`d-mj-repaso-bd` ✗ no existen |
| El lote cinematográfico llegó fiel y compatible | `is-award-pulse`, `d-progress-locked`, `d-nav-unlock-glow`, `countTo(el, to, opts)`, el `:not(:has([data-hit], [data-place]))` del Ken Burns y el `Math.max(this.maxVisited, i)` de `_syncNav`: los 6 presentes con esos nombres |
| Las variables `--l/--t/--w/--h` y el keyframe `d-mj-hotspot-pulse` | Sin colisión con nada del kit |

### El choque de numeración: §6.17 otra vez, en vivo

Los dos chats usamos `v1.9.43` para cosas distintas — acá fue el lote de
7 mejoras "cinematográficas" (§6.64), allá fueron estos hotspots, y el
lote cinematográfico allá fue `v1.9.44`. Resultado: **este kit fue de
1.9.43 a 1.9.52 sin recibir nunca los hotspots**, que es literalmente el
patrón que §6.17 ya describe ("un fix queda atrapado en el zip de una
sesión aislada"). No se renumera nada retroactivamente: renumerar
reescribiría un historial que ya se citó en los dos lados y agregaría
una segunda fuente de confusión encima de la primera.

**Lo que sí queda escrito, porque es lo accionable:** las secciones
`§6.6x` de los dos `CLAUDE.md` NO se corresponden entre sí. Al citar una
sección en un relay entre chats, decir de qué chat es — un "§6.63" a
secas ya no identifica nada.

Y la lección de fondo, que §6.17 no cubría: el choque no se detectó por
comparar números de versión (los dos decían "1.9.43", y eso se lee como
que están sincronizados). Se detectó **aplicando el kit sobre el curso
real y viendo qué se rompía**. Dos zips con el mismo número no son el
mismo zip; lo único que dice la verdad es aplicar uno sobre el otro.

### La feature

Al acertar una opción del minijuego, además de que la píldora se ponga
verde, se resalta con un aro pulsante la zona REAL del dibujo que
explica ese hallazgo (acertar "Plagas" resalta la mosca). Aprobada por
el cliente y en producción en "Seguridad alimentaria".

No era una pérdida silenciosa —de esas que solo se notan auditando—:
sin el CSS, los 6 hotspots quedan `position:static` y las etiquetas
("Plagas", "Mala higiene"…) aparecen tiradas como texto suelto encima
del dibujo. Se ve roto a simple vista.

El detalle de por qué usa variables CSS (`--l/--t/--w/--h`) en vez de
`[data-hit]` + `_initShots()`, por qué la etiqueta es hija del aro, por
qué su tamaño va en `em`, y para qué existe
`data-mj-hotspot-lbl-pos="abajo"`, está donde corresponde: en el
comentario del propio bloque en `coto-minijuego.css`, junto al código.
Acá solo lo que no cabe ahí.

**La precondición que se agregó al subirlo (no estaba en el reporte):**
el argumento "el % del archivo mapea 1:1 al del contenedor" vale SOLO si
el curso puso `--mj-escena-ratio` igual a la proporción real de SUS
ilustraciones. Con un ratio equivocado, el `object-fit:cover` del `<img>`
sí recorta y los aros se corren del objeto, sin ningún error. Un curso
que necesite halos sobre un arte que NO llena el contenedor exacto tiene
que usar `[data-hit]` + `_initShots()`, que es justamente el caso para
el que `_initShots()` existe.

### Regla de método: las coordenadas se MIDEN, y la medición se verifica

Misma familia que §3.4, y vale para cualquier zona sobre un arte, no
solo para estos aros:

1. Medir con Python/PIL — bounding box por diferencia de color contra un
   punto de fondo limpio. Nunca a ojo.
2. **Verificar la medición dibujando el rectángulo detectado sobre la
   imagen real antes de usarlo.** Una medición automática equivocada se
   ve idéntica a una correcta hasta que se dibuja.
3. Cuando el feedback del curso afirma algo VISUAL que en miniatura no
   se distingue, medirlo también. Caso real: "Producto alterado" dice
   que una pieza de carne está más oscura que la otra, pero a ese tamaño
   las dos se ven casi iguales — el color promedio (`[213,138,124]` vs
   `[175,95,91]`) confirmó cuál era, y el halo va SOLO ahí. Poner el aro
   sobre la pieza equivocada habría contradicho el texto del feedback.
4. Si dos hallazgos comparten o se superponen en zona física, prenderlos
   JUNTOS con Playwright y sacar screenshot para ver si sus etiquetas
   chocan — no asumir que la posición por default alcanza. Acá el caso
   común (no el borde raro) era que chocaran.

### Divergencia conocida, deliberadamente no resuelta: el pop-up de repaso

Los dos chats construimos el repaso del minijuego con marcados
incompatibles (ver la tabla de arriba). Con el CSS del kit sobre el
marcado del curso, las reglas de compactación apuntan a clases que no
existen y el pop-up scrollea en mobile landscape (el otro chat lo midió:
419px de contenido contra 343 disponibles, detectado por un test propio
del curso).

No se toca el kit: su contrato es el mejor de los dos (sin `.modal-hd`,
con kicker propio, que es lo que permite compactar). **Cuando el curso
suba a esta versión, migra el curso hacia el contrato del kit, no al
revés.** Queda anotado acá para que la migración no se descubra a mitad
de una entrega.

### Verificación

`check-css-duplicates` y `check-raw-cat-colors` limpios sobre
`coto-minijuego.css`. Y la parte que importa, medida en Chromium sobre
un arte de proporción conocida con marcas en coordenadas exactas —no
mirando si "se ve bien"—: el aro cae con **0.00px de desvío** tanto a
800px como a 420px de ancho de escena, la imagen llena la escena sin
recorte en los dos, el `offsetParent` del aro es `.d-mj-escena` (o sea
el `position:relative` nuevo hace efecto), el estado apagado es
`opacity:0` sin animación y el encendido `opacity:1` con
`d-mj-hotspot-pulse`, y las dos etiquetas de zonas superpuestas quedan
separadas (52-73px contra 250-270px) gracias a
`data-mj-hotspot-lbl-pos="abajo"`.

## 7. Checklist de arranque rápido para un curso nuevo

1. Copiar la carpeta **`kit-base/`** completa (v1.7, ver §8) a la
   carpeta del curso nuevo. **Nada de esto se edita** — ya no hace
   falta ir a buscar "el curso anterior" y adivinar cuál versión de
   cada archivo es la más limpia. Trae:
   - **JS**: `motor-slides.js`, `narrador.js` (voz + `textOf()`),
     `scorm-api.js`, `xapi.js`, `fx.js`, `coto-player.js` (chrome del
     reproductor), `coto-media.js` (los 3 patrones de video),
     `coto-ui.js` (pop-ups, entrada escalonada, count-up, precarga,
     sonidos), `coto-quiz.js`, `coto-cierre.js`.
   - **CSS**: `coto-base.css`, `coto-base-addendum-v1.8.css`,
     `coto-player-chrome.css` (barra superior, §6.6),
     `coto-player-bottom.css` (barra inferior + gate de avance, §6.10),
     `coto-shot-stage.css` (lienzo con margen ampliado para tablets,
     §6.9 — usar con el margen de diseño nuevo del PDF, 8% arriba/abajo
     + 13% a los costados; también `.modal-card--shot` y
     `.modal-card--art`), `coto-fx.css`, `coto-quiz.css`,
     `coto-minijuego.css` (cáscara visual del minijuego, §6.45 — solo
     si el curso tiene uno), `coto-cierre.css`.
   - **Resto**: `fonts/` (las 7 `.woff2` reales),
     `header-boilerplate.html`, `spec-motor-slides.md`,
     `tools/tests/*` (7 tests) y las herramientas de `tools/`
     (`run-tests`, `verify-hitboxes`, `visual-regress`, `build-zip`,
     `new-course`, y los 4 chequeos `check-*`) — el listado completo,
     con qué hace cada una, está en `kit-base/README.md`.
   El orden de carga de `<link>`/`<script>` importa (cada uno depende
   del anterior) — está listado en `kit-base/README.md`, junto con el
   esqueleto de `boot()` que un `curso.js` nuevo debería tener.

   **Pasos 1-2 automatizados** (kit-base v1.9.48):
   `node tools/new-course.mjs <carpeta_destino> --titulo "Nombre del
   curso" --cat <categoría>` copia todo lo de arriba, genera
   `imsmanifest.xml` con los identifiers ya armados, y arranca
   `curso.js` desde la plantilla del kit con `COURSE_SLUG`/
   `COURSE_NAME` reales — `--cat` se valida contra las categorías
   reales de `coto-base.css`, no contra una lista que podría
   desactualizarse. **No genera `index.html`**: el chrome (barra
   superior/inferior, sidenav, glosario, logros) tiene demasiado
   contrato de IDs exacto como para fabricarlo con confianza — seguir
   con el método de zip de referencia de §7.1 para eso.
2. Nuevo `imsmanifest.xml` (identifiers/título propios) — ya generado
   si se usó `tools/new-course.mjs` del paso 1.
3. Definir `data-cat` (categoría del manual que corresponde al área,
   ver §6.5 para la tabla oficial de colores por categoría) — ya
   validado por `tools/new-course.mjs` si se usó ahí; falta ponerlo
   en el `<body>` real de `index.html`.
4. Recibir PDF, renderizar a `.webp`, seguir el flujo del §3.
   **Antes de contar diapositivas, contar ESTADOS**: un PDF de N
   páginas casi nunca son N diapositivas — las variantes de una misma
   pantalla (pestañas, pasos de un carrusel, el "antes/después" de una
   zona interactiva, los pop-ups en su propia página) son UNA
   diapositiva con `initShotSwap`/`[data-popup]`, no varias. En
   "Seguridad alimentaria" 49 páginas dieron 26 diapositivas.
   Y correr `pdfinfo` (o equivalente) por página: un PDF puede mezclar
   tamaños de página entre secciones y forzar todo al mismo render
   estira lo que no coincide, en silencio (§6.32).
5. Escribir `curso.js` — **solo contenido**: textos, banco de
   preguntas, puntaje, IDs de diapositiva y el cableado entre los
   módulos del kit (`initPlayer`, `initPopupNarration`,
   `initBgVideos`, `initMiniQuiz`, `initCierreCelebration`...).
   Siglas propias del curso con `Narrador.addFixes()`. Más los 3 CSS
   propios (`assets.css`/`diapositivas.css`/`pulido.css` o los nombres
   que correspondan). Si estás escribiendo algo que no lee ningún texto
   ni ID de este curso, **parar**: eso va al kit (paso 7).
6. Si aparece un componente de interacción reutilizable → addendum,
   no en el CSS del curso. Documentarlo para el paso 7, no asumir que
   con tenerlo en la copia local del curso ya está "en el kit".
7. Si aparece una función 100% genérica → parchear la copia LOCAL del
   curso si hace falta para no bloquear la entrega, pero **el fix real
   se lleva al chat dedicado a `kit-base/` (§0.1), nunca se edita acá
   `kit-base/` como si esta sesión fuera la fuente de verdad**. Anotar
   el hallazgo (qué, causa real, el código) para no perderlo antes de
   pasarlo.
8. Gate de avance (§6.10) si el curso lo pide: `motor.canAdvance` +
   `data-require-seen`, y verificar que el handler de `advanceblocked`
   marque los pendientes, no solo niegue el paso.
9. Placeholders de video con nombre final si faltan los reales.
9.5. **Gamificación completa (§6.17.1, obligatorio, no opcional)**:
   antes de dar el curso por terminado, verificar explícitamente que
   estén los 4 elementos — chip de logros/puntos visible y funcionando
   en el header, botón "Glosario" con términos reales del curso, al
   menos una mini-práctica/quiz, y que las interacciones/gate sumen
   puntos de verdad. No alcanza con que los `<script src>` de los 6
   módulos estén cargados (eso ya lo audita §6.17) — hay que confirmar
   que cada pieza esté REALMENTE armada con contenido de este curso,
   no solo disponible sin usar.
9.6. **Checklist de consistencia de diseño (§7.3)** — repasarlo antes
   de dar el curso por terminado, no solo cuando el cliente se queja:
   headers de popups unificados, "Sonido" mutea todo, menú lateral
   respeta gates, sin hitboxes muertos, `curso.js`/`diapositivas.css`/
   `index.html` nunca tocan `kit-base/`.
9.7. **Evaluación para Moodle (§7.2)** si el curso la necesita:
   `tools/build-evaluacion-xml.mjs` + un JSON de datos (plantilla en
   `tools/evaluacion.ejemplo.json`) generan el **Moodle XML**
   importable — el único formato de entrega desde v1.9.56.
9.8. **Si el curso usa `initProgressSeek` (barra de progreso
   arrastrable) con avance bloqueado por contenido (§6.10)**: llamar
   `motor.restoreMaxVisited(estado.vistas)` (kit-base v1.9.39, §6.59
   punto 5) una vez, después de restaurar el progreso persistido — ya
   NO hace falta escribir el loop a mano ni el `Math.max` en cada
   `slidechange`, el motor se actualiza solo de ahí en más. Antes de
   esta versión había que calcularlo a mano desde el estado YA
   RESTAURADO al arrancar (`estado.vistas`), nunca solo desde
   `motor.index` en frío — si no, quien reabre el curso en una sesión
   nueva se encuentra con la barra creyendo que no vio nada, aunque
   puntos/logros sí restauren bien (§6.51, bug real que dio origen a
   esta función). Probarlo simulando una recarga de página después de
   avanzar, no solo en una sesión continua.
9.9. **Auditoría de narración: "lee correctamente y en orden"
   (§6.54 punto 5, regla permanente pedida por el cliente).** No
   alcanza con probar que "algo se narra" — hay que leer la salida
   REAL de `Narrador.textOf()` por diapositiva (no asumir por el
   marcado) y verificar: cada diapositiva empieza narrando su título
   (si el curso prendió `setNarrateTitles`); ningún texto queda
   "pegado" sin espacio (heurístico: minúscula seguida directo de
   mayúscula); las diapositivas de video de fondo narran `''`; y
   cualquier widget propio con estado "uno visible a la vez" (repaso,
   pasos armados en HTML real) esconde lo no-actual con el atributo
   `hidden` REAL, no solo una clase CSS — si no, se narra de más y
   puede revelar contenido antes de tiempo (bug real encontrado acá:
   2 preguntas de repaso narradas juntas). Si el curso tiene preguntas
   tipo Verdadero/Falso u otro formato donde la narración necesita
   avisar algo que solo se VE (unos botones, un ícono), usar
   `[data-narrate-prefix="..."]` en vez de tocar el texto visible.
   Construir un test de contenido tipo
   `check-narracion-completa.mjs` (recorrer todas las diapositivas,
   comparar contra estas 3-4 reglas) y dejarlo en la suite del curso,
   no como chequeo manual de una sola vez.
10. Suite de tests, 0 fallos. Además, `node tools/visual-regress.mjs
    <url> --update` (kit-base v1.9.50, §6.67) la primera vez que el
    curso queda visualmente terminado — graba la baseline de cada
    diapositiva. De ahí en más, correrlo SIN `--update` antes de
    cualquier entrega: si algo cambió visualmente sin querer (un CSS
    que se tocó, un asset que se reemplazó mal), avisa con un diff en
    `tools/visual-diff-out/`. Si el cambio fue a propósito,
    `--update` de nuevo y guardar los `.png` de `tools/visual-baseline/`
    junto con el resto del curso.
11. README propio del curso (bitácora, decisiones, bugs reales) —
    **no** se mezcla con este archivo.
12. Al cerrar el curso: **NO** editar este archivo desde acá (§0.1) —
    juntar en el README del curso (o en un mensaje aparte) todo lo que
    surgió y que no es contenido de este curso (nuevo componente
    candidato al addendum, nueva regla aprendida, bug genérico
    encontrado/evitado) y llevarlo, en un prompt, al chat dedicado a
    `kit-base/`. Ese chat es el único lugar donde este documento se
    edita.
13. Antes de armar el zip: `node kit-base/tools/check-image-weight.mjs
    <carpeta_del_curso>` (kit-base v1.9.48) — avisa si quedó algún
    `.png`/`.jpg` suelto en `img/` (el kit usa `.webp` únicamente,
    §3) o algún asset pesado de más que nadie recomprimió. Los videos
    pesados solo avisan, no frenan (`--video-mb` para ajustar el
    umbral si el curso lo justifica).
14. Nunca entregar el zip final sin pedido explícito. Armarlo con
    `python3 tools/build-zip.py <carpeta> <salida.zip>
    [carpetas_a_excluir...]` (kit-base v1.9.39) — nunca a mano con
    `zip`, para no perder el flag UTF-8 en nombres con tildes/ñ (§3.9).

---

## 7.05 Migrar un curso viejo de Storyline (kit-base v1.9.57)

Para el lote de cursos hechos con Articulate Storyline antes del kit.
`tools/import-storyline.mjs` no convierte el curso — **produce el
insumo que normalmente sale del PDF del diseñador** (una captura
`.webp` por diapositiva) más el texto y la estructura ya extraídos, y
un informe de qué queda a mano.

```bash
node tools/import-storyline.mjs <export-storyline/> <destino/> [--escala 2]
```

Sale: `img/NN-slug.webp` (una por diapositiva), `storyline-import.json`
e `INFORME-IMPORT.md`. Medido contra el export real de "Surtido sin
venta": 13/13 capturas, 7 mecánicas y 6 a mano.

**Lo que hay que saber antes de prometer una migración rápida** — los
cuatro obstáculos son reales y ninguno es automatizable:

1. **La proporción no coincide.** Storyline usa ~1.78-1.86; el kit,
   2.0 (§2.6). No es recortar — los layouts difieren. La herramienta
   NO recorta (perdería contenido en silencio): reporta la proporción
   y el reencuadre es a mano.
2. **La interactividad no sobrevive a una captura plana.** Se cuentan
   capas y estados por diapositiva y se marcan las que hay que rehacer
   con `initShotSwap`/`[data-layers]`. En el curso medido: 46 capas y
   416 estados en total, pero MUY concentrados — el minijuego solo
   tenía 22 capas y 277 estados.
3. **Los videos no viajan en el export.** Verificado: cero `.mp4` en
   el paquete. Y capturar una diapo de video plana hornea el
   reproductor de Storyline dentro de la imagen — el bug de §6.29.
   Esas diapos se rearman con `coto-media.js` y el video original.
4. **La locución es otro modelo.** Storyline trae audio grabado (42
   pistas en el curso medido); el kit narra con `speechSynthesis`. O
   se re-narra con el texto extraído, o hay que sumarle al kit soporte
   de audio grabado, que hoy no tiene.

**Tres trampas del formato Storyline, encontradas construyendo esto**
(las tres daban datos incorrectos EN SILENCIO, y por eso la
herramienta no cruza nada por título):

- **El orden de `data.js` no es el de reproducción.** Listaba la
  diapositiva 11 como "Lo que vimos en este video" cuando el menú
  —por donde se navega— dice "Logueo y precarga en PDA". Etiquetar
  con `data.js` nombra las capturas mal: la imagen correcta con el
  título de otra.
- **La etiqueta del menú y el título interno son campos distintos**, y
  ese título interno además puede estar DUPLICADO entre diapositivas.
  Cruzar contenido por título es imposible de hacer bien.
- **El audio se referencia solo desde `data.js`**, nunca desde el JS
  de cada diapositiva: contarlo por diapo daba 0 siempre.

La herramienta resuelve las tres por estructura: el orden y los
títulos salen del menú (`[role="treeitem"]` sin treeitems adentro —
así soporta cursos con varias escenas y no depende del idioma), y el
contenido se cruza por **qué archivo pide el player al abrir cada
diapositiva**, escuchando la red.

## 7.1 Método de arranque con zip de referencia (kit-base + PDF + curso completo)

Desde "Uso de Sucursales 3 - NOA" (§6.17.2), el arranque de un curso
nuevo suma un tercer insumo, además del PDF y `kit-base/`: **el zip
de un curso ya cerrado y aprobado por el cliente** (hoy, "Prevención
cardiovascular") como referencia de "qué se ve un curso completo".
Motivo: la auditoría de §6.17/§6.17.2 mostró que un curso armado SOLO
con `kit-base/` + PDF puede salir técnicamente correcto (0 fallos de
test) pero sentirse pobre frente a un curso maduro, porque el kit
todavía no absorbió el 100% del pulido — y la única forma real de
encontrar esas diferencias es comparar contra un curso terminado.

**Regla central: el zip de referencia se AUDITA, no se copia.**
Ninguna diapositiva, imagen ni ID de "Prevención cardiovascular" pasa
al curso nuevo — es contenido de otro cliente/tema. Lo que sí se trae
es cualquier PATRÓN genérico que el zip de referencia tenga y
`kit-base/` no (o tenga desactualizado) — y ese patrón se lleva a
`kit-base/` primero, nunca directo al curso nuevo, siguiendo el mismo
método que ya encontró y corrigió el bug de fuentes, el bug de
Locución/Ampliar y la medalla desactualizada (§6.17, §6.17.2):

1. **Leer `kit-base/CLAUDE.md` completo primero** (trae toda la guía
   de proceso/diseño/contenido — es autocontenida, no depende de tener
   este repo).
2. **Extraer el zip de referencia aparte** (no mezclar sus archivos
   con los del curso nuevo) y auditar, módulo por módulo del kit
   (`coto-player`, `coto-media`, `coto-ui`, `coto-hotspots`,
   `coto-quiz`, `coto-cierre`, sus CSS pareja, y
   `header-boilerplate.html`), si el curso de referencia tiene alguna
   versión MÁS completa o distinta de ese mismo componente genérico.
   Mismo criterio que §6.17.2: comparar función por función / clase
   por clase, no "a ojo".
3. **Cualquier diferencia real encontrada se anota** (qué componente,
   qué le falta, la implementación de referencia si hace falta
   copiarla) **y se lleva al chat dedicado a `kit-base/` (§0.1) —
   nunca se corrige acá, en esta sesión de curso.** Si la diferencia
   bloquea seguir con el curso nuevo, parchear la copia LOCAL lo
   mínimo necesario para no frenarse (nunca parcheando solo el curso
   por fuera de su copia de `kit-base/`, que sigue siendo la regla de
   §1), pero ese parche es un puente, no el fix real — el fix real se
   aplica, prueba y documenta en el chat dedicado, con su propia
   versión de `kit-base.zip` que hereda el PRÓXIMO curso.
4. **Recién ahí**, arrancar el curso nuevo desde `kit-base/` (ya
   corregido) + el PDF, siguiendo el checklist normal de §7.
4.1. **Además de auditar los módulos genéricos (paso 2-3), revisar el
   zip de referencia como catálogo de INTERACCIÓN/EFECTOS/UX** — no
   solo bugs de código. "Prevención cardiovascular" tiene piezas de
   interacción concretas que el brief de un curso nuevo puede no pedir
   explícitamente pero que valen la pena ofrecer si el contenido se
   presta: torta/gráfico interactivo con tarjeta que sigue al sector
   activo (§6.12 punto 3, §6.13 punto 2), zonas que revelan info al
   pasar/tocar (`initHotspots`, §6.10.7), stagger de entrada en
   pop-ups (§6.11), video circular/en pop-up con controles propios
   (§6.12), pop-up de predicción antes de un video como excepción de
   diseño (§6.10.2.2), animación cinemática de premio (§6.13 punto 4,
   §6.17.2). Al leer el guion del PDF nuevo, para cada diapositiva
   preguntarse "¿hay un patrón de interacción ya resuelto en la
   referencia que le quede mejor a este contenido que una captura
   estática?" — un gráfico, un proceso de pasos, una comparación, una
   lista de factores/causas son candidatos típicos. **Esto es una
   sugerencia de diseño para USAR en el curso nuevo con su propio
   contenido, no texto/arte para copiar** — y si el patrón que se
   necesita ya es genérico (`initHotspots`, stagger, medalla), se usa
   directo del kit; si es una variación puntual (como la torta), se
   escribe de nuevo para el gráfico/dato de ESTE curso, tomando la
   implementación de referencia como plantilla de cómo resolverla bien
   (mismos cuidados: hover+focus+táctil, medir en píxeles antes de
   posicionar, respetar `prefers-reduced-motion`).
5. **Gamificación completa es obligatoria** (§6.17.1) — el zip de
   referencia es, además, el ejemplo vivo de cómo se ve un header con
   las 4 piezas (logros/puntos, glosario, mini-práctica, interacciones
   que premian) — compararlo visualmente contra el curso nuevo es una
   buena forma rápida de auditar que no falte ninguna.
6. Al cerrar el curso, confirmar que todo lo anotado en el paso 3
   efectivamente se relayó al chat dedicado (§0.1) — un hallazgo que
   se queda solo en el parche local de esta sesión es exactamente el
   patrón que §6.17/§6.17.2 documentaron como costoso: se resuelve una
   vez, se pierde, y el próximo curso lo vuelve a encontrar.
7. **Modo revisión** (`?review=1`, kit-base v1.9.48,
   `motor-slides.js`): para validar un cambio puntual sin recorrer
   todo el curso desde el índice, abrir
   `index.html?review=1#slide=<id-de-la-diapositiva>` — aterriza
   directo ahí, y mientras `?review=1` sigue en la URL, cada
   navegación actualiza el hash solo (para copiar/compartir el link
   exacto de lo que se está mirando). Además pinta con contorno
   punteado cada `[data-hit]` de la diapositiva y muestra un chip fijo
   abajo a la izquierda con lo que esa diapositiva declara — `🔒 gate`
   si tiene `data-gate-popup`/`data-require-seen`/`data-require-popups`,
   cuántos hitboxes y cuántos pop-ups — sin tener que inspeccionar el
   HTML. **Clickear el chip abre un panel** con lo que SCORM/xAPI ya
   están registrando en esa sesión — `lesson_location`, tamaño del
   `suspend_data`, y los últimos 5 statements de `XAPI.getLog()` (se
   actualiza solo cada 2s) — sin tener que leer `localStorage`/consola
   a mano. Sin `?review=1` nada de esto existe — ni el hash hace algo,
   ni aparece contorno, chip ni panel — es a propósito, para que la
   URL real que entrega el LMS no le dé a un alumno una forma de
   saltarse los
   gates de contenido escribiendo el id de una diapositiva más
   adelante.

---

## 7.2 Generar la evaluación para Moodle

Desde "Uso de Sucursales 3 - NOA" (§6.44/§6.45), armar la evaluación
final del curso (típicamente 20 preguntas — 10 opción múltiple de 3
alternativas + 10 Verdadero/Falso, dificultad media, SIEMPRE con una
explicación por pregunta que diga POR QUÉ, no solo "correcto") es un
paso más del checklist, no un pedido aparte.

⚠️ **Cambió respecto de v1.9.55**: la regla vieja pedía
retroalimentación propia en cada distractor. El formato XML que el
cliente aprobó NO la usa — verificado sobre la evaluación entregada de
"Seguridad alimentaria": 0 de sus 20 distractores llevan feedback
propio; Moodle muestra UNA explicación por pregunta al cerrar el
intento. Escribir feedback por distractor hoy es trabajo que el
entregable descarta.

**Herramienta**: `tools/build-evaluacion-xml.mjs` — 100% genérica (no
sabe nada del contenido de ningún curso), toma el JSON de datos y
escribe el Moodle XML:

```bash
node tools/build-evaluacion-xml.mjs <curso>/evaluacion.json [salida.xml]
```

**Siempre XML, no hay otra opción** (kit-base v1.9.56). Es el formato
que se le entrega a COTO — Moodle lo importa desde Banco de preguntas >
Importar > formato "Moodle XML". Hasta v1.9.55 el kit traía también una
herramienta de formato GIFT; se sacó porque obligaba a elegir en cada
curso y el entregable siempre terminaba siendo el XML, que es el único
que expresa dos cosas que el cliente sí pidió:
- **retroalimentación a nivel de PREGUNTA**
  (`correctfeedback`/`incorrectfeedback`) — lo que Moodle muestra al
  cerrar el intento;
- `shuffleanswers`/`answernumbering`/`defaultgrade` declarados
  explícitamente por pregunta, en vez de heredar los valores por
  defecto de la instalación de Moodle que la importe.

⚠️ **El prefijo del feedback lo pone el script, no el JSON.** En el XML
la misma explicación va dos veces por pregunta, cambiando solo el
prefijo (`¡Correcto! <expl>` / `Incorrecto. <expl>`). Los JSON del formato
viejo traen el prefijo YA adentro del texto ("¡Correcto! El 191
compara…"), así que `build-evaluacion-xml.mjs` se lo saca antes de
volver a prefijar — si no, saldría "Incorrecto. ¡Correcto! El 191
compara…". Consecuencia práctica para quien escriba un JSON nuevo: da
igual escribir la explicación pelada o con prefijo, el XML sale bien de
las dos formas. `explicacion` es el campo canónico del esquema: UNA por
pregunta, escrita sin prefijo.

`tools/evaluacion.ejemplo.json` es el caso real de **"Seguridad
alimentaria"** (las 20 preguntas que se entregaron y el cliente aprobó)
— usarlo como plantilla del formato: copiarlo a
`<curso>/evaluacion.json`, reemplazar el contenido pregunta por
pregunta con el material real del curso nuevo, correr el script. Es
además el caso de prueba de la herramienta: regenerarlo tiene que dar
el XML entregado, **idéntico byte a byte** — si algún día deja de dar
idéntico, algo cambió en el generador sin querer. El script se encarga
de:
- Numerar las preguntas (`MC01…`, `VF01…`) y anteponerlo al `id` de
  cada una, para que el nombre en el banco de Moodle quede ordenado.
- Poner el prefijo del feedback (`¡Correcto! …` / `Incorrecto. …`)
  sobre la MISMA explicación, y sacar el que el texto ya traiga
  escrito — ver el aviso de más arriba.
- Escapar XML donde va texto plano (`<name>`, `<category>`) y envolver
  en CDATA el resto, así el contenido puede traer HTML (`<strong>`,
  `<br>`) sin romper el import.

**Criterio de contenido** (para quien escriba el JSON): cubrir los
puntos de control/reportes reales del curso, una pregunta por concepto
clave — no repetir el mismo dato en 2 preguntas distintas (ej. no
preguntar "¿cuántos días es el límite de X?" en opción múltiple Y en
V/F). Los distractores de opción múltiple funcionan mejor cuando son
OTRO dato real del curso que alguien podría confundir (ej. "30 días"
como distractor de una pregunta cuya respuesta real es "120 días",
porque 30 es el número real de OTRO reporte) — un distractor
inventado/absurdo no mide nada.

---

## 7.3 Checklist de consistencia de diseño — no reintroducir estos bugs

Reglas aprendidas en rondas de revisión reales (mayormente "Uso de
Sucursales 3 - NOA", §6.41-§6.44) que valen para CUALQUIER curso, no
solo para el que las encontró. Revisar esta lista al auditar un curso
nuevo, no solo cuando el cliente se queja.

1. **Todo popup que cuelga del menú superior usa el MISMO estilo de
   header.** Índice, Glosario, Ayuda, Mis logros (y cualquier otro que
   se agregue) — mismo degradado (`--brand-deep→--brand`), mismo
   padding, misma tipografía. Mecanismo ya en el kit
   (`coto-base-addendum-v1.8.css`): `.modal-card.d-drawer-r > .modal-hd`
   y `.modal-card.d-wide > .modal-hd` fuerzan el degradado unificado —
   si un curso nuevo agrega un popup con OTRO tipo de contenedor
   (ni cajón ni `.d-wide`), sumar ese selector a la misma regla, no
   crear un 3er estilo de header. `.modal-hd--dark` (navy sólido) sigue
   existiendo para el caso genuino de querer un header distinto — pero
   si se usa, aplicarlo a TODOS los popups del curso, nunca a uno solo
   (la nota original de `.modal-hd--dark` en `coto-base.css` ya lo
   advertía; §6.41/§6.44 son la prueba de que igual se puede reintroducir
   sin querer).
2. **"Sonido" mutea TODO — video incluido, sin excepción.** Ya
   corregido a nivel kit (`coto-media.js`/`coto-player.js`, §6.44 punto
   9): los 3 patrones de video (fondo, pop-up, círculo inline) leen el
   mismo `localStorage['coto-diapos-mute']` que ya leían fx.js/
   coto-ui.js, y el toggle sincroniza `.muted` en vivo sobre cualquier
   `<video>` presente al togglear. Si un curso nuevo agrega OTRO
   patrón de audio/video (ej. un audio de fondo separado), hacerlo leer
   la misma marca desde el arranque — no esperar a que el cliente lo
   note.
3. **El menú lateral (índice ☰) nunca deja saltar a una diapositiva no
   vista.** `marcarVistas()` en `curso.js` tiene que poner
   `a.disabled = !visto` en cada `.d-sidenav-item[data-goto]`, no solo
   el tilde visual `.is-done` (§6.44 punto 2 — el bug real: el tilde
   estaba bien, pero el link seguía siempre clickeable, dejando saltar
   directo al cierre sin cumplir ningún gate de obligatoriedad). CSS
   del estado ya en el kit (`.d-sidenav-item:disabled`).
4. **Nunca dejar un hitbox permanentemente `disabled` en el HTML sin
   una función real que lo habilite.** Si el plan es "esto se habilita
   cuando se cumpla X" pero esa función nunca se escribe, el resultado
   es un elemento que parece interactivo (foco/hover residual) pero
   nunca funciona — más confuso que no tener nada ahí (§6.44 punto 1).
   Si un patrón queda sin la lógica que lo activa, sacarlo del HTML en
   vez de dejarlo "por si después se termina".
5. **Método para posicionar cualquier overlay sobre un `.d-shot`
   (video, hitbox, texto dinámico) que no calce a la primera:** medir
   sobre el POP-UP YA RENDERIZADO en el tamaño real de pantalla
   (ocultar el overlay por JS, screenshotear, medir sobre ESE
   screenshot), no sobre el archivo de imagen suelto ni sobre la
   página del PDF. Los 3 espacios de coordenadas (archivo crudo, PDF
   completo, contenedor ya renderizado) NO son intercambiables — un
   valor que se ve perfecto medido en uno puede fallar en los otros
   dos (§6.44 punto 4, 3 vueltas en falso documentadas ahí mismo).
6. **Cualquier elemento tipo "toda la superficie es un botón" (el
   patrón `initPopupVideos`/`initInlineCircleVideos` de
   `coto-media.js`, o similar) necesita feedback de hover propio** —
   `cursor:pointer` solo no alcanza como affordance. Ya resuelto para
   los 3 patrones de video del kit (`coto-media.css`,
   `[data-popup] video:not([controls]):hover`); aplicar el mismo
   criterio a cualquier patrón nuevo de este tipo.
7. **`curso.js`, `diapositivas.css` e `index.html` NUNCA se copian a
   `kit-base/`** — son 100% específicos de cada curso. Sale obvio
   dicho así, pero ya pasó por accidente (§6.44 punto 7, un `cp` sin
   filtrar al sincronizar otros archivos de kit sí tocados esa vuelta).
   Al sincronizar kit tras una vuelta de cambios, copiar archivo por
   archivo explícito — nunca un `cp -r`/glob amplio entre la carpeta
   del curso y `kit-base/`.
8. **Antes de reusar un atributo del chrome (`data-nav`, `data-goto`,
   `data-popup-trigger`) sobre un elemento que NO es del chrome,
   revisar qué le hace `_syncNav`.** El motor no distingue una hitbox
   invisible sobre una captura de un botón de la barra inferior:
   `data-nav="next"` en un `[data-hit]` recibe `.d-nav-btn--cta`, que
   pinta `background:var(--cat-strong)` — un bloque de color sólido
   tapando el botón que el arte ya dibuja (§6.45). Para "este botón
   dibujado lleva a la diapositiva siguiente", `data-goto` hace lo
   mismo sin efectos colaterales.
9. **El overlay de hitboxes también dibuja los `[data-place]`, y hay
   que mirarlos.** Los `[data-hit]` se revisan porque "si no se puede
   clickear se nota"; un `[data-place]` mal ubicado (una fila de
   tildes, un cartel de progreso) no rompe nada, simplemente se
   superpone al arte — y eso no se ve leyendo el HTML ni corriendo los
   7 tests. Se ve corriendo `tools/verify-hitboxes.mjs` y mirando las
   capturas (§6.45).
10. **El curso nunca lleva 2 archivos `README.md`/`README-CURSO.md`
   con nombres casi iguales.** Si se scaffoldea copiando `kit-base/` de
   punta a punta (§7), borrar o renombrar el `README.md` heredado del
   kit ANTES de escribir la bitácora propia del curso — si coexisten,
   tarde o temprano se empaqueta el equivocado en el zip de entrega
   (pasó una vez, §6.43).
11. **Cualquier breakpoint ≤600px se prueba con Playwright en viewport
   MOBILE REAL (`isMobile:true`, `hasTouch:true`), nunca solo
   redimensionando la ventana de escritorio.** "Probé el responsive" sin
   especificar cómo no alcanza como verificación — un grid con columnas
   `fr` puede parecer que se angosta bien en una ventana angosta de
   escritorio y romperse en un teléfono real (§6.48, el mismo bug
   pasó sin detectarse en 2 cursos por esto exacto).
12. **Un popover/tooltip que cuelga de un botón del chrome nunca se
   ancla por breakpoint fijo — se posiciona midiendo el botón real en
   cada apertura.** Si el botón del que cuelga puede cambiar de lado de
   la pantalla entre anchos (típico: el layout de 2 filas de §6.6 mueve
   grupos de botones de la derecha a la izquierda por debajo de
   799px), un CSS que asume "en mobile este botón está pegado al borde
   derecho" se rompe apenas ese supuesto deja de ser cierto — el
   popover se sale del viewport por el lado contrario (§6.55, medido
   con Playwright en viewport táctil real: `left:-150px`). El fix
   correcto es JS que mide `getBoundingClientRect()` del botón en cada
   apertura y clampea la posición del popover al viewport real, con el
   CSS centrado de siempre como fallback sin JS — nunca un anclaje fijo
   "para mobile" que vuelve a asumir en qué lado va a estar el botón.
13. **Antes de entregar, correr `node tools/check-css-duplicates.mjs`
   sobre los `.css` propios del curso** (kit-base v1.9.39, §6.59 punto
   6) — detecta selectores repetidos con propiedades en conflicto, la
   familia de bug de §6.28/§6.33 que ya costó 2 vueltas de "se ve mal
   y no sé por qué". Encontró 2 bugs reales en el kit mismo apenas se
   construyó — correrlo también contra el propio `kit-base/css/*` de
   vez en cuando, no solo contra CSS de curso.
14. **Nueva interacción/gesto/layout: probar en viewport táctil REAL
   antes de darlo por terminado, en la MISMA vuelta en que se
   construye** (§6.10.1 punto 4, regla fija desde la ronda de "10
   mejoras al kit", kit-base v1.9.39) — usar `openCourseMobile()`
   (`tools/tests/_shared.mjs`) para que no sea fricción extra. No es
   una auditoría aparte para "cuando el cliente pregunte cómo anda en
   mobile": es parte de construir la pieza.


15. **Antes de entregar, correr `node tools/check-contraste.mjs`**
   (kit-base v1.9.40, §6.60) — valida las 23 categorías contra los
   pares de uso reales del CSS. Si el curso agrega un par nuevo
   (un color de texto sobre un fondo que el kit no combinaba antes),
   sumarlo a la tabla `PARES` del script en la misma vuelta: un par
   que no está en la tabla es un par que nadie está mirando.
   **Y la regla que dio origen a todo esto**: nunca escribir en un
   comentario que algo pasa "en TODAS las categorías" con UN ejemplo
   al lado como prueba. Si vale la pena afirmarlo, lo verifica un
   script — el comentario viejo de `--cat-strong` decía exactamente
   eso y era falso en 5 de 23.

16. **Para texto usar `--cat-ink`, nunca `--cat-strong`; para fondo de
   texto usar `--cat-wash`, nunca `--cat-soft`** (kit-base v1.9.40,
   §6.60). `--cat-strong` es el Valor 1 del manual y quedó reservado a
   bordes/outlines/sombras/degradados, que no tienen requisito de
   contraste. `--cat-soft` es el Valor 5: sirve de tinte decorativo,
   pero a 4 pasos del Valor 1 en una rampa de 6 NUNCA llega a 4.5:1
   contra la tinta — cualquier bloque que ponga texto encima necesita
   `--cat-wash`. Los dos errores estaban en el kit y los dos afectaban
   cursos ya entregados.

17. **La suite sale de un glob, no de una lista** (`tools/run-tests.mjs`,
   kit-base v1.9.40, §6.60). Si un curso agrega tests propios en
   `tools/tests/`, entran solos — no hay lista que actualizar. Los
   archivos que empiezan con `_` son librerías compartidas, no tests,
   y quedan afuera por convención. Antes de confiar en un "0 fallos",
   mirar cuántos tests dice haber corrido: `scorm-tracking.mjs` estuvo
   30 versiones sin correr porque la lista era manual.
---

## 8. Kit master — estado actual

El kit dejó de ser "copiar del curso anterior" y pasó a ser una carpeta
real y versionada: **`kit-base/` (v1.8)**, al mismo nivel que este
`CLAUDE.md`. Ver `kit-base/README.md` para el detalle completo (qué
contiene, cómo arrancar un curso con esto, los 12 bugs reales ya
resueltos que no hay que volver a introducir, y las 5 falsas alarmas
que enseñaron a medir antes de "arreglar").

**v1.8 es la segunda vuelta de "Prevención cardiovascular"**, con el
curso ya entregado y revisado por el cliente — todo salió de uso real.
Suma al kit: el reloj de tiempo activo que descuenta los videos (§6.10.4),
la salida real del curso con `SCORM.exitCourse()` (§6.10.5), la medalla
final por puntaje (§6.10.6), `[data-place]` para overlays no
interactivos, los pop-ups automáticos y "gate" que se re-arman al entrar
(§6.10.2), y 7 componentes nuevos del addendum: cajón derecho, aro de
resaltado sobre ícono (§6.10.3), tildes de avance, barra de pasos
navegable, medalla, pantalla de salida y bloque de aviso. Más los 2
tests reforzados (contención del DOM en `markup-sanity`, recorte de
contenido en `scroll-audit`) — los dos nacidos de bugs que ninguno de
los 6 detectaba.

**v1.7 terminó de vaciar `curso.js`.** Hasta v1.6, un curso nuevo
copiaba el kit y **igual reescribía a mano ~600 líneas de
infraestructura** — barra superior, videos, pop-ups, precarga,
sonidos — cada vez, y cada vez volviendo a tropezar con los mismos
bugs. Se sumaron 3 archivos (`js/coto-player.js`, `js/coto-media.js`,
`js/coto-ui.js`), `Narrador.textOf()` con sus 4 bugs de extracción de
texto ya resueltos adentro, el atributo `[data-narrate-only]` (§6.5) y
el bloque CSS del gate de avance (§6.10). Los 3 módulos se validaron
en aislamiento antes de subirlos. **Objetivo declarado de v1.7**: que
lo único que quede en `curso.js` sea contenido — textos, banco de
preguntas, puntaje, IDs y el cableado entre módulos.

**v1.6 agregó** `coto-quiz.js`/`coto-cierre.js` (mini-práctica y
cierre extraídos y parametrizados por callbacks), `coto-fx.css`, las
3 secciones nuevas del addendum (índice con ícono+check, pop-up de
instrucciones, pop-up de logros), la entrada escalonada, `fonts/` con
las familias reales y el 6º test (`markup-sanity.mjs`).

**v1.3 agregó** `css/coto-shot-stage.css` — el lienzo de diapositivas-
captura con margen ampliado para tablets (ver §6.9). **Aplica desde
"Prevención cardiovascular" en adelante, NO retroactivo** a cursos
diseñados con el margen viejo (8% parejo) como "Surtido sin venta" —
requiere que el PDF venga diseñado con el margen nuevo (8%
arriba/abajo + 13% a los costados).

**v1.2 corrigió** `js/narrador.js`: la velocidad de narración (1.15x)
ya no es una constante fija — depende de si la voz elegida es de
calidad conocida (`isHighQualityVoice`), ver §6.7. Bug real reportado
probando "Surtido sin venta" en tablet (voz de respaldo sonando
atropellada a 1.15x).

**v1.1 agregó** `css/coto-player-chrome.css` + `header-boilerplate.html`
— el rediseño completo de la barra superior (ver §6.6 para las
lecciones/bugs reales encontrados), extraído y validado de forma
aislada (screenshot idéntico al curso real cargando SOLO el archivo
nuevo + `coto-base.css`/addendum/`assets.css`, sin `diapositivas.css`
ni `pulido.css` del curso). Resumen de lo resuelto en v1.0:

- ~~Migrar `initShots()` de `curso.js` a `motor-slides.js`~~ — hecho
  (sesión anterior). `initConceptShots()` queda en `curso.js` a
  propósito (ver §1, tiene los 7 conceptos hardcodeados).
- ~~"Surtido sin venta" reexportó a 2:1~~ — hecho (sesión anterior).
  2:1 fue suficiente, recorte = 0 (ver §2.7).
- ~~`spec-motor-slides.md` recuperado/reconstruido~~ — hecho, vive en
  `kit-base/spec-motor-slides.md`, reconstruido línea por línea a
  partir del código real de `motor-slides.js` (contrato de
  diapositivas/capas/pop-ups/hitboxes, puntos de extensión, checklist
  de verificación).
- ~~`tools/tests/*.mjs` genéricos como carpeta base del kit~~ — hecho,
  5 tests (`deep-audit`, `full-regress`, `hitbox-click-check`,
  `scroll-audit`, `keyboard-a11y`) en `kit-base/tools/tests/`,
  corridos y en verde contra "Surtido sin venta" real. Detectan y
  distinguen gates de contenido (`motor.canAdvance`) de fallos reales
  — no confundir un curso con gate legítimo con un curso roto.
- ~~Migrar `speak()`/`speechify()` a un archivo genérico~~ — hecho:
  nuevo `kit-base/js/narrador.js` (no se sumó a `motor-slides.js` ni
  `fx.js` a propósito — el motor declara explícitamente que "no habla
  con narración", y fx.js es solo decorativo; un archivo dedicado
  mantiene esa separación). Diccionario fonético base = tabla oficial
  del Manual de Contenido (§6.5), extensible por curso con
  `Narrador.addFixes([...])`.
- **Nueva herramienta**: `kit-base/tools/verify-hitboxes.mjs` —
  generaliza el script ad-hoc que encontró el bug de "conceptos"
  (coordenadas viejas no remedidas tras reexportar el PDF, ver §3
  punto 4). Recorre TODAS las diapositivas con hitboxes de una corrida,
  sin escribir un script nuevo cada vez.
- **Auditoría real al armar el kit**: 3 casos de contenido de curso
  colado en archivos "genéricos" que en realidad no lo eran del todo
  (IDs de diapositiva hardcodeados en `fx.js`, nombre de curso en la
  clave de `localStorage` de `scorm-api.js`, slug de curso en el
  activity ID de `xapi.js` — los tres corregidos, detalle en
  `kit-base/README.md`). **Lección: no asumir que un archivo es
  genérico por estar en la carpeta correcta — auditar antes de
  promoverlo al kit** (grep por nombres de curso/diapositiva/claves de
  storage).

### Resuelto en "Prevención cardiovascular" (kit v1.6-v1.7)

- ~~**Decidir la distinción narración obligatoria/opcional**~~ — hecho:
  `[data-narrate-only]` en `coto-ui.js`, resuelto en el marcado, ver
  §6.5. Criterio de uso: contenido de CONSULTA → narrar solo la
  entrada; contenido para leer de principio a fin → narrar todo.
- ~~**Separación intro-una-vez / paso-a-paso** en actividades
  multi-paso~~ — hecho: `coto-quiz.js` narra SOLO el cuerpo del paso
  actual (`narrate(body)`), nunca la consigna fija de la diapositiva.
  El curso la narra una vez al entrar y no vuelve a incluirla.

### Pendiente real (no resuelto todavía)

- **CONFIRMADO por auditoría (no solo "probable"): "Prevención
  cardiovascular" no carga NINGUNO de los 6 módulos nuevos del kit** —
  ni `coto-player.js`, `coto-media.js`, `coto-ui.js`, `coto-hotspots.js`,
  `coto-quiz.js` ni `coto-cierre.js` están en su `<script src>`, y sigue
  usando `coto-base-addendum-v1.2.css` en vez de la v1.8. Todo lo que
  este curso hace (barra superior, videos, pop-ups, quiz, cierre,
  medallas) corre con las copias inline de `curso.js`/`diapositivas.css`
  — el kit es una segunda implementación PARALELA, nunca invocada por el
  curso del que se extrajo.
  Consecuencia real ya encontrada: la copia inline de
  `pintarMedalla()`/`medallaDe()` había quedado duplicando exactamente
  la función que subió al kit el mismo día, sin que nadie lo notara
  (curso.js corre en su propio IIFE, así que la copia local TAPA a la
  global sin pisarla — no hay error, simplemente nunca se llama a la del
  kit). Es la prueba concreta de que "extraído y validado en
  aislamiento" no es lo mismo que "probado end-to-end": las dos
  implementaciones pueden divergir con el tiempo sin que ningún test lo
  detecte, porque ningún test corre contra la versión del kit dentro de
  un curso real.
  **El primer curso que arranque copiando `kit-base/` de punta a punta
  (siguiendo el checklist de §7, sin reescribir nada a mano) va a ser la
  primera prueba real end-to-end.** Si aparece un ajuste al usarlos,
  corregirlo **en `kit-base/`**, no en el curso nuevo. Hasta que eso
  pase, tratar "está en el kit" como "el mecanismo es sano y se probó
  aislado", no como "ya funciona en un curso real".
- ~~**`initConceptShots()`**~~ — **RESUELTO en kit v1.9.21** (§6.45):
  `initShotSwap()` (`coto-media.js`) es esa generalización, ya probada
  en producción en 4 variantes distintas del mismo patrón dentro de
  "Seguridad alimentaria" (2 carruseles, 1 juego de pestañas, 1 barra
  de pasos arrastrable). Esta nota quedó vieja acá abajo por pura
  omisión — el trabajo ya estaba hecho, solo faltaba tacharla
  (auditado de nuevo en la ronda de "10 mejoras al kit", kit-base
  v1.9.39). La única pieza que sigue sin tocar es el propio `curso.js`
  de "Surtido sin venta" (curso cerrado y entregado, fuera de este
  repo) — sigue con su copia hardcodeada de los 7 conceptos, y no hace
  falta migrarlo: un curso cerrado no se retoca salvo que tenga un bug
  real que reportar (regla general de este documento, no algo nuevo).
- **Sugerirle al cliente agregar a su Manual de Contenido** una regla
  explícita sobre framing de prácticas/evaluaciones (el caso real
  "no cuenta para la nota") — sigue sin estar escrito en ningún manual
  oficial, ver §6.5.
- Limpieza de assets huérfanos en el zip de "Surtido sin venta"
  (`img/introduccion/*`, `img/indice/*`, `img/que-es/*`, etc., de
  cuando esas diapos usaban piezas separadas) — prioridad baja, no
  afecta el kit ni cursos futuros.
- `kit-base/js/motor-slides.js`/`scorm-api.js`/`xapi.js`/`fx.js` no se
  volvieron a auditar línea por línea más allá de lo encontrado esta
  vuelta — si en el próximo curso aparece algo más específico de
  "Surtido sin venta" escondido ahí, corregirlo ahí mismo (en
  `kit-base/`, no en el curso nuevo) y anotarlo acá.
