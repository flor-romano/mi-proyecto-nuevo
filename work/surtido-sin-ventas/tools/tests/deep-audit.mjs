#!/usr/bin/env node
/* deep-audit.mjs — kit-base v1.0
   Consistencia estructural del contrato motor-slides.js (ver
   spec-motor-slides.md): IDs únicos, índices consecutivos, referencias
   cruzadas válidas (data-goto/data-popup-trigger/data-gate-popup/
   data-intro-popup apuntando a algo que existe), accesibilidad básica
   (alt en imágenes, nombre accesible en botones). No sabe nada del
   CONTENIDO del curso — solo estructura. */
import { openCourse, report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const { browser, page, errors } = await openCourse(url);

const audit = await page.evaluate(() => {
  const fails = [];
  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  const slideIds = slides.map(s => s.getAttribute('data-slide'));

  // IDs únicos
  const seen = new Set();
  slideIds.forEach(id => {
    if (seen.has(id)) fails.push(`data-slide duplicado: "${id}"`);
    seen.add(id);
  });

  // índices consecutivos desde 0
  const indices = slides.map(s => +s.getAttribute('data-slide-index')).sort((a, b) => a - b);
  indices.forEach((idx, i) => { if (idx !== i) fails.push(`data-slide-index no consecutivo: se esperaba ${i}, se encontró ${idx}`); });

  // data-goto apunta a un slide real
  document.querySelectorAll('[data-goto]').forEach(el => {
    const target = el.getAttribute('data-goto');
    if (!slideIds.includes(target)) fails.push(`[data-goto="${target}"] no coincide con ningún [data-slide]`);
  });

  // data-popup-trigger apunta a un popup real
  const popupIds = Array.from(document.querySelectorAll('[data-popup]')).map(p => p.getAttribute('data-popup'));
  document.querySelectorAll('[data-popup-trigger]').forEach(el => {
    const target = el.getAttribute('data-popup-trigger');
    if (!popupIds.includes(target)) fails.push(`[data-popup-trigger="${target}"] no coincide con ningún [data-popup]`);
  });
  slides.forEach(s => {
    ['data-gate-popup', 'data-intro-popup'].forEach(attr => {
      const target = s.getAttribute(attr);
      if (target && !popupIds.includes(target)) fails.push(`[${attr}="${target}"] en data-slide="${s.getAttribute('data-slide')}" no coincide con ningún [data-popup]`);
    });
  });

  // data-hit con coordenadas numéricas válidas
  document.querySelectorAll('[data-hit]').forEach(el => {
    ['data-l', 'data-t', 'data-w', 'data-h'].forEach(attr => {
      const v = el.getAttribute(attr);
      if (v === null || v === '' || isNaN(parseFloat(v))) {
        fails.push(`[data-hit] con ${attr} inválido ("${v}") — elemento: ${el.outerHTML.slice(0, 80)}`);
      }
    });
  });

  // accesibilidad básica: toda <img> con contenido real necesita alt (puede ser "")
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('alt')) fails.push(`<img> sin atributo alt: ${img.src.split('/').pop()}`);
  });

  // botones sin nombre accesible (ni texto, ni aria-label, ni sr-only interno)
  document.querySelectorAll('button').forEach(btn => {
    const hasText = btn.textContent.replace(/\s+/g, '').length > 0;
    const hasLabel = btn.hasAttribute('aria-label') || btn.hasAttribute('aria-labelledby');
    if (!hasText && !hasLabel) fails.push(`<button> sin nombre accesible: ${btn.outerHTML.slice(0, 80)}`);
  });

  return fails;
});

if (errors.length) audit.push(...errors.map(e => 'error de consola: ' + e));
report('deep-audit', audit);
await browser.close();
