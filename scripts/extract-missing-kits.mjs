#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const KITS_DIR = path.join(ROOT, "public", "kits");
const GENERATED_DIR = path.join(ROOT, "public", "generated-kits");

// Matchs manquants à extraire
const MISSING = [
  { team: "BEL", match: 64, page: 32, side: "away" },   // NZL vs BEL
  { team: "COD", match: 23, page: 12, side: "away" },   // POR vs COD
  { team: "COD", match: 72, page: 36, side: "home" },   // COD vs UZB
  { team: "TUR", match: 6, page: 3, side: "away" },     // AUS vs TUR
  { team: "TUR", match: 31, page: 16, side: "home" },   // TUR vs PAR
];

const SIDES = {
  home: {
    x: { shirt: 77, shorts: 166, socks: 260 },
    cropW: { shirt: 105, shorts: 105, socks: 60 },
  },
  away: {
    x: { shirt: 650, shorts: 750, socks: 850 },
    cropW: { shirt: 110, shorts: 120, socks: 70 },
  },
};

const ROLES = {
  player: { cropTop: 100, cropHeight: 105, filePrefix: "player" },
  goalkeeper: { cropTop: 280, cropHeight: 115, filePrefix: "gk" },
};

const PARTS = ["shirt", "shorts", "socks"];

async function detectBlockTops(imagePath, width, height) {
  const { data } = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
  const rows = [];

  for (let y = 180; y < height - 160; y += 1) {
    let greyPixels = 0;
    let sampled = 0;
    for (let x = 75; x < width - 25; x += 6) {
      const i = (y * width + x) * 3;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (Math.abs(r - g) < 8 && Math.abs(r - b) < 8 && r > 200 && r < 235) {
        greyPixels += 1;
      }
      sampled += 1;
    }
    if (greyPixels / sampled > 0.62) rows.push(y);
  }

  const clusters = [];
  for (const row of rows) {
    const last = clusters.at(-1);
    if (!last || row - last.end > 3) clusters.push({ start: row, end: row });
    else last.end = row;
  }

  return clusters
    .filter((cluster) => cluster.end - cluster.start >= 8)
    .map((cluster) => cluster.start)
    .slice(0, 2);
}

function clampRect(rect, width, height) {
  const left = Math.max(0, Math.min(width - 1, Math.round(rect.left)));
  const top = Math.max(0, Math.min(height - 1, Math.round(rect.top)));
  return {
    left,
    top,
    width: Math.max(1, Math.min(width - left, Math.round(rect.width))),
    height: Math.max(1, Math.min(height - top, Math.round(rect.height))),
  };
}

async function transparentCrop(imagePath, rect, outputPath, pageWidth, pageHeight) {
  const safeRect = clampRect(rect, pageWidth, pageHeight);
  const image = sharp(imagePath).extract(safeRect).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 245 && g > 245 && b > 245) data[i + 3] = 0;
  }

  const buffer = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 }, threshold: 8 })
    .png()
    .toBuffer();

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);
}

async function extractMatch(missing) {
  const { team, match, page, side } = missing;
  const imagePath = path.join(KITS_DIR, `${page}.jpg`);
  const meta = await sharp(imagePath).metadata();
  const { width, height } = meta;

  const blockTops = await detectBlockTops(imagePath, width, height);
  const blockIndex = match % 2 === 1 ? 0 : 1; // odd = first block, even = second block
  const blockTop = blockTops[blockIndex];

  const outputDir = path.join(GENERATED_DIR, team, `m${String(match).padStart(2, "0")}`);
  const sideConfig = SIDES[side];

  console.log(`Extracting ${team} match ${match} from page ${page} (${side} side, block ${blockIndex + 1})`);

  for (const [, role] of Object.entries(ROLES)) {
    for (const part of PARTS) {
      const rect = {
        left: sideConfig.x[part],
        top: blockTop + role.cropTop,
        width: sideConfig.cropW[part],
        height: role.cropHeight,
      };

      const fileName = `${role.filePrefix}-${part}.png`;
      const outputPath = path.join(outputDir, fileName);

      await transparentCrop(imagePath, rect, outputPath, width, height);
      console.log(`  Created ${fileName}`);
    }
  }
}

async function main() {
  console.log("Extracting missing kits...\n");

  for (const missing of MISSING) {
    await extractMatch(missing);
    console.log("");
  }

  console.log("Done! All missing kits extracted.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
