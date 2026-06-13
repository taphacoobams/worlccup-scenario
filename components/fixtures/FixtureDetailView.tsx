"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GroupStandingsSection } from "@/components/fixtures/GroupStandingsSection";
import { MatchKitsShowcase } from "@/components/fixtures/MatchKitsShowcase";
import { MatchEventsTimeline } from "@/components/fixtures/MatchEventsTimeline";
import { BracketSlotLabel } from "@/components/worldcup/BracketSlotLabel";
import { TeamFlag } from "@/components/ui/team-flag";
import { VenueCard } from "@/components/worldcup/VenueCard";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { isBracketSlot } from "@/lib/bracket-slots";
import type { FixtureDetail, GroupStanding, Team } from "@/types/worldcup";
import type { TeamKitImage } from "@/types/match-kits";
import {
  FIXTURE_STATUS_LABELS,
  fixtureStatus,
  shouldShowScore,
} from "@/types/worldcup";

type Props = {
  fixture: FixtureDetail;
  kits: { home: TeamKitImage; away: TeamKitImage } | null;
  groupStandings?: GroupStanding[];
};

function FixtureTeamColumn({ team }: { team: Team }) {
  if (isBracketSlot(team.name)) {
    return (
      <div className="flex flex-1 justify-center min-w-0">
        <BracketSlotLabel label={team.name} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-2 min-w-0 text-center">
      <TeamFlag
        code={team.code}
        teamName={team.name}
        size="md"
        className="h-10 w-14 rounded-lg shadow-md"
      />
      <span className="text-base font-semibold leading-tight">{team.name}</span>
      {team.fifaRanking != null && (
        <span className="text-xs font-medium text-text-secondary tabular-nums">
          FIFA #{team.fifaRanking}
        </span>
      )}
    </div>
  );
}

export function FixtureDetailView({ fixture, kits, groupStandings }: Props) {
  const hasScore = shouldShowScore(fixture);
  const status = fixtureStatus(fixture);

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
            <FixtureTeamColumn team={fixture.teams.home} />
            <div className="shrink-0 px-2">
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
            <FixtureTeamColumn team={fixture.teams.away} />
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
    </div>
  );
}
