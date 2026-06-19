import type { SquadPlayer } from "@/types/data";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PlayerAvatar } from "@/components/ui/player-avatar";

type Props = {
  player: SquadPlayer;
};

export function KeyPlayerCard({ player }: Props) {
  return (
    <GlassPanel className="p-6 border-gold/30 bg-linear-to-br from-gold/5 to-transparent">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl" />
          <PlayerAvatar
            photo={player.photo}
            className="relative h-32 w-32 rounded-full ring-4 ring-gold/50 shadow-2xl"
          />
        </div>
        <h3 className="text-xl font-bold">{player.name}</h3>
        {player.position && (
          <p className="text-sm text-muted-foreground mt-1">{player.position}</p>
        )}
        {player.number != null && (
          <p className="text-lg font-bold text-gold mt-2">#{player.number}</p>
        )}
      </div>
    </GlassPanel>
  );
}
