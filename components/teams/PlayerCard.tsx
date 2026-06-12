"use client";

import { useState } from "react";
import type { SquadPlayer } from "@/types/data";
import type { LocalTeam } from "@/types/data";
import { PlayerDetailDialog } from "@/components/players/PlayerDetailDialog";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { cn } from "@/lib/utils";

type Props = {
  player: SquadPlayer;
  team?: LocalTeam | null;
  className?: string;
};

export function PlayerCard({ player, team, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5",
          "hover:bg-white/[0.07] hover:border-senegal-green/30 transition-colors min-w-0 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-senegal-green/50",
          className
        )}
      >
        <PlayerAvatar
          photo={player.photo}
          className="relative h-10 w-10 rounded-full ring-1 ring-white/10"
        />
        <p className="min-w-0 flex-1 text-sm leading-snug">
          {player.number != null && (
            <span className="font-bold tabular-nums text-gold mr-2">#{player.number}</span>
          )}
          <span className="font-medium">{player.name}</span>
        </p>
      </button>

      <PlayerDetailDialog
        player={player}
        team={team}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
