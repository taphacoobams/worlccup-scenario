"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Fixture, GroupStanding } from "@/types/worldcup";
import {
  FIXTURE_STATUS_LABELS,
  fixtureStatus,
  shouldShowScore,
} from "@/types/worldcup";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { MapPin, Clock, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { premiumCardHover } from "@/lib/ui-classes";
import { formatVenueCity } from "@/lib/venue-display";
import { getTeamStanding, standingRankLabel } from "@/lib/standings-labels";

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
    return <span className="text-text-secondary text-lg font-mono">vs</span>;
  }
  const { home, away } = fixture.goals;
  return (
    <span className="font-bold tabular-nums text-2xl sm:text-3xl tracking-tight">
      {home}
      <span className="text-text-secondary mx-1.5 font-normal">–</span>
      {away}
    </span>
  );
}

const STATUS_STYLE: Record<string, string> = {
  finished: "bg-white/10 text-text-secondary",
  live: "bg-red-500/20 text-red-400 animate-pulse",
  upcoming: "bg-primary/15 text-primary",
};

export function MatchRow({
  fixture,
  index = 0,
  groupStandings,
}: {
  fixture: Fixture;
  index?: number;
  groupStandings?: GroupStanding[];
}) {
  const status = fixtureStatus(fixture);
  const statusLabel = FIXTURE_STATUS_LABELS[status] ?? fixture.status.long;
  const homeStanding = groupStandings
    ? getTeamStanding(groupStandings, fixture.teams.home.id)
    : undefined;
  const awayStanding = groupStandings
    ? getTeamStanding(groupStandings, fixture.teams.away.id)
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link
        href={`/fixtures/${fixture.id}`}
        className={cn(
          "block rounded-[20px] border border-border bg-surface/70 backdrop-blur-[20px] p-5",
          premiumCardHover
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {fixture.group ? (
              <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
                Groupe {fixture.group}
              </span>
            ) : (
              <span className="rounded-lg bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold">
                {fixture.round}
              </span>
            )}
            <span className={cn("rounded-lg px-2.5 py-1 text-xs font-medium", STATUS_STYLE[status] ?? STATUS_STYLE.upcoming)}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Clock className="h-3.5 w-3.5" />
            {formatDate(fixture.date)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-end gap-1.5 min-w-0">
            <TeamBadge team={fixture.teams.home} className="justify-end" size="md" />
            {homeStanding && (
              <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary tabular-nums">
                {standingRankLabel(homeStanding.position)} · {homeStanding.points} pts
              </span>
            )}
          </div>
          <div className="text-center shrink-0 px-2">
            <Score fixture={fixture} />
          </div>
          <div className="flex-1 flex flex-col items-start gap-1.5 min-w-0">
            <TeamBadge team={fixture.teams.away} size="md" />
            {awayStanding && (
              <span className="rounded-full border border-secondary/25 bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary tabular-nums">
                {standingRankLabel(awayStanding.position)} · {awayStanding.points} pts
              </span>
            )}
          </div>
        </div>

        {fixture.group && groupStandings && groupStandings.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-secondary mb-2">
              <Trophy className="h-3 w-3" />
              Classement groupe {fixture.group}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[...groupStandings]
                .sort((a, b) => a.position - b.position)
                .map((row) => {
                  const inMatch =
                    row.team.id === fixture.teams.home.id ||
                    row.team.id === fixture.teams.away.id;
                  return (
                    <div
                      key={row.team.id}
                      className={cn(
                        "rounded-lg px-2 py-1.5 text-[11px] border",
                        inMatch
                          ? "border-primary/30 bg-primary/10 font-semibold"
                          : "border-border bg-white/[0.03] text-text-secondary"
                      )}
                    >
                      <span className="font-mono text-[10px] mr-1">{row.position}.</span>
                      <span className="truncate">{row.team.code}</span>
                      <span className="float-right tabular-nums text-primary">{row.points}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-text-secondary">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
          <span className="truncate">
            {fixture.venue.name} · {formatVenueCity(fixture.venue.city)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
