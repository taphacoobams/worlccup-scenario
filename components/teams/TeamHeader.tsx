import type { LocalTeam } from "@/types/data";
import { TeamFlag } from "@/components/ui/team-flag";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Trophy } from "lucide-react";

type Props = {
  team: LocalTeam;
};

export function TeamHeader({ team }: Props) {
  return (
    <GlassPanel className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <TeamFlag
          code={team.code}
          teamName={team.name}
          size="md"
          className="h-28 w-40 sm:h-32 sm:w-44 rounded-xl ring-2 ring-white/10 shadow-2xl"
        />
        <div className="text-center sm:text-left flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{team.name}</h1>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
            {team.group && (
              <span className="text-sm font-bold text-gold bg-gold/10 px-4 py-2 rounded-lg border border-gold/20">
                Groupe {team.group}
              </span>
            )}
            {team.fifaRanking != null && (
              <span className="inline-flex items-center gap-2 text-sm bg-white/5 text-muted-foreground px-4 py-2 rounded-lg font-medium border border-white/10">
                <Trophy className="h-4 w-4 text-gold" />
                FIFA #{team.fifaRanking}
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
