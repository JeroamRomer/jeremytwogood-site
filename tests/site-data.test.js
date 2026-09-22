import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(join(ROOT, p), 'utf-8');
const profile = JSON.parse(read('src/data/profile.json'));
const projects = JSON.parse(read('src/data/projects.json'));
const agentData = JSON.parse(read('public/agent-data.json'));

const ALL_CLIENTS = [
  'Google', 'Microsoft Xbox', 'Shell', 'Sony Ericsson', 'Sobeys',
  'Mirvish Productions', 'Canova Media', 'Journeyman Film Company',
  'Volvo', 'Mitsubishi Motors',
  'Simbility', 'NS Health', 'Thales Canada', 'Ewing Morris & Co.',
];

test('site-data: profile.clients is the merged list with no duplicates', () => {
  for (const name of ALL_CLIENTS) assert.ok(profile.clients.includes(name), `missing client: ${name}`);
  assert.equal(new Set(profile.clients).size, profile.clients.length, 'clients must be unique');
});

test('site-data: HIRE.md lists every client', () => {
  const hire = read('HIRE.md');
  for (const name of profile.clients) assert.ok(hire.includes(name), `HIRE.md missing ${name}`);
});

test('site-data: every YouTube project records a positive integer duration', () => {
  for (const p of projects.filter((p) => p.youtube_id)) {
    assert.ok(Number.isInteger(p.duration_seconds) && p.duration_seconds > 0, `${p.id} needs duration_seconds`);
  }
});

test('site-data: durations, when present, are positive integers', () => {
  for (const p of projects) {
    if (p.duration_seconds === undefined) continue;
    assert.ok(Number.isInteger(p.duration_seconds) && p.duration_seconds > 0, `${p.id} has a bad duration`);
  }
});

test('site-data: Simbility credits list editing without a producer credit', () => {
  const simbility = projects.find((project) => project.id === 'simbility-desk-series');
  const agentSimbility = agentData.projects.find((project) => project.id === 'simbility-desk-series');
  assert.ok(simbility, 'Simbility must remain in the selected projects');
  assert.ok(agentSimbility, 'Simbility must remain in the public agent data');
  assert.deepEqual(simbility.role, ['Editor']);
  assert.equal(simbility.disciplines, 'Directing · Editing');
  assert.deepEqual(agentSimbility.role, ['Editor']);
});
