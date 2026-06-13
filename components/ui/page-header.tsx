"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, badge, actions, className }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4", className)}
    >
      <div className="space-y-2">
        {badge}
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">{title}</h1>
        {description && (
          <p className="text-text-secondary max-w-2xl text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </motion.header>
  );
}
