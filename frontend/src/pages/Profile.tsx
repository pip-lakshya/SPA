import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Camera,
  Code2,
  Github,
  Linkedin,
  Loader2,
  Mail,
  Monitor,
  Moon,
  Palette,
  Save,
  Settings,
  Sun,
  Trash2,
  UserRound,
  X
} from "lucide-react"
import type { Page } from "../app/App"
import Navbar from "../components/Navbar"
import { ACADEMIC_CATALOG } from "../data/academicCatalog"
import { useToast } from "../context/ToastContext"
import { useUser } from "../context/UserContext"
import {
  removeAvatar,
  updateProfile,
  updateSettings,
  uploadAvatar,
  type StoredUser
} from "../lib/profileApi"
import type { ThemePreference } from "../lib/theme"

type Props = {
  setPage: React.Dispatch<React.SetStateAction<Page>>
}

type TabId = "Profile" | "Settings" | "Appearance" | "Developer"

const TABS: { id: TabId; label: string; icon: typeof UserRound }[] = [
  { id: "Profile", label: "My Profile", icon: UserRound },
  { id: "Settings", label: "Account Settings", icon: Settings },
  { id: "Appearance", label: "Appearance", icon: Palette },
  { id: "Developer", label: "Developer Details", icon: Code2 }
]

const DEPARTMENTS = Object.keys(ACADEMIC_CATALOG)
const SEMESTERS = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Sem 6", "Sem 7", "Sem 8"]
const LANGUAGES = ["English", "Hindi"]

const initials = (value: string) =>
  value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

const compressImage = (file: File, maxSize = 800): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img
        const scale = Math.min(1, maxSize / Math.max(width, height))
        width = Math.round(width * scale)
        height = Math.round(height * scale)
        canvas.width = width
        canvas.height = height
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 ${className}`} />
}

function Toggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-800">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</p>
        {description ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-5" : "left-0.5"}`}
        />
      </button>
    </label>
  )
}

export default function Profile({ setPage }: Props) {
  const { user, loading, setUserLocal, theme, setTheme } = useUser()
  const { showToast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = localStorage.getItem("profileTab") as TabId | null
    return TABS.some((t) => t.id === saved) ? (saved as TabId) : "Profile"
  })

  const [profileForm, setProfileForm] = useState<Partial<StoredUser>>({})
  const [settingsForm, setSettingsForm] = useState<{
    privacySettings: NonNullable<StoredUser["privacySettings"]>
    notificationSettings: NonNullable<StoredUser["notificationSettings"]>
    themePreference: ThemePreference
  }>({
    privacySettings: {},
    notificationSettings: {},
    themePreference: "system"
  })

  const [profileDirty, setProfileDirty] = useState(false)
  const [settingsDirty, setSettingsDirty] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) setPage("login")
  }, [setPage])

  useEffect(() => {
    if (loading) return
    setProfileForm({
      name: user.name || "",
      phone: user.phone || "",
      dob: user.dob || "",
      gender: user.gender || "",
      college: user.college || "",
      university: user.university || "",
      country: user.country || "",
      state: user.state || "",
      city: user.city || "",
      bio: user.bio || "",
      course: user.course || "",
      department: user.department || "",
      branch: user.branch || "",
      currentYear: user.currentYear || "",
      currentSemester: user.currentSemester || "",
      enrollmentNumber: user.enrollmentNumber || "",
      rollNumber: user.rollNumber || "",
      expectedGraduationYear: user.expectedGraduationYear || ""
    })
    setSettingsForm({
      privacySettings: {
        showProfile: user.privacySettings?.showProfile ?? true,
        showOnLeaderboard: user.privacySettings?.showOnLeaderboard ?? true,
        showCgpa: user.privacySettings?.showCgpa ?? true,
        showEmail: user.privacySettings?.showEmail ?? false,
        allowComparison: user.privacySettings?.allowComparison ?? true
      },
      notificationSettings: {
        email: user.notificationSettings?.email ?? true,
        leaderboard: user.notificationSettings?.leaderboard ?? true,
        academicAlerts: user.notificationSettings?.academicAlerts ?? true,
        importSuccess: user.notificationSettings?.importSuccess ?? true,
        autoSave: user.notificationSettings?.autoSave ?? true,
        language: user.notificationSettings?.language || "English",
        defaultSemester: user.notificationSettings?.defaultSemester || "",
        defaultDepartment: user.notificationSettings?.defaultDepartment || "",
        defaultBranch: user.notificationSettings?.defaultBranch || ""
      },
      themePreference: (user.themePreference as ThemePreference) || theme || "system"
    })
    setProfileDirty(false)
    setSettingsDirty(false)
  }, [user, loading, theme])

  const switchTab = useCallback(
    (tab: TabId) => {
      if (profileDirty || settingsDirty) {
        const leave = window.confirm("You have unsaved changes. Leave without saving?")
        if (!leave) return
      }
      setActiveTab(tab)
      localStorage.setItem("profileTab", tab)
    },
    [profileDirty, settingsDirty]
  )

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (profileDirty || settingsDirty) e.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [profileDirty, settingsDirty])

  const branchOptions = useMemo(() => {
    const dept = settingsForm.notificationSettings.defaultDepartment || profileForm.department || ""
    return dept && ACADEMIC_CATALOG[dept] ? ACADEMIC_CATALOG[dept].branches : []
  }, [settingsForm.notificationSettings.defaultDepartment, profileForm.department])

  const updateProfileField = (key: keyof StoredUser, value: string) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }))
    setProfileDirty(true)
  }

  const saveProfile = async () => {
    if (!profileForm.name?.trim()) {
      showToast("error", "Name is required")
      return
    }
    try {
      setSavingProfile(true)
      const data = await updateProfile(profileForm)
      setUserLocal(data.user)
      setProfileDirty(false)
      showToast("success", "Profile saved successfully")
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSavingSettings(true)
      const data = await updateSettings({
        privacySettings: settingsForm.privacySettings,
        notificationSettings: settingsForm.notificationSettings,
        themePreference: settingsForm.themePreference
      })
      setUserLocal(data.user)
      if (settingsForm.themePreference !== theme) {
        await setTheme(settingsForm.themePreference, false)
      }
      setSettingsDirty(false)
      showToast("success", "Settings saved successfully")
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setSavingSettings(false)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("error", "Please select an image file")
      return
    }
    const previousAvatar = user.profileImage || ""
    try {
      setUploadingAvatar(true)
      setUploadProgress(20)
      const compressed = await compressImage(file)
      setUploadProgress(60)
      setUserLocal({ ...user, profileImage: compressed })
      setUploadProgress(80)
      const data = await uploadAvatar(compressed)
      setUserLocal(data.user)
      setUploadProgress(100)
      showToast("success", "Profile photo updated")
    } catch (err) {
      setUserLocal({ ...user, profileImage: previousAvatar })
      showToast("error", err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setUploadingAvatar(false)
      setUploadProgress(0)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user.profileImage) return
    try {
      setUploadingAvatar(true)
      setUserLocal({ ...user, profileImage: "" })
      const data = await removeAvatar()
      setUserLocal(data.user)
      showToast("success", "Profile photo removed")
    } catch (err) {
      setUserLocal(user)
      showToast("error", err instanceof Error ? err.message : "Failed to remove photo")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleThemeChange = async (next: ThemePreference) => {
    await setTheme(next)
    setSettingsForm((prev) => ({ ...prev, themePreference: next }))
    showToast("success", `Theme set to ${next}`)
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-500"
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile Photo</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload a photo to personalize your account.</p>
        <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initials(user.name || user.email || "User")
              )}
            </div>
            {uploadingAvatar ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleAvatarUpload(file)
              }}
            />
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" />
              {uploadingAvatar ? "Uploading..." : "Upload Photo"}
            </button>
            {user.profileImage ? (
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={() => void handleRemoveAvatar()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            ) : null}
          </div>
        </div>
        {uploadingAvatar && uploadProgress > 0 ? (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Personal Information</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              className={inputClass}
              value={profileForm.name || ""}
              onChange={(e) => updateProfileField("name", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={`${inputClass} bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400`} value={user.email || ""} readOnly />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              value={profileForm.phone || ""}
              onChange={(e) => updateProfileField("phone", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Date of Birth</label>
            <input
              type="date"
              className={inputClass}
              value={profileForm.dob || ""}
              onChange={(e) => updateProfileField("dob", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select
              className={inputClass}
              value={profileForm.gender || ""}
              onChange={(e) => updateProfileField("gender", e.target.value)}
            >
              <option value="" className="dark:bg-slate-800 dark:text-slate-100">Select</option>
              <option value="Male" className="dark:bg-slate-800 dark:text-slate-100">Male</option>
              <option value="Female" className="dark:bg-slate-800 dark:text-slate-100">Female</option>
              <option value="Other" className="dark:bg-slate-800 dark:text-slate-100">Other</option>
              <option value="Prefer not to say" className="dark:bg-slate-800 dark:text-slate-100">Prefer not to say</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Bio</label>
            <textarea
              rows={3}
              maxLength={500}
              className={inputClass}
              value={profileForm.bio || ""}
              onChange={(e) => updateProfileField("bio", e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Location & Institution</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(["college", "university", "country", "state", "city"] as const).map((field) => (
            <div key={field}>
              <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input
                className={inputClass}
                value={profileForm[field] || ""}
                onChange={(e) => updateProfileField(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Academic Details</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Department</label>
            <select
              className={inputClass}
              value={profileForm.department || ""}
              onChange={(e) => updateProfileField("department", e.target.value)}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Branch</label>
            <select
              className={inputClass}
              value={profileForm.branch || ""}
              onChange={(e) => updateProfileField("branch", e.target.value)}
            >
              <option value="">Select branch</option>
              {(profileForm.department && ACADEMIC_CATALOG[profileForm.department]
                ? ACADEMIC_CATALOG[profileForm.department].branches
                : []
              ).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          {(
            [
              ["course", "Course"],
              ["currentYear", "Current Year"],
              ["currentSemester", "Current Semester"],
              ["enrollmentNumber", "Enrollment Number"],
              ["rollNumber", "Roll Number"],
              ["expectedGraduationYear", "Expected Graduation Year"]
            ] as const
          ).map(([field, label]) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <input
                className={inputClass}
                value={profileForm[field] || ""}
                onChange={(e) => updateProfileField(field, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!profileDirty || savingProfile}
          onClick={() => void saveProfile()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {savingProfile ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Notification Preferences</h2>
        <div className="mt-4 space-y-3">
          <Toggle
            label="Email Notifications"
            description="Receive important updates via email."
            checked={settingsForm.notificationSettings.email ?? true}
            onChange={(v) => {
              setSettingsForm((p) => ({ ...p, notificationSettings: { ...p.notificationSettings, email: v } }))
              setSettingsDirty(true)
            }}
          />
          <Toggle
            label="Leaderboard Updates"
            description="Get notified when your rank changes."
            checked={settingsForm.notificationSettings.leaderboard ?? true}
            onChange={(v) => {
              setSettingsForm((p) => ({ ...p, notificationSettings: { ...p.notificationSettings, leaderboard: v } }))
              setSettingsDirty(true)
            }}
          />
          <Toggle
            label="Academic Alerts"
            description="Alerts for performance changes and risk signals."
            checked={settingsForm.notificationSettings.academicAlerts ?? true}
            onChange={(v) => {
              setSettingsForm((p) => ({
                ...p,
                notificationSettings: { ...p.notificationSettings, academicAlerts: v }
              }))
              setSettingsDirty(true)
            }}
          />
          <Toggle
            label="Import Complete Notifications"
            description="Notify when data imports finish processing."
            checked={settingsForm.notificationSettings.importSuccess ?? true}
            onChange={(v) => {
              setSettingsForm((p) => ({
                ...p,
                notificationSettings: { ...p.notificationSettings, importSuccess: v }
              }))
              setSettingsDirty(true)
            }}
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Privacy</h2>
        <div className="mt-4 space-y-3">
          <Toggle
            label="Public Profile"
            description="Allow others to view your profile."
            checked={settingsForm.privacySettings.showProfile ?? true}
            onChange={(v) => {
              setSettingsForm((p) => ({ ...p, privacySettings: { ...p.privacySettings, showProfile: v } }))
              setSettingsDirty(true)
            }}
          />
          <Toggle
            label="Show on Leaderboard"
            description="Include your scores in leaderboard rankings."
            checked={settingsForm.privacySettings.showOnLeaderboard ?? true}
            onChange={(v) => {
              setSettingsForm((p) => ({
                ...p,
                privacySettings: { ...p.privacySettings, showOnLeaderboard: v }
              }))
              setSettingsDirty(true)
            }}
          />
          <Toggle
            label="Allow Profile Comparison"
            description="Let peers compare performance with you."
            checked={settingsForm.privacySettings.allowComparison ?? true}
            onChange={(v) => {
              setSettingsForm((p) => ({
                ...p,
                privacySettings: { ...p.privacySettings, allowComparison: v }
              }))
              setSettingsDirty(true)
            }}
          />
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Application Preferences</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Default Department</label>
            <select
              className={inputClass}
              value={settingsForm.notificationSettings.defaultDepartment || ""}
              onChange={(e) => {
                setSettingsForm((p) => ({
                  ...p,
                  notificationSettings: {
                    ...p.notificationSettings,
                    defaultDepartment: e.target.value,
                    defaultBranch: ""
                  }
                }))
                setSettingsDirty(true)
              }}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Default Branch</label>
            <select
              className={inputClass}
              value={settingsForm.notificationSettings.defaultBranch || ""}
              onChange={(e) => {
                setSettingsForm((p) => ({
                  ...p,
                  notificationSettings: { ...p.notificationSettings, defaultBranch: e.target.value }
                }))
                setSettingsDirty(true)
              }}
            >
              <option value="">Select branch</option>
              {branchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Default Semester</label>
            <select
              className={inputClass}
              value={settingsForm.notificationSettings.defaultSemester || ""}
              onChange={(e) => {
                setSettingsForm((p) => ({
                  ...p,
                  notificationSettings: { ...p.notificationSettings, defaultSemester: e.target.value }
                }))
                setSettingsDirty(true)
              }}
            >
              <option value="">Select semester</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Language</label>
            <select
              className={inputClass}
              value={settingsForm.notificationSettings.language || "English"}
              onChange={(e) => {
                setSettingsForm((p) => ({
                  ...p,
                  notificationSettings: { ...p.notificationSettings, language: e.target.value }
                }))
                setSettingsDirty(true)
              }}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Theme Preference</label>
            <select
              className={inputClass}
              value={settingsForm.themePreference}
              onChange={(e) => {
                const next = e.target.value as ThemePreference
                setSettingsForm((p) => ({ ...p, themePreference: next }))
                setSettingsDirty(true)
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex items-end">
            <Toggle
              label="Auto-save imports"
              description="Automatically save imported academic data."
              checked={settingsForm.notificationSettings.autoSave ?? true}
              onChange={(v) => {
                setSettingsForm((p) => ({
                  ...p,
                  notificationSettings: { ...p.notificationSettings, autoSave: v }
                }))
                setSettingsDirty(true)
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!settingsDirty || savingSettings}
          onClick={() => void saveSettings()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {savingSettings ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  )

  const themeOptions: { id: ThemePreference; label: string; icon: typeof Sun; description: string }[] = [
    { id: "light", label: "Light", icon: Sun, description: "Bright theme for well-lit environments." },
    { id: "dark", label: "Dark", icon: Moon, description: "Reduced glare for low-light use." },
    { id: "system", label: "System", icon: Monitor, description: "Match your device appearance settings." }
  ]

  const renderAppearanceTab = () => (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Theme</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose how Student Performance Analyzer looks for you.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {themeOptions.map(({ id, label, icon: Icon, description }) => {
          const active = theme === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => void handleThemeChange(id)}
              className={`rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-950/60 dark:ring-indigo-500/30"
                  : "border-slate-200 bg-slate-50/60 hover:border-indigo-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              }`}
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                  active ? "bg-indigo-600 text-white" : "bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
              {active ? (
                <span className="mt-3 inline-block rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                  Active
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderDeveloperTab = () => (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-2xl font-bold text-white shadow-md">
          LB
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Developer</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Lakshya Bhandari</h2>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">Full Stack Developer</p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Built as an academic analytics platform for students.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          ["Project", "Student Performance Analyzer"],
          ["Institute", "Swami Keshvanand Institute of Technology, Management & Gramothan"],
          ["Department", "Computer Science"],
          ["Specialization", "Data Science"],
          ["Project Version", "1.0.0"],
          ["Build Version", "1.0.0-prod"],
          ["Last Deployment", new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })]
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-700/60 dark:bg-slate-800/60">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-indigo-400">{label}</p>
            <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-indigo-400">Technology Stack</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["React", "Node.js", "Express", "MongoDB", "JWT", "Google OAuth", "OCR", "Chart.js"].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="https://github.com/pip-lakshya"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/lakshya-bhandari-abb174334"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Linkedin className="h-4 w-4" />
          LinkedIn
        </a>
        <a
          href="mailto:bhandarilakshya14@gmail.com"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <Mail className="h-4 w-4" />
          Email
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Navbar setPage={setPage} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Account</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">Profile & Settings</h1>
          </div>
          <button
            type="button"
            onClick={() => setPage("dashboard")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <nav className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition last:mb-0 ${
                  activeTab === id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          <div>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <>
                {activeTab === "Profile" && renderProfileTab()}
                {activeTab === "Settings" && renderSettingsTab()}
                {activeTab === "Appearance" && renderAppearanceTab()}
                {activeTab === "Developer" && renderDeveloperTab()}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
