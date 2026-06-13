import type { GroupStanding } from "@/types/worldcup";
import type { TeamQualificationProbs } from "@/types/qualification";
import { sortStandingsByStats } from "@/lib/standings-utils";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { QualificationBadge } from "@/components/worldcup/QualificationBadge";
import { cn } from "@/lib/utils";

type TeamProbsInput =
  | Map<number, TeamQualificationProbs>
  | Record<number, TeamQualificationProbs>;

function getTeamProb(
  teamProbs: TeamProbsInput | undefined,
  teamId: number
): TeamQualificationProbs | undefined {
  if (!teamProbs) return undefined;
  if (teamProbs instanceof Map) return teamProbs.get(teamId);
  return teamProbs[teamId];
}

type Props = {
  standings: GroupStanding[];
  teamProbs?: TeamProbsInput;
  highlightCode?: string;
  highlightTeamIds?: number[];
};

/** 1er-2e : qualifiés directs · 3e : course au meilleur 3e · 4e : éliminé */
const ROW_RANK: Record<number, string> = {
  1: "border-l-4 border-l-emerald-500 bg-emerald-500/[0.12]",
  2: "border-l-4 border-l-emerald-500 bg-emerald-500/[0.08]",
  3: "border-l-4 border-l-amber-400 bg-amber-400/[0.12]",
  4: "border-l-4 border-l-red-500/60 bg-red-500/[0.06]",
};

export function StandingsTable({
  standings,
  teamProbs,
  highlightCode,
  highlightTeamIds,
}: Props) {
  const sorted = sortStandingsByStats(standings);
  const scrollClass = teamProbs ? "table-scroll table-scroll--wide" : "table-scroll";

  return (
    <div className={scrollClass}>
    <table className="data-table w-full" aria-label="Classement">
      <thead>
        <tr>
          <th className="w-9 text-center">#</th>
          <th>Équipe</th>
          <th className="text-center w-10">P</th>
          <th className="text-center w-9">V</th>
          <th className="text-center w-9">N</th>
          <th className="text-center w-9">D</th>
          <th className="text-center w-14">Buts</th>
          <th className="text-center w-11">+/-</th>
          <th className="text-center w-11 font-bold">Pts</th>
          {teamProbs && (
            <th
              className="text-right w-24"
              title="Projection statistique — ne modifie pas le classement"
            >
              P. qualif.
            </th>
          )}
        </tr>
        {teamProbs && (
          <tr className="border-t border-white/5 text-[9px] uppercase tracking-wide text-muted-foreground">
            <th colSpan={9} className="py-1.5 px-2 text-left font-medium normal-case tracking-normal">
              Classement actuel (résultats joués)
            </th>
            <th className="py-1.5 px-2 text-right font-medium normal-case tracking-normal">
              Projection
            </th>
          </tr>
        )}
      </thead>
      <tbody>
        {sorted.map((row) => {
          const probs = getTeamProb(teamProbs, row.team.id);
          const isHighlight =
            (highlightTeamIds?.includes(row.team.id) ?? false) ||
            (highlightCode &&
              row.team.code.toUpperCase() === highlightCode.toUpperCase());

          return (
            <tr
              key={row.team.id}
              className={cn(
                ROW_RANK[row.position] ?? "",
                isHighlight && "ring-1 ring-inset ring-primary/35"
              )}
            >
              <td className="py-3.5 px-2 font-mono font-bold text-text-secondary tabular-nums text-center">
                {row.position}
              </td>
              <td className="py-3.5 px-2 min-w-[140px]">
                <TeamBadge team={row.team} size="sm" />
              </td>
              <td className="py-3.5 px-2 text-center tabular-nums">{row.played}</td>
              <td className="py-3.5 px-2 text-center tabular-nums">{row.won}</td>
              <td className="py-3.5 px-2 text-center tabular-nums">{row.draw}</td>
              <td className="py-3.5 px-2 text-center tabular-nums">{row.lost}</td>
              <td className="py-3.5 px-2 text-center tabular-nums text-text-secondary">
                {row.goalsFor}:{row.goalsAgainst}
              </td>
              <td className="py-3.5 px-2 text-center tabular-nums font-medium">
                {row.goalDifference > 0 ? "+" : ""}
                {row.goalDifference}
              </td>
              <td className="py-3.5 px-2 text-center font-bold tabular-nums text-base text-primary">
                {row.points}
              </td>
              {teamProbs && (
                <td className="py-3.5 px-2">
                  {probs ? (
                    <div className="space-y-1.5">
                      <QualificationBadge probs={probs} compact />
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            probs.total >= 50
                              ? "bg-senegal-green"
                              : probs.total >= 25
                                ? "bg-gold"
                                : "bg-white/35"
                          )}
                          style={{ width: `${Math.min(100, probs.total)}%` }}
                          title={`Probabilité de qualification : ${probs.total}%`}
                        />
                      </div>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
  );
}
