import type { MetadataRoute } from "next";
import { PATHS } from "@/lib/i18n/paths";
import { groupSlug } from "@/lib/slugs/group";
import { ALL_GROUPS } from "@/lib/constants";

const routes = [
  "",
  PATHS.groupes,
  PATHS.matchs,
  PATHS.statistiques,
  PATHS.joueurs,
  PATHS.scenarios,
  PATHS.explorer,
  PATHS.analytique,
  PATHS.monteCarlo,
  PATHS.about,
  "/mentions-legales",
  "/confidentialite",
  "/dmca",
  ...ALL_GROUPS.map((g) => PATHS.groupe(groupSlug(g))),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://senegalscenario2026.vercel.app";

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : route === PATHS.scenarios ? 0.95 : 0.8,
  }));
}
