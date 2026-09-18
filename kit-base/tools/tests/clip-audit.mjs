#!/usr/bin/env node
/* ============================================================
   clip-audit.mjs · kit-base v1.9.65 — Área Aprendizaje (COTO)
   ------------------------------------------------------------
   CONTENIDO RECORTADO DENTRO DE UN CONTENEDOR QUE NO SCROLLEA.

   POR QUÉ EXISTE, con el caso real que lo motivó (§7.12/§7.13):
   el minijuego de "Seguridad alimentaria" dejaba 3 de sus 12 opciones
   FÍSICAMENTE inalcanzables en un teléfono acostado (844×390) —
   `.d-mj-play` pedía 355px y tenía 270, con `overflow:hidden` en la
   cadena y sin `overflow-y:auto` propio. Como el minijuego es gate
   obligatorio, el curso quedaba imposible de terminar desde el
   celular. **La suite daba 7/7.**

   Por qué no lo agarraba nada de lo que ya existía:
   · `scroll-audit` mide el scroll del DOCUMENTO y el desborde de
     `.slide-inner` contra `.slide`. Este recorte pasa varios niveles
     más abajo, dentro de un contenedor anidado — invisible para las
     dos mediciones.
   · `body{overflow:hidden}` es a propósito en este kit, así que el
     desborde nunca llega al documento: no hay barra de scroll que
     delate nada.
   · A ojo tampoco se ve: el contenido recortado no deja hueco ni
     marca, simplemente no está. Se descubre cuando un alumno reporta
     que no puede avanzar.

   QUÉ MIDE, exactamente: para cada elemento con `overflow` recortante
   (`hidden`/`clip`) busca si su contenido lo excede. Si lo excede y NI
   ÉL NI NINGÚN ANCESTRO ofrece una vía de scroll (`auto`/`scroll`),
   ese contenido es inalcanzable — no "apretado", inalcanzable.

   La distinción importa y es la razón de que esto sea un test aparte:
   contenido que desborda pero PUEDE scrollearse es una decisión de
   diseño legítima (un glosario largo, el resumen del cierre); el
   mismo desborde SIN salida es siempre un bug.

     node tools/tests/clip-audit.mjs <url>
   ============================================================ */
import { chromium } from 'playwright-core';
import { report, requireUrl, irASlide } from './_shared.mjs';

const url = requireUrl();

/* Los mismos viewports "bajos" que §7.12 mostró como punto ciego. No
   se repite la lista completa de `scroll-audit`: este chequeo apunta a
   un modo de falla que aparece cuando falta ALTO, y correrlo en 8
   resoluciones solo lo haría lento sin encontrar más. */
const VIEWPORTS = [
  { w: 844, h: 390, label: '844×390 (teléfono acostado)' },
  { w: 932, h: 430, label: '932×430 (teléfono grande acostado)' },
  { w: 1280, h: 720, label: '1280×720' }
];

const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const fails = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});

  const slideIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-slide]')).map(s => s.getAttribute('data-slide'))
  );

  for (const id of slideIds) {
    const llego = await irASlide(page, id);
    if (llego !== id) {
      fails.push(`[${vp.label}] no se pudo navegar a "${id}" — NO auditada`);
      continue;
    }
    await page.waitForTimeout(250);

    /* Las CAPAS ocultas también se miden, de a una (kit-base v1.9.65).
       Sin esto el test no habría encontrado el caso que lo motivó: la
       capa de juego del minijuego arranca oculta detrás de la intro
       ("¡Empecemos!"), así que al entrar a la diapositiva no hay nada
       que medir — el recorte aparece recién cuando el alumno ya está
       jugando, que es justo cuando ya no puede salir. Se revela cada
       `[data-panel]`/`.d-mj-panel` por turno, se mide y se restaura el
       estado original: el test no puede dejar la página tocada para el
       siguiente chequeo. */
    const capas = await page.evaluate(() => {
      const slide = document.querySelector('[data-slide]:not([hidden])');
      if (!slide) return 0;
      return slide.querySelectorAll('[data-panel], .d-mj-panel').length;
    });

    const recortes = await page.evaluate((nCapas) => {
      const out = [];
      const slide = document.querySelector('[data-slide]:not([hidden])');
      if (!slide) return out;

      const recorta = (cs) => cs.overflowY === 'hidden' || cs.overflowY === 'clip';
      const scrollea = (el) => {
        const cs = getComputedStyle(el);
        return cs.overflowY === 'auto' || cs.overflowY === 'scroll';
      };
      /* ¿Hay alguna vía de scroll entre este elemento y la raíz? Si la
         hay, el contenido es alcanzable aunque desborde: apretado, no
         perdido. */
      const tieneSalida = (el) => {
        let n = el;
        while (n && n !== document.documentElement) {
          if (scrollea(n)) return true;
          n = n.parentElement;
        }
        return false;
      };

      const vistos = new Set();
      /* La medición correcta es por RECTÁNGULO contra el ancestro que
         recorta, no por `scrollHeight` del propio elemento — y eso lo
         enseñó el caso que motivó el test: `.d-mj-play` tenía
         `overflow-y:visible`, así que ÉL no recortaba nada; quien
         recortaba era `.d-stage`, varios niveles más arriba. Mirando
         solo el `scrollHeight` de cada elemento, el bug es invisible:
         el contenido "cabe" en su caja, es la caja la que se sale del
         contenedor que la tapa. */
      function ancestroQueRecorta(el) {
        let n = el.parentElement;
        while (n && n !== document.documentElement) {
          const cs = getComputedStyle(n);
          if (cs.overflowY === 'auto' || cs.overflowY === 'scroll') return null; // hay salida
          if (cs.overflowY === 'hidden' || cs.overflowY === 'clip') return n;
          n = n.parentElement;
        }
        return null;
      }
      function medir(capa) {
        slide.querySelectorAll('*').forEach((el) => {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || el.hidden) return;
          /* `.sr-only` mide 1px y se sale a propósito — es la técnica
             misma. Reportarlo sería ruido en CADA diapositiva de CADA
             curso, y un ⚠️ que aparece siempre es un ⚠️ que se deja de
             leer (la lección que §7.12 ya pagó con verify-hitboxes). */
          if (el.classList.contains('sr-only')) return;
          /* Decorativo = se sale a propósito. Dos familias, las dos
             verificadas contra cursos reales:
             · `aria-hidden="true"` es la declaración explícita de "esto
               no es contenido" — el confeti del cierre desborda 64px
               por diseño, es lo que hace que se vea cayendo.
             · una `<img>` recortada por un contenedor con `object-fit`
               (cover/contain) NO pierde contenido: se encuadra. Es el
               mecanismo normal de las capturas del kit.
             Sin estos dos filtros el test reporta lo mismo en todos los
             cursos, siempre, y deja de leerse. */
          if (el.closest('[aria-hidden="true"]')) return;
          if (el.tagName === 'IMG') {
            const fit = getComputedStyle(el).objectFit;
            if (fit === 'cover' || fit === 'contain') return;
          }
          const r = el.getBoundingClientRect();
          if (r.height < 24 || r.width < 24) return;   // decorativos, líneas, iconitos
          const cont = ancestroQueRecorta(el);
          if (!cont) return;
          const cr = cont.getBoundingClientRect();
          /* 24px de umbral: por debajo es redondeo, sombra o borde.
             El caso real que motivó el test se salía 65px. */
          const fuera = Math.round(Math.max(r.bottom - cr.bottom, cr.top - r.top));
          if (fuera < 24) return;
          const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
          if (vistos.has(sel)) return;
          vistos.add(sel);
          out.push({ sel, exceso: fuera, alto: Math.round(r.height), capa: capa || null,
                     cont: cont.className && typeof cont.className === 'string'
                       ? '.' + cont.className.trim().split(/\s+/)[0] : cont.tagName.toLowerCase() });
        });
      }

      /* Primero lo visible al entrar, después cada capa por turno. */
      medir();
      if (nCapas) {
        const paneles = Array.from(slide.querySelectorAll('[data-panel], .d-mj-panel'));
        const estado = paneles.map((p) => p.hidden);
        paneles.forEach((activo) => {
          paneles.forEach((p) => { p.hidden = p !== activo; });
          medir(activo.getAttribute('data-panel') || activo.className.split(/\s+/)[1] || 'capa');
        });
        paneles.forEach((p, i) => { p.hidden = estado[i]; });
      }
      return out;
    }, capas);

    recortes.forEach((r) => {
      fails.push(`[${vp.label}] data-slide="${id}"${r.capa ? ` (capa "${r.capa}")` : ''}: ${r.sel} se sale ` +
        `${r.exceso}px de ${r.cont}, que lo RECORTA, y nadie en la cadena ofrece scroll — ` +
        'ese contenido es inalcanzable, no apretado');
    });
  }
  await page.close();
}

report('clip-audit', fails);
await browser.close();
