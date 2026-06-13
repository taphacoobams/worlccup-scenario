import Link from "next/link";
import { CalendarDays, LayoutGrid, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ACTIONS = [
  { href: "/dashboard/matches", label: "Matches", icon: CalendarDays },
  { href: "/dashboard/groups", label: "Groupes", icon: LayoutGrid },
  { href: "/dashboard/scenarios", label: "Scenarios", icon: Target },
] as const;

export function ManagerQuickActions() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Accès rapide</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTIONS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="border-white/10 hover:border-senegal-green/40 hover:bg-senegal-green/5 transition-colors h-full">
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <Icon className="h-5 w-5 text-gold" />
                <CardTitle className="text-base">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Ouvrir →</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
