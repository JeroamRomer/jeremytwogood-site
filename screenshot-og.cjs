const { chromium } = require('playwright');
const sharp = require('sharp');

const OG_W = 1200, OG_H = 630;
const BG = { r: 244, g: 241, b: 236 }; // #f4f1ec

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // Large viewport so the logo renders at full size without clipping
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('http://localhost:4321/og-image');
  await page.waitForFunction(() => document.body.getAttribute('data-ready') === 'true');
  await page.evaluate(() => {
    const toolbar = document.querySelector('astro-dev-toolbar');
    if (toolbar) toolbar.remove();
  });

  // Screenshot the logo with padding to capture SVG overflow from transform
  const logo = page.locator('.logo');
  const box = await logo.boundingBox();
  const pad = 40; // enough to capture translate(-21px) overflow plus stroke
  const clip = {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };
  const logoBuffer = await page.screenshot({ type: 'png', clip });
  await browser.close();

  // Get logo dimensions
  const meta = await sharp(logoBuffer).metadata();
  const lw = meta.width, lh = meta.height;

  // Center on cream canvas
  const left = Math.round((OG_W - lw) / 2);
  const top = Math.round((OG_H - lh) / 2);

  await sharp({
    create: { width: OG_W, height: OG_H, channels: 3, background: BG }
  })
    .composite([{ input: logoBuffer, left, top }])
    .jpeg({ quality: 95 })
    .toFile('public/og-image.jpg');

  console.log(`Done → public/og-image.jpg (logo ${lw}×${lh}, placed at ${left},${top})`);
})();
