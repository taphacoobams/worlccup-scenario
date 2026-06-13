import type { WorldCupManualData } from "@/types/worldcup-manual";
import { getFlag } from "@/lib/flags";
import {
  recalculateSuspensions,
  suspensionReasonLabel,
} from "@/lib/tournament-engine/suspensions";
import type { StatisticsViewData, StatEntry } from "@/types/data";

function formatMatchDate(date: string | null): string | undefined {
  if (!date) return undefined;
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildSuspendedPlayerRows(
  data: WorldCupManualData
): StatisticsViewData["suspended"] {
  const { details } = recalculateSuspensions(data);
  const playerMap = new Map(data.players.map((p) => [p.id, p]));
  const teamMap = new Map(data.teams.map((t) => [t.id, t]));

  return [...details]
    .sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return (
        new Date(b.triggeredFixtureDate).getTime() -
        new Date(a.triggeredFixtureDate).getTime()
      );
    })
    .map((d) => {
      const player = playerMap.get(d.playerId);
      const team = teamMap.get(d.teamId);
      if (!player || !team) return null;

      return {
        playerId: player.id,
        name: player.name,
        teamId: team.id,
        teamName: team.name,
        teamCode: team.code,
        flag: getFlag(team.code, null, team.name),
        photo: player.photo,
        reason: suspensionReasonLabel(d.reason),
        active: d.active,
        suspendedSince: formatMatchDate(d.triggeredFixtureDate),
        suspendedSinceMatch: d.triggeredMatchLabel,
        missesMatch: d.missedMatchLabel ?? undefined,
        missesMatchDate: formatMatchDate(d.missedFixtureDate),
        returnsMatch: d.returnMatchLabel ?? undefined,
        returnsMatchDate: formatMatchDate(d.returnFixtureDate),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);
}

/** Ajoute suspendu / risque de suspension aux joueurs sanctionnés */
export function enrichStatEntriesWithDiscipline(
  entries: StatEntry[],
  data: WorldCupManualData
): StatEntry[] {
  const { suspendedPlayerIds, yellowAccumulated } = recalculateSuspensions(data);
  return entries.map((e) => ({
    ...e,
    suspended: suspendedPlayerIds.has(e.playerId),
    suspensionRisk:
      !suspendedPlayerIds.has(e.playerId) &&
      (yellowAccumulated.get(e.playerId) ?? 0) >= 1,
  }));
}
