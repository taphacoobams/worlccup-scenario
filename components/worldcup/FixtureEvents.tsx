import type { FixtureEvent } from "@/types/worldcup";
import { Flag } from "@/components/worldcup/Flag";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = { events: FixtureEvent[] };

const detailIcons: Record<string, string> = {
  "Normal Goal": "⚽",
  "Own Goal": "⚽",
  "Penalty": "⚽",
  "Missed Penalty": "✕",
  "Yellow Card": "🟨",
  "Red Card": "🟥",
  "Substitution": "↔",
  "Goal cancelled": "VAR",
  "Penalty cancelled": "VAR",
};

function eventLabel(e: FixtureEvent): string {
  if (e.type === "Goal") return e.detail;
  if (e.type === "Card") return `${e.detail} card`;
  if (e.type === "subst") return "Remplacement";
  if (e.type === "Var") return `VAR — ${e.detail}`;
  return `${e.type} — ${e.detail}`;
}

export function FixtureEvents({ events }: Props) {
  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Aucun événement enregistré pour ce match.
        </CardContent>
      </Card>
    );
  }

  const sorted = [...events].sort(
    (a, b) =>
      (a.time.elapsed ?? 0) - (b.time.elapsed ?? 0) ||
      (a.time.extra ?? 0) - (b.time.extra ?? 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Événements du match</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {sorted.map((e, i) => (
            <li
              key={`${e.time.elapsed}-${e.player.id}-${i}`}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-white/5 px-3 py-2",
                e.type === "Card" && e.detail.includes("Red") && "bg-red-500/10",
                e.type === "Var" && "bg-amber-500/10"
              )}
            >
              <span className="font-mono text-xs text-gold w-10 shrink-0 pt-0.5">
                {e.time.elapsed}
                {e.time.extra ? `+${e.time.extra}` : ""}&apos;
              </span>
              <Flag
                teamCode={e.team.code}
                teamName={e.team.name}
                src={e.team.logo}
                alt={e.team.name}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  <span className="mr-1.5">{detailIcons[e.detail] ?? "•"}</span>
                  {eventLabel(e)}
                </p>
                {e.player.name && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {e.player.name}
                    {e.assist.name && ` ← ${e.assist.name}`}
                  </p>
                )}
                {e.comments && (
                  <p className="text-xs text-muted-foreground/80 mt-1">{e.comments}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
