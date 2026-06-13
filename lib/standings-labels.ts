import type { GroupStanding } from "@/types/worldcup";

export function standingRankLabel(position: number): string {
  if (position === 1) return "1er";
  return `${position}e`;
}

export function getTeamStanding(
  standings: GroupStanding[],
  teamId: number
): GroupStanding | undefined {
  return standings.find((s) => s.team.id === teamId);
}
