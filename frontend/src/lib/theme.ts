export type ThemePreference = "light" | "dark" | "system"

export const applyTheme = (theme: ThemePreference) => {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", dark)
  localStorage.setItem("theme", theme)
}

export const getSavedTheme = (): ThemePreference => {
  const value = localStorage.getItem("theme")
  return value === "dark" || value === "system" || value === "light" ? value : "system"
}

export const initThemeListeners = () => {
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const onChange = () => {
    if (getSavedTheme() === "system") applyTheme("system")
  }
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}
