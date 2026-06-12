/**
 * Importe la table FIFA Annex C → third-table-source.json + third-place-combinations.txt
 * (la BDD est alimentée via prisma/seed.ts depuis third-table-source.json)
 * Source : table officielle (wm-pickems/third_table.json, dérivée FIFA Regulations Annex C)
 *
 * Usage: node scripts/import-fifa-third-table.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const sourcePath = join(root, "data", "third-table-source.json");
const outTxt = join(root, "data", "third-place-combinations.txt");

const ALL_GROUPS = "ABCDEFGHIJKL".split("");
const WINNER_LETTERS = ["A", "B", "D", "E", "G", "I", "K", "L"];

function* combinations(items, k) {
  const n = items.length;
  const idx = Array.from({ length: k }, (_, i) => i);
  while (true) {
    yield idx.map((i) => items[i]);
    let i = k - 1;
    while (i >= 0 && idx[i] === n - k + i) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

function combinationKey(groups) {
  return [...groups].sort().join(",");
}

function lexIndexFromGroups(groups) {
  const key = combinationKey(groups);
  let i = 0;
  for (const combo of combinations(ALL_GROUPS, 8)) {
    if (combinationKey(combo) === key) return i;
    i++;
  }
  return -1;
}

function loadThirdTable() {
  if (!existsSync(sourcePath)) {
    throw new Error(
      `Fichier manquant: data/third-table-source.json — lancez npm run import-fifa:fetch`
    );
  }
  return JSON.parse(readFileSync(sourcePath, "utf-8"));
}

function buildScenarios(thirdTable) {
  const scenarios = [];

  for (const [concatKey, slotMap] of Object.entries(thirdTable)) {
    const qualified_groups = concatKey.split("");
    if (qualified_groups.length !== 8) continue;

    const mapping = WINNER_LETTERS.map((letter) => `3${slotMap[letter]}`);
    const lexIndex = lexIndexFromGroups(qualified_groups);
    if (lexIndex < 0) {
      throw new Error(`Combinaison inconnue: ${concatKey}`);
    }

    scenarios.push({
      lexIndex,
      fifaNumber: 495 - lexIndex,
      qualified_groups,
      mapping,
    });
  }

  scenarios.sort((a, b) => a.lexIndex - b.lexIndex);

  if (scenarios.length !== 495) {
    throw new Error(`Attendu 495 scénarios, obtenu ${scenarios.length}`);
  }

  return scenarios;
}

function writeOutputs(scenarios) {
  const txtLines = [
    "Groupes qualifiés (8) + mapping 1A→1L (8 créneaux 3X) — 495 combinaisons FIFA",
    ...scenarios.map(
      (s) =>
        `${s.qualified_groups.join("\t")}\t${s.mapping.join("\t")}`
    ),
  ];
  writeFileSync(outTxt, txtLines.join("\n") + "\n");

  return { txtLines: txtLines.length - 1 };
}

const thirdTable = loadThirdTable();
const scenarios = buildScenarios(thirdTable);
const { txtLines } = writeOutputs(scenarios);

console.log(`Import FIFA Annex C : ${scenarios.length} scénarios`);
console.log(`→ ${outTxt} (${txtLines} lignes)`);
console.log(`→ Puis : npm run db:seed`);
