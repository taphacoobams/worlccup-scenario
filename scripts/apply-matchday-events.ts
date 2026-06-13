/**
 * Synchronise results.json → PostgreSQL (pipeline complet).
 * Usage: npx tsx scripts/apply-matchday-events.ts
 */
import Module from "module";
import path from "path";

const serverOnlyStub = path.join(
  process.cwd(),
  "node_modules/next/dist/compiled/server-only/index.js"
);
require.cache[serverOnlyStub] = {
  id: serverOnlyStub,
  filename: serverOnlyStub,
  loaded: true,
  exports: {},
} as NodeModule;
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "server-only") return serverOnlyStub;
  return resolveFilename.call(this, request, parent, isMain, options);
};

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

async function main() {
  const { syncFixturesFromResults } = await import("@/lib/results/sync-fixtures");
  const { withDbFallback } = await import("@/lib/services/with-fallback");
  const { loadWorldCupFromDb } = await import("@/lib/worldcup-db");
  const { loadWorldCupFromJson } = await import("@/lib/services/worldcup-json");

  const schedule = await withDbFallback(
    () => loadWorldCupFromDb().then(stripEmbeddedResults),
    () => loadWorldCupFromJson(),
    "apply-results"
  );

  await syncFixturesFromResults(schedule);
  console.log("OK — results.json synchronisé vers PostgreSQL (matchs 3 et 4 si présents).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
