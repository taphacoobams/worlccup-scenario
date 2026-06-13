import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayerProfileView } from "@/components/players/PlayerProfileView";
import { getPlayerById, getTeamById } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId)) return { title: "Joueur introuvable" };
  const player = await getPlayerById(playerId);
  if (!player) return { title: "Joueur introuvable" };
  return {
    title: player.name,
    description: player.bio?.slice(0, 160) ?? `Fiche joueur — Coupe du Monde 2026`,
  };
}

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const playerId = Number(id);
  if (!Number.isFinite(playerId)) notFound();

  const player = await getPlayerById(playerId);
  if (!player) notFound();

  const team = await getTeamById(player.teamId);

  return <PlayerProfileView player={player} team={team} />;
}
