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

test('smoke: panel bar links to sections on home and back home elsewhere', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('class="bar"'), 'panel bar must render');
  assert.ok(html.includes('<nav'), 'nav landmark must be present');
  for (const id of ['work', 'about', 'builds', 'sound', 'contact']) {
    assert.ok(html.includes(`href="#${id}"`), `home tab #${id} must be present`);
  }
  assert.ok(html.includes('Available · 2026'), 'availability readout must render');
  assert.ok(html.includes('EST · GMT−5'), 'timezone readout must render');
  const caseStudy = getHtml('work/shell-john-williams/index.html');
  assert.ok(caseStudy.includes('href="/#work"'), 'tabs on other pages must point back home');
  assert.ok(!html.includes('rainbow-rule'), 'rainbow rule is retired');
});

// ── Suite ────────────────────────────────────────────────────────────────────

test('smoke: suite renders the monitor, info pane and sequence', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="top"'), '#top suite must exist');
  assert.ok(html.includes('data-suite'), 'suite root must be marked');
  assert.match(html, /<h1[^>]*>Jeremy Twogood/, 'name must be the h1');
  assert.ok(html.includes('Watch Sizzle'), 'Watch Sizzle CTA must be present');
  assert.ok(html.includes('youtube.com/watch?v=Tl1n3hu4e8I'), 'CTA must fall back to the reel on YouTube');
  assert.ok(html.includes('data-video-embed="https://www.youtube-nocookie.com/embed/Tl1n3hu4e8I'), 'CTA must open the reel in the lightbox');
  assert.ok(html.includes('id="lightbox"'), 'lightbox must be mounted on the homepage');
  assert.ok(html.includes('data-monitor'), 'program monitor must render');
  assert.ok(html.includes('data-sequence'), 'sequence must render');
  assert.ok(html.includes('id="sequence-data"'), 'player payload must render');
  assert.ok(html.includes('07:17'), 'Shell clip must show its real running time');
  assert.ok(html.includes('Toronto, ON · 43.65°N'), 'location readout keeps its place');
  assert.ok(!html.includes('hero__meta'), 'old hero is gone');
});

test('smoke: sequence clips link to case studies and the offline clip comes last', () => {
  const html = getHtml('index.html');
  const seqStart = html.indexOf('data-sequence');
  const seq = html.slice(seqStart, html.indexOf('</ol>', seqStart));
  assert.ok(seq.includes('href="/work/shell-john-williams"'), 'Shell clip must link to its case study');
  assert.ok(seq.indexOf('Shell') < seq.indexOf('Canadian Association'), 'CAOT (offline) must come after Shell');
  assert.ok(seq.includes('Offline'), 'offline clip must be labelled');
});

// ── Work ─────────────────────────────────────────────────────────────────────

test('smoke: work bin links items to case studies with hover previews', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="work"'), '#work bin must exist');
  const work = html.slice(html.indexOf('id="work"'), html.indexOf('id="about"'));
  assert.ok(work.includes('href="/work/shell-john-williams"'), 'items must link to case-study pages');
  assert.ok(work.includes('work-item__preview'), 'hover-preview video must be present');
  assert.ok(work.includes('shell-loop.webm'), 'preview loop source must be wired');
  assert.ok(work.includes('Shell × John Williams'), 'titles must be visible at rest');
  assert.ok(work.indexOf('Shell × John Williams') < work.indexOf('Canadian Association'), 'coming-soon project renders last');
  assert.ok(work.includes('In progress'), 'coming-soon project keeps its status');
  assert.ok(!work.includes('Twenty years of'), 'template headline is retired');
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

test('smoke: about bin shows bio, properties and every client', () => {
  const html = getHtml('index.html');
  const about = html.slice(html.indexOf('id="about"'), html.indexOf('id="builds"'));
  assert.ok(about.includes('Jeremy Twogood'), 'name must appear in about');
  assert.ok(about.includes('Toronto'), 'Toronto must appear in about');
  assert.ok(about.includes('A producer who still cuts the picture.'), 'lead line keeps its words');
  assert.ok(about.includes('id="clients"'), 'clients anchor must exist');
  const profile = JSON.parse(readFileSync(join(ROOT, 'src/data/profile.json'), 'utf-8'));
  for (const name of profile.clients) {
    const escaped = name.replace(/&/g, '&amp;');
    assert.ok(about.includes(name) || about.includes(escaped), `about must list ${name}`);
  }
  assert.ok(!about.includes('client-list'), 'numbered client index is retired');
});

// ── AI Builds ────────────────────────────────────────────────────────────────

test('smoke: builds bin lists every build with a plain status', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('id="builds"'), '#builds bin must exist');
  const builds = html.slice(html.indexOf('id="builds"'), html.indexOf('id="sound"'));
  for (const name of ['Unbusy Scanner', 'Production Intelligence', 'Gibbon Knight', 'MCP Integrator', 'Pedal Path']) {
    assert.ok(builds.includes(name), `${name} must appear`);
  }
  assert.ok(builds.includes('build-row__status'), 'status must render');
  assert.ok(!builds.includes('class="tag"'), 'tag chips are retired');
  assert.ok(builds.includes('href="/ai-builds"'), 'link to the full page must remain');
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

test('smoke: sound bin labels tracks as audio clips and plays inline', () => {
  const html = getHtml('index.html');
  const sound = html.slice(html.indexOf('id="sound"'), html.indexOf('id="contact"'));
  assert.ok(sound.includes('class="bin sound"'), 'sound must be a bin');
  assert.ok(sound.includes('>A1<'), 'first track is labelled A1');
  assert.ok(sound.includes('tracks__hint'), 'rows say they play inline');
  assert.ok(!sound.includes('↗'), 'external-link arrow is retired');
  assert.ok(html.includes('color=%23f4a23b'), 'SoundCloud player uses the mango accent');
  assert.ok(!html.includes('color=%23c8922a'), 'old amber player colour is gone');
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

// ── NLE timeline bar ────────────────────────────────────────────────────────

test('smoke: homepage mounts the NLE timeline bar', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('data-tlbar'), 'timeline bar root must be present');
  assert.ok(html.includes('tlbar__clip'), 'clip segments must render');
});

test('smoke: timeline bar is homepage-only', () => {
  const caseStudy = getHtml('work/shell-john-williams/index.html');
  assert.ok(!caseStudy.includes('data-tlbar'), 'case-study pages must not mount the bar');
});

// ── Sound waveforms ─────────────────────────────────────────────────────────

test('smoke: sound waveform click-to-seek is wired for the active track', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('seekTo'), 'waveform click handler must call widget.seekTo');
  assert.ok(html.includes('getDuration'), 'waveform click handler must resolve track duration before seeking');
});

// ── Projects section ─────────────────────────────────────────────────────────

test('smoke: work bin count and years are derived from projects.json', () => {
  const projects = JSON.parse(readFileSync(join(ROOT, 'src/data/projects.json'), 'utf-8'));
  const years = projects.map((p) => Number(p.year));
  const expected = `${projects.length} projects · ${Math.min(...years)} to ${Math.max(...years)}`;
  assert.ok(getHtml('index.html').includes(expected), `index.html must contain "${expected}"`);
});

test('smoke: sound section track rows are restructured for waveforms', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('tracks__row'), 'restructured track rows must render');
  const waveforms = JSON.parse(readFileSync(join(ROOT, 'src/data/waveforms.json'), 'utf-8'));
  if (Object.keys(waveforms).length === 0) {
    // Note: the always-present playback-sync <script> legitimately references
    // '.tracks__wave-lit' / '.tracks__wave-ph' as querySelector strings, so we
    // check for the markup wrapper specifically rather than the bare substring.
    assert.ok(!html.includes('class="tracks__wave"'), 'no waveform strips until peak data exists');
  } else {
    assert.ok(html.includes('tracks__wave-base'), 'waveform SVG must render');
    assert.ok(html.includes('tracks__wave-lit'), 'lit overlay must render');
  }
});

// ── Scroll-in reveals ───────────────────────────────────────────────────────

test('smoke: scroll reveals are retired; the js class still lands before paint', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes("classList.add('js')"), 'inline js-class script must be present');
  assert.ok(!getBundledCss().includes('is-inview'), 'reveal CSS is retired');
  assert.ok(!html.includes('revealTargets'), 'reveal observer is retired');
  const caseStudy = getHtml('work/shell-john-williams/index.html');
  assert.ok(caseStudy.includes("classList.add('js')"), 'js-class script must be on case-study pages too');
});

test('smoke: contact bin lists every way to reach Jeremy', () => {
  const html = getHtml('index.html');
  const contact = html.slice(html.indexOf('id="contact"'));
  assert.ok(contact.includes('class="bin contact"'), 'contact must be a bin');
  for (const needle of ['mailto:', 'linkedin.com', 'soundcloud.com/j-twogood', 'href="/reel"', 'Available · 2026']) {
    assert.ok(contact.includes(needle), `contact must include ${needle}`);
  }
});

// ── Hover timecodes ─────────────────────────────────────────────────────────

test('smoke: work items with previews render a timecode chip at their running time', () => {
  const html = getHtml('index.html');
  assert.ok(html.includes('work-item__tc'), 'timecode chip must render');
  assert.match(html, /data-duration="07:17"/, 'chip must rest at the real running time');
});

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

// ── Open Sequence design system ─────────────────────────────────────────────

test('smoke: bundled CSS defines the Open Sequence tokens and primitives', () => {
  const css = getBundledCss();
  for (const token of ['--panel:', '--mango:', '--clip-video:', '--font-readout:']) {
    assert.ok(css.includes(token), `token ${token} must be defined`);
  }
  for (const cls of ['.pane-head', '.bin__head', '.readout', '.pbtn--primary', '.props']) {
    assert.ok(css.includes(cls), `primitive ${cls} must be defined`);
  }
});

test('smoke: pages load Archivo, Barlow and Martian Mono', () => {
  const html = getHtml('index.html');
  for (const family of ['family=Archivo', 'family=Barlow', 'family=Martian+Mono']) {
    assert.ok(html.includes(family), `${family} must be requested`);
  }
});
