"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Calendar, Clock, MapPin, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { worldCupBadge } from "@/lib/ui-classes";

export type VenueCardPremiumProps = {
  venueName: string;
  city: string;
  country: string;
  date: string;
  kickoffTime: string;
  timezone: string;
  image?: string | null;
  heroGradient?: [string, string, string];
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

export function VenueCardPremium({
  venueName,
  city,
  country,
  date,
  kickoffTime,
  timezone,
  image,
  heroGradient = ["#020617", "#0f172a", "#14532d"],
}: VenueCardPremiumProps) {
  const locationLine = country ? `${city}, ${country}` : city;
  const kickoffDisplay = `${kickoffTime} ${timezone}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 overflow-hidden rounded-[20px] border border-border bg-[#0f172a] premium-shadow"
      aria-label={`Lieu du match — ${venueName}, ${locationLine}`}
    >
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

      <div className="p-5 sm:p-6">
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
      </div>
    </motion.section>
  );
}
