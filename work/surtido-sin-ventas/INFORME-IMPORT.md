# Import de Storyline — 64Ve2Ad05Hd

Generado con `tools/import-storyline.mjs` (kit-base v1.9.57).
**Esto no es un curso terminado**: son las capturas + el texto + la
estructura, listos para armar el curso con el molde del kit.

## Resumen

| | |
|---|---|
| Diapositivas | 13 |
| Capturas OK | 13/13 |
| Mecánicas (captura sirve como está) | 7 |
| Requieren trabajo a mano | 6 |
| Proporción de Storyline | **1.779** (el kit usa **2.0** — ver §2.6) |
| Pistas de locución grabada | 42 |

⚠️ **Reencuadre**: la proporción no coincide con la del kit. No se
recortó nada automáticamente (recortar perdería contenido en
silencio): cada captura hay que reencuadrarla a 2:1 antes de usarla
como `.d-shot-img`.

⚠️ **Videos**: no viajan en el export de Storyline. Las diapositivas
con video se rearman con `coto-media.js` y el archivo original
aparte — capturarlas planas hornea el reproductor de Storyline dentro
de la imagen (CLAUDE.md §6.29).

⚠️ **Locución**: Storyline trae audio grabado (42 pistas); el kit
narra con `speechSynthesis` (TTS). O se re-narra con el texto de abajo,
o hay que sumarle al kit soporte de audio grabado (hoy no lo tiene).

## Requieren trabajo a mano (6)

- **01 · Inicio del curso** — _portada_: la portada se rearma a mano (video/arte propio del molde)
- **04 · Unidad 1: Control de Surtido sin venta** — _separador de unidad_: los separadores de unidad se rearman a mano
- **06 · Algunos conceptos importantes** — _interactiva_: 9 capa(s) y 70 estado(s): la interactividad no sobrevive a una captura plana, se rehace con initShotSwap/[data-layers]
- **07 · Mini juego** — _interactiva_: 22 capa(s) y 277 estado(s): la interactividad no sobrevive a una captura plana, se rehace con initShotSwap/[data-layers]
- **09 · Lo que vimos en este video** — _interactiva_: 3 capa(s) y 12 estado(s): la interactividad no sobrevive a una captura plana, se rehace con initShotSwap/[data-layers]
- **11 · Logueo y precarga en PDA** — _interactiva_: 3 capa(s) y 12 estado(s): la interactividad no sobrevive a una captura plana, se rehace con initShotSwap/[data-layers]

## Mecánicas (7)

- 02 · Introducción → `img/02-introduccion.webp`
- 03 · Índice de contenidos → `img/03-indice-de-contenidos.webp`
- 05 · ¿Qué es el control de surtido sin venta? → `img/05-que-es-el-control-de-surtido-sin-venta.webp`
- 08 · Cómo hacemos el reporte → `img/08-como-hacemos-el-reporte.webp`
- 10 · Qué hacemos con los productos → `img/10-que-hacemos-con-los-productos.webp`
- 12 · Últimos consejos → `img/12-ultimos-consejos.webp`
- 13 · Fin del curso → `img/13-fin-del-curso.webp`

## Texto extraído por diapositiva

Sirve como guion de narración y como texto accesible (`sr-only`) —
revisarlo antes de usarlo: incluye nombres de objetos de Storyline
("Rectángulo 8", "Recurso 77.png") mezclados con el texto real.

### 01 · Inicio del curso

_sin texto extraído_

### 02 · Introducción

- Introducción
- El control de
- surtido sin venta
- nos permite ver qué productos no se están vendiendo.\r\n
- Esto nos ayuda a detectar si falta mercadería, si está mal ubicada o si hay algún problema con el stock.\r\n
- En este curso vamos a ver cómo armar el reporte, cómo leerlo y qué hacer en cada caso.
- Objetivos de aprendizaje
- Detectar productos que no se \n
- vendieron en un período de tiempo.
- Identificar problemas de stock, de exhibición en el salón y de faltantes a la venta.
- Aplicar acciones para mejorar la venta de esos productos.
- SIGUIENTE
- ANTERIOR

### 03 · Índice de contenidos

- ¿Qué es el control de surtido sin venta?\n
- Algunos conceptos importantes\n
- Cómo hacemos el reporte\n
- Lo que vimos en este video\n
- Qué hacemos con los productos\n
- Lo que vimos en este video
- CONTROL DE SURTIDO \n
- SIN VENTA
- Índice de\n
- contenidos
- SIGUIENTE
- ANTERIOR

### 04 · Unidad 1: Control de Surtido sin venta

_sin texto extraído_

### 05 · ¿Qué es el control de surtido sin venta?

- ¿Qué es el control de surtido sin venta?
- Es un reporte que, según la cantidad de días que elijas, muestra los
- productos que no se vendieron
- en ese tiempo, es decir, los que están hace varios días sin movimiento (sin ventas).
- Este análisis nos ayuda a detectar:
- Productos que no están en la góndola.
- Productos que figuran con stock, pero no están ni en la góndola ni en el depósito
- (falso stock
- Productos mal ubicados o poco visibles.
- Productos en mal estado o vencidos.
- Productos con baja rotación, es decir, productos que se venden poco o muy lentamente.
- SIGUIENTE
- ANTERIOR

### 06 · Algunos conceptos importantes

- Algunos conceptos importantes
- Veamos algunos conceptos que utilizaremos durante el curso.
- PLU/EAN
- Stock
- Falso stock
- Rotación
- Exhibición
- Surtido
- GESCOM
- SIGUIENTE
- ANTERIOR
- Continuar
- Antes de terminar la unidad vamos a repasar alguno de los conceptos vistos en esta unidad con el siguiente \n
- Mini Juego”.
- GESCOM:
- Gestión Comercial
- es el
- sistema interno
- que usamos en COTO para
- consultar reportes y ver el stock
- de cada producto, entre otras cosas.\n
- En este caso vamos a usarlo para
- armar y leer el reporte
- de surtido sin venta.
- Surtido:
- Es la
- totalidad de los productos de distintas clases
- que tenemos para vender en los diferentes
- sectores de una sucursal.
- Exhibición:
- Es cómo está presentado el producto en el salón de ventas: si está
- bien ubicado, a la altura de los ojos, con el frente visible y con precio.
- Una buena exhibición hace que el producto se vea y se venda. \r\n
- mala exhibición
- (producto no visible, dado vuelta o sin precio) puede hacer que
- no se venda aunque haya stock.
- Rotación:
- Indica qué tan rápido se vende un producto. Según cuánto se venda, cada producto tendrá una rotación:
- Alta
- \rSe vende mucho y seguido.
- Baja
- Se vende poco o muy lentamente.
- Media
- Se vende con frecuencia moderada.
- Falso stock:
- Es cuando el sistema indica que \rtenemos una cierta cantidad de unidades pero en la góndola y el depósito hay
- menos o más unidades.
- Por ejemplo:
- el sistema dice
- unidades de gaseosa, pero al contar físicamente solo hay
- . Esas
- unidades \
- falso stock
- , un error que hay que
- analizar y corregir
- En góndola
- En depósito
- Es la cantidad de unidades que tenemos de un producto, tanto en góndola como en depósito.\r\n
- si hay
- en góndola y
- en depósito, el
- stock es 16
- Stock:
- Stock total del producto
- PLU/EAN:
- Son los dos códigos que identifican a cada producto.\r\n
- PLU — código interno:
- \rEs el número que COTO le asigna a cada producto dentro de \n
- su sistema. No aparece en el envase.\n
- EAN — código de barras:
- Es el número largo que está debajo del código de barras en el envase. Es el mismo en todos los supermercados, lo pone \n
- el fabricante.
- (En el sistema)
- (En el envase)

### 07 · Mini juego

- ¡Jugá con nosotros!
- ¡Bienvenido a este \n
- mini juego
- En este juego se te van a presentar distintos conceptos y, dentro de varias respuestas, tenés que seleccionar \n
- la correcta.
- ¡Empecemos!
- Observá
- cada situación
- Pensá
- antes de elegir
- Aprendé
- mientras jugás
- ¡Terminaste el mini \n
- juego con
- éxito
- Ya sabés más en profundidad los distintos conceptos usados en Salón
- ¡Seguí aplicándolo cada día!
- 10/10
- Preguntas completadas
- 100^%^
- Del juego completado
- ¡Excelente!\n
- Respondiste con éxito todas las preguntas
- Continuar
- Es el número largo que está debajo del código de barras en el envase. Es el mismo en todos \n
- los supermercados, \n
- lo pone el fabricante.
- %_player.Puntos%
- ¿A qué concepto se refiere esta definición?
- Nivel
- Surtido
- Sobre stock
- Repasemos las reglas:\n
- Seleccioná debajo del recuadro el concepto al que se refiere la definición indicada.
- Reintentar
- ¡Restaste 5 puntos!
- Intentalo nuevamente.
- ¡Muy bien, sumaste 10 puntos!
- El EAN es el código que pone el fabricante en su producto.
- C (baia): vende poco o lento
- C (baja): Se vende poco
- C (baja): No se vende
- C (baja): No hay stock
- La rotación es qué tan rápido se vende un producto en la clase determinada. Según cuánto se vende, cada producto tiene una rotación:
- A (Alta):
- Se vende mucho y seguido
- B (Media):
- Se vende con frecuencia moderada y...
- Cada producto tiene una rotación: A (alta): vende mucho, B (media): vende con frecuencia moderada y C (baja): vende poco o lento.
- Para
- mejorar la venta de un producto
- nuestro sector entre otras opciones puede hacer..
- Pedir espacio en góndola
- Ponerlo cómo novedad
- Ponerlo en linea de cajas
- Regalar una muestra
- Para mejorar la venta de un producto podemos pedir espacio en góndola.
- Es un reporte que, según la cantidad de días que elijas, muestra
- los productos que no se vendieron en ese tiempo,
- es decir, los que están hace varios días sin movimiento (sin ventas).
- Control de\n
- GESCOM
- rotación
- exhibición
- Control de surtido sin venta
- Control de surtido sin venta es un reporte que muestra que productos no se vendieron en determinado tiempo.
- Es el número que
- Coto
- le asigna a cada producto dentro de su sistema.
- No aparece en el envase.
- Falso stock
- Stock
- El número que COTO le asigna a cada producto dentro de su sistema es \n
- el PLU

### 08 · Cómo hacemos el reporte

- Cómo hacemos el reporte
- En este video veremos
- cómo generar el reporte
- de \rsurtido sin venta en
- GESCOM
- para obtener el listado de productos que no registran ventas.
- SIGUIENTE
- ANTERIOR

### 09 · Lo que vimos en este video

- Lo que vimos en este video
- Repasemos algunos puntos importantes:
- SIGUIENTE
- ANTERIOR

### 10 · Qué hacemos con los productos

- Qué hacemos con los productos
- En este video veremos
- cómo
- verificar los productos
- del reporte en góndola y depósito, y
- qué acciones tomar
- según cada situación.
- SIGUIENTE
- ANTERIOR

### 11 · Logueo y precarga en PDA

- Lo que vimos en este video
- Repasamos cómo gestionar los productos que aparecen en el reporte de surtido sin venta:
- SIGUIENTE
- ANTERIOR

### 12 · Últimos consejos

- Últimos \n
- consejos
- Revisá los productos \n
- sin ventas.
- Tené en cuenta que no se genere un falso stock.
- Generá el reporte \n
- cada semana.
- Tomá acciones para corregir y mantener el stock correcto.
- Reportá las situaciones que puedan encontrarse.
- SIGUIENTE
- ANTERIOR

### 13 · Fin del curso

- ¡Felicitaciones!
- Completaste con éxito el curso
- “surtido sin venta”
- y ahora conocés cómo identificar productos sin ventas y qué hacer en cada caso.\r\n
- ¡Gracias por tu compromiso!
- Sos parte fundamental para mantener el orden \n
- y la correcta gestión del stock en el salón.
- Recordá que ya estás habilitado para realizar la evaluación.\n
- ¡Muchos éxitos!
- ANTERIOR
