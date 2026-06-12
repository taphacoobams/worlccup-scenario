import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { KnockoutView } from "@/components/worldcup/KnockoutView";
import { FixturesSkeleton } from "@/components/worldcup/WorldCupSkeleton";
import { getKnockoutBracket, getKnockoutTableau } from "@/lib/worldcup-data";
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
    <div className="mx-auto max-w-[1600px] px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Phase finale</h1>
        <p className="text-muted-foreground mt-2">
          Tableau à élimination directe — seizièmes de finale jusqu&apos;à la
          finale
        </p>
      </div>
      <Suspense fallback={<FixturesSkeleton />}>
        <KnockoutContent />
      </Suspense>
    </div>
  );
}
