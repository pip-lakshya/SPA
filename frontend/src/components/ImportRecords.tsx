import { useRef, useState, type ChangeEvent } from "react"
import { CheckCircle2, ClipboardPaste, Download, FileText, FileUp, Image, Loader2, PencilLine, X } from "lucide-react"
import { apiUrl } from "../lib/apiUrl"
import type { MarksheetOcrResponse } from "../types/academic"
import { csvParser, erpTextParser, txtParser, type ImportedRecord } from "../lib/importParsers"

type Props = { onImport: (record: ImportedRecord, source: string) => void; onManualEntry: () => void }
const GPT_PROMPT = `Convert this academic marksheet into plain text.

Return ONLY plain text.

No markdown.

No explanations.

Use exactly this format.

Semester: <semester>

SGPA: <sgpa if available>

Subject | Marks

Subject | Marks

Subject | Marks

Rules:

- Ignore logos
- Ignore student details unless available
- Ignore roll number
- Ignore remarks
- Ignore pass/fail
- Ignore course codes
- Extract ONLY subject names and total marks.
- Preserve full subject names.
- Output only plain text.`

export default function ImportRecords({ onImport, onManualEntry }: Props) {
  const image = useRef<HTMLInputElement>(null), txt = useRef<HTMLInputElement>(null), csv = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(""), [error, setError] = useState(""), [gptOpen, setGptOpen] = useState(false), [erpOpen, setErpOpen] = useState(false), [erpText, setErpText] = useState(""), [summary, setSummary] = useState<{ semester: string; subjects: number; unknown: number } | null>(null)
  const complete = (record: ImportedRecord, source: string) => { if (!record.subjects.length) throw new Error("No valid subject / marks rows found."); onImport(record, source); setSummary({ semester: record.semester || "Selected semester", subjects: record.subjects.length, unknown: record.subjects.filter((item) => item.lowConfidence).length }) }
  const importFile = async (event: ChangeEvent<HTMLInputElement>, source: "GPT TXT" | "CSV") => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; setBusy(source); setError(""); try { complete(source === "CSV" ? csvParser(await file.text()) : txtParser(await file.text()), source); setGptOpen(false) } catch (err) { setError(err instanceof Error ? err.message : "Could not import this file.") } finally { setBusy("") } }
  const importErp = () => { setError(""); try { complete(erpTextParser(erpText), "ERP Result"); setErpOpen(false); setErpText("") } catch (err) { setError(err instanceof Error ? err.message : "Could not import ERP text.") } }
  const importImage = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; const token = localStorage.getItem("token"); if (!token) return setError("Please log in to upload a marksheet."); setBusy("OCR"); setError(""); try { const body = new FormData(); body.append("marksheet", file); const res = await fetch(apiUrl("/api/marksheet/upload"), { method: "POST", headers: { Authorization: token }, body }); const data: MarksheetOcrResponse = await res.json(); if (!res.ok) throw new Error(data.message || "OCR import failed."); complete({ semester: data.semester, sgpa: data.sgpa, subjects: data.subjects.map((item) => ({ ...item, lowConfidence: Boolean(data.lowConfidence) })) }, "OCR") } catch (err) { setError(err instanceof Error ? err.message : "OCR import failed.") } finally { setBusy("") } }
  const copyPrompt = async () => { await navigator.clipboard.writeText(GPT_PROMPT); setError("Prompt copied. Paste it into ChatGPT or Gemini after uploading your marksheet.") }
  const downloadTemplate = () => { const blob = new Blob(["Semester: 4\nSGPA: 8.94\n\nDatabase Management System | 88\nFull Stack Development | 77\nComputer Networks | 61\nOperating System | 88\n"], { type: "text/plain" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "academic-record-template.txt"; anchor.click(); URL.revokeObjectURL(url) }
  const style = "inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:opacity-50"
  const modal = (open: boolean, close: () => void, title: string, content: React.ReactNode) => open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="w-full max-w-lg rounded-[1.75rem] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><h3 className="text-xl font-bold text-slate-900">{title}</h3><button type="button" onClick={close} className="text-slate-400 hover:text-slate-700"><X /></button></div>{content}</div></div> : null
  return <><div className="rounded-[1.5rem] border border-indigo-100 bg-indigo-50/45 p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-semibold text-indigo-800">Import Records</p><p className="mt-1 text-xs text-slate-600">GPT TXT gives the most reliable results. OCR accuracy depends on image quality.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => image.current?.click()} disabled={!!busy} className={style}>{busy === "OCR" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />} Marksheet OCR</button><button type="button" onClick={() => setGptOpen(true)} className={`${style} border-indigo-400`}><FileText className="h-4 w-4" /> GPT TXT <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] text-white">Recommended</span></button><button type="button" onClick={() => setErpOpen(true)} className={style}><ClipboardPaste className="h-4 w-4" /> Paste ERP Result</button><button type="button" onClick={() => csv.current?.click()} disabled={!!busy} className={style}><FileUp className="h-4 w-4" /> CSV</button><button type="button" onClick={onManualEntry} className={style}><PencilLine className="h-4 w-4" /> Manual Entry</button></div></div><div className="mt-3"><button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:text-indigo-900"><Download className="h-3.5 w-3.5" /> Download TXT template</button></div><input ref={image} type="file" accept="image/*" className="hidden" onChange={importImage}/><input ref={txt} type="file" accept=".txt,text/plain" className="hidden" onChange={(e) => importFile(e, "GPT TXT")}/><input ref={csv} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => importFile(e, "CSV")}/>{error && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{error}</p>}{summary && <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><CheckCircle2 className="h-4 w-4" /><span><strong>Imported Successfully</strong> · {summary.semester} · {summary.subjects} subjects · {summary.unknown} unknown</span><button type="button" onClick={onManualEntry} className="font-semibold underline">Review Data</button></div>}</div>{modal(gptOpen, () => setGptOpen(false), "Import using ChatGPT", <div className="mt-5 space-y-4 text-sm text-slate-600"><ol className="list-decimal space-y-2 pl-5"><li>Open ChatGPT (or Gemini)</li><li>Upload your marksheet screenshot or PDF</li><li>Copy the prompt below</li><li>Ask ChatGPT to convert it</li><li>Upload the generated TXT file here</li></ol><div className="flex justify-end gap-2"><button type="button" onClick={copyPrompt} className={style}>Copy Prompt</button><button type="button" onClick={() => txt.current?.click()} className={style}>Upload TXT</button></div></div>)}{modal(erpOpen, () => setErpOpen(false), "Paste ERP Result", <div className="mt-5"><textarea value={erpText} onChange={(e) => setErpText(e.target.value)} placeholder="Paste your ERP result here…" className="h-48 w-full rounded-2xl border border-slate-300 p-3 text-sm outline-none focus:border-indigo-500"/><div className="mt-4 flex justify-end"><button type="button" onClick={importErp} className={style}>Import and Save</button></div></div>)}</>
}
