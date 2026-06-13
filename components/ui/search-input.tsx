import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  containerClassName?: string;
};

export function SearchInput({ className, containerClassName, ...props }: Props) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none"
        aria-hidden
      />
      <input
        type="search"
        className={cn(
          "w-full h-11 rounded-xl border border-border bg-surface-light/50 pl-10 pr-4 text-sm text-text",
          "placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30",
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    </div>
  );
}
