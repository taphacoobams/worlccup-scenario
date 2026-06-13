"use client";

import { KpiCard } from "@/components/analytics/kpi-card";
import { GroupFrequencyChart } from "@/components/charts/group-frequency-chart";
import { FavoriteOpponentChart } from "@/components/charts/opponent-pie-chart";
import { OpponentPieChart } from "@/components/charts/opponent-pie-chart";
import { HeatmapChart } from "@/components/charts/heatmap-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamContext } from "@/context/team-context";
import { useScenarios } from "@/hooks/use-scenarios";
import { useLocale } from "@/context/locale-context";
import { formatPercent } from "@/lib/utils";
import { TeamFlag } from "@/components/ui/team-flag";
import { BarChart3, Flag, Layers, Percent } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function AnalytiquePage() {
  const { t } = useLocale();
  const { selectedTeam, favoriteGroup, stats: favoriteStats } = useTeamContext();
  const { stats: globalStats } = useScenarios();
  const groupLabel = favoriteGroup ?? "I";

  const favoriteDist = Object.entries(favoriteStats.favoriteOpponentFrequencies)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="page-container">
      <div className="mb-8 flex items-start gap-4">
        <TeamFlag
          code={selectedTeam.code}
          teamName={selectedTeam.name}
          size="md"
          className="h-14 w-20 rounded-xl shrink-0 hidden sm:block ring-1 ring-border"
        />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">{t("analytique.title")}</h1>
          <p className="text-text-secondary mt-2">
            {t("analytique.subtitle", { team: selectedTeam.name, group: groupLabel })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          title={t("analytique.totalScenarios")}
          value={globalStats.totalScenarios}
          icon={Layers}
          accent="green"
        />
        <KpiCard
          title={t("analytique.withGroup", { group: groupLabel })}
          value={favoriteStats.favoriteScenarios}
          icon={Flag}
          accent="gold"
        />
        <KpiCard
          title={t("analytique.withoutGroup", { group: groupLabel })}
          value={favoriteStats.nonFavoriteScenarios}
          icon={BarChart3}
        />
        <KpiCard
          title={t("analytique.qualifyProb", { group: groupLabel })}
          value={formatPercent(favoriteStats.favoriteScenarios, favoriteStats.totalScenarios)}
          subtitle={t("analytique.qualifyHint")}
          icon={Percent}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("analytique.groupFreq")}</CardTitle>
          </CardHeader>
          <CardContent>
            <GroupFrequencyChart data={globalStats.groupFrequencies} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {t("analytique.favoriteOpponents", { group: groupLabel, team: selectedTeam.name })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FavoriteOpponentChart
              frequencies={favoriteStats.favoriteOpponentFrequencies}
              teamName={selectedTeam.name}
              groupLetter={groupLabel}
              scenarioCount={favoriteStats.favoriteScenarios}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("analytique.globalOpponents")}</CardTitle>
          </CardHeader>
          <CardContent>
            <OpponentPieChart frequencies={globalStats.opponentFrequencies} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {t("analytique.histogram", { group: groupLabel, team: selectedTeam.name })}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={favoriteDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                <Bar dataKey="value" fill="#00853f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("analytique.heatmap")}</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapChart stats={globalStats} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("analytique.mathSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm font-mono">
          <div className="rounded-lg bg-white/5 p-4">C(12,8) = 495</div>
          <div className="rounded-lg bg-white/5 p-4">
            {t("analytique.withGroupFormula", { group: groupLabel })}
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            {t("analytique.withoutGroupFormula", { group: groupLabel })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
