import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamProfile } from "@/components/teams/TeamProfile";
import { TeamSquad } from "@/components/teams/TeamSquad";
import { Button } from "@/components/ui/button";
import { getTeamDetailBySlug, getPlayersByTeam } from "@/lib/api";
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
