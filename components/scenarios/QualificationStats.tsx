"use client";

import { KpiCard } from "@/components/analytics/kpi-card";
import { useLocale } from "@/context/locale-context";
import type { TeamScenarioSummaryStats } from "@/lib/scenario-engine/types";
import { Flag, Shield, Target, Trophy, XCircle } from "lucide-react";

type Props = {
  stats: TeamScenarioSummaryStats;
};

export function QualificationStats({ stats }: Props) {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <KpiCard
        title={t("scenarios.qualificationThird")}
        value={`${stats.qualificationPercent}%`}
        subtitle={`${stats.scenariosWithThirdQualify} / ${stats.totalScenarios}`}
        icon={Target}
        accent="green"
      />
      <KpiCard
        title={t("scenarios.firstPlace")}
        value={`${stats.firstPlacePercent}%`}
        icon={Trophy}
        accent="gold"
      />
      <KpiCard
        title={t("scenarios.secondPlace")}
        value={`${stats.secondPlacePercent}%`}
        icon={Shield}
      />
      <KpiCard
        title={t("common.roundOf16")}
        value={`${stats.roundOf16Percent}%`}
        icon={Flag}
        accent="green"
      />
      <KpiCard
        title={t("scenarios.elimination")}
        value={`${stats.eliminationPercent}%`}
        icon={XCircle}
      />
    </div>
  );
}
