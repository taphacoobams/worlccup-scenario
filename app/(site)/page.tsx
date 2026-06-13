import { HomePageClient } from "@/app/(site)/HomePageClient";
import { getRecentFinishedFixtures } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recentFixtures = await getRecentFinishedFixtures(6);

  return <HomePageClient recentFixtures={recentFixtures} />;
}
