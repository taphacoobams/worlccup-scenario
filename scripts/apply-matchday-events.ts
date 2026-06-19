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
  const { loadWorldCupFromJson } = await import("@/lib/services/worldcup-json");

  // Force load from JSON to ensure results.json is applied correctly
  const schedule = await loadWorldCupFromJson();

  await syncFixturesFromResults(schedule);
  console.log("OK — results.json synchronisé vers PostgreSQL (tous les matchs).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
