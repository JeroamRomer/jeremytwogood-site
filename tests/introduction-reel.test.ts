import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { startDistServer } from './helpers/dist-server.ts';

test('hero reel separates project identity from role credits and shows all 38 stills once', { timeout: 30000 }, async (t) => {
  const { server, url } = await startDistServer();
  t.after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    Math.random = () => 0;
    const reelWindow = window as Window & { __heroReelTick?: () => void };
    const originalSetInterval = window.setInterval.bind(window);
    const originalSetTimeout = window.setTimeout.bind(window);
    reelWindow.setInterval = ((handler: TimerHandler, timeout?: number) => {
      if (timeout === 5000 && typeof handler === 'function') {
        reelWindow.__heroReelTick = handler as () => void;
        return 1;
      }
      return originalSetInterval(handler, timeout);
    }) as typeof window.setInterval;
    window.setTimeout = ((handler: TimerHandler, timeout?: number) => {
      if (timeout === 850 && typeof handler === 'function') return 2;
      if ((timeout === 5000 || (timeout !== undefined && timeout >= 9000)) && typeof handler === 'function') {
        reelWindow.__heroReelTick = handler as () => void;
        (reelWindow as Window & { __heroReelDelay?: number }).__heroReelDelay = timeout;
        return 3;
      }
      return originalSetTimeout(handler, timeout);
    }) as typeof window.setTimeout;
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const edgeImages = await page.locator('.introduction__track').evaluate(track => ({
    start: getComputedStyle(track, '::before').backgroundImage,
    end: getComputedStyle(track, '::after').backgroundImage,
  }));
  assert.match(edgeImages.start, /chac-mool-cenote\.jpg/, 'the opening edge should show the reel final image');
  assert.match(edgeImages.end, /shell-1\.jpg/, 'the closing edge should show the reel first image');
  await page.locator('.bar__rollout, .bar__mark-roll').evaluateAll(elements => {
    elements.flatMap(element => element.getAnimations()).forEach(animation => animation.finish());
  });

  const desktopBrandGeometry = await page.locator('.bar__brand').evaluate(element => {
    const mark = element.querySelector('.bar__mark-wrap')!.getBoundingClientRect();
    const name = element.querySelector('.bar__name')!.getBoundingClientRect();
    const rollout = element.querySelector('.bar__rollout')!.getBoundingClientRect();
    return { mark, name, rollout };
  });
  assert.ok(Math.abs(desktopBrandGeometry.rollout.left - (desktopBrandGeometry.mark.left + desktopBrandGeometry.mark.width / 2)) < 0.5,
    `desktop reel underline should roll out from the reel center: ${JSON.stringify(desktopBrandGeometry)}`);
  assert.ok(Math.abs(desktopBrandGeometry.rollout.bottom - desktopBrandGeometry.mark.bottom) < 0.5,
    `desktop reel underline should meet the reel's lower edge: ${JSON.stringify(desktopBrandGeometry)}`);
  assert.ok(Math.abs(desktopBrandGeometry.rollout.right - desktopBrandGeometry.name.right) < 0.5,
    `desktop reel underline should stop at the wordmark period: ${JSON.stringify(desktopBrandGeometry)}`);

  const frames = page.locator('.introduction__frame');
  assert.equal(await frames.count(), 39);
  const sources = await frames.locator('img').evaluateAll(images => images.map(image => (image as HTMLImageElement).getAttribute('src')));
  assert.equal(new Set(sources).size, 38, 'each still should appear exactly once before the reel loops');
  assert.equal(await frames.locator('video').count(), 1, 'the production clip should appear once in the full cycle');
  const mediaSources = await frames.evaluateAll(elements => elements.map(element =>
    element.querySelector('video')?.getAttribute('src') ?? element.querySelector('img')?.getAttribute('src')));
  assert.equal(new Set(mediaSources).size, 39, 'each still or video should appear exactly once before the reel loops');
  assert.equal(sources.filter(source => source === '/assets/hero-strip/francesco-yates.jpg').length, 1,
    'the Francesco Yates still should appear once in the full cycle');
  const yatesFrame = frames.filter({ has: page.locator('img[src="/assets/hero-strip/francesco-yates.jpg"]') });
  assert.equal(await yatesFrame.getAttribute('data-project'), 'YouTube Creator Series · Francesco Yates');
  assert.equal(await yatesFrame.getAttribute('data-role'), 'Camera Operator');
  const expectedNewCredits = [
    ['/assets/hero-strip/zane-caplansky.jpg', 'Talk T.O. My Stomach · Zane Caplansky Interview', 'Producer · Editor · Host'],
    ['/assets/hero-strip/nbn-light-em-up.jpg', 'NBN Boxing · Light Em Up', 'Editor · Story Editor · Motion Graphics'],
    ['/assets/hero-strip/chac-mool-cenote.jpg', 'Chac Mool Cenote · Cavern Dive', 'Camera Operator'],
  ];
  for (const [src, project, role] of expectedNewCredits) {
    assert.equal(sources.filter(source => source === src).length, 1, `${src} should appear exactly once`);
    const frame = frames.filter({ has: page.locator(`img[src="${src}"]`) });
    assert.equal(await frame.getAttribute('data-project'), project);
    assert.equal(await frame.getAttribute('data-role'), role);
  }
  const untitledSources = [
    '/assets/hero-strip/new-rgb-edit-suite.webp',
    '/assets/hero-strip/new-production-office.webp',
    '/assets/hero-strip/new-portrait.webp',
    '/assets/hero-strip/new-cabin-edit.webp',
    '/assets/hero-strip/new-office-self.webp',
    '/assets/hero-strip/new-mural-self.webp',
    '/assets/hero-strip/new-dark-edit-suite.webp',
    '/assets/hero-strip/new-studio-session.webp',
    '/assets/hero-strip/new-production-move.mp4',
  ];
  for (const src of untitledSources) {
    const frame = frames.filter({ has: page.locator(`img[src="${src}"]`) }).or(frames.filter({ has: page.locator(`video[src="${src}"]`) }));
    assert.equal(await frame.count(), 1, `${src} should appear exactly once`);
    assert.equal(await frame.getAttribute('data-project'), '', `${src} should not render a project title`);
    assert.equal(await frame.getAttribute('data-role'), '', `${src} should not render a role title`);
    const alt = await frame.locator('img, video').getAttribute('aria-label') ?? await frame.locator('img, video').getAttribute('alt');
    assert.ok(alt && !alt.includes('—'), `${src} should retain descriptive accessibility text without a title separator`);
  }
  for (const removedSrc of [
    '/assets/hero-strip/new-headphones-selfie.webp',
    '/assets/hero-strip/new-edit-station.webp',
    '/assets/hero-strip/new-location-edit.webp',
  ]) {
    assert.equal(await page.locator(`.introduction__frame img[src="${removedSrc}"]`).count(), 0,
      `${removedSrc} should be removed from the reel`);
  }
  const untitledFrameIndexes = await frames.evaluateAll((elements, sources) => elements.flatMap((element, index) => {
    const source = element.querySelector('video')?.getAttribute('src') ?? element.querySelector('img')?.getAttribute('src');
    return (sources as string[]).includes(source ?? '') ? [index] : [];
  }), untitledSources);
  assert.ok(untitledFrameIndexes.every((index, position) => position === 0 || index - untitledFrameIndexes[position - 1] > 1),
    'untitled media should be separated by at least one job-specific still');
  const chrome = page.locator('.introduction__frame-chrome');
  assert.equal(await chrome.count(), 1, 'one fixed overlay should frame the center slot');
  const visibleChromeCount = () => chrome.evaluateAll(elements => elements.filter(element => getComputedStyle(element).visibility === 'visible').length);
  assert.equal(await visibleChromeCount(), 1, 'the fixed chrome overlay should remain visible');
  const readChromeGeometry = () => chrome.evaluate(element => {
    const stage = element.parentElement!.getBoundingClientRect();
    const media = element.parentElement!.parentElement!.getBoundingClientRect();
    const center = element.parentElement!.querySelector('.introduction__frame.is-center')!.getBoundingClientRect();
    const rail = element.parentElement!.parentElement!.querySelector('.introduction__progress-track')!.getBoundingClientRect();
    const playhead = element.parentElement!.parentElement!.querySelector('.introduction__progress-playhead')!.getBoundingClientRect();
    return {
      stage: [stage.x, stage.y, stage.width, stage.height].map(value => Math.round(value * 100) / 100),
      media: [media.x, media.y, media.width, media.height].map(value => Math.round(value * 100) / 100),
      center: [center.x, center.y, center.width, center.height].map(value => Math.round(value * 100) / 100),
      corners: [...element.querySelectorAll('.introduction__frame-corner')].map(corner => {
        const rect = corner.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height].map(value => Math.round(value * 100) / 100);
      }),
      rail: [rail.x, rail.y, rail.width, rail.height].map(value => Math.round(value * 100) / 100),
      playhead: [playhead.x, playhead.y, playhead.width, playhead.height].map(value => Math.round(value * 100) / 100),
    };
  });
  assert.equal(await page.locator('.introduction__progress').count(), 1);
  assert.equal(await chrome.locator('.introduction__frame-corner').count(), 4);
  const rulerMarks = page.locator('[data-ruler-mark]');
  assert.equal(await rulerMarks.count(), 5, 'desktop ruler should have end caps plus quarter, half, and three-quarter marks');
  const initialRulerMarks = await rulerMarks.evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return {
      mark: element.getAttribute('data-ruler-mark'),
      center: rect.top + rect.height / 2,
      display: getComputedStyle(element).display,
    };
  }));
  const initialRail = await page.locator('.introduction__progress-track').evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, height: rect.height };
  });
  for (const [mark, fraction] of [['top', 0], ['quarter', .25], ['half', .5], ['three-quarter', .75], ['bottom', 1]] as const) {
    const measured = initialRulerMarks.find(item => item.mark === mark);
    assert.ok(measured && Math.abs(measured.center - (initialRail.top + initialRail.height * fraction)) < 1,
      `${mark} ruler mark should sit at ${fraction * 100}% of the rail`);
    assert.equal(measured?.display, 'block', `${mark} ruler mark should be visible on desktop`);
  }
  const initialChromeGeometry = await readChromeGeometry();
  const [centerX, centerY, centerWidth, centerHeight] = initialChromeGeometry.center;
  const [leftTop, rightTop, rightBottom, leftBottom] = initialChromeGeometry.corners;
  assert.ok(Math.abs(leftTop[0] - centerX) < 0.5, 'left bracket should line up with the center image');
  assert.ok(Math.abs(leftTop[1] - centerY) < 0.5, 'top bracket should align with the expanded center frame edge');
  assert.ok(Math.abs(rightTop[0] + rightTop[2] - (centerX + centerWidth)) < 0.5, 'right bracket should line up with the center image');
  assert.ok(Math.abs(rightTop[1] - centerY) < 0.5, 'top bracket should align with the expanded center frame edge');
  assert.ok(Math.abs(rightBottom[0] + rightBottom[2] - (centerX + centerWidth)) < 0.5, 'lower right bracket should line up with the center image');
  assert.ok(Math.abs(rightBottom[1] + rightBottom[3] - (centerY + centerHeight)) < 0.5, 'lower bracket should align with the expanded center frame edge');
  assert.ok(Math.abs(leftBottom[0] - centerX) < 0.5, 'lower left bracket should line up with the center image');
  assert.ok(Math.abs(leftBottom[1] + leftBottom[3] - (centerY + centerHeight)) < 0.5, 'lower bracket should align with the expanded center frame edge');
  assert.ok(initialChromeGeometry.rail[0] >= initialChromeGeometry.stage[0] + initialChromeGeometry.stage[2], 'progress ruler should sit outside the footage');
  assert.ok(initialChromeGeometry.rail[0] + initialChromeGeometry.rail[2] <= initialChromeGeometry.media[0] + initialChromeGeometry.media[2], 'progress ruler should stay beside the reel');
  assert.ok(Math.abs(initialChromeGeometry.rail[1] - initialChromeGeometry.stage[1]) < 0.5, 'progress ruler should start level with the top of the reel');
  assert.ok(Math.abs(initialChromeGeometry.rail[1] + initialChromeGeometry.rail[3] - (initialChromeGeometry.stage[1] + initialChromeGeometry.stage[3])) < 0.5, 'progress ruler should reach the bottom of the reel');
  assert.ok(Math.abs(initialChromeGeometry.playhead[1] - initialChromeGeometry.rail[1]) < 0.5, 'orange playhead should start at the top for the first still');
  assert.equal(await page.locator('.introduction__progress').getAttribute('aria-valuenow'), '1');
  assert.equal(await page.locator('.introduction__progress').getAttribute('aria-valuemax'), '39');
  const readCaption = () => page.locator('.introduction__work figcaption > span').allTextContents();
  assert.deepEqual(await readCaption(), ['Shell × John Williams', 'Editor · Colour Grade']);
  assert.ok(await page.evaluate(() => typeof (window as Window & { __heroReelTick?: () => void }).__heroReelTick === 'function'),
    'the hero reel should register its five-second advance');
  await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  await page.waitForTimeout(900);
  const firstAdvance = await readChromeGeometry();
  assert.ok(firstAdvance.playhead[1] > initialChromeGeometry.playhead[1], 'orange playhead should step down for each new still');
  assert.equal(await page.locator('.introduction__progress').getAttribute('aria-valuenow'), '2');
  assert.equal(await page.locator('.introduction__frame.is-center img').getAttribute('src'), '/assets/hero-strip/orm-multibox.jpg');
  assert.deepEqual(await readCaption(), ['Oak Ridges Moraine Groundwater Program', 'Editor · Motion Graphics · Sound · Colour']);
  assert.equal(await visibleChromeCount(), 1, 'the fixed framing chrome should remain visible as the next image moves into place');
  await page.waitForTimeout(900);
  const advancedChromeGeometry = await readChromeGeometry();
  assert.deepEqual({ stage: advancedChromeGeometry.stage, corners: advancedChromeGeometry.corners, rail: advancedChromeGeometry.rail },
    { stage: initialChromeGeometry.stage, corners: initialChromeGeometry.corners, rail: initialChromeGeometry.rail },
    'the corner brackets and external ruler should stay fixed as the images move behind them');
  await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  assert.deepEqual(await readCaption(), ['Simbility Desk Series', 'Editor']);
  for (let index = 2; index < 6; index += 1) {
    await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  }
  const shellFrame = await page.evaluate(() => {
    const frame = document.querySelector('.introduction__frame.is-center');
    return {
      source: frame?.querySelector('img')?.getAttribute('src'),
      project: document.querySelector('[data-strip-project]')?.textContent,
      role: document.querySelector('[data-strip-role]')?.textContent,
      index: frame?.getAttribute('data-index'),
    };
  });
  assert.equal(shellFrame.source, '/assets/hero-strip/shell-rig-in-future.jpg');
  assert.equal(shellFrame.project, 'Shell · #RigInFuture');
  assert.equal(shellFrame.role, 'Editor · Motion Graphics · Sound · Colour');
  assert.deepEqual(await readCaption(), ['Shell · #RigInFuture', 'Editor · Motion Graphics · Sound · Colour']);
  await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  assert.equal(await page.locator('.introduction__frame.is-center img').getAttribute('src'), '/assets/hero-strip/francesco-yates.jpg');
  assert.deepEqual(await readCaption(), ['YouTube Creator Series · Francesco Yates', 'Camera Operator']);
  for (let index = 7; index < 38; index += 1) {
    await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  }
  await page.waitForTimeout(900);
  const lastFrame = await page.evaluate(() => {
    const frame = document.querySelector('.introduction__frame.is-center');
    return { index: frame?.getAttribute('data-index'), source: frame?.querySelector('img')?.getAttribute('src') };
  });
  assert.equal(lastFrame.index, '38', 'the last distinct still should remain centered for its full interval');
  assert.equal(lastFrame.source, '/assets/hero-strip/chac-mool-cenote.jpg');
  const lastFrameGeometry = await readChromeGeometry();
  assert.ok(Math.abs(lastFrameGeometry.playhead[1] + lastFrameGeometry.playhead[3] - (lastFrameGeometry.rail[1] + lastFrameGeometry.rail[3])) < 0.5,
    'orange playhead should reach the bottom for the last still');
  assert.equal(await page.locator('.introduction__progress').getAttribute('aria-valuenow'), '39');

  await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  const wrappedState = await page.evaluate(() => ({
    index: document.querySelector('.introduction__frame.is-center')?.getAttribute('data-index'),
    project: document.querySelector('[data-strip-project]')?.textContent,
  }));
  assert.equal(wrappedState.index, '0', 'the reel should reset directly to the first still without an empty frame');
  assert.equal(wrappedState.project, 'Shell × John Williams');
  const wrappedGeometry = await readChromeGeometry();
  assert.ok(Math.abs(wrappedGeometry.playhead[1] - wrappedGeometry.rail[1]) < 0.5,
    `orange playhead should return to the top when the loop restarts: ${JSON.stringify(wrappedGeometry)}`);
  assert.equal(await page.locator('.introduction__progress').getAttribute('aria-valuenow'), '1');
  assert.deepEqual(await readCaption(), ['Shell × John Williams', 'Editor · Colour Grade']);

  for (let index = 0; index < 3; index += 1) {
    await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  }
  assert.deepEqual(await readCaption(), ['Talk T.O. My Stomach · Chef Nuit', 'Producer · Editor · Host']);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1100);
  const mobileBrandGeometry = await page.locator('.bar__brand').evaluate(element => {
    const brand = element.getBoundingClientRect();
    const rollout = element.querySelector('.bar__rollout')!.getBoundingClientRect();
    const name = element.querySelector('.bar__name')!.getBoundingClientRect();
    const copy = document.querySelector('.introduction__copy')!.getBoundingClientRect();
    const work = document.querySelector('.introduction__work')!.getBoundingClientRect();
    const centerImage = document.querySelector('.introduction__frame.is-center img') as HTMLImageElement;
    return { brand, rollout, name, copy, work, centerImage: { naturalWidth: centerImage.naturalWidth, top: centerImage.getBoundingClientRect().top } };
  });
  assert.ok(mobileBrandGeometry.rollout.width > 20, 'mobile reel underline should retain the desktop brand span');
  assert.ok(Math.abs(mobileBrandGeometry.rollout.right - mobileBrandGeometry.name.right) < 1,
    `mobile reel underline should stop at the wordmark period: ${JSON.stringify(mobileBrandGeometry)}`);
  assert.ok(mobileBrandGeometry.rollout.left < 26,
    'mobile reel underline should start slightly left of the wordmark');
  assert.ok(mobileBrandGeometry.work.top < mobileBrandGeometry.copy.top,
    'mobile reel should appear before the introduction copy');
  assert.ok(mobileBrandGeometry.work.width > 340 && mobileBrandGeometry.work.width <= 390,
    'mobile reel should use the available viewport width');
  assert.ok(await page.locator('.introduction__mobile-strip').evaluate(element => element.getBoundingClientRect().width < 390),
    'mobile reel strip should be scaled down to reveal adjacent frames');
  assert.ok(await page.locator('.introduction__mobile-chrome').evaluate(element => {
    const chrome = element.getBoundingClientRect();
    const center = document.querySelector('.introduction__mobile-still')!.getBoundingClientRect();
    return Math.abs(chrome.left - center.left) < 1 && Math.abs(chrome.right - center.right) < 1;
  }), 'mobile corner overlay should border only the center image');
  assert.ok(mobileBrandGeometry.centerImage.naturalWidth > 0,
    'mobile reel center still should be decoded instead of showing an empty stage');
  assert.equal(await page.locator('.introduction__frame.is-center').evaluate(element => getComputedStyle(element).display), 'block',
    'mobile reel should render the active frame directly instead of relying on the desktop filmstrip transform');
  assert.ok(await page.locator('.introduction__mobile-still').evaluate((image: HTMLImageElement) => image.naturalWidth > 0),
    'mobile reel should use a decoded dedicated still element');
  assert.equal(await page.locator('.introduction__mobile-still').evaluate((image: HTMLImageElement) => getComputedStyle(image).objectFit), 'fill',
    'mobile center stills should fill the marker-defined frame without cover cropping');
  assert.equal(await page.locator('.introduction__mobile-still').evaluate((image: HTMLImageElement) => getComputedStyle(image).transform), 'none',
    'mobile center stills should not scale beyond the marker-defined frame');
  assert.notEqual(await page.locator('.introduction__mobile-still').evaluate((image: HTMLImageElement) => {
    image.dataset.focus = 'portrait-up';
    return getComputedStyle(image).transform;
  }), 'none', 'portrait mobile stills should use their approved 16:9 focus framing');
  assert.equal(await page.locator('.introduction__mobile-track > img').count(), 4,
    'mobile reel should keep a fourth incoming slot ready before each transition');
  assert.equal(await page.locator('.introduction__mobile-chrome .introduction__frame-corner').count(), 4,
    'mobile reel should keep four framing corners around the dedicated still');
  assert.notEqual(await page.locator('.introduction__frame.is-center').evaluate(element => getComputedStyle(element).backgroundImage), 'none',
    'mobile reel frames should carry an image background fallback');
  assert.ok((await rulerMarks.evaluateAll(elements => elements.every(element => getComputedStyle(element).display === 'block'))),
    'mobile reel should show the ruler calibration marks');
  const mobileChromeGeometry = await readChromeGeometry();
  const mobileStillBeforeAdvance = await page.locator('.introduction__mobile-still').getAttribute('src');
  const mobileSlotsBeforeAdvance = await page.locator('.introduction__mobile-track > img').evaluateAll(images =>
    images.map(image => image.getAttribute('src')));
  await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  const mobileSlotsDuringAdvance = await page.locator('.introduction__mobile-track > img').evaluateAll(images =>
    images.map(image => image.getAttribute('src')));
  assert.deepEqual(mobileSlotsDuringAdvance, mobileSlotsBeforeAdvance,
    'mobile still sources should remain stable while the track is moving');
  await page.waitForTimeout(300);
  const mobileFocusDuringAdvance = await page.evaluate(() => ({
    outgoing: getComputedStyle(document.querySelector('.introduction__mobile-still')!).filter,
    incoming: getComputedStyle(document.querySelector('.introduction__mobile-side--next')!).filter,
  }));
  assert.notEqual(mobileFocusDuringAdvance.outgoing, 'none',
    'the outgoing center still should blur and darken during the slide');
  assert.notEqual(mobileFocusDuringAdvance.incoming, 'brightness(0.58) blur(1.8px)',
    'the incoming right still should transition toward bright and focused during the slide');
  await page.waitForTimeout(900);
  const mobileStillAfterAdvance = await page.locator('.introduction__mobile-still').getAttribute('src');
  assert.notEqual(mobileStillAfterAdvance, mobileStillBeforeAdvance,
    'mobile dedicated still should advance with the slideshow');
  const mobileSlotsAfterAdvance = await page.locator('.introduction__mobile-track > img').evaluateAll(images =>
    images.map(image => image.getAttribute('src')));
  assert.deepEqual(mobileSlotsAfterAdvance.slice(0, 3), mobileSlotsBeforeAdvance.slice(1),
    'after the slide, the center and incoming stills should rotate into the left three slots');
  assert.notEqual(mobileSlotsAfterAdvance[3], mobileSlotsBeforeAdvance[3],
    'after the slide, a fresh still should enter from the right');
  const advancedMobileChromeGeometry = await readChromeGeometry();
  assert.deepEqual({ stage: advancedMobileChromeGeometry.stage, corners: advancedMobileChromeGeometry.corners, rail: advancedMobileChromeGeometry.rail },
    { stage: mobileChromeGeometry.stage, corners: mobileChromeGeometry.corners, rail: mobileChromeGeometry.rail },
    'the overlay should stay aligned and fixed on mobile as the reel advances');
  assert.ok(advancedMobileChromeGeometry.rail[0] >= advancedMobileChromeGeometry.stage[0] + advancedMobileChromeGeometry.stage[2],
    'on mobile, the progress ruler should remain outside the footage');

  await page.setViewportSize({ width: 768, height: 900 });
  await page.waitForTimeout(200);
  assert.equal(await page.locator('.introduction__mobile-strip').evaluate(element => getComputedStyle(element).display), 'block',
    'tablet-width reel should keep the mobile frame geometry');
  assert.equal(await page.locator('.introduction__image').evaluate(element => getComputedStyle(element).display), 'none',
    'tablet-width reel should not fall back to the desktop filmstrip');
});

test('hero reel plays the full untitled production video before advancing', { timeout: 30000 }, async (t) => {
  const { server, url } = await startDistServer();
  t.after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    Math.random = () => 0;
    const reelWindow = window as Window & { __heroReelTick?: () => void; __heroReelDelay?: number };
    const originalSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number) => {
      if ((timeout === 5000 || (timeout !== undefined && timeout >= 9000)) && typeof handler === 'function') {
        reelWindow.__heroReelTick = handler as () => void;
        reelWindow.__heroReelDelay = timeout;
        return 1;
      }
      return originalSetTimeout(handler, timeout);
    }) as typeof window.setTimeout;
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  for (let index = 0; index < 37; index += 1) {
    await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  }
  const productionVideo = page.locator('video[src="/assets/hero-strip/new-production-move.mp4"]');
  assert.equal(await productionVideo.count(), 1);
  assert.deepEqual(await productionVideo.evaluate(element => {
    const video = element as HTMLVideoElement;
    return { muted: video.muted, playsInline: video.playsInline, controls: video.controls, loop: video.loop };
  }), { muted: true, playsInline: true, controls: false, loop: false });
  await page.evaluate(() => { (window as Window & { __heroReelDelay?: number }).__heroReelDelay = undefined; });
  assert.equal(await page.evaluate(() => (window as Window & { __heroReelDelay?: number }).__heroReelDelay), undefined,
    'the video should wait for its ended event instead of a wall-clock timeout');
  await productionVideo.dispatchEvent('ended');
  assert.equal(await productionVideo.getAttribute('data-ended'), 'true',
    'the outgoing video should retain its final frame during the transition');
  assert.equal(await page.locator('.introduction__progress').getAttribute('aria-valuenow'), '39');
});

test('hero reel moves the ended video out with the mobile transition', { timeout: 30000 }, async (t) => {
  const { server, url } = await startDistServer();
  t.after(() => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const browser = await chromium.launch();
  t.after(() => browser.close());
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.addInitScript(() => {
    Math.random = () => 0;
    const reelWindow = window as Window & { __heroReelTick?: () => void };
    const originalSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number) => {
      if (timeout === 5000 && typeof handler === 'function') {
        reelWindow.__heroReelTick = handler as () => void;
        return 1;
      }
      return originalSetTimeout(handler, timeout);
    }) as typeof window.setTimeout;
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  for (let index = 0; index < 37; index += 1) {
    await page.evaluate(() => (window as Window & { __heroReelTick: () => void }).__heroReelTick());
  }
  await page.waitForTimeout(1000);
  const mobileVideo = page.locator('.introduction__mobile-video');
  assert.equal(await mobileVideo.isVisible(), true);
  await mobileVideo.dispatchEvent('ended');
  await page.waitForTimeout(80);
  const transitionState = await mobileVideo.evaluate(video => ({
    sliding: video.classList.contains('is-sliding'),
    transform: getComputedStyle(video).transform,
  }));
  assert.equal(transitionState.sliding, true, 'the ended mobile video should leave the center slot with the outgoing frame');
  assert.notEqual(transitionState.transform, 'none', 'the ended mobile video should visibly move left during the transition');
  await page.waitForTimeout(950);
  assert.equal(await page.locator('.introduction__mobile-side--prev').getAttribute('src'),
    '/assets/hero-strip/new-production-move-final-poster.webp',
    'the mobile outgoing side slot should hold the video final frame');
});
