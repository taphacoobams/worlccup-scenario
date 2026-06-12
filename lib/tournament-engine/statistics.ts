import type { WorldCupManualData } from "@/types/worldcup-manual";
import {
  normalizeMatchEvents,
  resolvePlayerLegacyId,
} from "@/lib/tournament-engine/events";

export type TournamentPlayerStats = {
  goals: Map<number, number>;
  assists: Map<number, number>;
  yellowCards: Map<number, number>;
  redCards: Map<number, number>;
};

function emptyStats(): TournamentPlayerStats {
  return {
    goals: new Map(),
    assists: new Map(),
    yellowCards: new Map(),
    redCards: new Map(),
  };
}

function bump(map: Map<number, number>, playerId: number, delta = 1) {
  map.set(playerId, (map.get(playerId) ?? 0) + delta);
}

function playerIdFromEvent(
  e: { playerId: string; playerName: string; teamCode: string },
  data: WorldCupManualData
): number | null {
  const parsed = Number(e.playerId);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  const team = data.teams.find((t) => t.code === e.teamCode);
  if (!team) return null;
  return resolvePlayerLegacyId(e.playerName, team.id, data.players);
}

/** Recalcule buteurs, passes et cartons à partir des événements match */
export function recalculateStatistics(
  data: WorldCupManualData
): TournamentPlayerStats {
  const stats = emptyStats();

  for (const fixture of data.fixtures) {
    const events = normalizeMatchEvents(
      fixture.events,
      data.teams,
      data.players
    );
    for (const e of events) {
      const playerId = playerIdFromEvent(e, data);
      if (!playerId) continue;

      if (e.type === "goal" && !e.isOwnGoal) {
        bump(stats.goals, playerId);
      } else if (e.type === "assist") {
        bump(stats.assists, playerId);
      } else if (e.type === "yellow_card") {
        bump(stats.yellowCards, playerId);
      } else if (e.type === "red_card") {
        bump(stats.redCards, playerId);
      }
    }
  }

  return stats;
}

export function statsToJson(stats: TournamentPlayerStats) {
  const scorers = [...stats.goals.entries()]
    .map(([playerId, goals]) => ({ playerId, goals }))
    .sort((a, b) => b.goals - a.goals);
  const assists = [...stats.assists.entries()]
    .map(([playerId, assists]) => ({ playerId, assists }))
    .sort((a, b) => b.assists - a.assists);
  const cards = new Set([
    ...stats.yellowCards.keys(),
    ...stats.redCards.keys(),
  ]);
  const cardRows = [...cards].map((playerId) => ({
    playerId,
    yellowCards: stats.yellowCards.get(playerId) ?? 0,
    redCards: stats.redCards.get(playerId) ?? 0,
    suspended: false,
  }));
  return { scorers, assists, cards: cardRows };
}
