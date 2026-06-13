import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { FixturesExplorerClient } from "@/components/worldcup/FixturesExplorerClient";
import { FixturesSkeleton } from "@/components/worldcup/WorldCupSkeleton";
import { SitePageHeader } from "@/components/layout/site-page-header";
import {
  buildGroupSummaries,
  getWorldCupFixtures,
  getWorldCupGroups,
} from "@/lib/worldcup-data";
import type { Group } from "@/types";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Calendrier & Résultats",
  description: "Calendrier Coupe du Monde 2026 — saisie manuelle des matchs et résultats.",
};

export const revalidate = 60;

async function FixturesContent() {
  const [fixtures, groups] = await Promise.all([
    getWorldCupFixtures(),
    getWorldCupGroups(),
  ]);
  const groupSummaries = buildGroupSummaries(groups) as Record<Group, string>;
  const groupStandingsByLetter = Object.fromEntries(
    groups.map((g) => [g.letter.toUpperCase(), g.standings])
  );

  if (fixtures.length === 0) {
    return (
      <div className="text-center text-text-secondary py-12 space-y-4">
        <p>Aucun match enregistré.</p>
        <Button asChild>
          <Link href="/dashboard/matches">Ajouter des matchs dans le Manager</Link>
        </Button>
      </div>
    );
  }

  return (
    <FixturesExplorerClient
      fixtures={fixtures}
      groupSummaries={groupSummaries}
      groupStandingsByLetter={groupStandingsByLetter}
    />
  );
}

export default function FixturesPage() {
  return (
    <div className="page-container">
      <SitePageHeader
        title="Calendrier & Résultats"
        description="104 matchs — phase de groupes et éliminatoires. Filtres par phase, groupe, date et recherche instantanée."
      />
      <Suspense fallback={<FixturesSkeleton />}>
        <FixturesContent />
      </Suspense>
    </div>
  );
}
