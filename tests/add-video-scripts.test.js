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
