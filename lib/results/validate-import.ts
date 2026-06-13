import type { MatchResult, MatchResultStatus, ResultEvent, ResultEventType } from "@/types/results";

export type ImportResultEventInput = {
  type?: unknown;
  team?: unknown;
  player?: unknown;
  minute?: unknown;
  addedTime?: unknown;
  additionalTime?: unknown;
  assist?: unknown;
  isOwnGoal?: unknown;
};

export type ImportMatchInput = {
  matchId?: unknown;
  status?: unknown;
  events?: unknown;
};

export type ImportResultsPayload = {
  matches?: unknown;
};

export type ImportValidationError = {
  path: string;
  message: string;
};

const EVENT_TYPES = new Set<ResultEventType>(["goal", "yellow_card", "red_card"]);
const STATUS_VALUES = new Set<MatchResultStatus>([
  "NS",
  "HT",
  "FT",
  "LIVE",
  "AET",
  "PEN",
  "PST",
  "CANC",
]);

const TYPE_ALIASES: Record<string, ResultEventType> = {
  goal: "goal",
  but: "goal",
  yellow_card: "yellow_card",
  yellow: "yellow_card",
  carton_jaune: "yellow_card",
  red_card: "red_card",
  red: "red_card",
  carton_rouge: "red_card",
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseMinute(value: unknown, path: string, errors: ImportValidationError[]): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push({ path, message: "La minute doit être un nombre." });
    return null;
  }
  if (value < 0 || value > 130) {
    errors.push({ path, message: "La minute doit être entre 0 et 130." });
    return null;
  }
  return Math.trunc(value);
}

function parseAddedTime(value: unknown, path: string, errors: ImportValidationError[]): number | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    errors.push({ path, message: "Le temps additionnel doit être un nombre." });
    return undefined;
  }
  if (value < 0 || value > 30) {
    errors.push({ path, message: "Le temps additionnel doit être entre 0 et 30." });
    return undefined;
  }
  return Math.trunc(value);
}

function parseEventType(value: unknown, path: string, errors: ImportValidationError[]): ResultEventType | null {
  if (typeof value !== "string" || !value.trim()) {
    errors.push({ path, message: "Le type d'événement est requis (goal, yellow_card, red_card)." });
    return null;
  }
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");
  const mapped = TYPE_ALIASES[normalized];
  if (!mapped || !EVENT_TYPES.has(mapped)) {
    errors.push({
      path,
      message: `Type invalide « ${value} » — attendu : goal, yellow_card ou red_card.`,
    });
    return null;
  }
  return mapped;
}

function parseStatus(value: unknown, hasEvents: boolean): MatchResultStatus {
  if (typeof value !== "string" || !value.trim()) {
    return hasEvents ? "FT" : "NS";
  }
  const upper = value.trim().toUpperCase() as MatchResultStatus;
  return STATUS_VALUES.has(upper) ? upper : hasEvents ? "FT" : "NS";
}

function normalizeEvent(raw: ImportResultEventInput, path: string, errors: ImportValidationError[]): ResultEvent | null {
  const type = parseEventType(raw.type, `${path}.type`, errors);
  const minute = parseMinute(raw.minute, `${path}.minute`, errors);

  const team = typeof raw.team === "string" ? raw.team.trim() : "";
  if (!team) {
    errors.push({ path: `${path}.team`, message: "L'équipe est requise." });
  }

  const player = typeof raw.player === "string" ? raw.player.trim() : "";
  if (!player) {
    errors.push({ path: `${path}.player`, message: "Le joueur est requis." });
  }

  const addedTime = parseAddedTime(
    raw.addedTime ?? raw.additionalTime,
    `${path}.addedTime`,
    errors
  );

  const assist =
    typeof raw.assist === "string" && raw.assist.trim() ? raw.assist.trim() : undefined;

  if (!type || minute == null || !team || !player) return null;

  return {
    type,
    team,
    player,
    minute,
    addedTime,
    assist: type === "goal" ? assist : undefined,
    isOwnGoal: type === "goal" && raw.isOwnGoal === true ? true : undefined,
  };
}

function sortEvents(events: ResultEvent[]): ResultEvent[] {
  return [...events].sort((a, b) => {
    const ma = a.minute + (a.addedTime ?? 0) * 0.01;
    const mb = b.minute + (b.addedTime ?? 0) * 0.01;
    return ma - mb;
  });
}

export function validateImportResultsPayload(
  input: unknown
): {
  valid: boolean;
  errors: ImportValidationError[];
  matches: MatchResult[];
} {
  const errors: ImportValidationError[] = [];
  const matches: MatchResult[] = [];

  if (!isRecord(input)) {
    return {
      valid: false,
      errors: [{ path: "", message: "Le fichier doit être un objet JSON." }],
      matches: [],
    };
  }

  if (!Array.isArray(input.matches)) {
    return {
      valid: false,
      errors: [{ path: "matches", message: "Le champ « matches » doit être un tableau." }],
      matches: [],
    };
  }

  if (input.matches.length === 0) {
    return {
      valid: false,
      errors: [{ path: "matches", message: "Le tableau « matches » ne peut pas être vide." }],
      matches: [],
    };
  }

  const seenIds = new Set<number>();

  input.matches.forEach((raw, index) => {
    const base = `matches[${index}]`;
    if (!isRecord(raw)) {
      errors.push({ path: base, message: "Chaque match doit être un objet." });
      return;
    }

    const match = raw as ImportMatchInput;
    if (typeof match.matchId !== "number" || !Number.isFinite(match.matchId)) {
      errors.push({ path: `${base}.matchId`, message: "matchId doit être un nombre." });
      return;
    }
    const matchId = Math.trunc(match.matchId);
    if (matchId <= 0) {
      errors.push({ path: `${base}.matchId`, message: "matchId doit être positif." });
      return;
    }
    if (seenIds.has(matchId)) {
      errors.push({ path: `${base}.matchId`, message: `matchId ${matchId} en double dans le fichier.` });
      return;
    }
    seenIds.add(matchId);

    if (!Array.isArray(match.events)) {
      errors.push({ path: `${base}.events`, message: "events doit être un tableau." });
      return;
    }

    const events: ResultEvent[] = [];
    match.events.forEach((ev, evIndex) => {
      if (!isRecord(ev)) {
        errors.push({ path: `${base}.events[${evIndex}]`, message: "Chaque événement doit être un objet." });
        return;
      }
      const parsed = normalizeEvent(ev as ImportResultEventInput, `${base}.events[${evIndex}]`, errors);
      if (parsed) events.push(parsed);
    });

    const status = parseStatus(match.status, events.length > 0);
    matches.push({
      matchId,
      status,
      events: sortEvents(events),
      updatedAt: new Date().toISOString(),
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    matches: errors.length === 0 ? matches.sort((a, b) => a.matchId - b.matchId) : [],
  };
}
