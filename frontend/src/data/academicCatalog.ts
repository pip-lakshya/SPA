export const DOMAIN_OPTIONS = [
  "Mathematics",
  "Programming",
  "AI/DS / IT",
  "Core CS",
  "Electronics",
  "Science",
  "Mechanical",
  "Soft Skills",
  "General"
] as const

export type DomainOption = string

export const isDomainOption = (value: string): value is (typeof DOMAIN_OPTIONS)[number] =>
  DOMAIN_OPTIONS.some((option) => option == value)

const LEGACY_DOMAIN_ALIASES: Record<string, DomainOption> = {
  "Computer Science / IT": "Programming",
  "Core Engineering": "Core CS",
  "Electronics / Electrical": "Electronics",
  "AI / Data Science": "AI/DS / IT",
  "Mechanical / Civil": "Mechanical",
  "Management / Humanities": "Soft Skills"
}

export const normalizeDomainLabel = (domain?: string): DomainOption =>
  LEGACY_DOMAIN_ALIASES[String(domain || "").trim()] || String(domain || "General").trim()

const API_DOMAIN_ALIASES: Record<string, string> = {
  Programming: "Computer Science / IT",
  "AI/DS / IT": "AI / Data Science",
  "Core CS": "Core Engineering",
  Electronics: "Electronics / Electrical",
  Mechanical: "Mechanical / Civil",
  "Soft Skills": "Management / Humanities",
  Science: "General"
}

export const toApiDomainLabel = (domain?: string) =>
  API_DOMAIN_ALIASES[String(domain || "").trim()] || String(domain || "General").trim()

export type SubjectTemplate = {
  name: string
  domain: DomainOption
}

export const CUSTOM_SUBJECT_VALUE = "__custom__"

type DepartmentCatalog = {
  branches: string[]
  semesters: Record<string, SubjectTemplate[]>
}

export const ACADEMIC_CATALOG: Record<string, DepartmentCatalog> = {
  "Information Technology (IT)": {
    branches: ["Information Technology", "Software Engineering", "Data Analytics"],
    semesters: {
      "Sem 1": [
        { name: "Engineering Mathematics I", domain: "Mathematics" },
        { name: "Programming in C", domain: "Computer Science / IT" },
        { name: "Digital Logic", domain: "Electronics / Electrical" },
        { name: "Engineering Physics", domain: "General" }
      ],
      "Sem 2": [
        { name: "Engineering Mathematics II", domain: "Mathematics" },
        { name: "Data Structures", domain: "Computer Science / IT" },
        { name: "Object Oriented Programming", domain: "Computer Science / IT" },
        { name: "Basic Electronics", domain: "Electronics / Electrical" }
      ],
      "Sem 3": [
        { name: "Discrete Mathematics", domain: "Mathematics" },
        { name: "Database Management Systems", domain: "Computer Science / IT" },
        { name: "Computer Networks", domain: "Computer Science / IT" },
        { name: "Probability and Statistics", domain: "AI / Data Science" }
      ],
      "Sem 4": [
        { name: "Design and Analysis of Algorithms", domain: "Computer Science / IT" },
        { name: "Operating Systems", domain: "Computer Science / IT" },
        { name: "Web Technologies", domain: "Computer Science / IT" },
        { name: "Numerical Methods", domain: "Mathematics" }
      ],
      "Sem 5": [
        { name: "Software Engineering", domain: "Computer Science / IT" },
        { name: "Computer Graphics", domain: "Computer Science / IT" },
        { name: "Machine Learning Fundamentals", domain: "AI / Data Science" },
        { name: "Professional Ethics", domain: "Management / Humanities" }
      ],
      "Sem 6": [
        { name: "Cloud Computing", domain: "Computer Science / IT" },
        { name: "Information Security", domain: "Computer Science / IT" },
        { name: "Big Data Analytics", domain: "AI / Data Science" },
        { name: "Mobile Application Development", domain: "Computer Science / IT" }
      ],
      "Sem 7": [
        { name: "Artificial Intelligence", domain: "AI / Data Science" },
        { name: "DevOps Practices", domain: "Computer Science / IT" },
        { name: "IoT Systems", domain: "Electronics / Electrical" },
        { name: "Project Management", domain: "Management / Humanities" }
      ],
      "Sem 8": [
        { name: "Data Mining", domain: "AI / Data Science" },
        { name: "Enterprise Systems", domain: "Computer Science / IT" },
        { name: "Capstone Project", domain: "Computer Science / IT" },
        { name: "Innovation and Entrepreneurship", domain: "Management / Humanities" }
      ]
    }
  },
  "Computer Science (CSE)": {
    branches: ["Core", "Data Science", "AI", "IoT"],
    semesters: {
      "Sem 1": [
        { name: "Engineering Mathematics I", domain: "Mathematics" },
        { name: "Problem Solving with Python", domain: "Computer Science / IT" },
        { name: "Computer Fundamentals", domain: "Computer Science / IT" },
        { name: "Engineering Chemistry", domain: "General" }
      ],
      "Sem 2": [
        { name: "Engineering Mathematics II", domain: "Mathematics" },
        { name: "Data Structures", domain: "Computer Science / IT" },
        { name: "Digital Systems", domain: "Electronics / Electrical" },
        { name: "Environmental Studies", domain: "General" }
      ],
      "Sem 3": [
        { name: "Discrete Structures", domain: "Mathematics" },
        { name: "Computer Organization", domain: "Computer Science / IT" },
        { name: "Database Systems", domain: "Computer Science / IT" },
        { name: "Probability for Computing", domain: "AI / Data Science" }
      ],
      "Sem 4": [
        { name: "Algorithms", domain: "Computer Science / IT" },
        { name: "Operating Systems", domain: "Computer Science / IT" },
        { name: "Theory of Computation", domain: "Computer Science / IT" },
        { name: "Linear Algebra", domain: "Mathematics" }
      ],
      "Sem 5": [
        { name: "Computer Networks", domain: "Computer Science / IT" },
        { name: "Compiler Design", domain: "Computer Science / IT" },
        { name: "Artificial Intelligence", domain: "AI / Data Science" },
        { name: "Economics for Engineers", domain: "Management / Humanities" }
      ],
      "Sem 6": [
        { name: "Machine Learning", domain: "AI / Data Science" },
        { name: "Distributed Systems", domain: "Computer Science / IT" },
        { name: "Software Testing", domain: "Computer Science / IT" },
        { name: "Cyber Security", domain: "Computer Science / IT" }
      ],
      "Sem 7": [
        { name: "Deep Learning", domain: "AI / Data Science" },
        { name: "Full Stack Development", domain: "Computer Science / IT" },
        { name: "Data Visualization", domain: "AI / Data Science" },
        { name: "Project Management", domain: "Management / Humanities" }
      ],
      "Sem 8": [
        { name: "Natural Language Processing", domain: "AI / Data Science" },
        { name: "Blockchain Technology", domain: "Computer Science / IT" },
        { name: "Major Project", domain: "Computer Science / IT" },
        { name: "Innovation Lab", domain: "Management / Humanities" }
      ]
    }
  },
  "Electronics & Communication (EC)": {
    branches: ["Electronics and Communication", "Embedded Systems", "VLSI"],
    semesters: {
      "Sem 1": [
        { name: "Engineering Mathematics I", domain: "Mathematics" },
        { name: "Basic Electrical Engineering", domain: "Electronics / Electrical" },
        { name: "Engineering Physics", domain: "General" },
        { name: "C Programming", domain: "Computer Science / IT" }
      ],
      "Sem 2": [
        { name: "Engineering Mathematics II", domain: "Mathematics" },
        { name: "Electronic Devices", domain: "Electronics / Electrical" },
        { name: "Signals and Systems", domain: "Electronics / Electrical" },
        { name: "Network Analysis", domain: "Core Engineering" }
      ],
      "Sem 3": [
        { name: "Analog Circuits", domain: "Electronics / Electrical" },
        { name: "Digital Electronics", domain: "Electronics / Electrical" },
        { name: "Electromagnetic Theory", domain: "Core Engineering" },
        { name: "Probability and Random Processes", domain: "Mathematics" }
      ],
      "Sem 4": [
        { name: "Microprocessors and Microcontrollers", domain: "Electronics / Electrical" },
        { name: "Communication Systems", domain: "Electronics / Electrical" },
        { name: "Control Systems", domain: "Core Engineering" },
        { name: "Data Structures", domain: "Computer Science / IT" }
      ],
      "Sem 5": [
        { name: "Digital Signal Processing", domain: "Electronics / Electrical" },
        { name: "VLSI Design", domain: "Electronics / Electrical" },
        { name: "Antenna Theory", domain: "Electronics / Electrical" },
        { name: "Numerical Methods", domain: "Mathematics" }
      ],
      "Sem 6": [
        { name: "Embedded Systems", domain: "Electronics / Electrical" },
        { name: "Wireless Communication", domain: "Electronics / Electrical" },
        { name: "Internet of Things", domain: "AI / Data Science" },
        { name: "Engineering Economics", domain: "Management / Humanities" }
      ],
      "Sem 7": [
        { name: "Optical Communication", domain: "Electronics / Electrical" },
        { name: "Digital Image Processing", domain: "AI / Data Science" },
        { name: "Robotics", domain: "Electronics / Electrical" },
        { name: "Project Phase I", domain: "Core Engineering" }
      ],
      "Sem 8": [
        { name: "Satellite Communication", domain: "Electronics / Electrical" },
        { name: "Industrial Automation", domain: "Electronics / Electrical" },
        { name: "Major Project", domain: "Core Engineering" },
        { name: "Professional Practice", domain: "Management / Humanities" }
      ]
    }
  },
  "Electrical Engineering (EE)": {
    branches: ["Electrical Engineering", "Power Systems", "Control Engineering"],
    semesters: {
      "Sem 1": [
        { name: "Engineering Mathematics I", domain: "Mathematics" },
        { name: "Basic Electrical Engineering", domain: "Electronics / Electrical" },
        { name: "Engineering Mechanics", domain: "Core Engineering" },
        { name: "Programming Fundamentals", domain: "Computer Science / IT" }
      ],
      "Sem 2": [
        { name: "Engineering Mathematics II", domain: "Mathematics" },
        { name: "Electrical Circuits", domain: "Electronics / Electrical" },
        { name: "Electromagnetic Fields", domain: "Electronics / Electrical" },
        { name: "Measurements and Instrumentation", domain: "Core Engineering" }
      ],
      "Sem 3": [
        { name: "Electrical Machines I", domain: "Electronics / Electrical" },
        { name: "Analog Electronics", domain: "Electronics / Electrical" },
        { name: "Power Generation", domain: "Core Engineering" },
        { name: "Transform Calculus", domain: "Mathematics" }
      ],
      "Sem 4": [
        { name: "Electrical Machines II", domain: "Electronics / Electrical" },
        { name: "Control Systems", domain: "Core Engineering" },
        { name: "Power Electronics", domain: "Electronics / Electrical" },
        { name: "Microprocessors", domain: "Computer Science / IT" }
      ],
      "Sem 5": [
        { name: "Power Systems I", domain: "Electronics / Electrical" },
        { name: "Electrical Drives", domain: "Electronics / Electrical" },
        { name: "Renewable Energy Systems", domain: "Core Engineering" },
        { name: "Statistics for Engineers", domain: "Mathematics" }
      ],
      "Sem 6": [
        { name: "Power Systems II", domain: "Electronics / Electrical" },
        { name: "Switchgear and Protection", domain: "Electronics / Electrical" },
        { name: "PLC and Automation", domain: "Electronics / Electrical" },
        { name: "Engineering Management", domain: "Management / Humanities" }
      ],
      "Sem 7": [
        { name: "High Voltage Engineering", domain: "Electronics / Electrical" },
        { name: "Smart Grid", domain: "AI / Data Science" },
        { name: "Energy Auditing", domain: "Core Engineering" },
        { name: "Project Phase I", domain: "Core Engineering" }
      ],
      "Sem 8": [
        { name: "Electric Vehicle Systems", domain: "Electronics / Electrical" },
        { name: "Power Quality", domain: "Electronics / Electrical" },
        { name: "Major Project", domain: "Core Engineering" },
        { name: "Industrial Safety", domain: "Management / Humanities" }
      ]
    }
  },
  "Mechanical Engineering (ME)": {
    branches: ["Mechanical Engineering", "Manufacturing", "Thermal Engineering"],
    semesters: {
      "Sem 1": [
        { name: "Engineering Mathematics I", domain: "Mathematics" },
        { name: "Engineering Graphics", domain: "Core Engineering" },
        { name: "Basic Mechanical Engineering", domain: "Mechanical / Civil" },
        { name: "Engineering Chemistry", domain: "General" }
      ],
      "Sem 2": [
        { name: "Engineering Mathematics II", domain: "Mathematics" },
        { name: "Material Science", domain: "Mechanical / Civil" },
        { name: "Thermodynamics", domain: "Mechanical / Civil" },
        { name: "Manufacturing Processes", domain: "Mechanical / Civil" }
      ],
      "Sem 3": [
        { name: "Fluid Mechanics", domain: "Mechanical / Civil" },
        { name: "Strength of Materials", domain: "Mechanical / Civil" },
        { name: "Kinematics of Machines", domain: "Mechanical / Civil" },
        { name: "Numerical Techniques", domain: "Mathematics" }
      ],
      "Sem 4": [
        { name: "Heat Transfer", domain: "Mechanical / Civil" },
        { name: "Dynamics of Machines", domain: "Mechanical / Civil" },
        { name: "Machine Design", domain: "Mechanical / Civil" },
        { name: "Industrial Automation", domain: "Electronics / Electrical" }
      ],
      "Sem 5": [
        { name: "IC Engines", domain: "Mechanical / Civil" },
        { name: "CAD CAM", domain: "Mechanical / Civil" },
        { name: "Metrology", domain: "Core Engineering" },
        { name: "Operations Research", domain: "Mathematics" }
      ],
      "Sem 6": [
        { name: "Refrigeration and Air Conditioning", domain: "Mechanical / Civil" },
        { name: "Finite Element Analysis", domain: "AI / Data Science" },
        { name: "Production Planning", domain: "Management / Humanities" },
        { name: "Robotics in Manufacturing", domain: "Mechanical / Civil" }
      ],
      "Sem 7": [
        { name: "Automobile Engineering", domain: "Mechanical / Civil" },
        { name: "Additive Manufacturing", domain: "Mechanical / Civil" },
        { name: "Renewable Energy Devices", domain: "Core Engineering" },
        { name: "Project Phase I", domain: "Core Engineering" }
      ],
      "Sem 8": [
        { name: "Industrial Engineering", domain: "Management / Humanities" },
        { name: "Quality Engineering", domain: "Mechanical / Civil" },
        { name: "Major Project", domain: "Core Engineering" },
        { name: "Entrepreneurship", domain: "Management / Humanities" }
      ]
    }
  },
  "Civil Engineering (CE)": {
    branches: ["Civil Engineering", "Structural Engineering", "Construction Management"],
    semesters: {
      "Sem 1": [
        { name: "Engineering Mathematics I", domain: "Mathematics" },
        { name: "Engineering Geology", domain: "Mechanical / Civil" },
        { name: "Building Materials", domain: "Mechanical / Civil" },
        { name: "Engineering Physics", domain: "General" }
      ],
      "Sem 2": [
        { name: "Engineering Mathematics II", domain: "Mathematics" },
        { name: "Surveying", domain: "Mechanical / Civil" },
        { name: "Strength of Materials", domain: "Mechanical / Civil" },
        { name: "Fluid Mechanics", domain: "Mechanical / Civil" }
      ],
      "Sem 3": [
        { name: "Structural Analysis", domain: "Mechanical / Civil" },
        { name: "Concrete Technology", domain: "Mechanical / Civil" },
        { name: "Transportation Engineering", domain: "Mechanical / Civil" },
        { name: "Probability and Statistics", domain: "Mathematics" }
      ],
      "Sem 4": [
        { name: "Geotechnical Engineering", domain: "Mechanical / Civil" },
        { name: "Hydrology", domain: "Mechanical / Civil" },
        { name: "Environmental Engineering", domain: "Core Engineering" },
        { name: "CAD for Civil Engineers", domain: "Computer Science / IT" }
      ],
      "Sem 5": [
        { name: "Design of RCC Structures", domain: "Mechanical / Civil" },
        { name: "Open Channel Flow", domain: "Mechanical / Civil" },
        { name: "Estimation and Costing", domain: "Management / Humanities" },
        { name: "Numerical Methods", domain: "Mathematics" }
      ],
      "Sem 6": [
        { name: "Steel Structures", domain: "Mechanical / Civil" },
        { name: "Water Resources Engineering", domain: "Mechanical / Civil" },
        { name: "Construction Planning", domain: "Management / Humanities" },
        { name: "GIS Applications", domain: "AI / Data Science" }
      ],
      "Sem 7": [
        { name: "Foundation Engineering", domain: "Mechanical / Civil" },
        { name: "Bridge Engineering", domain: "Mechanical / Civil" },
        { name: "Project Phase I", domain: "Core Engineering" },
        { name: "Professional Practice", domain: "Management / Humanities" }
      ],
      "Sem 8": [
        { name: "Earthquake Engineering", domain: "Mechanical / Civil" },
        { name: "Advanced Construction Technology", domain: "Mechanical / Civil" },
        { name: "Major Project", domain: "Core Engineering" },
        { name: "Infrastructure Management", domain: "Management / Humanities" }
      ]
    }
  },
  "MBA / Management": {
    branches: ["Finance", "Marketing", "Human Resources", "Operations", "Business Analytics"],
    semesters: {
      "Sem 1": [
        { name: "Managerial Economics", domain: "Management / Humanities" },
        { name: "Accounting for Managers", domain: "Management / Humanities" },
        { name: "Quantitative Techniques", domain: "Mathematics" },
        { name: "Organizational Behaviour", domain: "Management / Humanities" }
      ],
      "Sem 2": [
        { name: "Marketing Management", domain: "Management / Humanities" },
        { name: "Financial Management", domain: "Management / Humanities" },
        { name: "Operations Management", domain: "Management / Humanities" },
        { name: "Business Analytics", domain: "AI / Data Science" }
      ],
      "Sem 3": [
        { name: "Strategic Management", domain: "Management / Humanities" },
        { name: "Human Resource Management", domain: "Management / Humanities" },
        { name: "Research Methodology", domain: "AI / Data Science" },
        { name: "Entrepreneurship Development", domain: "Management / Humanities" }
      ],
      "Sem 4": [
        { name: "International Business", domain: "Management / Humanities" },
        { name: "Business Intelligence", domain: "AI / Data Science" },
        { name: "Corporate Governance", domain: "Management / Humanities" },
        { name: "Capstone Project", domain: "Management / Humanities" }
      ]
    }
  }
}

export const DEPARTMENT_OPTIONS = Object.keys(ACADEMIC_CATALOG)

export const getBranchOptions = (department: string) =>
  ACADEMIC_CATALOG[department]?.branches || []

export const getSemesterOptions = (department: string) =>
  Object.keys(ACADEMIC_CATALOG[department]?.semesters || {})

export const getSubjectOptions = (department: string, semester: string) =>
  ACADEMIC_CATALOG[department]?.semesters[semester] || []

export const findSubjectTemplate = (
  department: string,
  semester: string,
  subjectName: string
) =>
  getSubjectOptions(department, semester).find(
    (subject) => subject.name === subjectName
  )

const normalizeSubjectKey = (subjectName: string) =>
  subjectName
    .toLowerCase()
    .replace(/\b(?=[ivxlcdm]+\b)m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const SUBJECT_DOMAIN_ALIASES: Record<string, DomainOption> = {
  "engineering mathematics": "Mathematics",
  "data structures": "Programming",
  "operating systems": "Core CS",
  "operating system": "Core CS",
  dbms: "Core CS",
  "database management systems": "Core CS",
  "computer networks": "Core CS",
  "digital electronics": "Electronics",
  "machine learning": "AI/DS / IT",
  "machine learning fundamentals": "AI/DS / IT",
  "artificial intelligence": "AI/DS / IT",
  "data science": "AI/DS / IT",
  "big data analytics": "AI/DS / IT"
}

export const subjectDomainMap = Object.values(ACADEMIC_CATALOG).reduce<
  Record<string, DomainOption>
>((accumulator, department) => {
  Object.values(department.semesters).forEach((subjects) => {
    subjects.forEach((subject) => {
      accumulator[normalizeSubjectKey(subject.name)] = normalizeDomainLabel(subject.domain)
    })
  })

  return accumulator
}, { ...SUBJECT_DOMAIN_ALIASES })

const DOMAIN_KEYWORDS: Record<DomainOption, string[]> = {
  Mathematics: [
    "engineering mathematics",
    "mathematics",
    "maths",
    "statistics",
    "probability",
    "linear algebra",
    "discrete mathematics"
  ],
  "Core CS": [
    "core engineering",
    "core cs",
    "engineering mechanics",
    "control systems",
    "environmental engineering",
    "software engineering",
    "operating systems",
    "operating system",
    "dbms",
    "database management",
    "computer networks",
    "cn"
  ],
  Programming: [
    "programming",
    "programming in c",
    "c programming",
    "c language",
    "c plus plus",
    "cpp",
    "java",
    "python",
    "javascript",
    "data structure",
    "data structures",
    "algorithm",
    "algorithms",
    "object oriented",
    "oop",
    "problem solving",
    "software engineering",
    "operating systems",
    "operating system",
    "dbms",
    "database management",
    "computer networks"
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
  Electronics: [
    "electrical",
    "electronics",
    "circuits",
    "circuit",
    "digital electronics",
    "digital logic"
  ],
  Mechanical: [
    "mechanical",
    "workshop",
    "manufacturing",
    "engineering graphics",
    "caeg",
    "camd",
    "civil"
  ],
  Science: [
    "physics",
    "chemistry",
    "environmental science",
    "environmental studies",
    "environmental"
  ],
  "Soft Skills": [
    "communication skills",
    "technical communication",
    "public speaking",
    "human values",
    "literature",
    "management",
    "economics",
    "ethics"
  ],
  General: ["physics", "chemistry", "environmental science", "sodeca"]
}

const DOMAIN_PRIORITY: DomainOption[] = [
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

const scoreKeywordMatch = (subject: string, keyword: string) => {
  if (subject === keyword) return 1
  if (subject.includes(keyword)) return Math.max(0.8, keyword.length / Math.max(subject.length, 1))

  const subjectTokens = subject.split(" ").filter(Boolean)
  const keywordTokens = keyword.split(" ").filter(Boolean)
  const overlap = keywordTokens.filter((token) => subjectTokens.includes(token)).length

  if (!overlap) return 0

  const tokenCoverage = overlap / keywordTokens.length
  const density = overlap / Math.max(subjectTokens.length, keywordTokens.length)
  return Math.max(tokenCoverage * 0.7 + density * 0.3, 0.45)
}

export const inferDomainForSubject = (subjectName: string): DomainOption | undefined => {
  const normalized = normalizeSubjectKey(subjectName)
  if (!normalized) return undefined

  const direct = subjectDomainMap[normalized]
  if (direct) return direct

  let bestDomain: DomainOption | undefined
  let bestScore = 0

  for (const domain of DOMAIN_PRIORITY) {
    for (const keyword of DOMAIN_KEYWORDS[domain]) {
      const score = scoreKeywordMatch(normalized, normalizeSubjectKey(keyword))
      if (
        score > bestScore ||
        (score === bestScore &&
          bestDomain &&
          DOMAIN_PRIORITY.indexOf(domain) < DOMAIN_PRIORITY.indexOf(bestDomain))
      ) {
        bestScore = score
        bestDomain = domain
      }
    }
  }

  return bestScore >= 0.55 ? bestDomain : undefined
}

export const domainKeyToLabelMap: Record<string, string> = {
  Mathematics: "Mathematics",
  CoreEngineering: "Core CS",
  CS_IT: "Programming",
  AI_DS_IT: "AI/DS / IT",
  Electronics: "Electronics",
  Mechanical_Civil: "Mechanical",
  AI_DS: "Science",
  Management: "Soft Skills",
  General: "General"
}
