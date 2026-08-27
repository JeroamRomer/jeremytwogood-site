import { Resend } from 'resend';

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: true;
};

function ok(data: unknown): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }] };
}

function err(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}

export function validateActionParams(
  params: Record<string, unknown>
): { valid: boolean; error?: string } {
  if (!params.agent_name || typeof params.agent_name !== 'string' || !params.agent_name.trim()) {
    return { valid: false, error: 'agent_name is required and must be a non-empty string' };
  }
  if (!params.human_name || typeof params.human_name !== 'string' || !params.human_name.trim()) {
    return { valid: false, error: 'human_name is required and must be a non-empty string' };
  }
  return { valid: true };
}

export async function handleSendMessage(params: {
  agent_name: string;
  human_name: string;
  message: string;
}): Promise<ToolResult> {
  const validation = validateActionParams(params);
  if (!validation.valid) return err(validation.error!);
  if (!params.message?.trim()) return err('message is required and must be non-empty');

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return err('Email delivery is not configured on this server');

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: 'MCP Server <onboarding@resend.dev>',
    to: 'jtwogood@gmail.com',
    subject: `Message via MCP from ${params.human_name}`,
    text: `Sent via MCP by ${params.agent_name} on behalf of ${params.human_name}.\n\n${params.message}`,
  });

  if (error) return err(`Failed to deliver message: ${error.message}`);

  return ok({
    success: true,
    message: `Your message has been delivered to Jeremy on behalf of ${params.human_name}.`,
  });
}

export async function handleBookCall(params: {
  agent_name: string;
  human_name: string;
}): Promise<ToolResult> {
  const validation = validateActionParams(params);
  if (!validation.valid) return err(validation.error!);

  const baseUrl = process.env.CALENDLY_URL ?? 'https://calendly.com/jtwogood';
  const url = `${baseUrl}?name=${encodeURIComponent(params.human_name)}`;

  return ok({
    booking_url: url,
    instructions: `Share this link with ${params.human_name} to book a call with Jeremy.`,
  });
}
