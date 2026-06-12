"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RecalculateScenariosButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function recalculate() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/manager/recalculate", {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec");
      setMessage("Scénarios et probabilités recalculés.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={() => void recalculate()} disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Recalculer scénarios
      </Button>
      {message && <p className="text-sm text-senegal-green">{message}</p>}
    </div>
  );
}
