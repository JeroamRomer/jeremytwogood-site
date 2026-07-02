#!/usr/bin/env node
/**
 * Regenerate public/favicon.ico (multi-size, PNG-in-ICO) from public/favicon.svg.
 * Usage: node scripts/build-favicon-ico.mjs
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const svgPath = join(ROOT, 'public', 'favicon.svg');
const outPath = join(ROOT, 'public', 'favicon.ico');
const sizes = [16, 32, 48];

const svg = readFileSync(svgPath);

const pngs = await Promise.all(
  sizes.map((size) => sharp(svg, { density: 384 }).resize(size, size).png().toBuffer())
);

// Minimal ICO container: 6-byte header + 16-byte directory entry per image + raw PNG data (Vista+ format).
const numImages = pngs.length;
const headerSize = 6;
const dirEntrySize = 16;
const dataStart = headerSize + dirEntrySize * numImages;

const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(numImages, 4);

let offset = dataStart;
const dirEntries = [];
for (let i = 0; i < numImages; i++) {
  const size = sizes[i];
  const png = pngs[i];
  const entry = Buffer.alloc(dirEntrySize);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8); // image data size
  entry.writeUInt32LE(offset, 12); // offset of image data
  dirEntries.push(entry);
  offset += png.length;
}

const ico = Buffer.concat([header, ...dirEntries, ...pngs]);
writeFileSync(outPath, ico);
console.log(`Wrote ${outPath} (${ico.length} bytes, sizes: ${sizes.join(', ')})`);
