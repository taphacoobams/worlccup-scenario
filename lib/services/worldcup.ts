import "server-only";

import { cache } from "react";
import { loadWorldCupFromDb } from "@/lib/worldcup-db";
import { loadWorldCupFromJson } from "@/lib/services/worldcup-json";
import { withDbFallback } from "@/lib/services/with-fallback";
import type { WorldCupManualData } from "@/types/worldcup-manual";

export const loadWorldCupBundle = cache(async (): Promise<WorldCupManualData> => {
  return withDbFallback(
    () => loadWorldCupFromDb(),
    () => loadWorldCupFromJson(),
    "worldcup"
  );
});
