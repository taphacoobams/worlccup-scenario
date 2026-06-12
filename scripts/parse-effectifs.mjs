/**
 * Convertit un fichier TXT d'effectifs → data/squads.json
 * Usage: node scripts/parse-effectifs.mjs [chemin/vers/effectifs.txt]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CODE_BY_NAME } from "./lib/teams-from-matchs.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const INPUT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, "data", "effectifs.txt");
const OUTPUT = path.join(ROOT, "data", "squads.json");

/** Codes FIFA 3 lettres (sélections) */
const FIFA3 = {
  MX: "MEX",
  ZA: "RSA",
  KR: "KOR",
  CZ: "CZE",
  CA: "CAN",
  BA: "BIH",
  QA: "QAT",
  CH: "SUI",
  BR: "BRA",
  MA: "MAR",
  HT: "HAI",
  "GB-SCT": "SCO",
  US: "USA",
  PY: "PAR",
  AU: "AUS",
  TR: "TUR",
  DE: "GER",
  CW: "CUW",
  CI: "CIV",
  EC: "ECU",
  NL: "NED",
  JP: "JPN",
  SE: "SWE",
  TN: "TUN",
  BE: "BEL",
  EG: "EGY",
  IR: "IRN",
  NZ: "NZL",
  ES: "ESP",
  CV: "CPV",
  SA: "KSA",
  UY: "URU",
  FR: "FRA",
  SN: "SEN",
  IQ: "IRQ",
  NO: "NOR",
  AR: "ARG",
  DZ: "ALG",
  AT: "AUT",
  JO: "JOR",
  PT: "POR",
  CD: "COD",
  UZ: "UZB",
  CO: "COL",
  "GB-ENG": "ENG",
  HR: "CRO",
  GH: "GHA",
  PA: "PAN",
};

const NAME_ALIASES = {
  "République tchèque": "Tchéquie",
  Equateur: "Équateur",
  Egypte: "Égypte",
  "Côte d’Ivoire": "Côte d'Ivoire",
};

const COACH_BY_FIFA = {
  MEX: "Javier Aguirre",
  RSA: "Hugo Broos",
  KOR: "Hong Myung-bo",
  CZE: "Miroslav Koubek",
  BIH: "Sergej Barbarez",
  SCO: "Steve Clarke",
  USA: "Mauricio Pochettino",
  CIV: "Emerse Faé",
  JPN: "Hajime Moriyasu",
  EGY: "Hossam Hassan",
  IRN: "Amir Ghalenoei",
  CPV: "Bubista",
  KSA: "Georgios Donis",
  SEN: "Pape Thiaw",
  NOR: "Ståle Solbakken",
  CRO: "Zlatko Dalić",
  POR: "Roberto Martínez",
  SUI: "Murat Yakin",
  ALG: "Vladimir Petković",
  MAR: "Mohamed Ouahbi",
  JOR: "Jamal Sellami",
  AUS: "Tony Popovic",
  IRQ: "Graham Arnold",
  NED: "Ronald Koeman",
  CUW: "Dick Advocaat",
  ENG: "Thomas Tuchel",
  NZL: "Darren Bazeley",
  BRA: "Carlo Ancelotti",
  TUR: "Vincenzo Montella",
  UZB: "Fabio Cannavaro",
  GER: "Julian Nagelsmann",
  AUT: "Ralf Rangnick",
  ESP: "Luis de la Fuente",
  QAT: "Julen Lopetegui",
  PAN: "Thomas Christiansen",
  FRA: "Didier Deschamps",
  HAI: "Sébastien Migné",
  TUN: "Sabri Lamouchi",
  BEL: "Rudi Garcia",
  COD: "Sébastien Desabre",
  ARG: "Lionel Scaloni",
  PAR: "Gustavo Alfaro",
  ECU: "Sebastián Beccacece",
  URU: "Marcelo Bielsa",
  COL: "Néstor Lorenzo",
};

const POSITION_LINE = /^(Gardiens|Défenseurs|Milieux|Atta(?:u|)quants)\s*:/i;

function resolveFifaCode(teamName) {
  const key = NAME_ALIASES[teamName] ?? teamName;
  const internal = CODE_BY_NAME[key];
  if (!internal) return null;
  return FIFA3[internal] ?? internal;
}

function parsePlayerNames(block) {
  const text = block
    .replace(/\s+et\s+/gi, ", ")
    .replace(/\.\s*$/, "")
    .trim();
  const names = [];
  const re = /([^,]+?)\s*\([^)]*\)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1].trim();
    if (name) names.push(name);
  }
  return names;
}

function parseEffectifs(text) {
  const teams = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^Groupe\s+[A-L]\b/i.test(line)) continue;

    const posMatch = line.match(POSITION_LINE);
    if (posMatch) {
      if (!current) continue;
      const rest = line.slice(posMatch[0].length).trim();
      current.players.push(...parsePlayerNames(rest));
      continue;
    }

    if (current) teams.push(current);
    const code = resolveFifaCode(line);
    if (!code) {
      console.warn(`Équipe non reconnue: "${line}"`);
      current = null;
      continue;
    }
    current = {
      code,
      coach: COACH_BY_FIFA[code] ?? "",
      players: [],
    };
    currentPos = null;
  }
  if (current) teams.push(current);

  return { teams };
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error(`Fichier introuvable: ${INPUT}`);
    console.error("Usage: node scripts/parse-effectifs.mjs <fichier-effectifs.txt>");
    process.exit(1);
  }
  const text = fs.readFileSync(INPUT, "utf-8");
  const data = parseEffectifs(text);
  fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2) + "\n", "utf-8");
  console.log(`✓ ${data.teams.length} équipes → ${OUTPUT}`);
  const missingCoach = data.teams.filter((t) => !t.coach).map((t) => t.code);
  if (missingCoach.length) {
    console.warn(`Sans sélectionneur (${missingCoach.length}):`, missingCoach.join(", "));
  }
}

main();
