import { getFlag, PLACEHOLDER_FLAG } from "@/lib/flags";
import { toFlagCode } from "@/lib/iso-codes";

export { PLACEHOLDER_FLAG };

export function slugCode(code: string): string {
  return String(code || "xx")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}

/** Drapeau flagcdn.com (remplace les anciens chemins /flags/) */
export function localFlagPath(code: string, teamName?: string): string {
  return getFlag(code, null, teamName);
}

/** Logo équipe = drapeau flagcdn */
export function localTeamLogoPath(code: string, teamName?: string): string {
  return getFlag(code, null, teamName);
}

export function localPlayerPhotoPath(playerId: number): string {
  return `/players/${playerId}.png`;
}

export { toFlagCode };
