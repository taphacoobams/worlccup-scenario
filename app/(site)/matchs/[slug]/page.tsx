import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FixtureDetailView } from "@/components/fixtures/FixtureDetailView";
import { getFixtureTeamKitImages } from "@/lib/match-kits";
import { getFixtureBySlug, getWorldCupGroups } from "@/lib/api";
import { fixtureHref } from "@/lib/slugs/fixture";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fixture = await getFixtureBySlug(slug);
  if (!fixture) return { title: `Match` };
  return {
    title: `${fixture.teams.home.name} vs ${fixture.teams.away.name}`,
    description: `${fixture.venue.name} — ${fixture.venue.city}`,
  };
}

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({ params }: Props) {
  const { slug } = await params;
  const fixture = await getFixtureBySlug(slug);
  if (!fixture) notFound();

  const canonical = fixtureHref(fixture);
  if (slug !== String(fixture.id)) {
    redirect(canonical);
  }

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
