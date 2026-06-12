/** Sous-titre pays — évite de répéter le nom quand country === name (données locales). */
export function teamCountrySubtitle(
  team: { name: string; country?: string | null }
): string | null {
  const country = team.country?.trim();
  if (!country) return null;
  if (country.toLowerCase() === team.name.trim().toLowerCase()) return null;
  return country;
}
