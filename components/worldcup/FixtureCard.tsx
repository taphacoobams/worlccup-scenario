import Link from "next/link";
import type { Fixture } from "@/types/worldcup";
import { shouldShowScore } from "@/types/worldcup";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = { fixture: Fixture; compact?: boolean };

export function FixtureCard({ fixture, compact }: Props) {
  const hasScore = shouldShowScore(fixture);

  return (
    <Link href={`/fixtures/${fixture.id}`}>
      <Card className="hover:border-senegal-green/40 transition-all h-full">
        <CardContent className={cn("pt-6", compact && "pt-4 pb-4")}>
          {fixture.group && (
            <span className="text-xs font-bold text-gold mb-3 block">
              Groupe {fixture.group}
            </span>
          )}
          <div className="flex items-center justify-between gap-2">
            <TeamBadge team={fixture.teams.home} size={compact ? "sm" : "md"} />
            <div className="text-center px-2">
              {hasScore ? (
                <span className="text-xl font-bold tabular-nums">
                  {fixture.goals.home} – {fixture.goals.away}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">vs</span>
              )}
            </div>
            <TeamBadge team={fixture.teams.away} size={compact ? "sm" : "md"} />
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
