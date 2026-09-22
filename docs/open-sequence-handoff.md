# Open Sequence: handoff (for Codex or any agent)

Last updated 2026-09-17. This is the single file to read before touching the Open Sequence build.

## Current local work

`codex/portfolio-entry-polish` builds on the Sound grid fix (`703e14c`) and adds Jeremy's requested clearer entry, clean preview cuts, and larger grading comparison. It is a local review draft, not merged into `facelift` or `main`, and not deployed.

- New introduction at `#top` gives visitors identity, a real work still, and “Explore the edit” into the existing suite at `#edit`. Watch Sizzle remains available immediately. Classic is unchanged; a combined Classic-first routing scheme is not implemented.
- All seven sequence previews use complete shots cut on source edits. `docs/preview-cuts.md` records exact frame ranges, provenance, and export instructions. The monitor holds outgoing footage during loading instead of flashing an unrelated poster, including paused selections. Full project durations and the full Thales comparison are unchanged.
- The grading comparison spans two Work columns, with a responsive, unclipped “Slide me!” hint, keyboard controls, touch dragging, and paused reduced-motion behavior.
- Sound is two columns on desktop and one at 760px and below, with a browser regression test.

Validation on 2026-09-17: build and all 151 tests passed (77 smoke/data, 22 UI, 52 API/chat). Browser review covered 1440px through 320px with no horizontal overflow, 390px without JavaScript, reduced motion, delayed media loading, paused/rapid clip selections, and natural end-of-clip advancement. The comparison retains its thumbnail until both paused frames load. Desktop/phone appearance still needs Jeremy's taste review.

## The two sites

| Name | What it is | Where it lives | Status |
|---|---|---|---|
| **Classic** | The current live jeremytwogood.com (dark/amber, Syne headings, card grid, scroll timeline bar) | branch `main` on GitHub (`origin/main`, b52eac9); tag `classic-2026-09` | Live in production on Vercel. Best fit for **producer** roles. |
| **Open Sequence** | The facelift: the site as a video editor's working screen (bins, program monitor, V1/A1 timeline, panel bins below) | branch `facelift`; save point tag `open-sequence-v1` (595ef36) | Complete V1, not live. Best fit for **editor** roles. |

`facelift` contains all of Classic's history plus 25 commits, so the data, API, MCP server and chat are the same in both. Only the visual layer differs.

## Hot swapping which site is live

Vercel serves production from `main`. Every pushed branch gets its own preview deployment.

- **Show someone Open Sequence without going live:** send the `facelift` branch preview URL (Vercel dashboard → project `jeremytwogood-site` → Deployments → the `facelift` build). If Vercel Deployment Protection is on for previews, the link asks visitors to log in to Vercel. Turn protection off for previews (Settings → Deployment Protection) before sending it to an employer, or add a domain such as `edit.jeremytwogood.com` to the `facelift` branch (a CNAME record at Wix, where DNS is hosted).
- **Swap production to Open Sequence:** Deployments → the `facelift` deployment → ⋯ → Promote to Production. It's instant, with no rebuild.
- **Swap back to Classic:** promote the latest `main` production deployment again (or use Instant Rollback).
- **Caveat:** the next push to `main` redeploys Classic to production automatically. The permanent switch is merging `facelift` into `main` (Phase 3 below).

## Run it locally

```
git checkout codex/portfolio-entry-polish  # current local review; facelift is the earlier V1
npm install
npm run dev              # http://localhost:4321
npm run build && npm test && npm run test:ui && npm run test:api
```

`npm run build` rewrites the `generated_at` timestamp in `public/agent-data.json`. If that is the only diff, discard it (`git checkout -- public/agent-data.json`) and don't commit timestamp-only churn.

## Where things are

- Design authority: `DESIGN.md` (tokens, rules, exceptions, written from the build), `.impeccable/design.json`, `.impeccable/surfaces/src-pages-index-astro.md` (direction contract), spec `docs/superpowers/specs/2026-09-14-facelift-design.md`, plan `docs/superpowers/plans/2026-09-14-facelift-phase-2.md`.
- Styles: `src/styles/global.css` (tokens + shared primitives `.pane`, `.pane-head`, `.bin*`, `.readout`, `.pbtn*`, `.props`, `.work-item*`).
- First viewport: `src/components/Introduction.astro`; the editing suite at `#edit`: `src/components/suite/` (Suite, BinsPane, ProgramMonitor, InfoPane, Sequence) + `src/scripts/sequence-player.ts`; layout math in `src/lib/sequence.ts` (unit-tested in `tests/sequence.test.ts`), loop lookup in `src/lib/media.ts`.
- Bins below: `src/components/{Projects,ComparisonCard,About,BuildsList,AIBuilds,Sound,Contact}.astro`; chrome: `Nav`, `Footer`, `TimelineBar`, `ChatWidget`, `Lightbox`.
- Pages: `src/pages/index.astro`, `work/[id].astro`, `ai-builds.astro`, `reel.astro`, `mcp.astro`.
- Data: `src/data/*.json` (projects, profile, ai-builds, reel-index, waveforms, video-content, resume).
- Review screenshots: `.impeccable/review/*.png` (regenerate with `node scripts/capture-review.mjs http://localhost:4390` against `npm run preview -- --port 4390`).
- Design detector: `.claude/skills/impeccable/scripts/impeccable detect --no-advisory src/` (exit 0 at 595ef36; its engine binary is gitignored, so it exists only on Jeremy's Mac).
- Full build history, every decision and why: `.superpowers/sdd/2026-09-14-facelift-phase-2/progress.md` (gitignored; on Jeremy's Mac only).

## Rules that bind any change

- Colours only from the tokens. One warm accent (mango `#f4a23b`) for the playhead, the active tab, the primary action, the wordmark period, the transport timecode and the current-clip ring. Teal = video, green = audio, red hatch = offline media.
- No shadows, glows, gradients, blur, eyebrow labels over headings, or coloured side borders. Square corners (clips 2px).
- Monospace (Martian Mono) only for measured values: timecode, durations, counts, years, coordinates. Archivo for the name, bin headings and display lines; Barlow for everything else. Nothing functional below 11px.
- Footage untouched: no tints or washes on stills and video.
- Every timecode and duration comes from data. A clip without `duration_seconds` shows no time. Ruler labels and the transport timecode stay hidden until every online clip has a duration.
- Must work without JavaScript, under reduced motion, and at 390px with no horizontal scroll.
- Do not touch agent surfaces unless on purpose: `api/`, `public/llms.txt`, `.well-known`, JSON-LD blocks, the MCP discovery comment, the `agent-data.json` pipeline.
- Body copy stays Jeremy's words.

## Open work, in priority order

1. **Data from Jeremy:** `duration_seconds` for `simbility-desk-series` and `thales-rcn` in `src/data/projects.json`. This turns the timeline ruler labels and running timecode back on.
2. **Entry review:** Jeremy to review the local hero-first draft before deciding whether a separate landing page or Classic-first entry is preferable. Sound grid regression is fixed locally (`703e14c`).
3. **Mixed type in head strips:** in the INFO pane, About and Contact heads, the mono readout runs look optically larger than the Barlow beside them, and the About head's dot spacing mixes both faces. Shrink or retune the mono run.
4. **Production Intelligence** row shows a logo on a white square (`/assets/rome-brone.svg`): decide on a real capture or a treatment.
5. **Burned-in monitor timecode:** left out on purpose ("footage untouched"), but that reason is applied inconsistently, so it's a taste call.
6. **Agent-data anchors:** `scripts/build-agent-data.js` publishes `/#hero` and `/#projects`, which exist on neither site. Also harden `set:html` escaping on JSON-LD blocks.
7. **Small polish:** the reel `00:40` literal should derive from data; `--chat-trigger-w` values are hand-measured; detector residuals `cramped-padding` on `.seq__head` and `line-length` in the /mcp tool table; broader smoke tests (JSON-LD on every page, a preview clip with no duration).
8. **Phase 3 (when ready to go live):** live tweaks, an accessibility and polish audit, then merge `facelift` into `main`. Check divergence both ways first: `git log main..facelift` and `git log facelift..main`. Then deploy and verify production: chat, MCP endpoint, waveforms, lightbox, View Transitions, Thales slider.

## Working conventions

- Branch per change off `facelift`; small commits; run the full test command before each commit.
- Verify visually with Playwright screenshots at 1440x900 and 390x844 (`require('playwright')` from the repo's node_modules), then look at them.
- Never merge to `main` or push to production without Jeremy saying so.
