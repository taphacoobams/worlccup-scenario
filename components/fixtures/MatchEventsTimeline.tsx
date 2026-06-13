"use client";

import { motion } from "framer-motion";
import type { FixtureEvent, Team } from "@/types/worldcup";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { DataCard, DataCardContent, DataCardHeader, DataCardTitle } from "@/components/ui/data-card";
import { cn } from "@/lib/utils";

function eventIcon(type: string, detail: string): string {
  if (type === "Goal") return "⚽";
  if (type === "Card") {
    if (/red/i.test(detail)) return "🟥";
    return "🟨";
  }
  if (/assist/i.test(type)) return "🎯";
  return "•";
}

function formatMinute(time: FixtureEvent["time"]): string {
  const base = time.elapsed ?? 0;
  if (time.extra && time.extra > 0) return `${base}+${time.extra}`;
  return `${base}`;
}

type Props = {
  events: FixtureEvent[];
  homeTeam: Team;
  awayTeam: Team;
};

function EventCard({
  event,
  align,
}: {
  event: FixtureEvent;
  align: "home" | "away";
}) {
  const isHome = align === "home";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-light/40 px-3 py-2.5 sm:px-4 sm:py-3",
        isHome ? "text-right mr-1 sm:mr-2" : "text-left ml-1 sm:ml-2"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 mb-1",
          isHome ? "flex-row-reverse justify-start" : "flex-row"
        )}
      >
        <span className="text-base leading-none" aria-hidden>
          {eventIcon(event.type, event.detail)}
        </span>
        <p className="text-sm font-semibold truncate">{event.player.name ?? event.detail}</p>
      </div>
      {event.assist?.name && (
        <p className={cn("text-xs text-text-secondary", isHome && "text-right")}>
          🎯 {event.assist.name}
        </p>
      )}
      {event.type === "Goal" && /own/i.test(event.detail) && (
        <span className="text-[10px] text-gold font-medium">CSC</span>
      )}
    </div>
  );
}

export function MatchEventsTimeline({ events, homeTeam, awayTeam }: Props) {
  if (!events.length) return null;

  const sorted = [...events].sort((a, b) => {
    const ma = (a.time.elapsed ?? 0) * 100 + (a.time.extra ?? 0);
    const mb = (b.time.elapsed ?? 0) * 100 + (b.time.extra ?? 0);
    return ma - mb;
  });

  const isHomeEvent = (e: FixtureEvent) => e.team.id === homeTeam.id;

  return (
    <DataCard className="mt-6">
      <DataCardHeader>
        <DataCardTitle>Événements</DataCardTitle>
      </DataCardHeader>
      <DataCardContent>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 mb-6 px-1">
          <div className="flex flex-col items-end gap-1 min-w-0">
            <TeamBadge team={homeTeam} size="sm" className="justify-end" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              Domicile
            </span>
          </div>
          <span className="text-xs text-text-secondary px-2">vs</span>
          <div className="flex flex-col items-start gap-1 min-w-0">
            <TeamBadge team={awayTeam} size="sm" />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
              Extérieur
            </span>
          </div>
        </div>

        <div className="relative space-y-3 sm:space-y-4">
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border"
            aria-hidden
          />

          {sorted.map((event, i) => {
            const home = isHomeEvent(event);
            return (
              <motion.div
                key={`${event.time.elapsed}-${event.time.extra}-${event.team.id}-${event.player.name}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3"
              >
                <div className="min-w-0">
                  {home ? <EventCard event={event} align="home" /> : null}
                </div>

                <div className="relative z-10 flex flex-col items-center shrink-0">
                  <span className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-full border border-border bg-surface px-2 text-xs font-bold tabular-nums text-primary">
                    {formatMinute(event.time)}&apos;
                  </span>
                </div>

                <div className="min-w-0">
                  {!home ? <EventCard event={event} align="away" /> : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </DataCardContent>
    </DataCard>
  );
}
