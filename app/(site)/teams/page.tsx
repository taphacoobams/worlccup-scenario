import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamsPageSearch } from "@/components/teams/TeamsPageSearch";
import { GroupsSkeleton } from "@/components/worldcup/WorldCupSkeleton";
import { getTeamsPageData } from "@/lib/data";
import { WORLD_CUP_STATS } from "@/lib/constants/worldcup";

export const metadata: Metadata = {
  title: "Équipes",
  description: `Les ${WORLD_CUP_STATS.teams} nations qualifiées — Coupe du Monde FIFA 2026.`,
};

async function TeamsContent() {
  const teams = await getTeamsPageData();
  return <TeamsPageSearch teams={teams} />;
}

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Équipes</h1>
        <p className="text-muted-foreground mt-2">
          {WORLD_CUP_STATS.teams} nations qualifiées — Coupe du Monde 2026
        </p>
      </div>
      <Suspense fallback={<GroupsSkeleton />}>
        <TeamsContent />
      </Suspense>
    </div>
  );
}
