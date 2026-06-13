import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MatchRow } from "@/components/worldcup/MatchRow";
import { Button } from "@/components/ui/button";
import type { Fixture } from "@/types/worldcup";

type Props = {
  fixtures: Fixture[];
};

export function RecentResultsSection({ fixtures }: Props) {
  if (fixtures.length === 0) return null;

  return (
    <section className="page-container pt-0">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold mb-1">
            Coupe du Monde 2026
          </p>
          <h2 className="text-xl font-bold">Derniers résultats</h2>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/fixtures">
            Tout le calendrier <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="space-y-4">
        {fixtures.map((f, i) => (
          <MatchRow key={f.id} fixture={f} index={i} />
        ))}
      </div>
    </section>
  );
}
