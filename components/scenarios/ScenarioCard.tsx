"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ScenarioProbabilityBar } from "@/components/scenarios/ScenarioProbabilityBar";
import { useLocale } from "@/context/locale-context";
import type { EnrichedScenario } from "@/lib/scenario-engine/types";
import type { StandingOutcome } from "@/lib/scenario-engine/types";
import { cn } from "@/lib/utils";
import { panelBase, premiumCardHover } from "@/lib/ui-classes";
import { GroupBadge } from "@/components/ui/badge";
import { TeamFlag } from "@/components/ui/team-flag";

const OUTCOME_STYLES: Record<StandingOutcome, string> = {
  qualified: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  eliminated: "border-red-500/40 bg-red-500/10 text-red-400",
  playoff: "border-gold/40 bg-gold/10 text-gold",
  "third-chance": "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
};

function ScenarioCardInner({ enriched, index = 0 }: { enriched: EnrichedScenario; index?: number }) {
  const { scenario, favoriteGroupSnapshot, favoriteImpact } = enriched;
  const { t } = useLocale();
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3) }}
      className={cn(panelBase, premiumCardHover, "overflow-hidden h-full flex flex-col")}
    >
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-start gap-4 justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg">
              {t("scenarios.scenario")} #{scenario.id}
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              FIFA #{scenario.fifaNumber}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {enriched.qualifiedThirdGroups.map((g) => (
              <GroupBadge key={g} group={g} />
            ))}
          </div>
        </div>
        <div className="w-full sm:w-44 shrink-0">
          <ScenarioProbabilityBar
            score={enriched.probabilityScore}
            confidence={enriched.confidence}
          />
        </div>
      </div>

      {favoriteGroupSnapshot ? (
        <div className="p-4 space-y-3 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("scenarios.groupStandings", { group: favoriteGroupSnapshot.group })}
              {favoriteGroupSnapshot.thirdQualifiesInScenario && (
                <span className="ml-2 text-senegal-green normal-case">
                  {t("scenarios.thirdQualifiedGroup")}
                </span>
              )}
            </p>
            {favoriteGroupSnapshot.simulated && (
              <span className="text-[10px] text-muted-foreground rounded-full bg-white/5 px-2 py-0.5">
                {t("scenarios.simulatedStandings")}
              </span>
            )}
          </div>

          <div className="hidden sm:grid grid-cols-[1.5rem_1.5rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem] gap-1 px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{t("standings.position")}</span>
            <span />
            <span>Équipe</span>
            <span className="text-center">{t("standings.played")}</span>
            <span className="text-center">{t("standings.won")}</span>
            <span className="text-center">{t("standings.draw")}</span>
            <span className="text-center">{t("standings.lost")}</span>
            <span className="text-center">{t("standings.goalsFor")}</span>
            <span className="text-center">{t("standings.goalsAgainst")}</span>
            <span className="text-center">{t("standings.points")}</span>
          </div>

          <ol className="space-y-1.5">
            {favoriteGroupSnapshot.rows.map((row) => (
              <li
                key={row.teamId}
                className={cn(
                  "rounded-lg border text-sm",
                  OUTCOME_STYLES[row.outcome]
                )}
              >
                <div className="grid grid-cols-[1.5rem_1.5rem_1fr_auto] sm:grid-cols-[1.5rem_1.5rem_1fr_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem_2.5rem] gap-1 items-center px-3 py-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {row.position}
                  </span>
                  <TeamFlag code={row.code} teamName={row.name} size="sm" />
                  <span className="font-medium truncate min-w-0">{row.name}</span>

                  <span className="sm:hidden text-xs tabular-nums text-right">
                    {row.points} {t("common.points")} ·{" "}
                    {row.goalDifference >= 0 ? "+" : ""}
                    {row.goalDifference}
                  </span>

                  <span className="hidden sm:block text-center text-xs tabular-nums">
                    {row.played}
                  </span>
                  <span className="hidden sm:block text-center text-xs tabular-nums">
                    {row.won}
                  </span>
                  <span className="hidden sm:block text-center text-xs tabular-nums">
                    {row.draw}
                  </span>
                  <span className="hidden sm:block text-center text-xs tabular-nums">
                    {row.lost}
                  </span>
                  <span className="hidden sm:block text-center text-xs tabular-nums">
                    {row.goalsFor}
                  </span>
                  <span className="hidden sm:block text-center text-xs tabular-nums">
                    {row.goalsAgainst}
                  </span>
                  <span className="hidden sm:block text-center text-xs font-semibold tabular-nums">
                    {row.points}
                  </span>
                </div>
              </li>
            ))}
          </ol>

          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
              <span className="text-emerald-400 font-semibold">{t("common.qualified")}</span>
              <ul className="mt-1 space-y-0.5">
                {favoriteGroupSnapshot.rows
                  .filter((r) => r.outcome === "qualified")
                  .map((r) => (
                    <li key={r.teamId} className="flex items-center gap-1.5">
                      <TeamFlag code={r.code} teamName={r.name} size="sm" className="h-3 w-4" />
                      {r.name}
                      <span className="text-muted-foreground ml-auto tabular-nums">
                        {r.points} {t("common.points")}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
              <span className="text-red-400 font-semibold">{t("common.eliminated")}</span>
              <ul className="mt-1 space-y-0.5">
                {favoriteGroupSnapshot.rows
                  .filter((r) => r.outcome === "eliminated")
                  .map((r) => (
                    <li key={r.teamId} className="flex items-center gap-1.5">
                      <TeamFlag code={r.code} teamName={r.name} size="sm" className="h-3 w-4" />
                      {r.name}
                      <span className="text-muted-foreground ml-auto tabular-nums">
                        {r.points} {t("common.points")}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="p-4 text-sm text-muted-foreground">{t("scenarios.noGroupData")}</p>
      )}

      {favoriteImpact && (
        <div className="px-4 pb-4 flex flex-wrap gap-2 text-xs shrink-0">
          {favoriteImpact.reachesRoundOf16 && (
            <span className="rounded-full bg-senegal-green/20 text-senegal-green px-2 py-1">
              {t("scenarios.roundOf32Possible")}
            </span>
          )}
          {favoriteImpact.roundOf32Opponent && (
            <span className="rounded-full bg-gold/20 text-gold px-2 py-1 font-mono">
              {favoriteImpact.roundOf32Opponent}
            </span>
          )}
          <span className="rounded-full bg-white/10 px-2 py-1">
            {t("scenarios.favorability")}{" "}
            {Math.round(favoriteImpact.favorabilityScore)}%
          </span>
        </div>
      )}
    </motion.article>
  );
}

export const ScenarioCard = memo(ScenarioCardInner);
