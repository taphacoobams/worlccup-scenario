"use client";

import Link from "next/link";
import type { EnrichedTableauMatch, EnrichedTableauRound } from "@/lib/worldcup-data";
import { BracketParticipant } from "@/components/worldcup/BracketParticipant";
import { shouldShowScore } from "@/types/worldcup";
import { cn } from "@/lib/utils";

const MATCH_HEIGHT = 64;
const BASE_UNIT = 72;
const COL_WIDTH = 210;
const CONNECTOR = 28;

type Props = {
  rounds: EnrichedTableauRound[];
};

function matchTop(roundIndex: number, matchIndex: number): number {
  return ((matchIndex * 2 + 1) * Math.pow(2, roundIndex) * BASE_UNIT) / 2 - MATCH_HEIGHT / 2;
}

function bracketHeight(matchCount: number, roundIndex: number): number {
  const lastIndex = Math.max(0, matchCount - 1);
  return matchTop(roundIndex, lastIndex) + MATCH_HEIGHT + BASE_UNIT;
}

function splitRound(round: EnrichedTableauRound) {
  const mid = Math.ceil(round.matches.length / 2);
  return {
    left: round.matches.slice(0, mid),
    right: round.matches.slice(mid),
  };
}

function getWinnerSide(match: EnrichedTableauMatch): "home" | "away" | null {
  const f = match.fixture;
  if (!f || !shouldShowScore(f)) return null;
  const h = f.goals.home ?? 0;
  const a = f.goals.away ?? 0;
  if (h === a) return null;
  return h > a ? "home" : "away";
}

function BracketMatchCard({
  match,
  roundIndex,
  matchIndex,
  inline = false,
}: {
  match: EnrichedTableauMatch;
  roundIndex: number;
  matchIndex: number;
  inline?: boolean;
}) {
  const f = match.fixture;
  const winner = getWinnerSide(match);

  const inner = (
    <div
      className={cn(
        "rounded-xl border bg-[#0c1a2d]/90 backdrop-blur-sm w-full",
        "border-white/12 shadow-[0_4px_24px_rgba(0,0,0,0.35)]",
        "hover:border-primary/40 hover:bg-[#0f2038] transition-all duration-200",
        f && "cursor-pointer"
      )}
      style={{ height: MATCH_HEIGHT }}
    >
      <div className="flex h-full flex-col justify-center px-3 py-1.5 gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <div
            className={cn(
              "flex-1 min-w-0 rounded-md px-1 py-0.5",
              winner === "home" && "bg-primary/15 ring-1 ring-primary/30"
            )}
          >
            <BracketParticipant
              team={f?.teams.home}
              slot={match.home}
              resolved={match.homeResolved}
              size="sm"
            />
          </div>
          {f && shouldShowScore(f) ? (
            <span className="text-xs font-bold tabular-nums shrink-0 px-1">
              {f.goals.home}–{f.goals.away}
            </span>
          ) : (
            <span className="text-[10px] text-text-secondary shrink-0">vs</span>
          )}
          <div
            className={cn(
              "flex-1 min-w-0 rounded-md px-1 py-0.5 flex justify-end",
              winner === "away" && "bg-primary/15 ring-1 ring-primary/30"
            )}
          >
            <BracketParticipant
              team={f?.teams.away}
              slot={match.away}
              resolved={match.awayResolved}
              size="sm"
            />
          </div>
        </div>
        <p className="text-[9px] text-text-secondary text-center truncate leading-none">
          {match.id} · {match.date ?? "—"}
        </p>
      </div>
    </div>
  );

  const positioned = inline ? (
    inner
  ) : (
    <div
      className="absolute left-0 w-full"
      style={{ top: matchTop(roundIndex, matchIndex), height: MATCH_HEIGHT }}
    >
      {inner}
    </div>
  );

  if (f) {
    return (
      <Link href={`/fixtures/${f.id}`} className="block">
        {positioned}
      </Link>
    );
  }

  return positioned;
}

function RoundColumn({
  round,
  side,
  roundIndex,
  showConnectors,
}: {
  round: EnrichedTableauRound;
  side: "left" | "right";
  roundIndex: number;
  showConnectors: boolean;
}) {
  const { left, right } = splitRound(round);
  const matches = side === "left" ? left : [...right].reverse();
  const height = bracketHeight(Math.max(left.length, right.length), roundIndex);

  return (
    <div className="relative shrink-0" style={{ width: COL_WIDTH, height }}>
      <h3 className="sticky top-0 z-20 mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-gold bg-background/90 py-1.5 backdrop-blur-sm">
        {round.label}
      </h3>
      <div className="relative" style={{ height: height - 40 }}>
        {matches.map((m, i) => (
          <BracketMatchCard
            key={`${round.key}-${m.matchNumber}`}
            match={m}
            roundIndex={roundIndex}
            matchIndex={i}
          />
        ))}
        {showConnectors && matches.length > 1 && (
          <svg
            className={cn(
              "absolute top-0 h-full pointer-events-none text-white/25",
              side === "left" ? "-right-7" : "-left-7"
            )}
            width={CONNECTOR}
            aria-hidden
          >
            {matches.map((_, i) => {
              if (i % 2 !== 0 || i + 1 >= matches.length) return null;
              const y = matchTop(roundIndex, i) + MATCH_HEIGHT / 2;
              const y2 = matchTop(roundIndex, i + 1) + MATCH_HEIGHT / 2;
              const midY = (y + y2) / 2;
              const xIn = side === "left" ? 0 : CONNECTOR;
              const xOut = side === "left" ? CONNECTOR : 0;
              return (
                <g key={i} stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path d={`M ${xIn} ${y} H ${xOut - 6} V ${midY}`} />
                  <path d={`M ${xIn} ${y2} H ${xOut - 6} V ${midY}`} />
                  <path d={`M ${xOut - 6} ${midY} H ${xOut}`} />
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}

function CenterFinal({
  finalRound,
  thirdRound,
}: {
  finalRound?: EnrichedTableauRound;
  thirdRound?: EnrichedTableauRound;
}) {
  const finalMatch = finalRound?.matches[0];
  const thirdMatch = thirdRound?.matches[0];

  return (
    <div className="flex flex-col items-center justify-center shrink-0 px-3 min-w-[230px] self-center">
      {finalRound && finalMatch && (
        <div className="w-full">
          <h3 className="text-center text-[11px] font-bold uppercase tracking-wider text-gold mb-3">
            {finalRound.label}
          </h3>
          <div className="rounded-2xl border-2 border-gold/40 bg-gradient-to-b from-gold/10 to-transparent p-1.5 shadow-[0_0_40px_rgba(212,175,55,0.12)]">
            <BracketMatchCard match={finalMatch} roundIndex={0} matchIndex={0} inline />
          </div>
        </div>
      )}
      {thirdRound && thirdMatch && (
        <div className="w-full mt-10">
          <h3 className="text-center text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-2">
            {thirdRound.label}
          </h3>
          <BracketMatchCard match={thirdMatch} roundIndex={0} matchIndex={0} inline />
        </div>
      )}
    </div>
  );
}

export function KnockoutBracketUefa({ rounds }: Props) {
  const treeRounds = rounds.filter(
    (r) => r.key !== "final" && r.key !== "third_place"
  );
  const finalRound = rounds.find((r) => r.key === "final");
  const thirdRound = rounds.find((r) => r.key === "third_place");

  if (treeRounds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Tableau final non disponible.
      </p>
    );
  }

  const leftRounds = treeRounds;
  const rightRounds = [...treeRounds].reverse();

  const maxHalf = Math.max(
    ...treeRounds.map((r) => Math.ceil(r.matches.length / 2))
  );
  const containerHeight = bracketHeight(maxHalf, treeRounds.length - 1) + 48;

  return (
    <div className="overflow-x-auto pb-6 -mx-2 px-2 bracket-scroll">
      <div
        className="inline-flex items-center gap-1 min-w-max mx-auto"
        style={{ minHeight: containerHeight }}
      >
        <div className="flex items-center">
          {leftRounds.map((round, i) => (
            <RoundColumn
              key={`L-${round.key}`}
              round={round}
              side="left"
              roundIndex={i}
              showConnectors={i < leftRounds.length - 1}
            />
          ))}
        </div>

        <CenterFinal finalRound={finalRound} thirdRound={thirdRound} />

        <div className="flex items-center">
          {rightRounds.map((round, i) => (
            <RoundColumn
              key={`R-${round.key}`}
              round={round}
              side="right"
              roundIndex={treeRounds.length - 1 - i}
              showConnectors={i < rightRounds.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
