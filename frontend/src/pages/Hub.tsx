import { useState } from "react"
import {
  Sparkles,
  FileSpreadsheet,
  TrendingUp,
  Copy,
  Check,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  X,
  } from "lucide-react"
import type { Page } from "../app/App"
import Navbar from "../components/Navbar"
import { useUser } from "../context/UserContext"

type Props = {
  setPage: React.Dispatch<React.SetStateAction<Page>>
}

export const AI_MARKSHEET_PROMPT = `Convert this academic marksheet into plain text.

Return ONLY plain text.
No markdown code blocks.
No explanations.

Use exactly this format:

Semester: <semester number, e.g. 3>
SGPA: <sgpa e.g. 8.5 if available>

Subject Name | Marks

Rules:
- Ignore logos, student details, roll numbers, remarks, pass/fail, course codes
- Keep only theory and practical subject rows
- Use exact subject names where readable
- Marks must be 0-100 number only
- Use | as separator`

export default function Hub({ setPage }: Props) {
  const { user } = useUser()
  const [copied, setCopied] = useState(false)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [dismissGuide, setDismissGuide] = useState(() => localStorage.getItem("hub_guide_dismissed") === "true")

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_MARKSHEET_PROMPT)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      alert("Failed to copy prompt to clipboard")
    }
  }

  const handleDismissGuide = () => {
    setDismissGuide(true)
    localStorage.setItem("hub_guide_dismissed", "true")
  }

  const handleShowGuide = () => {
    setDismissGuide(false)
    localStorage.removeItem("hub_guide_dismissed")
  }

  const displayName = user?.name ? user.name.split(" ")[0] : "Student"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/20 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 dark:text-slate-100">
      <Navbar setPage={setPage} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Welcome Banner */}
        <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-8 text-white shadow-xl dark:border-slate-800 sm:p-10">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-10 right-1/3 h-52 w-52 rounded-full bg-purple-500/20 blur-2xl" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Guide & Overview</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Welcome, {displayName}! 👋
            </h1>
            <p className="mt-2 text-sm text-indigo-100/90 leading-relaxed sm:text-base">
              Choose your destination below. You can enter and import your marksheet records or dive directly into your performance analytics and AI counseling.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setPage("form")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-900 shadow-md transition hover:bg-indigo-50 active:scale-95"
              >
                <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
                <span>Marks data</span>
              </button>
              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 active:scale-95"
              >
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                <span>Dashboard</span>
              </button>
              {dismissGuide && (
                <button
                  type="button"
                  onClick={handleShowGuide}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white underline ml-2"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Show Guide</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4-Step Quick User Guide (Interactive Onboarding) */}
        {!dismissGuide && (
          <div className="relative mb-10 rounded-[2rem] border border-indigo-200/80 bg-indigo-50/70 p-6 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/30 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Quick Start Guide — Kaise use karein?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Follow these 4 simple steps to get complete analysis and AI recommendations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissGuide}
                className="rounded-lg p-1 text-slate-400 hover:bg-indigo-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Dismiss guide"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Step 1 */}
              <div className="relative rounded-2xl border border-indigo-200/60 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    1
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300"
                    title="Copy AI Prompt"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>
                </div>
                <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                  Copy AI Prompt
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Apne marksheet se accurate marks nikalne ke liye AI prompt copy karein.
                </p>
                <button
                  type="button"
                  onClick={() => setShowPromptModal(true)}
                  className="mt-2 text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View full prompt ↗
                </button>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-indigo-200/60 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  2
                </span>
                <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                  Paste in ChatGPT / Gemini
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Apni marksheet ka photo/PDF upload karke prompt paste karein aur generated text copy karein.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-indigo-200/60 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  3
                </span>
                <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                  Upload & Submit Form
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>Marks data</strong> page par jayein, text paste karein ya file upload karein aur <strong>Save</strong> karein.
                </p>
                <button
                  type="button"
                  onClick={() => setPage("form")}
                  className="mt-2 text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Go to Form →
                </button>
              </div>

              {/* Step 4 */}
              <div className="rounded-2xl border border-indigo-200/60 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  4
                </span>
                <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-white">
                  Analytics & AI Mentor
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <strong>Dashboard</strong> me CGPA trends dekhein aur bottom-right AI mascot se advice lein.
                </p>
                <button
                  type="button"
                  onClick={() => setPage("dashboard")}
                  className="mt-2 text-[11px] font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Go to Dashboard →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Select Your Workspace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Easily switch between entering marksheet records and viewing comprehensive analytics.
          </p>
        </div>

        {/* The 2 Core Navigation Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card 1: Academic Marks data */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border-2 border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-xl transition group-hover:bg-indigo-500/20" />

            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-400">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                  Data Entry & Import
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Academic Marks data
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed sm:text-sm">
                Add and manage your semester records, enter subject marks, upload marksheets via AI prompt extraction or OCR, and save everything to your database.
              </p>

              {/* Bullet Features */}
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Manual semester & subject marks editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>AI prompt generator for ChatGPT/Gemini</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>TXT & CSV batch marksheet upload</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Instant synchronization with backend DB</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPage("form")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 active:scale-98"
              >
                <span>Open Marks data</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Dashboard */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border-2 border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-xl transition group-hover:bg-emerald-500/20" />

            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-400">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Insights & Performance
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Dashboard
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed sm:text-sm">
                Explore comprehensive charts of your academic journey: SGPA semester trends, domain performance analysis, peer comparative clusters, and leaderboards.
              </p>

              {/* Bullet Features */}
              <ul className="mt-6 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Real-time CGPA & semester trend charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Domain strength and weak subject heatmap</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Peer benchmarking & similar students cluster</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Branch & department competitive leaderboards</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-98"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* AI Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                ChatGPT / Gemini Marksheet Prompt
              </h3>
              <button
                type="button"
                onClick={() => setShowPromptModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Copy this exact prompt and send it to ChatGPT along with your marksheet photo or PDF:
            </p>

            <pre className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 whitespace-pre-wrap">
              {AI_MARKSHEET_PROMPT}
            </pre>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPromptModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Prompt"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
