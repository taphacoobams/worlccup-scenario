import { isDatabaseEnabled } from "@/lib/database";
import { isManagerConfigured, MANAGER_SESSION_MAX_AGE } from "@/lib/manager/auth";
import { getManagerDashboardStats } from "@/lib/manager/stats";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ManagerSettingsPage() {
  const stats = await getManagerDashboardStats();
  const meta = await prisma.tournamentMeta.findUnique({ where: { key: "main" } });

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
          value: isDatabaseEnabled() ? "Connecté" : "Non configuré",
        },
        { label: "Status", value: isDatabaseEnabled() ? "OK" : "—" },
        { label: "Tables", value: "12" },
        {
          label: "Dernier seed",
          value: meta?.updatedAt
            ? new Date(meta.updatedAt).toLocaleString("fr-FR")
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
