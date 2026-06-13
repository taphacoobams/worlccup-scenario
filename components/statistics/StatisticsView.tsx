"use client";

import { motion } from "framer-motion";
import type { StatisticsViewData } from "@/types/data";
import { TopScorersTable } from "@/components/statistics/TopScorersTable";
import {
  RedCardsTable,
  SuspendedPlayersTable,
  YellowCardsTable,
} from "@/components/statistics/DisciplineTable";
import { StatsEvolutionChart } from "@/components/statistics/StatsEvolutionChart";
import { StatsPodium } from "@/components/statistics/StatsPodium";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilterBar } from "@/components/ui/filter-bar";

type Props = { data: StatisticsViewData };

export function StatisticsView({ data }: Props) {
  return (
    <Tabs defaultValue="scorers" className="w-full">
      <FilterBar sticky className="mb-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent border-0 p-0 w-full justify-start">
          <TabsTrigger value="scorers" className="rounded-xl data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            Buteurs
          </TabsTrigger>
          <TabsTrigger value="assists" className="rounded-xl data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            Passes D.
          </TabsTrigger>
          <TabsTrigger value="yellow" className="rounded-xl data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
            Cartons J
          </TabsTrigger>
          <TabsTrigger value="red" className="rounded-xl data-[state=active]:bg-red-500/15 data-[state=active]:text-red-400">
            Cartons R
          </TabsTrigger>
          <TabsTrigger value="suspended" className="rounded-xl data-[state=active]:bg-secondary/15 data-[state=active]:text-secondary">
            Suspendus
          </TabsTrigger>
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

      {data.evolution && data.evolution.length > 1 && (
        <StatsEvolutionChart points={data.evolution} className="mb-8" />
      )}

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
