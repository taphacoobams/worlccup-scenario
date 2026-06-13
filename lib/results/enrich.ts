import "server-only";

import type { WorldCupManualData } from "@/types/worldcup-manual";
import type { ManualFixtureStatus } from "@/types/worldcup-manual";
import { getResults } from "@/lib/results/repository";
import { resultEventsToMatchEvents } from "@/lib/results/events";
import {
  recalculateStandings,
  syncAllFixtureScores,
} from "@/lib/tournament-engine/standings";

/** Fusionne la planification (fixtures) avec results.json — scores recalculés depuis événements */
export function applyResultsToWorldCupData(
  data: WorldCupManualData
): WorldCupManualData {
  const resultsById = new Map(
    getResults().matches.map((m) => [m.matchId, m])
  );

  const fixtures = data.fixtures.map((f) => {
    const result = resultsById.get(f.id);
    if (!result) {
      return {
        ...f,
        goals: { home: null, away: null },
        status: "NS" as ManualFixtureStatus,
        events: [],
      };
    }

    return {
      ...f,
      goals: { home: null, away: null },
      status: result.status as ManualFixtureStatus,
      events: resultEventsToMatchEvents(result.events, data.teams, data.players),
    };
  });

  let next: WorldCupManualData = {
    ...data,
    updatedAt: new Date().toISOString(),
    fixtures,
  };

  next = syncAllFixtureScores(next);
  next = recalculateStandings(next);
  return next;
}

export function enrichWorldCupWithResults(
  data: WorldCupManualData
): WorldCupManualData {
  return applyResultsToWorldCupData(data);
}
