"use client";

import { useSyncExternalStore } from "react";

/** Détecte le client sans setState dans un effet (compatible React Compiler). */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
