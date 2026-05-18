import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { checkRateLimit } from './rate-limit.js';
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

export function createServer(clientIp: string): McpServer {
  const server = new McpServer({
    name: 'jeremytwogood-mcp',
    version: '1.0.0',
  });

  server.tool('get_profile', "Get Jeremy Twogood's profile — bio, skills, clients, location, and social links.", {}, handleGetProfile);

  server.tool('list_projects', "List all of Jeremy's work projects with metadata.", {}, handleListProjects);

  server.tool('get_project', 'Get full details for a single project, including video content description.', {
    id: z.string().describe('Project ID — get valid IDs from list_projects'),
  }, handleGetProject);

  server.tool('list_ai_builds', "List all of Jeremy's AI and software projects.", {}, handleListAiBuilds);

  server.tool('get_ai_build', 'Get full details for a single AI or software project.', {
    id: z.string().describe('Build ID — get valid IDs from list_ai_builds'),
  }, handleGetAiBuild);

  server.tool('get_reel', "Get Jeremy's showreel description and link.", {}, handleGetReel);

  server.tool('get_resume', "Get Jeremy's full structured resume as JSON.", {}, handleGetResume);

  server.tool('get_availability', "Get Jeremy's booking URL and availability information.", {}, handleGetAvailability);

  server.tool(
    'send_message',
    "Send a message to Jeremy by email. Requires agent_name (your identifier) and human_name (the person you represent). Rate limited to 3 action requests per IP per day.",
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
    "Get a pre-filled Calendly booking link for a call with Jeremy. Requires agent_name and human_name. Rate limited to 3 action requests per IP per day.",
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
