# Agent Discoverability Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live MCP server at `https://jeremytwogood.com/api/mcp` discoverable via the official MCP Registry, the SEP-2127 server card, and AI search — all generated from one manifest so nothing drifts.

**Architecture:** A single `src/data/mcp-manifest.json` is the source of truth for server identity and tool metadata. The API (`api/_lib/server.ts`) imports descriptions from it; `scripts/build-agent-data.js` generates every discovery artifact from it (server card, registry `server.json`, `llms.txt`, `agent.json`); the new `/mcp` page renders its tool table from it. Schema.org JSON-LD is enriched in the Astro layouts. Ops tasks (registry publish, directory sweep) run after deploy.

**Tech Stack:** Astro 6 (static, `public/` copied verbatim to `dist/`), Vercel (serverless `api/`, zero-config), `@modelcontextprotocol/sdk` ^1.29, Node 22 `node:test` (+ tsx for `.ts` tests), `mcp-publisher` CLI.

**Spec:** `docs/superpowers/specs/2026-07-11-agent-discoverability-design.md`

**Deviation from spec (approved rationale):** The spec said to keep the legacy custom file `public/.well-known/mcp` alongside a card at `/.well-known/mcp/server-card.json`. Impossible: `mcp` can't be both a file and a directory. The legacy file is our own invention with no known consumers, so it is **deleted** and replaced by the `mcp/` directory. The canonical card lives at `/.well-known/mcp-server-card` (SEP-2127's ratified path); `/.well-known/mcp/server-card.json` is served as an identical copy because that alternate path circulates widely in aggregator tooling.

**Working-tree caution:** The repo has unrelated uncommitted changes (`.gitignore`, `public/agent-data.json`, two logo PNGs in `public/assets/`). Do NOT commit or revert them. Stage files explicitly by path in every commit — never `git add -A` or `git add .`.

---

## Task 1: MCP manifest + tool parity test + server.ts refactor

**Files:**
- Create: `src/data/mcp-manifest.json`
- Create: `tests/mcp-manifest.test.ts`
- Modify: `api/_lib/server.ts`
- Modify: `package.json` (add new test file to `test:mcp`)

- [ ] **Step 1: Create the manifest**

Tool descriptions below are copied **verbatim** from the current `server.tool(...)` calls in `api/_lib/server.ts` — behavior must not change.

Create `src/data/mcp-manifest.json`:

```json
{
  "server": {
    "registryName": "com.jeremytwogood/portfolio",
    "mcpName": "jeremytwogood-mcp",
    "title": "Jeremy Twogood — Portfolio",
    "description": "Portfolio MCP server for Jeremy Twogood, Toronto video producer & editor. Projects, reel, resume, booking.",
    "version": "1.0.0",
    "endpoint": "https://jeremytwogood.com/api/mcp",
    "websiteUrl": "https://jeremytwogood.com",
    "transport": "streamable-http"
  },
  "rateLimit": "Action tools (send_message, book_call) are limited to 3 requests per IP per day.",
  "tools": [
    { "name": "get_profile", "kind": "open", "description": "Get Jeremy Twogood's profile — bio, skills, clients, location, and social links." },
    { "name": "list_projects", "kind": "open", "description": "List all of Jeremy's work projects with metadata." },
    { "name": "get_project", "kind": "open", "description": "Get full details for a single project, including video content description." },
    { "name": "list_ai_builds", "kind": "open", "description": "List all of Jeremy's AI and software projects." },
    { "name": "get_ai_build", "kind": "open", "description": "Get full details for a single AI or software project." },
    { "name": "get_reel", "kind": "open", "description": "Get Jeremy's showreel description and link." },
    { "name": "get_resume", "kind": "open", "description": "Get Jeremy's full structured resume as JSON." },
    { "name": "get_availability", "kind": "open", "description": "Get Jeremy's booking URL and availability information." },
    { "name": "send_message", "kind": "action", "description": "Send a message to Jeremy by email. Requires agent_name (your identifier) and human_name (the person you represent). Rate limited to 3 action requests per IP per day." },
    { "name": "book_call", "kind": "action", "description": "Get a pre-filled Calendly booking link for a call with Jeremy. Requires agent_name and human_name. Rate limited to 3 action requests per IP per day." }
  ]
}
```

- [ ] **Step 2: Write the failing parity test**

Create `tests/mcp-manifest.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../api/_lib/server.ts';
import manifest from '../src/data/mcp-manifest.json' with { type: 'json' };

test('manifest: live tool list matches mcp-manifest.json exactly', async () => {
  const server = createServer('manifest-parity-test-ip');
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'manifest-parity-test', version: '0.0.0' });
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

  const { tools } = await client.listTools();
  const live = new Map(tools.map((t) => [t.name, t.description]));
  const declared = new Map(manifest.tools.map((t) => [t.name, t.description]));

  assert.deepEqual(
    [...live.keys()].sort(),
    [...declared.keys()].sort(),
    'registered tool names must match manifest tool names'
  );
  for (const [name, description] of declared) {
    assert.equal(live.get(name), description, `description mismatch for ${name}`);
  }
  await client.close();
});

test('manifest: server identity fields are coherent', () => {
  assert.equal(manifest.server.registryName, 'com.jeremytwogood/portfolio');
  assert.ok(manifest.server.endpoint.startsWith('https://jeremytwogood.com/'));
  assert.equal(manifest.tools.length, 10);
  assert.equal(manifest.tools.filter((t) => t.kind === 'action').length, 2);
});
```

- [ ] **Step 3: Add the test to the `test:mcp` script and run it — it must pass already (descriptions were copied verbatim), which proves the baseline**

In `package.json`, change:

```json
"test:mcp": "node --import tsx --test tests/mcp-rate-limit.test.ts tests/mcp-tools-open.test.ts tests/mcp-tools-actions.test.ts",
```

to:

```json
"test:mcp": "node --import tsx --test tests/mcp-rate-limit.test.ts tests/mcp-tools-open.test.ts tests/mcp-tools-actions.test.ts tests/mcp-manifest.test.ts",
```

Run: `npm run test:mcp`
Expected: ALL PASS (the parity test passes because manifest descriptions are verbatim copies. If it fails, the manifest has a typo — fix the manifest, not the server).

- [ ] **Step 4: Refactor server.ts to source descriptions and version from the manifest**

Replace the full contents of `api/_lib/server.ts` with:

```ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { checkRateLimit } from './rate-limit.js';
import manifest from '../../src/data/mcp-manifest.json' with { type: 'json' };
import {
  handleGetProfile,
  handleListProjects,
  handleGetProject,
  handleListAiBuilds,
  handleGetAiBuild,
  handleGetReel,
  handleGetResume,
  handleGetAvailability,
} from './tools-open.js';
import { handleSendMessage, handleBookCall } from './tools-actions.js';

function desc(name: string): string {
  const tool = manifest.tools.find((t) => t.name === name);
  if (!tool) throw new Error(`Tool missing from mcp-manifest.json: ${name}`);
  return tool.description;
}

export function createServer(clientIp: string): McpServer {
  const server = new McpServer({
    name: manifest.server.mcpName,
    version: manifest.server.version,
  });

  server.tool('get_profile', desc('get_profile'), {}, handleGetProfile);

  server.tool('list_projects', desc('list_projects'), {}, handleListProjects);

  server.tool('get_project', desc('get_project'), {
    id: z.string().describe('Project ID — get valid IDs from list_projects'),
  }, handleGetProject);

  server.tool('list_ai_builds', desc('list_ai_builds'), {}, handleListAiBuilds);

  server.tool('get_ai_build', desc('get_ai_build'), {
    id: z.string().describe('Build ID — get valid IDs from list_ai_builds'),
  }, handleGetAiBuild);

  server.tool('get_reel', desc('get_reel'), {}, handleGetReel);

  server.tool('get_resume', desc('get_resume'), {}, handleGetResume);

  server.tool('get_availability', desc('get_availability'), {}, handleGetAvailability);

  server.tool(
    'send_message',
    desc('send_message'),
    {
      agent_name: z.string().describe('Your agent name or identifier, e.g. "Claude"'),
      human_name: z.string().describe('The name of the human you represent'),
      message: z.string().describe('The message to send to Jeremy'),
    },
    async (params) => {
      const rl = checkRateLimit(clientIp);
      if (!rl.allowed) {
        return {
          content: [{ type: 'text' as const, text: 'Rate limit exceeded. Maximum 3 action requests per IP per day.' }],
          isError: true,
        };
      }
      return handleSendMessage(params);
    }
  );

  server.tool(
    'book_call',
    desc('book_call'),
    {
      agent_name: z.string().describe('Your agent name or identifier, e.g. "Claude"'),
      human_name: z.string().describe('The name of the human you represent'),
    },
    async (params) => {
      const rl = checkRateLimit(clientIp);
      if (!rl.allowed) {
        return {
          content: [{ type: 'text' as const, text: 'Rate limit exceeded. Maximum 3 action requests per IP per day.' }],
          isError: true,
        };
      }
      return handleBookCall(params);
    }
  );

  return server;
}
```

- [ ] **Step 5: Run the full MCP suite**

Run: `npm run test:mcp`
Expected: ALL PASS (parity test now proves the refactor changed nothing observable).

- [ ] **Step 6: Commit**

```bash
git add src/data/mcp-manifest.json tests/mcp-manifest.test.ts api/_lib/server.ts package.json
git commit -m "feat: single-source MCP tool metadata in mcp-manifest.json"
```

---

## Task 2: Generate discovery artifacts from the manifest

**Files:**
- Modify: `scripts/build-agent-data.js` (full replacement below)
- Modify: `tests/build-agent-data.test.js` (append tests)
- Delete: `public/.well-known/mcp` (legacy file — replaced by `mcp/` directory)
- Delete: `public/llms.txt` as a hand-maintained file (now generated into the same path)
- Create: `vercel.json`
- Modify: `public/robots.txt`

- [ ] **Step 1: Write the failing tests**

Append to `tests/build-agent-data.test.js` (the file already runs `node scripts/build-agent-data.js` via `execSync` at the top — new artifacts exist by the time tests run):

```js
// ── MCP discovery artifacts ─────────────────────────────────────────────────

const CARD = join(PUBLIC, '.well-known', 'mcp-server-card');
const CARD_ALT = join(PUBLIC, '.well-known', 'mcp', 'server-card.json');
const SERVER_JSON = join(ROOT, 'server.json');
const AGENT_JSON = join(PUBLIC, '.well-known', 'agent.json');
const LLMS_TXT = join(PUBLIC, 'llms.txt');
const manifest = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'mcp-manifest.json'), 'utf-8'));

test('server card: exists at canonical path and parses', () => {
  assert.ok(existsSync(CARD), '.well-known/mcp-server-card must exist');
  const card = JSON.parse(readFileSync(CARD, 'utf-8'));
  assert.equal(card.name, 'com.jeremytwogood/portfolio');
  assert.equal(card.remotes[0].type, 'streamable-http');
  assert.equal(card.remotes[0].url, 'https://jeremytwogood.com/api/mcp');
});

test('server card: alternate path is an identical copy', () => {
  assert.ok(existsSync(CARD_ALT), '.well-known/mcp/server-card.json must exist');
  assert.equal(readFileSync(CARD, 'utf-8'), readFileSync(CARD_ALT, 'utf-8'));
});

test('server card: tool list in _meta matches manifest exactly', () => {
  const card = JSON.parse(readFileSync(CARD, 'utf-8'));
  const cardTools = card._meta['com.jeremytwogood/tools'];
  assert.deepEqual(
    cardTools.map((t) => t.name).sort(),
    manifest.tools.map((t) => t.name).sort()
  );
});

test('legacy .well-known/mcp file is gone (replaced by directory)', () => {
  const legacy = join(PUBLIC, '.well-known', 'mcp');
  assert.ok(existsSync(legacy), '.well-known/mcp must exist (as a directory)');
  assert.ok(readdirSync(legacy).includes('server-card.json'), 'must be a directory containing server-card.json');
});

test('server.json: registry publish file is generated and valid', () => {
  assert.ok(existsSync(SERVER_JSON), 'server.json must exist at repo root');
  const sj = JSON.parse(readFileSync(SERVER_JSON, 'utf-8'));
  assert.equal(sj.name, 'com.jeremytwogood/portfolio');
  assert.ok(sj.$schema.includes('server.schema.json'));
  assert.equal(sj.remotes[0].type, 'streamable-http');
  assert.equal(sj.remotes[0].url, 'https://jeremytwogood.com/api/mcp');
  assert.ok(sj.description.length <= 100, 'registry limits description length');
});

test('agent.json: chat endpoint is live and mcp block present', () => {
  const aj = JSON.parse(readFileSync(AGENT_JSON, 'utf-8'));
  assert.equal(aj.endpoints.chat, '/api/chat');
  assert.equal(aj.endpoints.mcp, '/api/mcp');
  assert.equal(aj.mcp.server_card, '/.well-known/mcp-server-card');
});

test('llms.txt: generated and lists every manifest tool', () => {
  const txt = readFileSync(LLMS_TXT, 'utf-8');
  for (const tool of manifest.tools) {
    assert.ok(txt.includes(tool.name), `llms.txt must mention ${tool.name}`);
  }
  assert.ok(txt.includes('/.well-known/mcp-server-card'), 'llms.txt must point at the server card');
  assert.ok(txt.includes('https://jeremytwogood.com/mcp'), 'llms.txt must point at the /mcp docs page');
});

test('agent-data.json: endpoints include mcp surfaces', () => {
  const data = JSON.parse(readFileSync(AGENT_DATA, 'utf-8'));
  assert.equal(data.endpoints.mcp, '/api/mcp');
  assert.equal(data.endpoints.mcp_server_card, '/.well-known/mcp-server-card');
  assert.equal(data.endpoints.chat, '/api/chat');
});
```

Note: `readdirSync` is already imported in `tests/smoke.test.js` but check the import line at the top of `build-agent-data.test.js` — it imports `{ readFileSync, existsSync }` from `node:fs`. Extend it to `{ readFileSync, existsSync, readdirSync }`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/build-agent-data.test.js`
Expected: FAIL — new artifact tests fail (files don't exist yet); pre-existing tests still pass.

- [ ] **Step 3: Delete the legacy file and replace the build script**

```bash
git rm public/.well-known/mcp
```

Replace the full contents of `scripts/build-agent-data.js` with:

```js
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const DATA = join(ROOT, 'src', 'data');
const PUBLIC = join(ROOT, 'public');
const WELL_KNOWN = join(PUBLIC, '.well-known');

// Ensure output directories exist
mkdirSync(join(WELL_KNOWN, 'mcp'), { recursive: true });

const profile = JSON.parse(readFileSync(join(DATA, 'profile.json'), 'utf-8'));
const projects = JSON.parse(readFileSync(join(DATA, 'projects.json'), 'utf-8'));
const aiBuilds = JSON.parse(readFileSync(join(DATA, 'ai-builds.json'), 'utf-8'));
const reelIndex = JSON.parse(readFileSync(join(DATA, 'reel-index.json'), 'utf-8'));
const manifest = JSON.parse(readFileSync(join(DATA, 'mcp-manifest.json'), 'utf-8'));

// ── agent-data.json ──────────────────────────────────────────────────────────

const agentData = {
  schema_version: '1.1',
  generated_at: new Date().toISOString(),
  profile: {
    name: profile.name,
    title: profile.title,
    bio: profile.bioMeta,
    location: profile.location,
    email: profile.email,
    website: profile.website,
  },
  skills: profile.skills,
  clients: profile.clients,
  projects: projects.map(({ id, name, client, role, description, youtube_url }) => ({
    id,
    name,
    client,
    role,
    description,
    youtube_url,
  })),
  ai_builds: aiBuilds.map(({ id, name, description, tech_stack, role, status, github_url, live_url }) => ({
    id,
    name,
    description,
    tech_stack,
    role,
    status,
    github_url,
    live_url,
  })),
  reel: {
    url: reelIndex.reel_url,
    clips_count: reelIndex.clips.length,
    index_url: '/reel-index.json',
  },
  availability_url: 'https://jeremytwogood.com/availability.json',
  sections: [
    { id: 'hero',      label: 'Home',      url: '/#hero' },
    { id: 'reel',      label: 'Reel',      url: '/reel' },
    { id: 'clients',   label: 'Clients',   url: '/#clients' },
    { id: 'projects',  label: 'Projects',  url: '/#projects' },
    { id: 'ai-builds', label: 'AI Builds', url: '/ai-builds' },
    { id: 'contact',   label: 'Contact',   url: '/#contact' },
  ],
  endpoints: {
    agent_data:      '/agent-data.json',
    reel_index:      '/reel-index.json',
    availability:    '/availability.json',
    agent_manifest:  '/.well-known/agent.json',
    chat:            '/api/chat',
    mcp:             '/api/mcp',
    mcp_server_card: '/.well-known/mcp-server-card',
    mcp_docs:        '/mcp',
  },
};

writeFileSync(join(PUBLIC, 'agent-data.json'), JSON.stringify(agentData, null, 2), 'utf-8');
copyFileSync(join(DATA, 'reel-index.json'), join(PUBLIC, 'reel-index.json'));

// ── MCP server card (SEP-2127) ───────────────────────────────────────────────
// Canonical path: /.well-known/mcp-server-card
// Alternate copy: /.well-known/mcp/server-card.json (path circulating in aggregator tooling)

const serverCard = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
  name: manifest.server.registryName,
  title: manifest.server.title,
  description: manifest.server.description,
  version: manifest.server.version,
  websiteUrl: manifest.server.websiteUrl,
  remotes: [{ type: manifest.server.transport, url: manifest.server.endpoint }],
  _meta: {
    'com.jeremytwogood/tools': manifest.tools,
    'com.jeremytwogood/rate_limit': manifest.rateLimit,
    'com.jeremytwogood/docs': `${manifest.server.websiteUrl}/mcp`,
  },
};

const cardJson = JSON.stringify(serverCard, null, 2);
writeFileSync(join(WELL_KNOWN, 'mcp-server-card'), cardJson, 'utf-8');
writeFileSync(join(WELL_KNOWN, 'mcp', 'server-card.json'), cardJson, 'utf-8');

// ── server.json (official MCP Registry publish format) ──────────────────────

const serverJson = {
  $schema: 'https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json',
  name: manifest.server.registryName,
  title: manifest.server.title,
  description: manifest.server.description,
  version: manifest.server.version,
  websiteUrl: manifest.server.websiteUrl,
  remotes: [{ type: manifest.server.transport, url: manifest.server.endpoint }],
};

writeFileSync(join(ROOT, 'server.json'), JSON.stringify(serverJson, null, 2), 'utf-8');

// ── agent.json (agent manifest) ──────────────────────────────────────────────

const agentManifest = {
  schema_version: '1.1',
  owner: profile.name,
  agent_friendly: true,
  description: profile.bioMeta,
  endpoints: {
    profile: '/agent-data.json',
    availability: '/availability.json',
    reel_index: '/reel-index.json',
    chat: '/api/chat',
    mcp: '/api/mcp',
  },
  mcp: {
    endpoint: manifest.server.endpoint,
    transport: manifest.server.transport,
    server_card: '/.well-known/mcp-server-card',
    docs: '/mcp',
    rate_limit: manifest.rateLimit,
  },
};

writeFileSync(join(WELL_KNOWN, 'agent.json'), JSON.stringify(agentManifest, null, 2), 'utf-8');

// ── llms.txt ─────────────────────────────────────────────────────────────────

const toolLine = (t) => `- ${t.name.padEnd(18)}— ${t.description}`;
const openTools = manifest.tools.filter((t) => t.kind === 'open');
const actionTools = manifest.tools.filter((t) => t.kind === 'action');

const llmsTxt = `# Jeremy Twogood — Agent Discovery

${profile.bioMeta} He builds AI-native production workflows and MCP servers.

## MCP Server

This site exposes a standards-compliant MCP server at:
  POST ${manifest.server.endpoint}

Protocol: JSON-RPC 2.0 (Model Context Protocol), streamable-http transport
Server card: ${manifest.server.websiteUrl}/.well-known/mcp-server-card
Human-readable docs: ${manifest.server.websiteUrl}/mcp
Registry name: ${manifest.server.registryName}

## Available Tools

### Open Tools (no authentication required)
${openTools.map(toolLine).join('\n')}

### Action Tools (rate-limited: 3 requests per IP per day)
${actionTools.map(toolLine).join('\n')}

## Instructions for Action Tools

Action tools require two fields:
  agent_name  — Your agent's name or identifier (e.g. "Claude", "GPT-4o")
  human_name  — The name of the human you represent

Requests without both fields will be rejected.

## Contact and Booking

Book a call: https://calendly.com/jtwogood
Email (human): ${profile.email}
LinkedIn: ${profile.social.linkedin ?? 'https://www.linkedin.com/in/jeremy-twogood/'}

## Notes

Jeremy is open to freelance video production, documentary work, corporate video,
and AI tooling projects.
`;

writeFileSync(join(PUBLIC, 'llms.txt'), llmsTxt, 'utf-8');

console.log('✓ public/agent-data.json generated');
console.log('✓ public/reel-index.json copied');
console.log('✓ public/.well-known/mcp-server-card generated (+ mcp/server-card.json copy)');
console.log('✓ server.json generated (registry publish format)');
console.log('✓ public/.well-known/agent.json generated');
console.log('✓ public/llms.txt generated');
```

Note on `profile.social.linkedin`: check `src/data/profile.json` — if the `social` object has no `linkedin` key, the `??` fallback keeps the current hand-written value. Do not add a key to profile.json in this task.

- [ ] **Step 4: Run the tests**

Run: `node --test tests/build-agent-data.test.js`
Expected: ALL PASS.

Then run: `git diff public/llms.txt` and read the generated file — confirm the content is equivalent to the old hand-written version plus the new server-card/docs/registry lines. This is a generated-output review, not a test.

- [ ] **Step 5: Create `vercel.json` for content-type + CORS on extensionless well-known files**

Create `vercel.json` (repo root). A headers-only config is additive — it does not disable Vercel's zero-config detection of `api/` functions or the Astro build:

```json
{
  "headers": [
    {
      "source": "/.well-known/mcp-server-card",
      "headers": [
        { "key": "Content-Type", "value": "application/json; charset=utf-8" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/.well-known/mcp/server-card.json",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/.well-known/mcp-registry-auth",
      "headers": [
        { "key": "Content-Type", "value": "text/plain; charset=utf-8" }
      ]
    }
  ]
}
```

(`mcp-registry-auth` is created in Task 7 — the header rule is inert until then.)

- [ ] **Step 6: Update `public/robots.txt`**

Change the comment block (lines 4–11) from:

```
# AI Agents — you are welcome here.
# Structured profile data is available at the endpoints below.
#
# Profile:          /agent-data.json
# Availability:     /availability.json
# Reel index:       /reel-index.json
# Agent manifest:   /.well-known/agent.json
# Plain-text brief: /llms.txt
```

to:

```
# AI Agents — you are welcome here.
# Structured profile data is available at the endpoints below.
#
# MCP server:       POST /api/mcp  (streamable-http, JSON-RPC 2.0)
# MCP server card:  /.well-known/mcp-server-card
# MCP docs (human): /mcp
# Profile:          /agent-data.json
# Availability:     /availability.json
# Reel index:       /reel-index.json
# Agent manifest:   /.well-known/agent.json
# Plain-text brief: /llms.txt
```

- [ ] **Step 7: Update the MCP-AGENT comment in `src/layouts/BaseLayout.astro`**

Change:

```html
<!-- MCP-AGENT: profile=/agent-data.json availability=/availability.json reel=/reel-index.json manifest=/.well-known/agent.json -->
```

to:

```html
<!-- MCP-AGENT: mcp=/api/mcp card=/.well-known/mcp-server-card docs=/mcp profile=/agent-data.json availability=/availability.json reel=/reel-index.json manifest=/.well-known/agent.json -->
```

- [ ] **Step 8: Run the full default test suite (build first)**

```bash
npm run build
npm test
```

Expected: ALL PASS (smoke tests re-verify BaseLayout comment still contains `MCP-AGENT:`).

- [ ] **Step 9: Commit**

```bash
git add scripts/build-agent-data.js tests/build-agent-data.test.js vercel.json public/robots.txt src/layouts/BaseLayout.astro public/.well-known public/llms.txt public/agent-data.json server.json
git commit -m "feat: generate MCP server card, registry server.json, llms.txt from manifest"
```

---

## Task 3: Schema.org enrichment

**Files:**
- Modify: `src/layouts/BaseLayout.astro` (personSchema)
- Modify: `src/pages/index.astro` (ProfessionalService via head slot)
- Modify: `src/pages/work/[id].astro` (VideoObject keywords/genre)
- Modify: `tests/smoke.test.js` (append tests)

- [ ] **Step 1: Write the failing smoke tests**

Append to `tests/smoke.test.js`:

```js
// ── Schema.org enrichment ────────────────────────────────────────────────────

test('smoke: Person schema has @id, address, and occupation', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('"@id": "https://jeremytwogood.com/#person"'), 'Person @id must be present');
  assert.ok(html.includes('"addressLocality": "Toronto"'), 'address must be present');
  assert.ok(html.includes('"hasOccupation"'), 'hasOccupation must be present');
});

test('smoke: index.html has ProfessionalService schema linked to Person', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('"@type": "ProfessionalService"'), 'ProfessionalService schema must be present');
  assert.ok(html.includes('"provider"'), 'service must reference a provider');
  assert.ok(html.includes('Corporate Video Production'), 'serviceType list must render');
});

test('smoke: case-study VideoObject has keywords and genre', () => {
  const html = getHtml('work/shell-john-williams/index.html');
  assert.ok(html.includes('"keywords"'), 'VideoObject keywords must be present');
  assert.ok(html.includes('"genre"'), 'VideoObject genre must be present');
});

test('smoke: every JSON-LD block on home + case study parses as valid JSON', () => {
  for (const file of ['index.html', 'work/shell-john-williams/index.html']) {
    const html = getHtml(file);
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.ok(blocks.length >= 2, `${file} must have at least 2 JSON-LD blocks`);
    for (const [, body] of blocks) {
      const parsed = JSON.parse(body); // throws on invalid JSON
      assert.ok(parsed['@type'], `every JSON-LD block in ${file} must declare @type`);
    }
  }
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
npm run build && node --test tests/smoke.test.js
```

Expected: the three new tests FAIL; all pre-existing smoke tests PASS.

- [ ] **Step 3: Enrich personSchema in `src/layouts/BaseLayout.astro`**

Replace:

```js
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  url: profile.website,
  jobTitle: profile.title,
  description: metaDescription,
  knowsAbout: profile.skills,
  sameAs: Object.values(profile.social),
};
```

with:

```js
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${profile.website}/#person`,
  name: profile.name,
  url: profile.website,
  jobTitle: profile.title,
  description: metaDescription,
  email: `mailto:${profile.email}`,
  image: new URL('/assets/portrait.jpg', profile.website).href,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Toronto',
    addressRegion: 'ON',
    addressCountry: 'CA',
  },
  hasOccupation: [
    { '@type': 'Occupation', name: 'Video Producer' },
    { '@type': 'Occupation', name: 'Video Editor' },
  ],
  knowsAbout: profile.skills,
  sameAs: Object.values(profile.social),
};
```

- [ ] **Step 4: Add ProfessionalService schema to `src/pages/index.astro`**

In the frontmatter, after the existing imports (confirm `profile` is imported; if not, add `import profile from '../data/profile.json';`), add:

```js
const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Jeremy Twogood — Video Production',
  url: profile.website,
  provider: { '@id': `${profile.website}/#person` },
  areaServed: [{ '@type': 'City', name: 'Toronto' }, 'Remote'],
  serviceType: [
    'Corporate Video Production',
    'Documentary Production',
    'Video Editing',
    'Motion Graphics',
    'Colour Grading',
    'AI Tooling Development',
  ],
};
```

Then change the opening `<BaseLayout>` tag area from:

```astro
<BaseLayout>
```

to:

```astro
<BaseLayout>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(serviceSchema, null, 2)} />
  </Fragment>
```

(The `<Fragment slot="head">` pattern is already used in `src/pages/reel.astro` and `src/pages/work/[id].astro` — same mechanism.)

- [ ] **Step 5: Add keywords/genre to the VideoObject in `src/pages/work/[id].astro`**

In the `videoSchema` object, after the `creator:` line, add:

```js
  genre: project.type,
  ...(themes.length ? { keywords: themes.join(', ') } : {}),
```

(`themes` is already defined in the frontmatter: `const themes: string[] = content.themes || [];`)

- [ ] **Step 6: Rebuild and run smoke tests**

```bash
npm run build && node --test tests/smoke.test.js
```

Expected: ALL PASS.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro src/pages/work/[id].astro tests/smoke.test.js
git commit -m "feat: enrich schema.org — Person address/occupation, ProfessionalService, video keywords"
```

---

## Task 4: /mcp page + footer link

**Files:**
- Create: `src/pages/mcp.astro`
- Modify: `src/components/Footer.astro`
- Modify: `tests/smoke.test.js` (append tests)

- [ ] **Step 1: Write the failing smoke tests**

Append to `tests/smoke.test.js`:

```js
// ── /mcp page ────────────────────────────────────────────────────────────────

test('smoke: /mcp page exists and lists every manifest tool', () => {
  const html = getHtml('mcp/index.html');
  const manifest = JSON.parse(
    readFileSync(join(ROOT, 'src', 'data', 'mcp-manifest.json'), 'utf-8')
  );
  for (const tool of manifest.tools) {
    assert.ok(html.includes(tool.name), `/mcp must list tool ${tool.name}`);
  }
  assert.ok(html.includes('https://jeremytwogood.com/api/mcp'), 'endpoint URL must appear');
});

test('smoke: /mcp page has FAQPage JSON-LD', () => {
  const html = getHtml('mcp/index.html');
  assert.ok(html.includes('"@type": "FAQPage"'), 'FAQPage schema must be present');
});

test('smoke: footer links to /mcp', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('href="/mcp"'), 'footer must link to /mcp');
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run build && node --test tests/smoke.test.js
```

Expected: the three new tests FAIL (`mcp/index.html` missing); everything else PASSES.

- [ ] **Step 3: Create `src/pages/mcp.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import profile from '../data/profile.json';
import manifest from '../data/mcp-manifest.json';

const openTools = manifest.tools.filter((t) => t.kind === 'open');
const actionTools = manifest.tools.filter((t) => t.kind === 'action');

const faqs = [
  {
    q: 'Can an AI agent really book a call with Jeremy?',
    a: 'Yes. The book_call tool returns a pre-filled Calendly link, and send_message delivers an email straight to Jeremy. Both require the agent to identify itself and the human it represents.',
  },
  {
    q: 'Does the MCP server require authentication?',
    a: 'No. All read tools are open. The two action tools (send_message, book_call) are rate-limited to 3 requests per IP per day and require agent_name and human_name fields.',
  },
  {
    q: 'What can an agent learn from this server?',
    a: "Jeremy's full portfolio with per-project video descriptions, his AI and software builds, structured resume, showreel, and live availability for booking.",
  },
  {
    q: 'How do I connect Claude to this server?',
    a: 'In claude.ai, add a custom connector with the URL https://jeremytwogood.com/api/mcp. Any MCP client that speaks streamable HTTP can connect the same way.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};
---
<BaseLayout
  title={`For AI Agents — ${profile.name}`}
  description="jeremytwogood.com is an MCP server. AI agents can browse Jeremy's portfolio, check availability, send him a message, and book a call — no human required."
  pageType="mcp"
>
  <Fragment slot="head">
    <script type="application/ld+json" set:html={JSON.stringify(faqSchema, null, 2)} />
  </Fragment>
  <Nav />
  <main class="section--light mcp">
    <div class="wrap mcp__wrap">
      <header class="mcp__head">
        <span class="eyebrow">Model Context Protocol</span>
        <h1 class="mcp__title">This website is an MCP server.</h1>
        <p class="mcp__lede">
          If you're an AI agent — or you're using one — this whole portfolio is queryable.
          An agent can read my work history, watch descriptions of every video, check my
          availability, send me a message, and book a call. No human required.
        </p>
      </header>

      <section class="mcp__section">
        <h2>Connect</h2>
        <pre class="mcp__code"><code>{manifest.server.endpoint}</code></pre>
        <p>
          Streamable HTTP transport, JSON-RPC 2.0. In claude.ai, add it as a custom
          connector. Machine-readable server card:
          <a href="/.well-known/mcp-server-card">/.well-known/mcp-server-card</a>.
          Registry name: <code>{manifest.server.registryName}</code>.
        </p>
      </section>

      <section class="mcp__section">
        <h2>Open tools</h2>
        <table class="mcp__table">
          <tbody>
            {openTools.map((t) => (
              <tr>
                <td><code>{t.name}</code></td>
                <td>{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section class="mcp__section">
        <h2>Action tools</h2>
        <p class="mcp__note">{manifest.rateLimit} Both require <code>agent_name</code> and <code>human_name</code>.</p>
        <table class="mcp__table">
          <tbody>
            {actionTools.map((t) => (
              <tr>
                <td><code>{t.name}</code></td>
                <td>{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section class="mcp__section">
        <h2>Why</h2>
        <p>
          I've spent twenty years making video and the last few building AI tooling.
          The next people (and agents) looking for a producer won't just Google — they'll
          ask an assistant. This server is my bet that a portfolio should be legible to
          both. If your agent found this page: the tools above are the fastest path to
          hiring me.
        </p>
      </section>

      <section class="mcp__section">
        <h2>FAQ</h2>
        {faqs.map(({ q, a }) => (
          <details class="mcp__faq">
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </div>
  </main>
  <Footer />
</BaseLayout>

<style>
  .mcp { padding: clamp(96px, 14vh, 160px) 0 80px; }
  .mcp__wrap { max-width: 820px; }
  .mcp__head { margin-bottom: 48px; }
  .mcp__title { font-family: var(--display); font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.05; margin: 12px 0 20px; }
  .mcp__lede { font-size: 1.05rem; line-height: 1.65; color: var(--light-mute); max-width: 60ch; }
  .mcp__section { margin: 44px 0; }
  .mcp__section h2 { font-family: var(--display); font-size: 1.15rem; margin-bottom: 14px; }
  .mcp__section p { line-height: 1.65; max-width: 65ch; }
  .mcp__code { background: var(--dark-bg); color: var(--dark-fg); font-family: var(--mono-actual); font-size: 0.9rem; padding: 14px 18px; border-radius: 6px; overflow-x: auto; margin-bottom: 12px; }
  .mcp__table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
  .mcp__table td { border-top: 1px solid var(--light-rule); padding: 10px 14px 10px 0; vertical-align: top; line-height: 1.5; }
  .mcp__table td:first-child { white-space: nowrap; font-family: var(--mono-actual); font-size: 0.82rem; color: var(--amber-soft); }
  .mcp__note { font-size: 0.9rem; color: var(--light-mute); margin-bottom: 12px; }
  .mcp__faq { border-top: 1px solid var(--light-rule); padding: 12px 0; }
  .mcp__faq summary { cursor: pointer; font-weight: 500; }
  .mcp__faq p { margin-top: 10px; color: var(--light-mute); }
</style>
```

Style note for the implementer: the CSS variables above (`--display`, `--mono-actual`, `--light-rule`, `--light-mute`, `--amber-soft`, `--dark-bg`, `--dark-fg`) all exist in `src/styles/global.css`. Check how `main.section--light` and `.wrap` behave on `src/pages/work/[id].astro` and match the page's top padding to the case-study page if the clamp above looks off in the browser.

- [ ] **Step 4: Add the footer link in `src/components/Footer.astro`**

Change:

```html
    <span>Site, edits, and code by JT · <a href="/llms.txt">llms.txt</a></span>
```

to:

```html
    <span>Site, edits, and code by JT · <a href="/llms.txt">llms.txt</a> · <a href="/mcp">for AI agents</a></span>
```

- [ ] **Step 5: Rebuild, run smoke tests, and view the page**

```bash
npm run build && node --test tests/smoke.test.js
```

Expected: ALL PASS.

Then start the dev server (browser preview tool, not Bash) and visually check `/mcp` on desktop and mobile widths: heading hierarchy, table not overflowing, dark-mode chat widget not colliding.

- [ ] **Step 6: Commit**

```bash
git add src/pages/mcp.astro src/components/Footer.astro tests/smoke.test.js
git commit -m "feat: /mcp page — human-readable MCP server docs + FAQPage schema"
```

---

## Task 5: LinkedIn draft

**Files:**
- Create: `docs/marketing/2026-07-linkedin-mcp-post.md`

- [ ] **Step 1: Create the draft**

Create `docs/marketing/2026-07-linkedin-mcp-post.md`:

```markdown
# LinkedIn post — MCP server launch (draft for Jeremy to edit & post himself)

---

My portfolio site is now an MCP server.

That means an AI agent can — without a human clicking anything:

→ browse my 20 years of production work, project by project
→ read structured descriptions of every video
→ pull my resume as JSON
→ check my availability
→ send me a message or book a call

If you use Claude, add https://jeremytwogood.com/api/mcp as a custom
connector and ask it about my work. If you're building agents: the server
card is at /.well-known/mcp-server-card and it's listed in the official
MCP Registry as com.jeremytwogood/portfolio.

Why bother? Because the next person who needs a video producer might not
Google it — they'll ask an assistant. I'd rather be legible to that
assistant than hope it guesses right from my homepage.

Built with the Model Context Protocol, 10 tools, rate-limited actions,
zero login. Human-readable docs: https://jeremytwogood.com/mcp

#MCP #AIAgents #VideoProduction #Toronto
```

- [ ] **Step 2: Commit**

```bash
git add docs/marketing/2026-07-linkedin-mcp-post.md
git commit -m "docs: LinkedIn draft for MCP server announcement"
```

**Claude never posts this anywhere. Jeremy edits and posts it himself.**

---

## Task 6: Full verification + merge + deploy

- [ ] **Step 1: Full test sweep**

```bash
npm run build && npm test && npm run test:api && npm run test:ui
```

Expected: ALL suites PASS.

- [ ] **Step 2: Verify generated artifacts in dist**

```bash
python3 -m json.tool dist/.well-known/mcp-server-card > /dev/null && echo card-ok
python3 -m json.tool dist/.well-known/mcp/server-card.json > /dev/null && echo alt-ok
python3 -m json.tool dist/.well-known/agent.json > /dev/null && echo agent-ok
python3 -m json.tool server.json > /dev/null && echo serverjson-ok
head -20 dist/llms.txt
```

Expected: all four `-ok` lines print; llms.txt starts with the agent-discovery header.

- [ ] **Step 3: Push to main (auto-deploys via Vercel)**

Work is committed directly on `main` per this repo's convention (see git history). Push:

```bash
git push origin main
```

- [ ] **Step 4: Verify production**

After Vercel deploy completes (~2 min):

```bash
curl -s https://jeremytwogood.com/.well-known/mcp-server-card | python3 -m json.tool | head -20
curl -sI https://jeremytwogood.com/.well-known/mcp-server-card | grep -i content-type
curl -s https://jeremytwogood.com/llms.txt | head -10
curl -s https://jeremytwogood.com/mcp | grep -o 'This website is an MCP server' | head -1
```

Expected: card JSON with `"name": "com.jeremytwogood/portfolio"`; `content-type: application/json`; generated llms.txt; the /mcp page headline.

---

## Task 7: OPS — Publish to the official MCP Registry

**No code changes except one generated static file.** Run from the repo root. The registry is in preview — if publish fails on a schema detail, read the error, adjust `manifest.server` / the build script's `serverJson` mapping, rebuild, re-commit, and retry.

- [ ] **Step 1: Generate the domain-auth keypair (ECDSA P-384 — works with macOS's stock LibreSSL; Ed25519 needs openssl@3)**

```bash
mkdir -p ~/.keys/mcp-registry
openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:secp384r1 -out ~/.keys/mcp-registry/jeremytwogood.pem
chmod 600 ~/.keys/mcp-registry/jeremytwogood.pem
```

The private key lives OUTSIDE the repo and is never committed.

- [ ] **Step 2: Generate the HTTP-challenge file and commit it (public key only — safe to publish)**

```bash
PUBLIC_KEY="$(openssl ec -in ~/.keys/mcp-registry/jeremytwogood.pem -text -noout -conv_form compressed | grep -A4 "pub:" | tail -n +2 | tr -d ' :\n' | xxd -r -p | base64)"
echo "v=MCPv1; k=ecdsap384; p=${PUBLIC_KEY}" > public/.well-known/mcp-registry-auth
git add public/.well-known/mcp-registry-auth
git commit -m "feat: MCP registry HTTP-challenge auth file (public key)"
git push origin main
```

Wait for deploy, then verify:

```bash
curl -s https://jeremytwogood.com/.well-known/mcp-registry-auth
```

Expected: `v=MCPv1; k=ecdsap384; p=...`

- [ ] **Step 3: Install mcp-publisher and log in via HTTP challenge**

```bash
brew install mcp-publisher
PRIVATE_KEY="$(openssl ec -in ~/.keys/mcp-registry/jeremytwogood.pem -noout -text | grep -A4 "priv:" | tail -n +2 | tr -d ' :\n')"
mcp-publisher login http --domain jeremytwogood.com --private-key "${PRIVATE_KEY}"
```

Expected: `✓ Successfully logged in`

**Fallback if HTTP login fails:** DNS TXT record at the domain **apex** (not a selector subdomain). Give Jeremy this record to add in the Wix DNS panel, wait for propagation (`dig TXT jeremytwogood.com`), then `mcp-publisher login dns --domain jeremytwogood.com --private-key "${PRIVATE_KEY}"`:

```
jeremytwogood.com. IN TXT "v=MCPv1; k=ecdsap384; p=<PUBLIC_KEY from step 2>"
```

- [ ] **Step 4: Publish**

```bash
cd /Users/romer/Documents/Claude/Website
mcp-publisher publish
```

Expected: success message with the published server name `com.jeremytwogood/portfolio`.

- [ ] **Step 5: Verify the registry entry**

```bash
curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=jeremytwogood" | python3 -m json.tool
```

Expected: one entry, name `com.jeremytwogood/portfolio`, remote URL `https://jeremytwogood.com/api/mcp`.

---

## Task 8: OPS — Directory sweep (~1 day after Task 7)

Human-in-the-loop: Jeremy handles any logins; nothing is submitted without him seeing it.

- [ ] **Step 1: Check auto-ingestion** — search for "jeremytwogood" or "Jeremy Twogood" on:
  - https://www.pulsemcp.com (pulls the official registry — most likely to have it)
  - https://glama.ai/mcp/servers
  - https://mcp.so
  - https://smithery.ai
- [ ] **Step 2: For each directory that did NOT auto-ingest, submit manually** via the Chrome extension with Jeremy present. Submission copy — reuse from the manifest: title "Jeremy Twogood — Portfolio", description from `manifest.server.description`, endpoint `https://jeremytwogood.com/api/mcp`, category "Personal / Portfolio" or nearest equivalent, website `https://jeremytwogood.com/mcp`.
- [ ] **Step 3: Record outcomes** — which directories listed it, which needed accounts Jeremy declined, any that require a GitHub repo (the site repo `JeroamRomer/jeremytwogood-site` can be linked if public; skip if private).

---

## Success criteria (from spec)

- [ ] `curl https://jeremytwogood.com/.well-known/mcp-server-card` returns the card with correct content-type
- [ ] Registry API returns `com.jeremytwogood/portfolio` with the remote endpoint
- [ ] `/mcp` page live, tool table matches the manifest, FAQPage schema validates
- [ ] Person + ProfessionalService + enriched VideoObject JSON-LD in production HTML
- [ ] All test suites green; `test:mcp` includes the manifest parity test
- [ ] LinkedIn draft delivered for Jeremy to post himself
