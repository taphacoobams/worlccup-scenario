import "server-only";

import type { WorldCupManualData } from "@/types/worldcup-manual";
import type { StatisticsViewData } from "@/types/data";
import { getFlag } from "@/lib/flags";
import { enrichWorldCupWithResults } from "@/lib/results/enrich";
import {
  recalculateStatistics,
  statsToJson,
} from "@/lib/tournament-engine/statistics";
import { buildSuspendedPlayerRows, enrichStatEntriesWithDiscipline } from "@/lib/statistics/suspensions";

export function computeStatisticsFromResults(
  schedule: WorldCupManualData
): StatisticsViewData {
  const data = enrichWorldCupWithResults(schedule);
  const raw = recalculateStatistics(data);
  const json = statsToJson(raw);

  const playerMap = new Map(data.players.map((p) => [p.id, p]));
  const teamMap = new Map(data.teams.map((t) => [t.id, t]));

  const build = (
    rows: {
      playerId: number;
      goals?: number;
      assists?: number;
      yellowCards?: number;
      redCards?: number;
    }[],
    field: "goals" | "assists" | "yellowCards" | "redCards"
  ) =>
    rows
      .map((row) => {
        const player = playerMap.get(row.playerId);
        const team = player ? teamMap.get(player.teamId) : null;
        if (!player || !team) return null;
        return {
          playerId: player.id,
          name: player.name,
          teamId: team.id,
          teamName: team.name,
          teamCode: team.code,
          flag: getFlag(team.code, null, team.name),
          photo: player.photo ?? undefined,
          [field]: row[field] ?? 0,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);

  return {
    topScorers: build(json.scorers, "goals"),
    topAssists: build(json.assists, "assists"),
    topYellowCards: enrichStatEntriesWithDiscipline(
      build(json.cards.filter((c) => c.yellowCards > 0), "yellowCards"),
      data
    ),
    topRedCards: enrichStatEntriesWithDiscipline(
      build(json.cards.filter((c) => c.redCards > 0), "redCards"),
      data
    ),
    suspended: buildSuspendedPlayerRows(data),
    updatedAt: new Date().toISOString(),
  };
}

export {
  computeStatisticsFromResults as computeTopScorers,
  computeStatisticsFromResults as computeTopAssists,
  computeStatisticsFromResults as computeYellowCards,
  computeStatisticsFromResults as computeRedCards,
  computeStatisticsFromResults as computeSuspensions,
};
