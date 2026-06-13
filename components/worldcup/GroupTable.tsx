import type { GroupQualificationSummary } from "@/types/qualification";
import type { WorldCupGroup } from "@/types/worldcup";
import { DataCard, DataCardContent, DataCardDescription, DataCardHeader, DataCardTitle } from "@/components/ui/data-card";
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
  const color = GROUP_COLORS[letter as Group] ?? "#18c964";

  return (
    <DataCard
      className="overflow-hidden h-full min-w-0"
      style={{ borderTopColor: `${color}50`, borderTopWidth: 2 }}
    >
      <DataCardHeader className="pb-4">
        <DataCardTitle className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-lg"
            style={{ backgroundColor: color, boxShadow: `0 4px 20px ${color}40` }}
          >
            {letter}
          </span>
          {group.name}
        </DataCardTitle>
        {summary && (
          <DataCardDescription>
            P(3e au tableau) :{" "}
            <strong className="text-gold">{summary.thirdPlaceScenarioRate}%</strong>
          </DataCardDescription>
        )}
      </DataCardHeader>
      <DataCardContent className="pt-4 px-2 sm:px-5 pb-5 min-w-0">
        <StandingsTable
          standings={group.standings}
          teamProbs={summary?.teamProbs}
          highlightCode={highlightCode}
        />
      </DataCardContent>
    </DataCard>
  );
}
