import { useState, type ChangeEvent } from "react"
import { FileUp, Loader2, Plus, Trash2, Wand2, X } from "lucide-react"
import {
  DOMAIN_OPTIONS,
  getSemesterOptions,
  isDomainOption,
  type DomainOption
} from "../data/academicCatalog"
import type { MarksheetOcrResponse } from "../types/academic"
import { apiUrl } from "../lib/apiUrl"

const uploadUrl = () => apiUrl("/api/marksheet/upload")

type DraftRow = {
  id: string
  name: string
  domain: DomainOption
  marks: string
}

type Props = {
  department: string
  semesterBlockCount: number
  targetSemesterIndex: number
  onTargetSemesterIndexChange: (index: number) => void
  blockLabels: string[]
  onApply: (payload: {
    semester: string
    sgpa: number | null
    subjects: { name: string; domain: string; marks: number }[]
  }) => void
  disabled?: boolean
}

let rowId = 0
const nextRowId = () => `row-${++rowId}`

const coerceDomain = (value: string): DomainOption =>
  isDomainOption(value) ? value : "General"

const emptyDraftRow = (): DraftRow => ({
  id: nextRowId(),
  name: "",
  domain: "General",
  marks: ""
})

export default function MarksheetUpload({
  department,
  semesterBlockCount,
  targetSemesterIndex,
  onTargetSemesterIndexChange,
  blockLabels,
  onApply,
  disabled = false
}: Props) {
  const semesterOptions = getSemesterOptions(department)

  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState("")
  const [parseHint, setParseHint] = useState("")

  const [draftSemester, setDraftSemester] = useState(semesterOptions[0] || "Sem 1")
  const [draftSgpa, setDraftSgpa] = useState("")
  const [draftRows, setDraftRows] = useState<DraftRow[]>([])

  const [hasParsed, setHasParsed] = useState(false)

  const resetDraftFromResponse = (data: MarksheetOcrResponse) => {
    const sem =
      data.semester && semesterOptions.includes(data.semester)
        ? data.semester
        : semesterOptions[0] || "Sem 1"
    setDraftSemester(sem)
    setDraftSgpa(data.sgpa !== null && Number.isFinite(data.sgpa) ? String(data.sgpa) : "")

    if (data.subjects.length) {
      setDraftRows(
        data.subjects.map((s) => ({
          id: nextRowId(),
          name: s.name,
          domain: coerceDomain(s.domain),
          marks: String(s.marks)
        }))
      )
    } else {
      setDraftRows([emptyDraftRow()])
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file || disabled) {
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      setParseError("Please log in to upload a marksheet")
      return
    }

    setParsing(true)
    setParseError("")
    setParseHint("")
    setHasParsed(false)

    try {
      const body = new FormData()
      body.append("marksheet", file)

      const res = await fetch(uploadUrl(), {
        method: "POST",
        headers: {
          Authorization: token
        },
        body
      })

      const data: MarksheetOcrResponse = await res.json()

      if (!res.ok) {
        if (data.ocrError) {
          setParseError(data.message || "OCR failed — use manual entry below")
          resetDraftFromResponse(data)
          setHasParsed(true)
          return
        }
        throw new Error(data.message || "Upload failed")
      }

      if (data.lowConfidence) {
        setParseHint(data.message || "Low confidence — please review or edit rows below")
      }

      resetDraftFromResponse(data)
      setHasParsed(true)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Could not process image")
      setDraftRows([emptyDraftRow()])
      setDraftSgpa("")
      setDraftSemester(semesterOptions[0] || "Sem 1")
      setHasParsed(true)
    } finally {
      setParsing(false)
    }
  }

  const updateRow = (id: string, patch: Partial<Omit<DraftRow, "id">>) => {
    setDraftRows((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const removeRow = (id: string) => {
    setDraftRows((rows) => (rows.length === 1 ? rows : rows.filter((row) => row.id !== id)))
  }

  const addRow = () => {
    setDraftRows((rows) => [...rows, emptyDraftRow()])
  }

  const handleUseData = () => {
    const subjects = draftRows
      .map((row) => ({
        name: row.name.trim(),
        domain: row.domain,
        marks: Number(row.marks)
      }))
      .filter(
        (row) =>
          row.name.length > 0 &&
          Number.isFinite(row.marks) &&
          row.marks >= 0 &&
          row.marks <= 100
      )

    const sgpaParsed = draftSgpa.trim() === "" ? null : Number(draftSgpa)
    const sgpa =
      sgpaParsed !== null && Number.isFinite(sgpaParsed) && sgpaParsed >= 0 && sgpaParsed <= 10
        ? sgpaParsed
        : null

    onApply({
      semester: draftSemester,
      sgpa,
      subjects
    })
    setParseHint("")
    setParseError("")
  }

  const targetOptions = Array.from({ length: semesterBlockCount }, (_, i) => ({
    index: i,
    label: blockLabels[i] || `Semester ${i + 1}`
  }))

  const canDismissOcr = hasParsed || Boolean(parseError) || Boolean(parseHint)

  const dismissOcr = () => {
    if (parsing || disabled) {
      return
    }
    setHasParsed(false)
    setParseError("")
    setParseHint("")
    setDraftRows([])
    setDraftSgpa("")
    setDraftSemester(semesterOptions[0] || "Sem 1")
  }

  return (
    <div className="rounded-[1.75rem] border border-indigo-100 bg-indigo-50/40 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-800">Marksheet OCR</p>
          <p className="mt-1 text-xs text-slate-600">
            Upload a clear photo or scan. Parsed rows are editable before you merge them into the
            form — nothing is saved until you click Save Academic Data.
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 self-start">
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50">
            {parsing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning…
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                Choose image
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled || parsing}
              onChange={handleFileChange}
            />
          </label>
          {canDismissOcr ? (
            <button
              type="button"
              onClick={dismissOcr}
              disabled={disabled || parsing}
              className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close OCR preview"
              title="Close"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-slate-700">
          Apply to semester block
          <select
            value={Math.min(targetSemesterIndex, Math.max(0, semesterBlockCount - 1))}
            onChange={(e) => onTargetSemesterIndexChange(Number(e.target.value))}
            disabled={disabled}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
          >
            {targetOptions.map(({ index, label }) => (
              <option key={index} value={index}>
                Block {index + 1}: {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-700">
          Parsed semester label
          <select
            value={draftSemester}
            onChange={(e) => setDraftSemester(e.target.value)}
            disabled={disabled || !hasParsed}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
          >
            {semesterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
      </div>

      {parseError ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {parseError}
        </div>
      ) : null}

      {parseHint ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
          {parseHint}
        </div>
      ) : null}

      {hasParsed ? (
        <div className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-slate-700">
            SGPA (from marksheet, optional)
            <input
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={draftSgpa}
              onChange={(e) => setDraftSgpa(e.target.value)}
              disabled={disabled}
              className="mt-1 w-full max-w-xs rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500"
              placeholder="e.g. 8.4"
            />
          </label>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-3 py-2">Subject</th>
                  <th className="px-3 py-2">Domain</th>
                  <th className="w-24 px-3 py-2">Marks</th>
                  <th className="w-12 px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {draftRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2 align-top">
                      <input
                        value={row.name}
                        onChange={(e) => updateRow(row.id, { name: e.target.value })}
                        disabled={disabled}
                        className="w-full min-w-[140px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                        placeholder="Subject name"
                      />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <select
                        value={row.domain}
                        onChange={(e) =>
                          updateRow(row.id, { domain: coerceDomain(e.target.value) })
                        }
                        disabled={disabled}
                        className="w-full min-w-[120px] rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                      >
                        {DOMAIN_OPTIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={row.marks}
                        onChange={(e) => updateRow(row.id, { marks: e.target.value })}
                        disabled={disabled}
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
                        placeholder="0–100"
                      />
                    </td>
                    <td className="px-1 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={disabled || draftRows.length === 1}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                        aria-label="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={addRow}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add row
            </button>
            <button
              type="button"
              onClick={handleUseData}
              disabled={disabled}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Wand2 className="h-3.5 w-3.5" />
              Use this data
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
