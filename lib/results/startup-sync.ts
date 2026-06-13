import "server-only";

import { isDatabaseEnabled } from "@/lib/database";
import { loadWorldCupFromDb } from "@/lib/worldcup-db";
import { getResults } from "@/lib/results/repository";
import { computeScoresFromResultEvents } from "@/lib/results/scores";
import { loadTournamentSchedule, loadManagerDashboardData } from "@/lib/results/manager-load";
import { recalculateTournament } from "@/lib/results/recalculate";

let startupSyncPromise: Promise<void> | null = null;

function scoresDiffer(
  dbHome: number | null,
  dbAway: number | null,
  dbStatus: string,
  jsonHome: number,
  jsonAway: number,
  jsonStatus: string
): boolean {
  return (
    (dbHome ?? 0) !== jsonHome ||
    (dbAway ?? 0) !== jsonAway ||
    dbStatus.toUpperCase() !== jsonStatus.toUpperCase()
  );
}

/** Au démarrage : results.json gagne toujours sur PostgreSQL */
export async function startupSync(): Promise<void> {
  if (!isDatabaseEnabled()) return;

  const results = getResults();
  if (results.matches.length === 0) return;

  const dbData = await loadWorldCupFromDb();
  const schedule = await loadTournamentSchedule();
  let needsSync = false;

  for (const result of results.matches) {
    const fixture = dbData.fixtures.find((f) => f.id === result.matchId);
    const sched = schedule.fixtures.find((f) => f.id === result.matchId);
    if (!fixture || !sched) continue;

    const { homeScore, awayScore } = computeScoresFromResultEvents(
      sched.homeTeamId,
      sched.awayTeamId,
      result.events,
      schedule.teams
    );

    if (
      scoresDiffer(
        fixture.goals.home,
        fixture.goals.away,
        fixture.status,
        homeScore,
        awayScore,
        result.status
      )
    ) {
      needsSync = true;
      break;
    }
  }

  if (!needsSync) return;

  const scheduleOnly = await loadTournamentSchedule();
  await recalculateTournament(scheduleOnly);
  await loadManagerDashboardData();
}

/** Exécution unique par instance serveur */
export function runStartupSyncOnce(): Promise<void> {
  if (!startupSyncPromise) {
    startupSyncPromise = startupSync().catch((err) => {
      console.error("[startupSync] Échec réconciliation results.json → PostgreSQL:", err);
      startupSyncPromise = null;
    });
  }
  return startupSyncPromise;
}
