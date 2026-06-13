import Link from "next/link";
import type { LocalTeam } from "@/types/data";
import { TeamFlag } from "@/components/ui/team-flag";
import { teamCountrySubtitle } from "@/lib/team-display";
import { teamHref } from "@/lib/team-slug";
import { DataCard, DataCardContent } from "@/components/ui/data-card";
import { Users, Trophy } from "lucide-react";
import { premiumCardHover } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  team: LocalTeam;
  playerCount: number;
  fifaRanking?: number | null;
};

export function TeamCard({ team, playerCount, fifaRanking }: Props) {
  const country = teamCountrySubtitle(team);

  return (
    <Link href={teamHref(team)} className="block h-full group">
      <DataCard className={cn("h-full p-0 overflow-hidden", premiumCardHover)}>
        <DataCardContent className="p-6 pt-6">
          <div className="flex items-start gap-4">
            <TeamFlag
              code={team.code}
              teamName={team.name}
              size="md"
              className="shrink-0 h-16 w-24 rounded-xl ring-1 ring-border group-hover:ring-primary/30 transition-all"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg leading-tight truncate group-hover:text-primary transition-colors">
                {team.name}
              </h3>
              {country && <p className="text-xs text-text-secondary mt-0.5">{country}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {team.group && (
                  <span className="text-xs font-bold text-gold bg-gold/10 px-2.5 py-1 rounded-lg">
                    Groupe {team.group}
                  </span>
                )}
                {fifaRanking != null && (
                  <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-white/5 px-2.5 py-1 rounded-lg">
                    <Trophy className="h-3 w-3 text-gold" />
                    FIFA #{fifaRanking}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-sm text-text-secondary">
            <Users className="h-4 w-4 text-primary/70" />
            {playerCount} joueur{playerCount !== 1 ? "s" : ""}
          </div>
        </DataCardContent>
      </DataCard>
    </Link>
  );
}
