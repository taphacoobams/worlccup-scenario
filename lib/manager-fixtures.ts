import type { ManualFixture, WorldCupManualData } from "@/types/worldcup-manual";

/** Ordre d’affichage phase finale */
export const KNOCKOUT_ROUNDS = [
  "Seizièmes de finale",
  "Huitièmes de finale",
  "Quarts de finale",
  "Demi-finales",
  "Match pour la 3e place",
  "Finale",
] as const;

export type KnockoutRound = (typeof KNOCKOUT_ROUNDS)[number];

export function isGroupFixture(f: ManualFixture): boolean {
  return Boolean(f.group?.trim()) && f.homeTeamId > 0 && f.awayTeamId > 0;
}

export function isKnockoutFixture(f: ManualFixture): boolean {
  return !f.group?.trim();
}

export function isKnockoutFixtureReady(f: ManualFixture): boolean {
  return isKnockoutFixture(f) && f.homeTeamId > 0 && f.awayTeamId > 0;
}

export function slotParticipantLabel(
  fixture: ManualFixture,
  side: "home" | "away",
  teamName: (id: number) => string
): { type: "team"; name: string } | { type: "slot"; slot: string; hint: string } {
  const teamId = side === "home" ? fixture.homeTeamId : fixture.awayTeamId;
  const slot =
    (side === "home" ? fixture.homeTeam : fixture.awayTeam)?.trim() ||
    (teamId > 0 ? teamName(teamId) : "TBD");

  if (teamId > 0) {
    return { type: "team", name: teamName(teamId) };
  }

  return { type: "slot", slot, hint: slotHintFr(slot) };
}

/** Libellé type Wikipédia / FIFA pour créneaux non confirmés */
export function slotHintFr(slot: string): string {
  const s = slot.replace(/\s+/g, "").trim();
  const m1 = s.match(/^1([A-L])$/i);
  if (m1) return `1er du groupe ${m1[1].toUpperCase()}`;
  const m2 = s.match(/^2([A-L])$/i);
  if (m2) return `2e du groupe ${m2[1].toUpperCase()}`;
  const m3 = s.match(/^3([A-L])(?:\/([A-L\/]+))?$/i);
  if (m3) {
    const groups = m3[2]
      ? m3[2].split("/").map((g) => g.toUpperCase())
      : [m3[1].toUpperCase()];
    if (groups.length > 1) {
      return `3e parmi les groupes ${groups.join(", ")}`;
    }
    return `3e du groupe ${groups[0]}`;
  }
  if (/^V\d+$/i.test(s)) return `Vainqueur du match ${s.slice(1)}`;
  if (/^P\d+$/i.test(s)) return `Perdant du match ${s.slice(1)}`;
  return "À déterminer";
}

export function groupFixtures(data: WorldCupManualData): ManualFixture[] {
  return data.fixtures
    .filter(isGroupFixture)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function knockoutFixturesByRound(
  data: WorldCupManualData
): { round: string; fixtures: ManualFixture[] }[] {
  const knock = data.fixtures.filter(isKnockoutFixture);
  const byRound = new Map<string, ManualFixture[]>();

  for (const f of knock) {
    const r = f.round || "Phase finale";
    const list = byRound.get(r) ?? [];
    list.push(f);
    byRound.set(r, list);
  }

  const ordered: { round: string; fixtures: ManualFixture[] }[] = [];
  for (const round of KNOCKOUT_ROUNDS) {
    const list = byRound.get(round);
    if (list?.length) {
      ordered.push({
        round,
        fixtures: list.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
      });
      byRound.delete(round);
    }
  }
  for (const [round, fixtures] of byRound) {
    ordered.push({
      round,
      fixtures: fixtures.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    });
  }
  return ordered;
}

export function groupPhaseStats(data: WorldCupManualData): {
  total: number;
  finished: number;
  allFinished: boolean;
} {
  const group = data.fixtures.filter(
    (f) => f.group?.trim() && f.homeTeamId > 0 && f.awayTeamId > 0
  );
  const finished = group.filter((f) =>
    ["FT", "AET", "PEN"].includes(f.status)
  ).length;
  return {
    total: group.length,
    finished,
    allFinished: group.length > 0 && finished === group.length,
  };
}
