/** Crédit contenu Guardian (bios, analyses, photos). */
export const GUARDIAN_CREDIT = "The Guardian";

export const GUARDIAN_CREDIT_URL =
  "https://www.theguardian.com/football/world-cup-2026";

export function hasGuardianTeamContent(team: {
  bio?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
}): boolean {
  return Boolean(
    team.bio?.trim() || team.strengths?.trim() || team.weaknesses?.trim()
  );
}

export function guardianBioCredit(bio?: string | null): string | null {
  return bio?.trim() ? GUARDIAN_CREDIT : null;
}

export function guardianImageCredit(photo?: string | null): string | null {
  if (!photo?.trim()) return null;
  if (photo.includes("placeholder")) return null;
  return photo.startsWith("/players/") ? GUARDIAN_CREDIT : null;
}
