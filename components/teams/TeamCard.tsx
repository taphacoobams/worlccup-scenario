import Link from "next/link";
import type { LocalTeam } from "@/types/data";
import { TeamFlag } from "@/components/ui/team-flag";
import { teamCountrySubtitle } from "@/lib/team-display";
import { teamHref } from "@/lib/team-slug";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

type Props = {
  team: LocalTeam;
  playerCount: number;
};

export function TeamCard({ team, playerCount }: Props) {
  const country = teamCountrySubtitle(team);

  return (
    <Link href={teamHref(team)} className="block h-full group">
      <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm transition-all group-hover:border-senegal-green/40 group-hover:bg-white/[0.07]">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start gap-4">
            <TeamFlag
              code={team.code}
              teamName={team.name}
              size="md"
              className="shrink-0 h-14 w-20 rounded"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg leading-tight truncate">{team.name}</h3>
              {country && (
                <p className="text-xs text-muted-foreground mt-0.5">{country}</p>
              )}
              {team.group && (
                <span className="inline-block mt-2 text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">
                  Groupe {team.group}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {playerCount} joueur{playerCount !== 1 ? "s" : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
