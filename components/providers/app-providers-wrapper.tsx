import type { ReactNode } from "react";
import { AppProviders } from "@/components/providers/app-providers";
import { getSelectableTeamsFromDb } from "@/lib/teams-selection-server";

export async function AppProvidersWrapper({ children }: { children: ReactNode }) {
  const selectableTeams = await getSelectableTeamsFromDb();
  return <AppProviders selectableTeams={selectableTeams}>{children}</AppProviders>;
}
