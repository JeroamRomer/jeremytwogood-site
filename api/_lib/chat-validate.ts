export const MAX_CHARS = 2000;
export const MAX_TURNS = 10;

export type ChatRole = 'user' | 'assistant';
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type ValidationResult =
  | { valid: true; messages: ChatMessage[] }
  | { valid: false; error: string };

function fail(error: string): ValidationResult {
  return { valid: false, error };
}

// Validates and normalizes the chat request body the browser sends.
// On success, returns a trimmed history (≤ MAX_TURNS, content ≤ MAX_CHARS)
// that starts with a user turn and ends with a user turn.
export function validateChatRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return fail('Request body must be a JSON object');
  }

  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw)) {
    return fail('"messages" must be an array');
  }
  if (raw.length === 0) {
    return fail('"messages" must not be empty');
  }

  const normalized: ChatMessage[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') {
      return fail('Each message must be an object');
    }
    const { role, content } = entry as { role?: unknown; content?: unknown };
    if (role !== 'user' && role !== 'assistant') {
      return fail('Each message role must be "user" or "assistant"');
    }
    if (typeof content !== 'string' || content.trim() === '') {
      return fail('Each message content must be a non-empty string');
    }
    normalized.push({ role, content: content.slice(0, MAX_CHARS) });
  }

  // Keep only the most recent turns, then drop any leading assistant turns so
  // the history starts with a user message (required by the Messages API).
  let trimmed = normalized.slice(-MAX_TURNS);
  const firstUser = trimmed.findIndex((m) => m.role === 'user');
  if (firstUser === -1) {
    return fail('Conversation must contain at least one user message');
  }
  trimmed = trimmed.slice(firstUser);

  if (trimmed[trimmed.length - 1].role !== 'user') {
    return fail('Conversation must end with a user message');
  }

  return { valid: true, messages: trimmed };
}
