import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
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
