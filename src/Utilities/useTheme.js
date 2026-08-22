import { useState, useEffect, useCallback } from "react";

const THEME_KEY = "samaj_theme";

/**
 * useTheme — global dark/light mode hook.
 * Reads the persisted preference from localStorage and syncs it
 * to the `data-theme` attribute on <html> so CSS variables flip automatically.
 *
 * Usage:
 *   const { theme, toggleTheme, isDark } = useTheme();
 */
export function useTheme() {
  const getInitial = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // ignore SSR / private-mode errors
    }
    // Default: prefer system preference, fall back to dark
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  };

  const [theme, setTheme] = useState(getInitial);

  // Sync theme to <html data-theme="...">
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme, isDark: theme === "dark" };
}

/**
 * initTheme — call once at app boot (before React renders)
 * to prevent a flash of wrong theme.
 */
export function initTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      document.documentElement.setAttribute("data-theme", saved);
      return;
    }
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } catch {}
}
