import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildChatSystem } from '../api/_lib/chat-system.ts';

const SYSTEM = buildChatSystem();

test('chat-system: embeds profile identity', () => {
  assert.ok(SYSTEM.includes('Jeremy Twogood'));
});

test('chat-system: embeds work projects and per-project video context', () => {
  assert.ok(SYSTEM.includes('John Williams'), 'a known project should appear');
  assert.ok(SYSTEM.includes('shell-john-williams'), 'project ids should appear for grounding');
});

test('chat-system: embeds skills and AI builds', () => {
  assert.ok(SYSTEM.includes('Colour Grading'), 'a known skill should appear');
  assert.ok(SYSTEM.includes('Gibbon Knight'), 'a known AI build should appear');
});

test('chat-system: includes a booking link', () => {
  assert.match(SYSTEM, /calendly/i);
});

test('chat-system: states the core guardrails', () => {
  assert.match(SYSTEM, /never invent/i, 'must instruct against fabrication');
  assert.match(SYSTEM, /third person/i, 'must set the third-person voice');
});

test('chat-system: requires plain-text output (widget renders textContent, not Markdown)', () => {
  assert.match(SYSTEM, /plain text/i, 'must ask for plain text');
  assert.match(SYSTEM, /markdown/i, 'must mention Markdown to forbid it');
});

test('chat-system: states the contact-action rules (confirm before sending)', () => {
  assert.match(SYSTEM, /send_message_to_jeremy/, 'must name the send tool');
  assert.match(SYSTEM, /confirm/i, 'must require confirmation before sending');
});

test('chat-system: does not leak placeholder tokens', () => {
  assert.ok(!SYSTEM.includes('REPLACE_ME'), 'placeholder data must not reach the model');
});

test('chat-system: is substantial (data is actually embedded)', () => {
  assert.ok(SYSTEM.length > 4000, 'system prompt should contain the embedded dataset');
});
