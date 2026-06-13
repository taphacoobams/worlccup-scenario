/** Normalize internal path — always without locale prefix */
export function appPath(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "" ? "/" : clean;
}
