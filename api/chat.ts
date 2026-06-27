import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';
import { createRateLimiter } from './_lib/rate-limit.js';
import { validateChatRequest } from './_lib/chat-validate.js';
import { buildChatSystem } from './_lib/chat-system.js';
import { validateContactInput, sendChatMessage } from './_lib/chat-actions.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 600;
const MAX_TOOL_ITERS = 3;

// 20 messages per IP per day — soft abuse/cost ceiling for the public endpoint.
const chatLimiter = createRateLimiter(20, DAY_MS);
// 3 emails per IP per day — anti-spam ceiling on the send_message action.
const actionLimiter = createRateLimiter(3, DAY_MS);

// Built once: the grounded system prompt is static, which keeps the cached
// prefix byte-identical across requests so Anthropic prompt caching can hit it.
const SYSTEM = buildChatSystem();

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'send_message_to_jeremy',
    description:
      'Deliver a short message to Jeremy by email on behalf of a website visitor who wants to contact him or discuss working together. Only call this AFTER the visitor has given their name and message and has explicitly confirmed they want it sent. Include their email when provided so Jeremy can reply.',
    input_schema: {
      type: 'object',
      properties: {
        visitor_name: { type: 'string', description: "The visitor's name" },
        visitor_email: { type: 'string', description: "The visitor's email, so Jeremy can reply (optional but encouraged)" },
        message: { type: 'string', description: 'The message to deliver to Jeremy' },
      },
      required: ['visitor_name', 'message'],
    },
  },
];

function clientIp(req: VercelRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ??
    req.socket.remoteAddress ??
    'unknown'
  );
}

// Executes a tool the model invoked. Validates, rate-limits, then sends.
async function runTool(block: Anthropic.ToolUseBlock, ip: string): Promise<{ text: string; isError: boolean }> {
  if (block.name === 'send_message_to_jeremy') {
    const v = validateContactInput(block.input);
    if (!v.valid) return { text: v.error, isError: true };
    if (!actionLimiter.check(ip).allowed) {
      return {
        text: 'The daily limit for messages sent through this chat has been reached. Please email Jeremy directly at jtwogood@gmail.com.',
        isError: true,
      };
    }
    const sent = await sendChatMessage(v.value);
    return { text: sent.text, isError: !sent.ok };
  }
  return { text: `Unknown tool: ${block.name}`, isError: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Chat requires POST.' });
    return;
  }

  const ip = clientIp(req);
  if (!chatLimiter.check(ip).allowed) {
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
  const messages: Anthropic.MessageParam[] = [...validation.messages];

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const send = (payload: unknown) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

  // Abort the upstream request if the visitor closes the tab mid-answer.
  let currentStream: ReturnType<typeof client.messages.stream> | null = null;
  res.on('close', () => currentStream?.abort());

  try {
    for (let iter = 0; iter < MAX_TOOL_ITERS; iter++) {
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        tools: TOOLS,
        messages,
      });
      currentStream = stream;

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          send({ text: event.delta.text });
        }
      }

      const final = await stream.finalMessage();
      if (final.stop_reason !== 'tool_use') break;

      // Execute every tool the model called, then loop to stream its follow-up.
      messages.push({ role: 'assistant', content: final.content });
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of final.content) {
        if (block.type === 'tool_use') {
          const result = await runTool(block, ip);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: result.text,
            ...(result.isError ? { is_error: true } : {}),
          });
        }
      }
      messages.push({ role: 'user', content: toolResults });
    }
    res.write('data: [DONE]\n\n');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong.';
    send({ error: message });
  } finally {
    res.end();
  }
}
