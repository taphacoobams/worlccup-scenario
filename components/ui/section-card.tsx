import { cn } from "@/lib/utils";
import { glassPanelStatic } from "@/lib/ui-classes";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SectionCard({ title, description, action, children, className }: Props) {
  return (
    <section className={cn(glassPanelStatic, "overflow-hidden min-w-0", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-b border-white/10 min-w-0">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-6 min-w-0">{children}</div>
    </section>
  );
}
