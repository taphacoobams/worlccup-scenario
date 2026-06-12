import type { MetadataRoute } from "next";

const routes = [
  "",
  "/groups",
  "/fixtures",
  "/statistics",
  "/teams",
  "/players",
  "/knockout",
  "/scenarios",
  "/explorer",
  "/analytique",
  "/monte-carlo",
  "/export",
  "/about",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://senegalscenario2026.vercel.app";

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : route === "/scenarios" ? 0.95 : 0.8,
  }));
}
