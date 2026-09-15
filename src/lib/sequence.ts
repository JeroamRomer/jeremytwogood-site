import type { MediaLoop } from './media';

export interface SequenceProject {
  id: string;
  name: string;
  client: string;
  year: string | number;
  type: string;
  thumbnail: string;
  role?: string[] | string | null;
  disciplines?: string | null;
  duration_seconds?: number | null;
  coming_soon?: boolean | null;
  comparison?: boolean | null;
  graded_src?: string | null;
}

export interface Clip {
  index: number;
  id: string;
  name: string;
  client: string;
  year: string;
  type: string;
  roleLabel: string;
  thumbnail: string;
  /** True running time in seconds; null when unknown. */
  durationSeconds: number | null;
  /** "07:17", or "" when the duration is unknown. */
  durationLabel: string;
  startSeconds: number;
  /** Width on the timeline: the real duration, or the median of known durations. */
  layoutSeconds: number;
  startPct: number;
  widthPct: number;
  /** Duration relative to the longest known clip (0 when unknown); drives phone duration bars. */
  relPct: number;
  href: string | null;
  offline: boolean;
  loop: MediaLoop | null;
}

export interface Sequence {
  clips: Clip[];
  layoutSeconds: number;
  knownSeconds: number;
  /** Every online clip has a known duration. */
  allKnown: boolean;
}

export interface RulerMark {
  seconds: number;
  pct: number;
  label: string;
}

const round = (n: number) => Math.round(n * 10000) / 10000;

export function orderOnlineFirst<T extends { coming_soon?: boolean | null }>(items: T[]): T[] {
  return [...items.filter((i) => !i.coming_soon), ...items.filter((i) => i.coming_soon)];
}

export function hasCaseStudy(p: { coming_soon?: boolean | null; comparison?: boolean | null }): boolean {
  return !p.coming_soon && !p.comparison;
}

export function mmss(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
}

export function roleLabel(p: { role?: string[] | string | null; disciplines?: string | null }): string {
  if (Array.isArray(p.role)) return p.role.join(', ');
  return p.role || p.disciplines || '';
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function knownDuration(p: SequenceProject): number | null {
  return typeof p.duration_seconds === 'number' && p.duration_seconds > 0 ? p.duration_seconds : null;
}

export function buildSequence(
  projects: SequenceProject[],
  resolveLoop: (p: SequenceProject) => MediaLoop | null,
): Sequence {
  const ordered = orderOnlineFirst(projects);
  const known = ordered.map(knownDuration).filter((d): d is number => d !== null);
  const fallback = known.length ? Math.round(median(known)) : 90;
  const longest = known.length ? Math.max(...known) : 1;

  let cursor = 0;
  const draft = ordered.map((p, index) => {
    const durationSeconds = knownDuration(p);
    const layoutSeconds = durationSeconds ?? fallback;
    const startSeconds = cursor;
    cursor += layoutSeconds;
    return { p, index, durationSeconds, layoutSeconds, startSeconds };
  });
  const total = cursor;

  const clips: Clip[] = draft.map(({ p, index, durationSeconds, layoutSeconds, startSeconds }) => ({
    index,
    id: p.id,
    name: p.name,
    client: p.client,
    year: String(p.year),
    type: p.type,
    roleLabel: roleLabel(p),
    thumbnail: p.thumbnail,
    durationSeconds,
    durationLabel: durationSeconds ? mmss(durationSeconds) : '',
    startSeconds,
    layoutSeconds,
    startPct: round((startSeconds / total) * 100),
    widthPct: round((layoutSeconds / total) * 100),
    relPct: durationSeconds ? round((durationSeconds / longest) * 100) : 0,
    href: hasCaseStudy(p) ? `/work/${p.id}` : null,
    offline: !!p.coming_soon,
    loop: p.coming_soon ? null : resolveLoop(p),
  }));

  const online = clips.filter((c) => !c.offline);
  return {
    clips,
    layoutSeconds: total,
    knownSeconds: online.reduce((sum, c) => sum + (c.durationSeconds ?? 0), 0),
    allKnown: online.every((c) => c.durationSeconds !== null),
  };
}

const STEPS = [30, 60, 120, 300, 600, 900, 1800];

export function rulerMarks(totalSeconds: number, maxMarks = 6): RulerMark[] {
  if (!(totalSeconds > 0)) return [];
  const step = STEPS.find((s) => totalSeconds / s <= maxMarks) ?? STEPS[STEPS.length - 1];
  const marks: RulerMark[] = [];
  for (let t = 0; t < totalSeconds; t += step) {
    marks.push({ seconds: t, pct: round((t / totalSeconds) * 100), label: mmss(t) });
  }
  return marks;
}

/**
 * Ruler marks for a sequence, with invented time labels removed: every timecode
 * must come from data. Tick lines still render at every mark (the tick is the
 * mark's own left border in Sequence.astro, independent of its label), but the
 * label text is blanked wherever it isn't backed by a known duration — either
 * because an online clip's duration is unknown at all (`!sequence.allKnown`),
 * or because the mark falls past the known clips' span, inside an offline
 * clip's placeholder width (which is a layout width, not a real time).
 */
export function visibleRulerMarks(sequence: Sequence, maxMarks = 6): RulerMark[] {
  const marks = rulerMarks(sequence.layoutSeconds, maxMarks);
  if (!sequence.allKnown) return marks.map((m) => ({ ...m, label: '' }));
  return marks.map((m) => (m.seconds <= sequence.knownSeconds ? m : { ...m, label: '' }));
}
