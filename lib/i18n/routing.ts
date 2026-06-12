/** Normalize internal path — always without locale prefix */
export function appPath(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "" ? "/" : clean;
}

/** Strip legacy /fr or /en prefix from pathname */
export function stripLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(fr|en)(\/|$)/);
  if (!match) return pathname || "/";
  const rest = pathname.slice(match[1].length + 1);
  return rest === "" ? "/" : rest;
}
