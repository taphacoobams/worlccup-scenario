import "server-only";

import { prisma } from "@/lib/prisma";
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
  assists: number;
  yellowCards: number;
  redCards: number;
  suspended: number;
  lastUpdate: string | null;
};

export async function getManagerDashboardStats(): Promise<ManagerDashboardStats> {
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

  return {
    teams,
    players,
    fixtures,
    groups: groups.length,
    scenarios: TOTAL_SCENARIOS,
    finishedMatches,
    remainingMatches: fixtures - finishedMatches,
    goals: goalSum._sum.goals ?? 0,
    assists: assistSum._sum.assists ?? 0,
    yellowCards: yellowSum._sum.yellowCards ?? 0,
    redCards: redSum._sum.redCards ?? 0,
    suspended,
    lastUpdate:
      metaValue?.updatedAt ?? meta?.updatedAt.toISOString() ?? null,
  };
}

export type ManagerMatchdayMatch = {
  id: number;
  date: string;
  group: string | null;
  status: string;
  home: string;
  away: string;
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
    homeScore: f.homeScore,
    awayScore: f.awayScore,
  }));
}

function dayBounds(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

/** Matchs du calendrier réel, ou à défaut la dernière journée terminée du tournoi. */
export async function getManagerTodayMatches(): Promise<ManagerMatchdaySection> {
  const { start, end } = dayBounds(new Date());

  const todayRows = await prisma.fixture.findMany({
    where: { date: { gte: start, lt: end } },
    include: fixtureInclude,
    orderBy: { date: "asc" },
  });

  if (todayRows.length > 0) {
    return { matches: mapFixtureRows(todayRows), mode: "today" };
  }

  const latestFinished = await prisma.fixture.findFirst({
    where: { status: { in: ["FT", "AET", "PEN"] } },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (!latestFinished) {
    return { matches: [], mode: "empty" };
  }

  const { start: dayStart, end: dayEnd } = dayBounds(latestFinished.date);
  const matchdayRows = await prisma.fixture.findMany({
    where: { date: { gte: dayStart, lt: dayEnd } },
    include: fixtureInclude,
    orderBy: { date: "asc" },
  });

  return {
    matches: mapFixtureRows(matchdayRows),
    mode: "latest",
    matchdayDate: dayStart.toISOString(),
  };
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
