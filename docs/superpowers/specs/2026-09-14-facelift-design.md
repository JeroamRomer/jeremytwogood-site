# Facelift: Less AI-Looking Site — Design

**Date:** 2026-09-14
**Status:** Rough plan approved by Jeremy (chat session, Opus). Phases 1–3 run on Fable.
**Deadline:** ship before 2026-09-19 (Fable credits expire).

## Goal

Make jeremytwogood.com stop reading as AI-generated. Strip the known AI tells, then rebuild the site's fonts, colors, and layout around a film-world identity where the work itself leads (Impeccable's "Experience" mode: portfolios, galleries, showcases).

This is a design pass, not a feature pass. Behavior stays; the visual system changes.

## Method: Impeccable

Tooling follows the workflow in Chase AI's video "The #1 Claude Code Design Skill Just Got a HUGE Upgrade" (Impeccable 4.0) and the docs at https://impeccable.style.

- Install: `npx impeccable install` (npm package `impeccable`, maintainer Paul Bakaus, v4.1.0 at time of writing).
- Context: `/impeccable init` writes `PRODUCT.md` (audience, purpose, constraints, voice, evidence). `/impeccable document` writes `DESIGN.md` (palette, type, layout, components). With `DESIGN.md` present the detector also flags fonts, colors, sizes, and radii outside the system.
- Direction: comp-led ("mockup first") route. Image generation produces compositions; Impeccable then works toward the chosen one in code. Expect a few rounds to close the gap between mockup and code. Higgsfield MCP is connected in Jeremy's setup and is what the video uses for this.
- Checks: `npx impeccable detect <dir|url>` (deterministic, no LLM), `/impeccable critique` (design review), `/impeccable audit` (a11y, perf, responsive, anti-patterns).
- Refinement: `/impeccable live` against the dev server for element-level variants; big direction changes go through the terminal with references.
- Impeccable's own guidance: use one set of design instructions. Do not layer other frontend design skills on top during this work.

## Decisions (from Jeremy)

| Question | Decision |
|---|---|
| Ambition | Explore, then decide. Mockups before any rebuild. |
| Must survive | Timeline bar, hover previews, sound waveforms, chat widget |
| Reference source | Film and editing world |
| Mockup seeds | **A: Saul Bass Title**, **B: Brodovitch Spread**, **C: current look with tells stripped** (baseline) |
| Copy | Headlines and labels only. Body copy was rewritten recently (commit 8fe7075) and stays. |

## Baseline evidence (2026-09-14)

**Detector, live homepage** (`npx impeccable detect https://www.jeremytwogood.com`): 85 findings across 14 rules.

| Rule | Count |
|---|---|
| undersized-ui-text (9–10.5px labels, numbers, role lines, tech chips) | 52 |
| all-caps-body | 11 |
| kicker-above-heading | 4 |
| wide-tracking | 3 |
| dark-glow | 3 |
| pulsing-dot | 2 |
| low-contrast | 2 |
| gpt-thin-border-wide-shadow | 2 |
| tiny-text, repeating-stripes-gradient, radial-spotlight-glow, overused-font, layout-transition, hero-eyebrow-chip | 1 each |

**Detector, source** (`npx impeccable detect src/`): 3 findings.
- `src/layouts/BaseLayout.astro:64` overused font (Inter)
- `src/pages/work/[id].astro:183` side-tab border (`.case__quote` 3px amber left border)
- `src/styles/global.css:1287` transition on `width`

**Catalog tells visible on the site** (names from impeccable.style/slop):

| Tell | Where |
|---|---|
| Copy-paste layouts | Every section header repeats one template: dash eyebrow, big Syne headline, right-aligned meta stat, hairline rule |
| Cream / beige palette | Light sections, `--light-bg:#f4f1ec` |
| Label above a heading / badge above hero | "— SELECTED WORK", "— ABOUT", hero meta row "Toronto, ON · 43.65°N / Available · 2026 / EST · GMT−5" |
| Tiny numbered section labels | 01–08 on work cards, clients, builds, tracks |
| Hero metric layout (stat lines) | "08 PROJECTS · 2016–2026", "05 SHIPPED · /AI-BUILDS", "EST. 2006 · TORONTO" |
| Soft spotlight behind content | Amber radial haze in hero |
| Pulsing status dot | "Available · 2026", "LIVE" on build cards |
| Overused font | Inter body |
| Decorative grid background | Contact section |
| Hairline border with wide shadow | AI build cards |
| Side-tab accent border | Case-study quotes |
| Tiny text, wide tracking, all caps | Nav, eyebrows, chips, labels |

Impeccable's "Slop through the years" 2025 example ("beige backgrounds, editorial labels, decorative motion") is a near match for the current site.

Not tells, and they stay: real footage, NLE timeline bar with timecode, waveforms from Jeremy's own WAVs, hover loops, the logo. They come from the craft and are the site's most distinctive parts.

## Constraints

- **Behavior preserved:** `TimelineBar.astro` (scrub, timecode, chat lift), hover loops in `Projects.astro`, waveforms in `Sound.astro` (SoundCloud sync), `ChatWidget.astro`, Lightbox, card-to-case-study View Transitions, scroll reveals. Restyle freely; do not change how they work.
- **Untouched:** logo (`LogoBrand.astro` and PNG exports), body copy, `api/`, MCP and agent-discovery files (`public/llms.txt`, `agent-data.json` pipeline, `.well-known`), `src/data/*.json` content.
- **Footage fidelity:** no tints, washes, or heavy overlays on video or stills. It is a video portfolio; color accuracy matters.
- **Progressive enhancement:** no-JS users see all content; `prefers-reduced-motion` respected everywhere.
- **Responsive:** works at ~400px wide.
- **Fonts:** free to use (Google Fonts or open license, self-hosting fine) unless Jeremy decides to buy one.
- **Tests green:** `npm run build && npm test`, `npm run test:ui`. Update smoke-test selectors only where markup legitimately changes.
- **No new runtime dependencies** unless a direction truly needs one; justify it in the plan.

## Scope

In: `/` (all sections), `/work/[id]`, `/ai-builds`, `/reel`, `/mcp`, shared Nav and Footer.
Out: `logo-export*`, `logo-preview`, `og-image` (internal pages). OG image restyle is a possible follow-up.

## Direction seeds

Worlds are starting points. Borrow their rules for type, color, and composition; do not costume the site as a theme. Rules below are summarized from Impeccable's worlds catalog.

**A: Saul Bass Title**
- One flat saturated field per "card" (burnt orange, ink black, bone white), field color can change per act while shapes stay black.
- Thin hand-set caps slightly off baseline, one idea per card, hard asymmetry; credits as timed cards rather than columns.
- Navigation as a sequence you scrub, which pairs naturally with the existing timeline bar.
- Motion: staccato cut-paper jumps, not eases.
- Watch: flat color fields competing with footage. Likely best as section openers and title cards around footage, not behind it.

**B: Brodovitch Spread**
- Photograph and headline answer each other across a gutter; content moves in "spreads."
- Sparse, ragged text around images; a single strong accent for the live element; captions as small ranked lines.
- Narrow screens stack image then text with the seam as a horizontal rule.
- Guardrails: **no Didot or italic serif display** (catalog tell), **no cream or warm-paper ground** (catalog tell). Keep the composition logic, choose a different face and ground.
- Watch: drifting back into "beige editorial," which is where the site is now.

**C: Current look, tells stripped**
- Keep dark and light alternation and amber accent, but remove the repeated section template, the meta stats, numbering, eyebrows, pulsing dots, glow, grid, and side-tab.
- Replace Inter, fix the type ramp (nothing functional under 11px), vary section layouts to fit their content.
- The honest control: if A and B don't clearly beat it, ship C.

Combinations are allowed (for example, Bass-style title cards opening sections plus Brodovitch spreads on case-study pages).

Other film-adjacent worlds seen in the catalog, available if Jeremy wants to reroll: Spy Dossier Title Sequence, Emergency Signal Degradation (broadcast bars and burned-in timecode), Darkroom Safelight Bay, Studio Dumbar Identity, Vu Meter Bridge (possible Sound-section accent only).

## Phases

### Phase 1: Setup and direction (Fable, ~day 1)

1. Create a feature branch (or worktree) off current `main-local`. Before starting, confirm branch state against `origin/main` in both directions (other worktrees push to `main`).
2. `npx impeccable install` into the project. Reload.
3. `/impeccable init`. Answers: portfolio site for a Toronto multimedia producer, video editor, and AI tooling builder; audience is producers, agencies, brands, and hiring managers; goal is getting hired and showing the work; stack is Astro 6 on Vercel. Evidence is real only: clients, footage, shipped apps. Do not let it fabricate stats or testimonials.
4. `/impeccable document` to capture the current system in `DESIGN.md` as the "before."
5. `/impeccable critique` on the homepage and one case-study page (`/work/ttms-chef-nuit`). Save findings next to the baseline above.
6. Generate mockups A, B, C for three views: homepage hero, work grid, one case-study page. Use real stills from `public/assets/` so they show Jeremy's footage, not generated imagery. Check Impeccable's worlds picker first; fall back to the comp-led route with Higgsfield image generation.
7. Jeremy picks a direction or a combination. Iterate on the mockup if needed before code.
8. Update `DESIGN.md` with the chosen system: fonts, color tokens, type ramp, spacing scale, radii, motion rules, and how the four signature features are styled.

**Gate:** Jeremy approves a mockup and the updated `DESIGN.md` before Phase 2.

### Phase 2: Plan and build (Fable, ~days 2–3)

1. Run `superpowers:writing-plans` against this spec plus the approved `DESIGN.md`.
2. Tokens first: `src/styles/global.css` variables and the font loading in `BaseLayout.astro`.
3. Rebuild section by section, one commit each: Nav, Hero, Work (`Projects.astro`), About and Clients, AI Builds, Sound, Contact and Footer, then `/work/[id]`, `/ai-builds`, `/reel`, `/mcp`. Restyle TimelineBar, ChatWidget, Lightbox, and waveforms to the new system as their sections come up.
4. Rewrite headlines and labels as sections are rebuilt (e.g. "Twenty years of solutions delivered.", "Software that removes the busywork."). Plain, specific, no em dashes, no slogan contrasts. Jeremy approves copy changes.
5. After each section: `npx impeccable detect http://localhost:4321` and `npm run build && npm test`.
6. End of phase: Impeccable finish reviewer pass.

### Phase 3: Refine and ship (Fable, ~days 4–5)

1. `/impeccable live` for element-level variants Jeremy wants to try.
2. `/impeccable audit`, then `/impeccable polish`.
3. Verify: ~400px mobile, reduced motion, no-JS, keyboard focus, View Transitions, SoundCloud waveform sync, chat widget opens and answers (don't trigger a real send-to-Jeremy email without asking).
4. Merge per repo practice: check `git log main..<branch>` and `git log <branch>..main`; cherry-pick if `main` has diverged. Push, let Vercel deploy, verify production.

## Success criteria

- Detector: 0 findings on all in-scope pages, or each remaining finding documented in `DESIGN.md` as intentional with a reason.
- Source scan clean.
- Jeremy's call from the mockup comparison, and his gut check on the live result: it doesn't look AI-made.
- Timeline bar, hover previews, waveforms, and chat behave exactly as before.
- All test suites green. No Speed Insights regression.

## Open questions for the Fable session

- Does Impeccable's worlds picker run on an existing project, or only on new builds? If not, use the comp-led route directly.
- Keep the dark/light section alternation? Decided by the chosen direction.
- Whether `og-image.astro` should follow the new system (currently out of scope).

## Phase 1 outcome (2026-09-14, Fable)

- Branch `facelift` in the main checkout. Impeccable 4.3.1 skill installed under `.claude/skills/impeccable` (engine binary gitignored), agents under `.claude/agents`, design hook active.
- `PRODUCT.md` written from the interview: both audiences at equal weight; position "a producer who still cuts"; binding brand: logo, the "Jeremy Twogood." wordmark, first-person plain voice. Amber, the dark base and the current fonts are not binding.
- Build path recorded as **code-led** (`.impeccable/config.json`): Jeremy chose to skip image generation. Mockups were coded HTML prototypes instead.
- The incumbent system was documented, then moved to `2026-09-14-design-before.md` as the anti-reference.
- Critique (dual-agent) scored the homepage **19/32**, five P1s; snapshot in `.impeccable/critique/`. Decisions: hierarchy first; the three plumbing bugs (mobile hero dead CSS, bare `/reel`, Coming Soon in slot 01) fold into the rebuild; nothing is dropped outright (hero meta, numbering, CAOT card, "Watch Sizzle" are restyled, not removed).
- Direction round (seed `f102dfc2`): the roll assigned The Contact Sheet; Jeremy shortlisted The Open Sequence (Impeccable's pick) and Mezzotint Velvet Night, saw both as prototypes, and **locked The Open Sequence**. The Saul Bass and Brodovitch seeds were not chosen.
- Prototype: `.impeccable/mocks/proto/seq.html` (served by the `proto` launch config on port 4380). Direction contract: `.impeccable/surfaces/src-pages-index-astro.md`. `DESIGN.md` is now the seed for the new world; the documenter rewrites it with real tokens at the finish.

## Handoff

Phase 2, in this or a new session: "Read the facelift spec's Phase 1 outcome, the homepage surface brief and DESIGN.md, then run writing-plans for Phase 2."

## Phase 2 outcome

- Plan: `docs/superpowers/plans/2026-09-14-facelift-phase-2.md`, executed on `facelift`.
- Finish review disposition: fix (2026-09-15), screenshots in `.impeccable/review/`.
- Detector: 10 findings on `src/` and the five rendered pages (src/: 0); sanctioned ignores listed in `.impeccable/config.json`.
- Open after the two-round finish-review cap (for Jeremy / Phase 3): mono readouts in mixed Barlow/mono head strips render optically larger than the Barlow run (INFO, About, Contact heads; About head dot spacing); the Sound bin renders one column at 1440 with coarse stretched waveforms (restore two columns); the Production Intelligence logo on a white square (content decision); no burned-in monitor timecode (ruled against the footage-untouched constraint, recorded in DESIGN.md).
- DESIGN.md carbonized from the build by the documenter.
- Next: Phase 3 (live-mode tweaks with Jeremy, `/impeccable audit`, `/impeccable polish`, merge to `main` after checking divergence both ways, deploy, verify production) before 2026-09-19.
