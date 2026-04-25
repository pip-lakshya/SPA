import { useEffect, useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  ChartColumn,
  Gauge,
  Layers3,
  Sparkles
} from "lucide-react"
import type { Page } from "../app/App"
import Navbar from "../components/Navbar"
import AcademicForm from "../components/AcademicForm"
import Leaderboard from "../components/Leaderboard"
import { domainKeyToLabelMap } from "../data/academicCatalog"
import type { AcademicSnapshot, PeerClusterStudent } from "../types/academic"
import { apiUrl } from "../lib/apiUrl"

type Props = {
  setPage: React.Dispatch<React.SetStateAction<Page>>
}

const heatmapColors = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-lime-100 text-lime-700",
  "bg-emerald-100 text-emerald-700"
]

const getStrengthColor = (mark: number) => {
  if (mark < 45) return heatmapColors[0]
  if (mark < 65) return heatmapColors[1]
  if (mark < 80) return heatmapColors[2]
  return heatmapColors[3]
}

const getPerformanceCluster = (overallAverage: number, cgpa: number) => {
  if (overallAverage >= 85 && cgpa >= 8.5) {
    return {
      label: "High Achievers Cluster",
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
      description: "Students in this band are consistently scoring high and are strong candidates for advanced opportunities."
    }
  }

  if (overallAverage >= 70 && cgpa >= 7) {
    return {
      label: "Consistent Performers Cluster",
      tone: "text-blue-700 bg-blue-50 border-blue-200",
      description: "This cluster represents stable performers who are maintaining good results across semesters."
    }
  }

  if (overallAverage >= 55 && cgpa >= 6) {
    return {
      label: "Growth Cluster",
      tone: "text-amber-700 bg-amber-50 border-amber-200",
      description: "These students have a workable foundation and can move up quickly with targeted improvement."
    }
  }

  return {
    label: "Support Cluster",
    tone: "text-rose-700 bg-rose-50 border-rose-200",
    description: "This cluster needs close academic attention, stronger revision habits, and fast intervention."
  }
}

const getRiskClassification = (
  overallAverage: number,
  cgpa: number,
  weakestDomainScore?: number
) => {
  if (overallAverage >= 75 && cgpa >= 7.5 && (weakestDomainScore ?? 100) >= 60) {
    return {
      label: "Low Risk",
      tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
      description: "Your academic profile looks stable right now."
    }
  }

  if (overallAverage >= 55 && cgpa >= 6 && (weakestDomainScore ?? 100) >= 45) {
    return {
      label: "Moderate Risk",
      tone: "text-amber-700 bg-amber-50 border-amber-200",
      description: "A few weak areas are visible; focused revision can prevent slippage."
    }
  }

  return {
    label: "High Risk",
    tone: "text-rose-700 bg-rose-50 border-rose-200",
    description: "Your current profile suggests immediate support is needed in low-scoring areas."
  }
}

export default function Dashboard({ setPage }: Props) {
  const [snapshot, setSnapshot] = useState<AcademicSnapshot | null>(null)
  const [similarStudents, setSimilarStudents] = useState<PeerClusterStudent[]>([])
  const [clusterLoading, setClusterLoading] = useState(true)
  const [clusterError, setClusterError] = useState("")
  const [selectedHeatmapIndex, setSelectedHeatmapIndex] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setPage("login")
    }
  }, [setPage])

  useEffect(() => {
    const fetchPeerCluster = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setClusterLoading(false)
        return
      }

      try {
        setClusterError("")
        const res = await fetch(apiUrl("/api/data/cluster/me"), {
          headers: {
            Authorization: token
          }
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Failed to load peer cluster")
        }

        setSimilarStudents(
          Array.isArray(data.data?.similarStudents) ? data.data.similarStudents : []
        )
      } catch (err) {
        setClusterError(
          err instanceof Error ? err.message : "Failed to load peer cluster"
        )
      } finally {
        setClusterLoading(false)
      }
    }

    fetchPeerCluster()
  }, [snapshot?.data?.overallAverage, snapshot?.data?.cgpa])

  const academicData = snapshot?.data || null
  const analytics = snapshot?.analytics
  const semesterAverages = analytics?.semesterAverages || []
  const domainAverages = analytics?.domainAverages || academicData?.domainAverages || {}

  const domainEntries = useMemo(
    () =>
      Object.entries(domainKeyToLabelMap)
        .map(([key, label]) => ({
          key,
          label,
          value: Number(domainAverages?.[key as keyof typeof domainAverages] || 0)
        }))
        .filter((entry) => entry.value > 0),
    [domainAverages]
  )

  const strongestDomain = useMemo(
    () => [...domainEntries].sort((a, b) => b.value - a.value)[0],
    [domainEntries]
  )

  const weakestDomain = useMemo(
    () =>
      domainEntries.length > 1
        ? [...domainEntries].sort((a, b) => a.value - b.value)[0]
        : undefined,
    [domainEntries]
  )

  const allSubjects = useMemo(
    () =>
      academicData?.semesters?.flatMap((semester) =>
        (semester.subjects || []).map((subject) => ({
          semester: semester.semester || "Semester",
          name: subject.name || "Subject",
          marks: Number(subject.marks || 0),
          domain: subject.domain || "General"
        }))
      ) || [],
    [academicData?.semesters]
  )

  useEffect(() => {
    setSelectedHeatmapIndex(0)
  }, [allSubjects.length])

  const semesterTrend = useMemo(
    () =>
      semesterAverages.length > 1
        ? semesterAverages[semesterAverages.length - 1].average - semesterAverages[0].average
        : 0,
    [semesterAverages]
  )

  const currentCgpa = typeof academicData?.cgpa === "number" ? academicData.cgpa : 0
  const currentAverage =
    typeof academicData?.overallAverage === "number"
      ? academicData.overallAverage
      : typeof analytics?.overallAverage === "number"
        ? analytics.overallAverage
        : 0

  const performanceCluster = useMemo(
    () => getPerformanceCluster(currentAverage, currentCgpa),
    [currentAverage, currentCgpa]
  )

  const riskClassification = useMemo(
    () =>
      getRiskClassification(
        currentAverage,
        currentCgpa,
        weakestDomain?.value
      ),
    [currentAverage, currentCgpa, weakestDomain]
  )

  const selectedHeatmapSubject = allSubjects[selectedHeatmapIndex] || allSubjects[0]

  return (
    <div className="bg-slate-100">
      <Navbar setPage={setPage} />

      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <section className="overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-xl">
            <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.5fr_1fr] lg:px-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
                  Analytics Dashboard
                </p>
                <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Student Performance Analyzer
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Store department-wise academic records, monitor semester trends,
                  compare domain strength, and benchmark yourself on the leaderboard.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-300">Current focus</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {strongestDomain ? strongestDomain.label : "Save academic data to unlock insights"}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {semesterAverages.length
                    ? `Your latest semester trend is ${semesterTrend >= 0 ? "improving" : "slipping"} by ${Math.abs(semesterTrend).toFixed(2)} points.`
                    : "Add semester records to generate performance trends, domain analysis, and recommendations."}
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">CGPA</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {typeof academicData?.cgpa === "number" ? academicData.cgpa.toFixed(2) : "--"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Overall Average</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {typeof academicData?.overallAverage === "number"
                      ? academicData.overallAverage.toFixed(2)
                      : typeof analytics?.overallAverage === "number"
                        ? analytics.overallAverage.toFixed(2)
                        : "--"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Strongest Domain</p>
                  <p className="text-lg font-bold text-slate-900">
                    {strongestDomain?.label || "Not available yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
                  <ChartColumn className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Subjects Tracked</p>
                  <p className="text-2xl font-bold text-slate-900">{allSubjects.length || "--"}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_1.25fr_0.9fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Semester Performance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Semester averages are calculated from marks entered for each semester.
              </p>
              <div className="mt-6 h-72">
                {semesterAverages.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={semesterAverages}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="semester" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="average" stroke="#4f46e5" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    Save academic data to generate semester analytics.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Domain Performance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Domain averages are grouped from all saved subjects.
              </p>
              <div className="mt-6 h-72">
                {domainEntries.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainEntries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" angle={-20} textAnchor="end" height={70} interval={0} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                        {domainEntries.map((entry) => (
                          <Cell key={entry.key} fill={entry.key === strongestDomain?.key ? "#0f766e" : "#6366f1"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    Domain analytics will appear here after your first save.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Insights</h2>
                  <p className="text-sm text-slate-500">Calculated from your saved records</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Strongest area</p>
                  <p>{strongestDomain ? `${strongestDomain.label} is currently your top-performing domain at ${strongestDomain.value.toFixed(2)} average.` : "Add data to detect your strongest area."}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Needs attention</p>
                  <p>
                    {weakestDomain
                      ? `${weakestDomain.label} is your weakest active domain at ${weakestDomain.value.toFixed(2)} average.`
                      : domainEntries.length === 1
                        ? "Only one active domain is available right now, so weakest-domain guidance will appear after you add more varied subjects."
                        : "Weak-domain recommendations will appear once domain data exists."}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Trend summary</p>
                  <p>{semesterAverages.length > 1 ? `From ${semesterAverages[0].semester} to ${semesterAverages[semesterAverages.length - 1].semester}, your average has ${semesterTrend >= 0 ? "increased" : "decreased"} by ${Math.abs(semesterTrend).toFixed(2)} points.` : "Semester trend analysis needs data from more than one semester."}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Performance Clustering</h2>
                  <p className="text-sm text-slate-500">Rule-based grouping for future ML clustering</p>
                </div>
              </div>

              <div className={`mt-6 rounded-3xl border p-5 ${performanceCluster.tone}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">Current Cluster</p>
                <p className="mt-2 text-2xl font-bold">{performanceCluster.label}</p>
                <p className="mt-3 text-sm leading-6">{performanceCluster.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.15em] opacity-80">Overall Average</p>
                    <p className="mt-1 text-lg font-semibold">{currentAverage.toFixed(2)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.15em] opacity-80">CGPA</p>
                    <p className="mt-1 text-lg font-semibold">{currentCgpa.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] opacity-80">
                    Similar Students By Average
                  </p>

                  {clusterLoading ? (
                    <div className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-sm">
                      Loading similar students...
                    </div>
                  ) : clusterError ? (
                    <div className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-sm">
                      {clusterError}
                    </div>
                  ) : similarStudents.length ? (
                    <div className="mt-3 space-y-3">
                      {similarStudents.map((student) => (
                        <div
                          key={student.userId}
                          className="rounded-2xl bg-white/70 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">{student.name}</p>
                              <p className="mt-1 text-xs opacity-80">{student.email}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.12em] opacity-80">
                                {student.department} • {student.branch}
                              </p>
                            </div>
                            <div className="text-right text-sm font-semibold">
                              <p>Avg {student.overallAverage.toFixed(2)}</p>
                              <p className="mt-1 text-xs font-medium opacity-80">
                                Gap {typeof student.averageGap === "number" ? student.averageGap.toFixed(2) : "0.00"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-sm">
                      Similar-performance students will appear here once more academic profiles are available.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Risk Classification</h2>
                  <p className="text-sm text-slate-500">Rule-based risk signal before ML scoring</p>
                </div>
              </div>

              <div className={`mt-6 rounded-3xl border p-5 ${riskClassification.tone}`}>
                <p className="text-sm font-semibold uppercase tracking-[0.2em]">Current Risk</p>
                <p className="mt-2 text-2xl font-bold">{riskClassification.label}</p>
                <p className="mt-3 text-sm leading-6">{riskClassification.description}</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm">
                    Weakest domain:
                    {" "}
                    <span className="font-semibold">
                      {weakestDomain ? `${weakestDomain.label} (${weakestDomain.value.toFixed(2)})` : "Not enough domain data yet"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm">
                    Semester trend:
                    {" "}
                    <span className="font-semibold">
                      {semesterAverages.length > 1
                        ? `${semesterTrend >= 0 ? "Improving" : "Declining"} by ${Math.abs(semesterTrend).toFixed(2)}`
                        : "Need at least 2 semesters"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Subject Strength Heatmap</h2>
            <p className="mt-1 text-sm text-slate-500">
              Compact subject blocks give you the full overview at once. Hover on desktop
              or tap on mobile to inspect the selected subject in detail.
            </p>
            {allSubjects.length ? (
              <div className="mt-6 space-y-5">
                {selectedHeatmapSubject ? (
                  <div
                    className={`rounded-3xl border p-5 shadow-sm ${getStrengthColor(
                      selectedHeatmapSubject.marks
                    )}`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] opacity-80">
                          {selectedHeatmapSubject.semester}
                        </p>
                        <p className="mt-2 text-lg font-bold sm:text-xl">
                          {selectedHeatmapSubject.name}
                        </p>
                        <p className="mt-1 text-sm opacity-90">
                          {selectedHeatmapSubject.domain}
                        </p>
                      </div>
                      <div className="inline-flex w-fit rounded-2xl bg-white/70 px-4 py-3 text-right">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] opacity-70">
                            Marks
                          </p>
                          <p className="mt-1 text-2xl font-bold">
                            {selectedHeatmapSubject.marks}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                  {allSubjects.map((subject, index) => {
                    const isSelected = index === selectedHeatmapIndex

                    return (
                      <button
                        key={`${subject.semester}-${subject.name}-${index}`}
                        type="button"
                        title={`${subject.name} • ${subject.semester} • ${subject.domain} • ${subject.marks}`}
                        onClick={() => setSelectedHeatmapIndex(index)}
                        onMouseEnter={() => setSelectedHeatmapIndex(index)}
                        className={`group relative aspect-square overflow-hidden rounded-2xl border p-2 text-left transition duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-slate-900/20 ${
                          isSelected
                            ? "border-slate-900 ring-2 ring-slate-900/15"
                            : "border-white/60"
                        } ${getStrengthColor(subject.marks)}`}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-75">
                            {subject.semester.replace("Semester", "Sem")}
                          </p>
                          <div>
                            <p className="line-clamp-2 text-xs font-semibold leading-4 sm:text-sm">
                              {subject.name}
                            </p>
                            <p className="mt-1 text-lg font-bold leading-none">
                              {subject.marks}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                Subject heatmap will appear after you save semester records.
              </div>
            )}
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">ML Insights</h2>
                  <p className="text-sm text-slate-500">Future-model ready placeholder</p>
                </div>
              </div>
              <div className="mt-6 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
                  AI Insights Coming Soon
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  The saved structure is now ready for trend prediction, weak-domain detection,
                  and subject recommendation models in a future iteration.
                </p>
              </div>
            </section>
            <Leaderboard title="Overall Leaderboard" scope="overall" />
            <Leaderboard title="Branch Leaderboard" scope="branch" />
          </section>

          <section id="academic-input">
            <AcademicForm onDataChange={setSnapshot} />
          </section>
        </div>
      </main>

    </div>
  )
}
