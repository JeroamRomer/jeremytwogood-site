import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tcFormat } from '../src/scripts/timecode.ts';

test('tcFormat: zero is 00:00:00:00', () => {
  assert.equal(tcFormat(0), '00:00:00:00');
});

test('tcFormat: frames at 24fps', () => {
  assert.equal(tcFormat(1.5), '00:00:01:12');
});

test('tcFormat: minutes and hours roll over', () => {
  assert.equal(tcFormat(3725.25), '01:02:05:06');
});

test('tcFormat: negative and NaN clamp to zero', () => {
  assert.equal(tcFormat(-3), '00:00:00:00');
  assert.equal(tcFormat(Number.NaN), '00:00:00:00');
});

test('tcFormat: custom fps', () => {
  assert.equal(tcFormat(0.5, 30), '00:00:00:15');
});
