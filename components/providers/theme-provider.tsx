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

const STORAGE_KEY = "theme";

type ThemeContextValue = {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  resolvedTheme: string | undefined;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: string, enableSystem: boolean): "light" | "dark" {
  if (theme === "system" && enableSystem) return getSystemTheme();
  return theme === "light" ? "light" : "dark";
}

function applyThemeClass(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
}

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: string;
  enableSystem?: boolean;
  forcedTheme?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = true,
  forcedTheme,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<string>(() => defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    resolveTheme(forcedTheme ?? defaultTheme, enableSystem)
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setThemeState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setTheme = useCallback((next: string) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const active = forcedTheme ?? theme;
    const resolved = resolveTheme(active, enableSystem);
    applyThemeClass(resolved);
    setResolvedTheme(resolved);
  }, [theme, forcedTheme, enableSystem]);

  useEffect(() => {
    if (!enableSystem || (forcedTheme ?? theme) !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = getSystemTheme();
      applyThemeClass(resolved);
      setResolvedTheme(resolved);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, forcedTheme, enableSystem]);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, setTheme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: undefined,
      setTheme: () => {},
      resolvedTheme: undefined,
    };
  }
  return ctx;
}
