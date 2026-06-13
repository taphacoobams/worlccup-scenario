import "server-only";

import { cache } from "react";
import { loadWorldCupFromFiles } from "@/lib/worldcup-persistence";
import type { WorldCupManualData } from "@/types/worldcup-manual";
import type { LocalFixture, LocalStanding, LocalTeam } from "@/types/data";
import type { ScenarioEngineData } from "@/types/scenario-engine";

export type { ScenarioEngineData } from "@/types/scenario-engine";

export function mapWorldCupToScenarioEngineData(
  data: WorldCupManualData
): ScenarioEngineData {
  const teamById = new Map(data.teams.map((t) => [t.id, t]));

  const teams: LocalTeam[] = data.teams.map((t) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    country: t.country ?? t.name,
    group:
      data.groups
        .find((g) => g.standings.some((s) => s.teamId === t.id))
        ?.letter.toUpperCase() ?? null,
  }));

  const standings: LocalStanding[] = data.groups.flatMap((g) =>
    g.standings.map((s) => ({
      teamId: s.teamId,
      teamName: teamById.get(s.teamId)?.name ?? "",
      group: g.letter.toUpperCase(),
      position: s.position,
      played: s.played,
      won: s.won,
      draw: s.draw,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalDifference,
      points: s.points,
    }))
  );

  const fixtures: LocalFixture[] = data.fixtures.map((f) => ({
    id: f.id,
    date: f.date,
    timezone: f.timezone ?? "UTC",
    venue: f.venue,
    venueImage: f.venueImage ?? f.venue.image ?? null,
    round: f.round,
    group: f.group,
    homeTeamId: f.homeTeamId,
    awayTeamId: f.awayTeamId,
    homeTeamName: teamById.get(f.homeTeamId)?.name ?? f.homeTeam ?? "",
    awayTeamName: teamById.get(f.awayTeamId)?.name ?? f.awayTeam ?? "",
    goals: f.goals,
    status: f.status,
  }));

  return { teams, standings, fixtures };
}

/** Équipes, classements et matchs pour le moteur de scénarios — PostgreSQL. */
export const getScenarioEngineData = cache(async (): Promise<ScenarioEngineData> => {
  const data = await loadWorldCupFromFiles();
  return mapWorldCupToScenarioEngineData(data);
});
