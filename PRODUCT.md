# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences, confirmed at equal weight (2026-09-14):

1. **Hiring managers and recruiters** vetting Jeremy for a contract, freelance, or full-time role. They arrive from his resume, LinkedIn, or a job application and need proof of range and reliability quickly.
2. **Producers and agencies** with a live project who need an editor or producer now. They want to see the reel, judge the craft, and know whether he is available.

Secondary audience (repository evidence, not a separate interview answer): AI agents and automated recruiters reading the site through the MCP endpoint (`/api/mcp`), `public/llms.txt`, `public/agent-data.json`, and `availability.json`.

## Product Purpose

jeremytwogood.com is Jeremy Twogood's portfolio. It exists to get him hired or booked by showing the work itself: broadcast, documentary, and corporate video he produced and cut, plus the software he builds. Success is a visitor watching the work, understanding who he is within a minute, and getting in touch.

## Positioning

**A producer who still cuts.** Twenty years producing broadcast, documentary, and corporate work, and still editing the picture himself. A neighboring editor's site can claim craft, and a producer's site can claim range; this one can truthfully claim both from the same person.

Supporting fact, not the lead: he also builds and ships AI tools (three live products), which is evidence of the same hands-on habit.

## Operating Context

- Visitors typically arrive from LinkedIn, a resume link, or a job application, often between meetings and on any device.
- The homepage reel links to YouTube (`Tl1n3hu4e8I`); case-study pages (`/work/<id>`) play video in an inline lightbox.
- A floating chat widget answers questions about Jeremy from site data and can email him a visitor's message after explicit confirmation.
- Music lives on SoundCloud (`soundcloud.com/j-twogood`); the Sound section plays tracks through the SoundCloud widget.
- Contact is email and LinkedIn. Booking is a Calendly link surfaced through the MCP tools.
- Deployed on Vercel from GitHub (`JeroamRomer/jeremytwogood-site`); static Astro pages plus serverless functions in `api/`.

## Capabilities and Constraints

- Astro 6 multi-page site, no client-side router. Progressive enhancement: every page must read fully without JavaScript, and `prefers-reduced-motion` is respected everywhere.
- Content is data-driven from `src/data/*.json` (`profile`, `projects`, `ai-builds`, `video-content`, `reel-index`, `waveforms`, `resume`). Copy changes go through those files or the components, never invented at design time.
- Signature interactive features that must keep working through any redesign: the NLE-style scroll timeline bar with timecode (`TimelineBar.astro`, homepage, desktop), hover-to-play silent loops on work cards (`Projects.astro`), SVG waveforms cut from Jeremy's own audio and lit by SoundCloud playback (`Sound.astro`), the chat widget (`ChatWidget.astro`), the inline video lightbox, card-to-case-study View Transitions, and scroll-in reveals.
- Footage fidelity: no tints, washes, or heavy overlays on video or stills. It is a video portfolio; colour accuracy is part of the proof.
- Fonts must be free to use (Google Fonts or an open license); self-hosting is fine.
- Must work at roughly 400px wide.
- Test suites (`npm test`, `npm run test:ui`, `npm run test:api`) stay green; smoke tests assert on page structure.
- Internal pages (`logo-export*`, `logo-preview`, `og-image`) are tooling, not visitor surfaces.
- Terminology: "work" or "selected work" for video projects; "AI builds" or "builds" for software; "sound" for music; "reel" for the sizzle.

## Brand Commitments

Confirmed binding (2026-09-14):

- **The logo.** The Twogood Productions mark (`src/components/LogoBrand.astro`, PNG exports in `public/assets/`) stays as is.
- **The wordmark "Jeremy Twogood."** with the terminal period as the site's title treatment.
- **First-person, plain voice.** Copy is first person, specific, and plain. No em dashes, no slogans, no forced contrasts.

Explicitly not binding: the amber accent (`#c8922a`), the dark near-black base, the alternating dark/light sections, and the current typefaces (Syne, Inter, Montserrat, JetBrains Mono). A redesign may keep or replace any of them.

## Evidence on Hand

- **Video work:** 8 projects in `src/data/projects.json` (Shell, Simbility, Talk T.O. My Stomach x2, Microsoft Xbox, Thales Canada, NS Health, and CAOT marked coming soon), 2016 to 2026. Per-project descriptions and video IDs in `src/data/video-content.json`. Real stills and thumbnails in `public/assets/`, six silent hover loops (`public/assets/<name>-loop.mp4|webm`), and a portrait (`public/assets/portrait.jpg`).
- **Reel:** YouTube `Tl1n3hu4e8I` (`src/data/reel-index.json`).
- **Software:** 5 entries in `src/data/ai-builds.json`: Unbusy Scanner (live), Gibbon Knight (live), Pedal Path (live on the App Store, `id6784479426`), Production Intelligence (internal), MCP Integrator (beta). Product screenshots for Gibbon Knight and Pedal Path in `public/assets/`.
- **Music:** 10 SoundCloud tracks in `profile.json` with real waveform peaks in `src/data/waveforms.json`.
- **Clients (canonical, `profile.json`, merged 2026-09-14):** Google, Microsoft Xbox, Shell, Sony Ericsson, Sobeys, Mirvish Productions, Canova Media, Journeyman Film Company, Volvo, Mitsubishi Motors, Simbility, NS Health, Thales Canada, Ewing Morris & Co.
- **Absent, do not fabricate:** testimonials, awards, press, view counts, client quotes, and any metric beyond "twenty years" and the real project count.

## Product Principles

1. **The work leads.** The first viewport shows footage or the reel, not a statement about it. The interface recedes.
2. **Prove range with real material.** Broadcast, documentary, corporate, and software are all shown through real deliverables; claims never stand in for them.
3. **Two visitors, one path.** Vetting and booking both need reel, work, who he is, and contact within seconds; the order and hierarchy serve both without a mode switch.
4. **Craft signals come from the trade.** Timecode, waveforms, and edit timelines are real objects from editing, used truthfully, not as decoration.
5. **Readable by agents as well as people.** Structured data and the MCP surface stay current with anything the human site says.

## Accessibility & Inclusion

Established requirements: full content without JavaScript, `prefers-reduced-motion` honoured for every animation, keyboard-operable navigation and controls, and WCAG AA contrast as the working target for text. No formal audit standard has been mandated beyond this.
