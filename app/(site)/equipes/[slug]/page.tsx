import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamPresentation } from "@/components/teams/TeamPresentation";
import { TeamStrengthsWeaknesses } from "@/components/teams/TeamStrengthsWeaknesses";
import { KeyPlayerCard } from "@/components/teams/KeyPlayerCard";
import { RecentMatches } from "@/components/teams/RecentMatches";
import { QuickStats } from "@/components/teams/QuickStats";
import { SquadSection } from "@/components/teams/SquadSection";
import { Button } from "@/components/ui/button";
import { getTeamDetailBySlug, getPlayersByTeam, getLocalFixtures } from "@/lib/api";
import { PATHS } from "@/lib/i18n/paths";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTeamDetailBySlug(slug);
  if (!data) return { title: "Équipe introuvable" };
  return {
    title: data.team.name,
    description: `${data.team.country} — Coupe du Monde 2026`,
  };
}

export default async function EquipeDetailPage({ params }: Props) {
  const { slug } = await params;

  const data = await getTeamDetailBySlug(slug);
  if (!data) notFound();

  const players = await getPlayersByTeam(data.team.id);
  const fixtures = await getLocalFixtures();

  // Find key player from playerPick
  const keyPlayer = data.team.playerPick
    ? players.find(p => p.name.toLowerCase().includes(data.team.playerPick!.toLowerCase()))
    : players[0];

  return (
    <div className="page-container max-w-5xl min-w-0">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>
      </Button>

      <TeamHeader team={data.team} />

      <div className="mt-8 space-y-8">
        <TeamPresentation team={data.team} />
        <TeamStrengthsWeaknesses team={data.team} />
        
        {keyPlayer && (
          <section>
            <h2 className="text-xl font-bold mb-4">Joueur clé</h2>
            <KeyPlayerCard player={keyPlayer} />
          </section>
        )}

        <RecentMatches team={data.team} fixtures={fixtures} />
        <QuickStats team={data.team} fixtures={fixtures} />

        <section>
          <h2 className="text-xl font-bold mb-4">
            Effectif ({players.length} joueur{players.length !== 1 ? "s" : ""})
          </h2>
          <SquadSection players={players} />
        </section>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-10">
        <Link href={PATHS.statistiques} className="text-senegal-green hover:underline">
          Statistiques du tournoi
        </Link>
        {" · "}
        <Link href={PATHS.matchs} className="text-senegal-green hover:underline">
          Calendrier
        </Link>
      </p>
    </div>
  );
}
