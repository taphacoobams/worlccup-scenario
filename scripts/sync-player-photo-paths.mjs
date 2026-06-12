/**
 * Aligne data/players.json avec les fichiers réels dans public/players/
 * Usage: node scripts/sync-player-photo-paths.mjs
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const INTERNAL_TO_FIFA3 = {
  MX: "MEX", ZA: "RSA", KR: "KOR", CZ: "CZE", CA: "CAN", BA: "BIH", QA: "QAT",
  CH: "SUI", BR: "BRA", MA: "MAR", HT: "HAI", "GB-SCT": "SCO", US: "USA", PY: "PAR",
  AU: "AUS", TR: "TUR", DE: "GER", CW: "CUW", CI: "CIV", EC: "ECU", NL: "NED",
  JP: "JPN", SE: "SWE", TN: "TUN", BE: "BEL", EG: "EGY", IR: "IRN", NZ: "NZL",
  ES: "ESP", CV: "CPV", SA: "KSA", UY: "URU", FR: "FRA", SN: "SEN", IQ: "IRQ",
  NO: "NOR", AR: "ARG", DZ: "ALG", AT: "AUT", JO: "JOR", PT: "POR", CD: "COD",
  UZ: "UZB", CO: "COL", "GB-ENG": "ENG", HR: "CRO", GH: "GHA", PA: "PAN",
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function folderForTeamCode(code) {
  return (INTERNAL_TO_FIFA3[code] ?? code).toLowerCase();
}

function scoreMatch(fileBase, playerName) {
  const tokens = playerName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (!tokens.length) return 0;

  let score = 0;
  for (const t of tokens) {
    if (fileBase.includes(t)) score += 2;
  }
  const last = tokens[tokens.length - 1];
  if (fileBase === slugify(playerName)) score += 10;
  if (fileBase.endsWith(`-${last}`) || fileBase === last) score += 5;
  if (fileBase.split("-").includes(last)) score += 3;
  return score;
}

function findBestFile(files, playerName) {
  const shirt = slugify(playerName);
  let best = null;
  let bestScore = 0;

  for (const file of files) {
    const base = file.replace(/\.(jpg|jpeg|png|webp)$/i, "");
    if (base === shirt) return file;
    const s = scoreMatch(base, playerName);
    if (s > bestScore) {
      bestScore = s;
      best = file;
    }
  }

  if (best && bestScore >= 3) return best;
  return null;
}

const teams = JSON.parse(readFileSync(join(root, "data", "teams.json"), "utf-8"));
const teamById = new Map(teams.map((t) => [t.id, t]));
const players = JSON.parse(readFileSync(join(root, "data", "players.json"), "utf-8"));

const fileCache = new Map();

function filesInFolder(folder) {
  if (fileCache.has(folder)) return fileCache.get(folder);
  const dir = join(root, "public", "players", folder);
  if (!existsSync(dir)) {
    fileCache.set(folder, []);
    return [];
  }
  const files = readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  fileCache.set(folder, files);
  return files;
}

let fixed = 0;
let alreadyOk = 0;
let unresolved = 0;

for (const p of players) {
  const team = teamById.get(p.teamId);
  const folder =
    p.photo?.match(/^\/players\/([a-z0-9-]+)\//i)?.[1] ??
    (team ? folderForTeamCode(team.code) : null);

  if (!folder) {
    unresolved++;
    continue;
  }

  const files = filesInFolder(folder);
  const current = p.photo?.replace(/^\//, "");
  if (current && existsSync(join(root, "public", current))) {
    alreadyOk++;
    continue;
  }

  const match = findBestFile(files, p.name);
  if (match) {
    p.photo = `/players/${folder}/${match}`;
    fixed++;
  } else {
    p.photo = "";
    p.imageCredit = null;
    unresolved++;
  }
}

writeFileSync(join(root, "data", "players.json"), JSON.stringify(players, null, 2) + "\n");
console.log(`Photos OK : ${alreadyOk}`);
console.log(`Photos corrigées : ${fixed}`);
console.log(`Sans fichier : ${unresolved}`);
