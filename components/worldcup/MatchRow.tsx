"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Fixture } from "@/types/worldcup";
import {
  FIXTURE_STATUS_LABELS,
  fixtureStatus,
  shouldShowScore,
} from "@/types/worldcup";
import { TeamFlag } from "@/components/ui/team-flag";
import { fixtureHref } from "@/lib/slugs/fixture";
import { teamSlug } from "@/lib/team-slug";
import { cn } from "@/lib/utils";
import { panelBase, premiumCardHover } from "@/lib/ui-classes";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function getRoundLabel(round: string, matchday?: number): string {
  const roundLower = round.toLowerCase();

  if (roundLower.includes("group") || roundLower.includes("groupe")) {
    if (matchday === 1) return "1ère Journée";
    if (matchday === 2) return "2ème Journée";
    if (matchday === 3) return "3ème Journée";
    return "Phase de groupes";
  }

  if (roundLower.includes("round of 16") || roundLower.includes("huitièmes")) {
    return "Huitièmes de finale";
  }
  if (roundLower.includes("quarter") || roundLower.includes("quarts")) {
    return "Quarts de finale";
  }
  if (roundLower.includes("semi") || roundLower.includes("demi")) {
    return "Demi-finales";
  }
  if (roundLower.includes("third place") || roundLower.includes("third_place")) {
    return "Match pour la 3e place";
  }
  if (roundLower.includes("final")) {
    return "Finale";
  }

  return round;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "FT":
      return "bg-green-500/15 text-green-500";
    case "IN_PROGRESS":
    case "HT":
      return "bg-orange-500/15 text-orange-500";
    case "NS":
    default:
      return "bg-white/5 text-muted-foreground";
  }
}

export function MatchRow({
  fixture,
  index = 0,
  allFixtures,
}: {
  fixture: Fixture;
  index?: number;
  allFixtures?: Fixture[];
}) {
  const router = useRouter();
  const status = fixtureStatus(fixture);
  const statusLabel = FIXTURE_STATUS_LABELS[status] ?? fixture.status.long;
  const matchNumber = fixture.matchNumber ?? fixture.id;
  const roundLabel = getRoundLabel(fixture.round, fixture.matchday);
  const hasScore = shouldShowScore(fixture);
  const statusColor = getStatusColor(status);

  const handleTeamClick = (e: React.MouseEvent, teamName: string, teamCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    const slug = teamSlug(teamName, teamCode);
    router.push(`/equipes/${slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
    >
      <Link
        href={fixtureHref(fixture, allFixtures)}
        className={cn("block p-4 sm:p-5", panelBase, premiumCardHover)}
      >
        {/* Match Number as Title */}
        <div className="text-sm sm:text-base font-bold text-senegal-green uppercase tracking-wider mb-3 text-center">
          Match {matchNumber}
        </div>

        {/* Group and Round */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
          {fixture.group && (
            <>
              <span className="font-semibold text-primary">Groupe {fixture.group}</span>
              <span>•</span>
            </>
          )}
          <span>{roundLabel}</span>
        </div>

        {/* Teams with flags and score */}
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(180px,1fr)_auto_minmax(180px,1fr)] items-center gap-3 sm:gap-4 mb-4">
          {/* Home: Nom + Drapeau */}
          <button
            type="button"
            onClick={(e) => handleTeamClick(e, fixture.teams.home.name, fixture.teams.home.code)}
            className="flex items-center justify-end gap-2 min-w-0 hover:opacity-80 transition-opacity bg-transparent border-0 p-0 cursor-pointer"
          >
            <span className="text-base sm:text-lg font-semibold truncate text-right">{fixture.teams.home.name}</span>
            <TeamFlag
              code={fixture.teams.home.code}
              teamName={fixture.teams.home.name}
              size="md"
              className="h-8 w-12 rounded-lg shrink-0"
            />
          </button>

          {/* Score */}
          <div className="shrink-0 px-2 text-center order-first sm:order-0">
            {hasScore ? (
              <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight">
                {fixture.goals.home}
                <span className="text-muted-foreground mx-1.5 font-light">–</span>
                {fixture.goals.away}
              </p>
            ) : (
              <p className="text-xl text-muted-foreground font-light">vs</p>
            )}
          </div>

          {/* Away: Drapeau + Nom */}
          <button
            type="button"
            onClick={(e) => handleTeamClick(e, fixture.teams.away.name, fixture.teams.away.code)}
            className="flex items-center justify-start gap-2 min-w-0 hover:opacity-80 transition-opacity bg-transparent border-0 p-0 cursor-pointer"
          >
            <TeamFlag
              code={fixture.teams.away.code}
              teamName={fixture.teams.away.name}
              size="md"
              className="h-8 w-12 rounded-lg shrink-0"
            />
            <span className="text-base sm:text-lg font-semibold truncate text-left">{fixture.teams.away.name}</span>
          </button>
        </div>

        {/* Venue and Date */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">{fixture.venue.name}</span>
            <span>•</span>
            <span>{fixture.venue.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>{formatDate(fixture.date)}</span>
            <span>•</span>
            <span>{formatTime(fixture.date)}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="mt-3 flex justify-center">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
              statusColor
            )}
          >
            {statusLabel}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
