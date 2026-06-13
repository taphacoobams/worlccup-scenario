#!/usr/bin/env node
/**
 * Supprime les fonds blancs/gris des PNG dans public/team-kits (flood-fill depuis les bords).
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const KITS_DIR = path.join(process.cwd(), "public", "team-kits");

function isBackground(r, g, b, a) {
  if (a <= 8) return true;
  if (r >= 235 && g >= 235 && b >= 235) return true;
  const lum = (r + g + b) / 3;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (lum >= 228 && sat < 18) return true;
  return false;
}

/** Fond uniforme détecté aux coins (gris moyen / foncé) */
function isBackgroundLikeCorner(r, g, b, a, cornerRgb) {
  if (a <= 8) return true;
  const dr = Math.abs(r - cornerRgb[0]);
  const dg = Math.abs(g - cornerRgb[1]);
  const db = Math.abs(b - cornerRgb[2]);
  return dr + dg + db < 35;
}

function floodFillFromCorners(data, width, height, useCornerMatch = false) {
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ].map(([x, y]) => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  });
  const cornerAvg = corners.reduce(
    (acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]],
    [0, 0, 0]
  ).map((v) => Math.round(v / 4));

  const visited = new Uint8Array(width * height);
  const queue = [];

  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const idx = p * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    const bg = useCornerMatch
      ? isBackgroundLikeCorner(r, g, b, a, cornerAvg)
      : isBackground(r, g, b, a);
    if (!bg) return;
    visited[p] = 1;
    queue.push(p);
  }

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    data[p * 4 + 3] = 0;
    const x = p % width;
    const y = Math.floor(p / width);
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
}

function cleanEdgeHalos(data, width, height) {
  const copy = Uint8Array.from(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      if (copy[idx + 3] === 0) continue;
      let transparentNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          if (copy[nIdx + 3] === 0) transparentNeighbors++;
        }
      }
      if (transparentNeighbors >= 6) data[idx + 3] = 0;
      else if (transparentNeighbors >= 4) data[idx + 3] = Math.round(data[idx + 3] * 0.35);
    }
  }
}

async function fixKit(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  floodFillFromCorners(data, info.width, info.height, false);

  /** Coins encore opaques → fond gris uniforme (QAT, URU, etc.) */
  const cornerIdx = [0, (info.width - 1) * 4, (info.width * info.height - 1) * 4];
  const cornerStillOpaque = cornerIdx.some((i) => data[i + 3] > 200);
  if (cornerStillOpaque) {
    floodFillFromCorners(data, info.width, info.height, true);
  }

  cleanEdgeHalos(data, info.width, info.height);

  const trimmed = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await sharp(trimmed).toFile(filePath);
}

async function main() {
  const files = (await fs.readdir(KITS_DIR)).filter((f) => f.endsWith(".png"));
  let done = 0;
  for (const file of files) {
    await fixKit(path.join(KITS_DIR, file));
    done++;
    if (done % 24 === 0) console.log(`Processed ${done}/${files.length}`);
  }
  console.log(`Done: ${done} kit images in public/team-kits`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
