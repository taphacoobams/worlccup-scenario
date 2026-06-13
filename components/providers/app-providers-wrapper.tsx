import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { getSelectableTeams } from "@/lib/api";

export async function AppProvidersWrapper({ children }: { children: ReactNode }) {
  const selectableTeams = await getSelectableTeams();
  return <AppProviders selectableTeams={selectableTeams}>{children}</AppProviders>;
}
