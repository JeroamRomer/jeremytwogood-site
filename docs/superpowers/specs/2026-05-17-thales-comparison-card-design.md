# Thales Comparison Card — Design Spec
**Date:** 2026-05-17
**Status:** Approved

---

## Overview

Add an 8th entry to the Selected Work section for the Thales Canada RCN internal video (2021). Because the project is confidential and can't be linked publicly, it showcases Jeremy's colour grading work via an interactive before/after slider. The card is full-width (span-6) and sits as a new 4th row at the bottom of the work grid.

---

## Data Model

New entry appended to `src/data/projects.json`:

```json
{
  "name": "Thales Canada · RCN",
  "client": "Thales Canada",
  "type": "Full Post-Production",
  "disciplines": "Motion Graphics · Titles · Audio Mix · Colour Grade",
  "year": 2021,
  "span": 6,
  "thumbnail": "/assets/thales-thumb.jpg",
  "comparison": true,
  "graded_src": "/assets/thales-graded.mp4",
  "ungraded_src": "/assets/thales-ungraded.mp4"
}
```

New optional fields (`comparison`, `graded_src`, `ungraded_src`, `disciplines`) are ignored by the standard card renderer. All existing project entries are unchanged.

---

## Component Architecture

**New file:** `src/components/ComparisonCard.astro`

A single-file Astro component with three internal sections:

### HTML structure
- Root element is a `<div>` (not `<a>` — no external link) with classes `work-card span-6`
- Two `<video autoplay={false} loop muted playsinline>` elements stacked absolutely, filling the card
  - Bottom layer: `thales-ungraded.mp4` (camera original — left/full-width base)
  - Top layer: `thales-graded.mp4` (colour graded — right side, clipped by slider)
- Slider `<div>` — a vertical line with a circular drag handle centred at 50%
- Two floating pill labels flanking the handle:
  - Left: "Camera Original →" (muted white)
  - Right: "← Colour Graded" (amber)
- "drag to compare" hint text below the handle
- Bottom meta overlay (matches existing card pattern):
  - Left: project name, type line (amber), disciplines sub-line (muted)
  - Right: year
- Static thumbnail `<img>` absolutely positioned on top of everything, fades out on hover

### CSS (scoped `<style>`)
- All slider-specific styles scoped to this component — no bleed into `global.css`
- Thumbnail fade: `opacity: 1` → `opacity: 0` on `.work-card:hover`, `transition: opacity 300ms`
- Slider position driven by CSS custom property `--pct` (default `50`, range 0–100):
  - Ungraded video fills the full card (base layer, no clipping)
  - Graded video sits on top, clipped on its left edge: `clip-path: inset(0 0 0 calc((100 - var(--pct)) * 1%))` — at `--pct: 50` the graded layer shows the right 50%; dragging right increases `--pct`, revealing more of the grade
  - Slider line and handle: `transform: translateX(calc(var(--pct) * 1%))` relative to card width
- Slider overlay (handle, pills, drag hint) has `opacity: 0` at idle, `opacity: 1` on `.work-card:hover`
- Cursor `ew-resize` on the card

### JavaScript (`<script>`)
1. **Hover play/pause** — `mouseenter` calls `video.play()` on both; `mouseleave` calls `video.pause()` on both and resets `--pct` to `50`
2. **Drag** — `pointerdown` on card starts drag; `pointermove` on document computes `pct = clamp((x - cardLeft) / cardWidth * 100, 0, 100)` and sets `el.style.setProperty('--pct', pct)`; `pointerup` ends drag
3. **Init** — sets `--pct: 50` on mount

---

## Projects.astro Changes

1. Import `ComparisonCard` at top of frontmatter
2. In the `.map()` branch:
   ```astro
   {project.comparison
     ? <ComparisonCard project={project} index={idx} />
     : <a class="work-card …"> … </a>
   }
   ```
3. Section header count: `07 Projects` → `08 Projects` (year range `2016—2026` unchanged)
4. `stillClasses` array: add `'still-1'` at index 7 (placeholder — not used by comparison card)

---

## Assets

All assets already in `public/assets/`:
- `thales-thumb.jpg` — static thumbnail (875 KB)
- `thales-graded.mp4` — colour graded clip, 720p H.264 (2.8 MB)
- `thales-ungraded.mp4` — camera original clip, 720p H.264 (1.6 MB)

---

## Interaction Summary

| State | Behaviour |
|-------|-----------|
| Idle | Thumbnail visible, videos paused, slider hidden |
| Hover in | Thumbnail fades out (300ms), both videos play, slider visible at 50% |
| Dragging | `--pct` updates in real time; graded clip clips from left; ungraded fills remainder |
| Hover out | Thumbnail fades back in, videos pause, slider resets to 50% |

- Slider defaults to 50% on every hover (always a fresh start)
- Ungraded (camera original) on left; graded on right
- No click/link behaviour — cursor is `ew-resize`
- Works with both mouse and touch via Pointer Events API

---

## Out of Scope

- No lightbox or full-screen mode
- No audio (both videos are muted)
- No synchronisation logic between the two video elements (they start together on hover and drift is imperceptible for a looping clip)
