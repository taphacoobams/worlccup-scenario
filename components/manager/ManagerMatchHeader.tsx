import { TeamFlag } from "@/components/ui/team-flag";
import { cn } from "@/lib/utils";
import type { ManualFixture } from "@/types/worldcup-manual";
import type { ManualTeam } from "@/types/worldcup-manual";

type Props = {
  fixture: ManualFixture;
  homeTeam: ManualTeam | null;
  awayTeam: ManualTeam | null;
  score: { home: number; away: number };
  hasScore: boolean;
};

export function ManagerMatchHeader({ fixture, homeTeam, awayTeam, score, hasScore }: Props) {
  const matchNumber = fixture.matchNumber ?? fixture.id;
  const roundLabel = getRoundLabel(fixture.round, fixture.matchday);
  const statusLabel = getStatusLabel(fixture.status);
  const statusColor = getStatusColor(fixture.status);

  if (!homeTeam || !awayTeam) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Chargement des équipes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Groupe et Journée */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        {fixture.group && (
          <>
            <span className="font-semibold text-senegal-green">Groupe {fixture.group}</span>
            <span>•</span>
          </>
        )}
        <span>{roundLabel}</span>
      </div>

      {/* Numéro du match */}
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">
        Match {matchNumber}
      </div>

      {/* Score avec drapeaux */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {/* Home: Nom + Drapeau */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg sm:text-xl font-semibold truncate">{homeTeam.name}</span>
          <TeamFlag
            code={homeTeam.code}
            teamName={homeTeam.name}
            size="md"
            className="h-10 w-14 rounded-lg shrink-0"
          />
        </div>

        {/* Score */}
        <div className="shrink-0 px-2">
          {hasScore ? (
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums tracking-tight">
              {score.home}
              <span className="text-muted-foreground mx-2 font-light">–</span>
              {score.away}
            </p>
          ) : (
            <p className="text-2xl text-muted-foreground font-light">vs</p>
          )}
        </div>

        {/* Away: Drapeau + Nom */}
        <div className="flex items-center gap-3 min-w-0">
          <TeamFlag
            code={awayTeam.code}
            teamName={awayTeam.name}
            size="md"
            className="h-10 w-14 rounded-lg shrink-0"
          />
          <span className="text-lg sm:text-xl font-semibold truncate">{awayTeam.name}</span>
        </div>
      </div>

      {/* Statut */}
      <div className="flex justify-center">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            statusColor
          )}
        >
          {statusLabel}
        </span>
      </div>

      {/* Date, Heure, Stade, Ville */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{formatDate(fixture.date)}</span>
        <span>•</span>
        <span>{formatTime(fixture.date)}</span>
        <span>•</span>
        <span className="font-medium">{fixture.venue.name}</span>
        <span>•</span>
        <span>{fixture.venue.city}</span>
      </div>
    </div>
  );
}

function getRoundLabel(round: string, matchday?: number): string {
  const roundLower = round.toLowerCase();
  
  if (roundLower.includes("group") || roundLower.includes("groupe")) {
    if (matchday === 1) return "1ère Journée";
    if (matchday === 2) return "2ème Journée";
    if (matchday === 3) return "3ème Journée";
    return "Phase de groupes";
  }
  
  if (roundLower.includes("round of 16") || roundLower.includes("huitièmes")) {
    return "Huitièmes de finale";
  }
  if (roundLower.includes("quarter") || roundLower.includes("quarts")) {
    return "Quarts de finale";
  }
  if (roundLower.includes("semi") || roundLower.includes("demi")) {
    return "Demi-finales";
  }
  if (roundLower.includes("third") || roundLower.includes("3e") || roundLower.includes("3ème")) {
    return "Match pour la 3e place";
  }
  if (roundLower.includes("final")) {
    return "Finale";
  }
  
  return round;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NS: "À venir",
    FT: "Terminé",
    HT: "Mi-temps",
    PST: "Reporté",
    CANC: "Annulé",
    AET: "Prolongations",
    PEN: "Tirs au but",
  };
  return labels[status] ?? status;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "FT":
      return "bg-green-500/15 text-green-500";
    case "HT":
    case "AET":
    case "PEN":
      return "bg-orange-500/15 text-orange-500";
    case "NS":
    default:
      return "bg-white/5 text-muted-foreground";
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
