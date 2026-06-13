import Link from "next/link";
import type { SquadPlayer } from "@/types/data";
import type { LocalTeam } from "@/types/data";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { playerHref } from "@/lib/player-href";
import { cn } from "@/lib/utils";

type Props = {
  player: SquadPlayer;
  team?: LocalTeam | null;
  className?: string;
};

export function PlayerCard({ player, className }: Props) {
  return (
    <Link
      href={playerHref(player.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5",
        "hover:bg-white/[0.07] hover:border-senegal-green/30 transition-colors min-w-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-senegal-green/50",
        className
      )}
    >
      <PlayerAvatar
        photo={player.photo}
        className="h-11 w-11 rounded-full ring-1 ring-white/10 shrink-0"
      />
      <p className="min-w-0 flex-1 text-sm leading-snug">
        {player.number != null && (
          <span className="font-bold tabular-nums text-gold mr-2">#{player.number}</span>
        )}
        <span className="font-medium">{player.name}</span>
      </p>
    </Link>
  );
}
