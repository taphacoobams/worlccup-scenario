"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MANAGER_LOGOUT, MANAGER_NAV } from "@/lib/manager/nav";
import { cn } from "@/lib/utils";

type Props = {
  onNavigate?: () => void;
  className?: string;
};

export function ManagerSidebar({ onNavigate, className }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/manager/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-white/10 bg-[#0a0f0c]",
        className
      )}
    >
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">
          World Cup 2026
        </p>
        <p className="text-lg font-bold text-senegal-green">Manager</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {MANAGER_NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-senegal-green/20 text-senegal-green font-medium"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <MANAGER_LOGOUT.icon className="h-4 w-4" />
          {MANAGER_LOGOUT.label}
        </button>
      </div>
    </aside>
  );
}
