import "server-only";

import { cache } from "react";
import { loadWorldCupFromDb } from "@/lib/worldcup-db";
import { loadWorldCupFromJson } from "@/lib/services/worldcup-json";
import { withDbFallback } from "@/lib/services/with-fallback";
import { enrichWorldCupWithResults } from "@/lib/results/enrich";
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

export const loadWorldCupBundle = cache(async (): Promise<WorldCupManualData> => {
  const schedule = await withDbFallback(
    () => loadWorldCupFromDb().then(stripEmbeddedResults),
    () => loadWorldCupFromJson(),
    "worldcup"
  );
  return enrichWorldCupWithResults(schedule);
});
