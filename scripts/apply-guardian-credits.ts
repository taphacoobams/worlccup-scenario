/**
 * Ajoute les crédits Guardian dans teams.json et players.json.
 * Usage: npx tsx scripts/apply-guardian-credits.ts
 */
import * as fs from "fs";
import * as path from "path";
import {
  guardianBioCredit,
  guardianImageCredit,
  GUARDIAN_CREDIT,
  hasGuardianTeamContent,
} from "../lib/credits";
import { extractGuardianGuideUrl } from "../lib/guardian-guides";

const dataDir = path.join(__dirname, "..", "data");

const GUARDIAN_TEAM_TO_FR: Record<string, string> = {
  Czechia: "Tchéquie",
  Mexico: "Mexique",
  "South Africa": "Afrique du Sud",
  "South Korea": "Corée du Sud",
  "Bosnia and Herzegovina": "Bosnie-Herzégovine",
  Canada: "Canada",
  Qatar: "Qatar",
  Switzerland: "Suisse",
  Brazil: "Brésil",
  Haiti: "Haïti",
  Morocco: "Maroc",
  Scotland: "Écosse",
  Australia: "Australie",
  Paraguay: "Paraguay",
  Turkey: "Turquie",
  USA: "États-Unis",
  Curaçao: "Curaçao",
  Ecuador: "Équateur",
  Germany: "Allemagne",
  "Côte d'Ivoire": "Côte d'Ivoire",
  Japan: "Japon",
  Netherlands: "Pays-Bas",
  Sweden: "Suède",
  Tunisia: "Tunisie",
  Belgium: "Belgique",
  Egypt: "Égypte",
  Iran: "Iran",
  "New Zealand": "Nouvelle-Zélande",
  "Cape Verde": "Cap-Vert",
  "Saudi Arabia": "Arabie saoudite",
  Spain: "Espagne",
  Uruguay: "Uruguay",
  France: "France",
  Iraq: "Irak",
  Norway: "Norvège",
  Senegal: "Sénégal",
  Algeria: "Algérie",
  Argentina: "Argentine",
  Austria: "Autriche",
  Jordan: "Jordanie",
  Colombia: "Colombie",
  "DR Congo": "RD Congo",
  Portugal: "Portugal",
  Uzbekistan: "Ouzbékistan",
  Croatia: "Croatie",
  England: "Angleterre",
  Ghana: "Ghana",
  Panama: "Panama",
};

function buildGuideMap(): Map<string, string> {
  const teamsData = JSON.parse(
    fs.readFileSync(path.join(dataDir, "teams-data.json"), "utf-8")
  ) as { sheets: { Teams: { Team: string; Bio?: string }[] } };
  const map = new Map<string, string>();
  for (const row of teamsData.sheets.Teams) {
    const url = extractGuardianGuideUrl(row.Bio ?? "");
    if (!url) continue;
    const frName = GUARDIAN_TEAM_TO_FR[row.Team] ?? row.Team;
    map.set(frName, url);
  }
  return map;
}

type JsonTeam = {
  name?: string;
  bio?: string;
  strengths?: string;
  weaknesses?: string;
  contentCredit?: string | null;
  guardianGuideUrl?: string | null;
};

type JsonPlayer = {
  bio?: string;
  photo?: string;
  bioCredit?: string | null;
  imageCredit?: string | null;
};

function main() {
  const teamsPath = path.join(dataDir, "teams.json");
  const playersPath = path.join(dataDir, "players.json");

  const guideByName = buildGuideMap();
  const teams = JSON.parse(fs.readFileSync(teamsPath, "utf-8")) as JsonTeam[];
  let teamCredits = 0;
  for (const team of teams) {
    team.contentCredit = hasGuardianTeamContent(team) ? GUARDIAN_CREDIT : null;
    team.guardianGuideUrl = team.name ? guideByName.get(team.name) ?? null : null;
    if (team.contentCredit) teamCredits++;
  }
  fs.writeFileSync(teamsPath, JSON.stringify(teams, null, 2) + "\n");

  const players = JSON.parse(fs.readFileSync(playersPath, "utf-8")) as JsonPlayer[];
  let bioCredits = 0;
  let imageCredits = 0;
  for (const player of players) {
    player.bioCredit = guardianBioCredit(player.bio);
    player.imageCredit = guardianImageCredit(player.photo);
    if (player.bioCredit) bioCredits++;
    if (player.imageCredit) imageCredits++;
  }
  fs.writeFileSync(playersPath, JSON.stringify(players, null, 2) + "\n");

  console.log(`Équipes avec crédit Guardian : ${teamCredits}/${teams.length}`);
  console.log(`Joueurs — bio : ${bioCredits}, photo : ${imageCredits}/${players.length}`);
}

main();
