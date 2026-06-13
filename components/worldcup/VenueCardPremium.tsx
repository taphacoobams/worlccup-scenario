"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Cloud,
  CloudSun,
  ExternalLink,
  MapPin,
  Sun,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { worldCupBadge } from "@/lib/ui-classes";
import type { VenueWeather } from "@/lib/venue-metadata";

export type VenueCardPremiumProps = {
  venueName: string;
  city: string;
  country: string;
  capacity: number;
  date: string;
  kickoffTime: string;
  timezone: string;
  image?: string | null;
  heroGradient?: [string, string, string];
  weather?: VenueWeather;
  isOpeningMatch?: boolean;
  mapsUrl?: string;
};

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function WeatherIcon({ icon }: { icon: VenueWeather["icon"] }) {
  const cls = "h-4 w-4 text-gold shrink-0";
  if (icon === "sun") return <Sun className={cls} aria-hidden />;
  if (icon === "rain") return <Cloud className={cls} aria-hidden />;
  if (icon === "partly") return <CloudSun className={cls} aria-hidden />;
  return <Cloud className={cls} aria-hidden />;
}

function InfoMiniCard({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={item}
      className={cn(
        "group rounded-2xl border border-border bg-[#0f172a]/80 backdrop-blur-sm p-4",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_8px_32px_rgba(34,197,94,0.08)]",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="rounded-lg bg-primary/10 p-1.5 text-primary group-hover:bg-primary/20 transition-colors">
          <Icon className="h-3.5 w-3.5" aria-hidden />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-text leading-snug capitalize">{value}</p>
    </motion.div>
  );
}

function StatRow({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <motion.div
      variants={item}
      className="flex items-start gap-3 rounded-xl border border-border/80 bg-white/[0.02] px-4 py-3"
    >
      <div className="rounded-lg bg-white/5 p-2 shrink-0">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-text-secondary">{label}</p>
        <p className="text-sm font-semibold text-text mt-0.5">{value}</p>
        {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function VenueCardPremium({
  venueName,
  city,
  country,
  capacity,
  date,
  kickoffTime,
  timezone,
  image,
  heroGradient = ["#020617", "#0f172a", "#14532d"],
  weather,
  isOpeningMatch = false,
  mapsUrl,
}: VenueCardPremiumProps) {
  const locationLine = country ? `${city}, ${country}` : city;
  const capacityLabel = `${capacity.toLocaleString("fr-FR")} places`;
  const kickoffDisplay = `${kickoffTime} ${timezone}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 overflow-hidden rounded-[20px] border border-border bg-[#0f172a] premium-shadow"
      aria-label={`Lieu du match — ${venueName}, ${locationLine}`}
    >
      {/* ── Hero stade ── */}
      <div className="group relative aspect-video w-full overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={`Vue du ${venueName}`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 896px"
            priority={false}
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${heroGradient[0]} 0%, ${heroGradient[1]} 45%, ${heroGradient[2]} 100%)`,
            }}
            aria-hidden
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 40%, rgba(34,197,94,0.25) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(59,130,246,0.15) 0%, transparent 45%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">
              <span className="text-[12rem] font-black select-none" aria-hidden>
                ⚽
              </span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent" />

        <div className="absolute top-4 right-4 z-10">
          <span className={cn(worldCupBadge, "backdrop-blur-md bg-black/30")}>
            <Trophy className="h-3 w-3" aria-hidden />
            WORLD CUP 2026
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-6">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {venueName}
              </h2>
              <p className="text-sm text-text-secondary mt-1">{locationLine}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* ── Grille principale ── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <InfoMiniCard icon={Calendar} label="Date" value={date} />
          <InfoMiniCard icon={Clock} label="Heure" value={kickoffDisplay} />
          <InfoMiniCard icon={MapPin} label="Stade" value={venueName} />
          <InfoMiniCard icon={MapPin} label="Ville" value={city} />
        </motion.div>

        {/* ── Infos stade ── */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary px-1">
            Informations du stade
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            <StatRow icon={Users} label="Capacité" value={capacityLabel} />
            <StatRow icon={MapPin} label="Pays" value={country || "—"} />
            {isOpeningMatch && (
              <StatRow
                icon={Trophy}
                label="Événement"
                value="Match d'ouverture"
                sub="Coupe du Monde 2026"
              />
            )}
            {weather && (
              <motion.div
                variants={item}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-white/[0.02] px-4 py-3"
              >
                <div className="rounded-lg bg-white/5 p-2 shrink-0">
                  <WeatherIcon icon={weather.icon} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-text-secondary">
                    Météo prévue
                  </p>
                  <p className="text-sm font-semibold text-text mt-0.5">
                    {weather.temperatureC}°C
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">{weather.condition}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Localisation ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border overflow-hidden"
        >
          <div
            className="relative aspect-[2/1] sm:aspect-[21/9] flex flex-col items-center justify-center gap-3 p-6"
            style={{
              background: `linear-gradient(160deg, ${heroGradient[0]} 0%, ${heroGradient[2]} 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/15 backdrop-blur-sm">
              <MapPin className="h-7 w-7 text-primary" aria-hidden />
            </div>
            <p className="relative z-10 text-sm font-semibold text-white">{venueName}</p>
            <p className="relative z-10 text-xs text-text-secondary">{locationLine}</p>
          </div>
          {mapsUrl && (
            <div className="flex justify-center border-t border-border bg-[#020617]/50 px-4 py-3">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Voir l'emplacement de ${venueName} sur Google Maps`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Voir l&apos;emplacement
                </a>
              </Button>
            </div>
          )}
        </motion.div>

        {/* ── Heure officielle FIFA ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-primary/25 bg-primary/10 px-5 py-4"
          role="status"
          aria-label="Heure officielle FIFA"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/20 p-2.5 shrink-0">
              <Clock className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Heure officielle FIFA
              </p>
              <p className="text-2xl font-bold tabular-nums text-white mt-1">{kickoffDisplay}</p>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Cette heure est utilisée comme référence officielle du tournoi.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
