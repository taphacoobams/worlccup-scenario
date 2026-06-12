import type { LocalPlayer, PositionGroup, SquadPlayer } from "@/types/data";

const POSITION_GROUPS: Record<string, PositionGroup> = {
  Goalkeeper: "Gardiens",
  Gardien: "Gardiens",
  Defender: "Défenseurs",
  Défenseur: "Défenseurs",
  Midfielder: "Milieux",
  Milieu: "Milieux",
  Attacker: "Attaquants",
  Attaquant: "Attaquants",
  Forward: "Attaquants",
};

export function toSquadPlayer(p: LocalPlayer): SquadPlayer {
  const raw = p.position?.trim() ?? "";
  const group =
    POSITION_GROUPS[raw] ??
    (raw.toLowerCase().includes("gard")
      ? "Gardiens"
      : raw.toLowerCase().includes("déf") || raw.toLowerCase().includes("def")
        ? "Défenseurs"
        : raw.toLowerCase().includes("mil")
          ? "Milieux"
          : raw.toLowerCase().includes("att")
            ? "Attaquants"
            : "Autres");

  return { ...p, positionGroup: group };
}

export function groupSquadByPosition(players: SquadPlayer[]) {
  const order: PositionGroup[] = [
    "Gardiens",
    "Défenseurs",
    "Milieux",
    "Attaquants",
    "Autres",
  ];
  return order
    .map((label) => ({
      label,
      players: players
        .filter((p) => p.positionGroup === label)
        .sort(
          (a, b) =>
            (a.number ?? 99) - (b.number ?? 99) ||
            a.name.localeCompare(b.name, "fr")
        ),
    }))
    .filter((g) => g.players.length > 0);
}
