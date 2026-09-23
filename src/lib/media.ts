/** Silent preview loops in public/assets (mp4 + webm), keyed by project id. */
export interface MediaLoop {
  mp4: string;
  webm?: string;
}

export const PREVIEW_LOOPS: Record<string, string> = {
  'shell-john-williams': 'shell-loop',
  'simbility-desk-series': 'simbility-loop',
  'ttms-chef-nuit': 'chefnuit-loop',
  'xbox-forza-5': 'xbox-loop',
  'thales-rcn': 'thales-loop',
  'ttms-5-points': 'fivepoints-loop',
  'ns-health-westray': 'nshealth-loop',
  'retailprophet-resurrecting-retail': 'retailprophet-loop',
};

interface ProjectMedia {
  id: string;
  comparison?: boolean | null;
  graded_src?: string | null;
}

export function loopFor(p: ProjectMedia): MediaLoop | null {
  const name = PREVIEW_LOOPS[p.id];
  if (name) return { webm: `/assets/${name}.webm`, mp4: `/assets/${name}.mp4` };
  if (p.comparison && p.graded_src) return { mp4: p.graded_src };
  return null;
}
