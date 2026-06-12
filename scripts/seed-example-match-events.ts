/**
 * Injecte les événements des matchs exemples (Mexique 2-0 RSA, Corée 2-1 Tchéquie).
 * Usage: npx tsx scripts/seed-example-match-events.ts
 */
import Module from "module";
import path from "path";
import type { MatchEvent } from "@/types/match-events";

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

function goalWithAssist(
  createMatchEvent: typeof import("@/lib/tournament-engine/events").createMatchEvent,
  minute: number,
  addedTime: number | undefined,
  scorer: { id: string; name: string; teamCode: string },
  assist?: { id: string; name: string; teamCode: string }
): MatchEvent[] {
  const goal = createMatchEvent({
    minute,
    addedTime,
    type: "goal",
    playerId: scorer.id,
    playerName: scorer.name,
    teamCode: scorer.teamCode,
  });
  if (!assist) return [goal];
  return [
    goal,
    createMatchEvent({
      minute,
      addedTime,
      type: "assist",
      playerId: assist.id,
      playerName: assist.name,
      teamCode: assist.teamCode,
      linkedGoalId: goal.id,
    }),
  ];
}

function card(
  createMatchEvent: typeof import("@/lib/tournament-engine/events").createMatchEvent,
  minute: number,
  addedTime: number | undefined,
  type: "yellow_card" | "red_card",
  player: { id: string; name: string; teamCode: string }
): MatchEvent {
  return createMatchEvent({
    minute,
    addedTime,
    type,
    playerId: player.id,
    playerName: player.name,
    teamCode: player.teamCode,
  });
}

function mexicoVsSouthAfricaEvents(
  createMatchEvent: typeof import("@/lib/tournament-engine/events").createMatchEvent
): MatchEvent[] {
  const MEX = "MX";
  const RSA = "ZA";
  return [
    ...goalWithAssist(createMatchEvent, 9, undefined, { id: "718", name: "Quinones", teamCode: MEX }, { id: "708", name: "Lira", teamCode: MEX }),
    card(createMatchEvent, 17, undefined, "yellow_card", { id: "1018", name: "Mokoena", teamCode: RSA }),
    card(createMatchEvent, 23, undefined, "yellow_card", { id: "728", name: "Gutierrez", teamCode: MEX }),
    card(createMatchEvent, 49, undefined, "red_card", { id: "1027", name: "Sithole", teamCode: RSA }),
    ...goalWithAssist(createMatchEvent, 67, undefined, { id: "711", name: "Jimenez", teamCode: MEX }, { id: "727", name: "Alvarado", teamCode: MEX }),
    card(createMatchEvent, 74, undefined, "yellow_card", { id: "1033", name: "Sibisi", teamCode: RSA }),
    card(createMatchEvent, 84, undefined, "red_card", { id: "1025", name: "Zwane", teamCode: RSA }),
    card(createMatchEvent, 90, 2, "red_card", { id: "705", name: "Montes", teamCode: MEX }),
  ];
}

function koreaVsCzechiaEvents(
  createMatchEvent: typeof import("@/lib/tournament-engine/events").createMatchEvent
): MatchEvent[] {
  const KOR = "KR";
  const CZE = "CZ";
  return [
    ...goalWithAssist(createMatchEvent, 59, undefined, { id: "371", name: "Krejci", teamCode: CZE }, { id: "369", name: "Coufal", teamCode: CZE }),
    ...goalWithAssist(createMatchEvent, 67, undefined, { id: "682", name: "Hwang", teamCode: KOR }, { id: "695", name: "Lee", teamCode: KOR }),
    ...goalWithAssist(createMatchEvent, 80, undefined, { id: "694", name: "Oh", teamCode: KOR }, { id: "682", name: "Hwang", teamCode: KOR }),
    card(createMatchEvent, 90, 6, "yellow_card", { id: "679", name: "Lee", teamCode: KOR }),
  ];
}

async function main() {
  const { createMatchEvent } = await import("@/lib/tournament-engine/events");
  const { runTournamentPipeline } = await import("@/lib/tournament-engine");
  const {
    loadWorldCupFromDb,
    saveWorldCupToDb,
    saveTournamentStatisticsToDb,
  } = await import("@/lib/worldcup-db");

  const data = await loadWorldCupFromDb();
  const fixtureIds = [1, 2];
  const eventsByFixture = new Map([
    [1, mexicoVsSouthAfricaEvents(createMatchEvent)],
    [2, koreaVsCzechiaEvents(createMatchEvent)],
  ]);

  const next = {
    ...data,
    fixtures: data.fixtures.map((f) => {
      if (!eventsByFixture.has(f.id)) return f;
      return {
        ...f,
        events: eventsByFixture.get(f.id),
        status: "FT" as const,
      };
    }),
  };

  const result = await runTournamentPipeline(next);
  await saveWorldCupToDb(result.data);
  await saveTournamentStatisticsToDb(result.statistics);

  for (const id of fixtureIds) {
    const f = result.data.fixtures.find((x) => x.id === id);
    console.log(
      `Match #${id}: ${f?.goals.home}-${f?.goals.away} (${f?.events?.length ?? 0} événements)`
    );
  }

  console.log("OK — scores, classements, stats et scénarios recalculés.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
