import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { GroupsViewClient } from "@/components/worldcup/GroupsViewClient";
import { GroupsSkeleton } from "@/components/worldcup/WorldCupSkeleton";
import { SitePageHeader } from "@/components/layout/site-page-header";
import { enrichGroupsWithQualification } from "@/lib/qualification-server";
import { getGroupsWithResults } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Groupes & Classements",
  description:
    "Groupes FIFA 2026 — données manuelles, probabilités de qualification et meilleurs 3es.",
};

export const dynamic = "force-dynamic";

async function GroupsContent() {
  const { groups } = await getGroupsWithResults();
  const { summaries, bestThirds } = await enrichGroupsWithQualification(groups);

  return (
    <GroupsViewClient
      groups={groups}
      summaries={summaries}
      bestThirds={bestThirds}
    />
  );
}

export default function GroupesPage() {
  return (
    <div className="page-container">
      <SitePageHeader
        title="Groupes & Classements"
        description="12 poules — classement actuel (résultats joués) et probabilités de qualification (projections)"
      />
      <Suspense fallback={<GroupsSkeleton />}>
        <GroupsContent />
      </Suspense>
    </div>
  );
}
