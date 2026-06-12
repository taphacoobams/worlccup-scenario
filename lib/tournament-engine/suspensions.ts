import type { WorldCupManualData } from "@/types/worldcup-manual";
import {
  normalizeMatchEvents,
  resolvePlayerLegacyId,
  sortEventsChronologically,
} from "@/lib/tournament-engine/events";

const FINISHED = new Set(["FT", "AET", "PEN"]);

export type SuspensionState = {
  suspendedPlayerIds: Set<number>;
  yellowAccumulated: Map<number, number>;
};

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

/** Détermine les joueurs actuellement suspendus (2 jaunes ou rouge) */
export function recalculateSuspensions(
  data: WorldCupManualData
): SuspensionState {
  const yellowAccumulated = new Map<number, number>();
  const suspendedPlayerIds = new Set<number>();

  const fixtures = [...data.fixtures]
    .filter((f) => f.homeTeamId > 0 && f.awayTeamId > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const fixture of fixtures) {
    if (!FINISHED.has(fixture.status)) continue;

    const events = normalizeMatchEvents(
      fixture.events,
      data.teams,
      data.players
    );

    for (const e of sortEventsChronologically(events)) {
      const playerId = playerIdFromEvent(e, data);
      if (!playerId) continue;

      if (e.type === "red_card") {
        suspendedPlayerIds.add(playerId);
        yellowAccumulated.set(playerId, 0);
      } else if (e.type === "yellow_card") {
        const y = (yellowAccumulated.get(playerId) ?? 0) + 1;
        yellowAccumulated.set(playerId, y);
        if (y >= 2) {
          suspendedPlayerIds.add(playerId);
          yellowAccumulated.set(playerId, 0);
        }
      }
    }

    for (const e of events) {
      const playerId = playerIdFromEvent(e, data);
      if (playerId && suspendedPlayerIds.has(playerId)) {
        suspendedPlayerIds.delete(playerId);
      }
    }
  }

  return { suspendedPlayerIds, yellowAccumulated };
}
