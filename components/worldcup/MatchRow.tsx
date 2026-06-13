"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Fixture } from "@/types/worldcup";
import {
  FIXTURE_STATUS_LABELS,
  fixtureStatus,
  shouldShowScore,
} from "@/types/worldcup";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { MapPin, Clock } from "lucide-react";
import { fixtureHref } from "@/lib/slugs/fixture";
import { cn } from "@/lib/utils";
import { panelBase, premiumCardHover } from "@/lib/ui-classes";
import { formatVenueCity } from "@/lib/venue-display";

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
    <span className="font-bold tabular-nums text-xl sm:text-2xl md:text-3xl tracking-tight">
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
  allFixtures,
}: {
  fixture: Fixture;
  index?: number;
  allFixtures?: Fixture[];
}) {
  const status = fixtureStatus(fixture);
  const statusLabel = FIXTURE_STATUS_LABELS[status] ?? fixture.status.long;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link
        href={fixtureHref(fixture, allFixtures)}
        className={cn("block p-4", panelBase, premiumCardHover)}
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

        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
          <div className="flex justify-center sm:justify-end min-w-0">
            <TeamBadge team={fixture.teams.home} className="justify-center sm:justify-end" size="sm" />
          </div>
          <div className="text-center shrink-0 px-1 sm:px-2 order-first sm:order-none">
            <Score fixture={fixture} />
          </div>
          <div className="flex justify-center sm:justify-start min-w-0">
            <TeamBadge team={fixture.teams.away} className="justify-center sm:justify-start" size="sm" />
          </div>
        </div>

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
