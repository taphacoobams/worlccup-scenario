import { resolveTeamStrengthScore } from "@/lib/scenario-engine/team-strength";

export type StandingsSortRow = {
  team: {
    id: number;
    name: string;
    code?: string;
    fifaRanking?: number | null;
  };
  played: number;
  points: number;
  goalDifference: number;
  goalsFor: number;
};

function compareStandingsStats(a: StandingsSortRow, b: StandingsSortRow): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  const ra = a.team.fifaRanking ?? 999;
  const rb = b.team.fifaRanking ?? 999;
  if (ra !== rb) return ra - rb;
  const sa = resolveTeamStrengthScore({
    code: a.team.code ?? "",
    fifaRanking: a.team.fifaRanking,
  });
  const sb = resolveTeamStrengthScore({
    code: b.team.code ?? "",
    fifaRanking: b.team.fifaRanking,
  });
  if (sb !== sa) return sb - sa;
  return a.team.name.localeCompare(b.team.name, "fr");
}

/** Classement réel (pts, diff, buts) — à égalité : FIFA puis force relative */
export function sortStandingsByStats<T extends StandingsSortRow>(
  standings: T[]
): (T & { position: number })[] {
  return [...standings]
    .sort(compareStandingsStats)
    .map((row, i) => ({ ...row, position: i + 1 }));
}
