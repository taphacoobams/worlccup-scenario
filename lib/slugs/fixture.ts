import { slugifyText } from "@/lib/slugs/text";
import { PATHS } from "@/lib/i18n/paths";

type FixtureTeams = {
  id: number;
  teams: {
    home: { name: string };
    away: { name: string };
  };
};

/** Slug canonique : id numérique (ex. /matchs/1) */
export function fixtureSlugFor(f: Pick<FixtureTeams, "id">): string {
  return String(f.id);
}

export function fixtureHref(fixture: FixtureTeams, _all?: FixtureTeams[]): string {
  return PATHS.match(fixtureSlugFor(fixture));
}

/** Ancien format « equipe-equipe » — résolution des URLs legacy */
function legacyFixtureSlug(f: FixtureTeams): string {
  return `${slugifyText(f.teams.home.name, "domicile")}-${slugifyText(f.teams.away.name, "exterieur")}`;
}

export function findFixtureBySlug<T extends FixtureTeams>(
  slug: string,
  fixtures: T[]
): T | null {
  const normalized = slug.trim().toLowerCase();

  const id = Number(normalized);
  if (Number.isFinite(id) && id > 0) {
    return fixtures.find((f) => f.id === id) ?? null;
  }

  const idSuffix = normalized.match(/-(\d+)$/);
  if (idSuffix) {
    const suffixId = Number(idSuffix[1]);
    const byId = fixtures.find((f) => f.id === suffixId);
    if (byId) return byId;
  }

  const byLegacy = fixtures.filter(
    (f) => legacyFixtureSlug(f).toLowerCase() === normalized
  );
  if (byLegacy.length === 1) return byLegacy[0];
  if (byLegacy.length > 1 && idSuffix) {
    const suffixId = Number(idSuffix[1]);
    return byLegacy.find((f) => f.id === suffixId) ?? byLegacy[0];
  }
  return byLegacy[0] ?? null;
}
