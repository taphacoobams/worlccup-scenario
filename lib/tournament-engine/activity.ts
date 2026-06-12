import "server-only";

import { prisma } from "@/lib/prisma";

export type ActivityAction =
  | "match_updated"
  | "goal_added"
  | "card_added"
  | "standings_recalculated"
  | "scenarios_recalculated"
  | "statistics_recalculated"
  | "team_updated"
  | "player_updated"
  | "data_imported"
  | "data_exported"
  | "backup_created"
  | "login";

const ACTION_LABELS: Record<ActivityAction, string> = {
  match_updated: "Match modifié",
  goal_added: "But ajouté",
  card_added: "Carton ajouté",
  standings_recalculated: "Classement recalculé",
  scenarios_recalculated: "Scénarios recalculés",
  statistics_recalculated: "Statistiques recalculées",
  team_updated: "Équipe modifiée",
  player_updated: "Joueur modifié",
  data_imported: "Données importées",
  data_exported: "Données exportées",
  backup_created: "Sauvegarde créée",
  login: "Connexion",
};

export function activityLabel(action: ActivityAction): string {
  return ACTION_LABELS[action] ?? action;
}

function isMissingActivityTable(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2021"
  );
}

export async function logActivity(
  action: ActivityAction,
  detail?: string
): Promise<void> {
  try {
    await prisma.managerActivity.create({
      data: { action, detail: detail ?? null },
    });
  } catch (error) {
    if (!isMissingActivityTable(error)) throw error;
    console.warn(
      "[manager] Table manager_activities absente — lancez: npm run db:push"
    );
  }
}

export async function getRecentActivity(limit = 20) {
  let rows: Awaited<ReturnType<typeof prisma.managerActivity.findMany>>;
  try {
    rows = await prisma.managerActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (error) {
    if (isMissingActivityTable(error)) return [];
    throw error;
  }
  return rows.map((r) => ({
    id: r.id,
    action: r.action as ActivityAction,
    label: activityLabel(r.action as ActivityAction),
    detail: r.detail,
    createdAt: r.createdAt.toISOString(),
  }));
}
