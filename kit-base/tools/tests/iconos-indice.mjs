#!/usr/bin/env node
/* iconos-indice.mjs — kit-base v1.9.76
   ------------------------------------------------------------
   POR QUÉ EXISTE. Ninguna de estas cuatro cosas da error, y el `<use>`
   resuelve perfecto en todas:

     1. **Dos temas distintos comparten ícono.** En un curso real el
        índice terminó con contraseñas llevando el ícono del convenio y
        tres entradas compartiendo el de usuarios. El alumno usa el
        ícono para orientarse; repetido, deja de orientar.
     2. **Una entrada apunta a un `#i-…` que no existe.** El `<use>` no
        pinta nada y no protesta: queda un hueco.
     3. **Un `<symbol>` definido FUERA del sprite.** Cinco íconos
        vivían dentro del `<svg>` visible del cartel "Girá tu
        dispositivo": funcionaban de casualidad, y el día que ese
        cartel se saque o se esconda, desaparecen.
     4. **Un ícono definido y sin usar**, que engorda el sprite y hace
        creer que existe una sección que no está.

   LA REGLA QUE HACE CUMPLIR (CLAUDE.md §7.21, sección E):
     · diapositiva ESTRUCTURAL → ícono de su TIPO, y se repite a
       propósito (presentación de unidad, repaso);
     · diapositiva de CONTENIDO → ícono de su TEMA;
     · dos temas distintos NUNCA comparten ícono.
   Los íconos de TIPO se declaran con `data-icono-tipo` en el ítem del
   índice: repetirlos es correcto y el test no los cuenta como choque.
*/
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);
const fails = [];

const r = await page.evaluate(() => {
  /* El sprite es el `<svg>` de ancho 0 que el kit inyecta al principio
     del body para definir símbolos. Un `<symbol>` fuera de ahí es el
     punto 3. */
  const sprites = Array.from(document.querySelectorAll('svg')).filter((s) => {
    const r = s.getBoundingClientRect();
    return (r.width === 0 || r.height === 0) && s.querySelector('symbol');
  });
  const definidos = new Map();          // id -> ¿está dentro de un sprite?
  document.querySelectorAll('symbol[id]').forEach((sym) => {
    const dentro = sprites.some((sp) => sp.contains(sym));
    definidos.set(sym.id, dentro);
  });

  const items = Array.from(document.querySelectorAll('.d-sidenav-item[data-goto]'));
  const usados = [];
  items.forEach((it) => {
    const use = it.querySelector('use[href], use');
    const href = use && (use.getAttribute('href') || use.getAttribute('xlink:href') || '');
    usados.push({
      goto: it.getAttribute('data-goto'),
      icono: (href || '').replace(/^#/, ''),
      tipo: it.hasAttribute('data-icono-tipo'),
      label: (it.textContent || '').trim().slice(0, 30)
    });
  });

  /* Todos los `use` de la página, para saber qué símbolo está sin uso.
     No solo los del índice: el chrome usa varios. */
  const todosLosUse = new Set(
    Array.from(document.querySelectorAll('use')).map((u) =>
      (u.getAttribute('href') || u.getAttribute('xlink:href') || '').replace(/^#/, '')).filter(Boolean));

  return {
    definidos: Array.from(definidos.entries()),
    usados,
    sinUso: Array.from(definidos.keys()).filter((id) => !todosLosUse.has(id)),
    haySprite: sprites.length > 0
  };
});

const defs = new Map(r.definidos);

// 3 · símbolos definidos fuera del sprite
for (const [id, dentro] of defs) {
  if (!dentro) {
    fails.push(`<symbol id="${id}"> está definido FUERA del sprite — funciona de casualidad; ` +
      'el día que se esconda o se saque el elemento que lo contiene, el ícono desaparece.');
  }
}

// 2 · íconos que no existen
for (const u of r.usados) {
  if (!u.icono) {
    fails.push(`la entrada "${u.goto}" del índice no tiene <use> de ícono.`);
  } else if (!defs.has(u.icono)) {
    fails.push(`la entrada "${u.goto}" usa #${u.icono}, que no está definido en ningún <symbol>: ` +
      'el <use> no pinta nada y no da error.');
  }
}

// 1 · dos temas distintos con el mismo ícono
const porIcono = new Map();
for (const u of r.usados) {
  if (u.tipo || !u.icono) continue;          // los de TIPO se repiten a propósito
  if (!porIcono.has(u.icono)) porIcono.set(u.icono, []);
  porIcono.get(u.icono).push(u.goto);
}
for (const [icono, gotos] of porIcono) {
  if (gotos.length > 1) {
    fails.push(`#${icono} lo comparten ${gotos.length} entradas de CONTENIDO distintas ` +
      `(${gotos.join(', ')}). Si es un ícono de TIPO y la repetición es a propósito, ` +
      'marcá esos ítems con `data-icono-tipo`.');
  }
}

// 4 · definidos y sin uso
for (const id of r.sinUso) {
  fails.push(`#${id} está definido en el sprite y no lo usa nadie — se borra.`);
}

if (errors.length) fails.push(...errors.map((e) => 'error de consola: ' + e));
report('iconos-indice', fails);
await browser.close();
