import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PUBLIC = join(ROOT, 'public');
const AGENT_DATA = join(PUBLIC, 'agent-data.json');
const REEL_COPY = join(PUBLIC, 'reel-index.json');

// Run the build script before all tests
execSync('node scripts/build-agent-data.js', { cwd: ROOT });

test('build-agent-data: public/agent-data.json is created', () => {
  assert.ok(existsSync(AGENT_DATA), 'agent-data.json must exist in public/');
});

test('build-agent-data: agent-data.json has required top-level keys', () => {
  const data = JSON.parse(readFileSync(AGENT_DATA, 'utf-8'));
  assert.ok(data.schema_version, 'must have schema_version');
  assert.ok(data.generated_at, 'must have generated_at timestamp');
  assert.ok(data.profile, 'must have profile');
  assert.ok(data.skills, 'must have skills');
  assert.ok(data.clients, 'must have clients');
  assert.ok(data.projects, 'must have projects array');
  assert.ok(data.ai_builds, 'must have ai_builds array');
  assert.ok(data.availability_url, 'must have availability_url');
  assert.ok(data.sections, 'must have sections');
  assert.ok(data.endpoints, 'must have endpoints');
});

test('build-agent-data: profile has name and title', () => {
  const data = JSON.parse(readFileSync(AGENT_DATA, 'utf-8'));
  assert.equal(data.profile.name, 'Jeremy Twogood');
  assert.ok(data.profile.title);
  assert.ok(data.profile.website);
});

test('build-agent-data: projects array is non-empty', () => {
  const data = JSON.parse(readFileSync(AGENT_DATA, 'utf-8'));
  assert.ok(Array.isArray(data.projects));
  assert.ok(data.projects.length > 0);
  assert.ok(data.projects[0].id);
  assert.ok(data.projects[0].name);
  assert.ok(data.projects[0].role);
});

test('build-agent-data: ai_builds array is non-empty', () => {
  const data = JSON.parse(readFileSync(AGENT_DATA, 'utf-8'));
  assert.ok(Array.isArray(data.ai_builds));
  assert.ok(data.ai_builds.length > 0);
  assert.ok(data.ai_builds[0].id);
  assert.ok(data.ai_builds[0].name);
  assert.ok(data.ai_builds[0].status);
});

test('build-agent-data: reel-index.json is copied to public/', () => {
  assert.ok(existsSync(REEL_COPY), 'public/reel-index.json must exist');
  const src = JSON.parse(readFileSync(join(ROOT, 'src/data/reel-index.json'), 'utf-8'));
  const copy = JSON.parse(readFileSync(REEL_COPY, 'utf-8'));
  assert.equal(src.schema_version, copy.schema_version);
  assert.equal(src.reel_url, copy.reel_url);
});

test('build-agent-data: generated_at is a valid ISO date string', () => {
  const data = JSON.parse(readFileSync(AGENT_DATA, 'utf-8'));
  const d = new Date(data.generated_at);
  assert.ok(!isNaN(d.getTime()), 'generated_at must be a valid date');
});

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
