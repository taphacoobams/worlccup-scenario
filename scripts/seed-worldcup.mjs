/**
 * Génère data/worldcup.json — 48 équipes (id 1–48) depuis matchs.txt
 * Usage: node scripts/seed-worldcup.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildGroupsFromTeams,
  loadTeamsFromFile,
} from "./lib/teams-from-matchs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const teams = loadTeamsFromFile(root);
const groups = buildGroupsFromTeams(teams);

const data = {
  updatedAt: new Date().toISOString(),
  teams: teams.map((t) => {
    const { group: _groupLetter, ...rest } = t;
    void _groupLetter;
    return rest;
  }),
  groups,
  fixtures: [],
  players: [],
};

const out = path.join(root, "data", "worldcup.json");
fs.writeFileSync(out, JSON.stringify(data, null, 2), "utf-8");
console.log(`Écrit ${out} — ${teams.length} équipes (id 1–${teams.length})`);
