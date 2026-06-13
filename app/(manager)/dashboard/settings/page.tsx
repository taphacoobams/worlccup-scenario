import { isDatabaseEnabled, getTournamentUpdatedAt } from "@/lib/database";
import { isManagerConfigured, MANAGER_SESSION_MAX_AGE } from "@/lib/manager/auth";
import { getManagerDashboardStats } from "@/lib/manager/stats";
import { getDatabaseDiagnostic } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ManagerSettingsPage() {
  const [stats, updatedAt, dbDiag] = await Promise.all([
    getManagerDashboardStats(),
    getTournamentUpdatedAt(),
    Promise.resolve(getDatabaseDiagnostic()),
  ]);

  const sections = [
    {
      title: "Tournament",
      rows: [
        { label: "Nom tournoi", value: "Coupe du Monde FIFA 2026" },
        { label: "Version", value: process.env.npm_package_version ?? "0.1.0" },
        { label: "Date début", value: "11 juin 2026" },
        { label: "Date fin", value: "19 juillet 2026" },
      ],
    },
    {
      title: "Database",
      rows: [
        {
          label: "PostgreSQL",
          value: isDatabaseEnabled() ? "Configuré" : "Repli JSON",
        },
        {
          label: "Hôte",
          value: dbDiag.host ?? "—",
        },
        {
          label: "Status",
          value: dbDiag.isLocalhost && process.env.VERCEL ? "Inaccessible (localhost)" : "OK / fallback",
        },
        { label: "Tables", value: "12" },
        {
          label: "Dernière mise à jour",
          value: updatedAt
            ? new Date(updatedAt).toLocaleString("fr-FR")
            : "—",
        },
      ],
    },
    {
      title: "Security",
      rows: [
        {
          label: "Durée session",
          value: `${MANAGER_SESSION_MAX_AGE / 3600}h`,
        },
        {
          label: "Manager Secret",
          value: isManagerConfigured() ? "Défini" : "Non configuré",
        },
      ],
    },
    {
      title: "System",
      rows: [
        { label: "Node", value: process.version },
        { label: "Next.js", value: "16" },
        { label: "Prisma", value: "6" },
        { label: "Build", value: process.env.NODE_ENV ?? "development" },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.teams} équipes · {stats.players} joueurs · {stats.fixtures} matchs
        </p>
        {dbDiag.issues.length > 0 ? (
          <ul className="mt-3 text-sm text-amber-400/90 list-disc pl-5 space-y-1">
            {dbDiag.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {sections.map((section) => (
        <Card key={section.title} className="border-white/10">
          <CardHeader>
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {section.rows.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-white/5 pb-2"
                >
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
