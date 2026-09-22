import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { startDistServer } from './helpers/dist-server.ts';

test('monitor holds the outgoing frame while the next clip loads, including paused selection', { timeout: 30000 }, async (t) => {
  const { server, url } = await startDistServer();
  t.after(() => new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())));
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Explore the edit', exact: true }).click();
  await page.locator('[data-transport="play"]').click();
  await page.waitForFunction(() => (document.querySelector('[data-monitor]') as HTMLVideoElement).currentTime > 0.2);

  let release!: () => void;
  const delayed = new Promise<void>(resolve => { release = resolve; });
  const requestSeen = page.waitForRequest(request => request.url().includes('/simbility-loop.'), { timeout: 5000 });
  await page.route('**/simbility-loop.*', async route => {
    await delayed;
    await route.continue();
  });

  try {
    await page.locator('[data-transport="next"]').click();
    await requestSeen;
    const held = await page.locator('[data-monitor-hold]').evaluate((canvas: HTMLCanvasElement) => ({
      visible: !canvas.hidden,
      width: canvas.width,
      // Actual image pixels, not just the presence of an empty overlay.
      image: canvas.toDataURL(),
      alpha: canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data[3],
    }));
    assert.equal(held.visible, true, 'outgoing footage must cover the incoming poster during loading');
    assert.ok(held.width > 0);
    assert.equal(held.alpha, 255, 'the held frame must contain real image pixels');
    await page.locator('[data-transport="play"]').click();
    assert.equal(await page.locator('[data-monitor-hold]').evaluate((c: HTMLCanvasElement) => c.toDataURL()), held.image,
      'pausing during loading must preserve the same outgoing image');
    release();
    await page.waitForFunction(() => {
      const video = document.querySelector('[data-monitor]') as HTMLVideoElement;
      return video.readyState >= 2 && video.currentSrc.includes('simbility-loop') &&
        (document.querySelector('[data-monitor-hold]') as HTMLCanvasElement).hidden;
    });
    assert.equal(await page.locator('[data-monitor]').evaluate((v: HTMLVideoElement) => v.paused), true);
  } finally {
    release();
    await page.unrouteAll({ behavior: 'wait' });
  }
});

test('paused selections load their still and release the hold, including same-clip reselection', { timeout: 30000 }, async (t) => {
  const { server, url } = await startDistServer();
  t.after(() => new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())));
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Explore the edit', exact: true }).click();
  await page.locator('[data-transport="play"]').click();
  await page.waitForFunction(() => (document.querySelector('[data-monitor]') as HTMLVideoElement).currentTime > 0.2);
  await page.locator('[data-transport="play"]').click();
  await page.locator('[data-transport="next"]').click();
  await page.waitForFunction(() => {
    const video = document.querySelector('[data-monitor]') as HTMLVideoElement;
    return video.readyState >= 2 && video.currentSrc.includes('simbility-loop') &&
      (document.querySelector('[data-monitor-hold]') as HTMLCanvasElement).hidden;
  }, null, { timeout: 5000 });
  assert.equal(await page.locator('[data-monitor]').evaluate((v: HTMLVideoElement) => v.paused), true);

  // Thales is a button (no case-study link), so selecting it again restarts it.
  const thales = page.locator('[data-clip][role="button"]').first();
  await thales.press('Enter');
  await page.waitForFunction(() => {
    const v = document.querySelector('[data-monitor]') as HTMLVideoElement;
    return v.readyState >= 2 && v.currentSrc.includes('thales-') && !v.seeking;
  });
  await page.locator('[data-monitor]').evaluate((v: HTMLVideoElement) => { v.currentTime = 0.5; });
  await page.waitForFunction(() => !(document.querySelector('[data-monitor]') as HTMLVideoElement).seeking);
  await thales.press('Enter');
  await page.waitForFunction(() => {
    const v = document.querySelector('[data-monitor]') as HTMLVideoElement;
    return !v.seeking && v.currentTime === 0 && (document.querySelector('[data-monitor-hold]') as HTMLCanvasElement).hidden;
  }, null, { timeout: 5000 });
  assert.equal(await page.locator('[data-monitor]').evaluate((v: HTMLVideoElement) => v.paused), true);
});
