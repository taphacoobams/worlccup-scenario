import { RecalculateScenariosButton } from "@/components/manager/scenarios/RecalculateScenariosButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getManagerScenarioInsights,
  getSenegalAnalysis,
} from "@/lib/manager/stats";
import { getBestScenariosForTeam, computeTeamScenarioSummary } from "@/lib/scenario-engine";
import { getAllScenarios } from "@/lib/scenarios/server";
import { getScenarioEngineData } from "@/lib/scenarios/engine-data";
import { prisma } from "@/lib/prisma";
import type { Group } from "@/types";

export const dynamic = "force-dynamic";

export default async function ManagerScenariosPage() {
  const { total, mostLikely, leastLikely } = await getManagerScenarioInsights();
  const senegal = await getSenegalAnalysis();

  const senegalTeam = await prisma.team.findFirst({
    where: { OR: [{ code: "SEN" }, { name: { contains: "Sénégal", mode: "insensitive" } }] },
  });

  let bestSenegal = "—";
  let worstSenegal = "—";
  if (senegalTeam) {
    const engineData = await getScenarioEngineData();
    const base = await getAllScenarios();
    const { generateScenarios } = await import("@/lib/scenario-engine");
    const favoriteTeam =
      engineData.teams.find((t) => t.id === senegalTeam.legacyId) ?? null;
    const group = (senegalTeam.group?.toUpperCase() ?? null) as Group | null;
    const enriched = generateScenarios(
      base,
      engineData.teams,
      engineData.standings,
      engineData.fixtures,
      favoriteTeam,
      group
    );
    const best = getBestScenariosForTeam(enriched, 1)[0];
    const summary = computeTeamScenarioSummary(
      enriched,
      senegalTeam.legacyId,
      senegalTeam.name,
      group
    );
    bestSenegal = best
      ? `FIFA #${best.scenario.fifaNumber} (${best.probabilityScore}%)`
      : "—";
    worstSenegal = `${summary.eliminationPercent}% élimination`;
  }

  const chartData = [
    { label: "Qualification", value: senegal.qualificationPercent },
    { label: "Élimination", value: 100 - senegal.qualificationPercent },
    { label: "1re place", value: senegal.firstPlacePercent },
    { label: "Huitièmes", value: senegal.roundOf16Percent },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Scenarios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lecture seule — {total} scénarios FIFA recalculés depuis les matchs.
          </p>
        </div>
        <RecalculateScenariosButton />
      </div>

      <div className="rounded-xl border border-senegal-green/30 bg-senegal-green/10 p-6 text-center">
        <p className="text-4xl font-bold text-senegal-green tabular-nums">{total}</p>
        <p className="text-sm text-muted-foreground mt-1">scénarios FIFA</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Plus probable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-mono text-gold">
            {mostLikely[0] ? `Groupe ${mostLikely[0][0]} (${mostLikely[0][1].toFixed(1)}%)` : "—"}
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Moins probable</CardTitle>
          </CardHeader>
          <CardContent className="text-sm font-mono">
            {leastLikely[0] ? `Groupe ${leastLikely[0][0]} (${leastLikely[0][1].toFixed(1)}%)` : "—"}
          </CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Meilleur scénario Sénégal</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{bestSenegal}</CardContent>
        </Card>
        <Card className="border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pire scénario Sénégal</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{worstSenegal}</CardContent>
        </Card>
      </div>

      <Card className="border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Probabilités Sénégal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chartData.map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="tabular-nums">{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-senegal-green rounded-full"
                  style={{ width: `${Math.min(100, value)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
