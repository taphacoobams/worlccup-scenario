/**
 * Injecte les événements des matchs du jour (Canada–Bosnie, USA–Paraguay).
 * Usage: npx tsx scripts/apply-matchday-events.ts
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
  assist?: { id: string; name: string; teamCode: string },
  isOwnGoal = false
): MatchEvent[] {
  const goal = createMatchEvent({
    minute,
    addedTime,
    type: "goal",
    playerId: scorer.id,
    playerName: scorer.name,
    teamCode: scorer.teamCode,
    isOwnGoal: isOwnGoal || undefined,
  });
  if (!assist || isOwnGoal) return [goal];
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

function canadaVsBosniaEvents(
  createMatchEvent: typeof import("@/lib/tournament-engine/events").createMatchEvent
): MatchEvent[] {
  const CA = "CA";
  const BA = "BA";
  return [
    card(createMatchEvent, 11, undefined, "yellow_card", {
      id: "210",
      name: "Johnston",
      teamCode: CA,
    }),
    ...goalWithAssist(
      createMatchEvent,
      21,
      undefined,
      { id: "155", name: "Lukic", teamCode: BA },
      { id: "135", name: "Kolasinac", teamCode: BA }
    ),
    card(createMatchEvent, 45, undefined, "yellow_card", {
      id: "140",
      name: "Demirovic",
      teamCode: BA,
    }),
    card(createMatchEvent, 45, 1, "yellow_card", {
      id: "155",
      name: "Lukic",
      teamCode: BA,
    }),
    card(createMatchEvent, 53, undefined, "yellow_card", {
      id: "212",
      name: "De",
      teamCode: CA,
    }),
    ...goalWithAssist(
      createMatchEvent,
      78,
      undefined,
      { id: "217", name: "Larin", teamCode: CA },
      { id: "232", name: "David", teamCode: CA }
    ),
  ];
}

function usaVsParaguayEvents(
  createMatchEvent: typeof import("@/lib/tournament-engine/events").createMatchEvent
): MatchEvent[] {
  const US = "US";
  const PY = "PY";
  return [
    ...goalWithAssist(
      createMatchEvent,
      7,
      undefined,
      { id: "874", name: "Bobadilla", teamCode: PY },
      undefined,
      true
    ),
    card(createMatchEvent, 10, undefined, "yellow_card", {
      id: "862",
      name: "Caceres",
      teamCode: PY,
    }),
    ...goalWithAssist(
      createMatchEvent,
      31,
      undefined,
      { id: "1216", name: "Balogun", teamCode: US },
      { id: "1206", name: "Pulisic", teamCode: US }
    ),
    ...goalWithAssist(
      createMatchEvent,
      45,
      5,
      { id: "1216", name: "Balogun", teamCode: US },
      { id: "1213", name: "Tillman", teamCode: US }
    ),
    card(createMatchEvent, 53, undefined, "yellow_card", {
      id: "868",
      name: "Almiron",
      teamCode: PY,
    }),
    card(createMatchEvent, 59, undefined, "yellow_card", {
      id: "1200",
      name: "Adams",
      teamCode: US,
    }),
    ...goalWithAssist(
      createMatchEvent,
      73,
      undefined,
      { id: "869", name: "Mauricio", teamCode: PY },
      { id: "877", name: "Enciso", teamCode: PY }
    ),
    card(createMatchEvent, 79, undefined, "yellow_card", {
      id: "866",
      name: "Gomez",
      teamCode: PY,
    }),
    card(createMatchEvent, 88, undefined, "yellow_card", {
      id: "876",
      name: "Arce",
      teamCode: PY,
    }),
    card(createMatchEvent, 90, 3, "yellow_card", {
      id: "864",
      name: "Alonso",
      teamCode: PY,
    }),
    ...goalWithAssist(
      createMatchEvent,
      90,
      8,
      { id: "1203", name: "Reyna", teamCode: US },
      { id: "1212", name: "Freeman", teamCode: US }
    ),
  ];
}

async function revalidatePublicPages(fixtureIds: number[]) {
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/groups");
    revalidatePath("/fixtures");
    for (const id of fixtureIds) {
      revalidatePath(`/fixtures/${id}`);
    }
    revalidatePath("/statistics");
    revalidatePath("/teams", "layout");
    revalidatePath("/scenarios");
    revalidatePath("/explorer");
    revalidatePath("/analytique");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/matches");
    for (const id of fixtureIds) {
      revalidatePath(`/dashboard/matches/${id}`);
    }
    console.log("Cache Next.js revalidé.");
  } catch {
    console.warn(
      "Revalidation cache ignorée (hors contexte Next.js) — relancez le serveur ou ouvrez les pages."
    );
  }
}

async function main() {
  const { createMatchEvent } = await import("@/lib/tournament-engine/events");
  const { runTournamentPipeline } = await import("@/lib/tournament-engine");
  const { logActivity } = await import("@/lib/tournament-engine/activity");
  const {
    loadWorldCupFromDb,
    saveWorldCupToDb,
    saveTournamentStatisticsToDb,
  } = await import("@/lib/worldcup-db");

  const fixtureIds = [3, 4];
  const eventsByFixture = new Map([
    [3, canadaVsBosniaEvents(createMatchEvent)],
    [4, usaVsParaguayEvents(createMatchEvent)],
  ]);

  const data = await loadWorldCupFromDb();
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

  const result = await runTournamentPipeline(next, {
    logActivities: true,
    activityDetail: "Matchs du jour (3 et 4)",
  });

  await saveWorldCupToDb(result.data);
  await saveTournamentStatisticsToDb(result.statistics);

  for (const id of fixtureIds) {
    const f = result.data.fixtures.find((x) => x.id === id);
    const events = f?.events ?? [];
    await logActivity("match_updated", `Match #${id}`);
    if (events.some((e) => e.type === "goal")) {
      await logActivity("goal_added", `Match #${id}`);
    }
    if (events.some((e) => e.type === "yellow_card" || e.type === "red_card")) {
      await logActivity("card_added", `Match #${id}`);
    }
    console.log(
      `Match #${id} (${f?.homeTeamName} vs ${f?.awayTeamName}): ${f?.goals.home}-${f?.goals.away} FT — ${events.length} événements`
    );
  }

  await revalidatePublicPages(fixtureIds);
  console.log("OK — pipeline complet exécuté (scores, classements, stats, scénarios).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
