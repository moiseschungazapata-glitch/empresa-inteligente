import { useState } from "react";

export type WorkspaceTheme = "dark" | "light";
const THEME_KEY = "empresa-inteligente-theme";

export function useWorkspaceTheme() {
  const [theme, setTheme] = useState<WorkspaceTheme>(() => {
    try { return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark"; }
    catch { return "dark"; }
  });
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* El tema funciona aunque no se pueda guardar. */ }
  };
  return { theme, toggleTheme };
}

