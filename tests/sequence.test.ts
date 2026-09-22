import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loopFor, PREVIEW_LOOPS } from '../src/lib/media.ts';
import { buildSequence, hasCaseStudy, mmss, orderOnlineFirst, roleLabel, rulerMarks, visibleRulerMarks } from '../src/lib/sequence.ts';

const base = { client: 'C', year: '2020', type: 'T', thumbnail: '/t.jpg' };

test('mmss: pads minutes and seconds, adds hours past 3600', () => {
  assert.equal(mmss(0), '00:00');
  assert.equal(mmss(437), '07:17');
  assert.equal(mmss(3723), '1:02:03');
  assert.equal(mmss(-5), '00:00');
});

test('orderOnlineFirst: keeps order, moves coming-soon items last', () => {
  const out = orderOnlineFirst([{ id: 'a', coming_soon: true }, { id: 'b' }, { id: 'c' }]);
  assert.deepEqual(out.map((x) => x.id), ['b', 'c', 'a']);
});

test('roleLabel: joins arrays, falls back to disciplines', () => {
  assert.equal(roleLabel({ role: ['Editor', 'Colour Grade'] }), 'Editor, Colour Grade');
  assert.equal(roleLabel({ disciplines: 'Motion Graphics · Titles' }), 'Motion Graphics · Titles');
  assert.equal(roleLabel({}), '');
});

test('hasCaseStudy: excludes coming-soon and comparison projects', () => {
  assert.equal(hasCaseStudy({ id: 'x' }), true);
  assert.equal(hasCaseStudy({ id: 'x', coming_soon: true }), false);
  assert.equal(hasCaseStudy({ id: 'x', comparison: true }), false);
});

test('loopFor: preview loops, comparison fallback, null otherwise', () => {
  assert.deepEqual(loopFor({ id: 'shell-john-williams' }), { webm: '/assets/shell-loop.webm', mp4: '/assets/shell-loop.mp4' });
  assert.deepEqual(loopFor({ id: 'thales-rcn', comparison: true, graded_src: '/assets/thales-graded.mp4' }), { webm: '/assets/thales-loop.webm', mp4: '/assets/thales-loop.mp4' });
  assert.deepEqual(loopFor({ id: 'another-comparison', comparison: true, graded_src: '/assets/graded.mp4' }), { mp4: '/assets/graded.mp4' });
  assert.equal(loopFor({ id: 'nope' }), null);
  assert.equal(Object.keys(PREVIEW_LOOPS).length, 7);
});

test('buildSequence: widths follow real durations and sum to 100%', () => {
  const seq = buildSequence([
    { ...base, id: 'a', name: 'A', duration_seconds: 300 },
    { ...base, id: 'b', name: 'B', duration_seconds: 100 },
  ], () => null);
  assert.equal(seq.layoutSeconds, 400);
  assert.equal(seq.clips[0].widthPct, 75);
  assert.equal(seq.clips[1].startPct, 75);
  assert.equal(seq.clips[1].widthPct, 25);
  assert.equal(seq.clips[0].durationLabel, '05:00');
  assert.equal(seq.allKnown, true);
  assert.equal(seq.knownSeconds, 400);
});

test('buildSequence: unknown durations take the median width but show no label', () => {
  const seq = buildSequence([
    { ...base, id: 'a', name: 'A', duration_seconds: 100 },
    { ...base, id: 'b', name: 'B' },
    { ...base, id: 'c', name: 'C', duration_seconds: 300 },
  ], () => null);
  const b = seq.clips.find((c) => c.id === 'b')!;
  assert.equal(b.durationSeconds, null);
  assert.equal(b.durationLabel, '');
  assert.equal(b.layoutSeconds, 200);
  assert.equal(b.relPct, 0);
  assert.equal(seq.allKnown, false);
  assert.equal(seq.knownSeconds, 400);
});

test('buildSequence: offline clips go last, have no href or loop, and do not affect allKnown', () => {
  const seq = buildSequence([
    { ...base, id: 'soon', name: 'Soon', coming_soon: true },
    { ...base, id: 'a', name: 'A', duration_seconds: 60 },
  ], () => ({ mp4: '/x.mp4' }));
  assert.deepEqual(seq.clips.map((c) => c.id), ['a', 'soon']);
  const soon = seq.clips[1];
  assert.equal(soon.offline, true);
  assert.equal(soon.href, null);
  assert.equal(soon.loop, null);
  assert.equal(seq.allKnown, true);
  assert.equal(seq.clips[0].href, '/work/a');
});

test('buildSequence: real data puts Shell first with 07:17 and CAOT last', () => {
  const projects = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url), 'utf-8'));
  const seq = buildSequence(projects, loopFor);
  assert.equal(seq.clips[0].id, 'shell-john-williams');
  assert.equal(seq.clips[0].durationLabel, '07:17');
  assert.equal(seq.clips.at(-1)!.id, 'caot-brand-film');
  const total = seq.clips.reduce((a, c) => a + c.widthPct, 0);
  assert.ok(Math.abs(total - 100) < 0.01, `widths sum to ${total}`);
});

test('rulerMarks: picks a step giving at most maxMarks marks', () => {
  const marks = rulerMarks(1351);
  assert.equal(marks[0].label, '00:00');
  assert.ok(marks.length <= 6);
  assert.equal(marks[1].seconds, 300);
  assert.deepEqual(rulerMarks(0), []);
});

test('visibleRulerMarks: blanks every label when an online clip has no known duration', () => {
  const seq = buildSequence([
    { ...base, id: 'a', name: 'A', duration_seconds: 100 },
    { ...base, id: 'b', name: 'B' },
  ], () => null);
  assert.equal(seq.allKnown, false);
  const marks = visibleRulerMarks(seq);
  assert.ok(marks.length > 0, 'tick lines must still be produced');
  assert.ok(marks.every((m) => m.label === ''), 'no label may be invented while a duration is unknown');
});

test('visibleRulerMarks: blanks labels that fall inside an offline clip\'s placeholder span', () => {
  const seq = buildSequence([
    { ...base, id: 'a', name: 'A', duration_seconds: 100 },
    { ...base, id: 'soon', name: 'Soon', coming_soon: true },
  ], () => null);
  assert.equal(seq.allKnown, true);
  assert.ok(seq.layoutSeconds > seq.knownSeconds, 'offline placeholder must pad the layout past the known span');
  const marks = visibleRulerMarks(seq);
  const within = marks.filter((m) => m.seconds <= seq.knownSeconds);
  const beyond = marks.filter((m) => m.seconds > seq.knownSeconds);
  assert.ok(within.some((m) => m.label !== ''), 'marks inside the known span keep their real label');
  assert.ok(beyond.length > 0, 'test must actually exercise a mark past the known span');
  assert.ok(beyond.every((m) => m.label === ''), 'marks inside the offline placeholder span must not show a label');
});

test('visibleRulerMarks: shows every label when every clip has a known duration', () => {
  const seq = buildSequence([
    { ...base, id: 'a', name: 'A', duration_seconds: 300 },
    { ...base, id: 'b', name: 'B', duration_seconds: 100 },
  ], () => null);
  assert.deepEqual(visibleRulerMarks(seq), rulerMarks(seq.layoutSeconds));
});
