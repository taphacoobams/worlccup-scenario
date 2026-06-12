import { getRecentActivity } from "@/lib/tournament-engine/activity";

export const dynamic = "force-dynamic";

export default async function ManagerActivityPage() {
  const activities = await getRecentActivity(100);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Journal complet des actions Manager.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 divide-y divide-white/5">
        {activities.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucune activité.</p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="px-4 py-3 text-sm flex gap-4">
              <span className="text-muted-foreground tabular-nums shrink-0 w-14">
                {new Date(a.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="font-medium">{a.label}</span>
              {a.detail && (
                <span className="text-muted-foreground ml-auto">{a.detail}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
