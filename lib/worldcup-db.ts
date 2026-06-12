import "server-only";

import { toFifa3Code } from "@/lib/fifa-codes";
import { prisma } from "@/lib/prisma";
import type {
  ManualFixture,
  ManualFixtureStatus,
  ManualGroup,
  ManualPlayer,
  ManualTeam,
  WorldCupManualData,
} from "@/types/worldcup-manual";
import type { MatchEvent } from "@/types/match-events";
import {
  isMatchEventType,
  migrateLegacyEvent,
} from "@/lib/tournament-engine/events";

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

const VALID_STATUSES = new Set<ManualFixtureStatus>([
  "NS",
  "FT",
  "HT",
  "PST",
  "CANC",
  "AET",
  "PEN",
]);

function toManualStatus(status: string): ManualFixtureStatus {
  const u = status.toUpperCase() as ManualFixtureStatus;
  return VALID_STATUSES.has(u) ? u : "NS";
}

type DbMatchEventRow = {
  id: string;
  minute: number | null;
  extraMinute: number | null;
  type: string;
  description: string | null;
  playerName: string | null;
  assistName: string | null;
  linkedGoalId: string | null;
  createdAt: Date;
  team: { legacyId: number; code: string } | null;
  player: { legacyId: number } | null;
};

function dbRowToMatchEvents(
  e: DbMatchEventRow,
  teams: ManualTeam[],
  players: ManualPlayer[]
): MatchEvent[] {
  const type = e.type.toLowerCase();
  const teamCode = e.team?.code ?? "";

  if (isMatchEventType(type)) {
    return [
      {
        id: e.id,
        minute: e.minute ?? 0,
        addedTime: e.extraMinute ?? undefined,
        type,
        playerId:
          e.player?.legacyId != null ? String(e.player.legacyId) : "",
        playerName: e.playerName ?? "?",
        teamCode,
        linkedGoalId: e.linkedGoalId ?? undefined,
        isOwnGoal: /own\s*goal|csc/i.test(e.description ?? "")
          ? true
          : undefined,
        createdAt: e.createdAt.toISOString(),
      },
    ];
  }

  return migrateLegacyEvent(
    {
      id: e.id,
      time: { elapsed: e.minute, extra: e.extraMinute },
      teamId: e.team?.legacyId ?? 0,
      playerName: e.playerName,
      assistName: e.assistName,
      type: e.type,
      detail: e.description ?? "",
      createdAt: e.createdAt.toISOString(),
    },
    teams,
    players
  );
}

export async function loadWorldCupFromDb(): Promise<WorldCupManualData> {
  const [meta, dbTeams, standings, fixtures, players] = await Promise.all([
    prisma.tournamentMeta.findUnique({ where: { key: "main" } }),
    prisma.team.findMany({ orderBy: { name: "asc" } }),
    prisma.groupStanding.findMany({
      orderBy: [{ group: "asc" }, { position: "asc" }],
    }),
    prisma.fixture.findMany({
      include: {
        venue: true,
        homeTeam: true,
        awayTeam: true,
        events: {
          orderBy: [{ minute: "asc" }, { extraMinute: "asc" }],
          include: { team: true, player: true },
        },
      },
      orderBy: { legacyId: "asc" },
    }),
    prisma.player.findMany({
      orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  const teams: ManualTeam[] = dbTeams.map((t) => ({
    id: t.legacyId,
    name: t.name,
    code: t.code,
    country: t.country || t.name,
    coach: t.coach ? { name: t.coach } : undefined,
  }));

  const groupsByLetter = new Map<string, ManualGroup>();
  for (const row of standings) {
    const team = dbTeams.find((t) => t.id === row.teamId);
    if (!team) continue;
    const letter = row.group.toUpperCase();
    if (!groupsByLetter.has(letter)) {
      groupsByLetter.set(letter, { letter, standings: [] });
    }
    groupsByLetter.get(letter)!.standings.push({
      teamId: team.legacyId,
      position: row.position,
      played: row.played,
      won: row.won,
      draw: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDiff,
      points: row.points,
    });
  }

  const manualPlayers: ManualPlayer[] = players.map((p) => {
    const team = dbTeams.find((t) => t.id === p.teamId);
    return {
      id: p.legacyId,
      name: p.name,
      teamId: team?.legacyId ?? 0,
      number: p.number,
      position: p.position ?? undefined,
      nationality: p.nationality ?? undefined,
      age: p.age ?? undefined,
      photo: p.image ?? undefined,
    };
  });

  const manualFixtures: ManualFixture[] = fixtures.map((f) => ({
    id: f.legacyId,
    date: f.date.toISOString(),
    timezone: f.timezone,
    venue: {
      name: f.venue?.name ?? "",
      city: f.venue?.city ?? "",
    },
    round: f.round ?? f.stage,
    group: f.group,
    homeTeamId: f.homeTeam?.legacyId ?? 0,
    awayTeamId: f.awayTeam?.legacyId ?? 0,
    homeTeam: f.homeSlotLabel ?? undefined,
    awayTeam: f.awaySlotLabel ?? undefined,
    goals: { home: f.homeScore, away: f.awayScore },
    status: toManualStatus(f.status),
    events: f.events.flatMap((e) =>
      dbRowToMatchEvents(e as DbMatchEventRow, teams, manualPlayers)
    ),
  }));

  const metaValue = meta?.value as { updatedAt?: string } | undefined;

  return {
    updatedAt:
      metaValue?.updatedAt ??
      meta?.updatedAt.toISOString() ??
      new Date().toISOString(),
    teams,
    groups: [...groupsByLetter.values()].sort((a, b) =>
      a.letter.localeCompare(b.letter)
    ),
    fixtures: manualFixtures,
    players: manualPlayers,
  };
}

export async function saveWorldCupToDb(data: WorldCupManualData): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.matchEvent.deleteMany();
    await tx.fixture.deleteMany();
    await tx.groupStanding.deleteMany();

    for (const t of data.teams) {
      const group =
        data.groups.find((g) => g.standings.some((s) => s.teamId === t.id))
          ?.letter ?? null;
      await tx.team.upsert({
        where: { legacyId: t.id },
        create: {
          legacyId: t.id,
          name: t.name,
          code: t.code.toUpperCase(),
          fifaCode: toFifa3Code(t.code),
          country: t.country ?? t.name,
          group: group?.toUpperCase() ?? "A",
          slug: teamSlug(t.name, t.code),
        },
        update: {
          name: t.name,
          code: t.code.toUpperCase(),
          fifaCode: toFifa3Code(t.code),
          country: t.country ?? t.name,
          group: group?.toUpperCase() ?? "A",
          slug: teamSlug(t.name, t.code),
        },
      });
    }

    const refreshedTeams = await tx.team.findMany();
    const teamIdMap = new Map(refreshedTeams.map((t) => [t.legacyId, t.id]));
    const legacyToTeamId = teamIdMap;
    const codeToTeamDbId = new Map(
      refreshedTeams.map((t) => [t.code.toUpperCase(), t.id])
    );
    const dbPlayers = await tx.player.findMany();
    const playerLegacyToDb = new Map(
      dbPlayers.map((p) => [p.legacyId, p.id])
    );

    for (const g of data.groups) {
      for (const s of g.standings) {
        const teamDbId = teamIdMap.get(s.teamId);
        if (!teamDbId) continue;
        await tx.groupStanding.create({
          data: {
            group: g.letter.toUpperCase(),
            teamId: teamDbId,
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
    }

    const venueCache = new Map<string, string>();
    async function getVenueId(name: string, city: string): Promise<string> {
      const key = `${name}|${city}`;
      const cached = venueCache.get(key);
      if (cached) return cached;
      const v = await tx.venue.upsert({
        where: { name_city: { name, city } },
        create: { name, city, country: "" },
        update: {},
      });
      venueCache.set(key, v.id);
      return v.id;
    }

    let nextFixtureLegacyId =
      (await tx.fixture.aggregate({ _max: { legacyId: true } }))._max.legacyId ??
      0;

    for (const f of data.fixtures) {
      const venueId = await getVenueId(f.venue.name, f.venue.city);
      const homeDbId =
        f.homeTeamId > 0 ? teamIdMap.get(f.homeTeamId) ?? null : null;
      const awayDbId =
        f.awayTeamId > 0 ? teamIdMap.get(f.awayTeamId) ?? null : null;
      const legacyId = f.id > 0 ? f.id : ++nextFixtureLegacyId;

      await tx.fixture.create({
        data: {
          legacyId,
          matchNumber: legacyId,
          stage: f.group ? "group" : "knockout",
          group: f.group?.toUpperCase() ?? null,
          round: f.round,
          date: new Date(f.date),
          timezone: f.timezone ?? "UTC",
          venueId,
          homeTeamId: homeDbId,
          awayTeamId: awayDbId,
          homeSlotLabel:
            f.homeTeamId <= 0 ? (f.homeTeam ?? null) : null,
          awaySlotLabel:
            f.awayTeamId <= 0 ? (f.awayTeam ?? null) : null,
          homeScore: f.goals.home,
          awayScore: f.goals.away,
          status: f.status,
          events: f.events?.length
            ? {
                create: f.events.map((e) => {
                  const legacyPlayerId = Number(e.playerId);
                  return {
                    id: e.id,
                    teamId: codeToTeamDbId.get(e.teamCode.toUpperCase()) ?? null,
                    playerId:
                      Number.isFinite(legacyPlayerId) && legacyPlayerId > 0
                        ? playerLegacyToDb.get(legacyPlayerId) ?? null
                        : null,
                    playerName: e.playerName,
                    assistName: null,
                    type: e.type,
                    description: e.isOwnGoal ? "Own Goal" : null,
                    minute: e.minute,
                    extraMinute: e.addedTime ?? null,
                    linkedGoalId: e.linkedGoalId ?? null,
                  };
                }),
              }
            : undefined,
        },
      });
    }

    await tx.tournamentMeta.upsert({
      where: { key: "main" },
      create: {
        key: "main",
        value: {
          name: "Coupe du Monde FIFA 2026",
          updatedAt: new Date().toISOString(),
        },
      },
      update: {
        value: {
          name: "Coupe du Monde FIFA 2026",
          updatedAt: new Date().toISOString(),
        },
      },
    });
  });
}

export type DbPlayerStatRow = {
  playerId: number;
  goals?: number;
  assists?: number;
  yellowCards?: number;
  redCards?: number;
  suspended?: boolean;
};

/** Persiste buteurs, passeurs et cartons recalculés par le moteur tournoi */
export async function saveTournamentStatisticsToDb(stats: {
  scorers: { playerId: number; goals: number }[];
  assists: { playerId: number; assists: number }[];
  cards: {
    playerId: number;
    yellowCards: number;
    redCards: number;
    suspended: boolean;
  }[];
}): Promise<void> {
  const players = await prisma.player.findMany({
    select: { id: true, legacyId: true },
  });
  const legacyToDb = new Map(players.map((p) => [p.legacyId, p.id]));

  await prisma.$transaction(async (tx) => {
    await tx.scorer.deleteMany();
    await tx.assist.deleteMany();
    await tx.card.deleteMany();

    for (const row of stats.scorers) {
      const dbId = legacyToDb.get(row.playerId);
      if (!dbId || row.goals <= 0) continue;
      await tx.scorer.create({
        data: { playerId: dbId, goals: row.goals },
      });
    }

    for (const row of stats.assists) {
      const dbId = legacyToDb.get(row.playerId);
      if (!dbId || row.assists <= 0) continue;
      await tx.assist.create({
        data: { playerId: dbId, assists: row.assists },
      });
    }

    for (const row of stats.cards) {
      const dbId = legacyToDb.get(row.playerId);
      if (!dbId) continue;
      if (row.yellowCards <= 0 && row.redCards <= 0 && !row.suspended) continue;
      await tx.card.create({
        data: {
          playerId: dbId,
          yellowCards: row.yellowCards,
          redCards: row.redCards,
          suspended: row.suspended,
        },
      });
    }
  });
}
