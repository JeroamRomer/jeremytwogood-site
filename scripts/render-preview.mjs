#!/usr/bin/env node
// Frame-exact preview export. Choose and visually inspect both source cuts first.
// Usage: node scripts/render-preview.mjs SOURCE START_FRAME END_FRAME OUTPUT_BASE
// END_FRAME is exclusive. Outputs must not already exist.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const [source, startText, endText, output] = process.argv.slice(2);
const start = Number(startText);
const end = Number(endText);
if (!source || !output || !Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start) {
  throw new Error('Usage: node scripts/render-preview.mjs SOURCE START_FRAME END_FRAME OUTPUT_BASE (end exclusive)');
}
for (const extension of ['mp4', 'webm']) {
  if (existsSync(`${output}.${extension}`)) throw new Error(`Output already exists: ${output}.${extension}`);
}

function probe(path) {
  return JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-count_frames', '-select_streams', 'v:0',
    '-show_entries', 'stream=r_frame_rate,nb_read_frames,width,height', '-of', 'json', path,
  ], { encoding: 'utf8' })).streams[0];
}

const sourceInfo = probe(source);
if (end > Number(sourceInfo.nb_read_frames)) throw new Error('Trim exceeds the source frame count');
const count = end - start;
const filters = `trim=start_frame=${start}:end_frame=${end},setpts=PTS-STARTPTS,scale=960:540:force_original_aspect_ratio=increase,crop=960:540,setsar=1`;
const common = ['-v', 'error', '-n', '-i', source, '-map', '0:v:0', '-map_metadata', '-1', '-map_chapters', '-1', '-an', '-vf', filters,
  '-r', sourceInfo.r_frame_rate, '-fps_mode', 'cfr', '-frames:v', String(count), '-pix_fmt', 'yuv420p'];

for (const [extension, codec] of [
  ['mp4', ['-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-write_tmcd', '0', '-movflags', '+faststart']],
  ['webm', ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '36']],
]) {
  const path = `${output}.${extension}`;
  execFileSync('ffmpeg', [...common, ...codec, path], { stdio: 'inherit' });
  const info = probe(path);
  if (Number(info.nb_read_frames) !== count || info.width !== 960 || info.height !== 540) {
    throw new Error(`Invalid output frames or dimensions: ${path}`);
  }
  console.log(`${path}: ${count} frames at ${info.r_frame_rate}`);
}
