import { apiUrl } from "./apiUrl"
import type { ThemePreference } from "./theme"

export type StoredUser = {
  _id?: string
  name?: string
  email?: string
  profileImage?: string
  themePreference?: ThemePreference
  phone?: string
  dob?: string
  gender?: string
  college?: string
  university?: string
  country?: string
  state?: string
  city?: string
  bio?: string
  course?: string
  department?: string
  branch?: string
  currentYear?: string
  currentSemester?: string
  enrollmentNumber?: string
  rollNumber?: string
  expectedGraduationYear?: string
  authMethod?: string
  privacySettings?: {
    showProfile?: boolean
    showOnLeaderboard?: boolean
    showCgpa?: boolean
    showEmail?: boolean
    allowComparison?: boolean
  }
  notificationSettings?: {
    email?: boolean
    leaderboard?: boolean
    academicAlerts?: boolean
    importSuccess?: boolean
    autoSave?: boolean
    language?: string
    defaultSemester?: string
    defaultDepartment?: string
    defaultBranch?: string
  }
}

const authHeaders = () => {
  const token = localStorage.getItem("token")
  if (!token) throw new Error("Not authenticated")
  return { Authorization: token, "Content-Type": "application/json" }
}

async function parseJson(res: Response) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(res.ok ? "Invalid server response" : `Server error (${res.status})`)
  }
}

export async function fetchProfile() {
  const res = await fetch(apiUrl("/api/profile"), { headers: authHeaders() })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.message || "Failed to load profile")
  return data as { user: StoredUser; academic: unknown }
}

export async function updateProfile(body: Partial<StoredUser>) {
  const res = await fetch(apiUrl("/api/profile"), { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.message || "Failed to update profile")
  return data as { message: string; user: StoredUser }
}

export async function updateSettings(body: {
  privacySettings?: StoredUser["privacySettings"]
  notificationSettings?: StoredUser["notificationSettings"]
  themePreference?: ThemePreference
}) {
  const res = await fetch(apiUrl("/api/profile/settings"), { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.message || "Failed to save settings")
  return data as { message: string; user: StoredUser }
}

export async function updateTheme(themePreference: ThemePreference) {
  const res = await fetch(apiUrl("/api/profile/theme"), { method: "PUT", headers: authHeaders(), body: JSON.stringify({ themePreference }) })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.message || "Failed to update theme")
  return data as { message: string; themePreference: ThemePreference; user: StoredUser }
}

export async function uploadAvatar(profileImage: string) {
  const res = await fetch(apiUrl("/api/profile/avatar"), { method: "POST", headers: authHeaders(), body: JSON.stringify({ profileImage }) })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.message || "Failed to upload photo")
  return data as { message: string; user: StoredUser }
}

export async function removeAvatar() {
  const res = await fetch(apiUrl("/api/profile/avatar"), { method: "DELETE", headers: authHeaders() })
  const data = await parseJson(res)
  if (!res.ok) throw new Error(data.message || "Failed to remove photo")
  return data as { message: string; user: StoredUser }
}

export function persistUser(user: StoredUser) {
  const current = JSON.parse(localStorage.getItem("user") || "{}") as StoredUser
  const merged = { ...current, ...user }
  localStorage.setItem("user", JSON.stringify(merged))
  window.dispatchEvent(new Event("profile-updated"))
  return merged
}

export function readStoredUser(): StoredUser {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") as StoredUser
  } catch {
    return {}
  }
}
