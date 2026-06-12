"use client";

import type { ScenarioStats } from "@/types";
import { WINNER_SLOTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function HeatmapChart({ stats }: { stats: ScenarioStats }) {
  const groups = "ABCDEFGHIJKL".split("");
  const max = Math.max(
    ...WINNER_SLOTS.flatMap((w) =>
      groups.map((g) => stats.heatmap[w]?.[g] ?? 0)
    ),
    1
  );

  return (
    <div className="overflow-x-auto">
      <h4 className="text-sm font-medium mb-4 text-muted-foreground">
        Heatmap — Vainqueurs vs groupes adverses (3es)
      </h4>
      <table className="w-full text-xs" role="grid" aria-label="Heatmap confrontations">
        <thead>
          <tr>
            <th className="p-2 text-left text-muted-foreground">Winner</th>
            {groups.map((g) => (
              <th key={g} className="p-1 text-center font-bold">
                {g}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WINNER_SLOTS.map((winner) => (
            <tr key={winner}>
              <td className="p-2 font-mono text-gold">{winner}</td>
              {groups.map((g) => {
                const v = stats.heatmap[winner]?.[g] ?? 0;
                const intensity = v / max;
                return (
                  <td key={g} className="p-1">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-medium mx-auto",
                        v === 0 ? "bg-white/5 text-muted-foreground" : "text-white"
                      )}
                      style={
                        v > 0
                          ? {
                              backgroundColor: `rgba(0, 133, 63, ${0.2 + intensity * 0.8})`,
                            }
                          : undefined
                      }
                      title={`${winner} vs 3${g}: ${v}`}
                    >
                      {v || "—"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
