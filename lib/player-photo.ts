/** URL locale si le joueur a une photo Guardian enregistrée dans players.json */
export function resolvePlayerPhoto(photo?: string | null): string | null {
  const path = photo?.trim();
  if (!path || !path.startsWith("/")) return null;
  return path;
}
