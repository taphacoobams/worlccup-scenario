import type { Metadata } from "next";
import { StatisticsPageHeader } from "@/components/statistics/StatisticsPageHeader";
import { StatisticsView } from "@/components/statistics/StatisticsView";
import { getStatistics } from "@/lib/data";

export const metadata: Metadata = {
  title: "Statistiques",
  description:
    "Coupe du Monde 2026 — meilleurs buteurs, passeurs et discipline (données locales).",
};

export default async function StatisticsPage() {
  const data = await getStatistics();

  return (
    <div className="page-container max-w-5xl">
      <StatisticsPageHeader />

      <StatisticsView data={data} />
    </div>
  );
}
