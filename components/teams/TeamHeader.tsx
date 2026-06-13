import type { LocalTeam } from "@/types/data";
import { TeamFlag } from "@/components/ui/team-flag";
import { teamCountrySubtitle } from "@/lib/team-display";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Trophy } from "lucide-react";

type Props = {
  team: LocalTeam;
};

export function TeamHeader({ team }: Props) {
  const coach = team.coach?.trim();
  const country = teamCountrySubtitle(team);

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <TeamFlag
          code={team.code}
          teamName={team.name}
          size="md"
          className="h-20 w-28 sm:h-24 sm:w-32 rounded-lg ring-1 ring-white/10"
        />
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {country && <p className="text-muted-foreground mt-1 text-sm">{country}</p>}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
            {team.group && (
              <span className="text-xs font-bold text-gold bg-gold/10 px-3 py-1 rounded-md">
                Groupe {team.group}
              </span>
            )}
            {team.fifaRanking != null && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-white/5 text-muted-foreground px-3 py-1 rounded-md font-medium">
                <Trophy className="h-3.5 w-3.5 text-gold" />
                FIFA #{team.fifaRanking}
              </span>
            )}
          </div>
          {coach && (
            <p className="mt-5 text-sm">
              <span className="text-text-secondary">Entraîneur · </span>
              <span className="font-semibold">{coach}</span>
            </p>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}
