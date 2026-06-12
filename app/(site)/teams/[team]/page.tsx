import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamProfile } from "@/components/teams/TeamProfile";
import { TeamSquad } from "@/components/teams/TeamSquad";
import { Button } from "@/components/ui/button";
import { getTeamDetail, getTeamDetailBySlug, getPlayersByTeam } from "@/lib/data";
import { isNumericTeamParam, teamSlug } from "@/lib/team-slug";

type Props = { params: Promise<{ team: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { team: teamParam } = await params;
  const data = isNumericTeamParam(teamParam)
    ? await getTeamDetail(Number(teamParam))
    : await getTeamDetailBySlug(teamParam);
  if (!data) return { title: "Équipe introuvable" };
  return {
    title: data.team.name,
    description: `${data.team.country} — Coupe du Monde 2026`,
  };
}

export default async function TeamDetailPage({ params }: Props) {
  const { team: teamParam } = await params;

  if (isNumericTeamParam(teamParam)) {
    const legacy = await getTeamDetail(Number(teamParam));
    if (!legacy) notFound();
    redirect(`/teams/${teamSlug(legacy.team.name, legacy.team.code)}`);
  }

  const data = await getTeamDetailBySlug(teamParam);
  if (!data) notFound();

  const players = await getPlayersByTeam(data.team.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/teams">
          <ArrowLeft className="h-4 w-4" /> Toutes les équipes
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
