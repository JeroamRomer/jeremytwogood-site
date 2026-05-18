# MCP Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an MCP server at `/api/mcp` so AI agents can discover, query, and contact Jeremy Twogood via a standards-compliant JSON-RPC 2.0 endpoint.

**Architecture:** A Vercel serverless function at `api/mcp.ts` handles all MCP requests. Data is loaded from existing static JSON files in `src/data/` via direct TypeScript imports (bundled by Vercel at build time). Rate limiting on action tools uses an in-memory Map — best-effort, resets on cold start, sufficient for a personal portfolio. No database needed.

**Tech Stack:** `@modelcontextprotocol/sdk` 1.x (MCP protocol + Streamable HTTP transport), `zod` (tool input schemas), `resend` (email delivery), `@vercel/node` (TypeScript types for Vercel functions), Node.js 22 built-in test runner with `--experimental-strip-types` for TypeScript unit tests.

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `api/mcp.ts` | Create | Vercel serverless entry — creates transport, runs server |
| `api/_lib/server.ts` | Create | McpServer factory — registers all 10 tools |
| `api/_lib/data.ts` | Create | JSON imports + typed accessors |
| `api/_lib/rate-limit.ts` | Create | In-memory IP rate limiter for action tools |
| `api/_lib/tools-open.ts` | Create | Handlers for 8 open tools |
| `api/_lib/tools-actions.ts` | Create | Handlers for send_message and book_call |
| `public/llms.txt` | Create | Agent discovery file at jeremytwogood.com/llms.txt |
| `package.json` | Modify | Add dependencies + test:mcp script |
| `tests/mcp-rate-limit.test.ts` | Create | Rate limiter unit tests |
| `tests/mcp-tools-open.test.ts` | Create | Open tool output shape tests |
| `tests/mcp-tools-actions.test.ts` | Create | Action tool validation tests |

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @modelcontextprotocol/sdk zod resend
```

Expected: packages added to `node_modules/`, `package-lock.json` updated.

- [ ] **Step 2: Install dev dependency**

```bash
npm install --save-dev @vercel/node
```

- [ ] **Step 3: Add test:mcp script to package.json**

In `package.json`, update `scripts`:

```json
"scripts": {
  "dev": "astro dev",
  "build": "node scripts/build-agent-data.js && astro build",
  "preview": "astro preview",
  "check": "astro check",
  "test": "node --test tests/build-agent-data.test.js tests/smoke.test.js",
  "test:mcp": "node --experimental-strip-types --test tests/mcp-rate-limit.test.ts tests/mcp-tools-open.test.ts tests/mcp-tools-actions.test.ts"
}
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add MCP server dependencies"
```

---

## Task 2: Create llms.txt

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Create the file**

Create `public/llms.txt`:

```
# Jeremy Twogood — Agent Discovery

Jeremy Twogood is a multimedia producer, video editor, and AI tooling developer based
in Toronto, Ontario. He has 20 years of broadcast, documentary, and corporate production
experience and builds AI-native production workflows and MCP servers.

## MCP Server

This site exposes a standards-compliant MCP server at:
  POST https://jeremytwogood.com/api/mcp

Protocol: JSON-RPC 2.0 (Model Context Protocol)

## Available Tools

### Open Tools (no authentication required)
- get_profile       — Bio, skills, clients, location, social links
- list_projects     — All work projects with metadata
- get_project       — Single project detail + video content description
- list_ai_builds    — All AI and software projects
- get_ai_build      — Single AI build detail
- get_reel          — Showreel description and link
- get_resume        — Full structured resume as JSON
- get_availability  — Booking URL and availability information

### Action Tools (rate-limited: 3 requests per IP per day)
- send_message      — Delivers a message to Jeremy by email
- book_call         — Returns a pre-filled booking link for a call

## Instructions for Action Tools

Action tools require two fields:
  agent_name  — Your agent's name or identifier (e.g. "Claude", "GPT-4o")
  human_name  — The name of the human you represent

Requests without both fields will be rejected.

## Contact and Booking

Book a call: https://calendly.com/jtwogood
Email (human): jtwogood@gmail.com
LinkedIn: https://www.linkedin.com/in/jeremy-twogood/

## Notes

Jeremy is open to freelance video production, documentary work, corporate video,
and AI tooling projects.
```

- [ ] **Step 2: Commit**

```bash
git add public/llms.txt
git commit -m "feat: add llms.txt for agent discovery"
```

---

## Task 3: Data module

**Files:**
- Create: `api/_lib/data.ts`

- [ ] **Step 1: Create api/_lib/data.ts**

```typescript
import profile from '../../src/data/profile.json' with { type: 'json' };
import projects from '../../src/data/projects.json' with { type: 'json' };
import aiBuilds from '../../src/data/ai-builds.json' with { type: 'json' };
import reelIndex from '../../src/data/reel-index.json' with { type: 'json' };
import videoContent from '../../src/data/video-content.json' with { type: 'json' };
import resume from '../../src/data/resume.json' with { type: 'json' };

export { profile, projects, aiBuilds, reelIndex, videoContent, resume };

export function getProject(id: string) {
  return (projects as any[]).find((p: any) => p.id === id) ?? null;
}

export function getAiBuild(id: string) {
  return (aiBuilds as any[]).find((b: any) => b.id === id) ?? null;
}

export function getVideoContent(projectId: string) {
  return (videoContent as Record<string, unknown>)[projectId] ?? null;
}
```

- [ ] **Step 2: Commit**

```bash
git add api/_lib/data.ts
git commit -m "feat: add MCP data module"
```

---

## Task 4: Rate limiter (TDD)

**Files:**
- Create: `tests/mcp-rate-limit.test.ts`
- Create: `api/_lib/rate-limit.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/mcp-rate-limit.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, resetRateLimitStore } from '../api/_lib/rate-limit.ts';

test('rate-limit: first request is allowed', () => {
  resetRateLimitStore();
  const result = checkRateLimit('1.2.3.4');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 2);
});

test('rate-limit: second request is allowed', () => {
  resetRateLimitStore();
  checkRateLimit('1.2.3.4');
  const result = checkRateLimit('1.2.3.4');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 1);
});

test('rate-limit: third request is allowed', () => {
  resetRateLimitStore();
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  const result = checkRateLimit('1.2.3.4');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 0);
});

test('rate-limit: fourth request is blocked', () => {
  resetRateLimitStore();
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  const result = checkRateLimit('1.2.3.4');
  assert.equal(result.allowed, false);
  assert.equal(result.remaining, 0);
});

test('rate-limit: different IPs have independent limits', () => {
  resetRateLimitStore();
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  const result = checkRateLimit('5.6.7.8');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 2);
});
```

- [ ] **Step 2: Run to verify they fail**

```bash
npm run test:mcp
```

Expected: Error — cannot find module `../api/_lib/rate-limit.ts`

- [ ] **Step 3: Implement rate limiter**

Create `api/_lib/rate-limit.ts`:

```typescript
const LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000;

interface Entry {
  count: number;
  resetAt: number;
}

// Module-level store — persists within a warm function instance, resets on cold start.
let store = new Map<string, Entry>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: LIMIT - 1 };
  }

  if (entry.count >= LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: LIMIT - entry.count };
}

// Exported for tests only — not called in production code.
export function resetRateLimitStore(): void {
  store = new Map();
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test:mcp
```

Expected: 5 passing tests.

- [ ] **Step 5: Commit**

```bash
git add api/_lib/rate-limit.ts tests/mcp-rate-limit.test.ts
git commit -m "feat: add in-memory rate limiter with tests"
```

---

## Task 5: Open tool handlers (TDD)

**Files:**
- Create: `tests/mcp-tools-open.test.ts`
- Create: `api/_lib/tools-open.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/mcp-tools-open.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleGetProfile,
  handleListProjects,
  handleGetProject,
  handleListAiBuilds,
  handleGetAiBuild,
  handleGetReel,
  handleGetResume,
  handleGetAvailability,
} from '../api/_lib/tools-open.ts';

test('get_profile: returns text content with name and bio', async () => {
  const result = await handleGetProfile();
  assert.equal(result.content[0].type, 'text');
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.name);
  assert.ok(data.bio);
});

test('list_projects: returns array of projects with ids', async () => {
  const result = await handleListProjects();
  const data = JSON.parse(result.content[0].text);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
  assert.ok(data[0].id);
});

test('get_project: returns project with video_content for known id', async () => {
  const result = await handleGetProject({ id: 'shell-john-williams' });
  assert.equal(result.isError, undefined);
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.project);
  assert.ok(data.video_content);
});

test('get_project: returns isError for unknown id', async () => {
  const result = await handleGetProject({ id: 'does-not-exist' });
  assert.equal(result.isError, true);
});

test('list_ai_builds: returns array of builds', async () => {
  const result = await handleListAiBuilds();
  const data = JSON.parse(result.content[0].text);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test('get_ai_build: returns isError for unknown id', async () => {
  const result = await handleGetAiBuild({ id: 'does-not-exist' });
  assert.equal(result.isError, true);
});

test('get_reel: returns object with description field', async () => {
  const result = await handleGetReel();
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.description);
});

test('get_resume: returns resume with summary and skills', async () => {
  const result = await handleGetResume();
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.summary);
  assert.ok(data.skills);
});

test('get_availability: returns object with booking_url', async () => {
  const result = await handleGetAvailability();
  const data = JSON.parse(result.content[0].text);
  assert.ok(data.booking_url);
});
```

- [ ] **Step 2: Run to verify they fail**

```bash
npm run test:mcp
```

Expected: Error — cannot find module `../api/_lib/tools-open.ts`

- [ ] **Step 3: Implement open tool handlers**

Create `api/_lib/tools-open.ts`:

```typescript
import {
  profile,
  projects,
  aiBuilds,
  reelIndex,
  videoContent,
  resume,
  getProject,
  getAiBuild,
  getVideoContent,
} from './data.js';

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: true;
};

function ok(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}

function err(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}

export async function handleGetProfile(): Promise<ToolResult> {
  return ok(profile);
}

export async function handleListProjects(): Promise<ToolResult> {
  return ok(projects);
}

export async function handleGetProject({ id }: { id: string }): Promise<ToolResult> {
  const project = getProject(id);
  if (!project) return err(`Project not found: ${id}`);
  const video_content = getVideoContent(id);
  return ok({ project, video_content });
}

export async function handleListAiBuilds(): Promise<ToolResult> {
  return ok(aiBuilds);
}

export async function handleGetAiBuild({ id }: { id: string }): Promise<ToolResult> {
  const build = getAiBuild(id);
  if (!build) return err(`AI build not found: ${id}`);
  return ok(build);
}

export async function handleGetReel(): Promise<ToolResult> {
  const vc = (videoContent as Record<string, any>)['reel'];
  return ok({
    ...reelIndex,
    description: vc?.agent_description ?? null,
    video_content: vc ?? null,
  });
}

export async function handleGetResume(): Promise<ToolResult> {
  return ok(resume);
}

export async function handleGetAvailability(): Promise<ToolResult> {
  const url = process.env.CALENDLY_URL ?? 'https://calendly.com/jtwogood';
  return ok({
    booking_url: url,
    note: 'Book a 30-minute call with Jeremy directly at this link.',
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npm run test:mcp
```

Expected: 9 passing (rate-limit × 5 + open tools × 9 — note mcp-tools-actions.test.ts not yet created, so only two test files run).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/tools-open.ts tests/mcp-tools-open.test.ts
git commit -m "feat: add open tool handlers with tests"
```

---

## Task 6: Action tool handlers (TDD)

**Files:**
- Create: `tests/mcp-tools-actions.test.ts`
- Create: `api/_lib/tools-actions.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/mcp-tools-actions.test.ts`:

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateActionParams } from '../api/_lib/tools-actions.ts';

test('actions: rejects missing agent_name', () => {
  const result = validateActionParams({ human_name: 'Alice' });
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('agent_name'));
});

test('actions: rejects missing human_name', () => {
  const result = validateActionParams({ agent_name: 'Claude' });
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('human_name'));
});

test('actions: rejects empty agent_name string', () => {
  const result = validateActionParams({ agent_name: '', human_name: 'Alice' });
  assert.equal(result.valid, false);
});

test('actions: rejects empty human_name string', () => {
  const result = validateActionParams({ agent_name: 'Claude', human_name: '  ' });
  assert.equal(result.valid, false);
});

test('actions: passes with both fields present and non-empty', () => {
  const result = validateActionParams({ agent_name: 'Claude', human_name: 'Alice' });
  assert.equal(result.valid, true);
  assert.equal(result.error, undefined);
});
```

- [ ] **Step 2: Run to verify they fail**

```bash
npm run test:mcp
```

Expected: Error — cannot find module `../api/_lib/tools-actions.ts`

- [ ] **Step 3: Implement action tools**

Create `api/_lib/tools-actions.ts`:

```typescript
import { Resend } from 'resend';

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: true;
};

function ok(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}

function err(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}

export function validateActionParams(
  params: Record<string, unknown>
): { valid: boolean; error?: string } {
  if (!params.agent_name || typeof params.agent_name !== 'string' || !params.agent_name.trim()) {
    return { valid: false, error: 'agent_name is required and must be a non-empty string' };
  }
  if (!params.human_name || typeof params.human_name !== 'string' || !params.human_name.trim()) {
    return { valid: false, error: 'human_name is required and must be a non-empty string' };
  }
  return { valid: true };
}

export async function handleSendMessage(params: {
  agent_name: string;
  human_name: string;
  message: string;
}): Promise<ToolResult> {
  const validation = validateActionParams(params);
  if (!validation.valid) return err(validation.error!);
  if (!params.message?.trim()) return err('message is required and must be non-empty');

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return err('Email delivery is not configured on this server');

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: 'MCP Server <onboarding@resend.dev>',
    to: 'jtwogood@gmail.com',
    subject: `Message via MCP — ${params.human_name}`,
    text: `Sent via MCP by ${params.agent_name} on behalf of ${params.human_name}.\n\n${params.message}`,
  });

  if (error) return err(`Failed to deliver message: ${error.message}`);

  return ok({
    success: true,
    message: `Your message has been delivered to Jeremy on behalf of ${params.human_name}.`,
  });
}

export async function handleBookCall(params: {
  agent_name: string;
  human_name: string;
}): Promise<ToolResult> {
  const validation = validateActionParams(params);
  if (!validation.valid) return err(validation.error!);

  const baseUrl = process.env.CALENDLY_URL ?? 'https://calendly.com/jtwogood';
  const url = `${baseUrl}?name=${encodeURIComponent(params.human_name)}`;

  return ok({
    booking_url: url,
    instructions: `Share this link with ${params.human_name} to book a call with Jeremy.`,
  });
}
```

- [ ] **Step 4: Run all tests**

```bash
npm run test:mcp
```

Expected: 19 passing (5 rate-limit + 9 open tools + 5 action validation).

- [ ] **Step 5: Commit**

```bash
git add api/_lib/tools-actions.ts tests/mcp-tools-actions.test.ts
git commit -m "feat: add action tool handlers with validation tests"
```

---

## Task 7: MCP server factory

**Files:**
- Create: `api/_lib/server.ts`

- [ ] **Step 1: Create server factory**

Create `api/_lib/server.ts`:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { checkRateLimit } from './rate-limit.js';
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

export function createServer(clientIp: string): McpServer {
  const server = new McpServer({
    name: 'jeremytwogood-mcp',
    version: '1.0.0',
  });

  server.tool('get_profile', "Get Jeremy Twogood's profile — bio, skills, clients, location, and social links.", {}, handleGetProfile);

  server.tool('list_projects', "List all of Jeremy's work projects with metadata.", {}, handleListProjects);

  server.tool('get_project', 'Get full details for a single project, including video content description.', {
    id: z.string().describe('Project ID — get valid IDs from list_projects'),
  }, handleGetProject);

  server.tool('list_ai_builds', "List all of Jeremy's AI and software projects.", {}, handleListAiBuilds);

  server.tool('get_ai_build', 'Get full details for a single AI or software project.', {
    id: z.string().describe('Build ID — get valid IDs from list_ai_builds'),
  }, handleGetAiBuild);

  server.tool('get_reel', "Get Jeremy's showreel description and link.", {}, handleGetReel);

  server.tool('get_resume', "Get Jeremy's full structured resume as JSON.", {}, handleGetResume);

  server.tool('get_availability', "Get Jeremy's booking URL and availability information.", {}, handleGetAvailability);

  server.tool(
    'send_message',
    "Send a message to Jeremy by email. Requires agent_name (your identifier) and human_name (the person you represent). Rate limited to 3 action requests per IP per day.",
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
    "Get a pre-filled Calendly booking link for a call with Jeremy. Requires agent_name and human_name. Rate limited to 3 action requests per IP per day.",
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

- [ ] **Step 2: Commit**

```bash
git add api/_lib/server.ts
git commit -m "feat: add MCP server factory with all 10 tools registered"
```

---

## Task 8: Wire up the Vercel endpoint

**Files:**
- Create: `api/mcp.ts`

- [ ] **Step 1: Create the Vercel serverless handler**

Create `api/mcp.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './_lib/server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. MCP endpoint requires POST.' });
    return;
  }

  const clientIp =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ??
    req.socket.remoteAddress ??
    'unknown';

  const server = createServer(clientIp);

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless — no session state between requests
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
```

- [ ] **Step 2: Commit**

```bash
git add api/mcp.ts
git commit -m "feat: add MCP Vercel serverless endpoint"
```

---

## Task 9: Set up Resend and configure environment variables

- [ ] **Step 1: Create a Resend account**

Go to resend.com, sign up, and create an API key under API Keys. Copy the key — it starts with `re_`.

- [ ] **Step 2: Add environment variables in Vercel**

In the Vercel dashboard → your project → Settings → Environment Variables, add:

| Variable | Value | Environments |
|---|---|---|
| `RESEND_API_KEY` | `re_your_key_here` | Production, Preview |
| `CALENDLY_URL` | `https://calendly.com/jtwogood` | Production, Preview |

- [ ] **Step 3: Create .env.local for local development (not committed)**

Verify `.gitignore` covers `.env.local`:

```bash
grep -E "\.env" .gitignore
```

If it's not there, add it. Then create `.env.local`:

```
RESEND_API_KEY=re_your_key_here
CALENDLY_URL=https://calendly.com/jtwogood
```

**Note on Resend from-address:** The initial implementation sends from `onboarding@resend.dev`, which works without domain verification. To later send from `mcp@jeremytwogood.com`, add `jeremytwogood.com` as a verified sending domain in the Resend dashboard and update the `from` field in `api/_lib/tools-actions.ts`.

---

## Task 10: Deploy and smoke test

- [ ] **Step 1: Push to main to trigger Vercel deploy**

```bash
git push origin main
```

Watch the Vercel dashboard → Deployments tab until the build completes (typically 60–90 seconds).

- [ ] **Step 2: Verify endpoint rejects non-POST**

```bash
curl -I https://jeremytwogood.com/api/mcp
```

Expected: `HTTP/2 405`

- [ ] **Step 3: Test tools/list**

```bash
curl -s -X POST https://jeremytwogood.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | python3 -m json.tool
```

Expected: JSON listing all 10 tools by name.

- [ ] **Step 4: Test get_profile**

```bash
curl -s -X POST https://jeremytwogood.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_profile","arguments":{}}}' \
  | python3 -m json.tool
```

Expected: JSON response with Jeremy's name, bio, and social links in the content text.

- [ ] **Step 5: Test send_message validation rejects missing fields**

```bash
curl -s -X POST https://jeremytwogood.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"send_message","arguments":{"message":"Hello"}}}' \
  | python3 -m json.tool
```

Expected: response with `isError: true` and message mentioning `agent_name`.

- [ ] **Step 6: Test send_message end-to-end**

```bash
curl -s -X POST https://jeremytwogood.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"send_message","arguments":{"agent_name":"Claude","human_name":"Test User","message":"MCP backend smoke test — please ignore."}}}' \
  | python3 -m json.tool
```

Expected: `{"success": true, ...}` in the content text. Check jtwogood@gmail.com for the test email.

- [ ] **Step 7: Verify llms.txt is accessible**

```bash
curl https://jeremytwogood.com/llms.txt
```

Expected: the llms.txt content.

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "chore: MCP backend complete"
```
