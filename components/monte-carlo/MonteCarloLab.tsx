"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Dices, Play, RotateCcw, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { LabProgressBar } from "@/components/ui/lab-progress-bar";
import { ProbabilityBadge } from "@/components/ui/probability-badge";
import { SitePageHeader } from "@/components/layout/site-page-header";
import { TeamFlag } from "@/components/ui/team-flag";
import { useScenariosContext } from "@/context/scenarios-context";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { runMonteCarloSimulationAsync } from "@/lib/monte-carlo";
import type { MonteCarloResult } from "@/types";

function randomSeed() {
  return Math.floor(Math.random() * 1_000_000);
}

export function MonteCarloLab() {
  const { t } = useLocale();
  const { all: scenarios } = useScenariosContext();
  const { selectedTeam, favoriteGroup } = useTeamContext();
  const groupLabel = favoriteGroup ?? "I";

  const [iterations, setIterations] = useState(10_000);
  const [favoriteBias, setFavoriteBias] = useState(0);
  const [seed, setSeed] = useState(42);
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    if (scenarios.length === 0 || running) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setProgress(0);
    setResult(null);

    const res = await runMonteCarloSimulationAsync(
      scenarios,
      {
        iterations,
        favoriteGroupBias: favoriteBias > 0 ? favoriteBias : undefined,
        favoriteGroup: favoriteGroup ?? "I",
        seed,
      },
      {
        chunkSize: Math.max(250, Math.floor(iterations / 100)),
        onProgress: setProgress,
        signal: controller.signal,
      }
    );

    if (res) setResult(res);
    setRunning(false);
    setProgress(res ? 1 : 0);
  }, [scenarios, running, iterations, favoriteBias, favoriteGroup, seed]);

  const reset = () => {
    abortRef.current?.abort();
    setRunning(false);
    setProgress(0);
    setResult(null);
  };

  const chartData = useMemo(
    () =>
      result?.topOpponents.map((o) => ({
        opponent: o.opponent,
        probability: Number((o.probability * 100).toFixed(1)),
      })) ?? [],
    [result]
  );

  return (
    <div className="page-container max-w-7xl">
      <SitePageHeader
        title={t("monteCarlo.title")}
        description={t("monteCarlo.subtitle", {
          team: selectedTeam.name,
          group: groupLabel,
        })}
        badge={
          <div className="flex items-center gap-2">
            <TeamFlag
              code={selectedTeam.code}
              teamName={selectedTeam.name}
              size="md"
              className="h-8 w-11 rounded-md shrink-0"
            />
            <Dices className="h-5 w-5 text-gold" aria-hidden />
          </div>
        }
      />

      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mb-8">
        <SectionCard
          title={t("monteCarlo.params")}
          description="Ajustez les paramètres puis lancez la simulation par lots."
        >
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium flex justify-between" htmlFor="iterations">
                <span>{t("monteCarlo.iterations")}</span>
                <span className="text-primary tabular-nums">
                  {iterations.toLocaleString("fr-FR")}
                </span>
              </label>
              <input
                id="iterations"
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={iterations}
                disabled={running}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full mt-3 accent-primary disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex justify-between" htmlFor="bias">
                <span>{t("monteCarlo.bias", { group: groupLabel })}</span>
                <span className="text-gold tabular-nums">{(favoriteBias * 100).toFixed(0)}%</span>
              </label>
              <input
                id="bias"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={favoriteBias}
                disabled={running}
                onChange={(e) => setFavoriteBias(Number(e.target.value))}
                className="w-full mt-3 accent-gold disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-sm font-medium flex justify-between" htmlFor="seed">
                <span>Graine (seed)</span>
                <span className="font-mono text-text-secondary tabular-nums">{seed}</span>
              </label>
              <div className="flex gap-2 mt-3">
                <input
                  id="seed"
                  type="number"
                  min={1}
                  max={999999}
                  value={seed}
                  disabled={running}
                  onChange={(e) => setSeed(Number(e.target.value) || 1)}
                  className="flex-1 rounded-xl border border-border bg-white/5 px-3 py-2 text-sm tabular-nums"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={running}
                  onClick={() => setSeed(randomSeed())}
                  aria-label="Nouvelle graine"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <LabProgressBar
              progress={progress}
              active={running}
              label={running ? t("monteCarlo.running") : "Prêt"}
            />

            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={run} disabled={running || scenarios.length === 0} size="lg">
                <Play className="h-4 w-4" />
                {running ? t("monteCarlo.running") : t("monteCarlo.run")}
              </Button>
              {(result || running) && (
                <Button type="button" variant="outline" onClick={reset} disabled={running}>
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <StatCard
            title={`Qualif. groupe ${groupLabel}`}
            value={
              result
                ? `${(result.favoriteGroupQualifiedRate * 100).toFixed(1)}%`
                : running
                  ? "…"
                  : "—"
            }
            icon={Sparkles}
            accent="primary"
          />
          <StatCard
            title="Scénarios source"
            value={scenarios.length.toLocaleString("fr-FR")}
            icon={Dices}
            accent="secondary"
          />
          <StatCard
            title="Itérations"
            value={result?.iterations.toLocaleString("fr-FR") ?? iterations.toLocaleString("fr-FR")}
            accent="gold"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <SectionCard title={t("monteCarlo.topOpponents", { group: groupLabel })}>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="opponent" fontSize={11} tick={{ fill: "rgba(255,255,255,0.5)" }} />
                    <YAxis
                      unit="%"
                      fontSize={11}
                      tick={{ fill: "rgba(255,255,255,0.5)" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(7,17,31,0.95)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                      }}
                      formatter={(v) => [`${Number(v ?? 0)}%`, "Probabilité"]}
                    />
                    <Bar dataKey="probability" fill="#18c964" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            <SectionCard title={t("monteCarlo.ranking")}>
              <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {result.topOpponents.map((o, i) => (
                  <li
                    key={o.opponent}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.03] px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-text-secondary w-5 shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-mono text-gold truncate">{o.opponent}</span>
                    </div>
                    <ProbabilityBadge value={o.probability * 100} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
