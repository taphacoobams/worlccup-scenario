/**
 * Construit data/tableau-final.json depuis les matchs knockout parsés.
 */

const ROUND_DEFS = [
  { key: "round_of_32", label: "Seizièmes de finale", pattern: /seizièmes/i },
  { key: "round_of_16", label: "Huitièmes de finale", pattern: /huitièmes/i },
  { key: "quarter_finals", label: "Quarts de finale", pattern: /quarts/i },
  { key: "semi_finals", label: "Demi-finales", pattern: /demi/i },
  {
    key: "third_place",
    label: "Match pour la troisième place",
    pattern: /troisième place/i,
  },
  { key: "final", label: "Finale", pattern: /^finale$/i },
];

const MONTHS_FR = [
  "",
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

function formatFrenchDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const day = d.getUTCDate();
  const month = MONTHS_FR[d.getUTCMonth() + 1];
  const year = d.getUTCFullYear();
  const suffix = day === 1 ? "er" : "";
  return `${day}${suffix} ${month} ${year}`;
}

function toTableauMatch(m) {
  const venueFull = m.venue ? `${m.venue}, ${m.city}` : m.city;
  return {
    matchNumber: m.matchNumber,
    id: m.matchId,
    home: m.homeTeam,
    away: m.awayTeam,
    teams: [m.homeTeam, m.awayTeam],
    dateGmt: m.dateGmt,
    date: formatFrenchDate(m.dateGmt),
    venue: venueFull,
    city: m.city,
  };
}

export function buildTableauFinal(knockoutMatches) {
  const sorted = [...knockoutMatches].sort(
    (a, b) => new Date(a.dateGmt).getTime() - new Date(b.dateGmt).getTime()
  );

  const rounds = ROUND_DEFS.map(({ key, label, pattern }) => ({
    key,
    label,
    matches: sorted
      .filter((m) => pattern.test(m.round ?? ""))
      .map(toTableauMatch),
  }));

  const round_of_32 = rounds.find((r) => r.key === "round_of_32")?.matches ?? [];

  return {
    title: "Tableau final — Coupe du Monde FIFA 2026",
    updatedAt: new Date().toISOString(),
    rounds,
    /** @deprecated compat — seizièmes de finale uniquement */
    round_of_32: round_of_32.map(({ id, teams, date, venue }) => ({
      id,
      teams,
      date,
      venue,
    })),
  };
}
