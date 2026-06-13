"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flag } from "@/components/worldcup/Flag";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { playerHref } from "@/lib/player-href";

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
  playerId,
  name,
  photo,
  flagUrl,
  teamName,
  teamLogo,
  teamCode,
}: {
  playerId?: number;
  name: string;
  photo?: string;
  flagUrl?: string;
  teamName: string;
  teamLogo?: string;
  teamCode?: string;
}) {
  const nameEl =
    playerId != null ? (
      <Link
        href={playerHref({ id: playerId, name })}
        className="font-medium truncate hover:text-senegal-green transition-colors"
      >
        {name}
      </Link>
    ) : (
      <p className="font-medium truncate">{name}</p>
    );

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <PlayerAvatar
        photo={photo}
        className="h-10 w-10 rounded-full ring-1 ring-white/10 shrink-0"
      />
      {teamCode || flagUrl || teamLogo ? (
        <Flag
          teamCode={teamCode}
          teamName={teamName}
          src={flagUrl ?? teamLogo}
          alt=""
          size="sm"
          className="shrink-0 hidden sm:block"
        />
      ) : null}
      <div className="min-w-0">
        {nameEl}
        <span className="text-xs text-muted-foreground truncate block mt-0.5">
          {teamName}
        </span>
      </div>
    </div>
  );
}
