import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { startDistServer } from './helpers/dist-server.ts';

test('comparison retains its thumbnail while loading and supports a paused keyboard comparison', { timeout: 30000 }, async (t) => {
  const { server, url } = await startDistServer();
  t.after(() => new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())));
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  let release!: () => void;
  const delayed = new Promise<void>(resolve => { release = resolve; });
  await page.route(/\/thales-(un)?graded\.mp4/, async route => {
    await delayed;
    await route.continue();
  });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const stage = page.locator('.cc-stage');
    await stage.scrollIntoViewIfNeeded();
    assert.equal(await page.locator('.cc-slide-hint').evaluate(el => getComputedStyle(el).opacity), '1',
      'the resting comparison should invite the user to slide');
    await stage.focus();
    assert.equal(await page.locator('.cc-thumb').evaluate(el => getComputedStyle(el).opacity), '1',
      'the poster must remain visible until both comparison frames are ready');
    release();
    await page.waitForFunction(() => Array.from(document.querySelectorAll<HTMLVideoElement>('.cc-video')).every(v => v.readyState >= 2), null, { timeout: 5000 });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.cc-thumb')!).opacity === '0');
    assert.ok(await page.locator('.cc-video').evaluateAll(elements => elements.every(v => (v as HTMLVideoElement).paused)),
      'reduced motion must show stills, not autoplay');
    await stage.press('ArrowRight');
    assert.equal(await stage.getAttribute('aria-valuenow'), '55');
    await stage.press('Home');
    assert.equal(await stage.getAttribute('aria-valuenow'), '0');
    await stage.press('End');
    assert.equal(await stage.getAttribute('aria-valuenow'), '100');
    assert.equal(await page.locator('.cc-slide-hint').evaluate(el => getComputedStyle(el).opacity), '0');
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
});
