"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  progress: number;
  label?: string;
  className?: string;
  active?: boolean;
};

export function LabProgressBar({ progress, label, className, active = false }: Props) {
  const pct = Math.min(100, Math.max(0, progress * 100));

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{label ?? "Progression"}</span>
        <span className="tabular-nums font-medium text-foreground">{pct.toFixed(0)}%</span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            active
              ? "bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%]"
              : "bg-primary"
          )}
          initial={false}
          animate={{
            width: `${pct}%`,
            backgroundPosition: active ? ["0% 0%", "200% 0%"] : "0% 0%",
          }}
          transition={{
            width: { type: "spring", stiffness: 120, damping: 20 },
            backgroundPosition: active
              ? { duration: 1.2, repeat: Infinity, ease: "linear" }
              : { duration: 0 },
          }}
        />
        {active && pct > 0 && pct < 100 && (
          <motion.span
            className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ left: ["-2rem", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}
