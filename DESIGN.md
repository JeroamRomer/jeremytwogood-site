---
name: jeremytwogood.com
description: The Open Sequence. The site is an editor's working screen, and the work plays inside it.
colors:
  mango: "#f4a23b"
  mango-hover: "#ffb457"
  mango-ink: "#1a1206"
  clip-video: "#2c6b67"
  clip-video-ink: "#dff5f2"
  clip-audio: "#3c6a41"
  clip-audio-ink: "#dcefd9"
  clip-offline: "#7a2e2e"
  clip-offline-alt: "#5e2323"
  clip-offline-ink: "#fbdcdc"
  panel: "#171719"
  panel-head: "#1c1c1f"
  lane: "#1f1f23"
  lane-alt: "#232327"
  stage: "#0f0f11"
  hairline: "#2c2c32"
  hairline-strong: "#3b3b43"
  text: "#e9e7e0"
  muted: "#a3a2aa"
  dim: "#8b8b94"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.0
    letterSpacing: "normal"
  headingBin:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.0
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  uiLabel:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.02em"
  readout:
    fontFamily: "Martian Mono, ui-monospace, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    fontVariation: "wdth 90"
rounded:
  none: "0px"
  clip: "2px"
spacing:
  bar-h: "44px"
  pane-head-h: "32px"
  timeline-h: "28px"
  pad: "clamp(16px, 2.4vw, 32px)"
  gap-sm: "8px"
  gap-md: "14px"
components:
  button-primary:
    backgroundColor: "{colors.mango}"
    textColor: "{colors.mango-ink}"
    rounded: "{rounded.none}"
    padding: "0 14px"
  button-primary-hover:
    backgroundColor: "{colors.mango-hover}"
  button-secondary:
    backgroundColor: "{colors.lane}"
    textColor: "{colors.text}"
    rounded: "{rounded.none}"
    padding: "0 14px"
  clip-video:
    backgroundColor: "{colors.clip-video}"
    textColor: "{colors.clip-video-ink}"
    rounded: "{rounded.clip}"
  clip-audio:
    backgroundColor: "{colors.clip-audio}"
    textColor: "{colors.clip-audio-ink}"
    rounded: "{rounded.clip}"
  clip-offline:
    textColor: "{colors.clip-offline-ink}"
    rounded: "{rounded.clip}"
---

# Design System: jeremytwogood.com

## Overview

**Creative North Star: "The Open Sequence"**

The whole site is an edit in progress. The visitor first meets Jeremy through a focused introduction: his name, role, own bio, and a real project still. “Explore the edit” leads into the suite: a program monitor playing the work, a sequence beneath it with every project as a clip sized by its real running time, bins for the rest of the site, and an info panel. Nothing is decorated, and the work supplies the imagery.

Entry revision, 2026-09-17: Jeremy asked for a clearer landing/hero before the editing interface. The local draft adds the introduction above Open Sequence on the same page; it does not copy Classic into this branch or change the live site. This supersedes the original suite-first-viewport requirement, while retaining its visual language.

Chosen 2026-09-14 (direction round, seed f102dfc2) over Mezzotint Velvet Night and the incumbent "Cutting Room" system, now anti-reference. Built on branch `facelift` (5dc5139) against the approved prototype at `.impeccable/mocks/proto/seq.html`. Shipped as `src/components/suite/*` (Suite, BinsPane, ProgramMonitor, Sequence, InfoPane) plus the bins below the fold (Projects, BuildsList, Sound, About, Contact), the panel-bar Nav, the docked ChatWidget, and the page TimelineBar.

Physical scene: an edit suite at night, dim room, bright monitor. Dark is earned by the scene, not chosen by category.

Motion grammar: one authored motion, the playhead (the sequence's and the page timeline bar's). It advances as the monitor previews each clip; drag to scrub; chrome never eases. Hover brightens a clip 12%; loops play on hover in the bin. Scroll-in reveals are retired: the playhead is the only authored motion left in the shipped build.

Imagery stance: real frames and real loops only, untouched footage. No tints, washes, gradients or overlays on stills or video; this global constraint overrides the direction contract's FIRST VIEWPORT mention of a burned-in timecode (see Named Divergence, below).

Reusable signature: the sequence (ruler, V1 clips, A1 waveform, playhead) with real sequence time, and the page timeline bar restyled as a mini sequence, pinned to the bottom on desktop.

**Key Characteristics:**
- Every region is a named panel: a 32px `.pane-head`/`.bin__head` strip, panels separated by hairlines, never shadows or space alone
- One accent (mango) for the playhead, the active tab, the one primary action, the wordmark period, and two playhead-state indicators (transport timecode, current-clip ring)
- Durations, timecodes and counts are true values from the data, set in the readout face; the running time lives in the transport timecode, not burned into the frame
- Titles, clients and years are visible at rest on every clip and bin item
- Square corners (clips 2px), flat surfaces, dense but legible chrome with an 11px floor on functional text
- The offline-media hatch is a clip-state code on chrome only; it never touches footage

## Colors

Restrained strategy: near-black panel greys and one warm accent, with two clip colours for media type and one hatch for a missing-media state.

### Primary
- **Mango** (#f4a23b, hover #ffb457, ink #1a1206): the playhead (sequence and page timeline bar), the active tab underline (`.bar__tab.is-active`), the primary action fill (Explore the edit, suite Watch Sizzle, case-study Play, chat send), the name/wordmark periods, and two playhead-state indicators from the approved prototype — the transport timecode (`.transport__tc`) and the current-clip ring (`.seq__clip-link.is-current`).

### Secondary
- **Clip Teal** (#2c6b67, ink #dff5f2): video clips on V1 and any video-media surface.
- **Clip Green** (#3c6a41, ink #dcefd9): audio clips on A1, the Sound bin waveform rows.
- **Offline Red** (#7a2e2e / #5e2323 hatch, ink #fbdcdc): the clip-state code for offline or missing media (V1 offline clip, bins pane offline row, the AI builds "No capture" frame). Sanctioned on chrome only, never over footage; the 135deg repeating-linear-gradient hatch carries a detector-ignore in `.impeccable/config.json` for exactly this reason. It is a state code, not decoration — it may not spread to any other "empty" or "pending" state without a new decision.

### Neutral
- **Panel** (#171719): the ground of every pane and the page.
- **Panel Head** (#1c1c1f): pane headers, the top bar, transport strips.
- **Lane** (#1f1f23) and **Lane Alt** (#232327): track lanes, open bin rows, "is-playing" track highlight.
- **Stage** (#0f0f11): the ground behind the program monitor — the darkest surface on the page.
- **Hairline** (#2c2c32) and **Hairline Strong** (#3b3b43): every panel border, ruler tick, thumbnail edge.
- **Text** (#e9e7e0), **Muted** (#a3a2aa), **Dim** (#8b8b94, the floor: 5:1 on Panel).

### Named Rules
**The One Warm Rule.** Mango marks the playhead (sequence and page timeline bar), the active tab, the one primary action, the wordmark period, and the two playhead-state indicators (transport timecode, current-clip ring). If a second, unlisted mango element appears in a viewport, it is wrong.

**The Media Colour Rule.** Teal means video, green means audio, red hatch means offline. Colour on a clip states what it is, never how important it is. The hatch is chrome only — it is never painted over an actual frame or loop.

## Typography

**Display Font:** Archivo (variable width 112–118, weight 700–800)
**Body and UI Font:** Barlow (400–600)
**Readout Font:** Martian Mono (variable width 85–90), for timecode, durations, counts, years and coordinates only

**Character:** A wide, engineered grotesk for the name, display statements and bin headings (set at wordmark scale in the 32px bin-head strip); a compact industrial sans for panel labels and body; a monospace used strictly as measurement.

### Hierarchy
- **Introduction display** (800, responsive 52–104px, .96, `wdth 112`): the primary heading in `Introduction.astro`; Archivo at a larger scale to give arrivals a clear starting point.
- **Display** (800, 34px, 1.0, `wdth 118`): the name in the info pane (`.info__name`).
- **Bin heading** (700, 16px, 1.0, `wdth 112`): `.bin__head h1/h2` and the wordmark in the panel bar (`.bar__name`) — Archivo at wordmark scale inside the 32/44px head strip, not the larger contract-brief size.
- **About lead** (700, clamp 22–30px): `.about__lead`, an Archivo display statement inside a bin body.
- **Body** (400, 15px, 1.5): bio, descriptions, key/value values; measure 46–65ch.
- **UI label** (500–600, 12–13px): tabs, pane headers, clip names, buttons. Pane headers (`.pane-head`, `.bin__head`) are uppercase, 12px, 0.02em tracking.
- **Readout** (Martian Mono, 11–13px, tabular-nums): timecode, durations, counts, years, coordinates, offsets. Never below 11px.

### Named Rules
**The Eleven Rule.** No functional text below 11px, in any panel, at any viewport.

**The Measurement Rule.** Monospace appears only where a value is measured (time, count, format, year, coordinate). Labels and names are never set in it. Type roles: Archivo for the name, display statements and bin headings; Barlow for UI and body; Martian Mono only for measured values.

## Layout

The introduction (`Introduction.astro`, `#top`) pairs identity and actions with an untinted Xbox project still. Its primary action is Explore the edit; Watch Sizzle is secondary. It stacks at 900px and uses native links, including without JavaScript. The suite below (`src/components/suite/Suite.astro`, `#edit`) retains its screen-height desktop layout: three panes — bins 256px, program monitor fluid, info 320px — and the sequence beneath (32px ruler, 120px V1, 74px A1) with a mango playhead spanning both lanes. The monitor starts only when visible and pauses offscreen.

Below the fold, bins (`Projects`, `BuildsList`, `Sound`, `About`, `Contact`) stack edge to edge sharing hairlines, each with its own 32px `.bin__head` strip; no nested framed boxes, no card-grid-of-cards. The chat trigger (`ChatWidget.astro`) docks in the panel bar itself (194px, 66px on narrow widths), not as a floating FAB. A slim 28px page timeline bar (`TimelineBar.astro`) stays pinned to the viewport bottom on desktop and is hidden at 760px and below.

Density is high and even inside panels (`--pad: clamp(16px, 2.4vw, 32px)`, 8–14px internal steps), with hairlines doing the separating; whitespace appears only inside the monitor stage (`.monitor-pane__stage`, 22px padding on `--stage`). At 1100px the info pane drops below the monitor and gains a two-column body. At 760px and below the bins pane hides, tabs carry navigation, the monitor runs full width, and the sequence stacks vertically as one row per clip with thumbnail, title, client, year and a proportional duration bar. Nothing scrolls sideways. The page timeline bar is hidden on phones.

Scroll-in reveals are retired (decided during the build): the playhead (sequence + page timeline bar) is the only authored motion in the shipped system.

## Elevation & Depth

Flat. No shadows anywhere, including overlays: the chat panel and lightbox are panels with hairline borders on a darker stage. Depth reads from three grey steps (Panel, Panel Head, Lane) and from the monitor stage being the darkest surface on the page, so the footage is the brightest thing on screen.

A zero-blur inset `box-shadow` is used three times as a flat 2px underline or ring, and none of these count as a shadow under the No Shadow Rule because nothing casts: the active tab (`box-shadow: inset 0 -2px 0 var(--mango)`), the current clip (`box-shadow: inset 0 0 0 2px var(--mango)`), and the chat form's focus state (`box-shadow: inset 0 2px 0 var(--mango)`).

### Named Rules
**The No Shadow Rule.** Nothing casts a shadow. A zero-blur inset `box-shadow` used as a flat underline or ring (active tab, current clip, chat form focus) is not a shadow under this rule — it has no blur, no offset and casts nothing. A panel that needs to read as raised gets a Hairline Strong border, not a blur.

## Shapes

Square. Panels, buttons, thumbnails and the monitor have 0 radius; clips have 2px (`--rounded: clip`) so their hairline/dark borders don't fuzz; the playhead head is a border-triangle (7–9px). Borders are 1px hairlines in the ground's hairline colour, 1px `rgba(0,0,0,.35)` on clip faces. Icons are drawn SVG at one stroke weight (1.5px): folder, transport glyphs, track toggles, comparison-slider chevron. No textures, grain or grids.

## Components

### Buttons (`.pbtn`)
- **Shape:** 0 radius, 36px min-height, 1px `--hair-strong` border.
- **Primary** (`.pbtn--primary`): mango fill (#f4a23b), mango-ink text (#1a1206); hover to `--mango-hover` (#ffb457). Used once per viewport: Watch Sizzle, case-study Play, chat send (`.cw__send`, distinct markup, same fill rule).
- **Secondary/Ghost** (`.pbtn`): `--lane` fill, `--text` colour, border brightens to `--muted` on hover.

### Panes and bins (signature)
- **Pane** (`.pane` + `.pane-head`, first-viewport suite): flex column, `--panel` ground, 32px head strip in `--panel-head` with a bottom hairline, uppercase 12px UI label, 11px readouts.
- **Bin** (`.bin` + `.bin__head`, below-the-fold sections): same 32px head strip pattern, but full-width with a top hairline instead of side borders; `h1`/`h2` inside is Archivo at wordmark scale (16px, `wdth 112`, 700); body is capped at `--max: 1600px`.
- **Clip** (`.seq__clip-link`): teal/green/offline-hatch fill per the Media Colour Rule, 2px radius, name+thumb+meta grid, 12% brightness lift on hover, mango inset ring when current.
- **Work item** (`.work-item`): 16:9 thumbnail with hover-preview loop, name/sub meta grid below; offline items mute the name colour instead of the hatch (hatch is reserved for sequence/bin clip chrome).
- **Grading comparison** (`ComparisonCard.astro`): spans two Work grid columns (full width on phones), with a container-scaled “Slide me!” cue. Drag, touch, or use arrow/Home/End keys; reduced-motion users see a paused comparison. The full comparison videos are separate from the short sequence preview.
- **Preview edits**: each silent preview starts and ends at a visually verified source cut. Durations vary with the actual shot; frame ranges and reproduction instructions live in `docs/preview-cuts.md`. During loading, the monitor holds the outgoing decoded frame until incoming footage is ready, avoiding a thumbnail flash.

### Navigation (`Nav.astro`)
- 44px sticky panel bar; wordmark "Jeremy Twogood." in Archivo with the mango period; section tabs in Barlow 13px/500, muted at rest, mango inset-underline + text colour when active (IntersectionObserver-driven); status readouts (EST/GMT−5 in readout face, availability in plain text) shed left-to-right as the viewport narrows. Mobile (≤760px): tabs wrap to a full-width second row, status hides.

### Docked chat (`ChatWidget.astro`, signature)
- Trigger sits in the panel bar itself at top-right (194px desktop, 66px "Ask" label ≤1100px), not a floating FAB. Panel drops from the bar as a hairline-bordered flat surface, no shadow. Focus state on the form is the zero-blur inset mango line (see Elevation). Send button is a 36px mango square, disabled state at .45 opacity.

## Do's and Don'ts

### Do:
- **Do** keep every timecode, duration and count true to the data; a readout that lies breaks the world.
- **Do** show title, client and year at rest on every clip and every bin item.
- **Do** keep footage untouched; the monitor and thumbnails show frames as shot, with the running time carried by the transport timecode, never burned into the frame.
- **Do** keep the suite inside one screen at desktop widths (1440×900 down to 1100), after the introduction.
- **Do** honour reduced motion: no auto-advance, no auto-play, playhead at rest; `.tlbar`/`.work-item__preview`/`.cw__caret` transitions drop under `prefers-reduced-motion`.
- **Do** treat the offline hatch as chrome-only clip-state code (Media Colour Rule), never as a texture on footage.
- **Do** confine Caveat to the single "Slide me!" hint on the Thales comparison card (`ComparisonCard.astro`); no other use is sanctioned.

### Don't:
- **Don't** add a second accent, a gradient, a glow, or a shadow with blur or offset.
- **Don't** set any functional text below 11px or in monospace unless it is a measured value (time, count, format, year, coordinate).
- **Don't** reintroduce the incumbent pattern: eyebrow labels above headings, kickers, tiny section numbers, right-aligned meta stats, a spotlight behind the hero, pulsing dots.
- **Don't** put a panel inside a panel; a bin opens as a full-width panel, never as a card grid of cards.

#### Named divergence
- **Don't** burn a timecode into the program monitor frame; the FIRST VIEWPORT block of the direction contract names a burn-in, but the Global Constraint "footage untouched" overrides it in the shipped build — this is a named, deliberate divergence between contract and build, not an omission.
- **Don't** extend Caveat, or invent a second script/display face, beyond the one sanctioned hint use.

**Not canonized — defects the build carries, not rules for future surfaces:** mixed Barlow/mono head readouts (INFO pane head, About head, Contact head) render the mono run optically larger than the Barlow run, and the About head mixes both faces in one dot-separated line; the Production Intelligence row shows a logo on a white square, a content decision pending with Jeremy; detector residuals `cramped-padding` on `.seq__head` and `line-length` in the `/mcp` tool table remain open. None of these are recorded as rules — they are flagged for repair, not inherited. The Sound bin now uses two columns on desktop and one on phones.
