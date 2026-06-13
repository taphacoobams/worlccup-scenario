"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GROUP_COLORS } from "@/lib/constants";
import type { Group } from "@/types";

type Props = {
  data: Record<Group, number>;
  title?: string;
};

export function GroupFrequencyChart({ data, title }: Props) {
  const chartData = Object.entries(data).map(([group, count]) => ({
    group,
    count,
    fill: GROUP_COLORS[group as Group],
  }));

  return (
    <div className="h-64 sm:h-80 w-full min-w-0" role="img" aria-label={title ?? "Fréquence des groupes"}>
      {title && <h4 className="text-sm font-medium mb-4 text-muted-foreground">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="group" stroke="#888" fontSize={12} />
          <YAxis stroke="#888" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "rgba(10,10,10,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
