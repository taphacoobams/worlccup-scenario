import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ManagerDashboardStats } from "@/lib/manager/stats";

const PRIMARY_KPI = [
  { key: "teams", label: "Équipes" },
  { key: "players", label: "Joueurs" },
  { key: "fixtures", label: "Matchs" },
  { key: "groups", label: "Groupes" },
  { key: "scenarios", label: "Scénarios" },
] as const;

const LIVE_KPI = [
  { key: "finishedMatches", label: "Matchs joués" },
  { key: "remainingMatches", label: "Matchs restants" },
  { key: "goals", label: "Buts" },
  { key: "assists", label: "Passes" },
  { key: "yellowCards", label: "Cartons jaunes" },
  { key: "redCards", label: "Cartons rouges" },
  { key: "suspended", label: "Suspendus" },
] as const;

export function ManagerKpiGrid({ stats }: { stats: ManagerDashboardStats }) {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {PRIMARY_KPI.map(({ key, label }) => (
          <Card key={key} className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold tabular-nums text-senegal-green">
                {stats[key]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {LIVE_KPI.map(({ key, label }) => (
          <Card key={key} className="border-white/10 bg-white/[0.02]">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold tabular-nums mt-1">{stats[key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
