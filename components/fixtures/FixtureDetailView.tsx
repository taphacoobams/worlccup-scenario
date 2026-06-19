"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { GroupStandingsSection } from "@/components/fixtures/GroupStandingsSection";
import { MatchKitsShowcase } from "@/components/fixtures/MatchKitsShowcase";
import { MatchEventsTimeline } from "@/components/fixtures/MatchEventsTimeline";
import { MatchHeader } from "@/components/fixtures/MatchHeader";
import { VenueCard } from "@/components/worldcup/VenueCard";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { PATHS } from "@/lib/i18n/paths";
import { useLocale } from "@/context/locale-context";
import type { FixtureDetail, GroupStanding } from "@/types/worldcup";
import type { TeamKitImage } from "@/types/match-kits";

type Props = {
  fixture: FixtureDetail;
  kits: { home: TeamKitImage; away: TeamKitImage } | null;
  groupStandings?: GroupStanding[];
};

export function FixtureDetailView({ fixture, kits, groupStandings }: Props) {
  const { href } = useLocale();

  return (
    <div className="page-container max-w-4xl">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href={href(PATHS.matchs)}>
          <ArrowLeft className="h-4 w-4" /> Retour au calendrier
        </Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPanel className="p-5 sm:p-6 mb-6 text-center">
          <MatchHeader fixture={fixture} />

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
