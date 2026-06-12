"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TeamProvider } from "@/context/team-context";
import type { SelectableTeam } from "@/types/team-selection";

type Props = {
  children: ReactNode;
  selectableTeams: SelectableTeam[];
};

export function AppProviders({ children, selectableTeams }: Props) {
  return (
    <ThemeProvider>
      <TeamProvider selectableTeams={selectableTeams}>{children}</TeamProvider>
    </ThemeProvider>
  );
}
