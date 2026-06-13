import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupDetailView } from "@/components/groupes/GroupDetailView";
import { enrichGroupsWithQualification } from "@/lib/qualification-server";
import { getGroupsWithResults, getWorldCupFixtures } from "@/lib/api";
import { groupLetterFromSlug } from "@/lib/slugs/group";

type Props = { params: Promise<{ groupe: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupe } = await params;
  const letter = groupLetterFromSlug(groupe);
  if (!letter) return { title: "Groupe introuvable" };
  return {
    title: `Groupe ${letter}`,
    description: `Classement, matchs et scénarios — Groupe ${letter} Coupe du Monde 2026`,
  };
}

export const dynamic = "force-dynamic";

export default async function GroupeDetailPage({ params }: Props) {
  const { groupe } = await params;
  const letter = groupLetterFromSlug(groupe);
  if (!letter) notFound();

  const [{ groups }, fixtures, qualification] = await Promise.all([
    getGroupsWithResults(),
    getWorldCupFixtures(),
    getGroupsWithResults().then((g) => enrichGroupsWithQualification(g.groups)),
  ]);

  const group = groups.find((g) => g.letter.toUpperCase() === letter);
  if (!group) notFound();

  const summary = qualification.summaries.find((s) => s.groupName === group.name);
  const groupFixtures = fixtures
    .filter((f) => f.group?.toUpperCase() === letter)
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <GroupDetailView
      letter={letter}
      group={group}
      summary={summary}
      fixtures={groupFixtures}
    />
  );
}
