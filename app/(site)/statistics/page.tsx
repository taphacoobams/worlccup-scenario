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
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <StatisticsPageHeader />

      <StatisticsView data={data} />
    </div>
  );
}
