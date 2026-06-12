import Link from "next/link";
import type { EnrichedTableauMatch, EnrichedTableauRound } from "@/lib/worldcup-data";
import { BracketParticipant } from "@/components/worldcup/BracketParticipant";
import { shouldShowScore } from "@/types/worldcup";
import { cn } from "@/lib/utils";

type Props = {
  rounds: EnrichedTableauRound[];
};

const BRACKET_MIN_HEIGHT = 16 * 52;

function MatchBox({ match }: { match: EnrichedTableauMatch }) {
  const f = match.fixture;
  const content = (
    <div
      className={cn(
        "relative rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 min-w-[200px]",
        "hover:border-senegal-green/50 hover:bg-white/10 transition-colors",
        f && "cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <BracketParticipant
          team={f?.teams.home}
          slot={match.home}
          resolved={match.homeResolved}
        />
        <span className="text-muted-foreground text-xs shrink-0 font-medium">vs</span>
        <BracketParticipant
          team={f?.teams.away}
          slot={match.away}
          resolved={match.awayResolved}
        />
      </div>
      {f && shouldShowScore(f) && (
        <p className="text-center font-bold tabular-nums text-sm mt-2">
          {f.goals.home} – {f.goals.away}
        </p>
      )}
      <p className="text-[10px] text-muted-foreground mt-2 text-center truncate">
        {match.date ?? "—"}
      </p>
      <p className="text-[10px] text-muted-foreground/80 text-center truncate">
        M{match.matchNumber} · {match.id}
      </p>
    </div>
  );

  if (f) {
    return (
      <Link href={`/fixtures/${f.id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function KnockoutBracketTree({ rounds }: Props) {
  if (rounds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Tableau final non disponible.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2">
      <div className="inline-flex items-stretch gap-0 min-w-max">
        {rounds.map((round, roundIndex) => (
          <div
            key={round.key}
            className={cn(
              "flex flex-col px-3 relative",
              roundIndex < rounds.length - 1 &&
                "border-r border-dashed border-white/20"
            )}
            style={{ minHeight: BRACKET_MIN_HEIGHT }}
          >
            <h3 className="text-center text-xs font-bold text-gold mb-3 sticky top-0 bg-background/90 py-1 z-10 whitespace-nowrap">
              {round.label}
            </h3>
            <div className="flex flex-col flex-1 justify-around gap-1 py-2">
              {round.matches.map((m) => (
                <div
                  key={`${round.key}-${m.matchNumber}`}
                  className="relative flex items-center"
                >
                  {roundIndex < rounds.length - 1 && (
                    <span
                      className="absolute right-0 top-1/2 w-3 h-px bg-white/25 translate-x-full z-0"
                      aria-hidden
                    />
                  )}
                  <MatchBox match={m} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
