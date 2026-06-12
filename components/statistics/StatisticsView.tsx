"use client";

import { motion } from "framer-motion";
import type { StatisticsViewData } from "@/types/data";
import { TopScorersTable } from "@/components/statistics/TopScorersTable";
import {
  RedCardsTable,
  SuspendedPlayersTable,
  YellowCardsTable,
} from "@/components/statistics/DisciplineTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = { data: StatisticsViewData };

export function StatisticsView({ data }: Props) {
  return (
    <Tabs defaultValue="scorers" className="w-full">
      <TabsList className="flex flex-wrap h-auto gap-1 bg-white/5 border border-white/10 p-1 rounded-xl sticky top-16 z-20 backdrop-blur-md">
        <TabsTrigger value="scorers">Buteurs</TabsTrigger>
        <TabsTrigger value="assists">Passes D.</TabsTrigger>
        <TabsTrigger value="yellow">Cartons J</TabsTrigger>
        <TabsTrigger value="red">Cartons R</TabsTrigger>
        <TabsTrigger value="suspended">Suspendus</TabsTrigger>
      </TabsList>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-muted-foreground mt-4"
      >
        Données locales ·{" "}
        {new Date(data.updatedAt).toLocaleString("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </motion.p>

      <TabsContent value="scorers" className="mt-6">
        <TopScorersTable players={data.topScorers} mode="goals" />
      </TabsContent>
      <TabsContent value="assists" className="mt-6">
        <TopScorersTable players={data.topAssists} mode="assists" />
      </TabsContent>
      <TabsContent value="yellow" className="mt-6">
        <YellowCardsTable players={data.topYellowCards} />
      </TabsContent>
      <TabsContent value="red" className="mt-6">
        <RedCardsTable players={data.topRedCards} />
      </TabsContent>
      <TabsContent value="suspended" className="mt-6">
        <SuspendedPlayersTable players={data.suspended} />
      </TabsContent>
    </Tabs>
  );
}
