import { useState, type Dispatch, type SetStateAction } from "react"
import type { Page } from "../app/App"
import { API_BASE_URL } from "../config/env"
import GoogleSignInButton from "../components/GoogleSignInButton"
import { applyTheme, type ThemePreference } from "../lib/theme"

type Props = {
  setPage: Dispatch<SetStateAction<Page>>
}

export default function Login({ setPage }: Props) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (data.message === "Login successful") {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        const themePref = data.user?.themePreference as ThemePreference | undefined
        if (themePref) {
          applyTheme(themePref)
          localStorage.setItem("theme", themePref)
        }
        window.dispatchEvent(new Event("profile-updated"))
        setPage("dashboard")
      } else {
        alert(data.message)
      }
    } catch {
      alert("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-96 rounded-2xl bg-white p-10 shadow-xl">
        <button
          type="button"
          onClick={() => setPage("home")}
          className="mb-6 text-sm text-gray-500 hover:text-gray-800"
        >
          ← Back
        </button>

        <h2 className="mb-6 text-2xl font-bold">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="mb-4 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="mb-6 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-3 text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">Or</span>
          </div>
        </div>

        <GoogleSignInButton setPage={setPage} />

        <p className="mt-6 text-center text-sm text-gray-500">
          No account?
          <button
            type="button"
            onClick={() => setPage("signup")}
            className="ml-1 cursor-pointer text-indigo-600 hover:underline"
          >
            Signup
          </button>
        </p>
      </div>
    </div>
  )
}
