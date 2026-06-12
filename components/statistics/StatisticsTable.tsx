"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Flag } from "@/components/worldcup/Flag";
import { PlayerAvatar } from "@/components/ui/player-avatar";

export type StatColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => ReactNode;
};

type Props<T> = {
  rows: T[];
  columns: StatColumn<T>[];
  emptyMessage?: string;
};

export function StatisticsTable<T>({
  rows,
  columns,
  emptyMessage = "Aucune donnée disponible.",
}: Props<T>) {
  if (rows.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 rounded-xl border border-white/10 bg-white/5">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-white/10 text-muted-foreground text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left w-10">#</th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 ${
                    c.align === "right"
                      ? "text-right"
                      : c.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-muted-foreground tabular-nums font-medium">
                  {i + 1}
                </td>
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3 ${
                      c.align === "right"
                        ? "text-right"
                        : c.align === "center"
                          ? "text-center"
                          : "text-left"
                    }`}
                  >
                    {c.render(row, i)}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PlayerCell({
  photo,
  name,
  flagUrl,
  teamName,
  teamLogo,
  teamCode,
}: {
  photo?: string | null;
  name: string;
  flagUrl?: string;
  teamName: string;
  teamLogo?: string;
  teamCode?: string;
}) {
  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <PlayerAvatar photo={photo} className="relative h-10 w-10 rounded-full" />
      <div className="min-w-0">
        <p className="font-medium truncate">{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {teamCode || flagUrl || teamLogo ? (
            <Flag
              teamCode={teamCode}
              teamName={teamName}
              src={flagUrl ?? teamLogo}
              alt=""
              size="sm"
              className="shrink-0"
            />
          ) : null}
          <span className="text-xs text-muted-foreground truncate">{teamName}</span>
        </div>
      </div>
    </div>
  );
}
