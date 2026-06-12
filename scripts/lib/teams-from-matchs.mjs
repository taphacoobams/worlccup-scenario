/**
 * 48 équipes — IDs 1 à 48 (A1=1 … L4=48), noms depuis matchs.txt
 */
import fs from "fs";
import path from "path";

export const CODE_BY_NAME = {
  Mexique: "MX",
  "Afrique du Sud": "ZA",
  "Corée du Sud": "KR",
  Tchéquie: "CZ",
  Canada: "CA",
  "Bosnie-Herzégovine": "BA",
  Qatar: "QA",
  Suisse: "CH",
  Brésil: "BR",
  Maroc: "MA",
  Haïti: "HT",
  Écosse: "GB-SCT",
  "États-Unis": "US",
  Paraguay: "PY",
  Australie: "AU",
  Turquie: "TR",
  Allemagne: "DE",
  "Côte d'Ivoire": "CI",
  Équateur: "EC",
  Curaçao: "CW",
  "Pays-Bas": "NL",
  Japon: "JP",
  Suède: "SE",
  Tunisie: "TN",
  Belgique: "BE",
  Égypte: "EG",
  Iran: "IR",
  "Nouvelle-Zélande": "NZ",
  Espagne: "ES",
  "Cap-Vert": "CV",
  "Arabie saoudite": "SA",
  Uruguay: "UY",
  France: "FR",
  Sénégal: "SN",
  Irak: "IQ",
  Norvège: "NO",
  Argentine: "AR",
  Algérie: "DZ",
  Autriche: "AT",
  Jordanie: "JO",
  Portugal: "PT",
  "RD Congo": "CD",
  Ouzbékistan: "UZ",
  Colombie: "CO",
  Angleterre: "GB-ENG",
  Croatie: "HR",
  Ghana: "GH",
  Panama: "PA",
};

const SPECIAL = { "GB-SCT": "gb-sct", "GB-ENG": "gb-eng", EU: "eu", UN: "un" };
const FIFA2 = {
  MX: "mx", ZA: "za", KR: "kr", CZ: "cz", CA: "ca", BA: "ba", QA: "qa", CH: "ch",
  BR: "br", MA: "ma", HT: "ht", US: "us", PY: "py", AU: "au", TR: "tr", DE: "de",
  CI: "ci", EC: "ec", CW: "cw", NL: "nl", JP: "jp", SE: "se", TN: "tn", BE: "be",
  EG: "eg", IR: "ir", NZ: "nz", ES: "es", CV: "cv", SA: "sa", UY: "uy", FR: "fr",
  SN: "sn", IQ: "iq", NO: "no", AR: "ar", DZ: "dz", AT: "at", JO: "jo", PT: "pt",
  CD: "cd", UZ: "uz", CO: "co", HR: "hr", PA: "pa", GH: "gh",
};

export function flagUrl(code) {
  const u = code.toUpperCase();
  if (SPECIAL[u]) return `https://flagcdn.com/${SPECIAL[u]}.svg`;
  if (FIFA2[u]) return `https://flagcdn.com/${FIFA2[u]}.svg`;
  if (u.length === 2) return `https://flagcdn.com/${u.toLowerCase()}.svg`;
  return "/placeholder-flag.svg";
}

/** ID 1–48 : groupe A=1-4, B=5-8, …, L=45-48 */
export function teamIdFromGroupPosition(letter, position) {
  const gi = letter.toUpperCase().charCodeAt(0) - 65;
  return gi * 4 + position;
}

export function parseTeamsFromMatchsTxt(text) {
  const teams = [];
  let currentGroup = null;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const g = line.match(/^Groupe\s+([A-L])/i);
    if (g) {
      currentGroup = g[1].toUpperCase();
      continue;
    }
    const row = line.match(/^(\d+)\s+(.+?)\s+0\s+0\s+0\s+0\s+0\s+0\s+0\s+0/);
    if (!row || !currentGroup) continue;

    const position = parseInt(row[1], 10);
    const name = row[2].trim();
    const id = teamIdFromGroupPosition(currentGroup, position);
    const code = CODE_BY_NAME[name] ?? "XX";

    teams.push({
      id,
      name,
      code,
      country: name,
      group: currentGroup,
      logo: flagUrl(code),
    });
  }

  teams.sort((a, b) => a.id - b.id);
  return teams;
}

export function buildGroupsFromTeams(teams) {
  const byGroup = new Map();
  for (const t of teams) {
    if (!byGroup.has(t.group)) byGroup.set(t.group, []);
    byGroup.get(t.group).push(t);
  }

  return [...byGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, groupTeams]) => ({
      letter,
      standings: groupTeams
        .sort((a, b) => a.id - b.id)
        .map((t, i) => ({
          teamId: t.id,
          position: i + 1,
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        })),
    }));
}

export function loadTeamsFromFile(rootDir) {
  const txt = fs.readFileSync(
    path.join(rootDir, "data", "matchs.txt"),
    "utf-8"
  );
  return parseTeamsFromMatchsTxt(txt);
}

export function nameToTeamId(teams, name) {
  const n = name.trim();
  const found = teams.find((t) => t.name === n);
  return found?.id ?? null;
}

