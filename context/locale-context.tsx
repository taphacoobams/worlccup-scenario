"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Messages } from "@/lib/i18n/get-messages";
import { appPath } from "@/lib/i18n/routing";

type LocaleContextValue = {
  messages: Messages;
  t: (key: string, vars?: Record<string, string | number>) => string;
  href: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolve(obj: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function LocaleProvider({
  messages,
  children,
}: {
  messages: Messages;
  children: ReactNode;
}) {
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = resolve(messages as unknown as Record<string, unknown>, key) ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return text;
    },
    [messages]
  );

  const href = useCallback((path: string) => appPath(path), []);

  const value = useMemo(() => ({ messages, t, href }), [messages, t, href]);

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}

export function useTranslations(namespace?: string) {
  const { t, href, messages } = useLocale();
  const prefix = namespace ? `${namespace}.` : "";
  return {
    href,
    messages,
    t: (key: string, vars?: Record<string, string | number>) =>
      t(`${prefix}${key}`, vars),
  };
}
