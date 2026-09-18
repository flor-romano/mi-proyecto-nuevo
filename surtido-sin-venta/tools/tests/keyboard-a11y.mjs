#!/usr/bin/env node
/* keyboard-a11y.mjs — kit-base v1.0
   Accesibilidad por teclado: flechas navegan, Esc cierra pop-ups,
   el foco es visible (outline no "none"/0), y respeta
   prefers-reduced-motion (con esa media activa, las diapositivas no
   deberían llevar las clases de animación anim-l/anim-r al navegar). */
import { chromium } from 'playwright-core';
import { report, requireUrl } from './_shared.mjs';

const url = requireUrl();
const executablePath = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const fails = [];

// 1) navegación por flechas
{
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});
  const before = await page.evaluate(() => document.querySelector('[data-slide-counter]')?.textContent);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(350);
  const after = await page.evaluate(() => document.querySelector('[data-slide-counter]')?.textContent);
  if (before === after) fails.push('ArrowRight no avanzó la diapositiva');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(350);
  const back = await page.evaluate(() => document.querySelector('[data-slide-counter]')?.textContent);
  if (back !== before) fails.push('ArrowLeft no volvió a la diapositiva anterior');
  await page.close();
}

// 2) Esc cierra un pop-up abierto
{
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});
  const trigger = await page.$('[data-popup-trigger]');
  if (trigger) {
    await trigger.click();
    await page.waitForTimeout(300);
    const openBefore = await page.evaluate(() => !!document.querySelector('.modal.open, [data-popup].open'));
    if (!openBefore) fails.push('un [data-popup-trigger] no abrió ningún pop-up visible (.open)');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const openAfter = await page.evaluate(() => !!document.querySelector('.modal.open, [data-popup].open'));
    if (openAfter) fails.push('Esc no cerró el pop-up abierto');
  } else {
    fails.push('no se encontró ningún [data-popup-trigger] para probar Esc (¿curso sin pop-ups? revisar a mano)');
  }
  await page.close();
}

// 3) foco visible en botones de navegación (heurística: outline no "none"/0px al recibir :focus-visible)
{
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, boxShadow: cs.boxShadow };
  });
  if (outline && outline.outlineStyle === 'none' && outline.boxShadow === 'none') {
    fails.push('el primer elemento enfocable por Tab no muestra ningún indicador de foco (ni outline ni box-shadow)');
  }
  await page.close();
}

// 4) prefers-reduced-motion: no debería agregar clases de animación al navegar
{
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(url);
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape').catch(() => {});
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(350);
  const hasAnimClass = await page.evaluate(() => {
    const active = document.querySelector('[data-slide]:not([hidden])');
    return active ? (active.classList.contains('anim-l') || active.classList.contains('anim-r')) : false;
  });
  if (hasAnimClass) fails.push('con prefers-reduced-motion activo, la diapositiva activa igual lleva anim-l/anim-r');
  await page.close();
}

report('keyboard-a11y', fails);
await browser.close();
