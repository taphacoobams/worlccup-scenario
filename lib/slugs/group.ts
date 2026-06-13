import type { Group } from "@/types";
import { PATHS } from "@/lib/i18n/paths";

const VALID = new Set<Group>([
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
]);

export function groupLetterFromSlug(slug: string): Group | null {
  const normalized = slug.trim().toLowerCase();
  const prefixed = normalized.match(/^groupe-([a-l])$/);
  if (prefixed) {
    const letter = prefixed[1].toUpperCase() as Group;
    return VALID.has(letter) ? letter : null;
  }
  if (/^[a-l]$/.test(normalized)) {
    const letter = normalized.toUpperCase() as Group;
    return VALID.has(letter) ? letter : null;
  }
  return null;
}

export function groupSlug(letter: string): string {
  return `groupe-${letter.toLowerCase()}`;
}

export function groupHref(letter: string): string {
  return PATHS.groupe(groupSlug(letter));
}
