import type { LocalTeam, LocalFixture } from "@/types/data";
import { GlassPanel } from "@/components/ui/glass-panel";

type Props = {
  team: LocalTeam;
  fixtures: LocalFixture[];
};

export function QuickStats({ team, fixtures }: Props) {
  const teamFixtures = fixtures.filter(
    f => f.homeTeamId === team.id || f.awayTeamId === team.id
  );

  let played = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  teamFixtures.forEach(fixture => {
    if (fixture.goals.home === null || fixture.goals.away === null) return;
    
    const isHome = fixture.homeTeamId === team.id;
    const teamScore = isHome ? fixture.goals.home : fixture.goals.away;
    const opponentScore = isHome ? fixture.goals.away : fixture.goals.home;
    
    played++;
    goalsFor += teamScore;
    goalsAgainst += opponentScore;
    
    if (teamScore > opponentScore) wins++;
    else if (teamScore < opponentScore) losses++;
    else draws++;
  });

  const stats = [
    { label: 'Matchs joués', value: played },
    { label: 'Buts marqués', value: goalsFor },
    { label: 'Buts encaissés', value: goalsAgainst },
    { label: 'Victoires', value: wins },
    { label: 'Nuls', value: draws },
    { label: 'Défaites', value: losses },
  ];

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">Statistiques rapides</h2>
      <GlassPanel className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-gold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </GlassPanel>
    </section>
  );
}
