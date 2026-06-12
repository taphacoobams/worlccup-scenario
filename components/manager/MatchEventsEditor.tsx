"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { playersForTeam } from "@/lib/manager-roster";
import type { ManualFixture, ManualPlayer, WorldCupManualData } from "@/types/worldcup-manual";
import type { MatchEvent } from "@/types/match-events";
import {
  createMatchEvent,
  formatEventTimelineLine,
  normalizeMatchEvents,
  removeEventById,
  resolvePlayerIdFromCode,
  sortEventsChronologically,
} from "@/lib/tournament-engine/events";
import { MatchMinuteInput } from "@/components/manager/MatchMinuteInput";
import { cn } from "@/lib/utils";

type Props = {
  fixture: ManualFixture;
  teams: WorldCupManualData["teams"];
  players?: ManualPlayer[];
  onChange: (events: MatchEvent[]) => void;
};

type MatchTime = { minute: number; addedTime?: number };
type AddMode = "goal" | "yellow" | "red" | null;

function nextMatchTime(events: MatchEvent[]): MatchTime {
  if (events.length === 0) return { minute: 1 };
  const sorted = sortEventsChronologically(events);
  const last = sorted[sorted.length - 1];
  if (last.addedTime != null && last.addedTime > 0 && last.addedTime < 15) {
    return { minute: last.minute, addedTime: last.addedTime + 1 };
  }
  return { minute: Math.min(last.minute + 1, 120) || 1 };
}

function PlayerSelect({
  teamId,
  value,
  onChange,
  onPlayerPick,
  label,
  players,
  className,
}: {
  teamId: number;
  value: string | null;
  onChange: (name: string | null) => void;
  onPlayerPick?: (player: ManualPlayer | null) => void;
  label: string;
  players: ManualPlayer[];
  className?: string;
}) {
  const roster = useMemo(() => playersForTeam(teamId, players), [teamId, players]);
  const selectValue =
    value && roster.some((p) => p.name === value) ? value : value ? "__custom__" : "";

  function pickName(name: string | null) {
    onChange(name);
    if (!name) {
      onPlayerPick?.(null);
      return;
    }
    const found = roster.find((p) => p.name === name) ?? null;
    onPlayerPick?.(found);
  }

  if (roster.length === 0) {
    return (
      <label className={cn("block text-xs", className)}>
        <span className="text-muted-foreground">{label}</span>
        <input
          className="mt-1 w-full rounded border border-white/10 bg-card px-2 py-1.5 text-xs"
          placeholder="Nom du joueur"
          value={value ?? ""}
          onChange={(e) => pickName(e.target.value.trim() || null)}
        />
      </label>
    );
  }

  return (
    <label className={cn("block text-xs", className)}>
      <span className="text-muted-foreground">{label}</span>
      <select
        className="mt-1 w-full rounded border border-white/10 bg-card px-2 py-1.5 text-xs"
        value={selectValue}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom__") {
            onChange(value && !roster.some((p) => p.name === value) ? value : null);
            onPlayerPick?.(null);
            return;
          }
          pickName(v || null);
        }}
        aria-label={label}
      >
        <option value="">— Choisir —</option>
        {roster.map((p) => (
          <option key={p.id} value={p.name}>
            {p.name}
            {p.number != null ? ` (#${p.number})` : ""}
          </option>
        ))}
        {value && !roster.some((p) => p.name === value) && (
          <option value={value}>{value}</option>
        )}
        <option value="__custom__">Autre joueur…</option>
      </select>
      {selectValue === "__custom__" && (
        <input
          className="mt-1 w-full rounded border border-white/10 bg-card px-2 py-1.5 text-xs"
          placeholder="Nom du joueur"
          value={value ?? ""}
          onChange={(e) => pickName(e.target.value.trim() || null)}
        />
      )}
    </label>
  );
}

export function MatchEventsEditor({ fixture, teams, players = [], onChange }: Props) {
  const events = normalizeMatchEvents(fixture.events, teams, players);
  const home = teams.find((t) => t.id === fixture.homeTeamId);
  const away = teams.find((t) => t.id === fixture.awayTeamId);

  const [mode, setMode] = useState<AddMode>(null);
  const [matchTime, setMatchTime] = useState<MatchTime>({ minute: 1 });
  const [minuteValid, setMinuteValid] = useState(true);
  const [teamId, setTeamId] = useState(fixture.homeTeamId);
  const [scorer, setScorer] = useState<string | null>(null);
  const [scorerPlayerId, setScorerPlayerId] = useState("");
  const [assist, setAssist] = useState<string | null>(null);
  const [assistPlayerId, setAssistPlayerId] = useState("");
  const [ownGoal, setOwnGoal] = useState(false);
  const [cardPlayer, setCardPlayer] = useState<string | null>(null);
  const [cardPlayerId, setCardPlayerId] = useState("");

  const sorted = sortEventsChronologically(events);
  const teamCode = teams.find((t) => t.id === teamId)?.code ?? "";

  function commitEvents(next: MatchEvent[]) {
    onChange(normalizeMatchEvents(next, teams, players));
  }

  function resetForm() {
    setMode(null);
    setScorer(null);
    setScorerPlayerId("");
    setAssist(null);
    setAssistPlayerId("");
    setOwnGoal(false);
    setCardPlayer(null);
    setCardPlayerId("");
  }

  function submitGoal() {
    if (!scorer?.trim() || !minuteValid || !teamCode) return;

    const goal = createMatchEvent({
      minute: matchTime.minute,
      addedTime: matchTime.addedTime,
      type: "goal",
      playerId: scorerPlayerId || resolvePlayerIdFromCode(scorer, teamCode, teams, players),
      playerName: scorer.trim(),
      teamCode,
      isOwnGoal: ownGoal || undefined,
    });

    const next: MatchEvent[] = [...events, goal];

    if (!ownGoal && assist?.trim()) {
      next.push(
        createMatchEvent({
          minute: matchTime.minute,
          addedTime: matchTime.addedTime,
          type: "assist",
          playerId: assistPlayerId || resolvePlayerIdFromCode(assist, teamCode, teams, players),
          playerName: assist.trim(),
          teamCode,
          linkedGoalId: goal.id,
        })
      );
    }

    commitEvents(next);
    setMatchTime(nextMatchTime(next));
    resetForm();
  }

  function submitCard(type: "yellow_card" | "red_card") {
    if (!cardPlayer?.trim() || !teamCode || !minuteValid) return;

    const event = createMatchEvent({
      minute: matchTime.minute,
      addedTime: matchTime.addedTime,
      type,
      playerId: cardPlayerId || resolvePlayerIdFromCode(cardPlayer, teamCode, teams, players),
      playerName: cardPlayer.trim(),
      teamCode,
    });

    commitEvents([...events, event]);
    setMatchTime(nextMatchTime([...events, event]));
    resetForm();
  }

  function openMode(m: AddMode) {
    setMode(m);
    setMatchTime(nextMatchTime(events));
    setMinuteValid(true);
    if (m && home) setTeamId(home.id);
    setCardPlayer(null);
    setCardPlayerId("");
    setScorer(null);
    setScorerPlayerId("");
    setAssist(null);
    setAssistPlayerId("");
    setOwnGoal(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gold">Timeline</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun événement.</p>
        ) : (
          <ul className="space-y-0.5 font-mono text-sm">
            {sorted.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 group">
                <span>{formatEventTimelineLine(e)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] opacity-0 group-hover:opacity-100"
                  onClick={() => commitEvents(removeEventById(events, e.id))}
                >
                  Supprimer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Ajouter un événement</h3>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant={mode === "goal" ? "default" : "outline"} onClick={() => openMode("goal")}>
            But
          </Button>
          <Button type="button" size="sm" variant={mode === "yellow" ? "default" : "outline"} onClick={() => openMode("yellow")}>
            Carton jaune
          </Button>
          <Button type="button" size="sm" variant={mode === "red" ? "default" : "outline"} onClick={() => openMode("red")}>
            Carton rouge
          </Button>
        </div>

        {mode === "goal" && home && away && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 grid sm:grid-cols-2 gap-3">
            <MatchMinuteInput
              key={`goal-${matchTime.minute}-${matchTime.addedTime ?? 0}`}
              value={matchTime}
              onChange={setMatchTime}
              onValidityChange={setMinuteValid}
            />
            <label className="text-xs">
              <span className="text-muted-foreground">Équipe</span>
              <select
                className="mt-1 w-full rounded border border-white/10 bg-card px-2 py-1.5 text-xs"
                value={teamId}
                onChange={(e) => setTeamId(Number(e.target.value))}
              >
                <option value={home.id}>{home.name}</option>
                <option value={away.id}>{away.name}</option>
              </select>
            </label>
            <PlayerSelect
              teamId={teamId}
              value={scorer}
              onChange={setScorer}
              onPlayerPick={(p) => setScorerPlayerId(p ? String(p.id) : "")}
              label="Buteur"
              players={players}
            />
            {!ownGoal && (
              <PlayerSelect
                teamId={teamId}
                value={assist}
                onChange={setAssist}
                onPlayerPick={(p) => setAssistPlayerId(p ? String(p.id) : "")}
                label="Passe décisive (facultatif)"
                players={players}
              />
            )}
            <label className="text-xs flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={ownGoal}
                onChange={(e) => {
                  setOwnGoal(e.target.checked);
                  if (e.target.checked) {
                    setAssist(null);
                    setAssistPlayerId("");
                  }
                }}
                className="rounded border-white/20"
              />
              <span className="text-muted-foreground">Contre son camp (CSC)</span>
            </label>
            <div className="sm:col-span-2 flex gap-2">
              <Button type="button" size="sm" onClick={submitGoal} disabled={!minuteValid}>
                Ajouter le but
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </div>
        )}

        {(mode === "yellow" || mode === "red") && home && away && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 grid sm:grid-cols-2 gap-3">
            <MatchMinuteInput
              key={`card-${matchTime.minute}-${matchTime.addedTime ?? 0}`}
              value={matchTime}
              onChange={setMatchTime}
              onValidityChange={setMinuteValid}
            />
            <label className="text-xs">
              <span className="text-muted-foreground">Équipe</span>
              <select
                className="mt-1 w-full rounded border border-white/10 bg-card px-2 py-1.5 text-xs"
                value={teamId}
                onChange={(e) => {
                  setTeamId(Number(e.target.value));
                  setCardPlayer(null);
                  setCardPlayerId("");
                }}
              >
                <option value={home.id}>{home.name}</option>
                <option value={away.id}>{away.name}</option>
              </select>
            </label>
            <PlayerSelect
              teamId={teamId}
              value={cardPlayer}
              onChange={setCardPlayer}
              onPlayerPick={(p) => setCardPlayerId(p ? String(p.id) : "")}
              label="Joueur"
              players={players}
              className="sm:col-span-2"
            />
            <div className="sm:col-span-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={!minuteValid}
                onClick={() => submitCard(mode === "red" ? "red_card" : "yellow_card")}
              >
                Ajouter le carton
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
