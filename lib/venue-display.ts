/** Libellés français pour villes / pays des stades CDM 2026 */
const CITY_DISPLAY: Record<string, { label: string; country?: string }> = {
  Mexico: { label: "Mexico", country: "Mexique" },
  Guadalajara: { label: "Guadalajara", country: "Mexique" },
  Monterrey: { label: "Monterrey", country: "Mexique" },
  Toronto: { label: "Toronto", country: "Canada" },
  Vancouver: { label: "Vancouver", country: "Canada" },
  Arlington: { label: "Arlington", country: "États-Unis" },
  Atlanta: { label: "Atlanta", country: "États-Unis" },
  Boston: { label: "Boston", country: "États-Unis" },
  Houston: { label: "Houston", country: "États-Unis" },
  "Kansas City": { label: "Kansas City", country: "États-Unis" },
  "Los Angeles": { label: "Los Angeles", country: "États-Unis" },
  Miami: { label: "Miami", country: "États-Unis" },
  "New York": { label: "New York", country: "États-Unis" },
  Philadelphie: { label: "Philadelphie", country: "États-Unis" },
  "Santa Clara": { label: "Santa Clara", country: "États-Unis" },
  Seattle: { label: "Seattle", country: "États-Unis" },
};

const TZ_LABELS: Record<string, string> = {
  UTC: "UTC",
  "America/Mexico_City": "heure du Mexique",
  "America/New_York": "heure de l'Est (US)",
  "America/Los_Angeles": "heure du Pacifique (US)",
  "America/Chicago": "heure du Centre (US)",
  "America/Denver": "heure des Rocheuses (US)",
  "America/Toronto": "heure de l'Est (Canada)",
  "America/Vancouver": "heure du Pacifique (Canada)",
};

export function formatVenueCity(city: string): string {
  const key = city.trim();
  const entry = CITY_DISPLAY[key];
  if (entry?.country) return `${entry.label}, ${entry.country}`;
  return entry?.label ?? key;
}

export function formatVenueLocation(name: string, city: string): {
  stadium: string;
  location: string;
} {
  return {
    stadium: name.trim(),
    location: formatVenueCity(city),
  };
}

export function formatFixtureKickoff(
  dateIso: string,
  timezone = "UTC"
): { dateLine: string; timeLine: string; timezoneHint?: string } {
  const d = new Date(dateIso);
  const tz = timezone || "UTC";

  const dateLine = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: tz,
  }).format(d);

  const timeLine = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(d);

  const timezoneHint =
    tz === "UTC" ? "Heure officielle (UTC)" : TZ_LABELS[tz] ?? tz;

  return { dateLine, timeLine, timezoneHint };
}
