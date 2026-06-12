import type { ManualFixture, ManualPlayer, ManualTeam } from "@/types/worldcup-manual";
import type {
  LegacyMatchEvent,
  MatchEvent,
  MatchEventType,
} from "@/types/match-events";

export type { MatchEvent, MatchEventType } from "@/types/match-events";

const ALLOWED_TYPES = new Set<MatchEventType>([
  "goal",
  "assist",
  "yellow_card",
  "red_card",
]);

const TYPE_SORT: Record<MatchEventType, number> = {
  goal: 0,
  assist: 1,
  yellow_card: 2,
  red_card: 3,
};

export function isMatchEventType(type: string): type is MatchEventType {
  return ALLOWED_TYPES.has(type as MatchEventType);
}

export function isLegacyEvent(
  e: MatchEvent | LegacyMatchEvent
): e is LegacyMatchEvent {
  return "time" in e && !("minute" in e && typeof e.minute === "number");
}

export function newEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createMatchEvent(
  params: Omit<MatchEvent, "id" | "createdAt"> & { id?: string; createdAt?: string }
): MatchEvent {
  return {
    id: params.id ?? newEventId(),
    createdAt: params.createdAt ?? new Date().toISOString(),
    minute: params.minute,
    addedTime: params.addedTime,
    type: params.type,
    playerId: params.playerId,
    playerName: params.playerName,
    teamCode: params.teamCode,
    linkedGoalId: params.linkedGoalId,
    isOwnGoal: params.isOwnGoal,
  };
}

function teamCodeForLegacyTeamId(
  teamId: number,
  teams: ManualTeam[]
): string {
  return teams.find((t) => t.id === teamId)?.code ?? "";
}

function isLegacyGoal(type: string): boolean {
  return type === "Goal" || type.toLowerCase() === "goal";
}

function isLegacyCard(type: string): boolean {
  return type === "Card" || type.toLowerCase() === "card";
}

function isOwnGoalDetail(detail: string): boolean {
  return /own\s*goal|contre\s*son\s*camp|csc/i.test(detail);
}

function isYellowDetail(detail: string): boolean {
  return /yellow|jaune/i.test(detail);
}

function isRedDetail(detail: string): boolean {
  return /red|rouge/i.test(detail);
}

/** Convertit l'ancien format (Goal+assistName, Card+detail) vers MatchEvent[] */
export function migrateLegacyEvent(
  e: LegacyMatchEvent,
  teams: ManualTeam[],
  players: ManualPlayer[]
): MatchEvent[] {
  const minute = e.time.elapsed ?? 0;
  const addedTime = e.time.extra ?? undefined;
  const teamCode = teamCodeForLegacyTeamId(e.teamId, teams);
  const playerName = e.playerName?.trim() || "?";
  const playerId = String(
    resolvePlayerLegacyId(playerName, e.teamId, players) ?? ""
  );
  const base = {
    minute,
    addedTime,
    teamCode,
    playerName,
    playerId,
    createdAt: e.createdAt ?? new Date().toISOString(),
  };

  if (isLegacyGoal(e.type)) {
    const goalId = e.id ?? newEventId();
    const own = isOwnGoalDetail(e.detail);
    const goal = createMatchEvent({
      ...base,
      id: goalId,
      type: "goal",
      isOwnGoal: own || undefined,
    });
    const out: MatchEvent[] = [goal];
    if (!own && e.assistName?.trim()) {
      const assistName = e.assistName.trim();
      out.push(
        createMatchEvent({
          ...base,
          type: "assist",
          playerName: assistName,
          playerId: String(
            resolvePlayerLegacyId(assistName, e.teamId, players) ?? ""
          ),
          linkedGoalId: goalId,
        })
      );
    }
    return out;
  }

  if (isLegacyCard(e.type)) {
    const type: MatchEventType = isRedDetail(e.detail)
      ? "red_card"
      : "yellow_card";
    return [
      createMatchEvent({
        ...base,
        id: e.id,
        type,
      }),
    ];
  }

  return [];
}

/** Normalise et filtre les événements (migration legacy incluse) */
export function normalizeMatchEvents(
  events: (MatchEvent | LegacyMatchEvent)[] | undefined,
  teams: ManualTeam[],
  players: ManualPlayer[] = []
): MatchEvent[] {
  if (!events?.length) return [];
  const out: MatchEvent[] = [];
  for (const e of events) {
    if (!isLegacyEvent(e) && isMatchEventType(e.type)) {
      out.push(e);
      continue;
    }
    if (isLegacyEvent(e)) {
      out.push(...migrateLegacyEvent(e, teams, players));
    }
  }
  return out;
}

/** @deprecated Utiliser normalizeMatchEvents */
export function filterAllowedEvents(
  events: (MatchEvent | LegacyMatchEvent)[] | undefined,
  teams: ManualTeam[] = [],
  players: ManualPlayer[] = []
): MatchEvent[] {
  return normalizeMatchEvents(events, teams, players);
}

export function resolvePlayerLegacyId(
  name: string | null | undefined,
  teamLegacyId: number,
  players: ManualPlayer[]
): number | null {
  if (!name?.trim()) return null;
  const trimmed = name.trim();
  const exact = players.find(
    (p) => p.teamId === teamLegacyId && p.name === trimmed
  );
  if (exact) return exact.id;
  const loose = players.find(
    (p) =>
      p.teamId === teamLegacyId &&
      p.name.toLowerCase() === trimmed.toLowerCase()
  );
  return loose?.id ?? null;
}

export function resolvePlayerIdFromCode(
  name: string,
  teamCode: string,
  teams: ManualTeam[],
  players: ManualPlayer[]
): string {
  const team = teams.find((t) => t.code === teamCode);
  if (!team) return "";
  const id = resolvePlayerLegacyId(name, team.id, players);
  return id != null ? String(id) : "";
}

export function sortEventsChronologically(events: MatchEvent[]): MatchEvent[] {
  return [...events].sort(
    (a, b) =>
      a.minute - b.minute ||
      (a.addedTime ?? 0) - (b.addedTime ?? 0) ||
      TYPE_SORT[a.type] - TYPE_SORT[b.type]
  );
}

export function formatEventMinute(
  minute: number | null | undefined,
  addedTime?: number | null
): string {
  if (minute == null) return "?";
  if (addedTime != null && addedTime > 0) return `${minute}+${addedTime}'`;
  return `${minute}'`;
}

export function formatMatchMinuteInput(
  minute: number | null,
  addedTime?: number | null
): string {
  if (minute == null) return "";
  if (addedTime != null && addedTime > 0) return `${minute}+${addedTime}`;
  return String(minute);
}

export function parseMatchMinute(
  input: string
): { minute: number; addedTime?: number } | null {
  const s = input.trim().replace(/\s+/g, "");
  if (!s) return null;

  const m = s.match(/^(\d{1,3})(?:\+(\d{1,2}))?$/);
  if (!m) return null;

  const minute = Number(m[1]);
  const addedTime = m[2] != null ? Number(m[2]) : undefined;

  if (!Number.isFinite(minute) || minute < 0 || minute > 120) return null;
  if (
    addedTime != null &&
    (!Number.isFinite(addedTime) || addedTime < 1 || addedTime > 30)
  ) {
    return null;
  }

  return { minute, addedTime };
}

const EVENT_ICONS: Record<MatchEventType, string> = {
  goal: "⚽",
  assist: "🎯",
  yellow_card: "🟨",
  red_card: "🟥",
};

export function formatEventTimelineLine(e: MatchEvent): string {
  const icon = EVENT_ICONS[e.type];
  const min = formatEventMinute(e.minute, e.addedTime).padEnd(6, " ");
  const csc = e.type === "goal" && e.isOwnGoal ? " (CSC)" : "";
  return `${icon} ${min} ${e.playerName}${csc}`;
}

/** @deprecated */
export function formatGoalTimeline(e: MatchEvent): string {
  return formatEventTimelineLine(e);
}

/** @deprecated */
export function formatCardTimeline(e: MatchEvent): string {
  return formatEventTimelineLine(e);
}

export function teamCodeForFixtureSide(
  fixture: ManualFixture,
  side: "home" | "away",
  teams: ManualTeam[]
): string {
  const teamId = side === "home" ? fixture.homeTeamId : fixture.awayTeamId;
  return teams.find((t) => t.id === teamId)?.code ?? "";
}

export function removeEventById(
  events: MatchEvent[],
  eventId: string
): MatchEvent[] {
  const target = events.find((e) => e.id === eventId);
  if (!target) return events;
  if (target.type === "goal") {
    return events.filter(
      (e) => e.id !== eventId && e.linkedGoalId !== eventId
    );
  }
  return events.filter((e) => e.id !== eventId);
}

/** @deprecated Ancien modèle — utiliser `isMatchEventType` / types `goal` | `yellow_card` */
export type AllowedEventType = "goal" | "card";

/** @deprecated */
export function normalizeEventType(type: string): AllowedEventType | null {
  const t = type.toLowerCase();
  if (t === "goal") return "goal";
  if (t === "card" || t === "yellow_card" || t === "red_card") return "card";
  return null;
}

/** @deprecated */
export function isGoalEvent(type: string): boolean {
  return type.toLowerCase() === "goal";
}

/** @deprecated Utiliser `isOwnGoal` sur `MatchEvent` ou `isOwnGoalDetail` */
export function isOwnGoal(detail: string): boolean {
  return isOwnGoalDetail(detail);
}

/** @deprecated */
export function isYellowCard(detail: string): boolean {
  return isYellowDetail(detail);
}

/** @deprecated */
export function isRedCard(detail: string): boolean {
  return isRedDetail(detail);
}
