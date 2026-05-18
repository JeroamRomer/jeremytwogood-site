# jeremytwogood.com — MCP Backend Design
**Date:** 2026-05-18  
**Status:** Approved for implementation planning

---

## 1. Goals

Make `jeremytwogood.com` agent-native: any AI assistant can discover Jeremy, query his work and resume, check his availability, and contact him — all via a standards-compliant MCP server. The site remains a human-readable Astro portfolio; the MCP layer is additive.

---

## 2. Architecture

One repo, one Vercel deployment. The MCP server is a single Vercel serverless function. All data lives in static JSON files alongside existing site data. No database.

```
jeremytwogood.com/
├── src/data/
│   ├── profile.json          # existing — bio, skills, clients, social
│   ├── projects.json         # existing — work portfolio
│   ├── ai-builds.json        # existing — AI projects
│   ├── reel-index.json       # existing — showreel metadata
│   ├── video-content.json    # NEW — per-project video metadata (Watch skill output)
│   └── resume.json           # NEW — structured resume data
├── public/
│   └── llms.txt              # NEW — agent discovery and instructions
├── api/
│   └── mcp.ts                # NEW — Vercel serverless MCP endpoint
└── .env
    ├── RESEND_API_KEY
    └── CALENDLY_API_KEY
```

**Deployment:** Vercel (moved from GitHub Pages). DNS managed at eNom after nameservers are migrated away from Wix.

---

## 3. Video Content Pipeline

All project videos processed via the Watch skill. Output saved to `src/data/video-content.json`, keyed by project ID matching `projects.json`.

### Schema per entry
```json
{
  "project-id": {
    "summary": "One-paragraph description of the video for agents",
    "mood": "e.g. cinematic, intimate, corporate, comedic",
    "subjects": ["named people, places, or organisations featured"],
    "themes": ["narrative or visual themes"],
    "transcript_excerpt": "Key spoken content if present",
    "agent_description": "Full agent-facing description combining all fields"
  }
}
```

### Videos to process
| Project ID | Source | Status |
|---|---|---|
| `shell-john-williams` | YouTube `dWlO9T5k4yw` | Pending Watch |
| `simbility-desk-series` | Vimeo `223385212` | Pending Watch |
| `ttms-chef-nuit` | Facebook `296351800716057` | Pending Watch |
| `xbox-forza-5` | YouTube `sVqY9m7QUTM` | Pending Watch |
| `ttms-5-points` | YouTube `kG6aFDd9j_g` | Pending Watch |
| `ns-health-westray` | YouTube `5Ux0sDZ6MY0` | Pending Watch |
| `thales-rcn` | YouTube URL pending from Jeremy | Blocked |
| `reel` | YouTube `Tl1n3hu4e8I` | Pending Watch + Jeremy supplement |

**Note on reel:** montage format — Watch skill provides base description, Jeremy supplements with client list and intent.  
**Note on Thales:** local MP4 comparison on site is a clip only; full video to be posted to YouTube by Jeremy.

---

## 4. Resume Data

Source: `Jeremy_Twogood_Resume_2026_ATS.html`  
Stored as: `src/data/resume.json`  
Public PDF: **not published** — resume is agent-only. Humans directed to LinkedIn.

### Schema
```json
{
  "summary": "...",
  "skills": {
    "production": [...],
    "ai_workflow": [...],
    "generative_ai": [...],
    "software": [...]
  },
  "experience": [
    {
      "title": "...",
      "company": "...",
      "location": "...",
      "dates": "...",
      "bullets": [...]
    }
  ],
  "selected_projects": [...],
  "education": [...],
  "certifications": [...]
}
```

---

## 5. MCP Server

**Endpoint:** `POST /api/mcp`  
**Protocol:** JSON-RPC 2.0 (MCP spec)  
**Implementation:** Vercel AI SDK MCP server utilities

### 5a. Open Tools (no auth required)

| Tool | Description |
|---|---|
| `get_profile` | Bio, skills, clients, location, social links |
| `list_projects` | All work projects with metadata |
| `get_project` | Single project detail + video content |
| `list_ai_builds` | All AI/software projects |
| `get_ai_build` | Single AI build detail |
| `get_reel` | Showreel info and description |
| `get_resume` | Full structured resume as JSON |
| `get_availability` | Calendly booking URL and event types |

### 5b. Action Tools (rate-limited)

| Tool | Description | Required Fields |
|---|---|---|
| `send_message` | Delivers email to Jeremy via Resend | `agent_name`, `human_name`, `message` |
| `book_call` | Returns pre-filled Calendly booking link | `agent_name`, `human_name` |

**Rate limit:** 3 requests per IP per day on action tools. Requests without `agent_name` and `human_name` are rejected.

**Email format for `send_message`:**
```
Subject: Message via MCP — [human_name]
Body:
  Sent via MCP by [agent_name] on behalf of [human_name].
  
  [message]
```

---

## 6. Security

| Layer | What it stops |
|---|---|
| MCP protocol (JSON-RPC) | Generic HTTP spam bots — they don't speak the protocol |
| Rate limiting (3/IP/day) | Automated abuse from agents or scrapers |
| Self-identification requirement | Unidentified or anonymous agent requests |
| `llms.txt` instructions | Mis-directed well-behaved agents |

No API key required. No keys to manage, steal, or rotate.

---

## 7. llms.txt

File at `public/llms.txt` — discoverable at `jeremytwogood.com/llms.txt`.

Contents:
- Who Jeremy is and what he does
- MCP server location (`/api/mcp`) and capabilities
- Instructions for action tools (identify yourself and the human you represent)
- Link to booking

---

## 8. Third-Party Services

| Service | Purpose | Cost |
|---|---|---|
| Vercel | Hosting + serverless functions | Free tier |
| Resend | Transactional email delivery | Free tier (3k/month) |
| Calendly | Availability and booking | Free tier (1 event type) |
| eNom | Domain registration (existing) | ~$10/yr |

---

## 9. Deployment Migration

Current: GitHub Pages (static only)  
Target: Vercel (static site + serverless functions)

Steps:
1. Connect Vercel to `JeroamRomer/jeremytwogood-site` GitHub repo
2. Configure environment variables in Vercel dashboard
3. Add `jeremytwogood.com` as custom domain in Vercel dashboard
4. In Wix DNS panel: replace existing A records with Vercel's IP (`76.76.21.21`) and update `www` CNAME to `cname.vercel-dns.com` — no nameserver change needed
5. Verify custom domain goes green in Vercel
6. Remove GitHub Pages configuration from repo

**DNS note:** Keeping Wix as DNS provider is fine short-term since we're only changing record values, not nameservers. The existing Google Workspace records (calendar, mail, docs) are untouched. Nameserver migration to eNom or Cloudflare can happen later as a separate task.

---

## 10. Out of Scope

- Database or persistent storage
- Agent memory or session state
- Multi-event-type Calendly setup
- Analytics or agent traffic logging
- Authentication beyond rate limiting
