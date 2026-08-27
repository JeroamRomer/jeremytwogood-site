import { Resend } from 'resend';

export const MAX_MESSAGE_CHARS = 2000;
export const MAX_NAME_CHARS = 100;

export interface ContactValue {
  visitor_name: string;
  visitor_email?: string;
  message: string;
}

export type ContactValidation =
  | { valid: true; value: ContactValue }
  | { valid: false; error: string };

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Validates the input the model passes to the send_message_to_jeremy tool.
export function validateContactInput(input: unknown): ContactValidation {
  if (!input || typeof input !== 'object') return { valid: false, error: 'Invalid input' };
  const { visitor_name, visitor_email, message } = input as Record<string, unknown>;

  if (typeof visitor_name !== 'string' || !visitor_name.trim())
    return { valid: false, error: 'A name is required' };
  if (typeof message !== 'string' || !message.trim())
    return { valid: false, error: 'A message is required' };

  let email: string | undefined;
  if (visitor_email !== undefined && visitor_email !== null && visitor_email !== '') {
    if (typeof visitor_email !== 'string' || !EMAIL_RE.test(visitor_email.trim()))
      return { valid: false, error: 'That email address looks invalid' };
    email = visitor_email.trim();
  }

  return {
    valid: true,
    value: {
      visitor_name: visitor_name.trim().slice(0, MAX_NAME_CHARS),
      visitor_email: email,
      message: message.trim().slice(0, MAX_MESSAGE_CHARS),
    },
  };
}

// Delivers the visitor's message to Jeremy by email via Resend, setting reply-to
// to the visitor's address when given. Mirrors the MCP send_message handler.
export async function sendChatMessage(value: ContactValue): Promise<{ ok: boolean; text: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, text: 'Messaging is not configured on this server.' };

  const resend = new Resend(apiKey);
  const replyLine = value.visitor_email ? `\nReply to: ${value.visitor_email}` : '';
  const { error } = await resend.emails.send({
    from: 'Website Chat <onboarding@resend.dev>',
    to: 'jtwogood@gmail.com',
    subject: `Message via website chat from ${value.visitor_name}`,
    text: `From ${value.visitor_name} via the jeremytwogood.com chat assistant.${replyLine}\n\n${value.message}`,
    ...(value.visitor_email ? { replyTo: value.visitor_email } : {}),
  });

  if (error) return { ok: false, text: `Couldn't deliver the message: ${error.message}` };
  return { ok: true, text: `Message delivered to Jeremy on behalf of ${value.visitor_name}.` };
}
