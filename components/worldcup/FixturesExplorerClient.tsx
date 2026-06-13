"use client";

import { FixturesExplorer } from "@/components/worldcup/FixturesExplorer";
import { useTeamContext } from "@/context/team-context";
import type { Group } from "@/types";
import type { Fixture } from "@/types/worldcup";

import type { GroupStanding } from "@/types/worldcup";

type Props = {
  fixtures: Fixture[];
  groupSummaries: Record<Group, string>;
  groupStandingsByLetter?: Record<string, GroupStanding[]>;
};

export function FixturesExplorerClient({
  fixtures,
  groupSummaries,
  groupStandingsByLetter,
}: Props) {
  const { favoriteGroup, selectedTeam } = useTeamContext();

  return (
    <FixturesExplorer
      fixtures={fixtures}
      groupSummaries={groupSummaries}
      groupStandingsByLetter={groupStandingsByLetter}
      favoriteGroup={favoriteGroup}
      favoriteTeamName={selectedTeam.name}
    />
  );
}
