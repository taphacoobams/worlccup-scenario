import type { LocalPlayer } from "@/types/data";

function capitalizeNamePart(part: string): string {
  const lower = part.toLowerCase();
  if (!lower) return part;

  if (lower.startsWith("mc") && lower.length > 2) {
    return `Mc${lower.charAt(2).toUpperCase()}${lower.slice(3)}`;
  }
  if (lower.startsWith("mac") && lower.length > 3) {
    return `Mac${lower.charAt(3).toUpperCase()}${lower.slice(4)}`;
  }
  if (lower === "st") return "St.";

  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Nom complet dérivé du fichier photo Guardian (ex. sadio-mane.jpg → Sadio Mane). */
export function fullNameFromPhoto(photo?: string | null): string | null {
  const path = photo?.trim();
  if (!path) return null;

  const base = path.split("/").pop()?.replace(/\.(jpe?g|png|webp)$/i, "");
  if (!base) return null;

  const parts = base.split("-").filter(Boolean);
  if (parts.length === 0) return null;

  return parts.map(capitalizeNamePart).join(" ");
}

/** Nom affiché sur la fiche joueur — nom complet si disponible. */
export function playerFullName(player: Pick<LocalPlayer, "name" | "photo">): string {
  return fullNameFromPhoto(player.photo) ?? player.name;
}
