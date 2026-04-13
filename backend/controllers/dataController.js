const AcademicData = require("../models/AcademicData")

const ALLOWED_DEPARTMENTS = [
  "Information Technology (IT)",
  "Computer Science (CSE)",
  "Electronics & Communication (EC)",
  "Electrical Engineering (EE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "MBA / Management"
]

const ALLOWED_DOMAINS = [
  "Mathematics",
  "Core Engineering",
  "Computer Science / IT",
  "Electronics / Electrical",
  "Mechanical / Civil",
  "AI / Data Science",
  "Management / Humanities",
  "General"
]

const DOMAIN_KEY_MAP = {
  Mathematics: "Mathematics",
  "Core Engineering": "CoreEngineering",
  "Computer Science / IT": "CS_IT",
  "Electronics / Electrical": "Electronics",
  "Mechanical / Civil": "Mechanical_Civil",
  "AI / Data Science": "AI_DS",
  "Management / Humanities": "Management",
  General: "General"
}

const createEmptyDomainAverages = () => ({
  Mathematics: 0,
  CoreEngineering: 0,
  CS_IT: 0,
  Electronics: 0,
  Mechanical_Civil: 0,
  AI_DS: 0,
  Management: 0,
  General: 0
})

const roundToTwo = (value) => Number(value.toFixed(2))

const toDisplayName = (user) => {
  if (user?.name && String(user.name).trim()) {
    return String(user.name).trim()
  }

  const emailPrefix = String(user?.email || "student")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .trim()

  return emailPrefix
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Student"
}

const normalizeSubject = (subject) => ({
  name: String(subject?.name || "").trim(),
  domain: String(subject?.domain || "").trim(),
  marks: Number(subject?.marks)
})

const normalizeSemester = (semester, index) => ({
  semester:
    typeof semester?.semester === "string" && semester.semester.trim()
      ? semester.semester.trim()
      : `Sem ${index + 1}`,
  sgpa: Number(semester?.sgpa),
  subjects: Array.isArray(semester?.subjects)
    ? semester.subjects.map(normalizeSubject)
    : []
})

const getDerivedAcademicFields = (record) => {
  const analytics = calculateAnalytics(record?.semesters || [])

  return {
    department: record?.department || "Department not set",
    branch: record?.branch || "Branch not set",
    cgpa: Number.isFinite(record?.cgpa) ? roundToTwo(record.cgpa) : 0,
    overallAverage: Number.isFinite(record?.overallAverage)
      ? roundToTwo(record.overallAverage)
      : analytics.overallAverage,
    domainAverages:
      record?.domainAverages && Object.keys(record.domainAverages).length
        ? { ...createEmptyDomainAverages(), ...record.domainAverages }
        : analytics.domainAverages,
    analytics
  }
}

const calculateAnalytics = (semesters) => {
  const domainBuckets = {}
  const semesterAverages = []
  let totalMarks = 0
  let totalSubjects = 0

  semesters.forEach((semester) => {
    const validSubjects = semester.subjects.filter((subject) =>
      Number.isFinite(subject.marks)
    )
    const semesterTotal = validSubjects.reduce((sum, subject) => sum + subject.marks, 0)
    const semesterCount = validSubjects.length
    const semesterAverage = semesterCount
      ? roundToTwo(semesterTotal / semesterCount)
      : 0

    semesterAverages.push({
      semester: semester.semester,
      average: semesterAverage
    })

    validSubjects.forEach((subject) => {
      totalMarks += subject.marks
      totalSubjects += 1

      const domainKey = DOMAIN_KEY_MAP[subject.domain]
      if (!domainKey) {
        return
      }

      if (!domainBuckets[domainKey]) {
        domainBuckets[domainKey] = {
          total: 0,
          count: 0
        }
      }

      domainBuckets[domainKey].total += subject.marks
      domainBuckets[domainKey].count += 1
    })
  })

  const domainAverages = createEmptyDomainAverages()

  Object.keys(domainBuckets).forEach((domainKey) => {
    const bucket = domainBuckets[domainKey]
    domainAverages[domainKey] = bucket.count
      ? roundToTwo(bucket.total / bucket.count)
      : 0
  })

  return {
    overallAverage: totalSubjects ? roundToTwo(totalMarks / totalSubjects) : 0,
    domainAverages,
    semesterAverages
  }
}

const validatePayload = ({ department, branch, cgpa, semesters }) => {
  if (!ALLOWED_DEPARTMENTS.includes(department)) {
    return "Please select a valid department"
  }

  if (!branch || !branch.trim()) {
    return "Branch is required"
  }

  if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
    return "CGPA must be between 0 and 10"
  }

  if (!Array.isArray(semesters) || !semesters.length) {
    return "At least one semester is required"
  }

  for (const semester of semesters) {
    if (!semester.semester) {
      return "Semester name is required"
    }

    if (!Number.isFinite(semester.sgpa) || semester.sgpa < 0 || semester.sgpa > 10) {
      return "Each semester SGPA must be between 0 and 10"
    }

    if (!Array.isArray(semester.subjects) || !semester.subjects.length) {
      return "Each semester must include at least one subject"
    }

    for (const subject of semester.subjects) {
      if (!subject.name) {
        return "Each subject must have a name"
      }

      if (!ALLOWED_DOMAINS.includes(subject.domain)) {
        return "Each subject must have a valid domain"
      }

      if (!Number.isFinite(subject.marks) || subject.marks < 0 || subject.marks > 100) {
        return "Subject marks must be between 0 and 100"
      }
    }
  }

  return null
}

const saveAcademicData = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const department = String(req.body?.department || "").trim()
    const branch = String(req.body?.branch || "").trim()
    const semesters = Array.isArray(req.body?.semesters)
      ? req.body.semesters.map(normalizeSemester)
      : []
    const cgpa = Number(req.body?.cgpa)

    const validationError = validatePayload({
      department,
      branch,
      cgpa,
      semesters
    })

    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    const { overallAverage, domainAverages, semesterAverages } =
      calculateAnalytics(semesters)

    const academicData = await AcademicData.findOneAndUpdate(
      { userId },
      {
        $set: {
          department,
          branch,
          semesters,
          cgpa,
          overallAverage,
          domainAverages
        },
        $setOnInsert: {
          userId
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    )

    return res.json({
      message: "Academic data saved successfully",
      data: academicData,
      analytics: {
        semesterAverages,
        overallAverage,
        domainAverages
      }
    })
  } catch (err) {
    return res.status(500).json({ message: "Failed to save academic data" })
  }
}

const getMyAcademicData = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const academicData = await AcademicData.findOne({ userId }).lean()

    if (!academicData) {
      return res.json({ data: null })
    }

    const derived = getDerivedAcademicFields(academicData)

    return res.json({
      data: {
        ...academicData,
        department: derived.department,
        branch: derived.branch,
        overallAverage: derived.overallAverage,
        domainAverages: derived.domainAverages
      },
      analytics: derived.analytics
    })
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch academic data" })
  }
}

const getLeaderboard = async (_req, res) => {
  try {
    const leaderboard = await AcademicData.find({})
      .populate("userId", "email name")
      .lean()

    const result = leaderboard
      .map((entry) => {
        const derived = getDerivedAcademicFields(entry)

        return {
          userId: entry.userId?._id || entry.userId,
          name: toDisplayName(entry.userId),
          email: entry.userId?.email || "Unknown User",
          department: derived.department,
          branch: derived.branch,
          cgpa: derived.cgpa,
          overallAverage: derived.overallAverage,
          updatedAt: entry.updatedAt ? new Date(entry.updatedAt).getTime() : 0
        }
      })
      .sort((first, second) => {
        if (second.overallAverage !== first.overallAverage) {
          return second.overallAverage - first.overallAverage
        }

        if (second.cgpa !== first.cgpa) {
          return second.cgpa - first.cgpa
        }

        return first.updatedAt - second.updatedAt
      })
      .slice(0, 10)
      .map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        name: entry.name,
        email: entry.email,
        department: entry.department,
        branch: entry.branch,
        cgpa: entry.cgpa,
        overallAverage: entry.overallAverage
      }))

    return res.json({ data: result })
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch leaderboard" })
  }
}

const getPeerCluster = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const currentRecord = await AcademicData.findOne({ userId })
      .populate("userId", "email name")
      .lean()

    if (!currentRecord) {
      return res.json({
        data: {
          currentStudent: null,
          similarStudents: []
        }
      })
    }

    const currentDerived = getDerivedAcademicFields(currentRecord)
    const currentAverage = currentDerived.overallAverage

    const allStudents = await AcademicData.find({})
      .populate("userId", "email name")
      .lean()

    const similarStudents = allStudents
      .filter((entry) => String(entry.userId?._id || entry.userId) !== String(userId))
      .map((entry) => {
        const derived = getDerivedAcademicFields(entry)

        return {
          userId: entry.userId?._id || entry.userId,
          name: toDisplayName(entry.userId),
          email: entry.userId?.email || "Unknown User",
          department: derived.department,
          branch: derived.branch,
          cgpa: derived.cgpa,
          overallAverage: derived.overallAverage,
          averageGap: roundToTwo(Math.abs(derived.overallAverage - currentAverage))
        }
      })
      .filter((entry) => entry.averageGap <= 7)
      .sort((first, second) => {
        if (first.averageGap !== second.averageGap) {
          return first.averageGap - second.averageGap
        }

        return second.overallAverage - first.overallAverage
      })
      .slice(0, 8)

    return res.json({
      data: {
        currentStudent: {
          userId,
          name: toDisplayName(currentRecord.userId),
          email: currentRecord.userId?.email || "Unknown User",
          department: currentDerived.department,
          branch: currentDerived.branch,
          cgpa: currentDerived.cgpa,
          overallAverage: currentAverage
        },
        similarStudents
      }
    })
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch peer cluster" })
  }
}

module.exports = {
  ALLOWED_DEPARTMENTS,
  ALLOWED_DOMAINS,
  calculateAnalytics,
  getPeerCluster,
  getLeaderboard,
  getMyAcademicData,
  saveAcademicData
}
