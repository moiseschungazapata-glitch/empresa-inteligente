import type { WorkspaceTheme } from "../hooks/useWorkspaceTheme";

export default function ThemeToggle({ theme, onToggle }: {
  theme: WorkspaceTheme; onToggle: () => void;
}) {
  const label = theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro";
  return <button type="button" className="theme-toggle" onClick={onToggle} aria-label={label} title={label}>
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      {theme === "dark" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />}
    </svg>
    <span>{theme === "dark" ? "Tema claro" : "Tema oscuro"}</span>
  </button>;
}
