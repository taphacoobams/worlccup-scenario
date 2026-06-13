/** Couleurs maillots (anglais FIFA) → libellés français */
const COLOR_FR: Record<string, string> = {
  white: "Blanc",
  green: "Vert",
  black: "Noir",
  blue: "Bleu",
  "light blue": "Bleu clair",
  yellow: "Jaune",
  gold: "Or",
  red: "Rouge",
  orange: "Orange",
  purple: "Violet",
  magenta: "Magenta",
  maroon: "Bordeaux",
  brown: "Marron",
  grey: "Gris",
  gray: "Gris",
  "light grey": "Gris clair",
  "dark grey": "Gris foncé",
  navy: "Bleu marine",
  bronze: "Bronze",
  silver: "Argent",
  turquoise: "Turquoise",
  "olive green": "Vert olive",
  "neon green": "Vert fluo",
};

/** Pastel badge par couleur dominante */
const BADGE_CLASS: Record<string, string> = {
  white: "bg-white/15 text-white border-white/25",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  black: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "light blue": "bg-sky-500/15 text-sky-400 border-sky-500/30",
  yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  gold: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  magenta: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
  maroon: "bg-rose-900/20 text-rose-400 border-rose-800/30",
  brown: "bg-amber-900/20 text-amber-600 border-amber-800/30",
  grey: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  gray: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  "light grey": "bg-slate-400/10 text-slate-300 border-slate-400/25",
  "dark grey": "bg-slate-600/15 text-slate-400 border-slate-600/30",
  navy: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  bronze: "bg-orange-700/15 text-orange-300 border-orange-700/30",
  silver: "bg-slate-300/10 text-slate-300 border-slate-400/25",
  turquoise: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  "olive green": "bg-lime-700/15 text-lime-500 border-lime-700/30",
  "neon green": "bg-lime-400/15 text-lime-300 border-lime-400/30",
};

export function kitColorToFrench(color: string): string {
  const key = color.trim().toLowerCase();
  return COLOR_FR[key] ?? color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
}

export function kitColorBadgeClass(color: string): string {
  const key = color.trim().toLowerCase();
  return BADGE_CLASS[key] ?? "bg-white/8 text-text-secondary border-border";
}
