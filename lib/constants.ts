import type { Group, WinnerSlot } from "@/types";

export const ALL_GROUPS: Group[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
];

export const WINNER_SLOTS: WinnerSlot[] = [
  "1A", "1B", "1D", "1E", "1G", "1I", "1K", "1L",
];

export const SENEGAL_GROUP: Group = "I";

export const TOTAL_SCENARIOS = 495;
/** Scénarios où un groupe donné figure parmi les 8 meilleurs 3es — C(11,7) */
export const SCENARIOS_WITH_GROUP = 330;
export const SCENARIOS_WITHOUT_GROUP = 165;
export const SENEGAL_SCENARIOS = SCENARIOS_WITH_GROUP;
export const NON_SENEGAL_SCENARIOS = SCENARIOS_WITHOUT_GROUP;

export const COMBINATION_FORMULA = "C(12,8) = 495";

/** Routes nav — libellés via messages/{locale}.json */
export const NAV_ROUTES = [
  { href: "/", key: "home", icon: "Home" },
  { href: "/groups", key: "groups", icon: "Users" },
  { href: "/fixtures", key: "fixtures", icon: "Calendar" },
  { href: "/teams", key: "teams", icon: "Shield" },
  { href: "/scenarios", key: "scenarios", icon: "Flag" },
  { href: "/explorer", key: "explorer", icon: "Table" },
  { href: "/analytique", key: "analytique", icon: "BarChart3" },
  { href: "/statistics", key: "statistics", icon: "BarChart2" },
  { href: "/monte-carlo", key: "monteCarlo", icon: "Dices" },
  { href: "/export", key: "export", icon: "Download" },
  { href: "/login", key: "manager", icon: "Settings" },
] as const;

/** @deprecated Utiliser NAV_ROUTES + i18n */
export const NAV_ITEMS = NAV_ROUTES.map((r) => ({
  href: r.href,
  label: r.key,
  icon: r.icon,
}));

export const GROUP_COLORS: Record<Group, string> = {
  A: "#00853f",
  B: "#e31b23",
  C: "#0066b3",
  D: "#ffcd00",
  E: "#6b2d5c",
  F: "#00a651",
  G: "#c8102e",
  H: "#002654",
  I: "#00853f",
  J: "#ff6600",
  K: "#003087",
  L: "#d4af37",
};
