"use client";

import { GroupsView } from "@/components/worldcup/GroupsView";
import { useTeamContext } from "@/context/team-context";
import type { BestThirdEntry, GroupQualificationSummary } from "@/types/qualification";
import type { WorldCupGroup } from "@/types/worldcup";

type Props = {
  groups: WorldCupGroup[];
  summaries: GroupQualificationSummary[];
  bestThirds: BestThirdEntry[];
};

export function GroupsViewClient(props: Props) {
  const { selectedTeam } = useTeamContext();
  return <GroupsView {...props} highlightCode={selectedTeam.code} favoriteTeamName={selectedTeam.name} favoriteGroup={selectedTeam.group} />;
}
