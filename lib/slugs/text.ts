/** Slug URL à partir d'un libellé (ex. « Sénégal » → senegal) */
export function slugifyText(text: string, fallback = "item"): string {
  const slug = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}
