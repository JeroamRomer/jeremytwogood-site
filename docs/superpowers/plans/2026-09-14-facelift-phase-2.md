# Facelift Phase 2: The Open Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild jeremytwogood.com's visual layer as "The Open Sequence" (the site as an editor's working screen) without losing any existing behavior, data, or agent-facing surface.

**Architecture:** Plain multi-page Astro 6, progressive enhancement, no new runtime dependencies. Pure layout math lives in `src/lib/sequence.ts` (unit-tested); media lookups in `src/lib/media.ts`; the homepage first viewport becomes a `Suite` of small components under `src/components/suite/` with one client controller `src/scripts/sequence-player.ts`. Every other homepage section becomes a full-width "bin" panel sharing primitives in `src/styles/global.css`. Old CSS is deleted only in Task 15, after every consumer has moved.

**Tech Stack:** Astro 6, TypeScript, node:test (+ tsx for `.ts` tests), Playwright (screenshots), Impeccable 4.3.1 detector and agents.

**Spec:** `docs/superpowers/specs/2026-09-14-facelift-design.md` (read "Phase 1 outcome"). Also read `DESIGN.md` (the seed system) and `.impeccable/surfaces/src-pages-index-astro.md` (direction contract). Approved prototype: `.impeccable/mocks/proto/seq.html`, served by the `proto` launch config on port 4380.

## Global Constraints

- Branch: `facelift` in `/Users/romer/Documents/Claude/Website`. Commit after every task. End commit messages with the attribution line from the session's system reminder.
- No new npm dependencies.
- Fonts (Google Fonts): Archivo (variable `wdth` 62..125, `wght` 100..900), Barlow (400, 500, 600), Martian Mono (variable `wdth` 75..112.5, `wght` 100..800). Syne, Inter, Montserrat and JetBrains Mono are removed in Task 15. Caveat stays for the single "Slide me!" hint on the Thales comparison card (sanctioned exception, documented in DESIGN.md at the finish).
- Colours: only the tokens defined in Task 3. One warm accent (`--mango`) for the playhead, the active tab, the primary action and the wordmark period. Teal = video, green = audio, red hatch = offline.
- No functional text below 11px. Monospace (`--font-readout`) only for measured values: timecode, durations, counts, years, positions.
- No shadows, glows, gradients, blur, pulsing dots, eyebrow labels above headings, or colored side borders. Square corners (clips 2px).
- Footage untouched: no tints, washes or overlays on stills or video.
- Every timecode, duration and count comes from data. A clip without a known `duration_seconds` shows no duration; never invent one.
- Behavior that must keep working: page timeline bar (restyled, scrubs the page), hover-to-play loops, SoundCloud waveforms, chat widget, lightbox, card-to-case-study View Transitions, the Thales grade slider. Scroll-in reveals are removed (motion grammar is the playhead only; confirmed by DESIGN.md).
- Content: body copy unchanged. Label and heading changes are limited to the ones written in this plan. Nothing is dropped outright: hero meta ("Toronto, ON · 43.65°N", "Available · 2026", "EST · GMT−5"), 01–08 numbering, the CAOT coming-soon project and "Watch Sizzle" are all restyled, not removed.
- Agent surfaces untouched: `api/`, `public/llms.txt`, `.well-known`, JSON-LD blocks, MCP discovery comment, `agent-data.json` pipeline.
- Must work without JavaScript, under `prefers-reduced-motion`, and at 390px wide with no horizontal page scroll.
- Test commands: `npm run build && npm test` (smoke tests need a fresh build), `npm run test:ui`, `npm run test:api`. All must pass at the end of every task.
- Verification of visual tasks: start the `dev` launch config (Astro on 4321) with the Browser pane, check 1440x900 and 390x844, and run `.claude/skills/impeccable/scripts/impeccable detect <changed component files>`. Browser-pane screenshots may not render in this environment; if so, capture with Playwright via `require('/Users/romer/Documents/Claude/Website/node_modules/playwright')` into the session scratchpad and Read the JPEGs.

## Decisions carried from Phase 1 (2026-09-14)

- Direction: The Open Sequence. Top of the homepage is a suite: panel bar, bins pane, program monitor, info pane, and a sequence (ruler, V1 clips sized by real running time, A1 waveform, playhead).
- Page timeline bar survives as a slim bottom bar that scrubs the page; the top sequence picks clips.
- Below the fold every section is a bin panel: Work (icon view), About (clip properties), AI builds (list view), Sound (waveform rows), Contact (properties).
- Phones: sequence stacks vertically as clip rows with duration bars; no sideways scroll.
- Clients: merge every name from `profile.json`, `HIRE.md` and the About list into `profile.json` (canonical), and mirror it in `HIRE.md`.
- Bugs folded in: mobile hero dead CSS disappears with the hero (Task 5); `/reel` gets real styling (Task 14); the coming-soon project renders last (Tasks 2, 6).

## Wording changes in this plan (approved with the plan)

| Where | Before | After |
|---|---|---|
| Work heading | "Selected Work" eyebrow + "Twenty years of solutions delivered." + "08 Projects · 2016–2026" | "Work" + "8 projects · 2016 to 2026" |
| About | "About" eyebrow + "A producer who still cuts the picture." + "EST. 2006 · TORONTO" + "Selected Clients" | "About" heading; the same lead line; "Producing since 2006"; "Clients" |
| AI builds | "AI Builds" eyebrow + "Software that removes the busywork." + "05 Shipped · /ai-builds"; "Try it out"; "Internal · Rome Brone" | "AI builds" + "5 builds" + "Open as a page"; "Open app" / "App Store"; "Internal" |
| /ai-builds | "Every build, shipped or in progress." | "AI builds" |
| Sound | "Sound" eyebrow + "Original compositions."; "Full catalogue →"; track "01"; "↗" | "Sound" + lede starting "Original compositions."; "Full catalogue on"; "A1"; "Play" |
| Contact | "Let's make something." as h2 | "Contact" heading; "Let's make something." as the statement |
| Hero | "Multimedia Producer · Video Editor · AI Tooling."; "View Work ↓" | the profile title "Multimedia Producer & Video Editor"; the View Work button is dropped (the Work tab and bins do its job) |
| Timeline bar | "Intro"; running fake timecode | "Top"; no timecode |
| Chat trigger | unlabeled orb | "Ask about my work" |
| Case study | "← Selected Work"; eyebrow "Client · Year" | "← Selected work"; client and year move into Properties; "Previous clip" / "Next clip" |
| /reel | "Reel"; "Watch on YouTube ↗" | "Demo sizzle"; "Watch on YouTube" |
| /mcp | eyebrow "Model Context Protocol" | readout "Model Context Protocol" beside the heading |

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `src/data/profile.json` | merged client list | 1 |
| `src/data/projects.json` | adds `duration_seconds` | 1 |
| `HIRE.md`, `PRODUCT.md`, `.claude/skills/add-video/SKILL.md` | docs kept in sync with data | 1, 5, 10 |
| `tests/site-data.test.js` | data integrity (durations, clients) | 1 |
| `src/lib/media.ts` | preview loop lookup per project | 2 |
| `src/lib/sequence.ts` | clip ordering, layout math, ruler marks, labels | 2 |
| `tests/sequence.test.ts` | unit tests for both libs | 2 |
| `src/styles/global.css` | tokens, base, shared panel primitives, work-item styles | 3, 6, 10, 15 |
| `src/layouts/BaseLayout.astro` | font link, reveal script removal | 3, 10, 15 |
| `src/components/Nav.astro` | panel bar (site-wide) | 4 |
| `src/components/Footer.astro` | status bar | 4 |
| `src/components/suite/Suite.astro` | first viewport wrapper + client data payload | 5 |
| `src/components/suite/BinsPane.astro` | bin links + clip list | 5 |
| `src/components/suite/ProgramMonitor.astro` | monitor + transport | 5 |
| `src/components/suite/InfoPane.astro` | name, role, bio, actions, properties | 5 |
| `src/components/suite/Sequence.astro` | ruler, V1, A1, playhead; stacked rows on phones | 5 |
| `src/scripts/sequence-player.ts` | monitor/sequence controller | 5 |
| `src/components/Projects.astro`, `ComparisonCard.astro` | Work bin (icon view) | 6 |
| `src/components/About.astro` | About bin | 7 |
| `src/components/BuildsList.astro` (new), `AIBuilds.astro`, `AIBuildsGrid.astro` | AI builds list view (home + page) | 8 |
| `src/components/Sound.astro` | Sound bin | 9 |
| `src/components/Contact.astro` | Contact bin | 10 |
| `src/components/TimelineBar.astro` | slim page scrub bar | 11 |
| `src/components/ChatWidget.astro`, `Lightbox.astro` | flat panel restyle | 12 |
| `src/pages/work/[id].astro` | case study as source monitor + properties | 13 |
| `src/components/Reel.astro`, `src/pages/mcp.astro` | standalone pages | 14 |
| `tests/smoke.test.js` | updated per task | 4–14 |
| `scripts/capture-review.mjs` (new) | review screenshots | 16 |
| Deleted: `src/components/Hero.astro` (5), `src/components/Clients.astro` (7) | | |

---

### Task 1: Data: merged clients and real running times

**Files:**
- Modify: `src/data/profile.json` (`clients`)
- Modify: `src/data/projects.json` (add `duration_seconds` after `youtube_url` / `vimeo_url`)
- Modify: `HIRE.md` (Notable clients), `PRODUCT.md` (Evidence on Hand → Clients), `.claude/skills/add-video/SKILL.md` (Step 6 JSON)
- Create: `tests/site-data.test.js`
- Modify: `package.json` (`test` script)

**Interfaces:**
- Produces: `profile.clients: string[]` (14 names, canonical); `project.duration_seconds?: number` (integer seconds, present only when known).

- [ ] **Step 1: Write the failing test**

Create `tests/site-data.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(join(ROOT, p), 'utf-8');
const profile = JSON.parse(read('src/data/profile.json'));
const projects = JSON.parse(read('src/data/projects.json'));

const ALL_CLIENTS = [
  'Google', 'Microsoft Xbox', 'Shell', 'Sony Ericsson', 'Sobeys',
  'Mirvish Productions', 'Canova Media', 'Journeyman Film Company',
  'Volvo', 'Mitsubishi Motors',
  'Simbility', 'NS Health', 'Thales Canada', 'Ewing Morris & Co.',
];

test('site-data: profile.clients is the merged list with no duplicates', () => {
  for (const name of ALL_CLIENTS) assert.ok(profile.clients.includes(name), `missing client: ${name}`);
  assert.equal(new Set(profile.clients).size, profile.clients.length, 'clients must be unique');
});

test('site-data: HIRE.md lists every client', () => {
  const hire = read('HIRE.md');
  for (const name of profile.clients) assert.ok(hire.includes(name), `HIRE.md missing ${name}`);
});

test('site-data: every YouTube project records a positive integer duration', () => {
  for (const p of projects.filter((p) => p.youtube_id)) {
    assert.ok(Number.isInteger(p.duration_seconds) && p.duration_seconds > 0, `${p.id} needs duration_seconds`);
  }
});

test('site-data: durations, when present, are positive integers', () => {
  for (const p of projects) {
    if (p.duration_seconds === undefined) continue;
    assert.ok(Number.isInteger(p.duration_seconds) && p.duration_seconds > 0, `${p.id} has a bad duration`);
  }
});
```

In `package.json`, append `tests/site-data.test.js` to the `test` script:

```json
"test": "node --test tests/build-agent-data.test.js tests/smoke.test.js tests/waveform-peaks.test.js tests/add-video-scripts.test.js tests/site-data.test.js",
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/site-data.test.js`
Expected: FAIL on "missing client: Volvo" and "shell-john-williams needs duration_seconds".

- [ ] **Step 3: Ask Jeremy for the two unknown running times**

Simbility (Vimeo 223385212, login-gated) and Thales Canada · RCN (no public film) cannot be measured. Ask: "What are the running times of the Simbility desk series and the Thales RCN film? If you don't know, I'll leave them blank and those clips won't show a time." Record only numbers he gives.

- [ ] **Step 4: Update the data**

In `src/data/profile.json`, replace the `clients` array with:

```json
"clients": [
  "Google",
  "Microsoft Xbox",
  "Shell",
  "Sony Ericsson",
  "Sobeys",
  "Mirvish Productions",
  "Canova Media",
  "Journeyman Film Company",
  "Volvo",
  "Mitsubishi Motors",
  "Simbility",
  "NS Health",
  "Thales Canada",
  "Ewing Morris & Co."
],
```

In `src/data/projects.json`, add `"duration_seconds"` directly after `youtube_url` (measured 2026-09-14 with `yt-dlp --print duration`):

| id | duration_seconds |
|---|---|
| `shell-john-williams` | `437` |
| `ttms-chef-nuit` | `85` |
| `xbox-forza-5` | `114` |
| `ttms-5-points` | `307` |
| `ns-health-westray` | `138` |

Add `duration_seconds` to `simbility-desk-series` (after `vimeo_url`) and `thales-rcn` only if Jeremy gave numbers in Step 3. Never add it to `caot-brand-film`.

In `HIRE.md`, replace the "Notable clients" line with:

```markdown
Google, Microsoft Xbox, Shell, Sony Ericsson, Sobeys, Mirvish Productions, Canova Media,
Journeyman Film Company, Volvo, Mitsubishi Motors, Simbility, NS Health, Thales Canada,
Ewing Morris & Co.
```

In `PRODUCT.md` → Evidence on Hand, replace the whole "Clients:" bullet with:

```markdown
- **Clients (canonical, `profile.json`, merged 2026-09-14):** Google, Microsoft Xbox, Shell, Sony Ericsson, Sobeys, Mirvish Productions, Canova Media, Journeyman Film Company, Volvo, Mitsubishi Motors, Simbility, NS Health, Thales Canada, Ewing Morris & Co.
```

In `.claude/skills/add-video/SKILL.md` Step 6, add `"duration_seconds": <seconds>,` after the `youtube_url` line of the JSON example, and add this sentence after the code block: "Measure `duration_seconds` with `yt-dlp --print duration --skip-download -q <watch-url>`; omit the field if the platform will not report it."

- [ ] **Step 5: Run tests to verify they pass**

Run: `node --test tests/site-data.test.js && node scripts/build-agent-data.js && node --test tests/build-agent-data.test.js`
Expected: all PASS; `public/agent-data.json` now lists 14 clients.

- [ ] **Step 6: Commit**

```bash
git add src/data/profile.json src/data/projects.json HIRE.md PRODUCT.md .claude/skills/add-video/SKILL.md tests/site-data.test.js package.json public/agent-data.json
git commit -m "data: merge client lists and record real running times"
```

---

### Task 2: Sequence and media libraries

**Files:**
- Create: `src/lib/media.ts`
- Create: `src/lib/sequence.ts`
- Create: `tests/sequence.test.ts`
- Modify: `package.json` (`test:ui` script)

**Interfaces:**
- Consumes: `projects.json` shape (Task 1).
- Produces:
  - `media.ts`: `interface MediaLoop { mp4: string; webm?: string }`, `const PREVIEW_LOOPS: Record<string, string>`, `function loopFor(p: { id: string; comparison?: boolean; graded_src?: string }): MediaLoop | null`.
  - `sequence.ts`: `interface SequenceProject`, `interface Clip`, `interface Sequence`, `interface RulerMark`, `orderOnlineFirst<T>(items: T[]): T[]`, `hasCaseStudy(p): boolean`, `mmss(seconds: number): string`, `roleLabel(p): string`, `buildSequence(projects: SequenceProject[], resolveLoop: (p: SequenceProject) => MediaLoop | null): Sequence`, `rulerMarks(totalSeconds: number, maxMarks?: number): RulerMark[]`.

- [ ] **Step 1: Write the failing test**

Create `tests/sequence.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loopFor, PREVIEW_LOOPS } from '../src/lib/media.ts';
import { buildSequence, hasCaseStudy, mmss, orderOnlineFirst, roleLabel, rulerMarks } from '../src/lib/sequence.ts';

const base = { client: 'C', year: '2020', type: 'T', thumbnail: '/t.jpg' };

test('mmss: pads minutes and seconds, adds hours past 3600', () => {
  assert.equal(mmss(0), '00:00');
  assert.equal(mmss(437), '07:17');
  assert.equal(mmss(3723), '1:02:03');
  assert.equal(mmss(-5), '00:00');
});

test('orderOnlineFirst: keeps order, moves coming-soon items last', () => {
  const out = orderOnlineFirst([{ id: 'a', coming_soon: true }, { id: 'b' }, { id: 'c' }]);
  assert.deepEqual(out.map((x) => x.id), ['b', 'c', 'a']);
});

test('roleLabel: joins arrays, falls back to disciplines', () => {
  assert.equal(roleLabel({ role: ['Editor', 'Colour Grade'] }), 'Editor, Colour Grade');
  assert.equal(roleLabel({ disciplines: 'Motion Graphics · Titles' }), 'Motion Graphics · Titles');
  assert.equal(roleLabel({}), '');
});

test('hasCaseStudy: excludes coming-soon and comparison projects', () => {
  assert.equal(hasCaseStudy({ id: 'x' }), true);
  assert.equal(hasCaseStudy({ id: 'x', coming_soon: true }), false);
  assert.equal(hasCaseStudy({ id: 'x', comparison: true }), false);
});

test('loopFor: preview loops, comparison fallback, null otherwise', () => {
  assert.deepEqual(loopFor({ id: 'shell-john-williams' }), { webm: '/assets/shell-loop.webm', mp4: '/assets/shell-loop.mp4' });
  assert.deepEqual(loopFor({ id: 'thales-rcn', comparison: true, graded_src: '/assets/thales-graded.mp4' }), { mp4: '/assets/thales-graded.mp4' });
  assert.equal(loopFor({ id: 'nope' }), null);
  assert.equal(Object.keys(PREVIEW_LOOPS).length, 6);
});

test('buildSequence: widths follow real durations and sum to 100%', () => {
  const seq = buildSequence([
    { ...base, id: 'a', name: 'A', duration_seconds: 300 },
    { ...base, id: 'b', name: 'B', duration_seconds: 100 },
  ], () => null);
  assert.equal(seq.layoutSeconds, 400);
  assert.equal(seq.clips[0].widthPct, 75);
  assert.equal(seq.clips[1].startPct, 75);
  assert.equal(seq.clips[1].widthPct, 25);
  assert.equal(seq.clips[0].durationLabel, '05:00');
  assert.equal(seq.allKnown, true);
  assert.equal(seq.knownSeconds, 400);
});

test('buildSequence: unknown durations take the median width but show no label', () => {
  const seq = buildSequence([
    { ...base, id: 'a', name: 'A', duration_seconds: 100 },
    { ...base, id: 'b', name: 'B' },
    { ...base, id: 'c', name: 'C', duration_seconds: 300 },
  ], () => null);
  const b = seq.clips.find((c) => c.id === 'b')!;
  assert.equal(b.durationSeconds, null);
  assert.equal(b.durationLabel, '');
  assert.equal(b.layoutSeconds, 200);
  assert.equal(b.relPct, 0);
  assert.equal(seq.allKnown, false);
  assert.equal(seq.knownSeconds, 400);
});

test('buildSequence: offline clips go last, have no href or loop, and do not affect allKnown', () => {
  const seq = buildSequence([
    { ...base, id: 'soon', name: 'Soon', coming_soon: true },
    { ...base, id: 'a', name: 'A', duration_seconds: 60 },
  ], () => ({ mp4: '/x.mp4' }));
  assert.deepEqual(seq.clips.map((c) => c.id), ['a', 'soon']);
  const soon = seq.clips[1];
  assert.equal(soon.offline, true);
  assert.equal(soon.href, null);
  assert.equal(soon.loop, null);
  assert.equal(seq.allKnown, true);
  assert.equal(seq.clips[0].href, '/work/a');
});

test('buildSequence: real data puts Shell first with 07:17 and CAOT last', () => {
  const projects = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url), 'utf-8'));
  const seq = buildSequence(projects, loopFor);
  assert.equal(seq.clips[0].id, 'shell-john-williams');
  assert.equal(seq.clips[0].durationLabel, '07:17');
  assert.equal(seq.clips.at(-1)!.id, 'caot-brand-film');
  const total = seq.clips.reduce((a, c) => a + c.widthPct, 0);
  assert.ok(Math.abs(total - 100) < 0.01, `widths sum to ${total}`);
});

test('rulerMarks: picks a step giving at most maxMarks marks', () => {
  const marks = rulerMarks(1351);
  assert.equal(marks[0].label, '00:00');
  assert.ok(marks.length <= 6);
  assert.equal(marks[1].seconds, 300);
  assert.deepEqual(rulerMarks(0), []);
});
```

In `package.json`, set:

```json
"test:ui": "node --import tsx --test tests/timecode.test.ts tests/sequence.test.ts",
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:ui`
Expected: FAIL with "Cannot find module '../src/lib/media.ts'".

- [ ] **Step 3: Write `src/lib/media.ts`**

```ts
/** Silent preview loops in public/assets (mp4 + webm), keyed by project id. */
export interface MediaLoop {
  mp4: string;
  webm?: string;
}

export const PREVIEW_LOOPS: Record<string, string> = {
  'shell-john-williams': 'shell-loop',
  'simbility-desk-series': 'simbility-loop',
  'ttms-chef-nuit': 'chefnuit-loop',
  'xbox-forza-5': 'xbox-loop',
  'ttms-5-points': 'fivepoints-loop',
  'ns-health-westray': 'nshealth-loop',
};

interface ProjectMedia {
  id: string;
  comparison?: boolean | null;
  graded_src?: string | null;
}

export function loopFor(p: ProjectMedia): MediaLoop | null {
  const name = PREVIEW_LOOPS[p.id];
  if (name) return { webm: `/assets/${name}.webm`, mp4: `/assets/${name}.mp4` };
  if (p.comparison && p.graded_src) return { mp4: p.graded_src };
  return null;
}
```

- [ ] **Step 4: Write `src/lib/sequence.ts`**

```ts
import type { MediaLoop } from './media';

export interface SequenceProject {
  id: string;
  name: string;
  client: string;
  year: string | number;
  type: string;
  thumbnail: string;
  role?: string[] | string | null;
  disciplines?: string | null;
  duration_seconds?: number | null;
  coming_soon?: boolean | null;
  comparison?: boolean | null;
  graded_src?: string | null;
}

export interface Clip {
  index: number;
  id: string;
  name: string;
  client: string;
  year: string;
  type: string;
  roleLabel: string;
  thumbnail: string;
  /** True running time in seconds; null when unknown. */
  durationSeconds: number | null;
  /** "07:17", or "" when the duration is unknown. */
  durationLabel: string;
  startSeconds: number;
  /** Width on the timeline: the real duration, or the median of known durations. */
  layoutSeconds: number;
  startPct: number;
  widthPct: number;
  /** Duration relative to the longest known clip (0 when unknown); drives phone duration bars. */
  relPct: number;
  href: string | null;
  offline: boolean;
  loop: MediaLoop | null;
}

export interface Sequence {
  clips: Clip[];
  layoutSeconds: number;
  knownSeconds: number;
  /** Every online clip has a known duration. */
  allKnown: boolean;
}

export interface RulerMark {
  seconds: number;
  pct: number;
  label: string;
}

const round = (n: number) => Math.round(n * 10000) / 10000;

export function orderOnlineFirst<T extends { coming_soon?: boolean | null }>(items: T[]): T[] {
  return [...items.filter((i) => !i.coming_soon), ...items.filter((i) => i.coming_soon)];
}

export function hasCaseStudy(p: { coming_soon?: boolean | null; comparison?: boolean | null }): boolean {
  return !p.coming_soon && !p.comparison;
}

export function mmss(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

export function roleLabel(p: { role?: string[] | string | null; disciplines?: string | null }): string {
  if (Array.isArray(p.role)) return p.role.join(', ');
  return p.role || p.disciplines || '';
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function knownDuration(p: SequenceProject): number | null {
  return typeof p.duration_seconds === 'number' && p.duration_seconds > 0 ? p.duration_seconds : null;
}

export function buildSequence(
  projects: SequenceProject[],
  resolveLoop: (p: SequenceProject) => MediaLoop | null,
): Sequence {
  const ordered = orderOnlineFirst(projects);
  const known = ordered.map(knownDuration).filter((d): d is number => d !== null);
  const fallback = known.length ? Math.round(median(known)) : 90;
  const longest = known.length ? Math.max(...known) : 1;

  let cursor = 0;
  const draft = ordered.map((p, index) => {
    const durationSeconds = knownDuration(p);
    const layoutSeconds = durationSeconds ?? fallback;
    const startSeconds = cursor;
    cursor += layoutSeconds;
    return { p, index, durationSeconds, layoutSeconds, startSeconds };
  });
  const total = cursor;

  const clips: Clip[] = draft.map(({ p, index, durationSeconds, layoutSeconds, startSeconds }) => ({
    index,
    id: p.id,
    name: p.name,
    client: p.client,
    year: String(p.year),
    type: p.type,
    roleLabel: roleLabel(p),
    thumbnail: p.thumbnail,
    durationSeconds,
    durationLabel: durationSeconds ? mmss(durationSeconds) : '',
    startSeconds,
    layoutSeconds,
    startPct: round((startSeconds / total) * 100),
    widthPct: round((layoutSeconds / total) * 100),
    relPct: durationSeconds ? round((durationSeconds / longest) * 100) : 0,
    href: hasCaseStudy(p) ? `/work/${p.id}` : null,
    offline: !!p.coming_soon,
    loop: p.coming_soon ? null : resolveLoop(p),
  }));

  const online = clips.filter((c) => !c.offline);
  return {
    clips,
    layoutSeconds: total,
    knownSeconds: online.reduce((sum, c) => sum + (c.durationSeconds ?? 0), 0),
    allKnown: online.every((c) => c.durationSeconds !== null),
  };
}

const STEPS = [30, 60, 120, 300, 600, 900, 1800];

export function rulerMarks(totalSeconds: number, maxMarks = 6): RulerMark[] {
  if (!(totalSeconds > 0)) return [];
  const step = STEPS.find((s) => totalSeconds / s <= maxMarks) ?? STEPS[STEPS.length - 1];
  const marks: RulerMark[] = [];
  for (let t = 0; t < totalSeconds; t += step) {
    marks.push({ seconds: t, pct: round((t / totalSeconds) * 100), label: mmss(t) });
  }
  return marks;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run test:ui`
Expected: PASS (timecode 5 + sequence 10). If `rulerMarks(1351)` picks a different step, the fixture is wrong only if 1351/300 > 6; it is 4.5, so 300 is correct.

- [ ] **Step 6: Commit**

```bash
git add src/lib/media.ts src/lib/sequence.ts tests/sequence.test.ts package.json
git commit -m "feat: sequence layout and media lookup libraries"
```

---

### Task 3: Design tokens, fonts and panel primitives

**Files:**
- Modify: `src/styles/global.css` (prepend tokens and primitives; change the overflow rule)
- Modify: `src/layouts/BaseLayout.astro` (font link)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Produces CSS custom properties: `--panel --panel-head --lane --lane-alt --stage --hair --hair-strong --text --muted --dim --mango --mango-hover --mango-ink --clip-video --clip-video-ink --clip-audio --clip-audio-ink --clip-offline --clip-offline-alt --clip-offline-ink --font-display --font-ui --font-readout --bar-h --pane-head-h --pad --max`.
- Produces global classes: `.pane`, `.pane-head`, `.bin`, `.bin__inner`, `.bin__head`, `.bin__lede`, `.bin__link`, `.readout`, `.pbtn`, `.pbtn--primary`, `.props`.

- [ ] **Step 1: Write the failing test**

Append to `tests/smoke.test.js`:

```js
// ── Open Sequence design system ─────────────────────────────────────────────

test('smoke: bundled CSS defines the Open Sequence tokens and primitives', () => {
  const css = getBundledCss();
  for (const token of ['--panel:', '--mango:', '--clip-video:', '--font-readout:']) {
    assert.ok(css.includes(token), `token ${token} must be defined`);
  }
  for (const cls of ['.pane-head', '.bin__head', '.readout', '.pbtn--primary', '.props']) {
    assert.ok(css.includes(cls), `primitive ${cls} must be defined`);
  }
});

test('smoke: pages load Archivo, Barlow and Martian Mono', () => {
  const html = getHtml('index.html');
  for (const family of ['family=Archivo', 'family=Barlow', 'family=Martian+Mono']) {
    assert.ok(html.includes(family), `${family} must be requested`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "token --panel: must be defined".

- [ ] **Step 3: Add tokens and primitives**

Insert at the very top of `src/styles/global.css`, before the existing `:root{`:

```css
/* ========== Open Sequence (facelift) ========== */
:root{
  --panel:#171719;
  --panel-head:#1c1c1f;
  --lane:#1f1f23;
  --lane-alt:#232327;
  --stage:#0f0f11;
  --hair:#2c2c32;
  --hair-strong:#3b3b43;
  --text:#e9e7e0;
  --muted:#a3a2aa;
  --dim:#8b8b94;
  --mango:#f4a23b;
  --mango-hover:#ffb457;
  --mango-ink:#1a1206;
  --clip-video:#2c6b67;
  --clip-video-ink:#dff5f2;
  --clip-audio:#3c6a41;
  --clip-audio-ink:#dcefd9;
  --clip-offline:#7a2e2e;
  --clip-offline-alt:#5e2323;
  --clip-offline-ink:#fbdcdc;
  --font-display:'Archivo', ui-sans-serif, system-ui, sans-serif;
  --font-ui:'Barlow', ui-sans-serif, system-ui, sans-serif;
  --font-readout:'Martian Mono', ui-monospace, Menlo, monospace;
  --bar-h:44px;
  --pane-head-h:32px;
  --pad:clamp(16px, 2.4vw, 32px);
  --max:1600px;
}

.pane{ display:flex; flex-direction:column; min-width:0; min-height:0; background:var(--panel); color:var(--text); font-family:var(--font-ui); }
.pane-head{
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  min-height:var(--pane-head-h); padding:0 14px;
  background:var(--panel-head); border-bottom:1px solid var(--hair);
  font-family:var(--font-ui); font-weight:600; font-size:12px; letter-spacing:.02em;
  text-transform:uppercase; color:var(--muted); white-space:nowrap;
}
.pane-head > *{ overflow:hidden; text-overflow:ellipsis; }

.bin{ position:relative; background:var(--panel); color:var(--text); border-top:1px solid var(--hair-strong); padding:40px var(--pad) 64px; font-family:var(--font-ui); font-size:15px; line-height:1.5; }
.bin__inner{ max-width:var(--max); margin:0 auto; }
.bin__head{ display:flex; flex-wrap:wrap; align-items:baseline; gap:6px 18px; margin:0 0 24px; padding-bottom:14px; border-bottom:1px solid var(--hair); }
.bin__head h1, .bin__head h2{ margin:0; font-family:var(--font-display); font-variation-settings:'wdth' 112; font-weight:700; font-size:22px; line-height:1.2; }
.bin__lede{ flex-basis:100%; margin:0; max-width:65ch; color:var(--muted); }
.bin__link{ margin-left:auto; font-size:13px; color:var(--muted); text-decoration:underline; text-decoration-color:var(--hair-strong); text-underline-offset:3px; }
.bin__link:hover{ color:var(--text); text-decoration-color:var(--mango); }

.readout{ font-family:var(--font-readout); font-variation-settings:'wdth' 90; font-size:12px; letter-spacing:0; color:var(--dim); font-variant-numeric:tabular-nums; }

.pbtn{
  display:inline-flex; align-items:center; gap:8px; min-height:36px; padding:0 14px;
  font-family:var(--font-ui); font-weight:600; font-size:13px; line-height:1;
  color:var(--text); background:var(--lane); border:1px solid var(--hair-strong);
  text-decoration:none; cursor:pointer; transition:border-color .15s, background-color .15s;
}
.pbtn:hover{ border-color:var(--muted); }
.pbtn svg{ width:12px; height:12px; fill:currentColor; }
.pbtn--primary{ background:var(--mango); border-color:var(--mango); color:var(--mango-ink); }
.pbtn--primary:hover{ background:var(--mango-hover); border-color:var(--mango-hover); }

.props{ display:grid; grid-template-columns:auto minmax(0,1fr); gap:8px 16px; margin:0; font-size:14px; line-height:1.45; }
.props dt{ color:var(--dim); }
.props dd{ margin:0; color:var(--text); }
.props a{ color:var(--text); text-decoration:underline; text-decoration-color:var(--hair-strong); text-underline-offset:3px; }
.props a:hover{ text-decoration-color:var(--mango); }

section[id]{ scroll-margin-top:var(--bar-h); }
/* ========== end Open Sequence ========== */
```

In the existing base rules, replace `html,body{ overflow-x:hidden; }` with:

```css
html,body{ overflow-x:clip; }
```

(`hidden` makes `body` a scroll container and breaks the sticky panel bar in Task 4; `clip` does not.)

- [ ] **Step 4: Add the fonts**

In `src/layouts/BaseLayout.astro`, replace the Google Fonts `<link href=...>` with (old families stay until Task 15):

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Barlow:wght@400;500;600&family=Martian+Mono:wdth,wght@75..112.5,100..800&family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Montserrat:wght@300;400;500&display=swap" rel="stylesheet" />
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS. Open the dev server: the site looks unchanged (tokens are unused so far).

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro tests/smoke.test.js
git commit -m "style: Open Sequence tokens, fonts and panel primitives"
```

---

### Task 4: Panel bar (Nav) and status bar (Footer)

**Files:**
- Modify (full rewrite): `src/components/Nav.astro`
- Modify (full rewrite): `src/components/Footer.astro`
- Modify: `src/components/Projects.astro` (delete the `.rainbow-rule` block; its animation script lived in Nav)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: tokens and `.readout` (Task 3).
- Produces: `<header class="bar" id="nav">` (sticky, height `--bar-h`) on every page; tabs link to `#work` etc. on `/` and `/#work` etc. elsewhere; each tab carries `data-tab="<section id>"`.

- [ ] **Step 1: Write the failing test**

In `tests/smoke.test.js`, replace the test `'smoke: index.html has nav with correct links'` with:

```js
test('smoke: panel bar links to sections on home and back home elsewhere', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('class="bar"'), 'panel bar must render');
  assert.ok(html.includes('<nav'), 'nav landmark must be present');
  for (const id of ['work', 'about', 'builds', 'sound', 'contact']) {
    assert.ok(html.includes(`href="#${id}"`), `home tab #${id} must be present`);
  }
  assert.ok(html.includes('Available · 2026'), 'availability readout must render');
  assert.ok(html.includes('EST · GMT−5'), 'timezone readout must render');
  const caseStudy = getHtml('work/shell-john-williams/index.html');
  assert.ok(caseStudy.includes('href="/#work"'), 'tabs on other pages must point back home');
  assert.ok(!html.includes('rainbow-rule'), 'rainbow rule is retired');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "panel bar must render".

- [ ] **Step 3: Rewrite `src/components/Nav.astro`**

```astro
---
// Site-wide panel bar: the reel mark + wordmark as the sequence tab, section tabs, and status readouts.
const onHome = Astro.url.pathname === '/';
const base = onHome ? '' : '/';
const tabs = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'builds', label: 'Builds' },
  { id: 'sound', label: 'Sound' },
  { id: 'contact', label: 'Contact' },
];
---
<header class="bar" id="nav">
  <a class="bar__brand" href={onHome ? '#top' : '/'} aria-label="Jeremy Twogood, home">
    <svg class="bar__mark" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" stroke-width="2" />
      <circle cx="12" cy="12" r="2.6" class="bar__hub" />
      <circle cx="12" cy="5" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="19" r="2" fill="currentColor" />
      <circle cx="5" cy="12" r="2" fill="currentColor" />
    </svg>
    <span class="bar__name">Jeremy Twogood<span class="bar__dot">.</span></span>
  </a>
  <nav class="bar__tabs" aria-label="Primary">
    {tabs.map((t) => (
      <a class="bar__tab" href={`${base}#${t.id}`} data-tab={t.id}>{t.label}</a>
    ))}
  </nav>
  <p class="bar__status">
    <span class="readout">EST · GMT−5</span>
    <span class="bar__avail">Available · 2026</span>
  </p>
</header>

<style>
  .bar{
    position:sticky; top:0; z-index:50;
    display:flex; align-items:stretch; height:var(--bar-h);
    background:var(--panel-head); border-bottom:1px solid var(--hair);
    font-family:var(--font-ui); color:var(--text);
  }
  .bar__brand{
    display:flex; align-items:center; gap:10px; padding:0 18px;
    border-right:1px solid var(--hair); white-space:nowrap;
  }
  .bar__mark{ width:20px; height:20px; color:var(--text); }
  .bar__hub{ fill:var(--mango); }
  .bar__name{ font-family:var(--font-display); font-variation-settings:'wdth' 112; font-weight:700; font-size:15px; }
  .bar__dot{ color:var(--mango); }
  .bar__tabs{ display:flex; }
  .bar__tab{
    display:flex; align-items:center; padding:0 16px;
    border-right:1px solid var(--hair); color:var(--muted); font-size:13px; font-weight:500;
    transition:color .15s, background-color .15s;
  }
  .bar__tab:hover{ color:var(--text); background:var(--lane); }
  .bar__tab.is-active{ color:var(--text); box-shadow:inset 0 -2px 0 var(--mango); }
  .bar__status{ margin:0 0 0 auto; display:flex; align-items:center; gap:20px; padding:0 18px; font-size:13px; color:var(--muted); white-space:nowrap; }
  .bar__avail{ color:var(--text); font-weight:500; }

  @media (max-width: 900px){ .bar__status .readout{ display:none; } }
  @media (max-width: 760px){
    .bar{ height:auto; flex-wrap:wrap; }
    .bar__brand{ flex:1 1 auto; height:var(--bar-h); border-right:0; padding:0 14px; }
    .bar__status{ height:var(--bar-h); padding:0 14px; }
    .bar__tabs{ flex:1 1 100%; border-top:1px solid var(--hair); }
    .bar__tab{ flex:1 1 0; justify-content:center; padding:0 4px; min-height:40px; }
    .bar__tab:last-child{ border-right:0; }
  }
</style>

<script>
  // Active tab: the section crossing the upper-middle of the viewport.
  const tabs = Array.from(document.querySelectorAll<HTMLAnchorElement>('.bar__tab'));
  const byId = new Map(tabs.map((t) => [t.dataset.tab, t]));
  if ('IntersectionObserver' in window && byId.size) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        tabs.forEach((t) => { t.classList.remove('is-active'); t.removeAttribute('aria-current'); });
        const tab = byId.get(e.target.id);
        if (tab) { tab.classList.add('is-active'); tab.setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    byId.forEach((_, id) => { const s = id && document.getElementById(id); if (s) io.observe(s); });
  }
</script>
```

(The underline-gap measurement and light/dark switching are retired with the old nav.)

- [ ] **Step 4: Rewrite `src/components/Footer.astro`**

```astro
---
---
<footer class="status" aria-label="Site footer">
  <span>© 2026 Jeremy Twogood · Toronto</span>
  <span>Site, edits, and code by JT · <a href="/llms.txt">llms.txt</a> · <a href="/mcp">For AI agents</a></span>
</footer>

<style>
  .status{
    display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px 24px;
    padding:12px var(--pad); padding-bottom:calc(12px + env(safe-area-inset-bottom));
    background:var(--panel-head); border-top:1px solid var(--hair);
    font-family:var(--font-ui); font-size:13px; color:var(--muted);
  }
  .status a{ color:var(--text); text-decoration:underline; text-decoration-color:var(--hair-strong); text-underline-offset:3px; }
  .status a:hover{ text-decoration-color:var(--mango); }
</style>
```

- [ ] **Step 5: Remove the rainbow rule**

In `src/components/Projects.astro`, delete the whole `<div class="rainbow-rule" data-rainbow aria-hidden="true">…</div>` block (15 `<span>` children).

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS. In the browser at 1440x900 the bar sticks to the top while scrolling on `/` and `/work/shell-john-williams`; at 390px it wraps into brand row + five equal tabs with no horizontal scroll. The old hero now sits under a 44px bar instead of a fixed overlay; that is expected until Task 5.

- [ ] **Step 7: Commit**

```bash
git add src/components/Nav.astro src/components/Footer.astro src/components/Projects.astro tests/smoke.test.js
git commit -m "feat: panel bar and status bar"
```

---

### Task 5: The suite (first viewport)

**Files:**
- Create: `src/components/suite/Suite.astro`, `BinsPane.astro`, `ProgramMonitor.astro`, `InfoPane.astro`, `Sequence.astro`
- Create: `src/scripts/sequence-player.ts`
- Modify: `src/pages/index.astro` (Hero → Suite; mount Lightbox)
- Delete: `src/components/Hero.astro`
- Modify: `.claude/skills/add-video/SKILL.md` (Step 6 item 3 now points at `src/lib/media.ts`)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `buildSequence`, `rulerMarks`, `mmss`, `Clip`, `Sequence` (Task 2); `loopFor`, `PREVIEW_LOOPS` (Task 2); `.pane`, `.pane-head`, `.pbtn`, `.props`, `.readout` (Task 3); `Lightbox.astro` binds any `[data-video-embed]`.
- Produces: `<section id="top" class="suite" data-suite>`; JSON payload `<script type="application/json" id="sequence-data">` shaped `{ total: number; clips: PlayerClip[] }`; `initSequencePlayer(root: HTMLElement): void`. DOM hooks used by the player: `[data-monitor]` (video), `[data-monitor-tag]`, `[data-monitor-name]`, `[data-monitor-link]`, `[data-monitor-tc]`, `[data-transport="prev|play|next"]`, `[data-seq-lanes]`, `[data-seq-playhead]`, `[data-clip="<index>"]`.

- [ ] **Step 1: Write the failing test**

In `tests/smoke.test.js`, replace the test `'smoke: index.html has hero section with name and CTA'` with:

```js
test('smoke: suite renders the monitor, info pane and sequence', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="top"'), '#top suite must exist');
  assert.ok(html.includes('data-suite'), 'suite root must be marked');
  assert.match(html, /<h1[^>]*>Jeremy Twogood/, 'name must be the h1');
  assert.ok(html.includes('Watch Sizzle'), 'Watch Sizzle CTA must be present');
  assert.ok(html.includes('youtube.com/watch?v=Tl1n3hu4e8I'), 'CTA must fall back to the reel on YouTube');
  assert.ok(html.includes('data-video-embed="https://www.youtube-nocookie.com/embed/Tl1n3hu4e8I'), 'CTA must open the reel in the lightbox');
  assert.ok(html.includes('id="lightbox"'), 'lightbox must be mounted on the homepage');
  assert.ok(html.includes('data-monitor'), 'program monitor must render');
  assert.ok(html.includes('data-sequence'), 'sequence must render');
  assert.ok(html.includes('id="sequence-data"'), 'player payload must render');
  assert.ok(html.includes('07:17'), 'Shell clip must show its real running time');
  assert.ok(html.includes('Toronto, ON · 43.65°N'), 'location readout keeps its place');
  assert.ok(!html.includes('hero__meta'), 'old hero is gone');
});

test('smoke: sequence clips link to case studies and the offline clip comes last', () => {
  const html = getHtml('index.html');
  const seqStart = html.indexOf('data-sequence');
  const seq = html.slice(seqStart, html.indexOf('</ol>', seqStart));
  assert.ok(seq.includes('href="/work/shell-john-williams"'), 'Shell clip must link to its case study');
  assert.ok(seq.indexOf('Shell') < seq.indexOf('Canadian Association'), 'CAOT (offline) must come after Shell');
  assert.ok(seq.includes('Offline'), 'offline clip must be labelled');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "suite root must be marked".

- [ ] **Step 3: Create `src/components/suite/Suite.astro`**

```astro
---
import projects from '../../data/projects.json';
import profile from '../../data/profile.json';
import waveforms from '../../data/waveforms.json';
import { buildSequence, type SequenceProject } from '../../lib/sequence';
import { loopFor } from '../../lib/media';
import BinsPane from './BinsPane.astro';
import ProgramMonitor from './ProgramMonitor.astro';
import InfoPane from './InfoPane.astro';
import Sequence from './Sequence.astro';

const sequence = buildSequence(projects as unknown as SequenceProject[], loopFor);
const lead = sequence.clips.find((c) => c.loop) ?? sequence.clips[0];
const firstTrack = profile.tracks[0];
const peaks = (waveforms as Record<string, number[]>)[firstTrack.num] ?? [];

const payload = {
  total: sequence.layoutSeconds,
  clips: sequence.clips.map((c) => ({
    name: c.name,
    tag: `${c.client} · ${c.year}`,
    label: c.roleLabel ? `${c.name} · ${c.roleLabel}` : c.name,
    href: c.href,
    poster: c.thumbnail,
    mp4: c.loop?.mp4 ?? null,
    webm: c.loop?.webm ?? null,
    start: c.startSeconds,
    layout: c.layoutSeconds,
    offline: c.offline,
  })),
};
---
<section id="top" class="suite" data-suite aria-label="Jeremy Twogood: selected work">
  <div class="suite__panes">
    <BinsPane clips={sequence.clips} />
    <ProgramMonitor lead={lead} sequence={sequence} />
    <InfoPane />
  </div>
  <Sequence sequence={sequence} peaks={peaks} trackTitle={firstTrack.title} />
  <script type="application/json" id="sequence-data" set:html={JSON.stringify(payload)} />
</section>

<style>
  .suite{
    display:grid; grid-template-rows:minmax(0,1fr) auto;
    height:calc(100svh - var(--bar-h)); min-height:620px;
    background:var(--panel);
  }
  .suite__panes{ display:grid; grid-template-columns:256px minmax(0,1fr) 320px; min-height:0; }
  @media (max-width: 1100px){
    .suite{ height:auto; min-height:0; }
    .suite__panes{ grid-template-columns:220px minmax(0,1fr); }
  }
  @media (max-width: 760px){
    .suite__panes{ grid-template-columns:1fr; }
  }
</style>

<script>
  import { initSequencePlayer } from '../../scripts/sequence-player';
  const root = document.querySelector<HTMLElement>('[data-suite]');
  if (root) initSequencePlayer(root);
</script>
```

- [ ] **Step 4: Create `src/components/suite/BinsPane.astro`**

```astro
---
import type { Clip } from '../../lib/sequence';
import projects from '../../data/projects.json';
import aiBuilds from '../../data/ai-builds.json';
import profile from '../../data/profile.json';

interface Props { clips: Clip[] }
const { clips } = Astro.props;
const bins = [
  { href: '#work', label: 'Work', count: projects.length },
  { href: '#builds', label: 'AI builds', count: aiBuilds.length },
  { href: '#sound', label: 'Sound', count: profile.tracks.length },
  { href: '#about', label: 'About', count: null },
  { href: '#contact', label: 'Contact', count: null },
];
---
<aside class="pane bins" aria-label="Project bins">
  <div class="pane-head"><span>Project</span></div>
  <nav class="bins__list" aria-label="Bins">
    {bins.map((b) => (
      <a href={b.href}>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 4.5h4l1.5 1.5h7.5v7h-13z" /></svg>
        <span>{b.label}</span>
        {b.count !== null && <span class="readout">{b.count}</span>}
      </a>
    ))}
  </nav>
  <ul class="bins__clips">
    {clips.map((c) => {
      const inner = (
        <>
          <img src={c.thumbnail} alt="" loading="lazy" decoding="async" />
          <span class="bins__clip-name">{c.name}</span>
          <span class="readout">{c.offline ? 'offline' : c.durationLabel}</span>
        </>
      );
      return <li>{c.href ? <a href={c.href}>{inner}</a> : <span class="bins__clip-static">{inner}</span>}</li>;
    })}
  </ul>
</aside>

<style>
  .bins{ border-right:1px solid var(--hair); overflow:hidden; }
  .bins__list{ padding:8px 0; }
  .bins__list a{ display:grid; grid-template-columns:18px 1fr auto; gap:10px; align-items:center; padding:8px 14px; font-size:14px; }
  .bins__list a:hover{ background:var(--lane); }
  .bins__list svg{ width:16px; height:16px; fill:none; stroke:var(--muted); stroke-width:1.5; }
  .bins__clips{ list-style:none; margin:0; padding:6px 0; border-top:1px solid var(--hair); overflow:auto; min-height:0; }
  .bins__clips a, .bins__clip-static{ display:grid; grid-template-columns:52px minmax(0,1fr) auto; gap:10px; align-items:center; padding:6px 14px; font-size:13px; }
  .bins__clips a:hover{ background:var(--lane); }
  .bins__clips img{ width:52px; aspect-ratio:16/9; object-fit:cover; border:1px solid var(--hair-strong); }
  .bins__clip-name{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .bins__clip-static{ color:var(--muted); }
  .bins .readout{ font-size:11px; }
  @media (max-width: 760px){ .bins{ display:none; } }
</style>
```

- [ ] **Step 5: Create `src/components/suite/InfoPane.astro`**

```astro
---
import profile from '../../data/profile.json';
import aiBuilds from '../../data/ai-builds.json';
import reel from '../../data/reel-index.json';

const clients = profile.clients as string[];
const shown = clients.slice(0, 3);
const more = clients.length - shown.length;
const liveBuilds = aiBuilds.filter((b) => b.status === 'live').map((b) => b.name);
const sizzleEmbed = `https://www.youtube-nocookie.com/embed/${reel.reel_youtube_id}?autoplay=1&rel=0`;
---
<aside class="pane info" aria-label="About Jeremy Twogood">
  <div class="pane-head"><span>Info</span><span class="readout">Toronto, ON · 43.65°N</span></div>
  <div class="info__body">
    <h1 class="info__name">Jeremy Twogood<span class="info__dot">.</span></h1>
    <p class="info__role">{profile.title}</p>
    <p class="info__bio">{profile.bio[0]}</p>
    <div class="info__actions">
      <a class="pbtn pbtn--primary" href={reel.reel_url} target="_blank" rel="noopener" data-video-embed={sizzleEmbed} data-video-title="Demo sizzle">
        Watch Sizzle <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1l9 5-9 5z" /></svg>
      </a>
      <a class="pbtn" href={`mailto:${profile.email}`}>Email</a>
    </div>
    <dl class="props info__props">
      <dt>Clients</dt>
      <dd>{shown.join(', ')}{more > 0 && <> and <a href="#clients">{more} more</a></>}</dd>
      <dt>Open to</dt>
      <dd>Contract, freelance and full-time work. Remote-first.</dd>
      <dt>Also</dt>
      <dd>Ships software: {liveBuilds.join(', ')}</dd>
    </dl>
  </div>
</aside>

<style>
  .info{ border-left:1px solid var(--hair); }
  .info .pane-head .readout{ font-size:11px; text-transform:none; }
  .info__body{ padding:18px 18px 22px; display:flex; flex-direction:column; gap:14px; overflow:auto; min-height:0; }
  .info__name{ margin:0; font-family:var(--font-display); font-variation-settings:'wdth' 118; font-weight:800; font-size:34px; line-height:1; }
  .info__dot{ color:var(--mango); }
  .info__role{ margin:-6px 0 0; font-size:13px; color:var(--muted); }
  .info__bio{ margin:0; font-size:15px; max-width:46ch; }
  .info__actions{ display:flex; flex-wrap:wrap; gap:10px; }
  .info__props{ padding-top:12px; border-top:1px solid var(--hair); font-size:13px; }
  @media (max-width: 1100px){
    .info{ grid-column:1 / -1; border-left:0; border-top:1px solid var(--hair); }
    .info__body{ display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); column-gap:32px; }
    .info__props{ grid-column:2; grid-row:1 / span 4; border-top:0; padding-top:0; }
  }
  @media (max-width: 760px){
    .info__body{ display:flex; }
    .info__props{ border-top:1px solid var(--hair); padding-top:12px; }
  }
</style>
```

- [ ] **Step 6: Create `src/components/suite/ProgramMonitor.astro`**

```astro
---
import { mmss, type Clip, type Sequence } from '../../lib/sequence';

interface Props { lead: Clip; sequence: Sequence }
const { lead, sequence } = Astro.props;
---
<section class="pane monitor-pane" aria-label="Program monitor">
  <div class="pane-head">
    <span>Program</span>
    <span class="monitor-pane__name" data-monitor-name>{lead.name}</span>
  </div>
  <div class="monitor-pane__stage">
    <div class="monitor">
      <video data-monitor muted playsinline preload="none" poster={lead.thumbnail} aria-hidden="true"></video>
      <span class="monitor__tag readout" data-monitor-tag>{lead.client} · {lead.year}</span>
    </div>
  </div>
  <div class="transport">
    <button type="button" class="transport__btn" data-transport="prev" aria-label="Previous clip">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3h2v10H3zM13 3v10L6 8z" /></svg>
    </button>
    <button type="button" class="transport__btn" data-transport="play" aria-label="Play" aria-pressed="false">
      <svg class="transport__icon-play" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2l10 6-10 6z" /></svg>
      <svg class="transport__icon-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h3v12H4zM9 2h3v12H9z" /></svg>
    </button>
    <button type="button" class="transport__btn" data-transport="next" aria-label="Next clip">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M11 3h2v10h-2zM3 3v10l7-5z" /></svg>
    </button>
    <span class="readout transport__tc" data-monitor-tc>00:00:00:00</span>
    <a class="transport__clip" data-monitor-link href={lead.href ?? '#work'}>{lead.roleLabel ? `${lead.name} · ${lead.roleLabel}` : lead.name}</a>
    {sequence.allKnown && <span class="readout transport__total">{mmss(sequence.layoutSeconds)}</span>}
  </div>
</section>

<style>
  .monitor-pane{ min-height:0; }
  .monitor-pane__name{ color:var(--text); text-transform:none; font-weight:500; }
  .monitor-pane__stage{ flex:1; min-height:0; display:grid; place-items:center; padding:22px; background:var(--stage); }
  .monitor{
    position:relative; width:100%; aspect-ratio:16/9; background:#000; outline:1px solid var(--hair-strong);
    max-width:calc((100svh - var(--bar-h) - 228px - var(--pane-head-h) - 44px - 44px) * 16 / 9);
  }
  .monitor video{ width:100%; height:100%; object-fit:cover; }
  .monitor__tag{ position:absolute; left:10px; top:10px; padding:3px 7px; font-size:11px; color:#fff; background:rgba(0,0,0,.6); }
  .transport{ display:flex; align-items:center; gap:12px; min-height:44px; padding:0 14px; background:var(--panel-head); border-top:1px solid var(--hair); }
  .transport__btn{ display:grid; place-items:center; width:30px; height:30px; padding:0; background:none; border:0; color:var(--text); cursor:pointer; }
  .transport__btn:hover{ background:var(--lane-alt); }
  .transport__btn svg{ width:16px; height:16px; fill:currentColor; }
  .transport__icon-pause{ display:none; }
  :global(.suite.is-playing) .transport__icon-play{ display:none; }
  :global(.suite.is-playing) .transport__icon-pause{ display:block; }
  :global(html:not(.js)) .transport__btn{ display:none; }
  .transport__tc{ color:var(--mango); font-size:13px; min-width:11ch; }
  .transport__clip{ min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; color:var(--muted); }
  .transport__clip:hover{ color:var(--text); text-decoration:underline; text-underline-offset:3px; }
  .transport__total{ margin-left:auto; font-size:13px; }
  @media (max-width: 1100px){ .monitor{ max-width:none; } }
  @media (max-width: 760px){
    .monitor-pane__stage{ padding:0; }
    .monitor{ outline:0; }
    .transport__clip{ display:none; }
  }
</style>
```

- [ ] **Step 7: Create `src/components/suite/Sequence.astro`**

```astro
---
import { rulerMarks, type Sequence } from '../../lib/sequence';

interface Props { sequence: Sequence; peaks: number[]; trackTitle: string }
const { sequence, peaks, trackTitle } = Astro.props;
const marks = rulerMarks(sequence.layoutSeconds);
const W = Math.max(peaks.length, 1) * 4;
---
<div class="seq" data-sequence role="group" aria-label="Selected work, as a sequence">
  <div class="seq__head">
    <span class="seq__title">Selected work</span>
    <div class="seq__ruler" aria-hidden="true">
      {marks.map((m) => <span class="readout" style={`left:${m.pct}%`}>{m.label}</span>)}
    </div>
  </div>
  <div class="seq__tracks">
    <div class="seq__trackheads" aria-hidden="true">
      <span class="seq__th seq__th--v readout">V1</span>
      <span class="seq__th seq__th--a readout">A1</span>
    </div>
    <div class="seq__lanes" data-seq-lanes>
      <ol class="seq__lane seq__lane--v">
        {sequence.clips.map((c) => {
          const style = `--start:${c.startPct}%;--len:${c.widthPct}%;--rel:${c.relPct}%`;
          const narrow = c.widthPct < 7.5;
          const body = (
            <>
              <span class="seq__clip-name"><span>{c.name}</span>{c.durationLabel && <small class="readout">{c.durationLabel}</small>}</span>
              <span class="seq__clip-thumb">
                {c.offline ? <span class="readout">Offline · {c.year}</span> : <img src={c.thumbnail} alt="" loading="lazy" decoding="async" />}
              </span>
              <span class="seq__clip-meta">{c.client} · {c.year}</span>
              {c.durationSeconds !== null && <span class="seq__clip-bar" aria-hidden="true"><i></i></span>}
            </>
          );
          return (
            <li class:list={['seq__clip', { 'is-offline': c.offline, 'is-narrow': narrow }]} style={style}>
              {c.href
                ? <a class="seq__clip-link" href={c.href} data-clip={c.index}>{body}</a>
                : <span class="seq__clip-link" data-clip={c.index} aria-disabled="true">{body}</span>}
            </li>
          );
        })}
      </ol>
      {peaks.length > 0 && (
        <div class="seq__lane seq__lane--a" aria-hidden="true">
          <div class="seq__aclip">
            <span class="seq__clip-name"><span>{trackTitle}</span><small class="readout">music</small></span>
            <svg viewBox={`0 0 ${W} 60`} preserveAspectRatio="none">
              {peaks.map((p, i) => <rect x={i * 4} y={30 - p * 28} width="2.4" height={Math.max(1, p * 56)} />)}
            </svg>
          </div>
        </div>
      )}
      <div class="seq__playhead" data-seq-playhead aria-hidden="true" style="left:0%"></div>
    </div>
  </div>
</div>

<style>
  .seq{ border-top:1px solid var(--hair-strong); background:var(--lane); user-select:none; font-family:var(--font-ui); }
  .seq__head{ display:grid; grid-template-columns:120px 1fr; height:32px; background:var(--panel-head); border-bottom:1px solid var(--hair); }
  .seq__title{ display:flex; align-items:center; padding:0 14px; font-size:12.5px; font-weight:600; color:var(--muted); border-right:1px solid var(--hair); white-space:nowrap; }
  .seq__ruler{ position:relative; overflow:hidden; }
  .seq__ruler span{ position:absolute; top:0; height:100%; padding:8px 0 0 6px; border-left:1px solid var(--hair-strong); font-size:11px; }
  .seq__tracks{ display:grid; grid-template-columns:120px 1fr; }
  .seq__trackheads{ display:flex; flex-direction:column; background:var(--panel-head); border-right:1px solid var(--hair); }
  .seq__th{ display:flex; align-items:center; padding:0 14px; border-bottom:1px solid var(--hair); color:var(--text); }
  .seq__th--v{ height:120px; }
  .seq__th--a{ height:74px; }
  .seq__lanes{ position:relative; overflow:hidden; }
  .seq__lanes.is-scrubbing{ cursor:col-resize; }
  .seq__lane{ position:relative; margin:0; padding:0; list-style:none; border-bottom:1px solid var(--hair); }
  .seq__lane--v{ height:120px; }
  .seq__lane--a{ height:74px; background:var(--lane-alt); }
  .seq__clip{ position:absolute; top:8px; bottom:8px; left:var(--start); width:var(--len); padding-right:2px; }
  .seq__clip-link{
    display:grid; grid-template-rows:20px 1fr; height:100%; overflow:hidden;
    background:var(--clip-video); color:var(--clip-video-ink); border:1px solid rgba(0,0,0,.35); border-radius:2px;
    transition:filter .15s;
  }
  a.seq__clip-link:hover{ filter:brightness(1.12); }
  .seq__clip-link.is-current{ box-shadow:inset 0 0 0 2px var(--mango); }
  .seq__clip-name{ display:flex; align-items:center; gap:8px; min-width:0; padding:0 8px; font-size:12px; font-weight:600; white-space:nowrap; }
  .seq__clip-name > span{ min-width:0; overflow:hidden; text-overflow:ellipsis; }
  .seq__clip-name small{ flex-shrink:0; font-size:11px; color:inherit; opacity:.85; }
  .is-narrow .seq__clip-name small{ display:none; }
  .seq__clip-thumb{ position:relative; overflow:hidden; background:#000; }
  .seq__clip-thumb img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:left center; }
  .seq__clip-meta, .seq__clip-bar{ display:none; }
  .is-offline .seq__clip-link{ background:repeating-linear-gradient(135deg, var(--clip-offline) 0 8px, var(--clip-offline-alt) 8px 16px); color:var(--clip-offline-ink); }
  .is-offline .seq__clip-thumb{ display:grid; place-items:center; background:transparent; }
  .is-offline .seq__clip-thumb .readout{ color:var(--clip-offline-ink); font-size:11px; }
  .seq__aclip{ position:absolute; inset:8px 0; display:grid; grid-template-rows:20px 1fr; overflow:hidden; background:var(--clip-audio); color:var(--clip-audio-ink); border:1px solid rgba(0,0,0,.35); border-radius:2px; }
  .seq__aclip svg{ width:100%; height:100%; display:block; }
  .seq__aclip rect{ fill:var(--clip-audio-ink); opacity:.85; }
  .seq__playhead{ position:absolute; top:0; bottom:0; width:0; border-left:1px solid var(--mango); z-index:2; pointer-events:none; }
  .seq__playhead::before{ content:""; position:absolute; top:-1px; left:-7px; border:7px solid transparent; border-top:9px solid var(--mango); border-bottom:0; }

  /* Phones: one row per clip, duration bar proportional to running time. */
  @media (max-width: 760px){
    .seq__head{ grid-template-columns:1fr; }
    .seq__ruler, .seq__trackheads, .seq__lane--a, .seq__playhead{ display:none; }
    .seq__tracks{ grid-template-columns:1fr; }
    .seq__lane--v{ height:auto; border-bottom:0; }
    .seq__clip{ position:static; width:auto; padding:0; border-bottom:1px solid var(--hair); }
    .seq__clip-link{
      display:grid; grid-template-columns:112px minmax(0,1fr); grid-template-rows:auto auto 1fr; column-gap:12px;
      padding:10px 14px; background:transparent; color:var(--text); border:0; border-radius:0;
    }
    .seq__clip-thumb{ grid-column:1; grid-row:1 / span 3; aspect-ratio:16/9; border:1px solid var(--hair-strong); }
    .seq__clip-name{ grid-column:2; padding:0; font-size:14px; }
    .is-narrow .seq__clip-name small{ display:inline; }
    .seq__clip-meta{ display:block; grid-column:2; font-size:13px; color:var(--muted); }
    .seq__clip-bar{ display:block; grid-column:2; align-self:end; height:6px; background:var(--lane-alt); }
    .seq__clip-bar i{ display:block; height:100%; width:var(--rel); background:var(--clip-video); }
    .is-offline .seq__clip-link{ background:transparent; color:var(--muted); }
    .is-offline .seq__clip-thumb{ background:repeating-linear-gradient(135deg, var(--clip-offline) 0 8px, var(--clip-offline-alt) 8px 16px); }
  }
  @media (prefers-reduced-motion: reduce){ .seq__clip-link{ transition:none; } }
</style>
```

Note: the offline hatch is a clip-state colour code on chrome, not decoration over footage; the detector's `repeating-stripes-gradient` advisory for it is expected and gets a narrow `ignore-value` in Task 15.

- [ ] **Step 8: Create `src/scripts/sequence-player.ts`**

```ts
import { tcFormat } from './timecode';

interface PlayerClip {
  name: string;
  tag: string;
  label: string;
  href: string | null;
  poster: string;
  mp4: string | null;
  webm: string | null;
  start: number;
  layout: number;
  offline: boolean;
}

interface PlayerData {
  total: number;
  clips: PlayerClip[];
}

/**
 * Program monitor + sequence controller. The monitor previews each clip's silent loop in turn;
 * the playhead skims through the clip's span on the timeline while the loop plays.
 * Clicking a clip previews it; clicking the current clip follows its link to the case study.
 * Dragging across the lanes scrubs. Reduced motion: nothing plays until the visitor presses play.
 */
export function initSequencePlayer(root: HTMLElement): void {
  const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
  const dataEl = q<HTMLScriptElement>('#sequence-data');
  const video = q<HTMLVideoElement>('[data-monitor]');
  const tagEl = q<HTMLElement>('[data-monitor-tag]');
  const nameEl = q<HTMLElement>('[data-monitor-name]');
  const linkEl = q<HTMLAnchorElement>('[data-monitor-link]');
  const tcEl = q<HTMLElement>('[data-monitor-tc]');
  const playBtn = q<HTMLButtonElement>('[data-transport="play"]');
  const prevBtn = q<HTMLButtonElement>('[data-transport="prev"]');
  const nextBtn = q<HTMLButtonElement>('[data-transport="next"]');
  const lanes = q<HTMLElement>('[data-seq-lanes]');
  const playhead = q<HTMLElement>('[data-seq-playhead]');
  if (!dataEl || !video || !tagEl || !nameEl || !linkEl || !tcEl || !playBtn || !prevBtn || !nextBtn || !lanes || !playhead) return;

  let data: PlayerData;
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch { return; }
  if (!data.clips?.length || !(data.total > 0)) return;

  const clipEls = Array.from(root.querySelectorAll<HTMLElement>('[data-clip]'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 761px)');
  const canWebm = video.canPlayType('video/webm') !== '';
  const playable = data.clips.map((c, i) => (!c.offline && (c.mp4 || c.webm) ? i : -1)).filter((i) => i >= 0);
  if (!playable.length) return;

  let current = -1;
  let wantPlay = !reduce;
  let inView = true;

  function resume() {
    if (wantPlay && inView && !document.hidden) video!.play().catch(() => {});
    else video!.pause();
  }

  function setPlaying(on: boolean) {
    wantPlay = on;
    playBtn!.setAttribute('aria-pressed', on ? 'true' : 'false');
    playBtn!.setAttribute('aria-label', on ? 'Pause' : 'Play');
    root.classList.toggle('is-playing', on);
    resume();
  }

  function place(frac: number) {
    const c = data.clips[current];
    if (!c) return;
    const t = c.start + Math.min(Math.max(frac, 0), 1) * c.layout;
    playhead!.style.left = `${(t / data.total) * 100}%`;
    tcEl!.textContent = tcFormat(t);
  }

  function select(i: number) {
    const c = data.clips[i];
    if (!c || c.offline) return;
    current = i;
    clipEls.forEach((el) => {
      const on = Number(el.dataset.clip) === i;
      el.classList.toggle('is-current', on);
      if (on) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
    tagEl!.textContent = c.tag;
    nameEl!.textContent = c.name;
    linkEl!.textContent = c.label;
    if (c.href) linkEl!.href = c.href;
    else linkEl!.removeAttribute('href');
    const src = canWebm && c.webm ? c.webm : c.mp4;
    video!.poster = c.poster;
    if (src && video!.getAttribute('src') !== src) video!.src = src;
    place(0);
    resume();
  }

  function step(dir: 1 | -1) {
    const pos = playable.indexOf(current);
    select(playable[(pos + dir + playable.length) % playable.length]);
  }

  video.muted = true;
  video.addEventListener('timeupdate', () => {
    if (video.duration > 0) place(video.currentTime / video.duration);
  });
  video.addEventListener('ended', () => { if (wantPlay) step(1); });
  playBtn.addEventListener('click', () => setPlaying(!wantPlay));
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  clipEls.forEach((el) => {
    el.addEventListener('click', (e) => {
      const me = e as MouseEvent;
      if (me.metaKey || me.ctrlKey || me.shiftKey || me.altKey || me.button !== 0) return;
      if (!desktop.matches) return; // phones: rows are plain links to the case study
      const i = Number(el.dataset.clip);
      if (data.clips[i]?.offline) { e.preventDefault(); return; }
      if (i === current && el.getAttribute('href')) return; // second click opens the case study
      e.preventDefault();
      select(i);
    });
  });

  // Scrub: a drag across the lanes (beyond 4px) seeks; a plain click falls through to the clip.
  let dragging = false;
  let moved = false;
  let suppressClick = false;
  let startX = 0;

  function scrubTo(clientX: number) {
    const r = lanes!.getBoundingClientRect();
    if (r.width <= 0) return;
    const t = Math.min(Math.max((clientX - r.left) / r.width, 0), 0.9999) * data.total;
    let i = data.clips.findIndex((c) => t >= c.start && t < c.start + c.layout);
    if (i < 0) i = data.clips.length - 1;
    const c = data.clips[i];
    if (c.offline) return;
    if (i !== current) select(i);
    const frac = (t - c.start) / c.layout;
    if (video!.duration > 0) video!.currentTime = frac * video!.duration;
    place(frac);
  }

  lanes.addEventListener('pointerdown', (e) => {
    if (!desktop.matches || e.button !== 0) return;
    dragging = true;
    moved = false;
    suppressClick = false;
    startX = e.clientX;
  });
  lanes.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (!moved && Math.abs(e.clientX - startX) > 4) {
      moved = true;
      lanes.setPointerCapture(e.pointerId);
      lanes.classList.add('is-scrubbing');
    }
    if (moved) scrubTo(e.clientX);
  });
  const endDrag = () => {
    if (moved) suppressClick = true;
    dragging = false;
    moved = false;
    lanes.classList.remove('is-scrubbing');
  };
  lanes.addEventListener('pointerup', endDrag);
  lanes.addEventListener('pointercancel', endDrag);
  lanes.addEventListener('click', (e) => {
    if (!suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick = false;
  }, true);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      resume();
    }, { threshold: 0.25 }).observe(video);
  }
  document.addEventListener('visibilitychange', resume);

  select(playable[0]);
  setPlaying(wantPlay);
}
```

- [ ] **Step 9: Wire the homepage**

In `src/pages/index.astro`:
- replace `import Hero from '../components/Hero.astro';` with `import Suite from '../components/suite/Suite.astro';` and add `import Lightbox from '../components/Lightbox.astro';`
- replace `<Hero />` with `<Suite />`
- add `<Lightbox />` directly after `</main>`

Delete the hero: `git rm src/components/Hero.astro`.

In `.claude/skills/add-video/SKILL.md` Step 6 item 3, replace "`src/components/Projects.astro` — add to the `previews` map:" with "`src/lib/media.ts` — add to the `PREVIEW_LOOPS` map:" (the code line stays `'<id>': '<name>-loop',`).

- [ ] **Step 10: Run tests to verify they pass**

Run: `npm run build && npm test && npm run test:ui`
Expected: PASS.

- [ ] **Step 11: Verify in the browser**

Start the `dev` launch config. Check, and fix before committing:
1. 1440x900: bar + three panes + sequence all visible without scrolling; the monitor plays the Shell loop; the playhead moves across the Shell clip; the transport timecode counts; after the loop ends the monitor moves to Simbility.
2. Click the Xbox clip: monitor switches; click it again: `/work/xbox-forza-5` opens. Drag across the lanes: monitor and playhead follow; releasing does not navigate.
3. Watch Sizzle opens the lightbox; Esc closes it.
4. 1100px: info pane moves below; 390x844: bins hidden, monitor full width, clips stacked as rows with duration bars, no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`).
5. With `prefers-reduced-motion: reduce` emulated (resize_window colorScheme is not it; use Playwright `page.emulateMedia({ reducedMotion: 'reduce' })`), nothing plays until Play is pressed.
6. JavaScript disabled (Playwright `javaScriptEnabled: false`): monitor shows the Shell poster, transport buttons are hidden, clips are links.
7. `.claude/skills/impeccable/scripts/impeccable detect src/components/suite/` reports no findings except the expected offline-hatch advisory.

- [ ] **Step 12: Commit**

```bash
git add src/components/suite src/scripts/sequence-player.ts src/pages/index.astro .claude/skills/add-video/SKILL.md tests/smoke.test.js
git commit -m "feat: open sequence suite replaces the hero"
```

---

### Task 6: Work bin (icon view)

**Files:**
- Modify (full rewrite): `src/components/Projects.astro`
- Modify (full rewrite): `src/components/ComparisonCard.astro`
- Modify: `src/styles/global.css` (append the work-item block inside the Open Sequence section)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `orderOnlineFirst`, `hasCaseStudy`, `mmss`, `roleLabel` (Task 2); `loopFor` (Task 2); `tcFormat` (`src/scripts/timecode.ts`); `.bin*`, `.readout` (Task 3).
- Produces: `<section id="work" class="bin">`; items `.work-item` (link or static), `.work-item__thumb` carrying `view-transition-name:work-<id>` for case-study projects, `.work-item__preview` video, `.work-item__tc` chip. `ComparisonCard` props: `{ project, position: string }`.

- [ ] **Step 1: Write the failing test**

In `tests/smoke.test.js` replace these three tests: `'smoke: index.html work section links to case-study pages'`, `'smoke: work section project count is derived from projects.json'`, `'smoke: work cards with previews render a timecode chip'` with:

```js
test('smoke: work bin links items to case studies with hover previews', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="work"'), '#work bin must exist');
  const work = html.slice(html.indexOf('id="work"'), html.indexOf('id="about"'));
  assert.ok(work.includes('href="/work/shell-john-williams"'), 'items must link to case-study pages');
  assert.ok(work.includes('work-item__preview'), 'hover-preview video must be present');
  assert.ok(work.includes('shell-loop.webm'), 'preview loop source must be wired');
  assert.ok(work.includes('Shell × John Williams'), 'titles must be visible at rest');
  assert.ok(work.indexOf('Shell × John Williams') < work.indexOf('Canadian Association'), 'coming-soon project renders last');
  assert.ok(work.includes('In progress'), 'coming-soon project keeps its status');
  assert.ok(!work.includes('Twenty years of'), 'template headline is retired');
});

test('smoke: work bin count and years are derived from projects.json', () => {
  const projects = JSON.parse(readFileSync(join(ROOT, 'src/data/projects.json'), 'utf-8'));
  const years = projects.map((p) => Number(p.year));
  const expected = `${projects.length} projects · ${Math.min(...years)} to ${Math.max(...years)}`;
  assert.ok(getHtml('index.html').includes(expected), `index.html must contain "${expected}"`);
});

test('smoke: work items with previews render a timecode chip at their running time', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('work-item__tc'), 'timecode chip must render');
  assert.match(html, /data-duration="07:17"/, 'chip must rest at the real running time');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "hover-preview video must be present".

- [ ] **Step 3: Rewrite `src/components/Projects.astro`**

```astro
---
import projects from '../data/projects.json';
import ComparisonCard from './ComparisonCard.astro';
import { hasCaseStudy, mmss, orderOnlineFirst, roleLabel, type SequenceProject } from '../lib/sequence';
import { PREVIEW_LOOPS } from '../lib/media';

const ordered = orderOnlineFirst(projects as unknown as (SequenceProject & Record<string, any>)[]);
const years = projects.map((p) => Number(p.year));
const summary = `${projects.length} projects · ${Math.min(...years)} to ${Math.max(...years)}`;
---
<section id="work" class="bin" aria-labelledby="work-title">
  <div class="bin__inner">
    <div class="bin__head">
      <h2 id="work-title">Work</h2>
      <span class="readout">{summary}</span>
    </div>

    <div class="work-grid">
      {ordered.map((project, i) => {
        const position = String(i + 1).padStart(2, '0');
        if (project.comparison) return <ComparisonCard project={project} position={position} />;
        const preview = PREVIEW_LOOPS[project.id];
        const duration = typeof project.duration_seconds === 'number' ? mmss(project.duration_seconds) : '';
        const linked = hasCaseStudy(project);
        const Tag = linked ? 'a' : 'div';
        const thumbStyle = linked ? `view-transition-name:work-${project.id}` : undefined;
        return (
          <Tag
            class:list={['work-item', { 'is-offline': project.coming_soon }]}
            href={linked ? `/work/${project.id}` : undefined}
            aria-disabled={linked ? undefined : 'true'}
          >
            <div class="work-item__thumb" style={thumbStyle}>
              <img src={project.thumbnail} alt="" loading="lazy" decoding="async" />
              {preview && (
                <video class="work-item__preview" muted loop playsinline preload="none" aria-hidden="true">
                  <source src={`/assets/${preview}.webm`} type="video/webm" />
                  <source src={`/assets/${preview}.mp4`} type="video/mp4" />
                </video>
              )}
              {project.coming_soon
                ? <span class="work-item__tc readout">In progress</span>
                : (duration || preview) && <span class="work-item__tc readout" data-duration={duration} hidden={!duration}>{duration}</span>}
            </div>
            <div class="work-item__meta">
              <span class="work-item__name">{project.name}</span>
              <span class="readout">{position} · {project.year}</span>
              <span class="work-item__sub">{project.client} · {project.type}{roleLabel(project) && ` · ${roleLabel(project)}`}</span>
            </div>
          </Tag>
        );
      })}
    </div>
  </div>
</section>

<script>
  import { tcFormat } from '../scripts/timecode';

  // Hover-to-play: the chip rests at the real running time and counts the loop while it plays.
  document.querySelectorAll<HTMLElement>('.work-item').forEach((item) => {
    const v = item.querySelector<HTMLVideoElement>('.work-item__preview');
    const tc = item.querySelector<HTMLElement>('.work-item__tc');
    if (!v) return;
    const rest = tc?.dataset.duration ?? '';
    let raf = 0;
    const tick = () => {
      if (tc) tc.textContent = tcFormat(v.currentTime);
      raf = requestAnimationFrame(tick);
    };
    item.addEventListener('mouseenter', () => {
      v.play().catch(() => {});
      if (tc) tc.hidden = false;
      if (tc && !raf) raf = requestAnimationFrame(tick);
    });
    item.addEventListener('mouseleave', () => {
      v.pause();
      try { v.currentTime = 0; } catch {}
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (tc) { tc.textContent = rest; tc.hidden = !rest; }
    });
  });
</script>
```

- [ ] **Step 4: Rewrite `src/components/ComparisonCard.astro`**

Keep the existing `<script define:vars={{ uid }}>` logic, with the three changes listed after this block. Replace the frontmatter, markup and `<style>` with:

```astro
---
interface Props {
  project: {
    name: string;
    type: string;
    disciplines?: string;
    year: number | string;
    thumbnail: string;
    graded_src: string;
    ungraded_src: string;
  };
  position: string;
}
const { project, position } = Astro.props;
const uid = `cc-${Math.random().toString(36).slice(2, 7)}`;
---
<div id={uid} class="work-item work-item--wide comparison">
  <div class="work-item__thumb cc-stage" role="img" aria-label={`${project.name}: colour grade before and after. Drag to compare.`}>
    <video class="cc-video cc-video--graded" src={project.graded_src} loop muted playsinline preload="none"></video>
    <video class="cc-video cc-video--ungraded" src={project.ungraded_src} loop muted playsinline preload="none"></video>
    <div class="cc-slider" aria-hidden="true">
      <div class="cc-slider__line"><div class="cc-slider__handle">
        <svg viewBox="0 0 16 16"><path d="M5 4L1 8l4 4M11 4l4 4-4 4" /></svg>
      </div></div>
      <div class="cc-slide-hint">
        <svg class="cc-hint-line" viewBox="0 0 54 36" fill="none">
          <path d="M50,18 C38,26 20,28 4,22" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M4,22 L11,16" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M4,22 L12,28" stroke="rgba(255,255,255,0.8)" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        Slide me!
      </div>
    </div>
    <img class="cc-thumb" src={project.thumbnail} alt="" aria-hidden="true" />
  </div>
  <div class="work-item__meta">
    <span class="work-item__name">{project.name}</span>
    <span class="readout">{position} · {project.year}</span>
    <span class="work-item__sub">Colour grade, before and after · {project.type}</span>
  </div>
</div>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap');
  .cc-stage{ cursor:ew-resize; touch-action:none; user-select:none; -webkit-user-select:none; }
  .cc-video{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .cc-thumb{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:3; pointer-events:none; transition:opacity .3s; }
  .comparison:hover .cc-thumb, .comparison.is-active .cc-thumb{ opacity:0; }
  .cc-slider{ position:absolute; inset:0; z-index:4; opacity:0; pointer-events:none; transition:opacity .2s; }
  .comparison:hover .cc-slider, .comparison.is-active .cc-slider{ opacity:1; }
  .cc-slider__line{ position:absolute; top:0; bottom:0; left:50%; width:2px; background:var(--text); transform:translateX(-50%); }
  .cc-slider__handle{ position:absolute; top:50%; left:50%; width:36px; height:36px; transform:translate(-50%,-50%); display:grid; place-items:center; background:var(--panel-head); border:1px solid var(--hair-strong); }
  .cc-slider__handle svg{ width:16px; height:16px; fill:none; stroke:var(--text); stroke-width:1.5; }
  .cc-slide-hint{ position:absolute; top:calc(50% - 22px); left:calc(50% + 24px); display:flex; align-items:center; gap:6px; font-family:'Caveat', cursive; font-size:44px; font-weight:500; line-height:1; color:#fff; white-space:nowrap; pointer-events:none; transition:opacity .7s; }
  .cc-hint-line{ width:54px; height:36px; flex-shrink:0; }
  .cc-slide-hint.is-used{ opacity:0; }
  @media (max-width: 720px){ .cc-slide-hint{ display:none; } }
  @media (prefers-reduced-motion: reduce){ .cc-thumb, .cc-slider, .cc-slide-hint{ transition:none; } }
</style>
```

Script changes (inside the existing `<script define:vars={{ uid }}>`):
1. After `const card = document.getElementById(uid); if (!card) return;` add `const stage = card.querySelector('.cc-stage');` and `if (!stage) return;`.
2. Replace every `card.addEventListener('pointerdown'|'pointermove'|'pointerup'|'pointercancel', …)`, `card.setPointerCapture(…)` and `card.getBoundingClientRect()` with `stage.…`. Leave `mouseenter`/`mouseleave`, the `is-active` class toggles and the IntersectionObserver on `card`.
3. Remove the now-unused reference to `.cc-disciplines` if present (it no longer exists in the markup).

- [ ] **Step 5: Append the work-item styles**

In `src/styles/global.css`, insert directly above `/* ========== end Open Sequence ========== */`:

```css
.work-grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:28px 18px; }
.work-item{ display:block; min-width:0; color:var(--text); }
.work-item--wide{ grid-column:span 2; }
.work-item__thumb{ position:relative; aspect-ratio:16/9; overflow:hidden; background:#000; border:1px solid var(--hair-strong); }
.work-item__thumb > img{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.work-item__preview{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity .2s; pointer-events:none; }
.work-item:hover .work-item__preview, .work-item:focus-visible .work-item__preview{ opacity:1; }
.work-item__tc{ position:absolute; right:8px; bottom:8px; padding:2px 6px; font-size:11px; color:#fff; background:rgba(0,0,0,.6); }
.work-item__meta{ display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2px 12px; padding:10px 2px 0; }
.work-item__name{ font-size:15px; font-weight:600; }
.work-item__sub{ grid-column:1 / -1; font-size:13px; color:var(--muted); }
a.work-item:hover .work-item__name{ text-decoration:underline; text-underline-offset:3px; text-decoration-color:var(--mango); }
.work-item.is-offline .work-item__name{ color:var(--muted); }
@media (max-width: 720px){ .work-item--wide{ grid-column:auto; } }
@media (hover: none){ .work-item__preview{ display:none; } }
@media (prefers-reduced-motion: reduce){ .work-item__preview{ transition:none; } }
```

Then delete the old work grid rules from `global.css`: every rule whose selector starts with `.work-grid`, `.work-card` or `.still-` (the "Work grid" block), and the `.rainbow-rule` rules.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS, including `'smoke: work card and case-study hero share a view-transition-name'` (the thumb carries `view-transition-name:work-shell-john-williams`).

- [ ] **Step 7: Verify in the browser**

1440x900: four columns, titles at rest, Thales spans two columns and its slider still drags; hovering Shell plays the loop and the chip counts from `00:00:00:00`, returning to `07:17` on leave; clicking Shell morphs into the case study. 390px: one column, no previews on touch emulation. `impeccable detect src/components/Projects.astro src/components/ComparisonCard.astro` is clean.

- [ ] **Step 8: Commit**

```bash
git add src/components/Projects.astro src/components/ComparisonCard.astro src/styles/global.css tests/smoke.test.js
git commit -m "feat: work bin with titled items, real running times, offline last"
```

---

### Task 7: About bin (clip properties)

**Files:**
- Modify (full rewrite): `src/components/About.astro`
- Delete: `src/components/Clients.astro` (unused)
- Modify: `src/styles/global.css` (delete the About rules)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `profile.clients` (Task 1); `.bin*`, `.props`, `.readout` (Task 3).
- Produces: `<section id="about" class="bin">` containing an element with `id="clients"` (target of the Info pane "N more" link and of `agent-data.json`'s `/#clients` section).

- [ ] **Step 1: Write the failing test**

In `tests/smoke.test.js`, replace `'smoke: index.html has about section'` with:

```js
test('smoke: about bin shows bio, properties and every client', () => {
  const html = getHtml('index.html');
  const about = html.slice(html.indexOf('id="about"'), html.indexOf('id="builds"'));
  assert.ok(about.includes('Jeremy Twogood'), 'name must appear in about');
  assert.ok(about.includes('Toronto'), 'Toronto must appear in about');
  assert.ok(about.includes('A producer who still cuts the picture.'), 'lead line keeps its words');
  assert.ok(about.includes('id="clients"'), 'clients anchor must exist');
  const profile = JSON.parse(readFileSync(join(ROOT, 'src/data/profile.json'), 'utf-8'));
  for (const name of profile.clients) {
    const escaped = name.replace(/&/g, '&amp;');
    assert.ok(about.includes(name) || about.includes(escaped), `about must list ${name}`);
  }
  assert.ok(!about.includes('client-list'), 'numbered client index is retired');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "clients anchor must exist".

- [ ] **Step 3: Rewrite `src/components/About.astro`**

```astro
---
import profile from '../data/profile.json';
const clients = profile.clients as string[];
---
<section id="about" class="bin about" aria-labelledby="about-title">
  <div class="bin__inner">
    <div class="bin__head">
      <h2 id="about-title">About</h2>
      <span class="readout">Toronto, ON · 43.65°N · EST · GMT−5</span>
    </div>

    <div class="about__grid">
      <figure class="about__frame">
        <img src="/assets/portrait.jpg" alt="Jeremy Twogood" width="2316" height="3088" loading="lazy" decoding="async" />
        <figcaption class="readout">Jeremy Twogood · Toronto · 2026</figcaption>
      </figure>

      <div class="about__text">
        <h3 class="about__lead">A producer who still cuts the picture.</h3>
        {profile.bio.map((para) => <p>{para}</p>)}
        <h4 class="about__sub">How I work</h4>
        <p>Nobody does their best work dreading Monday. Wherever I work, I end up building some culture into the place: check-ins, small rituals, a room people actually want to show up to.</p>
        <p class="about__music">Outside of production work, I make electronic music. It lives at <a href="https://soundcloud.com/j-twogood" target="_blank" rel="noopener">soundcloud.com/j-twogood</a>.</p>
      </div>

      <dl class="props about__props">
        <dt>Based in</dt><dd>Toronto, Ontario</dd>
        <dt>Producing since</dt><dd><span class="readout">2006</span></dd>
        <dt>Open to</dt><dd>Contract, freelance and full-time work. Remote-first.</dd>
        <dt>Skills</dt><dd>{profile.skills.join(', ')}</dd>
        <dt id="clients">Clients</dt>
        <dd><ul class="about__clients">{clients.map((c) => <li>{c}</li>)}</ul></dd>
      </dl>
    </div>
  </div>
</section>

<style>
  .about__grid{ display:grid; grid-template-columns:minmax(200px, 300px) minmax(0, 1fr) minmax(240px, 340px); gap:32px; align-items:start; }
  .about__frame{ margin:0; }
  .about__frame img{ width:100%; aspect-ratio:3/4; object-fit:cover; border:1px solid var(--hair-strong); }
  .about__frame figcaption{ margin-top:8px; font-size:11px; }
  .about__text{ max-width:65ch; }
  .about__text p{ margin:0 0 14px; }
  .about__lead{ margin:0 0 16px; font-family:var(--font-display); font-variation-settings:'wdth' 112; font-weight:700; font-size:clamp(22px, 2.4vw, 30px); line-height:1.15; }
  .about__sub{ margin:22px 0 8px; font-size:13px; font-weight:600; color:var(--muted); }
  .about__text a{ text-decoration:underline; text-decoration-color:var(--hair-strong); text-underline-offset:3px; }
  .about__text a:hover{ text-decoration-color:var(--mango); }
  .about__props{ padding:14px; background:var(--lane); border:1px solid var(--hair); }
  .about__props .readout{ font-size:13px; color:var(--text); }
  .about__clients{ list-style:none; margin:0; padding:0; columns:2; column-gap:16px; }
  .about__clients li{ break-inside:avoid; padding:1px 0; }
  #clients{ scroll-margin-top:calc(var(--bar-h) + 16px); }
  @media (max-width: 1100px){
    .about__grid{ grid-template-columns:minmax(180px, 260px) minmax(0, 1fr); }
    .about__props{ grid-column:1 / -1; }
  }
  @media (max-width: 640px){
    .about__grid{ grid-template-columns:1fr; }
    .about__frame{ max-width:280px; }
    .about__clients{ columns:1; }
  }
</style>
```

Delete `src/components/Clients.astro` (`git rm`). In `global.css`, delete the rules for `#about`, `#about::after`, `#about > *`, `.about-grid`, `.about-portrait*`, `.about-bio*`, `.about-how-i-work*`, `.about-personal*`, `.about-clients*` and `.client-list*`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS.

- [ ] **Step 5: Verify in the browser**

1440: three columns (portrait, text, properties panel); the Info pane's "and 11 more" link lands on Clients below the sticky bar. 390px: single column, no overflow. `impeccable detect src/components/About.astro` is clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/About.astro src/styles/global.css tests/smoke.test.js
git rm src/components/Clients.astro
git commit -m "feat: about bin as clip properties with the full client list"
```

---

### Task 8: AI builds list view (homepage bin and /ai-builds)

**Files:**
- Create: `src/components/BuildsList.astro`
- Modify (full rewrite): `src/components/AIBuilds.astro`, `src/components/AIBuildsGrid.astro`
- Modify: `src/styles/global.css` (delete build-card rules)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `ai-builds.json`; `.bin*`, `.pbtn`, `.readout` (Task 3).
- Produces: `<BuildsList level="h2" | "h3" />` rendering `<ol class="builds">` of `.build-row` with `.build-row__status`.

- [ ] **Step 1: Write the failing test**

In `tests/smoke.test.js`, replace `'smoke: index.html has builds section with cards'` with:

```js
test('smoke: builds bin lists every build with a plain status', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="builds"'), '#builds bin must exist');
  const builds = html.slice(html.indexOf('id="builds"'), html.indexOf('id="sound"'));
  for (const name of ['Unbusy Scanner', 'Production Intelligence', 'Gibbon Knight', 'MCP Integrator', 'Pedal Path']) {
    assert.ok(builds.includes(name), `${name} must appear`);
  }
  assert.ok(builds.includes('build-row__status'), 'status must render');
  assert.ok(!builds.includes('class="tag"'), 'tag chips are retired');
  assert.ok(builds.includes('href="/ai-builds"'), 'link to the full page must remain');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "status must render".

- [ ] **Step 3: Create `src/components/BuildsList.astro`**

```astro
---
import aiBuilds from '../data/ai-builds.json';

interface Props { level?: 'h2' | 'h3' }
const { level = 'h3' } = Astro.props;
const Heading = level;
const STATUS: Record<string, string> = { live: 'Live', internal: 'Internal', beta: 'Beta', 'in-dev': 'Private beta' };
const linkLabel = (url: string) => (url.includes('apps.apple.com') ? 'App Store' : 'Open app');
---
<ol class="builds">
  {aiBuilds.map((b) => {
    const shot = b.shot_images?.[0];
    return (
      <li class="build-row" id={`build-${b.id}`}>
        <div class="build-row__shot">
          {shot && <img src={shot} alt={b.shot_alts?.[0] || b.name} loading="lazy" decoding="async" />}
        </div>
        <div class="build-row__main">
          <Heading class="build-row__name">{b.name}</Heading>
          <p class="build-row__desc">{b.description}</p>
        </div>
        <dl class="props build-row__props">
          <dt>Status</dt><dd class:list={['build-row__status', `is-${b.status}`]}>{STATUS[b.status] ?? b.status}</dd>
          <dt>Stack</dt><dd>{b.tech_stack.join(', ')}</dd>
        </dl>
        <div class="build-row__cta">
          {b.live_url && (
            <a class="pbtn" href={b.live_url} target="_blank" rel="noopener">
              {linkLabel(b.live_url)} <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2h7v7H8.5V4.6L3.1 10 2 8.9 7.4 3.5H3z" /></svg>
            </a>
          )}
        </div>
      </li>
    );
  })}
</ol>

<style>
  .builds{ list-style:none; margin:0; padding:0; border-top:1px solid var(--hair); }
  .build-row{ display:grid; grid-template-columns:160px minmax(0, 1fr) minmax(220px, 300px) auto; gap:20px; align-items:start; padding:16px 0; border-bottom:1px solid var(--hair); }
  .build-row__shot{ aspect-ratio:16/10; background:var(--lane); border:1px solid var(--hair); overflow:hidden; }
  .build-row__shot img{ width:100%; height:100%; object-fit:contain; }
  .build-row__name{ margin:0 0 6px; font-family:var(--font-ui); font-weight:600; font-size:17px; line-height:1.3; }
  .build-row__desc{ margin:0; max-width:65ch; color:var(--muted); }
  .build-row__props{ font-size:13px; }
  .build-row__status{ color:var(--muted); }
  .build-row__status.is-live{ color:var(--text); font-weight:600; }
  .build-row__cta{ justify-self:end; }
  @media (max-width: 1000px){
    .build-row{ grid-template-columns:120px minmax(0, 1fr); }
    .build-row__props, .build-row__cta{ grid-column:2; justify-self:start; }
  }
  @media (max-width: 560px){
    .build-row{ grid-template-columns:1fr; }
    .build-row__shot{ max-width:220px; }
    .build-row__props, .build-row__cta{ grid-column:1; }
  }
</style>
```

- [ ] **Step 4: Rewrite `src/components/AIBuilds.astro`**

```astro
---
import BuildsList from './BuildsList.astro';
import aiBuilds from '../data/ai-builds.json';
---
<section id="builds" class="bin" aria-labelledby="builds-title">
  <div class="bin__inner">
    <div class="bin__head">
      <h2 id="builds-title">AI builds</h2>
      <span class="readout">{aiBuilds.length} builds</span>
      <a class="bin__link" href="/ai-builds">Open as a page</a>
    </div>
    <BuildsList level="h3" />
  </div>
</section>
```

- [ ] **Step 5: Rewrite `src/components/AIBuildsGrid.astro`**

```astro
---
import BuildsList from './BuildsList.astro';
import aiBuilds from '../data/ai-builds.json';
---
<section id="ai-builds-grid" class="bin" aria-labelledby="ai-builds-title">
  <div class="bin__inner">
    <div class="bin__head">
      <h1 id="ai-builds-title">AI builds</h1>
      <span class="readout">{aiBuilds.length} builds</span>
      <a class="bin__link" href="/#work">Back to the work</a>
    </div>
    <BuildsList level="h2" />
  </div>
</section>
```

In `global.css`, delete every rule whose selector starts with `.builds-grid`, `.build-card` or `.tag`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS, including `'smoke: /ai-builds/index.html exists with full grid'`.

- [ ] **Step 7: Verify in the browser**

Homepage builds bin and `/ai-builds` at 1440 and 390; screenshots sit in their boxes without cropping phone shots; `impeccable detect src/components/BuildsList.astro` is clean.

- [ ] **Step 8: Commit**

```bash
git add src/components/BuildsList.astro src/components/AIBuilds.astro src/components/AIBuildsGrid.astro src/styles/global.css tests/smoke.test.js
git commit -m "feat: AI builds as a list view on home and /ai-builds"
```

---

### Task 9: Sound bin (waveform rows)

**Files:**
- Modify: `src/components/Sound.astro` (markup and a new `<style>` block; the `<script>` keeps its logic)
- Modify: `src/styles/global.css` (delete sound rules)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `profile.tracks`, `waveforms.json`; `.bin*`, `.readout` (Task 3).
- Produces: unchanged script hooks: `.tracks li`, `.tracks__title`, `.tracks__wave`, `.tracks__wave-base`, `.tracks__wave-lit`, `.tracks__wave-ph`, `#sound-player`, `#sc-iframe`.

- [ ] **Step 1: Write the failing test**

Append to `tests/smoke.test.js`:

```js
test('smoke: sound bin labels tracks as audio clips and plays inline', () => {
  const html = getHtml('index.html');
  const sound = html.slice(html.indexOf('id="sound"'), html.indexOf('id="contact"'));
  assert.ok(sound.includes('class="bin sound"'), 'sound must be a bin');
  assert.ok(sound.includes('>A1<'), 'first track is labelled A1');
  assert.ok(sound.includes('tracks__hint'), 'rows say they play inline');
  assert.ok(!sound.includes('↗'), 'external-link arrow is retired');
  assert.ok(sound.includes('color=%23f4a23b') || html.includes("color: '#f4a23b'"), 'SoundCloud player uses the mango accent');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "sound must be a bin".

- [ ] **Step 3: Replace the markup**

In `src/components/Sound.astro`, replace everything from `<section id="sound"` through its closing `</section>` with:

```astro
<section id="sound" class="bin sound" aria-labelledby="sound-title">
  <div class="bin__inner">
    <div class="bin__head">
      <h2 id="sound-title">Sound</h2>
      <span class="readout">{tracks.length} tracks</span>
      <p class="bin__lede">Original compositions. Music is where my ear goes when it's off the clock. It always ends up feeding back into the edit.</p>
    </div>

    <ul class="tracks">
      {tracks.map((track) => {
        const peaks = peaksFor(track.num);
        return (
          <li>
            <div class="tracks__row">
              <span class="tracks__num readout">A{Number(track.num)}</span>
              <a class="tracks__title" href={track.url} target="_blank" rel="noopener">{track.title}</a>
              <span class="tracks__hint">Play</span>
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

    <div class="sound__player" id="sound-player" hidden>
      <iframe id="sc-iframe" allow="autoplay" frameborder="no" scrolling="no" src="" title="SoundCloud player"></iframe>
    </div>

    <p class="sound__foot">Full catalogue on <a href="https://soundcloud.com/j-twogood/tracks" target="_blank" rel="noopener">soundcloud.com/j-twogood</a></p>
  </div>
</section>

<style>
  .tracks{ list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:10px 18px; }
  .tracks li{ background:var(--lane); border:1px solid var(--hair); padding:10px 12px 12px; }
  .tracks li.is-playing{ border-color:var(--hair-strong); background:var(--lane-alt); }
  .tracks__row{ display:grid; grid-template-columns:3.2em minmax(0, 1fr) auto; gap:10px; align-items:baseline; margin-bottom:8px; }
  .tracks__num{ font-size:11px; }
  .tracks__title{ font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .tracks__title:hover{ text-decoration:underline; text-underline-offset:3px; text-decoration-color:var(--mango); }
  .tracks__hint{ font-size:12px; color:var(--dim); }
  .tracks li.is-playing .tracks__hint{ color:var(--text); }
  .tracks__wave{ position:relative; height:40px; background:var(--clip-audio); border-radius:2px; overflow:hidden; cursor:pointer; }
  .tracks__wave svg{ position:absolute; inset:4px 6px; width:calc(100% - 12px); height:calc(100% - 8px); }
  .tracks__wave-base rect{ fill:var(--clip-audio-ink); opacity:.4; }
  .tracks__wave-lit rect{ fill:var(--clip-audio-ink); }
  .tracks__wave-ph{ position:absolute; top:0; bottom:0; width:0; border-left:1px solid var(--mango); }
  .sound__player{ margin-top:18px; border:1px solid var(--hair); }
  .sound__player iframe{ display:block; width:100%; height:166px; }
  .sound__foot{ margin:18px 0 0; font-size:13px; color:var(--muted); }
  .sound__foot a{ color:var(--text); text-decoration:underline; text-decoration-color:var(--hair-strong); text-underline-offset:3px; }
  @media (max-width: 760px){ .tracks{ grid-template-columns:1fr; } }
</style>
```

- [ ] **Step 4: Update the player accent in the script**

In the same file's `<script>`, change `color: '#c8922a'` to `color: '#f4a23b'` and `'&color=%23c8922a'` to `'&color=%23f4a23b'`. No other script changes.

In `global.css`, delete every rule whose selector starts with `.sound`, `.tracks` or `.grain` (and the `@keyframes grain`).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS, including the existing waveform and `seekTo` tests.

- [ ] **Step 6: Verify in the browser**

Click "Eagle": the SoundCloud player appears below the grid, the row's waveform lights from the left with a mango playhead; clicking inside the lit waveform seeks. 390px: one column. Detector clean on `src/components/Sound.astro`.

- [ ] **Step 7: Commit**

```bash
git add src/components/Sound.astro src/styles/global.css tests/smoke.test.js
git commit -m "feat: sound bin as audio clip rows"
```

---

### Task 10: Contact bin and retiring scroll reveals

**Files:**
- Modify (full rewrite): `src/components/Contact.astro`
- Modify: `src/layouts/BaseLayout.astro` (delete the reveal `<script>`)
- Modify: `src/styles/global.css` (delete contact rules and the reveal block)
- Modify: `PRODUCT.md` (Capabilities: reveals retired)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `profile.email`, `profile.social`; `.bin*`, `.props`, `.readout` (Task 3).
- Produces: `<section id="contact" class="bin">`.

- [ ] **Step 1: Write the failing test**

In `tests/smoke.test.js`, replace `'smoke: reveal styles are gated behind html.js'` and `'smoke: pages add the js class before paint'` with:

```js
test('smoke: scroll reveals are retired; the js class still lands before paint', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes("classList.add('js')"), 'inline js-class script must be present');
  assert.ok(!getBundledCss().includes('is-inview'), 'reveal CSS is retired');
  assert.ok(!html.includes('revealTargets'), 'reveal observer is retired');
  const caseStudy = getHtml('work/shell-john-williams/index.html');
  assert.ok(caseStudy.includes("classList.add('js')"), 'js-class script must be on case-study pages too');
});

test('smoke: contact bin lists every way to reach Jeremy', () => {
  const html = getHtml('index.html');
  const contact = html.slice(html.indexOf('id="contact"'));
  assert.ok(contact.includes('class="bin contact"'), 'contact must be a bin');
  for (const needle of ['mailto:', 'linkedin.com', 'soundcloud.com/j-twogood', 'href="/reel"', 'Available · 2026']) {
    assert.ok(contact.includes(needle), `contact must include ${needle}`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "reveal CSS is retired".

- [ ] **Step 3: Rewrite `src/components/Contact.astro`**

```astro
---
import profile from '../data/profile.json';
const social = profile.social as Record<string, string>;
---
<section id="contact" class="bin contact" aria-labelledby="contact-title">
  <div class="bin__inner">
    <div class="bin__head">
      <h2 id="contact-title">Contact</h2>
      <span class="readout">Available · 2026</span>
    </div>
    <div class="contact__grid">
      <div>
        <p class="contact__statement">Let's make something.</p>
        <p class="contact__line">Available for broadcast, corporate, and documentary projects. Edits, productions, and the occasional AI build.</p>
      </div>
      <dl class="props contact__props">
        <dt>Email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd>
        <dt>LinkedIn</dt><dd><a href={social.linkedin} target="_blank" rel="noopener">/in/jeremy-twogood</a></dd>
        <dt>SoundCloud</dt><dd><a href="https://soundcloud.com/j-twogood/tracks" target="_blank" rel="noopener">/j-twogood</a></dd>
        <dt>Reel</dt><dd><a href="/reel">jeremytwogood.com/reel</a></dd>
      </dl>
    </div>
  </div>
</section>

<style>
  .contact{ padding-bottom:96px; }
  .contact__grid{ display:grid; grid-template-columns:minmax(0, 1.2fr) minmax(260px, 1fr); gap:32px; align-items:start; }
  .contact__statement{ margin:0 0 10px; font-family:var(--font-display); font-variation-settings:'wdth' 118; font-weight:800; font-size:clamp(28px, 4vw, 48px); line-height:1.05; }
  .contact__line{ margin:0; max-width:46ch; color:var(--muted); }
  .contact__props{ padding:14px; background:var(--lane); border:1px solid var(--hair); font-size:15px; }
  @media (max-width: 760px){ .contact__grid{ grid-template-columns:1fr; } }
</style>
```

- [ ] **Step 4: Retire the reveals**

In `src/layouts/BaseLayout.astro`, delete the whole `<script>` block that begins `// Scroll-in reveals:` (keep the inline `classList.add('js')` in `<head>`). In `global.css`, delete the "Scroll-in section reveals" block (all `html.js … is-inview` rules and their reduced-motion override), and every rule whose selector starts with `.contact`.

In `PRODUCT.md` → Capabilities and Constraints, remove "and scroll-in reveals" from the signature-feature sentence and append: "Scroll-in reveals were retired in the facelift (2026-09-14): the only authored motion is the sequence playhead."

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS.

- [ ] **Step 6: Verify in the browser**

Contact at 1440 and 390; nothing on the page fades in on scroll. Detector clean on `src/components/Contact.astro`.

- [ ] **Step 7: Commit**

```bash
git add src/components/Contact.astro src/layouts/BaseLayout.astro src/styles/global.css PRODUCT.md tests/smoke.test.js
git commit -m "feat: contact bin; retire scroll reveals"
```

---

### Task 11: Page timeline bar (slim)

**Files:**
- Modify: `src/components/TimelineBar.astro` (markup, style, script)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: section ids `top`, `work`, `about`, `builds`, `sound`, `contact`; tokens (Task 3).
- Produces: unchanged hooks `[data-tlbar]`, `.tlbar__clip`, `[data-tlbar-playhead]`, `body.has-tlbar` (chat trigger lift).

- [ ] **Step 1: Write the failing test**

Append to `tests/smoke.test.js`:

```js
test('smoke: page timeline bar shows no invented timecode', () => {
  const html = getHtml('index.html');
  assert.ok(!html.includes('data-tlbar-tc'), 'fictional program timecode is retired');
  assert.ok(!html.includes('DURATION'), 'nominal duration constant is retired');
  assert.ok(html.includes('>Top<'), 'first clip is labelled Top');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "fictional program timecode is retired".

- [ ] **Step 3: Update `src/components/TimelineBar.astro`**

In the frontmatter, change `{ id: 'top', label: 'Intro' }` to `{ id: 'top', label: 'Top' }`.

In the markup, delete `<div class="tlbar__tc" data-tlbar-tc>00:00:00:00</div>`.

Replace the whole `<style>` block with:

```css
<style>
  .tlbar{
    position:fixed; left:0; right:0; bottom:0; height:28px; z-index:60;
    background:var(--panel-head); border-top:1px solid var(--hair-strong);
    opacity:0; transform:translateY(100%); pointer-events:none;
    transition:opacity .2s linear, transform .2s linear;
  }
  .tlbar.is-visible{ opacity:1; transform:none; pointer-events:auto; }
  .tlbar__clips{ display:flex; height:100%; }
  .tlbar__clip{ display:flex; align-items:center; justify-content:center; min-width:0; padding:0; border:0; border-right:1px solid var(--hair); background:var(--lane); cursor:pointer; }
  .tlbar__clip span{ padding:0 8px; font-family:var(--font-ui); font-size:11px; font-weight:500; color:var(--dim); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .tlbar__clip.is-active{ background:var(--lane-alt); }
  .tlbar__clip.is-active span{ color:var(--text); }
  .tlbar__playhead{ position:absolute; top:0; bottom:0; left:0; width:0; border-left:1px solid var(--mango); pointer-events:none; will-change:transform; }
  .tlbar__playhead::before{ content:""; position:absolute; top:0; left:-5px; border:5px solid transparent; border-top:6px solid var(--mango); border-bottom:0; }
  @media (max-width:760px){ .tlbar{ display:none; } }
  @media (prefers-reduced-motion: reduce){ .tlbar{ transition:none; } }
</style>
```

In the `<script>`:
- delete `import { tcFormat } from '../scripts/timecode';`
- delete `const tcEl = bar.querySelector('[data-tlbar-tc]') as HTMLElement;` and `const DURATION = 60; …`
- delete the line `tcEl.textContent = tcFormat(f * DURATION);`
- change `const desktop = window.matchMedia('(min-width: 720px)');` to `'(min-width: 761px)'`

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS, including the two existing timeline-bar tests.

- [ ] **Step 5: Verify in the browser**

Scroll past half the suite: the bar appears; clicking "Sound" scrolls to the Sound bin; dragging scrubs; the active clip follows scroll. Hidden at 390px.

- [ ] **Step 6: Commit**

```bash
git add src/components/TimelineBar.astro tests/smoke.test.js
git commit -m "feat: slim page timeline bar without an invented timecode"
```

---

### Task 12: Chat widget and lightbox as flat panels

**Files:**
- Modify: `src/components/ChatWidget.astro` (trigger markup, full `<style>` replacement; script untouched)
- Modify: `src/components/Lightbox.astro` (full `<style>` replacement; markup and script untouched)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: tokens (Task 3); `body.has-tlbar` (Task 11).
- Produces: unchanged hooks for both scripts (`[data-chat-widget]`, `.cw__*`, `data-cw-*`, `#lightbox`, `#lightbox-iframe`, `[data-lightbox-close]`).

- [ ] **Step 1: Write the failing test**

Append to `tests/smoke.test.js`:

```js
test('smoke: chat trigger has a visible label and panels carry no glow or shadow', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('cw__trigger-label'), 'trigger must show its label');
  assert.ok(html.includes('aria-label="Ask about my work"'), 'accessible name must match the visible label');
  assert.ok(!html.includes('cw__trigger-dot'), 'glowing dot is retired');
  const chat = html.slice(html.indexOf('data-chat-widget'));
  assert.ok(!/box-shadow:\s*0 0 \d/.test(chat), 'no zero-offset glows in the widget');
  assert.ok(!html.includes('backdrop-filter: blur'), 'no blur on overlays');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "trigger must show its label".

- [ ] **Step 3: Update the chat widget**

In `src/components/ChatWidget.astro`, replace `<span class="cw__trigger-dot" aria-hidden="true"></span>` with:

```astro
<span class="cw__trigger-label">Ask about my work</span>
```

On the same `<button class="cw__trigger">`, change `aria-label="Ask about Jeremy's work"` to `aria-label="Ask about my work"` (accessible name must contain the visible label). In `tests/smoke.test.js`, in `'smoke: index.html mounts the chat widget with trigger and starters'`, change the assertion `html.includes("aria-label=\"Ask about Jeremy's work\"")` to `html.includes('aria-label="Ask about my work"')`.

Delete `<span class="cw__dot" aria-hidden="true"></span>` from the panel header.

Replace the entire `<style>…</style>` block with:

```css
<style>
  .cw{ font-family:var(--font-ui); }

  .cw__trigger{
    position:fixed; right:18px; bottom:18px; z-index:900;
    display:inline-flex; align-items:center; min-height:40px; padding:0 14px;
    background:var(--panel-head); color:var(--text); border:1px solid var(--hair-strong);
    font:600 13px/1 var(--font-ui); cursor:pointer; transition:border-color .15s, bottom .15s linear;
  }
  .cw__trigger:hover{ border-color:var(--mango); }
  .cw__trigger:focus-visible{ outline:2px solid var(--mango); outline-offset:2px; }
  :global(body.has-tlbar) .cw__trigger{ bottom:44px; }
  .cw[data-open] .cw__trigger{ opacity:.5; }

  .cw__panel{
    position:fixed; right:18px; bottom:66px; z-index:901;
    width:380px; max-width:calc(100vw - 32px); max-height:min(620px, calc(100vh - 120px));
    display:flex; flex-direction:column; overflow:hidden;
    background:var(--panel); color:var(--text); border:1px solid var(--hair-strong);
  }
  :global(body.has-tlbar) .cw__panel{ bottom:92px; }
  .cw__panel[hidden]{ display:none; }

  .cw__head{ display:flex; align-items:center; gap:10px; min-height:var(--pane-head-h); padding:0 6px 0 14px; background:var(--panel-head); border-bottom:1px solid var(--hair); }
  .cw__title{ font-weight:600; font-size:12px; letter-spacing:.02em; text-transform:uppercase; color:var(--muted); }
  .cw__close{ margin-left:auto; width:32px; height:32px; padding:0; background:none; border:0; color:var(--muted); font-size:20px; line-height:1; cursor:pointer; }
  .cw__close:hover{ color:var(--text); background:var(--lane); }
  .cw__close:focus-visible{ outline:2px solid var(--mango); outline-offset:-2px; }

  .cw__chips{ display:flex; flex-direction:column; border-bottom:1px solid var(--hair); }
  .cw__chips[hidden]{ display:none; }
  .cw__chip{ padding:9px 14px; text-align:left; font:500 14px/1.35 var(--font-ui); color:var(--text); background:none; border:0; border-top:1px solid var(--hair); cursor:pointer; }
  .cw__chip:first-child{ border-top:0; }
  .cw__chip:hover{ background:var(--lane); }
  .cw__chip:focus-visible{ outline:2px solid var(--mango); outline-offset:-2px; }

  .cw__msgs{ flex:1 1 auto; min-height:60px; overflow-y:auto; padding:12px 14px; display:flex; flex-direction:column; gap:12px; }
  .cw__msgs:empty{ display:none; }
  .cw__bubble{ max-width:90%; font-size:14px; line-height:1.55; white-space:pre-wrap; overflow-wrap:anywhere; }
  .cw__bubble--user{ align-self:flex-end; padding:8px 12px; background:var(--lane-alt); border:1px solid var(--hair-strong); border-radius:2px; }
  .cw__bubble--bot{ align-self:flex-start; }
  .cw__bubble--error{ align-self:flex-start; color:var(--clip-offline-ink); font-size:13px; }
  .cw__caret{ display:inline-block; width:7px; height:15px; margin-left:1px; vertical-align:-2px; background:var(--mango); animation:cw-blink 1s steps(2) infinite; }

  .cw__form{ display:flex; align-items:center; gap:8px; margin:0; padding:8px; border-top:1px solid var(--hair); }
  .cw__form:focus-within{ box-shadow:inset 0 2px 0 var(--mango); }
  .cw__input{ flex:1 1 auto; min-width:0; padding:8px 10px; font:400 16px/1.3 var(--font-ui); color:var(--text); background:var(--lane); border:1px solid var(--hair); outline:none; }
  .cw__input::placeholder{ color:var(--dim); }
  .cw__send{ flex:0 0 auto; width:36px; height:36px; display:grid; place-items:center; background:var(--mango); color:var(--mango-ink); border:0; font-size:16px; font-weight:700; cursor:pointer; }
  .cw__send:disabled{ opacity:.45; cursor:default; }
  .cw__send:focus-visible{ outline:2px solid var(--text); outline-offset:2px; }

  .cw__foot{ margin:0; padding:0 14px 10px; font-size:11px; color:var(--dim); }

  @keyframes cw-blink{ 50%{ opacity:0; } }

  @media (max-width: 560px){
    .cw__panel{ right:0; left:0; bottom:0; width:100%; max-width:100%; max-height:82vh; border-left:0; border-right:0; border-bottom:0; }
    .cw__trigger{ right:12px; bottom:12px; }
    .cw[data-open] .cw__trigger{ opacity:0; pointer-events:none; }
  }
  @media (prefers-reduced-motion: reduce){
    .cw__trigger{ transition:none; }
    .cw__caret{ animation:none; }
  }
</style>
```

- [ ] **Step 4: Restyle the lightbox**

In `src/components/Lightbox.astro`, replace the entire `<style>…</style>` block with:

```css
<style>
  .lightbox{ position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; padding:clamp(12px, 5vw, 64px); }
  .lightbox[hidden]{ display:none; }
  .lightbox__backdrop{ position:absolute; inset:0; background:rgba(8, 8, 10, .92); }
  .lightbox__dialog{ position:relative; width:min(1100px, 100%); border:1px solid var(--hair-strong); background:var(--panel); }
  .lightbox__dialog::before{ content:"Program"; display:flex; align-items:center; height:var(--pane-head-h); padding:0 14px; background:var(--panel-head); border-bottom:1px solid var(--hair); font:600 12px/1 var(--font-ui); letter-spacing:.02em; text-transform:uppercase; color:var(--muted); }
  .lightbox__frame{ position:relative; width:100%; aspect-ratio:16 / 9; background:#000; }
  .lightbox__frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
  .lightbox__close{ position:absolute; top:0; right:0; width:var(--pane-head-h); height:var(--pane-head-h); display:grid; place-items:center; padding:0; font-size:22px; line-height:1; color:var(--muted); background:none; border:0; border-left:1px solid var(--hair); cursor:pointer; }
  .lightbox__close:hover{ color:var(--text); background:var(--lane); }
  .lightbox__close:focus-visible{ outline:2px solid var(--mango); outline-offset:-2px; }
</style>
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run build && npm test && npm run test:chat`
Expected: PASS, including `'smoke: index.html mounts the chat widget with trigger and starters'`.

- [ ] **Step 6: Verify in the browser**

Open the chat from the labelled trigger, click a starter (a real `/api/chat` call is fine on the dev server only if `ANTHROPIC_API_KEY` is set locally; otherwise confirm the error bubble renders styled). Do not complete the send-to-Jeremy flow. With the timeline bar visible, the trigger sits above it. Open Watch Sizzle: the lightbox shows a "Program" pane head with the close button in it; Esc closes. Detector clean on both files.

- [ ] **Step 7: Commit**

```bash
git add src/components/ChatWidget.astro src/components/Lightbox.astro tests/smoke.test.js
git commit -m "feat: chat widget and lightbox as flat panels"
```

---

### Task 13: Case-study page as source monitor and clip properties

**Files:**
- Modify: `src/pages/work/[id].astro` (frontmatter additions, markup and `<style>` replaced; JSON-LD objects unchanged)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `orderOnlineFirst`, `hasCaseStudy`, `mmss` (Task 2); `.pane-head`, `.props`, `.pbtn`, `.readout` (Task 3); `Lightbox` (`[data-video-embed]`).
- Produces: `/work/<id>` pages with `view-transition-name:work-<id>` on the player, prev/next clip links, no eyebrow and no side-tab quote.

- [ ] **Step 1: Write the failing test**

In `tests/smoke.test.js`, in `'smoke: case-study page has VideoObject, breadcrumb, content, and lightbox'` change `html.includes('Selected Work')` to `html.includes('Selected work')`. Then append:

```js
test('smoke: case study reads as source monitor + clip properties with prev/next', () => {
  const html = getHtml('work/shell-john-williams/index.html');
  assert.match(html, /<h1[^>]*>Shell × John Williams<\/h1>/, 'h1 is the project name');
  assert.ok(!html.includes('class="eyebrow"'), 'eyebrow is retired');
  assert.ok(!html.includes('border-left: 3px'), 'side-tab quote is retired');
  assert.ok(html.includes('Running time'), 'running time property renders');
  assert.ok(html.includes('07:17'), 'running time is the real duration');
  assert.ok(html.includes('rel="next"'), 'next clip link renders');
  const last = getHtml('work/ns-health-westray/index.html');
  assert.ok(last.includes('rel="prev"'), 'last case study links back');
  assert.ok(!last.includes('rel="next"'), 'last case study has no next link');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "Selected work" and "h1 is the project name".

- [ ] **Step 3: Extend the frontmatter**

In `src/pages/work/[id].astro`, add to the imports:

```ts
import { hasCaseStudy, mmss, orderOnlineFirst } from '../../lib/sequence';
```

Replace the body of `getStaticPaths` with:

```ts
  return projects
    .filter((p) => hasCaseStudy(p))
    .map((project) => ({ params: { id: project.id }, props: { project } }));
```

After `const subjects: string[] = content.subjects || [];` add:

```ts
const sequenceOrder = orderOnlineFirst(projects).filter((p) => hasCaseStudy(p));
const position = sequenceOrder.findIndex((p) => p.id === project.id);
const prev = position > 0 ? sequenceOrder[position - 1] : null;
const next = position >= 0 && position < sequenceOrder.length - 1 ? sequenceOrder[position + 1] : null;
const runningTime = typeof (project as any).duration_seconds === 'number' ? mmss((project as any).duration_seconds) : '';
```

- [ ] **Step 4: Replace the markup and styles**

Replace everything from `<main class="section--light case">` through the closing `</style>` with:

```astro
  <main class="case">
    <div class="case__head">
      <a class="case__back" href="/#work">← Selected work</a>
      <h1 class="case__title">{project.name}</h1>
      <p class="case__type">{project.type}</p>
    </div>

    <div class="case__grid">
      <section class="pane case__monitor" aria-label="Source monitor">
        <div class="pane-head"><span>Source</span><span class="readout">{project.client} · {project.year}</span></div>
        <div class="case__stage">
          <a
            class="case__player"
            href={watchUrl ?? '#'}
            target={watchUrl ? '_blank' : undefined}
            rel={watchUrl ? 'noopener' : undefined}
            data-video-embed={embed ?? undefined}
            data-video-title={`${project.name} · ${project.type}`}
            aria-label={`Play ${project.name}`}
            style={`view-transition-name:work-${project.id};background-image:url('${project.thumbnail}')`}
          >
            <span class="case__play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z" /></svg>Play</span>
          </a>
        </div>
      </section>

      <aside class="pane case__props-pane" aria-label="Clip properties">
        <div class="pane-head"><span>Properties</span></div>
        <dl class="props case__props">
          <dt>Client</dt><dd>{project.client}</dd>
          <dt>Year</dt><dd><span class="readout">{project.year}</span></dd>
          {runningTime && <><dt>Running time</dt><dd><span class="readout">{runningTime}</span></dd></>}
          {roleList.length > 0 && <><dt>Role</dt><dd>{roleList.join(', ')}</dd></>}
          {project.disciplines && <><dt>Disciplines</dt><dd>{project.disciplines}</dd></>}
          {mood && <><dt>Mood</dt><dd>{mood}</dd></>}
          {themes.length > 0 && <><dt>Themes</dt><dd>{themes.join(', ')}</dd></>}
          {subjects.length > 0 && <><dt>Subjects</dt><dd>{subjects.join(', ')}</dd></>}
        </dl>
      </aside>
    </div>

    <div class="case__body">
      {summary && <p class="case__summary">{summary}</p>}
      {excerpt && <blockquote class="case__quote"><p>{excerpt}</p></blockquote>}
      {watchUrl && platform && <a class="pbtn" href={watchUrl} target="_blank" rel="noopener">Watch on {platform}</a>}
    </div>

    <nav class="case__nav" aria-label="More work">
      {prev ? <a rel="prev" href={`/work/${prev.id}`}><span class="readout">Previous clip</span><span>{prev.name}</span></a> : <span></span>}
      {next && <a rel="next" href={`/work/${next.id}`}><span class="readout">Next clip</span><span>{next.name}</span></a>}
    </nav>
  </main>
  <Lightbox />
  <Footer />
</BaseLayout>

<style>
  .case{ max-width:1320px; margin:0 auto; padding:28px var(--pad) 80px; font-family:var(--font-ui); color:var(--text); }
  .case__head{ margin-bottom:22px; }
  .case__back{ font-size:13px; color:var(--muted); }
  .case__back:hover{ color:var(--text); text-decoration:underline; text-underline-offset:3px; }
  .case__title{ margin:14px 0 4px; font-family:var(--font-display); font-variation-settings:'wdth' 118; font-weight:800; font-size:clamp(30px, 5vw, 56px); line-height:1.02; }
  .case__type{ margin:0; font-size:15px; color:var(--muted); }

  .case__grid{ display:grid; grid-template-columns:minmax(0, 1fr) 340px; border:1px solid var(--hair); }
  .case__props-pane{ border-left:1px solid var(--hair); }
  .case__props{ padding:14px; }
  .case__stage{ padding:18px; background:var(--stage); }
  .case__player{ position:relative; display:block; aspect-ratio:16 / 9; background-size:cover; background-position:center; background-color:#000; outline:1px solid var(--hair-strong); }
  .case__play{ position:absolute; left:14px; bottom:14px; display:inline-flex; align-items:center; gap:8px; min-height:40px; padding:0 16px; background:var(--mango); color:var(--mango-ink); font-weight:600; font-size:14px; }
  .case__play svg{ width:14px; height:14px; fill:currentColor; }
  .case__player:hover .case__play{ background:var(--mango-hover); }

  .case__body{ max-width:70ch; margin:28px 0 0; }
  .case__summary{ margin:0 0 18px; font-size:clamp(17px, 2vw, 20px); line-height:1.6; }
  .case__quote{ margin:0 0 22px; padding:0; color:var(--muted); font-size:16px; line-height:1.6; }
  .case__quote p{ margin:0; }
  .case__quote p::before{ content:"“"; }
  .case__quote p::after{ content:"”"; }

  .case__nav{ display:flex; justify-content:space-between; gap:16px; margin-top:40px; padding-top:16px; border-top:1px solid var(--hair); }
  .case__nav a{ display:flex; flex-direction:column; gap:2px; font-weight:600; }
  .case__nav a[rel="next"]{ text-align:right; margin-left:auto; }
  .case__nav a:hover span:last-child{ text-decoration:underline; text-underline-offset:3px; text-decoration-color:var(--mango); }
  .case__nav .readout{ font-size:11px; font-weight:400; }

  @media (max-width: 900px){
    .case__grid{ grid-template-columns:1fr; }
    .case__props-pane{ border-left:0; border-top:1px solid var(--hair); }
    .case__stage{ padding:0; }
    .case__player{ outline:0; }
  }
</style>
```

Note `ns-health-westray` is last in `sequenceOrder` (the comparison and coming-soon projects are filtered out), which is what the test expects. If Task 1 recorded no running time for a project, its "Running time" row is simply absent.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS, including `'smoke: all six case-study pages are generated'` and the view-transition test.

- [ ] **Step 6: Verify in the browser**

From the Work bin click Shell: the thumbnail morphs into the source monitor; Play opens the lightbox; Next clip goes to Simbility. 390px: properties stack under the player; the Play chip sits bottom-left and does not cover the subject's face. Detector clean on `src/pages/work/[id].astro`.

- [ ] **Step 7: Commit**

```bash
git add "src/pages/work/[id].astro" tests/smoke.test.js
git commit -m "feat: case study as source monitor with clip properties and prev/next"
```

---

### Task 14: /reel and /mcp pages

**Files:**
- Modify (full rewrite): `src/components/Reel.astro`
- Modify: `src/pages/mcp.astro` (markup classes and `<style>`; frontmatter and content unchanged)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: `reel-index.json`, `mcp-manifest.json`; `.pane*`, `.bin*`, `.readout`, `.pbtn` (Task 3).
- Produces: `/reel` keeps `id="reel"` and `id="reel-index-data"`; `/mcp` keeps every tool name, the endpoint URL and the FAQPage JSON-LD.

- [ ] **Step 1: Write the failing test**

Append to `tests/smoke.test.js`:

```js
test('smoke: /reel is a styled program monitor, /mcp uses bins', () => {
  const reel = getHtml('reel/index.html');
  assert.ok(reel.includes('class="pane-head"'), 'reel page renders a pane head');
  assert.ok(reel.includes('youtube-nocookie.com/embed/Tl1n3hu4e8I'), 'reel embed uses the no-cookie host');
  const mcp = getHtml('mcp/index.html');
  assert.ok(mcp.includes('class="bin'), 'mcp page renders bins');
  assert.ok(!mcp.includes('class="eyebrow"'), 'mcp eyebrow is retired');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "reel page renders a pane head".

- [ ] **Step 3: Rewrite `src/components/Reel.astro`**

```astro
---
import reelIndex from '../data/reel-index.json';
---
<section id="reel" class="reel" aria-labelledby="reel-title">
  <div class="reel__head">
    <h1 id="reel-title" class="reel__title">Demo sizzle</h1>
    <a class="pbtn" href={reelIndex.reel_url} target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
  </div>
  <div class="pane reel__pane">
    <div class="pane-head"><span>Program</span><span class="readout">00:40</span></div>
    <div class="reel__stage">
      <div class="reel__frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${reelIndex.reel_youtube_id}?rel=0`}
          title="Jeremy Twogood demo sizzle"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
    </div>
  </div>

  <script id="reel-index-data" type="application/json" set:html={JSON.stringify(reelIndex)} />
</section>

<style>
  .reel{ max-width:1320px; margin:0 auto; padding:28px var(--pad) 80px; font-family:var(--font-ui); color:var(--text); }
  .reel__head{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
  .reel__title{ margin:0; font-family:var(--font-display); font-variation-settings:'wdth' 118; font-weight:800; font-size:clamp(28px, 4vw, 44px); line-height:1.05; }
  .reel__pane{ border:1px solid var(--hair); }
  .reel__stage{ padding:18px; background:var(--stage); }
  .reel__frame{ position:relative; aspect-ratio:16 / 9; background:#000; outline:1px solid var(--hair-strong); }
  .reel__frame iframe{ position:absolute; inset:0; width:100%; height:100%; border:0; }
  @media (max-width: 760px){ .reel__stage{ padding:0; } .reel__frame{ outline:0; } }
</style>
```

(The reel's 40-second length is already stated in `reel.astro`'s VideoObject `duration: 'PT40S'`, so `00:40` is a data-backed readout.)

- [ ] **Step 4: Restyle `src/pages/mcp.astro`**

Replace the `<main class="section--light mcp">` element and its contents with the same content wrapped as bins:
- `<main class="mcp">` → inside, one `<section class="bin mcp__intro">` with `<div class="bin__inner">`, a `<div class="bin__head"><h1 class="mcp__title">This website is an MCP server.</h1><span class="readout">Model Context Protocol</span></div>` and the existing lede `<p class="mcp__lede">…</p>` unchanged.
- Each existing `<section class="mcp__section">` becomes `<section class="bin mcp__section"><div class="bin__inner"><div class="bin__head"><h2>…same heading text…</h2></div> …same children… </div></section>`.
- Delete the `<span class="eyebrow">Model Context Protocol</span>` (its words move into the readout above).

Replace the page `<style>` block with:

```css
<style>
  .mcp{ font-family:var(--font-ui); }
  .mcp .bin{ padding-top:28px; padding-bottom:36px; }
  .mcp .bin__inner{ max-width:860px; }
  .mcp__title{ font-size:clamp(26px, 4vw, 40px) !important; font-variation-settings:'wdth' 118 !important; font-weight:800 !important; }
  .mcp__lede{ margin:0; max-width:62ch; font-size:17px; line-height:1.6; color:var(--muted); }
  .mcp__section p{ max-width:65ch; line-height:1.6; }
  .mcp__section a{ text-decoration:underline; text-decoration-color:var(--hair-strong); text-underline-offset:3px; }
  .mcp__code{ margin:0 0 12px; padding:12px 14px; overflow-x:auto; background:var(--stage); border:1px solid var(--hair); font-family:var(--font-readout); font-size:13px; color:var(--text); }
  .mcp__section code{ font-family:var(--font-readout); font-size:.9em; }
  .mcp__table{ width:100%; border-collapse:collapse; font-size:14px; }
  .mcp__table td{ padding:10px 14px 10px 0; border-top:1px solid var(--hair); vertical-align:top; line-height:1.5; }
  .mcp__table td:first-child{ white-space:nowrap; color:var(--mango); }
  .mcp__note{ font-size:14px; color:var(--muted); }
  .mcp__faq{ padding:12px 0; border-top:1px solid var(--hair); }
  .mcp__faq summary{ cursor:pointer; font-weight:600; }
  .mcp__faq p{ margin:10px 0 0; color:var(--muted); }
  @media (max-width: 560px){ .mcp__table td:first-child{ white-space:normal; } }
</style>
```

(`.mcp__table td:first-child` in mango is the one accent on that page: tool names are the page's primary actionable items.)

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm run build && npm test`
Expected: PASS, including `'smoke: /reel/index.html exists with VideoObject JSON-LD'`, `'/mcp page exists and lists every manifest tool'`, `'/mcp page has FAQPage JSON-LD'`.

- [ ] **Step 6: Verify in the browser**

`/reel` and `/mcp` at 1440 and 390, no horizontal page scroll (code blocks scroll inside themselves). Detector clean on both files.

- [ ] **Step 7: Commit**

```bash
git add src/components/Reel.astro src/pages/mcp.astro tests/smoke.test.js
git commit -m "feat: reel and MCP pages in the panel system"
```

---

### Task 15: Remove the old system and pass the detector

**Files:**
- Modify (full rewrite): `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro` (font link)
- Modify: `.impeccable/config.json` (narrow ignore, via the CLI)
- Test: `tests/smoke.test.js`

**Interfaces:**
- Consumes: every task above (all consumers of old classes are gone).
- Produces: the final `global.css`; no Syne, Inter, Montserrat or JetBrains Mono requests.

- [ ] **Step 1: Write the failing test**

Append to `tests/smoke.test.js`:

```js
test('smoke: the old visual system is fully removed', () => {
  const css = getBundledCss();
  for (const old of ['--dark-bg', '--light-bg', '--amber', '.section-title', '.eyebrow', '.hero', '.work-card', '.grain']) {
    assert.ok(!css.includes(old), `old CSS ${old} must be gone`);
  }
  const html = getHtml('index.html');
  for (const family of ['family=Syne', 'family=Inter', 'family=Montserrat', 'family=JetBrains']) {
    assert.ok(!html.includes(family), `${family} must no longer load`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/smoke.test.js`
Expected: FAIL on "old CSS --dark-bg must be gone".

- [ ] **Step 3: Confirm nothing still uses old classes or tokens**

Run:

```bash
grep -rnE "var\(--(dark-|light-|amber|display|body|mono)|class=\"[^\"]*(section--|section-head|section-title|eyebrow|hero|work-card|build-card|client-list|grain|divider|nav__)" src --include=*.astro --include=*.ts | grep -v "src/pages/og-image.astro\|src/pages/logo-\|src/components/LogoBrand.astro"
```

Expected: no output. Fix any hit by switching it to the new tokens/classes before continuing.

The logo is a brand commitment and must look exactly as it does today, but it reads tokens that are about to disappear. Make it self-contained:
- `src/components/LogoBrand.astro`: replace `fill="var(--amber)"` with `fill="#c8922a"`, `color: var(--amber);` with `color: #c8922a;`, and `font-family: var(--display, 'Syne', sans-serif);` with `font-family: 'Syne', sans-serif;`. Add at the top of its `<style>` block: `@font-face { font-family: 'Syne'; src: url('/assets/Syne-Bold.ttf') format('truetype'); font-weight: 700; font-display: swap; }`.
- `src/pages/logo-preview.astro`: replace the inline `var(--light-bg)` with `#f4f1ec`, `var(--dark-bg)` with `#111111`, `var(--light-mute)` with `#6b6b63`, `var(--dark-mute)` with `#888880`, and `var(--mono)` with `'Barlow', sans-serif`.
- Re-run the grep without the exclusion to confirm only `og-image.astro` (which renders with its own styles) remains, then compare `/logo-preview` before and after in the browser.

- [ ] **Step 4: Replace `src/styles/global.css`**

Rewrite the file so it contains, in order and nothing else:
1. The whole `/* ========== Open Sequence (facelift) ========== */` … `/* ========== end Open Sequence ========== */` block as it stands after Task 6 (tokens, `.pane`, `.pane-head`, `.bin*`, `.readout`, `.pbtn*`, `.props`, `section[id]` scroll margin, work-item block).
2. This base block, directly after the tokens `:root{}`:

```css
*{ box-sizing:border-box; }
html{ overflow-x:clip; scroll-behavior:smooth; background:var(--panel); scrollbar-color:var(--hair-strong) var(--panel); }
body{
  margin:0; overflow-x:clip;
  font-family:var(--font-ui); font-size:15px; line-height:1.5;
  background:var(--panel); color:var(--text);
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
}
img, video{ display:block; max-width:100%; }
a{ color:inherit; text-decoration:none; }
button{ font:inherit; color:inherit; }
::selection{ background:var(--mango); color:var(--mango-ink); }
:focus-visible{ outline:2px solid var(--mango); outline-offset:2px; }
@media (prefers-reduced-motion: reduce){ html{ scroll-behavior:auto; } }
```

3. The view-transition rules, unchanged from the old file:

```css
@view-transition{ navigation:auto; }
@media (prefers-reduced-motion: reduce){
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*){ animation:none !important; }
}
```

Everything else from the old file is deleted.

- [ ] **Step 5: Drop the old fonts**

In `src/layouts/BaseLayout.astro`, set the Google Fonts link to:

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Barlow:wght@400;500;600&family=Martian+Mono:wdth,wght@75..112.5,100..800&display=swap" rel="stylesheet" />
```

- [ ] **Step 6: Run tests**

Run: `npm run build && npm test && npm run test:ui && npm run test:api`
Expected: PASS.

- [ ] **Step 7: Run the detector on source and on the rendered pages**

```bash
.claude/skills/impeccable/scripts/impeccable detect src/
npm run preview -- --port 4390 &
sleep 4
for p in / /work/shell-john-williams /ai-builds /reel /mcp; do .claude/skills/impeccable/scripts/impeccable detect "http://localhost:4390$p"; done
kill %1
```

Expected: zero findings except these sanctioned ones, which get a narrow ignore each with a reason:

```bash
.claude/skills/impeccable/scripts/impeccable hooks ignore-value repeating-stripes-gradient "repeating-linear-gradient(135deg" --reason "facelift plan: offline-media hatch is a clip state code on chrome (DESIGN.md Media Colour Rule), never over footage"
```

Fix every other finding in the component that produced it, re-run the build and detector once, and stop.

- [ ] **Step 8: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/LogoBrand.astro src/pages/logo-preview.astro .impeccable/config.json tests/smoke.test.js
git commit -m "chore: remove the old visual system; detector clean"
```

---

### Task 16: Finish review, DESIGN.md and handoff to Phase 3

**Files:**
- Create: `scripts/capture-review.mjs`
- Create: `.impeccable/review/desktop.png`, `mobile.png`, `case-desktop.png`, `case-mobile.png` (committed as review evidence)
- Modify: `DESIGN.md`, `.impeccable/design.json` (written by the documenter agent)
- Modify: `docs/superpowers/specs/2026-09-14-facelift-design.md` (Phase 2 outcome)

**Interfaces:**
- Consumes: the finished build; `.impeccable/surfaces/src-pages-index-astro.md` (direction contract); `.claude/skills/impeccable/reference/craft-floor.md`.
- Produces: finish-review verdict, final DESIGN.md with real tokens, `.impeccable/design.json`.

- [ ] **Step 1: Write the capture script**

Create `scripts/capture-review.mjs`:

```js
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
  await page.screenshot({ path: `${out}/${s.file}`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${s.file}: horizontal overflow ${overflow}px`);
  await page.close();
}
await browser.close();
```

- [ ] **Step 2: Capture and validate**

```bash
npm run build && (npm run preview -- --port 4390 &) && sleep 4
node scripts/capture-review.mjs http://localhost:4390
```

Expected: four PNGs, each line reporting `horizontal overflow 0px`. Open each PNG with Read and confirm it shows what its name claims (no blank regions, suite visible at the top of `desktop.png`, stacked clip rows in `mobile.png`). Recapture any invalid file before continuing.

- [ ] **Step 3: Spawn the finish reviewer**

Spawn the `impeccable-finish-reviewer` agent fresh (no conversation history) with this packet:
- Original request: make jeremytwogood.com stop looking AI-generated; direction The Open Sequence.
- Confirmed answers: everything under "Decisions carried from Phase 1" in this plan, plus the Global Constraints.
- Artifact: `src/` on branch `facelift`; live preview at `http://localhost:4390`.
- Screenshots (all required): `.impeccable/review/desktop.png`, `mobile.png`, `case-desktop.png`, `case-mobile.png`.
- Direction contract: `.impeccable/surfaces/src-pages-index-astro.md`.
- Critique reference (code-led build, no approved comp): the approved prototype `.impeccable/mocks/proto/seq.html`; baseline critique `.impeccable/critique/2026-09-14T17-47-18Z__src-pages-index-astro.md`.
- Hook findings: the detector output from Task 15 Step 7.
- Craft floor: `.claude/skills/impeccable/reference/craft-floor.md`.

Wait for its five-section return. Act on the disposition word:
- `ship`: continue to Step 4.
- `fix`: apply the material fixes in one batch, rebuild, recapture the same four files, send them back to the same reviewer for a verdict; at most two rounds, then put any open items in front of Jeremy.
- `recapture`: recapture per its list and request a full review again.
- `rebuild`: re-derive the named regions, recapture, fresh full review; ask Jeremy before a second rebuild.

- [ ] **Step 4: Spawn the documenter**

Spawn the `impeccable-documenter` agent with: project root `/Users/romer/Documents/Claude/Website`, artifact `src/`, the direction contract path, `PRODUCT.md`, `.claude/skills/impeccable/reference/document.md`, and write boundary `DESIGN.md` + `.impeccable/design.json` only. It must remove the `<!-- SEED -->` marker, record real tokens from `global.css`, and document the Caveat exception (Thales hint only) and the offline-hatch exception.

Verify both files exist and `DESIGN.md` frontmatter lists `colors`, `typography`, `rounded`, `spacing`, `components`.

- [ ] **Step 5: Record the outcome**

Append to `docs/superpowers/specs/2026-09-14-facelift-design.md`:

```markdown
## Phase 2 outcome

- Plan: `docs/superpowers/plans/2026-09-14-facelift-phase-2.md`, executed on `facelift`.
- Finish review disposition: <the reviewer's word> (<date>), screenshots in `.impeccable/review/`.
- Detector: <count> findings on `src/` and the five rendered pages; sanctioned ignores listed in `.impeccable/config.json`.
- DESIGN.md carbonized from the build by the documenter.
- Next: Phase 3 (live-mode tweaks with Jeremy, `/impeccable audit`, `/impeccable polish`, merge to `main` after checking divergence both ways, deploy, verify production) before 2026-09-19.
```

Fill the three angle-bracket values from Steps 3 and 4 before committing (they are run outputs, not placeholders to leave).

- [ ] **Step 6: Run the full suite one last time**

Run: `npm run build && npm test && npm run test:ui && npm run test:api`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/capture-review.mjs .impeccable/review DESIGN.md .impeccable/design.json docs/superpowers/specs/2026-09-14-facelift-design.md
git commit -m "docs: finish review, DESIGN.md from the build, Phase 2 outcome"
```

---

## Out of scope for Phase 2 (Phase 3 or later)

- `/impeccable live` element tweaks with Jeremy, `/impeccable audit`, `/impeccable polish`.
- Merge to `main`, Vercel deploy, production verification.
- Compressing `portrait.jpg` (3 MB) and `caot-thumb-1.png` (7.4 MB).
- OG image restyle.
- Case-study body copy beyond the existing summary (the critique's "what Jeremy did" beat needs new copy from Jeremy).
