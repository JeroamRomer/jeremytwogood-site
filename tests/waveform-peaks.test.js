import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computePeaks } from '../scripts/waveform-peaks.mjs';

test('computePeaks: returns requested bucket count, normalized to 1', () => {
  const samples = new Int16Array(9600);
  for (let i = 0; i < samples.length; i++) samples[i] = (i % 100) * 100;
  const peaks = computePeaks(samples, 96);
  assert.equal(peaks.length, 96);
  assert.equal(Math.max(...peaks), 1);
  assert.ok(peaks.every((p) => p >= 0 && p <= 1));
});

test('computePeaks: silence yields zeros', () => {
  assert.deepEqual(computePeaks(new Int16Array(1000), 10), new Array(10).fill(0));
});

test('computePeaks: empty input yields empty array', () => {
  assert.deepEqual(computePeaks(new Int16Array(0), 10), []);
});

test('computePeaks: loud section stands out', () => {
  const samples = new Int16Array(1000);
  for (let i = 500; i < 600; i++) samples[i] = 30000;
  const peaks = computePeaks(samples, 10);
  assert.equal(peaks[5], 1);
  assert.equal(peaks[0], 0);
});
