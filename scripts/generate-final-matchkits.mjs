#!/usr/bin/env node

/**
 * Premium Football Kit Rendering Pipeline - Phase 2
 * 
 * Target: EA Sports FC Ultimate Team / FIFA Tournament quality
 * Creates production-ready, catalog-quality kit renders.
 * Output: 1200x1200 PNG with transparent background, centered composition.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "public", "generated-kits");
const OUTPUT_DIR = path.join(ROOT, "public", "matchkits");

const CANVAS_SIZE = 1200;
const MAX_KIT_WIDTH = 650;
const MAX_KIT_HEIGHT = 950;
const EDGE_MARGIN = 100;

const KIT_TYPES = [
  { kind: "fieldplayer", input: "player-kit.png", output: "fieldplayer-kit.png" },
  { kind: "goalkeeper", input: "goalkeeper-kit.png", output: "goalkeeper-kit.png" },
];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function cleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  await fs.mkdir(dir, { recursive: true });
}

async function listDirectories(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

async function findSourceFolders() {
  const folders = [];
  const teams = await listDirectories(SOURCE_DIR);

  for (const team of teams) {
    const teamDir = path.join(SOURCE_DIR, team);
    const matches = await listDirectories(teamDir);

    for (const match of matches) {
      const matchDir = path.join(teamDir, match);
      const hasAnyKit = await Promise.all(
        KIT_TYPES.map((k) => exists(path.join(matchDir, k.input)))
      );
      if (hasAnyKit.some(Boolean)) {
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

function findConnectedComponents(data, width, height, alphaThreshold = 12) {
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
      const neighbors = [
        x > 0 ? p - 1 : -1,
        x < width - 1 ? p + 1 : -1,
        y > 0 ? p - width : -1,
        y < height - 1 ? p + width : -1,
      ];
      for (const n of neighbors) {
        if (n >= 0 && !visited[n] && data[n * 4 + 3] > alphaThreshold) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }

    components.push(component);
  }

  return components;
}

function keepMainComponents(data, width, height) {
  const components = findConnectedComponents(data, width, height);
  if (components.length === 0) return;

  components.sort((a, b) => b.length - a.length);
  
  const totalPixels = components.reduce((sum, c) => sum + c.length, 0);
  const keep = new Set();
  let keptPixels = 0;

  for (const comp of components) {
    if (comp.length > totalPixels * 0.005 || keptPixels < totalPixels * 0.98) {
      for (const p of comp) keep.add(p);
      keptPixels += comp.length;
    }
  }

  for (let p = 0; p < width * height; p++) {
    if (!keep.has(p)) data[p * 4 + 3] = 0;
  }
}

function removeSmallArtifacts(data, width, height, minSize = 200) {
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

async function processKitImage(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  floodFillStrictBackground(data, width, height);
  keepMainComponents(data, width, height);
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
      width: MAX_KIT_WIDTH,
      height: MAX_KIT_HEIGHT,
      fit: "inside",
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .sharpen({ sigma: 0.2, m1: 0.4, m2: 0.2 })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return resized;
}

async function renderKit(inputPath, outputPath) {
  const kitBuffer = await processKitImage(inputPath);
  const meta = await sharp(kitBuffer).metadata();

  const left = Math.round((CANVAS_SIZE - meta.width) / 2);
  const top = Math.round((CANVAS_SIZE - meta.height) / 2);

  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  await sharp({
    create: {
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: kitBuffer, left, top }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  await validateOutput(outputPath);
}

async function validateOutput(outputPath) {
  const meta = await sharp(outputPath).metadata();

  if (meta.width !== CANVAS_SIZE || meta.height !== CANVAS_SIZE) {
    throw new Error(`Invalid size: ${meta.width}x${meta.height}`);
  }
  if (!meta.hasAlpha) {
    throw new Error("Missing alpha channel");
  }

  const { data, info } = await sharp(outputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let visiblePixels = 0;
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha > 10) {
        visiblePixels++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (visiblePixels < 30000) {
    throw new Error(`Too few visible pixels: ${visiblePixels}`);
  }

  const corners = [
    data[3],
    data[(info.width - 1) * 4 + 3],
    data[((info.height - 1) * info.width) * 4 + 3],
    data[(info.height * info.width - 1) * 4 + 3],
  ];

  if (!corners.every((a) => a === 0)) {
    throw new Error("Corners not transparent");
  }

  if (minX < EDGE_MARGIN || minY < EDGE_MARGIN || 
      maxX > CANVAS_SIZE - EDGE_MARGIN || maxY > CANVAS_SIZE - EDGE_MARGIN) {
    throw new Error(`Kit too close to edge: bbox(${minX},${minY},${maxX},${maxY})`);
  }
}

async function main() {
  console.log("Starting kit rendering pipeline...");

  if (!(await exists(SOURCE_DIR))) {
    throw new Error(`Source directory not found: ${SOURCE_DIR}`);
  }

  await cleanDir(OUTPUT_DIR);

  const folders = await findSourceFolders();
  const teams = new Set(folders.map((f) => f.team));
  const stats = { fieldplayer: 0, goalkeeper: 0 };
  const failures = [];

  console.log(`Found ${folders.length} match folders across ${teams.size} teams`);

  for (const folder of folders) {
    for (const kit of KIT_TYPES) {
      const inputPath = path.join(folder.matchDir, kit.input);
      const outputPath = path.join(OUTPUT_DIR, folder.team, folder.match, kit.output);

      try {
        if (!(await exists(inputPath))) {
          throw new Error(`Source not found: ${kit.input}`);
        }
        await renderKit(inputPath, outputPath);
        stats[kit.kind]++;
      } catch (err) {
        failures.push({
          team: folder.team,
          match: folder.match,
          kit: kit.kind,
          error: err.message,
        });
      }
    }
  }

  const report = {
    teamsProcessed: teams.size,
    matchFoldersProcessed: folders.length,
    fieldplayerKitsGenerated: stats.fieldplayer,
    goalkeeperKitsGenerated: stats.goalkeeper,
    failures,
  };

  console.log("\n" + "=".repeat(50));
  console.log("FINAL REPORT");
  console.log("=".repeat(50));
  console.log(JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    console.log(`\nWarning: ${failures.length} failures occurred`);
    process.exitCode = 1;
  } else {
    console.log("\nAll kits generated successfully!");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
