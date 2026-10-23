import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Calendar, GraduationCap, Plus, Save, Sparkles, Trash2 } from "lucide-react"
import {
  CUSTOM_SUBJECT_VALUE,
  DEPARTMENT_OPTIONS,
  DOMAIN_OPTIONS,
  findSubjectTemplate,
  getBranchOptions,
  getSemesterOptions,
  getSubjectOptions,
  inferDomainForSubject,
  isDomainOption,
  normalizeDomainLabel,
  toApiDomainLabel,
  type DomainOption
} from "../data/academicCatalog"
import type { AcademicApiResponse, AcademicSnapshot } from "../types/academic"
import ImportRecords from "./ImportRecords"
import { apiUrl } from "../lib/apiUrl"

const DATA_BASE_PATH = "/api/data"
const dataUrl = (path: string) => apiUrl(`${DATA_BASE_PATH}${path}`)
const CUSTOM_OPTION_VALUE = "__custom_option__"
const DEFAULT_SEMESTER_OPTIONS = Array.from({ length: 12 }, (_, index) => `Sem ${index + 1}`)
const DEFAULT_COURSE_SUGGESTIONS = ["B.Tech", "B.E.", "M.Tech", "MBA", "BA LLB", "LLB"]

type SubjectForm = {
  selectedSubject: string
  customSubject: string
  domain: DomainOption
  marks: string
}

type SemesterForm = {
  semester: string
  sgpa: string
  subjects: SubjectForm[]
}

type Props = {
  onDataChange?: (snapshot: AcademicSnapshot | null) => void
}

const createEmptySubject = (): SubjectForm => ({
  selectedSubject: "",
  customSubject: "",
  domain: "General",
  marks: ""
})

const createEmptySemester = (department: string, selected?: string): SemesterForm => {
  const semesterOptions = getSemesterOptions(department)

  return {
    semester: selected || semesterOptions[0] || DEFAULT_SEMESTER_OPTIONS[0],
    sgpa: "",
    subjects: [createEmptySubject()]
  }
}

const getCourseSuggestions = (department: string) => {
  if (!department.trim()) {
    return DEFAULT_COURSE_SUGGESTIONS
  }

  if (department === "MBA / Management") {
    return ["MBA", "PGDM", "BBA"]
  }

  return DEFAULT_COURSE_SUGGESTIONS
}

const getResolvedSemesterOptions = (department: string, semesters: SemesterForm[]) => {
  const catalogOptions = getSemesterOptions(department)

  if (catalogOptions.length) {
    return catalogOptions
  }

  const customSemesters = semesters
    .map((semester) => semester.semester.trim())
    .filter(Boolean)

  return Array.from(new Set([...DEFAULT_SEMESTER_OPTIONS, ...customSemesters]))
}

const getSubjectName = (subject: SubjectForm) =>
  subject.selectedSubject === CUSTOM_SUBJECT_VALUE
    ? subject.customSubject.trim()
    : subject.selectedSubject.trim()

const mapApiResponseToSnapshot = (response: AcademicApiResponse): AcademicSnapshot => ({
  data: response.data || null,
  analytics: response.analytics
})

const mapFetchedSemester = (
  department: string,
  semesterName: string,
  subject: { name?: string; domain?: string; marks?: number }
): SubjectForm => {
  const subjectName = subject.name || ""
  const suggestedSubject = findSubjectTemplate(department, semesterName, subjectName)
  const inferredDomain =
    inferDomainForSubject(subjectName) || suggestedSubject?.domain || "General"

  return {
    selectedSubject: suggestedSubject ? suggestedSubject.name : CUSTOM_SUBJECT_VALUE,
    customSubject: suggestedSubject ? "" : subjectName,
    domain: isDomainOption(subject.domain || "")
      ? subject.domain || "General"
      : normalizeDomainLabel(inferredDomain || subject.domain || "General"),
    marks: typeof subject.marks === "number" ? subject.marks.toString() : ""
  }
}

const mapFetchedData = (response: AcademicApiResponse) => {
  const department = response.data?.department || DEPARTMENT_OPTIONS[0]
  const branchOptions = getBranchOptions(department)
  const branch = response.data?.branch || branchOptions[0] || ""
  const courseSuggestions = getCourseSuggestions(department)
  const course = response.data?.course || courseSuggestions[0] || ""

  const semesters = response.data?.semesters?.length
    ? response.data.semesters.map((semester, semesterIndex) => ({
        semester:
          semester.semester ||
          getSemesterOptions(department)[semesterIndex] ||
          `Sem ${semesterIndex + 1}`,
        sgpa: semester.sgpa?.toString() || "",
        subjects: semester.subjects?.length
          ? semester.subjects.map((subject) =>
              mapFetchedSemester(
                department,
                semester.semester || `Sem ${semesterIndex + 1}`,
                subject
              )
            )
          : [createEmptySubject()]
      }))
    : [createEmptySemester(department)]

  return {
    department,
    course,
    branch,
    semesters,
    cgpa: response.data?.cgpa?.toString() || ""
  }
}

const validateAcademicForm = (
  department: string,
  course: string,
  branch: string,
  cgpa: string,
  semesters: SemesterForm[]
) => {
  if (!department) {
    return "Department is required"
  }

  if (!branch) {
    return "Branch is required"
  }

  if (!course.trim()) {
    return "Course is required"
  }

  if (!cgpa.trim()) {
    return "CGPA is required"
  }

  const cgpaNumber = Number(cgpa)
  if (!Number.isFinite(cgpaNumber) || cgpaNumber < 0 || cgpaNumber > 10) {
    return "CGPA must be between 0 and 10"
  }

  if (!semesters.length) {
    return "Add at least one semester"
  }

  const seenSemesters = new Set<string>()

  for (const semester of semesters) {
    if (!semester.semester) {
      return "Every semester must be selected"
    }

    if (seenSemesters.has(semester.semester)) {
      return "Each semester can only be added once"
    }
    seenSemesters.add(semester.semester)

    if (!semester.sgpa.trim()) {
      return `${semester.semester}: SGPA is required`
    }

    const sgpaNumber = Number(semester.sgpa)
    if (!Number.isFinite(sgpaNumber) || sgpaNumber < 0 || sgpaNumber > 10) {
      return `${semester.semester}: SGPA must be between 0 and 10`
    }

    if (!semester.subjects.length) {
      return `${semester.semester}: add at least one subject`
    }

    for (const subject of semester.subjects) {
      const subjectName = getSubjectName(subject)

      if (!subjectName) {
        return `${semester.semester}: each subject needs a name`
      }

      if (!subject.marks.trim()) {
        return `${semester.semester}: marks are required for ${subjectName}`
      }

      const marks = Number(subject.marks)
      if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
        return `${semester.semester}: marks for ${subjectName} must be between 0 and 100`
      }
    }
  }

  return null
}

export default function AcademicForm({ onDataChange }: Props) {
  const [department, setDepartment] = useState(DEPARTMENT_OPTIONS[0])
  const [course, setCourse] = useState(getCourseSuggestions(DEPARTMENT_OPTIONS[0])[0] || "")
  const [branch, setBranch] = useState(getBranchOptions(DEPARTMENT_OPTIONS[0])[0] || "")
  const [semesters, setSemesters] = useState<SemesterForm[]>([
    createEmptySemester(DEPARTMENT_OPTIONS[0])
  ])
  const [cgpa, setCgpa] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [ocrTargetSemesterIndex, setOcrTargetSemesterIndex] = useState(0)

  const branchOptions = useMemo(() => getBranchOptions(department), [department])
  const courseSuggestions = useMemo(() => getCourseSuggestions(department), [department])
  const semesterOptions = useMemo(
    () => getResolvedSemesterOptions(department, semesters),
    [department, semesters]
  )
  const selectedDepartmentValue = DEPARTMENT_OPTIONS.includes(department)
    ? department
    : CUSTOM_OPTION_VALUE
  const selectedCourseValue = courseSuggestions.includes(course)
    ? course
    : CUSTOM_OPTION_VALUE
  const selectedBranchValue = branchOptions.includes(branch) ? branch : CUSTOM_OPTION_VALUE

  const validationError = useMemo(
    () => validateAcademicForm(department, course, branch, cgpa, semesters),
    [branch, cgpa, course, department, semesters]
  )

  const isSubmitDisabled = saving || loading || !!validationError

  useEffect(() => {
    setOcrTargetSemesterIndex((current) =>
      semesters.length ? Math.min(current, semesters.length - 1) : 0
    )
  }, [semesters.length])

  useEffect(() => {
    const fetchAcademicData = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(dataUrl("/me"), {
          headers: {
            Authorization: token
          }
        })

        const data: AcademicApiResponse = await res.json()

        if (!res.ok) {
          throw new Error(data.message || "Failed to load academic data")
        }

        onDataChange?.(mapApiResponseToSnapshot(data))

        if (data.data) {
          const mapped = mapFetchedData(data)
          setDepartment(mapped.department)
          setCourse(mapped.course)
          setBranch(mapped.branch)
          setSemesters(mapped.semesters)
          setCgpa(mapped.cgpa)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load academic data")
      } finally {
        setLoading(false)
      }
    }

    fetchAcademicData()
  }, [onDataChange])

  const getAvailableSemesterChoices = (semesterIndex: number) => {
    const usedByOthers = new Set(
      semesters
        .filter((_, index) => index !== semesterIndex)
        .map((semester) => semester.semester)
    )

    return semesterOptions.filter((option) => !usedByOthers.has(option))
  }

  const handleDepartmentChange = (nextDepartment: string) => {
    const nextBranchOptions = getBranchOptions(nextDepartment)
    const nextSemesterOptions = getSemesterOptions(nextDepartment)
    const nextCourseSuggestions = getCourseSuggestions(nextDepartment)

    setDepartment(nextDepartment)
    setCourse(nextCourseSuggestions[0] || "")
    setBranch(nextBranchOptions[0] || "")
    setSemesters((currentSemesters) => {
      const uniqueSemesterOptions = [...nextSemesterOptions]

      return currentSemesters.length
        ? currentSemesters.map((semester, index) => {
            const nextSemester = uniqueSemesterOptions[index] || semester.semester

            return {
              ...semester,
              semester: nextSemester,
              subjects: semester.subjects.map((subject) => {
                const currentName = getSubjectName(subject)
                const template = findSubjectTemplate(
                  nextDepartment,
                  nextSemester,
                  currentName
                )

                return {
                  selectedSubject: template
                    ? template.name
                    : subject.selectedSubject === CUSTOM_SUBJECT_VALUE
                      ? CUSTOM_SUBJECT_VALUE
                      : "",
                  customSubject:
                    template || subject.selectedSubject !== CUSTOM_SUBJECT_VALUE
                      ? ""
                      : subject.customSubject,
                  domain: normalizeDomainLabel(
                    inferDomainForSubject(currentName) || template?.domain || subject.domain
                  ),
                  marks: subject.marks
                }
              })
            }
          })
        : [createEmptySemester(nextDepartment)]
    })
    setSuccessMessage("")
    setError("")
  }

  const updateSemester = (
    semesterIndex: number,
    key: keyof Omit<SemesterForm, "subjects">,
    value: string
  ) => {
    setSemesters((currentSemesters) =>
      currentSemesters.map((semester, index) => {
        if (index !== semesterIndex) {
          return semester
        }

        const nextSemester = { ...semester, [key]: value }

        if (key !== "semester") {
          return nextSemester
        }

        return {
          ...nextSemester,
          subjects: nextSemester.subjects.map((subject) => {
            const subjectName = getSubjectName(subject)
            const template = findSubjectTemplate(department, value, subjectName)

            return {
              ...subject,
              selectedSubject: template
                ? template.name
                : subject.selectedSubject === CUSTOM_SUBJECT_VALUE
                  ? CUSTOM_SUBJECT_VALUE
                  : "",
              customSubject:
                template || subject.selectedSubject !== CUSTOM_SUBJECT_VALUE
                  ? ""
                  : subject.customSubject,
              domain: normalizeDomainLabel(
                inferDomainForSubject(subjectName) || template?.domain || subject.domain
              )
            }
          })
        }
      })
    )
    setSuccessMessage("")
  }

  const updateSubject = (
    semesterIndex: number,
    subjectIndex: number,
    key: keyof SubjectForm,
    value: string
  ) => {
    setSemesters((currentSemesters) =>
      currentSemesters.map((semester, index) => {
        if (index !== semesterIndex) {
          return semester
        }

        return {
          ...semester,
          subjects: semester.subjects.map((subject, innerIndex) => {
            if (innerIndex !== subjectIndex) {
              return subject
            }

            if (key === "selectedSubject") {
              if (value === CUSTOM_SUBJECT_VALUE) {
                return {
                  ...subject,
                  selectedSubject: CUSTOM_SUBJECT_VALUE,
                  customSubject: "",
                  domain: normalizeDomainLabel(
                    inferDomainForSubject(subject.customSubject) || subject.domain
                  )
                }
              }

              const template = findSubjectTemplate(department, semester.semester, value)

              return {
                ...subject,
                selectedSubject: value,
                customSubject: "",
                domain: normalizeDomainLabel(
                  inferDomainForSubject(value) || template?.domain || subject.domain
                )
              }
            }

            if (key === "customSubject") {
              return {
                ...subject,
                customSubject: value,
                domain: normalizeDomainLabel(inferDomainForSubject(value) || subject.domain)
              }
            }

            return {
              ...subject,
              [key]: value
            }
          })
        }
      })
    )
    setSuccessMessage("")
  }

  const addSemester = () => {
    const used = new Set(semesters.map((semester) => semester.semester))
    const nextSemester = semesterOptions.find((option) => !used.has(option))

    if (!nextSemester && semesters.length >= DEFAULT_SEMESTER_OPTIONS.length) {
      return
    }

    setSemesters((currentSemesters) => [
      ...currentSemesters,
      createEmptySemester(
        department,
        nextSemester || `Term ${currentSemesters.length + 1}`
      )
    ])
    setSuccessMessage("")
  }

  const removeSemester = (semesterIndex: number) => {
    setSemesters((currentSemesters) =>
      currentSemesters.length === 1
        ? currentSemesters
        : currentSemesters.filter((_, index) => index !== semesterIndex)
    )
    setSuccessMessage("")
  }

  const addSubject = (semesterIndex: number) => {
    setSemesters((currentSemesters) =>
      currentSemesters.map((semester, index) =>
        index === semesterIndex
          ? { ...semester, subjects: [...semester.subjects, createEmptySubject()] }
          : semester
      )
    )
    setSuccessMessage("")
  }

  const removeSubject = (semesterIndex: number, subjectIndex: number) => {
    setSemesters((currentSemesters) =>
      currentSemesters.map((semester, index) => {
        if (index !== semesterIndex || semester.subjects.length === 1) {
          return semester
        }

        return {
          ...semester,
          subjects: semester.subjects.filter((_, innerIndex) => innerIndex !== subjectIndex)
        }
      })
    )
    setSuccessMessage("")
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const token = localStorage.getItem("token")

    if (!token) {
      setError("Please log in to save academic data")
      return
    }

    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError("")
    setSuccessMessage("")

    try {
      const payload = {
        department,
        course,
        branch,
        semesters: semesters.map((semester) => ({
          semester: semester.semester,
          sgpa: Number(semester.sgpa),
          subjects: semester.subjects.map((subject) => ({
            name: getSubjectName(subject),
            domain: toApiDomainLabel(subject.domain),
            marks: Number(subject.marks)
          }))
        })),
        cgpa: Number(cgpa)
      }

      const res = await fetch(dataUrl("/save"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify(payload)
      })

      const data: AcademicApiResponse = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to save academic data")
      }

      onDataChange?.(mapApiResponseToSnapshot(data))
      setSuccessMessage(data.message || "Academic data saved successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save academic data")
    } finally {
      setSaving(false)
    }
  }

  const canAddSemester =
    semesters.length < Math.max(semesterOptions.length, DEFAULT_SEMESTER_OPTIONS.length)

  const applyOcrPayload = (
    semesterIndex: number,
    payload: {
      semester: string
      sgpa: number | null
      subjects: Array<{ name: string; domain: string; marks: number }>
    }
  ) => {
    setSemesters((currentSemesters) =>
      currentSemesters.map((semester, index) => {
        if (index !== semesterIndex) {
          return semester
        }

        const semOptions = getSemesterOptions(department)
        const nextSemester =
          payload.semester && semOptions.includes(payload.semester)
            ? payload.semester
            : semester.semester

        const subjectForms =
          payload.subjects.length > 0
            ? payload.subjects.map((subject) =>
                mapFetchedSemester(department, nextSemester, subject)
              )
            : [createEmptySubject()]

        return {
          ...semester,
          semester: nextSemester,
          sgpa:
            payload.sgpa !== null && Number.isFinite(payload.sgpa)
              ? String(payload.sgpa)
              : semester.sgpa,
          subjects: subjectForms
        }
      })
    )
    setSuccessMessage(
      "OCR data merged into the selected semester block. Review the fields, then save when ready."
    )
    setError("")
  }

  const applyImportedRecord = (
    payload: { semester?: string; sgpa?: number | null; subjects: Array<{ name: string; domain?: string; marks: number }> },
    source: string
  ) => {
    const targetIndex = payload.semester
      ? Math.max(0, semesters.findIndex((item) => item.semester === payload.semester))
      : ocrTargetSemesterIndex
    applyOcrPayload(targetIndex, {
      semester: payload.semester || semesters[targetIndex]?.semester || "Sem 1",
      sgpa: payload.sgpa ?? null,
      subjects: payload.subjects.map((subject) => ({ ...subject, domain: subject.domain || "General" }))
    })
    if (!cgpa && payload.sgpa !== null && payload.sgpa !== undefined) {
      setCgpa(String(payload.sgpa))
    }
    setSuccessMessage(`${source} records imported. Saving academic data automatically...`)
    window.setTimeout(() => document.getElementById("academic-save")?.click(), 50)
  }

  return (
    <section className="rounded-[2.25rem] border-2 border-slate-300/80 bg-slate-100/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-slate-200/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Level 1: Overall Academic Record (All Years)</span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            Flexible Academic Records
          </h2>
          <p className="mt-1 max-w-2xl text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
            Configure your overall degree details below, then manage each individual semester and subject with dedicated color-coded hierarchical blocks.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          Loading your academic profile...
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-850 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Overall Degree & Branch Details</span>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
            <label className="block text-sm font-medium text-slate-700">
              Department
              <select
                value={selectedDepartmentValue}
                onChange={(event) => {
                  if (event.target.value === CUSTOM_OPTION_VALUE) {
                    setDepartment("")
                    setBranch("")
                    setSuccessMessage("")
                    setError("")
                    return
                  }

                  handleDepartmentChange(event.target.value)
                }}
                className="mt-2 w-full rounded-xl border border-slate-300/80 bg-slate-50/80 px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-850"
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value={CUSTOM_OPTION_VALUE}>Custom department</option>
              </select>
              {selectedDepartmentValue === CUSTOM_OPTION_VALUE ? (
                <input
                  type="text"
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Faculty of Law"
                />
              ) : null}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Course
              <select
                value={selectedCourseValue}
                onChange={(event) => {
                  if (event.target.value === CUSTOM_OPTION_VALUE) {
                    setCourse("")
                  } else {
                    setCourse(event.target.value)
                  }
                  setSuccessMessage("")
                  setError("")
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
              >
                {courseSuggestions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value={CUSTOM_OPTION_VALUE}>Custom course</option>
              </select>
              {selectedCourseValue === CUSTOM_OPTION_VALUE ? (
                <input
                  type="text"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="BA LLB"
                />
              ) : null}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Branch
              <select
                value={selectedBranchValue}
                onChange={(event) => {
                  if (event.target.value === CUSTOM_OPTION_VALUE) {
                    setBranch("")
                  } else {
                    setBranch(event.target.value)
                  }
                  setSuccessMessage("")
                  setError("")
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
              >
                {branchOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                <option value={CUSTOM_OPTION_VALUE}>Custom branch</option>
              </select>
              {selectedBranchValue === CUSTOM_OPTION_VALUE ? (
                <input
                  type="text"
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  placeholder="Corporate Law"
                />
              ) : null}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              CGPA
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={cgpa}
                onChange={(event) => setCgpa(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                placeholder="8.75"
              />
            </label>
            </div>
          </div>

          <ImportRecords
            onImport={applyImportedRecord}
            onManualEntry={() => document.getElementById("semester-blocks")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          />

          <div id="semester-blocks" className="space-y-6">
          {semesters.map((semester, semesterIndex) => {
            const semesterChoices = getAvailableSemesterChoices(semesterIndex)

            return (
              <div
                key={`${semester.semester}-${semesterIndex}`}
                className="rounded-[2rem] border-2 border-blue-200/90 bg-[#eef4fb] p-5 shadow-xs transition-colors dark:border-blue-900/60 dark:bg-slate-900/90 sm:p-6"
              >
                {/* Level 2: Semester Header Banner */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-3 dark:border-blue-900/50">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Level 2</span>
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {semester.semester || `Semester ${semesterIndex + 1}`}
                    </span>
                    <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {semester.subjects.length} {semester.subjects.length === 1 ? "subject" : "subjects"}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Same Semester Block
                  </span>
                </div>
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Select Semester
                      <select
                      value={
                        semesterOptions.includes(semester.semester)
                          ? semester.semester
                          : CUSTOM_OPTION_VALUE
                      }
                      onChange={(event) => {
                        if (event.target.value === CUSTOM_OPTION_VALUE) {
                          updateSemester(semesterIndex, "semester", "")
                          return
                        }

                        updateSemester(semesterIndex, "semester", event.target.value)
                      }}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                    >
                      {semesterChoices.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      <option value={CUSTOM_OPTION_VALUE}>Custom semester</option>
                    </select>
                    {!semesterOptions.includes(semester.semester) ? (
                      <input
                        type="text"
                        value={semester.semester}
                        onChange={(event) =>
                          updateSemester(semesterIndex, "semester", event.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                        placeholder="Year 1 Semester 1"
                      />
                    ) : null}
                  </label>

                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Semester SGPA
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      value={semester.sgpa}
                      onChange={(event) =>
                        updateSemester(semesterIndex, "sgpa", event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                      placeholder="8.40"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeSemester(semesterIndex)}
                    disabled={semesters.length === 1}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {semester.subjects.map((subject, subjectIndex) => {
                    const subjectOptions = getSubjectOptions(department, semester.semester)

                    return (
                      <div
                        key={`${semesterIndex}-${subjectIndex}`}
                        className="rounded-2xl border border-slate-200/90 border-l-4 border-l-blue-600 bg-white p-4.5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-750 dark:border-l-blue-500 dark:bg-slate-850 sm:p-5"
                      >
                        {/* Level 3: Subject Header */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-50 text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              #{subjectIndex + 1}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Subject Details
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSubject(semesterIndex, subjectIndex)}
                            disabled={semester.subjects.length === 1}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200/80 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[2fr_1.2fr_1fr]">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Subject
                            <select
                              value={subject.selectedSubject}
                              onChange={(event) =>
                                updateSubject(
                                  semesterIndex,
                                  subjectIndex,
                                  "selectedSubject",
                                  event.target.value
                                )
                              }
                              className="mt-1.5 w-full rounded-xl border border-slate-300/80 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                            >
                              <option value="">Select subject</option>
                              {subjectOptions.map((option) => (
                                <option key={option.name} value={option.name}>
                                  {option.name}
                                </option>
                              ))}
                              <option value={CUSTOM_SUBJECT_VALUE}>Custom subject</option>
                            </select>
                          </label>

                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Domain
                            <select
                              value={subject.domain}
                              onChange={(event) =>
                                updateSubject(
                                  semesterIndex,
                                  subjectIndex,
                                  "domain",
                                  event.target.value
                                )
                              }
                              className="mt-1.5 w-full rounded-xl border border-slate-300/80 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                            >
                              {DOMAIN_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Marks (0-100)
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={subject.marks}
                              onChange={(event) =>
                                updateSubject(
                                  semesterIndex,
                                  subjectIndex,
                                  "marks",
                                  event.target.value
                                )
                              }
                              className="mt-1.5 w-full rounded-xl border border-slate-300/80 bg-slate-50/80 px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                              placeholder="91"
                            />
                          </label>


                        </div>

                        {subject.selectedSubject === CUSTOM_SUBJECT_VALUE ? (
                          <label className="mt-3 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Custom Subject Name
                            <input
                              type="text"
                              value={subject.customSubject}
                              onChange={(event) =>
                                updateSubject(
                                  semesterIndex,
                                  subjectIndex,
                                  "customSubject",
                                  event.target.value
                                )
                              }
                              className="mt-1.5 w-full rounded-xl border border-slate-300/80 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-800"
                              placeholder="e.g. Distributed Operating Systems"
                            />
                          </label>
                        ) : null}

                        {getSubjectName(subject) ? (
                          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">
                            <Sparkles className="h-3.5 w-3.5" />
                            Domain auto-mapped to {subject.domain}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => addSubject(semesterIndex)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-white/80 px-4 py-2.5 text-xs font-bold text-blue-700 shadow-2xs transition hover:border-blue-500 hover:bg-blue-50 active:scale-95 dark:border-blue-800 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-750"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Another Subject</span>
                  </button>
                </div>
              </div>
            )
          })}
          </div>

          {validationError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{validationError}</span>
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={addSemester}
              disabled={!canAddSemester}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Semester
            </button>
            <button
              id="academic-save"
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Academic Data"}
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
