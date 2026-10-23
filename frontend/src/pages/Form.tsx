import { useState } from "react"
import {
  FileSpreadsheet,
  TrendingUp,
  ArrowRight,
  ArrowLeft
} from "lucide-react"
import type { Page } from "../app/App"
import Navbar from "../components/Navbar"
import AcademicForm from "../components/AcademicForm"
import type { AcademicSnapshot } from "../types/academic"

type Props = {
  setPage: React.Dispatch<React.SetStateAction<Page>>
}

export default function Form({ setPage }: Props) {
  const [, setSnapshot] = useState<AcademicSnapshot | null>(null)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar setPage={setPage} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Top Direct Navigation / Breadcrumb Switcher */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage("hub")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Guide</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Marks data
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:inline dark:text-slate-400">
              Want to see your graphs?
            </span>
            <button
              type="button"
              onClick={() => setPage("dashboard")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:from-emerald-500 hover:to-teal-500 active:scale-95"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>View Dashboard →</span>
            </button>
          </div>
        </div>

        {/* Page Header Banner */}
        <div className="mb-8 rounded-[2rem] border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50/40 p-6 shadow-xs dark:border-indigo-950 dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Marksheet & Data Input</span>
              </div>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                Marks data
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                Enter your semester marks manually, copy the AI extraction prompt, or upload your TXT/CSV marksheets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage("dashboard")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-xs transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* The Core Academic Form */}
        <AcademicForm onDataChange={setSnapshot} />

        {/* Bottom Switcher CTA Banner */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Saved your records? Check your Analytics!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View your updated CGPA trajectory, domain breakdown, peer ranking, and chat with AI Mentor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPage("dashboard")}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  )
}
