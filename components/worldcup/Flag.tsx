"use client";

import { useMemo, useState } from "react";
import { legacyPathToFlagCdn, PLACEHOLDER_FLAG, resolveFlagSrc } from "@/lib/flags";
import { cn } from "@/lib/utils";

type Props = {
  /** @deprecated — préférer teamCode ; les chemins /teams/ et /flags/ sont convertis en flagcdn */
  src?: string;
  alt: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  teamCode?: string;
  teamName?: string;
};

const sizes = {
  sm: "h-4 w-6",
  md: "h-5 w-7",
  lg: "h-10 w-14",
};

type FlagImgProps = {
  primary: string;
  fallback: string;
  alt: string;
  size: NonNullable<Props["size"]>;
  className?: string;
};

function FlagImg({ primary, fallback, alt, size, className }: FlagImgProps) {
  const [errorStep, setErrorStep] = useState(0);
  const displaySrc =
    errorStep === 0 ? primary : errorStep === 1 ? fallback : PLACEHOLDER_FLAG;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={alt}
      width={size === "lg" ? 56 : 28}
      height={size === "lg" ? 40 : 20}
      loading="lazy"
      decoding="async"
      onError={() => setErrorStep((s) => (s < 2 ? s + 1 : s))}
      className={cn(
        "object-contain rounded-sm shrink-0 bg-white/5",
        sizes[size],
        className
      )}
    />
  );
}

export function Flag({
  src = "",
  alt,
  className,
  size = "md",
  teamCode,
  teamName,
}: Props) {
  const primary = useMemo(
    () => resolveFlagSrc({ code: teamCode, teamName, src, size }),
    [teamCode, teamName, src, size]
  );
  const fallback = useMemo(() => {
    if (teamCode) return resolveFlagSrc({ code: teamCode, teamName, size: "md" });
    return legacyPathToFlagCdn(src) ?? PLACEHOLDER_FLAG;
  }, [teamCode, teamName, src]);

  if (!teamCode && !src && primary === PLACEHOLDER_FLAG) return null;

  return (
    <FlagImg
      key={primary}
      primary={primary}
      fallback={fallback}
      alt={alt}
      size={size}
      className={className}
    />
  );
}
