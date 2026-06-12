import type { ManualPlayer } from "@/types/worldcup-manual";

export function playersForTeam(
  teamId: number,
  players: ManualPlayer[]
): ManualPlayer[] {
  const byId = new Map<number, ManualPlayer>();
  for (const p of players) {
    if (p.teamId === teamId) byId.set(p.id, p);
  }
  return [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "fr")
  );
}
