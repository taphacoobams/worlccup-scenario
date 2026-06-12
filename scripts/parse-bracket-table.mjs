/**
 * Régénère data/tableau-final.json depuis matchs.txt (phase finale)
 * ou depuis fixtures-schedule.json si déjà parsé.
 *
 * Usage: node scripts/parse-bracket-table.mjs
 * Préféré : npm run parse-matchs (inclut tableau-final)
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { buildTableauFinal } from "./lib/knockout-tableau.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function fromFixturesSchedule() {
  const schedule = JSON.parse(
    readFileSync(join(root, "data", "fixtures-schedule.json"), "utf8")
  );
  return schedule.matches.filter((m) => m.phase === "knockout");
}

const knockout = fromFixturesSchedule();
if (knockout.length === 0) {
  console.error("Aucun match knockout — lancez d'abord : npm run parse-matchs");
  process.exit(1);
}

const out = buildTableauFinal(
  knockout.map((m) => ({
    matchNumber: m.matchNumber,
    matchId: m.matchId,
    round: m.round,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    dateGmt: m.dateGmt,
    city: m.city,
    venue: m.venue,
  }))
);

writeFileSync(
  join(root, "data", "tableau-final.json"),
  JSON.stringify(out, null, 2) + "\n"
);

for (const r of out.rounds) {
  console.log(`  ${r.label}: ${r.matches.length} matchs`);
}
console.log(`→ data/tableau-final.json`);
