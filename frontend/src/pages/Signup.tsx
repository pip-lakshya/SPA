import { useState, type Dispatch, type SetStateAction } from "react"
import type { Page } from "../app/App"
import { API_BASE_URL } from "../config/env"
import GoogleSignInButton from "../components/GoogleSignInButton"

type Props = {
  setPage: Dispatch<SetStateAction<Page>>
}

export default function Signup({ setPage }: Props) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      alert("Please fill all fields")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (data.message === "Signup successful") {
        alert("Account created")
        setPage("login")
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-96 rounded-2xl bg-white p-10 shadow-xl">
        <button
          type="button"
          onClick={() => setPage("home")}
          className="mb-6 text-sm text-gray-500 hover:text-gray-800"
        >
          ← Back
        </button>

        <h2 className="mb-6 text-2xl font-bold">Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="mb-4 w-full rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          onClick={handleSignup}
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-3 text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
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
          Already have account?
          <button
            type="button"
            onClick={() => setPage("login")}
            className="ml-1 cursor-pointer text-indigo-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  )
}
