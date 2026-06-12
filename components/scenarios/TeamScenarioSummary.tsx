"use client";

import { motion } from "framer-motion";
import { QualificationStats } from "@/components/scenarios/QualificationStats";
import { useLocale } from "@/context/locale-context";
import type { TeamScenarioSummaryStats } from "@/lib/scenario-engine/types";
import type { SelectableTeam } from "@/types/team-selection";
import { TeamFlag } from "@/components/ui/team-flag";
import { Sparkles } from "lucide-react";

type Props = {
  team: SelectableTeam;
  stats: TeamScenarioSummaryStats;
  groupLabel: string | null;
};

export function TeamScenarioSummary({ team, stats, groupLabel }: Props) {
  const { t } = useLocale();

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-senegal-green/10 via-transparent to-gold/5 p-6 backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <TeamFlag
          code={team.code}
          teamName={team.name}
          size="md"
          className="h-16 w-24 rounded-xl shrink-0"
        />
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-gold mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            {t("scenarios.intelligentAnalysis")}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("scenarios.summaryTitle", { team: team.name })}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("scenarios.summarySubtitle", { group: groupLabel ?? "—" })}
          </p>
        </div>
      </div>
      <QualificationStats stats={stats} />
    </motion.section>
  );
}
