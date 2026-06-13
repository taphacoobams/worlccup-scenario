import "server-only";

import type { WorldCupManualData } from "@/types/worldcup-manual";
import type { ManualStanding } from "@/types/worldcup-manual";
import { enrichWorldCupWithResults } from "@/lib/results/enrich";

export type GroupStandingsRow = ManualStanding & {
  teamName?: string;
  group?: string;
};

/** Classements calculés uniquement depuis results.json + calendrier */
export function computeGroupStandingsFromResults(
  schedule: WorldCupManualData
): WorldCupManualData["groups"] {
  const data = enrichWorldCupWithResults(schedule);
  return data.groups;
}
