import "server-only";

import { isDatabaseEnabled } from "@/lib/database";
import { enrichWorldCupWithResults } from "@/lib/results/enrich";
import { saveWorldCupToDb, saveTournamentStatisticsToDb } from "@/lib/worldcup-db";
import { runTournamentPipeline } from "@/lib/tournament-engine";
import type { WorldCupManualData } from "@/types/worldcup-manual";

/** Applique results.json sur les fixtures PostgreSQL */
export async function syncFixturesFromResults(
  schedule: WorldCupManualData
): Promise<WorldCupManualData> {
  const enriched = enrichWorldCupWithResults(schedule);

  if (!isDatabaseEnabled()) {
    return enriched;
  }

  const { data, statistics } = await runTournamentPipeline(enriched, {
    logActivities: false,
  });

  await saveWorldCupToDb(data);
  await saveTournamentStatisticsToDb(statistics);

  return data;
}
