import { toPublicPath } from "@/lib/i18n/paths";

/** Chemin public français (sans préfixe locale) */
export function appPath(path: string): string {
  return toPublicPath(path);
}
