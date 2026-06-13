"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { pageDescription, pageTitle, worldCupBadge } from "@/lib/ui-classes";
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
    <section className={cn("border-b border-white/10", className)}>
      <div
        className={cn(
          "page-container",
          size === "large" ? "py-8 sm:py-10" : "py-6 sm:py-8"
        )}
      >
        <div className="max-w-3xl">
          {badge && <div className="mb-3">{badge}</div>}
          <div className="flex items-start gap-4">
            {logo && <div className="shrink-0">{logo}</div>}
            <div className="min-w-0">
              <h1
                className={cn(
                  pageTitle,
                  size === "large" && "text-2xl sm:text-3xl",
                  "mb-2"
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <p className={cn(pageDescription, "max-w-2xl leading-relaxed")}>{subtitle}</p>
              )}
            </div>
          </div>
          {ctas && ctas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {ctas.map((cta, index) => (
                <Button
                  key={`${cta.href}-${cta.label}-${index}`}
                  asChild
                  size="sm"
                  variant={cta.variant === "outline" ? "outline" : "default"}
                >
                  <Link href={cta.href}>{cta.label}</Link>
                </Button>
              ))}
            </div>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

/** Alias demandé dans le design brief */
export { PageHero as WorldCupHero };
