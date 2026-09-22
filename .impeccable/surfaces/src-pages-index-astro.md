---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/work/[id].astro","src/pages/ai-builds.astro","src/pages/reel.astro","src/pages/mcp.astro"]
---

# Surface brief: homepage (`src/pages/index.astro`)

## Entry revision — 2026-09-17

Jeremy requested a clearer first impression before the editing interface. The current local draft opens with `Introduction.astro` at `#top`: name, existing role and bio, an untinted project still, primary “Explore the edit” link to `#edit`, secondary Watch Sizzle, and email. The original suite follows intact and plays only when visible. Classic remains the separate production site. This revision supersedes the suite-first arrival and primary-action statements in the historical direction below; its colours, type families, footage, accessibility, and panel rules still apply. The grading comparison now spans two Work columns with a fully visible responsive hint. All seven preview loops use audited source edit boundaries (`docs/preview-cuts.md`).

## Original direction (2026-09-14)

Scope: the homepage as the first surface of the replacement visual world; related surfaces `/work/[id]`, `/ai-builds`, `/reel`, `/mcp` inherit it in Phase 2.
Mode: Experience (the work leads; the interface recedes), with a Persuade job (get hired or booked).
Audience: hiring managers and recruiters vetting after a resume or LinkedIn; producers and agencies booking an editor now. Both at equal weight (PRODUCT.md).
Job: watch the work, understand who Jeremy is within a minute, get in touch.
Action: Watch Sizzle (primary, opens the reel), Email (secondary), case studies from any clip.
Proof and content: 8 real projects with stills and six silent loops, real running times from YouTube, the reel, 10 tracks with real waveform peaks, the bio, the client list (canonical list still open), three live software products.
Constraints: timeline bar, hover loops, waveforms, chat widget, lightbox, view transitions and scroll reveals keep working; no tints on footage; free fonts; 11px floor on functional text; no-JS content; reduced motion; ~400px works; tests green. Brand commitments: logo, the "Jeremy Twogood." wordmark, first-person plain voice.
Chosen direction: The Open Sequence (prototype at `.impeccable/mocks/proto/seq.html`, approved by Jeremy 2026-09-14 over Mezzotint Velvet Night).
Memorable moment: the visitor lands inside a running edit; the playhead moves through the real work while the monitor previews each clip.
Resolved 2026-09-14: the page timeline bar survives as a slim bottom bar that scrubs the page (the top sequence picks clips); below the fold each bin opens as a full-width panel (Work icon view, AI builds list, Sound waveform rows, About clip properties, Contact properties); phones stack the sequence vertically as clip rows with duration bars, no sideways scroll; profile.json is the canonical client list (HIRE.md and About to match). Still open: the case-study page as a clip-properties/source-monitor view; whether the chat widget becomes a panel.

## Direction contract

THESIS: The site is an open edit. Jeremy's sequence is on screen, playing, and every part of the page is a panel of that edit: bins, program monitor, info, and the sequence itself. It refuses the category default of a full-bleed reel hero with the name over it, a thumbnail grid, and a labelled section stack.

OWN-WORLD: Panel chrome in three near-black greys (panel #171719, panel head #1c1c1f, lane #1f1f23) separated by 1px hairlines (#2c2c32, strong #3b3b43); text #e9e7e0, muted #a3a2aa, dim #8b8b94. One warm accent, mango #f4a23b, only on the playhead, the active tab and the single primary action. Clip colours: video teal #2c6b67 with #dff5f2 ink, audio green #3c6a41 with #dcefd9 ink, offline media as red hatch #7a2e2e. Type: Archivo (wdth 112 to 118, 700 to 800) for the name and headings; Barlow 400 to 600 for panel UI and body; Martian Mono (wdth 85 to 90) for timecode, durations and readouts only. Square corners; clips 2px; no shadows; flat panels; 32px pane headers, 44px bars.

STORY: The visitor understands they are looking at an editor's working screen, that the work is real (it is playing, timed, titled), and who is behind it (the info pane). They believe the range because the clips differ and the durations are true. They act by watching the sizzle, opening a clip, or emailing.

FIRST VIEWPORT (1440x900 and everything down to 1100 wide): a 44px panel bar: the sequence tab reads "Jeremy Twogood." with the amber period, then section tabs Work / About / Builds / Sound / Contact, then format and total-duration readouts, then availability in words, no dot. Below it three panes: Project bins (256px) listing Work 8, AI builds 5, Sound 10, About, Contact, and the clip list with 52px thumbnails and durations; the Program monitor centred, 16:9, sized so the whole suite fits 900px, with a corner tag (client, year) and a burned-in timecode, and a 44px transport (prev, play, next, current timecode in mango, clip name, total); Sequence info (320px) with the name at 34px Archivo, one role line, the first-person bio paragraph, Watch Sizzle (mango) and Email, then a key/value list (clients, open to, also ships software). Below the panes the sequence: a 32px ruler in timecode, V1 (120px) holding one clip per project sized by real running time with its thumbnail and name always visible, A1 (74px) holding the "Eagle" waveform from real peaks, and a mango playhead spanning both. Everything above is inside the first screen.

FORM: The Open Sequence. Position 1 on the ordered grounded list (presented as IMPECCABLE'S PICK; the roll assigned position 6, The Contact Sheet). Seed key f102dfc2, scope direction, mode experience. Chosen through the structured question tool after the decision page closed unanswered, then confirmed against two coded prototypes. Signature interaction: the playhead advances as the monitor previews each clip in turn; dragging across the lanes scrubs and switches the monitor; clicking a clip loads it and links to its case study. Motion grammar: linear playhead, no eased chrome, clips brighten 12% on hover, loops play on hover in the bin; under reduced motion nothing auto-plays and the playhead rests on clip 1.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
