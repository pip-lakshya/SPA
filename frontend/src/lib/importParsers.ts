import { inferDomainForSubject, normalizeDomainLabel } from "../data/academicCatalog"

export type ImportedSubject = { name: string; marks: number; domain?: string; lowConfidence?: boolean }
export type ImportedRecord = { semester?: string; sgpa?: number | null; subjects: ImportedSubject[] }

const romanMap: Record<string, number> = {
  i: 1,
  ii: 2,
  iii: 3,
  iv: 4,
  v: 5,
  vi: 6,
  vii: 7,
  viii: 8
}

const clean = (value: string) => value.replace(/\t/g, " ").replace(/\s+/g, " ").trim()

/**
 * Strips serial numbers and trailing delimiters without stripping leading English letters like M or D.
 */
const cleanSubjectTitle = (value: string) => {
  let s = clean(value)
  // Strip leading serial numbers with delimiters e.g. "1.", "1)", "1-", "I.", "I)", "S.No 1"
  s = s.replace(/^\s*(?:s\.?\s*no\.?\s*)?\d+[.)-]\s*/i, "")
  s = s.replace(/^\s*[ivxlcdm]+[.)-]\s*/i, "")
  // Strip standalone leading numbers e.g. "01 "
  s = s.replace(/^\s*\d+\s{2,}/, "")
  // Strip any leading/trailing pipe, colon, dash, comma, equals symbols and whitespace
  s = s.replace(/^[|:\s,=-]+|[|:\s,=-]+$/g, "").trim()
  return s
}

const semester = (line: string) => {
  const match = line.match(/(?:semester|sem)\s*[:#-]?\s*([ivxlcdm]+|\d+)/i)
  if (!match) return undefined
  const raw = match[1].toLowerCase()
  if (/^\d+$/.test(raw)) return `Sem ${raw}`
  if (romanMap[raw]) return `Sem ${romanMap[raw]}`
  return undefined
}

const subject = (name: string, marks: string | number, domain?: string): ImportedSubject | null => {
  const score = typeof marks === "number" ? marks : Number(marks)
  const title = cleanSubjectTitle(name)

  // Ignore header rows or invalid titles or missing scores
  if (
    !title ||
    /^(?:subject|course|subject\s*name|name)$/i.test(title) ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > 100
  ) {
    return null
  }

  const mapped = domain ? clean(domain) : inferDomainForSubject(title)
  return {
    name: title,
    marks: score,
    domain: mapped ? normalizeDomainLabel(mapped) : "General",
    lowConfidence: !mapped
  }
}

export const txtParser = (text: string): ImportedRecord => {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean)
  let sem: string | undefined
  let sgpa: number | null = null
  const subjects: ImportedSubject[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    // 1. Check semester
    sem ||= semester(line)

    // 2. Check SGPA
    const sgpaMatch = line.match(/sgpa\s*[:=-]?\s*(\d+(?:\.\d+)?)/i)
    if (sgpaMatch) {
      sgpa = Number(sgpaMatch[1])
      continue
    }

    // 3. Skip header lines like "Subject | Marks" or "Subject, Marks"
    if (/^(?:subject|course)\s*(?:\||:|,|=|-)\s*(?:marks|mark|score)$/i.test(line)) {
      continue
    }

    // 4. Try matching "Subject Name | 83" or "Subject Name: 83" or "Subject Name 83"
    const pair = line.match(/^(.+?)\s*(?:\||:|,|=|-)\s*(\d{1,3}(?:\.\d+)?)\s*$/)
    const splitRow = pair ? subject(pair[1], pair[2]) : null
    if (splitRow) {
      subjects.push(splitRow)
      continue
    }

    // 5. Try space-separated subject and mark at end of line (e.g. "Data Structure 84")
    const spacePair = line.match(/^([a-zA-Z\s&().\-\/]+?)\s+(\d{1,3}(?:\.\d+)?)\s*$/)
    if (spacePair && !/^(?:semester|sem|sgpa)/i.test(spacePair[1])) {
      const spaceRow = subject(spacePair[1], spacePair[2])
      if (spaceRow) {
        subjects.push(spaceRow)
        continue
      }
    }

    // 6. Wrapped mark on next line
    const wrappedMark = lines[index + 1]?.match(/^(\d{1,3}(?:\.\d+)?)$/)
    if (wrappedMark && !/^(?:semester|sem|sgpa)/i.test(line)) {
      const wrapped = subject(line, wrappedMark[1])
      if (wrapped) {
        subjects.push(wrapped)
        index += 1
      }
    }
  }

  return { semester: sem, sgpa, subjects }
}

export const erpTextParser = txtParser

export const csvParser = (text: string): ImportedRecord => {
  const rawRows = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!rawRows.length) return { subjects: [] }

  let sem: string | undefined
  let sgpa: number | null = null
  const subjects: ImportedSubject[] = []

  let subjectCol = 0
  let marksCol = 1
  let domainCol = -1

  for (const rawLine of rawRows) {
    const cells = rawLine.split(",").map((c) => clean(c.replace(/^"|"$/g, "")))
    if (!cells.some(Boolean)) continue

    // 1. Check Semester in line
    if (!sem) {
      const semFound =
        semester(rawLine) ||
        (cells[0] && /semester|sem/i.test(cells[0])
          ? semester(cells[1] || "") || cleanSubjectTitle(cells[1])
          : undefined)
      if (semFound) {
        sem = semFound
        continue
      }
    }

    // 2. Check SGPA in line
    if (sgpa === null) {
      const sgpaMatch = rawLine.match(/sgpa\s*[:,-]?\s*(\d+(?:\.\d+)?)/i)
      if (sgpaMatch) {
        sgpa = Number(sgpaMatch[1])
        continue
      }
      if (/sgpa/i.test(cells[0]) && cells[1] && Number.isFinite(Number(cells[1]))) {
        sgpa = Number(cells[1])
        continue
      }
    }

    // 3. Header row detection (e.g. "Subject,Marks" or "Subject,Domain,Marks")
    const isHeaderRow =
      cells.some((c) => /^(?:subject|course|name|subject\s*name)$/i.test(c)) &&
      cells.some((c) => /^(?:marks|mark|score|grade)$/i.test(c))

    if (isHeaderRow) {
      const sIdx = cells.findIndex((c) => /^(?:subject|course|name|subject\s*name)$/i.test(c))
      const mIdx = cells.findIndex((c) => /^(?:marks|mark|score|grade)$/i.test(c))
      const dIdx = cells.findIndex((c) => /^(?:domain|category|field)$/i.test(c))

      if (sIdx >= 0) subjectCol = sIdx
      if (mIdx >= 0) marksCol = mIdx
      if (dIdx >= 0) domainCol = dIdx
      continue
    }

    // 4. Try row with column mapping
    const nameVal = cells[subjectCol] ?? cells[0] ?? ""
    const markVal = cells[marksCol] ?? cells[1] ?? ""
    const domainVal = domainCol >= 0 ? cells[domainCol] : undefined

    const parsed = subject(nameVal, markVal, domainVal)
    if (parsed) {
      subjects.push(parsed)
    } else {
      // Fallback: search row for numeric cell (0-100) and title cell
      if (cells.length >= 2) {
        const numIdx = cells.findIndex((c) => {
          const n = Number(c)
          return c !== "" && Number.isFinite(n) && n >= 0 && n <= 100
        })
        if (numIdx >= 0) {
          const titleIdx = cells.findIndex(
            (c, i) => i !== numIdx && Boolean(c) && !/^(?:semester|sem|sgpa)$/i.test(c)
          )
          if (titleIdx >= 0) {
            const fallbackSubject = subject(cells[titleIdx], cells[numIdx], domainVal)
            if (fallbackSubject) {
              subjects.push(fallbackSubject)
            }
          }
        }
      }
    }
  }

  return { semester: sem, sgpa, subjects }
}
