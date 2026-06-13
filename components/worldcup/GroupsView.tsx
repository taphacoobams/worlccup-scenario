import { BestThirdsRankingTable } from "@/components/worldcup/BestThirdsRankingTable";
import { GroupTable } from "@/components/worldcup/GroupTable";
import { StandingsLegend } from "@/components/worldcup/StandingsLegend";
import { SectionCard } from "@/components/ui/section-card";
import type { BestThirdEntry, GroupQualificationSummary } from "@/types/qualification";
import type { WorldCupGroup } from "@/types/worldcup";

type Props = {
  groups: WorldCupGroup[];
  summaries: GroupQualificationSummary[];
  bestThirds: BestThirdEntry[];
  highlightCode?: string;
  favoriteTeamName?: string;
  favoriteGroup?: string | null;
};

export function GroupsView({
  groups,
  summaries,
  bestThirds,
  highlightCode = "SN",
  favoriteTeamName = "Sénégal",
  favoriteGroup = "I",
}: Props) {
  const summaryByName = new Map(summaries.map((s) => [s.groupName, s]));

  return (
    <div className="space-y-10 min-w-0">
      <StandingsLegend />

      <div>
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          Classement actuel par groupe
          {favoriteGroup && (
            <span className="text-sm font-normal text-text-secondary">
              · {favoriteTeamName} (G{favoriteGroup})
            </span>
          )}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Ordre sportif (points, différence de buts, buts marqués) — les probabilités de
          qualification sont affichées à part en projection.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 min-w-0">
          {groups.map((group) => (
            <GroupTable
              key={group.name}
              group={group}
              summary={summaryByName.get(group.name)}
              highlightCode={highlightCode}
            />
          ))}
        </div>
      </div>

      <SectionCard
        title="Classement des meilleurs 3es"
        description="Rang sportif des 12 troisièmes — top 8 qualifiés. Les colonnes P(3e) et Scén. sont des projections, pas le critère de tri."
      >
        <BestThirdsRankingTable entries={bestThirds} highlightCode={highlightCode} />
      </SectionCard>
    </div>
  );
}
