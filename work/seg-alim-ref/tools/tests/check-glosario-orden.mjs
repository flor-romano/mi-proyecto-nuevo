/* Test de contenido — específico de este curso, no genérico.
   Verifica el reordenamiento del glosario: pedido explícito del
   cliente, "que esté ordenado no alfabeticamente sino en orden de
   aparición de las diapos, como un caminito". Antes eran 2 listas
   separadas (una sección fija "Los 3 peligros" + una lista A-Z); ahora
   es UNA sola lista, ordenada por el `data-slide-index` real de la
   diapositiva que desbloquea cada término (`data-goto`). */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const failures = [];
const { browser, page, errors } = await openCourse(url);

const info = await page.evaluate(() => {
  var indexPorSlide = {};
  document.querySelectorAll('[data-slide][data-slide-index]').forEach(function (s) {
    indexPorSlide[s.getAttribute('data-slide')] = parseInt(s.getAttribute('data-slide-index'), 10);
  });
  var dts = Array.from(document.querySelectorAll('[data-popup="glosario"] dl.d-glossary dt'));
  var secuencia = dts.map(function (dt) {
    var btn = dt.querySelector('[data-goto]');
    var goto = btn ? btn.getAttribute('data-goto') : null;
    return { term: btn ? btn.textContent.trim() : null, goto: goto, idx: indexPorSlide[goto] };
  });
  var subHeadings = document.querySelectorAll('[data-popup="glosario"] .d-glossary-sub').length;
  var listas = document.querySelectorAll('[data-popup="glosario"] dl.d-glossary').length;
  return { secuencia: secuencia, subHeadings: subHeadings, listas: listas };
});

if (info.listas !== 1) failures.push('esperaba 1 sola dl.d-glossary (lista fusionada), hay ' + info.listas);
if (info.subHeadings !== 0) failures.push('no debería quedar ningún <h4 class="d-glossary-sub"> (la fusión los sacó), quedaron ' + info.subHeadings);
if (info.secuencia.length !== 26) failures.push('esperaba 26 términos, hay ' + info.secuencia.length);

var faltanIdx = info.secuencia.filter(function (t) { return t.idx === undefined || t.idx === null; });
if (faltanIdx.length) failures.push('términos con data-goto que no matchea ninguna diapositiva real: ' + JSON.stringify(faltanIdx));

var desordenados = [];
for (var i = 1; i < info.secuencia.length; i++) {
  if (info.secuencia[i].idx < info.secuencia[i - 1].idx) {
    desordenados.push(info.secuencia[i - 1].term + ' (idx ' + info.secuencia[i - 1].idx + ') antes que ' + info.secuencia[i].term + ' (idx ' + info.secuencia[i].idx + ')');
  }
}
if (desordenados.length) failures.push('el glosario no está en orden de aparición de las diapos: ' + JSON.stringify(desordenados));

// El primer término tiene que ser el de la diapositiva más temprana
// del curso que tenga término asociado (hoy: "Inocuidad", diapo 5).
if (info.secuencia[0] && info.secuencia[0].term !== 'Inocuidad') {
  failures.push('esperaba que el primer término fuera "Inocuidad" (la diapo más temprana con término), fue "' + info.secuencia[0].term + '"');
}

if (errors.length) failures.push('errores de consola: ' + errors.join(' | '));
await browser.close();
report('glosario-orden-de-aparicion', failures);
