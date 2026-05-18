import profile from '../../src/data/profile.json' with { type: 'json' };
import projects from '../../src/data/projects.json' with { type: 'json' };
import aiBuilds from '../../src/data/ai-builds.json' with { type: 'json' };
import reelIndex from '../../src/data/reel-index.json' with { type: 'json' };
import videoContent from '../../src/data/video-content.json' with { type: 'json' };
import resume from '../../src/data/resume.json' with { type: 'json' };

export { profile, projects, aiBuilds, reelIndex, videoContent, resume };

export function getProject(id: string) {
  return (projects as any[]).find((p: any) => p.id === id) ?? null;
}

export function getAiBuild(id: string) {
  return (aiBuilds as any[]).find((b: any) => b.id === id) ?? null;
}

export function getVideoContent(projectId: string) {
  return (videoContent as Record<string, unknown>)[projectId] ?? null;
}
