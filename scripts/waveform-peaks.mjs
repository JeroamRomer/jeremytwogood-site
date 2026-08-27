/**
 * Reduce raw mono PCM samples to N normalized RMS-energy buckets (0..1, 2 decimals).
 * RMS (not true peak) so the shape tracks sustained loudness/dynamics rather than
 * being dominated by isolated transient spikes, closer to how waveform displays
 * like SoundCloud's read as "following the music".
 * Kept separate from build-waveforms.mjs so it can be unit-tested without ffmpeg.
 */
export function computePeaks(samples, buckets = 96) {
  if (!samples || samples.length === 0 || buckets < 1) return [];
  const per = samples.length / buckets;
  const peaks = new Array(buckets).fill(0);
  for (let b = 0; b < buckets; b++) {
    const start = Math.floor(b * per);
    const end = Math.min(Math.floor((b + 1) * per), samples.length);
    let sumSquares = 0;
    for (let i = start; i < end; i++) {
      const v = samples[i];
      sumSquares += v * v;
    }
    const count = end - start;
    peaks[b] = count > 0 ? Math.sqrt(sumSquares / count) : 0;
  }
  const top = Math.max(...peaks);
  return peaks.map((p) => (top > 0 ? Math.round((p / top) * 100) / 100 : 0));
}
