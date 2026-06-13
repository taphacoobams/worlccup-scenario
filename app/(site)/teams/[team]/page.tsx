import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamProfile } from "@/components/teams/TeamProfile";
import { TeamSquad } from "@/components/teams/TeamSquad";
import { Button } from "@/components/ui/button";
import { getTeamDetailBySlug, getPlayersByTeam } from "@/lib/data";

type Props = { params: Promise<{ team: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { team: teamParam } = await params;
  const data = await getTeamDetailBySlug(teamParam);
  if (!data) return { title: "Équipe introuvable" };
  return {
    title: data.team.name,
    description: `${data.team.country} — Coupe du Monde 2026`,
  };
}

export default async function TeamDetailPage({ params }: Props) {
  const { team: teamParam } = await params;

  const data = await getTeamDetailBySlug(teamParam);
  if (!data) notFound();

  const players = await getPlayersByTeam(data.team.id);

  return (
    <div className="page-container max-w-4xl min-w-0">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>
      </Button>

      <TeamHeader team={data.team} />
      <TeamProfile team={data.team} />

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-6">
          Effectif ({players.length} joueur{players.length !== 1 ? "s" : ""})
        </h2>
        <TeamSquad players={players} team={data.team} />
      </section>

      <p className="text-sm text-muted-foreground text-center mt-10">
        <Link href="/statistics" className="text-senegal-green hover:underline">
          Statistiques du tournoi
        </Link>
        {" · "}
        <Link href="/fixtures" className="text-senegal-green hover:underline">
          Calendrier
        </Link>
      </p>
    </div>
  );
}
