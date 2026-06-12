import Link from "next/link";
import { Button } from "@/components/ui/button";

type Match = {
  id: number;
  date: string;
  group: string | null;
  status: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
};

export function ManagerTodayMatches({ matches }: { matches: Match[] }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="font-semibold">Matchs du jour</h2>
      </div>
      {matches.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Aucun match prévu aujourd&apos;hui.</p>
      ) : (
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
                    {m.home}
                    {m.homeScore != null && m.awayScore != null
                      ? ` ${m.homeScore} - ${m.awayScore} `
                      : " — "}
                    {m.away}
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
      )}
    </section>
  );
}
