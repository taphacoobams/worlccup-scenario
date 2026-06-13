import type { GroupStanding } from "@/types/worldcup";
import type { TeamQualificationProbs } from "@/types/qualification";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { QualificationBadge } from "@/components/worldcup/QualificationBadge";
import { cn } from "@/lib/utils";

type Props = {
  standings: GroupStanding[];
  teamProbs?: Map<number, TeamQualificationProbs>;
  highlightCode?: string;
  highlightTeamIds?: number[];
};

const ROW_RANK: Record<number, string> = {
  1: "border-l-[3px] border-l-primary bg-primary/5",
  2: "border-l-[3px] border-l-secondary bg-secondary/5",
  3: "border-l-[3px] border-l-gold bg-gold/5",
  4: "border-l-[3px] border-l-red-500/70 bg-red-500/5",
};

export function StandingsTable({
  standings,
  teamProbs,
  highlightCode,
  highlightTeamIds,
}: Props) {
  const sorted = [...standings].sort((a, b) => a.position - b.position);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="data-table min-w-[340px]" aria-label="Classement">
        <thead>
          <tr>
            <th className="w-8">#</th>
            <th>Équipe</th>
            <th className="text-center">P</th>
            <th className="text-center hidden sm:table-cell">V</th>
            <th className="text-center hidden md:table-cell">N</th>
            <th className="text-center hidden md:table-cell">D</th>
            <th className="text-center hidden lg:table-cell">Buts</th>
            <th className="text-center">+/-</th>
            <th className="text-center font-bold">Pts</th>
            {teamProbs && <th className="text-right min-w-[100px]">Qualif.</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const probs = teamProbs?.get(row.team.id);
            const isHighlight =
              (highlightTeamIds?.includes(row.team.id) ?? false) ||
              (highlightCode &&
                row.team.code.toUpperCase() === highlightCode.toUpperCase());

            return (
              <tr
                key={row.team.id}
                className={cn(
                  ROW_RANK[row.position] ?? "",
                  isHighlight && "ring-1 ring-inset ring-primary/30"
                )}
              >
                <td className="py-3 px-2 font-mono font-bold text-text-secondary tabular-nums">
                  {row.position}
                </td>
                <td className="py-3 px-2">
                  <TeamBadge team={row.team} size="sm" />
                </td>
                <td className="py-3 px-2 text-center tabular-nums">{row.played}</td>
                <td className="py-3 px-2 text-center tabular-nums hidden sm:table-cell">{row.won}</td>
                <td className="py-3 px-2 text-center tabular-nums hidden md:table-cell">{row.draw}</td>
                <td className="py-3 px-2 text-center tabular-nums hidden md:table-cell">{row.lost}</td>
                <td className="py-3 px-2 text-center tabular-nums hidden lg:table-cell text-text-secondary">
                  {row.goalsFor}:{row.goalsAgainst}
                </td>
                <td className="py-3 px-2 text-center tabular-nums font-medium">
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </td>
                <td className="py-3 px-2 text-center font-bold tabular-nums text-base text-primary">
                  {row.points}
                </td>
                {teamProbs && (
                  <td className="py-3 px-2">
                    {probs ? (
                      <div className="space-y-1.5">
                        <QualificationBadge probs={probs} compact />
                        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${Math.min(100, probs.total)}%` }}
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
