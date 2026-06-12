import type { LocalTeam } from "@/types/data";
import { TeamFlag } from "@/components/ui/team-flag";
import { teamCountrySubtitle } from "@/lib/team-display";

type Props = {
  team: LocalTeam;
};

export function TeamHeader({ team }: Props) {
  const coach = team.coach?.trim();
  const country = teamCountrySubtitle(team);

  return (
    <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <TeamFlag
          code={team.code}
          teamName={team.name}
          size="md"
          className="h-20 w-28 sm:h-24 sm:w-32 rounded-lg"
        />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          {country && <p className="text-muted-foreground mt-1">{country}</p>}
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4">
            {team.group && (
              <span className="text-sm font-bold text-gold bg-gold/15 px-3 py-1 rounded-full">
                Groupe {team.group}
              </span>
            )}
            <span className="text-sm font-mono text-muted-foreground bg-white/5 px-3 py-1 rounded-full">
              {team.code}
            </span>
          </div>
          {coach && (
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">Entraîneur · </span>
              <span className="font-medium">{coach}</span>
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
