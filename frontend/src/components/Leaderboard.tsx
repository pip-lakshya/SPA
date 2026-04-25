import { useEffect, useMemo, useState } from "react"
import { Trophy } from "lucide-react"
import type { LeaderboardEntry, LeaderboardResponse } from "../types/academic"
import { apiUrl } from "../lib/apiUrl"

type Props = {
  title?: string
  scope?: "overall" | "branch"
}

const toSafeNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0

export default function Leaderboard({
  title,
  scope = "overall"
}: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [meta, setMeta] = useState<LeaderboardResponse["meta"]>({})

  const currentUserEmail = (() => {
    try {
      const user = localStorage.getItem("user")
      return user ? JSON.parse(user).email : ""
    } catch {
      return ""
    }
  })()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Please log in to view the leaderboard")
        setLoading(false)
        return
      }

      try {
        setError("")
        const res = await fetch(apiUrl(`/api/data/leaderboard?scope=${scope}`), {
          headers: {
            Authorization: token
          }
        })
        const data: LeaderboardResponse = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Failed to load leaderboard")
        }

        setLeaderboard(Array.isArray(data.data) ? data.data : [])
        setMeta(data.meta || {})
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leaderboard")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [scope])

  const heading = useMemo(() => {
    if (title) {
      return title
    }

    return scope === "branch" ? "Branch Leaderboard" : "Overall Leaderboard"
  }, [scope, title])

  const description =
    scope === "branch"
      ? meta?.branch
        ? `${meta.branch} students in ${meta.course || "their course"}, ranked by overall average first and CGPA second.`
        : "Students from your branch are ranked by overall average first and CGPA second."
      : "Ranked by overall average first and CGPA second."

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{heading}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Loading leaderboard...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : leaderboard.length ? (
          leaderboard.map((entry) => {
            const isCurrentUser = currentUserEmail && currentUserEmail === entry.email
            const cgpa = toSafeNumber(entry.cgpa)
            const overallAverage = toSafeNumber(entry.overallAverage)

            return (
              <div
                key={`${entry.userId}-${entry.rank}-${scope}`}
                className={`rounded-2xl border px-4 py-4 ${
                  isCurrentUser
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      #{entry.rank} {entry.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{entry.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-500">
                      {entry.department || "Department not set"} • {entry.course || "Course not set"} • {entry.branch || "Branch not set"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
                      Avg {overallAverage.toFixed(2)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      CGPA {cgpa.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            {scope === "branch"
              ? "No branch-specific leaderboard data yet. Save academic records for students in the same branch to populate rankings."
              : "No leaderboard data yet. Save academic records to populate rankings."}
          </div>
        )}
      </div>
    </section>
  )
}
