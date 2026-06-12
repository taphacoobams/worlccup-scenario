import { GUARDIAN_CREDIT_URL } from "@/lib/credits";

export function extractGuardianGuideUrl(bioHtml: string): string | null {
  const m = bioHtml.match(
    /href="(https:\/\/www\.theguardian\.com\/football\/2026\/[^"]+)"/i
  );
  return m?.[1] ?? null;
}

/** URL du guide Guardian extrait de la bio équipe (BDD), sinon page Mondial 2026. */
export function getGuardianGuideUrlFromBio(bio?: string | null): string {
  if (!bio) return GUARDIAN_CREDIT_URL;
  return extractGuardianGuideUrl(bio) ?? GUARDIAN_CREDIT_URL;
}

export function hasTeamGuardianGuideFromBio(bio?: string | null): boolean {
  return Boolean(bio && extractGuardianGuideUrl(bio));
}
