import { TeamFlag } from "@/components/ui/team-flag";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { teamSlug } from "@/lib/team-slug";
import type { Fixture } from "@/types/worldcup";
import { fixtureStatus, shouldShowScore, FIXTURE_STATUS_LABELS } from "@/types/worldcup";

type Props = {
  fixture: Fixture;
  showVenue?: boolean;
};

export function MatchHeader({ fixture, showVenue = true }: Props) {
  const router = useRouter();
  const hasScore = shouldShowScore(fixture);
  const status = fixtureStatus(fixture);
  const matchNumber = fixture.matchNumber ?? fixture.id;
  const roundLabel = getRoundLabel(fixture.round, fixture.matchday);

  const statusColor = getStatusColor(status);

  const handleTeamClick = (e: React.MouseEvent, teamName: string, teamCode: string) => {
    e.preventDefault();
    e.stopPropagation();
    const slug = teamSlug(teamName, teamCode);
    router.push(`/equipes/${slug}`);
  };

  return (
    <div className="space-y-4">
      {/* Groupe et Journée */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {fixture.group && (
          <>
            <span className="font-semibold text-primary">Groupe {fixture.group}</span>
            <span>•</span>
          </>
        )}
        <span>{roundLabel}</span>
      </div>

      {/* Numéro du match */}
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Match {matchNumber}
      </div>

      {/* Score avec drapeaux */}
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {/* Home: Nom + Drapeau */}
        <button
          type="button"
          onClick={(e) => handleTeamClick(e, fixture.teams.home.name, fixture.teams.home.code)}
          className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity bg-transparent border-0 p-0 cursor-pointer"
        >
          <span className="text-lg sm:text-xl font-semibold truncate">{fixture.teams.home.name}</span>
          <TeamFlag
            code={fixture.teams.home.code}
            teamName={fixture.teams.home.name}
            size="md"
            className="h-10 w-14 rounded-lg shrink-0"
          />
        </button>

        {/* Score */}
        <div className="shrink-0 px-2">
          {hasScore ? (
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tabular-nums tracking-tight">
              {fixture.goals.home}
              <span className="text-muted-foreground mx-2 font-light">–</span>
              {fixture.goals.away}
            </p>
          ) : (
            <p className="text-2xl text-muted-foreground font-light">vs</p>
          )}
        </div>

        {/* Away: Drapeau + Nom */}
        <button
          type="button"
          onClick={(e) => handleTeamClick(e, fixture.teams.away.name, fixture.teams.away.code)}
          className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity bg-transparent border-0 p-0 cursor-pointer"
        >
          <TeamFlag
            code={fixture.teams.away.code}
            teamName={fixture.teams.away.name}
            size="md"
            className="h-10 w-14 rounded-lg shrink-0"
          />
          <span className="text-lg sm:text-xl font-semibold truncate">{fixture.teams.away.name}</span>
        </button>
      </div>

      {/* Statut */}
      <div className="flex justify-center">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
            statusColor
          )}
        >
          {FIXTURE_STATUS_LABELS[status] ?? fixture.status.long}
        </span>
      </div>

      {/* Date, Heure, Stade, Ville */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>{formatDate(fixture.date)}</span>
        <span>•</span>
        <span>{formatTime(fixture.date)}</span>
        {showVenue && (
          <>
            <span>•</span>
            <span className="font-medium">{fixture.venue.name}</span>
            <span>•</span>
            <span>{fixture.venue.city}</span>
          </>
        )}
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
  if (roundLower.includes("third place") || roundLower.includes("third_place")) {
    return "Match pour la 3e place";
  }
  if (roundLower.includes("final")) {
    return "Finale";
  }

  return round;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "FT":
      return "bg-green-500/15 text-green-500";
    case "IN_PROGRESS":
    case "HT":
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
