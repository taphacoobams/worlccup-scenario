"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { glassPanelStatic } from "@/lib/ui-classes";

type Accent = "primary" | "secondary" | "gold" | "default";

const accentMap: Record<Accent, string> = {
  primary: "from-primary/20 via-primary/5 to-transparent border-primary/25",
  secondary: "from-secondary/20 via-secondary/5 to-transparent border-secondary/25",
  gold: "from-gold/20 via-gold/5 to-transparent border-gold/25",
  default: "from-white/5 to-transparent border-border",
};

const iconAccent: Record<Accent, string> = {
  primary: "text-primary bg-primary/15",
  secondary: "text-secondary bg-secondary/15",
  gold: "text-gold bg-gold/15",
  default: "text-muted-foreground bg-white/5",
};

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: Accent;
  trend?: string;
  delay?: number;
  className?: string;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "default",
  trend,
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      <div
        className={cn(
          glassPanelStatic,
          "bg-gradient-to-br overflow-hidden p-5 h-full",
          accentMap[accent]
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{title}</p>
          {Icon && (
            <div className={cn("rounded-xl p-2.5 shrink-0", iconAccent[accent])}>
              <Icon className="h-4 w-4" aria-hidden />
            </div>
          )}
        </div>
        <div className="text-3xl sm:text-4xl font-bold tracking-tight tabular-nums">{value}</div>
        {subtitle && <p className="text-xs text-text-secondary mt-2">{subtitle}</p>}
        {trend && <p className="text-xs text-primary mt-2 font-medium">{trend}</p>}
      </div>
    </motion.div>
  );
}

export const MetricCard = StatCard;
