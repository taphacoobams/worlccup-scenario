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
  const maxLen = Math.min(3, Math.floor((n - 1) / 2));
  let fallback: { surnameLen: number; repeatIdx: number } | null = null;

  for (let surnameLen = 1; surnameLen <= maxLen; surnameLen++) {
    const key = nameParts.slice(0, surnameLen).map(normToken).join("|");
    for (let i = surnameLen; i <= n - surnameLen; i++) {
      const candidate = nameParts.slice(i, i + surnameLen).map(normToken).join("|");
      if (candidate !== key || i - surnameLen < 1) continue;

      const hit = { surnameLen, repeatIdx: i };
      if (nameParts.slice(i + surnameLen).length > 0) return hit;
      fallback = hit;
    }
  }

  return fallback;
}

/** Cas FIFA non couverts par l'algorithme standard (ex. RODRI, ABDULAZIZ HATEM). */
function parseManualPlayerName(nameParts: string[]): string | null {
  if (nameParts[0] === "RODRI") return "Rodri";
  if (nameParts[0] === "ABDULAZIZ" && nameParts[1] === "HATEM") return "Abdulaziz Hatem";
  return null;
}

/** Colonne PLAYER NAME — bloc en tête de ligne avant prénoms/nom en minuscules. */
function extractPlayerName(nameParts: string[]): string {
  const manual = parseManualPlayerName(nameParts);
  if (manual) return manual;

  const boundary = findSurnameBoundary(nameParts);
  if (boundary) {
    return nameParts.slice(0, boundary.surnameLen).map(toTitleCase).join(" ");
  }

  const firstLowerIdx = nameParts.findIndex((t) => hasLowercase(t));
  if (firstLowerIdx > 0) {
    return nameParts.slice(0, firstLowerIdx).map(toTitleCase).join(" ");
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

  const playerName = extractPlayerName(nameParts);
  if (!playerName) return null;

  return {
    number: 0,
    positionCode,
    playerName,
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
