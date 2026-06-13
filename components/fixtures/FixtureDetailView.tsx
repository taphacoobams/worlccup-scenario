"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GroupStandingsSection } from "@/components/fixtures/GroupStandingsSection";
import { MatchKitsShowcase } from "@/components/fixtures/MatchKitsShowcase";
import { MatchEventsTimeline } from "@/components/fixtures/MatchEventsTimeline";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { VenueCard } from "@/components/worldcup/VenueCard";
import { Button } from "@/components/ui/button";
import { DataCard, DataCardContent } from "@/components/ui/data-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { FixtureDetail, GroupStanding } from "@/types/worldcup";
import type { TeamKitImage } from "@/types/match-kits";
import {
  FIXTURE_STATUS_LABELS,
  fixtureStatus,
  isMatchFinished,
  shouldShowScore,
} from "@/types/worldcup";

type H2HMatch = {
  id: number;
  date: string;
  teams: { home: { name: string }; away: { name: string } };
  goals: { home: number | null; away: number | null };
};

type Props = {
  fixture: FixtureDetail;
  kits: { home: TeamKitImage; away: TeamKitImage } | null;
  h2h: H2HMatch[];
  groupStandings?: GroupStanding[];
};

export function FixtureDetailView({ fixture, kits, h2h, groupStandings }: Props) {
  const hasScore = shouldShowScore(fixture);
  const status = fixtureStatus(fixture);
  const finished = isMatchFinished(fixture);

  return (
    <div className="page-container max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/fixtures">
          <ArrowLeft className="h-4 w-4" /> Retour au calendrier
        </Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPanel className="p-6 sm:p-10 mb-6 text-center">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {fixture.group && (
              <span className="rounded-lg bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                Groupe {fixture.group}
              </span>
            )}
            {fixture.round && (
              <span className="rounded-lg bg-surface-light px-3 py-1 text-xs text-text-secondary">
                {fixture.round}
              </span>
            )}
            <span className="rounded-lg bg-white/5 px-3 py-1 text-xs text-text-secondary">
              {FIXTURE_STATUS_LABELS[status] ?? fixture.status.long}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <TeamBadge team={fixture.teams.home} size="lg" />
            <div>
              {hasScore ? (
                <p className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight">
                  {fixture.goals.home}
                  <span className="text-text-secondary mx-2 font-light">–</span>
                  {fixture.goals.away}
                </p>
              ) : (
                <p className="text-3xl text-text-secondary font-light">vs</p>
              )}
            </div>
            <TeamBadge team={fixture.teams.away} size="lg" />
          </div>

          {kits && (
            <div className="mt-8 pt-8 border-t border-border">
              <MatchKitsShowcase
                homeName={fixture.teams.home.name}
                awayName={fixture.teams.away.name}
                homeKit={kits.home}
                awayKit={kits.away}
              />
            </div>
          )}
        </GlassPanel>
      </motion.div>

      {fixture.events?.length > 0 && (
        <MatchEventsTimeline
          events={fixture.events}
          homeTeam={fixture.teams.home}
          awayTeam={fixture.teams.away}
        />
      )}

      <VenueCard fixture={fixture} />

      {fixture.group && groupStandings && groupStandings.length > 0 && (
        <GroupStandingsSection
          groupLetter={fixture.group}
          standings={groupStandings}
          highlightTeamIds={[fixture.teams.home.id, fixture.teams.away.id]}
        />
      )}

      {finished && h2h.length > 0 && (
        <DataCard className="mt-8">
          <DataCardContent className="pt-6 space-y-3">
            <h3 className="font-semibold mb-4">Face à face</h3>
            {h2h.map((m) => (
              <div key={m.id} className="flex justify-between gap-2 text-sm py-2 border-b border-border last:border-0">
                <span className="text-text-secondary">
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(m.date))}
                </span>
                <span className="font-medium tabular-nums">
                  {m.teams.home.name} {m.goals.home} – {m.goals.away} {m.teams.away.name}
                </span>
              </div>
            ))}
          </DataCardContent>
        </DataCard>
      )}
    </div>
  );
}
