import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayersGrid } from "@/components/players/PlayersGrid";
import { GroupsSkeleton } from "@/components/worldcup/WorldCupSkeleton";
import { getPlayers, getTeams } from "@/lib/data";

export const metadata: Metadata = {
  title: "Joueurs",
  description: "Effectifs officiels FIFA — Coupe du Monde 2026.",
};

export const revalidate = 60;

async function PlayersContent() {
  const [players, teams] = await Promise.all([getPlayers(), getTeams()]);
  return <PlayersGrid players={players} teams={teams} />;
}

export default function PlayersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Joueurs</h1>
        <p className="text-muted-foreground mt-2">
          Effectifs officiels FIFA — photo, numéro et nom
        </p>
      </div>
      <Suspense fallback={<GroupsSkeleton />}>
        <PlayersContent />
      </Suspense>
    </div>
  );
}
