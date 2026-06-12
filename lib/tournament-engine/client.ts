import type { WorldCupManualData } from "@/types/worldcup-manual";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";
import {
  recalculateStandings,
  syncAllFixtureScores,
} from "@/lib/tournament-engine/standings";

/** Pipeline synchrone côté client — scores + classements uniquement */
export function applyTournamentPipeline(
  data: WorldCupManualData
): WorldCupManualData {
  const filtered = {
    ...data,
    fixtures: data.fixtures.map((f) => ({
      ...f,
      events: normalizeMatchEvents(f.events, data.teams, data.players),
    })),
  };
  let next = syncAllFixtureScores(filtered);
  next = recalculateStandings(next);
  return next;
}
