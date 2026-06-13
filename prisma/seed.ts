/**
 * Importe data/*.json → PostgreSQL
 * Usage: npm run db:setup
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  guardianBioCredit,
  guardianImageCredit,
  GUARDIAN_CREDIT,
  hasGuardianTeamContent,
} from "../lib/credits";
import { toFifa3Code } from "../lib/fifa-codes";
import {
  buildFifaRowsFromThirdTable,
  type FifaThirdTable,
} from "../lib/fifa-third-table";
import { getStadiumPublicPath } from "../lib/stadium-images";

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), "data");

function readData<T>(file: string, fallback?: T): T {
  const filePath = path.join(dataDir, file);
  if (!existsSync(filePath)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Fichier manquant: data/${file}`);
  }
  return JSON.parse(readFileSync(filePath, "utf-8")) as T;
}

function teamSlug(name: string, code: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || code.toLowerCase();
}

function parseDob(dob?: string): Date | null {
  if (!dob) return null;
  const m = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00.000Z`);
}

type JsonTeam = {
  id: number;
  name: string;
  code: string;
  group: string | null;
  fifaRanking?: number;
  coach?: string;
  bio?: string;
  strengths?: string;
  weaknesses?: string;
  playerPick?: string;
  contentCredit?: string | null;
};

type JsonPlayer = {
  id: number;
  teamId: number;
  name: string;
  number: number | null;
  position: string;
  positionCode?: string;
  club: string;
  age: number | null;
  nationality: string;
  photo: string;
  dob?: string;
  heightCm?: number;
  bio?: string;
  bioEn?: string;
  bioCredit?: string | null;
  imageCredit?: string | null;
};

type JsonStanding = {
  teamId: number;
  teamName?: string;
  group?: string;
  position: number;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type JsonGroup = {
  letter: string;
  standings: Omit<JsonStanding, "group">[];
};

function loadGroupsJson(): JsonGroup[] {
  const raw = readData<unknown>("groups.json");
  if (Array.isArray(raw)) return raw as JsonGroup[];
  return (raw as { groups: JsonGroup[] }).groups;
}

function loadStandingsJson(): JsonStanding[] {
  const groups = loadGroupsJson();
  return groups.flatMap((g) =>
    g.standings.map((s) => ({ ...s, group: g.letter.toUpperCase() }))
  );
}

type FixturesAllFile = {
  matches: {
    phase: string;
    matchNumber: number;
    group?: string;
    round: string;
    homeTeam: string;
    awayTeam: string;
    dateGmt: string;
    city: string;
    venue: string;
  }[];
};

function resolveTeamLegacyId(
  label: string,
  byName: Map<string, number>
): { legacyId: number | null; slot: string | null } {
  const trimmed = label.trim();
  if (byName.has(trimmed)) {
    return { legacyId: byName.get(trimmed)!, slot: null };
  }
  return { legacyId: null, slot: trimmed };
}

async function main() {
  const teamsJson = readData<JsonTeam[]>("teams.json").sort((a, b) =>
    a.name.localeCompare(b.name, "fr")
  );
  const playersJson = readData<JsonPlayer[]>("players.json");
  const standingsJson = loadStandingsJson();
  const fixturesAll = readData<FixturesAllFile>("fixtures-all.json");

  console.log("Nettoyage des tables…");
  await prisma.card.deleteMany();
  await prisma.assist.deleteMany();
  await prisma.scorer.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.groupStanding.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.tournamentMeta.deleteMany();
  await prisma.fifaThirdPlaceScenario.deleteMany();

  const teamIdByLegacy = new Map<number, string>();
  const playerIdByLegacy = new Map<number, string>();
  const teamByName = new Map(teamsJson.map((t) => [t.name, t.id]));

  console.log(`Équipes (${teamsJson.length})…`);
  for (const t of teamsJson) {
    const created = await prisma.team.create({
      data: {
        legacyId: t.id,
        name: t.name,
        code: t.code.toUpperCase(),
        fifaCode: toFifa3Code(t.code),
        country: t.name,
        group: t.group?.toUpperCase() ?? "A",
        slug: teamSlug(t.name, t.code),
        fifaRanking: t.fifaRanking ?? null,
        coach: t.coach ?? null,
        bio: t.bio ?? null,
        strengths: t.strengths ?? null,
        weaknesses: t.weaknesses ?? null,
        playerPick: t.playerPick ?? null,
        contentCredit:
          t.contentCredit ??
          (hasGuardianTeamContent(t) ? GUARDIAN_CREDIT : null),
      },
    });
    teamIdByLegacy.set(t.id, created.id);
  }

  const playersSorted = [...playersJson].sort((a, b) => {
    const teamA = teamsJson.find((t) => t.id === a.teamId)?.name ?? "";
    const teamB = teamsJson.find((t) => t.id === b.teamId)?.name ?? "";
    return teamA.localeCompare(teamB, "fr") || a.name.localeCompare(b.name, "fr");
  });

  console.log(`Joueurs (${playersSorted.length})…`);
  for (const p of playersSorted) {
    const teamDbId = teamIdByLegacy.get(p.teamId);
    if (!teamDbId) {
      console.warn(`  Équipe introuvable pour joueur ${p.name} (teamId=${p.teamId})`);
      continue;
    }
    const created = await prisma.player.create({
      data: {
        legacyId: p.id,
        teamId: teamDbId,
        name: p.name,
        number: p.number,
        position: p.position,
        positionCode: p.positionCode ?? null,
        club: p.club || null,
        age: p.age,
        nationality: p.nationality || null,
        image: p.photo || null,
        dateOfBirth: parseDob(p.dob),
        heightCm: p.heightCm ?? null,
        bio: p.bio ?? null,
        bioEn: p.bioEn ?? null,
        bioCredit: p.bioCredit ?? guardianBioCredit(p.bio),
        imageCredit: p.imageCredit ?? guardianImageCredit(p.photo),
      },
    });
    playerIdByLegacy.set(p.id, created.id);
  }

  console.log(`Classements (${standingsJson.length})…`);
  for (const s of standingsJson) {
    const teamDbId = teamIdByLegacy.get(s.teamId);
    if (!teamDbId) continue;
    await prisma.groupStanding.create({
      data: {
        teamId: teamDbId,
        group: (s.group ?? "A").toUpperCase(),
        position: s.position,
        played: s.played,
        won: s.won,
        drawn: s.draw,
        lost: s.lost,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDiff: s.goalDifference,
        points: s.points,
      },
    });
  }

  const venueCache = new Map<string, string>();
  async function getVenueId(name: string, city: string): Promise<string> {
    const key = `${name}|${city}`;
    const cached = venueCache.get(key);
    if (cached) return cached;
    const image = getStadiumPublicPath(name);
    const v = await prisma.venue.upsert({
      where: { name_city: { name, city } },
      create: { name, city, country: "", image },
      update: image ? { image } : {},
    });
    venueCache.set(key, v.id);
    return v.id;
  }

  console.log(`Matchs (${fixturesAll.matches.length})…`);
  for (const m of fixturesAll.matches) {
    const home = resolveTeamLegacyId(m.homeTeam, teamByName);
    const away = resolveTeamLegacyId(m.awayTeam, teamByName);
    const venueId = await getVenueId(m.venue, m.city);

    await prisma.fixture.create({
      data: {
        legacyId: m.matchNumber,
        matchNumber: m.matchNumber,
        stage: m.phase,
        group: m.group?.toUpperCase() ?? null,
        round: m.round,
        date: new Date(m.dateGmt),
        timezone: "UTC",
        venueId,
        homeTeamId: home.legacyId ? teamIdByLegacy.get(home.legacyId) ?? null : null,
        awayTeamId: away.legacyId ? teamIdByLegacy.get(away.legacyId) ?? null : null,
        homeSlotLabel: home.slot,
        awaySlotLabel: away.slot,
        homeScore: null,
        awayScore: null,
        status: "NS",
      },
    });
  }

  const thirdTable = readData<FifaThirdTable>("third-table-source.json");
  const fifaRows = buildFifaRowsFromThirdTable(thirdTable);
  console.log(`Scénarios FIFA (${fifaRows.length})…`);
  await prisma.fifaThirdPlaceScenario.createMany({
    data: fifaRows.map((s) => ({
      lexIndex: s.lexIndex,
      fifaNumber: s.fifaNumber,
      qualifiedGroups: s.qualifiedGroups,
      mapping: s.mapping,
    })),
  });

  await prisma.tournamentMeta.create({
    data: {
      key: "main",
      value: {
        name: "Coupe du Monde FIFA 2026",
        updatedAt: new Date().toISOString(),
        teams: teamsJson.length,
        players: playersJson.length,
        fixtures: fixturesAll.matches.length,
        fifaThirdPlaceScenarios: fifaRows.length,
      },
    },
  });

  console.log("\nSeed terminé.");
  console.log(`Teams imported: ${teamsJson.length}`);
  console.log(`Players imported: ${playersJson.length}`);
  console.log(`Fixtures imported: ${fixturesAll.matches.length}`);
  console.log(`Standings imported: ${standingsJson.length}`);
  console.log("Résultats matchs : data/results.json + npx tsx scripts/apply-matchday-events.ts");
  console.log(`FIFA third-place scenarios: ${fifaRows.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
