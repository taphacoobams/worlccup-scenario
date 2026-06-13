import { redirect, notFound } from "next/navigation";
import { getTeamDetailBySlug } from "@/lib/api";
import { teamHref } from "@/lib/team-slug";

type Props = { params: Promise<{ team: string }> };

export default async function LegacyTeamRedirect({ params }: Props) {
  const { team } = await params;
  const data = await getTeamDetailBySlug(team);
  if (!data) notFound();
  redirect(teamHref(data.team));
}
