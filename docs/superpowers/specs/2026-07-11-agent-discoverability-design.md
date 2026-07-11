# Agent Discoverability Package — Design

**Date:** 2026-07-11
**Status:** Approved (design review in session)
**Scope:** jeremytwogood.com only. Pedal Path MCP work is a separate future project.

## Goal

Make Jeremy's live MCP server (`POST https://jeremytwogood.com/api/mcp`) discoverable
through the channels that exist in mid-2026, and strengthen the site's visibility in
AI search answers ("find me a video producer in Toronto").

Research findings that shaped this design:

- AI assistants answering service-provider queries use **web search + page reading**,
  not MCP lookups. llms.txt is fetched by ~0.1% of AI bot traffic — keep it cheap,
  don't invest in it as a channel.
- The **official MCP Registry** (registry.modelcontextprotocol.io) accepts remote
  streamable-HTTP servers, verifies domain namespaces (DNS TXT or HTTP challenge),
  and feeds downstream aggregators (PulseMCP, Glama, mcp.so, Smithery). Still in
  preview; data resets possible, republishing is cheap.
- The ecosystem has converged on a **server card** at
  `/.well-known/mcp/server-card.json` (SEP-2127 / SEP-1649) for pre-connection
  discovery. Not yet merged to core spec; shape may need small future tweaks.
- AI recommendation engines favor: expertise stated plainly, corroboration across
  independent sites, structured extractable facts (schema.org), freshness.

## Decisions (made in design review)

1. **Write-up lives at a standalone `/mcp` page** + LinkedIn draft copy (not posted
   by Claude). No blog section.
2. **Registry namespace: `com.jeremytwogood`** (domain-verified). Not io.github.
3. **Directory submissions: Claude drives** via Chrome extension after registry
   ingestion window; Jeremy logs in/approves where needed.
4. **Sync approach: single-source manifest** (Approach A). One manifest feeds the
   build script and the API code; generated artifacts cannot drift from real tools.

## Architecture

### 1. Single-source manifest — `src/data/mcp-manifest.json`

Holds:
- Server identity: registry name `com.jeremytwogood/portfolio`, human title,
  description, endpoint URL, version, website URL.
- `tools[]`: for each of the 10 tools — `name`, `description`, `kind`
  (`open` | `action`), rate-limit note for action tools.

`api/_lib/tools-open.ts` and `api/_lib/tools-actions.ts` are refactored to import
tool **names and descriptions** from the manifest. Zod input schemas and handler
logic stay in TypeScript, untouched. `npm run test:mcp` guards behavior; a test
asserts every registered tool appears in the manifest and vice versa.

### 2. Generated artifacts — `scripts/build-agent-data.js`

The script already generates `agent-data.json` and `.well-known/` files pre-build.
It additionally emits, from the manifest:

- **`public/.well-known/mcp/server-card.json`** — SEP-2127 shape:
  `name`, `description`, `version`, `serverUrl`, `protocolVersion`,
  `capabilities: { tools: true, resources: false, prompts: false }`,
  transports (streamable-http), auth (none), `tools[]` with descriptions.
- **`server.json`** (repo root, committed) — official MCP Registry publish format:
  `name: com.jeremytwogood/portfolio`, description, version,
  `remotes: [{ type: "streamable-http", url: "https://jeremytwogood.com/api/mcp" }]`.
  Exact field names validated against the registry's server.schema.json at
  implementation time.
- **`public/llms.txt`** — becomes fully generated (template in the script + tool
  list from manifest). Currently hand-written; the tool list becomes un-driftable.
- **`public/.well-known/agent.json`** — regenerated; fixes the stale `chat: null`
  endpoint (chat API live since 2026-06-26) and adds the `mcp` endpoint + server
  card pointer.
- **`public/.well-known/mcp`** (legacy custom file) — kept for compat, regenerated
  with a `see_also` pointer to the standard server card.

`public/robots.txt` (static) gains a comment line pointing at the server card.

### 3. Registry publish (ops, after deploy)

1. Verify `com.jeremytwogood` namespace. Try **HTTP challenge first** (we control
   the site; avoids Wix DNS panel). Fall back to a DNS TXT record handed to Jeremy
   to add in Wix.
2. Install `mcp-publisher` CLI, authenticate, `mcp-publisher publish` with the
   generated `server.json`.
3. Verify the entry appears via the registry REST API.

### 4. Directory submissions (ops)

~1 day after registry publish, check PulseMCP, Glama, mcp.so, Smithery for
auto-ingestion. Submit manually via Chrome extension where absent. Jeremy handles
logins; nothing is submitted without his sight of it.

### 5. Schema.org enrichment

- **`BaseLayout.astro` Person schema** gains: `@id` anchor, `address`
  (`addressLocality: Toronto, addressRegion: ON, addressCountry: CA` — no street),
  `email`, `image` (portrait), `hasOccupation`.
- **New `ProfessionalService` node** on the homepage: name, `provider` → Person
  `@id`, `areaServed` (Toronto + Remote), `serviceType` list (corporate video,
  documentary, video editing, motion graphics, AI tooling), `url`.
- **Case-study `VideoObject`** (`work/[id].astro`) gains `keywords`/`genre` from
  the `themes` already in `video-content.json`.

### 6. `/mcp` page — `src/pages/mcp.astro`

Site-styled evergreen page:
- The story: an AI agent can read the portfolio, check availability, message
  Jeremy, and book a call — no human required.
- Tool table rendered **from the manifest** at build time.
- Connect instructions: claude.ai custom connector, generic MCP client config,
  endpoint URL, rate limits.
- `FAQPage` JSON-LD with real questions (e.g. "Can an AI agent book a call with
  Jeremy?", "Does the MCP server require authentication?").
- Footer link from the main site.

LinkedIn draft copy saved to `docs/marketing/2026-07-linkedin-mcp-post.md`.
Claude does not post it anywhere.

### 7. Testing

Extend the existing smoke suite (build runs first):
- `dist/.well-known/mcp/server-card.json` exists, parses, has required fields,
  and its tool list matches the manifest exactly.
- `dist/llms.txt` contains every manifest tool name.
- `/mcp` page HTML lists every manifest tool.
- JSON-LD blocks on home + one case study parse as valid JSON with expected
  `@type`s.
- `server.json` parses and points at the production endpoint.
- `npm run test:mcp` remains green (manifest/tool parity test added).

## Sequencing

1. Code: manifest → generated artifacts → schema enrichment → `/mcp` page → tests
2. Merge to `main`, Vercel deploys
3. Ops: registry namespace verification + publish
4. Ops: directory sweep

## Out of scope

- Pedal Path (separate repo/project; MCP-as-product-feature brainstorm later)
- MCP 2026-07-28 spec migration for `api/mcp.ts` (stateless core, `server/discover`)
  — maintenance item, tracked separately
- Third-party corroboration work (directories like ProductionHUB, testimonials,
  Google Business Profile) — valuable for AI search but human-driven, not build work
