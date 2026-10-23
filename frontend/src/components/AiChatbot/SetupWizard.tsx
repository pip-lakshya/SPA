import { useState } from "react"
import { ExternalLink, Key, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Sparkles, ShieldCheck } from "lucide-react"
import {
  DEFAULT_MODEL,
  saveStoredApiKey,
  saveStoredModel,
  testNvidiaApiKey,
  validateKeyFormat
} from "../../lib/aiService"
import { AVAILABLE_MODELS, type AiModelOption } from "../../types/ai"
import botAvatarImg from "../../assets/bot-avatar.jpg"

type Props = {
  onSetupComplete: () => void
  initialKey?: string
  initialModel?: string
  onClose?: () => void
}

export default function SetupWizard({ onSetupComplete, initialKey = "", initialModel = DEFAULT_MODEL, onClose }: Props) {
  const [apiKey, setApiKey] = useState(initialKey)
  const [showKey, setShowKey] = useState(false)
  const [selectedModel, setSelectedModel] = useState(initialModel)
  const [verifying, setVerifying] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const validation = apiKey ? validateKeyFormat(apiKey) : null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    const format = validateKeyFormat(apiKey)
    if (!format.valid) {
      setErrorMsg(format.message)
      return
    }

    setVerifying(true)
    try {
      const result = await testNvidiaApiKey(apiKey)
      if (!result.valid) {
        setErrorMsg(result.message)
        setVerifying(false)
        return
      }

      saveStoredApiKey(apiKey)
      saveStoredModel(selectedModel)
      setSuccessMsg(result.message || "Key successfully verified!")

      setTimeout(() => {
        onSetupComplete()
      }, 700)
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to verify key. Please try again.")
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-50 p-5 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      {/* Top Banner / Intro */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-5 text-white shadow-lg">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
          <img
            src={botAvatarImg || "/bot-avatar.jpg"}
            alt="Mascot Avatar"
            className="h-14 w-14 shrink-0 rounded-2xl border-2 border-white/60 bg-white object-cover shadow-md"
            onError={(e) => {
              // fallback if not found
              ;(e.target as HTMLElement).style.display = "none"
            }}
          />
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span>Free NVIDIA NIM Setup</span>
            </div>
            <h2 className="mt-1 text-lg font-bold">Set Up Your AI Mentor</h2>
            <p className="mt-0.5 text-xs text-indigo-100/90 leading-relaxed">
              Connect your free NVIDIA API key in 4 simple steps to unlock personalized study & career advice!
            </p>
          </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 4 Steps Section */}
      <div className="space-y-4">
        {/* Step 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Visit NVIDIA NIM Website
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                NVIDIA gives 1,000 free API credits to explore and query advanced models like Llama 3.2 11B Vision.
              </p>
              <a
                href="https://build.nvidia.com/explore/discover"
                target="_blank"
                rel="noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#76B900] hover:bg-[#68a400] px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm transition active:scale-95"
              >
                <span>Open build.nvidia.com</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 text-xs">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Log In to NVIDIA
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Click "Log In" on top right. You can sign in using your Google or personal email account for free.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 font-bold text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 text-xs">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Generate API Key & Copy
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Choose any model (e.g. <b>Llama 3.2 11B Vision Instruct</b>), click the green <b>"Get API Key"</b> button, then click <b>"Generate Key"</b> and copy the key starting with <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-indigo-600 dark:bg-slate-700 dark:text-indigo-300">nvapi-...</code>.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4: Input Box & Submission */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-xs dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-xs">
              4
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Paste Your Key Here
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Your key will be securely saved locally in your browser storage.
              </p>

              <form onSubmit={handleSave} className="mt-3 space-y-3">
                {/* Input with icon & toggle */}
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setErrorMsg(null)
                    }}
                    placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-xs font-mono text-slate-900 shadow-inner outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showKey ? "Hide key" : "Show key"}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Validation badge */}
                {validation && (
                  <div className="flex items-center gap-1.5 text-xs">
                    {validation.valid ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Valid nvapi- key format
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> {validation.message}
                      </span>
                    )}
                  </div>
                )}

                {/* Preferred Model selection */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Preferred AI Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {AVAILABLE_MODELS.map((m: AiModelOption) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={verifying || !apiKey.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-xs font-semibold text-white shadow-md transition hover:from-indigo-500 hover:to-purple-500 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Validating with NVIDIA NIM...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Verify & Save Setup</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-4 text-center">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          🔒 Your API key is stored only on this device. It is never logged or shared with third parties.
        </p>
      </div>
    </div>
  )
}
