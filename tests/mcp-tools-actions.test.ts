import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateActionParams } from '../api/_lib/tools-actions.ts';

test('actions: rejects missing agent_name', () => {
  const result = validateActionParams({ human_name: 'Alice' });
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('agent_name'));
});

test('actions: rejects missing human_name', () => {
  const result = validateActionParams({ agent_name: 'Claude' });
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('human_name'));
});

test('actions: rejects empty agent_name string', () => {
  const result = validateActionParams({ agent_name: '', human_name: 'Alice' });
  assert.equal(result.valid, false);
});

test('actions: rejects empty human_name string', () => {
  const result = validateActionParams({ agent_name: 'Claude', human_name: '  ' });
  assert.equal(result.valid, false);
});

test('actions: passes with both fields present and non-empty', () => {
  const result = validateActionParams({ agent_name: 'Claude', human_name: 'Alice' });
  assert.equal(result.valid, true);
  assert.equal(result.error, undefined);
});
