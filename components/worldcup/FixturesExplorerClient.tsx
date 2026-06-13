"use client";

import { FixturesExplorer } from "@/components/worldcup/FixturesExplorer";
import { useTeamContext } from "@/context/team-context";
import type { Fixture } from "@/types/worldcup";
import type { GroupTeamFlag } from "@/components/worldcup/GroupFilterSelect";

type Props = {
  fixtures: Fixture[];
  groupTeamsByLetter: Record<string, GroupTeamFlag[]>;
};

export function FixturesExplorerClient({
  fixtures,
  groupTeamsByLetter,
}: Props) {
  const { favoriteGroup, selectedTeam } = useTeamContext();

  return (
    <FixturesExplorer
      fixtures={fixtures}
      groupTeamsByLetter={groupTeamsByLetter}
      favoriteGroup={favoriteGroup}
      favoriteTeamName={selectedTeam.name}
    />
  );
}
