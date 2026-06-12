export {
  countGoalsFromEvents,
  syncFixtureScoreFromEvents,
  computeManualStandingsForGroup,
  recalculateAllStandings,
} from "@/lib/manager-standings";

import type { WorldCupManualData } from "@/types/worldcup-manual";
import {
  recalculateAllStandings,
  syncFixtureScoreFromEvents,
} from "@/lib/manager-standings";

export function recalculateStandings(
  data: WorldCupManualData
): WorldCupManualData {
  return recalculateAllStandings(data);
}

export function recalculateGroups(
  data: WorldCupManualData
): WorldCupManualData {
  return recalculateAllStandings(data);
}

export function updateMatchResult(
  data: WorldCupManualData,
  fixtureId: number,
  patch: Partial<WorldCupManualData["fixtures"][number]>
): WorldCupManualData {
  const fixtures = data.fixtures.map((f) =>
    f.id === fixtureId ? { ...f, ...patch } : f
  );
  return { ...data, fixtures };
}

export function syncAllFixtureScores(
  data: WorldCupManualData
): WorldCupManualData {
  return {
    ...data,
    fixtures: data.fixtures.map((f) =>
      syncFixtureScoreFromEvents(f, data.teams)
    ),
  };
}
