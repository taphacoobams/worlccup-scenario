import type { LocalFixture, LocalStanding, LocalTeam } from "@/types/data";

export type ScenarioEngineData = {
  teams: LocalTeam[];
  standings: LocalStanding[];
  fixtures: LocalFixture[];
};
