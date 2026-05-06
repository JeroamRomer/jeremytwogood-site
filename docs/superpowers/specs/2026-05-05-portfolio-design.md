# Jeremy Twogood — Portfolio Site Design Spec
**Date**: 2026-05-05  
**Status**: Approved for implementation planning  
**Repo**: `JeroamRomer.github.io`  
**Domain**: `jeremytwogood.com`  
**Framework**: Astro 4.x (static output → GitHub Pages)

---

## 1. Identity & Tone

**Primary identity**: Multimedia producer and video editor — craft first, technology second.  
**Secondary identity**: AI tooling builder — demonstrates technical depth, not a competing brand.  
**Tagline direction**: "Full-Service Media Production" updated to something that signals both craft and future-readiness (exact copy TBD by owner).  
**Structured data classification**: `Person` schema with `jobTitle: "Multimedia Producer & Video Editor"`, supplemented by `knowsAbout` entries covering AI tooling.

---

## 2. Technical Architecture

### Framework & Deployment
- **Astro 4.x** in static output mode (`output: 'static'`)
- **GitHub Actions** CI: on push to `main` → `astro build` → deploy `dist/` to `gh-pages` branch
- **Custom domain**: `jeremytwogood.com` via CNAME file in `public/`
- **Node**: 22 LTS or later (24 LTS also supported)

### File Structure
```
/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Main scrollable single-page
│   │   ├── reel.astro               # /reel — standalone deep-link
│   │   └── ai-builds.astro          # /ai-builds — standalone deep-link
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── Reel.astro
│   │   ├── Clients.astro
│   │   ├── Projects.astro
│   │   ├── AIBuilds.astro           # Previews 4 cards + "see all" link
│   │   ├── AIBuildsGrid.astro       # Full grid used on /ai-builds
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── BaseLayout.astro         # JSON-LD injection, meta, MCP hints, OG tags
│   └── data/                        # Single source of truth (feeds UI + agents)
│       ├── profile.json             # Name, title, bio, skills, availability
│       ├── projects.json            # Video work entries
│       ├── ai-builds.json           # AI/software project entries
│       └── reel-index.json          # Reel clip timestamp map
├── public/
│   ├── agent-data.json              # Aggregated at build time — served at root
│   ├── reel-index.json              # Copy of src/data/reel-index.json
│   ├── availability.json            # Manually updated availability signal
│   ├── llms.txt                     # Plain-text LLM discovery file
│   ├── robots.txt                   # AI-welcoming robots file
│   ├── CNAME                        # jeremytwogood.com
│   └── .well-known/
│       └── agent.json               # MCP-compatible agent manifest
├── HIRE.md                          # Repo-root plain-text hiring signal
├── astro.config.mjs
└── package.json
```

### Key Principle: Single Source of Truth
All content lives in `src/data/*.json`. Astro components import these files at build time to render the UI. A pre-build script (`scripts/build-agent-data.js`) runs before `astro build` and does three things: (1) merges `profile.json`, `projects.json`, `ai-builds.json`, and `reel-index.json` into `public/agent-data.json`; (2) copies `reel-index.json` to `public/reel-index.json`; (3) stamps `generated_at` with the current build timestamp. The `package.json` `build` script is `node scripts/build-agent-data.js && astro build`. **Update one JSON file → both the human site and agent-readable endpoints update together.**

---

## 3. Pages & Sections

### `index.astro` — Main Scrollable Page

| Order | Section | Background | Key Content |
|-------|---------|-----------|-------------|
| 1 | `#hero` | Dark charcoal + amber | Name, title, one-line bio, CTA → #reel |
| 2 | `#reel` | Dark charcoal | YouTube Demo Sizzle embed, amber accent |
| 3 | `#clients` | Dark → mid charcoal | Logo grid: Sony Ericsson, Google, Xbox, Shell, Sobeys, Volvo, Mitsubishi, Irish Productions, Canova Media |
| 4 | `#projects` | Off-white | Video work cards with role tags, client name, YouTube link |
| 5 | `#ai-builds` | Off-white | 4 featured AI project cards + "See all builds →" → /ai-builds |
| 6 | `#contact` | Off-white | Email link + social icons (YouTube, Vimeo, Instagram, SoundCloud, Twitter/X) |

**Nav**: Sticky top, dark charcoal background, amber hover state. Links: Work · Reel · AI Builds · Contact. On scroll past hero, nav compresses to compact mode.

### `/reel` — Reel Standalone Page
- Renders the `Reel` component full-width
- Includes full `reel-index.json` embedded as a `<script type="application/json" id="reel-index">` block
- Full JSON-LD `VideoObject` block for the Demo Sizzle
- Shareable URL for casting directors, recruiters, and AI agents

### `/ai-builds` — AI Builds Standalone Page
- Renders `AIBuildsGrid` — full expandable grid of all AI/software projects
- Each card: name, description, tech stack tags, role, status badge (Live / In Dev / Archived), GitHub link, live URL
- Initial projects: The Gibbon Knight, Rome Brone, Unbusy App, Bike App
- Designed to grow to 20+ projects — no restructuring required, just add entries to `ai-builds.json`
- JSON-LD `ItemList` of `SoftwareApplication` entries in page head

---

## 4. Visual Design

**Deferred** — exact CSS, typography, and component styling will be applied from a Claude Design prompt provided separately.

**Palette contract** (to be honoured by the design prompt):
- Hero / Reel / Clients: deep charcoal background, warm amber accent (`#F5A623` or equivalent)
- Projects / AI Builds / Contact: off-white / near-white background, dark charcoal text
- Transition between zones: gradient or angled divider

**Component contract** (structural, not styled):
- All sections use semantic HTML5 elements (`<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`)
- All interactive elements have ARIA labels
- Responsive: mobile-first, single-column on small screens, grid on desktop
- No JS required for core content — Astro ships zero JS by default

---

## 5. Agent Data Layer

### Layer 1 — JSON-LD Structured Data (in BaseLayout `<head>`)

**Person schema** (every page):
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Jeremy Twogood",
  "url": "https://jeremytwogood.com",
  "jobTitle": "Multimedia Producer & Video Editor",
  "description": "Full-service media producer and video editor with clients including Google, Microsoft Xbox, Shell, and Sony Ericsson. Builder of AI-augmented production tools.",
  "knowsAbout": ["Video Editing", "Motion Graphics", "Colour Grading", "Aerial Videography", "AI Tooling", "Claude API", "Software Development"],
  "sameAs": [
    "https://www.youtube.com/@JeremyTwogood",
    "https://vimeo.com/twogoodproductions",
    "https://www.instagram.com/jeremytwogood",
    "https://soundcloud.com/jeroam",
    "https://github.com/JeroamRomer"
  ]
}
```

**VideoObject schema** (BaseLayout + /reel page):
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Demo Sizzle — Twogood Productions",
  "description": "Demo sizzle reel showcasing video editing, motion graphics, colour grade, and aerial work for clients including Google, Xbox, Shell, and Sobeys.",
  "thumbnailUrl": "TBD",
  "uploadDate": "TBD",
  "contentUrl": "TBD (YouTube URL)"
}
```

**ItemList of SoftwareApplication** (/ai-builds page):
One `SoftwareApplication` entry per AI build, with `name`, `description`, `applicationCategory`, `url`.

### Layer 2 — Static JSON Endpoints

#### `/agent-data.json`
```json
{
  "schema_version": "1.0",
  "generated_at": "<build timestamp>",
  "profile": {
    "name": "Jeremy Twogood",
    "title": "Multimedia Producer & Video Editor",
    "description": "TBD — owner to supply bio",
    "location": "Ontario, Canada",
    "email": "TBD",
    "website": "https://jeremytwogood.com"
  },
  "skills": ["Video Editing", "Motion Graphics", "Colour Grading", "Aerial Videography", "Animation", "AI Tooling", "Claude API"],
  "clients": ["Google", "Microsoft Xbox", "Shell", "Sony Ericsson", "Sobeys", "Volvo", "Mitsubishi Motors", "Canova Media"],
  "availability_url": "https://jeremytwogood.com/availability.json",
  "sections": [
    { "id": "hero", "label": "Home", "url": "/#hero" },
    { "id": "reel", "label": "Reel", "url": "/reel" },
    { "id": "clients", "label": "Clients", "url": "/#clients" },
    { "id": "projects", "label": "Projects", "url": "/#projects" },
    { "id": "ai-builds", "label": "AI Builds", "url": "/ai-builds" },
    { "id": "contact", "label": "Contact", "url": "/#contact" }
  ],
  "endpoints": {
    "agent_data": "/agent-data.json",
    "reel_index": "/reel-index.json",
    "availability": "/availability.json",
    "agent_manifest": "/.well-known/agent.json"
  }
}
```

#### `/availability.json`
```json
{
  "schema_version": "1.0",
  "updated": "2026-05-05",
  "status": "open",
  "open_to": ["contract", "freelance", "full-time"],
  "roles": ["Video Editor", "Motion Graphics", "AI Tool Developer", "Creative Technologist"],
  "locations": ["Remote", "Ontario, Canada"],
  "note": "Available for project-based work immediately. Full-time open to discussion."
}
```
*This file is edited manually by Jeremy. When status changes, one file update propagates the signal to all agents.*

#### `/reel-index.json`
```json
{
  "schema_version": "1.0",
  "reel_url": "TBD (YouTube URL)",
  "clips": [
    {
      "name": "TBD",
      "description": "TBD",
      "client": "TBD",
      "role": "TBD",
      "tech_stack": [],
      "start_timestamp": "00:00",
      "end_timestamp": "00:00",
      "video_url": "TBD"
    }
  ]
}
```
*Populated via the `watch` skill — paste reel URL into Claude, run watch skill, output drops into `src/data/reel-index.json`. The build script copies it to `public/reel-index.json` automatically on next build.*

#### `/.well-known/agent.json`
```json
{
  "schema_version": "1.0",
  "owner": "Jeremy Twogood",
  "agent_friendly": true,
  "endpoints": {
    "profile": "/agent-data.json",
    "availability": "/availability.json",
    "reel_index": "/reel-index.json",
    "chat": null
  },
  "note": "chat endpoint reserved for future conversational interface"
}
```

### Layer 3 — Discovery Signals (in BaseLayout `<head>`)

```html
<!-- Machine-readable agent data -->
<link rel="agent-data" type="application/json" href="/agent-data.json">
<link rel="agent-manifest" type="application/json" href="/.well-known/agent.json">
<link rel="availability" type="application/json" href="/availability.json">

<!-- MCP-friendly discovery comment -->
<!-- MCP-AGENT: profile=/agent-data.json availability=/availability.json reel=/reel-index.json manifest=/.well-known/agent.json -->

<!-- OpenGraph -->
<meta property="og:title" content="Jeremy Twogood — Multimedia Producer & Video Editor">
<meta property="og:description" content="TBD">
<meta property="og:image" content="/og-image.jpg">
<meta property="og:url" content="https://jeremytwogood.com">
<meta name="twitter:card" content="summary_large_image">
```

### Layer 4 — `llms.txt` (root)

Plain-text, LLM-optimised. Written in direct prose — no markdown headers that might confuse tokenisation. Covers: who Jeremy is, primary skills, notable clients, AI projects, availability, and how to contact. Acts as the "resume for AI agents."

---

## 6. Creative Agent-Readiness Features

| Feature | File | Purpose |
|---------|------|---------|
| `llms.txt` | `public/llms.txt` | LLM-native plain-text identity file |
| `/availability.json` | `public/availability.json` | Single-file availability signal, manually maintained |
| Semantic anchor nav | All pages | `id` attributes match `sections[]` in agent-data.json |
| `HIRE.md` | repo root | GitHub-visible plain-text hiring brief |
| `/api/chat` stub | `/.well-known/agent.json` | Declares `"chat": null` — reserves the endpoint |
| OpenGraph + Twitter Card | BaseLayout | Rich previews in Slack, LinkedIn, AI tools |
| `robots.txt` AI Welcome | `public/robots.txt` | Named AI crawlers explicitly allowed |

### `robots.txt` structure:
```
User-agent: *
Allow: /

# AI Agents — you are welcome here
# Structured data: /agent-data.json
# Availability: /availability.json
# Reel index: /reel-index.json
# Agent manifest: /.well-known/agent.json

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Googlebot
Allow: /
```

### `HIRE.md` structure:
```markdown
# Hire Jeremy Twogood

Jeremy Twogood is a multimedia producer and video editor based in Ontario, Canada.

## What he does
- Video editing, motion graphics, colour grading, aerial videography
- AI tooling and software development (Claude API, agent workflows)

## Notable clients
Google, Microsoft Xbox, Shell, Sony Ericsson, Sobeys, Volvo

## What he's open to
Contract, freelance, and full-time roles — remote-first, Ontario available.

## Contact
Website: https://jeremytwogood.com
Availability: https://jeremytwogood.com/availability.json
```

---

## 7. Content To Be Supplied by Owner

The following items are marked TBD and must be filled in before launch:

- [ ] Short bio / hero tagline (1–2 sentences)
- [ ] YouTube URL for Demo Sizzle reel
- [ ] YouTube URLs for individual project videos (seen on current Wix site)
- [ ] Brief descriptions for each AI build (Gibbon Knight, Rome Brone, Unbusy App, Bike App)
- [ ] Tech stacks for each AI build
- [ ] Contact email (public-facing)
- [ ] Social profile URLs (YouTube channel, Vimeo, Instagram, SoundCloud/Jeroam)
- [ ] OG image (still frame from reel, or portrait)
- [ ] Reel index timestamps (via `watch` skill — see Section 8)
- [ ] Availability status review on launch

---

## 8. Reel-to-Agent-Data Pipeline

Once the Demo Sizzle YouTube URL is confirmed:

1. Open a Claude session with the `watch` skill loaded
2. Run: `watch [YouTube URL] — output a reel-index.json matching this schema: [paste reel-index.json schema]`
3. Claude watches the video and outputs a JSON array of clips with names, descriptions, roles, timestamps
4. Paste the output into `src/data/reel-index.json`
5. Run `npm run build` — the build script copies it to `public/reel-index.json` automatically

---

## 9. GitHub Pages + Domain Setup Checklist

- [ ] Create repo named `JeroamRomer.github.io` on GitHub (public)
- [ ] Push all files to `main` branch
- [ ] Add `public/CNAME` file containing `jeremytwogood.com`
- [ ] In repo Settings → Pages → Source: GitHub Actions (use the Astro deploy workflow)
- [ ] In Google Domains DNS settings:
  - Add 4 A records pointing to GitHub Pages IPs:
    - `185.199.108.153`
    - `185.199.109.153`
    - `185.199.110.153`
    - `185.199.111.153`
  - Add 1 AAAA records (IPv6) if desired
  - Add CNAME record: `www` → `JeroamRomer.github.io`
- [ ] Back in GitHub repo Settings → Pages → Custom domain: enter `jeremytwogood.com` and enable "Enforce HTTPS"
- [ ] Wait 10–30 min for DNS propagation
- [ ] Verify at `https://jeremytwogood.com`

---

## 10. Out of Scope (Explicitly Deferred)

- Visual CSS / component styling (awaiting Claude Design prompt)
- Music / SoundCloud section (not included in new site — owner to revisit if desired)
- Home Brewing section (removed)
- Conversational AI widget (chat endpoint reserved as `null`, implementation deferred)
- CMS or dynamic backend (pure static for now)
- Analytics (can be added later via Plausible or Fathom script tag)
