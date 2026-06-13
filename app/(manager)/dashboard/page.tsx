import { ManagerKpiGrid } from "@/components/manager/dashboard/ManagerKpiGrid";
import { ManagerTodayMatches } from "@/components/manager/dashboard/ManagerTodayMatches";
import { ManagerMatchAlerts } from "@/components/manager/dashboard/ManagerMatchAlerts";
import { ManagerTeamAnalysis } from "@/components/manager/dashboard/ManagerTeamAnalysis";
import {
  getManagerDashboardStats,
  getManagerTodayMatches,
  getTeamQualificationAnalysis,
} from "@/lib/manager/stats";
import { getManagerMatchAlerts } from "@/lib/manager/match-alerts";
import { getSelectableTeamsFromDb } from "@/lib/teams-selection-server";
import { DEFAULT_FAVORITE_TEAM_ID } from "@/lib/teams-selection";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const [stats, matchdaySection, matchAlerts, teams, teamAnalysis] =
    await Promise.all([
      getManagerDashboardStats(),
      getManagerTodayMatches(),
      getManagerMatchAlerts(),
      getSelectableTeamsFromDb(),
      getTeamQualificationAnalysis(DEFAULT_FAVORITE_TEAM_ID),
    ]);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Console d&apos;administration — Coupe du Monde FIFA 2026
          {stats.lastUpdate && (
            <span className="ml-2">
              · Dernière MAJ{" "}
              {new Date(stats.lastUpdate).toLocaleString("fr-FR")}
            </span>
          )}
        </p>
      </div>

      <ManagerMatchAlerts alerts={matchAlerts} />
      <ManagerKpiGrid stats={stats} />
      <ManagerTeamAnalysis teams={teams} initial={teamAnalysis} />
      <ManagerTodayMatches section={matchdaySection} />
    </div>
  );
}
