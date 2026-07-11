import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SCRIPTS = join(ROOT, '.claude', 'skills', 'add-video', 'scripts');

function hasFfmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const FFMPEG = hasFfmpeg();
const SKIP = FFMPEG ? false : 'ffmpeg not installed — skipping add-video script tests';

// 20 s synthetic 720p test video, built once per run, reused by every test.
let fixtureVideo = null;
function fixture() {
  if (!fixtureVideo) {
    const dir = mkdtempSync(join(tmpdir(), 'addvideo-'));
    fixtureVideo = join(dir, 'test.mp4');
    execSync(
      `ffmpeg -y -v error -f lavfi -i "testsrc=duration=20:size=1280x720:rate=24" ` +
        `-pix_fmt yuv420p "${fixtureVideo}"`
    );
  }
  return fixtureVideo;
}

// 18 s fixture with hard cuts at t=6 and t=12 (red→blue→green), so the
// scene-detection branch of make-loop suggest is actually exercised.
let sceneVideo = null;
function sceneFixture() {
  if (!sceneVideo) {
    const dir = mkdtempSync(join(tmpdir(), 'addvideo-scene-'));
    sceneVideo = join(dir, 'scenes.mp4');
    execSync(
      `ffmpeg -y -v error -f lavfi -i "color=red:duration=6:size=640x360:rate=24" ` +
        `-f lavfi -i "color=blue:duration=6:size=640x360:rate=24" ` +
        `-f lavfi -i "color=green:duration=6:size=640x360:rate=24" ` +
        `-filter_complex "[0:v][1:v][2:v]concat=n=3:v=1:a=0" -pix_fmt yuv420p "${sceneVideo}"`
    );
  }
  return sceneVideo;
}

test('extract-frames: writes N spread candidate stills', { skip: SKIP }, () => {
  const out = mkdtempSync(join(tmpdir(), 'frames-'));
  execFileSync(join(SCRIPTS, 'extract-frames.sh'), [fixture(), out, '4']);
  const frames = readdirSync(out).filter((f) => f.startsWith('candidate-') && f.endsWith('.jpg'));
  assert.equal(frames.length, 4, 'must produce exactly 4 candidates');
  for (const f of frames) {
    assert.ok(statSync(join(out, f)).size > 5_000, `${f} must be a real image, not empty`);
  }
});

test('make-loop suggest: prints a valid start time', { skip: SKIP }, () => {
  const out = execFileSync(join(SCRIPTS, 'make-loop.sh'), ['suggest', fixture()], {
    encoding: 'utf-8',
  });
  const start = parseFloat(out.trim());
  assert.ok(Number.isFinite(start), `output must be a number, got: ${out}`);
  assert.ok(start >= 0 && start <= 16, 'start must leave room for a 4s loop in a 20s video');
});

test('make-loop suggest: picks the scene change nearest 1/3 of runtime', { skip: SKIP }, () => {
  const out = execFileSync(join(SCRIPTS, 'make-loop.sh'), ['suggest', sceneFixture()], {
    encoding: 'utf-8',
  });
  const start = parseFloat(out.trim());
  assert.ok(Math.abs(start - 6) < 0.2, `expected the cut at ~6s (runtime/3), got ${start}`);
});

test('make-loop cut: encodes matching mp4+webm loop pair', { skip: SKIP }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'loop-'));
  const base = join(dir, 'test-loop');
  execFileSync(join(SCRIPTS, 'make-loop.sh'), ['cut', fixture(), '5', base]);

  for (const ext of ['mp4', 'webm']) {
    const file = `${base}.${ext}`;
    assert.ok(existsSync(file), `${ext} must exist`);
    assert.ok(statSync(file).size <= 300 * 1024, `${ext} must be ≤ 300 KB`);

    const probe = JSON.parse(
      execSync(
        `ffprobe -v error -show_streams -show_format -of json "${file}"`,
        { encoding: 'utf-8' }
      )
    );
    const video = probe.streams.find((s) => s.codec_type === 'video');
    assert.equal(video.width, 960, `${ext} width`);
    assert.equal(video.height, 540, `${ext} height`);
    assert.equal(video.codec_name, ext === 'mp4' ? 'h264' : 'vp9', `${ext} codec`);
    assert.equal(video.r_frame_rate, '24/1', `${ext} frame rate`);
    assert.ok(!probe.streams.some((s) => s.codec_type === 'audio'), `${ext} must be muted`);
    const dur = parseFloat(probe.format.duration);
    assert.ok(Math.abs(dur - 4) < 0.3, `${ext} duration ~4s, got ${dur}`);
  }
});

test('compress-thumb: output is ≤ 300 KB and ≤ 1600 px wide', async () => {
  const sharp = (await import('sharp')).default;
  const dir = mkdtempSync(join(tmpdir(), 'thumb-'));
  const input = join(dir, 'huge.png');

  // Photo-like fixture: random noise blurred, 2400px wide — too big as PNG,
  // forcing the script to resize and (likely) fall through to the JPEG ladder.
  const raw = Buffer.alloc(2400 * 1350 * 3);
  for (let i = 0; i < raw.length; i++) raw[i] = Math.floor(Math.random() * 256);
  await sharp(raw, { raw: { width: 2400, height: 1350, channels: 3 } })
    .blur(6)
    .png()
    .toFile(input);

  const stdout = execFileSync(
    'node',
    [join(SCRIPTS, 'compress-thumb.mjs'), input, join(dir, 'out')],
    { encoding: 'utf-8' }
  );
  const outPath = stdout.trim().split('\n').pop();
  assert.ok(existsSync(outPath), `printed path must exist: ${outPath}`);
  assert.ok(statSync(outPath).size <= 300 * 1024, 'output must be ≤ 300 KB');

  const meta = await sharp(outPath).metadata();
  assert.ok(meta.width <= 1600, `width must be ≤ 1600, got ${meta.width}`);
});
