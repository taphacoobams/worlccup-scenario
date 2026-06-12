import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ManagerMatchAlert } from "@/lib/manager/match-alerts";
import { cn } from "@/lib/utils";

export function ManagerMatchAlerts({ alerts }: { alerts: ManagerMatchAlert[] }) {
  if (alerts.length === 0) return null;

  const overdue = alerts.filter((a) => a.kind === "overdue");
  const played = alerts.filter((a) => a.kind === "played");

  return (
    <section className="space-y-3">
      {overdue.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-amber-500/30 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <h2 className="font-semibold text-amber-200">
              {overdue.length} match{overdue.length > 1 ? "s" : ""} passé
              {overdue.length > 1 ? "s" : ""} — résultat à saisir
            </h2>
          </div>
          <ul className="divide-y divide-amber-500/20">
            {overdue.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(a.date).toLocaleString("fr-FR", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {a.group && (
                      <span className="ml-2 font-mono text-gold">G{a.group}</span>
                    )}
                    <span className="ml-2">· {a.status}</span>
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0">
                  <Link href={`/dashboard/matches/${a.id}`}>Saisir</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {played.length > 0 && (
        <div className="rounded-xl border border-senegal-green/30 bg-senegal-green/5 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-senegal-green/20 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 text-senegal-green shrink-0" />
            <h2 className="font-semibold text-senegal-green">
              Matchs récemment joués
            </h2>
          </div>
          <ul className="divide-y divide-white/5">
            {played.map((a) => (
              <li
                key={a.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm"
                )}
              >
                <span>{a.message}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {new Date(a.date).toLocaleDateString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
