import "server-only";

import { prisma } from "@/lib/prisma";
import { isDatabaseEnabled } from "@/lib/database";
import { getAllScenarios } from "@/lib/scenarios/server";
import { computeScenarioStats } from "@/lib/scenarios";
import { TOTAL_SCENARIOS } from "@/lib/constants";
import { recalculateQualificationProbabilities } from "@/lib/tournament-engine/scenarios";

export type ManagerDashboardStats = {
  teams: number;
  players: number;
  fixtures: number;
  groups: number;
  scenarios: number;
  finishedMatches: number;
  remainingMatches: number;
  goals: number;
  goalsPerMatch: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  suspended: number;
  lastUpdate: string | null;
};

function emptyStats(): ManagerDashboardStats {
  return {
    teams: 0,
    players: 0,
    fixtures: 0,
    groups: 0,
    scenarios: TOTAL_SCENARIOS,
    finishedMatches: 0,
    remainingMatches: 0,
    goals: 0,
    goalsPerMatch: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    suspended: 0,
    lastUpdate: null,
  };
}

export async function getManagerDashboardStats(): Promise<ManagerDashboardStats> {
  if (!isDatabaseEnabled()) {
    return emptyStats();
  }

  try {
    const [
      teams,
      players,
      fixtures,
      groups,
      finishedMatches,
      meta,
      goalSum,
      assistSum,
      yellowSum,
      redSum,
      suspended,
    ] = await Promise.all([
      prisma.team.count(),
      prisma.player.count(),
      prisma.fixture.count(),
      prisma.groupStanding.groupBy({ by: ["group"] }),
      prisma.fixture.count({ where: { status: { in: ["FT", "AET", "PEN"] } } }),
      prisma.tournamentMeta.findUnique({ where: { key: "main" } }),
      prisma.scorer.aggregate({ _sum: { goals: true } }),
      prisma.assist.aggregate({ _sum: { assists: true } }),
      prisma.card.aggregate({ _sum: { yellowCards: true } }),
      prisma.card.aggregate({ _sum: { redCards: true } }),
      prisma.card.count({ where: { suspended: true } }),
    ]);

    const metaValue = meta?.value as { updatedAt?: string } | undefined;
    const totalGoals = goalSum._sum.goals ?? 0;
    const goalsPerMatch = finishedMatches > 0 ? totalGoals / finishedMatches : 0;

    return {
      teams,
      players,
      fixtures,
      groups: groups.length,
      scenarios: TOTAL_SCENARIOS,
      finishedMatches,
      remainingMatches: fixtures - finishedMatches,
      goals: totalGoals,
      goalsPerMatch: Math.round(goalsPerMatch * 100) / 100,
      assists: assistSum._sum.assists ?? 0,
      yellowCards: yellowSum._sum.yellowCards ?? 0,
      redCards: redSum._sum.redCards ?? 0,
      suspended,
      lastUpdate:
        metaValue?.updatedAt ?? meta?.updatedAt.toISOString() ?? null,
    };
  } catch (error) {
    console.error("[manager/stats] Database error:", error);
    return emptyStats();
  }
}

export type ManagerMatchdayMatch = {
  id: number;
  date: string;
  group: string | null;
  status: string;
  home: string;
  away: string;
  homeCode: string;
  awayCode: string;
  homeScore: number | null;
  awayScore: number | null;
};

export type ManagerMatchdaySection = {
  matches: ManagerMatchdayMatch[];
  /** Calendrier réel (aujourd'hui) ou dernière journée jouée du tournoi */
  mode: "today" | "latest" | "empty";
  /** Présent quand mode === "latest" */
  matchdayDate?: string;
};

const fixtureInclude = {
  homeTeam: true,
  awayTeam: true,
  venue: true,
} as const;

function mapFixtureRows(
  rows: Awaited<
    ReturnType<
      typeof prisma.fixture.findMany<{ include: typeof fixtureInclude }>
    >
  >
): ManagerMatchdayMatch[] {
  return rows.map((f) => ({
    id: f.legacyId,
    date: f.date.toISOString(),
    group: f.group,
    status: f.status,
    home: f.homeTeam?.name ?? f.homeSlotLabel ?? "—",
    away: f.awayTeam?.name ?? f.awaySlotLabel ?? "—",
    homeCode: f.homeTeam?.code ?? "",
    awayCode: f.awayTeam?.code ?? "",
    homeScore: f.homeScore,
    awayScore: f.awayScore,
  }));
}

function dayBounds(date: Date) {
  // Use America/New_York timezone for World Cup 2026 (USA East Coast)
  const timeZone = "America/New_York";
  const nowInET = new Date(date.toLocaleString("en-US", { timeZone }));
  const start = new Date(nowInET);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const nowInETForComparison = new Date(new Date().toLocaleString("en-US", { timeZone }));
  return { start, end, timeZone, nowInETForComparison };
}

/** Matchs du calendrier réel dans le fuseau horaire du pays organisateur (uniquement matchs à venir). */
export async function getManagerTodayMatches(): Promise<ManagerMatchdaySection> {
  if (!isDatabaseEnabled()) {
    return { matches: [], mode: "empty" };
  }

  try {
    const { start, end, nowInETForComparison } = dayBounds(new Date());

    const todayRows = await prisma.fixture.findMany({
      where: {
        AND: [
          { date: { gte: start, lt: end } },
          { date: { gte: nowInETForComparison } },
        ],
      },
      include: fixtureInclude,
      orderBy: { date: "asc" },
    });

    if (todayRows.length > 0) {
      return { matches: mapFixtureRows(todayRows), mode: "today" };
    }

    return { matches: [], mode: "empty" };
  } catch (error) {
    console.error("[manager/stats] Database error in getManagerTodayMatches:", error);
    return { matches: [], mode: "empty" };
  }
}

export async function getManagerScenarioInsights() {
  const scenarios = await getAllScenarios();
  const stats = computeScenarioStats(scenarios);
  const freqs = Object.entries(stats.groupFrequencies).sort(
    (a, b) => b[1] - a[1]
  );
  return {
    total: scenarios.length,
    mostLikely: freqs.slice(0, 5),
    leastLikely: [...freqs].reverse().slice(0, 5),
    stats,
  };
}

export async function getTeamQualificationAnalysis(teamLegacyId?: number) {
  return recalculateQualificationProbabilities(teamLegacyId);
}

/** @deprecated */
export const getSenegalAnalysis = getTeamQualificationAnalysis;
