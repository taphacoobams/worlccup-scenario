import type { LocalTeam } from "@/types/data";
import { slugCode } from "@/lib/data/paths";
import { PATHS } from "@/lib/i18n/paths";
import { slugifyText } from "@/lib/slugs/text";

/** Slug URL à partir du nom d'équipe (ex. « Sénégal » → senegal) */
export function teamSlug(name: string, code?: string): string {
  const slug = slugifyText(name, "");
  if (slug) return slug;
  return code ? slugCode(code) : "equipe";
}

export function teamHref(team: Pick<LocalTeam, "name" | "code">): string {
  return PATHS.equipe(teamSlug(team.name, team.code));
}

export function findTeamIdBySlug(
  slug: string,
  teams: Pick<LocalTeam, "id" | "name" | "code">[]
): number | null {
  const normalized = slug.toLowerCase();
  const match = teams.find((t) => teamSlug(t.name, t.code) === normalized);
  if (match) return match.id;

  const numeric = Number(slug);
  if (Number.isFinite(numeric)) {
    const byId = teams.find((t) => t.id === numeric);
    if (byId) return byId.id;
  }

  return null;
}
