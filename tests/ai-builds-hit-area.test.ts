import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('AI build previews remain decorative and cannot intercept CTAs', async () => {
  for (const file of ['src/components/BuildsList.astro', 'src/components/AIBuildsGrid.astro']) {
    const source = await readFile(file, 'utf8');
    assert.match(source, /\.build-card__shot\{[^}]*pointer-events:none/, `${file} should make previews non-interactive by default`);
    assert.doesNotMatch(
      source,
      /\.build-card:hover \.build-card__shot[^}]*pointer-events:auto/,
      `${file} should not make the decorative preview capture pointer input on hover`,
    );
  }
});
