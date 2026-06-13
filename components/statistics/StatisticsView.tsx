"use client";

import { motion } from "framer-motion";
import type { StatisticsViewData } from "@/types/data";
import { TopScorersTable } from "@/components/statistics/TopScorersTable";
import {
  RedCardsTable,
  SuspendedPlayersTable,
  YellowCardsTable,
} from "@/components/statistics/DisciplineTable";
import { StatsPodium } from "@/components/statistics/StatsPodium";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from "@/components/ui/filter-bar";
import { useLocale } from "@/context/locale-context";
import { cn } from "@/lib/utils";

type Props = { data: StatisticsViewData };

const TAB_TRIGGER =
  "shrink-0 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-white/20 hover:bg-white/[0.04] hover:text-foreground";

export function StatisticsView({ data }: Props) {
  const { t } = useLocale();

  const tabs = [
    {
      value: "scorers",
      label: t("statistics.tabScorers"),
      active: "data-[state=active]:border-primary/30 data-[state=active]:bg-primary/15 data-[state=active]:text-primary",
    },
    {
      value: "assists",
      label: t("statistics.tabAssists"),
      active: "data-[state=active]:border-primary/30 data-[state=active]:bg-primary/15 data-[state=active]:text-primary",
    },
    {
      value: "yellow",
      label: t("statistics.tabYellowCards"),
      active: "data-[state=active]:border-gold/30 data-[state=active]:bg-gold/15 data-[state=active]:text-gold",
    },
    {
      value: "red",
      label: t("statistics.tabRedCards"),
      active: "data-[state=active]:border-red-500/30 data-[state=active]:bg-red-500/15 data-[state=active]:text-red-400",
    },
    {
      value: "suspended",
      label: t("statistics.tabSuspended"),
      active: "data-[state=active]:border-secondary/30 data-[state=active]:bg-secondary/15 data-[state=active]:text-secondary",
    },
  ] as const;

  return (
    <Tabs defaultValue="scorers" className="w-full">
      <FilterBar sticky className="mb-6">
        <TabsList className="flex h-auto w-full flex-wrap items-center justify-start gap-2 border-0 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(TAB_TRIGGER, tab.active)}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </FilterBar>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-text-secondary mb-4"
      >
        Données tournoi ·{" "}
        {new Date(data.updatedAt).toLocaleString("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </motion.p>

      <TabsContent value="scorers" className="mt-0">
        <StatsPodium players={data.topScorers} mode="goals" />
        <TopScorersTable players={data.topScorers} mode="goals" />
      </TabsContent>
      <TabsContent value="assists" className="mt-0">
        <StatsPodium players={data.topAssists} mode="assists" />
        <TopScorersTable players={data.topAssists} mode="assists" />
      </TabsContent>
      <TabsContent value="yellow" className="mt-0">
        <YellowCardsTable players={data.topYellowCards} />
      </TabsContent>
      <TabsContent value="red" className="mt-0">
        <RedCardsTable players={data.topRedCards} />
      </TabsContent>
      <TabsContent value="suspended" className="mt-0">
        <SuspendedPlayersTable players={data.suspended} />
      </TabsContent>
    </Tabs>
  );
}
