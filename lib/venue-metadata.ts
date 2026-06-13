/** Métadonnées stades CDM 2026 — capacités, visuels, localisation */

export type VenueWeather = {
  temperatureC: number;
  condition: string;
  icon: "sun" | "cloud" | "rain" | "partly";
};

export type VenueMeta = {
  capacity: number;
  cityLabel: string;
  country: string;
  /** Dégradé hero (from, via, to) */
  heroGradient: [string, string, string];
  mapsQuery: string;
};

const VENUE_META: Record<string, VenueMeta> = {
  "Stade Azteca": {
    capacity: 87_523,
    cityLabel: "Mexico City",
    country: "Mexique",
    heroGradient: ["#0a1628", "#14532d", "#052e16"],
    mapsQuery: "Estadio Azteca Mexico City",
  },
  "Estadio Azteca": {
    capacity: 87_523,
    cityLabel: "Mexico City",
    country: "Mexique",
    heroGradient: ["#0a1628", "#14532d", "#052e16"],
    mapsQuery: "Estadio Azteca Mexico City",
  },
  "Estadio Akron": {
    capacity: 49_850,
    cityLabel: "Guadalajara",
    country: "Mexique",
    heroGradient: ["#0f172a", "#1e3a5f", "#0c4a6e"],
    mapsQuery: "Estadio Akron Guadalajara",
  },
  "BMO Field": {
    capacity: 45_500,
    cityLabel: "Toronto",
    country: "Canada",
    heroGradient: ["#0f172a", "#1e293b", "#334155"],
    mapsQuery: "BMO Field Toronto",
  },
  "SoFi Stadium": {
    capacity: 70_240,
    cityLabel: "Los Angeles",
    country: "États-Unis",
    heroGradient: ["#020617", "#1e1b4b", "#312e81"],
    mapsQuery: "SoFi Stadium Inglewood",
  },
  "Gillette Stadium": {
    capacity: 65_878,
    cityLabel: "Boston",
    country: "États-Unis",
    heroGradient: ["#0f172a", "#1e3a5f", "#0c4a6e"],
    mapsQuery: "Gillette Stadium Foxborough",
  },
  "BC Place": {
    capacity: 54_500,
    cityLabel: "Vancouver",
    country: "Canada",
    heroGradient: ["#0c1222", "#164e63", "#0e7490"],
    mapsQuery: "BC Place Vancouver",
  },
  "MetLife Stadium": {
    capacity: 82_500,
    cityLabel: "New York",
    country: "États-Unis",
    heroGradient: ["#020617", "#1e293b", "#0f172a"],
    mapsQuery: "MetLife Stadium East Rutherford",
  },
  "Levi's Stadium": {
    capacity: 68_500,
    cityLabel: "Santa Clara",
    country: "États-Unis",
    heroGradient: ["#0f172a", "#422006", "#713f12"],
    mapsQuery: "Levi's Stadium Santa Clara",
  },
  "Lincoln Financial Field": {
    capacity: 69_796,
    cityLabel: "Philadelphie",
    country: "États-Unis",
    heroGradient: ["#0f172a", "#14532d", "#166534"],
    mapsQuery: "Lincoln Financial Field Philadelphia",
  },
  "NRG Stadium": {
    capacity: 72_220,
    cityLabel: "Houston",
    country: "États-Unis",
    heroGradient: ["#0f172a", "#431407", "#7c2d12"],
    mapsQuery: "NRG Stadium Houston",
  },
  "AT&T Stadium": {
    capacity: 80_000,
    cityLabel: "Arlington",
    country: "États-Unis",
    heroGradient: ["#020617", "#1e1b4b", "#1e3a8a"],
    mapsQuery: "AT&T Stadium Arlington Texas",
  },
  "Estadio BBVA": {
    capacity: 53_500,
    cityLabel: "Monterrey",
    country: "Mexique",
    heroGradient: ["#0f172a", "#1c1917", "#44403c"],
    mapsQuery: "Estadio BBVA Monterrey",
  },
  "Stade BBVA": {
    capacity: 53_500,
    cityLabel: "Monterrey",
    country: "Mexique",
    heroGradient: ["#0f172a", "#1c1917", "#44403c"],
    mapsQuery: "Estadio BBVA Monterrey",
  },
  "Hard Rock Stadium": {
    capacity: 65_326,
    cityLabel: "Miami",
    country: "États-Unis",
    heroGradient: ["#0c1222", "#0e7490", "#155e75"],
    mapsQuery: "Hard Rock Stadium Miami Gardens",
  },
  "Mercedes-Benz Stadium": {
    capacity: 71_000,
    cityLabel: "Atlanta",
    country: "États-Unis",
    heroGradient: ["#0f172a", "#1e1b4b", "#312e81"],
    mapsQuery: "Mercedes-Benz Stadium Atlanta",
  },
  "Lumen Field": {
    capacity: 69_000,
    cityLabel: "Seattle",
    country: "États-Unis",
    heroGradient: ["#0f172a", "#14532d", "#166534"],
    mapsQuery: "Lumen Field Seattle",
  },
  "Arrowhead Stadium": {
    capacity: 76_416,
    cityLabel: "Kansas City",
    country: "États-Unis",
    heroGradient: ["#0f172a", "#431407", "#991b1b"],
    mapsQuery: "GEHA Field at Arrowhead Stadium Kansas City",
  },
  "GEHA Field at Arrowhead Stadium": {
    capacity: 76_416,
    cityLabel: "Kansas City",
    country: "États-Unis",
    heroGradient: ["#0f172a", "#431407", "#991b1b"],
    mapsQuery: "GEHA Field at Arrowhead Stadium Kansas City",
  },
};

const DEFAULT_META: VenueMeta = {
  capacity: 60_000,
  cityLabel: "",
  country: "",
  heroGradient: ["#020617", "#0f172a", "#1e293b"],
  mapsQuery: "",
};

export function getVenueMeta(venueName: string, city: string): VenueMeta {
  const meta = VENUE_META[venueName.trim()];
  if (meta) return meta;
  return {
    ...DEFAULT_META,
    cityLabel: city,
    country: "",
    mapsQuery: `${venueName} ${city}`,
  };
}

export function isOpeningMatch(fixtureId: number): boolean {
  return fixtureId === 1;
}

/** Météo simulée déterministe (affichage indicatif) */
export function simulateVenueWeather(
  city: string,
  dateIso: string
): VenueWeather {
  const seed =
    city.split("").reduce((a, c) => a + c.charCodeAt(0), 0) +
    new Date(dateIso).getMonth() * 31 +
    new Date(dateIso).getDate();

  const conditions: VenueWeather[] = [
    { temperatureC: 26, condition: "Ensoleillé", icon: "sun" },
    { temperatureC: 22, condition: "Partiellement nuageux", icon: "partly" },
    { temperatureC: 18, condition: "Nuageux", icon: "cloud" },
    { temperatureC: 24, condition: "Ensoleillé", icon: "sun" },
    { temperatureC: 20, condition: "Léger vent", icon: "partly" },
  ];

  const pick = conditions[seed % conditions.length];
  const month = new Date(dateIso).getMonth();
  const tempAdjust =
    month >= 5 && month <= 7 ? 4 : month >= 11 || month <= 1 ? -6 : 0;

  return {
    ...pick,
    temperatureC: Math.min(38, Math.max(8, pick.temperatureC + tempAdjust + (seed % 5) - 2)),
  };
}

export function googleMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function formatCapacity(capacity: number): string {
  return `${capacity.toLocaleString("fr-FR")} places`;
}
