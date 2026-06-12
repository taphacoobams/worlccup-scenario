/**
 * Parse matchs.txt → fixtures-schedule.json, teams/groups/fixtures.json
 * Phase de groupes + phase finale (Match 73–104, créneaux 1A / V73 / P101…)
 *
 * Usage: node scripts/parse-matchs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildGroupsFromTeams,
  loadTeamsFromFile,
  nameToTeamId,
} from "./lib/teams-from-matchs.mjs";
import { buildTableauFinal } from "./lib/knockout-tableau.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const MONTHS = {
  janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, août: 8, aout: 8, septembre: 9, octobre: 10, novembre: 11,
  décembre: 12, decembre: 12,
};

const KNOCKOUT_ROUND_HEADERS = [
  [/^Seizièmes de finale/i, "Seizièmes de finale"],
  [/^Huitièmes de finale/i, "Huitièmes de finale"],
  [/^Quarts de finale/i, "Quarts de finale"],
  [/^Demi-finales/i, "Demi-finales"],
  [/^Match pour la troisième place/i, "Match pour la troisième place"],
  [/^Finale$/i, "Finale"],
];

function splitMatchsFile(text) {
  const marker = "Seizièmes de finale";
  const idx = text.indexOf(marker);
  if (idx < 0) return { group: text, knockout: "" };
  return { group: text.slice(0, idx), knockout: text.slice(idx) };
}

function bracketMatchId(matchNumber) {
  if (matchNumber >= 73 && matchNumber <= 102) return `V${matchNumber}`;
  return String(matchNumber);
}

function parseCity(venueStr) {
  const parts = venueStr.split(",").map((s) => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : parts[0];
}

function parseVenueName(venueStr) {
  return venueStr.split(",")[0].trim();
}

function parseOffset(tzLine) {
  const m = tzLine.match(/UTC\s*([−\-+])\s*(\d+)/i);
  if (!m) return 0;
  return (m[1] === "+" ? 1 : -1) * parseInt(m[2], 10);
}

function parseFrenchDate(line) {
  const m = line.match(/(\d{1,2})(?:er)?\s+([a-zéûôîàèù]+)\s+(\d{4})/i);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  return { day: parseInt(m[1], 10), month, year: parseInt(m[3], 10) };
}

function parseTime(line) {
  const m = line.match(/(\d{1,2})h(\d{2})/i);
  if (!m) return { hour: 18, minute: 0 };
  return { hour: parseInt(m[1], 10), minute: parseInt(m[2], 10) };
}

function toDateGmt(day, month, year, hour, minute, offsetHours) {
  const utcH = hour - offsetHours;
  return new Date(Date.UTC(year, month - 1, day, utcH, minute, 0)).toISOString();
}

/** Créneaux knockout (2A, 3A/B/C/D/F, V73) — sans espaces */
function normalizeSlot(name) {
  return name.replace(/\s+/g, "").trim();
}

function normalizeTeamName(name) {
  return name.replace(/\s+/g, " ").trim();
}

function parseMatchesBlock(text, options) {
  const { phase, defaultRound } = options;
  const lines = text.split(/\r?\n/);
  const matches = [];
  let currentGroup = null;
  let currentRound = defaultRound ?? null;
  let pending = null;

  const flush = () => {
    if (!pending?.home || !pending?.away || !pending?.venue) return;
    if (!pending.date || pending.offset === undefined) return;
    matches.push({
      phase,
      group: currentGroup,
      round: currentRound,
      matchNumber: pending.matchNumber,
      matchId: pending.matchId,
      homeTeam: pending.home,
      awayTeam: pending.away,
      dateGmt: toDateGmt(
        pending.date.day,
        pending.date.month,
        pending.date.year,
        pending.time.hour,
        pending.time.minute,
        pending.offset
      ),
      city: parseCity(pending.venue),
      venue: parseVenueName(pending.venue),
    });
    pending = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (
      !line ||
      line.startsWith("Arbitrage") ||
      line.startsWith("Article") ||
      line.startsWith("Rang\t")
    ) {
      continue;
    }

    if (phase === "group") {
      const g = line.match(/^Groupe\s+([A-L])/i);
      if (g) {
        flush();
        currentGroup = g[1].toUpperCase();
        continue;
      }
      if (/journée/i.test(line)) {
        flush();
        currentRound = line.replace(/\s+/g, " ").trim();
        continue;
      }
      if (line === "Classement") {
        flush();
        currentRound = null;
        continue;
      }
    } else {
      for (const [re, label] of KNOCKOUT_ROUND_HEADERS) {
        if (re.test(line)) {
          flush();
          currentRound = label;
          break;
        }
      }
    }

    if (line.startsWith("Match")) {
      const parts = line.split("\t").map((s) => s.trim()).filter(Boolean);
      const dashIdx = parts.findIndex((p) => p === "-");
      if (dashIdx >= 2 && parts.length >= dashIdx + 2) {
        flush();
        const header = parts[0];
        const numM = header.match(/Match\s+(\d+)/i);
        const matchNumber = numM ? parseInt(numM[1], 10) : null;
        const rawHome = parts.slice(1, dashIdx).join(" ").trim();
        const rawAway = parts.slice(dashIdx + 1, -1).join(" ").trim();
        const home =
          phase === "knockout" ? normalizeSlot(rawHome) : normalizeTeamName(rawHome);
        const away =
          phase === "knockout" ? normalizeSlot(rawAway) : normalizeTeamName(rawAway);
        pending = {
          matchNumber,
          matchId:
            phase === "knockout" && matchNumber
              ? bracketMatchId(matchNumber)
              : numM
                ? `M${numM[1]}`
                : "M-open",
          home,
          away,
          venue: parts[parts.length - 1],
        };
        continue;
      }
    }

    if (pending) {
      const d = parseFrenchDate(line);
      if (d) {
        pending.date = d;
        continue;
      }
      if (/UTC/i.test(line)) {
        pending.offset = parseOffset(line);
        pending.time = parseTime(line);
        flush();
      }
    }
  }
  flush();
  return matches;
}

function sortByDate(matches) {
  return [...matches].sort(
    (a, b) => new Date(a.dateGmt).getTime() - new Date(b.dateGmt).getTime()
  );
}

function toScheduleMatch(m) {
  return {
    phase: m.phase,
    matchNumber: m.matchNumber,
    matchId: m.matchId,
    ...(m.group ? { group: m.group } : {}),
    ...(m.round ? { round: m.round } : {}),
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    dateGmt: m.dateGmt,
    city: m.city,
    ...(m.venue ? { venue: m.venue } : {}),
  };
}

function toWorldCupFixtures(schedule, teams) {
  const fixtures = schedule.map((m) => {
    const homeId = nameToTeamId(teams, m.homeTeam) ?? 0;
    const awayId = nameToTeamId(teams, m.awayTeam) ?? 0;
    const id =
      m.matchNumber ??
      (m.matchId?.startsWith("M")
        ? parseInt(m.matchId.slice(1), 10)
        : parseInt(String(m.matchId).replace(/\D/g, ""), 10) || null);

    return {
      id,
      date: m.dateGmt,
      timezone: "UTC",
      venue: { name: m.venue ?? "", city: m.city },
      round:
        m.round ??
        (m.phase === "group" ? "Phase de groupes" : "Phase à élimination directe"),
      group: m.group ?? null,
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      goals: { home: null, away: null },
      status: "NS",
    };
  });

  return fixtures;
}

// --- run ---
const teams = loadTeamsFromFile(root);
const groups = buildGroupsFromTeams(teams);

const matchsTxt = fs.readFileSync(path.join(root, "data", "matchs.txt"), "utf-8");
const { group: groupTxt, knockout: knockoutTxt } = splitMatchsFile(matchsTxt);

const groupMatches = parseMatchesBlock(groupTxt, { phase: "group" });
const knockoutMatches = knockoutTxt
  ? parseMatchesBlock(knockoutTxt, { phase: "knockout" })
  : [];

const allSchedule = sortByDate([...groupMatches, ...knockoutMatches]);

const scheduleOut = {
  updatedAt: new Date().toISOString(),
  total: allSchedule.length,
  groupStage: groupMatches.length,
  knockout: knockoutMatches.length,
  matches: allSchedule.map(toScheduleMatch),
};

fs.writeFileSync(
  path.join(root, "data", "fixtures-schedule.json"),
  JSON.stringify(scheduleOut, null, 2),
  "utf-8"
);

const wcFixtures = toWorldCupFixtures(allSchedule, teams);

const teamsOut = teams.map((t) => ({
  id: t.id,
  name: t.name,
  code: t.code,
  country: t.country ?? t.name,
  group: t.group ?? null,
}));

const groupsOut = groups.map((g) => ({
  letter: g.letter,
  standings: g.standings.map((s) => {
    const team = teamsOut.find((x) => x.id === s.teamId);
    return {
      teamId: s.teamId,
      teamName: team?.name ?? "",
      position: s.position,
      played: s.played,
      won: s.won,
      draw: s.draw,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalDifference,
      points: s.points,
    };
  }),
}));

function buildBestThirdsFromGroups(groupList) {
  const entries = groupList.map((g) => {
    const letter = g.letter.toUpperCase();
    const row = g.standings.find((s) => s.position === 3) ?? g.standings[2];
    return {
      group: letter,
      key: `3${letter}`,
      teamId: row.teamId,
      teamName: row.teamName,
      played: row.played,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
    };
  });
  entries.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.group.localeCompare(b.group);
  });
  return entries.map((e, i) => ({
    ...e,
    rank: i + 1,
    inQualifyingZone: i < 8,
  }));
}

const groupsFileOut = {
  groups: groupsOut,
  bestThirds: buildBestThirdsFromGroups(groupsOut),
};

const fixturesOut = wcFixtures.map((f) => {
  const home = teamsOut.find((t) => t.id === f.homeTeamId);
  const away = teamsOut.find((t) => t.id === f.awayTeamId);
  return {
    id: f.id,
    date: f.date,
    timezone: f.timezone ?? "UTC",
    venue: f.venue,
    round: f.round,
    group: f.group,
    homeTeamId: f.homeTeamId,
    awayTeamId: f.awayTeamId,
    homeTeamName: home?.name ?? f.homeTeam ?? "",
    awayTeamName: away?.name ?? f.awayTeam ?? "",
    goals: f.goals,
    status: f.status,
  };
});

fs.writeFileSync(
  path.join(root, "data", "teams.json"),
  JSON.stringify(teamsOut, null, 2),
  "utf-8"
);
fs.writeFileSync(
  path.join(root, "data", "groups.json"),
  JSON.stringify(groupsFileOut, null, 2),
  "utf-8"
);
fs.writeFileSync(
  path.join(root, "data", "fixtures.json"),
  JSON.stringify(fixturesOut, null, 2),
  "utf-8"
);

fs.writeFileSync(
  path.join(root, "data", "tableau-final.json"),
  JSON.stringify(buildTableauFinal(knockoutMatches), null, 2),
  "utf-8"
);

const groupOk = fixturesOut.filter((f) => f.homeTeamId && f.awayTeamId).length;
const tbd = allSchedule.filter(
  (m) => /tbd|slot/i.test(m.homeTeam) || /tbd|slot/i.test(m.awayTeam)
).length;

console.log(`Équipes : ${teams.length} (id 1–48)`);
console.log(
  `fixtures-schedule.json : ${allSchedule.length} matchs (${groupMatches.length} groupes + ${knockoutMatches.length} phase finale), tri par date`
);
console.log(
  `fixtures.json : ${fixturesOut.length} matchs (${groupOk} avec 2 équipes nationales, ${tbd} TBD/Slot restants)`
);
const tableau = buildTableauFinal(knockoutMatches);
console.log(
  `tableau-final.json : ${knockoutMatches.length} matchs, ${tableau.rounds.length} niveaux`
);
