import { slugifyText } from "@/lib/slugs/text";
import { PATHS } from "@/lib/i18n/paths";

export function playerSlug(name: string): string {
  return slugifyText(name, "joueur");
}

export function playerHref(player: { id: number; name: string }): string {
  return PATHS.joueur(playerSlug(player.name));
}

export function findPlayerIdBySlug(
  slug: string,
  players: { id: number; name: string }[]
): number | null {
  const normalized = slug.trim().toLowerCase();
  const bySlug = players.find((p) => playerSlug(p.name) === normalized);
  if (bySlug) return bySlug.id;

  const numeric = Number(normalized);
  if (Number.isFinite(numeric) && numeric > 0) {
    const byId = players.find((p) => p.id === numeric);
    if (byId) return byId.id;
  }
  return null;
}
