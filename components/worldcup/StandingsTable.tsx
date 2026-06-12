import type { GroupStanding } from "@/types/worldcup";
import type { TeamQualificationProbs } from "@/types/qualification";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { QualificationBadge } from "@/components/worldcup/QualificationBadge";
import { cn } from "@/lib/utils";

type Props = {
  standings: GroupStanding[];
  teamProbs?: Map<number, TeamQualificationProbs>;
  highlightCode?: string;
};

export function StandingsTable({ standings, teamProbs, highlightCode }: Props) {
  const sorted = [...standings].sort((a, b) => a.position - b.position);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full text-sm min-w-[320px]" aria-label="Classement">
        <thead>
          <tr className="border-b border-white/10 text-muted-foreground text-left text-xs uppercase tracking-wide">
            <th className="py-2.5 px-2 w-8">#</th>
            <th className="py-2.5 px-2">Équipe</th>
            <th className="py-2.5 px-2 text-center">P</th>
            <th className="py-2.5 px-2 text-center hidden xs:table-cell">W</th>
            <th className="py-2.5 px-2 text-center hidden sm:table-cell">D</th>
            <th className="py-2.5 px-2 text-center hidden sm:table-cell">L</th>
            <th className="py-2.5 px-2 text-center hidden md:table-cell">Buts</th>
            <th className="py-2.5 px-2 text-center">GD</th>
            <th className="py-2.5 px-2 text-center font-bold">Pts</th>
            {teamProbs && <th className="py-2.5 px-2 text-right">Qualif.</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const probs = teamProbs?.get(row.team.id);
            const isHighlight =
              highlightCode &&
              (row.team.code.toUpperCase() === highlightCode.toUpperCase() ||
                row.team.name.toLowerCase().includes("senegal"));

            return (
              <tr
                key={row.team.id}
                className={cn(
                  "border-b border-white/5 transition-colors",
                  isHighlight && "bg-senegal-green/10",
                  row.position <= 2 && "text-foreground",
                  row.position === 3 && "bg-gold/5 text-gold"
                )}
              >
                <td className="py-3 px-2 font-mono font-semibold text-muted-foreground">
                  {row.position}
                </td>
                <td className="py-3 px-2">
                  <TeamBadge team={row.team} size="sm" />
                </td>
                <td className="py-3 px-2 text-center tabular-nums">{row.played}</td>
                <td className="py-3 px-2 text-center tabular-nums hidden xs:table-cell">
                  {row.won}
                </td>
                <td className="py-3 px-2 text-center tabular-nums hidden sm:table-cell">
                  {row.draw}
                </td>
                <td className="py-3 px-2 text-center tabular-nums hidden sm:table-cell">
                  {row.lost}
                </td>
                <td className="py-3 px-2 text-center tabular-nums hidden md:table-cell text-muted-foreground">
                  {row.goalsFor}:{row.goalsAgainst}
                </td>
                <td className="py-3 px-2 text-center tabular-nums font-medium">
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </td>
                <td className="py-3 px-2 text-center font-bold tabular-nums text-base">
                  {row.points}
                </td>
                {teamProbs && (
                  <td className="py-3 px-2 text-right">
                    {probs ? <QualificationBadge probs={probs} compact /> : "—"}
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
