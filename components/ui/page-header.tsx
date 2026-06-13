"use client";

import { cn } from "@/lib/utils";
import { pageDescription, pageTitle } from "@/lib/ui-classes";

type Props = {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({ title, description, badge, actions, className }: Props) {
  return (
    <header
      className={cn("mb-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4", className)}
    >
      <div>
        {badge}
        <h1 className={pageTitle}>{title}</h1>
        {description && <p className={cn(pageDescription, "max-w-2xl")}>{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
    </header>
  );
}
