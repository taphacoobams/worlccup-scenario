import type { BestThirdEntry } from "@/types/qualification";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { cn } from "@/lib/utils";
import { GROUP_COLORS } from "@/lib/constants";
import type { Group } from "@/types";

type Props = {
  entries: BestThirdEntry[];
  highlightCode?: string;
};

export function BestThirdsRankingTable({ entries, highlightCode }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm" aria-label="Classement des meilleurs troisièmes">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-muted-foreground text-left">
            <th className="py-3 px-3 w-10">Rang</th>
            <th className="py-3 px-2 text-center w-12">Pos.</th>
            <th className="py-3 px-3">Équipe</th>
            <th className="py-3 px-2 text-center">Pts</th>
            <th className="py-3 px-2 text-center">J</th>
            <th className="py-3 px-2 text-center hidden md:table-cell">G</th>
            <th className="py-3 px-2 text-center hidden md:table-cell">N</th>
            <th className="py-3 px-2 text-center hidden md:table-cell">P</th>
            <th className="py-3 px-2 text-center">Bp</th>
            <th className="py-3 px-2 text-center">Bc</th>
            <th className="py-3 px-2 text-center">Diff</th>
            <th className="py-3 px-2 text-center">P(3e)</th>
            <th className="py-3 px-2 text-center hidden lg:table-cell">Scén.</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((row) => {
            const color = GROUP_COLORS[row.group as Group];
            const isHighlight =
              highlightCode && row.team.code === highlightCode;

            return (
              <tr
                key={row.group}
                className={cn(
                  "border-b border-white/5 transition-colors",
                  row.inQualifyingZone && "bg-senegal-green/5",
                  row.rank === 8 && "border-b-2 border-gold/40",
                  isHighlight && "bg-senegal-green/15"
                )}
              >
                <td className="py-2.5 px-3 font-mono font-bold">
                  {row.rank}
                  {row.inQualifyingZone && (
                    <span className="ml-1 text-senegal-green text-[10px]">✓</span>
                  )}
                </td>
                <td className="py-2.5 px-2 text-center font-mono text-muted-foreground">
                  3e
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {row.group}
                    </span>
                    <TeamBadge team={row.team} size="sm" />
                  </div>
                </td>
                <td className="py-2.5 px-2 text-center font-bold tabular-nums">
                  {row.points}
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums">{row.played}</td>
                <td className="py-2.5 px-2 text-center tabular-nums hidden md:table-cell">
                  {row.won}
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums hidden md:table-cell">
                  {row.draw}
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums hidden md:table-cell">
                  {row.lost}
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums">{row.goalsFor}</td>
                <td className="py-2.5 px-2 text-center tabular-nums">
                  {row.goalsAgainst}
                </td>
                <td className="py-2.5 px-2 text-center tabular-nums">
                  {row.goalDifference > 0 ? "+" : ""}
                  {row.goalDifference}
                </td>
                <td className="py-2.5 px-2 text-center">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-2 py-0.5 text-xs font-bold tabular-nums",
                      row.inQualifyingZone
                        ? "bg-senegal-green/25 text-senegal-green"
                        : "bg-white/10 text-muted-foreground"
                    )}
                  >
                    {row.qualifiesProbability}%
                  </span>
                </td>
                <td className="py-2.5 px-2 text-center hidden lg:table-cell">
                  <span
                    className="text-xs text-muted-foreground tabular-nums"
                    title="Part des 495 scénarios où ce groupe figure parmi les 8 meilleurs 3es"
                  >
                    {row.groupScenarioRate}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-muted-foreground px-4 py-3 border-t border-white/10">
        Les 8 premiers se qualifient · Ligne dorée = 8e place ·{" "}
        <strong className="text-gold">Scén.</strong> = fréquence C(12,8) sur 495 combinaisons
      </p>
    </div>
  );
}
