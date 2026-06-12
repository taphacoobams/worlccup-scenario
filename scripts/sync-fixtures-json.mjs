/**
 * Génère data/fixtures.json (format LocalFixture) depuis fixtures-all.json + teams.json
 * Usage: node scripts/sync-fixtures-json.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const teams = JSON.parse(readFileSync(join(root, "data", "teams.json"), "utf-8"));
const fixturesAll = JSON.parse(
  readFileSync(join(root, "data", "fixtures-all.json"), "utf-8")
);

const teamByName = new Map(teams.map((t) => [t.name, t.id]));

function resolveTeamId(label) {
  return teamByName.get(label) ?? 0;
}

const fixtures = fixturesAll.matches.map((m) => ({
  id: m.matchNumber,
  date: m.dateGmt,
  timezone: "UTC",
  venue: { name: m.venue, city: m.city },
  round: m.round,
  group: m.group?.toUpperCase() ?? null,
  homeTeamId: resolveTeamId(m.homeTeam),
  awayTeamId: resolveTeamId(m.awayTeam),
  homeTeamName: m.homeTeam,
  awayTeamName: m.awayTeam,
  goals: { home: null, away: null },
  status: "NS",
}));

const out = join(root, "data", "fixtures.json");
writeFileSync(out, JSON.stringify(fixtures, null, 2) + "\n");
console.log(`Écrit ${fixtures.length} matchs → data/fixtures.json`);
