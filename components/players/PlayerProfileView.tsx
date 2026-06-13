import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GuardianCredit } from "@/components/ui/guardian-credit";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { TeamFlag } from "@/components/ui/team-flag";
import { Button } from "@/components/ui/button";
import { teamHref } from "@/lib/team-slug";
import type { LocalPlayer, LocalTeam } from "@/types/data";

type Props = {
  player: LocalPlayer;
  team: LocalTeam | null;
};

export function PlayerProfileView({ player, team }: Props) {
  const meta = [
    player.position,
    player.club,
    player.age != null ? `${player.age} ans` : null,
    player.heightCm != null ? `${player.heightCm} cm` : null,
    player.nationality,
  ].filter(Boolean);

  return (
    <div className="page-container max-w-3xl min-w-0">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href={team ? teamHref(team) : "/"}>
          <ArrowLeft className="h-4 w-4" />
          {team ? team.name : "Accueil"}
        </Link>
      </Button>

      <header className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
        <PlayerAvatar
          photo={player.photo}
          className="relative h-36 w-36 sm:h-40 sm:w-40 rounded-full ring-2 ring-white/15 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold mb-1">
            Joueur
          </p>
          <h1 className="text-2xl font-bold">
            {player.number != null && (
              <span className="text-gold tabular-nums mr-2">#{player.number}</span>
            )}
            {player.name}
          </h1>
          {team && (
            <Link
              href={teamHref(team)}
              className="inline-flex items-center gap-2 mt-2 text-sm text-senegal-green hover:underline"
            >
              <TeamFlag code={team.code} teamName={team.name} size="sm" />
              {team.name}
              {team.group ? ` · Groupe ${team.group}` : ""}
            </Link>
          )}
          {meta.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">{meta.join(" · ")}</p>
          )}
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Biographie
        </h2>
        {player.bio?.trim() ? (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {player.bio}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/70 italic">
            Biographie non disponible pour ce joueur.
          </p>
        )}
        {(player.bioCredit || player.imageCredit) && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
            {player.bioCredit && <GuardianCredit label="Bio" />}
            {player.imageCredit && <GuardianCredit label="Photo" />}
          </div>
        )}
      </section>
    </div>
  );
}
