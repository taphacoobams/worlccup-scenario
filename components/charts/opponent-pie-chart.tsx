"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { ScenarioStats } from "@/types";

const COLORS = ["#00853f", "#d4af37", "#e31b23", "#0066b3", "#ffcd00", "#6b2d5c", "#00a651", "#c8102e"];

type Props = {
  frequencies: Record<string, number>;
  title?: string;
};

export function OpponentPieChart({ frequencies, title }: Props) {
  const chartData = Object.entries(frequencies)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="h-80 w-full">
      {title && <h4 className="text-sm font-medium mb-4 text-muted-foreground">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(10,10,10,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SenegalOpponentChart({ stats }: { stats: ScenarioStats }) {
  return (
    <OpponentPieChart
      frequencies={stats.senegalOpponentFrequencies}
      title="Adversaires du 3I (Sénégal) — fréquence sur 330 scénarios"
    />
  );
}

export function FavoriteOpponentChart({
  frequencies,
  teamName,
  groupLetter,
  scenarioCount,
}: {
  frequencies: Record<string, number>;
  teamName: string;
  groupLetter: string;
  scenarioCount: number;
}) {
  return (
    <OpponentPieChart
      frequencies={frequencies}
      title={`Adversaires du 3${groupLetter} (${teamName}) — ${scenarioCount} scénarios`}
    />
  );
}
