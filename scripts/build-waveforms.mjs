#!/usr/bin/env node
/**
 * Precompute waveform peak data for the Sound section.
 *
 * Usage:  node scripts/build-waveforms.mjs
 *
 * Reads audio from design-sources/audio/ (gitignored, local-only). Files must
 * be named with the track-number prefix from profile.json tracks, e.g.
 *   01-eagle.mp3   02-from-time.wav   10-sewer-frank.m4a
 * Requires ffmpeg on PATH. Writes src/data/waveforms.json (committed).
 * Tracks without a matching file keep their previous data absence — the site
 * renders them without a waveform.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computePeaks } from './waveform-peaks.mjs';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const AUDIO_DIR = join(ROOT, 'design-sources', 'audio');
const OUT = join(ROOT, 'src', 'data', 'waveforms.json');
const BUCKETS = 96;

const tracks = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'profile.json'), 'utf-8')).tracks;

if (!existsSync(AUDIO_DIR)) {
  console.error(`No audio directory at ${AUDIO_DIR} — create it and add files named <num>-*.mp3/wav/m4a/aiff`);
  process.exit(1);
}

const files = readdirSync(AUDIO_DIR).filter((f) => /\.(mp3|wav|m4a|aiff|aif|flac)$/i.test(f));
const out = {};

for (const track of tracks) {
  const file = files.find((f) => f.startsWith(track.num));
  if (!file) {
    console.warn(`- no audio file for track ${track.num} — ${track.title}`);
    continue;
  }
  // Decode to mono 8kHz s16le PCM on stdout — plenty of resolution for peaks.
  const pcm = execFileSync('ffmpeg', [
    '-v', 'error', '-i', join(AUDIO_DIR, file),
    '-f', 's16le', '-ac', '1', '-ar', '8000', '-',
  ], { maxBuffer: 512 * 1024 * 1024 });
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
  out[track.num] = computePeaks(samples, BUCKETS);
  console.log(`+ ${track.num} ${track.title} <- ${file} (${samples.length} samples)`);
}

writeFileSync(OUT, JSON.stringify(out) + '\n');
console.log(`Wrote ${OUT} (${Object.keys(out).length} tracks)`);
