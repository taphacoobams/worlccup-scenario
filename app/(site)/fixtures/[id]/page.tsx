import { redirect, notFound } from "next/navigation";
import { getFixtureById } from "@/lib/api";
import { fixtureHref } from "@/lib/slugs/fixture";
import { getWorldCupFixtures } from "@/lib/worldcup-data";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyFixtureRedirect({ params }: Props) {
  const { id } = await params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId)) notFound();

  const [fixture, all] = await Promise.all([
    getFixtureById(fixtureId),
    getWorldCupFixtures(),
  ]);
  if (!fixture) notFound();

  redirect(fixtureHref(fixture, all));
}
