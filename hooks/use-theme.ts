"use client"

import { useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme
    if (stored) {
      setTheme(stored)
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    const applyTheme = (newTheme: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(newTheme)
      setResolvedTheme(newTheme)
    }

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      applyTheme(systemTheme)

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? "dark" : "light")
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      applyTheme(theme)
    }
  }, [theme])

  const setThemeAndStore = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeAndStore,
  }
}
