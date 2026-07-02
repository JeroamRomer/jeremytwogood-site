import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

// ── Chat widget ──────────────────────────────────────────────────────────────

test('smoke: index.html mounts the chat widget with trigger and starters', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('data-chat-widget'), 'chat widget root must be present');
  assert.ok(html.includes('Ask about my work'), 'panel title must render');
  assert.ok(html.includes("aria-label=\"Ask about Jeremy's work\""), 'trigger must be labelled');
  assert.ok(html.includes('colour-grading experience'), 'starter question must render');
});

test('smoke: chat widget is mounted site-wide (case-study page too)', () => {
  const html = getHtml('work/shell-john-williams/index.html');
  assert.ok(html.includes('data-chat-widget'), 'widget must appear on all pages via BaseLayout');
});

// ── Nav ─────────────────────────────────────────────────────────────────────

test('smoke: index.html has nav with correct links', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('<nav'), 'nav element must be present');
  assert.ok(html.includes('href="#work"'), 'Work link must point to #work');
  assert.ok(html.includes('href="#about"'), 'About link must be present');
  assert.ok(html.includes('href="#builds"'), 'Builds link must be present');
  assert.ok(html.includes('href="#sound"'), 'Sound link must be present');
  assert.ok(html.includes('href="#contact"'), 'Contact link must be present');
});

// ── Hero ─────────────────────────────────────────────────────────────────────

test('smoke: index.html has hero section with name and CTA', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="top"'), '#top hero section must exist');
  assert.ok(html.includes('Jeremy Twogood'), 'Name must appear in hero');
  assert.ok(html.includes('Watch Sizzle'), 'Watch Sizzle CTA must be present');
  assert.ok(html.includes('youtube.com/watch?v=Tl1n3hu4e8I'), 'CTA must link to sizzle reel');
});

// ── Work ─────────────────────────────────────────────────────────────────────

test('smoke: index.html work section links to case-study pages', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="work"'), '#work section must exist');
  assert.ok(html.includes('Shell'), 'Shell must appear in work section');
  assert.ok(html.includes('href="/work/shell-john-williams"'), 'work cards must link to case-study pages');
  assert.ok(html.includes('work-card__preview'), 'hover-preview video must be present');
  assert.ok(html.includes('shell-loop.webm'), 'preview loop source must be wired');
});

test('smoke: case-study page has VideoObject, breadcrumb, content, and lightbox', () => {
  const html = getHtml('work/shell-john-williams/index.html');
  assert.ok(html.includes('"@type": "VideoObject"'), 'VideoObject JSON-LD must be present');
  assert.ok(html.includes('"@type": "BreadcrumbList"'), 'BreadcrumbList JSON-LD must be present');
  assert.ok(html.includes('John Williams'), 'summary content must render');
  assert.ok(html.includes('id="lightbox"'), 'lightbox must be present on detail page');
  assert.ok(html.includes('Selected Work'), 'back link must be present');
});

test('smoke: all six case-study pages are generated', () => {
  const ids = ['shell-john-williams', 'simbility-desk-series', 'ttms-chef-nuit', 'xbox-forza-5', 'ttms-5-points', 'ns-health-westray'];
  for (const id of ids) {
    assert.ok(existsSync(join(DIST, 'work', id, 'index.html')), `missing case-study page: ${id}`);
  }
});

// ── About ────────────────────────────────────────────────────────────────────

test('smoke: index.html has about section', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="about"'), '#about section must exist');
  assert.ok(html.includes('Jeremy Twogood'), 'Name must appear in about');
  assert.ok(html.includes('Toronto'), 'Toronto must appear in about');
});

// ── AI Builds ────────────────────────────────────────────────────────────────

test('smoke: index.html has builds section with cards', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="builds"'), '#builds section must exist');
  assert.ok(html.includes('Gibbon Knight'), 'Gibbon Knight must appear in builds');
  assert.ok(html.includes('build-card__status'), 'Status badges must be present');
});

test('smoke: /ai-builds/index.html exists with full grid', () => {
  const html = getHtml('ai-builds/index.html');
  assert.ok(html.includes('Gibbon Knight'), 'Gibbon Knight must appear');
  assert.ok(html.includes('Production Intelligence'), 'Production Intelligence must appear');
  assert.ok(html.includes('Unbusy Scanner'), 'Unbusy Scanner must appear');
  assert.ok(html.includes('MCP Integrator'), 'MCP Integrator must appear');
  assert.ok(html.includes('Pedal Path'), 'Pedal Path must appear');
});

// ── Sound ─────────────────────────────────────────────────────────────────────

test('smoke: index.html has sound section with tracks', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="sound"'), '#sound section must exist');
  assert.ok(html.includes('soundcloud.com/j-twogood'), 'SoundCloud link must be present');
  assert.ok(html.includes('Original compositions'), 'Section heading must be present');
});

// ── Contact & Footer ─────────────────────────────────────────────────────────

test('smoke: index.html has contact section with email and social links', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="contact"'), '#contact section must exist');
  assert.ok(html.includes('mailto:'), 'Email link must be present');
  assert.ok(html.includes('linkedin.com'), 'LinkedIn link must be in contact');
});

test('smoke: index.html has footer', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('<footer'), 'footer element must be present');
  assert.ok(html.includes('Jeremy Twogood'), 'Name must appear in footer');
  assert.ok(html.includes('llms.txt'), 'llms.txt link must be in footer');
});

// ── Section order ────────────────────────────────────────────────────────────

test('smoke: index.html section order is correct', () => {
  const html = getHtml('index.html');
  const topIdx    = html.indexOf('id="top"');
  const workIdx   = html.indexOf('id="work"');
  const aboutIdx  = html.indexOf('id="about"');
  const buildsIdx = html.indexOf('id="builds"');
  const soundIdx  = html.indexOf('id="sound"');
  const contactIdx = html.indexOf('id="contact"');

  assert.ok(topIdx     < workIdx,    'top/hero must come before work');
  assert.ok(workIdx    < aboutIdx,   'work must come before about');
  assert.ok(aboutIdx   < buildsIdx,  'about must come before builds');
  assert.ok(buildsIdx  < soundIdx,   'builds must come before sound');
  assert.ok(soundIdx   < contactIdx, 'sound must come before contact');
});

// ── Standalone pages ─────────────────────────────────────────────────────────

test('smoke: /reel/index.html exists with VideoObject JSON-LD', () => {
  const html = getHtml('reel/index.html');
  assert.ok(html.includes('"@type": "VideoObject"'), 'VideoObject JSON-LD must be present');
  assert.ok(html.includes('id="reel"'), 'Reel section must be present');
  assert.ok(html.includes('id="reel-index-data"'), 'reel-index data block must be present');
});

// ── View-transition morph ───────────────────────────────────────────────────

function getBundledCss() {
  const dir = join(DIST, '_astro');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(dir, f), 'utf-8'))
    .join('\n');
}

test('smoke: cross-document view transitions enabled in bundled CSS', () => {
  assert.ok(getBundledCss().includes('@view-transition'), '@view-transition rule must be present');
});

test('smoke: work card and case-study hero share a view-transition-name', () => {
  const home = getHtml('index.html');
  const caseStudy = getHtml('work/shell-john-williams/index.html');
  assert.ok(home.includes('view-transition-name:work-shell-john-williams'), 'card still must be tagged');
  assert.ok(caseStudy.includes('view-transition-name:work-shell-john-williams'), 'case hero must be tagged');
});
