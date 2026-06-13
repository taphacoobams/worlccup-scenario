"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { panelBase } from "@/lib/ui-classes";

type Accent = "primary" | "secondary" | "gold" | "default";

const valueColor: Record<Accent, string> = {
  primary: "text-senegal-green",
  secondary: "text-foreground",
  gold: "text-gold",
  default: "text-foreground",
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
  className,
}: StatCardProps) {
  return (
    <div className={cn(panelBase, "p-4 h-full", className)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs text-muted-foreground">{title}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
      </div>
      <div className={cn("text-2xl sm:text-3xl font-bold tabular-nums", valueColor[accent])}>
        {value}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
      {trend && <p className="text-xs text-senegal-green mt-2 font-medium">{trend}</p>}
    </div>
  );
}

export const MetricCard = StatCard;
