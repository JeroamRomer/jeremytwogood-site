// Captures review screenshots of a running preview server for the Impeccable finish review.
// Usage: node scripts/capture-review.mjs http://localhost:4390
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:4390';
const out = '.impeccable/review';
mkdirSync(out, { recursive: true });

const shots = [
  { file: 'desktop.png', path: '/', width: 1440, height: 900 },
  { file: 'mobile.png', path: '/', width: 390, height: 844 },
  { file: 'case-desktop.png', path: '/work/shell-john-williams', width: 1440, height: 900 },
  { file: 'case-mobile.png', path: '/work/shell-john-williams', width: 390, height: 844 },
];

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
  await page.emulateMedia({ reducedMotion: 'reduce' }); // settle motion so captures are deterministic
  await page.goto(base + s.path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Deviation: scroll to the bottom and back before capturing so below-the-fold
  // loading="lazy" images (e.g. the About portrait) finish loading before the
  // full-page screenshot; a single fullPage screenshot otherwise leaves them blank.
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let scrolled = 0;
      const distance = window.innerHeight;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        scrolled += distance;
        if (scrolled >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/${s.file}`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${s.file}: horizontal overflow ${overflow}px`);
  await page.close();
}
await browser.close();
