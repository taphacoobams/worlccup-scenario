"use client";

import { QualificationStats } from "@/components/scenarios/QualificationStats";
import { useLocale } from "@/context/locale-context";
import type { TeamScenarioSummaryStats } from "@/lib/scenario-engine/types";
import type { SelectableTeam } from "@/types/team-selection";
import { TeamFlag } from "@/components/ui/team-flag";
import { panelBase } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  team: SelectableTeam;
  stats: TeamScenarioSummaryStats;
  groupLabel: string | null;
};

export function TeamScenarioSummary({ team, stats, groupLabel }: Props) {
  const { t } = useLocale();

  return (
    <section className={cn(panelBase, "p-5 sm:p-6")}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
        <TeamFlag
          code={team.code}
          teamName={team.name}
          size="md"
          className="h-14 w-20 rounded-lg shrink-0 ring-1 ring-white/10"
        />
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold mb-1">
            {t("scenarios.intelligentAnalysis")}
          </p>
          <h2 className="text-xl font-bold">
            {t("scenarios.summaryTitle", { team: team.name })}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("scenarios.summarySubtitle", { group: groupLabel ?? "—" })}
          </p>
        </div>
      </div>
      <QualificationStats stats={stats} />
    </section>
  );
}
