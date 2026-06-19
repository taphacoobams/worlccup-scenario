import type { LocalTeam, SquadPlayer } from "@/types/data";
import { groupSquadByPosition } from "@/lib/data/squad";
import { PlayerCard } from "@/components/teams/PlayerCard";
import { GuardianCredit } from "@/components/ui/guardian-credit";

type Props = { players: SquadPlayer[]; team?: LocalTeam };

export function TeamSquad({ players, team }: Props) {
  const groups = groupSquadByPosition(players);

  if (players.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 rounded-xl border border-white/10">
        Effectif vide — vérifiez la base (<code className="text-gold">npm run db:seed</code>)
        ou ajoutez des joueurs via le Manager.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.label}>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="h-1 w-8 rounded-full bg-senegal-green" />
            {g.label}
            <span className="text-sm font-normal text-muted-foreground">
              ({g.players.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {g.players.map((p) => (
              <PlayerCard key={p.id} player={p} team={team} />
            ))}
          </div>
        </section>
      ))}
      <GuardianCredit label="Photos joueurs" className="text-center" />
    </div>
  );
}
