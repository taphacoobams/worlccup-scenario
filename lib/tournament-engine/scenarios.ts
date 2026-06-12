import "server-only";

import { getAllScenarios } from "@/lib/scenarios/server";
import { computeScenarioStats } from "@/lib/scenarios";
import { generateScenarios } from "@/lib/scenario-engine";
import { getScenarioEngineData } from "@/lib/scenarios/engine-data";
import { prisma } from "@/lib/prisma";
import { DEFAULT_FAVORITE_TEAM_ID } from "@/lib/teams-selection";
import type { Group } from "@/types";
import type { TeamQualificationAnalysis } from "@/lib/tournament-engine/types";

export type { TeamQualificationAnalysis, SenegalProbabilities } from "@/lib/tournament-engine/types";

export type ScenarioRecalcResult = {
  total: number;
  mostProbable: { label: string; percent: number } | null;
  leastProbable: { label: string; percent: number } | null;
};

/** Invalide le cache du moteur de scénarios enrichis (no-op côté serveur) */
export function invalidateScenarioCache(): void {
  /* le cache enrichi vit dans scenario-engine/index.ts côté client */
}

export async function recalculateScenarios(): Promise<ScenarioRecalcResult> {
  invalidateScenarioCache();
  const scenarios = await getAllScenarios();
  const stats = computeScenarioStats(scenarios);
  const freqs = Object.entries(stats.groupFrequencies).sort(
    (a, b) => b[1] - a[1]
  );
  const most = freqs[0];
  const least = freqs[freqs.length - 1];
  const total = scenarios.length;
  const pct = (n: number) => Math.round((n / total) * 1000) / 10;

  return {
    total,
    mostProbable: most ? { label: most[0], percent: pct(most[1]) } : null,
    leastProbable: least ? { label: least[0], percent: pct(least[1]) } : null,
  };
}

const emptyAnalysis = (
  teamLegacyId: number,
  teamName = "—",
  teamCode = "—",
  group: string | null = null
): TeamQualificationAnalysis => ({
  teamId: teamLegacyId,
  teamName,
  teamCode,
  group,
  position: null,
  points: null,
  qualificationPercent: 0,
  firstPlacePercent: 0,
  roundOf16Percent: 0,
});

/** Probabilités qualification / élimination pour une équipe (legacyId) */
export async function recalculateQualificationProbabilities(
  teamLegacyId: number = DEFAULT_FAVORITE_TEAM_ID
): Promise<TeamQualificationAnalysis> {
  const team = await prisma.team.findUnique({
    where: { legacyId: teamLegacyId },
  });
  if (!team) {
    return emptyAnalysis(teamLegacyId);
  }

  const standing = await prisma.groupStanding.findFirst({
    where: { teamId: team.id },
  });

  const engineData = await getScenarioEngineData();
  const baseScenarios = await getAllScenarios();
  const favoriteTeam =
    engineData.teams.find((t) => t.id === team.legacyId) ?? null;
  const favoriteGroup = (team.group?.toUpperCase() ?? null) as Group | null;

  const enriched = generateScenarios(
    baseScenarios,
    engineData.teams,
    engineData.standings,
    engineData.fixtures,
    favoriteTeam,
    favoriteGroup
  );

  const { computeTeamScenarioSummary } = await import(
    "@/lib/scenario-engine/get-best-for-team"
  );
  const summary = computeTeamScenarioSummary(
    enriched,
    team.legacyId,
    team.name,
    favoriteGroup
  );

  return {
    teamId: team.legacyId,
    teamName: team.name,
    teamCode: team.code,
    group: team.group?.toUpperCase() ?? null,
    position: standing?.position ?? null,
    points: standing?.points ?? null,
    qualificationPercent: summary.qualificationPercent,
    firstPlacePercent: summary.firstPlacePercent,
    roundOf16Percent: summary.roundOf16Percent,
  };
}
