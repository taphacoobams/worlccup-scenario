import Link from "next/link";
import type { GroupQualificationSummary } from "@/types/qualification";
import type { WorldCupGroup } from "@/types/worldcup";
import { DataCard, DataCardContent, DataCardDescription, DataCardHeader, DataCardTitle } from "@/components/ui/data-card";
import { StandingsTable } from "@/components/worldcup/StandingsTable";
import { StandingsProbabilityInsights } from "@/components/worldcup/StandingsProbabilityInsights";
import { GROUP_COLORS } from "@/lib/constants";
import { groupHref } from "@/lib/slugs/group";
import type { Group } from "@/types";

type Props = {
  group: WorldCupGroup;
  summary?: GroupQualificationSummary;
  highlightCode?: string;
  /** Désactive le lien vers la page détail (ex. déjà sur la fiche groupe) */
  disableLink?: boolean;
};

export function GroupTable({ group, summary, highlightCode, disableLink }: Props) {
  const letter = group.name.replace(/Groupe\s*/i, "").trim().toUpperCase().slice(0, 1);
  const color = GROUP_COLORS[letter as Group] ?? "#18c964";

  const card = (
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
          <DataCardDescription className="space-y-1">
            <span className="block">
              <strong className="text-foreground font-medium">Classement actuel</strong>
              {" — "}
              basé sur les matchs déjà joués
            </span>
            <span className="block">
              <strong className="text-gold font-medium">P(3e au tableau)</strong>
              {" : "}
              {summary.thirdPlaceScenarioRate}% — projection sur les 495 scénarios FIFA
            </span>
          </DataCardDescription>
        )}
      </DataCardHeader>
      <DataCardContent className="pt-4 px-2 sm:px-5 pb-5 min-w-0">
        <StandingsTable
          standings={group.standings}
          teamProbs={summary?.teamProbs}
          highlightCode={highlightCode}
        />
        {summary && (
          <StandingsProbabilityInsights
            standings={group.standings}
            teamProbs={summary.teamProbs}
            compact
            className="mt-4 px-1"
          />
        )}
      </DataCardContent>
    </DataCard>
  );

  if (disableLink) {
    return <div className="h-full">{card}</div>;
  }

  return (
    <Link href={groupHref(letter)} className="block h-full rounded-xl transition-opacity hover:opacity-95">
      {card}
    </Link>
  );
}
