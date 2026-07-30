import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { applyTheme, getSavedTheme, initThemeListeners, type ThemePreference } from "../lib/theme"
import { fetchProfile, persistUser, readStoredUser, updateTheme, type StoredUser } from "../lib/profileApi"

type UserContextValue = {
  user: StoredUser
  loading: boolean
  refreshProfile: () => Promise<void>
  setUserLocal: (user: StoredUser) => void
  theme: ThemePreference
  setTheme: (theme: ThemePreference, persist?: boolean) => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser>(() => readStoredUser())
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")))
  const [theme, setThemeState] = useState<ThemePreference>(() => getSavedTheme())

  const setUserLocal = useCallback((next: StoredUser) => {
    const merged = persistUser(next)
    setUser(merged)
  }, [])

  const setTheme = useCallback(async (next: ThemePreference, persist = true) => {
    applyTheme(next)
    setThemeState(next)
    if (!persist) return
    localStorage.setItem("theme", next)
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const data = await updateTheme(next)
      setUserLocal(data.user)
    } catch {
      /* keep local theme even if API fails */
    }
  }, [setUserLocal])

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await fetchProfile()
      setUserLocal(data.user)
      const savedTheme = (data.user.themePreference as ThemePreference) || getSavedTheme()
      applyTheme(savedTheme)
      setThemeState(savedTheme)
      localStorage.setItem("theme", savedTheme)
    } catch {
      /* use cached user */
    } finally {
      setLoading(false)
    }
  }, [setUserLocal])

  useEffect(() => {
    applyTheme(getSavedTheme())
    const cleanup = initThemeListeners()
    void refreshProfile()
    const onUpdate = () => setUser(readStoredUser())
    window.addEventListener("profile-updated", onUpdate)
    return () => {
      cleanup()
      window.removeEventListener("profile-updated", onUpdate)
    }
  }, [refreshProfile])

  const value = useMemo(
    () => ({ user, loading, refreshProfile, setUserLocal, theme, setTheme }),
    [user, loading, refreshProfile, setUserLocal, theme, setTheme]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
