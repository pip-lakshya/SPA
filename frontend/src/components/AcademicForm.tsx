import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Plus, Save, Sparkles, Trash2 } from "lucide-react"
import {
  CUSTOM_SUBJECT_VALUE,
  DEPARTMENT_OPTIONS,
  DOMAIN_OPTIONS,
  findSubjectTemplate,
  getBranchOptions,
  getSemesterOptions,
  getSubjectOptions,
  inferDomainForSubject,
  type DomainOption
} from "../data/academicCatalog"
import type { AcademicApiResponse, AcademicSnapshot } from "../types/academic"
import MarksheetUpload from "./MarksheetUpload"
import { apiUrl } from "../lib/apiUrl"

const DATA_BASE_PATH = "/api/data"
const dataUrl = (path: string) => apiUrl(`${DATA_BASE_PATH}${path}`)

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
    semester: selected || semesterOptions[0] || "",
    sgpa: "",
    subjects: [createEmptySubject()]
  }
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
    domain: DOMAIN_OPTIONS.includes((subject.domain || "") as DomainOption)
      ? (subject.domain as DomainOption)
      : inferredDomain,
    marks: typeof subject.marks === "number" ? subject.marks.toString() : ""
  }
}

const mapFetchedData = (response: AcademicApiResponse) => {
  const department = response.data?.department || DEPARTMENT_OPTIONS[0]
  const branchOptions = getBranchOptions(department)
  const branch = response.data?.branch || branchOptions[0] || ""

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
    branch,
    semesters,
    cgpa: response.data?.cgpa?.toString() || ""
  }
}

const validateAcademicForm = (
  department: string,
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
  const semesterOptions = useMemo(() => getSemesterOptions(department), [department])

  const validationError = useMemo(
    () => validateAcademicForm(department, branch, cgpa, semesters),
    [branch, cgpa, department, semesters]
  )

  const isSubmitDisabled = saving || loading || !!validationError

  useEffect(() => {
    if (!branchOptions.includes(branch)) {
      setBranch(branchOptions[0] || "")
    }
  }, [branch, branchOptions])

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

    setDepartment(nextDepartment)
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
                  domain: template?.domain || inferDomainForSubject(currentName) || subject.domain,
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
              domain: template?.domain || inferDomainForSubject(subjectName) || subject.domain
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
                  domain: inferDomainForSubject(subject.customSubject) || subject.domain
                }
              }

              const template = findSubjectTemplate(department, semester.semester, value)

              return {
                ...subject,
                selectedSubject: value,
                customSubject: "",
                domain: template?.domain || inferDomainForSubject(value) || subject.domain
              }
            }

            if (key === "customSubject") {
              return {
                ...subject,
                customSubject: value,
                domain: inferDomainForSubject(value) || subject.domain
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

    if (!nextSemester) {
      return
    }

    setSemesters((currentSemesters) => [
      ...currentSemesters,
      createEmptySemester(department, nextSemester)
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
        branch,
        semesters: semesters.map((semester) => ({
          semester: semester.semester,
          sgpa: Number(semester.sgpa),
          subjects: semester.subjects.map((subject) => ({
            name: getSubjectName(subject),
            domain: subject.domain,
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

  const canAddSemester = semesters.length < semesterOptions.length

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

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Academic Input
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Department-aware academic records
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Subjects come from the selected department syllabus, domains auto-map from
            subject names, and you can still override the domain if needed.
          </p>
        </div>

        <button
          type="button"
          onClick={addSemester}
          disabled={!canAddSemester}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Semester
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          Loading your academic profile...
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-slate-700">
              Department
              <select
                value={department}
                onChange={(event) => handleDepartmentChange(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
              >
                {DEPARTMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Branch
              <select
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
              >
                {branchOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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

          <MarksheetUpload
            department={department}
            semesterBlockCount={semesters.length}
            targetSemesterIndex={ocrTargetSemesterIndex}
            onTargetSemesterIndexChange={setOcrTargetSemesterIndex}
            blockLabels={semesters.map((s) => s.semester)}
            onApply={(payload) => applyOcrPayload(ocrTargetSemesterIndex, payload)}
            disabled={loading}
          />

          {semesters.map((semester, semesterIndex) => {
            const semesterChoices = getAvailableSemesterChoices(semesterIndex)

            return (
              <div
                key={`${semester.semester}-${semesterIndex}`}
                className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto_auto] lg:items-end">
                  <label className="block text-sm font-medium text-slate-700">
                    Semester
                    <select
                      value={semester.semester}
                      onChange={(event) =>
                        updateSemester(semesterIndex, "semester", event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                    >
                      {semesterChoices.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    SGPA
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
                    onClick={() => addSubject(semesterIndex)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Subject
                  </button>

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
                        className="rounded-3xl border border-slate-200 bg-white p-4"
                      >
                        <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_auto]">
                          <label className="block text-sm font-medium text-slate-700">
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
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
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

                          <label className="block text-sm font-medium text-slate-700">
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
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                            >
                              {DOMAIN_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="block text-sm font-medium text-slate-700">
                            Marks
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
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                              placeholder="91"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => removeSubject(semesterIndex, subjectIndex)}
                            disabled={semester.subjects.length === 1}
                            className="inline-flex items-center justify-center gap-2 self-end rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>

                        {subject.selectedSubject === CUSTOM_SUBJECT_VALUE ? (
                          <label className="mt-4 block text-sm font-medium text-slate-700">
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
                              className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                              placeholder="Enter subject name"
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
              </div>
            )
          })}

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

          <div className="flex justify-end">
            <button
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
