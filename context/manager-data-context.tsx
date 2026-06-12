"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyTournamentPipeline } from "@/lib/tournament-engine/client";
import type { WorldCupManualData } from "@/types/worldcup-manual";

type ManagerDataContextValue = {
  data: WorldCupManualData | null;
  loading: boolean;
  saving: boolean;
  message: string | null;
  setMessage: (msg: string | null) => void;
  reload: () => Promise<void>;
  save: () => Promise<void>;
  patchData: (next: WorldCupManualData) => void;
  updateFixture: (id: number, patch: Partial<WorldCupManualData["fixtures"][0]>) => void;
  teamName: (id: number) => string;
};

const ManagerDataContext = createContext<ManagerDataContextValue | null>(null);

export function ManagerDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WorldCupManualData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/manager/data", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erreur chargement");
      setData(applyTournamentPipeline(json as WorldCupManualData));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur chargement");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void reload();
    }, 0);
    return () => window.clearTimeout(id);
  }, [reload]);

  const patchData = useCallback((next: WorldCupManualData) => {
    setData(applyTournamentPipeline(next));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    try {
      const prepared = applyTournamentPipeline(data);
      const res = await fetch("/api/manager/data", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prepared),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec enregistrement");
      setMessage("Enregistré — poules, classements et stats mis à jour.");
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }, [data, reload]);

  const updateFixture = useCallback(
    (id: number, patch: Partial<WorldCupManualData["fixtures"][0]>) => {
      if (!data) return;
      patchData({
        ...data,
        fixtures: data.fixtures.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      });
    },
    [data, patchData]
  );

  const teamName = useCallback(
    (id: number) => data?.teams.find((t) => t.id === id)?.name ?? `#${id}`,
    [data]
  );

  const value = useMemo(
    () => ({
      data,
      loading,
      saving,
      message,
      setMessage,
      reload,
      save,
      patchData,
      updateFixture,
      teamName,
    }),
    [data, loading, saving, message, reload, save, patchData, updateFixture, teamName]
  );

  return (
    <ManagerDataContext.Provider value={value}>{children}</ManagerDataContext.Provider>
  );
}

export function useManagerData(): ManagerDataContextValue {
  const ctx = useContext(ManagerDataContext);
  if (!ctx) {
    throw new Error("useManagerData must be used within ManagerDataProvider");
  }
  return ctx;
}
