import type { SquadPlayer } from "@/types/data";
import { groupSquadByPosition } from "@/lib/data/squad";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { playerHref } from "@/lib/player-href";
import Link from "next/link";

type Props = {
  players: SquadPlayer[];
};

export function SquadSection({ players }: Props) {
  const groups = groupSquadByPosition(players);

  if (players.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 rounded-xl border border-white/10">
        Effectif vide
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.label}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="h-1 w-12 rounded-full bg-senegal-green" />
            {g.label.toUpperCase()} ({g.players.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {g.players.map((p) => (
              <Link
                key={p.id}
                href={playerHref({ id: p.id, name: p.name })}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="relative">
                  <PlayerAvatar
                    photo={p.photo}
                    className="h-28 w-28 rounded-full ring-2 ring-white/10 group-hover:ring-gold/50 transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1"
                  />
                </div>
                {p.number != null && (
                  <span className="font-bold tabular-nums text-gold text-lg">#{p.number}</span>
                )}
                <p className="text-sm font-medium text-center leading-tight line-clamp-2">
                  {p.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
