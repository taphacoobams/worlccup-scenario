import "server-only";

import { loadWorldCupFromFiles } from "@/lib/worldcup-persistence";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";
import type { StatsEvolutionPoint } from "@/types/data";

const FINISHED = new Set(["FT", "AET", "PEN"]);

/** Cumul buts / cartons après chaque match terminé (ordre chronologique) */
export async function buildStatsEvolution(): Promise<StatsEvolutionPoint[]> {
  const data = await loadWorldCupFromFiles();

  const finished = data.fixtures
    .filter((f) => FINISHED.has(f.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let totalGoals = 0;
  let totalYellow = 0;
  let totalRed = 0;
  const goalByPlayer = new Map<number, number>();

  const points: StatsEvolutionPoint[] = [
    {
      label: "Début",
      date: finished[0]?.date ?? new Date().toISOString(),
      matchNumber: 0,
      totalGoals: 0,
      totalYellowCards: 0,
      totalRedCards: 0,
    },
  ];

  for (const fixture of finished) {
    const events = normalizeMatchEvents(fixture.events, data.teams, data.players);

    for (const e of events) {
      if (e.type === "goal" && !e.isOwnGoal) totalGoals++;
      if (e.type === "yellow_card") totalYellow++;
      if (e.type === "red_card") totalRed++;

      if (e.type === "goal" && !e.isOwnGoal && e.playerId) {
        const pid = Number(e.playerId);
        if (Number.isFinite(pid)) {
          goalByPlayer.set(pid, (goalByPlayer.get(pid) ?? 0) + 1);
        }
      }
    }

    let topScorer: StatsEvolutionPoint["topScorer"];
    let best = 0;
    for (const [playerId, goals] of goalByPlayer) {
      if (goals > best) {
        best = goals;
        const player = data.players.find((p) => p.id === playerId);
        topScorer = player ? { name: player.name, goals } : undefined;
      }
    }

    const dateLabel = new Date(fixture.date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });

    points.push({
      label: `M${fixture.id}`,
      date: fixture.date,
      matchNumber: fixture.id,
      dateLabel,
      totalGoals,
      totalYellowCards: totalYellow,
      totalRedCards: totalRed,
      topScorer,
    });
  }

  return points.length > 1 ? points : [];
}
