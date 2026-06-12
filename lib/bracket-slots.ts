/** Créneau tableau (1A, 3A/B/C/D/F, V73, P101…) — pas une équipe nationale */
export function isBracketSlot(name: string): boolean {
  const n = name.replace(/\s+/g, "").trim();
  return (
    /^[12][A-L]$/.test(n) ||
    /^3[A-L](?:\/[A-L\/]+)*$/.test(n) ||
    /^V\d+$/.test(n) ||
    /^P\d+$/.test(n)
  );
}
