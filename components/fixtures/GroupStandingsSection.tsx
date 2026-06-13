import type { GroupStanding } from "@/types/worldcup";
import { StandingsTable } from "@/components/worldcup/StandingsTable";
import { SectionCard } from "@/components/ui/section-card";

type Props = {
  groupLetter: string;
  standings: GroupStanding[];
  highlightTeamIds?: number[];
};

export function GroupStandingsSection({
  groupLetter,
  standings,
  highlightTeamIds,
}: Props) {
  return (
    <SectionCard
      title={`Classement — Groupe ${groupLetter}`}
      description="Situation du groupe avant ou après ce match"
      className="mt-8"
    >
      <StandingsTable standings={standings} highlightTeamIds={highlightTeamIds} />
    </SectionCard>
  );
}
