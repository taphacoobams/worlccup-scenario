import { redirect } from "next/navigation";
import { getTeams } from "@/lib/api";
import { teamHref } from "@/lib/team-slug";
import { DEFAULT_FAVORITE_TEAM_ID } from "@/lib/teams-selection";

/** Ancienne page liste — redirige vers la fiche de l'équipe par défaut */
export default async function TeamsPage() {
  const teams = await getTeams();
  const defaultTeam =
    teams.find((t) => t.id === DEFAULT_FAVORITE_TEAM_ID) ?? teams[0];
  if (!defaultTeam) redirect("/");
  redirect(teamHref(defaultTeam));
}
