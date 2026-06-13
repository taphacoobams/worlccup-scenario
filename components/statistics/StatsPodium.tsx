"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { StatEntry } from "@/types/data";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { TeamFlag } from "@/components/ui/team-flag";
import { playerHref } from "@/lib/player-href";
import { cn } from "@/lib/utils";

type Props = {
  players: StatEntry[];
  mode: "goals" | "assists";
  className?: string;
};

const MEDALS = ["🥇", "🥈", "🥉"] as const;
const HEIGHTS = ["h-28", "h-24", "h-20"] as const;
const ORDER = [1, 0, 2] as const;

export function StatsPodium({ players, mode, className }: Props) {
  const top3 = players.slice(0, 3);
  if (top3.length === 0) return null;

  const stat = (p: StatEntry) => (mode === "goals" ? p.goals ?? 0 : p.assists ?? 0);
  const label = mode === "goals" ? "buts" : "passes";

  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-lg mx-auto">
        {ORDER.map((idx, displayIdx) => {
          const p = top3[idx];
          if (!p) return null;
          const rank = idx;
          return (
            <motion.div
              key={p.playerId}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: displayIdx * 0.1 }}
              className={cn(
                "flex flex-col items-center flex-1 max-w-[120px]",
                rank === 0 && "order-2",
                rank === 1 && "order-1",
                rank === 2 && "order-3"
              )}
            >
              <span className="text-2xl mb-2">{MEDALS[rank]}</span>
              <div
                className={cn(
                  "w-full rounded-t-2xl border border-border bg-gradient-to-t from-surface to-surface-light/80 p-3 flex flex-col items-center",
                  HEIGHTS[rank],
                  rank === 0 && "from-primary/20 to-surface border-primary/30"
                )}
              >
                <PlayerAvatar
                  photo={p.photo}
                  className="h-14 w-14 rounded-full ring-2 ring-white/15"
                />
                <TeamFlag
                  code={p.teamCode ?? "xx"}
                  teamName={p.teamName}
                  size="sm"
                  className="h-4 w-6 rounded-sm mt-2 opacity-80"
                />
                <Link
                  href={playerHref({ id: p.playerId, name: p.name })}
                  className="text-xs font-semibold text-center truncate w-full mt-2 hover:text-senegal-green transition-colors"
                >
                  {p.name}
                </Link>
              </div>
              <p className="text-lg font-bold text-gold tabular-nums mt-2">
                {stat(p)} <span className="text-xs text-text-secondary font-normal">{label}</span>
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
