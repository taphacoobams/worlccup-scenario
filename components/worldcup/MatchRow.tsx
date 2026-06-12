import Link from "next/link";
import type { Fixture } from "@/types/worldcup";
import {
  FIXTURE_STATUS_LABELS,
  fixtureStatus,
  shouldShowScore,
} from "@/types/worldcup";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function Score({ fixture }: { fixture: Fixture }) {
  if (!shouldShowScore(fixture)) {
    return <span className="text-muted-foreground text-sm font-mono">—</span>;
  }
  const { home, away } = fixture.goals;
  return (
    <span className="font-bold tabular-nums text-lg">
      {home} – {away}
    </span>
  );
}

export function MatchRow({ fixture }: { fixture: Fixture }) {
  const status = fixtureStatus(fixture);

  return (
    <Link
      href={`/fixtures/${fixture.id}`}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-white/10",
        "hover:border-senegal-green/40 hover:bg-white/5 transition-all"
      )}
    >
      <div className="flex-1 flex items-center justify-between gap-4 min-w-0">
        <TeamBadge team={fixture.teams.home} className="flex-1 justify-end sm:justify-end" />
        <Score fixture={fixture} />
        <TeamBadge team={fixture.teams.away} className="flex-1" />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground sm:flex-col sm:items-end sm:min-w-[160px]">
        {fixture.group ? (
          <span className="rounded bg-white/10 px-2 py-0.5 font-bold">
            Groupe {fixture.group}
          </span>
        ) : (
          <span className="rounded bg-gold/15 px-2 py-0.5 font-medium text-gold">
            {fixture.round}
          </span>
        )}
        {fixture.group && (
          <span className="text-[11px] opacity-80">{fixture.round}</span>
        )}
        <span>{FIXTURE_STATUS_LABELS[status] ?? fixture.status.long}</span>
        <span>
          {formatDate(fixture.date)}
          {fixture.timezone && fixture.timezone !== "UTC" && (
            <span className="ml-1 opacity-70">({fixture.timezone})</span>
          )}
        </span>
        <span className="truncate max-w-[200px]">{fixture.venue.name}</span>
      </div>
    </Link>
  );
}
