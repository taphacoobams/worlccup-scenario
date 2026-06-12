#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

const ROOT = process.cwd();
const KITS_DIR = path.join(ROOT, "public", "kits");
const GENERATED_DIR = path.join(ROOT, "public", "generated-kits");
const DATA_DIR = path.join(ROOT, "public", "data");
const DEBUG_DIR = path.join(ROOT, "public", "debug");
const FIXTURES_PATH = path.join(ROOT, "data", "fixtures.json");
const TEAMS_PATH = path.join(ROOT, "data", "teams.json");
const PAGE_COUNT = Number(process.env.KITS_PAGE_COUNT ?? 36);
const MODE = process.argv.includes("--debug") ? "debug" : "extract";

const INTERNAL_TO_FIFA3 = {
  MX: "MEX",
  ZA: "RSA",
  KR: "KOR",
  CZ: "CZE",
  CA: "CAN",
  BA: "BIH",
  QA: "QAT",
  CH: "SUI",
  BR: "BRA",
  MA: "MAR",
  HT: "HAI",
  "GB-SCT": "SCO",
  US: "USA",
  PY: "PAR",
  AU: "AUS",
  TR: "TUR",
  DE: "GER",
  CW: "CUW",
  CI: "CIV",
  EC: "ECU",
  NL: "NED",
  JP: "JPN",
  SE: "SWE",
  TN: "TUN",
  BE: "BEL",
  EG: "EGY",
  IR: "IRN",
  NZ: "NZL",
  ES: "ESP",
  CV: "CPV",
  SA: "KSA",
  UY: "URU",
  FR: "FRA",
  SN: "SEN",
  IQ: "IRQ",
  NO: "NOR",
  AR: "ARG",
  DZ: "ALG",
  AT: "AUT",
  JO: "JOR",
  PT: "POR",
  CD: "COD",
  UZ: "UZB",
  CO: "COL",
  "GB-ENG": "ENG",
  HR: "CRO",
  GH: "GHA",
  PA: "PAN",
};

const COLOR_PHRASES = [
  "light blue",
  "light grey",
  "dark grey",
  "olive green",
  "neon green",
  "turquoise",
  "magenta",
  "purple",
  "maroon",
  "bronze",
  "yellow",
  "green",
  "white",
  "black",
  "brown",
  "gold",
  "orange",
  "silver",
  "grey",
  "gray",
  "blue",
  "navy",
  "red",
];

const COLOR_ALIASES = {
  wh: "white",
  wi: "white",
  bla: "black",
  bl: "blue",
  blu: "blue",
  turquois: "turquoise",
  "b turquois": "turquoise",
  "a turquois": "turquoise",
  magent: "magenta",
  "light blu": "light blue",
  "light bly": "light blue",
  "olive gree": "olive green",
  "neon gre": "neon green",
  "e neon": "neon green",
  "light gre": "light grey",
  "y light": "light blue",
};

const TEAM_NAME_TO_CODE = {
  "mexico": "MEX",
  "south africa": "RSA",
  "korea republic": "KOR",
  "czechia": "CZE",
  "canada": "CAN",
  "bosnia and herzegovina": "BIH",
  "qatar": "QAT",
  "switzerland": "SUI",
  "cote d ivoire": "CIV",
  "c te d ivoire": "CIV",
  "ecuador": "ECU",
  "germany": "GER",
  "curacao": "CUW",
  "curagao": "CUW",
  "netherlands": "NED",
  "japan": "JPN",
  "sweden": "SWE",
  "tunisia": "TUN",
  "belgium": "BEL",
  "egypt": "EGY",
  "ir iran": "IRN",
  "i r iran": "IRN",
  "new zealand": "NZL",
  "spain": "ESP",
  "cabo verde": "CPV",
  "saudi arabia": "KSA",
  "uruguay": "URU",
  "france": "FRA",
  "senegal": "SEN",
  "iraq": "IRQ",
  "norway": "NOR",
  "argentina": "ARG",
  "algeria": "ALG",
  "austria": "AUT",
  "jordan": "JOR",
  "portugal": "POR",
  "dr congo": "COD",
  "d r congo": "COD",
  "uzbekistan": "UZB",
  "colombia": "COL",
  "england": "ENG",
  "croatia": "CRO",
  "ghana": "GHA",
  "panama": "PAN",
  "brazil": "BRA",
  "morocco": "MAR",
  "haiti": "HAI",
  "scotland": "SCO",
  "usa": "USA",
  "united states": "USA",
  "paraguay": "PAR",
  "australia": "AUS",
  "turkiye": "TUR",
  "turkey": "TUR",
};

const SIDES = {
  home: {
    name: { left: 80, top: 32, width: 285, height: 34 },
    x: { shirt: 77, shorts: 166, socks: 260 },
    w: { shirt: 95, shorts: 100, socks: 95 },
    cropW: { shirt: 105, shorts: 105, socks: 60 },
  },
  away: {
    name: { left: 650, top: 32, width: 300, height: 34 },
    x: { shirt: 650, shorts: 750, socks: 850 },
    w: { shirt: 115, shorts: 120, socks: 105 },
    cropW: { shirt: 110, shorts: 120, socks: 70 },
  },
};

const ROLES = {
  player: {
    cropTop: 100,
    cropHeight: 105,
    textTop: 195,
    textHeight: 70,
    filePrefix: "player",
  },
  goalkeeper: {
    cropTop: 280,
    cropHeight: 115,
    textTop: 370,
    textHeight: 78,
    filePrefix: "gk",
  },
};

const PARTS = ["shirt", "shorts", "socks"];

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function ensureCleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  await fs.mkdir(dir, { recursive: true });
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

async function ocr(worker, imagePath, rect, pageWidth, pageHeight, psm = "6") {
  const safeRect = clampRect(rect, pageWidth, pageHeight);
  const buffer = await sharp(imagePath)
    .extract(safeRect)
    .resize({ width: safeRect.width * 6 })
    .grayscale()
    .normalise()
    .sharpen()
    .threshold(180)
    .png()
    .toBuffer();

  await worker.setParameters({
    tessedit_pageseg_mode: psm,
    tessedit_char_whitelist:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /-'&.",
  });
  const result = await worker.recognize(buffer);
  return result.data.text.trim().replace(/\s+/g, " ");
}

function normalizeTeamName(text) {
  return text
    .replace(/\b(Bib|Player|Goalkeeper|Referee|Ball Kid)\b/gi, "")
    .replace(/[^A-Za-z0-9 '&.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function teamKey(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function codeFromTeamName(name) {
  const key = teamKey(name);
  if (TEAM_NAME_TO_CODE[key]) return TEAM_NAME_TO_CODE[key];
  const compact = key.replace(/\b(the|of|and)\b/g, "").replace(/\s+/g, " ").trim();
  return TEAM_NAME_TO_CODE[compact] ?? null;
}

function normalizeColor(raw) {
  const text = raw
    .toLowerCase()
    .replace(/[^a-z/ ]/g, " ")
    .replace(/\blig\b/g, "light")
    .replace(/\bgrev\b/g, "grey")
    .replace(/\s+/g, " ")
    .trim();

  const segments = text.split("/").map((segment) => segment.trim());
  const cleaned = segments
    .map((segment) => {
      if (COLOR_ALIASES[segment]) return COLOR_ALIASES[segment];
      for (const phrase of COLOR_PHRASES) {
        const words = phrase.split(" ");
        if (words.every((word) => segment.includes(word))) return phrase;
      }
      if (segment.length >= 3) {
        const prefixMatch = COLOR_PHRASES.find((phrase) => phrase.startsWith(segment));
        if (prefixMatch) return prefixMatch;
      }
      const hit = segment.match(/[a-z]+(?: [a-z]+)?/);
      if (!hit) return "";
      const fallback = hit[0].trim();
      if (fallback === "gray") return "grey";
      return fallback;
    })
    .filter(Boolean);

  return [...new Set(cleaned)].join(" / ");
}

function splitColors(color) {
  return color
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

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

  const tops = clusters
    .filter((cluster) => cluster.end - cluster.start >= 8)
    .map((cluster) => cluster.start)
    .slice(0, 2);

  if (tops.length !== 2) {
    throw new Error(`Could not detect two match blocks in ${path.basename(imagePath)}`);
  }

  return tops;
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

function rectFor(blockTop, sideKey, roleKey, part) {
  const side = SIDES[sideKey];
  const role = ROLES[roleKey];
  return {
    crop: {
      left: side.x[part],
      top: blockTop + role.cropTop,
      width: side.cropW[part],
      height: role.cropHeight,
    },
    text: {
      left: side.x[part] - 4,
      top: blockTop + role.textTop,
      width: side.w[part],
      height: role.textHeight,
    },
  };
}

function kitEntry(img, color) {
  return {
    img,
    color,
    colors: splitColors(color),
  };
}

function getFixtureTeams(fixtures, teamsById, matchNumber) {
  const fixture = fixtures[matchNumber - 1];
  if (!fixture) throw new Error(`No fixture found for match ${matchNumber}`);
  const home = teamsById.get(fixture.homeTeamId);
  const away = teamsById.get(fixture.awayTeamId);
  return {
    home: INTERNAL_TO_FIFA3[home.code] ?? home.code,
    away: INTERNAL_TO_FIFA3[away.code] ?? away.code,
  };
}

function fallbackFixtureTeam(fixtures, teamsById, matchNumber, side) {
  const fixtureTeams = getFixtureTeams(fixtures, teamsById, matchNumber);
  return fixtureTeams[side];
}

async function writeDebugOverlay(imagePath, outputPath, rects, width, height) {
  const boxes = rects
    .map((rect) => {
      const color = rect.kind === "text" ? "#00a3ff" : "#ff3d00";
      return `<rect x="${rect.left}" y="${rect.top}" width="${rect.width}" height="${rect.height}" fill="none" stroke="${color}" stroke-width="2"/>`;
    })
    .join("");
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${boxes}</svg>`;
  await sharp(imagePath)
    .composite([{ input: Buffer.from(svg), left: 0, top: 0 }])
    .jpeg({ quality: 92 })
    .toFile(outputPath);
}

async function main() {
  const fixtures = await readJson(FIXTURES_PATH);
  const teams = await readJson(TEAMS_PATH);
  const teamsById = new Map(teams.map((team) => [team.id, team]));

  await ensureCleanDir(GENERATED_DIR);
  await fs.mkdir(DATA_DIR, { recursive: true });
  if (MODE === "debug") await ensureCleanDir(DEBUG_DIR);

  const worker = await createWorker("eng");
  const matches = [];
  const teamKits = {};

  for (let page = 1; page <= PAGE_COUNT; page += 1) {
    const imagePath = path.join(KITS_DIR, `${page}.jpg`);
    const meta = await sharp(imagePath).metadata();
    const width = meta.width;
    const height = meta.height;
    const blockTops = await detectBlockTops(imagePath, width, height);
    const pageDebug = { page, blocks: [] };
    const overlayRects = [];

    for (let blockIndex = 0; blockIndex < blockTops.length; blockIndex += 1) {
      const blockTop = blockTops[blockIndex];
      const matchNumber = (page - 1) * 2 + blockIndex + 1;
      const homeNameRaw = await ocr(worker, imagePath, {
        ...SIDES.home.name,
        top: blockTop + SIDES.home.name.top,
      }, width, height, "7");
      const awayNameRaw = await ocr(worker, imagePath, {
        ...SIDES.away.name,
        top: blockTop + SIDES.away.name.top,
      }, width, height, "7");
      const homeName = normalizeTeamName(homeNameRaw);
      const awayName = normalizeTeamName(awayNameRaw);
      const fixtureTeams = {
        home: codeFromTeamName(homeName) ?? fallbackFixtureTeam(fixtures, teamsById, matchNumber, "home"),
        away: codeFromTeamName(awayName) ?? fallbackFixtureTeam(fixtures, teamsById, matchNumber, "away"),
      };
      const officialNames = {
        [fixtureTeams.home]: homeName,
        [fixtureTeams.away]: awayName,
      };
      const matchKits = {};
      const debugBlock = {
        matchNumber,
        blockTop,
        teams: {
          home: { code: fixtureTeams.home, ocr: homeNameRaw, name: officialNames[fixtureTeams.home] },
          away: { code: fixtureTeams.away, ocr: awayNameRaw, name: officialNames[fixtureTeams.away] },
        },
        colors: {},
      };

      for (const [sideKey, teamCode] of [
        ["home", fixtureTeams.home],
        ["away", fixtureTeams.away],
      ]) {
        const teamDir = `p${String(page).padStart(2, "0")}-m${String(matchNumber).padStart(2, "0")}`;
        const publicBase = `/generated-kits/${teamCode}/${teamDir}`;
        const outputBase = path.join(GENERATED_DIR, teamCode, teamDir);
        matchKits[teamCode] = { player: {}, goalkeeper: {} };
        debugBlock.colors[teamCode] = { player: {}, goalkeeper: {} };

        for (const roleKey of Object.keys(ROLES)) {
          for (const part of PARTS) {
            const rects = rectFor(blockTop, sideKey, roleKey, part);
            const rawColor = await ocr(worker, imagePath, rects.text, width, height);
            const color = normalizeColor(rawColor);
            const fileName = `${ROLES[roleKey].filePrefix}-${part}.png`;
            const outputPath = path.join(outputBase, fileName);
            const publicPath = `${publicBase}/${fileName}`;

            await transparentCrop(imagePath, rects.crop, outputPath, width, height);
            matchKits[teamCode][roleKey][part] = kitEntry(publicPath, color);
            debugBlock.colors[teamCode][roleKey][part] = { raw: rawColor, color, rect: rects.text };
            overlayRects.push({ ...rects.crop, kind: "crop" }, { ...rects.text, kind: "text" });
          }
        }

        teamKits[teamCode] ??= {
          name: officialNames[teamCode] || teamCode,
          player: {},
          goalkeeper: {},
          appearances: [],
        };
        teamKits[teamCode].name = teamKits[teamCode].name || officialNames[teamCode] || teamCode;
        teamKits[teamCode].appearances.push({
          page,
          matchNumber,
          side: sideKey,
          kits: matchKits[teamCode],
        });
        if (!teamKits[teamCode].player.shirt) {
          teamKits[teamCode].player = matchKits[teamCode].player;
          teamKits[teamCode].goalkeeper = matchKits[teamCode].goalkeeper;
        }
      }

      matches.push({
        page,
        matchNumber,
        homeTeam: fixtureTeams.home,
        awayTeam: fixtureTeams.away,
        kits: matchKits,
      });
      pageDebug.blocks.push(debugBlock);
    }

    if (MODE === "debug") {
      const pageDebugDir = path.join(DEBUG_DIR, `page-${String(page).padStart(2, "0")}`);
      await fs.mkdir(pageDebugDir, { recursive: true });
      await writeDebugOverlay(imagePath, path.join(pageDebugDir, "zones.jpg"), overlayRects, width, height);
      await fs.writeFile(path.join(pageDebugDir, "ocr.json"), JSON.stringify(pageDebug, null, 2));
    }

    console.log(`Processed page ${page}/${PAGE_COUNT}`);
  }

  await worker.terminate();

  await fs.writeFile(path.join(DATA_DIR, "kits.json"), JSON.stringify({ matches }, null, 2));
  await fs.writeFile(path.join(DATA_DIR, "team-kits.json"), JSON.stringify(teamKits, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
