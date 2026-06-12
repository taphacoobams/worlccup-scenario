/**
 * Fusionne les bios Guardian dans players.json (format tableau plat).
 * Usage: npx tsx scripts/merge-guardian-bios.ts
 */
import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import { matchGuardianToPlayer } from "./lib/guardian-player-match";
import { toFifa3Code } from "../lib/fifa-codes";

interface LocalTeam {
  id: number;
  name: string;
  code: string;
}

interface FlatPlayer {
  id: number;
  teamId: number;
  name: string;
  nationality?: string;
  bio?: string;
  bioEn?: string;
  photo: string;
}

interface GuardianTeamData {
  Team: string;
  spreadsheet: string;
}

interface TeamsDataJson {
  sheets: { Teams: GuardianTeamData[] };
}

interface GuardianPlayer {
  name: string;
  bio: string;
}

interface GuardianJsonResponse {
  sheets: Record<string, Record<string, string>[] | undefined>;
}

const TEAM_CODE_MAPPING: Record<string, string> = {
  Czechia: "CZE",
  Mexico: "MEX",
  "South Africa": "RSA",
  "South Korea": "KOR",
  "Bosnia and Herzegovina": "BIH",
  Canada: "CAN",
  Qatar: "QAT",
  Switzerland: "SUI",
  Brazil: "BRA",
  Haiti: "HAI",
  Morocco: "MAR",
  Scotland: "SCO",
  Australia: "AUS",
  Paraguay: "PAR",
  Turkey: "TUR",
  USA: "USA",
  Curaçao: "CUW",
  Ecuador: "ECU",
  Germany: "GER",
  "Côte d'Ivoire": "CIV",
  Japan: "JPN",
  Netherlands: "NED",
  Sweden: "SWE",
  Tunisia: "TUN",
  Belgium: "BEL",
  Egypt: "EGY",
  Iran: "IRN",
  "New Zealand": "NZL",
  "Cape Verde": "CPV",
  "Saudi Arabia": "KSA",
  Spain: "ESP",
  Uruguay: "URU",
  France: "FRA",
  Iraq: "IRQ",
  Norway: "NOR",
  Senegal: "SEN",
  Algeria: "ALG",
  Argentina: "ARG",
  Austria: "AUT",
  Jordan: "JOR",
  Colombia: "COL",
  "DR Congo": "COD",
  Portugal: "POR",
  Uzbekistan: "UZB",
  Croatia: "CRO",
  England: "ENG",
  Ghana: "GHA",
  Panama: "PAN",
};

function findField(row: Record<string, string>, possibleKeys: string[]): string {
  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase().trim();
    for (const possible of possibleKeys) {
      if (lowerKey === possible || lowerKey.includes(possible) || possible.includes(lowerKey)) {
        return row[key] || "";
      }
    }
  }
  return "";
}

function parseGuardianJson(json: GuardianJsonResponse): GuardianPlayer[] {
  const players: GuardianPlayer[] = [];
  let playersData: Record<string, string>[] | undefined;

  if (json.sheets.Players) {
    playersData = json.sheets.Players;
  } else {
    for (const sheetName of Object.keys(json.sheets)) {
      const sheet = json.sheets[sheetName];
      if (sheet?.length && sheet[0]) {
        const keys = Object.keys(sheet[0]).map((k) => k.toLowerCase());
        if (keys.some((k) => k === "name" || k.includes("player"))) {
          playersData = sheet;
          break;
        }
      }
    }
  }

  if (!playersData) return players;

  for (const row of playersData) {
    const name = findField(row, ["name", "player name", "player"]);
    if (!name) continue;
    players.push({
      name: name.trim(),
      bio: findField(row, ["bio", "biography"]),
    });
  }

  return players;
}

function fetchJson(url: string): Promise<GuardianJsonResponse | null> {
  return new Promise((resolve) => {
    https
      .get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } },
        (response) => {
          if (response.statusCode !== 200) {
            resolve(null);
            return;
          }
          let data = "";
          response.on("data", (chunk: Buffer) => (data += chunk));
          response.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          });
          response.on("error", () => resolve(null));
        }
      )
      .on("error", () => resolve(null));
  });
}

async function main() {
  const dataDir = path.join(__dirname, "..", "data");
  const teamsData: TeamsDataJson = JSON.parse(
    fs.readFileSync(path.join(dataDir, "teams-data.json"), "utf-8")
  );
  const teams: LocalTeam[] = JSON.parse(fs.readFileSync(path.join(dataDir, "teams.json"), "utf-8"));
  const players: FlatPlayer[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, "players.json"), "utf-8")
  );

  const byTeamId = new Map<number, FlatPlayer[]>();
  for (const p of players) {
    const list = byTeamId.get(p.teamId) ?? [];
    list.push(p);
    byTeamId.set(p.teamId, list);
  }

  const fifaToTeamId = new Map<string, number>();
  for (const team of teams) {
    fifaToTeamId.set(toFifa3Code(team.code), team.id);
  }

  let guardianTotal = 0;
  let matched = 0;
  let biosAdded = 0;
  const unmatchedGuardian: string[] = [];

  const fetchResults = await Promise.all(
    teamsData.sheets.Teams.map(async (team) => {
      const url = `https://interactive.guim.co.uk/docsdata/${team.spreadsheet}.json`;
      const json = await fetchJson(url);
      return { team, json };
    })
  );

  for (const { team, json } of fetchResults) {
    if (!json) continue;
    const fifaCode = TEAM_CODE_MAPPING[team.Team];
    if (!fifaCode) continue;
    const teamId = fifaToTeamId.get(fifaCode);
    if (!teamId) continue;

    const teamPlayers = byTeamId.get(teamId) ?? [];
    const guardianPlayers = parseGuardianJson(json).filter((gp) => gp.bio?.trim());
    guardianTotal += guardianPlayers.length;

    const claimed = new Set<number>();

    for (const gp of guardianPlayers) {
      const pool = teamPlayers.filter((p) => !claimed.has(p.id));
      const player = matchGuardianToPlayer(gp.name, pool);
      if (!player) {
        unmatchedGuardian.push(`${team.Team}: ${gp.name}`);
        continue;
      }
      matched++;
      claimed.add(player.id);
      player.bioEn = gp.bio;
      player.bio = gp.bio;
      biosAdded++;
    }
  }

  fs.writeFileSync(path.join(dataDir, "players.json"), JSON.stringify(players, null, 2));

  const withoutBio = players.filter((p) => !p.bio?.trim());

  console.log(`Guardian bios (avec texte): ${guardianTotal}`);
  console.log(`Matched: ${matched}`);
  console.log(`Bios assignées: ${biosAdded}`);
  console.log(`Joueurs total: ${players.length}`);
  console.log(`Sans bio: ${withoutBio.length}`);

  if (withoutBio.length > 0) {
    console.log("\nJoueurs sans bio Guardian:");
    withoutBio.slice(0, 30).forEach((p) => console.log(`  - ${p.name} (${p.nationality ?? "?"})`));
    if (withoutBio.length > 30) {
      console.log(`  … et ${withoutBio.length - 30} autres`);
    }
  }

  if (unmatchedGuardian.length > 0) {
    console.log(`\nGuardian non matchés: ${unmatchedGuardian.length}`);
    unmatchedGuardian.slice(0, 15).forEach((n) => console.log(`  - ${n}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
