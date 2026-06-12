"use client";

import { useMemo, useState } from "react";
import { PLACEHOLDER_FLAG, resolveFlagSrc } from "@/lib/flags";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  teamName?: string;
  /** @deprecated — ignoré si code fourni */
  flagUrl?: string;
  size?: "sm" | "md";
  className?: string;
};

type FlagImgProps = {
  primary: string;
  fallback: string;
  box: string;
};

function FlagImg({ primary, fallback, box }: FlagImgProps) {
  const [errorStep, setErrorStep] = useState(0);
  const src =
    errorStep === 0 ? primary : errorStep === 1 ? fallback : PLACEHOLDER_FLAG;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center shrink-0 rounded overflow-hidden bg-white/10",
        box
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setErrorStep((s) => (s < 2 ? s + 1 : s))}
      />
    </span>
  );
}

export function TeamFlag({ code, teamName, size = "md", className }: Props) {
  const primary = useMemo(
    () => resolveFlagSrc({ code, teamName, size }),
    [code, teamName, size]
  );
  const fallback = useMemo(
    () => resolveFlagSrc({ code, teamName, size: "md" }),
    [code, teamName]
  );

  const box = size === "sm" ? "h-5 w-7" : "h-6 w-9";

  return (
    <FlagImg
      key={primary}
      primary={primary}
      fallback={fallback}
      box={cn(box, className)}
    />
  );
}
