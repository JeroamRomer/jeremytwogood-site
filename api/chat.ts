import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { createRateLimiter } from './_lib/rate-limit.js';
import { validateChatRequest } from './_lib/chat-validate.js';
import { buildChatSystem } from './_lib/chat-system.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 600;

// 20 messages per IP per day — soft abuse/cost ceiling for the public endpoint.
const chatLimiter = createRateLimiter(20, DAY_MS);

// Built once: the grounded system prompt is static, which keeps the cached
// prefix byte-identical across requests so Anthropic prompt caching can hit it.
const SYSTEM = buildChatSystem();

function clientIp(req: VercelRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ??
    req.socket.remoteAddress ??
    'unknown'
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Chat requires POST.' });
    return;
  }

  const rl = chatLimiter.check(clientIp(req));
  if (!rl.allowed) {
    res.status(429).json({
      error: "You've reached the daily question limit. Try again tomorrow, or reach Jeremy via the contact section.",
    });
    return;
  }

  const validation = validateChatRequest(req.body);
  if (!validation.valid) {
    res.status(400).json({ error: validation.error });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Chat is not configured on this server.' });
    return;
  }

  const client = new Anthropic();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (payload: unknown) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: validation.messages,
  });

  // Abort the upstream request if the visitor closes the tab mid-answer.
  res.on('close', () => stream.abort());

  try {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send({ text: event.delta.text });
      }
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    send({ error: message });
  } finally {
    res.end();
  }
}
