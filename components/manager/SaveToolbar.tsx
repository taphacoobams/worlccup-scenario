"use client";

import { useManagerData } from "@/context/manager-data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SaveToolbar() {
  const { saving, message, save } = useManagerData();

  return (
    <Card className="border-senegal-green/25 bg-senegal-green/5">
      <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
        <div className="text-sm text-muted-foreground">
          Modifications en mémoire — enregistrez pour persister en base.
        </div>
        <Button onClick={() => void save()} disabled={saving} size="sm">
          {saving ? "Enregistrement…" : "Enregistrer tout"}
        </Button>
      </CardContent>
      {message && (
        <p className="px-6 pb-4 text-sm text-muted-foreground">{message}</p>
      )}
    </Card>
  );
}
