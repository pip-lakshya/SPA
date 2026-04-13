export const DOMAIN_OPTIONS = [
  "Mathematics",
  "Core Engineering",
  "Computer Science / IT",
  "Electronics / Electrical",
  "Mechanical / Civil",
  "AI / Data Science",
  "Management / Humanities",
  "General"
] as const

export type DomainOption = (typeof DOMAIN_OPTIONS)[number]

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
  subjectName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const SUBJECT_DOMAIN_ALIASES: Record<string, DomainOption> = {
  "engineering mathematics": "Mathematics",
  "data structures": "Computer Science / IT",
  "operating systems": "Computer Science / IT",
  "operating system": "Computer Science / IT",
  "dbms": "Computer Science / IT",
  "database management systems": "Computer Science / IT",
  "computer networks": "Computer Science / IT",
  "digital electronics": "Electronics / Electrical",
  "machine learning": "AI / Data Science",
  "machine learning fundamentals": "AI / Data Science"
}

export const subjectDomainMap = Object.values(ACADEMIC_CATALOG).reduce<
  Record<string, DomainOption>
>((accumulator, department) => {
  Object.values(department.semesters).forEach((subjects) => {
    subjects.forEach((subject) => {
      accumulator[normalizeSubjectKey(subject.name)] = subject.domain
    })
  })

  return accumulator
}, { ...SUBJECT_DOMAIN_ALIASES })

export const inferDomainForSubject = (subjectName: string): DomainOption | undefined =>
  subjectDomainMap[normalizeSubjectKey(subjectName)]

export const domainKeyToLabelMap: Record<string, string> = {
  Mathematics: "Mathematics",
  CoreEngineering: "Core Engineering",
  CS_IT: "Computer Science / IT",
  Electronics: "Electronics / Electrical",
  Mechanical_Civil: "Mechanical / Civil",
  AI_DS: "AI / Data Science",
  Management: "Management / Humanities",
  General: "General"
}
