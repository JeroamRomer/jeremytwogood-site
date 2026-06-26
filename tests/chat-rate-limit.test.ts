import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from '../api/_lib/rate-limit.ts';

const DAY = 24 * 60 * 60 * 1000;

test('createRateLimiter: first request is allowed with full remaining', () => {
  const limiter = createRateLimiter(20, DAY);
  const result = limiter.check('1.2.3.4');
  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 19);
});

test('createRateLimiter: allows up to the limit, then blocks', () => {
  const limiter = createRateLimiter(20, DAY);
  for (let i = 0; i < 20; i++) {
    assert.equal(limiter.check('1.2.3.4').allowed, true, `request ${i + 1} should be allowed`);
  }
  const blocked = limiter.check('1.2.3.4');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});

test('createRateLimiter: different IPs have independent limits', () => {
  const limiter = createRateLimiter(2, DAY);
  limiter.check('1.2.3.4');
  limiter.check('1.2.3.4');
  assert.equal(limiter.check('1.2.3.4').allowed, false);
  assert.equal(limiter.check('5.6.7.8').allowed, true);
});

test('createRateLimiter: reset clears the store', () => {
  const limiter = createRateLimiter(1, DAY);
  limiter.check('1.2.3.4');
  assert.equal(limiter.check('1.2.3.4').allowed, false);
  limiter.reset();
  assert.equal(limiter.check('1.2.3.4').allowed, true);
});

test('createRateLimiter: limiter instances are isolated from each other', () => {
  const a = createRateLimiter(1, DAY);
  const b = createRateLimiter(1, DAY);
  a.check('1.2.3.4');
  assert.equal(a.check('1.2.3.4').allowed, false);
  assert.equal(b.check('1.2.3.4').allowed, true, 'second limiter must not share state');
});

test('createRateLimiter: request after the window resets the count', () => {
  // Negative window: the stored entry's resetAt is in the past, so the next
  // call is guaranteed to see it expired and start a fresh count.
  const limiter = createRateLimiter(1, -1);
  assert.equal(limiter.check('1.2.3.4').allowed, true);
  assert.equal(limiter.check('1.2.3.4').allowed, true, 'expired window should reset the count');
});
