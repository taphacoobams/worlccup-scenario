import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "@/components/ui/team-flag";
import type { ManagerMatchdaySection } from "@/lib/manager/stats";

export function ManagerTodayMatches({ section }: { section: ManagerMatchdaySection }) {
  const { matches } = section;

  if (matches.length === 0) {
    return (
      <section className="rounded-xl border border-white/10 bg-white/2 overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="font-semibold">Matchs du jour</h2>
        </div>
        <p className="p-4 text-sm text-muted-foreground">Aucun match prévu aujourd'hui.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/2 overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="font-semibold">Matchs du jour</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
              <th className="p-3">Heure</th>
              <th className="p-3">Match</th>
              <th className="p-3">Groupe</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id} className="border-b border-white/5">
                <td className="p-3 tabular-nums">
                  {new Date(m.date).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <TeamFlag code={m.homeCode} teamName={m.home} size="sm" />
                    <span>{m.home}</span>
                    {m.homeScore != null && m.awayScore != null
                      ? <span className="font-medium">{` ${m.homeScore} - ${m.awayScore} `}</span>
                      : <span className="text-muted-foreground"> — </span>
                    }
                    <TeamFlag code={m.awayCode} teamName={m.away} size="sm" />
                    <span>{m.away}</span>
                  </div>
                </td>
                <td className="p-3 font-mono text-gold">{m.group ?? "—"}</td>
                <td className="p-3">{m.status}</td>
                <td className="p-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/matches/${m.id}`}>Modifier</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
