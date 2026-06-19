import type { LocalTeam, LocalFixture } from "@/types/data";
import { GlassPanel } from "@/components/ui/glass-panel";
import { TeamFlag } from "@/components/ui/team-flag";

type Props = {
  team: LocalTeam;
  fixtures: LocalFixture[];
};

export function RecentMatches({ team, fixtures }: Props) {
  const teamFixtures = fixtures
    .filter(f => f.homeTeamId === team.id || f.awayTeamId === team.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  if (teamFixtures.length === 0) {
    return null;
  }

  const getMatchResult = (fixture: LocalFixture) => {
    if (fixture.goals.home === null || fixture.goals.away === null) return null;
    
    const isHome = fixture.homeTeamId === team.id;
    const teamScore = isHome ? fixture.goals.home : fixture.goals.away;
    const opponentScore = isHome ? fixture.goals.away : fixture.goals.home;
    
    if (teamScore > opponentScore) return 'win';
    if (teamScore < opponentScore) return 'loss';
    return 'draw';
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case 'win': return 'bg-green-500/20 border-green-500/30 text-green-400';
      case 'draw': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400';
      case 'loss': return 'bg-red-500/20 border-red-500/30 text-red-400';
      default: return 'bg-white/5 border-white/10 text-muted-foreground';
    }
  };

  const getResultLabel = (result: string | null) => {
    switch (result) {
      case 'win': return 'Victoire';
      case 'draw': return 'Nul';
      case 'loss': return 'Défaite';
      default: return 'À venir';
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">DERNIERS MATCHS - COUPE DU MONDE 2026</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teamFixtures.map((fixture) => {
          const result = getMatchResult(fixture);
          const isHome = fixture.homeTeamId === team.id;
          const opponentName = isHome ? fixture.awayTeamName : fixture.homeTeamName;
          const teamScore = isHome ? fixture.goals.home : fixture.goals.away;
          const opponentScore = isHome ? fixture.goals.away : fixture.goals.home;
          
          return (
            <GlassPanel key={fixture.id} className={`p-4 border ${getResultColor(result)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">
                    {teamScore ?? '-'}-{opponentScore ?? '-'}
                  </span>
                </div>
                <TeamFlag
                  code={team.code}
                  teamName={team.name}
                  size="sm"
                  className="h-6 w-8 rounded"
                />
              </div>
              <p className="text-sm font-medium mb-1">{getResultLabel(result)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(fixture.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">vs {opponentName}</p>
            </GlassPanel>
          );
        })}
      </div>
    </section>
  );
}
