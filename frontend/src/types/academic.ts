export type ApiSubject = {
  name?: string
  domain?: string
  marks?: number
}

export type ApiSemester = {
  semester?: string
  sgpa?: number
  subjects?: ApiSubject[]
}

export type DomainAverages = {
  Mathematics?: number
  CoreEngineering?: number
  CS_IT?: number
  AI_DS_IT?: number
  Electronics?: number
  Mechanical_Civil?: number
  AI_DS?: number
  Management?: number
  General?: number
}

export type AcademicRecord = {
  userId?: string
  department?: string
  course?: string
  branch?: string
  semesters?: ApiSemester[]
  cgpa?: number
  overallAverage?: number
  domainAverages?: DomainAverages
}

export type AcademicAnalytics = {
  overallAverage?: number
  domainAverages?: DomainAverages
  semesterAverages?: Array<{
    semester: string
    average: number
  }>
}

export type AcademicSnapshot = {
  data: AcademicRecord | null
  analytics?: AcademicAnalytics
}

export type AcademicApiResponse = {
  data?: AcademicRecord | null
  analytics?: AcademicAnalytics
  message?: string
}

export type MarksheetOcrSubject = {
  name: string
  domain: string
  marks: number
}

export type MarksheetOcrResponse = {
  message?: string
  semester: string
  sgpa: number | null
  subjects: MarksheetOcrSubject[]
  ocrError?: boolean
  lowConfidence?: boolean
}

export type LeaderboardEntry = {
  rank: number
  userId: string
  name: string
  email: string
  department: string
  course: string
  branch: string
  cgpa: number
  overallAverage: number
}

export type LeaderboardResponse = {
  data?: LeaderboardEntry[]
  message?: string
  meta?: {
    scope?: string
    branch?: string
    department?: string
    course?: string
  }
}

export type PeerClusterStudent = {
  userId: string
  name: string
  email: string
  department: string
  course: string
  branch: string
  cgpa: number
  overallAverage: number
  averageGap?: number
}
