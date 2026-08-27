import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { checkRateLimit } from './rate-limit.js';
import manifest from '../../src/data/mcp-manifest.json' with { type: 'json' };
import {
  handleGetProfile,
  handleListProjects,
  handleGetProject,
  handleListAiBuilds,
  handleGetAiBuild,
  handleGetReel,
  handleGetResume,
  handleGetAvailability,
} from './tools-open.js';
import { handleSendMessage, handleBookCall } from './tools-actions.js';

function desc(name: string): string {
  const tool = manifest.tools.find((t) => t.name === name);
  if (!tool) throw new Error(`Tool missing from mcp-manifest.json: ${name}`);
  return tool.description;
}

export function createServer(clientIp: string): McpServer {
  const server = new McpServer({
    name: manifest.server.mcpName,
    version: manifest.server.version,
  });

  server.tool('get_profile', desc('get_profile'), {}, handleGetProfile);

  server.tool('list_projects', desc('list_projects'), {}, handleListProjects);

  server.tool('get_project', desc('get_project'), {
    id: z.string().describe('Project ID; get valid IDs from list_projects'),
  }, handleGetProject);

  server.tool('list_ai_builds', desc('list_ai_builds'), {}, handleListAiBuilds);

  server.tool('get_ai_build', desc('get_ai_build'), {
    id: z.string().describe('Build ID; get valid IDs from list_ai_builds'),
  }, handleGetAiBuild);

  server.tool('get_reel', desc('get_reel'), {}, handleGetReel);

  server.tool('get_resume', desc('get_resume'), {}, handleGetResume);

  server.tool('get_availability', desc('get_availability'), {}, handleGetAvailability);

  server.tool(
    'send_message',
    desc('send_message'),
    {
      agent_name: z.string().describe('Your agent name or identifier, e.g. "Claude"'),
      human_name: z.string().describe('The name of the human you represent'),
      message: z.string().describe('The message to send to Jeremy'),
    },
    async (params) => {
      const rl = checkRateLimit(clientIp);
      if (!rl.allowed) {
        return {
          content: [{ type: 'text' as const, text: 'Rate limit exceeded. Maximum 3 action requests per IP per day.' }],
          isError: true,
        };
      }
      return handleSendMessage(params);
    }
  );

  server.tool(
    'book_call',
    desc('book_call'),
    {
      agent_name: z.string().describe('Your agent name or identifier, e.g. "Claude"'),
      human_name: z.string().describe('The name of the human you represent'),
    },
    async (params) => {
      const rl = checkRateLimit(clientIp);
      if (!rl.allowed) {
        return {
          content: [{ type: 'text' as const, text: 'Rate limit exceeded. Maximum 3 action requests per IP per day.' }],
          isError: true,
        };
      }
      return handleBookCall(params);
    }
  );

  return server;
}
