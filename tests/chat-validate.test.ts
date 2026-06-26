import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateChatRequest, MAX_CHARS, MAX_TURNS } from '../api/_lib/chat-validate.ts';

test('valid: a single user message passes and is returned', () => {
  const res = validateChatRequest({ messages: [{ role: 'user', content: 'Hi' }] });
  assert.equal(res.valid, true);
  if (res.valid) {
    assert.deepEqual(res.messages, [{ role: 'user', content: 'Hi' }]);
  }
});

test('invalid: non-object body', () => {
  assert.equal(validateChatRequest(null).valid, false);
  assert.equal(validateChatRequest('nope').valid, false);
});

test('invalid: missing or non-array messages', () => {
  assert.equal(validateChatRequest({}).valid, false);
  assert.equal(validateChatRequest({ messages: 'x' }).valid, false);
});

test('invalid: empty messages array', () => {
  assert.equal(validateChatRequest({ messages: [] }).valid, false);
});

test('invalid: bad role', () => {
  const res = validateChatRequest({ messages: [{ role: 'system', content: 'hi' }] });
  assert.equal(res.valid, false);
});

test('invalid: empty or non-string content', () => {
  assert.equal(validateChatRequest({ messages: [{ role: 'user', content: '' }] }).valid, false);
  assert.equal(validateChatRequest({ messages: [{ role: 'user', content: '   ' }] }).valid, false);
  assert.equal(validateChatRequest({ messages: [{ role: 'user', content: 42 }] }).valid, false);
});

test('invalid: conversation must end with a user message', () => {
  const res = validateChatRequest({
    messages: [
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello' },
    ],
  });
  assert.equal(res.valid, false);
});

test('normalize: over-long content is truncated to MAX_CHARS', () => {
  const long = 'a'.repeat(MAX_CHARS + 500);
  const res = validateChatRequest({ messages: [{ role: 'user', content: long }] });
  assert.equal(res.valid, true);
  if (res.valid) assert.equal(res.messages[0].content.length, MAX_CHARS);
});

test('normalize: only the last MAX_TURNS are kept, starting with a user turn', () => {
  const messages = [];
  for (let i = 0; i < MAX_TURNS + 6; i++) {
    messages.push({ role: i % 2 === 0 ? 'user' : 'assistant', content: `m${i}` });
  }
  // ensure it ends on a user turn
  messages.push({ role: 'user', content: 'final' });
  const res = validateChatRequest({ messages });
  assert.equal(res.valid, true);
  if (res.valid) {
    assert.ok(res.messages.length <= MAX_TURNS, 'must not exceed MAX_TURNS');
    assert.equal(res.messages[0].role, 'user', 'first kept turn must be a user turn');
    assert.equal(res.messages.at(-1).content, 'final');
  }
});
