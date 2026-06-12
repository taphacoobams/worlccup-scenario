"use client";

import { useEffect } from "react";

export default function WorldCupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h2 className="text-lg font-semibold mb-2">Erreur de chargement</h2>
      <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
      <p className="text-xs text-muted-foreground mb-6">
        Vérifiez <code className="text-gold">DATABASE_URL</code> et exécutez{" "}
        <code className="text-gold">npm run db:seed</code> si la base est vide.
      </p>
      <button
        type="button"
        onClick={reset}
        className="text-sm text-senegal-green hover:underline"
      >
        Réinitialiser
      </button>
    </div>
  );
}
