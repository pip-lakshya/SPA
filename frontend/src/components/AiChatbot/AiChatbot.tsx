import { useState, useEffect } from "react"
import { X, Sparkles } from "lucide-react"
import SetupWizard from "./SetupWizard"
import botAvatarImg from "../../assets/bot-avatar.jpg"
import ChatInterface from "./ChatInterface"
import {
  dismissBubble,
  getStoredApiKey,
  getStoredModel,
  isBubbleDismissed
} from "../../lib/aiService"

export default function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey())
  const [isSettingsMode, setIsSettingsMode] = useState(false)
  const [showSpeechBubble, setShowSpeechBubble] = useState<boolean>(() => !isBubbleDismissed())

  // Keep API key state synchronized with localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setApiKey(getStoredApiKey())
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleDismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowSpeechBubble(false)
    dismissBubble()
  }

  const handleTogglePane = () => {
    if (!isOpen) {
      setShowSpeechBubble(false)
      dismissBubble()
    }
    setIsOpen(!isOpen)
  }

  const handleSetupComplete = () => {
    setApiKey(getStoredApiKey())
    setIsSettingsMode(false)
  }

  const handleOpenSettings = () => {
    setIsSettingsMode(true)
  }

  const handleClosePane = () => {
    setIsOpen(false)
    setIsSettingsMode(false)
  }

  return (
    <>
      {/* 1. Floating Trigger Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none">
        {/* Cute Speech Bubble / Tooltip (matching reference screenshot) */}
        {!isOpen && showSpeechBubble && (
          <div className="relative mb-2.5 animate-bounce [animation-duration:3s]">
            <div
              onClick={handleTogglePane}
              className="cursor-pointer rounded-2xl border-2 border-indigo-200 bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-md transition hover:scale-102 hover:border-indigo-400 dark:border-indigo-800 dark:bg-slate-900/95"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-spin [animation-duration:4s]" />
                  Can we help you?
                </span>
                <button
                  type="button"
                  onClick={handleDismissBubble}
                  className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  title="Dismiss"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
            {/* Triangular Speech Bubble Arrow */}
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b-2 border-r-2 border-indigo-200 bg-white dark:border-indigo-800 dark:bg-slate-900" />
          </div>
        )}

        {/* Mascot Avatar Circular Button */}
        <button
          type="button"
          onClick={handleTogglePane}
          aria-label="Open AI Academic Advisor"
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white p-0.5 shadow-2xl ring-4 ring-indigo-500/20 transition-all duration-300 hover:scale-110 hover:ring-indigo-500/40 active:scale-95 dark:bg-slate-800 dark:ring-indigo-400/20"
        >
          {/* Glowing Animated Ring */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-xs transition duration-500 group-hover:opacity-100 animate-pulse" />

          {/* Image */}
          <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white dark:border-slate-800 bg-slate-100">
            <img
              src={botAvatarImg || "/bot-avatar.jpg"}
              alt="EduAI Mascot"
              className="h-full w-full object-cover transition duration-300 group-hover:rotate-3"
              onError={(e) => {
                // If local image fails to load, fallback icon
                ;(e.target as HTMLElement).style.display = "none"
              }}
            />
          </div>

          {/* Online green indicator dot */}
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm dark:border-slate-900" />
        </button>
      </div>

      {/* 2. Backdrop Overlay (on mobile screens or modal click-away) */}
      {isOpen && (
        <div
          onClick={handleClosePane}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* 3. Sliding Right Drawer / Pane */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-900 sm:w-[460px] md:w-[480px] lg:w-[500px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {isOpen && (
          <>
            {/* Show SetupWizard if no API key is configured OR in settings mode */}
            {!apiKey || isSettingsMode ? (
              <div className="flex h-full flex-col">
                {isSettingsMode && apiKey && (
                  <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Settings & API Configuration
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSettingsMode(false)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800"
                    >
                      ← Back to Chat
                    </button>
                  </div>
                )}
                <div className="flex-1 overflow-y-auto">
                  <SetupWizard
                    onSetupComplete={handleSetupComplete}
                    initialKey={apiKey}
                    initialModel={getStoredModel()}
                    onClose={handleClosePane}
                  />
                </div>
              </div>
            ) : (
              <ChatInterface
                apiKey={apiKey}
                onOpenSettings={handleOpenSettings}
                onClose={handleClosePane}
              />
            )}
          </>
        )}
      </aside>
    </>
  )
}
