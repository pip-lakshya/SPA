/**
 * OCR text → structured marksheet fields (subjects, marks, SGPA, semester).
 * Domains match frontend DOMAIN_OPTIONS / backend ALLOWED_DOMAINS.
 */

const domainClassifier = require("./domainClassifier")
const ALLOWED_DOMAINS = new Set(domainClassifier.ALLOWED_DOMAINS)

const normalizeOcrText = (raw) => {
  if (!raw || typeof raw !== "string") {
    return ""
  }

  let text = raw
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  text = text.replace(/[|]{2,}/g, " ")
  text = text.replace(/\t+/g, " ")
  text = text.replace(/[ \u00a0]+/g, " ")
  text = text.replace(/\n{3,}/g, "\n\n")
  return text.trim()
}

const normalizeSubjectKey = (name) => domainClassifier.normalizeSubjectName(name)

const mapDomainFromSubjectName = (name) => domainClassifier.mapDomainFromSubjectName(name)

const isLikelyRollOrId = (name) => {
  const t = String(name).trim()
  if (!t) {
    return true
  }
  if (/^\d+$/.test(t)) {
    return true
  }
  if (/^(roll|reg|registration|enrollment)\b/i.test(t)) {
    return true
  }
  return false
}

const isNoiseSubjectLabel = (name) => {
  const key = normalizeSubjectKey(name)
  if (!key || key.length < 2) {
    return true
  }

  const blocklist = [
    "sgpa",
    "cgpa",
    "gpa",
    "semester",
    "sem",
    "credit",
    "credits",
    "grade",
    "marks",
    "total",
    "percentage",
    "result",
    "name",
    "code",
    "subject code",
    "paper",
    "internal",
    "external",
    "theory",
    "practical",
    "max",
    "min"
  ]

  return blocklist.some((word) => key === word || key.startsWith(`${word} `))
}

const parseSemesterLabel = (text) => {
  const m = text.match(/\bSem(?:ester)?\s*[:\-]?\s*(\d+)\b/i)
  if (m) {
    return `Sem ${m[1]}`
  }
  return "Sem 1"
}

const parseSgpa = (text) => {
  const m = text.match(/SGPA\s*[:-]?\s*(\d+(?:\.\d+)?)/i)
  if (!m) {
    return null
  }
  const n = Number(m[1])
  if (!Number.isFinite(n) || n < 0 || n > 10) {
    return null
  }
  return Math.round(n * 100) / 100
}

const STOPWORDS = new Set([
  "of",
  "the",
  "and",
  "or",
  "to",
  "in",
  "on",
  "at",
  "by",
  "for",
  "a",
  "an",
  "as",
  "is",
  "be",
  "hs",
  "cr",
  "no",
  "st"
])

/**
 * Reject OCR junk that matched digit patterns but is not a subject title.
 */
const isGarbageSubjectName = (name) => {
  const trimmed = String(name || "").replace(/\s+/g, " ").trim()
  const key = normalizeSubjectKey(trimmed)
  const tokens = trimmed.split(/\s+/).filter(Boolean)

  if (trimmed.length < 8 || trimmed.length > 100) {
    return true
  }

  if (tokens.length < 1) {
    return true
  }
  if (tokens.length === 1 && tokens[0].length < 5) {
    return true
  }

  const lettersOnly = trimmed.replace(/[^a-zA-Z]/g, "")
  if (lettersOnly.length >= 6) {
    const vowels = (lettersOnly.match(/[aeiou]/gi) || []).length
    const ratio = vowels / lettersOnly.length
    if (ratio < 0.2) {
      return true
    }
  }

  const shortTokens = tokens.filter((t) => t.length <= 2).length
  if (shortTokens >= Math.ceil(tokens.length * 0.45)) {
    return true
  }

  const stopHits = tokens.filter((t) => STOPWORDS.has(t.toLowerCase())).length
  if (stopHits >= 4 || (tokens.length <= 6 && stopHits >= 3)) {
    return true
  }

  const ofCount = (trimmed.match(/\bof\b/gi) || []).length
  if (ofCount >= 3) {
    return true
  }

  if (/(.)\1{4,}/i.test(lettersOnly)) {
    return true
  }

  if (isNoiseSubjectLabel(trimmed)) {
    return true
  }

  return false
}

/**
 * Strip trailing numeric columns (credits, internal, total) — use the largest plausible 0–100 value as marks.
 */
const splitLineNameAndMarks = (line) => {
  const parts = line.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) {
    return null
  }

  const trailingNums = []
  let i = parts.length - 1
  while (i >= 0 && /^\d{1,3}$/.test(parts[i])) {
    trailingNums.push(Number(parts[i]))
    i -= 1
  }

  if (!trailingNums.length) {
    return null
  }

  const name = parts.slice(0, i + 1).join(" ").trim()
  if (!name) {
    return null
  }

  const inRange = trailingNums.filter((n) => Number.isFinite(n) && n >= 0 && n <= 100)
  if (!inRange.length) {
    return null
  }

  const decent = inRange.filter((n) => n >= 10 && n <= 100)
  const marks = decent.length > 0 ? Math.max(...decent) : Math.max(...inRange)

  if (marks < 0 || marks > 100) {
    return null
  }

  return { name, marks }
}

/**
 * Line-based extraction only — avoids stitching random fragments across the page.
 */
const parseSubjectRows = (text) => {
  const lines = normalizeOcrText(text).split("\n")
  const rows = []
  const seen = new Set()

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+/g, " ").trim()
    if (line.length < 10) {
      continue
    }

    const split = splitLineNameAndMarks(line)
    if (!split) {
      continue
    }

    const { name, marks } = split
    if (isLikelyRollOrId(name) || isGarbageSubjectName(name)) {
      continue
    }

    const dedupeKey = normalizeSubjectKey(name)
    if (!dedupeKey || seen.has(dedupeKey)) {
      continue
    }
    seen.add(dedupeKey)

    rows.push({ name, marks })
    if (rows.length >= 24) {
      break
    }
  }

  return rows
}

const dedupeSubjects = (subjects) => {
  const byName = new Map()
  for (const row of subjects) {
    const k = normalizeSubjectKey(row.name)
    if (!k) {
      continue
    }
    const prev = byName.get(k)
    if (!prev || row.marks > prev.marks) {
      byName.set(k, row)
    }
  }
  return [...byName.values()]
}

/**
 * @param {string} ocrText
 * @returns {{ semester: string, sgpa: number | null, subjects: Array<{ name: string, domain: string, marks: number }> }}
 */
const parseMarksheetText = (ocrText) => {
  const text = normalizeOcrText(ocrText)
  const semester = parseSemesterLabel(text)
  const sgpa = parseSgpa(text)
  const rawSubjects = parseSubjectRows(text)
  const unique = dedupeSubjects(rawSubjects)

  const subjects = unique.map((row) => {
    const domain = mapDomainFromSubjectName(row.name)
    const safeDomain = ALLOWED_DOMAINS.has(domain) ? domain : "General"
    return {
      name: row.name,
      domain: safeDomain,
      marks: row.marks
    }
  })

  return { semester, sgpa, subjects }
}

module.exports = {
  ALLOWED_DOMAINS,
  normalizeOcrText,
  parseMarksheetText,
  mapDomainFromSubjectName
}
