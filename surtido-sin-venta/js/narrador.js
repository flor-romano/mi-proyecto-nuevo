/* ============================================================
   narrador.js · Wrapper genérico de Web Speech API (narración por voz)
   kit-base v1.7 · Área Aprendizaje (COTO) — genérico, sin contenido
   de curso. Copiar tal cual a cada curso nuevo, sin editar.
   ------------------------------------------------------------
   Extraído de curso.js del curso base ("Surtido sin venta") — ahí
   vivía mezclado con el contenido del curso por historia, pero no
   leía nada específico (ningún ID de diapositiva, ningún texto propio):
   selección de voz, velocidad, on/off persistente y el mecanismo de
   corrección fonética son 100% reutilizables. Ver CLAUDE.md §1 (regla
   de "si no lee nada del curso, va en el motor genérico") y §6.5
   (tabla fonética oficial del Manual de Contenido, ya cargada acá
   como diccionario BASE).

   Responsabilidad: hablar texto en voz alta con la voz/velocidad
   preferida, con corrección fonética de siglas/términos técnicos, y
   EXTRAER de un contenedor el texto real accesible que corresponde
   narrar (`textOf`, sumado en v1.7 — antes cada curso reescribía su
   propio `slideText()` y volvía a tropezar con los mismos 4 bugs, ver
   los comentarios de la función).
   NO decide CUÁNDO narrar ni QUÉ contenedor pasarle — eso sigue siendo
   trabajo de curso.js / coto-ui.js.

   API pública (window.Narrador):
     - speak(text, kind)      habla `text` (cancela lo anterior en curso)
     - textOf(container)      texto real accesible de una diapo/panel/pop-up
     - addTextSel(sel)        suma selectores propios del curso a textOf
     - speechify(text)        aplica solo la corrección fonética, sin hablar
     - addFixes(pairs)        suma reemplazos fonéticos propios del curso
                               (pairs: [[RegExp, 'reemplazo'], ...])
     - cancel()                corta la narración actual
     - isNarrating()           true si el narrador está activado (toggle)
     - setNarrating(bool)      prende/apaga, persiste en localStorage
     - pickVoice()             expuesto para el selector manual de voz
     - setManualVoice(v)       fija una voz elegida a mano, persiste
     - setNarrateTitles(bool)  opt-in por curso: narrar [data-slide-title]
                               (por default NO se narra, ver textOf())
     - seek(i)                 salta a la frase `i` de la narración EN
                               CURSO (mismo fragmentado de chunkText —
                               es la granularidad real posible, ver
                               CLAUDE.md §6.55: Web Speech API no da
                               precisión de palabra confiable)
     - repeat()                vuelve a narrar desde la frase 0 lo
                               último dicho (funciona aunque ya haya
                               terminado, no solo a mitad de camino)
     - progreso()              { index, total, terminado } de la
                               narración actual, o null si no hay
                               ninguna — para pintar el panel de
                               "Locución" (coto-player.js)
   Eventos: dispara `slidenarrationend` en `document` cuando termina de
   hablar un texto marcado `kind:'slide'` (lo escucha "Reproducir todo").
   Dispara `narracionprogreso` en `document` con `detail` = el mismo
   objeto de `progreso()` (o `null`) cada vez que arranca una frase
   nueva, termina, o se corta desde afuera — lo escucha el panel de
   "Locución" para pintar la línea de tiempo en vivo.
   ============================================================ */
(function (global) {
  'use strict';

  var LS_NARRATE = 'coto-diapos-narrate';
  var LS_VOICE = 'coto-diapos-voice';
  var LS_RATE = 'coto-diapos-rate';

  /* "Sonido" pasa a gobernar también el volumen de la locución (kit-base
     v1.9.40) — mismo criterio que ya fijó §6.44 punto 9 para el mute
     ("Sonido mutea TODO, video incluido"), completado acá para el nivel.
     Una segunda barra propia de Locución sería un segundo control para
     lo mismo: se desincronizan entre sí y obligan a bajar el volumen dos
     veces. Los dos helpers son copia local del mismo patrón que ya usan
     coto-player.js/coto-media.js/coto-ui.js/fx.js — cada archivo del kit
     es copy-paste autocontenido, no un módulo compartido (criterio ya
     fijado, ver comentario de `volumeLevel()` en coto-ui.js). */
  function volumeLevel() {
    try {
      var v = parseFloat(global.localStorage.getItem('coto-diapos-volume'));
      return isNaN(v) ? 1 : Math.min(1, Math.max(0, v));
    } catch (e) { return 1; }
  }
  function muted() {
    try { return global.localStorage.getItem('coto-diapos-mute') === '1'; } catch (e) { return false; }
  }
  function volumenEfectivo() { return muted() ? 0 : volumeLevel(); }

  var narrating = true;
  try { narrating = global.localStorage.getItem(LS_NARRATE) !== '0'; } catch (e) {}
  var voiceCache = null;
  var manualVoiceKey = null;
  try { manualVoiceKey = global.localStorage.getItem(LS_VOICE) || null; } catch (e) {}
  // Factor MANUAL sobre la velocidad ya calculada por voz (ver speak()) —
  // arranca en 1 (sin cambio) para que un alumno que nunca toca el control
  // reciba exactamente el ritmo ya afinado por voz/dispositivo de siempre
  // (1.15x/1.0x/1.22x según isHighQualityVoice). Es un MULTIPLICADOR, no un
  // valor absoluto, justamente para no pisar ese ajuste fino ya probado.
  var rateFactor = 1;
  try {
    var savedRate = parseFloat(global.localStorage.getItem(LS_RATE));
    if (!isNaN(savedRate)) rateFactor = Math.min(1.3, Math.max(0.75, savedRate));
  } catch (e) {}
  function setRateFactor(f) {
    rateFactor = Math.min(1.3, Math.max(0.75, Number(f) || 1));
    try { global.localStorage.setItem(LS_RATE, String(rateFactor)); } catch (e) {}
  }
  function getRateFactor() { return rateFactor; }
  function voiceKey(v) { return v.name + '|' + v.lang; }

  // [data-slide-title] (el <h2 class="sr-only"> de cada diapositiva) NO
  // se narra por default — decisión histórica de "Surtido sin venta"
  // (CLAUDE.md §5): sonaba redundante narrar el título Y el cuerpo. Pero
  // ese título casi siempre es el MISMO texto que la píldora horneada en
  // el arte (ej. "Alteración", "Temperatura alimentaria") — un curso
  // puede querer que SÍ se lea, para anunciar el tema antes del cuerpo.
  // Opt-in por curso, no default nuevo: `Narrador.setNarrateTitles(true)`
  // en el propio curso.js, sin tocar el comportamiento de ningún otro.
  var narrarTitulos = false;
  function setNarrateTitles(v) { narrarTitulos = !!v; }

  // El cliente probó varias voces (selector manual, ver initVoicePicker en
  // curso.js) y eligió "Google español de Estados Unidos" (es-US) como la
  // que más le gustó — se prioriza esa por defecto para todos los alumnos.
  // Si el navegador no la tiene, se cae en la cadena de siempre: es-AR
  // primero (más cercana a es-US que la de España), después variantes
  // latinoamericanas, y por último cualquier es-*. Dentro de cada nivel,
  // si hay más de una voz, prefiere una que suene a motor "neural"/online
  // (mejor calidad) sobre la clásica del sistema. Todo esto es "mejor
  // esfuerzo": depende de qué voces tenga el dispositivo del alumno — por
  // eso también existe el selector manual, que le gana siempre a esta
  // elección automática.
  // "Calidad conocida" = la voz probada a mano por el cliente en un
  // curso real (Google es-US), o cualquier voz que el navegador/SO
  // marca como motor neural/online (suenan naturales a velocidad
  // normal-alta). Todo lo demás es una voz de RESPALDO nunca probada a
  // mano — bug real encontrado en "Surtido sin venta": con rate fijo
  // en 1.15 SIEMPRE, en un dispositivo sin la voz preferida (ej. una
  // tablet sin el motor de Google) caía en una voz de respaldo (a
  // veces de hombre, a veces un motor más básico) que a 1.15x sonaba
  // atropellada — la velocidad se había probado y ajustado SOLO contra
  // la voz preferida, no contra el resto. Ver speak(): el rate ahora
  // depende de esto, no es un número fijo.
  function isHighQualityVoice(v) {
    if (!v) return false;
    if (/^es-US/i.test(v.lang) && /google/i.test(v.name)) return true;
    return /natural|neural|online|wavenet|premium|plus|multilingual|enhanced/i.test(v.name);
  }
  // "¿Es tablet?" con un criterio simple y suficiente para esto: puntero
  // touch (no mouse fino) + pantalla no-chica — separa iPad/Android
  // tablet de un celular (que también es `pointer:coarse` pero mucho más
  // angosto) sin necesidad de sniffear el user-agent.
  function esTablet() {
    try {
      return global.matchMedia('(pointer:coarse)').matches &&
        Math.min(global.screen.width, global.screen.height) >= 600;
    } catch (e) { return false; }
  }
  function pickVoice() {
    if (!('speechSynthesis' in global)) return null;
    var voices = global.speechSynthesis.getVoices();
    if (!voices.length) return null;
    if (manualVoiceKey) {
      var manual = voices.find(function (v) { return voiceKey(v) === manualVoiceKey; });
      if (manual) return manual;
    }
    if (voiceCache) return voiceCache;
    /* En tablet, pedido real de cliente (probado en iPad, "Prevención
       cardiovascular"): preferir "Paulina" (es-MX) y, si el dispositivo
       no la tiene, "Mónica" (es-ES) — sonaron mejor ahí que la voz de
       respaldo genérica que tocaba antes. Va ANTES de cualquier otra
       preferencia: en tablet gana esta. */
    if (esTablet()) {
      var paulina = voices.find(function (v) { return /paulina/i.test(v.name); });
      if (paulina) { voiceCache = paulina; return voiceCache; }
      var monica = voices.find(function (v) { return /m[oó]nica/i.test(v.name); });
      if (monica) { voiceCache = monica; return voiceCache; }
    }
    /* Preferencia general (no tablet, o tablet sin Paulina/Mónica):
       pedido explícito del cliente — español argentino/latinoamericano
       ANTES que el de Estados Unidos. "Google español de Estados
       Unidos" (es-US) sigue siendo una voz real y probada por el
       cliente (CLAUDE.md §6.7), pero pasa a ser el RESPALDO: si el
       dispositivo tiene una voz es-AR o es-419 razonable, esa gana; si
       no, se cae en la de siempre — nunca en silencio, nunca en una
       voz peor de lo que ya había.
       No se hardcodea ningún nombre de voz por navegador/SO a
       propósito: el catálogo de voces depende del paquete de idioma
       instalado en CADA dispositivo, no del navegador — un nombre que
       "hoy" existe en una versión de Windows/Android puede no estar en
       otra. Se busca por código de idioma (estable), con la MISMA
       detección de "calidad" (`isHighQualityVoice`) que ya usa el
       resto de la cadena, así que se adapta sola a lo que el
       dispositivo real tenga. */
    var tiers = [/^es-AR/i, /^es-419/i, /^es-US/i, /^es-UY/i, /^es-CL/i, /^es-MX/i, /^es/i];
    for (var i = 0; i < tiers.length; i++) {
      var matches = voices.filter(function (v) { return tiers[i].test(v.lang); });
      if (!matches.length) continue;
      // Dentro del nivel es-US puntual, "Google" sigue siendo la marca
      // que el cliente probó y eligió a propósito — se respeta ese
      // matiz aunque el nivel ya no sea el primero de la cadena.
      if (/es-US/.test(tiers[i].source)) {
        voiceCache = matches.find(function (v) { return /google/i.test(v.name); }) || matches.find(isHighQualityVoice) || matches[0];
      } else {
        voiceCache = matches.find(isHighQualityVoice) || matches[0];
      }
      return voiceCache;
    }
    return null;
  }
  if ('speechSynthesis' in global) {
    // Chrome (entre otros) carga la lista de voces de forma asíncrona: en
    // la primera llamada getVoices() puede devolver vacío. Se limpia el
    // cache automático cuando avisa que ya están listas.
    global.speechSynthesis.addEventListener('voiceschanged', function () { voiceCache = null; });
  }

  // Web Speech API no soporta SSML/fonemas: la única forma de corregir
  // cómo suena una sigla/término es reescribirlo en el texto que se manda
  // a hablar (nunca se toca el alt/texto visible, solo esta copia "para
  // el oído"). Base = tabla oficial del Manual de Contenido (ver
  // CLAUDE.md §6.5) — cada curso suma sus propios términos con
  // `Narrador.addFixes([[/\bpalabra\b/gi, 'como se pronuncia'], ...])`.
  var SPEECH_FIXES = [
    [/\bticket\b/gi, 'tíquet'],
    [/\benter\b/gi, 'énter'],
    [/\bdni\b/gi, 'deneí'],
    [/\bmultistore\b/gi, 'múltiestór'],
    [/\bok\b/gi, 'okéy'],
    [/\bvoucher\b/gi, 'váucher'],
    [/\bcrm\b/gi, 'ce erre eme'],
    [/\bpower apps\b/gi, 'pábuer áps'],
    [/\bcall center\b/gi, 'col sénter'],
    [/\bonline\b/gi, 'onláin'],
    [/\bsts\b/gi, 'ese te ese'],
    [/\bweb\b/gi, 'güeb'],
    /* "pe ele ú", no "pe ele uh" (kit-base v1.9.71, §7.17): la "uh"
       sale como una duda, no como el nombre de la letra. Lo venía
       pisando a mano cada curso de retail que usa PLU — o sea, la
       corrección estaba en el lugar equivocado. */
    [/\bplu\b/gi, 'pe ele ú'],
    /* Rutas de menú tipo "GESCOM > Consulta de Sets": al oído el ">"
       tiene que ser una pausa, no un símbolo leído ni un silencio. */
    [/\s*>\s*/g, ', '],
    [/\bcashback\b/gi, 'cáshback'],
    [/\bpin ?pad\b/gi, 'pínpad'],
    [/\bcontactless\b/gi, 'cóntact les'],
    [/\bnfc\b/gi, 'ene efe ce'],
    /* Códigos numéricos leídos como CANTIDADES — en un curso sobre
       códigos es el peor error posible: "607054" salía "seiscientos
       siete mil cincuenta y cuatro", que no le sirve a nadie que tenga
       que tipear ese número. Se separan en dígitos por largo exacto,
       de 5 a 8, que es el rango de los códigos que se leen en voz alta
       (artículo, sucursal, PLU).
       ARRANCA EN 5 Y NO EN 4 por un motivo concreto: un AÑO son cuatro
       dígitos con `\b` de los dos lados, así que una regla de 4 haría
       que "en 2026" se narre "en 2 0 2 6". Se probó y pasaba. De 5 en
       adelante no hay cantidad de uso corriente en estos cursos que
       colisione; un precio o un porcentaje quedan por debajo, y un
       número dentro de una palabra no matchea por los `\b`.
       Si un curso igual tiene un número de 5+ que ES una cantidad, lo
       resuelve con `addFixes()`, que se inserta ANTES que esta tabla.
       Van al FINAL de la tabla a propósito: cualquier `addFixes()` del
       curso se inserta antes y puede pisar un código puntual. */
    [/\b(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)\b/g, '$1 $2 $3 $4 $5 $6 $7 $8'],
    [/\b(\d)(\d)(\d)(\d)(\d)(\d)(\d)\b/g, '$1 $2 $3 $4 $5 $6 $7'],
    [/\b(\d)(\d)(\d)(\d)(\d)(\d)\b/g, '$1 $2 $3 $4 $5 $6'],
    [/\b(\d)(\d)(\d)(\d)(\d)\b/g, '$1 $2 $3 $4 $5']
  ];
  function addFixes(pairs) {
    if (!pairs || !pairs.length) return;
    // se insertan ANTES de la base: un término propio del curso puede
    // necesitar pisar/afinar una entrada genérica (ej. un curso que sí
    // quiera decir "GESCOM" de una forma puntual), y el primer match de
    // `speechify` gana porque cada regla ya reemplazó el texto para
    // cuando la siguiente corre sobre lo que quedó.
    SPEECH_FIXES = pairs.concat(SPEECH_FIXES);
  }
  // Los emoji NUNCA se narran (pedido real de un cliente, "Prevención
  // cardiovascular"): sin esto, Web Speech API lee "🏆" como "trofeo" o
  // el nombre Unicode completo según la voz/SO — ruido que no aporta
  // nada al oído aunque se vea bien en pantalla. \p{Extended_Pictographic}
  // cubre la enorme mayoría (incluye el emoji base + su selector de
  // variación FE0F + secuencias ZWJ tipo 👨‍👩‍👧); los indicadores
  // regionales (banderas, pares de 2 letras U+1F1E6-1F1FF) van aparte
  // porque no son "pictográficos" para Unicode. Nunca toca el texto/alt
  // visible, solo la copia que se narra (mismo criterio que SPEECH_FIXES).
  function stripEmojis(text) {
    return text
      .replace(/\p{Extended_Pictographic}(️)?(‍\p{Extended_Pictographic}(️)?)*/gu, '')
      .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }
  function speechify(text) {
    text = stripEmojis(text);
    SPEECH_FIXES.forEach(function (pair) { text = text.replace(pair[0], pair[1]); });
    return text;
  }

  // Contador de "generación": cada cancel() lo incrementa, así cualquier
  // fragmento que todavía estuviera encolado sabe que ya no corresponde
  // hablarlo. Reemplaza al flag _cancelled de una sola utterance, que no
  // alcanzaba desde que una narración puede ser una CADENA de fragmentos.
  var speakGen = 0;
  function cancel() {
    var synth = global.speechSynthesis; if (!synth) return;
    speakGen++;
    synth.cancel();
    // Si algo interrumpe la narración desde AFUERA (un video que
    // arranca, cambiar de diapositiva) el panel de "Locución" tiene
    // que dejar de mostrar "En curso" — pero sin borrar `estadoActual`:
    // "Repetir" tiene que seguir pudiendo repetir lo último narrado.
    if (estadoActual && !estadoActual.terminado) {
      estadoActual.terminado = true;
      emitirProgreso();
    }
  }

  /* ---- Fragmentado del texto (bug real de Chrome) ----
     Chrome corta la síntesis de voz alrededor de los 15 segundos cuando se
     le pasa una utterance larga: deja de hablar en la mitad de la frase,
     sin error ni evento de fin. Es un bug conocido del motor, no del
     código. Como una diapositiva de este molde narra un párrafo entero
     (fácil 400-700 caracteres, bastante más de 15s), la locución se
     cortaba a mitad de camino en TODAS las diapositivas largas.
     Solución estándar: partir el texto en fragmentos cortos y encolarlos
     uno atrás de otro — cada utterance queda muy por debajo del límite y
     el navegador las encadena sin pausa audible. Se corta por oración
     (respetando el punto/la coma) para que la prosodia no se rompa.
     Sin lookbehind en la regex a propósito: Safari recién lo soporta
     desde 16.4 y estos cursos se abren en el navegador que tenga el LMS
     del cliente. */
  function chunkText(text, max) {
    max = max || 180;
    var oraciones = text.match(/[^.!?:;]+[.!?:;]*\s*/g) || [text];
    var chunks = [], buf = '';
    oraciones.forEach(function (o) {
      if ((buf + o).length <= max) { buf += o; return; }
      if (buf.trim()) chunks.push(buf.trim());
      buf = '';
      if (o.length <= max) { buf = o; return; }
      // una sola oración más larga que el máximo: cortar por coma, y si no
      // hay, por el último espacio antes del límite (nunca a mitad de palabra)
      var resto = o;
      while (resto.length > max) {
        var corte = resto.lastIndexOf(',', max);
        if (corte < max * 0.5) corte = resto.lastIndexOf(' ', max);
        if (corte <= 0) corte = max;
        chunks.push(resto.slice(0, corte + 1).trim());
        resto = resto.slice(corte + 1);
      }
      buf = resto;
    });
    if (buf.trim()) chunks.push(buf.trim());
    return chunks.filter(Boolean);
  }

  /* ---- Estado de la narración EN CURSO (para el panel de "Locución" —
     línea de tiempo + repetir, coto-player.js) ----
     `estadoActual` guarda los fragmentos (`trozos`) de la última
     llamada a `speak()`, no solo mientras habla: así "Repetir" sigue
     funcionando después de que terminó, no solo a mitad de camino.
     Se reemplaza ENTERO en la siguiente llamada a `speak()` (nueva
     diapositiva, nuevo feedback) — nunca se mezclan dos narraciones.
     `seek(i)`/`repeat()` son las únicas formas de volver a hablar
     SOBRE el mismo texto ya trozado, sin re-fragmentarlo de nuevo. */
  var estadoActual = null; // { trozos, v, rate, kind, index, terminado } | null

  function emitirProgreso() {
    document.dispatchEvent(new CustomEvent('narracionprogreso', {
      detail: estadoActual ? {
        index: estadoActual.index,
        total: estadoActual.trozos.length,
        terminado: !!estadoActual.terminado
      } : null
    }));
  }

  function hablarDesde(i) {
    var synth = global.speechSynthesis;
    if (!synth || !estadoActual) return;
    var gen = speakGen;
    var trozos = estadoActual.trozos;
    i = Math.max(0, Math.min(i, trozos.length));
    estadoActual.index = i;
    estadoActual.terminado = i >= trozos.length;
    emitirProgreso();
    if (estadoActual.terminado) {
      // aviso genérico "terminó la narración de la diapo" — lo escucha un
      // eventual modo "Reproducir todo" del curso para avanzar solo.
      if ((estadoActual.kind || 'other') === 'slide') document.dispatchEvent(new CustomEvent('slidenarrationend'));
      return; // OJO: no se borra estadoActual acá — "Repetir" lo sigue usando
    }
    var u = new SpeechSynthesisUtterance(trozos[i]);
    if (estadoActual.v) u.voice = estadoActual.v;
    u.lang = (estadoActual.v && estadoActual.v.lang) || 'es-AR';
    u.rate = estadoActual.rate;
    u.pitch = 1;
    /* Se lee en CADA fragmento a propósito: una locución larga se parte
       en varios utterances (chunkText), así que mover el slider a mitad
       de una narración se escucha en el fragmento SIGUIENTE, no recién
       en la próxima diapositiva. */
    u.volume = volumenEfectivo();
    u.onend = function () { if (gen === speakGen) hablarDesde(i + 1); };
    u.onerror = function () { if (gen === speakGen) hablarDesde(i + 1); }; // que un fragmento falle no debe colgar la cadena
    synth.speak(u);
  }

  function speak(text, kind) {
    var synth = global.speechSynthesis; if (!synth) return;
    cancel();
    estadoActual = null;
    if (!narrating || !text) { emitirProgreso(); return; }
    var v = pickVoice();
    // 1.15x SOLO con una voz de calidad conocida (ver isHighQualityVoice)
    // — con una voz de respaldo no probada, 1.0x (ritmo normal) es la
    // apuesta segura: mejor una locución un poco más lenta que una que
    // suene atropellada o ilegible en el dispositivo de un alumno.
    // Paulina (es-MX, preferida en tablet — ver pickVoice) es la
    // excepción: probada en iPad sonaba levemente "cortada" a 1.15x: un
    // poco más rápido (1.22x) la despega de esos cortes en vez de
    // agravarlos — hallazgo real probando, no una regla general.
    var rate = (/paulina/i.test((v && v.name) || '') ? 1.22 : (isHighQualityVoice(v) ? 1.15 : 1.0)) * rateFactor;
    var trozos = chunkText(speechify(text), 180);
    if (!trozos.length) { emitirProgreso(); return; }
    estadoActual = { trozos: trozos, v: v, rate: rate, kind: kind, index: 0, terminado: false };
    hablarDesde(0);
  }

  /* `seek(i)`/`repeat()` — para la línea de tiempo del panel de
     "Locución": saltan a la FRASE `i` (el mismo fragmentado de
     `chunkText`, CLAUDE.md §6.55 — Web Speech API no da precisión de
     palabra confiable con voces de red). No re-narran nada si no hay
     una narración activa (`estadoActual === null`, ej. recién cargó
     la página) — el panel deshabilita sus controles en ese caso, esto
     es la garantía del lado del motor. */
  function seek(i) {
    if (!estadoActual || !narrating) return;
    cancel(); // corta lo que esté sonando (sube speakGen)
    hablarDesde(i);
  }
  function repeat() {
    if (!estadoActual) return;
    seek(0);
  }
  /* `volume` de un SpeechSynthesisUtterance NO se puede tocar en caliente
     sobre uno que ya está sonando — la única forma de aplicar un volumen
     nuevo a lo que ya se está narrando es re-emitirlo desde el fragmento
     actual. Pensado para el gesto de MUTE (discreto: quien lo toca
     espera silencio ya) — nunca para el `input` continuo del slider,
     donde re-emitir en cada píxel cortaría la frase en seco. */
  function refreshVolume() {
    if (!estadoActual || estadoActual.terminado || !narrating) return;
    seek(estadoActual.index);
  }
  function progreso() {
    if (!estadoActual) return null;
    return { index: estadoActual.index, total: estadoActual.trozos.length, terminado: !!estadoActual.terminado };
  }

  function isNarrating() { return narrating; }
  function setNarrating(v) {
    narrating = !!v;
    try { global.localStorage.setItem(LS_NARRATE, narrating ? '1' : '0'); } catch (e) {}
    if (!narrating) cancel();
  }
  function setManualVoice(v) {
    manualVoiceKey = v ? voiceKey(v) : null;
    voiceCache = null;
    try {
      if (manualVoiceKey) global.localStorage.setItem(LS_VOICE, manualVoiceKey);
      else global.localStorage.removeItem(LS_VOICE);
    } catch (e) {}
  }

  /* ---- Texto real accesible de una diapositiva/panel/pop-up ----
     4 bugs reales, encontrados uno por uno en cursos distintos, que
     esta función ya trae resueltos (por eso subió al kit: cada curso
     los volvía a tropezar al escribir su propio slideText()):

     1. NODOS OCULTOS. Los paneles [data-panel] de las capas siguen en
        el DOM con [hidden] y `textContent` los devuelve igual. Sin el
        filtro `:not(closest('[hidden]'))`, entrar a una diapo de capas
        narraba TODOS los paneles seguidos (la consigna + los 7
        factores) en vez del visible.
     2. TÍTULO DE DIAPOSITIVA. No se narra [data-slide-title] por
        DEFAULT (CLAUDE.md §5: no leer títulos repetidos dentro del
        propio texto — decisión de un cliente anterior: "solo el
        contenido explícito"). Antes de esa corrección se narraba el h2
        de cada diapositiva. Un curso distinto puede querer lo
        contrario — ver `setNarrateTitles()` más arriba.
     3. NÚMERO DE PREGUNTA. `.d-q-num` va pegado al enunciado sin
        espacio (los separa el CSS), así que sin sacarlo se narraba
        "1¿Con qué muestra…" como una sola palabra.
     4. NÚMEROS ANIMADOS. Los `[data-count-to]` cuentan de 0 a N con
        animación y la narración arranca junto con ella, así que leía el
        valor INICIAL: un pop-up de estadística se narraba "se puede
        disminuir 0% de la mortalidad" en vez de 50%. Se usa el valor
        final declarado en el atributo, que no depende del frame.

     5. GRILLA DE TIPS DE "AYUDA" MUDA. `.d-instr-item` (el patrón
        genérico del kit para la grilla de 2-5 tips de "Ayuda" —
        `coto-base-addendum-v1.8.css`, ej. "Tarjetas y flechas",
        "Video") vive en `<span>/<small>` sueltos dentro de un `<div>`,
        ninguno de los tags que ya se narraban — así que en CUALQUIER
        curso que use este patrón (no es nuevo de "Seguridad
        alimentaria", es del boilerplate) esos tips quedaban mudos,
        aunque el resto del panel de "Ayuda" sí se narrara. Sumado a
        TEXT_SEL, con el mismo cuidado del punto 3 (separar título y
        nota con un punto, si no se narran pegados).

     Además, el propio contenedor cuenta si él mismo es un nodo de los
     que narramos: hace falta al acotar la narración a un solo elemento
     (ver [data-narrate-only] en coto-ui.js) — pasarle un <p> y buscar
     'p' adentro no devuelve nada.

     Las limpiezas se hacen SIEMPRE sobre una copia, nunca sobre el DOM
     real: el texto visible/accesible no se toca (CLAUDE.md §5). */
  var TEXT_SEL = 'h2, p, dt, dd, li, .d-q-title, .d-opt-text, .d-quiz-fb, .d-quiz-result, .who, .d-cert-note, .d-instr-item';
  function addTextSel(sel) { if (sel) TEXT_SEL += ', ' + sel; }
  /* BUG REAL ("Seguridad alimentaria", diapo "inocuidad"): la locución
     sigue el orden del DOM, pero un panel de hint/cartel de una
     interacción-hotspot (`.d-info-panel`) tiene que vivir DENTRO de
     `.d-shot` para que `_initShots()` lo posicione contra el arte
     (motor-slides.js) — y ese `.d-shot` siempre cierra ANTES del
     `.sr-only` con el texto real de la diapo, que vive afuera. Result:
     "Tocá el ícono para..." se narraba ANTES del contenido, no después
     como corresponde (título → info → indicación de qué hacer). No es
     un problema de ESTA diapo — cualquier hotspot con hint/cartel
     tiene la misma tensión posición-vs-orden. Fix general: un
     contenedor puede marcarse `[data-narrate-last]` (ver
     `.d-info-panel` en el curso) y acá se lo empuja al final de la
     narración sin importar dónde vive en el DOM, preservando el orden
     relativo DENTRO de cada grupo. */
  /* BUG REAL encontrado en "Seguridad alimentaria": las 4 diapositivas
     de video de fondo (portada + 3 separadores de unidad) tienen un
     `<p>` real dentro de su `.sr-only` (la frase de portada, "Arranca
     la Unidad N...") — `speakSlide()` lo lee igual que cualquier otro
     párrafo, así que al entrar arrancaban DOS audios a la vez: la
     locución leyendo esa frase y el video reproduciéndose con su
     propio sonido (una vez que el navegador permite el autoplay con
     audio, típicamente inmediato tras el gesto de "Siguiente"). Es
     exactamente lo que CLAUDE.md §5 prohíbe ("una diapositiva que ES
     un video no se narra... narrar encima sería contraproducente") —
     pero esa regla vivía solo como convención de contenido (no meter
     un `<p>` narrable ahí), nunca aplicada por el código. Los otros 3
     patrones de video (`initVideoPlayer`/pop-up, `initPopupVideos`/
     `initLayerVideos`, `initInlineCircleVideos`) sí cortan la locución
     antes de reproducir (`Narrador.cancel()`, coto-media.js) — el de
     fondo (`initBgVideos`) es el único que no compite con nada porque
     nunca se pensó que fuera a haber un `<p>` narrable ahí adentro.
     Fix a la raíz, acá en `textOf()` (no en cada curso): una diapositiva
     `.d-shot-slide--bg-video` nunca se narra al nivel de "toda la
     diapositiva" (la llamada de `speakSlide`) — su `.sr-only` sigue
     ahí, íntegro, para un lector de pantalla real, que no pasa por
     `textOf()`. Un pop-up abierto DESDE una diapo de video (otro
     `container`, no la `<section>` misma) sigue narrando normal. */
  function textOf(container) {
    if (!container) return '';
    if (container.classList && container.classList.contains('d-shot-slide--bg-video')) return '';
    var propios = container.matches && container.matches(TEXT_SEL) ? [container] : [];
    var nodos = propios.concat(Array.prototype.slice.call(container.querySelectorAll(TEXT_SEL)))
      .filter(function (n) {
        return (narrarTitulos || !n.hasAttribute('data-slide-title')) && !n.closest('[hidden]');
      });
    var normal = nodos.filter(function (n) { return !n.closest('[data-narrate-last]'); });
    var ultimo = nodos.filter(function (n) { return n.closest('[data-narrate-last]'); });
    var todos = normal.concat(ultimo);
    var partes = todos
      .map(function (n) {
        var txt;
        if (n.querySelector('.d-q-num') || n.querySelector('[data-count-to]')) {
          var clone = n.cloneNode(true);
          var num = clone.querySelector('.d-q-num'); if (num) num.remove();
          Array.prototype.forEach.call(clone.querySelectorAll('[data-count-to]'), function (c) {
            c.textContent = c.getAttribute('data-count-to');
          });
          txt = clone.textContent.trim();
        } else if (n.querySelector('small')) {
          // `.d-instr-item` (grilla de tips de "Ayuda", CLAUDE.md §6.54
          // punto 4) trae <span>Título<small>ayuda corta</small></span>
          // — el título y la nota van pegados sin espacio (los separa
          // el CSS), así que sin esto se narraba "Videoen 'El
          // proceso...'" como una sola palabra. Mismo patrón que
          // `.d-q-num` de arriba: clonar y separar ANTES de leer el
          // texto, nunca tocar el DOM real.
          var clone2 = n.cloneNode(true);
          Array.prototype.forEach.call(clone2.querySelectorAll('small'), function (s) {
            s.textContent = '. ' + s.textContent;
          });
          txt = clone2.textContent.trim();
        } else {
          txt = n.textContent.trim();
        }
        /* `[data-narrate-prefix="..."]` — un nodo puede pedir que su
           texto se anuncie con un prefijo hablado (ej. una pregunta de
           Verdadero/Falso: el texto VISIBLE es la afirmación sola —
           "Verdadero"/"Falso" son botones al lado, no texto — pero por
           voz, sin ver la pantalla, sonaba como un dato suelto en vez
           de algo que hay que responder). Nunca toca el texto/alt
           visible (CLAUDE.md §5): es puramente lo que se dice de más,
           mismo criterio que `speechify()`. */
        var prefijo = n.getAttribute && n.getAttribute('data-narrate-prefix');
        return (prefijo && txt) ? (prefijo + ': ' + txt) : txt;
      });
    /* BUG REAL, encontrado auditando "Seguridad alimentaria" a pedido
       del cliente ("que la narración sea clara y con sentido"): con
       `setNarrateTitles` prendido, 6 de las 26 diapositivas decían el
       título DOS VECES SEGUIDAS ("Introducción. Introducción. En
       COTO..."). Causa: esos párrafos ya arrancaban anunciando el tema
       en palabras ("Introducción. En COTO trabajamos...") — escritos
       en una época en que el título nunca se narraba, así que el
       propio texto hacía ese trabajo. Prender el título no le avisó a
       esos párrafos que ya no hacía falta. Fix: si el primer fragmento
       es el título (`setNarrateTitles` on) y el fragmento siguiente
       ARRANCA repitiendo el mismo texto como su propia primera
       oración, se recorta esa apertura duplicada del segundo
       fragmento — nunca el título en sí, y nunca el texto VISIBLE
       (CLAUDE.md §5), solo lo que se dice de más. Diapositivas donde
       el cuerpo NO repite el título (la mayoría) quedan intactas: la
       comparación no encuentra coincidencia y no recorta nada. */
    if (narrarTitulos && todos[0] && todos[0].hasAttribute('data-slide-title') && partes[1]) {
      partes[1] = quitarAperturaRepetida(partes[1], partes[0]);
    }
    /* Unir con ". " SOLO si el fragmento no viene ya cerrado
       (kit-base v1.9.71, §7.17). El `join('. ')` incondicional de
       antes generaba "...correctamente.. Objetivos de aprendizaje." en
       cada límite entre dos nodos narrados — o sea, en TODO curso que
       escriba sus párrafos como prosa normal, que es la forma natural.
       No rompe nada (un motor de síntesis lee ".." como una pausa un
       poco más larga), pero no es prolijo y ensucia cualquier lectura
       del texto narrado. */
    return partes.filter(Boolean).reduce(function (acc, frag) {
      if (!acc) return frag;
      return acc + (/[.!?…:;]$/.test(acc) ? ' ' : '. ') + frag;
    }, '');
  }
  function quitarAperturaRepetida(texto, titulo) {
    function limpiarBordes(s) {
      return (s || '').replace(/^[¡¿\s]+/, '').replace(/[\s.!?]+$/, '').toLowerCase();
    }
    var tit = limpiarBordes(titulo);
    if (!tit) return texto;
    var m = texto.match(/^([^.!?]*[.!?]+)\s*/);
    if (!m) return texto;
    if (limpiarBordes(m[1]) === tit) return texto.slice(m[0].length);
    return texto;
  }

  global.Narrador = {
    speak: speak,
    textOf: textOf,
    addTextSel: addTextSel,
    speechify: speechify,
    addFixes: addFixes,
    cancel: cancel,
    isNarrating: isNarrating,
    setNarrating: setNarrating,
    pickVoice: pickVoice,
    setManualVoice: setManualVoice,
    setNarrateTitles: setNarrateTitles,
    setRateFactor: setRateFactor,
    getRateFactor: getRateFactor,
    seek: seek,
    repeat: repeat,
    progreso: progreso,
    refreshVolume: refreshVolume
  };
})(window);
