---
target: the homepage (src/pages/index.astro), with case-study notes
total_score: 19
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 5
target_identity: "file:/Users/romer/Documents/Claude/Website/src/pages/index.astro"
target_fingerprint: "sha256:6413ea7635c00fe75d82b37b9fc39a9cbe5f1536f226a628305104d8801bbb78"
target_path: /Users/romer/Documents/Claude/Website/src/pages/index.astro
timestamp: 2026-09-14T17-47-18Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design-review agent · B: detector agent)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Active nav, playhead and timecode good; amber chat orb unlabeled until hovered |
| 2 | Match system / real world | 2 | "Watch Sizzle", "solutions delivered", MCP jargon; timecode counts a fictional 60s program |
| 3 | User control and freedom | 3 | Esc closes chat/lightbox; case-study pages are dead ends; card 01 swallows the click |
| 4 | Consistency and standards | 2 | "Sizzle" vs "Reel"; ↗ external on Builds, inline on Sound; work titles hover-only |
| 5 | Error prevention | 3 | Read-only surface; chat disables input while busy |
| 6 | Recognition rather than recall | 1 | Work cards carry no visible name or type at rest, never on touch |
| 7 | Flexibility and efficiency | n/a | Experience surface |
| 8 | Aesthetic and minimalist design | 2 | Three persistent chrome layers; lat/long trivia; build cards repeat URL 3x |
| 9 | Error recovery | 3 | Chat errors plain language |
| 10 | Help and documentation | n/a | Experience surface |
| Total | | 19/32 (59%) | Acceptable |

## Design Specificity Verdict

Split personality: an editor's instruments bolted onto a designer-portfolio template. Authored: NLE timeline bar, hover loop + timecode chip, Thales grade slider with hand-written hint, reel logo with descender-aware underline, real waveforms. Interchangeable: hero (200px name, dashboard chips, amber rule, two buttons), section header template repeated 5x (eyebrow, two-line period headline, mono count, hairline), white SaaS cards with tag chips in AI Builds, label/value rows in Contact. Biggest miss: the work grid at rest is a mute mosaic of eight untitled stills.

Deterministic scan: src/ 3 findings (Inter BaseLayout.astro:64; side-tab work/[id].astro:183; transition:width global.css:1287). Rendered homepage 82 + 3 advisory: 52 undersized-ui-text (9-10.5px indices, disciplines, tags, status labels), 11 all-caps-body (FP: label rows), 4 kicker-above-heading, 3 wide-tracking (FP: links), 3 dark-glow (chat dot/trigger, live dot), 2 pulsing-dot (error), 2 low-contrast (hero reading is an alpha-gradient artifact), 1 each radial-spotlight-glow, hero-eyebrow-chip, tiny-text (cw__foot 9.5px), overused-font (Montserrat 64%), layout-transition. Case study 11 + 2: eyebrow duplicates H1, ~94ch line length, .case__type 2.2:1, dark-glow 3, all-caps 2, tiny-text, undersized, overused-font. Browser overlay skipped (pane reserved by parent session).

## Priority Issues

- [P1] Work cards have no visible titles (opacity:0 until hover, global.css 485-506; never on touch). Fix: name/type at rest. clarify
- [P1] Mobile hero override is dead CSS (global.css 282-286 precedes base .hero at 290; 390x844 first content at 343px). Fix: reorder. adapt
- [P1] Reel split and half broken: hero CTA exits to YouTube; /reel renders as bare 300px thumbnail. Fix: one reel path in Lightbox; style or drop /reel. harden
- [P1] Slot 01 is a Coming Soon placeholder that refuses the click. Fix: lead with Shell; CAOT last or held. layout
- [P1] Functional text below 11px, 52 instances. Fix: 11px floor in the type ramp. typeset
- [P2] One section template five times with corporate copy ("Twenty years of solutions delivered."). Fix: drop the Work headline; keep headlines only where earned. distill

## Persona Red Flags

Jordan: "Sizzle" opaque and opens a new tab; unlabeled chat orb; numbered untitled stills; card 01 flashes; ↗ in Sound plays inline; orphan running timecode.
Casey: half-screen blank cream on mobile; untitled stills, blind taps; "Slide me!" hidden under 720px; chat orb overlaps Reel link; 12 screens to an email.
Morgan (90s decision): no work in the first 10s; slot 01 Coming Soon; case study is a log line with role in a 14px sidebar and no next project; Contact is a bare mailto and a broken-looking Reel page; Shell/Xbox/NS Health buried in About; Google, Sony Ericsson, Sobeys, Mirvish never rendered (Clients.astro unused).

## Minor Observations

Hero CTAs clipped at 1440x760; five typefaces load (Caveat via @import); disciplines 9px at 35% alpha (~2:1); nav links Montserrat 300 12px .28em at 70% opacity; build cards repeat URL 3x and stack 2x; ghost headings for fast scrollers; unexplained rainbow rule; tagline lists two people and one thing; "Twenty years" vs "2016-2026"; case summary ~94ch; case type 2.2:1.

## Questions to Consider

1. Why does a visitor scroll a viewport of cream past a 200px name before seeing a frame?
2. What would the page lose if every section headline were deleted?
3. The timeline bar is the one element only an editor would build; why is everything around it borrowed?
4. Would Jeremy open his own reel with a Coming Soon slate?
5. Who is the chat widget for, and does it beat one sentence next to the email?

## Case-study page (work/[id].astro)

Metadata sheet, not a case study; eyebrow repeats H1; episode subject smallest text; body is a log line; sidebar tags. [P1] three-beat body (clarify). [P2] H1 = episode subject (typeset). [P2] prev/next (layout). [P3] mobile play button covers face (polish).
