import "server-only";

import type { WorldCupManualData } from "@/types/worldcup-manual";
import {
  recalculateGroups,
  recalculateStandings,
  syncAllFixtureScores,
} from "@/lib/tournament-engine/standings";
import {
  recalculateStatistics,
  statsToJson,
} from "@/lib/tournament-engine/statistics";
import { recalculateSuspensions } from "@/lib/tournament-engine/suspensions";
import {
  invalidateScenarioCache,
  recalculateQualificationProbabilities,
  recalculateScenarios,
} from "@/lib/tournament-engine/scenarios";
import { logActivity } from "@/lib/tournament-engine/activity";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";

export type TournamentPipelineResult = {
  data: WorldCupManualData;
  statistics: ReturnType<typeof statsToJson>;
  suspendedPlayerIds: number[];
};

export type PipelineOptions = {
  logActivities?: boolean;
  activityDetail?: string;
};

/** Pipeline central : match → stats → classements → scénarios */
export async function runTournamentPipeline(
  input: WorldCupManualData,
  options: PipelineOptions = {}
): Promise<TournamentPipelineResult> {
  let data = syncAllFixtureScores({
    ...input,
    fixtures: input.fixtures.map((f) => ({
      ...f,
      events: normalizeMatchEvents(f.events, input.teams, input.players),
    })),
  });
  data = recalculateStandings(data);
  data = recalculateGroups(data);

  const rawStats = recalculateStatistics(data);
  const suspensions = recalculateSuspensions(data);
  const statistics = statsToJson(rawStats);

  for (const row of statistics.cards) {
    row.suspended = suspensions.suspendedPlayerIds.has(row.playerId);
  }

  invalidateScenarioCache();
  await recalculateScenarios();
  await recalculateQualificationProbabilities();

  if (options.logActivities) {
    await logActivity("standings_recalculated", options.activityDetail);
    await logActivity("statistics_recalculated", options.activityDetail);
    await logActivity("scenarios_recalculated", options.activityDetail);
  }

  return {
    data,
    statistics,
    suspendedPlayerIds: [...suspensions.suspendedPlayerIds],
  };
}

export {
  updateMatchResult,
  recalculateStandings,
  recalculateGroups,
  syncAllFixtureScores,
} from "@/lib/tournament-engine/standings";
export { recalculateStatistics, statsToJson } from "@/lib/tournament-engine/statistics";
export { recalculateSuspensions } from "@/lib/tournament-engine/suspensions";
export {
  recalculateScenarios,
  recalculateQualificationProbabilities,
  invalidateScenarioCache,
} from "@/lib/tournament-engine/scenarios";
export {
  logActivity,
  getRecentActivity,
  activityLabel,
} from "@/lib/tournament-engine/activity";
export * from "@/lib/tournament-engine/events";
