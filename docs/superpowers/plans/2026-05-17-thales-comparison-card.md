# Thales Comparison Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-width before/after colour-grade slider card for Thales Canada to the Selected Work section.

**Architecture:** New `ComparisonCard.astro` component with self-contained HTML/CSS/JS. `Projects.astro` detects `project.comparison === true` and renders `ComparisonCard` instead of the standard `<a>` card. The slider is driven by a `--pct` CSS custom property updated on pointer drag.

**Tech Stack:** Astro 6.x, vanilla CSS (scoped), vanilla JS (Pointer Events API), H.264 MP4 video

---

## File Map

| Action | File | What changes |
|--------|------|--------------|
| Modify | `src/styles/global.css` | Add `.work-card.span-6` rule + mobile override |
| Modify | `src/data/projects.json` | Append Thales entry |
| Create | `src/components/ComparisonCard.astro` | New comparison card component |
| Modify | `src/components/Projects.astro` | Import, branch, count update |

---

## Task 1: Add `span-6` to global.css

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Open `src/styles/global.css` and find the span class block (around line 435)**

Look for:
```css
.work-card.span-3{ grid-column:span 3; }
.work-card.span-2{ grid-column:span 2; }
.work-card.span-4{ grid-column:span 4; aspect-ratio:16/9; }
```

- [ ] **Step 2: Add span-6 rule after the existing span rules**

```css
.work-card.span-3{ grid-column:span 3; }
.work-card.span-2{ grid-column:span 2; }
.work-card.span-4{ grid-column:span 4; aspect-ratio:16/9; }
.work-card.span-6{ grid-column:span 6; }
```

- [ ] **Step 3: Find the mobile media query (around line 439) and add span-6 to the collapse rule**

Before:
```css
@media (max-width: 900px){
  .work-grid{ grid-template-columns:1fr; }
  .work-card, .work-card.span-3, .work-card.span-2, .work-card.span-4{
    grid-column:span 1; aspect-ratio:16/9;
  }
}
```

After:
```css
@media (max-width: 900px){
  .work-grid{ grid-template-columns:1fr; }
  .work-card, .work-card.span-3, .work-card.span-2, .work-card.span-4, .work-card.span-6{
    grid-column:span 1; aspect-ratio:16/9;
  }
}
```

- [ ] **Step 4: Verify dev server still runs**

Run: `npm run dev` (if not already running)
Expected: No errors in terminal, http://localhost:4321 loads

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add span-6 grid class for full-width work card"
```

---

## Task 2: Add Thales entry to projects.json

**Files:**
- Modify: `src/data/projects.json`

- [ ] **Step 1: Open `src/data/projects.json` and append the Thales entry as the last item in the array**

The current last entry ends with `"span": 2` followed by `}` then `]`. Replace the closing `]` with:

```json
  },
  {
    "id": "thales-rcn",
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
]
```

- [ ] **Step 2: Verify JSON is valid**

Run:
```bash
node -e "require('./src/data/projects.json'); console.log('valid')"
```
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add src/data/projects.json
git commit -m "data: add Thales Canada RCN comparison card entry"
```

---

## Task 3: Create ComparisonCard.astro

**Files:**
- Create: `src/components/ComparisonCard.astro`

- [ ] **Step 1: Create the file with this exact content**

```astro
---
interface Props {
  project: {
    name: string;
    type: string;
    disciplines: string;
    year: number;
    thumbnail: string;
    graded_src: string;
    ungraded_src: string;
  };
  index: string;
}
const { project, index } = Astro.props;
const uid = `cc-${Math.random().toString(36).slice(2, 7)}`;
---

<div
  id={uid}
  class="work-card span-6 comparison-card"
  role="img"
  aria-label={`${project.name} — ${project.type}, ${project.year}. Drag to compare colour grades.`}
>
  <!-- Base layer: ungraded (camera original), full width -->
  <video class="cc-video cc-video--ungraded" src={project.ungraded_src} loop muted playsinline preload="none"></video>

  <!-- Top layer: graded, clipped from left by --pct-inv -->
  <video class="cc-video cc-video--graded" src={project.graded_src} loop muted playsinline preload="none"></video>

  <!-- Slider overlay: line + handle + pills + hint -->
  <div class="cc-slider" aria-hidden="true">
    <div class="cc-slider__line">
      <div class="cc-slider__handle">⇔</div>
      <div class="cc-slider__pill cc-slider__pill--left">Camera Original →</div>
      <div class="cc-slider__pill cc-slider__pill--right">← Colour Graded</div>
    </div>
    <div class="cc-slider__hint">drag to compare</div>
  </div>

  <!-- Static thumbnail — sits on top, fades out on hover -->
  <img class="cc-thumb" src={project.thumbnail} alt="" aria-hidden="true" />

  <!-- Veil gradient for meta readability -->
  <div class="work-card__veil"></div>

  <!-- Index + corner accent (matches existing cards) -->
  <span class="work-card__index">{index}</span>
  <span class="work-card__corner"></span>

  <!-- Meta overlay -->
  <div class="work-card__meta">
    <div>
      <div class="work-card__client">{project.name}</div>
      <div class="work-card__type">{project.type}</div>
      <div class="cc-disciplines">{project.disciplines}</div>
    </div>
    <div class="work-card__year">{project.year}</div>
  </div>
</div>

<style>
  /* Card cursor */
  .comparison-card {
    cursor: ew-resize;
  }

  /* ── Videos ── */
  .cc-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Graded video: clipped on left, reveals from left as --pct increases */
  /* --pct-inv = 100 - --pct, set by JS alongside --pct */
  .cc-video--graded {
    clip-path: inset(0 0 0 calc(var(--pct-inv, 50) * 1%));
  }

  /* ── Thumbnail (on top, fades out on hover) ── */
  .cc-thumb {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    opacity: 1;
    transition: opacity 300ms ease;
    z-index: 3;
    filter: grayscale(0.15) contrast(1.05);
  }

  .comparison-card:hover .cc-thumb {
    opacity: 0;
  }

  /* ── Slider overlay ── */
  .cc-slider {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 200ms ease;
    z-index: 4;
    pointer-events: none;
  }

  .comparison-card:hover .cc-slider {
    opacity: 1;
  }

  /* The line moves horizontally with --pct */
  .cc-slider__line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(var(--pct, 50) * 1%);
    width: 2px;
    background: rgba(255, 255, 255, 0.8);
    transform: translateX(-50%);
  }

  .cc-slider__handle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* Pills sit left/right of the line, children of .cc-slider__line */
  .cc-slider__pill {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.6);
    padding: 4px 10px;
    border-radius: 20px;
    font-family: var(--mono);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    white-space: nowrap;
  }

  /* Left pill: right edge flush to left of line with gap */
  .cc-slider__pill--left {
    right: calc(100% + 12px);
    color: rgba(255, 255, 255, 0.5);
  }

  /* Right pill: left edge flush to right of line with gap */
  .cc-slider__pill--right {
    left: calc(100% + 12px);
    color: var(--amber);
  }

  /* Drag hint — centred below handle, fixed position */
  .cc-slider__hint {
    position: absolute;
    bottom: 72px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--mono);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(255, 255, 255, 0.2);
    white-space: nowrap;
  }

  /* ── Disciplines sub-line (extra meta row) ── */
  .cc-disciplines {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(244, 241, 236, 0.35);
    margin-top: 4px;
    opacity: 0;
    transform: translateY(8px);
    transition: transform 0.35s ease 0.1s, opacity 0.35s ease 0.1s;
  }

  .comparison-card:hover .cc-disciplines {
    opacity: 1;
    transform: translateY(0);
  }
</style>

<script define:vars={{ uid }}>
  const card = document.getElementById(uid);
  if (!card) return;

  const videos = card.querySelectorAll('video');
  let dragging = false;

  function setPct(pct) {
    const clamped = Math.min(100, Math.max(0, pct));
    card.style.setProperty('--pct', clamped);
    card.style.setProperty('--pct-inv', 100 - clamped);
  }

  // Initialise at 50%
  setPct(50);

  // Play both videos on hover, pause + reset on leave
  card.addEventListener('mouseenter', () => {
    videos.forEach(v => v.play().catch(() => {}));
  });

  card.addEventListener('mouseleave', () => {
    videos.forEach(v => v.pause());
    setPct(50);
  });

  // Pointer drag — works for mouse and touch
  card.addEventListener('pointerdown', (e) => {
    dragging = true;
    card.setPointerCapture(e.pointerId);
  });

  card.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = card.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width * 100;
    setPct(pct);
  });

  card.addEventListener('pointerup', () => { dragging = false; });
  card.addEventListener('pointercancel', () => { dragging = false; });
</script>
```

- [ ] **Step 2: Verify the dev server renders without errors**

Open http://localhost:4321 — no red error overlay.

- [ ] **Step 3: Commit**

```bash
git add src/components/ComparisonCard.astro
git commit -m "feat: add ComparisonCard component with before/after slider"
```

---

## Task 4: Wire ComparisonCard into Projects.astro

**Files:**
- Modify: `src/components/Projects.astro`

- [ ] **Step 1: Add the import at the top of the frontmatter block**

Find:
```astro
---
import projects from '../data/projects.json';
```

Replace with:
```astro
---
import projects from '../data/projects.json';
import ComparisonCard from './ComparisonCard.astro';
```

- [ ] **Step 2: Extend the stillClasses array to 8 entries**

Find:
```js
const stillClasses = ['still-1','still-2','still-3','still-4','still-5','still-6','still-3'];
```

Replace with:
```js
const stillClasses = ['still-1','still-2','still-3','still-4','still-5','still-6','still-3','still-1'];
```

- [ ] **Step 3: Update the section header count**

Find:
```astro
<span class="section-head__count">07 Projects · 2016—2026</span>
```

Replace with:
```astro
<span class="section-head__count">08 Projects · 2016—2026</span>
```

- [ ] **Step 4: Add the comparison branch in the map**

Find the opening of the return value inside `.map((project, i) => {`:
```astro
        return (
          <a
            class={`work-card ${spanClass}`}
```

Replace the entire `return (...)` block with:
```astro
        if (project.comparison) {
          return <ComparisonCard project={project} index={idx} />;
        }
        return (
          <a
            class={`work-card ${spanClass}`}
            href={href}
            target={project.coming_soon ? undefined : '_blank'}
            rel={project.coming_soon ? undefined : 'noopener'}
            aria-label={label}
          >
            <div
              class={`work-card__still ${stillClass}`}
              style={hasThumbnail ? `background-image:url('${project.thumbnail}');background-size:contain;background-repeat:no-repeat;background-position:center` : undefined}
            >
              {!hasThumbnail && (
                <div class="work-card__placeholder">[ video still ]</div>
              )}
            </div>
            <div class="work-card__veil"></div>
            <span class="work-card__index">{idx}</span>
            <span class="work-card__corner"></span>
            {project.coming_soon && <span class="work-card__badge">Coming Soon</span>}
            <div class="work-card__meta">
              <div>
                <div class="work-card__client">{project.name}</div>
                <div class="work-card__type">{project.type}</div>
              </div>
              <div class="work-card__year">{project.year}</div>
            </div>
          </a>
        );
```

- [ ] **Step 5: Verify in browser**

Open http://localhost:4321 and scroll to Selected Work:
- Section header reads "08 Projects · 2016—2026"
- A full-width card appears at the bottom showing the Thales thumbnail
- Hovering the card: thumbnail fades, slider appears at 50%, both videos play
- Dragging left: ungraded side expands; dragging right: graded side expands
- Pills ("Camera Original →" / "← Colour Graded") flank the handle
- Moving off card: thumbnail returns, slider resets to 50%

- [ ] **Step 6: Commit**

```bash
git add src/components/Projects.astro
git commit -m "feat: wire ComparisonCard into Projects section for Thales entry"
```

---

## Done

All four tasks complete. The Thales Canada comparison card is live at the bottom of the Selected Work section as a full-width (span-6) row with an interactive colour-grade reveal slider.
