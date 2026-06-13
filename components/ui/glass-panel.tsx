import { cn } from "@/lib/utils";
import { glassPanel, glassPanelStatic } from "@/lib/ui-classes";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export function GlassPanel({ className, hover = false, children, ...props }: Props) {
  return (
    <div className={cn(hover ? glassPanel : glassPanelStatic, className)} {...props}>
      {children}
    </div>
  );
}
