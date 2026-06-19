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

export function PlayerCard({ player, team, className }: Props) {
  return (
    <Link
      href={playerHref({ id: player.id, name: player.name })}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-4",
        "hover:bg-white/[0.07] hover:border-senegal-green/30 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-senegal-green/50",
        className
      )}
    >
      <PlayerAvatar
        photo={player.photo}
        className="h-20 w-20 rounded-full ring-2 ring-white/10 shrink-0"
      />
      {player.number != null && (
        <span className="font-bold tabular-nums text-gold text-lg">#{player.number}</span>
      )}
      <p className="text-sm font-medium text-center leading-tight line-clamp-2">
        {player.name}
      </p>
    </Link>
  );
}
