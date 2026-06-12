import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: { default: "Manager", template: "%s | Manager" },
  robots: { index: false, follow: false },
};

/** Layout admin — sans header/footer public */
export default function ManagerGroupLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#050807] text-foreground">{children}</div>
    </ThemeProvider>
  );
}
