import "server-only";

import { loadWorldCupBundle } from "@/lib/services/worldcup";
import { computeStatisticsFromResults } from "@/lib/results/statistics";
import { withDbFallback } from "@/lib/services/with-fallback";
import { loadWorldCupFromDb } from "@/lib/worldcup-db";
import { loadWorldCupFromJson } from "@/lib/services/worldcup-json";
import type { StatisticsViewData } from "@/types/data";
import type { WorldCupManualData } from "@/types/worldcup-manual";

function stripEmbeddedResults(data: WorldCupManualData): WorldCupManualData {
  return {
    ...data,
    fixtures: data.fixtures.map((f) => ({
      ...f,
      goals: { home: null, away: null },
      status: "NS",
      events: [],
    })),
  };
}

async function loadSchedule(): Promise<WorldCupManualData> {
  return withDbFallback(
    () => loadWorldCupFromDb().then(stripEmbeddedResults),
    () => loadWorldCupFromJson(),
    "statistics-schedule"
  );
}

function emptyStatistics(): StatisticsViewData {
  return {
    topScorers: [],
    topAssists: [],
    topYellowCards: [],
    topRedCards: [],
    suspended: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function loadStatistics(): Promise<StatisticsViewData> {
  try {
    const schedule = await loadSchedule();
    return computeStatisticsFromResults(schedule);
  } catch {
    try {
      const bundle = await loadWorldCupBundle();
      return computeStatisticsFromResults(bundle);
    } catch {
      return emptyStatistics();
    }
  }
}
