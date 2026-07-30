import { CircleHelp, GraduationCap, LogOut, MoreVertical, Palette, Settings, UserRound, Code2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { Page } from "../app/App"
import { useUser } from "../context/UserContext"

type Props = { setPage: React.Dispatch<React.SetStateAction<Page>> }

const initials = (value: string) =>
  value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

export default function Navbar({ setPage }: Props) {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [imgError, setImgError] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setImgError(false)
  }, [user.profileImage])

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const loggedIn = Boolean(localStorage.getItem("token"))

  const profile = (tab: string) => {
    localStorage.setItem("profileTab", tab)
    setOpen(false)
    setPage("profile")
  }

  const help = () => {
    setOpen(false)
    window.history.replaceState({}, "", "?support=true#contact")
    setPage("home")
    window.setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 150)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setOpen(false)
    setPage("login")
  }

  const item = (label: string, Icon: typeof UserRound, action: () => void, danger = false) => (
    <button
      type="button"
      onClick={action}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-slate-50 dark:hover:bg-slate-700 ${
        danger ? "text-rose-700" : "text-slate-700 dark:text-slate-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )

  const displayName = user.name || "Profile"
  const avatarLabel = user.name || user.email || "User"

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setPage(loggedIn ? "dashboard" : "home")}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </span>
          <span className="hidden font-bold text-slate-900 sm:block dark:text-slate-100">
            Student Performance Analyzer
          </span>
        </button>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <button
                type="button"
                onClick={() => setPage("home")}
                className="text-sm font-medium text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-400"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className="text-sm font-medium text-slate-600 hover:text-indigo-700 dark:text-slate-300 dark:hover:text-indigo-400"
              >
                Dashboard
              </button>
              <div ref={menu} className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
                >
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-indigo-100 text-xs text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
                    {user.profileImage && !imgError ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      initials(avatarLabel)
                    )}
                  </span>
                  <span className="hidden max-w-28 truncate sm:block">{displayName}</span>
                  <MoreVertical className="h-4 w-4" />
                </button>
                {open ? (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    {item("My Profile", UserRound, () => profile("Profile"))}
                    {item("Account Settings", Settings, () => profile("Settings"))}
                    {item("Developer Details", Code2, () => profile("Developer"))}
                    {item("Appearance", Palette, () => profile("Appearance"))}
                    {item("Help & Support", CircleHelp, help)}
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    {item("Logout", LogOut, logout, true)}
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPage("login")}
                className="text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setPage("signup")}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
