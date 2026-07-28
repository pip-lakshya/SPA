import { inferDomainForSubject, normalizeDomainLabel } from "../data/academicCatalog"

export type ImportedSubject = { name: string; marks: number; domain?: string; lowConfidence?: boolean }
export type ImportedRecord = { semester?: string; sgpa?: number | null; subjects: ImportedSubject[] }

const clean = (value: string) => value.replace(/\t/g, " ").replace(/\s+/g, " ").trim()
const withoutNumber = (value: string) => clean(value.replace(/^\s*(?:\d+|[ivxlcdm]+)[.)-]?\s*/i, ""))
const semester = (line: string) => {
  const match = line.match(/(?:semester|sem)\s*[:#-]?\s*(\d+)/i)
  return match ? `Sem ${match[1]}` : undefined
}
const subject = (name: string, marks: string, domain?: string): ImportedSubject | null => {
  const score = Number(marks)
  const title = withoutNumber(name)
  if (!title || !Number.isFinite(score) || score < 0 || score > 100) return null
  const mapped = domain || inferDomainForSubject(title)
  return { name: title, marks: score, domain: mapped ? normalizeDomainLabel(mapped) : "General", lowConfidence: !mapped }
}

export const txtParser = (text: string): ImportedRecord => {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean)
  let sem: string | undefined
  let sgpa: number | null = null
  const subjects: ImportedSubject[] = []
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    sem ||= semester(line)
    const sgpaMatch = line.match(/sgpa\s*[:=-]?\s*(\d+(?:\.\d+)?)/i)
    if (sgpaMatch) sgpa = Number(sgpaMatch[1])
    const pair = line.match(/^(.+?)\s*(?:\||:|,|=|-|\s)(\d{1,3}(?:\.\d+)?)\s*$/)
    const splitRow = pair ? subject(pair[1], pair[2]) : null
    if (splitRow) { subjects.push(splitRow); continue }
    const wrappedMark = lines[index + 1]?.match(/^(\d{1,3}(?:\.\d+)?)$/)
    if (wrappedMark && !/^(?:semester|sem|sgpa)/i.test(line)) {
      const wrapped = subject(line, wrappedMark[1])
      if (wrapped) { subjects.push(wrapped); index += 1 }
    }
  }
  return { semester: sem, sgpa, subjects }
}

export const erpTextParser = txtParser

export const csvParser = (text: string): ImportedRecord => {
  const rows = text.split(/\r?\n/).map((line) => line.split(",").map((cell) => clean(cell.replace(/^"|"$/g, "")))).filter((row) => row.some(Boolean))
  if (!rows.length) return { subjects: [] }
  const headers = rows[0].map((header) => header.toLowerCase())
  const hasHeaders = headers.some((header) => /semester|subject|marks|sgpa|domain/.test(header))
  const at = (label: string) => headers.findIndex((header) => header.includes(label))
  const subjectAt = at("subject"), marksAt = at("mark"), semesterAt = at("semester"), sgpaAt = at("sgpa"), domainAt = at("domain")
  let sem: string | undefined, sgpa: number | null = null
  const subjects = (hasHeaders ? rows.slice(1) : rows).map((row) => {
    if (!sem && semesterAt >= 0) sem = semester(row[semesterAt]) || row[semesterAt]
    if (sgpa === null && sgpaAt >= 0 && Number.isFinite(Number(row[sgpaAt]))) sgpa = Number(row[sgpaAt])
    return subject(row[hasHeaders ? subjectAt : 0] || "", row[hasHeaders ? marksAt : 1] || "", domainAt >= 0 ? row[domainAt] : undefined)
  }).filter((item): item is ImportedSubject => Boolean(item))
  return { semester: sem, sgpa, subjects }
}
