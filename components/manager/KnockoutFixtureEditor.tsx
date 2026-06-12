"use client";

import { BracketSlotLabel } from "@/components/worldcup/BracketSlotLabel";
import { TeamFlag } from "@/components/ui/team-flag";
import { Card, CardContent } from "@/components/ui/card";
import {
  isKnockoutFixtureReady,
  slotParticipantLabel,
} from "@/lib/manager-fixtures";
import type { ManualFixture, ManualFixtureStatus, ManualTeam } from "@/types/worldcup-manual";
import { cn } from "@/lib/utils";

type Props = {
  fixture: ManualFixture;
  teamName: (id: number) => string;
  teams: ManualTeam[];
  onChange: (patch: Partial<ManualFixture>) => void;
};

export function KnockoutFixtureEditor({
  fixture,
  teamName,
  teams,
  onChange,
}: Props) {
  const ready = isKnockoutFixtureReady(fixture);
  const home = slotParticipantLabel(fixture, "home", teamName);
  const away = slotParticipantLabel(fixture, "away", teamName);
  const statuses: ManualFixtureStatus[] = ["NS", "FT", "HT", "PST", "CANC", "AET", "PEN"];

  const teamCode = (id: number) => teams.find((t) => t.id === id)?.code ?? "XX";

  return (
    <Card
      className={cn(
        "border-white/10",
        !ready && "border-dashed border-gold/25 bg-gold/[0.03]"
      )}
    >
      <CardContent className="pt-5 pb-5 space-y-4 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold">
              Match {fixture.id}
              <span className="text-muted-foreground font-normal ml-2">
                · {fixture.round}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(fixture.date).toLocaleString("fr-FR")} · {fixture.venue.name},{" "}
              {fixture.venue.city}
            </p>
          </div>
          {!ready && (
            <span className="text-[10px] uppercase tracking-wide font-semibold text-gold/90 bg-gold/10 border border-gold/30 px-2 py-1 rounded">
              En attente
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <ParticipantBlock
            label="Domicile"
            data={home}
            code={home.type === "team" ? teamCode(fixture.homeTeamId) : undefined}
          />
          <ParticipantBlock
            label="Extérieur"
            data={away}
            code={away.type === "team" ? teamCode(fixture.awayTeamId) : undefined}
          />
        </div>

        {!ready && (
          <p className="text-xs text-muted-foreground rounded-lg bg-white/5 border border-white/10 px-3 py-2">
            Créneaux provisoires (comme sur Wikipédia) — les équipes et le score seront
            saisissables une fois la phase de groupes terminée et les qualifiés connus.
          </p>
        )}

        <div
          className={cn(
            "grid sm:grid-cols-3 gap-3",
            !ready && "opacity-50 pointer-events-none"
          )}
        >
          <label className="text-xs">
            Statut
            <select
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1"
              value={fixture.status}
              disabled={!ready}
              onChange={(e) =>
                onChange({ status: e.target.value as ManualFixtureStatus })
              }
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Score dom.
            <input
              type="number"
              min={0}
              disabled={!ready}
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1 tabular-nums"
              value={fixture.goals.home ?? ""}
              onChange={(e) =>
                onChange({
                  goals: {
                    ...fixture.goals,
                    home: e.target.value === "" ? null : Number(e.target.value),
                  },
                  status: fixture.status === "NS" ? "FT" : fixture.status,
                })
              }
            />
          </label>
          <label className="text-xs">
            Score ext.
            <input
              type="number"
              min={0}
              disabled={!ready}
              className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1 tabular-nums"
              value={fixture.goals.away ?? ""}
              onChange={(e) =>
                onChange({
                  goals: {
                    ...fixture.goals,
                    away: e.target.value === "" ? null : Number(e.target.value),
                  },
                  status: fixture.status === "NS" ? "FT" : fixture.status,
                })
              }
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

function ParticipantBlock({
  label,
  data,
  code,
}: {
  label: string;
  data: ReturnType<typeof slotParticipantLabel>;
  code?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      {data.type === "team" ? (
        <div className="flex items-center gap-2">
          {code && <TeamFlag code={code} teamName={data.name} size="sm" />}
          <span className="font-semibold">{data.name}</span>
        </div>
      ) : (
        <>
          <BracketSlotLabel label={data.slot} className="text-sm px-2 py-1" />
          <p className="text-xs text-muted-foreground italic">{data.hint}</p>
        </>
      )}
    </div>
  );
}
