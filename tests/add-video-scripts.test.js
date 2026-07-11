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
    assert.equal(video.r_frame_rate, '24/1', `${ext} frame rate`);
    assert.ok(!probe.streams.some((s) => s.codec_type === 'audio'), `${ext} must be muted`);
    const dur = parseFloat(probe.format.duration);
    assert.ok(Math.abs(dur - 4) < 0.3, `${ext} duration ~4s, got ${dur}`);
  }
});
