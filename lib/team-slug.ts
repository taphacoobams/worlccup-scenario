import type { LocalTeam } from "@/types/data";
import { slugCode } from "@/lib/data/paths";

/** Slug URL à partir du nom d'équipe (ex. « Sénégal » → senegal) */
export function teamSlug(name: string, code?: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (slug) return slug;
  return code ? slugCode(code) : "equipe";
}

export function teamHref(team: Pick<LocalTeam, "name" | "code">): string {
  return `/teams/${teamSlug(team.name, team.code)}`;
}

export function findTeamIdBySlug(
  slug: string,
  teams: Pick<LocalTeam, "id" | "name" | "code">[]
): number | null {
  const normalized = slug.toLowerCase();
  const match = teams.find((t) => teamSlug(t.name, t.code) === normalized);
  return match?.id ?? null;
}
