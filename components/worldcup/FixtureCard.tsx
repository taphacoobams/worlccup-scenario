import Link from "next/link";
import type { Fixture } from "@/types/worldcup";
import { shouldShowScore } from "@/types/worldcup";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { fixtureHref } from "@/lib/slugs/fixture";
import { cn } from "@/lib/utils";

type Props = {
  fixture: Fixture;
  compact?: boolean;
  allFixtures?: Fixture[];
};

export function FixtureCard({ fixture, compact, allFixtures }: Props) {
  const hasScore = shouldShowScore(fixture);

  return (
    <Link href={fixtureHref(fixture, allFixtures)}>
      <Card className="hover:border-senegal-green/40 transition-all h-full">
        <CardContent className={cn("pt-6", compact && "pt-4 pb-4")}>
          {fixture.group && (
            <span className="text-xs font-bold text-gold mb-3 block">
              Groupe {fixture.group}
            </span>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-2">
            <TeamBadge
              team={fixture.teams.home}
              size={compact ? "sm" : "md"}
              className="justify-center sm:justify-end"
            />
            <div className="text-center px-2 order-first sm:order-none">
              {hasScore ? (
                <span className="text-xl font-bold tabular-nums">
                  {fixture.goals.home} – {fixture.goals.away}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">vs</span>
              )}
            </div>
            <TeamBadge
              team={fixture.teams.away}
              size={compact ? "sm" : "md"}
              className="justify-center sm:justify-start"
            />
          </div>
          {!compact && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              {fixture.venue.name}, {fixture.venue.city}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
