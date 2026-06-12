import type { ReactNode } from "react";
import { ScenariosProvider } from "@/context/scenarios-context";
import { ScenariosSetupBanner } from "@/components/providers/scenarios-setup-banner";
import { getScenarioEngineData } from "@/lib/scenarios/engine-data";
import { getAllScenarios } from "@/lib/scenarios/server";
import type { Scenario } from "@/types";
import type { ScenarioEngineData } from "@/lib/scenarios/engine-data";

const EMPTY_ENGINE: ScenarioEngineData = {
  teams: [],
  standings: [],
  fixtures: [],
};

export async function ScenariosProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  let scenarios: Scenario[] = [];
  let engineData: ScenarioEngineData = EMPTY_ENGINE;
  let ready = true;

  try {
    const [loadedScenarios, loadedEngine] = await Promise.all([
      getAllScenarios(),
      getScenarioEngineData(),
    ]);
    scenarios = loadedScenarios;
    engineData = loadedEngine;
    if (scenarios.length === 0) ready = false;
  } catch {
    ready = false;
  }

  return (
    <>
      {!ready && <ScenariosSetupBanner />}
      <ScenariosProvider scenarios={scenarios} engineData={engineData}>
        {children}
      </ScenariosProvider>
    </>
  );
}
