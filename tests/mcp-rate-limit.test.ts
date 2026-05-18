import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, resetRateLimitStore } from '../api/_lib/rate-limit.ts';

test('rate-limit: first request is allowed', () => {
  resetRateLimitStore();
  const result = checkRateLimit('1.2.3.4');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 2);
});

test('rate-limit: second request is allowed', () => {
  resetRateLimitStore();
  checkRateLimit('1.2.3.4');
  const result = checkRateLimit('1.2.3.4');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 1);
});

test('rate-limit: third request is allowed', () => {
  resetRateLimitStore();
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  const result = checkRateLimit('1.2.3.4');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 0);
});

test('rate-limit: fourth request is blocked', () => {
  resetRateLimitStore();
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  const result = checkRateLimit('1.2.3.4');
  assert.equal(result.allowed, false);
  assert.equal(result.remaining, 0);
});

test('rate-limit: different IPs have independent limits', () => {
  resetRateLimitStore();
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  checkRateLimit('1.2.3.4');
  const result = checkRateLimit('5.6.7.8');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 2);
});
