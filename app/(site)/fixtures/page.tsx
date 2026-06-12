import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { FixturesExplorerClient } from "@/components/worldcup/FixturesExplorerClient";
import { FixturesSkeleton } from "@/components/worldcup/WorldCupSkeleton";
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

  if (fixtures.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 space-y-4">
        <p>Aucun match enregistré.</p>
        <Button asChild>
          <Link href="/dashboard/matches">Ajouter des matchs dans le Manager</Link>
        </Button>
      </div>
    );
  }

  return (
    <FixturesExplorerClient fixtures={fixtures} groupSummaries={groupSummaries} />
  );
}

export default function FixturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Calendrier & Résultats</h1>
        <p className="text-muted-foreground mt-2">
          104 matchs — 72 en phase de groupes et 32 en éliminatoires. Filtrez par
          groupe, date ou tour ; scores visibles si statut FT / AET / PEN.
        </p>
      </div>
      <Suspense fallback={<FixturesSkeleton />}>
        <FixturesContent />
      </Suspense>
    </div>
  );
}
