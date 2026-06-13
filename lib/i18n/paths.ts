/** Chemins publics en français */
export const PATHS = {
  home: "/",
  groupes: "/groupes",
  groupe: (slug: string) => `/groupes/${slug}`,
  matchs: "/matchs",
  match: (slug: string) => `/matchs/${slug}`,
  equipes: "/equipes",
  equipe: (slug: string) => `/equipes/${slug}`,
  joueurs: "/joueurs",
  joueur: (slug: string) => `/joueurs/${slug}`,
  statistiques: "/statistiques",
  scenarios: "/scenarios",
  explorer: "/explorer",
  analytique: "/analytique",
  monteCarlo: "/monte-carlo",
  about: "/about",
  knockout: "/knockout",
} as const;

/** Anciennes routes EN → routes FR */
const LEGACY_REDIRECTS: Record<string, string> = {
  "/groups": PATHS.groupes,
  "/fixtures": PATHS.matchs,
  "/teams": PATHS.equipes,
  "/players": PATHS.joueurs,
  "/statistics": PATHS.statistiques,
};

/** Convertit un chemin interne/legacy vers le chemin public français */
export function toPublicPath(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return PATHS.home;

  const [base, ...rest] = clean.split("/").filter(Boolean);
  const legacyBase = `/${base}`;
  const frBase = LEGACY_REDIRECTS[legacyBase] ?? legacyBase;
  if (rest.length === 0) return frBase;
  return `${frBase}/${rest.join("/")}`;
}
