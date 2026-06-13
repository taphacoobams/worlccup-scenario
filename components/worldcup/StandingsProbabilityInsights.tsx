import { Info } from "lucide-react";
import {
  PROBABILITY_DISCLAIMER,
  STANDINGS_DISCLAIMER,
  explainRankProbabilityInversion,
  findRankProbabilityInversions,
} from "@/lib/standings/rank-probability-insights";
import type { TeamQualificationProbs } from "@/types/qualification";
import type { GroupStanding } from "@/types/worldcup";
import { cn } from "@/lib/utils";

type Props = {
  standings: GroupStanding[];
  teamProbs?: Record<number, TeamQualificationProbs>;
  compact?: boolean;
  className?: string;
};

export function StandingsProbabilityInsights({
  standings,
  teamProbs,
  compact,
  className,
}: Props) {
  if (!teamProbs) return null;

  const inversions = findRankProbabilityInversions(standings, teamProbs);

  return (
    <div className={cn("space-y-3", className)}>
      {!compact && (
        <div className="grid gap-2 sm:grid-cols-2 text-[11px] text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground font-medium">Classement actuel — </strong>
            {STANDINGS_DISCLAIMER}
          </p>
          <p>
            <strong className="text-foreground font-medium">Probabilité de qualification — </strong>
            {PROBABILITY_DISCLAIMER}
          </p>
        </div>
      )}

      {inversions.length > 0 && (
        <div
          className="rounded-lg border border-amber-500/25 bg-amber-500/[0.06] p-3 space-y-2"
          role="note"
          aria-label="Explications classement vs probabilité"
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-200/90">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Classement et probabilités peuvent diverger — c&apos;est normal
          </p>
          <ul className="space-y-2">
            {inversions.map((inv) => (
              <li
                key={`${inv.aheadTeam.id}-${inv.behindTeam.id}`}
                className="text-[11px] text-muted-foreground leading-relaxed"
              >
                {explainRankProbabilityInversion(inv)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
