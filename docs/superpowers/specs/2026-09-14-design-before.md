---
name: jeremytwogood.com
description: Dark edit-suite portfolio with cream paper interludes and a tally-light amber accent (incumbent system, recorded 2026-09-14 before the facelift)
colors:
  tally-amber: "#c8922a"
  amber-deep: "#a6791e"
  suite-black: "#111111"
  bone: "#e8e4dc"
  ash: "#888880"
  suite-rule: "#23211d"
  card-charcoal: "#1a1916"
  paper: "#f4f1ec"
  ink: "#1a1a1a"
  stone: "#6b6b63"
  paper-rule: "#dcd6cb"
  card-white: "#ffffff"
typography:
  display:
    fontFamily: "Syne, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(64px, 13vw, 200px)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Syne, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(34px, 4.6vw, 56px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Syne, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.18em"
  readout:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  none: "0"
  tag: "2px"
  dot: "50%"
  overlay: "12px"
spacing:
  gutter: "clamp(20px, 4vw, 56px)"
  section: "clamp(72px, 10vw, 144px)"
  grid-gap: "24px"
  card-pad: "32px 28px 28px"
  row: "18px 0"
components:
  button-primary:
    backgroundColor: "{colors.tally-amber}"
    textColor: "#161208"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 22px"
  button-primary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.tally-amber}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 22px"
  button-ghost-hover:
    textColor: "{colors.tally-amber}"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.stone}"
    rounded: "{rounded.tag}"
    padding: "4px 9px"
  work-card:
    backgroundColor: "{colors.card-charcoal}"
    rounded: "{rounded.none}"
  build-card:
    backgroundColor: "{colors.card-white}"
    rounded: "{rounded.none}"
    padding: "{spacing.card-pad}"
---

# Design System: jeremytwogood.com

## Overview

**Creative North Star: "The Cutting Room"**

A dark edit suite with cream paper interludes. The near-black sections are the suite: footage is the light source, chrome stays thin, and a single tally-light amber marks what is live (the playhead, the active nav item, the hover state). The cream sections (hero, About, AI Builds, Contact) are paper laid on the desk: the bio, the client index, the software cards, the contact sheet. Trade instruments carry the identity: an NLE-style scroll timeline with a 24fps timecode readout, hover-to-play loops with a running timecode chip, and SVG waveforms cut from Jeremy's own tracks.

The mood is cinematic, restrained, and warm. Density is low; sections are tall (72 to 144px of vertical padding) and each opens with the same header block: a tracked-caps eyebrow with a 24px dash, a two-line Syne headline ending in a period, a right-aligned mono count, and a hairline rule. Film grain animates over dark sections at 25% opacity; a grunge texture multiplies over About and a grid texture over Contact.

Confirmed anti-reference: the AI beige-editorial template (cream ground, eyebrow labels above every heading, tiny numbered section labels, right-aligned meta stats, a soft amber spotlight behind the hero). The incumbent system resembles it, and the facelift exists to leave it.

**Key Characteristics:**
- Dark/cream alternation by section, never mixed inside one
- One accent (amber) reserved for live, active, and hover states
- Tracked uppercase labels in a light geometric sans on almost every secondary element
- Square corners everywhere except dots and pills
- Editing-trade instruments (timeline, timecode, waveforms) as the signature components

## Colors

Two grounds, one accent: near-black and bone for the suite, cream and ink for the paper, and a tally-light amber shared by both.

### Primary
- **Tally-light Amber** (#c8922a): the only accent. Playhead and timecode chip, primary button fill, eyebrow text and dash, active and hover states on links, the live dot, the period in the wordmark. Rarity is the rule; it never fills a region larger than a button.
- **Amber Deep** (#a6791e): amber on cream where the lighter tone fails contrast (About client labels, chat trigger ring).

### Neutral
- **Suite Black** (#111111): dark section ground, nav ground, footer.
- **Bone** (#e8e4dc): text on dark grounds.
- **Ash** (#888880): muted text and footer links on dark grounds.
- **Suite Rule** (#23211d): hairlines and section-head borders on dark.
- **Card Charcoal** (#1a1916): work-card ground behind stills.
- **Paper** (#f4f1ec): light section ground (hero, About, AI Builds, Contact).
- **Ink** (#1a1a1a): text on cream.
- **Stone** (#6b6b63): muted text, tags, and labels on cream.
- **Paper Rule** (#dcd6cb): hairlines, client-list rows, card borders on cream.
- **Card White** (#ffffff): AI build cards on the cream ground.

### Named Rules
**The Tally Rule.** Amber marks what is live or under the pointer. It is never decorative fill and never a background.

**The Two Grounds Rule.** A section is either suite (dark) or paper (cream); grounds alternate section by section and never blend within one.

## Typography

**Display Font:** Syne (with ui-sans-serif, system-ui)
**Body Font:** Inter (with ui-sans-serif, system-ui)
**Label Font:** Montserrat, weights 300 to 500 (with ui-sans-serif)
**Readout Font:** JetBrains Mono (with ui-monospace, Menlo)

**Character:** A wide geometric display face set tight and large against a neutral body face, with almost every secondary element rendered as small tracked uppercase in a light geometric sans. A monospace readout is reserved for timecode. A hand-lettered Caveat note appears once (the Thales comparison card hint).

### Hierarchy
- **Display** (700, clamp(64px, 13vw, 200px), 0.92): the hero name only. The terminal period is amber, italic, weight 500.
- **Headline** (600, clamp(34px, 4.6vw, 56px), 1.05): section titles, two lines, ending in a period.
- **Sub-headline** (600, clamp(28px, 3.6vw, 44px), 1.1): case-study titles and the Contact heading (which scales to clamp(40px, 6vw, 80px)).
- **Title** (600, 22px, 1.2): build-card names; 18px for client names.
- **Tagline** (500, clamp(18px, 1.8vw, 22px)): the hero tagline in the display face.
- **Body** (400, 16px, 1.55): bio and descriptions; 15px in cards and sidebars. Measure capped at 46ch in build cards, 34ch for the contact line.
- **Label** (500, 12px to 12.5px, 0.18em, uppercase): eyebrows, section counts, contact labels, button text (12px, 0.12em).
- **Meta** (300, 12px, 0.28em, uppercase): nav links and hero meta row.
- **Micro** (400 to 500, 9px to 11px, 0.06em to 0.14em): card index numbers, disciplines, tags, build URLs, client kinds, footer. Below the 11px legibility floor in most uses.
- **Readout** (400, 12px, mono): timecode chips and the timeline bar.

### Named Rules
**The Period Rule.** Every headline ends in a full stop; the hero's is amber.

**The Tracked Caps Rule.** Anything secondary is uppercase, letter-spaced 0.06em to 0.28em, and 9px to 12.5px. (Recorded as observed; it is the incumbent's most repeated tell.)

## Layout

A single centered column, max-width 1240px, with a fluid gutter of clamp(20px, 4vw, 56px). Sections stack full-bleed with clamp(72px, 10vw, 144px) of vertical padding and alternate dark and cream. The hero is min-height 100vh with content aligned to the bottom edge.

Grids: the work grid is 6 columns with 24px gaps, cards spanning 3, 2, 4, or 6 columns at a 16:9 aspect; About is a three-column grid (portrait, bio, client index); AI Builds is two columns with 20px gaps; Sound is two columns of track rows; Contact is 1.4fr / 1fr. Everything collapses to one column at 900px (work, builds) and 820px (contact, about); nav becomes a drawer at 720px; the timeline bar is hidden below 720px.

Rhythm: section header block (eyebrow, headline, count, hairline) then 56px to the content. Rows (client list, contact rows, tracks) are 14px to 18px tall with hairline separators. Equal gaps dominate; there is little variation in density between sections.

## Elevation & Depth

Flat and hairline-defined. Surfaces are flat at rest; edges come from 1px rules (Suite Rule on dark, Paper Rule on cream) and from the tonal step between the two grounds. Depth is reserved for floating overlays: the lightbox, the chat panel, and the mobile nav drawer.

### Shadow Vocabulary
- **Overlay lift** (`box-shadow: 0 24px 60px rgba(0,0,0,.5)` to `0 30px 80px rgba(0,0,0,.6)`): lightbox and chat panel on dark.
- **Panel lift** (`box-shadow: 0 12px 30px rgba(0,0,0,.18), 0 2px 6px rgba(0,0,0,.08)`): chat trigger and the comparison-card handle.
- **Pulse ring** (`box-shadow: 0 0 0 0 → 0 0 0 10px rgba(200,146,42,.55 → 0)`): the animated ring on the "Available" and "Live" dots.

### Named Rules
**The Flat-By-Default Rule.** Cards, rows, and buttons never carry a shadow. Only elements that float over the page (overlays, the chat trigger) lift.

## Shapes

Square. Cards, buttons, images, and sections have 0 radius. Tags carry a 2px radius, status dots and the chat trigger are circles (50%), pills are 999px, and floating overlays round to 10px to 18px. Borders are 1px hairlines in the ground's rule colour; the only heavier stroke is the 2px amber hero rule (96px wide) and a 3px amber left border on case-study pull quotes. Ambient texture is a recurring form: animated film grain over dark sections, multiplied photographic textures over About and Contact, and a segmented "rainbow rule" of clip-coloured hairline segments under the Selected Work header.

## Components

### Buttons
- **Shape:** square (0 radius), 14px 22px padding, 1px border.
- **Primary:** Tally-light Amber fill with near-black text (#161208), label typography at 12px / 0.12em uppercase.
- **Hover / Focus:** fill drops to transparent, text and border turn amber; the trailing arrow glyph translates 4px right (0.2s ease).
- **Ghost:** transparent fill, Bone text with a 25% Bone border on dark; Ink text with an 18% Ink border on cream. Hover turns text and border amber.

### Tags
- **Style:** transparent, Stone text at 10.5px / 0.06em, 1px Paper Rule border, 2px radius, 4px 9px padding.
- **State:** static; no selected variant.

### Work Cards
- **Corner Style:** square.
- **Background:** Card Charcoal behind a 16:9 still.
- **Shadow Strategy:** none (Flat-By-Default).
- **Border:** none; a 1px corner bracket and a mono index number ("01") in the top-left.
- **States:** at rest only the still and index are visible; on hover the silent loop plays, a mono timecode chip counts up, and client, type, and disciplines fade in at the bottom. Coming-soon cards carry an amber-bordered "Coming Soon" badge and do not navigate.

### Build Cards
- **Corner Style:** square.
- **Background:** Card White on the Paper ground, 1px Paper Rule border, 32px 28px 28px padding, min-height 240px.
- **Hover:** border turns amber.
- **Anatomy:** title (22px Syne), mono URL top-right, description at 15px, index and status row (amber dot + "Live"), dashed hairline, tag chips, optional "Try it out" ghost link.

### Client List Rows
- Three-column rows (mono number, Syne name at 18px, tracked mono kind), 18px vertical padding, Paper Rule hairlines above and below.

### Navigation
- Fixed, full-width, 18px vertical padding, gradient fade from the ground colour to transparent with an 8px backdrop blur. Links: Montserrat 300, 12px, 0.28em uppercase, at 70% opacity; hover to full opacity and amber; the active link is full opacity with a 2px amber underline. Brand: reel mark plus the wordmark with an amber period, underlined with a descender-aware rule. Below 720px the links collapse into a full-width drawer.

### Timeline Bar (signature)
- Fixed to the viewport bottom on desktop, ~40px tall, ground #0a0a09 with a Suite Rule top border. One "clip" per homepage section, widths proportional to section height, labelled in tracked mono; an amber playhead with a triangle head and a mono timecode chip (24fps) that follows scroll. Click or drag scrubs the page. Slides up after the visitor leaves the hero.

### Waveform Rows (signature)
- Track rows with a mono index, the title, and an SVG strip of 96 peak bars beneath; idle bars in the #3a3835 family, lit amber up to the playhead while SoundCloud plays.

### Chat Trigger
- 52px amber-ringed circle fixed bottom-right with a panel lift shadow; opens a dark panel with amber accents and mono labels.

## Do's and Don'ts

### Do:
- **Do** keep amber for live, active, and hover states only (The Tally Rule).
- **Do** keep footage untouched: no tints, washes, or overlays on stills and video.
- **Do** keep the editing instruments real: timecode, playhead, and waveforms show true values from the page or the audio.
- **Do** keep surfaces flat; only floating overlays lift.
- **Do** respect `prefers-reduced-motion` on grain, pulses, reveals, and transitions.

### Don't:
- **Don't** reproduce the AI beige-editorial template: no eyebrow above every heading, no tiny numbered labels, no right-aligned meta stats, no soft spotlight behind the hero (confirmed anti-reference).
- **Don't** set functional text below 11px.
- **Don't** blend the two grounds inside one section.
- **Don't** add shadows to cards, rows, or buttons.
