import Link from "next/link";
import { BestThirdsRankingTable } from "@/components/worldcup/BestThirdsRankingTable";
import { GroupTable } from "@/components/worldcup/GroupTable";
import { SectionCard } from "@/components/ui/section-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { BestThirdEntry, GroupQualificationSummary } from "@/types/qualification";
import type { WorldCupGroup } from "@/types/worldcup";

type Props = {
  groups: WorldCupGroup[];
  summaries: GroupQualificationSummary[];
  bestThirds: BestThirdEntry[];
  hasResults?: boolean;
  highlightCode?: string;
  favoriteTeamName?: string;
  favoriteGroup?: string | null;
};

export function GroupsView({
  groups,
  summaries,
  bestThirds,
  hasResults,
  highlightCode = "SN",
  favoriteTeamName = "Sénégal",
  favoriteGroup = "I",
}: Props) {
  const summaryByName = new Map(summaries.map((s) => [s.groupName, s]));

  return (
    <div className="space-y-10">
      <GlassPanel className="px-5 py-4 text-sm text-text-secondary">
        {hasResults
          ? "Classements saisis manuellement (Manager). "
          : "Classements au tirage officiel (0 pt) — mettez à jour via "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Dashboard
        </Link>
        . Probabilités : moteur 495 scénarios ·{" "}
        <Link href="/fixtures" className="text-primary hover:underline font-medium">
          Calendrier
        </Link>
      </GlassPanel>

      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          Classements par groupe
          {favoriteGroup && (
            <span className="text-sm font-normal text-text-secondary">
              · {favoriteTeamName} (G{favoriteGroup})
            </span>
          )}
        </h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
        description="12 équipes en 3e position — top 8 qualifiés · probabilités scénarios"
      >
        <BestThirdsRankingTable entries={bestThirds} highlightCode={highlightCode} />
      </SectionCard>
    </div>
  );
}
