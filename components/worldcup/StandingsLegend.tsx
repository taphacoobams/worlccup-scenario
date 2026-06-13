import { cn } from "@/lib/utils";

function Swatch({
  className,
  bar = false,
}: {
  className: string;
  bar?: boolean;
}) {
  if (bar) {
    return <span className={cn("inline-block h-1.5 w-8 rounded-full shrink-0", className)} />;
  }
  return (
    <span
      className={cn(
        "inline-block h-5 w-2.5 rounded-sm shrink-0 border-l-[3px] mt-0.5",
        className
      )}
    />
  );
}

function LegendItem({
  swatch,
  bar,
  label,
  detail,
}: {
  swatch: string;
  bar?: boolean;
  label: string;
  detail?: string;
}) {
  return (
    <li className="flex items-start gap-2 min-w-[200px] sm:min-w-0 sm:flex-1">
      <Swatch className={swatch} bar={bar} />
      <span>
        <span className="text-foreground font-medium">{label}</span>
        {detail && (
          <span className="block text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {detail}
          </span>
        )}
      </span>
    </li>
  );
}

export function StandingsLegend() {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-4"
      aria-label="Légende des classements"
    >
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Légende — classement des poules
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <LegendItem
            swatch="border-l-emerald-500 bg-emerald-500/30"
            label="1er et 2e"
            detail="Qualification directe (16es de finale)"
          />
          <LegendItem
            swatch="border-l-amber-400 bg-amber-400/30"
            label="3e"
            detail="Éligible au tableau des 8 meilleurs troisièmes"
          />
          <LegendItem
            swatch="border-l-red-500/60 bg-red-500/20"
            label="4e"
            detail="Éliminé à l'issue de la phase de groupes"
          />
          <LegendItem
            swatch="bg-emerald-500"
            bar
            label="Colonne Qualif."
            detail="Probabilité estimée (résultats, FIFA, scénarios 495). Survol = détail 1er / 2e / 3e"
          />
        </ul>
      </div>

      <div className="pt-3 border-t border-white/10">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-medium">P(3e au tableau)</strong>{" "}
          sous chaque poule : part des 495 combinaisons où ce groupe figure parmi les 8
          meilleurs troisièmes. Pastilles Qualif. :{" "}
          <span className="text-senegal-green font-medium">≥ 50 %</span>,{" "}
          <span className="text-gold font-medium">25–49 %</span>,{" "}
          <span className="text-muted-foreground">{"< 25 %"}</span>.
        </p>
      </div>

      <div className="pt-3 border-t border-white/10">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Meilleurs 3es
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <LegendItem
            swatch="bg-senegal-green/40"
            bar
            label="Rang 1 à 8"
            detail="Zone qualificative — les 8 premiers 3es passent"
          />
          <LegendItem
            swatch="bg-gold/60"
            bar
            label="Ligne dorée"
            detail="Seuil après le 8e rang"
          />
          <LegendItem
            swatch="bg-white/20"
            bar
            label="P(3e) · Scén."
            detail="Chance d'être parmi les 8 qualifiés · fréquence C(12,8) sur 495 scénarios"
          />
        </ul>
      </div>
    </div>
  );
}
