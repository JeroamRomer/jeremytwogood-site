import type { VercelRequest, VercelResponse } from '@vercel/node';

let importError: string | null = null;
let StreamableHTTPServerTransport: any = null;
let createServer: any = null;

try {
  const sdk = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
  StreamableHTTPServerTransport = sdk.StreamableHTTPServerTransport;
} catch (e: any) {
  importError = `SDK import failed: ${e?.message ?? e}`;
}

if (!importError) {
  try {
    const srv = await import('./_lib/server.js');
    createServer = srv.createServer;
  } catch (e: any) {
    importError = `server import failed: ${e?.message ?? e}`;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (importError) {
    res.status(500).json({ importError });
    return;
  }

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
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    res.status(500).json({ error: message, stack });
  }
}
