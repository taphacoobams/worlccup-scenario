"use client";

import { StatCard } from "@/components/ui/stat-card";
import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  accent?: "green" | "gold" | "default";
  delay?: number;
};

const accentMap = {
  green: "primary" as const,
  gold: "gold" as const,
  default: "default" as const,
};

/** @deprecated Prefer StatCard — kept for backward compatibility */
export function KpiCard(props: KpiCardProps) {
  return (
    <StatCard
      title={props.title}
      value={props.value}
      subtitle={props.subtitle}
      icon={props.icon}
      trend={props.trend}
      accent={accentMap[props.accent ?? "default"]}
      delay={props.delay}
    />
  );
}
