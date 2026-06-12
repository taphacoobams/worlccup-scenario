"use client";

import { AlertTriangle } from "lucide-react";

export function ScenariosSetupBanner() {
  return (
    <div
      role="alert"
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-100"
    >
      <AlertTriangle className="inline h-4 w-4 mr-2 -mt-0.5 text-amber-400" aria-hidden />
      Scénarios FIFA indisponibles — exécutez{" "}
      <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">npm run import-fifa</code> puis{" "}
      <code className="rounded bg-black/30 px-1.5 py-0.5 text-xs">npm run db:seed</code>
    </div>
  );
}
