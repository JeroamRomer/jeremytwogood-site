import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');

function getHtml(file) {
  const path = join(DIST, file);
  if (!existsSync(path)) throw new Error(`Missing: ${path}. Run npm run build first.`);
  return readFileSync(path, 'utf-8');
}

// ── BaseLayout ──────────────────────────────────────────────────────────────

test('smoke: dist/index.html exists', () => {
  assert.ok(existsSync(join(DIST, 'index.html')));
});

test('smoke: index.html has JSON-LD Person schema', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('"@type": "Person"'), 'Person schema must be present');
  assert.ok(html.includes('Jeremy Twogood'), 'Name must appear in JSON-LD');
});

test('smoke: index.html has MCP discovery comment', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('MCP-AGENT:'), 'MCP discovery comment must be present');
});

test('smoke: index.html has agent-data link tag', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('rel="agent-data"'), 'agent-data link tag must be present');
});

test('smoke: index.html has OG meta tags', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('og:title'), 'og:title must be present');
  assert.ok(html.includes('og:description'), 'og:description must be present');
  assert.ok(html.includes('twitter:card'), 'twitter:card must be present');
});

// ── Nav ─────────────────────────────────────────────────────────────────────

test('smoke: index.html has nav with correct links', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('<nav'), 'nav element must be present');
  assert.ok(html.includes('href="/#projects"'), 'Work link must point to /#projects');
  assert.ok(html.includes('href="/reel"'), 'Reel link must be present');
  assert.ok(html.includes('href="/ai-builds"'), 'AI Builds link must be present');
  assert.ok(html.includes('href="/#contact"'), 'Contact link must be present');
});

// ── Hero ─────────────────────────────────────────────────────────────────────

test('smoke: index.html has hero section with name and CTA', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="hero"'), '#hero section must exist');
  assert.ok(html.includes('Jeremy Twogood'), 'Name must appear in hero');
  assert.ok(html.includes('Watch the Reel'), 'CTA link must be present');
  assert.ok(html.includes('href="/reel"'), 'CTA must link to /reel');
});

// ── Reel ─────────────────────────────────────────────────────────────────────

test('smoke: index.html has reel section with YouTube iframe', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="reel"'), '#reel section must exist');
  assert.ok(html.includes('youtube.com/embed'), 'YouTube embed must be present');
  assert.ok(html.includes('id="reel-index-data"'), 'reel-index data block must be present');
});

// ── Clients ──────────────────────────────────────────────────────────────────

test('smoke: index.html has clients section with client names', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="clients"'), '#clients section must exist');
  assert.ok(html.includes('Google'), 'Google must appear in clients');
  assert.ok(html.includes('Microsoft Xbox'), 'Xbox must appear in clients');
  assert.ok(html.includes('Shell'), 'Shell must appear in clients');
});

// ── Projects ─────────────────────────────────────────────────────────────────

test('smoke: index.html has projects section with video cards', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="projects"'), '#projects section must exist');
  assert.ok(html.includes('Shell Ojibway Artist Feature'), 'First project name must appear');
  assert.ok(html.includes('youtube.com'), 'Projects must link to YouTube');
  assert.ok(html.includes('class="projects__role-tag"'), 'Role tags must be present');
});

// ── AI Builds ────────────────────────────────────────────────────────────────

test('smoke: index.html has ai-builds section with preview cards', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="ai-builds"'), '#ai-builds section must exist');
  assert.ok(html.includes('The Gibbon Knight'), 'First AI build must appear');
  assert.ok(html.includes('href="/ai-builds"'), '"See all builds" link must be present');
  assert.ok(html.includes('class="ai-builds__status"'), 'Status badges must be present');
});

test('smoke: /ai-builds/index.html exists with full grid', () => {
  const html = getHtml('ai-builds/index.html');
  assert.ok(html.includes('The Gibbon Knight'), 'Gibbon Knight must appear');
  assert.ok(html.includes('Rome Brone'), 'Rome Brone must appear');
  assert.ok(html.includes('Unbusy App'), 'Unbusy must appear');
  assert.ok(html.includes('Bike App'), 'Bike App must appear');
});

// ── Contact & Footer ─────────────────────────────────────────────────────────

test('smoke: index.html has contact section with email and social links', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="contact"'), '#contact section must exist');
  assert.ok(html.includes('mailto:'), 'Email link must be present');
  assert.ok(html.includes('youtube.com'), 'YouTube link must be in contact');
});

test('smoke: index.html has footer with Jeroam SoundCloud line', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('<footer'), 'footer element must be present');
  assert.ok(html.includes('soundcloud.com/jeroam'), 'Jeroam SoundCloud link must be in footer');
  assert.ok(html.includes('Jeroam'), 'Jeroam name must appear in footer');
});

// ── Section order ────────────────────────────────────────────────────────────

test('smoke: index.html section order is correct', () => {
  const html = getHtml('index.html');
  const heroIdx     = html.indexOf('id="hero"');
  const reelIdx     = html.indexOf('id="reel"');
  const clientsIdx  = html.indexOf('id="clients"');
  const projectsIdx = html.indexOf('id="projects"');
  const aiBuildsIdx = html.indexOf('id="ai-builds"');
  const contactIdx  = html.indexOf('id="contact"');

  assert.ok(heroIdx     < reelIdx,     'hero must come before reel');
  assert.ok(reelIdx     < clientsIdx,  'reel must come before clients');
  assert.ok(clientsIdx  < projectsIdx, 'clients must come before projects');
  assert.ok(projectsIdx < aiBuildsIdx, 'projects must come before ai-builds');
  assert.ok(aiBuildsIdx < contactIdx,  'ai-builds must come before contact');
});

// ── Standalone pages ─────────────────────────────────────────────────────────

test('smoke: /reel/index.html exists with VideoObject JSON-LD', () => {
  const html = getHtml('reel/index.html');
  assert.ok(html.includes('"@type": "VideoObject"'), 'VideoObject JSON-LD must be present');
  assert.ok(html.includes('id="reel"'), 'Reel section must be present');
  assert.ok(html.includes('id="reel-index-data"'), 'reel-index data block must be present');
});
