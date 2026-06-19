import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "@/components/ui/team-flag";
import type { ManagerMatchAlert } from "@/lib/manager/match-alerts";

export function ManagerMatchAlerts({ alerts }: { alerts: ManagerMatchAlert[] }) {
  if (alerts.length === 0) return null;

  const overdue = alerts.filter((a) => a.kind === "overdue");

  if (overdue.length === 0) return null;

  return (
    <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-amber-500/30 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        <h2 className="font-semibold text-amber-200">
          {overdue.length} match{overdue.length > 1 ? "s" : ""} à saisir
        </h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {overdue.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/matches/${a.id}`}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
            >
              <span className="text-xs font-mono text-muted-foreground">#{a.matchNumber}</span>
              <div className="flex items-center gap-1">
                <TeamFlag code={a.homeCode} teamName={a.home} size="sm" />
                <span className="text-xs text-muted-foreground">vs</span>
                <TeamFlag code={a.awayCode} teamName={a.away} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
