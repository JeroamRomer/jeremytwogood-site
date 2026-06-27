import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContactInput, sendChatMessage, MAX_MESSAGE_CHARS } from '../api/_lib/chat-actions.ts';

test('contact: valid input with all fields passes', () => {
  const r = validateContactInput({ visitor_name: 'Sam', visitor_email: 'sam@example.com', message: 'Love your work' });
  assert.equal(r.valid, true);
  if (r.valid) {
    assert.equal(r.value.visitor_name, 'Sam');
    assert.equal(r.value.visitor_email, 'sam@example.com');
    assert.equal(r.value.message, 'Love your work');
  }
});

test('contact: email is optional', () => {
  const r = validateContactInput({ visitor_name: 'Sam', message: 'Hi' });
  assert.equal(r.valid, true);
  if (r.valid) assert.equal(r.value.visitor_email, undefined);
});

test('contact: rejects missing/empty name', () => {
  assert.equal(validateContactInput({ message: 'Hi' }).valid, false);
  assert.equal(validateContactInput({ visitor_name: '  ', message: 'Hi' }).valid, false);
});

test('contact: rejects missing/empty message', () => {
  assert.equal(validateContactInput({ visitor_name: 'Sam' }).valid, false);
  assert.equal(validateContactInput({ visitor_name: 'Sam', message: '' }).valid, false);
});

test('contact: rejects a malformed email when one is provided', () => {
  assert.equal(validateContactInput({ visitor_name: 'Sam', visitor_email: 'not-an-email', message: 'Hi' }).valid, false);
});

test('contact: truncates an over-long message', () => {
  const long = 'x'.repeat(MAX_MESSAGE_CHARS + 200);
  const r = validateContactInput({ visitor_name: 'Sam', message: long });
  assert.equal(r.valid, true);
  if (r.valid) assert.equal(r.value.message.length, MAX_MESSAGE_CHARS);
});

test('contact: sendChatMessage degrades gracefully when email is not configured', async () => {
  // The test runner does not load .env, so RESEND_API_KEY is absent here.
  const prev = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    const r = await sendChatMessage({ visitor_name: 'Sam', message: 'Hi' });
    assert.equal(r.ok, false);
    assert.match(r.text, /not configured|unavailable/i);
  } finally {
    if (prev !== undefined) process.env.RESEND_API_KEY = prev;
  }
});
