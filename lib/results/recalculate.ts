import "server-only";

import type { WorldCupManualData } from "@/types/worldcup-manual";
import { syncFixturesFromResults } from "@/lib/results/sync-fixtures";

/**
 * Recalcule classements, statistiques, scénarios FIFA et synchronise PostgreSQL
 * à partir de results.json.
 */
export async function recalculateTournament(
  schedule: WorldCupManualData
): Promise<WorldCupManualData> {
  return syncFixturesFromResults(schedule);
}
