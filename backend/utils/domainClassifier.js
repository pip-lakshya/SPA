const SubjectDomainOverride = require("../models/SubjectDomainOverride")

const ALLOWED_DOMAINS = [
  "Mathematics",
  "Programming",
  "AI/DS / IT",
  "Core CS",
  "Electronics",
  "Science",
  "Mechanical",
  "Soft Skills",
  "General"
]

const LEGACY_DOMAIN_ALIASES = {
  "Computer Science / IT": "Programming",
  "Core Engineering": "Core CS",
  "Electronics / Electrical": "Electronics",
  "AI / Data Science": "AI/DS / IT",
  "Mechanical / Civil": "Mechanical",
  "Management / Humanities": "Soft Skills"
}

const DOMAIN_PRIORITY = [
  "Programming",
  "AI/DS / IT",
  "Mathematics",
  "Core CS",
  "Electronics",
  "Science",
  "Mechanical",
  "Soft Skills",
  "General"
]

const DOMAIN_KEYWORDS = {
  Programming: [
    "programming",
    "program",
    "c language",
    "c programming",
    "programming in c",
    "c plus plus",
    "cpp",
    "java",
    "python",
    "javascript",
    "js",
    "dsa",
    "data structure",
    "data structures",
    "algorithm",
    "algorithms",
    "oop",
    "object oriented",
    "problem solving",
    "lab",
    "coding",
    "software engineering",
    "operating system",
    "operating systems",
    "dbms",
    "database management",
    "computer networks",
    "networking"
  ],
  "AI/DS / IT": [
    "artificial intelligence",
    "machine learning",
    "deep learning",
    "data science",
    "data mining",
    "big data",
    "analytics",
    "business intelligence",
    "natural language processing",
    "nlp",
    "information technology",
    "it",
    "cloud computing",
    "information security",
    "cyber security",
    "internet of things",
    "iot"
  ],
  Mathematics: [
    "mathematics",
    "maths",
    "engineering mathematics",
    "statistics",
    "probability",
    "numerical methods",
    "linear algebra",
    "discrete mathematics"
  ],
  "Core CS": [
    "core engineering",
    "core cs",
    "engineering mechanics",
    "network analysis",
    "control systems",
    "metrology",
    "environmental engineering",
    "software engineering",
    "operating system",
    "operating systems",
    "dbms",
    "database management",
    "computer networks",
    "cn"
  ],
  Electronics: [
    "electrical",
    "electronics",
    "electronic devices",
    "digital electronics",
    "digital logic",
    "circuits",
    "circuit",
    "basic electronics",
    "signals and systems",
    "power systems"
  ],
  Science: [
    "physics",
    "chemistry",
    "environmental science",
    "environmental studies",
    "environmental"
  ],
  Mechanical: [
    "mechanical",
    "workshop",
    "manufacturing",
    "engineering graphics",
    "caeg",
    "camd",
    "cad cam",
    "cad for civil engineers",
    "civil",
    "thermodynamics",
    "fluid mechanics",
    "strength of materials"
  ],
  "Soft Skills": [
    "communication skills",
    "technical communication",
    "public speaking",
    "human values",
    "literature",
    "management",
    "economics",
    "ethics",
    "accounting",
    "professional practice",
    "organizational behaviour",
    "entrepreneurship"
  ],
  General: ["physics", "chemistry", "environmental science", "sodeca"]
}

const ROMAN_NUMERAL_REGEX = /\b(?=[ivxlcdm]+\b)m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})\b/gi

const SUBJECT_SYNONYMS = new Map([
  ["prog", "programming"],
  ["programing", "programming"],
  ["cse", "computer science"],
  ["comp", "computer"],
  ["db", "database"],
  ["os", "operating systems"],
  ["cn", "computer networks"],
  ["comm skills", "communication skills"]
])

const SPECIAL_CASE_DOMAIN = {
  sodeca: "General",
  caeg: "Mechanical",
  camd: "Mechanical"
}

const canonicalizeDomain = (domain) => {
  const key = String(domain || "").trim()
  return LEGACY_DOMAIN_ALIASES[key] || key
}
const isAllowedDomain = (domain) => ALLOWED_DOMAINS.includes(canonicalizeDomain(domain))

const normalizeSubjectName = (subject) => {
  const raw = String(subject || "").toLowerCase()
  const alnum = raw
    .replace(ROMAN_NUMERAL_REGEX, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!alnum) {
    return ""
  }

  return alnum
    .split(" ")
    .map((word) => SUBJECT_SYNONYMS.get(word) || word)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}

const scoreKeyword = (normalized, keyword) => {
  if (!normalized || !keyword) {
    return 0
  }

  if (normalized === keyword) {
    return 1
  }

  if (normalized.includes(keyword)) {
    return Math.max(0.8, keyword.length / Math.max(normalized.length, 1))
  }

  const subjectTokens = normalized.split(" ").filter(Boolean)
  const keywordTokens = keyword.split(" ").filter(Boolean)

  const overlap = keywordTokens.filter((token) => subjectTokens.includes(token)).length
  if (!overlap) {
    return 0
  }

  const tokenCoverage = overlap / keywordTokens.length
  const density = overlap / Math.max(subjectTokens.length, keywordTokens.length)
  return Math.max(tokenCoverage * 0.7 + density * 0.3, 0.45)
}

const resolveKeywordDomain = (normalized) => {
  if (!normalized) {
    return { domain: "General", confidence: "low" }
  }

  if (SPECIAL_CASE_DOMAIN[normalized]) {
    return { domain: SPECIAL_CASE_DOMAIN[normalized], confidence: "high" }
  }

  let bestDomain = "General"
  let bestScore = 0

  for (const domain of DOMAIN_PRIORITY) {
    const keywords = DOMAIN_KEYWORDS[domain] || []
    for (const rawKeyword of keywords) {
      const keyword = normalizeSubjectName(rawKeyword)
      const score = scoreKeyword(normalized, keyword)
      if (
        score > bestScore ||
        (score === bestScore &&
          DOMAIN_PRIORITY.indexOf(domain) < DOMAIN_PRIORITY.indexOf(bestDomain))
      ) {
        bestDomain = domain
        bestScore = score
      }
    }
  }

  if (bestScore >= 0.9) {
    return { domain: bestDomain, confidence: "high" }
  }
  if (bestScore >= 0.55) {
    return { domain: bestDomain, confidence: "medium" }
  }

  return { domain: "General", confidence: "low" }
}

const classifySubject = (subject, options = {}) => {
  const normalized = normalizeSubjectName(subject)
  const overrideMap = options.overrideMap || {}
  const override = overrideMap[normalized]

  if (override?.domain && isAllowedDomain(override.domain)) {
    return {
      subject: String(subject || ""),
      normalized,
      domain: canonicalizeDomain(override.domain),
      confidence: override.count >= 3 ? "high" : "medium",
      source: "override"
    }
  }

  const resolved = resolveKeywordDomain(normalized)

  return {
    subject: String(subject || ""),
    normalized,
    domain: resolved.domain,
    confidence: resolved.confidence,
    source: "keyword"
  }
}

const mapDomainFromSubjectName = (subject, options = {}) =>
  classifySubject(subject, options).domain

const getDomainFromSubjects = (subjectList = [], options = {}) => {
  const grouped = {}

  for (const subject of subjectList) {
    const meta = classifySubject(subject, options)
    if (!grouped[meta.domain]) {
      grouped[meta.domain] = { count: 0, subjects: [] }
    }
    grouped[meta.domain].count += 1
    grouped[meta.domain].subjects.push(meta.subject)
  }

  return grouped
}

const getOverrideMap = async () => {
  const docs = await SubjectDomainOverride.find({}).lean()
  return docs.reduce((acc, doc) => {
    if (doc?.normalized && doc?.domain) {
      acc[doc.normalized] = {
        domain: doc.domain,
        count: Number(doc.count) || 1
      }
    }
    return acc
  }, {})
}

const recordOverride = async (subject, domain) => {
  const normalized = normalizeSubjectName(subject)
  if (!normalized || !isAllowedDomain(domain)) {
    return null
  }

  const canonicalDomain = canonicalizeDomain(domain)

  return SubjectDomainOverride.findOneAndUpdate(
    { normalized, domain: canonicalDomain },
    {
      $setOnInsert: { normalized, domain: canonicalDomain },
      $inc: { count: 1 }
    },
    {
      upsert: true,
      new: true
    }
  )
}

module.exports = {
  ALLOWED_DOMAINS,
  LEGACY_DOMAIN_ALIASES,
  DOMAIN_KEYWORDS,
  DOMAIN_PRIORITY,
  canonicalizeDomain,
  normalizeSubjectName,
  classifySubject,
  mapDomainFromSubjectName,
  getDomainFromSubjects,
  getOverrideMap,
  recordOverride
}
