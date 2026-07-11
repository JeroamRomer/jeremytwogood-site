#!/usr/bin/env node
// Compress a thumbnail still for public/assets/: resize to ≤ 1600 px wide,
// prefer lossless PNG when it fits the 300 KB budget, otherwise step down a
// JPEG quality ladder. Prints the final output path on the last stdout line.
//
// Usage: node compress-thumb.mjs <input> [out-base]
//   out-base defaults to the input path minus its extension. The script
//   appends .png or .jpg depending on which format wins.
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const TARGET = 300 * 1024;
const MAX_WIDTH = 1600;
const JPEG_LADDER = [82, 74, 66, 58, 50];

const input = process.argv[2];
if (!input) {
  console.error('Usage: node compress-thumb.mjs <input> [out-base]');
  process.exit(1);
}
const outBase = process.argv[3] ?? input.replace(/\.[^.]+$/, '');

const resized = sharp(input).resize({ width: MAX_WIDTH, withoutEnlargement: true });

// Buffers are written with writeFile, NOT sharp().toFile() — running an
// encoded buffer back through sharp would re-encode it at default quality
// and defeat the ladder.
const png = await resized.clone().png({ compressionLevel: 9 }).toBuffer();
if (png.length <= TARGET) {
  await writeFile(`${outBase}.png`, png);
  console.log(`png ${(png.length / 1024).toFixed(0)} KB (lossless)`);
  console.log(`${outBase}.png`);
  process.exit(0);
}

let best = null;
for (const quality of JPEG_LADDER) {
  best = await resized.clone().jpeg({ quality, mozjpeg: true }).toBuffer();
  if (best.length <= TARGET) {
    await writeFile(`${outBase}.jpg`, best);
    console.log(`jpg q${quality} ${(best.length / 1024).toFixed(0)} KB`);
    console.log(`${outBase}.jpg`);
    process.exit(0);
  }
}

// Nothing hit the budget (extremely noisy source) — keep the smallest JPEG
// and say so rather than failing the pipeline.
await writeFile(`${outBase}.jpg`, best);
console.warn(`warning: smallest JPEG is ${(best.length / 1024).toFixed(0)} KB, above the 300 KB target`);
console.log(`${outBase}.jpg`);
