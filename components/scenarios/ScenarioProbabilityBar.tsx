"use client";

import { useLocale } from "@/context/locale-context";
import { confidenceMessageKey } from "@/lib/i18n/confidence";
import { cn } from "@/lib/utils";
import type { ProbabilityConfidence } from "@/lib/scenario-engine/types";

const CONFIDENCE_COLORS: Record<ProbabilityConfidence, string> = {
  "very-likely": "bg-emerald-500",
  likely: "bg-senegal-green",
  possible: "bg-gold",
  unlikely: "bg-orange-500",
  "very-unlikely": "bg-red-500",
};

type Props = {
  score: number;
  confidence: ProbabilityConfidence;
  compact?: boolean;
};

export function ScenarioProbabilityBar({ score, confidence, compact }: Props) {
  const { t } = useLocale();
  const label = t(confidenceMessageKey(confidence));

  return (
    <div className={cn("space-y-1", compact && "space-y-0.5")}>
      <div className="flex justify-between items-center gap-2">
        <span className={cn("font-semibold tabular-nums", compact ? "text-xs" : "text-sm")}>
          {score}%
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            confidence === "very-likely" && "bg-emerald-500/20 text-emerald-400",
            confidence === "likely" && "bg-senegal-green/20 text-senegal-green",
            confidence === "possible" && "bg-gold/20 text-gold",
            confidence === "unlikely" && "bg-orange-500/20 text-orange-400",
            confidence === "very-unlikely" && "bg-red-500/20 text-red-400"
          )}
        >
          {label}
        </span>
      </div>
      <div className={cn("rounded-full bg-white/10 overflow-hidden", compact ? "h-1.5" : "h-2")}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", CONFIDENCE_COLORS[confidence])}
          style={{ width: `${Math.min(100, score)}%` }}
        />
      </div>
    </div>
  );
}
