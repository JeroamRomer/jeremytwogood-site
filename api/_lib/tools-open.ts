import {
  profile,
  projects,
  aiBuilds,
  reelIndex,
  videoContent,
  resume,
  getProject,
  getAiBuild,
  getVideoContent,
} from './data.js';

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

export async function handleGetProfile(): Promise<ToolResult> {
  return ok(profile);
}

export async function handleListProjects(): Promise<ToolResult> {
  return ok(projects);
}

export async function handleGetProject({ id }: { id: string }): Promise<ToolResult> {
  const project = getProject(id);
  if (!project) return err(`Project not found: ${id}`);
  const video_content = getVideoContent(id);
  return ok({ project, video_content });
}

export async function handleListAiBuilds(): Promise<ToolResult> {
  return ok(aiBuilds);
}

export async function handleGetAiBuild({ id }: { id: string }): Promise<ToolResult> {
  const build = getAiBuild(id);
  if (!build) return err(`AI build not found: ${id}`);
  return ok(build);
}

export async function handleGetReel(): Promise<ToolResult> {
  const vc = (videoContent as Record<string, any>)['reel'];
  return ok({
    ...reelIndex,
    description: vc?.agent_description ?? null,
    video_content: vc ?? null,
  });
}

export async function handleGetResume(): Promise<ToolResult> {
  return ok(resume);
}

export async function handleGetAvailability(): Promise<ToolResult> {
  const url = process.env.CALENDLY_URL ?? 'https://calendly.com/jtwogood';
  return ok({
    booking_url: url,
    note: 'Book a 30-minute call with Jeremy directly at this link.',
  });
}
