import { PlayersManagerView } from "@/components/manager/views/PlayersManagerView";
import { getManagerPlayersList } from "@/lib/manager/players";

export const dynamic = "force-dynamic";

export default async function ManagerPlayersPage() {
  const rows = await getManagerPlayersList();
  const initialPlayers = rows.map((p) => ({
    id: p.legacyId,
    name: p.name,
    teamId: p.team.legacyId,
    teamName: p.team.name,
    number: p.number,
    position: p.position ?? undefined,
    photo: p.image ?? undefined,
    club: p.club,
    bio: p.bio,
    specialTag: p.specialTag,
  }));

  return <PlayersManagerView initialPlayers={initialPlayers} />;
}
