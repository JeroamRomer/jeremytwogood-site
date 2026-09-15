import { tcFormat } from './timecode';

interface PlayerClip {
  name: string;
  client: string;
  year: string;
  label: string;
  href: string | null;
  poster: string;
  mp4: string | null;
  webm: string | null;
  start: number;
  layout: number;
  offline: boolean;
}

interface PlayerData {
  total: number;
  allKnown: boolean;
  clips: PlayerClip[];
}

/**
 * Program monitor + sequence controller. The monitor previews each clip's silent loop in turn;
 * the playhead skims through the clip's span on the timeline while the loop plays.
 * Clicking a clip previews it; clicking the current clip follows its link to the case study.
 * Dragging across the lanes scrubs. Reduced motion: nothing plays until the visitor presses play.
 */
export function initSequencePlayer(root: HTMLElement): void {
  const q = <T extends Element>(sel: string) => root.querySelector<T>(sel);
  const dataEl = q<HTMLScriptElement>('#sequence-data');
  const video = q<HTMLVideoElement>('[data-monitor]');
  const tagClientEl = q<HTMLElement>('[data-monitor-tag-client]');
  const tagYearEl = q<HTMLElement>('[data-monitor-tag-year]');
  const nameEl = q<HTMLElement>('[data-monitor-name]');
  const linkEl = q<HTMLAnchorElement>('[data-monitor-link]');
  // Absent whenever a clip's duration is unknown (ProgramMonitor.astro), since
  // the transport must never show an invented timecode. The player tolerates
  // its absence rather than requiring it.
  const tcEl = q<HTMLElement>('[data-monitor-tc]');
  const playBtn = q<HTMLButtonElement>('[data-transport="play"]');
  const prevBtn = q<HTMLButtonElement>('[data-transport="prev"]');
  const nextBtn = q<HTMLButtonElement>('[data-transport="next"]');
  const lanes = q<HTMLElement>('[data-seq-lanes]');
  const playhead = q<HTMLElement>('[data-seq-playhead]');
  if (!dataEl || !video || !tagClientEl || !tagYearEl || !nameEl || !linkEl || !playBtn || !prevBtn || !nextBtn || !lanes || !playhead) return;

  let data: PlayerData;
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch { return; }
  if (!data.clips?.length || !(data.total > 0)) return;

  const clipEls = Array.from(root.querySelectorAll<HTMLElement>('[data-clip]'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 761px)');
  const canWebm = video.canPlayType('video/webm') !== '';
  const playable = data.clips.map((c, i) => (!c.offline && (c.mp4 || c.webm) ? i : -1)).filter((i) => i >= 0);
  if (!playable.length) return;

  let current = -1;
  let wantPlay = !reduce;
  let inView = true;

  function resume() {
    if (wantPlay && inView && !document.hidden) video!.play().catch(() => {});
    else video!.pause();
  }

  function setPlaying(on: boolean) {
    wantPlay = on;
    playBtn!.setAttribute('aria-pressed', on ? 'true' : 'false');
    playBtn!.setAttribute('aria-label', on ? 'Pause' : 'Play');
    root.classList.toggle('is-playing', on);
    resume();
  }

  function place(frac: number) {
    const c = data.clips[current];
    if (!c) return;
    const t = c.start + Math.min(Math.max(frac, 0), 1) * c.layout;
    playhead!.style.left = `${(t / data.total) * 100}%`;
    if (tcEl && data.allKnown) tcEl.textContent = tcFormat(t);
  }

  function select(i: number) {
    const c = data.clips[i];
    if (!c || c.offline) return;
    current = i;
    clipEls.forEach((el) => {
      const on = Number(el.dataset.clip) === i;
      el.classList.toggle('is-current', on);
      if (on) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
    tagClientEl!.textContent = c.client;
    tagYearEl!.textContent = c.year;
    nameEl!.textContent = c.name;
    linkEl!.textContent = c.label;
    if (c.href) linkEl!.href = c.href;
    else linkEl!.removeAttribute('href');
    const src = canWebm && c.webm ? c.webm : c.mp4;
    video!.poster = c.poster;
    if (src) {
      if (video!.getAttribute('src') !== src) video!.src = src;
      place(0);
      resume();
    } else {
      // No loop for this clip: clear the previous clip's footage rather than
      // leaving it playing under the new client/year tag, and don't play.
      video!.removeAttribute('src');
      video!.load();
      video!.pause();
      place(0);
    }
  }

  function step(dir: 1 | -1) {
    const pos = playable.indexOf(current);
    select(playable[(pos + dir + playable.length) % playable.length]);
  }

  video.muted = true;
  video.addEventListener('timeupdate', () => {
    if (video.duration > 0) place(video.currentTime / video.duration);
  });
  video.addEventListener('ended', () => { if (wantPlay) step(1); });
  playBtn.addEventListener('click', () => setPlaying(!wantPlay));
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  clipEls.forEach((el) => {
    el.addEventListener('click', (e) => {
      const me = e as MouseEvent;
      if (me.metaKey || me.ctrlKey || me.shiftKey || me.altKey || me.button !== 0) return;
      if (!desktop.matches) return; // phones: rows are plain links to the case study
      const i = Number(el.dataset.clip);
      if (data.clips[i]?.offline) { e.preventDefault(); return; }
      if (i === current && el.getAttribute('href')) return; // second click opens the case study
      e.preventDefault();
      select(i);
    });
    // A clip without a case study (e.g. the Thales comparison) renders as
    // role="button" instead of a link, so Enter/Space need to be handled here;
    // an <a> already fires a click for Enter natively, so it's covered above.
    if (el.tagName !== 'A') {
      el.addEventListener('keydown', (e) => {
        const ke = e as KeyboardEvent;
        if (ke.key !== 'Enter' && ke.key !== ' ') return;
        if (!desktop.matches) return;
        ke.preventDefault();
        const i = Number(el.dataset.clip);
        if (data.clips[i]?.offline) return;
        select(i);
      });
    }
  });

  // Scrub: a drag across the lanes (beyond 4px) seeks; a plain click falls through to the clip.
  let dragging = false;
  let moved = false;
  let suppressClick = false;
  let startX = 0;

  function scrubTo(clientX: number) {
    const r = lanes!.getBoundingClientRect();
    if (r.width <= 0) return;
    const t = Math.min(Math.max((clientX - r.left) / r.width, 0), 0.9999) * data.total;
    let i = data.clips.findIndex((c) => t >= c.start && t < c.start + c.layout);
    if (i < 0) i = data.clips.length - 1;
    const c = data.clips[i];
    if (c.offline) return;
    if (i !== current) select(i);
    const frac = (t - c.start) / c.layout;
    if (video!.duration > 0) video!.currentTime = frac * video!.duration;
    place(frac);
  }

  lanes.addEventListener('pointerdown', (e) => {
    if (!desktop.matches || e.button !== 0) return;
    dragging = true;
    moved = false;
    suppressClick = false;
    startX = e.clientX;
  });
  lanes.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (!moved && Math.abs(e.clientX - startX) > 4) {
      moved = true;
      lanes.setPointerCapture(e.pointerId);
      lanes.classList.add('is-scrubbing');
    }
    if (moved) scrubTo(e.clientX);
  });
  const endDrag = () => {
    if (moved) suppressClick = true;
    dragging = false;
    moved = false;
    lanes.classList.remove('is-scrubbing');
  };
  lanes.addEventListener('pointerup', endDrag);
  lanes.addEventListener('pointercancel', endDrag);
  lanes.addEventListener('click', (e) => {
    if (!suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick = false;
  }, true);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      resume();
    }, { threshold: 0.25 }).observe(video);
  }
  document.addEventListener('visibilitychange', resume);

  select(playable[0]);
  setPlaying(wantPlay);
}
