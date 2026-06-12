import type { TeamQualificationProbs } from "@/types/qualification";
import { cn } from "@/lib/utils";

const pathLabel = {
  first: "1er",
  second: "2e",
  third: "3e",
  eliminated: "—",
};

type Props = {
  probs: TeamQualificationProbs;
  compact?: boolean;
};

export function QualificationBadge({ probs, compact }: Props) {
  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
          probs.total >= 50
            ? "bg-senegal-green/25 text-senegal-green"
            : probs.total >= 25
              ? "bg-gold/20 text-gold"
              : "bg-white/10 text-muted-foreground"
        )}
        title={`1er ${probs.first}% · 2e ${probs.second}% · 3e ${probs.third}%`}
      >
        {probs.total}%
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 text-[10px] tabular-nums min-w-[72px]">
      <div className="flex justify-between gap-1">
        <span className="text-muted-foreground">Qualif.</span>
        <span className="font-bold text-senegal-green">{probs.total}%</span>
      </div>
      <div className="flex gap-1 text-muted-foreground">
        <span title="1ère place">1:{probs.first}</span>
        <span title="2e place">2:{probs.second}</span>
        <span title="Meilleur 3e" className="text-gold">
          3:{probs.third}
        </span>
      </div>
      <span className="text-[9px] text-gold/80">
        → {pathLabel[probs.likelyPath]}
      </span>
    </div>
  );
}
