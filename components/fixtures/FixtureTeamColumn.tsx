import { BracketSlotLabel } from "@/components/worldcup/BracketSlotLabel";
import { TeamFlag } from "@/components/ui/team-flag";
import { isBracketSlot } from "@/lib/bracket-slots";
import type { Team } from "@/types/worldcup";

export function FixtureTeamColumn({ team }: { team: Team }) {
  if (isBracketSlot(team.name)) {
    return (
      <div className="flex flex-1 justify-center min-w-0">
        <BracketSlotLabel label={team.name} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-2 min-w-0 text-center">
      <TeamFlag
        code={team.code}
        teamName={team.name}
        size="md"
        className="h-10 w-14 rounded-lg"
      />
      <span className="text-base font-semibold leading-tight">{team.name}</span>
      {team.fifaRanking != null && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          FIFA #{team.fifaRanking}
        </span>
      )}
    </div>
  );
}
