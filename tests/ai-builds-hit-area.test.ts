import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('AI build previews remain decorative and cannot intercept CTAs', async () => {
  for (const file of ['src/components/BuildsList.astro', 'src/components/AIBuildsGrid.astro']) {
    const source = await readFile(file, 'utf8');
    assert.match(source, /\.build-card__shot\{[^}]*pointer-events:none/, `${file} should make previews non-interactive by default`);
    assert.doesNotMatch(
      source,
      /\.build-card:hover \.build-card__shot[^}]*pointer-events:auto/,
      `${file} should not make the decorative preview capture pointer input on hover`,
    );
    assert.match(source, /\.build-card__cta\{[^}]*position:relative[^}]*z-index:3/, `${file} should keep the CTA above the preview`);
  }
});

// Natural screenshot proportions prevent tall black letterboxes on phones.
test('Story Builder mobile preview fits its screenshots and closes back to copy', async (t) => {
  const { chromium } = await import('playwright');
  const { startDistServer } = await import('./helpers/dist-server.ts');
  const { server, url } = await startDistServer();
  const browser = await chromium.launch();
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); });
  for (const route of ['/', '/ai-builds/index.html']) {
    for (const width of [320, 390, 430]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
      await page.route(/\.(mp4|webm)(\?|$)/, (route) => route.abort());
      await page.goto(url + route, { waitUntil: 'load' });
      const card = page.locator('#build-story-builder');
      await card.scrollIntoViewIfNeeded();
      await card.tap();
      await page.waitForFunction(() => document.querySelector('#build-story-builder')?.classList.contains('is-active'));
      await page.waitForFunction(() => [...document.querySelectorAll<HTMLImageElement>('#build-story-builder img')].every((image) => image.complete && image.naturalWidth > 0), undefined, { timeout: 10000 });
      const sizes = await card.evaluate((element) => {
        const shot = element.querySelector('.build-card__shot')!;
        const images = [...shot.querySelectorAll('img')];
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          bottomGap: shot.getBoundingClientRect().bottom - Math.max(...images.map((image) => image.getBoundingClientRect().bottom)),
          letterboxes: images.map((image) => {
            const style = getComputedStyle(image);
            const box = image.getBoundingClientRect();
            const width = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            const height = box.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
            return Math.abs(height - width * image.naturalHeight / image.naturalWidth);
          }),
        };
      });
      assert.equal(sizes.overflow, false);
      assert.ok(sizes.letterboxes.every((gap) => gap < 1), `Images should fit naturally: ${JSON.stringify(sizes)}`);
      assert.ok(sizes.bottomGap <= 15, `Preview should end at its content: ${sizes.bottomGap}`);
      await card.tap();
      assert.equal(await card.locator('.build-card__desc').isVisible(), true, 'Second tap restores the description');
      await page.close();
    }
  }
});

test('Pedal Path and Story Builder expand on desktop hover and collapse on exit', async (t) => {
  const { chromium } = await import('playwright');
  const { startDistServer } = await import('./helpers/dist-server.ts');
  const { server, url } = await startDistServer();
  const browser = await chromium.launch();
  t.after(async () => { await browser.close(); server.closeAllConnections(); await new Promise<void>((resolve) => server.close(() => resolve())); });
  for (const route of ['/', '/ai-builds/index.html']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await page.route(/\.(mp4|webm)(\?|$)/, (route) => route.abort());
    await page.goto(url + route, { waitUntil: 'load' });
    for (const id of ['bike-app', 'story-builder']) {
      await page.mouse.move(0, 0);
      const card = page.locator('#build-' + id);
      await card.scrollIntoViewIfNeeded();
      const closed = (await card.boundingBox())!;
      await card.hover({ position: { x: 24, y: 24 } });
      await card.locator('img').evaluateAll((images) => Promise.all(images.map((image) => image.decode())));
      const open = (await card.boundingBox())!;
      assert.ok(open.height > closed.height + 100, `${id} should expand for graphics: ${closed.height} -> ${open.height}`);
      assert.equal(open.width, closed.width, 'Expansion should preserve card width');
      assert.equal(await card.locator('.build-card__shot').evaluate((shot) => getComputedStyle(shot).position), 'relative', 'Graphics should determine the expanded height');
      assert.ok(await card.locator('img').evaluateAll((images) => images.every((image) => {
        const card = image.closest('.build-card')!.getBoundingClientRect();
        const box = image.getBoundingClientRect();
        return box.top >= card.top && box.bottom <= card.bottom && box.left >= card.left && box.right <= card.right;
      })), 'All preview images stay inside the expanded card');
      if (id === 'bike-app') {
        const link = card.locator('.build-card__launch');
        assert.equal(await link.isVisible(), true);
        await link.hover();
        assert.ok(await link.evaluate((link) => {
          const box = link.getBoundingClientRect();
          return link.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2));
        }), 'App Store button must remain clickable');
      }
      await card.screenshot({ path: `/private/tmp/desktop-expand-${id}-${route === '/' ? 'home' : 'builds'}.png` });
      await page.mouse.move(0, 0);
      assert.equal((await card.boundingBox())!.height, closed.height, 'Leaving restores the compact card');
      assert.equal(await card.locator('.build-card__desc').evaluate((element) => getComputedStyle(element).clipPath), 'none', 'Card copy is restored');
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.close();
  }
});
