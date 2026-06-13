/** URLs FIFA DigitalHub et chemins locaux pour les 16 stades CDM 2026 */

const FIFA_TRANSFORM_UUID = "b6858094-2992-474b-b087-f1e6710fac14";

function fifaImageUrl(slug: string): string {
  return `https://digitalhub.fifa.com/transform/${FIFA_TRANSFORM_UUID}/${slug}?io=transform:fill,width:1366&quality=75`;
}

/** Noms alternatifs dans fixtures.json → nom canonique pour le fichier image */
export const VENUE_CANONICAL_NAME: Record<string, string> = {
  "Stade Azteca": "Estadio Azteca",
  "Stade BBVA": "Estadio BBVA",
};

export const FIFA_STADIUM_IMAGES: Record<string, string> = {
  "Estadio Azteca": fifaImageUrl("FWC-2026-Stadium-Mexico-City-Estadio-Azteca"),
  "Stade Azteca": fifaImageUrl("FWC-2026-Stadium-Mexico-City-Estadio-Azteca"),
  "Estadio BBVA": fifaImageUrl("FWC-2026-Stadium-Monterrey-Estadio-BBVA"),
  "Stade BBVA": fifaImageUrl("FWC-2026-Stadium-Monterrey-Estadio-BBVA"),
  "Estadio Akron": fifaImageUrl("FWC-2026-Stadium-Guadalajara-Estadio-Akron"),
  "NRG Stadium": fifaImageUrl("FWC-2026-Stadium-Houston-NRG-stadium"),
  "AT&T Stadium": fifaImageUrl("FWC-2026-Stadium-Dallas-AT-T-Stadium"),
  "SoFi Stadium": fifaImageUrl("FWC-2026-Stadium-Los-Angeles-SoFi-Stadium"),
  "MetLife Stadium": fifaImageUrl("FWC-2026-Stadium-New-York-New-Jersey-MetLife-Stadium"),
  "Mercedes-Benz Stadium": fifaImageUrl("FWC-2026-Stadium-Atlanta-Mercedes-Benz-Stadium"),
  "Hard Rock Stadium": fifaImageUrl("FWC-2026-Stadium-Miami-Hard-Rock-Stadium"),
  "Lincoln Financial Field": fifaImageUrl(
    "FWC-2026-Stadium-Philadelphia-Lincoln-Financial-Field"
  ),
  "Lumen Field": fifaImageUrl("FWC-2026-Stadium-Seattle-Lumen-Field"),
  "Levi's Stadium": fifaImageUrl("FWC-2026-Stadium-San-Francisco-Bay-Area-Levis-Stadium"),
  "BC Place": fifaImageUrl("FWC-2026-Stadium-Vancouver-BC-Place"),
  "BMO Field": fifaImageUrl("FWC-2026-Stadium-Toronto-BMO-Field"),
  "Arrowhead Stadium": fifaImageUrl("FWC-2026-Stadium-Kansas-City-Arrowhead-Stadium"),
  "GEHA Field at Arrowhead Stadium": fifaImageUrl(
    "FWC-2026-Stadium-Kansas-City-GEHA-Field-at-Arrowhead-Stadium"
  ),
  "Gillette Stadium": fifaImageUrl("FWC-2026-Stadium-Boston-Gillette-Stadium"),
};

/** Slug fichier depuis le nom du stade (ex. « GEHA Field at Arrowhead Stadium ») */
export function slugifyVenue(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function canonicalVenueName(venueName: string): string {
  const trimmed = venueName.trim();
  return VENUE_CANONICAL_NAME[trimmed] ?? trimmed;
}

export function getFifaStadiumImageUrl(venueName: string): string | null {
  const trimmed = venueName.trim();
  return FIFA_STADIUM_IMAGES[trimmed] ?? FIFA_STADIUM_IMAGES[canonicalVenueName(trimmed)] ?? null;
}

/** Chemin public `/stadiums/{slug}.jpg` si un mapping FIFA existe */
export function getStadiumPublicPath(venueName: string): string | null {
  if (!getFifaStadiumImageUrl(venueName)) return null;
  return `/stadiums/${slugifyVenue(canonicalVenueName(venueName))}.jpg`;
}

export function resolveVenueImage(
  venueName: string,
  venueImage?: string | null
): string | null {
  if (venueImage?.trim()) return venueImage.trim();
  return getStadiumPublicPath(venueName);
}

/** 16 stades canoniques uniques (pour import) */
export const CANONICAL_STADIUM_NAMES = [
  "Estadio Azteca",
  "Estadio BBVA",
  "Estadio Akron",
  "NRG Stadium",
  "AT&T Stadium",
  "SoFi Stadium",
  "MetLife Stadium",
  "Mercedes-Benz Stadium",
  "Hard Rock Stadium",
  "Lincoln Financial Field",
  "Lumen Field",
  "Levi's Stadium",
  "BC Place",
  "BMO Field",
  "Arrowhead Stadium",
  "Gillette Stadium",
] as const;
