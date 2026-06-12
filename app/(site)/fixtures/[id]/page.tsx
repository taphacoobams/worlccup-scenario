import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MatchKitsShowcase } from "@/components/fixtures/MatchKitsShowcase";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { VenueCard } from "@/components/worldcup/VenueCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFixturePlayerKits } from "@/lib/match-kits";
import { getFixtureById, getHeadToHead } from "@/lib/worldcup-data";
import {
  FIXTURE_STATUS_LABELS,
  fixtureStatus,
  isMatchFinished,
  shouldShowScore,
} from "@/types/worldcup";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const fixture = await getFixtureById(Number(id));
  if (!fixture) return { title: `Match #${id}` };
  return {
    title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
    description: `${fixture.venue.name} — ${fixture.venue.city}`,
  };
}

export const revalidate = 3600;

export default async function FixtureDetailPage({ params }: Props) {
  const { id } = await params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId)) notFound();

  const fixture = await getFixtureById(fixtureId);
  if (!fixture) notFound();

  const kits = getFixturePlayerKits(fixture.teams.home.code, fixture.teams.away.code);
  const h2h = await getHeadToHead(fixture.teams.home.id, fixture.teams.away.id);

  const hasScore = shouldShowScore(fixture);
  const status = fixtureStatus(fixture);
  const finished = isMatchFinished(fixture);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/fixtures">
          <ArrowLeft className="h-4 w-4" /> Retour au calendrier
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader>
          {fixture.group && (
            <span className="text-sm font-bold text-gold">Groupe {fixture.group}</span>
          )}
          {fixture.round && (
            <span className="text-xs text-muted-foreground block mt-1">{fixture.round}</span>
          )}
          <CardTitle className="text-2xl mt-2">Détail du match</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 py-8">
            <TeamBadge team={fixture.teams.home} size="lg" />
            <div className="text-center">
              {hasScore ? (
                <span className="text-4xl font-bold tabular-nums">
                  {fixture.goals.home} – {fixture.goals.away}
                </span>
              ) : (
                <span className="text-2xl text-muted-foreground">vs</span>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {FIXTURE_STATUS_LABELS[status] ?? fixture.status.long}
              </p>
            </div>
            <TeamBadge team={fixture.teams.away} size="lg" />
          </div>
          {kits && (
            <MatchKitsShowcase
              homeName={fixture.teams.home.name}
              awayName={fixture.teams.away.name}
              homeKit={kits.home}
              awayKit={kits.away}
            />
          )}
        </CardContent>
      </Card>

      <VenueCard fixture={fixture} />

      {fixture.group && (
        <p className="text-sm text-center mt-6">
          <Link href="/groups" className="text-senegal-green hover:underline font-medium">
            Classement du groupe {fixture.group}
          </Link>
        </p>
      )}

      {finished && h2h.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Face à face</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {h2h.map((m) => (
              <div key={m.id} className="flex justify-between gap-2">
                <span className="text-muted-foreground">
                  {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
                    new Date(m.date)
                  )}
                </span>
                <span className="font-medium tabular-nums">
                  {m.teams.home.name} {m.goals.home} – {m.goals.away} {m.teams.away.name}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground text-center mt-8">
        <Link href="/dashboard/matches" className="text-senegal-green hover:underline">
          Modifier ce match
        </Link>
        {" · "}
        <Link href="/statistics" className="text-senegal-green hover:underline">
          Statistiques tournoi
        </Link>
      </p>
    </div>
  );
}
