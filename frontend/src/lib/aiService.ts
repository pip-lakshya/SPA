import { apiUrl } from "./apiUrl"
import type { ChatMessage, StudentSummary } from "../types/ai"
import type { AcademicApiResponse, DomainAverages } from "../types/academic"

const API_KEY_STORAGE = "nvidia_api_key"
const MODEL_STORAGE = "nvidia_selected_model"
const CHAT_HISTORY_STORAGE = "edu_ai_chat_history"
const STUDENT_CACHE_STORAGE = "pwa_academic_data_cache"
const STUDENT_PROFILE_STORAGE = "pwa_user_profile_cache"
const BUBBLE_DISMISSED_STORAGE = "edu_ai_bubble_dismissed"

export const DEFAULT_MODEL = "meta/llama-3.2-11b-vision-instruct"

export function getStoredApiKey(): string {
  return (localStorage.getItem(API_KEY_STORAGE) || "").trim()
}

export function saveStoredApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key.trim())
}

export function removeStoredApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE)
}

export function getStoredModel(): string {
  return localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL
}

export function saveStoredModel(model: string): void {
  localStorage.setItem(MODEL_STORAGE, model)
}

export function isBubbleDismissed(): boolean {
  return sessionStorage.getItem(BUBBLE_DISMISSED_STORAGE) === "true"
}

export function dismissBubble(): void {
  sessionStorage.setItem(BUBBLE_DISMISSED_STORAGE, "true")
}

export function getStoredChatHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_STORAGE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoredChatHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_HISTORY_STORAGE, JSON.stringify(messages.slice(-30)))
  } catch {
    /* storage quota fallback */
  }
}

export function clearStoredChatHistory(): void {
  localStorage.removeItem(CHAT_HISTORY_STORAGE)
}

/**
 * Validate key format
 */
export function validateKeyFormat(key: string): { valid: boolean; message: string } {
  const trimmed = key.trim()
  if (!trimmed) {
    return { valid: false, message: "Please enter an NVIDIA API key" }
  }
  if (!trimmed.startsWith("nvapi-")) {
    return { valid: false, message: 'API key must start with "nvapi-"' }
  }
  if (trimmed.length < 35) {
    return { valid: false, message: "API key looks too short. Check your copied key." }
  }
  return { valid: true, message: "Format looks valid" }
}

/**
 * Live test key against backend or NVIDIA NIM
 */
export async function testNvidiaApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  const formatCheck = validateKeyFormat(apiKey)
  if (!formatCheck.valid) return formatCheck

  try {
    const response = await fetch(apiUrl("/api/ai/validate"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey })
    })

    const data = await response.json()
    if (response.ok && data.valid) {
      return { valid: true, message: "API key verified successfully with NVIDIA NIM!" }
    }
    return { valid: false, message: data.message || "Invalid API key or unauthorized." }
  } catch {
    // Direct client fallback in case backend is offline
    try {
      const direct = await fetch("https://integrate.api.nvidia.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` }
      })
      if (direct.ok) {
        return { valid: true, message: "API key verified directly with NVIDIA!" }
      }
      return { valid: false, message: "NVIDIA rejected this API key. Please check your credentials." }
    } catch {
      return { valid: true, message: "Saved locally (could not verify live network connection)." }
    }
  }
}

/**
 * Sync and cache student academic data from DB / local storage
 */
export async function syncStudentData(): Promise<{
  academic: AcademicApiResponse["data"] | null
  profile: any | null
  summary: StudentSummary
}> {
  let academic: any = null
  let profile: any = null

  const token = localStorage.getItem("token")

  // Try fetching fresh data from backend
  if (token) {
    try {
      const [acadRes, profRes] = await Promise.all([
        fetch(apiUrl("/api/data/me"), { headers: { Authorization: token } }),
        fetch(apiUrl("/api/profile"), { headers: { Authorization: token } })
      ])

      if (acadRes.ok) {
        const acadJson: AcademicApiResponse = await acadRes.json()
        academic = acadJson.data || null
        if (academic) {
          localStorage.setItem(STUDENT_CACHE_STORAGE, JSON.stringify(academic))
        }
      }

      if (profRes.ok) {
        const profJson = await profRes.json()
        profile = profJson.user || null
        if (profile) {
          localStorage.setItem(STUDENT_PROFILE_STORAGE, JSON.stringify(profile))
        }
      }
    } catch (err) {
      console.warn("Could not sync live student data, loading cache", err)
    }
  }

  // Fallback to cached data
  if (!academic) {
    try {
      const cached = localStorage.getItem(STUDENT_CACHE_STORAGE)
      if (cached) academic = JSON.parse(cached)
    } catch {}
  }

  if (!profile) {
    try {
      const cached = localStorage.getItem(STUDENT_PROFILE_STORAGE)
      if (cached) profile = JSON.parse(cached)
    } catch {}
  }

  // Compute summary
  const summary = computeStudentSummary(academic, profile)
  return { academic, profile, summary }
}

function computeStudentSummary(academic: any, profile: any): StudentSummary {
  const name = profile?.name || "Student"
  const email = profile?.email || ""
  const department = academic?.department || profile?.department || "Engineering & Technology"
  const course = academic?.course || profile?.course || "B.Tech"
  const branch = academic?.branch || profile?.branch || "Computer Science and Engineering"
  const cgpa = Number(academic?.cgpa) || 0
  const overallAverage = Number(academic?.overallAverage) || 0
  const semesters = Array.isArray(academic?.semesters) ? academic.semesters : []
  const semestersCount = semesters.length

  let subjectsCount = 0
  let lowestSubject: { name: string; marks: number; domain: string } | undefined
  let highestSubject: { name: string; marks: number; domain: string } | undefined

  for (const sem of semesters) {
    if (Array.isArray(sem.subjects)) {
      for (const sub of sem.subjects) {
        subjectsCount++
        const marks = Number(sub.marks) || 0
        if (!lowestSubject || marks < lowestSubject.marks) {
          lowestSubject = { name: sub.name, marks, domain: sub.domain || "General" }
        }
        if (!highestSubject || marks > highestSubject.marks) {
          highestSubject = { name: sub.name, marks, domain: sub.domain || "General" }
        }
      }
    }
  }

  // Domain averages formatting
  const da: DomainAverages = academic?.domainAverages || {}
  const domainParts = Object.entries(da)
    .filter(([_, val]) => typeof val === "number" && val > 0)
    .map(([dom, val]) => `${dom}: ${val}%`)

  return {
    name,
    email,
    department,
    course,
    branch,
    cgpa,
    overallAverage,
    semestersCount,
    subjectsCount,
    lowestSubject,
    highestSubject,
    domainsSummary: domainParts.length > 0 ? domainParts.join(", ") : "Not calculated yet",
    lastSynced: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
}

/**
 * Generate high-context system prompt
 */
export function buildSystemPrompt(academic: any, profile: any): string {
  const summary = computeStudentSummary(academic, profile)
  const semesters = Array.isArray(academic?.semesters) ? academic.semesters : []

  let detailedSemesters = ""
  if (semesters.length > 0) {
    detailedSemesters = semesters
      .map((s: any) => {
        const subs = (s.subjects || [])
          .map((sub: any) => `    • ${sub.name}: ${sub.marks}/100 (${sub.domain || "General"})`)
          .join("\n")
        return `Semester ${s.semester} (SGPA: ${s.sgpa || "N/A"}):\n${subs || "    • No subjects listed"}`
      })
      .join("\n\n")
  } else {
    detailedSemesters = "No semester marksheets recorded yet. Provide general top-tier academic and career counseling."
  }

  return `You are EduAI, an expert, encouraging, and highly analytical Academic & Career AI Advisor.
You are embedded directly inside the student's Academic Performance Web App.
You have authentic, live access to this student's academic history and grades:

=== STUDENT ACADEMIC PROFILE ===
• Name: ${summary.name}
• Course & Branch: ${summary.course} in ${summary.branch} (${summary.department})
• Current CGPA: ${summary.cgpa > 0 ? summary.cgpa + " / 10" : "In Progress"}
• Overall Percentage: ${summary.overallAverage > 0 ? summary.overallAverage + "%" : "In Progress"}
• Total Semesters Logged: ${summary.semestersCount}
• Total Subjects Evaluated: ${summary.subjectsCount}
• Strongest Subject: ${summary.highestSubject ? `${summary.highestSubject.name} (${summary.highestSubject.marks}/100)` : "N/A"}
• Weakest Area: ${summary.lowestSubject ? `${summary.lowestSubject.name} (${summary.lowestSubject.marks}/100)` : "N/A"}
• Domain Performance: ${summary.domainsSummary}

=== DETAILED MARKSHEET BREAKDOWN ===
${detailedSemesters}
================================

YOUR CORE ADVISORY CAPABILITIES:
1. OVERALL PERFORMANCE IMPROVEMENT:
   - Identify weak subjects and explain exactly why the student scored lower and how to improve.
   - Provide concrete time-management strategies, revision cycles (active recall + spaced repetition), and exam preparation techniques.
2. 1-MONTH DSA CRACKING ROADMAP:
   - When asked "how can I improve DSA if I have only 1 month?" (or in Hindi: "mujhe dsa kaise improve karni chahiye agar mere paas sirf 1 mahina hai"):
   - Deliver an actionable 4-Week Sprint:
     • Week 1: Core Fundamentals (Arrays, Two Pointers, Sliding Window, Hashing, Basic Strings).
     • Week 2: Linear Structures & Recursion (Linked Lists, Stacks, Queues, Binary Search).
     • Week 3: Non-Linear & Hierarchical (Binary Trees, BST, BFS/DFS, Heaps/Priority Queues).
     • Week 4: Advanced & Interview Musts (Dynamic Programming patterns, Graphs basics, NeetCode 150 high-frequency set, timed mock tests).
   - Prescribe daily routine (3-4 hours daily: 1 hr concept/dry run + 2.5 hrs problem coding).
3. CAREER & PROFESSION MATCHING:
   - When asked "what professions can I choose?" (or "mai konse konse professions ko choose kar sakta hu"):
   - Link their exact strengths (e.g., Software Engineering, DSA, Systems, Mathematics) to in-demand modern roles:
     • Full-Stack / Backend Engineer
     • Cloud / DevOps Engineer
     • Data Analyst / ML Engineer
     • Systems / Embedded Engineer (if electronics/hardware strong)
     • Technical Product / Engineering Manager
   - Detail what projects, tech stacks (e.g., React, Node, PostgreSQL, Docker), and certifications they should build next.
4. BILINGUAL FLUENCY (ENGLISH & HINDI / HINGLISH):
   - You MUST adapt naturally to the user's language:
   - If the user asks in Hindi or Hinglish (e.g., "bhai DSA kaise improve karu", "kya steps lu", "mere marks kam kyu aaye"), answer in fluent, encouraging Hinglish / Hindi with crisp technical clarity!
   - If the user asks in English, answer in polished, structured English.
5. FORMATTING & STYLE:
   - Always structure answers with bold headings, clean bullet points, numbered steps, and actionable key takeaways.
   - Be inspiring, warm, and highly specific. Always connect advice to their actual marks!`
}

/**
 * Send chat message to NVIDIA NIM (via backend proxy or direct)
 */
export async function sendAiMessage(
  userText: string,
  history: ChatMessage[],
  apiKey: string,
  model: string,
  academicData: any,
  userProfile: any
): Promise<string> {
  const systemPrompt = buildSystemPrompt(academicData, userProfile)

  // Assemble messages array with recent conversation context
  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-8).map((m) => ({
      role: m.role,
      content: m.content
    })),
    { role: "user", content: userText }
  ]

  // 1. Try via backend proxy
  try {
    const res = await fetch(apiUrl("/api/ai/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey,
        model: model || DEFAULT_MODEL,
        messages,
        temperature: 0.6,
        max_tokens: 1500
      })
    })

    if (res.ok) {
      const data = await res.json()
      const reply = data?.choices?.[0]?.message?.content
      if (reply) return reply
    } else {
      const err = await res.json().catch(() => ({}))
      console.warn("Backend chat proxy failed, attempting direct call:", err)
    }
  } catch (backendErr) {
    console.warn("Backend fetch error, falling back to direct NVIDIA endpoint:", backendErr)
  }

  // 2. Direct client fallback to NVIDIA NIM
  const directRes = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      messages,
      temperature: 0.6,
      max_tokens: 1500,
      top_p: 0.95
    })
  })

  if (!directRes.ok) {
    const errData = await directRes.json().catch(() => ({}))
    throw new Error(errData?.error?.message || errData?.message || `NVIDIA API Error (${directRes.status})`)
  }

  const directData = await directRes.json()
  const reply = directData?.choices?.[0]?.message?.content
  if (!reply) throw new Error("No response content received from NVIDIA model.")
  return reply
}
