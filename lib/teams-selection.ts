import type { Group } from "@/types";
import type { SelectableTeam } from "@/types/team-selection";

/** Sénégal — équipe par défaut */
export const DEFAULT_FAVORITE_TEAM_ID = 34;

export const STORAGE_KEY = "senegalscenario2026-favorite-team";

export function getSelectableTeamById(
  id: number,
  teams: SelectableTeam[]
): SelectableTeam | null {
  return teams.find((team) => team.id === id) ?? null;
}

export function getDefaultFavoriteTeam(teams: SelectableTeam[]): SelectableTeam {
  return (
    getSelectableTeamById(DEFAULT_FAVORITE_TEAM_ID, teams) ??
    teams[0] ?? {
      id: DEFAULT_FAVORITE_TEAM_ID,
      name: "Sénégal",
      code: "SEN",
      country: "Sénégal",
      group: "I",
    }
  );
}

export function teamGroupLetter(team: SelectableTeam): Group | null {
  const g = team.group?.trim().toUpperCase();
  if (!g || g.length !== 1 || g < "A" || g > "L") return null;
  return g as Group;
}

export function filterTeams(query: string, list: SelectableTeam[]): SelectableTeam[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      (t.group && t.group.toLowerCase().includes(q))
  );
}
