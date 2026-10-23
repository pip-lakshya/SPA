export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  isError?: boolean
}

export type AiModelOption = {
  id: string
  name: string
  desc: string
  badge: string
}

export const AVAILABLE_MODELS: AiModelOption[] = [
  {
    id: "meta/llama-3.2-11b-vision-instruct",
    name: "Llama 3.2 11B Vision Instruct",
    desc: "Meta's fast vision-language & reasoning model with free endpoint",
    badge: "Recommended"
  },
  {
    id: "meta/llama-3.2-90b-vision-instruct",
    name: "Llama 3.2 90B Vision Instruct",
    desc: "Meta's flagship high-capacity reasoning model with free endpoint",
    badge: "Most Accurate"
  },
  {
    id: "google/gemma-4-31b-it",
    name: "Google Gemma 4 31B IT",
    desc: "Dense 31B model for coding, reasoning, and academic workflows",
    badge: "High Logic"
  },
  {
    id: "openai/gpt-oss-20b",
    name: "OpenAI gpt-oss-20b",
    desc: "Mixture of Experts for efficient reasoning and mathematics",
    badge: "Fast Reasoning"
  },
  {
    id: "deepseek-ai/deepseek-v4.1-flash",
    name: "DeepSeek v4.1 Flash",
    desc: "552B MoE, 8B active params, lightning fast multimodal inference",
    badge: "Ultra Fast"
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b",
    name: "NVIDIA Nemotron 3 Ultra 550B",
    desc: "NVIDIA's flagship 550B MoE for agentic planning & deep logic",
    badge: "Deep Reasoning"
  }
]

export type StudentSummary = {
  name: string
  email: string
  department: string
  course: string
  branch: string
  cgpa: number
  overallAverage: number
  semestersCount: number
  subjectsCount: number
  lowestSubject?: { name: string; marks: number; domain: string }
  highestSubject?: { name: string; marks: number; domain: string }
  domainsSummary: string
  lastSynced?: string
}
