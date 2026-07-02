/**
 * Reduce raw mono PCM samples to N normalized peak buckets (0..1, 2 decimals).
 * Kept separate from build-waveforms.mjs so it can be unit-tested without ffmpeg.
 */
export function computePeaks(samples, buckets = 96) {
  if (!samples || samples.length === 0 || buckets < 1) return [];
  const per = samples.length / buckets;
  const peaks = new Array(buckets).fill(0);
  for (let b = 0; b < buckets; b++) {
    let max = 0;
    const start = Math.floor(b * per);
    const end = Math.min(Math.floor((b + 1) * per), samples.length);
    for (let i = start; i < end; i++) {
      const v = Math.abs(samples[i]);
      if (v > max) max = v;
    }
    peaks[b] = max;
  }
  const top = Math.max(...peaks);
  return peaks.map((p) => (top > 0 ? Math.round((p / top) * 100) / 100 : 0));
}
