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
    <GlassPanel className="p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        <TeamFlag
          code={team.code}
          teamName={team.name}
          size="md"
          className="h-24 w-36 sm:h-28 sm:w-40 rounded-2xl ring-2 ring-primary/20 shadow-2xl shadow-primary/10"
        />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{team.name}</h1>
          {country && <p className="text-text-secondary mt-2 text-lg">{country}</p>}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-5">
            {team.group && (
              <span className="text-sm font-bold text-gold bg-gold/15 px-4 py-1.5 rounded-xl">
                Groupe {team.group}
              </span>
            )}
            <span className="text-sm font-mono text-text-secondary bg-surface-light px-4 py-1.5 rounded-xl">
              {team.code}
            </span>
            {team.fifaRanking != null && (
              <span className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-4 py-1.5 rounded-xl font-semibold">
                <Trophy className="h-4 w-4" />
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
