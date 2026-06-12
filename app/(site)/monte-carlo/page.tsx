"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScenariosContext } from "@/context/scenarios-context";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { runMonteCarloSimulation } from "@/lib/monte-carlo";
import type { MonteCarloResult } from "@/types";
import { TeamFlag } from "@/components/ui/team-flag";
import { Dices, Play } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function MonteCarloPage() {
  const { t } = useLocale();
  const { all: scenarios } = useScenariosContext();
  const { selectedTeam, favoriteGroup } = useTeamContext();
  const groupLabel = favoriteGroup ?? "I";
  const [iterations, setIterations] = useState(10000);
  const [favoriteBias, setFavoriteBias] = useState(0);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    if (scenarios.length === 0) return;
    setRunning(true);
    await new Promise((r) => setTimeout(r, 50));
    const res = runMonteCarloSimulation(scenarios, {
      iterations,
      favoriteGroupBias: favoriteBias > 0 ? favoriteBias : undefined,
      favoriteGroup: favoriteGroup ?? "I",
      seed: 42,
    });
    setResult(res);
    setRunning(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <TeamFlag
          code={selectedTeam.code}
          teamName={selectedTeam.name}
          size="md"
          className="h-10 w-14 rounded-lg shrink-0"
        />
        <Dices className="h-8 w-8 text-gold shrink-0" aria-hidden />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("monteCarlo.title")}</h1>
          <p className="text-muted-foreground">
            {t("monteCarlo.subtitle", { team: selectedTeam.name, group: groupLabel })}
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("monteCarlo.params")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium" htmlFor="iterations">
              {t("monteCarlo.iterations")} : {iterations.toLocaleString("fr-FR")}
            </label>
            <input
              id="iterations"
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full mt-2 accent-senegal-green"
            />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="bias">
              {t("monteCarlo.bias", { group: groupLabel })} : {(favoriteBias * 100).toFixed(0)}%
            </label>
            <input
              id="bias"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={favoriteBias}
              onChange={(e) => setFavoriteBias(Number(e.target.value))}
              className="w-full mt-2 accent-gold"
            />
          </div>
          <Button onClick={run} disabled={running || scenarios.length === 0} size="lg">
            <Play className="h-4 w-4" />
            {running ? t("monteCarlo.running") : t("monteCarlo.run")}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("monteCarlo.results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                {t("monteCarlo.qualifyRate", { group: groupLabel })} :{" "}
                <strong>
                  {(result.favoriteGroupQualifiedRate * 100).toFixed(2)}%
                </strong>
              </p>
              <p>
                {t("monteCarlo.iterations")} : {result.iterations.toLocaleString("fr-FR")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("monteCarlo.topOpponents", { group: groupLabel })}</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.topOpponents}>
                  <XAxis dataKey="opponent" fontSize={10} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="probability" fill="#d4af37" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t("monteCarlo.ranking")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid sm:grid-cols-2 gap-2">
                {result.topOpponents.map((o) => (
                  <li
                    key={o.opponent}
                    className="flex justify-between rounded-lg border border-white/10 px-4 py-2 text-sm"
                  >
                    <span className="font-mono text-gold">{o.opponent}</span>
                    <span>{(o.probability * 100).toFixed(2)}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
