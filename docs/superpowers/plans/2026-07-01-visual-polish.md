# Visual Polish Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved visual polish package to jeremytwogood.com: native view-transition card→case-study morph, an NLE-style scroll timeline bar, real-waveform Sound section synced to SoundCloud playback, scroll-in section reveals, and running timecodes on work-card hover previews.

**Architecture:** Progressive-enhancement MPA — the site stays plain multi-page Astro 6. Each feature is an independent module: pure CSS where possible (view transitions), small vanilla inline scripts elsewhere. A shared `tcFormat` helper feeds both timecode consumers. Waveform peaks are precomputed by a local script into committed JSON; no runtime audio decoding. Every feature degrades gracefully (no JS, no browser support, no peak data → today's behavior).

**Tech Stack:** Astro 6, vanilla TS in Astro `<script>` blocks (bundled by Vite), native View Transitions API (CSS-only), IntersectionObserver, SoundCloud Widget API, ffmpeg (build-time only), `node:test` (+ tsx for TS tests).

**Spec:** `docs/superpowers/specs/2026-07-01-visual-polish-design.md` (approved 2026-07-01)

**Conventions in this repo:**
- Smoke tests assert on built HTML in `dist/` — run `npm run build` before `npm test`.
- TS tests run via `npm run test:mcp` / `test:chat` pattern: `node --import tsx --test <files>`, importing source with explicit `.ts` extension.
- Inline component scripts are processed by Astro (they may `import` from `src/`).
- Commit after every task.

---

### Task 1: Shared timecode helper

Every timecode display (timeline bar, hover chips) uses one formatter.

**Files:**
- Create: `src/scripts/timecode.ts`
- Test: `tests/timecode.test.ts`
- Modify: `package.json` (add `test:ui` script)

- [ ] **Step 1: Write the failing test**

Create `tests/timecode.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tcFormat } from '../src/scripts/timecode.ts';

test('tcFormat: zero is 00:00:00:00', () => {
  assert.equal(tcFormat(0), '00:00:00:00');
});

test('tcFormat: frames at 24fps', () => {
  assert.equal(tcFormat(1.5), '00:00:01:12');
});

test('tcFormat: minutes and hours roll over', () => {
  assert.equal(tcFormat(3725.25), '01:02:05:06');
});

test('tcFormat: negative and NaN clamp to zero', () => {
  assert.equal(tcFormat(-3), '00:00:00:00');
  assert.equal(tcFormat(Number.NaN), '00:00:00:00');
});

test('tcFormat: custom fps', () => {
  assert.equal(tcFormat(0.5, 30), '00:00:00:15');
});
```

Add to `package.json` `"scripts"` (after `"test"`):

```json
"test:ui": "node --import tsx --test tests/timecode.test.ts",
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ui`
Expected: FAIL — cannot find module `../src/scripts/timecode.ts`

- [ ] **Step 3: Write the implementation**

Create `src/scripts/timecode.ts`:

```ts
/** Format seconds as SMPTE-style timecode HH:MM:SS:FF. */
export function tcFormat(seconds: number, fps = 24): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const whole = Math.floor(safe);
  const frames = Math.floor((safe - whole) * fps);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const s = whole % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(h)}:${p(m)}:${p(s)}:${p(frames)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:ui`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/scripts/timecode.ts tests/timecode.test.ts package.json
git commit -m "feat: shared SMPTE timecode formatter"
```

---

### Task 2: Card → case-study morph (native View Transitions)

Pure CSS cross-document view transitions. The work-card still and the case-study player share a `view-transition-name`, so the browser morphs one into the other on navigation (and back). Firefox/unsupported browsers keep instant navigation.

**Files:**
- Modify: `src/styles/global.css` (append at end)
- Modify: `src/components/Projects.astro:58-72` (card still style)
- Modify: `src/pages/work/[id].astro:85-96` (case player style)
- Test: `tests/smoke.test.js`

- [ ] **Step 1: Write the failing smoke tests**

In `tests/smoke.test.js`, extend the `node:fs` import at the top:

```js
import { readFileSync, existsSync, readdirSync } from 'node:fs';
```

Append at the end of the file:

```js
// ── View-transition morph ───────────────────────────────────────────────────

function getBundledCss() {
  const dir = join(DIST, '_astro');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(dir, f), 'utf-8'))
    .join('\n');
}

test('smoke: cross-document view transitions enabled in bundled CSS', () => {
  assert.ok(getBundledCss().includes('@view-transition'), '@view-transition rule must be present');
});

test('smoke: work card and case-study hero share a view-transition-name', () => {
  const home = getHtml('index.html');
  const caseStudy = getHtml('work/shell-john-williams/index.html');
  assert.ok(home.includes('view-transition-name:work-shell-john-williams'), 'card still must be tagged');
  assert.ok(caseStudy.includes('view-transition-name:work-shell-john-williams'), 'case hero must be tagged');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npm test`
Expected: the two new tests FAIL (all pre-existing tests PASS)

- [ ] **Step 3: Enable view transitions in global CSS**

Append to `src/styles/global.css`:

```css
/* ---------- Cross-document view transitions (card → case-study morph) ---------- */
@view-transition{ navigation:auto; }
@media (prefers-reduced-motion: reduce){
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*){ animation:none !important; }
}
```

- [ ] **Step 4: Tag the work-card stills**

In `src/components/Projects.astro`, inside the `projects.map` callback (after the `const label = ...` line, before the `if (project.comparison)` check), add:

```ts
        const stillStyle = [
          href ? `view-transition-name:work-${project.id}` : '',
          hasThumbnail ? `background-image:url('${project.thumbnail}');background-size:contain;background-repeat:no-repeat;background-position:center` : '',
        ].filter(Boolean).join(';') || undefined;
```

Then replace the still `<div>`'s style attribute:

```astro
            <div
              class={`work-card__still ${stillClass}`}
              style={stillStyle}
            >
```

- [ ] **Step 5: Tag the case-study player**

In `src/pages/work/[id].astro`, change the `case__player` anchor's style attribute from:

```astro
        style={`background-image:url('${project.thumbnail}')`}
```

to:

```astro
        style={`view-transition-name:work-${project.id};background-image:url('${project.thumbnail}')`}
```

- [ ] **Step 6: Build and verify tests pass**

Run: `npm run build && npm test`
Expected: ALL tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/components/Projects.astro "src/pages/work/[id].astro" tests/smoke.test.js
git commit -m "feat: card-to-case-study morph via native view transitions"
```

---

### Task 3: NLE scroll timeline bar (homepage only)

Fixed bottom bar styled like an editing timeline: one "clip" per homepage section (widths ∝ real section heights), amber playhead, 24fps timecode over a nominal 60s program. Fades in past the hero. Desktop only. Lifts the chat trigger while visible.

**Files:**
- Create: `src/components/TimelineBar.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css` (chat-trigger lift rule)
- Test: `tests/smoke.test.js`

- [ ] **Step 1: Write the failing smoke tests**

Append to `tests/smoke.test.js`:

```js
// ── NLE timeline bar ────────────────────────────────────────────────────────

test('smoke: homepage mounts the NLE timeline bar', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('data-tlbar'), 'timeline bar root must be present');
  assert.ok(html.includes('tlbar__clip'), 'clip segments must render');
});

test('smoke: timeline bar is homepage-only', () => {
  const caseStudy = getHtml('work/shell-john-williams/index.html');
  assert.ok(!caseStudy.includes('data-tlbar'), 'case-study pages must not mount the bar');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npm test`
Expected: the two new tests FAIL

- [ ] **Step 3: Create the component**

Create `src/components/TimelineBar.astro` (complete file):

```astro
---
// Homepage-only NLE-style scroll timeline: sections rendered as clips with
// widths proportional to their real heights, an amber playhead + timecode
// chip tracking scroll. Desktop only; duplicates nav functionally, so it is
// hidden from the accessibility tree.
const sections = [
  { id: 'top', label: 'Hero' },
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'builds', label: 'AI Builds' },
  { id: 'sound', label: 'Sound' },
  { id: 'contact', label: 'Contact' },
];
---
<div class="tlbar" data-tlbar aria-hidden="true">
  <div class="tlbar__clips">
    {sections.map((s) => (
      <button class="tlbar__clip" data-target={s.id} tabindex="-1">
        <span>{s.label}</span>
      </button>
    ))}
  </div>
  <div class="tlbar__playhead" data-tlbar-playhead></div>
  <div class="tlbar__tc" data-tlbar-tc>00:00:00:00</div>
</div>

<style>
  .tlbar{
    position:fixed; left:0; right:0; bottom:0; height:40px; z-index:60;
    background:#0a0a09; border-top:1px solid var(--dark-rule);
    opacity:0; transform:translateY(100%); pointer-events:none;
    transition:opacity .35s ease, transform .35s cubic-bezier(.22,1,.36,1);
  }
  .tlbar.is-visible{ opacity:1; transform:none; pointer-events:auto; }
  .tlbar__clips{ display:flex; height:100%; }
  .tlbar__clip{
    position:relative; display:flex; align-items:center; justify-content:center;
    border:none; border-right:1px solid #111; background:#1c1a16;
    cursor:pointer; min-width:0; padding:0;
  }
  .tlbar__clip::before{
    content:""; position:absolute; left:0; top:0; bottom:0; width:2px;
    background:rgba(200,146,42,.2);
  }
  .tlbar__clip span{
    font-family:var(--mono); font-weight:500; font-size:9px;
    letter-spacing:.16em; text-transform:uppercase; color:var(--dark-mute);
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap; padding:0 8px;
  }
  .tlbar__clip.is-active{ background:#2a2415; }
  .tlbar__clip.is-active span{ color:var(--amber); }
  .tlbar__playhead{
    position:absolute; top:0; bottom:0; left:0; width:1.5px;
    background:var(--amber); pointer-events:none; will-change:transform;
  }
  .tlbar__playhead::before{
    content:""; position:absolute; top:0; left:-5px;
    border:6px solid transparent; border-top:7px solid var(--amber);
  }
  .tlbar__tc{
    position:absolute; right:10px; top:-30px;
    background:#0a0a09; border:1px solid var(--dark-rule); border-radius:3px;
    color:var(--amber); font-family:var(--mono-actual); font-size:10.5px;
    letter-spacing:.08em; padding:3px 8px; pointer-events:none;
  }
  @media (max-width:719px){ .tlbar{ display:none; } }
  @media (prefers-reduced-motion: reduce){ .tlbar{ transition:none; } }
</style>

<script>
  import { tcFormat } from '../scripts/timecode';

  (function () {
    const bar = document.querySelector('[data-tlbar]') as HTMLElement | null;
    if (!bar) return;
    const desktop = window.matchMedia('(min-width: 720px)');
    const playhead = bar.querySelector('[data-tlbar-playhead]') as HTMLElement;
    const tcEl = bar.querySelector('[data-tlbar-tc]') as HTMLElement;
    const clips = Array.from(bar.querySelectorAll('.tlbar__clip')) as HTMLElement[];
    const DURATION = 60; // nominal "program length" in seconds mapped onto full page scroll

    let bounds: { el: HTMLElement; start: number }[] = [];
    function measure() {
      if (!desktop.matches) return;
      clips.forEach((clip) => {
        const sec = document.getElementById(clip.dataset.target || '');
        if (sec) clip.style.flexGrow = String(Math.max(sec.offsetHeight, 1));
      });
      bounds = clips
        .map((clip) => {
          const sec = document.getElementById(clip.dataset.target || '');
          return sec ? { el: clip, start: sec.offsetTop } : null;
        })
        .filter(Boolean) as { el: HTMLElement; start: number }[];
    }

    function progress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    }

    let raf = 0;
    function update() {
      raf = 0;
      const f = progress();
      playhead.style.transform = `translateX(${f * (bar.clientWidth - 2)}px)`;
      tcEl.textContent = tcFormat(f * DURATION);
      // Active clip = section containing the viewport midpoint.
      const mid = window.scrollY + window.innerHeight / 2;
      let active = bounds.length - 1;
      for (let i = 0; i < bounds.length; i++) {
        if (mid >= bounds[i].start) active = i;
      }
      bounds.forEach((b, i) => b.el.classList.toggle('is-active', i === active));
      // Visible once past half the hero; the chat trigger lifts with it.
      const hero = document.getElementById('top');
      const show = hero ? window.scrollY > hero.offsetHeight * 0.5 : true;
      bar.classList.toggle('is-visible', show);
      document.body.classList.toggle('has-tlbar', show && desktop.matches);
    }
    function schedule() { if (!raf) raf = requestAnimationFrame(update); }

    // Scrub: plain click seeks smoothly, drag follows the pointer directly.
    function seek(clientX: number, smooth: boolean) {
      const r = bar.getBoundingClientRect();
      const f = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: f * max, behavior: smooth ? 'smooth' : 'auto' });
    }
    let dragging = false;
    let moved = false;
    let startX = 0;
    bar.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false; startX = e.clientX;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 3) moved = true;
      if (moved) seek(e.clientX, false);
    });
    bar.addEventListener('pointerup', (e) => {
      if (dragging && !moved) seek(e.clientX, true);
      dragging = false;
    });

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', () => { measure(); schedule(); });
    document.fonts.ready.then(() => { measure(); schedule(); });
    measure();
    schedule();
  })();
</script>
```

- [ ] **Step 4: Mount it on the homepage**

In `src/pages/index.astro`, add the import:

```astro
import TimelineBar from '../components/TimelineBar.astro';
```

and mount it after `<Footer />`:

```astro
  <Footer />
  <TimelineBar />
</BaseLayout>
```

- [ ] **Step 5: Add the chat-trigger lift rule**

Append to `src/styles/global.css`:

```css
/* ---------- Chat trigger lift while the timeline bar is visible ---------- */
body.has-tlbar .cw__trigger{ bottom:74px; transition:bottom .35s cubic-bezier(.22,1,.36,1), transform .18s ease, box-shadow .18s ease; }
body.has-tlbar .cw__panel{ bottom:140px; }
```

(These out-specify the widget's scoped `.cw__trigger:where(...)` rules: two classes beat one.)

- [ ] **Step 6: Build and verify tests pass**

Run: `npm run build && npm test`
Expected: ALL tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/TimelineBar.astro src/pages/index.astro src/styles/global.css tests/smoke.test.js
git commit -m "feat: NLE-style scroll timeline bar on homepage"
```

---

### Task 4: Waveform peaks module + build script

Peak extraction is a pure, unit-tested function; the script wraps it with ffmpeg decoding and file mapping. Runs locally on demand — not part of the build pipeline.

**Files:**
- Create: `scripts/waveform-peaks.mjs`
- Create: `scripts/build-waveforms.mjs`
- Create: `src/data/waveforms.json` (initially `{}`)
- Test: `tests/waveform-peaks.test.js`
- Modify: `package.json` (add test file to `"test"` script)

- [ ] **Step 1: Write the failing test**

Create `tests/waveform-peaks.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePeaks } from '../scripts/waveform-peaks.mjs';

test('computePeaks: returns requested bucket count, normalized to 1', () => {
  const samples = new Int16Array(9600);
  for (let i = 0; i < samples.length; i++) samples[i] = (i % 100) * 100;
  const peaks = computePeaks(samples, 96);
  assert.equal(peaks.length, 96);
  assert.equal(Math.max(...peaks), 1);
  assert.ok(peaks.every((p) => p >= 0 && p <= 1));
});

test('computePeaks: silence yields zeros', () => {
  assert.deepEqual(computePeaks(new Int16Array(1000), 10), new Array(10).fill(0));
});

test('computePeaks: empty input yields empty array', () => {
  assert.deepEqual(computePeaks(new Int16Array(0), 10), []);
});

test('computePeaks: loud section stands out', () => {
  const samples = new Int16Array(1000);
  for (let i = 500; i < 600; i++) samples[i] = 30000;
  const peaks = computePeaks(samples, 10);
  assert.equal(peaks[5], 1);
  assert.equal(peaks[0], 0);
});
```

Update `package.json` `"test"` script to:

```json
"test": "node --test tests/build-agent-data.test.js tests/smoke.test.js tests/waveform-peaks.test.js",
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test tests/waveform-peaks.test.js`
Expected: FAIL — cannot find module `../scripts/waveform-peaks.mjs`

- [ ] **Step 3: Write the peaks module**

Create `scripts/waveform-peaks.mjs`:

```js
/**
 * Reduce raw mono PCM samples to N normalized peak buckets (0..1, 2 decimals).
 * Kept separate from build-waveforms.mjs so it can be unit-tested without ffmpeg.
 */
export function computePeaks(samples, buckets = 96) {
  if (!samples || samples.length === 0 || buckets < 1) return [];
  const per = samples.length / buckets;
  const peaks = new Array(buckets).fill(0);
  for (let b = 0; b < buckets; b++) {
    let max = 0;
    const start = Math.floor(b * per);
    const end = Math.min(Math.floor((b + 1) * per), samples.length);
    for (let i = start; i < end; i++) {
      const v = Math.abs(samples[i]);
      if (v > max) max = v;
    }
    peaks[b] = max;
  }
  const top = Math.max(...peaks);
  return peaks.map((p) => (top > 0 ? Math.round((p / top) * 100) / 100 : 0));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/waveform-peaks.test.js`
Expected: 4 tests PASS

- [ ] **Step 5: Write the build script and empty data file**

Create `src/data/waveforms.json` containing exactly:

```json
{}
```

Create `scripts/build-waveforms.mjs`:

```js
#!/usr/bin/env node
/**
 * Precompute waveform peak data for the Sound section.
 *
 * Usage:  node scripts/build-waveforms.mjs
 *
 * Reads audio from design-sources/audio/ (gitignored, local-only). Files must
 * be named with the track-number prefix from profile.json tracks, e.g.
 *   01-eagle.mp3   02-from-time.wav   10-sewer-frank.m4a
 * Requires ffmpeg on PATH. Writes src/data/waveforms.json (committed).
 * Tracks without a matching file keep their previous data absence — the site
 * renders them without a waveform.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computePeaks } from './waveform-peaks.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const AUDIO_DIR = join(ROOT, 'design-sources', 'audio');
const OUT = join(ROOT, 'src', 'data', 'waveforms.json');
const BUCKETS = 96;

const tracks = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'profile.json'), 'utf-8')).tracks;

if (!existsSync(AUDIO_DIR)) {
  console.error(`No audio directory at ${AUDIO_DIR} — create it and add files named <num>-*.mp3/wav/m4a/aiff`);
  process.exit(1);
}

const files = readdirSync(AUDIO_DIR).filter((f) => /\.(mp3|wav|m4a|aiff|aif|flac)$/i.test(f));
const out = {};

for (const track of tracks) {
  const file = files.find((f) => f.startsWith(track.num));
  if (!file) {
    console.warn(`- no audio file for track ${track.num} — ${track.title}`);
    continue;
  }
  // Decode to mono 8kHz s16le PCM on stdout — plenty of resolution for peaks.
  const pcm = execFileSync('ffmpeg', [
    '-v', 'error', '-i', join(AUDIO_DIR, file),
    '-f', 's16le', '-ac', '1', '-ar', '8000', '-',
  ], { maxBuffer: 512 * 1024 * 1024 });
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
  out[track.num] = computePeaks(samples, BUCKETS);
  console.log(`+ ${track.num} ${track.title} <- ${file} (${samples.length} samples)`);
}

writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(`Wrote ${OUT} (${Object.keys(out).length} tracks)`);
```

- [ ] **Step 6: Verify the script's guard path**

Run: `node scripts/build-waveforms.mjs`
Expected (no audio dir yet): exits 1 with `No audio directory at .../design-sources/audio`

- [ ] **Step 7: Run the full plain-JS test suite**

Run: `npm run build && npm test`
Expected: ALL tests PASS

- [ ] **Step 8: Commit**

```bash
git add scripts/waveform-peaks.mjs scripts/build-waveforms.mjs src/data/waveforms.json tests/waveform-peaks.test.js package.json
git commit -m "feat: waveform peak precompute script + tested peaks module"
```

---

### Task 5: Sound section — waveform rendering + SoundCloud playback sync

Track rows gain server-rendered SVG waveform strips (only for tracks present in `waveforms.json`). Clicking a track works exactly as today, plus: the SoundCloud Widget API is lazy-loaded and its `PLAY_PROGRESS` events light the playing track's waveform behind a synced playhead.

**Files:**
- Modify: `src/components/Sound.astro` (markup + script)
- Modify: `src/styles/global.css` (`.tracks li` restructure + wave styles)
- Test: `tests/smoke.test.js`

- [ ] **Step 1: Write the failing smoke test**

Append to `tests/smoke.test.js`:

```js
// ── Sound waveforms ─────────────────────────────────────────────────────────

test('smoke: sound section track rows are restructured for waveforms', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('tracks__row'), 'restructured track rows must render');
  const waveforms = JSON.parse(readFileSync(join(ROOT, 'src/data/waveforms.json'), 'utf-8'));
  if (Object.keys(waveforms).length === 0) {
    assert.ok(!html.includes('tracks__wave'), 'no waveform strips until peak data exists');
  } else {
    assert.ok(html.includes('tracks__wave-base'), 'waveform SVG must render');
    assert.ok(html.includes('tracks__wave-lit'), 'lit overlay must render');
  }
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npm test`
Expected: the new test FAILS (no `tracks__row` yet)

- [ ] **Step 3: Update Sound.astro frontmatter and markup**

In `src/components/Sound.astro`, replace the frontmatter with:

```astro
---
import profile from '../data/profile.json';
import waveforms from '../data/waveforms.json';
const tracks = (profile as any).tracks as { num: string; title: string; url: string }[];
const peaksFor = (num: string): number[] => (waveforms as Record<string, number[]>)[num] ?? [];
const WAVE_W = 96;
const WAVE_H = 32;
---
```

Replace the `<ul class="tracks">…</ul>` block with:

```astro
    <ul class="tracks">
      {tracks.map((track) => {
        const peaks = peaksFor(track.num);
        return (
          <li>
            <div class="tracks__row">
              <span class="tracks__num">{track.num}</span>
              <a class="tracks__title" href={track.url} target="_blank" rel="noopener">{track.title}</a>
              <span class="tracks__dur">↗</span>
            </div>
            {peaks.length > 0 && (
              <div class="tracks__wave" aria-hidden="true">
                <svg class="tracks__wave-base" viewBox={`0 0 ${WAVE_W} ${WAVE_H}`} preserveAspectRatio="none">
                  {peaks.map((p, i) => {
                    const h = Math.max(p * WAVE_H, 0.6);
                    return <rect x={i + 0.15} y={(WAVE_H - h) / 2} width={0.7} height={h} />;
                  })}
                </svg>
                <svg class="tracks__wave-lit" viewBox={`0 0 ${WAVE_W} ${WAVE_H}`} preserveAspectRatio="none" style="clip-path:inset(0 100% 0 0)">
                  {peaks.map((p, i) => {
                    const h = Math.max(p * WAVE_H, 0.6);
                    return <rect x={i + 0.15} y={(WAVE_H - h) / 2} width={0.7} height={h} />;
                  })}
                </svg>
                <span class="tracks__wave-ph" style="left:0%"></span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
```

- [ ] **Step 4: Replace the Sound.astro script**

Replace the entire `<script>` block in `src/components/Sound.astro` with:

```astro
<script>
  // SoundCloud inline player + waveform playback sync.
  (function () {
    var titles = document.querySelectorAll('.tracks__title');
    var player = document.getElementById('sound-player');
    var iframe = document.getElementById('sc-iframe');
    if (!titles.length || !player || !iframe) return;

    var widget: any = null;

    function setProgress(li: Element | null, frac: number) {
      if (!li) return;
      var lit = li.querySelector('.tracks__wave-lit') as HTMLElement | null;
      var ph = li.querySelector('.tracks__wave-ph') as HTMLElement | null;
      var pct = Math.min(Math.max(frac, 0), 1) * 100;
      if (lit) lit.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      if (ph) ph.style.left = pct + '%';
    }

    function bindWidget() {
      var SC = (window as any).SC;
      if (!SC || widget) return;
      widget = SC.Widget(iframe);
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (e: any) {
        setProgress(document.querySelector('.tracks li.is-playing'), e.relativePosition);
      });
      widget.bind(SC.Widget.Events.FINISH, function () {
        setProgress(document.querySelector('.tracks li.is-playing'), 0);
      });
    }

    function loadWidgetApi() {
      if ((window as any).SC || document.querySelector('script[data-sc-api]')) return;
      var s = document.createElement('script');
      s.src = 'https://w.soundcloud.com/player/api.js';
      s.setAttribute('data-sc-api', '');
      s.onload = bindWidget;
      document.head.appendChild(s);
    }

    titles.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var url = a.getAttribute('href');
        if (!url) return;
        e.preventDefault();
        var prev = document.querySelector('.tracks li.is-playing');
        if (prev) setProgress(prev, 0);
        document.querySelectorAll('.tracks li').forEach(function (li) { li.classList.remove('is-playing'); });
        var li = a.closest('li'); if (li) li.classList.add('is-playing');

        if (widget && (window as any).SC) {
          // Widget already bound — swap tracks without recreating the iframe.
          widget.load(url, { auto_play: true, hide_related: true, show_comments: false, show_user: true, show_reposts: false, show_teaser: false, visual: false, color: '#c8922a' });
        } else {
          var src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url)
            + '&color=%23c8922a&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false';
          (iframe as HTMLIFrameElement).src = src;
          loadWidgetApi();
          bindWidget();
        }
        (player as HTMLElement).hidden = false;
        player.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  })();
</script>
```

- [ ] **Step 5: Update the track-row CSS in global.css**

In `src/styles/global.css`, replace the `.tracks li` rule:

```css
.tracks li{
  display:grid;
  grid-template-columns:auto 1fr auto;
  align-items:baseline;
  gap:16px;
  padding:14px 0;
  border-bottom:1px solid #3a3835;
  font-family:var(--body);
  font-size:14.5px;
  color:#ece8df;
  cursor:pointer;
  transition:color .15s;
}
```

with:

```css
.tracks li{
  padding:14px 0;
  border-bottom:1px solid #3a3835;
  color:#ece8df;
  cursor:pointer;
  transition:color .15s;
}
.tracks__row{
  display:grid;
  grid-template-columns:auto 1fr auto;
  align-items:baseline;
  gap:16px;
  font-family:var(--body);
  font-size:14.5px;
}
```

Then append after the `.tracks li.is-playing .tracks__dur::after` rule:

```css
.tracks__wave{
  position:relative;
  height:32px;
  margin-top:10px;
}
.tracks__wave svg{
  position:absolute; inset:0;
  width:100%; height:100%; display:block;
}
.tracks__wave-base rect{ fill:#3a3835; }
.tracks__wave-lit rect{ fill:var(--amber); }
.tracks__wave-ph{
  position:absolute; top:-2px; bottom:-2px; width:1.5px;
  background:#ece8df; opacity:0;
}
.tracks li.is-playing .tracks__wave-ph{ opacity:.9; }
```

- [ ] **Step 6: Build and verify tests pass**

Run: `npm run build && npm test`
Expected: ALL tests PASS (waveforms.json is `{}`, so the test asserts the no-waveform branch)

- [ ] **Step 7: Commit**

```bash
git add src/components/Sound.astro src/styles/global.css tests/smoke.test.js
git commit -m "feat: waveform strips + SoundCloud playback sync in Sound section"
```

---

### Task 6: Scroll-in section reveals (site-wide)

Section headers get `.is-inview` from a shared IntersectionObserver as they enter the viewport; CSS draws the amber eyebrow tick and rises the title. Gated behind an `html.js` class so no-JS visitors always see content.

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (js-class script in head + observer module before `</body>`)
- Modify: `src/styles/global.css`
- Test: `tests/smoke.test.js`

- [ ] **Step 1: Write the failing smoke test**

Append to `tests/smoke.test.js`:

```js
// ── Scroll-in reveals ───────────────────────────────────────────────────────

test('smoke: reveal styles are gated behind html.js', () => {
  const css = getBundledCss();
  assert.ok(css.includes('.is-inview'), 'reveal CSS must be present');
  assert.ok(css.includes('html.js'), 'reveal CSS must be js-gated');
});

test('smoke: pages add the js class before paint', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes("classList.add('js')"), 'inline js-class script must be present');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npm test`
Expected: the two new tests FAIL

- [ ] **Step 3: Add the scripts to BaseLayout**

In `src/layouts/BaseLayout.astro`, add immediately after the `<meta name="generator" ...>` line in `<head>`:

```astro
    <script is:inline>document.documentElement.classList.add('js');</script>
```

Add before `</body>` (after `<SpeedInsights />`):

```astro
    <script>
      // Scroll-in reveals: section headers gain .is-inview on first entry.
      const revealTargets = document.querySelectorAll('.section-head, .sound__head, .contact__inner');
      if ('IntersectionObserver' in window && revealTargets.length) {
        const rio = new IntersectionObserver((entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-inview');
              rio.unobserve(e.target);
            }
          });
        }, { threshold: 0.3 });
        revealTargets.forEach((t) => rio.observe(t));
      } else {
        revealTargets.forEach((t) => t.classList.add('is-inview'));
      }
    </script>
```

- [ ] **Step 4: Add the reveal CSS**

Append to `src/styles/global.css`:

```css
/* ---------- Scroll-in section reveals (html.js gate keeps no-JS content visible) ---------- */
html.js .section-head .eyebrow::before,
html.js .sound__head .eyebrow::before{
  width:0;
  transition:width .7s cubic-bezier(.22,1,.36,1) .1s;
}
html.js .section-head.is-inview .eyebrow::before,
html.js .sound__head.is-inview .eyebrow::before{ width:24px; }
html.js .section-head .section-title,
html.js .sound__head h2,
html.js .contact__inner h2{
  opacity:0; transform:translateY(18px);
  transition:opacity .6s ease .15s, transform .6s cubic-bezier(.22,1,.36,1) .15s;
}
html.js .section-head.is-inview .section-title,
html.js .sound__head.is-inview h2,
html.js .contact__inner.is-inview h2{ opacity:1; transform:none; }
@media (prefers-reduced-motion: reduce){
  html.js .section-head .section-title,
  html.js .sound__head h2,
  html.js .contact__inner h2{ transform:none; transition:opacity .4s ease; }
  html.js .section-head .eyebrow::before,
  html.js .sound__head .eyebrow::before{ transition:none; width:24px; }
}
```

- [ ] **Step 5: Build and verify tests pass**

Run: `npm run build && npm test`
Expected: ALL tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/layouts/BaseLayout.astro src/styles/global.css tests/smoke.test.js
git commit -m "feat: scroll-in section reveals with js-gated styles"
```

---

### Task 7: Running timecode on work-card hover previews

Cards that already play preview loops on hover gain a corner chip showing the loop's real `video.currentTime` as 24fps timecode with a blinking record dot. Hidden on touch devices.

**Files:**
- Modify: `src/components/Projects.astro` (markup, style block, script)
- Test: `tests/smoke.test.js`

- [ ] **Step 1: Write the failing smoke test**

Append to `tests/smoke.test.js`:

```js
// ── Hover timecodes ─────────────────────────────────────────────────────────

test('smoke: work cards with previews render a timecode chip', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('work-card__tc'), 'timecode chip must render');
  assert.ok(html.includes('00:00:00:00'), 'chip must start at zero timecode');
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npm run build && npm test`
Expected: the new test FAILS

- [ ] **Step 3: Add the chip markup**

In `src/components/Projects.astro`, directly after the `{preview && (…<video>…)}` block, add:

```astro
            {preview && (
              <span class="work-card__tc" aria-hidden="true">00:00:00:00</span>
            )}
```

- [ ] **Step 4: Add the chip styles**

Append inside the existing `<style>` block of `src/components/Projects.astro`:

```css
  /* Running timecode chip while the hover preview plays */
  .work-card__tc{
    position:absolute; top:16px; right:18px;
    display:inline-flex; align-items:center; gap:6px;
    background:rgba(10,10,9,.75);
    border:1px solid rgba(232,228,220,.15);
    border-radius:3px;
    padding:3px 8px;
    font-family:var(--mono-actual);
    font-size:10px;
    letter-spacing:.08em;
    color:var(--amber);
    opacity:0;
    transition:opacity .3s ease .1s;
    pointer-events:none;
  }
  .work-card__tc::before{
    content:""; width:5px; height:5px; border-radius:50%;
    background:var(--amber);
    animation:tc-blink 1s steps(1) infinite;
  }
  @keyframes tc-blink{ 50%{ opacity:.25; } }
  .work-card:hover .work-card__tc{ opacity:1; }
  .work-card:has(.work-card__tc):hover .work-card__corner{ opacity:0; }
  @media (hover: none){ .work-card__tc{ display:none; } }
```

- [ ] **Step 5: Extend the hover script**

In `src/components/Projects.astro`, replace the hover-to-play block of the `<script>` (keep the `[data-coming-soon]` block below it unchanged) with:

```ts
  import { tcFormat } from '../scripts/timecode';

  // Hover-to-play: load + play the loop on hover, pause + reset on leave.
  // preload="none" means nothing downloads until the first hover.
  // While playing, the corner chip shows the loop's real time as timecode.
  document.querySelectorAll('.work-card').forEach((card) => {
    const v = card.querySelector('.work-card__preview') as HTMLVideoElement | null;
    if (!v) return;
    const tc = card.querySelector('.work-card__tc') as HTMLElement | null;
    let raf = 0;
    const tick = () => {
      if (tc) tc.textContent = tcFormat(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    card.addEventListener('mouseenter', () => {
      v.play().catch(() => {});
      if (tc && !raf) raf = requestAnimationFrame(tick);
    });
    card.addEventListener('mouseleave', () => {
      v.pause();
      try { v.currentTime = 0; } catch (e) {}
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (tc) tc.textContent = '00:00:00:00';
    });
  });
```

- [ ] **Step 6: Build and verify tests pass**

Run: `npm run build && npm test`
Expected: ALL tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/Projects.astro tests/smoke.test.js
git commit -m "feat: running timecode chip on work-card hover previews"
```

---

### Task 8: Full verification pass

**Files:** none created — verification only.

- [ ] **Step 1: Run every suite**

```bash
npm run build && npm test && npm run test:ui && npm run test:api
```

Expected: ALL PASS.

- [ ] **Step 2: Live verification in the preview browser**

Start the dev server and verify each feature (use the preview tools, desktop viewport 1280×800):

1. Homepage loads clean — no console errors.
2. Scroll down: section headers reveal (eyebrow tick draws, titles rise) exactly once each.
3. Timeline bar fades in past the hero; playhead + timecode track scroll; active clip highlights; click a clip position → smooth-scrolls; drag scrubs; chat trigger sits above the bar.
4. Hover a work card: preview loop plays and the timecode chip ticks; leaving resets it.
5. Click a work card → case study; in a supporting browser the thumbnail morphs into the player (verify no error in non-supporting engines: navigation still works).
6. Sound section: rows render; with `waveforms.json` still `{}` there are no wave strips; clicking a track still plays via SoundCloud.
7. Resize to mobile (375×812): timeline bar absent; everything else intact; no horizontal overflow.
8. Emulate `prefers-reduced-motion: reduce`: reveals fade without translate; no morph animation; timeline has no fade transition but still tracks scroll.

Fix anything broken (diagnose in source, edit, re-verify), then re-run Step 1.

- [ ] **Step 3: Waveform data (needs Jeremy's audio files)**

When Jeremy drops audio files into `design-sources/audio/` named `01-*.mp3` … `10-*.mp3` (matching track numbers in `profile.json`):

```bash
node scripts/build-waveforms.mjs
npm run build && npm test
```

Expected: script logs one `+` line per track; smoke test now asserts the waveform branch; verify in preview that strips render and light up in amber sync with playback.

```bash
git add src/data/waveforms.json
git commit -m "data: real waveform peaks for sound tracks"
```

(If audio isn't available yet, ship without it — the site renders exactly as today and this step runs later.)

- [ ] **Step 4: Final commit / push check**

```bash
git status
git log --oneline -8
```

Expected: clean tree, one commit per task. Push (Vercel auto-deploys `main`) only when Jeremy confirms.
