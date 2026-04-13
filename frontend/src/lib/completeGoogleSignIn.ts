import type { Dispatch, SetStateAction } from "react"
import type { Page } from "../app/App"
import { API_BASE_URL } from "../config/env"

function googleAuthUrl() {
  const path = "/api/auth/google"
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

export async function completeGoogleSignIn(
  credential: string,
  setPage: Dispatch<SetStateAction<Page>>
) {
  const res = await fetch(googleAuthUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential })
  })

  const raw = await res.text()
  let data: {
    message?: string
    token?: string
    user?: { _id: string; name: string; email: string }
  } = {}

  if (raw) {
    try {
      data = JSON.parse(raw) as typeof data
    } catch {
      alert(
        res.ok
          ? "Invalid response from server"
          : `Could not reach the API (${res.status}). Is the backend running on port 5000?`
      )
      return
    }
  }

  if (data.message === "Login successful" && data.token && data.user) {
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data.user))
    setPage("dashboard")
    return
  }

  alert(data.message || "Google sign-in failed")
}
