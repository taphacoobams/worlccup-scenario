import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamsPageSearch } from "@/components/teams/TeamsPageSearch";
import { GroupsSkeleton } from "@/components/worldcup/WorldCupSkeleton";
import { SitePageHeader } from "@/components/layout/site-page-header";
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
    <div className="page-container">
      <SitePageHeader
        title="Équipes"
        description={`${WORLD_CUP_STATS.teams} nations qualifiées — galerie premium avec recherche instantanée`}
      />
      <Suspense fallback={<GroupsSkeleton />}>
        <TeamsContent />
      </Suspense>
    </div>
  );
}
