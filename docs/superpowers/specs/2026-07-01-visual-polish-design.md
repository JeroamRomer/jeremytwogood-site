# Visual Polish Package — Design

**Date:** 2026-07-01
**Status:** Approved by Jeremy (chat session)

## Goal

Add a layer of visual craft to jeremytwogood.com: three showpiece features plus two quiet accents, all leaning into the video-editor identity (timecode, playheads, waveforms). Everything is progressive enhancement on the existing multi-page Astro site — no new runtime dependencies, no client-side router.

Chosen via interactive demos: card→case-study morph, NLE scroll timeline, real-waveform Sound section, scroll-in section reveals, hover timecodes. Rejected: film-leader intro, hero headline rise, magnetic CTAs, ClientRouter approach, GSAP/Lenis approach.

## Architecture principle

Progressive-enhancement MPA. The site remains plain multi-page Astro (v6). Features are independent modules; any one can fail or be unsupported without affecting the others or the current behavior. No feature changes how existing inline scripts run.

## 1. Card → case-study morph (native View Transitions)

- `BaseLayout.astro` head CSS gains `@view-transition { navigation: auto; }`.
- Each work card's still in `Projects.astro` gets `view-transition-name: work-<projectId>` (unique per card, only for cards that link to case-study pages).
- The case-study hero media block in `src/pages/work/[id].astro` gets the matching `view-transition-name: work-<projectId>`.
- Result: navigating card → case study morphs the thumbnail into the hero; browser Back reverses it. Rest of the page cross-fades (default root transition).
- Firefox / unsupported browsers: instant navigation exactly as today. No JS involved.
- `prefers-reduced-motion: reduce` disables all view-transition animations via CSS.

## 2. NLE scroll timeline (homepage only)

New component `src/components/TimelineBar.astro`, mounted only on `index.astro`.

- Fixed full-width bar at viewport bottom, ~40px tall, dark (`#0a0a09`), top border `--dark-rule`.
- Contents: one "clip" segment per homepage section (Hero, Work, About, AI Builds, Sound, Contact) with small mono uppercase labels; amber playhead line with triangle head; timecode chip (right-aligned, mono, amber) counting at 24 fps against a nominal 60-second program duration mapped to full page scroll.
- Segment widths proportional to real section heights, measured on load and resize.
- One rAF-throttled passive scroll listener updates playhead position, timecode text, and active-clip highlight (active clip: amber label + subtly lighter background).
- Interaction: click or drag on the bar scrubs — maps x-position to document scroll (smooth scroll on click, direct on drag).
- Visibility: hidden until the user scrolls past ~50% of the hero, then fades in; fades out when back at top. Keeps the landing view clean.
- Chat widget: the floating chat button's bottom offset increases by the bar height whenever the bar is visible (CSS class toggle), so they never overlap.
- Mobile (<720px): bar not rendered/displayed at all.
- Reduced motion: bar still tracks scroll (scroll-linked positioning is fine), but fade-in/out transitions removed.

## 3. Waveform Sound section

**Build-time data:**
- New script `scripts/build-waveforms.mjs` (run manually, not in the build pipeline): reads audio files from gitignored `design-sources/audio/`, maps files to tracks in `profile.json` by a small filename→track mapping inside the script, decodes via `ffmpeg` CLI to raw PCM, computes ~96 normalized peak buckets per track (0–1, 2 decimals), writes `src/data/waveforms.json` (committed, a few KB).
- Jeremy supplies the audio files/exports for the SoundCloud tracks into `design-sources/audio/`.

**Rendering (`Sound.astro`):**
- Each track row gains an SVG waveform strip (~36px tall) beneath the title line, server-rendered as `<rect>` bars from `waveforms.json`. Idle state: dim (`#3a3835`-family).
- Tracks with no entry in `waveforms.json` render exactly as today (graceful fallback).

**Playback sync:**
- Existing behavior kept: clicking a track loads the SoundCloud iframe player.
- Enhancement: SoundCloud Widget API script (`https://w.soundcloud.com/player/api.js`) is loaded lazily on first track click; bind `PLAY_PROGRESS` / `PAUSE` / `FINISH` events. The playing track's bars light amber up to the playhead position, with a thin playhead line synced to real audio progress. Pause holds position; finish resets.
- If the Widget API fails to load, playback works as today and waveforms stay idle-styled.

## 4. Quiet accents

**Scroll-in section reveals (site-wide):**
- One shared IntersectionObserver module in `BaseLayout.astro` adds `.is-inview` to section headers (`.section-head` / eyebrow + title groups) as they enter the viewport (~threshold 0.3, fire once per element).
- CSS transitions: eyebrow tick draws from 0→24px width; section title rises ~18px with fade. Easing matches existing `cubic-bezier(.22,1,.36,1)` family used by rainbow-rule/brand animations.
- Reduced motion: opacity-only fade (no translate).

**Hover timecodes (work cards):**
- Work cards already play muted preview loops on hover (`Projects.astro`). Add a small chip (top-right corner area, mono, amber, blinking record dot) that displays the loop's actual `video.currentTime` formatted as `00:MM:SS:FF` at 24 fps, updated via rAF while hovering; hidden and cancelled on mouse leave.
- Touch devices / cards without loops: chip never appears.

## 5. Cross-cutting

- **Reduced motion:** every feature has an explicit `prefers-reduced-motion` story (see per-feature notes).
- **Performance budget:** ~+5KB JS total across modules, +~3KB JSON, zero new npm dependencies, no new fonts, no layout shift (timeline bar overlays content; nothing pushes).
- **Files touched:** `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Projects.astro`, `src/pages/work/[id].astro`, `src/components/Sound.astro`; new: `src/components/TimelineBar.astro`, `scripts/build-waveforms.mjs`, `src/data/waveforms.json`.
- **Verification:** `npm run build` passes; existing smoke tests pass; preview-server pass over every interaction (morph nav both directions, timeline scrub, waveform sync with live SoundCloud playback, reveals, hover timecode) including reduced-motion emulation and mobile viewport.

## Out of scope

- Film-leader intro, hero headline rise, magnetic CTAs (rejected in brainstorming).
- Any change to chat widget behavior beyond the bottom-offset accommodation.
- Compressing heavy stills (`portrait.jpg`, `caot-thumb-1.png`) — separate deferred task.
