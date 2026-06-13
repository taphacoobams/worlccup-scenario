import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayersGrid } from "@/components/players/PlayersGrid";
import { SitePageHeader } from "@/components/layout/site-page-header";
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
    <div className="page-container">
      <SitePageHeader
        title="Joueurs"
        description="Base de données des effectifs — recherche temps réel, filtres équipe et poste"
      />
      <Suspense fallback={<GroupsSkeleton />}>
        <PlayersContent />
      </Suspense>
    </div>
  );
}
