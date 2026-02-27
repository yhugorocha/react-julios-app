import { useThemeStore } from "../store/themeStore";

function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      {theme === "dark" ? "Modo claro" : "Modo escuro"}
    </button>
  );
}

export default ThemeToggle;
