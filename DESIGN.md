<!-- SEED: established with the user before implementation; re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: jeremytwogood.com
description: The Open Sequence. The site is an editor's working screen, and the work plays inside it.
---

# Design System: jeremytwogood.com

## Overview

**Creative North Star: "The Open Sequence"**

The whole site is an edit in progress. The visitor lands inside Jeremy's suite: a program monitor playing the work, a sequence beneath it with every project as a clip sized by its real running time, bins for the rest of the site, and an info panel that says who he is. Nothing is decorated; every surface is a panel doing a job, and the work is the only colour on the page.

Chosen 2026-09-14 (direction round, seed f102dfc2) over Mezzotint Velvet Night and the incumbent "Cutting Room" system, which is recorded in `docs/superpowers/specs/2026-09-14-design-before.md` and now serves as anti-reference. The approved expression is the coded prototype at `.impeccable/mocks/proto/seq.html`; the homepage surface brief carries the direction contract.

Physical scene: an edit suite at night, dim room, bright monitor. Dark is earned by the scene, not chosen by category.

Motion grammar: one authored motion, the playhead. It advances as the monitor previews each clip; drag to scrub; nothing else moves on its own. Chrome never eases. Hover brightens a clip 12%; loops play on hover in the bin. Under reduced motion nothing auto-plays.

Imagery stance: real frames and real loops only, untouched. No tints, washes, gradients or overlays on footage. Thumbnails carry their titles at rest.

Reusable signature: the sequence (ruler, V1 clips, A1 waveform, playhead). It replaces the old timeline bar rather than sitting beside it, and its timecode is real sequence time, never a fictional program length.

**Key Characteristics:**
- Every region is a named panel with a 32px header; panels are separated by hairlines, never by shadows or space alone
- One accent (mango) for the playhead, the active tab and the single primary action; clip colours mark media type, not decoration
- Durations, timecodes and counts are true values from the data, set in the readout face
- Titles, clients and years are visible at rest on every clip and bin item
- Square corners, flat surfaces, dense but legible chrome with an 11px floor on functional text

## Colors

Restrained strategy: near-black panel greys and one warm accent, with two clip colours for media type.

### Primary
- **Mango** (#f4a23b): the playhead, the active tab underline, the primary button fill (with #1a1206 ink), the amber period in the wordmark. Nothing else.

### Secondary
- **Clip Teal** (#2c6b67, ink #dff5f2): video clips on V1 and any video-media surface.
- **Clip Green** (#3c6a41, ink #dcefd9): audio clips on A1 and any audio surface.
- **Offline Red** (#7a2e2e hatch, ink #fbdcdc): media not yet online (the CAOT film until it ships).

### Neutral
- **Panel** (#171719): the ground of every pane and the page.
- **Panel Head** (#1c1c1f): pane headers, the top bar, transport strips.
- **Lane** (#1f1f23) and **Lane Alt** (#232327): track lanes and open bin rows.
- **Stage** (#0f0f11): the ground behind the program monitor.
- **Hairline** (#2c2c32) and **Hairline Strong** (#3b3b43): every panel border, ruler tick and thumbnail edge.
- **Text** (#e9e7e0), **Muted** (#a3a2aa), **Dim** (#8b8b94, the floor: 5:1 on Panel).

### Named Rules
**The One Warm Rule.** Mango marks the playhead, the active tab and one action. If a second mango element appears in a viewport, one of them is wrong.

**The Media Colour Rule.** Teal means video, green means audio, red hatch means offline. Colour on a clip states what it is, never how important it is.

## Typography

**Display Font:** Archivo (variable width 112 to 118, weight 700 to 800), self-hosted or Google Fonts
**Body and UI Font:** Barlow (400, 500, 600)
**Readout Font:** Martian Mono (width 85 to 90), for timecode, durations, counts and format readouts only

**Character:** A wide, engineered grotesk for the name and bin headings, a compact industrial sans for panel labels and body, and a monospace that is used strictly as measurement. None of the incumbent faces (Syne, Inter, Montserrat, JetBrains Mono) return.

### Hierarchy
- **Display** (800, 34px, 1.0): the name in the info pane. Exact ramp to be resolved during implementation; display never exceeds 6rem.
- **Heading** (700, 22px): bin and section headings ("Work").
- **Body** (400, 15px, 1.5): bio, descriptions, key/value values; measure 46 to 65ch.
- **UI label** (500 to 600, 12px to 13px, sentence case): tabs, pane headers, clip names, buttons. Pane headers are the only uppercase, at 12px with 0.02em tracking.
- **Readout** (Martian Mono, 11px to 13px): timecode, durations, counts. Never below 11px.

### Named Rules
**The Eleven Rule.** No functional text below 11px, in any panel, at any viewport.

**The Measurement Rule.** Monospace appears only where a value is measured (time, count, format). Labels and names are never set in it.

## Layout

Panels, not sections. The first viewport is a fixed suite: a 44px top bar, three panes (bins 256px, program monitor fluid, info 320px), and the sequence beneath (32px ruler, 120px V1, 74px A1), all within one screen at 1440x900 and down to 1100 wide. Below the fold, the bins open in place as full-width panels (Work in icon view with 16:9 thumbnails, then AI builds, Sound, About, Contact), each with the same 32px header.

Density is high and even inside panels (8px to 14px steps), with hairlines doing the separating; whitespace appears only inside the monitor stage. At 1100px the info pane drops below the monitor; at 760px the bins pane hides (the tabs carry navigation), the monitor runs full width, and the sequence scrolls horizontally at a minimum width of 860px. Exact spacing tokens are resolved during implementation.

## Elevation & Depth

Flat. No shadows anywhere, including overlays: the lightbox and the chat panel become panels with hairline borders on a darker stage. Depth is conveyed by the three grey steps (Panel, Panel Head, Lane) and by the monitor stage being the darkest surface on the page, so the footage is the brightest thing on screen.

### Named Rules
**The No Shadow Rule.** Nothing casts a shadow. A panel that needs to read as raised gets a Hairline Strong border, not a blur.

## Shapes

Square. Panels, buttons, thumbnails and the monitor have 0 radius; clips have 2px so their hairline borders do not fuzz; the playhead head is a 14px triangle. Borders are 1px hairlines in the ground's hairline colour. Icons are drawn SVG at one stroke weight (1.5px): folder, transport glyphs, track toggles. No textures, grain or grids.

## Do's and Don'ts

### Do:
- **Do** keep every timecode, duration and count true to the data; a readout that lies breaks the world.
- **Do** show title, client and year at rest on every clip and every bin item.
- **Do** keep footage untouched; the monitor and thumbnails show frames as shot.
- **Do** keep the whole suite inside the first screen at desktop widths.
- **Do** honour reduced motion: no auto-advance, no auto-play, playhead at rest.

### Don't:
- **Don't** add a second accent, a gradient, a glow or a shadow.
- **Don't** set any functional text below 11px or in monospace unless it is a measured value.
- **Don't** reintroduce the incumbent pattern: eyebrow labels above headings, tiny section numbers, right-aligned meta stats, a spotlight behind the hero, pulsing dots.
- **Don't** put a panel inside a panel; a bin opens as a full-width panel, never as a card grid of cards.
