import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ManagerMatchdaySection } from "@/lib/manager/stats";

function formatMatchdayTitle(section: ManagerMatchdaySection): string {
  if (section.mode === "today") return "Matchs du jour";
  if (section.mode === "latest" && section.matchdayDate) {
    const label = new Date(section.matchdayDate).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return `Dernière journée jouée — ${label}`;
  }
  return "Matchs du jour";
}

export function ManagerTodayMatches({ section }: { section: ManagerMatchdaySection }) {
  const { matches } = section;
  const title = formatMatchdayTitle(section);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="font-semibold">{title}</h2>
        {section.mode === "latest" && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Aucun match au calendrier d&apos;aujourd&apos;hui — affichage de la dernière journée du tournoi.
          </p>
        )}
      </div>
      {matches.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">Aucun match enregistré pour le moment.</p>
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
