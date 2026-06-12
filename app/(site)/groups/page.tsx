import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupsViewClient } from "@/components/worldcup/GroupsViewClient";
import { GroupsSkeleton } from "@/components/worldcup/WorldCupSkeleton";
import { enrichGroupsWithQualification } from "@/lib/qualification-server";
import { getGroupsWithResults } from "@/lib/worldcup-data";

export const metadata: Metadata = {
  title: "Groupes & Classements",
  description:
    "Groupes FIFA 2026 — données manuelles, probabilités de qualification et meilleurs 3es.",
};

export const revalidate = 60;

async function GroupsContent() {
  const { groups, hasResults } = await getGroupsWithResults();
  const { summaries, bestThirds } = await enrichGroupsWithQualification(groups);

  return (
    <GroupsViewClient
      groups={groups}
      summaries={summaries}
      bestThirds={bestThirds}
      hasResults={hasResults}
    />
  );
}

export default function GroupsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Groupes & Classements</h1>
        <p className="text-muted-foreground mt-2">
          Classements et probabilités — équipe active via le sélecteur en haut à droite
        </p>
      </div>
      <Suspense fallback={<GroupsSkeleton />}>
        <GroupsContent />
      </Suspense>
    </div>
  );
}
