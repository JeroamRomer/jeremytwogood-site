import type { VercelRequest, VercelResponse } from '@vercel/node';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './_lib/server.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed. MCP endpoint requires POST.' });
      return;
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ??
      req.socket.remoteAddress ??
      'unknown';

    const server = createServer(clientIp);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    res.status(500).json({ error: message, stack });
  }
}
