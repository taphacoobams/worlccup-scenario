#!/usr/bin/env node

/**
 * Premium Football Kit Assembly Pipeline
 * 
 * Target: EA Sports FC Ultimate Team / FIFA Tournament quality
 * Creates seamless, professional kit renders from individual parts.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const GENERATED_KITS_DIR = path.join(ROOT, "public", "generated-kits");
const OUTPUT_SIZE = 1200;

const KIT_DEFINITIONS = [
  {
    type: "player",
    output: "player-kit.png",
    parts: { shirt: "player-shirt.png", shorts: "player-shorts.png", socks: "player-socks.png" },
  },
  {
    type: "goalkeeper",
    output: "goalkeeper-kit.png",
    parts: { shirt: "gk-shirt.png", shorts: "gk-shorts.png", socks: "gk-socks.png" },
  },
];

const LAYOUT = {
  shirt: { top: 55, maxWidth: 540, maxHeight: 450 },
  shorts: { top: 480, maxWidth: 360, maxHeight: 240 },
  socks: { top: 700, maxWidth: 115, maxHeight: 340, pairGap: 125 },
};

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listDirectories(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function findMatchFolders() {
  const folders = [];
  const teamNames = await listDirectories(GENERATED_KITS_DIR);

  for (const team of teamNames) {
    const teamDir = path.join(GENERATED_KITS_DIR, team);
    const matchNames = await listDirectories(teamDir);

    for (const match of matchNames) {
      const matchDir = path.join(teamDir, match);
      const hasAnyKitPart = await Promise.all(
        KIT_DEFINITIONS.flatMap((kit) =>
          Object.values(kit.parts).map((fileName) => exists(path.join(matchDir, fileName)))
        )
      );
      if (hasAnyKitPart.some(Boolean)) {
        folders.push({ team, match, matchDir });
      }
    }
  }

  return folders;
}

function isStrictBackground(r, g, b, a) {
  if (a <= 3) return true;
  if (r >= 254 && g >= 254 && b >= 254) return true;
  if (r >= 252 && g >= 252 && b >= 252 && a < 255) return true;
  return false;
}

function floodFillStrictBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const idx = p * 4;
    if (!isStrictBackground(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) return;
    visited[p] = 1;
    queue.push(p);
  }

  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }

  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    const x = p % width, y = Math.floor(p / width);
    data[p * 4 + 3] = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx !== 0 || dy !== 0) enqueue(x + dx, y + dy);
      }
    }
  }
}

function findConnectedComponents(data, width, height, alphaThreshold = 15) {
  const visited = new Uint8Array(width * height);
  const components = [];

  for (let start = 0; start < width * height; start++) {
    if (visited[start] || data[start * 4 + 3] <= alphaThreshold) continue;

    const component = [];
    const queue = [start];
    visited[start] = 1;

    for (let i = 0; i < queue.length; i++) {
      const p = queue[i];
      component.push(p);
      const x = p % width, y = Math.floor(p / width);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const n = ny * width + nx;
          if (!visited[n] && data[n * 4 + 3] > alphaThreshold) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }
    }
    components.push(component);
  }

  return components;
}

function keepLargestComponent(data, width, height) {
  const components = findConnectedComponents(data, width, height);
  if (components.length === 0) return;

  components.sort((a, b) => b.length - a.length);
  const keep = new Set(components[0]);

  for (let p = 0; p < width * height; p++) {
    if (!keep.has(p)) data[p * 4 + 3] = 0;
  }
}

function removeSmallArtifacts(data, width, height, minSize = 100) {
  const components = findConnectedComponents(data, width, height);
  for (const comp of components) {
    if (comp.length < minSize) {
      for (const p of comp) data[p * 4 + 3] = 0;
    }
  }
}

function cleanEdgePixels(data, width, height) {
  const copy = new Uint8Array(data.length);
  copy.set(data);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      if (copy[idx + 3] === 0) continue;

      let transparentCount = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          if (copy[nIdx + 3] === 0) transparentCount++;
        }
      }

      if (transparentCount >= 7) {
        data[idx + 3] = 0;
      } else if (transparentCount >= 5) {
        data[idx + 3] = Math.round(data[idx + 3] * 0.5);
      }
    }
  }
}

async function processKitPart(inputPath, maxWidth, maxHeight) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  floodFillStrictBackground(data, width, height);
  keepLargestComponent(data, width, height);
  removeSmallArtifacts(data, width, height, 50);
  cleanEdgePixels(data, width, height);

  const cleaned = await sharp(data, { raw: { width, height, channels: 4 } })
    .png()
    .toBuffer();

  const trimmed = await sharp(cleaned)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 3 })
    .toBuffer();

  const resized = await sharp(trimmed)
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  const meta = await sharp(resized).metadata();
  return { buffer: resized, width: meta.width, height: meta.height };
}

function centeredLeft(partWidth) {
  return Math.round((OUTPUT_SIZE - partWidth) / 2);
}

async function generateKit(matchDir, kitDefinition) {
  const inputPaths = Object.fromEntries(
    Object.entries(kitDefinition.parts).map(([part, fileName]) => [part, path.join(matchDir, fileName)])
  );

  for (const [part, inputPath] of Object.entries(inputPaths)) {
    if (!(await exists(inputPath))) {
      throw new Error(`Missing: ${part}`);
    }
  }

  const shirt = await processKitPart(inputPaths.shirt, LAYOUT.shirt.maxWidth, LAYOUT.shirt.maxHeight);
  const shorts = await processKitPart(inputPaths.shorts, LAYOUT.shorts.maxWidth, LAYOUT.shorts.maxHeight);
  const socks = await processKitPart(inputPaths.socks, LAYOUT.socks.maxWidth, LAYOUT.socks.maxHeight);

  const socksTotalWidth = socks.width * 2 + LAYOUT.socks.pairGap;
  const socksLeft = Math.round((OUTPUT_SIZE - socksTotalWidth) / 2);

  const outputPath = path.join(matchDir, kitDefinition.output);

  await sharp({
    create: {
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: socks.buffer, left: socksLeft, top: LAYOUT.socks.top },
      { input: socks.buffer, left: socksLeft + socks.width + LAYOUT.socks.pairGap, top: LAYOUT.socks.top },
      { input: shorts.buffer, left: centeredLeft(shorts.width), top: LAYOUT.shorts.top },
      { input: shirt.buffer, left: centeredLeft(shirt.width), top: LAYOUT.shirt.top },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  return outputPath;
}

async function main() {
  console.log("Starting kit assembly pipeline...");

  if (!(await exists(GENERATED_KITS_DIR))) {
    throw new Error(`Missing directory: ${GENERATED_KITS_DIR}`);
  }

  const matchFolders = await findMatchFolders();
  const teams = new Set(matchFolders.map((f) => f.team));
  const stats = { player: 0, goalkeeper: 0 };
  const failures = [];

  console.log(`Found ${matchFolders.length} match folders across ${teams.size} teams`);

  for (const folder of matchFolders) {
    for (const kitDef of KIT_DEFINITIONS) {
      try {
        await generateKit(folder.matchDir, kitDef);
        stats[kitDef.type]++;
      } catch (err) {
        failures.push({
          team: folder.team,
          match: folder.match,
          kit: kitDef.type,
          error: err.message,
        });
      }
    }
  }

  const report = {
    teamsProcessed: teams.size,
    matchFoldersProcessed: matchFolders.length,
    playerKitsGenerated: stats.player,
    goalkeeperKitsGenerated: stats.goalkeeper,
    failures,
  };

  console.log("\n" + "=".repeat(50));
  console.log("KIT ASSEMBLY REPORT");
  console.log("=".repeat(50));
  console.log(JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    console.log(`\nWarning: ${failures.length} failures`);
    process.exitCode = 1;
  } else {
    console.log("\nAll kits assembled successfully!");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
