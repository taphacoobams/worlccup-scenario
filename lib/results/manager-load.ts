import "server-only";

import { loadWorldCupFromDb } from "@/lib/worldcup-db";
import { loadWorldCupFromJson } from "@/lib/services/worldcup-json";
import { withDbFallback } from "@/lib/services/with-fallback";
import { enrichWorldCupWithResults } from "@/lib/results/enrich";
import {
  getMatchResult,
  getMatchResultComputed,
} from "@/lib/results/repository";
import { resultEventsToMatchEvents } from "@/lib/results/events";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";
import type { ManualFixture, ManualFixtureStatus, WorldCupManualData } from "@/types/worldcup-manual";
import type { MatchResultStatus } from "@/types/results";

function resultStatusToManual(status?: MatchResultStatus): ManualFixtureStatus {
  if (!status || status === "NS") return "NS";
  if (status === "LIVE") return "HT";
  const valid = new Set<ManualFixtureStatus>([
    "NS",
    "FT",
    "HT",
    "PST",
    "CANC",
    "AET",
    "PEN",
  ]);
  return valid.has(status as ManualFixtureStatus)
    ? (status as ManualFixtureStatus)
    : "NS";
}

/** Calendrier sans scores ni événements embarqués (PostgreSQL ou JSON) */
export async function loadTournamentSchedule(): Promise<WorldCupManualData> {
  const base = await withDbFallback(
    () => loadWorldCupFromDb(),
    () => loadWorldCupFromJson(),
    "manager-schedule"
  );
  return {
    ...base,
    fixtures: base.fixtures.map((f) => ({
      ...f,
      goals: { home: null, away: null },
      status: "NS",
      events: [],
    })),
    groups: base.groups.map((g) => ({
      ...g,
      standings: g.standings.map((s) => ({
        ...s,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        position: s.position,
      })),
    })),
  };
}

/** Données Dashboard : calendrier + results.json (événements et scores officiels) */
export async function loadManagerDashboardData(): Promise<WorldCupManualData> {
  const schedule = await loadTournamentSchedule();
  return enrichWorldCupWithResults(schedule);
}

/** Charge un match pour l'éditeur — événements exclusivement depuis results.json */
export async function loadManagerMatchFromResults(
  matchId: number
): Promise<{ data: WorldCupManualData; fixture: ManualFixture } | null> {
  const schedule = await loadTournamentSchedule();
  const baseFixture = schedule.fixtures.find((f) => f.id === matchId);
  if (!baseFixture) return null;

  const result = getMatchResult(matchId);
  const events = result
    ? resultEventsToMatchEvents(result.events, schedule.teams, schedule.players)
    : [];

  const fixture: ManualFixture = {
    ...baseFixture,
    status: resultStatusToManual(result?.status),
    events: normalizeMatchEvents(events, schedule.teams, schedule.players),
    goals: { home: null, away: null },
  };

  const data = enrichWorldCupWithResults(schedule);
  const enrichedFixture =
    data.fixtures.find((f) => f.id === matchId) ?? fixture;

  return { data, fixture: enrichedFixture };
}

export function getMatchResultForApi(
  matchId: number,
  homeTeamId: number,
  awayTeamId: number,
  teams: WorldCupManualData["teams"]
) {
  const result = getMatchResult(matchId);
  if (!result) return null;
  return getMatchResultComputed(matchId, homeTeamId, awayTeamId, teams);
}
