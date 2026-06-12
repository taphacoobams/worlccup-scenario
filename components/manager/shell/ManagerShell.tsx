"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { ManagerSidebar } from "@/components/manager/shell/ManagerSidebar";
import { ManagerDataProvider } from "@/context/manager-data-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ManagerShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ManagerDataProvider>
      <div className="min-h-screen flex bg-[#050807] text-foreground">
        <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
          <ManagerSidebar className="w-full" />
        </div>

        {drawerOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            aria-label="Fermer le menu"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform lg:hidden",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <ManagerSidebar onNavigate={() => setDrawerOpen(false)} className="w-full shadow-2xl" />
        </div>

        <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-[#050807]/90 px-4 backdrop-blur-xl lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen((o) => !o)}
              aria-label="Menu"
            >
              {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <p className="text-xs text-gold font-semibold">World Cup 2026</p>
              <p className="text-sm font-bold text-senegal-green">Manager</p>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ManagerDataProvider>
  );
}
