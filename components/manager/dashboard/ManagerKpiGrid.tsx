import { Card, CardContent } from "@/components/ui/card";
import type { ManagerDashboardStats } from "@/lib/manager/stats";

type KpiItem = {
  key: keyof ManagerDashboardStats;
  label: string;
  format?: (v: number) => string;
};

const ADMIN_KPI: KpiItem[] = [
  { key: "finishedMatches", label: "Matchs joués" },
  { key: "remainingMatches", label: "Matchs restants" },
  { key: "goals", label: "Buts" },
  { key: "goalsPerMatch", label: "Buts/match", format: (v: number) => v.toFixed(2) },
  { key: "assists", label: "Passes décisives" },
  { key: "yellowCards", label: "Cartons jaunes" },
  { key: "redCards", label: "Cartons rouges" },
  { key: "suspended", label: "Suspendus" },
];

export function ManagerKpiGrid({ stats }: { stats: ManagerDashboardStats }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3">
      {ADMIN_KPI.map(({ key, label, format }) => (
        <Card key={key} className="border-white/10 bg-white/2">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold tabular-nums mt-1">
              {format ? format(stats[key] as number) : stats[key]}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
