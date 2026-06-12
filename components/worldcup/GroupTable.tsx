import type { GroupQualificationSummary } from "@/types/qualification";
import type { WorldCupGroup } from "@/types/worldcup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StandingsTable } from "@/components/worldcup/StandingsTable";
import { GROUP_COLORS } from "@/lib/constants";
import type { Group } from "@/types";

type Props = {
  group: WorldCupGroup;
  summary?: GroupQualificationSummary;
  highlightCode?: string;
};

export function GroupTable({ group, summary, highlightCode }: Props) {
  const letter = group.name.replace(/Groupe\s*/i, "").trim().toUpperCase().slice(0, 1);
  const color = GROUP_COLORS[letter as Group] ?? "#00853f";

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="pb-3"
        style={{ borderBottom: `2px solid ${color}40` }}
      >
        <CardTitle className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {letter}
          </span>
          {group.name}
        </CardTitle>
        {summary && (
          <CardDescription className="text-xs">
            P(groupe au tableau des 8 meilleurs 3es) :{" "}
            <strong className="text-gold">{summary.thirdPlaceScenarioRate}%</strong>{" "}
            · 495 scénarios
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <StandingsTable
          standings={group.standings}
          teamProbs={summary?.teamProbs}
          highlightCode={highlightCode}
        />
      </CardContent>
    </Card>
  );
}
