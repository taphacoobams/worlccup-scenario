"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ParticleField } from "@/components/ui/particle-field";
import { Button } from "@/components/ui/button";

type Cta = {
  label: string;
  href: string;
  variant?: "default" | "outline";
};

type Props = {
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  logo?: React.ReactNode;
  ctas?: Cta[];
  children?: React.ReactNode;
  className?: string;
  size?: "default" | "large";
};

export function PageHero({
  badge,
  title,
  subtitle,
  logo,
  ctas,
  children,
  className,
  size = "default",
}: Props) {
  return (
    <section className={cn("stadium-hero relative hero-gradient", className)}>
      <div className="stadium-lights" />
      <ParticleField />
      <div
        className={cn(
          "relative page-container",
          size === "large" ? "py-20 lg:py-28" : "py-14 lg:py-20"
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          {logo && <div className="mb-8 flex justify-center">{logo}</div>}
          {badge && <div className="mb-6 flex justify-center">{badge}</div>}
          <h1
            className={cn(
              "font-bold tracking-tight mb-6 text-balance",
              size === "large"
                ? "text-4xl sm:text-5xl lg:text-7xl"
                : "text-3xl sm:text-4xl lg:text-5xl"
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          {ctas && ctas.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {ctas.map((cta) => (
                <Button
                  key={cta.href}
                  asChild
                  size="lg"
                  variant={cta.variant === "outline" ? "outline" : "default"}
                >
                  <Link href={cta.href}>{cta.label}</Link>
                </Button>
              ))}
            </div>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
}

/** Alias demandé dans le design brief */
export { PageHero as WorldCupHero };
