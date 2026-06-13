import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { SitePageHeader } from "@/components/layout/site-page-header";
import { KnockoutView } from "@/components/worldcup/KnockoutView";
import { FixturesSkeleton } from "@/components/worldcup/WorldCupSkeleton";
import { getKnockoutBracket, getKnockoutTableau } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Phase finale",
  description: "Tableau à élimination directe — Coupe du Monde 2026.",
};

export const revalidate = 60;

async function KnockoutContent() {
  const [rounds, tableau] = await Promise.all([
    getKnockoutBracket(),
    getKnockoutTableau(),
  ]);

  if (rounds.length === 0 && tableau.length === 0) {
    return (
      <div className="space-y-6 text-center py-12">
        <p className="text-muted-foreground max-w-md mx-auto">
          Le tableau de la phase finale sera affiché ici dès que les matchs éliminatoires sont
          configurés.
        </p>
        <Button asChild variant="outline">
          <Link href="/fixtures">Voir le calendrier</Link>
        </Button>
      </div>
    );
  }

  return <KnockoutView rounds={rounds} tableau={tableau} />;
}

export default function KnockoutPage() {
  return (
    <div className="page-container max-w-[1600px]">
      <SitePageHeader
        title="Phase finale"
        description="Tableau à élimination directe — seizièmes de finale jusqu'à la finale"
      />
      <Suspense fallback={<FixturesSkeleton />}>
        <KnockoutContent />
      </Suspense>
    </div>
  );
}
