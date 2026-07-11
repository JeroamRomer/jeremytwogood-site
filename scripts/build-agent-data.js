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
