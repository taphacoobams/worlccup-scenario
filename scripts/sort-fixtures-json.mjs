/**
 * Trie fixtures-groups.json, fixtures-knockout.json et fixtures-all.json par matchId
 * (M1…M72, V73…V102, 103, 104).
 * Usage: node scripts/sort-fixtures-json.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, "..", "data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), "utf-8"));
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2) + "\n", "utf-8");
}

/** @returns {[number, number]} phase puis numéro */
export function matchIdSortKey(matchId) {
  if (!matchId) return [99, 0];
  const raw = String(matchId).trim().toUpperCase();
  const m = raw.match(/^([MV])?(\d+)$/);
  if (!m) return [99, 0];
  const prefix = m[1] ?? "";
  const num = parseInt(m[2], 10);
  const phase = prefix === "M" ? 0 : prefix === "V" ? 1 : 2;
  return [phase, num];
}

export function compareByMatchId(a, b) {
  const [pa, na] = matchIdSortKey(a.matchId);
  const [pb, nb] = matchIdSortKey(b.matchId);
  return pa - pb || na - nb;
}

function sortMatches(matches) {
  return [...matches].sort(compareByMatchId);
}

function sortFile(file) {
  const data = readJson(file);
  const sorted = sortMatches(data.matches);
  writeJson(file, {
    ...data,
    updatedAt: new Date().toISOString(),
    total: sorted.length,
    matches: sorted,
  });
  const ids = sorted.map((m) => m.matchId);
  console.log(`${file}: ${sorted.length} matchs (${ids[0]} → ${ids[ids.length - 1]})`);
}

sortFile("fixtures-groups.json");
sortFile("fixtures-knockout.json");

const groups = readJson("fixtures-groups.json");
const knockout = readJson("fixtures-knockout.json");
const allMatches = sortMatches([...groups.matches, ...knockout.matches]);
writeJson("fixtures-all.json", {
  updatedAt: new Date().toISOString(),
  total: allMatches.length,
  groupStage: groups.matches.length,
  knockout: knockout.matches.length,
  matches: allMatches,
});
const ids = allMatches.map((m) => m.matchId);
console.log(
  `fixtures-all.json: ${allMatches.length} matchs (${ids[0]} → ${ids[ids.length - 1]})`
);
