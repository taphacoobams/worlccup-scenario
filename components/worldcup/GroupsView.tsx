import Link from "next/link";
import { BestThirdsRankingTable } from "@/components/worldcup/BestThirdsRankingTable";
import { GroupTable } from "@/components/worldcup/GroupTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <p className="text-sm text-muted-foreground rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        {hasResults
          ? "Classements saisis manuellement (Manager). "
          : "Classements au tirage officiel (0 pt) — mettez à jour via "}
        <Link href="/login" className="text-senegal-green hover:underline">
          /dashboard
        </Link>
        . Probabilités : moteur 495 scénarios. Matchs :{" "}
        <Link href="/fixtures" className="text-senegal-green hover:underline">
          /fixtures
        </Link>
        .
      </p>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Classements par groupe
          {favoriteGroup && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              · focus {favoriteTeamName} (G{favoriteGroup})
            </span>
          )}
        </h2>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
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

      <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-transparent">
        <CardHeader>
          <CardTitle>Classement des meilleurs 3es</CardTitle>
          <p className="text-sm text-muted-foreground">
            12 équipes en 3e position de poule — top 8 qualifiés · probabilités scénarios
          </p>
        </CardHeader>
        <CardContent>
          <BestThirdsRankingTable entries={bestThirds} highlightCode={highlightCode} />
        </CardContent>
      </Card>
    </div>
  );
}
