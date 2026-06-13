import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarDays,
  Database,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Settings,
  Target,
} from "lucide-react";

export type ManagerNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const MANAGER_BASE = "/dashboard";

export const MANAGER_NAV: ManagerNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/matches", label: "Matches", icon: CalendarDays },
  { href: "/dashboard/groups", label: "Groupes", icon: LayoutGrid },
  { href: "/dashboard/scenarios", label: "Scenarios", icon: Target },
  { href: "/dashboard/data", label: "Data", icon: Database },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const MANAGER_LOGOUT = {
  href: "/login",
  label: "Logout",
  icon: LogOut,
} as const;
