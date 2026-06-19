/**
 * Parse data/players.txt (liste officielle FIFA) → players.json + squads.json
 * Usage: npx tsx scripts/parse-players-txt.ts
 */
import * as fs from "fs";
import * as path from "path";
import { FIFA3_TO_INTERNAL } from "../lib/fifa-codes";

interface ParsedPlayer {
  number: number;
  positionCode: string;
  playerName: string;
  firstName: string;
  lastName: string;
  nameOnShirt: string;
  dob: string;
  club: string;
  heightCm: number;
}

interface ParsedTeam {
  code: string;
  country: string;
  coach: string;
  players: ParsedPlayer[];
}

interface TeamsJsonTeam {
  id: number;
  name: string;
  code: string;
  group: string | null;
}

interface LocalPlayer {
  id: number;
  teamId: number;
  name: string;
  nameOnShirt: string;
  number: number | null;
  position: string;
  positionCode: string;
  club: string;
  age: number | null;
  nationality: string;
  photo: string;
  dob: string;
  heightCm: number;
  bio?: string;
  bioCredit?: string | null;
  imageCredit?: string | null;
}

interface SquadsByPosition {
  GK: string[];
  DF: string[];
  MF: string[];
  FW: string[];
}

const POSITION_FR: Record<string, string> = {
  GK: "Gardien",
  DF: "Défenseur",
  MF: "Milieu",
  FW: "Attaquant",
};

const POSITION_REGEX = /^(GK|DF|MF|FW)\s+/;
const DOB_REGEX = /(\d{2}\/\d{2}\/\d{4})/;
const HEIGHT_REGEX = /\s(\d{3})$/;
const TEAM_HEADER_REGEX = /^([A-Za-zÀ-ÿ\s\-'']+)\s*\(([A-Z]{3})\)$/;

const NOISE_PATTERNS = [
  /^#\s*POS\s+PLAYER\s+NAME/i,
  /^ROLE\s+COACH\s+NAME/i,
  /^Head\s+coach\s+/i,
  /^DOB\s+Date\s+of\s+birth/i,
  /^(Tuesday|Monday|Wednesday|Thursday|Friday|Saturday|Sunday),/i,
  /^FIFA\s+World\s+Cup/i,
  /^\d{1,2}\s+June\s+\d{4}/i,
  /^SQUAD\s+LIST$/i,
  /^Version\s+\d+/i,
  /^Page\s+\d+\s*\/\s*\d+/i,
  /^\d{1,2}$/,
];

function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return NOISE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function toTitleCase(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((word) => {
      if (word.match(/^\s+$/) || word === "-") return word;
      if (!word.length) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}

function isAllCapsToken(token: string): boolean {
  return token === token.toUpperCase() && /[A-Z]/.test(token);
}

function hasLowercase(token: string): boolean {
  return /[a-zàâäéèêëïîôùûüÿœæç]/.test(token);
}

function normToken(token: string): string {
  return token
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`´]/g, "")
    .toUpperCase();
}

function findSurnameBoundary(
  nameParts: string[]
): { surnameLen: number; repeatIdx: number } | null {
  const n = nameParts.length;
  const firstLowerIdx = nameParts.findIndex((t) => hasLowercase(t));
  
  if (firstLowerIdx <= 0) return null;

  const maxLen = Math.min(3, Math.floor((n - firstLowerIdx - 1) / 2));
  let bestHit: { surnameLen: number; repeatIdx: number } | null = null;

  // Try all possible surname lengths, prefer the longest valid match
  // Only look for repeats AFTER the first names (after firstLowerIdx)
  for (let surnameLen = maxLen; surnameLen >= 1; surnameLen--) {
    // Start looking from after the first names
    for (let i = firstLowerIdx + 1; i <= n - surnameLen; i++) {
      const candidate = nameParts.slice(i, i + surnameLen).map(normToken).join("|");
      
      // Look for this sequence repeating later
      for (let j = i + surnameLen; j <= n - surnameLen; j++) {
        const repeat = nameParts.slice(j, j + surnameLen).map(normToken).join("|");
        if (candidate === repeat) {
          return { surnameLen, repeatIdx: j };
        }
      }
    }
  }

  return bestHit;
}

function findShirtNameBoundary(
  nameParts: string[]
): { shirtNameLen: number; repeatIdx: number } | null {
  const n = nameParts.length;
  // The shirt name is at the beginning (caps), look for it repeating at the end
  // Find the first caps segment (shirt name)
  let shirtNameEndIdx = 0;
  for (let i = 0; i < n; i++) {
    if (isAllCapsToken(nameParts[i]) && !hasLowercase(nameParts[i])) {
      shirtNameEndIdx = i + 1;
    } else {
      break;
    }
  }

  if (shirtNameEndIdx === 0) return null;

  const shirtName = nameParts.slice(0, shirtNameEndIdx).map(normToken).join("|");
  
  // Look for this shirt name repeating at the end
  for (let repeatLen = shirtNameEndIdx; repeatLen >= 1; repeatLen--) {
    const shirtNamePrefix = nameParts.slice(0, repeatLen).map(normToken).join("|");
    for (let i = n - repeatLen; i >= shirtNameEndIdx; i--) {
      const candidate = nameParts.slice(i, i + repeatLen).map(normToken).join("|");
      if (candidate === shirtNamePrefix) {
        return { shirtNameLen: repeatLen, repeatIdx: i };
      }
    }
  }

  return null;
}

/** Cas FIFA non couverts par l'algorithme standard (ex. RODRI, ABDULAZIZ HATEM). */
function parseManualPlayerName(nameParts: string[]): string | null {
  if (nameParts[0] === "RODRI") return "Rodri";
  if (nameParts[0] === "ABDULAZIZ" && nameParts[1] === "HATEM") return "Abdulaziz Hatem";
  return null;
}

/** Préfixes de noms courants (particules) qui font partie du nom de famille */
const SURNAME_PREFIXES = new Set([
  "VAN", "DE", "DER", "DEN", "VON", "DI", "DA", "DEL", "DELA", "AL", "EL", "BIN", "IBN"
]);

/** Colonne PLAYER NAME — bloc en tête de ligne avant prénoms/nom en minuscules. */
function extractPlayerName(nameParts: string[]): string {
  const manual = parseManualPlayerName(nameParts);
  if (manual) return manual;

  const boundary = findSurnameBoundary(nameParts);
  if (boundary) {
    // If the boundary is just a surname prefix (Van, De, etc.), extend it to include the next token
    if (boundary.surnameLen === 1 && SURNAME_PREFIXES.has(nameParts[0].toUpperCase())) {
      const extendedName = nameParts.slice(0, Math.min(2, nameParts.length)).map(toTitleCase).join(" ");
      return extendedName;
    }
    return nameParts.slice(0, boundary.surnameLen).map(toTitleCase).join(" ");
  }

  const firstLowerIdx = nameParts.findIndex((t) => hasLowercase(t));
  if (firstLowerIdx > 0) {
    // Include surname prefixes (Van, De, etc.) with the surname
    let endIdx = firstLowerIdx;
    // If the token before the first lowercase is a surname prefix, include the next uppercase token too
    if (endIdx > 1 && SURNAME_PREFIXES.has(nameParts[endIdx - 1].toUpperCase())) {
      // Look ahead to see if there's another uppercase token after the prefix
      let i = endIdx;
      while (i < nameParts.length && isAllCapsToken(nameParts[i]) && !hasLowercase(nameParts[i])) {
        endIdx = i + 1;
        i++;
      }
    }
    return nameParts.slice(0, endIdx).map(toTitleCase).join(" ");
  }

  const caps: string[] = [];
  for (const t of nameParts) {
    if (isAllCapsToken(t) && !hasLowercase(t)) caps.push(t);
    else break;
  }
  return (caps.length ? caps : [nameParts[0] ?? ""]).map(toTitleCase).join(" ");
}

function parsePlayerLine(line: string): ParsedPlayer | null {
  const trimmed = line.trim();
  const posMatch = trimmed.match(POSITION_REGEX);
  if (!posMatch) return null;

  const positionCode = posMatch[1];
  const afterPos = trimmed.substring(posMatch[0].length);
  const dobMatch = afterPos.match(DOB_REGEX);
  if (!dobMatch) return null;

  const dob = dobMatch[1];
  const dobIndex = afterPos.indexOf(dob);
  const nameSection = afterPos.substring(0, dobIndex).trim();
  const afterDob = afterPos.substring(dobIndex + dob.length).trim();
  const heightMatch = afterDob.match(HEIGHT_REGEX);
  if (!heightMatch) return null;

  const heightCm = parseInt(heightMatch[1], 10);
  const club = afterDob.substring(0, afterDob.length - heightMatch[0].length).trim();

  const nameParts = nameSection.split(/\s+/).filter(Boolean);
  if (nameParts.length < 2) return null;

  // Extract shirt name (first caps segment at the beginning)
  let nameOnShirt = "";
  let shirtNameEndIdx = 0;
  for (let i = 0; i < nameParts.length; i++) {
    if (isAllCapsToken(nameParts[i]) && !hasLowercase(nameParts[i])) {
      shirtNameEndIdx = i + 1;
    } else {
      break;
    }
  }
  nameOnShirt = nameParts.slice(0, shirtNameEndIdx).map(toTitleCase).join(" ");

  // Extract first name(s) and last name(s) from the FIFA format
  // Format: SHIRT_NAME (caps) FIRST_NAME(S) (mixed case) LAST_NAME(S) (caps) SHIRT_NAME (repeat)
  // We need FIRST_NAME(S) + LAST_NAME(S), skipping the initial SHIRT_NAME and final repeat
  const shirtBoundary = findShirtNameBoundary(nameParts);
  const surnameBoundary = findSurnameBoundary(nameParts);
  const firstLowerIdx = nameParts.findIndex((t) => hasLowercase(t));
  let firstName = "";
  let lastName = "";

  if (firstLowerIdx > 0) {
    // First names are from firstLowerIdx to the next all-caps section
    let firstNameEndIdx = firstLowerIdx;
    for (let i = firstLowerIdx; i < nameParts.length; i++) {
      if (hasLowercase(nameParts[i])) {
        firstNameEndIdx = i + 1;
      } else {
        break;
      }
    }

    const firstNameParts = nameParts.slice(firstLowerIdx, firstNameEndIdx);
    // Remove duplicates from first names (e.g., "Virgil Virgil" -> "Virgil", "Jan Paul Jan-Paul" -> "Jan Paul")
    const dedupedFirstNameParts: string[] = [];
    for (let i = 0; i < firstNameParts.length; i++) {
      const current = firstNameParts[i].toLowerCase().replace(/-/g, '');
      let isDuplicate = false;
      for (const existing of dedupedFirstNameParts) {
        const existingNorm = existing.toLowerCase().replace(/-/g, '');
        // Check if exact match or if one is substring of the other
        if (existingNorm === current || existingNorm.includes(current) || current.includes(existingNorm)) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        dedupedFirstNameParts.push(firstNameParts[i]);
      }
    }
    firstName = dedupedFirstNameParts.map(toTitleCase).join(" ");

    // Last name is the caps segment after first names
    // Use shirt boundary or surname boundary to determine where the last name ends
    let lastNameStartIdx = firstNameEndIdx;
    let lastNameEndIdx = firstNameEndIdx;

    // Find the first caps segment after first names
    for (let i = lastNameStartIdx; i < nameParts.length; i++) {
      if (isAllCapsToken(nameParts[i]) && !hasLowercase(nameParts[i])) {
        lastNameStartIdx = i;
        break;
      }
    }

    // Try surname boundary first (for cases like Netherlands where surname repeats)
    if (surnameBoundary && surnameBoundary.repeatIdx > lastNameStartIdx) {
      lastNameEndIdx = surnameBoundary.repeatIdx;
    }
    // Try shirt boundary (for cases like Belgium where shirt name repeats)
    else if (shirtBoundary && shirtBoundary.repeatIdx > lastNameStartIdx) {
      lastNameEndIdx = shirtBoundary.repeatIdx;
    }
    // No boundary, take only the FIRST caps token (the last name)
    else {
      lastNameEndIdx = lastNameStartIdx + 1;
    }

    lastName = nameParts.slice(lastNameStartIdx, lastNameEndIdx).map(toTitleCase).join(" ");
  } else {
    // No lowercase found, use the old logic (single name or all caps)
    lastName = extractPlayerName(nameParts) || "";
  }

  // Full name is first name + last name
  const playerName = firstName && lastName ? `${firstName} ${lastName}` : (lastName || firstName);

  if (!playerName) return null;

  return {
    number: 0,
    positionCode,
    playerName,
    firstName,
    lastName,
    nameOnShirt,
    dob,
    club,
    heightCm,
  };
}

function parseCoachLine(line: string): string {
  const match = line.match(/^Head\s+coach\s+(\S+)\s+(\S+)/i);
  if (match) {
    return `${toTitleCase(match[2])} ${toTitleCase(match[1])}`;
  }
  return "";
}

export function parsePlayersFile(filePath: string): {
  teams: ParsedTeam[];
  failedLines: string[];
} {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const teams: ParsedTeam[] = [];
  const failedLines: string[] = [];
  let currentTeam: ParsedTeam | null = null;
  let playerNumber = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const teamMatch = trimmed.match(TEAM_HEADER_REGEX);
    if (teamMatch) {
      if (currentTeam && currentTeam.players.length > 0) {
        teams.push(currentTeam);
      }
      currentTeam = {
        country: teamMatch[1].trim(),
        code: teamMatch[2],
        coach: "",
        players: [],
      };
      playerNumber = 0;
      continue;
    }

    if (trimmed.match(/^Head\s+coach\s+/i) && currentTeam) {
      currentTeam.coach = parseCoachLine(trimmed);
      continue;
    }

    if (isNoiseLine(trimmed)) continue;

    const player = parsePlayerLine(trimmed);
    if (player && currentTeam) {
      playerNumber++;
      player.number = playerNumber;
      currentTeam.players.push(player);
    } else if (POSITION_REGEX.test(trimmed) && currentTeam) {
      failedLines.push(trimmed);
    }
  }

  if (currentTeam && currentTeam.players.length > 0) {
    teams.push(currentTeam);
  }

  return { teams, failedLines };
}

function ageFromDob(dob: string): number | null {
  const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const birth = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const ref = new Date(2026, 5, 11);
  let age = ref.getFullYear() - birth.getFullYear();
  const md = ref.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && ref.getDate() < birth.getDate())) age--;
  return age;
}

function playerPhotoPath(code: string, shirtName: string): string {
  const slug = shirtName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `/players/${code.toLowerCase()}/${slug}.jpg`;
}

function buildExports(
  parsedTeams: ParsedTeam[],
  teamsJson: TeamsJsonTeam[]
): {
  localPlayers: LocalPlayer[];
  squads: { teams: { code: string; coach: string; players: SquadsByPosition }[] };
} {
  const localPlayers: LocalPlayer[] = [];
  const squads: { code: string; coach: string; players: SquadsByPosition }[] = [];
  let globalId = 1;

  for (const pt of parsedTeams) {
    const internal = FIFA3_TO_INTERNAL[pt.code];
    const team = teamsJson.find((t) => t.code.toUpperCase() === internal);
    if (!team) {
      console.warn(`  Équipe introuvable pour ${pt.code} (${internal})`);
      continue;
    }

    const byPos: SquadsByPosition = { GK: [], DF: [], MF: [], FW: [] };

    for (const p of pt.players) {
      const posKey = p.positionCode as keyof SquadsByPosition;
      if (byPos[posKey]) byPos[posKey].push(p.playerName);

      localPlayers.push({
        id: globalId++,
        teamId: team.id,
        name: p.playerName,
        nameOnShirt: p.nameOnShirt,
        number: p.number,
        position: POSITION_FR[p.positionCode] ?? p.positionCode,
        positionCode: p.positionCode,
        club: p.club,
        age: ageFromDob(p.dob),
        nationality: team.name,
        photo: playerPhotoPath(pt.code, p.playerName),
        dob: p.dob,
        heightCm: p.heightCm,
      });
    }

    squads.push({
      code: pt.code,
      coach: pt.coach,
      players: byPos,
    });
  }

  return { localPlayers, squads: { teams: squads } };
}

function main() {
  const dataDir = path.join(__dirname, "..", "data");
  const playersPath = path.join(dataDir, "players.txt");
  const teamsPath = path.join(dataDir, "teams.json");
  const playersOut = path.join(dataDir, "players.json");
  const squadsOut = path.join(dataDir, "squads.json");

  console.log("=== Parse FIFA players.txt ===\n");

  const { teams: parsedTeams, failedLines } = parsePlayersFile(playersPath);
  const teamsJson = JSON.parse(fs.readFileSync(teamsPath, "utf-8")) as TeamsJsonTeam[];

  const parsedCount = parsedTeams.reduce((n, t) => n + t.players.length, 0);

  const sen = parsedTeams.find((t) => t.code === "SEN");
  const diouf = sen?.players.find((p) => p.playerName === "Diouf" && p.positionCode === "DF");
  if (diouf) {
    console.log(`Ex. SEN défenseur: ${diouf.playerName}`);
  }

  const { localPlayers, squads } = buildExports(parsedTeams, teamsJson);

  const existingPlayers = fs.existsSync(playersOut)
    ? (JSON.parse(fs.readFileSync(playersOut, "utf-8")) as LocalPlayer[])
    : [];
  const existingById = new Map(existingPlayers.map((p) => [p.id, p]));
  for (const p of localPlayers) {
    const prev = existingById.get(p.id);
    if (prev?.bio) p.bio = prev.bio;
    if (prev?.photo) p.photo = prev.photo;
    if (prev?.bioCredit) p.bioCredit = prev.bioCredit;
    if (prev?.imageCredit) p.imageCredit = prev.imageCredit;
  }

  fs.writeFileSync(playersOut, JSON.stringify(localPlayers, null, 2) + "\n");
  fs.writeFileSync(squadsOut, JSON.stringify(squads, null, 2) + "\n");

  console.log(`Équipes: ${parsedTeams.length}`);
  console.log(`Joueurs parsés: ${parsedCount}`);
  console.log(`Joueurs exportés: ${localPlayers.length}`);
  if (failedLines.length > 0) {
    console.warn(`Lignes non parsées: ${failedLines.length}`);
    failedLines.forEach((l) => console.warn(`  - ${l.slice(0, 120)}`));
  }
  if (parsedCount !== localPlayers.length) {
    console.warn(`Écart export: ${parsedCount - localPlayers.length} joueur(s) (équipe introuvable dans teams.json)`);
  }
  console.log(`→ ${playersOut}`);
  console.log(`→ ${squadsOut}`);
}

main();
