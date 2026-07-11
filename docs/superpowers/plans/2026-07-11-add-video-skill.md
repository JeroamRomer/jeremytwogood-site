# Add-Video Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A project-scoped skill (`.claude/skills/add-video/`) that drives the whole add-a-video-to-the-site pipeline as a guided flow with approval gates, plus three deterministic helper scripts and a companion fix that derives the homepage project count.

**Architecture:** SKILL.md is the pipeline orchestrator (conversation-triggered, agent-driven, gated). Mechanical work — frame extraction, loop encoding, thumbnail compression — lives in small bundled scripts so encode settings stay byte-identical run to run. Data flows through the two existing JSON files (`projects.json`, `video-content.json`), which already feed the case-study page, chatbot, and MCP automatically.

**Tech Stack:** bash + ffmpeg/ffprobe (frames, loops), Node + sharp (thumbnail compression, already a dependency), node:test (script tests, ffmpeg-gated), Astro (Projects.astro companion change).

**Spec:** `docs/superpowers/specs/2026-07-11-add-video-skill-design.md`

---

## File Structure

```
.claude/skills/add-video/
  SKILL.md                      # pipeline orchestrator (Task 5)
  scripts/
    extract-frames.sh           # candidate thumbnail stills (Task 2)
    make-loop.sh                # suggest + cut hover loops (Task 3)
    compress-thumb.mjs          # sharp compression ≤300 KB (Task 4)
src/components/Projects.astro   # derived count string (Task 1)
tests/smoke.test.js             # + derived-count assertion (Task 1)
tests/add-video-scripts.test.js # NEW — script tests, ffmpeg-gated (Tasks 2-5)
package.json                    # add new test file to `npm test` (Task 6)
```

All paths relative to repo root `/Users/romer/Documents/Claude/Website`. `.claude/skills/` is NOT gitignored (only `.claude/worktrees/` is) — the skill gets committed.

---

### Task 1: Derive the homepage project count from projects.json

`src/components/Projects.astro:24` hardcodes `08 Projects · 2016—2026`. Derive it so adding a video never leaves it stale.

**Files:**
- Modify: `src/components/Projects.astro` (frontmatter + line 24)
- Test: `tests/smoke.test.js` (append)

- [ ] **Step 1: Write the smoke test**

Append to the end of `tests/smoke.test.js`:

```js
// ── Projects section ─────────────────────────────────────────────────────────

test('smoke: work section project count is derived from projects.json', () => {
  const projects = JSON.parse(readFileSync(join(ROOT, 'src/data/projects.json'), 'utf-8'));
  const count = String(projects.length).padStart(2, '0');
  const years = projects.map((p) => Number(p.year));
  const expected = `${count} Projects · ${Math.min(...years)}—${Math.max(...years)}`;
  const html = getHtml('index.html');
  assert.ok(html.includes(expected), `index.html must contain "${expected}"`);
});
```

(`readFileSync`, `join`, `ROOT`, `getHtml` are already imported/defined at the top of the file.)

- [ ] **Step 2: Run the test**

Run: `npm run build && node --test --test-name-pattern "project count" tests/smoke.test.js`
Expected: PASS — the hardcoded string currently happens to match the derived value (8 projects, years 2016–2026). This test's job is regression protection: it starts failing the moment a project is added and the string is stale. Confirm it passes, then proceed — the implementation change below is still required to make the string self-updating.

- [ ] **Step 3: Implement the derivation**

In `src/components/Projects.astro`, add to the frontmatter after the `previews` map (after line 15):

```js
// Section-head count, derived so it never goes stale when a project is added.
const projectCount = String(projects.length).padStart(2, '0');
const projectYears = projects.map((p) => Number(p.year));
const yearRange = `${Math.min(...projectYears)}—${Math.max(...projectYears)}`;
```

Replace line 24:

```html
      <span class="section-head__count">08 Projects · 2016—2026</span>
```

with:

```html
      <span class="section-head__count">{projectCount} Projects · {yearRange}</span>
```

- [ ] **Step 4: Rebuild and run the full smoke suite**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: all smoke tests PASS (including the new one — output is byte-identical to the old hardcode).

- [ ] **Step 5: Commit**

```bash
git add src/components/Projects.astro tests/smoke.test.js
git commit -m "feat: derive work-section project count from projects.json"
```

---

### Task 2: extract-frames.sh — candidate thumbnail stills

**Files:**
- Create: `.claude/skills/add-video/scripts/extract-frames.sh`
- Test: `tests/add-video-scripts.test.js` (new file)

- [ ] **Step 1: Write the failing test**

Create `tests/add-video-scripts.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SCRIPTS = join(ROOT, '.claude', 'skills', 'add-video', 'scripts');

function hasFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const FFMPEG = hasFfmpeg();
const SKIP = FFMPEG ? false : 'ffmpeg not installed — skipping add-video script tests';

// 20 s synthetic 720p test video, built once per run, reused by every test.
let fixtureVideo = null;
function fixture() {
  if (!fixtureVideo) {
    const dir = mkdtempSync(join(tmpdir(), 'addvideo-'));
    fixtureVideo = join(dir, 'test.mp4');
    execSync(
      `ffmpeg -y -v error -f lavfi -i "testsrc=duration=20:size=1280x720:rate=24" ` +
        `-pix_fmt yuv420p "${fixtureVideo}"`
    );
  }
  return fixtureVideo;
}

test('extract-frames: writes N spread candidate stills', { skip: SKIP }, () => {
  const out = mkdtempSync(join(tmpdir(), 'frames-'));
  execFileSync(join(SCRIPTS, 'extract-frames.sh'), [fixture(), out, '4']);
  const frames = readdirSync(out).filter((f) => f.startsWith('candidate-') && f.endsWith('.jpg'));
  assert.equal(frames.length, 4, 'must produce exactly 4 candidates');
  for (const f of frames) {
    assert.ok(statSync(join(out, f)).size > 5_000, `${f} must be a real image, not empty`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/add-video-scripts.test.js`
Expected: FAIL — `ENOENT ... extract-frames.sh` (script doesn't exist yet).

- [ ] **Step 3: Write the script**

Create `.claude/skills/add-video/scripts/extract-frames.sh`:

```bash
#!/usr/bin/env bash
# Extract N candidate thumbnail stills from a video, spread across its runtime.
# Each candidate is the most representative frame of its window (ffmpeg
# `thumbnail` filter), at full source resolution, as a high-quality JPEG.
#
# Usage: extract-frames.sh <video> <out-dir> [count]   (count defaults to 4)
# Prints the candidate paths, one per line.
set -euo pipefail

VIDEO="$1"
OUT="$2"
COUNT="${3:-4}"

mkdir -p "$OUT"
DUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$VIDEO")

for i in $(seq 1 "$COUNT"); do
  # Window i covers [(i-1)/COUNT, i/COUNT) of the runtime; sample its middle
  # 60% so candidates never sit on a hard cut at a window edge.
  START=$(awk "BEGIN{print (($i - 1) + 0.2) / $COUNT * $DUR}")
  LEN=$(awk "BEGIN{print 0.6 / $COUNT * $DUR}")
  ffmpeg -y -v error -ss "$START" -t "$LEN" -i "$VIDEO" \
    -vf "thumbnail=48" -frames:v 1 -q:v 2 "$OUT/candidate-$i.jpg"
done

ls "$OUT"/candidate-*.jpg
```

Then: `chmod +x .claude/skills/add-video/scripts/extract-frames.sh`

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/add-video-scripts.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/add-video/scripts/extract-frames.sh tests/add-video-scripts.test.js
git commit -m "feat: add-video skill — thumbnail candidate extraction script"
```

---

### Task 3: make-loop.sh — suggest + cut hover loops

Encode settings must match the six existing loops (verified via ffprobe on `chefnuit-loop.*`): 960×540, 24 fps, muted, ~4 s, h264 mp4 (~220 KB) + vp9 webm (~250 KB).

**Files:**
- Create: `.claude/skills/add-video/scripts/make-loop.sh`
- Test: `tests/add-video-scripts.test.js` (append)

- [ ] **Step 1: Write the failing tests**

Append to `tests/add-video-scripts.test.js`:

```js
test('make-loop suggest: prints a valid start time', { skip: SKIP }, () => {
  const out = execFileSync(join(SCRIPTS, 'make-loop.sh'), ['suggest', fixture()], {
    encoding: 'utf-8',
  });
  const start = parseFloat(out.trim());
  assert.ok(Number.isFinite(start), `output must be a number, got: ${out}`);
  assert.ok(start >= 0 && start <= 16, 'start must leave room for a 4s loop in a 20s video');
});

test('make-loop cut: encodes matching mp4+webm loop pair', { skip: SKIP }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'loop-'));
  const base = join(dir, 'test-loop');
  execFileSync(join(SCRIPTS, 'make-loop.sh'), ['cut', fixture(), '5', base]);

  for (const ext of ['mp4', 'webm']) {
    const file = `${base}.${ext}`;
    assert.ok(existsSync(file), `${ext} must exist`);
    assert.ok(statSync(file).size <= 300 * 1024, `${ext} must be ≤ 300 KB`);

    const probe = JSON.parse(
      execSync(
        `ffprobe -v error -show_streams -show_format -of json "${file}"`,
        { encoding: 'utf-8' }
      )
    );
    const video = probe.streams.find((s) => s.codec_type === 'video');
    assert.equal(video.width, 960, `${ext} width`);
    assert.equal(video.height, 540, `${ext} height`);
    assert.equal(video.r_frame_rate, '24/1', `${ext} frame rate`);
    assert.ok(!probe.streams.some((s) => s.codec_type === 'audio'), `${ext} must be muted`);
    const dur = parseFloat(probe.format.duration);
    assert.ok(Math.abs(dur - 4) < 0.3, `${ext} duration ~4s, got ${dur}`);
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/add-video-scripts.test.js`
Expected: extract-frames PASSES, both make-loop tests FAIL with `ENOENT ... make-loop.sh`.

- [ ] **Step 3: Write the script**

Create `.claude/skills/add-video/scripts/make-loop.sh`:

```bash
#!/usr/bin/env bash
# Hover-loop helper for the work cards on jeremytwogood.com.
#
#   make-loop.sh suggest <video>
#     Print a suggested loop start time in seconds: the scene change nearest
#     to 1/3 of the runtime (a high-motion moment past the intro), falling
#     back to 25% of the runtime when no scene changes are detected.
#
#   make-loop.sh cut <video> <start-seconds> <out-base> [duration]
#     Cut a muted segment (default 4 s) and encode BOTH loop files:
#     <out-base>.mp4 (h264) and <out-base>.webm (vp9), 960x540 @ 24 fps —
#     matching the six existing loops in public/assets/.
set -euo pipefail

MODE="$1"
VIDEO="$2"

DUR=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 "$VIDEO")

if [ "$MODE" = "suggest" ]; then
  LOOP_LEN=4
  TARGET=$(awk "BEGIN{print $DUR / 3}")
  MAX_START=$(awk "BEGIN{print $DUR - $LOOP_LEN}")
  # Scene-change timestamps (score > 0.30), from showinfo on the selected frames.
  SCENES=$(ffmpeg -i "$VIDEO" -vf "select='gt(scene,0.30)',showinfo" -f null - 2>&1 \
    | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 || true)
  SUGGEST=$(echo "$SCENES" | awk -v t="$TARGET" -v max="$MAX_START" '
    BEGIN { best = ""; bd = 1e18 }
    /[0-9]/ { if ($1 <= max) { d = ($1 > t) ? $1 - t : t - $1; if (d < bd) { bd = d; best = $1 } } }
    END { print best }')
  [ -z "$SUGGEST" ] && SUGGEST=$(awk "BEGIN{print $DUR * 0.25}")
  echo "$SUGGEST"
  exit 0
fi

if [ "$MODE" = "cut" ]; then
  START="$3"
  OUT_BASE="$4"
  LEN="${5:-4}"
  # Cover-fit any aspect ratio to the card's 16:9 frame, then conform to 24 fps.
  FILTERS="scale=960:540:force_original_aspect_ratio=increase,crop=960:540,fps=24"

  ffmpeg -y -v error -ss "$START" -t "$LEN" -i "$VIDEO" -an \
    -vf "$FILTERS" -c:v libx264 -crf 25 -maxrate 500k -bufsize 1000k \
    -pix_fmt yuv420p -movflags +faststart "${OUT_BASE}.mp4"

  ffmpeg -y -v error -ss "$START" -t "$LEN" -i "$VIDEO" -an \
    -vf "$FILTERS" -c:v libvpx-vp9 -b:v 0 -crf 36 "${OUT_BASE}.webm"

  ls -la "${OUT_BASE}.mp4" "${OUT_BASE}.webm"
  exit 0
fi

echo "Unknown mode: $MODE (expected 'suggest' or 'cut')" >&2
exit 1
```

Then: `chmod +x .claude/skills/add-video/scripts/make-loop.sh`

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/add-video-scripts.test.js`
Expected: PASS (3 tests). The vp9 encode of the 4 s fixture takes a few seconds — that's normal.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/add-video/scripts/make-loop.sh tests/add-video-scripts.test.js
git commit -m "feat: add-video skill — hover-loop suggest and cut script"
```

---

### Task 4: compress-thumb.mjs — thumbnail compression via sharp

**Files:**
- Create: `.claude/skills/add-video/scripts/compress-thumb.mjs`
- Test: `tests/add-video-scripts.test.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `tests/add-video-scripts.test.js`. This test needs sharp (already in package.json) but NOT ffmpeg, so it is not skip-gated:

```js
test('compress-thumb: output is ≤ 300 KB and ≤ 1600 px wide', async () => {
  const sharp = (await import('sharp')).default;
  const dir = mkdtempSync(join(tmpdir(), 'thumb-'));
  const input = join(dir, 'huge.png');

  // Photo-like fixture: random noise blurred, 2400px wide — too big as PNG,
  // forcing the script to resize and (likely) fall through to the JPEG ladder.
  const raw = Buffer.alloc(2400 * 1350 * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = Math.floor(Math.random() * 256);
  await sharp(raw, { raw: { width: 2400, height: 1350, channels: 3 } })
    .blur(6)
    .png()
    .toFile(input);

  const stdout = execFileSync(
    'node',
    [join(SCRIPTS, 'compress-thumb.mjs'), input, join(dir, 'out')],
    { encoding: 'utf-8' }
  );
  const outPath = stdout.trim().split('\n').pop();
  assert.ok(existsSync(outPath), `printed path must exist: ${outPath}`);
  assert.ok(statSync(outPath).size <= 300 * 1024, 'output must be ≤ 300 KB');

  const meta = await sharp(outPath).metadata();
  assert.ok(meta.width <= 1600, `width must be ≤ 1600, got ${meta.width}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/add-video-scripts.test.js`
Expected: previous 3 tests PASS, compress-thumb FAILS with `ENOENT ... compress-thumb.mjs`.

- [ ] **Step 3: Write the script**

Create `.claude/skills/add-video/scripts/compress-thumb.mjs`:

```js
#!/usr/bin/env node
// Compress a thumbnail still for public/assets/: resize to ≤ 1600 px wide,
// prefer lossless PNG when it fits the 300 KB budget, otherwise step down a
// JPEG quality ladder. Prints the final output path on the last stdout line.
//
// Usage: node compress-thumb.mjs <input> [out-base]
//   out-base defaults to the input path minus its extension. The script
//   appends .png or .jpg depending on which format wins.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const TARGET = 300 * 1024;
const MAX_WIDTH = 1600;
const JPEG_LADDER = [82, 74, 66, 58, 50];

const input = process.argv[2];
if (!input) {
  console.error('Usage: node compress-thumb.mjs <input> [out-base]');
  process.exit(1);
}
const outBase = process.argv[3] ?? input.replace(/\.[^.]+$/, '');

const resized = sharp(input).resize({ width: MAX_WIDTH, withoutEnlargement: true });

// Buffers are written with writeFile, NOT sharp().toFile() — running an
// encoded buffer back through sharp would re-encode it at default quality
// and defeat the ladder.
const png = await resized.clone().png({ compressionLevel: 9 }).toBuffer();
if (png.length <= TARGET) {
  await writeFile(`${outBase}.png`, png);
  console.log(`png ${(png.length / 1024).toFixed(0)} KB (lossless)`);
  console.log(`${outBase}.png`);
  process.exit(0);
}

let best = null;
for (const quality of JPEG_LADDER) {
  best = await resized.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
  if (best.length <= TARGET) {
    await writeFile(`${outBase}.jpg`, best);
    console.log(`jpg q${quality} ${(best.length / 1024).toFixed(0)} KB`);
    console.log(`${outBase}.jpg`);
    process.exit(0);
  }
}

// Nothing hit the budget (extremely noisy source) — keep the smallest JPEG
// and say so rather than failing the pipeline.
await writeFile(`${outBase}.jpg`, best);
console.warn(`warning: smallest JPEG is ${(best.length / 1024).toFixed(0)} KB, above the 300 KB target`);
console.log(`${outBase}.jpg`);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/add-video-scripts.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/add-video/scripts/compress-thumb.mjs tests/add-video-scripts.test.js
git commit -m "feat: add-video skill — sharp thumbnail compression script"
```

---

### Task 5: SKILL.md — the pipeline orchestrator

**Files:**
- Create: `.claude/skills/add-video/SKILL.md`
- Test: `tests/add-video-scripts.test.js` (append — structural check only)

- [ ] **Step 1: Write the failing test**

Append to `tests/add-video-scripts.test.js` (not skip-gated — no ffmpeg needed):

```js
test('skill: SKILL.md exists and references every bundled script', () => {
  const skillPath = join(ROOT, '.claude', 'skills', 'add-video', 'SKILL.md');
  assert.ok(existsSync(skillPath), 'SKILL.md must exist');
  const md = readFileSync(skillPath, 'utf-8');
  for (const script of ['extract-frames.sh', 'make-loop.sh', 'compress-thumb.mjs']) {
    assert.ok(md.includes(script), `SKILL.md must reference ${script}`);
    assert.ok(existsSync(join(SCRIPTS, script)), `${script} must exist`);
  }
  assert.ok(md.startsWith('---\nname: add-video'), 'frontmatter must lead with the skill name');
});
```

Also add `readFileSync` to the existing `node:fs` import at the top of the file:

```js
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/add-video-scripts.test.js`
Expected: 4 PASS, skill test FAILS ("SKILL.md must exist").

- [ ] **Step 3: Write SKILL.md**

Create `.claude/skills/add-video/SKILL.md` with exactly this content:

````markdown
---
name: add-video
description: Add a new video to jeremytwogood.com as a case-study project. Use when Jeremy wants to add or publish a new video to the site, create a new case study, or fill a coming-soon placeholder project. Guided pipeline — watch, copy, thumbnail, hover loop, data files, verify, commit — pausing for Jeremy's approval at every judgment point.
---

# Add a video to jeremytwogood.com

You drive the whole pipeline; Jeremy approves at every **GATE** before files
are written. Never skip a gate, never write data before its gate passes.
Scripts referenced below live in `.claude/skills/add-video/scripts/`
(repo-root relative).

## Already automatic — do NOT do these by hand

- **Case-study page** — `src/pages/work/[id].astro` generates `/work/<id>`
  from `projects.json` (any entry not `coming_soon`/`comparison`).
- **Chatbot + MCP data** — `api/_lib/chat-system.ts` and the MCP tools read
  `projects.json` + `video-content.json` at module load. One JSON edit feeds
  both; the live chatbot picks it up on the next Vercel deploy.
- **`agent-data.json`** (and the agent-discoverability artifacts, once that
  project ships) — regenerated by `npm run build`.
- **Sitemap, VideoObject JSON-LD, breadcrumbs, OG tags** — derived in
  `[id].astro` / `astro.config.mjs`.
- **Homepage project count** — derived from `projects.json` in
  `Projects.astro`.

## Step 1 — Intake

Collect from Jeremy (ask for whatever the message didn't include):
URL (YouTube or Vimeo), client, project name, type (e.g. "Advocacy Film ·
Documentary"), disciplines (e.g. "Editing · Motion Graphics"), role array,
year, `featured` (bool), `span` (grid width, existing entries use 2-3).

- Check `projects.json` for a matching `coming_soon` entry → **fill it**
  instead of appending.
- New entry: derive `id` as kebab-case `<client-short>-<project-short>`
  (pattern: `ttms-chef-nuit`, `ns-health-westray`).
- **New-client check:** if the client isn't in `profile.json` → `clients`,
  ask Jeremy whether to add it (feeds homepage clients section, chatbot,
  agent-data).

## Step 2 — Watch

Invoke the `watch` skill on the URL for transcript + frames. **Keep the
downloaded video file** (note the working directory the watch script prints)
— Steps 4-5 reuse it. Skip watch's own cleanup until Step 8 passes.

## Step 3 — Draft copy — GATE

Draft the `video-content.json` entry from the watch output. House style —
match the `ttms-chef-nuit` entry:

```json
{
  "summary": "One dense paragraph: runtime, producer/series, subject, what happens on screen, techniques visible (cinematography, lower-thirds, GFX), how it closes.",
  "mood": "three, comma-separated, adjectives",
  "subjects": ["People", "Organizations", "Places featured"],
  "themes": ["3-5 short theme phrases"],
  "transcript_excerpt": "A verbatim quote from the transcript, framed: Speaker explains: '...'",
  "agent_description": "Third-person, fact-dense paragraph for AI agents. Must name Jeremy's role (Editor: Jeremy Twogood), the client, what the video is, techniques, runtime, and any series/stats context."
}
```

Show the full draft to Jeremy. Take edits. Loop until approved.

## Step 4 — Thumbnail — GATE

Present options side by side:

1. **Platform still (free, no file):**
   - YouTube: `https://img.youtube.com/vi/<youtube_id>/maxresdefault.jpg`
   - Vimeo: `curl -s "https://vimeo.com/api/oembed.json?url=https://vimeo.com/<id>"`
     → `thumbnail_url` (may 404 on private videos — fall back to frames).
2. **Extracted frames:**
   ```bash
   .claude/skills/add-video/scripts/extract-frames.sh <downloaded-video> <tmp-dir> 4
   ```
   Read the candidate JPEGs so Jeremy can see them (Read tool renders them).

Jeremy picks one:
- Platform still → record its URL directly as `thumbnail` in `projects.json`.
- Extracted frame → compress and place it:
  ```bash
  node .claude/skills/add-video/scripts/compress-thumb.mjs <frame> public/assets/<id>-thumb
  ```
  The script prints the final path (`.png` if lossless fits 300 KB, else
  `.jpg`); use `/assets/<basename>` as `thumbnail`.

## Step 5 — Hover loop — GATE

```bash
# Propose a start point (scene change nearest 1/3 of runtime):
.claude/skills/add-video/scripts/make-loop.sh suggest <downloaded-video>

# Cut at the suggested (or Jeremy's) start:
.claude/skills/add-video/scripts/make-loop.sh cut <downloaded-video> <start> public/assets/<name>-loop
```

Loop filename follows the existing short-name convention (`chefnuit-loop`,
not the full project id). Show Jeremy the cut (open the .mp4 with
`open public/assets/<name>-loop.mp4`); re-cut at a different start until he
approves. Output is fixed at 960×540, 24 fps, muted, 4 s, mp4+webm ≤ 300 KB
each — that's in the script, don't override it.

## Step 6 — Write data

Only after Gates 3-5 have all passed:

1. `src/data/projects.json` — fill or append (match existing field order):
   ```json
   {
     "id": "<id>",
     "name": "<Project Name>",
     "client": "<Client>",
     "type": "<Type · Subtype>",
     "disciplines": "<Discipline · Discipline>",
     "year": "<YYYY>",
     "role": ["Editor"],
     "youtube_id": "<id-or-null>",
     "youtube_url": "<url-or-null>",
     "vimeo_id": null,
     "link": null,
     "thumbnail": "<url-or-/assets/path>",
     "coming_soon": false,
     "featured": true,
     "span": 2
   }
   ```
   (Vimeo videos set `vimeo_id` and omit/null the youtube fields — see
   `simbility-desk-series`.)
2. `src/data/video-content.json` — add the approved Step 3 entry under `<id>`.
3. `src/components/Projects.astro` — add to the `previews` map:
   ```js
   '<id>': '<name>-loop',
   ```
4. If the client was new and Jeremy approved: append to `profile.json` →
   `clients`.

## Step 7 — Optional reel clip

Ask: "Should this also go into the showreel index?" If yes, append to
`src/data/reel-index.json` → `clips`:

```json
{
  "name": "<Project> — <clip name>",
  "description": "<one-line description>",
  "client": "<Client>",
  "role": "<Role>",
  "tech_stack": [],
  "start_timestamp": "MM:SS",
  "end_timestamp": "MM:SS",
  "video_url": "<url>"
}
```

## Step 8 — Verify

```bash
npm run build        # also regenerates agent-data.json (+ discoverability artifacts)
npm test
npm run test:api
```

All must pass — if not, stop and fix before the commit gate. Then start the
dev server (`.claude/launch.json`) and check in the browser:
- Homepage: new card renders, hover plays the loop, project count is right.
- `/work/<id>`: copy, meta sidebar, player, and JSON-LD all render.

Now clean up the watch working directory.

## Step 9 — Commit — GATE

Show Jeremy a diff summary (`git status` + `git diff --stat`). Commit only on
his approval. **Do not push** — pushing deploys to production (Vercel
auto-deploys `main`); that's Jeremy's explicit call.

## Step 10 — Post-deploy live check (after Jeremy pushes)

```bash
# Page is live and contains the project name:
curl -sf https://www.jeremytwogood.com/work/<id> | grep -c "<Project Name>"

# Live chatbot knows the new video (proves the deployed prompt has the data):
curl -s -X POST https://www.jeremytwogood.com/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Tell me about <Project Name>"}]}'
```

The chat response must ground in the new `video-content.json` facts (streamed
as SSE — read the text deltas). If it doesn't, the deploy predates the data —
check the Vercel dashboard.

## Failure modes

| Problem | Action |
|---|---|
| watch download fails (login/region-locked) | Tell Jeremy plainly; ask for a local file path to use for frames/loop; copy can be drafted from his description if there's no transcript. |
| No ffmpeg | `brew install ffmpeg` |
| Vimeo oEmbed 404 | Use extracted frames only (Step 4 option 2). |
| Tests fail in Step 8 | Stop. Show output. Fix before the commit gate. |
| Loop files land > 300 KB | Source is unusually noisy — re-cut at a calmer moment rather than raising the bitrate. |
````

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/add-video-scripts.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Review SKILL.md against the spec**

Open `docs/superpowers/specs/2026-07-11-add-video-skill-design.md` and confirm every pipeline step, gate, and error-handling row appears in SKILL.md. Fix any gap inline.

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/add-video/SKILL.md tests/add-video-scripts.test.js
git commit -m "feat: add-video skill — guided pipeline SKILL.md"
```

---

### Task 6: Wire script tests into npm test + full verification

**Files:**
- Modify: `package.json` (test script)

- [ ] **Step 1: Add the new test file to `npm test`**

In `package.json`, change:

```json
"test": "node --test tests/build-agent-data.test.js tests/smoke.test.js tests/waveform-peaks.test.js",
```

to:

```json
"test": "node --test tests/build-agent-data.test.js tests/smoke.test.js tests/waveform-peaks.test.js tests/add-video-scripts.test.js",
```

(The ffmpeg-dependent tests self-skip on machines without ffmpeg, so `npm test` stays safe everywhere.)

- [ ] **Step 2: Run the full suite**

Run: `npm run build && npm test && npm run test:api`
Expected: all suites PASS — smoke (incl. new count test), build-agent-data, waveform-peaks, add-video-scripts (5), mcp, chat.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "test: run add-video script tests in npm test"
```

---

## Self-Review Notes

- **Spec coverage:** guided gates (Tasks 5 SKILL.md steps 3/4/5/9), scripts (Tasks 2-4), companion count change (Task 1), new-client check + thumbnail compression + post-deploy check (SKILL.md steps 1/4/10), discoverability dependency note (SKILL.md "already automatic"), reel clip (SKILL.md step 7). Out-of-scope items from the spec are absent by design.
- **Types/paths:** `SCRIPTS` and `ROOT` constants defined once in Task 2's test file and reused verbatim in Tasks 3-5. Script paths in SKILL.md match the created files.
- **Honest test caveat:** Task 1's test passes before the implementation change (hardcode currently matches the derived value); it exists as a staleness guard, and the plan says so explicitly.
