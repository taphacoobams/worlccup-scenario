import type { KnockoutRound } from "@/types/worldcup";
import { FixtureCard } from "@/components/worldcup/FixtureCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  rounds: KnockoutRound[];
};

export function KnockoutBracket({ rounds }: Props) {
  if (rounds.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Aucun match de phase finale disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {rounds.map((round) => (
        <Card key={round.id}>
          <CardHeader>
            <CardTitle>{round.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {round.fixtures.map((f) => (
                <FixtureCard key={f.id} fixture={f} compact allFixtures={round.fixtures} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
