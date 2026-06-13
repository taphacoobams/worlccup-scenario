import type { ReactNode } from "react";
import { ManagerShell } from "@/components/manager/shell/ManagerShell";

/** Console admin — sidebar, accès protégé (proxy) */
export default function ManagerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ManagerShell>{children}</ManagerShell>;
}
