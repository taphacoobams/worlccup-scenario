"use client";

import { FixturesExplorer } from "@/components/worldcup/FixturesExplorer";
import { useTeamContext } from "@/context/team-context";
import type { Group } from "@/types";
import type { Fixture } from "@/types/worldcup";

type Props = {
  fixtures: Fixture[];
  groupSummaries: Record<Group, string>;
};

export function FixturesExplorerClient({ fixtures, groupSummaries }: Props) {
  const { favoriteGroup, selectedTeam } = useTeamContext();

  return (
    <FixturesExplorer
      fixtures={fixtures}
      groupSummaries={groupSummaries}
      favoriteGroup={favoriteGroup}
      favoriteTeamName={selectedTeam.name}
    />
  );
}
