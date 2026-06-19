import { ManagerMatchAlerts } from "@/components/manager/dashboard/ManagerMatchAlerts";
import { ManagerTodayMatches } from "@/components/manager/dashboard/ManagerTodayMatches";
import { ManagerKpiGrid } from "@/components/manager/dashboard/ManagerKpiGrid";
import { getManagerMatchAlerts } from "@/lib/manager/match-alerts";
import { getManagerTodayMatches, getManagerDashboardStats } from "@/lib/manager/stats";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const [matchAlerts, matchdaySection, stats] = await Promise.all([
    getManagerMatchAlerts(),
    getManagerTodayMatches(),
    getManagerDashboardStats(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Console d&apos;administration — Coupe du Monde FIFA 2026
        </p>
      </div>

      <ManagerMatchAlerts alerts={matchAlerts} />
      <ManagerKpiGrid stats={stats} />
      <ManagerTodayMatches section={matchdaySection} />
    </div>
  );
}
