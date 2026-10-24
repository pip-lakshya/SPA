import { inferDomainForSubject, normalizeDomainLabel } from "../data/academicCatalog"

export type ImportedSubject = { name: string; marks: number; domain?: string; lowConfidence?: boolean }
export type ImportedRecord = { semester?: string; sgpa?: number | null; subjects: ImportedSubject[] }

export type ParsedSemester = {
  semester: string
  sgpa: number | null
  subjects: Array<{ name: string; marks: number; domain?: string; lowConfidence?: boolean }>
}

export type MultiSemesterImport = {
  semesters: ParsedSemester[]
}

export const AI_CSV_PROMPT = `Convert this academic marksheet (or PDF / image / text) into clean CSV data.

Output ONLY the raw CSV text. Do NOT wrap in markdown code blocks, do NOT write explanations.

Format:
Semester,SGPA,Subject,Marks

Rules:
1. "Semester": Standard format like Sem 1, Sem 2, Sem 3, etc. (or Semester 1, 2, etc.)
2. "SGPA": The SGPA for that specific semester (e.g. 8.45). If unavailable, leave empty.
3. "Subject": Clean subject name only (e.g. "Data Structures and Algorithms") without course codes or serial numbers.
4. "Marks": Numerical score (0-100).
5. If multiple semesters exist on the marksheet, output rows for all semesters in order.
6. Omit non-graded or audit subjects without marks.

Example Output:
Semester,SGPA,Subject,Marks
Sem 1,8.40,Engineering Mathematics,85
Sem 1,8.40,Programming in C,92
Sem 1,8.40,Basic Electrical Engineering,78
Sem 2,8.75,Data Structures and Algorithms,88
Sem 2,8.75,Digital Electronics,82`

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

export const cleanSubjectTitle = (value: string) => {
  let s = clean(value)
  s = s.replace(/^\s*(?:s\.?\s*no\.?\s*)?\d+[.)-]\s*/i, "")
  s = s.replace(/^\s*[ivxlcdm]+[.)-]\s*/i, "")
  s = s.replace(/^\s*\d+\s{2,}/, "")
  s = s.replace(/^[|:\s,=-]+|[|:\s,=-]+$/g, "").trim()
  return s
}

export const normalizeSemesterName = (raw: string): string => {
  if (!raw) return "Sem 1"
  const m = raw.match(/(?:semester|sem|term)?\s*([ivxlcdm]+|\d+)/i)
  if (m) {
    const val = m[1].toLowerCase()
    if (/^\d+$/.test(val)) return `Sem ${val}`
    if (romanMap[val]) return `Sem ${romanMap[val]}`
  }
  return raw.trim() || "Sem 1"
}

function parseLineCells(line: string): string[] {
  let s = line.trim()
  if (s.startsWith("|") && s.endsWith("|")) {
    s = s.slice(1, -1)
    return s.split("|").map((c) => c.trim())
  }
  if (s.includes("\t")) {
    return s.split("\t").map((c) => c.trim())
  }
  const matches: string[] = []
  const regex = /(?:^|,)(?:"([^"]*)"|([^,]*))/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(s)) !== null) {
    const val = match[1] !== undefined ? match[1] : match[2]
    matches.push(val.trim())
  }
  return matches
}

/**
 * Parses CSV/TSV/Markdown table containing Semester,SGPA,Subject,Marks
 * Automatically groups rows by semester!
 */
export function parseAcademicCsv(text: string): MultiSemesterImport {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (!lines.length) return { semesters: [] }

  let semCol = -1
  let sgpaCol = -1
  let subCol = -1
  let marksCol = -1
  let domCol = -1

  const semestersMap = new Map<string, ParsedSemester>()
  let currentDefaultSem = "Sem 1"
  let currentDefaultSgpa: number | null = null

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (/^[|\s\-:]+$/.test(line)) continue // skip markdown table borders e.g. |---|---|

    const cells = parseLineCells(line)
    if (!cells.length || cells.every((c) => !c)) continue

    // Header row detection
    const isHeader = cells.some((c) =>
      /^(?:semester|sem|sgpa|gpa|subject|course|marks|mark|score)$/i.test(c)
    )
    if (isHeader) {
      cells.forEach((c, idx) => {
        if (/^(?:semester|sem|term)$/i.test(c)) semCol = idx
        else if (/^(?:sgpa|gpa|cgpa)$/i.test(c)) sgpaCol = idx
        else if (/^(?:subject|course|subject\s*name|name|paper)$/i.test(c)) subCol = idx
        else if (/^(?:marks|mark|score|percentage)$/i.test(c)) marksCol = idx
        else if (/^(?:domain|category|field)$/i.test(c)) domCol = idx
      })
      continue
    }

    // Default column order heuristics if no explicit header matched
    if (subCol === -1 || marksCol === -1) {
      if (cells.length >= 4) {
        semCol = 0
        sgpaCol = 1
        subCol = 2
        marksCol = 3
      } else if (cells.length === 3) {
        semCol = 0
        subCol = 1
        marksCol = 2
      } else if (cells.length === 2) {
        subCol = 0
        marksCol = 1
      }
    }

    const semRaw = semCol >= 0 && cells[semCol] ? cells[semCol] : currentDefaultSem
    const sgpaRaw: string | number | null = sgpaCol >= 0 && cells[sgpaCol] ? cells[sgpaCol] : currentDefaultSgpa
    const subRaw = subCol >= 0 ? cells[subCol] : cells[0]
    const marksRaw = marksCol >= 0 ? cells[marksCol] : cells[1]
    const domRaw = domCol >= 0 ? cells[domCol] : undefined

    const markNum = Number(marksRaw)
    if (!Number.isFinite(markNum) || markNum < 0 || markNum > 100) continue

    const cleanedTitle = cleanSubjectTitle(subRaw)
    if (!cleanedTitle || /^(?:subject|marks|semester|sgpa|score)$/i.test(cleanedTitle)) continue

    const activeSem = normalizeSemesterName(semRaw)
    currentDefaultSem = activeSem

    let activeSgpa: number | null = null
    if (sgpaRaw !== null && sgpaRaw !== undefined && sgpaRaw !== "") {
      const parsedSgpa: number = typeof sgpaRaw === "number" ? sgpaRaw : Number(sgpaRaw)
      if (Number.isFinite(parsedSgpa) && parsedSgpa >= 0 && parsedSgpa <= 10) {
        activeSgpa = parsedSgpa
        currentDefaultSgpa = activeSgpa
      }
    }

    if (!semestersMap.has(activeSem)) {
      semestersMap.set(activeSem, {
        semester: activeSem,
        sgpa: activeSgpa,
        subjects: []
      })
    }

    const semRecord = semestersMap.get(activeSem)!
    if (activeSgpa !== null && semRecord.sgpa === null) {
      semRecord.sgpa = activeSgpa
    }

    const inferredDomain = domRaw ? clean(domRaw) : inferDomainForSubject(cleanedTitle)
    semRecord.subjects.push({
      name: cleanedTitle,
      marks: Math.round(markNum),
      domain: inferredDomain ? normalizeDomainLabel(inferredDomain) : "General",
      lowConfidence: !inferredDomain
    })
  }

  return { semesters: Array.from(semestersMap.values()) }
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
  // First attempt multi-semester CSV parsing in case user pasted CSV into text
  const multi = parseAcademicCsv(text)
  if (multi.semesters.length > 0) {
    return {
      semester: multi.semesters[0].semester,
      sgpa: multi.semesters[0].sgpa,
      subjects: multi.semesters[0].subjects
    }
  }

  const lines = text.split(/\r?\n/).map(clean).filter(Boolean)
  let sem: string | undefined
  let sgpa: number | null = null
  const subjects: ImportedSubject[] = []

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    sem ||= semester(line)

    const sgpaMatch = line.match(/sgpa\s*[:=-]?\s*(\d+(?:\.\d+)?)/i)
    if (sgpaMatch) {
      sgpa = Number(sgpaMatch[1])
      continue
    }

    if (/^(?:subject|course)\s*(?:\||:|,|=|-)\s*(?:marks|mark|score)$/i.test(line)) {
      continue
    }

    const pair = line.match(/^(.+?)\s*(?:\||:|,|=|-)\s*(\d{1,3}(?:\.\d+)?)\s*$/)
    const splitRow = pair ? subject(pair[1], pair[2]) : null
    if (splitRow) {
      subjects.push(splitRow)
      continue
    }

    const spacePair = line.match(/^([a-zA-Z\s&().\-\/]+?)\s+(\d{1,3}(?:\.\d+)?)\s*$/)
    if (spacePair && !/^(?:semester|sem|sgpa)/i.test(spacePair[1])) {
      const spaceRow = subject(spacePair[1], spacePair[2])
      if (spaceRow) {
        subjects.push(spaceRow)
        continue
      }
    }

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
  const multi = parseAcademicCsv(text)
  if (multi.semesters.length > 0) {
    return {
      semester: multi.semesters[0].semester,
      sgpa: multi.semesters[0].sgpa,
      subjects: multi.semesters[0].subjects
    }
  }
  return { subjects: [] }
}
