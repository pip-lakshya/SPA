import { useState, useRef, type ChangeEvent } from "react"
import {
  CheckCircle2,
  ClipboardPaste,
  Download,
  FileSpreadsheet,
  FileUp,
  Image,
  Loader2,
  PencilLine,
  Sparkles,
  X,
  Copy,
  Check
} from "lucide-react"
import { apiUrl } from "../lib/apiUrl"
import type { MarksheetOcrResponse } from "../types/academic"
import {
  AI_CSV_PROMPT,
  csvParser,
  erpTextParser,
  parseAcademicCsv,
  type ImportedRecord,
  type ParsedSemester
} from "../lib/importParsers"

type Props = {
  onImport: (record: ImportedRecord, source: string) => void
  onImportMulti?: (semesters: ParsedSemester[], source: string) => void
  onManualEntry: () => void
}

export default function ImportRecords({ onImport, onImportMulti, onManualEntry }: Props) {
  const image = useRef<HTMLInputElement>(null)
  const csv = useRef<HTMLInputElement>(null)

  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [erpOpen, setErpOpen] = useState(false)
  const [erpText, setErpText] = useState("")
  const [pastedCsv, setPastedCsv] = useState("")
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [summary, setSummary] = useState<{
    semester: string
    subjects: number
    unknown: number
  } | null>(null)

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_CSV_PROMPT)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2500)
    } catch {
      setError("Failed to copy prompt to clipboard. Please copy manually.")
    }
  }

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setPastedCsv(text)
        setError("")
      }
    } catch {
      setError("Clipboard read permission denied. Please paste manually into the text box.")
    }
  }

  const handleApplyPastedCsv = () => {
    setError("")
    if (!pastedCsv.trim()) {
      setError("Please paste your CSV marksheet data first.")
      return
    }

    try {
      const parsed = parseAcademicCsv(pastedCsv)
      if (!parsed.semesters.length) {
        throw new Error("No valid semester or subject rows found in the pasted data. Please check format.")
      }

      const totalSubjects = parsed.semesters.reduce((acc, s) => acc + s.subjects.length, 0)
      if (totalSubjects === 0) {
        throw new Error("No valid subjects with marks (0-100) were found.")
      }

      if (onImportMulti) {
        onImportMulti(parsed.semesters, "AI CSV")
      } else {
        // Fallback for single semester
        onImport(
          {
            semester: parsed.semesters[0].semester,
            sgpa: parsed.semesters[0].sgpa,
            subjects: parsed.semesters[0].subjects
          },
          "AI CSV"
        )
      }

      setSummary({
        semester: `${parsed.semesters.length} semester(s)`,
        subjects: totalSubjects,
        unknown: 0
      })
      setAiModalOpen(false)
      setPastedCsv("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV data.")
    }
  }

  const complete = (record: ImportedRecord, source: string) => {
    if (!record.subjects.length) throw new Error("No valid subject / marks rows found.")
    onImport(record, source)
    setSummary({
      semester: record.semester || "Selected semester",
      subjects: record.subjects.length,
      unknown: record.subjects.filter((item) => item.lowConfidence).length
    })
  }

  const importFile = async (event: ChangeEvent<HTMLInputElement>, source: "CSV") => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setBusy(source)
    setError("")
    try {
      const text = await file.text()
      const multi = parseAcademicCsv(text)
      if (multi.semesters.length > 0 && onImportMulti) {
        onImportMulti(multi.semesters, source)
        setSummary({
          semester: `${multi.semesters.length} semester(s)`,
          subjects: multi.semesters.reduce((acc, s) => acc + s.subjects.length, 0),
          unknown: 0
        })
      } else {
        complete(csvParser(text), source)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import this file.")
    } finally {
      setBusy("")
    }
  }

  const importErp = () => {
    setError("")
    try {
      complete(erpTextParser(erpText), "ERP Result")
      setErpOpen(false)
      setErpText("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not import ERP text.")
    }
  }

  const importImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    const token = localStorage.getItem("token")
    if (!token) return setError("Please log in to upload a marksheet.")
    setBusy("OCR")
    setError("")
    try {
      const body = new FormData()
      body.append("marksheet", file)
      const res = await fetch(apiUrl("/api/marksheet/upload"), {
        method: "POST",
        headers: { Authorization: token },
        body
      })
      const data: MarksheetOcrResponse = await res.json()
      if (!res.ok) throw new Error(data.message || "OCR import failed.")
      complete(
        {
          semester: data.semester,
          sgpa: data.sgpa,
          subjects: data.subjects.map((item) => ({ ...item, lowConfidence: Boolean(data.lowConfidence) }))
        },
        "OCR"
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "OCR import failed.")
    } finally {
      setBusy("")
    }
  }

  const downloadCsvTemplate = () => {
    const templateContent =
      "Semester,SGPA,Subject,Marks\nSem 1,8.40,Engineering Mathematics I,85\nSem 1,8.40,Programming in C,92\nSem 1,8.40,Basic Electrical Engineering,78\nSem 2,8.75,Data Structures and Algorithms,88\nSem 2,8.75,Digital Electronics,82\n"
    const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "academic-records-template.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const actionButtonStyle =
    "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"

  // Live detection counts for preview
  const previewData = pastedCsv.trim() ? parseAcademicCsv(pastedCsv) : null
  const previewSemCount = previewData?.semesters.length || 0
  const previewSubCount = previewData?.semesters.reduce((acc, s) => acc + s.subjects.length, 0) || 0

  return (
    <>
      <div className="rounded-[1.75rem] border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-slate-50/60 p-5 dark:border-indigo-950/60 dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-indigo-950/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Fast Marksheet Import
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Use ChatGPT / Gemini to convert marksheets to CSV, paste below to auto-fill semester and subject cards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary ChatGPT CSV Button */}
            <button
              type="button"
              onClick={() => {
                setError("")
                setAiModalOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Import via AI (ChatGPT)</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                Recommended
              </span>
            </button>

            {/* CSV File Upload */}
            <button
              type="button"
              onClick={() => csv.current?.click()}
              disabled={!!busy}
              className={actionButtonStyle}
            >
              <FileUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Upload CSV</span>
            </button>

            {/* Marksheet OCR */}
            <button
              type="button"
              onClick={() => image.current?.click()}
              disabled={!!busy}
              className={actionButtonStyle}
            >
              {busy === "OCR" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              ) : (
                <Image className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
              <span>OCR Image</span>
            </button>

            {/* Paste ERP */}
            <button
              type="button"
              onClick={() => setErpOpen(true)}
              className={actionButtonStyle}
            >
              <ClipboardPaste className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Paste ERP</span>
            </button>

            {/* Manual Entry */}
            <button
              type="button"
              onClick={onManualEntry}
              className={actionButtonStyle}
            >
              <PencilLine className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-indigo-100/60 pt-3 dark:border-slate-800">
          <button
            type="button"
            onClick={downloadCsvTemplate}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download CSV Template</span>
          </button>

          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Supports multi-semester CSV (Semester, SGPA, Subject, Marks)
          </span>
        </div>

        {/* Hidden inputs */}
        <input ref={image} type="file" accept="image/*" className="hidden" onChange={importImage} />
        <input ref={csv} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => importFile(e, "CSV")} />

        {error && (
          <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
            {error}
          </p>
        )}

        {summary && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Imported Successfully:</strong> {summary.semester} · {summary.subjects} total subjects populated.
              </span>
            </div>
            <button type="button" onClick={onManualEntry} className="font-bold underline hover:text-emerald-950 dark:hover:text-white">
              Review Below →
            </button>
          </div>
        )}
      </div>

      {/* AI CSV Import Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-7">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Import Marksheet via AI (CSV)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Get clean CSV data from ChatGPT or Gemini, then paste here to fill subject-wise and semester-wise.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Interactive Steps */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step 1
                </span>
                <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                  Copy ChatGPT CSV Prompt
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Upload your marksheet image/PDF to ChatGPT with this prompt.
                </p>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-2xs border border-indigo-200 transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-800 dark:text-indigo-300"
                >
                  {copiedPrompt ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedPrompt ? "Prompt Copied!" : "Copy CSV Prompt"}</span>
                </button>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-950 dark:bg-blue-950/30">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Step 2
                </span>
                <h4 className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                  Paste Output Here
                </h4>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Click below to read from clipboard or paste in the box directly.
                </p>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700 active:scale-95"
                >
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span>Paste from Clipboard</span>
                </button>
              </div>
            </div>

            {/* The Textarea */}
            <div className="mt-4">
              <div className="flex items-center justify-between pb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  CSV Marksheet Data:
                </label>
                {previewSubCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>
                      Detected: {previewSemCount} Sem ({previewSubCount} subjects)
                    </span>
                  </span>
                )}
              </div>
              <textarea
                value={pastedCsv}
                onChange={(e) => setPastedCsv(e.target.value)}
                placeholder={"Semester,SGPA,Subject,Marks\nSem 1,8.40,Engineering Mathematics,85\nSem 1,8.40,Programming in C,92\nSem 2,8.75,Data Structures and Algorithms,88"}
                className="h-44 w-full rounded-2xl border border-slate-300 bg-slate-50 p-3.5 font-mono text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            {error && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
                {error}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPastedCsv("")}
                disabled={!pastedCsv}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-40 dark:text-slate-400"
              >
                Clear
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyPastedCsv}
                  disabled={!pastedCsv.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50 active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Import & Populate Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paste ERP Modal */}
      {erpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Paste ERP Result
              </h3>
              <button type="button" onClick={() => setErpOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4">
              <textarea
                value={erpText}
                onChange={(e) => setErpText(e.target.value)}
                placeholder="Paste raw text copied from your university ERP portal..."
                className="h-44 w-full rounded-2xl border border-slate-300 p-3 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setErpOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={importErp}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Import ERP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
