import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FixtureDetailView } from "@/components/fixtures/FixtureDetailView";
import { getFixtureTeamKitImages } from "@/lib/match-kits";
import { getFixtureById, getWorldCupGroups } from "@/lib/worldcup-data";

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

  const kits = fixture.group
    ? getFixtureTeamKitImages(fixture.teams.home.code, fixture.teams.away.code)
    : null;

  let groupStandings;
  if (fixture.group) {
    const groups = await getWorldCupGroups();
    const group = groups.find(
      (g) => g.letter.toUpperCase() === fixture.group!.toUpperCase()
    );
    groupStandings = group?.standings;
  }

  return (
    <FixtureDetailView
      fixture={fixture}
      kits={kits}
      groupStandings={groupStandings}
    />
  );
}
