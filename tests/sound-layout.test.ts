import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { startDistServer } from './helpers/dist-server.ts';

async function firstTrackPositions(url: string, width: number) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const layout = await page.locator('.tracks').evaluate((tracks) => ({
      firstThree: Array.from(tracks.children).slice(0, 3).map((track) => {
        const { x, y } = track.getBoundingClientRect();
        return { x: Math.round(x), y: Math.round(y) };
      }),
      horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
    }));
    await page.close();
    return layout;
  } finally {
    await browser.close();
  }
}

test('Sound tracks form two desktop columns and one mobile column', async (t) => {
  const { server, url } = await startDistServer();
  t.after(() => new Promise<void>((resolveServer, rejectServer) => {
    server.close((error) => error ? rejectServer(error) : resolveServer());
  }));

  const desktop = await firstTrackPositions(url, 1440);
  assert.equal(desktop.firstThree.length, 3, 'fixture must render at least three tracks');
  assert.equal(desktop.firstThree[0].y, desktop.firstThree[1].y, 'first two desktop tracks must share a row');
  assert.notEqual(desktop.firstThree[0].x, desktop.firstThree[1].x, 'first two desktop tracks must occupy separate columns');
  assert.equal(desktop.firstThree[2].x, desktop.firstThree[0].x, 'third desktop track must return to the first column');
  assert.notEqual(desktop.firstThree[2].y, desktop.firstThree[0].y, 'third desktop track must begin the next row');

  const mobile = await firstTrackPositions(url, 390);
  assert.equal(mobile.firstThree[0].x, mobile.firstThree[1].x, 'mobile tracks must share one column');
  assert.notEqual(mobile.firstThree[0].y, mobile.firstThree[1].y, 'mobile tracks must stack');
  assert.equal(mobile.horizontalOverflow, 0, 'mobile Sound layout must not overflow horizontally');
});
