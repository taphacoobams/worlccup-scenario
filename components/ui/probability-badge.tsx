import { cn } from "@/lib/utils";

type Variant = "favorable" | "difficult" | "surprise" | "neutral" | "high" | "low";

const styles: Record<Variant, string> = {
  favorable: "bg-primary/15 text-primary border-primary/30",
  difficult: "bg-red-500/15 text-red-400 border-red-500/30",
  surprise: "bg-gold/15 text-gold border-gold/30",
  neutral: "bg-white/5 text-text-secondary border-border",
  high: "bg-primary/20 text-primary border-primary/35",
  low: "bg-secondary/15 text-secondary border-secondary/30",
};

type Props = {
  value: number;
  label?: string;
  variant?: Variant;
  showBar?: boolean;
  className?: string;
};

export function ProbabilityBadge({
  value,
  label,
  variant = "neutral",
  showBar = true,
  className,
}: Props) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        {label && <span className="text-xs text-text-secondary">{label}</span>}
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums",
            styles[variant]
          )}
        >
          {pct.toFixed(pct % 1 === 0 ? 0 : 1)}%
        </span>
      </div>
      {showBar && (
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
