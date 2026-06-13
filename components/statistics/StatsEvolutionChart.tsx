"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatsEvolutionPoint } from "@/types/data";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

type Props = {
  points: StatsEvolutionPoint[];
  className?: string;
};

type Metric = "goals" | "cards";

export function StatsEvolutionChart({ points, className }: Props) {
  const [metric, setMetric] = useState<Metric>("goals");

  const chartData = useMemo(
    () =>
      points.map((p) => ({
        label: p.dateLabel ?? p.label,
        match: p.label,
        goals: p.totalGoals,
        yellow: p.totalYellowCards,
        red: p.totalRedCards,
        topScorer: p.topScorer?.name,
        topGoals: p.topScorer?.goals,
      })),
    [points]
  );

  if (points.length < 2) return null;

  return (
    <SectionCard
      title="Évolution du tournoi"
      description="Cumul des buts et cartons après chaque match terminé"
      className={className}
      action={
        <div className="flex rounded-xl border border-border p-0.5 bg-white/5">
          <button
            type="button"
            onClick={() => setMetric("goals")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              metric === "goals"
                ? "bg-primary/15 text-primary"
                : "text-text-secondary hover:text-foreground"
            )}
          >
            Buts
          </button>
          <button
            type="button"
            onClick={() => setMetric("cards")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              metric === "cards"
                ? "bg-gold/15 text-gold"
                : "text-text-secondary hover:text-foreground"
            )}
          >
            Cartons
          </button>
        </div>
      }
    >
      <div className="h-56 sm:h-72 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
            <defs>
              <linearGradient id="goalsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18c964" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#18c964" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="label"
              fontSize={10}
              tick={{ fill: "rgba(255,255,255,0.45)" }}
              interval="preserveStartEnd"
              angle={chartData.length > 6 ? -30 : 0}
              textAnchor={chartData.length > 6 ? "end" : "middle"}
              height={chartData.length > 6 ? 48 : 30}
            />
            <YAxis fontSize={10} tick={{ fill: "rgba(255,255,255,0.45)" }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(7,17,31,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelFormatter={(_, payload) => {
                const row = payload?.[0]?.payload;
                return row ? `${row.match} · ${row.label}` : "";
              }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  goals: "Buts cumulés",
                  yellow: "Cartons J",
                  red: "Cartons R",
                };
                return [value ?? 0, labels[String(name)] ?? String(name)];
              }}
            />
            {metric === "goals" ? (
              <Area
                type="monotone"
                dataKey="goals"
                name="goals"
                stroke="#18c964"
                fill="url(#goalsGrad)"
                strokeWidth={2}
              />
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="yellow"
                  name="yellow"
                  stroke="#d4af37"
                  fill="url(#yellowGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="red"
                  name="red"
                  stroke="#ef4444"
                  fill="url(#redGrad)"
                  strokeWidth={2}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v) => (v === "yellow" ? "Jaunes" : "Rouges")}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {chartData[chartData.length - 1]?.topScorer && (
        <p className="text-xs text-text-secondary mt-4 text-center">
          Meilleur buteur actuel :{" "}
          <span className="text-gold font-medium">
            {chartData[chartData.length - 1].topScorer} (
            {chartData[chartData.length - 1].topGoals} but
            {(chartData[chartData.length - 1].topGoals ?? 0) > 1 ? "s" : ""})
          </span>
        </p>
      )}
    </SectionCard>
  );
}
