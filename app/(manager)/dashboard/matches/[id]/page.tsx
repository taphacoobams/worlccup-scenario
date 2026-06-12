import { MatchEditorView } from "@/components/manager/views/MatchEditorView";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ManagerMatchEditorPage({ params }: Props) {
  const { id } = await params;
  return <MatchEditorView matchId={Number(id)} />;
}
