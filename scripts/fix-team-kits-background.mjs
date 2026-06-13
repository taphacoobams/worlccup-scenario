#!/usr/bin/env node
/**
 * Supprime le fond blanc/gris des PNG déjà présents dans public/team-kits.
 * Ne régénère jamais depuis matchkits — traite uniquement les fichiers existants.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const KITS_DIR = path.join(process.cwd(), "public", "team-kits");

function floodFillFromEdges(data, width, height, isBackground) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const idx = p * 4;
    if (!isBackground(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) return;
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
    const x = p % width;
    const y = Math.floor(p / width);
    data[p * 4 + 3] = 0;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
}

function averageCornerRgb(data, width, height) {
  const corners = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  const sum = [0, 0, 0];
  for (const [x, y] of corners) {
    const i = (y * width + x) * 4;
    sum[0] += data[i];
    sum[1] += data[i + 1];
    sum[2] += data[i + 2];
  }
  return sum.map((v) => Math.round(v / 4));
}

function cornerLooksLikeDarkPlate(cornerRgb) {
  const [r, g, b] = cornerRgb;
  const lum = (r + g + b) / 3;
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  return lum < 175 && sat < 35;
}

/** Fond blanc FIFA : ne touche pas aux zones gris clair du maillot */
async function fixKitBackground(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 245 && g > 245 && b > 245) data[i + 3] = 0;
  }

  const cornerRgb = averageCornerRgb(data, info.width, info.height);
  if (cornerLooksLikeDarkPlate(cornerRgb)) {
    floodFillFromEdges(data, info.width, info.height, (r, g, b, a) => {
      if (a <= 3) return true;
      const dr = Math.abs(r - cornerRgb[0]);
      const dg = Math.abs(g - cornerRgb[1]);
      const db = Math.abs(b - cornerRgb[2]);
      return dr + dg + db < 28;
    });
  }

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
    await fixKitBackground(path.join(KITS_DIR, file));
    done++;
    if (done % 24 === 0) console.log(`Processed ${done}/${files.length}`);
  }

  console.log(`Done: ${done} kit images in public/team-kits`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
