#!/usr/bin/env node
/* visor-zoom.mjs — kit-base v1.9.79
   ------------------------------------------------------------
   POR QUÉ EXISTE (§7.25 B7). Los tests del kit miraban que el zoom
   EXISTA, nunca cómo PROGRESA. Un curso tenía el piso escrito a mano en
   100% cuando el real —el que hace entrar la hoja— era 64%: el primer
   clic en "+" saltaba de 64% a 125%, o sea se salteaba el escalón que
   el alumno esperaba.

   Es la familia de §7.21 trampa 5: **un número que describe el render
   se mide contra el render, nunca se escribe.** Y no da error: el zoom
   funciona, solo que mal.

   Qué verifica, sobre cada `[data-visor]` del curso:
     1. el zoom de arranque ES el de "ajustar" — la hoja entra entera;
     2. el primer escalón es un paso, no un salto: la razón entre dos
        escalones consecutivos se mantiene por debajo de 2×;
     3. "Ajustar" vuelve exactamente al valor de arranque;
     4. los botones se deshabilitan en los extremos, en vez de dejar
        que el alumno toque algo que no hace nada.
*/
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

const hay = await page.evaluate(() => document.querySelectorAll('[data-visor]').length);
if (!hay) {
  report('visor-zoom', []);                 // el curso no usa visor: nada que verificar
  await browser.close();
  process.exit(process.exitCode || 0);
}

const r = await page.evaluate(async () => {
  const lienzo = document.querySelector('[data-visor]');
  const img = lienzo.querySelector('.d-visor-hoja');
  const val = document.querySelector('.d-visor-zoom-val');
  const mas = document.querySelector('[data-visor-zoom="1"]');
  const menos = document.querySelector('[data-visor-zoom="-1"]');
  const ajustar = document.querySelector('[data-visor-ajustar]');
  if (!img || !val || !mas) return null;

  const leer = () => parseInt((val.textContent || '0').replace(/\D/g, ''), 10) || 0;
  const entra = () => {
    const r = img.getBoundingClientRect(), l = lienzo.getBoundingClientRect();
    return r.width <= l.width + 2 && r.height <= l.height + 2;
  };
  const esperar = () => new Promise((res) => setTimeout(res, 60));

  if (ajustar) { ajustar.click(); await esperar(); }
  const inicio = leer();
  const entraAlInicio = entra();
  const menosApagadoAbajo = (() => {
    // bajar hasta el piso
    let n = 0;
    while (menos && !menos.disabled && n < 20) { menos.click(); n++; }
    return menos ? menos.disabled : null;
  })();
  if (ajustar) { ajustar.click(); await esperar(); }

  // recorrer los escalones hacia arriba y anotar cada valor
  const escalones = [leer()];
  let n = 0;
  while (!mas.disabled && n < 20) { mas.click(); escalones.push(leer()); n++; }
  const masApagadoArriba = mas.disabled;
  if (ajustar) { ajustar.click(); await esperar(); }
  const trasAjustar = leer();

  return { inicio, entraAlInicio, escalones, masApagadoArriba, menosApagadoAbajo, trasAjustar };
});

if (!r) {
  fails.push('hay un [data-visor] pero le falta el marcado de zoom (.d-visor-zoom-val / [data-visor-zoom])');
} else {
  if (!r.entraAlInicio) {
    fails.push(`el visor arranca en ${r.inicio}% y la hoja NO entra entera en el lienzo. ` +
      'El zoom de arranque tiene que ser el de "ajustar", medido contra el render.');
  }
  for (let i = 1; i < r.escalones.length; i++) {
    const a = r.escalones[i - 1], b = r.escalones[i];
    if (!a) continue;
    if (b / a >= 2) {
      fails.push(`el zoom salta de ${a}% a ${b}% (×${(b / a).toFixed(2)}): es un salto, no un ` +
        'escalón. Pasa cuando el piso está escrito a mano en vez de salir de la escala real ' +
        'de ajuste (§7.21, trampa 5).');
    }
  }
  if (r.trasAjustar !== r.inicio) {
    fails.push(`"Ajustar" devuelve ${r.trasAjustar}% y el arranque era ${r.inicio}%: no vuelve al ` +
      'mismo lugar.');
  }
  if (r.masApagadoArriba === false) {
    fails.push('el botón "+" nunca se deshabilita: el alumno puede seguir tocando algo que no hace nada.');
  }
  if (r.menosApagadoAbajo === false) {
    fails.push('el botón "−" nunca se deshabilita.');
  }
}

if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
report('visor-zoom', fails);
await browser.close();
