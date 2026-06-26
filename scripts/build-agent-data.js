import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const DATA = join(ROOT, 'src', 'data');
const PUBLIC = join(ROOT, 'public');

// Ensure public/ and public/.well-known/ exist
if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, { recursive: true });
if (!existsSync(join(PUBLIC, '.well-known'))) {
  mkdirSync(join(PUBLIC, '.well-known'), { recursive: true });
}

const profile = JSON.parse(readFileSync(join(DATA, 'profile.json'), 'utf-8'));
const projects = JSON.parse(readFileSync(join(DATA, 'projects.json'), 'utf-8'));
const aiBuilds = JSON.parse(readFileSync(join(DATA, 'ai-builds.json'), 'utf-8'));
const reelIndex = JSON.parse(readFileSync(join(DATA, 'reel-index.json'), 'utf-8'));

const agentData = {
  schema_version: '1.0',
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
    agent_data:     '/agent-data.json',
    reel_index:     '/reel-index.json',
    availability:   '/availability.json',
    agent_manifest: '/.well-known/agent.json',
  },
};

writeFileSync(join(PUBLIC, 'agent-data.json'), JSON.stringify(agentData, null, 2), 'utf-8');
copyFileSync(join(DATA, 'reel-index.json'), join(PUBLIC, 'reel-index.json'));

console.log('✓ public/agent-data.json generated');
console.log('✓ public/reel-index.json copied');
