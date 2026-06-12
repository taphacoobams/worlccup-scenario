/**
 * Génère data/tableau-final.json depuis fixtures-knockout.json
 * Usage: node scripts/sync-tableau-final.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { buildTableauFinal } from "./lib/knockout-tableau.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const knockout = JSON.parse(
  readFileSync(join(root, "data", "fixtures-knockout.json"), "utf-8")
);

const out = buildTableauFinal(knockout.matches);
writeFileSync(
  join(root, "data", "tableau-final.json"),
  JSON.stringify(out, null, 2) + "\n"
);

console.log(
  `Écrit data/tableau-final.json — ${knockout.matches.length} matchs, ${out.rounds.length} tours`
);
