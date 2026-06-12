import { toFlagCode } from "@/lib/iso-codes";

export const PLACEHOLDER_FLAG = "/placeholder-flag.svg";

/** CDN public — pas de clé API (https://flagcdn.com) */
export const FLAG_CDN_BASE = "https://flagcdn.com";

export function getFlagCdnSlug(code: string, teamName?: string): string {
  return toFlagCode(code, teamName);
}

/** SVG haute qualité */
export function getFlag(
  code: string,
  _customLogo?: string | null,
  teamName?: string
): string {
  const slug = getFlagCdnSlug(code, teamName);
  if (!slug || slug === "xx") return PLACEHOLDER_FLAG;
  return `${FLAG_CDN_BASE}/${slug}.svg`;
}

/** PNG 40px de large — idéal header / listes */
export function getFlagW40(code: string, teamName?: string): string {
  const slug = getFlagCdnSlug(code, teamName);
  if (!slug || slug === "xx") return PLACEHOLDER_FLAG;
  return `${FLAG_CDN_BASE}/w40/${slug}.png`;
}

export function getFlagPng(code: string, teamName?: string): string {
  return getFlagW40(code, teamName);
}

export function getTeamLogo(code: string, teamName?: string): string {
  return getFlag(code, null, teamName);
}

export function isFlagCdnUrl(url: string | undefined | null): boolean {
  return Boolean(url?.includes("flagcdn.com"));
}

/** Convertit un ancien chemin /teams/sn.svg ou /flags/… en URL flagcdn */
export function legacyPathToFlagCdn(src: string | undefined | null): string | null {
  if (!src) return null;
  if (isFlagCdnUrl(src)) return src;
  const m = src.match(/\/(?:teams|flags)\/([a-z0-9-]+)\.svg/i);
  if (!m) return null;
  const slug = m[1].toLowerCase();
  if (!slug || slug === "xx") return null;
  return `${FLAG_CDN_BASE}/${slug}.svg`;
}

export type ResolveFlagOptions = {
  code?: string | null;
  teamName?: string;
  src?: string | null;
  /** sm → PNG w40, sinon SVG */
  size?: "sm" | "md" | "lg";
};

/** URL drapeau à afficher — toujours flagcdn quand le code ou un chemin local est connu */
export function resolveFlagSrc({
  code,
  teamName,
  src,
  size = "md",
}: ResolveFlagOptions): string {
  const c = code?.trim();
  if (c && c !== "—" && c !== "XX") {
    return size === "sm" ? getFlagW40(c, teamName) : getFlag(c, null, teamName);
  }
  const fromLegacy = legacyPathToFlagCdn(src);
  if (fromLegacy) return fromLegacy;
  if (isFlagCdnUrl(src)) return src!;
  return PLACEHOLDER_FLAG;
}
