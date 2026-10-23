import { useState, useEffect, useRef } from "react"
import {
  Send,
  Sparkles,
  RefreshCw,
  Settings,
  Trash2,
  X,
  User,
  GraduationCap,
  BookOpen,
  Briefcase,
  Code2,
  TrendingUp,
  Check,
  Copy
} from "lucide-react"
import { AVAILABLE_MODELS, type ChatMessage, type StudentSummary } from "../../types/ai"
import {
  clearStoredChatHistory,
  getStoredChatHistory,
  getStoredModel,
  saveStoredChatHistory,
  sendAiMessage,
  syncStudentData
} from "../../lib/aiService"
import MarkdownRenderer from "./MarkdownRenderer"
import botAvatarImg from "../../assets/bot-avatar.jpg"

type Props = {
  apiKey: string
  onOpenSettings: () => void
  onClose: () => void
}

const QUICK_PROMPTS = [
  {
    icon: TrendingUp,
    label: "Overall Performance",
    prompt: "How can I improve my overall academic performance? Analyze my weak and strong areas based on my marks."
  },
  {
    icon: Code2,
    label: "1-Month DSA Plan",
    prompt: "Mujhe DSA kaise improve karni chahiye agar mere paas sirf 1 mahina hai? Please provide a week-by-week roadmap and daily study plan."
  },
  {
    icon: Briefcase,
    label: "Career & Professions",
    prompt: "Based on my marks and academic performance, mai konse konse professions aur career paths ko choose kar sakta hu?"
  },
  {
    icon: BookOpen,
    label: "Boost Weakest Subject",
    prompt: "What concrete steps and study techniques can I use to improve my lowest scoring subject in the next exams?"
  }
]

export default function ChatInterface({ apiKey, onOpenSettings, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredChatHistory())
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [academicData, setAcademicData] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [summary, setSummary] = useState<StudentSummary | null>(null)
  const [syncStatus, setSyncStatus] = useState<string>("Syncing...")
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectedModel = getStoredModel()
  const currentModelName = AVAILABLE_MODELS.find((m) => m.id === selectedModel)?.name || "Llama 3.2 11B Vision"

  // Load student data on mount
  useEffect(() => {
    void handleSyncData()
  }, [])

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSyncData = async () => {
    setSyncing(true)
    try {
      const { academic, profile, summary } = await syncStudentData()
      setAcademicData(academic)
      setUserProfile(profile)
      setSummary(summary)
      if (summary.semestersCount > 0) {
        setSyncStatus(`${summary.semestersCount} Sems • CGPA ${summary.cgpa > 0 ? summary.cgpa : "N/A"}`)
      } else {
        setSyncStatus("No marks recorded yet")
      }
    } catch {
      setSyncStatus("Offline cache")
    } finally {
      setSyncing(false)
    }
  }

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    saveStoredChatHistory(updatedMessages)
    setInput("")

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    setLoading(true)
    try {
      const reply = await sendAiMessage(
        text,
        updatedMessages,
        apiKey,
        selectedModel,
        academicData,
        userProfile
      )

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: Date.now()
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)
      saveStoredChatHistory(finalMessages)
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Error communicating with NVIDIA AI:**\n\n${err?.message || "Something went wrong. Please check your internet connection or verify your API key in Settings."}`,
        timestamp: Date.now(),
        isError: true
      }
      const finalMessages = [...updatedMessages, errorMessage]
      setMessages(finalMessages)
      saveStoredChatHistory(finalMessages)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleClearHistory = () => {
    if (confirm("Clear this chat history?")) {
      clearStoredChatHistory()
      setMessages([])
    }
  }

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
  }

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={botAvatarImg || "/bot-avatar.jpg"}
              alt="Mascot Avatar"
              className="h-10 w-10 rounded-full border-2 border-indigo-400 bg-white object-cover shadow-sm"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">EduAI Advisor</h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Online
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {currentModelName} • Bilingual
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSyncData}
            disabled={syncing}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Re-sync marks from backend"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin text-indigo-500" : ""}`} />
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Configure API Key & Model"
          >
            <Settings className="h-4 w-4" />
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              title="Clear chat history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sync Badge Bar */}
      <div className="flex items-center justify-between border-b border-slate-200/60 bg-indigo-50/60 px-4 py-1.5 text-[11px] text-indigo-900 dark:border-slate-800 dark:bg-indigo-950/30 dark:text-indigo-200">
        <div className="flex items-center gap-1.5 truncate">
          <GraduationCap className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span className="truncate">
            {summary ? `${summary.course} • ${summary.branch}` : "Synced with Academic Profile"}
          </span>
        </div>
        <span className="shrink-0 font-medium text-indigo-700 dark:text-indigo-300">
          {syncStatus}
        </span>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center justify-center py-6 text-center">
            <div className="relative mb-3">
              <img
                src={botAvatarImg || "/bot-avatar.jpg"}
                alt="EduAI Mascot"
                className="h-20 w-20 rounded-3xl border-3 border-indigo-400 bg-white object-cover shadow-lg"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = "none"
                }}
              />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hello, {summary?.name ? summary.name.split(" ")[0] : "Friend"}! 👋
            </h3>
            <p className="mt-1 max-w-[340px] text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              I'm your AI Academic Advisor. I've synced your marksheet data and can guide you on DSA roadmaps, career paths, and study tips in English or Hindi!
            </p>

            {/* Quick Prompt Cards */}
            <div className="mt-6 w-full space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Suggested Questions
              </p>
              <div className="grid grid-cols-1 gap-2">
                {QUICK_PROMPTS.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(item.prompt)}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xs transition hover:border-indigo-400 hover:bg-indigo-50/40 active:scale-99 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-indigo-500 dark:hover:bg-slate-800"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                          {item.label}
                        </h4>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {item.prompt}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {msg.role === "user" ? (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xs">
                  <User className="h-4 w-4" />
                </div>
              ) : (
                <img
                  src={botAvatarImg || "/bot-avatar.jpg"}
                  alt="AI Avatar"
                  className="h-7 w-7 shrink-0 rounded-full border border-indigo-400 bg-white object-cover shadow-xs"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = "none"
                  }}
                />
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-xs"
                    : msg.isError
                    ? "border border-rose-200 bg-rose-50/80 text-rose-900 rounded-tl-xs dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200"
                    : "border border-slate-200/80 bg-white text-slate-800 rounded-tl-xs dark:border-slate-800 dark:bg-slate-800/90 dark:text-slate-100"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
                <div
                  className={`mt-2 flex items-center justify-between pt-1 text-[10px] ${
                    msg.role === "user" ? "text-indigo-200" : "border-t border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500"
                  }`}
                >
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  {msg.role === "assistant" && !msg.isError && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(msg.content)
                        setCopiedMsgId(msg.id)
                        setTimeout(() => setCopiedMsgId(null), 2000)
                      }}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
                      title="Copy advice"
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading / Typing indicator */}
        {loading && (
          <div className="flex items-start gap-2.5">
            <img
              src={botAvatarImg || "/bot-avatar.jpg"}
              alt="AI Avatar"
              className="h-7 w-7 shrink-0 rounded-full border border-indigo-400 bg-white object-cover shadow-xs"
              onError={(e) => {
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
            <div className="rounded-2xl rounded-tl-xs border border-slate-200/80 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-800/90">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Thinking with NVIDIA NIM...
                </span>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar (when chat has messages) */}
      {messages.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-200/60 bg-white/70 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900/70">
          {QUICK_PROMPTS.slice(0, 3).map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(item.prompt)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSend()
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder="Ask in English or Hindi (e.g. 1 mahine me DSA kaise improve kare?)..."
            className="flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md transition hover:from-indigo-500 hover:to-purple-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            title="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-500">
          Powered by NVIDIA NIM & your local marksheet data. Press Enter to send.
        </p>
      </div>
    </div>
  )
}
