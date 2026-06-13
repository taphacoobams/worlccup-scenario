import { redirect, notFound } from "next/navigation";
import { getPlayerBySlug } from "@/lib/api";
import { playerHref } from "@/lib/player-href";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyPlayerRedirect({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerBySlug(id);
  if (!player) notFound();
  redirect(playerHref(player));
}
