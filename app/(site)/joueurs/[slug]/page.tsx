import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerProfileView } from "@/components/players/PlayerProfileView";
import { getPlayerBySlug, getTeamById } from "@/lib/api";
import { playerFullName } from "@/lib/player-display";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return { title: "Joueur introuvable" };
  return {
    title: playerFullName(player),
    description: player.bio?.slice(0, 160) ?? `Fiche joueur — Coupe du Monde 2026`,
  };
}

export default async function JoueurDetailPage({ params }: Props) {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) notFound();

  const team = await getTeamById(player.teamId);

  return <PlayerProfileView player={player} team={team} />;
}
