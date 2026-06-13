import "server-only";

import { revalidatePath } from "next/cache";
import type { MatchEvent } from "@/types/match-events";
import type { MatchResultStatus } from "@/types/results";
import type { WorldCupManualData } from "@/types/worldcup-manual";
import { saveMatchResult } from "@/lib/results/repository";
import { matchEventsToResultEvents } from "@/lib/results/events";
import { loadTournamentSchedule } from "@/lib/results/manager-load";
import { recalculateTournament } from "@/lib/results/recalculate";
import { logActivity } from "@/lib/tournament-engine/activity";

import { PATHS } from "@/lib/i18n/paths";

export const REVALIDATE_PATHS = [
  PATHS.home,
  PATHS.groupes,
  PATHS.matchs,
  PATHS.statistiques,
  PATHS.scenarios,
  PATHS.explorer,
  PATHS.analytique,
  PATHS.monteCarlo,
  "/knockout",
  PATHS.equipes,
  "/dashboard",
  "/dashboard/matches",
  "/dashboard/data",
];

export function revalidateTournamentPages(matchIds: number[] = []): void {
  for (const route of REVALIDATE_PATHS) {
    revalidatePath(route);
  }
  for (const id of matchIds) {
    revalidatePath(PATHS.matchs);
    revalidatePath(`/fixtures/${id}`);
    revalidatePath(`/matchs/${id}`);
    revalidatePath(`/dashboard/matches/${id}`);
  }
}

/** Pipeline partagée : results.json → PostgreSQL → stats → classements → scénarios */
export async function syncResultsPipeline(
  matchIds: number[] = []
): Promise<WorldCupManualData> {
  const schedule = await loadTournamentSchedule();
  const data = await recalculateTournament(schedule);
  revalidateTournamentPages(matchIds);
  return data;
}

export type SaveMatchFromManagerInput = {
  matchId: number;
  status: MatchResultStatus;
  events: MatchEvent[];
  teams: WorldCupManualData["teams"];
};

/** Dashboard → results.json → pipeline complète */
export async function persistMatchResultFromManager(
  input: SaveMatchFromManagerInput
): Promise<WorldCupManualData> {
  const resultEvents = matchEventsToResultEvents(input.events, input.teams);

  saveMatchResult(input.matchId, {
    status: input.status,
    events: resultEvents,
  });

  const data = await syncResultsPipeline([input.matchId]);

  await logActivity("match_updated", `Match #${input.matchId}`);
  if (resultEvents.some((e) => e.type === "goal")) {
    await logActivity("goal_added", `Match #${input.matchId}`);
  }
  if (
    resultEvents.some((e) => e.type === "yellow_card" || e.type === "red_card")
  ) {
    await logActivity("card_added", `Match #${input.matchId}`);
  }

  return data;
}
